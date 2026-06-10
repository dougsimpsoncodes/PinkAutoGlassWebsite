/**
 * Unit tests for processHotQuoteFollowups error routing — guards that a
 * TRANSIENT dedup-lookup failure completes the event as retryable 'failed'
 * (so the cron retries up to MAX_ATTEMPTS), while genuine skip reasons
 * still complete as terminal 'skipped'.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processHotQuoteFollowups } from '../hot-quote-followup';
import { completeQuoteNotificationEvent } from '@/lib/quote/notification-events';

vi.mock('@/lib/quote/notification-events', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/quote/notification-events')>();
  return {
    ...actual,
    getQuoteNotificationAdminClient: vi.fn(() => null),
    claimQuoteNotificationEvent: vi.fn(async () => ({ claimed: true, eventId: 'evt-1' })),
    completeQuoteNotificationEvent: vi.fn(async () => {}),
  };
});
vi.mock('@/lib/notifications/email', () => ({ sendEmail: vi.fn(async () => true) }));
vi.mock('@/lib/notifications/sms', () => ({ sendSMS: vi.fn(async () => true) }));

// ── Fake Supabase admin client ────────────────────────────────────────────────
// Chainable thenable builder: every query-builder method records its name and
// returns the proxy; awaiting resolves to a canned response chosen by table
// (and, for automated_quotes, by whether the chain used .neq — which only the
// phone-dedup query does; loadQuote uses .single without .neq).

interface FakeResponses {
  events: { data: unknown; error: unknown };
  quote: { data: unknown; error: unknown };
  booking: { data: unknown; error: unknown };
  dedup: { data: unknown; error: unknown };
}

function createFakeAdmin(responses: FakeResponses) {
  const makeBuilder = (table: string) => {
    const calls: string[] = [];
    const resolveResponse = () => {
      if (table === 'automated_quote_notification_events') return responses.events;
      if (table === 'automated_quote_bookings') return responses.booking;
      if (table === 'automated_quotes') {
        return calls.includes('neq') ? responses.dedup : responses.quote;
      }
      return { data: null, error: null };
    };
    const proxy: Record<string, unknown> = new Proxy({}, {
      get(_target, prop: string) {
        if (prop === 'then') {
          const promise = Promise.resolve(resolveResponse());
          return promise.then.bind(promise);
        }
        return (..._args: unknown[]) => {
          calls.push(prop);
          return proxy;
        };
      },
    });
    return proxy;
  };
  return { from: (table: string) => makeBuilder(table) } as never;
}

const BASE_QUOTE = {
  id: 'q1',
  quote_token: 'tok12345',
  booking_link_token: 'abcdef0123456789',
  lead_id: null,
  first_name: 'Test',
  last_name: 'Customer',
  phone_e164: '+17205551234',
  email: 'test@example.com',
  sms_consent: true,
  status: 'priced',
  is_test: false,
  quote_total_cents: 50000,
  discount_offered_at: null,
  discounted_total_cents: null,
  vehicle_year: 2020,
  vehicle_make: 'Honda',
  vehicle_model: 'Civic',
  vehicle_trim: null,
};

const ONE_PENDING_EVENT = { data: [{ quote_id: 'q1' }], error: null };
const NO_BOOKING = { data: null, error: null };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('processHotQuoteFollowups dedup-lookup failure routing', () => {
  it('completes the event as retryable failed (not skipped) when the dedup lookup errors', async () => {
    const admin = createFakeAdmin({
      events: ONE_PENDING_EVENT,
      quote: { data: BASE_QUOTE, error: null },
      booking: NO_BOOKING,
      dedup: { data: null, error: { message: 'connection reset' } },
    });

    const result = await processHotQuoteFollowups({ admin });

    expect(completeQuoteNotificationEvent).toHaveBeenCalledTimes(1);
    expect(vi.mocked(completeQuoteNotificationEvent).mock.calls[0][0]).toMatchObject({
      eventId: 'evt-1',
      status: 'failed',
      error: 'dedup_lookup_failed',
    });
    expect(result.failed).toBe(1);
    expect(result.skipped).toBe(0);
  });

  it('still completes genuine skip reasons as terminal skipped (test quote)', async () => {
    const admin = createFakeAdmin({
      events: ONE_PENDING_EVENT,
      quote: { data: { ...BASE_QUOTE, is_test: true }, error: null },
      booking: NO_BOOKING,
      dedup: { data: null, error: null },
    });

    const result = await processHotQuoteFollowups({ admin });

    expect(completeQuoteNotificationEvent).toHaveBeenCalledTimes(1);
    expect(vi.mocked(completeQuoteNotificationEvent).mock.calls[0][0]).toMatchObject({
      eventId: 'evt-1',
      status: 'skipped',
      error: 'test_quote',
    });
    expect(result.skipped).toBe(1);
    expect(result.failed).toBe(0);
  });
});
