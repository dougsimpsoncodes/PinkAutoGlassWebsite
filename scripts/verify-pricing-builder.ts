#!/usr/bin/env -S npx tsx
/**
 * Guard for the customer-facing pricing builder (buildCashWindshieldQuote).
 *
 * Locks the $299 minimum total floor that Doug locked on 2026-05-28 after
 * a 2003 Jeep Grand Cherokee priced at $273.08. Floor logic: any quote
 * whose computed total falls below QUOTE_MIN_TOTAL_CENTS gets the
 * windshield+install line silently inflated so the customer-facing total
 * equals the floor. Calibration is included in the total, so ADAS
 * vehicles almost never hit the floor in practice.
 *
 * Markup math is unchanged and stays in scripts/verify-pricing-markup.ts.
 *
 * Usage:
 *   npx tsx scripts/verify-pricing-builder.ts
 */

import { buildCashWindshieldQuote } from '../src/lib/quote/pricing';

let failures = 0;
function assert(condition: boolean, label: string, detail?: string) {
  if (!condition) {
    failures += 1;
    console.error(`✗ ${label}${detail ? ': ' + detail : ''}`);
  }
}

// 1) Below-floor non-ADAS quote inflates to $299.
//    Real case: 2003 Jeep Grand Cherokee that drove the rule.
{
  const result = buildCashWindshieldQuote({
    wholesaleCents: 7308,        // $73.08 wholesale
    markupCents: 20000,          // $200 standard markup
    minTotalCents: 29900,        // $299 floor
  });
  assert(result.totalCents === 29900, 'Below-floor non-ADAS quote inflates to floor',
    `got ${result.totalCents} cents`);
  assert(result.lineItems[0].amountCents === 29900, 'Windshield line equals floor when no calibration',
    `got ${result.lineItems[0].amountCents}`);
  const meta = result.lineItems[0].metadata as Record<string, unknown> | undefined;
  assert(meta?.floorAdjustmentCents === 2592, 'Floor adjustment recorded in metadata',
    `got ${JSON.stringify(meta)}`);
  assert(
    result.confidenceReasons.some(r => r.startsWith('minimum_total_floor_applied_')),
    'Floor reason emitted on confidence_reasons'
  );
}

// 2) Below-floor quote with calibration: total is windshield + cal, floor
//    only kicks if (windshield + cal) < floor.
{
  // $50 wholesale + $200 markup = $250 windshield; + $200 calibration = $450 total. No floor.
  const result = buildCashWindshieldQuote({
    wholesaleCents: 5000,
    markupCents: 20000,
    calibrationCents: 20000,
    minTotalCents: 29900,
  });
  assert(result.totalCents === 45000, 'ADAS-equipped quote NOT floored when total > $299',
    `got ${result.totalCents}`);
  assert(
    !result.confidenceReasons.some(r => r.startsWith('minimum_total_floor_applied_')),
    'No floor reason when no adjustment needed'
  );
}

// 3) Edge case: extremely cheap ADAS vehicle where windshield+cal IS below floor.
//    $20 + $200 markup = $220 windshield + $50 cal (hypothetical low) = $270 total → floor.
{
  const result = buildCashWindshieldQuote({
    wholesaleCents: 2000,
    markupCents: 20000,
    calibrationCents: 5000,
    minTotalCents: 29900,
  });
  assert(result.totalCents === 29900, 'Cheap ADAS quote also floored', `got ${result.totalCents}`);
  // Windshield line absorbs the adjustment, calibration stays at $50
  assert(result.lineItems[1].amountCents === 5000, 'Calibration line unchanged by floor',
    `got ${result.lineItems[1].amountCents}`);
}

// 4) Quote already at the floor → no change.
{
  const result = buildCashWindshieldQuote({
    wholesaleCents: 9900,
    markupCents: 20000,         // $99 + $200 = $299 exactly
    minTotalCents: 29900,
  });
  assert(result.totalCents === 29900, 'Quote exactly at floor stays at floor');
  const meta = result.lineItems[0].metadata as Record<string, unknown> | undefined;
  assert(!meta || meta.floorAdjustmentCents === undefined, 'No floor metadata when no adjustment');
  assert(
    !result.confidenceReasons.some(r => r.startsWith('minimum_total_floor_applied_')),
    'No floor reason when quote already at floor'
  );
}

// 5) Quote above floor → no change (normal case).
{
  // 2022 Honda Accord case: ~$345 windshield, no ADAS, $345 total.
  const result = buildCashWindshieldQuote({
    wholesaleCents: 14500,
    markupCents: 20000,
    minTotalCents: 29900,
  });
  assert(result.totalCents === 34500, 'Above-floor quote unchanged', `got ${result.totalCents}`);
}

// 6) minTotalCents = 0 (disabled) → never floors.
{
  const result = buildCashWindshieldQuote({
    wholesaleCents: 1000,
    markupCents: 1000,         // $20 total
    minTotalCents: 0,
  });
  assert(result.totalCents === 2000, 'Floor of 0 disables the rule');
}

// 7) minTotalCents undefined → never floors (back-compat with callers that
//    forget to pass it).
{
  const result = buildCashWindshieldQuote({
    wholesaleCents: 1000,
    markupCents: 1000,
  });
  assert(result.totalCents === 2000, 'Missing minTotalCents disables the floor');
}

// 8) Floor preserves status as ready_exact (not estimate or manual review).
{
  const result = buildCashWindshieldQuote({
    wholesaleCents: 7308,
    markupCents: 20000,
    minTotalCents: 29900,
  });
  assert(result.status === 'ready_exact', 'Floor adjustment does not change status from ready_exact');
}

if (failures > 0) {
  console.error(`\n${failures} pricing-builder assertion(s) failed.`);
  process.exit(1);
}
console.log('[pricing-builder] Floor guard passed.');
