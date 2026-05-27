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

function main() {
  highConfidenceSingleWindshield();
  missingPriceRequiresManualReview();
  unavailableRequiresManualReview();
  ambiguousDifferentNagsRequiresManualReview();
  accessoriesDoNotWin();
  console.log('[mygrant] Scoring guard passed.');
}

main();
