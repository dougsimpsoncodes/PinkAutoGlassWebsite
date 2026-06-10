import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { isValidCustomerPhoneE164, normalizePhoneE164 } from '@/lib/booking-schema';
import { isInServiceArea, OUT_OF_AREA_MESSAGE } from '@/lib/quote/service-area';
import { sendBookingNotifications, sendTeamAlert, type BookingNotificationOutcome } from '@/lib/quote/booking-notifications';
import { lookupCityFromZip } from '@/lib/quote/zip-to-city';
import { assertEnvCoherent } from '@/lib/env';
import { findOrCreateQuoteLead, buildAttributionFromSession, splitName } from '@/lib/quote/leadSync';
import { isTeamOrTestContact } from '@/lib/constants';
import { markAnalyticsSessionTest } from '@/lib/analytics-test-server';
import {
  claimQuoteNotificationEvent,
  combineEventStatus,
  completeQuoteNotificationEvent,
  type AutoQuoteNotificationEventStatus,
  type ChannelStatus,
} from '@/lib/quote/notification-events';

export const runtime = 'nodejs';
// The team alert runs in an `after()` callback (post-response) and includes a
// RingCentral JWT login on cold lambdas (~1.5s) before the SMS POST. Give the
// function comfortable headroom so that background leg can never be cut off.
export const maxDuration = 30;

const bookingSchema = z.object({
  quoteToken: z.string().trim().min(8).max(64),
  customer: z.object({
    fullName: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(7).max(20),
    email: z.string().trim().email().max(120).optional().or(z.literal('')),
  }),
  install: z.object({
    street: z.string().trim().min(3).max(200),
    // ZIP collected at booking time (rather than at quote time) since the
    // price-first redesign killed the quote's ZIP stage. We catch
    // out-of-area customers here gracefully (the form had a state-based
    // pre-gate, but state alone admits Tucson/Flagstaff false positives).
    zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid 5-digit ZIP code.'),
    date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
    window: z.enum(['AM', 'PM']),
  }),
  smsConsent: z.boolean(),
  // Honeypot — if filled, request is from a bot. We accept the request,
  // return a fake success, and never insert. Bots don't get to learn what
  // tripped the trap.
  honeypot: z.string().optional(),
  // Variant cookie value (Phase 2 — Phase 1 only ever sends 'control').
  variantId: z.string().trim().max(64).optional(),
});

interface QuoteSummary {
  id: string;
  status: string;
  // Attribution + linkage for the leads sync (Item 9 / F02).
  lead_id: string | null;
  session_id: string | null;
  is_test: boolean | null;
  zip: string | null;
  state: string | null;
  vehicle_year: number | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_trim: string | null;
  quote_total_cents: number | null;
  quote_token: string;
  // Used by the team alert for cost / margin / glass-selection lines.
  selected_brand: string | null;
  selected_part_description: string | null;
  selected_nags_number: string | null;
  supplier_cost_cents: number | null;
  selected_qty_available: number | null;
  selected_estimated_delivery_date: string | null;
  // Used to surface a Tier-2 ADAS recommendation in the booking
  // confirmation when calibration wasn't bundled in the quote total.
  confidence_reasons: string[] | null;
}

interface ExistingBookingSummary {
  id: string;
  booking_token: string;
  full_name: string;
  phone_e164: string;
  email: string | null;
  install_street: string;
  install_city: string | null;
  install_state: string | null;
  install_zip: string;
  preferred_install_date: string;
  preferred_install_window: 'AM' | 'PM';
  sms_consent: boolean;
  is_test: boolean | null;
  accepted_total_cents: number | null;
  discount_pct: number | null;
  notification_status: 'pending' | 'email_sent' | 'sms_sent' | 'both_sent' | 'failed' | 'partial' | 'skipped';
}

/**
 * Extract the ADAS tier the engine assigned at quote time from the saved
 * confidence reasons array. Falls back to 'none' if the tag is missing
 * (e.g., quote saved before the tier classifier shipped).
 */
function readAdasTier(reasons: string[] | null | undefined): 'mandatory' | 'recommended' | 'none' {
  for (const r of reasons ?? []) {
    if (r === 'adas_tier_mandatory') return 'mandatory';
    if (r === 'adas_tier_recommended') return 'recommended';
    if (r === 'adas_tier_none') return 'none';
  }
  return 'none';
}

