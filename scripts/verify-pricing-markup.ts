#!/usr/bin/env -S npx tsx
/**
 * Guard for the auto-quoter markup engine.
 *
 * Locks down the pricing rules Dan signed off on during the 2026-05-27
 * walkthrough. Any change to the tier breakpoints, threshold bands, or
 * adders has to update this file in the same commit — that's intentional,
 * the rule set is now a business contract.
 *
 * Usage:
 *   npx tsx scripts/verify-pricing-markup.ts
 */

import {
  calculateMarkup,
  detectHudFromFeatures,
  type MarkupInput,
  type MarkupResult,
} from '../src/lib/quote/markup';

interface PricedCase {
  name: string;
  input: MarkupInput;
  expectedMarkupCents: number;
}

interface ManualReviewCase {
  name: string;
  input: MarkupInput;
}

const PRICED_CASES: PricedCase[] = [
  // Baseline non-luxury, low wholesale
  {
    name: 'Honda Accord $189 wholesale, no HUD → base $200 markup',
    input: { make: 'Honda', model: 'Accord', wholesaleCents: 18_900, hasHud: false },
    expectedMarkupCents: 20_000,
  },
  // Brand tier wins over threshold
  {
    name: 'Audi A4 $189 wholesale → Tier 1 $300 wins over threshold $200',
    input: { make: 'Audi', model: 'A4', wholesaleCents: 18_900, hasHud: false },
    expectedMarkupCents: 30_000,
  },
  // Threshold wins over brand tier
  {
    name: 'Audi Q7 $700 wholesale → threshold $400 wins over Tier 1 $300',
    input: { make: 'Audi', model: 'Q7', wholesaleCents: 70_000, hasHud: false },
    expectedMarkupCents: 40_000,
  },
  // Tier 2 brand
  {
    name: 'Tesla Model 3 $400 wholesale → Tier 2 $400 wins over threshold $300',
    input: { make: 'Tesla', model: 'Model 3', wholesaleCents: 40_000, hasHud: false },
    expectedMarkupCents: 40_000,
  },
  {
    name: 'Tesla Model Y $700 wholesale → Tier 2 ties threshold at $400',
    input: { make: 'Tesla', model: 'Model Y', wholesaleCents: 70_000, hasHud: false },
    expectedMarkupCents: 40_000,
  },
  // Threshold bands (non-luxury)
  {
    name: '$249 wholesale → threshold band 0 ($200)',
    input: { make: 'Toyota', model: 'Camry', wholesaleCents: 24_900, hasHud: false },
    expectedMarkupCents: 20_000,
  },
  {
    name: '$250 wholesale → threshold band 1 ($250)',
    input: { make: 'Toyota', model: 'Camry', wholesaleCents: 25_000, hasHud: false },
    expectedMarkupCents: 25_000,
  },
  {
    name: '$399 wholesale → threshold band 1 ($250)',
    input: { make: 'Toyota', model: 'Camry', wholesaleCents: 39_900, hasHud: false },
    expectedMarkupCents: 25_000,
  },
  {
    name: '$400 wholesale → threshold band 2 ($300)',
    input: { make: 'Toyota', model: 'Camry', wholesaleCents: 40_000, hasHud: false },
    expectedMarkupCents: 30_000,
  },
  {
    name: '$599 wholesale → threshold band 2 ($300)',
    input: { make: 'Toyota', model: 'Camry', wholesaleCents: 59_900, hasHud: false },
    expectedMarkupCents: 30_000,
  },
  {
    name: '$600 wholesale → threshold band 3 ($400)',
    input: { make: 'Toyota', model: 'Camry', wholesaleCents: 60_000, hasHud: false },
    expectedMarkupCents: 40_000,
  },
  {
    name: '$1500 wholesale → threshold band 3 ($400)',
    input: { make: 'Toyota', model: 'Camry', wholesaleCents: 150_000, hasHud: false },
    expectedMarkupCents: 40_000,
  },
  // HUD adder on non-luxury
  {
    name: 'Honda Pilot HUD $450 wholesale → threshold $300 + HUD $75 = $375',
    input: { make: 'Honda', model: 'Pilot', wholesaleCents: 45_000, hasHud: true },
    expectedMarkupCents: 37_500,
  },
  // HUD adder on Tier 1 (brand=threshold case)
  {
    name: 'Audi Q7 HUD $450 wholesale → max($300, $300) + HUD $75 = $375',
    input: { make: 'Audi', model: 'Q7', wholesaleCents: 45_000, hasHud: true },
    expectedMarkupCents: 37_500,
  },
  // Heavy-duty adder
  {
    name: 'Ford F-250 $300 wholesale → threshold $250 + HD $100 = $350',
    input: { make: 'Ford', model: 'F-250 XLT', wholesaleCents: 30_000, hasHud: false },
    expectedMarkupCents: 35_000,
  },
  {
    name: 'Mercedes Sprinter $400 wholesale → Tier 1 $300 + HD $100 = $400',
    input: { make: 'Mercedes-Benz', model: 'Sprinter 2500', wholesaleCents: 40_000, hasHud: false },
    expectedMarkupCents: 40_000,
  },
  {
    name: 'Ram 3500 $300 wholesale → threshold $250 + HD $100 = $350',
    input: { make: 'Ram', model: 'Ram 3500', wholesaleCents: 30_000, hasHud: false },
    expectedMarkupCents: 35_000,
  },
  {
    name: 'Ford Transit $250 wholesale → threshold $250 + HD $100 = $350',
    input: { make: 'Ford', model: 'Transit 250', wholesaleCents: 25_000, hasHud: false },
    expectedMarkupCents: 35_000,
  },
  // Light truck — no adder (volume play)
  {
    name: 'Ford F-150 $300 wholesale → threshold $250, no HD adder',
    input: { make: 'Ford', model: 'F-150 Lariat', wholesaleCents: 30_000, hasHud: false },
    expectedMarkupCents: 25_000,
  },
  // Combined stack: Tier 1 + HD + HUD
  {
    name: 'Cadillac Escalade HUD $700 wholesale → threshold $400 + HUD $75 = $475 (Escalade not in HD list)',
    input: { make: 'Cadillac', model: 'Escalade', wholesaleCents: 70_000, hasHud: true },
    expectedMarkupCents: 47_500,
  },
  // Brand normalization
  {
    name: 'Lowercase make "audi" resolves to Tier 1',
    input: { make: 'audi', model: 'A4', wholesaleCents: 18_900, hasHud: false },
    expectedMarkupCents: 30_000,
  },
  {
    name: 'Land Rover with space resolves to Tier 2',
    input: { make: 'Land Rover', model: 'Defender', wholesaleCents: 18_900, hasHud: false },
    expectedMarkupCents: 40_000,
  },
];

