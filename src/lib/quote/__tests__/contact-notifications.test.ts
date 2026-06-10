/**
 * Unit tests for sendQuoteContactNotifications event recording — guards that
 * the manual_review path is tracked through the notification-event system
 * (claim → send → complete with per-channel statuses) the same way
 * quote_ready is, instead of fire-and-forget with no delivery record.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendQuoteContactNotifications, type QuoteContactNotificationInput } from '../contact-notifications';
import {
  claimQuoteNotificationEvent,
  completeQuoteNotificationEvent,
  scheduleQuoteNotificationEvent,
} from '@/lib/quote/notification-events';

vi.mock('@/lib/quote/notification-events', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/quote/notification-events')>();
  return {
    ...actual,
    claimQuoteNotificationEvent: vi.fn(async () => ({ claimed: true, eventId: 'evt-1' })),
    completeQuoteNotificationEvent: vi.fn(async () => {}),
    scheduleQuoteNotificationEvent: vi.fn(async () => {}),
  };
});
vi.mock('@/lib/notifications/email', () => ({
  sendEmail: vi.fn(async () => true),
  sendAdminAlertEmail: vi.fn(async () => true),
}));
vi.mock('@/lib/notifications/sms', () => ({
  sendSMS: vi.fn(async () => true),
  sendAdminSMS: vi.fn(async () => true),
}));
vi.mock('@/lib/constants', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/constants')>();
  return { ...actual, isCustomerSmsEnabled: vi.fn(() => true), isExcludedPhone: vi.fn(() => false), isTestPhone: vi.fn(() => false) };
});

function makeInput(overrides: Partial<QuoteContactNotificationInput> = {}): QuoteContactNotificationInput {
  return {
    quoteId: 'q1',
    quoteToken: 'tok-12345678',
    status: 'manual_review',
    leadId: 'lead-1',
    hadLeadBeforeContact: false,
    isTest: false,
    customer: {
      firstName: 'Tim',
      lastName: 'Rendall',
      phoneE164: '+18475551234',
      email: 'tim@example.com',
      smsConsent: true,
    },
    vehicle: { year: 2026, make: 'Hyundai', model: 'Ioniq 5' },
    location: { state: 'CO', zip: '80202' },
    quote: { totalCents: null },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  // mockReset also drops any unconsumed mockResolvedValueOnce queued by a
  // prior test (clearAllMocks does not), so tests can't leak claim results.
  vi.mocked(claimQuoteNotificationEvent).mockReset();
  vi.mocked(claimQuoteNotificationEvent).mockResolvedValue({ claimed: true, eventId: 'evt-1' });
});

describe('sendQuoteContactNotifications manual_review event recording', () => {
  it('claims and completes a manual_review event with per-channel statuses', async () => {
    const outcome = await sendQuoteContactNotifications(makeInput());

    expect(outcome.kind).toBe('manual_review');
    expect(outcome.skipped).toBe(false);

    expect(claimQuoteNotificationEvent).toHaveBeenCalledTimes(1);
    expect(vi.mocked(claimQuoteNotificationEvent).mock.calls[0][0]).toMatchObject({
      quoteId: 'q1',
      eventType: 'manual_review',
    });

    expect(completeQuoteNotificationEvent).toHaveBeenCalledTimes(1);
    expect(vi.mocked(completeQuoteNotificationEvent).mock.calls[0][0]).toMatchObject({
      eventId: 'evt-1',
      status: 'sent',
      channels: {
        teamEmail: 'sent',
        teamSms: 'sent',
        customerEmail: 'sent',
        customerSms: 'sent',
      },
    });
  });

  it('does not schedule a discount followup for manual_review quotes', async () => {
    await sendQuoteContactNotifications(makeInput());
    expect(scheduleQuoteNotificationEvent).not.toHaveBeenCalled();
  });

  it('skips sends entirely when the manual_review event is not claimed (idempotency)', async () => {
    vi.mocked(claimQuoteNotificationEvent).mockResolvedValueOnce({ claimed: false, reason: 'already_processed' });
    const { sendSMS } = await import('@/lib/notifications/sms');
    const { sendEmail, sendAdminAlertEmail } = await import('@/lib/notifications/email');

    const outcome = await sendQuoteContactNotifications(makeInput());

    expect(outcome.skipped).toBe(true);
    expect(sendSMS).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
    expect(sendAdminAlertEmail).not.toHaveBeenCalled();
    expect(completeQuoteNotificationEvent).not.toHaveBeenCalled();
  });

  it('still schedules the 15m discount followup on the quote_ready path (regression guard)', async () => {
    await sendQuoteContactNotifications(makeInput({ status: 'ready_exact', quote: { totalCents: 42000, bookingLinkToken: 'abcdef0123456789' } }));

    expect(vi.mocked(claimQuoteNotificationEvent).mock.calls[0][0]).toMatchObject({ eventType: 'quote_ready' });
    expect(scheduleQuoteNotificationEvent).toHaveBeenCalledTimes(1);
    expect(vi.mocked(scheduleQuoteNotificationEvent).mock.calls[0][0]).toMatchObject({ eventType: 'quote_unbooked_15m_discount' });
  });
});