export async function POST(request: NextRequest) {
  try {
    assertEnvCoherent(); // refuse to write if NEXT_PUBLIC_APP_ENV and Supabase ref disagree
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rate = checkRateLimit(`quote-book:${ip}`, 8, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many booking attempts. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rate.resetIn / 1000)) } }
      );
    }

    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Booking details are incomplete. Please check all fields and try again.' },
        { status: 400 }
      );
    }

    const input = parsed.data;

    // Honeypot tripped — silently 200 so the bot thinks it succeeded.
    if (input.honeypot && input.honeypot.trim().length > 0) {
      return NextResponse.json({ success: true, bookingToken: 'PAG-XXXX', honeypot: true });
    }

    const supabase = getServiceRoleClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Booking is temporarily unavailable. Please call (720) 918-7465.' },
        { status: 503 }
      );
    }

    // 1) Look up the quote. Service role bypasses RLS.
    const { data: quoteRow, error: lookupError } = await supabase
      .from('automated_quotes')
      .select('id, status, lead_id, session_id, is_test, zip, state, vehicle_year, vehicle_make, vehicle_model, vehicle_trim, quote_total_cents, quote_token, selected_brand, selected_part_description, selected_nags_number, supplier_cost_cents, selected_qty_available, selected_estimated_delivery_date, confidence_reasons')
      .eq('quote_token', input.quoteToken)
      .maybeSingle<QuoteSummary>();

    if (lookupError || !quoteRow) {
      return NextResponse.json(
        { error: 'We could not find that quote. Please get a fresh quote and try again.' },
        { status: 404 }
      );
    }

    if (quoteRow.status !== 'ready_exact' && quoteRow.status !== 'ready_estimate') {
      return NextResponse.json(
        { error: 'This quote needs manual confirmation. Please call (720) 918-7465.' },
        { status: 409 }
      );
    }

    // 2) One booking per quote.
    const { data: existing } = await supabase
      .from('automated_quote_bookings')
      .select('id, booking_token, full_name, phone_e164, email, install_street, install_city, install_state, install_zip, preferred_install_date, preferred_install_window, sms_consent, is_test, accepted_total_cents, discount_pct, notification_status')
      .eq('quote_id', quoteRow.id)
      .maybeSingle<ExistingBookingSummary>();
    if (existing) {
      const repair = await sendAppointmentBookedNotificationEvent({
        supabase,
        quoteRow,
        booking: existing,
        isTest: (quoteRow.is_test ?? false) || (existing.is_test ?? false),
      });
      if (repair.status !== 'skipped' || repair.firstError) {
        await persistBookingNotificationOutcome(supabase, existing.id, repair);
      }
      return NextResponse.json(
        { error: 'This quote is already booked. Please call (720) 918-7465 if you need to change it.', existingBookingToken: existing.booking_token },
        { status: 409 }
      );
    }

    // 3) Validate install ZIP is in service area. Prefer the booking's
    // freshly-entered ZIP over the quote-row's ZIP (which may be empty
    // after the price-first redesign that killed the quote's ZIP stage).
    const installZip = input.install.zip || quoteRow.zip || '';
    if (installZip) {
      const serviceArea = isInServiceArea(installZip);
      if (!serviceArea.inServiceArea && serviceArea.reason === 'out_of_area') {
        return NextResponse.json(
          { error: OUT_OF_AREA_MESSAGE, reason: 'out_of_area' },
          { status: 422 }
        );
      }
    }

    // 4) Validate install date is within a reasonable window. Same-day OK;
    // we cap at 30 days out so customers don't book months ahead.
    const installDate = input.install.date;
    const todayIso = new Date().toISOString().slice(0, 10);
    const horizonIso = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    if (installDate < todayIso || installDate > horizonIso) {
      return NextResponse.json(
        { error: 'Please pick an install date within the next 30 days.' },
        { status: 400 }
      );
    }

    // 5) Normalize phone. The DB constraint enforces E.164 format.
    const phoneE164 = normalizePhoneE164(input.customer.phone);
    if (!isValidCustomerPhoneE164(phoneE164)) {
      return NextResponse.json(
        { error: 'Please enter a valid US phone number.' },
        { status: 400 }
      );
    }

    // 6) Resolve city from ZIP via Google Geocoding. Best-effort: never
    // throws, returns null on any error so the booking still proceeds.
    // Cached in-process — second booking from the same ZIP is free.
    const installCity = (await lookupCityFromZip(installZip)) || '';

    // Auto-tag team/test submissions so internal/dev bookings stay out of
    // reporting. The quoter booking path previously skipped this check (which the
    // legacy lead form already does), so team & ad-hoc test bookings leaked in as
    // real — e.g. PAG-26BE ("Kody Test"), PAG-8389 ("Test"/555). is_test =
    // inherited from the parent quote OR detected from the customer details here.
    const autoTestTag = isTeamOrTestContact({
      phoneE164,
      fullName: input.customer.fullName,
      email: input.customer.email,
      street: input.install.street,
    });
    const isTest = (quoteRow.is_test ?? false) || autoTestTag;

    // 7) Insert booking via the RPC. Returns id + customer-facing PAG-XXXX token.
    const insertPayload = {
      quote_id: quoteRow.id,
      full_name: input.customer.fullName,
      phone_e164: phoneE164,
      email: (input.customer.email || '').trim(),
      install_street: input.install.street,
      install_city: installCity,
      install_state: quoteRow.state || '',
      install_zip: installZip,
      preferred_install_date: input.install.date,
      preferred_install_window: input.install.window,
      sms_consent: input.smsConsent,
      variant_id: input.variantId?.trim() || 'control',
      ip_address: ip === 'unknown' ? '' : ip,
      user_agent: request.headers.get('user-agent') || '',
      // is_test = inherited from the parent quote OR auto-detected team/test
      // (autoTestTag above) — keeps internal/dev bookings out of reporting.
      is_test: isTest,
    };

    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('fn_create_quote_booking', { payload: insertPayload })
      .single<{ id: string; booking_token: string; accepted_total_cents: number | null; discount_pct: number | null }>();

    if (rpcError || !rpcResult) {
      console.error('[quote-book] RPC insert failed:', rpcError?.message);
      return NextResponse.json(
        { error: 'Booking failed. Please call (720) 918-7465 to book by phone.' },
        { status: 500 }
      );
    }

    const { data: persistedBooking, error: persistedBookingError } = await supabase
      .from('automated_quote_bookings')
      .select('id, booking_token, full_name, phone_e164, email, install_street, install_city, install_state, install_zip, preferred_install_date, preferred_install_window, sms_consent, is_test, accepted_total_cents, discount_pct, notification_status')
      .eq('id', rpcResult.id)
      .single<ExistingBookingSummary>();
    if (persistedBookingError || !persistedBooking) {
      console.error('[quote-book] persisted booking lookup failed:', persistedBookingError?.message);
      return NextResponse.json(
        { error: 'Booking was saved, but confirmation lookup failed. Please call (720) 918-7465.' },
        { status: 500 }
      );
    }
    const effectiveIsTest = (quoteRow.is_test ?? false) || (persistedBooking.is_test ?? false);

    // If the quote/booking is test, propagate the flag to the parent quote and
    // purge its raw analytics session so it cannot count as real funnel/traffic.
    // Best-effort: the booking is already durable, so a tag failure must never
    // fail the request.
    if (effectiveIsTest) {
      if (!quoteRow.is_test) {
        const { error: qErr } = await supabase
          .from('automated_quotes')
          .update({ is_test: true })
          .eq('id', quoteRow.id);
        if (qErr) console.error('[quote-book] quote is_test back-tag failed:', qErr.message);
      }
      if (quoteRow.session_id) {
        await markAnalyticsSessionTest(supabase, quoteRow.session_id);
      }
    }

    // 7b) Mirror the booked customer into the leads pipeline as a 'form' lead so
    // quoter bookings show up in Leads/Dashboard/ROI like any other lead (Item 9 /
    // F02). Best-effort: the booking row is already durable — a lead-sync failure
    // must NEVER fail the booking. Revenue is left null (Omega completion owns it,
    // F09); status='scheduled'; WHERE resolved from the quote's session.
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (url && anonKey) {
        const anon = createClient(url, anonKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const name = splitName(persistedBooking.full_name);
        const attribution = await buildAttributionFromSession(supabase, quoteRow.session_id);
        const leadId = await findOrCreateQuoteLead(
          supabase,
          anon,
          { ...quoteRow, accepted_total_cents: rpcResult.accepted_total_cents },
          {
            firstName: name.firstName,
            lastName: name.lastName,
            phone: persistedBooking.phone_e164,
            email: persistedBooking.email,
            smsConsent: persistedBooking.sms_consent,
            state: quoteRow.state,
            zip: persistedBooking.install_zip || quoteRow.zip,
            sessionId: quoteRow.session_id,
            attribution,
            isTest: effectiveIsTest,
            status: 'scheduled',
          },
        );
        if (!quoteRow.lead_id && leadId) {
          await supabase.from('automated_quotes').update({ lead_id: leadId }).eq('id', quoteRow.id);
        }
        // Ensure the resolved lead is tagged test when this booking is team/test.
        // findOrCreateQuoteLead only stamps is_test on NEW inserts, so a reused or
        // pre-existing lead would otherwise stay visible in reporting (codex P2).
        if (effectiveIsTest && leadId) {
          await supabase.from('leads').update({ is_test: true }).eq('id', leadId).eq('is_test', false);
        }
      }
    } catch (leadErr) {
      console.error('[quote-book] lead sync failed (booking still saved):', leadErr instanceof Error ? leadErr.message : leadErr);
    }

    // 7) Notifications. Booking row is durable; if these fail the customer still
    // has the on-screen confirmation and ops can chase notification_status.
    const notification = await sendAppointmentBookedNotificationEvent({
      supabase,
      quoteRow,
      booking: persistedBooking,
      isTest: effectiveIsTest,
    });

    await supabase
      .from('automated_quote_notification_events')
      .update({
        status: 'skipped',
        last_error: 'booked_before_followup',
        metadata: { quoteToken: quoteRow.quote_token, bookingToken: rpcResult.booking_token, reason: 'booked_before_followup' },
      })
      .eq('quote_id', quoteRow.id)
      .in('event_type', ['quote_unbooked_5m', 'quote_unbooked_15m_discount'])
      .in('status', ['pending', 'processing', 'failed', 'partial']);

    // Also cancel pending discount offers on SIBLING quotes for the same phone.
    // Quote-wizard retries create multiple quote rows for one person; booking
    // any of them means none should get a "you haven't booked" discount text.
    if (persistedBooking.phone_e164) {
      const { data: siblingQuotes } = await supabase
        .from('automated_quotes')
        .select('id')
        .eq('phone_e164', persistedBooking.phone_e164)
        .neq('id', quoteRow.id);
      const siblingIds = (siblingQuotes ?? []).map((row: { id: string }) => row.id);
      if (siblingIds.length > 0) {
        await supabase
          .from('automated_quote_notification_events')
          .update({
            status: 'skipped',
            last_error: 'sibling_quote_booked',
            metadata: { quoteToken: quoteRow.quote_token, bookingToken: rpcResult.booking_token, reason: 'sibling_quote_booked' },
          })
          .in('quote_id', siblingIds)
          .eq('event_type', 'quote_unbooked_15m_discount')
          .in('status', ['pending', 'processing', 'failed', 'partial']);
      }
    }

    // 8) Persist notification outcome onto the booking row. Failure to
    // update is logged but does not affect the response.
    if (effectiveIsTest || notification.status !== 'skipped' || notification.firstError) {
      await persistBookingNotificationOutcome(supabase, rpcResult.id, notification);
    }

    return NextResponse.json({
      success: true,
      bookingToken: rpcResult.booking_token,
      acceptedTotalCents: rpcResult.accepted_total_cents ?? quoteRow.quote_total_cents ?? null,
      discountPct: rpcResult.discount_pct ?? null,
      notification: {
        status: notification.status,
        channels: notification.channels,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'booking_failed';
    console.error('[quote-book] uncaught failure:', message);
    return NextResponse.json(
      {
        success: false,
        error: 'Booking is temporarily unavailable. Please call (720) 918-7465.',
      },
      { status: 503 }
    );
  }
}

function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return undefined;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function sendAppointmentBookedNotificationEvent(input: {
  supabase: SupabaseClient;
  quoteRow: QuoteSummary;
  booking: ExistingBookingSummary;
  isTest: boolean;
}): Promise<BookingNotificationOutcome> {
  if (input.isTest) {
    return {
      status: 'skipped',
      firstError: undefined,
      channels: [
        { channel: 'email', outcome: 'skipped', reason: 'test booking' },
        { channel: 'sms', outcome: 'skipped', reason: 'test booking' },
      ],
    };
  }

  const claim = await claimQuoteNotificationEvent({
    admin: input.supabase,
    quoteId: input.quoteRow.id,
    eventType: 'appointment_booked',
    metadata: { quoteToken: input.quoteRow.quote_token, bookingToken: input.booking.booking_token },
  });
  if (!claim.claimed || !claim.eventId) {
    return {
      status: 'skipped',
      firstError: undefined,
      channels: [
        { channel: 'email', outcome: 'skipped', reason: claim.reason ?? 'appointment_booked_event_not_claimed' },
        { channel: 'sms', outcome: 'skipped', reason: claim.reason ?? 'appointment_booked_event_not_claimed' },
      ],
    };
  }

  const vehicleSummary = [
    input.quoteRow.vehicle_year,
    input.quoteRow.vehicle_make,
    input.quoteRow.vehicle_model,
    input.quoteRow.vehicle_trim,
  ].filter(Boolean).join(' ');

  const bookingNotificationInput = {
    bookingToken: input.booking.booking_token,
    customer: {
      fullName: input.booking.full_name,
      phoneE164: input.booking.phone_e164,
      email: input.booking.email,
      smsConsent: input.booking.sms_consent,
    },
    install: {
      street: input.booking.install_street,
      city: input.booking.install_city,
      state: input.booking.install_state || input.quoteRow.state,
      zip: input.booking.install_zip,
      date: String(input.booking.preferred_install_date).slice(0, 10),
      window: input.booking.preferred_install_window,
    },
    quote: {
      // The booking row's accepted price is the deal of record — it already
      // reflects the rescue discount when one was active at booking time.
      totalCents: input.booking.accepted_total_cents ?? input.quoteRow.quote_total_cents ?? 0,
      originalTotalCents: input.quoteRow.quote_total_cents,
      discountPct: input.booking.discount_pct,
      vehicleSummary: vehicleSummary || 'your vehicle',
    },
    adasTier: readAdasTier(input.quoteRow.confidence_reasons),
  };
  const teamAlertContext = {
    supplierCostCents: input.quoteRow.supplier_cost_cents,
    glassBrand: input.quoteRow.selected_brand,
    glassPartNumber: input.quoteRow.selected_nags_number,
    glassDescription: input.quoteRow.selected_part_description,
    qtyAvailable: input.quoteRow.selected_qty_available,
    estimatedDeliveryDate: input.quoteRow.selected_estimated_delivery_date,
  };

  const customerOutcome = await sendBookingNotifications(bookingNotificationInput, {
    skipEmail: claim.priorChannels?.customerEmail === 'sent',
    skipSms: claim.priorChannels?.customerSms === 'sent',
  });
  const teamOutcome = await sendTeamAlert(bookingNotificationInput, teamAlertContext, {
    skipEmail: claim.priorChannels?.teamEmail === 'sent',
    skipSms: claim.priorChannels?.teamSms === 'sent',
  });
  const channels = {
    customerEmail: channelOutcomeToStatus(customerOutcome.channels.find((channel) => channel.channel === 'email')?.outcome),
    customerSms: channelOutcomeToStatus(customerOutcome.channels.find((channel) => channel.channel === 'sms')?.outcome),
    teamEmail: channelOutcomeToStatus(teamOutcome.channels.find((channel) => channel.channel === 'email')?.outcome),
    teamSms: channelOutcomeToStatus(teamOutcome.channels.find((channel) => channel.channel === 'sms')?.outcome),
  };
  const eventStatus = combineEventStatus(channels);
  const firstError = customerOutcome.firstError
    ?? teamOutcome.channels.find((channel) => channel.outcome === 'failed')?.reason
    ?? null;
  await completeQuoteNotificationEvent({
    admin: input.supabase,
    eventId: claim.eventId,
    status: eventStatus,
    channels,
    error: firstError,
    metadata: { quoteToken: input.quoteRow.quote_token, bookingToken: input.booking.booking_token },
  });
  return {
    ...customerOutcome,
    status: eventStatusToBookingStatus(eventStatus, customerOutcome.status),
    firstError: firstError ?? undefined,
  };
}

async function persistBookingNotificationOutcome(
  supabase: SupabaseClient,
  bookingId: string,
  notification: BookingNotificationOutcome
): Promise<void> {
  const { error } = await supabase
    .from('automated_quote_bookings')
    .update({
      notification_status: notification.status,
      notification_error: notification.firstError ?? null,
    })
    .eq('id', bookingId);
  if (error) {
    console.error('[quote-book] notification_status update failed:', error.message);
  }
}

function channelOutcomeToStatus(outcome?: 'sent' | 'skipped' | 'failed'): ChannelStatus {
  if (outcome === 'sent') return 'sent';
  if (outcome === 'failed') return 'failed';
  return 'skipped';
}

function eventStatusToBookingStatus(
  eventStatus: AutoQuoteNotificationEventStatus,
  customerStatus: 'pending' | 'email_sent' | 'sms_sent' | 'both_sent' | 'partial' | 'failed' | 'skipped'
) {
  if (eventStatus === 'failed') return 'failed';
  if (eventStatus === 'partial') return 'partial';
  if (eventStatus === 'skipped') return 'skipped';
  return customerStatus;
}
