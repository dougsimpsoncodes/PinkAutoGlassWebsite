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
  /**
   * ADAS classification carried from the quote. When 'recommended' we add a
   * Tier-2 ADAS paragraph to the email + a tail to the SMS so the customer
   * is warmed up before the tech raises it at install. 'mandatory' = the
   * $200 was already in the quote total; 'none' = no ADAS mention.
   * Council reco 2026-05-29 (Codex + Gemini): convert first, sell ADAS at install.
   */
  adasTier?: 'mandatory' | 'recommended' | 'none';
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
  const lines = [
    `${COMPANY_NAME}: ${input.customer.fullName}, your install is booked.`,
    `${date}, ${win}.`,
    `Ref ${input.bookingToken}.`,
  ];
  // Tier-2 ADAS tail — warm-up so the tech's at-install conversation
  // isn't a surprise. Adds ~75 chars; TCPA STOP line stays separate.
  if (input.adasTier === 'recommended') {
    lines.push(`Your tech will also walk you through optional ADAS recalibration ($200, recommended).`);
  }
  lines.push(`Call ${CALLBACK_PHONE} for changes.`);
  lines.push(`Reply STOP to opt out.`);
  return lines.join(' ');
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
  ${input.adasTier === 'recommended' ? `
  <div style="margin: 16px 0; padding: 12px 14px; background: #fff7ed; border-left: 3px solid #f97316; border-radius: 4px;">
    <p style="margin: 0 0 6px 0; font-weight: 600; color: #1a1a1a;">About your vehicle's safety features</p>
    <p style="margin: 0; color: #555; font-size: 14px;">Your ${input.quote.vehicleSummary} uses cameras and sensors that work best when recalibrated after a windshield replacement. Your tech will walk you through this option at install — $200, performed in-house in about 30 minutes, no return trip needed. It's your call.</p>
  </div>
  ` : ''}
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
