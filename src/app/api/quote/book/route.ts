import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { normalizePhoneE164 } from '@/lib/booking-schema';
import { isInServiceArea, OUT_OF_AREA_MESSAGE } from '@/lib/quote/service-area';
import { sendBookingNotifications, sendTeamAlert } from '@/lib/quote/booking-notifications';
import { lookupCityFromZip } from '@/lib/quote/zip-to-city';
import { assertEnvCoherent } from '@/lib/env';
import { findOrCreateQuoteLead, buildAttributionFromSession, splitName } from '@/lib/quote/leadSync';

export const runtime = 'nodejs';

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
      .select('id, booking_token')
      .eq('quote_id', quoteRow.id)
      .maybeSingle<{ id: string; booking_token: string }>();
    if (existing) {
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
    if (!/^\+[1-9][0-9]{1,14}$/.test(phoneE164)) {
      return NextResponse.json(
        { error: 'Please enter a valid US phone number.' },
        { status: 400 }
      );
    }

    // 6) Resolve city from ZIP via Google Geocoding. Best-effort: never
    // throws, returns null on any error so the booking still proceeds.
    // Cached in-process — second booking from the same ZIP is free.
    const installCity = (await lookupCityFromZip(installZip)) || '';

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
      // Booking inherits is_test from its parent quote so test/dev bookings are
      // excluded from reporting like the quote is (codex pre-deploy F-market-3).
      is_test: quoteRow.is_test ?? false,
    };

    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('fn_create_quote_booking', { payload: insertPayload })
      .single<{ id: string; booking_token: string }>();

    if (rpcError || !rpcResult) {
      console.error('[quote-book] RPC insert failed:', rpcError?.message);
      return NextResponse.json(
        { error: 'Booking failed. Please call (720) 918-7465 to book by phone.' },
        { status: 500 }
      );
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
        const name = splitName(input.customer.fullName);
        const attribution = await buildAttributionFromSession(supabase, quoteRow.session_id);
        const leadId = await findOrCreateQuoteLead(supabase, anon, quoteRow, {
          firstName: name.firstName,
          lastName: name.lastName,
          phone: phoneE164,
          email: input.customer.email?.trim() || null,
          smsConsent: input.smsConsent,
          state: quoteRow.state,
          zip: installZip || quoteRow.zip,
          sessionId: quoteRow.session_id,
          attribution,
          isTest: quoteRow.is_test ?? false,
          status: 'scheduled',
        });
        if (!quoteRow.lead_id && leadId) {
          await supabase.from('automated_quotes').update({ lead_id: leadId }).eq('id', quoteRow.id);
        }
      }
    } catch (leadErr) {
      console.error('[quote-book] lead sync failed (booking still saved):', leadErr instanceof Error ? leadErr.message : leadErr);
    }

    // 7) Notifications — non-blocking. Booking row is durable; if these
    // fail the customer still has the on-screen confirmation and ops
    // can chase notification_status from the row.
    const vehicleSummary = [quoteRow.vehicle_year, quoteRow.vehicle_make, quoteRow.vehicle_model, quoteRow.vehicle_trim]
      .filter(Boolean)
      .join(' ');

    // Team alert — fire-and-forget, never blocks the customer response.
    // Council reco 2026-05-28 (Codex + Gemini unanimous): async after DB
    // write so provider delays don't slow down "You're booked!" for the
    // customer. Errors are logged inside sendTeamAlert; we don't await.
    void sendTeamAlert(
      {
        bookingToken: rpcResult.booking_token,
        customer: {
          fullName: input.customer.fullName,
          phoneE164,
          email: input.customer.email?.trim() || null,
          smsConsent: input.smsConsent,
        },
        install: {
          street: input.install.street,
          city: installCity || null,
          state: quoteRow.state,
          zip: installZip,
          date: input.install.date,
          window: input.install.window,
        },
        quote: {
          totalCents: quoteRow.quote_total_cents || 0,
          vehicleSummary: vehicleSummary || 'your vehicle',
        },
      },
      {
        supplierCostCents: quoteRow.supplier_cost_cents,
        glassBrand: quoteRow.selected_brand,
        glassPartNumber: quoteRow.selected_nags_number,
        glassDescription: quoteRow.selected_part_description,
        qtyAvailable: quoteRow.selected_qty_available,
        estimatedDeliveryDate: quoteRow.selected_estimated_delivery_date,
      }
    ).catch((err) => {
      // Last-resort logger — sendTeamAlert itself never throws but the
      // void-promise contract means we still want a backstop log.
      console.error('[quote-book] sendTeamAlert threw unexpectedly:', err);
    });

    const adasTier = readAdasTier(quoteRow.confidence_reasons);
    const notification = await sendBookingNotifications({
      bookingToken: rpcResult.booking_token,
      customer: {
        fullName: input.customer.fullName,
        phoneE164,
        email: input.customer.email?.trim() || null,
        smsConsent: input.smsConsent,
      },
      install: {
        street: input.install.street,
        city: null,
        state: quoteRow.state,
        zip: installZip,
        date: input.install.date,
        window: input.install.window,
      },
      quote: {
        totalCents: quoteRow.quote_total_cents || 0,
        vehicleSummary: vehicleSummary || 'your vehicle',
      },
      adasTier,
    });

    // 8) Persist notification outcome onto the booking row. Failure to
    // update is logged but does not affect the response.
    const { error: updateError } = await supabase
      .from('automated_quote_bookings')
      .update({
        notification_status: notification.status,
        notification_error: notification.firstError ?? null,
      })
      .eq('id', rpcResult.id);
    if (updateError) {
      console.error('[quote-book] notification_status update failed:', updateError.message);
    }

    return NextResponse.json({
      success: true,
      bookingToken: rpcResult.booking_token,
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
