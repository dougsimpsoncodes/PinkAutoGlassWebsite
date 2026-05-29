/**
 * Booking confirmation orchestration.
 *
 * Wraps the lower-level email/SMS primitives in src/lib/notifications/ with
 * booking-specific gating (TCPA consent, feature flag) and returns a result
 * shape that maps cleanly onto the `notification_status` enum on the
 * automated_quote_bookings table.
 *
 * Per the 2026-05-27 Codex council review:
 *   - SMS only fires when both ENABLE_CUSTOMER_SMS=true AND sms_consent=true
 *   - Notification failures NEVER throw; the booking row is already
 *     durable by the time this runs.
 *   - Email always attempts when an address is provided; failure is logged
 *     and surfaced via the returned status, not propagated.
 */

import { sendEmail } from '@/lib/notifications/email';
import { sendSMS } from '@/lib/notifications/sms';
import { centsToDollars } from '@/lib/quote/pricing';

export type BookingNotificationStatus =
  | 'pending'
  | 'email_sent'
  | 'sms_sent'
  | 'both_sent'
  | 'partial'
  | 'failed'
  | 'skipped';

export interface BookingChannelResult {
  channel: 'email' | 'sms';
  /** 'sent' = transmitted to provider, 'skipped' = no recipient/flag off, 'failed' = provider error or thrown */
  outcome: 'sent' | 'skipped' | 'failed';
  reason?: string;
}

export interface BookingNotificationOutcome {
  status: BookingNotificationStatus;
  channels: BookingChannelResult[];
  /** First error message encountered, if any. Stored on notification_error column for ops triage. */
  firstError?: string;
}

export interface BookingNotificationInput {
  bookingToken: string;
  customer: {
    fullName: string;
    phoneE164: string;
    email?: string | null;
    smsConsent: boolean;
  };
  install: {
    street: string;
    city?: string | null;
    state?: string | null;
    zip: string;
    date: string;          // ISO YYYY-MM-DD
    window: 'AM' | 'PM';
  };
  quote: {
    totalCents: number;
    vehicleSummary: string;  // e.g. "2022 Honda Accord"
  };
}

/**
 * Extra context for the TEAM alert (separate from customer notifications).
 * Carries cost/glass/inventory fields that the customer never sees but
 * Pink ops use to triage the booking.
 */
export interface TeamAlertContext {
  supplierCostCents?: number | null;
  glassBrand?: string | null;
  glassPartNumber?: string | null;
  glassDescription?: string | null;
  qtyAvailable?: number | null;
  estimatedDeliveryDate?: string | null;  // ISO YYYY-MM-DD
}

const CALLBACK_PHONE = '(720) 918-7465';
const COMPANY_NAME = 'Pink Auto Glass';

function formatInstallDate(iso: string): string {
  // Accept YYYY-MM-DD and render as "Thu May 29".
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dt.getUTCDay()];
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][dt.getUTCMonth()];
  return `${dow} ${mon} ${d}`;
}

function formatWindow(window: 'AM' | 'PM'): string {
  return window === 'AM' ? 'Morning (8a-12p)' : 'Afternoon (12-5p)';
}

function buildSmsText(input: BookingNotificationInput): string {
  const date = formatInstallDate(input.install.date);
  const win = formatWindow(input.install.window);
  // Body kept under 160 chars where possible. STOP language required for TCPA.
  return [
    `${COMPANY_NAME}: ${input.customer.fullName}, your install is booked.`,
    `${date}, ${win}.`,
    `Ref ${input.bookingToken}.`,
    `Call ${CALLBACK_PHONE} for changes.`,
    `Reply STOP to opt out.`,
  ].join(' ');
}

