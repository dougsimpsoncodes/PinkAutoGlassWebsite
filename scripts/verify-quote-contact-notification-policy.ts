import assert from 'node:assert/strict';

import { getQuoteContactNotificationKind } from '@/lib/quote/contact-notifications';

function run() {
  assert.equal(
    getQuoteContactNotificationKind({
      status: 'ready_exact',
      quote: { totalCents: 31730 },
    }),
    'quote_ready',
    'ready_exact quote with a total should send the customer quote-ready message'
  );

  assert.equal(
    getQuoteContactNotificationKind({
      status: 'ready_estimate',
      quote: { totalCents: 31730 },
    }),
    'quote_ready',
    'priced estimate with a total should send the customer quote-ready message'
  );

  assert.equal(
    getQuoteContactNotificationKind({
      status: 'manual_review',
      quote: { totalCents: null },
    }),
    'manual_review',
    'manual_review status should send manual-review customer and team messages'
  );

  assert.equal(
    getQuoteContactNotificationKind({
      status: 'needs_confirmation',
      quote: { totalCents: null },
    }),
    'manual_review',
    'needs_confirmation status should keep the manual-review notification policy'
  );

  assert.equal(
    getQuoteContactNotificationKind({
      status: 'ready_exact',
      quote: { totalCents: null },
    }),
    'manual_review',
    'missing total should fail closed into manual-review notification policy'
  );

  console.log('Quote contact notification policy checks passed.');
}

run();
