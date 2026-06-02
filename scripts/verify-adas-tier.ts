/**
 * Compile-time verifier for src/lib/quote/adas-tier.ts.
 * Run via `npm run ci:guard:adas-tier`.
 *
 * Lock Doug's brand-aware ADAS policy (2026-05-29):
 *   - MANDATORY: Tesla with any camera cal, OR Subaru with a
 *     Dual: Static + Dynamic camera cal (EyeSight).
 *   - RECOMMENDED: any other vehicle with a windshield camera cal
 *     (Lexus, BMW, Honda, Toyota, Mercedes, etc.) regardless of
 *     Static/Dynamic/Dual — the customer can decline at install.
 *   - NONE: no camera calibration at all.
 *
 * Cases are drawn from real AutoBolt responses captured 2026-05-29.
 */
import { classifyAdasTier } from '../src/lib/quote/adas-tier';

interface Case {
  name: string;
  calibrations: Array<{ type?: string | null; sensor?: string | null }>;
  make?: string | null;
  expect: 'mandatory' | 'recommended' | 'none';
}

const cases: Case[] = [
  // === MANDATORY tier (Tesla + Subaru EyeSight only) ===
  {
    name: 'Tesla Model 3 (Dual: Static + Dynamic) — Vision is core driving',
    calibrations: [{ type: 'Dual: Static + Dynamic', sensor: 'Windshield Camera System' }],
    make: 'Tesla',
    expect: 'mandatory',
  },
  {
    name: 'Tesla Model Y (Static cal) — any Tesla camera cal = mandatory',
    calibrations: [{ type: 'Static', sensor: 'Windshield Camera System' }],
    make: 'Tesla',
    expect: 'mandatory',
  },
  {
    name: 'Subaru Outback EyeSight (Dual: Static + Dynamic)',
    calibrations: [{ type: 'Dual: Static + Dynamic', sensor: 'Windshield Camera System' }],
    make: 'Subaru',
    expect: 'mandatory',
  },
  {
    name: 'Subaru Forester EyeSight + rain-sensor init alongside',
    calibrations: [
      { type: 'Dual: Static + Dynamic', sensor: 'Windshield Camera System' },
      { type: 'Initialization', sensor: 'Rain Sensor' },
    ],
    make: 'Subaru',
    expect: 'mandatory',
  },

  // === RECOMMENDED tier (everyone else with a camera cal) ===
  {
    name: 'Lexus Safety+ Static cal — recommended (not mandatory per Doug)',
    calibrations: [{ type: 'Static', sensor: 'Windshield Camera System' }],
    make: 'Lexus',
    expect: 'recommended',
  },
  {
    name: 'Honda CR-V Dual cal (Honda Sensing) — recommended',
    calibrations: [{ type: 'Dual: Static + Dynamic', sensor: 'Windshield Camera System' }],
    make: 'Honda',
    expect: 'recommended',
  },
  {
    name: 'BMW base-trim Dynamic cal — recommended',
    calibrations: [
      { type: 'Dynamic', sensor: 'Windshield Camera System' },
      { type: 'Initialization', sensor: 'Rain Sensor' },
    ],
    make: 'BMW',
    expect: 'recommended',
  },
  {
    name: 'Toyota 4Runner Static cal — recommended',
    calibrations: [{ type: 'Static', sensor: 'Windshield Camera System' }],
    make: 'Toyota',
    expect: 'recommended',
  },
  {
    name: 'Mercedes-Benz Static cal — recommended',
    calibrations: [{ type: 'Static', sensor: 'Windshield Camera System' }],
    make: 'Mercedes-Benz',
    expect: 'recommended',
  },
  {
    name: 'Subaru with plain Dynamic cal (no EyeSight signal) — recommended',
    calibrations: [{ type: 'Dynamic', sensor: 'Windshield Camera System' }],
    make: 'Subaru',
    expect: 'recommended',
  },
  {
    name: 'Camera cal with unknown type, non-Tesla/Subaru — recommended',
    calibrations: [{ type: null, sensor: 'Windshield Camera System' }],
    make: 'Audi',
    expect: 'recommended',
  },
  {
    name: 'Camera cal, missing make — defaults to recommended (no mandatory inference)',
    calibrations: [{ type: 'Static', sensor: 'Windshield Camera System' }],
    expect: 'recommended',
  },

  // === NONE tier ===
  {
    name: 'Honda CR-V LX base trim (no calibration at all)',
    calibrations: [],
    make: 'Honda',
    expect: 'none',
  },
  {
    name: 'Pre-camera vehicle with only rain-sensor init',
    calibrations: [{ type: 'Initialization', sensor: 'Rain Sensor' }],
    make: 'Ford',
    expect: 'none',
  },
  {
    name: '2016 Subaru Impreza — no ADAS calibration',
    calibrations: [],
    make: 'Subaru',
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
    name: 'Tesla with empty sensor string (defensive)',
    calibrations: [{ type: 'Static', sensor: '' }],
    make: 'Tesla',
    expect: 'none',
  },
];

let failed = 0;
for (const c of cases) {
  const got = classifyAdasTier(c.calibrations as any, c.make);
  const ok = got === c.expect;
  if (!ok) failed++;
  console.log(`  ${ok ? '✓' : '✗'} ${c.name}  →  expected=${c.expect}, got=${got}`);
}

if (failed > 0) {
  console.error(`\n${failed} of ${cases.length} cases failed.`);
  process.exit(1);
}
console.log(`\nAll ${cases.length} ADAS tier cases passed.`);
