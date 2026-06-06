import type { SupabaseClient } from '@supabase/supabase-js';
import { isCustomerSmsEnabled } from '@/lib/constants';
import { sendEmail, sendAdminAlertEmail } from '@/lib/notifications/email';
import { sendSMS, sendAdminSMS } from '@/lib/notifications/sms';
import { centsToDollars } from '@/lib/quote/pricing';
import { shortQuoteToken } from '@/lib/quote/leadSync';
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
const FOLLOWUP_DELAY_MS = 5 * 60 * 1000;
const MAX_BATCH_SIZE = 20;

interface PendingHotQuoteEventRow {
  quote_id: string;
}

interface HotQuoteRow {
  id: string;
  quote_token: string;
  lead_id: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_e164: string | null;
  email: string | null;
  sms_consent: boolean | null;
  status: string;
  is_test: boolean | null;
  quote_total_cents: number | null;
  vehicle_year: number | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_trim: string | null;
  vin: string | null;
  state: string | null;
  zip: string | null;
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
  const cutoff = new Date(now.getTime() - FOLLOWUP_DELAY_MS).toISOString();
  const limit = Math.min(Math.max(input.limit ?? MAX_BATCH_SIZE, 1), MAX_BATCH_SIZE);

  const { data: pendingEvents, error: eventsError } = await admin
    .from('automated_quote_notification_events')
    .select('quote_id')
    .eq('event_type', 'quote_unbooked_5m')
    .in('status', ['pending', 'processing', 'failed', 'partial'])
    .lte('created_at', cutoff)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (eventsError) {
    result.errors.push(eventsError.message);
    return result;
  }

  for (const event of (pendingEvents ?? []) as PendingHotQuoteEventRow[]) {
    result.scanned++;
    await processOneHotQuote(admin, event.quote_id, result);
  }

  return result;
}