function buildEmailHtml(input: BookingNotificationInput): string {
  const date = formatInstallDate(input.install.date);
  const win = formatWindow(input.install.window);
  const total = centsToDollars(input.quote.totalCents).toFixed(2);
  const address = [
    input.install.street,
    [input.install.city, input.install.state].filter(Boolean).join(', '),
    input.install.zip,
  ].filter(Boolean).join('<br>');

  return `<!DOCTYPE html>
<html><body style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h1 style="color: #ec4899; margin: 0 0 8px 0;">You're booked — ${input.bookingToken}</h1>
  <p style="margin: 0 0 24px 0; color: #555;">Thanks, ${input.customer.fullName}. Here are the details we have on file:</p>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
    <tr><td style="padding: 8px 0; color: #555;">Vehicle</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">${input.quote.vehicleSummary}</td></tr>
    <tr><td style="padding: 8px 0; color: #555;">When</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">${date}, ${win}</td></tr>
    <tr><td style="padding: 8px 0; color: #555; vertical-align: top;">Where</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">${address}</td></tr>
    <tr><td style="padding: 8px 0; color: #555; border-top: 1px solid #eee;">Installed price</td><td style="padding: 8px 0; text-align: right; font-weight: 700; border-top: 1px solid #eee;">$${total}</td></tr>
    <tr><td colspan="2" style="padding: 4px 0; text-align: right; color: #777; font-size: 12px;">+ sales tax at install</td></tr>
  </table>
  <h2 style="color: #1a1a1a; font-size: 16px; margin: 24px 0 8px 0;">What's next</h2>
  <p style="margin: 0 0 8px 0;">A Pink Auto Glass tech will arrive in the window above. We'll text you a heads-up about 30 minutes before arrival.</p>
  <p style="margin: 0 0 8px 0;"><strong>Before we arrive:</strong> please make sure the vehicle is accessible (out of the garage, parked in shade if possible) and clear the dashboard.</p>
  <p style="margin: 24px 0 4px 0;">Questions? Call us at <strong>${CALLBACK_PHONE}</strong>.</p>
  <p style="margin: 0; color: #555;">Mention reference <strong>${input.bookingToken}</strong>.</p>
</body></html>`;
}

function combineStatus(emailOutcome: BookingChannelResult, smsOutcome: BookingChannelResult): BookingNotificationStatus {
  const e = emailOutcome.outcome;
  const s = smsOutcome.outcome;
  if (e === 'sent' && s === 'sent') return 'both_sent';
  if (e === 'sent' && s === 'skipped') return 'email_sent';
  if (e === 'skipped' && s === 'sent') return 'sms_sent';
  if (e === 'sent' && s === 'failed') return 'partial';
  if (e === 'failed' && s === 'sent') return 'partial';
  if (e === 'skipped' && s === 'skipped') return 'skipped';
  // both failed, or any other failed-leaning combination
  if (e === 'failed' || s === 'failed') return 'failed';
  return 'pending';
}

