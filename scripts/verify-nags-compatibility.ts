#!/usr/bin/env -S npx tsx
/**
 * Guard for NAGS interchangeable compatibility logic.
 *
 * Pins down which interchangeables we'll cost-optimize across versus which
 * we'll reject as feature-downgrades. Any change to the cosmetic/functional
 * heuristic has to update this file in the same commit — this is now a
 * customer-impacting business contract.
 *
 * Usage:
 *   npx tsx scripts/verify-nags-compatibility.ts
 */

import {
  isCosmeticFeature,
  checkCompatibility,
  parseAmNumberToNags,
  getFunctionalFeatureNames,
} from '../src/lib/quote/nags-compatibility';

interface CompatCase {
  name: string;
  primary: Array<{ name: string }>;
  candidate: Array<{ name: string }>;
  expectedCompatible: boolean;
  expectedMissingFunctional?: string[];
}

const COMPAT_CASES: CompatCase[] = [
  // The actual Jeep Wrangler case that drove this fix.
  {
    name: 'Jeep DW01881 (Solar + Jeep Grille) vs DW01668 (Solar only) → compatible (grille is cosmetic)',
    primary: [{ name: 'Solar Glass' }, { name: 'Jeep Grille in Third Visor Frit' }],
    candidate: [{ name: 'Solar Glass' }],
    expectedCompatible: true,
  },
  // ADAS protection — candidate missing lane departure must be rejected.
  {
    name: 'Camera/lane departure required → candidate without it rejected',
    primary: [{ name: 'Solar Glass' }, { name: 'Lane Departure Warning System' }],
    candidate: [{ name: 'Solar Glass' }],
    expectedCompatible: false,
    expectedMissingFunctional: ['Lane Departure Warning System'],
  },
  // HUD protection — different name variants
  {
    name: 'HUD required → candidate without it rejected',
    primary: [{ name: 'Heads-Up Display' }, { name: 'Acoustic Glass' }],
    candidate: [{ name: 'Acoustic Glass' }],
    expectedCompatible: false,
    expectedMissingFunctional: ['Heads-Up Display'],
  },
  // Heated wiper park — functional, must preserve
  {
    name: 'Heated wiper park required → candidate without rejected',
    primary: [{ name: 'Heated Windshield Wiper Park' }, { name: 'Solar Glass' }],
    candidate: [{ name: 'Solar Glass' }],
    expectedCompatible: false,
    expectedMissingFunctional: ['Heated Windshield Wiper Park'],
  },
  // Multiple functional gaps — both reported
  {
    name: 'Multiple functional gaps surfaced together',
    primary: [{ name: 'Solar Glass' }, { name: 'Rain-Sensing Wipers' }, { name: 'Acoustic Glass' }],
    candidate: [{ name: 'Solar Glass' }],
    expectedCompatible: false,
    expectedMissingFunctional: ['Rain-Sensing Wipers', 'Acoustic Glass'],
  },
  // Candidate has MORE features than primary — compatible (no downgrade)
  {
    name: 'Candidate is a functional superset → compatible',
    primary: [{ name: 'Solar Glass' }],
    candidate: [{ name: 'Solar Glass' }, { name: 'Acoustic Glass' }, { name: 'Infrared Coating' }],
    expectedCompatible: true,
  },
  // Cosmetic-only differences across multiple brand-logo variants
  {
    name: 'Ford Logo vs Generic — cosmetic difference allowed',
    primary: [{ name: 'Solar Glass' }, { name: 'Ford Logo in Third Visor Frit' }],
    candidate: [{ name: 'Solar Glass' }],
    expectedCompatible: true,
  },
  {
    name: 'Mercedes-Benz Logo cosmetic',
    primary: [{ name: 'Acoustic Glass' }, { name: 'Mercedes-Benz Logo in Third Visor Frit' }],
    candidate: [{ name: 'Acoustic Glass' }],
    expectedCompatible: true,
  },
  // Empty primary — no constraints, trivially compatible
  {
    name: 'Empty primary features → trivially compatible',
    primary: [],
    candidate: [{ name: 'Solar Glass' }],
    expectedCompatible: true,
  },
  // Both empty
  {
    name: 'Both empty → compatible',
    primary: [],
    candidate: [],
    expectedCompatible: true,
  },
];

interface CosmeticCase {
  name: string;
  input: string | undefined;
  expected: boolean;
}