const MANUAL_REVIEW_CASES: ManualReviewCase[] = [
  { name: 'Bentley → exotic_brand', input: { make: 'Bentley', model: 'Continental GT', wholesaleCents: 250_000, hasHud: false } },
  { name: 'Rolls-Royce → exotic_brand', input: { make: 'Rolls-Royce', model: 'Ghost', wholesaleCents: 250_000, hasHud: false } },
  { name: 'Lucid → exotic_brand', input: { make: 'Lucid', model: 'Air', wholesaleCents: 80_000, hasHud: false } },
  { name: 'Polestar → exotic_brand', input: { make: 'Polestar', model: '2', wholesaleCents: 35_000, hasHud: false } },
  { name: 'Aston Martin → exotic_brand', input: { make: 'Aston Martin', model: 'DB11', wholesaleCents: 250_000, hasHud: false } },
];

function assertPriced(c: PricedCase, result: MarkupResult): void {
  if (result.kind !== 'priced') {
    throw new Error(`${c.name}: expected priced, got ${result.kind}`);
  }
  if (result.markupCents !== c.expectedMarkupCents) {
    throw new Error(
      `${c.name}: expected ${c.expectedMarkupCents}, got ${result.markupCents} (reasons: ${result.reasons.join(',')})`
    );
  }
}

function assertManualReview(c: ManualReviewCase, result: MarkupResult): void {
  if (result.kind !== 'manual_review') {
    throw new Error(`${c.name}: expected manual_review, got ${result.kind}`);
  }
}

function assertHudDetection(): void {
  const cases: Array<{ input: Array<{ name: string }> | undefined; expected: boolean; label: string }> = [
    { input: [{ name: 'Heads Up Display' }], expected: true, label: 'Heads Up Display' },
    { input: [{ name: 'Heads-Up Display' }], expected: true, label: 'Heads-Up Display' },
    { input: [{ name: 'Head Up Display' }], expected: true, label: 'Head Up Display' },
    { input: [{ name: 'HUD' }], expected: true, label: 'HUD' },
    { input: [{ name: 'hud' }], expected: true, label: 'hud (lowercase)' },
    { input: [{ name: 'Lane Departure Warning' }], expected: false, label: 'Lane Departure Warning' },
    { input: [{ name: 'Rain Sensor' }, { name: 'Heads-Up Display' }], expected: true, label: 'mixed features w/ HUD' },
    { input: [], expected: false, label: 'empty features' },
    { input: undefined, expected: false, label: 'undefined features' },
  ];

  for (const c of cases) {
    const got = detectHudFromFeatures(c.input);
    if (got !== c.expected) {
      throw new Error(`HUD detection failed for "${c.label}": expected ${c.expected}, got ${got}`);
    }
  }
}

async function main() {
  let failures = 0;

  for (const c of PRICED_CASES) {
    try {
      assertPriced(c, calculateMarkup(c.input));
    } catch (err) {
      failures += 1;
      console.error(`✗ ${(err as Error).message}`);
    }
  }

  for (const c of MANUAL_REVIEW_CASES) {
    try {
      assertManualReview(c, calculateMarkup(c.input));
    } catch (err) {
      failures += 1;
      console.error(`✗ ${(err as Error).message}`);
    }
  }

  try {
    assertHudDetection();
  } catch (err) {
    failures += 1;
    console.error(`✗ ${(err as Error).message}`);
  }

  if (failures > 0) {
    console.error(`\n${failures} markup test(s) failed.`);
    process.exit(1);
  }

  const total = PRICED_CASES.length + MANUAL_REVIEW_CASES.length + 1;
  console.log(`✓ markup engine: ${total} assertions passed`);
}

main().catch(err => {
  console.error('verify-pricing-markup crashed:', err);
  process.exit(1);
});
