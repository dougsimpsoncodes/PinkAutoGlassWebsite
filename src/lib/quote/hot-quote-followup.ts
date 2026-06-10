import type { SupabaseClient } from '@supabase/supabase-js';
import { isCustomerSmsEnabled } from '@/lib/constants';
import { sendEmail } from '@/lib/notifications/email';
import { sendSMS } from '@/lib/notifications/sms';
import { centsToDollars } from '@/lib/quote/pricing';
import { getNextTwoWorkingDays, isTomorrow } from '@/lib/quote/schedule-slots';
import {
  boolToChannelStatus,
  claimQuoteNotificationEvent,
  combineEventStatus,
  completeQuoteNotificationEvent,
  getQuoteNotificationAdminClient,
  shouldSendNotificationChannel,
  type ChannelStatus,
} from '@/lib/quote/notification-events';

const CALLBACK_PHONE = '(720) 918-7465';
const DISCOUNT_EVENT_TYPE = 'quote_unbooked_15m_discount';
const DISCOUNT_PCT = 10;
const DISCOUNT_DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_BATCH_SIZE = 20;

interface PendingHotQuoteEventRow {
  quote_id: string;
}

interface HotQuoteRow {
  id: string;
  quote_token: string;
  booking_link_token: string | null;
  lead_id: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_e164: string | null;
  email: string | null;
  sms_consent: boolean | null;
  status: string;
  is_test: boolean | null;
  quote_total_cents: number | null;
  discount_offered_at: string | null;
  discounted_total_cents: number | null;
  vehicle_year: number | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_trim: string | null;
}

export interface HotQuoteFollowupResult {
  scanned: number;
  claimed: number;
  sent: number;
  skipped: number;
  failed: number;
  errors: string[];
}

export async function processHotQuoteFollowups(input: {
  admin?: SupabaseClient | null;
  now?: Date;
  limit?: number;
} = {}): Promise<HotQuoteFollowupResult> {
  const admin = input.admin ?? getQuoteNotificationAdminClient();
  const result: HotQuoteFollowupResult = {
    scanned: 0,
    claimed: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };
  if (!admin) {
    result.errors.push('supabase_not_configured');
    return result;
  }

  const now = input.now ?? new Date();
  const limit = Math.min(Math.max(input.limit ?? MAX_BATCH_SIZE, 1), MAX_BATCH_SIZE);

  const { data: pendingEvents, error: eventsError } = await admin
    .from('automated_quote_notification_events')
    .select('quote_id')
    .eq('event_type', DISCOUNT_EVENT_TYPE)
    .in('status', ['pending', 'processing', 'failed', 'partial'])
    .lte('scheduled_for', now.toISOString())
    .lt('attempt_count', MAX_ATTEMPTS)
    .order('scheduled_for', { ascending: true })
    .limit(limit);

  if (eventsError) {
    result.errors.push(eventsError.message);
    return result;
  }

  for (const event of (pendingEvents ?? []) as PendingHotQuoteEventRow[]) {
    result.scanned++;
    await processOneDiscountOffer(admin, event.quote_id, result);
  }

  return result;
}

