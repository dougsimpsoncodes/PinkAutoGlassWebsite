import { isCustomerSmsEnabled, isExcludedPhone, isTestPhone } from '@/lib/constants';
import { sendEmail, sendAdminAlertEmail } from '@/lib/notifications/email';
import { sendSMS, sendAdminSMS } from '@/lib/notifications/sms';
import { centsToDollars } from '@/lib/quote/pricing';
import { shortQuoteToken } from '@/lib/quote/leadSync';

const CALLBACK_PHONE = '(720) 918-7465';

export interface QuoteContactNotificationInput {
  quoteToken: string;
  status: string;
  leadId: string;
  hadLeadBeforeContact: boolean;
  isTest: boolean;
  customer: {
    firstName: string;
    lastName?: string;
    phoneE164: string;
    email?: string | null;
    smsConsent: boolean;
  };
  vehicle: {
    year?: number | null;
    make?: string | null;
    model?: string | null;
    trim?: string | null;
    vin?: string | null;
  };
  quote: {
    totalCents?: number | null;
  };
}

export type QuoteContactNotificationKind = 'quote_ready' | 'manual_review';

export interface QuoteContactNotificationOutcome {
  kind: QuoteContactNotificationKind;
  skipped: boolean;
  reason?: string;
}

export function getQuoteContactNotificationKind(input: Pick<QuoteContactNotificationInput, 'status' | 'quote'>): QuoteContactNotificationKind {
  const normalized = input.status.toLowerCase();
  if (normalized === 'manual_review' || normalized === 'needs_confirmation' || !input.quote.totalCents) {
    return 'manual_review';
  }
  return 'quote_ready';
}

export async function sendQuoteContactNotifications(input: QuoteContactNotificationInput): Promise<QuoteContactNotificationOutcome> {
  const kind = getQuoteContactNotificationKind(input);

  if (input.isTest || isExcludedPhone(input.customer.phoneE164) || isTestPhone(input.customer.phoneE164)) {
    return { kind, skipped: true, reason: 'test_or_internal_contact' };
  }
  if (input.hadLeadBeforeContact) {
    return { kind, skipped: true, reason: 'contact_already_linked' };
  }

  if (kind === 'manual_review') {
    await Promise.allSettled([
      sendManualReviewTeamEmail(input),
      sendManualReviewTeamSms(input),
      sendManualReviewCustomerEmail(input),
      sendManualReviewCustomerSms(input),
    ]);
    return { kind, skipped: false };
  }

  await Promise.allSettled([
    sendQuoteReadyCustomerEmail(input),
    sendQuoteReadyCustomerSms(input),
  ]);
  return { kind, skipped: false };
}

function vehicleSummary(input: QuoteContactNotificationInput): string {
  return [
    input.vehicle.year,
    input.vehicle.make,
    input.vehicle.model,
    input.vehicle.trim,
  ].filter(Boolean).join(' ') || 'Vehicle details captured';
}

function customerName(input: QuoteContactNotificationInput): string {
  return [input.customer.firstName, input.customer.lastName].filter(Boolean).join(' ') || input.customer.firstName;
}

function formatQuotePrice(input: QuoteContactNotificationInput): string {
  return input.quote.totalCents ? `$${centsToDollars(input.quote.totalCents).toFixed(2)}` : 'confirmation needed';
}

function quoteRef(input: QuoteContactNotificationInput): string {
  return shortQuoteToken(input.quoteToken);
}

async function sendQuoteReadyCustomerEmail(input: QuoteContactNotificationInput): Promise<boolean> {
  if (!input.customer.email) return false;
  const price = formatQuotePrice(input);
  const ref = quoteRef(input);
  const firstName = escapeHtml(input.customer.firstName);
  return sendEmail({
    to: input.customer.email,
    subject: 'Your Pink Auto Glass quote is ready',
    leadId: input.leadId,
    html: `<!DOCTYPE html>
<html><body style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h1 style="color: #ec4899; margin: 0 0 16px 0;">Your installed price is ready</h1>
  <p>Hi ${firstName},</p>
  <p>Thanks for requesting a quote from Pink Auto Glass. We received your information and your installed price is <strong>${escapeHtml(price)}</strong>.</p>
  <p>Mobile service is included. Sales tax may be collected at installation.</p>
  <p>You can schedule your appointment online, or call us at <strong>${CALLBACK_PHONE}</strong> if you have questions or would like help booking.</p>
  <p>Reference: <strong>${escapeHtml(ref)}</strong></p>
  <p>Thanks,<br>Pink Auto Glass</p>
</body></html>`,
  });
}

