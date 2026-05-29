/**
 * Compile-time verifier for src/lib/quote/adas-tier.ts.
 * Run via `npm run ci:guard:adas-tier`.
 *
 * Lock the tiered ADAS rule:
 *   - MANDATORY: any Windshield Camera System calibration with type
 *     containing "Static" (Static alone or Dual: Static + Dynamic)
 *   - RECOMMENDED: any Windshield Camera System calibration with type
 *     "Dynamic" only
 *   - NONE: no camera calibrations, OR only rain-sensor initialization
 *
 * Cases are drawn from real AutoBolt responses captured 2026-05-29
 * (Subaru EyeSight, Tesla Vision, BMW DAP, Lexus, Honda CR-V base trim, etc.).
 */
import { classifyAdasTier } from '../src/lib/quote/adas-tier';

interface Case {
  name: string;
  calibrations: Array<{ type?: string | null; sensor?: string | null }>;
  expect: 'mandatory' | 'recommended' | 'none';
}

const cases: Case[] = [
  // === MANDATORY tier ===
  {
    name: 'Subaru EyeSight (Dual: Static + Dynamic, Windshield Camera)',
    calibrations: [{ type: 'Dual: Static + Dynamic', sensor: 'Windshield Camera System' }],
    expect: 'mandatory',
  },
  {
    name: 'Tesla Vision (Dual: Static + Dynamic, Windshield Camera)',
    calibrations: [{ type: 'Dual: Static + Dynamic', sensor: 'Windshield Camera System' }],
    expect: 'mandatory',
  },
  {
    name: 'Lexus Safety+ (Static, Windshield Camera)',
    calibrations: [{ type: 'Static', sensor: 'Windshield Camera System' }],
    expect: 'mandatory',
  },
  {
    name: 'Mandatory plus harmless rain-sensor init alongside',
    calibrations: [
      { type: 'Static', sensor: 'Windshield Camera System' },
      { type: 'Initialization', sensor: 'Rain Sensor' },
    ],
    expect: 'mandatory',
  },

  // === RECOMMENDED tier ===
  {
    name: 'BMW base-trim camera (Dynamic only, Windshield Camera)',
    calibrations: [
      { type: 'Dynamic', sensor: 'Windshield Camera System' },
      { type: 'Initialization', sensor: 'Rain Sensor' },
    ],
    expect: 'recommended',
  },
  {
    name: 'Honda Sensing higher trim (Dynamic only)',
    calibrations: [{ type: 'Dynamic', sensor: 'Windshield Camera System' }],
    expect: 'recommended',
  },
  {
    name: 'Camera calibration with unknown/missing type — conservative to recommended',
    calibrations: [{ type: null, sensor: 'Windshield Camera System' }],
    expect: 'recommended',
  },

  // === NONE tier ===
  {
    name: 'Honda CR-V LX base trim (no calibration at all)',
    calibrations: [],
    expect: 'none',
  },
  {
    name: 'Pre-camera vehicle with only rain-sensor init',
    calibrations: [{ type: 'Initialization', sensor: 'Rain Sensor' }],
    expect: 'none',
  },
  {
    name: '2016 Subaru Impreza — no ADAS calibration',
    calibrations: [],
    expect: 'none',
  },
  {
    name: 'Null calibrations array',
    // @ts-expect-error — verifying null tolerance
    calibrations: null,
    expect: 'none',
  },
  {
    name: 'Undefined calibrations array',
    // @ts-expect-error — verifying undefined tolerance
    calibrations: undefined,
    expect: 'none',
  },
  {
    name: 'Empty sensor string (defensive)',
    calibrations: [{ type: 'Static', sensor: '' }],
    expect: 'none',
  },
];

let failed = 0;
for (const c of cases) {
  const got = classifyAdasTier(c.calibrations as any);
  const ok = got === c.expect;
  if (!ok) failed++;
  console.log(`  ${ok ? '✓' : '✗'} ${c.name}  →  expected=${c.expect}, got=${got}`);
}

if (failed > 0) {
  console.error(`\n${failed} of ${cases.length} cases failed.`);
  process.exit(1);
}
console.log(`\nAll ${cases.length} ADAS tier cases passed.`);