export async function sendBookingNotifications(input: BookingNotificationInput): Promise<BookingNotificationOutcome> {
  const channels: BookingChannelResult[] = [];
  let firstError: string | undefined;

  // Email — fire if we have an address.
  const emailResult: BookingChannelResult = await (async () => {
    if (!input.customer.email) {
      return { channel: 'email' as const, outcome: 'skipped' as const, reason: 'no_recipient' };
    }
    try {
      const ok = await sendEmail({
        to: input.customer.email,
        subject: `Pink Auto Glass: install booked — ${input.bookingToken}`,
        html: buildEmailHtml(input),
      });
      if (ok) {
        return { channel: 'email' as const, outcome: 'sent' as const };
      }
      return { channel: 'email' as const, outcome: 'failed' as const, reason: 'resend_returned_false' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown_error';
      return { channel: 'email' as const, outcome: 'failed' as const, reason: message.slice(0, 200) };
    }
  })();
  channels.push(emailResult);
  if (emailResult.outcome === 'failed' && !firstError) firstError = `email: ${emailResult.reason}`;

  // SMS — both flag AND consent gate. Without both, we skip.
  const smsResult: BookingChannelResult = await (async () => {
    if (process.env.ENABLE_CUSTOMER_SMS !== 'true') {
      return { channel: 'sms' as const, outcome: 'skipped' as const, reason: 'flag_disabled' };
    }
    if (!input.customer.smsConsent) {
      return { channel: 'sms' as const, outcome: 'skipped' as const, reason: 'no_consent' };
    }
    try {
      const ok = await sendSMS({
        to: input.customer.phoneE164,
        message: buildSmsText(input),
      });
      if (ok) {
        return { channel: 'sms' as const, outcome: 'sent' as const };
      }
      return { channel: 'sms' as const, outcome: 'failed' as const, reason: 'ringcentral_returned_false' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown_error';
      return { channel: 'sms' as const, outcome: 'failed' as const, reason: message.slice(0, 200) };
    }
  })();
  channels.push(smsResult);
  if (smsResult.outcome === 'failed' && !firstError) firstError = `sms: ${smsResult.reason}`;

  return {
    status: combineStatus(emailResult, smsResult),
    channels,
    firstError,
  };
}

// ---------------------------------------------------------------------------
// TEAM ALERT — fired async after the booking row is durable. Separate from
// customer notifications above so a failure in one doesn't affect the other.
//
// Council reco 2026-05-28 (Codex + Gemini unanimous): both channels, async
// after DB write, never block the customer's API response.
// ---------------------------------------------------------------------------

function formatPhone(e164: string): string {
  // +13104280616 → +1 (310) 428-0616
  if (!e164.startsWith('+1') || e164.length !== 12) return e164;
  return `+1 (${e164.slice(2, 5)}) ${e164.slice(5, 8)}-${e164.slice(8)}`;
}

function fmtMoneyCents(cents: number | null | undefined): string {
  if (cents == null) return '—';
  return `$${(cents / 100).toFixed(2)}`;
}

function buildTeamEmailHtml(input: BookingNotificationInput, ctx: TeamAlertContext): string {
  const price = input.quote.totalCents;
  const cost = ctx.supplierCostCents ?? null;
  const margin = (cost != null && price != null) ? (price - cost) : null;
  const date = formatInstallDate(input.install.date);
  const win = formatWindow(input.install.window);
  const locationLine = [
    input.install.city,
    [input.install.state, input.install.zip].filter(Boolean).join(' '),
  ].filter(Boolean).join(', ') || '—';
  const glassLine = [ctx.glassBrand, ctx.glassPartNumber].filter(Boolean).join(' · ') || '—';
  const inventoryLine = ctx.qtyAvailable != null
    ? `${ctx.qtyAvailable} in stock${ctx.estimatedDeliveryDate ? ` · ETA ${formatInstallDate(ctx.estimatedDeliveryDate)}` : ''}`
    : '—';

  const row = (k: string, v: string, bold = false) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-size:13px;width:90px;">${k}</td><td style="padding:4px 0;color:#111827;${bold ? 'font-weight:700;font-size:16px;' : 'font-weight:600;font-size:14px;'}">${v}</td></tr>`;

  return `<!DOCTYPE html>
<html><body style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #111827; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h1 style="margin:0 0 16px 0;font-size:18px;">🚨 New Booking — ${input.bookingToken}</h1>

  <div style="margin-bottom:16px;">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;font-weight:700;margin-bottom:4px;">Customer</div>
    <table style="border-collapse:collapse;">
      ${row('Name:', input.customer.fullName)}
      ${row('Phone:', `<a href="tel:${input.customer.phoneE164}" style="color:#111827;text-decoration:none;">${formatPhone(input.customer.phoneE164)}</a>`)}
      ${row('Email:', input.customer.email ? `<a href="mailto:${input.customer.email}" style="color:#111827;text-decoration:none;">${input.customer.email}</a>` : '—')}
      ${row('Location:', `${input.install.street}<br>${locationLine}`)}
    </table>
  </div>

  <div style="margin-bottom:16px;">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;font-weight:700;margin-bottom:4px;">Vehicle</div>
    <table style="border-collapse:collapse;">
      ${row('Vehicle:', input.quote.vehicleSummary)}
      ${row('Service:', 'Mobile · Replacement')}
    </table>
  </div>

  <div style="margin-bottom:16px;">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;font-weight:700;margin-bottom:4px;">Install</div>
    <table style="border-collapse:collapse;">
      ${row('When:', `${date} · ${win}`)}
    </table>
  </div>

  <div style="border-top:1px solid #e5e7eb;padding-top:16px;margin-bottom:16px;">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;font-weight:700;margin-bottom:4px;">Pricing</div>
    <table style="border-collapse:collapse;">
      ${row('Price:', fmtMoneyCents(price), true)}
      ${row('Glass:', ctx.glassDescription ? `${glassLine}<br><span style="color:#6b7280;font-size:12px;font-weight:400;">${ctx.glassDescription}</span>` : glassLine)}
      ${row('Cost:', fmtMoneyCents(cost))}
      ${row('Margin:', `<span style="color:#15803d;">${fmtMoneyCents(margin)}</span>`)}
      ${row('Inventory:', inventoryLine)}
    </table>
  </div>
</body></html>`;
}

function buildTeamSmsText(input: BookingNotificationInput, ctx: TeamAlertContext): string {
  const date = formatInstallDate(input.install.date);
  const win = input.install.window === 'AM' ? '8a-12p' : '12-5p';
  const price = input.quote.totalCents != null ? `$${Math.round(input.quote.totalCents / 100)}` : '—';
  const loc = [input.install.state, input.install.zip].filter(Boolean).join(' ') || '—';
  const phone = formatPhone(input.customer.phoneE164);
  return `🚨 ${input.bookingToken}: ${input.customer.fullName} | ${input.quote.vehicleSummary} | ${date} ${win} | ${price} | ${loc} | ${phone}`;
}

export interface TeamAlertOutcome {
  status: 'sent' | 'partial' | 'failed' | 'skipped';
  channels: BookingChannelResult[];
}

/**
 * Fire team email + SMS. Never throws. Safe to call without awaiting.
 * Both channels independently report sent/skipped/failed; failures are
 * logged but do not affect each other or the caller.
 *
 * Skipped when:
 *   - email: ADMIN_EMAIL env var not set
 *   - sms:   ADMIN_PHONE env var not set
 */
export async function sendTeamAlert(
  input: BookingNotificationInput,
  ctx: TeamAlertContext
): Promise<TeamAlertOutcome> {
  const channels: BookingChannelResult[] = [];

  // Email
  const emailResult: BookingChannelResult = await (async () => {
    const to = process.env.ADMIN_EMAIL?.trim();
    if (!to) {
      return { channel: 'email' as const, outcome: 'skipped' as const, reason: 'admin_email_unset' };
    }
    try {
      const subjectPrice = input.quote.totalCents != null ? ` · $${Math.round(input.quote.totalCents / 100)}` : '';
      const ok = await sendEmail({
        to,
        subject: `🚨 New Booking — ${input.bookingToken} (${input.customer.fullName} · ${input.quote.vehicleSummary}${subjectPrice})`,
        html: buildTeamEmailHtml(input, ctx),
      });
      return ok
        ? { channel: 'email' as const, outcome: 'sent' as const }
        : { channel: 'email' as const, outcome: 'failed' as const, reason: 'resend_returned_false' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown_error';
      return { channel: 'email' as const, outcome: 'failed' as const, reason: message.slice(0, 200) };
    }
  })();
  channels.push(emailResult);

  // SMS
  const smsResult: BookingChannelResult = await (async () => {
    const to = process.env.ADMIN_PHONE?.trim();
    if (!to) {
      return { channel: 'sms' as const, outcome: 'skipped' as const, reason: 'admin_phone_unset' };
    }
    try {
      const ok = await sendSMS({ to, message: buildTeamSmsText(input, ctx) });
      return ok
        ? { channel: 'sms' as const, outcome: 'sent' as const }
        : { channel: 'sms' as const, outcome: 'failed' as const, reason: 'sms_returned_false' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown_error';
      return { channel: 'sms' as const, outcome: 'failed' as const, reason: message.slice(0, 200) };
    }
  })();
  channels.push(smsResult);

  const e = emailResult.outcome;
  const s = smsResult.outcome;
  const status: TeamAlertOutcome['status'] =
    (e === 'sent' && s === 'sent') ? 'sent' :
    (e === 'skipped' && s === 'skipped') ? 'skipped' :
    (e === 'failed' && s === 'failed') ? 'failed' : 'partial';

  return { status, channels };
}