async function processOneDiscountOffer(
  admin: SupabaseClient,
  quoteId: string,
  result: HotQuoteFollowupResult
): Promise<void> {
  const claim = await claimQuoteNotificationEvent({
    admin,
    quoteId,
    eventType: DISCOUNT_EVENT_TYPE,
    metadata: { source: 'processHotQuoteFollowups' },
  });
  if (!claim.claimed || !claim.eventId) {
    return;
  }
  result.claimed++;

  const quote = await loadQuote(admin, quoteId);
  if (!quote) {
    result.failed++;
    await completeQuoteNotificationEvent({
      admin,
      eventId: claim.eventId,
      status: 'failed',
      error: 'quote_not_found',
    });
    return;
  }

  const skipReason = await discountSkipReason(admin, quote);
  if (skipReason) {
    result.skipped++;
    await completeQuoteNotificationEvent({
      admin,
      eventId: claim.eventId,
      status: 'skipped',
      error: skipReason,
      metadata: { quoteToken: quote.quote_token, reason: skipReason },
    });
    return;
  }

  const discountedCents = await persistDiscount(admin, quote);
  if (!discountedCents) {
    result.failed++;
    await completeQuoteNotificationEvent({
      admin,
      eventId: claim.eventId,
      status: 'failed',
      error: 'discount_persist_failed',
      metadata: { quoteToken: quote.quote_token },
    });
    return;
  }

  // Final booking re-check after the discount write, immediately before send.
  if (await hasBooking(admin, quote.id)) {
    result.skipped++;
    await completeQuoteNotificationEvent({
      admin,
      eventId: claim.eventId,
      status: 'skipped',
      error: 'booked_before_send',
      metadata: { quoteToken: quote.quote_token, reason: 'booked_before_send' },
    });
    return;
  }

  const smsEligible = Boolean(quote.sms_consent && isCustomerSmsEnabled() && quote.phone_e164);
  // Email is the fallback for SMS-ineligible customers (no consent or SMS
  // kill-switch off), not a second message on top of the SMS.
  const emailEligible = !smsEligible && Boolean(quote.email);

  const [smsSettled, emailSettled] = await Promise.allSettled([
    smsEligible && shouldSendNotificationChannel(claim.priorChannels, 'customerSms')
      ? sendDiscountCustomerSms(quote, discountedCents)
      : Promise.resolve(true),
    emailEligible && shouldSendNotificationChannel(claim.priorChannels, 'customerEmail')
      ? sendDiscountCustomerEmail(quote, discountedCents)
      : Promise.resolve(true),
  ]);
  const customerSms = smsSettled.status === 'fulfilled' ? smsSettled.value : false;
  const customerEmail = emailSettled.status === 'fulfilled' ? emailSettled.value : false;

  const channels = {
    teamEmail: 'skipped' as ChannelStatus,
    teamSms: 'skipped' as ChannelStatus,
    customerEmail: channelStatusFromAttempt(claim.priorChannels?.customerEmail, emailEligible, customerEmail),
    customerSms: channelStatusFromAttempt(claim.priorChannels?.customerSms, smsEligible, customerSms),
  };
  const status = combineEventStatus(channels);
  if (status === 'failed') result.failed++;
  else result.sent++;

  await completeQuoteNotificationEvent({
    admin,
    eventId: claim.eventId,
    status,
    channels,
    metadata: {
      quoteToken: quote.quote_token,
      leadId: quote.lead_id,
      discountPct: DISCOUNT_PCT,
      discountedTotalCents: discountedCents,
    },
  });
}

async function discountSkipReason(admin: SupabaseClient, quote: HotQuoteRow): Promise<string | null> {
  if (quote.is_test) return 'test_quote';
  // Manual-review quotes have no price to discount; their immediate
  // team/customer comms already cover follow-up.
  if (!quote.quote_total_cents) return 'no_price';
  if (!quote.booking_link_token) return 'missing_booking_link_token';
  if (!quote.phone_e164 && !quote.email) return 'no_contact';

  if (await hasBooking(admin, quote.id)) return 'already_booked';

  // One discount per phone per 24h: quote-wizard retries create new quote
  // rows for the same person, and each schedules its own discount event.
  if (quote.phone_e164) {
    const since = new Date(Date.now() - DISCOUNT_DEDUP_WINDOW_MS).toISOString();
    const { data: recentOffer, error } = await admin
      .from('automated_quotes')
      .select('id')
      .eq('phone_e164', quote.phone_e164)
      .neq('id', quote.id)
      .gte('discount_offered_at', since)
      .limit(1)
      .maybeSingle<{ id: string }>();
    if (error) {
      console.error('[hot-quote-followup] discount dedup lookup failed:', error.message);
      return 'dedup_lookup_failed';
    }
    if (recentOffer?.id) return 'discount_recently_offered';
  }

  return null;
}

/**
 * Writes the discount to the quote row before any message goes out, so the
 * booking page and booking RPC always agree with what the customer was told.
 * The conditional update keeps the original offer timestamp on retries —
 * a failed SMS retry must not extend the 24h expiry window.
 */
async function persistDiscount(admin: SupabaseClient, quote: HotQuoteRow): Promise<number | null> {
  if (quote.discount_offered_at && quote.discounted_total_cents) {
    return quote.discounted_total_cents;
  }

  const discountedCents = Math.round(quote.quote_total_cents! * (1 - DISCOUNT_PCT / 100));
  const { error } = await admin
    .from('automated_quotes')
    .update({
      discount_pct: DISCOUNT_PCT,
      discounted_total_cents: discountedCents,
      discount_offered_at: new Date().toISOString(),
    })
    .eq('id', quote.id)
    .is('discount_offered_at', null);

  if (error) {
    console.error('[hot-quote-followup] discount persist failed:', error.message);
    return null;
  }

  // A concurrent attempt may have won the conditional update; read back the
  // authoritative value either way.
  const { data, error: readError } = await admin
    .from('automated_quotes')
    .select('discounted_total_cents')
    .eq('id', quote.id)
    .single<{ discounted_total_cents: number | null }>();
  if (readError || !data?.discounted_total_cents) {
    console.error('[hot-quote-followup] discount readback failed:', readError?.message);
    return null;
  }
  return data.discounted_total_cents;
}