async function processOneHotQuote(
  admin: SupabaseClient,
  quoteId: string,
  result: HotQuoteFollowupResult
): Promise<void> {
  const claim = await claimQuoteNotificationEvent({
    admin,
    quoteId,
    eventType: 'quote_unbooked_5m',
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

  const booked = await hasBooking(admin, quoteId);
  if (booked) {
    result.skipped++;
    await completeQuoteNotificationEvent({
      admin,
      eventId: claim.eventId,
      status: 'skipped',
      error: 'already_booked',
      metadata: { quoteToken: quote.quote_token, reason: 'already_booked' },
    });
    return;
  }

  if (quote.is_test || !quote.phone_e164 || !quote.quote_total_cents) {
    result.skipped++;
    await completeQuoteNotificationEvent({
      admin,
      eventId: claim.eventId,
      status: 'skipped',
      error: quote.is_test ? 'test_quote' : 'missing_contact_or_price',
      metadata: { quoteToken: quote.quote_token },
    });
    return;
  }

  if (await hasBooking(admin, quoteId)) {
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

  const [teamEmail, teamSms, customerEmail, customerSms] = await Promise.all([
    shouldSendNotificationChannel(claim.priorChannels, 'teamEmail') ? sendHotQuoteTeamEmail(quote) : Promise.resolve(true),
    shouldSendNotificationChannel(claim.priorChannels, 'teamSms') ? sendHotQuoteTeamSms(quote) : Promise.resolve(true),
    shouldSendNotificationChannel(claim.priorChannels, 'customerEmail') ? sendHotQuoteCustomerEmail(quote) : Promise.resolve(true),
    shouldSendNotificationChannel(claim.priorChannels, 'customerSms') ? sendHotQuoteCustomerSms(quote) : Promise.resolve(true),
  ]);

  const channels = {
    teamEmail: channelStatusFromAttempt(claim.priorChannels?.teamEmail, true, teamEmail),
    teamSms: channelStatusFromAttempt(claim.priorChannels?.teamSms, true, teamSms),
    customerEmail: channelStatusFromAttempt(claim.priorChannels?.customerEmail, Boolean(quote.email), customerEmail),
    customerSms: channelStatusFromAttempt(claim.priorChannels?.customerSms, Boolean(quote.sms_consent && isCustomerSmsEnabled()), customerSms),
  };
  const status = combineEventStatus(channels);
  if (status === 'failed') result.failed++;
  else result.sent++;

  await completeQuoteNotificationEvent({
    admin,
    eventId: claim.eventId,
    status,
    channels,
    metadata: { quoteToken: quote.quote_token, leadId: quote.lead_id },
  });
}

async function loadQuote(admin: SupabaseClient, quoteId: string): Promise<HotQuoteRow | null> {
  const { data, error } = await admin
    .from('automated_quotes')
    .select('id, quote_token, lead_id, first_name, last_name, phone_e164, email, sms_consent, status, is_test, quote_total_cents, vehicle_year, vehicle_make, vehicle_model, vehicle_trim, vin, state, zip')
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

async function sendHotQuoteCustomerEmail(quote: HotQuoteRow): Promise<boolean> {
  if (!quote.email) return false;
  const ref = shortQuoteToken(quote.quote_token);
  const firstName = escapeHtml(quote.first_name || 'there');
  const price = formatPrice(quote);
  return sendEmail({
    to: quote.email,
    subject: 'Pink Auto Glass: your quote is ready to book',
    leadId: quote.lead_id ?? undefined,
    html: `<!DOCTYPE html>
<html><body style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h1 style="color: #ec4899; margin: 0 0 16px 0;">Your quote is ready to book</h1>
  <p>Hi ${firstName},</p>
  <p>Your installed price from Pink Auto Glass is still ready: <strong>${escapeHtml(price)}</strong>.</p>
  <p>If you would like help booking, call us at <strong>${CALLBACK_PHONE}</strong>.</p>
  <p>Reference: <strong>${escapeHtml(ref)}</strong></p>
  <p>Thanks,<br>Pink Auto Glass</p>
</body></html>`,
  });
}

async function sendHotQuoteCustomerSms(quote: HotQuoteRow): Promise<boolean> {
  if (!quote.sms_consent || !isCustomerSmsEnabled() || !quote.phone_e164) return false;
  return sendSMS({
    to: quote.phone_e164,
    message: `Pink Auto Glass: your installed price ${formatPrice(quote)} is ready to book. Call ${CALLBACK_PHONE} if you want help. Ref ${shortQuoteToken(quote.quote_token)}. Reply STOP to opt out.`,
  });
}

async function sendHotQuoteTeamEmail(quote: HotQuoteRow): Promise<boolean> {
  const ref = shortQuoteToken(quote.quote_token);
  return sendAdminAlertEmail(
    `Hot Quote Not Booked - ${ref}: ${customerName(quote)} - ${formatPrice(quote)}`,
    `<!DOCTYPE html>
<html><body style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
  <h2>Hot Quote Not Booked</h2>
  <p>A customer received an installed price five minutes ago and has not booked an appointment yet.</p>
  <p><strong>Reference:</strong> ${escapeHtml(ref)}</p>
  <p><strong>Price:</strong> ${escapeHtml(formatPrice(quote))}</p>
  <p><strong>Customer:</strong> ${escapeHtml(customerName(quote))}</p>
  <p><strong>Phone:</strong> ${escapeHtml(quote.phone_e164 || '')}</p>
  ${quote.email ? `<p><strong>Email:</strong> ${escapeHtml(quote.email)}</p>` : ''}
  <p><strong>Vehicle:</strong> ${escapeHtml(vehicleSummary(quote))}</p>
  <p><strong>Location:</strong> ${escapeHtml(locationSummary(quote))}</p>
  ${quote.vin ? `<p><strong>VIN:</strong> ${escapeHtml(quote.vin)}</p>` : ''}
  ${quote.lead_id ? `<p><strong>Lead ID:</strong> ${escapeHtml(quote.lead_id)}</p>` : ''}
</body></html>`,
  );
}

async function sendHotQuoteTeamSms(quote: HotQuoteRow): Promise<boolean> {
  return sendAdminSMS(
    `Hot quote not booked ${shortQuoteToken(quote.quote_token)}: ${customerName(quote)} | ${quote.phone_e164 || 'no phone'} | ${vehicleSummary(quote)} | ${formatPrice(quote)} | ${locationSummary(quote)}`
  );
}

function customerName(quote: HotQuoteRow): string {
  return [quote.first_name, quote.last_name].filter(Boolean).join(' ') || 'Customer';
}

function vehicleSummary(quote: HotQuoteRow): string {
  return [quote.vehicle_year, quote.vehicle_make, quote.vehicle_model, quote.vehicle_trim].filter(Boolean).join(' ') || 'Vehicle details captured';
}

function locationSummary(quote: HotQuoteRow): string {
  return [quote.state, quote.zip].filter(Boolean).join(' ') || 'Location not captured';
}

function formatPrice(quote: HotQuoteRow): string {
  return quote.quote_total_cents ? `$${centsToDollars(quote.quote_total_cents).toFixed(2)}` : 'confirmation needed';
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