async function sendQuoteReadyCustomerSms(input: QuoteContactNotificationInput): Promise<boolean> {
  if (!input.customer.smsConsent || !isCustomerSmsEnabled()) return false;
  const price = formatQuotePrice(input);
  return sendSMS({
    to: input.customer.phoneE164,
    message: `Pink Auto Glass: your installed price is ${price}. You can book online or call ${CALLBACK_PHONE} for help. Ref ${quoteRef(input)}. Reply STOP to opt out.`,
  });
}

async function sendManualReviewCustomerEmail(input: QuoteContactNotificationInput): Promise<boolean> {
  if (!input.customer.email) return false;
  const ref = quoteRef(input);
  const firstName = escapeHtml(input.customer.firstName);
  return sendEmail({
    to: input.customer.email,
    subject: 'Pink Auto Glass: quick follow-up needed for your quote',
    leadId: input.leadId,
    html: `<!DOCTYPE html>
<html><body style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h1 style="color: #ec4899; margin: 0 0 16px 0;">We received your quote request</h1>
  <p>Hi ${firstName},</p>
  <p>Thanks for requesting a quote from Pink Auto Glass. We found your vehicle, but some glass options require confirmation before we can give you an accurate installed price.</p>
  <p>Please call us at <strong>${CALLBACK_PHONE}</strong> when you have a minute. We would like to confirm a few details and help you get the right quote.</p>
  <p>Reference: <strong>${escapeHtml(ref)}</strong></p>
  <p>Thanks,<br>Pink Auto Glass</p>
</body></html>`,
  });
}

async function sendManualReviewCustomerSms(input: QuoteContactNotificationInput): Promise<boolean> {
  if (!input.customer.smsConsent || !isCustomerSmsEnabled()) return false;
  return sendSMS({
    to: input.customer.phoneE164,
    message: `Pink Auto Glass: we received your quote request, but need to confirm a few glass details before giving an accurate price. Please call ${CALLBACK_PHONE}. Ref ${quoteRef(input)}. Reply STOP to opt out.`,
  });
}

async function sendManualReviewTeamEmail(input: QuoteContactNotificationInput): Promise<boolean> {
  const ref = quoteRef(input);
  const vehicle = vehicleSummary(input);
  return sendAdminAlertEmail(
    `Manual Review Needed - Auto Quote ${ref}: ${customerName(input)}`,
    `<!DOCTYPE html>
<html><body style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
  <h2>Manual Review Needed</h2>
  <p>A customer requested an auto quote, but the glass options need confirmation before an accurate installed price can be shown.</p>
  <p><strong>Reference:</strong> ${escapeHtml(ref)}</p>
  <p><strong>Customer:</strong> ${escapeHtml(customerName(input))}</p>
  <p><strong>Phone:</strong> ${escapeHtml(input.customer.phoneE164)}</p>
  ${input.customer.email ? `<p><strong>Email:</strong> ${escapeHtml(input.customer.email)}</p>` : ''}
  <p><strong>Vehicle:</strong> ${escapeHtml(vehicle)}</p>
  ${input.vehicle.vin ? `<p><strong>VIN:</strong> ${escapeHtml(input.vehicle.vin)}</p>` : ''}
  <p><strong>Lead ID:</strong> ${escapeHtml(input.leadId)}</p>
</body></html>`,
  );
}

async function sendManualReviewTeamSms(input: QuoteContactNotificationInput): Promise<boolean> {
  const ref = quoteRef(input);
  return sendAdminSMS(
    `Manual review ${ref}: ${customerName(input)} | ${input.customer.phoneE164} | ${vehicleSummary(input)}`
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