const COSMETIC_CASES: CosmeticCase[] = [
  { name: 'Jeep Grille in Third Visor Frit', input: 'Jeep Grille in Third Visor Frit', expected: true },
  { name: 'Ford Logo in Third Visor Frit', input: 'Ford Logo in Third Visor Frit', expected: true },
  { name: 'BMW Logo', input: 'BMW Logo', expected: true },
  { name: 'lowercase grille', input: 'grille pattern', expected: true },
  { name: 'Solar Glass', input: 'Solar Glass', expected: false },
  { name: 'Lane Departure Warning System', input: 'Lane Departure Warning System', expected: false },
  { name: 'Acoustic Glass', input: 'Acoustic Glass', expected: false },
  { name: 'Heated Windshield Wiper Park', input: 'Heated Windshield Wiper Park', expected: false },
  { name: 'Heads-Up Display', input: 'Heads-Up Display', expected: false },
  { name: 'undefined', input: undefined, expected: false },
];

interface AmNumberCase {
  name: string;
  input: string | undefined | null;
  expected: { prefix: string; number: string } | null;
}

const AM_NUMBER_CASES: AmNumberCase[] = [
  { name: 'DW01881GTNN → DW/01881', input: 'DW01881GTNN', expected: { prefix: 'DW', number: '01881' } },
  { name: 'DW01668GBNN → DW/01668', input: 'DW01668GBNN', expected: { prefix: 'DW', number: '01668' } },
  { name: 'DW02700 (no suffix) → DW/02700', input: 'DW02700', expected: { prefix: 'DW', number: '02700' } },
  { name: 'lowercase dw01881 → DW/01881', input: 'dw01881', expected: { prefix: 'DW', number: '01881' } },
  { name: 'with hyphen DW-01881 → DW/01881', input: 'DW-01881', expected: { prefix: 'DW', number: '01881' } },
  { name: 'long prefix FW01234GT → FW/01234', input: 'FW01234GT', expected: { prefix: 'FW', number: '01234' } },
  { name: 'empty → null', input: '', expected: null },
  { name: 'null → null', input: null, expected: null },
  { name: 'all letters → null', input: 'ABCDEFGH', expected: null },
];

let failures = 0;

for (const c of COMPAT_CASES) {
  const result = checkCompatibility(c.primary, c.candidate);
  if (result.compatible !== c.expectedCompatible) {
    failures += 1;
    console.error(`✗ ${c.name}: expected compatible=${c.expectedCompatible}, got ${result.compatible} (missing functional: ${result.missingFunctionalFeatures.join(', ')})`);
    continue;
  }
  if (c.expectedMissingFunctional) {
    const got = [...result.missingFunctionalFeatures].sort();
    const want = [...c.expectedMissingFunctional].sort();
    if (got.join(',') !== want.join(',')) {
      failures += 1;
      console.error(`✗ ${c.name}: missingFunctional mismatch want=[${want.join(',')}] got=[${got.join(',')}]`);
    }
  }
}

for (const c of COSMETIC_CASES) {
  const result = isCosmeticFeature(c.input);
  if (result !== c.expected) {
    failures += 1;
    console.error(`✗ cosmetic "${c.name}": expected ${c.expected}, got ${result}`);
  }
}

for (const c of AM_NUMBER_CASES) {
  const result = parseAmNumberToNags(c.input);
  const match =
    (result === null && c.expected === null) ||
    (result !== null && c.expected !== null &&
      result.prefix === c.expected.prefix && result.number === c.expected.number);
  if (!match) {
    failures += 1;
    console.error(`✗ amNumber "${c.name}": expected ${JSON.stringify(c.expected)}, got ${JSON.stringify(result)}`);
  }
}

// Quick sanity on getFunctionalFeatureNames
{
  const fn = getFunctionalFeatureNames([
    { name: 'Solar Glass' },
    { name: 'Jeep Grille in Third Visor Frit' },
    { name: 'Lane Departure Warning System' },
  ]);
  if (fn.length !== 2 || !fn.includes('Solar Glass') || !fn.includes('Lane Departure Warning System')) {
    failures += 1;
    console.error(`✗ getFunctionalFeatureNames: expected 2 functional, got ${JSON.stringify(fn)}`);
  }
}

const total = COMPAT_CASES.length + COSMETIC_CASES.length + AM_NUMBER_CASES.length + 1;
if (failures > 0) {
  console.error(`\n${failures} of ${total} NAGS-compatibility assertions failed.`);
  process.exit(1);
}
console.log(`✓ NAGS compatibility: ${total} assertions passed`);
