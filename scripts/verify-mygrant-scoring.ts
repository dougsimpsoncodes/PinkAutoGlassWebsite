#!/usr/bin/env -S npx tsx
/**
 * Guard for automated quote Mygrant candidate scoring.
 *
 * Usage:
 *   npx tsx scripts/verify-mygrant-scoring.ts
 */

import { evaluateMygrantWindshieldCandidates } from '../src/lib/quote/mygrant-scoring';
import type { MygrantResponseItem } from '../src/lib/mygrant/client';

function item(overrides: Partial<MygrantResponseItem>): MygrantResponseItem {
  return {
    rawXml: '<Response />',
    ...overrides,
  };
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function highConfidenceSingleWindshield() {
  const selection = evaluateMygrantWindshieldCandidates([
    item({
      productType: 'Glass',
      nagsPrefix: 'DW',
      nagsNumber: '01658',
      partDesc: 'Windshield solar',
      brand: 'PGW',
      qtyAvailable: 4,
      customerUnitPrice: 128.44,
      shipFromBranchName: 'Denver',
    }),
    item({
      productType: 'Accessory',
      partDesc: 'Moulding kit',
      qtyAvailable: 9,
      customerUnitPrice: 18.25,
    }),
  ]);

  assert(selection.confidence === 'high', `expected high confidence, got ${selection.confidence}`);
  assert(selection.selectedPart?.nagsNumber === '01658', 'expected DW01658 to be selected');
}

function missingPriceRequiresManualReview() {
  const selection = evaluateMygrantWindshieldCandidates([
    item({
      productType: 'Glass',
      nagsPrefix: 'FW',
      nagsNumber: '04567',
      partDesc: 'Windshield acoustic',
      qtyAvailable: 2,
    }),
  ]);

  assert(selection.confidence === 'low', `expected low confidence for missing price, got ${selection.confidence}`);
  assert(selection.reasons.includes('no_priceable_windshield_candidate'), 'expected missing price reason');
}

function unavailableRequiresManualReview() {
  const selection = evaluateMygrantWindshieldCandidates([
    item({
      productType: 'Glass',
      nagsPrefix: 'DW',
      nagsNumber: '01234',
      partDesc: 'Windshield solar',
      qtyAvailable: 0,
      customerUnitPrice: 140,
    }),
  ]);

  assert(selection.confidence === 'medium', `expected medium confidence for unavailable part, got ${selection.confidence}`);
  assert(selection.reasons.includes('no_available_windshield_candidate'), 'expected unavailable reason');
}

function ambiguousDifferentNagsRequiresManualReview() {
  const selection = evaluateMygrantWindshieldCandidates([
    item({
      productType: 'Glass',
      nagsPrefix: 'DW',
      nagsNumber: '01000',
      partDesc: 'Windshield solar',
      qtyAvailable: 2,
      customerUnitPrice: 120,
      shipFromBranchName: 'Denver',
    }),
    item({
      productType: 'Glass',
      nagsPrefix: 'DW',
      nagsNumber: '01001',
      partDesc: 'Windshield acoustic',
      qtyAvailable: 2,
      customerUnitPrice: 124,
      shipFromBranchName: 'Denver',
    }),
  ]);

  assert(selection.confidence === 'medium', `expected medium confidence for ambiguous NAGS, got ${selection.confidence}`);
  assert(selection.reasons.includes('ambiguous_multiple_windshield_candidates'), 'expected ambiguity reason');
}

function accessoriesDoNotWin() {
  const selection = evaluateMygrantWindshieldCandidates([
    item({
      productType: 'Accessory',
      partDesc: 'Windshield moulding kit',
      qtyAvailable: 5,
      customerUnitPrice: 20,
    }),
  ]);

  assert(selection.confidence !== 'high', 'expected accessory-only candidate to avoid high confidence');
}

// PR #21 lock-in: when the route batches Mygrant for AutoBolt-declared
// interchangeable NAGS, the scoring should pick the cheapest from the
// expected pool and NOT flag it as ambiguous. The Jeep Wrangler bug —
// three legitimate interchangeable NAGS came back, the original code
// flagged them as competing, and a customer got bounced to manual review.
function expectedInterchangeablePoolPicksCheapestWindshield() {
  const selection = evaluateMygrantWindshieldCandidates(
    [
      item({
        productType: 'Glass',
        nagsPrefix: 'DW',
        nagsNumber: '01881',
        partDesc: 'Windshield solar Mopar',
        brand: 'MOP',
        qtyAvailable: 1,
        customerUnitPrice: 185.25,
        shipFromBranchName: 'Denver',
      }),
      item({
        productType: 'Glass',
        nagsPrefix: 'DW',
        nagsNumber: '01668',
        partDesc: 'Windshield solar',
        brand: 'FYG',
        qtyAvailable: 1,
        customerUnitPrice: 54.58,
        shipFromBranchName: 'Denver',
      }),
      item({
        productType: 'Glass',
        nagsPrefix: 'DW',
        nagsNumber: '02479',
        partDesc: 'Windshield solar variant',
        brand: 'MOP',
        qtyAvailable: 1,
        customerUnitPrice: 55.93,
        shipFromBranchName: 'Denver',
      }),
    ],
    { expectedInterchangeableNagsKeys: new Set(['DW01881', 'DW01668', 'DW02479']) }
  );

  assert(selection.selectedPart?.nagsNumber === '01668', `expected DW01668 cheapest, got ${selection.selectedPart?.nagsNumber}`);
  assert(
    !selection.reasons.includes('ambiguous_multiple_windshield_candidates'),
    'expected pool should NOT flag ambiguity'
  );
  assert(
    selection.reasons.some(r =>
      r === 'high_confidence_cheapest_interchangeable' ||
      r === 'cheapest_interchangeable_needs_confirmation'
    ),
    'expected pool emits interchangeable reason'
  );
}

// PR #22 lock-in: accessories (nagsKey=null) must NEVER win the
// interchangeable pool even if priced way below real glass. The
// post-#21 smoke caught a $6.15 clip kit beating the cheapest real
// windshield because the filter let nagsKey=null candidates through.
function expectedInterchangeablePoolExcludesAccessories() {
  const selection = evaluateMygrantWindshieldCandidates(
    [
      item({
        productType: 'Glass',
        nagsPrefix: 'DW',
        nagsNumber: '01881',
        partDesc: 'Windshield solar Mopar',
        brand: 'MOP',
        qtyAvailable: 1,
        customerUnitPrice: 185.25,
      }),
      item({
        productType: 'Glass',
        nagsPrefix: 'DW',
        nagsNumber: '01668',
        partDesc: 'Windshield solar',
        brand: 'FYG',
        qtyAvailable: 1,
        customerUnitPrice: 54.58,
      }),
      // Accessory — cheapest by price ($6.15) but a 6-piece clip kit, not glass.
      item({
        productType: 'ML',
        partDesc: 'Jeep Wrangler windshield clip kit(6-pcs)',
        brand: 'PRP',
        productId: 'PCK-1668-07',
        qtyAvailable: 1,
        customerUnitPrice: 6.15,
      }),
    ],
    { expectedInterchangeableNagsKeys: new Set(['DW01881', 'DW01668']) }
  );

  assert(selection.selectedPart?.nagsNumber === '01668', `accessory not picked: got ${selection.selectedPart?.nagsNumber}`);
  assert(selection.selectedPart?.customerUnitPrice === 54.58, 'cheapest WINDSHIELD wins, not cheapest overall');
}

// Surprise NAGS the route did NOT ask about (e.g., Mygrant returns a
// rogue match) must be excluded from the interchangeable pool.
function expectedInterchangeablePoolExcludesSurpriseNags() {
  const selection = evaluateMygrantWindshieldCandidates(
    [
      item({
        productType: 'Glass',
        nagsPrefix: 'DW',
        nagsNumber: '01881',
        partDesc: 'Windshield expected',
        qtyAvailable: 1,
        customerUnitPrice: 185.25,
      }),
      item({
        productType: 'Glass',
        nagsPrefix: 'DW',
        nagsNumber: '99999',
        partDesc: 'Windshield surprise',
        qtyAvailable: 1,
        customerUnitPrice: 10,  // suspicious cheap
      }),
    ],
    { expectedInterchangeableNagsKeys: new Set(['DW01881', 'DW01668']) }
  );

  assert(selection.selectedPart?.nagsNumber === '01881', `surprise NAGS not picked: got ${selection.selectedPart?.nagsNumber}`);
}

// Single-entry expected set should not engage the cheapest-of pool reducer;
// the route is effectively in single-NAGS mode and should behave the same
// as the no-context case.
function singleEntryExpectedSetActsLikeNoContext() {
  const selection = evaluateMygrantWindshieldCandidates(
    [
      item({
        productType: 'Glass',
        nagsPrefix: 'DW',
        nagsNumber: '01881',
        partDesc: 'Windshield solar',
        qtyAvailable: 1,
        customerUnitPrice: 185.25,
        shipFromBranchName: 'Denver',
      }),
    ],
    { expectedInterchangeableNagsKeys: new Set(['DW01881']) }
  );

  assert(selection.confidence === 'high', `single-entry expected set should be high, got ${selection.confidence}`);
  assert(
    selection.reasons.includes('high_confidence_single_available_windshield'),
    'single-entry expected set should use the single-windshield reason'
  );
}

function main() {
  highConfidenceSingleWindshield();
  missingPriceRequiresManualReview();
  unavailableRequiresManualReview();
  ambiguousDifferentNagsRequiresManualReview();
  accessoriesDoNotWin();
  expectedInterchangeablePoolPicksCheapestWindshield();
  expectedInterchangeablePoolExcludesAccessories();
  expectedInterchangeablePoolExcludesSurpriseNags();
  singleEntryExpectedSetActsLikeNoContext();
  console.log('[mygrant] Scoring guard passed.');
}

main();