async function loadQuote(admin: SupabaseClient, quoteId: string): Promise<HotQuoteRow | null> {
  const { data, error } = await admin
    .from('automated_quotes')
    .select('id, quote_token, booking_link_token, lead_id, first_name, last_name, phone_e164, email, sms_consent, status, is_test, quote_total_cents, discount_offered_at, discounted_total_cents, vehicle_year, vehicle_make, vehicle_model, vehicle_trim')
    .eq('id', quoteId)
    .single<HotQuoteRow>();
  if (error) {
    console.error('[hot-quote-followup] quote lookup failed:', error.message);
    return null;
  }
  return data ?? null;
}

async function hasBooking(admin: SupabaseClient, quoteId: string): Promise<boolean> {
  const { data, error } = await admin
    .from('automated_quote_bookings')
    .select('id')
    .eq('quote_id', quoteId)
    .limit(1)
    .maybeSingle<{ id: string }>();
  if (error) {
    console.error('[hot-quote-followup] booking lookup failed:', error.message);
    return true;
  }
  return Boolean(data?.id);
}

/**
 * Day label for the "install spot" claim, computed on Denver's calendar.
 * The cron runs in UTC; after ~5pm Denver, UTC is already on the next
 * calendar day, so naive Date math would name the wrong day. Mirrors the
 * pill picker rules: no same-day, Mon-Sat, federal holidays skipped.
 */
function nextInstallDayLabel(): string {
  const denverIso = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' });
  const [y, m, d] = denverIso.split('-').map(Number);
  const denverToday = new Date(y, m - 1, d, 12);
  const [day1] = getNextTwoWorkingDays(denverToday);
  if (isTomorrow(day1, denverToday)) return 'tomorrow';
  const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return fullDayNames[day1.getDay()];
}

function bookingUrl(quote: HotQuoteRow): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pinkautoglass.com';
  return `${siteUrl}/quote/book/${quote.booking_link_token}`;
}

async function sendDiscountCustomerSms(quote: HotQuoteRow, discountedCents: number): Promise<boolean> {
  if (!quote.phone_e164) return false;
  const firstName = quote.first_name || 'Hi';
  const vehicle = vehicleSummary(quote);
  const dayLabel = nextInstallDayLabel();
  const price = `$${centsToDollars(discountedCents).toFixed(2)}`;
  return sendSMS({
    to: quote.phone_e164,
    message: `${firstName}, thanks for your ${vehicle} quote. We have one install spot left ${dayLabel} and can offer you 10% off to book now. Your discounted price: ${price}. Book here: ${bookingUrl(quote)}. Reply STOP to opt out.`,
  });
}

async function sendDiscountCustomerEmail(quote: HotQuoteRow, discountedCents: number): Promise<boolean> {
  if (!quote.email) return false;
  const firstName = escapeHtml(quote.first_name || 'there');
  const vehicle = escapeHtml(vehicleSummary(quote));
  const dayLabel = escapeHtml(nextInstallDayLabel());
  const originalPrice = `$${centsToDollars(quote.quote_total_cents!).toFixed(2)}`;
  const price = `$${centsToDollars(discountedCents).toFixed(2)}`;
  const url = bookingUrl(quote);
  return sendEmail({
    to: quote.email,
    subject: `Pink Auto Glass: 10% off your quote — one install spot left ${dayLabel}`,
    leadId: quote.lead_id ?? undefined,
    html: `<!DOCTYPE html>
<html><body style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h1 style="color: #ec4899; margin: 0 0 16px 0;">10% off — one install spot left ${dayLabel}</h1>
  <p>Hi ${firstName},</p>
  <p>Thanks for your ${vehicle} quote. We have one install spot left ${dayLabel} and can offer you 10% off to book now.</p>
  <p style="font-size: 18px;">Your discounted price: <span style="text-decoration: line-through; color: #6b7280;">${escapeHtml(originalPrice)}</span> <strong style="font-size: 24px;">${escapeHtml(price)}</strong></p>
  <p style="margin: 24px 0;">
    <a href="${url}" style="background: #ec4899; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Book your install</a>
  </p>
  <p>Questions? Call us at <strong>${CALLBACK_PHONE}</strong>.</p>
  <p>Thanks,<br>Pink Auto Glass</p>
</body></html>`,
  });
}

function vehicleSummary(quote: HotQuoteRow): string {
  return [quote.vehicle_year, quote.vehicle_make, quote.vehicle_model].filter(Boolean).join(' ') || 'vehicle';
}

function channelStatusFromAttempt(prior: ChannelStatus | undefined, eligible: boolean, ok: boolean): ChannelStatus {
  if (prior === 'sent') return 'sent';
  if (!eligible) return 'skipped';
  return boolToChannelStatus(ok);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
