import { isCustomerSmsEnabled, isExcludedPhone, isTestPhone } from '@/lib/constants';
import { sendEmail, sendAdminAlertEmail } from '@/lib/notifications/email';
import { sendSMS, sendAdminSMS } from '@/lib/notifications/sms';
import { centsToDollars } from '@/lib/quote/pricing';
import { shortQuoteToken } from '@/lib/quote/leadSync';
import {
  boolToChannelStatus,
  claimQuoteNotificationEvent,
  combineEventStatus,
  completeQuoteNotificationEvent,
  scheduleQuoteNotificationEvent,
  shouldSendNotificationChannel,
  type ChannelStatus,
} from '@/lib/quote/notification-events';

const CALLBACK_PHONE = '(720) 918-7465';

export interface QuoteContactNotificationInput {
  quoteId: string;
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
  location?: {
    state?: string | null;
    zip?: string | null;
  };
  quote: {
    totalCents?: number | null;
    bookingLinkToken?: string | null;
    selectedBrand?: string | null;
    partDescription?: string | null;
    nagsNumber?: string | null;
    supplierCostCents?: number | null;
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
  if (input.hadLeadBeforeContact && kind === 'manual_review') {
    return { kind, skipped: true, reason: 'contact_already_linked' };
  }

  if (kind === 'manual_review') {
    const claim = await claimQuoteNotificationEvent({
      quoteId: input.quoteId,
      eventType: 'manual_review',
      metadata: { quoteToken: input.quoteToken, leadId: input.leadId },
    });
    if (!claim.claimed || !claim.eventId) {
      return { kind, skipped: true, reason: claim.reason ?? 'manual_review_event_not_claimed' };
    }

    // allSettled: a thrown send must not leave the event stuck in 'processing'.
    const settled = await Promise.allSettled([
      shouldSendNotificationChannel(claim.priorChannels, 'teamEmail') ? sendManualReviewTeamEmail(input) : Promise.resolve(true),
      shouldSendNotificationChannel(claim.priorChannels, 'teamSms') ? sendManualReviewTeamSms(input) : Promise.resolve(true),
      shouldSendNotificationChannel(claim.priorChannels, 'customerEmail') ? sendManualReviewCustomerEmail(input) : Promise.resolve(true),
      shouldSendNotificationChannel(claim.priorChannels, 'customerSms') ? sendManualReviewCustomerSms(input) : Promise.resolve(true),
    ]);
    const [teamEmail, teamSms, customerEmail, customerSms] = settled.map(
      (entry) => entry.status === 'fulfilled' ? entry.value : false
    );
    const channels = {
      teamEmail: channelStatusFromAttempt(claim.priorChannels?.teamEmail, true, teamEmail),
      teamSms: channelStatusFromAttempt(claim.priorChannels?.teamSms, true, teamSms),
      customerEmail: channelStatusFromAttempt(claim.priorChannels?.customerEmail, Boolean(input.customer.email), customerEmail),
      customerSms: channelStatusFromAttempt(claim.priorChannels?.customerSms, input.customer.smsConsent && isCustomerSmsEnabled(), customerSms),
    };
    const eventStatus = combineEventStatus(channels);
    await completeQuoteNotificationEvent({
      eventId: claim.eventId,
      status: eventStatus,
      channels,
      metadata: { quoteToken: input.quoteToken, leadId: input.leadId },
    });
    return { kind, skipped: false };
  }

  const claim = await claimQuoteNotificationEvent({
    quoteId: input.quoteId,
    eventType: 'quote_ready',
    metadata: { quoteToken: input.quoteToken, leadId: input.leadId },
  });
  if (!claim.claimed || !claim.eventId) {
    return { kind, skipped: true, reason: claim.reason ?? 'quote_ready_event_not_claimed' };
  }

  // allSettled: a thrown send must not leave the event stuck in 'processing'.
  const settled = await Promise.allSettled([
    shouldSendNotificationChannel(claim.priorChannels, 'teamEmail') ? sendQuoteReadyTeamEmail(input) : Promise.resolve(true),
    shouldSendNotificationChannel(claim.priorChannels, 'teamSms') ? sendQuoteReadyTeamSms(input) : Promise.resolve(true),
    shouldSendNotificationChannel(claim.priorChannels, 'customerEmail') ? sendQuoteReadyCustomerEmail(input) : Promise.resolve(true),
    shouldSendNotificationChannel(claim.priorChannels, 'customerSms') ? sendQuoteReadyCustomerSms(input) : Promise.resolve(true),
  ]);
  const [teamEmail, teamSms, customerEmail, customerSms] = settled.map(
    (entry) => entry.status === 'fulfilled' ? entry.value : false
  );
  const channels = {
    teamEmail: channelStatusFromAttempt(claim.priorChannels?.teamEmail, true, teamEmail),
    teamSms: channelStatusFromAttempt(claim.priorChannels?.teamSms, true, teamSms),
    customerEmail: channelStatusFromAttempt(claim.priorChannels?.customerEmail, Boolean(input.customer.email), customerEmail),
    customerSms: channelStatusFromAttempt(claim.priorChannels?.customerSms, input.customer.smsConsent && isCustomerSmsEnabled(), customerSms),
  };
  const eventStatus = combineEventStatus(channels);
  await completeQuoteNotificationEvent({
    eventId: claim.eventId,
    status: eventStatus,
    channels,
    metadata: { quoteToken: input.quoteToken, leadId: input.leadId },
  });

  // Discount rescue fires only when the CUSTOMER actually received the quote —
  // a team-only success means the customer never saw a price to discount.
  if (channels.customerEmail === 'sent' || channels.customerSms === 'sent') {
    await scheduleQuoteNotificationEvent({
      quoteId: input.quoteId,
      eventType: 'quote_unbooked_15m_discount',
      scheduledFor: new Date(Date.now() + 15 * 60 * 1000),
      metadata: { quoteToken: input.quoteToken, leadId: input.leadId },
    });
  }
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

function locationSummary(input: QuoteContactNotificationInput): string {
  return [input.location?.state, input.location?.zip].filter(Boolean).join(' ') || 'Location not captured';
}

function quoteRef(input: QuoteContactNotificationInput): string {
  return shortQuoteToken(input.quoteToken);
}

function channelStatusFromAttempt(prior: ChannelStatus | undefined, eligible: boolean, ok: boolean): ChannelStatus {
  if (prior === 'sent') return 'sent';
  if (!eligible) return 'skipped';
  return boolToChannelStatus(ok);
}

async function sendQuoteReadyTeamEmail(input: QuoteContactNotificationInput): Promise<boolean> {
  const ref = quoteRef(input);
  const vehicle = vehicleSummary(input);
  const price = formatQuotePrice(input);
  return sendAdminAlertEmail(
    `Hot Quote Ready - ${ref}: ${customerName(input)} - ${price}`,
    `<!DOCTYPE html>
<html><body style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
  <h2>Hot Quote Ready</h2>
  <p>A customer received an installed price from the auto-quoter. Follow up while the quote is fresh.</p>
  <p><strong>Reference:</strong> ${escapeHtml(ref)}</p>
  <p><strong>Price:</strong> ${escapeHtml(price)}</p>
  <p><strong>Customer:</strong> ${escapeHtml(customerName(input))}</p>
  <p><strong>Phone:</strong> ${escapeHtml(input.customer.phoneE164)}</p>
  ${input.customer.email ? `<p><strong>Email:</strong> ${escapeHtml(input.customer.email)}</p>` : ''}
  <p><strong>Vehicle:</strong> ${escapeHtml(vehicle)}</p>
  <p><strong>Location:</strong> ${escapeHtml(locationSummary(input))}</p>
  ${input.vehicle.vin ? `<p><strong>VIN:</strong> ${escapeHtml(input.vehicle.vin)}</p>` : ''}
  ${input.quote.nagsNumber ? `<p><strong>Part (NAGS):</strong> ${escapeHtml(input.quote.nagsNumber)}${input.quote.selectedBrand ? ` — ${escapeHtml(input.quote.selectedBrand)}` : ''}</p>` : ''}
  ${input.quote.partDescription ? `<p><strong>Part description:</strong> ${escapeHtml(input.quote.partDescription)}</p>` : ''}
  ${input.quote.supplierCostCents ? `<p><strong>Supplier cost:</strong> $${centsToDollars(input.quote.supplierCostCents).toFixed(2)}</p>` : ''}
  <p><strong>Lead ID:</strong> ${escapeHtml(input.leadId)}</p>
</body></html>`,
  );
}

async function sendQuoteReadyTeamSms(input: QuoteContactNotificationInput): Promise<boolean> {
  const ref = quoteRef(input);
  return sendAdminSMS(
    `Hot quote ${ref}: ${customerName(input)} | ${input.customer.phoneE164} | ${vehicleSummary(input)} | ${formatQuotePrice(input)} | ${locationSummary(input)}`
  );
}

async function sendQuoteReadyCustomerEmail(input: QuoteContactNotificationInput): Promise<boolean> {
  if (!input.customer.email) return false;
  const price = formatQuotePrice(input);
  const ref = quoteRef(input);
  const firstName = escapeHtml(input.customer.firstName);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pinkautoglass.com';
  const bookingUrl = input.quote.bookingLinkToken ? `${siteUrl}/quote/book/${input.quote.bookingLinkToken}` : null;
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
  ${bookingUrl ? `<p style="margin: 24px 0;">
    <a href="${bookingUrl}" style="background: #ec4899; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Schedule your installation</a>
  </p>
  <p>Or call us at <strong>${CALLBACK_PHONE}</strong> if you have questions or would like help booking.</p>` : `<p>You can schedule your appointment online, or call us at <strong>${CALLBACK_PHONE}</strong> if you have questions or would like help booking.</p>`}
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
