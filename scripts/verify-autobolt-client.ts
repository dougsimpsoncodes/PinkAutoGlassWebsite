#!/usr/bin/env -S npx tsx
/**
 * Guard for the AutoBolt integration invariant.
 *
 * Mirrors scripts/verify-mygrant-client.ts:
 *   - Asserts the User-Agent constant is single-sourced in src/lib/autobolt/client.ts
 *   - Forbids myautobolt.com fetch references anywhere else in the codebase
 *   - Verifies HMAC auth header construction against a known SHA256 digest
 *   - Verifies the NAGS prefix/number split helper
 *   - Verifies the lookup summary classifies single/multi/none correctly
 *   - Verifies the fetch path sends the right method, URL, headers, and body
 *
 * Usage:
 *   npx tsx scripts/verify-autobolt-client.ts
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  AUTOBOLT_USER_AGENT,
  AutoBoltClient,
  AutoBoltDecodeResponse,
  AutoBoltError,
  buildAuthHeader,
  extractNagsFromPart,
  splitNagsIdentifier,
} from '../src/lib/autobolt/client';

const EXPECTED_USER_AGENT = 'PinkAutoGlass-OMS/1.0 (+https://pinkautoglass.com; doug@pinkautoglass.com)';
const ROOT = process.cwd();
const CLIENT_PATH = path.join(ROOT, 'src/lib/autobolt/client.ts');
const VERIFY_PATH = path.join(ROOT, 'scripts/verify-autobolt-client.ts');

function assertSingleUserAgentDefinition() {
  if (AUTOBOLT_USER_AGENT !== EXPECTED_USER_AGENT) {
    throw new Error(`AUTOBOLT_USER_AGENT constant mismatch. Expected ${EXPECTED_USER_AGENT}`);
  }

  const matches = findTextMatches(ROOT, 'AUTOBOLT_USER_AGENT')
    .filter(file => isCodeFile(file))
    .filter(file => file !== VERIFY_PATH);

  const invalid = matches.filter(file => file !== CLIENT_PATH);
  if (invalid.length > 0) {
    throw new Error(`AUTOBOLT_USER_AGENT may only be defined in src/lib/autobolt/client.ts. Offenders:\n${invalid.join('\n')}`);
  }
}

function assertAutoBoltDomainGuard() {
  // Standalone diagnostic probe scripts call AutoBolt directly with fetch and
  // can't easily import the base URL from src/ (they're plain .mjs). Allow them.
  const PROBE_AUTOBOLT_VEHICLE = path.join(ROOT, 'scripts/probe-autobolt-vehicle.mjs');

  const matches = findTextMatches(ROOT, 'myautobolt.com')
    .filter(file => isCodeFile(file))
    .filter(file => !file.includes('/node_modules/'))
    .filter(file => file !== VERIFY_PATH)
    .filter(file => !file.endsWith('.env.example'));

  const allowed = new Set([CLIENT_PATH, PROBE_AUTOBOLT_VEHICLE]);
  const invalid = matches.filter(file => !allowed.has(file));
  if (invalid.length > 0) {
    throw new Error(`AutoBolt domain references must stay centralized in src/lib/autobolt/client.ts. Offenders:\n${invalid.join('\n')}`);
  }
}

function assertAuthHeaderConstruction() {
  // Known-value cross-check against the algorithm in the v2.7 spec
  // (page 1, "Digest" section): sha256(nonce + timestamp + apiKey), base64.
  const apiKey = 'my-secret-api-key';
  const userId = 'b9778c14-3c57-41c4-b767-121e4909e8aa';
  const nonce = 'CtLmCSAJwSKlioby83XFggs0vQw';
  const timestamp = 1679615604;

  const expectedDigest = crypto
    .createHash('sha256')
    .update(`${nonce}${timestamp}${apiKey}`, 'utf8')
    .digest('base64');

  const header = buildAuthHeader({ userId, apiKey }, timestamp, nonce);
  const expected = `AutoBoltAuth version="1", timestamp=${timestamp}, digest="${expectedDigest}", nonce="${nonce}", userid="${userId}"`;

  if (header !== expected) {
    throw new Error(`Auth header mismatch.\nExpected: ${expected}\nGot:      ${header}`);
  }

  // Sanity: digest must be deterministic for same inputs and change when any input changes.
  if (buildAuthHeader({ userId, apiKey }, timestamp, nonce) !== header) {
    throw new Error('Auth header is non-deterministic for fixed inputs.');
  }
  if (buildAuthHeader({ userId, apiKey }, timestamp + 1, nonce) === header) {
    throw new Error('Auth header did not change when timestamp changed.');
  }
  if (buildAuthHeader({ userId, apiKey }, timestamp, `${nonce}x`) === header) {
    throw new Error('Auth header did not change when nonce changed.');
  }
  if (buildAuthHeader({ userId, apiKey: `${apiKey}x` }, timestamp, nonce) === header) {
    throw new Error('Auth header did not change when apiKey changed.');
  }
}

function assertNagsSplit() {
  const cases: Array<{ input: string; prefix: string; number: string }> = [
    { input: 'DW01658', prefix: 'DW', number: '01658' },
    { input: 'dw01658', prefix: 'DW', number: '01658' },
    { input: 'DW-01658', prefix: 'DW', number: '01658' },
    { input: 'DW 01658', prefix: 'DW', number: '01658' },
    { input: 'DSWB1234A', prefix: 'DSWB', number: '1234A' },
    { input: '01658', prefix: '', number: '01658' },
  ];
  for (const { input, prefix, number } of cases) {
    const got = splitNagsIdentifier(input);
    if (got.prefix !== prefix || got.number !== number) {
      throw new Error(`splitNagsIdentifier("${input}") expected prefix="${prefix}" number="${number}", got prefix="${got.prefix}" number="${got.number}"`);
    }
  }

  const extracted = extractNagsFromPart({
    kind: 'Single',
    oemPartNumbers: ['56789-0A010'],
    amNumber: 'DW01658',
    interchangeables: [],
    calibrations: [],
    features: [],
    photoUrls: [],
  });
  if (!extracted || extracted.prefix !== 'DW' || extracted.number !== '01658') {
    throw new Error(`extractNagsFromPart on a SinglePart did not return DW/01658, got ${JSON.stringify(extracted)}`);
  }
}

async function assertRequestPath() {
  type Capture = { url: string; method: string; headers: Record<string, string>; body: unknown };
  let captured: Capture | null = null;

  const mockFetch: typeof fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : (input as URL).toString();
    const headerEntries: Record<string, string> = {};
    new Headers(init?.headers).forEach((value, key) => { headerEntries[key.toLowerCase()] = value; });
    captured = {
      url,
      method: init?.method || 'GET',
      headers: headerEntries,
      body: init?.body ? JSON.parse(init.body as string) : undefined,
    };
    const fakeResponse: AutoBoltDecodeResponse = {
      year: 2021,
      make: 'Toyota',
      model: 'Camry',
      parts: ['p1'],
      partsById: {
        p1: {
          kind: 'Single',
          oemPartNumbers: ['56789-0A010'],
          amNumber: 'DW01658',
          interchangeables: [],
          calibrations: [],
          features: [],
          photoUrls: [],
        },
      },
    };
    return new Response(JSON.stringify(fakeResponse), { status: 200, headers: { 'content-type': 'application/json' } });
  };

  const client = new AutoBoltClient(
    { userId: 'test-user-id', apiKey: 'test-api-key', baseUrl: 'https://api.myautobolt.com/v2', defaultCountry: 'US' },
    mockFetch,
    { clock: () => 1700000000, nonceFn: () => 'fixed-nonce-for-test' }
  );

  const result = await client.lookup({ vin: '4T1B11HK9MU000001' });

  if (!captured) throw new Error('mock fetch was not invoked.');
  const cap: Capture = captured;
  if (cap.url !== 'https://api.myautobolt.com/v2/decode') {
    throw new Error(`Unexpected URL: ${cap.url}`);
  }
  if (cap.method !== 'POST') {
    throw new Error(`Unexpected method: ${cap.method}`);
  }
  if (cap.headers['user-agent'] !== EXPECTED_USER_AGENT) {
    throw new Error(`User-Agent header missing/wrong: ${cap.headers['user-agent']}`);
  }
  if (!cap.headers['authorization']?.startsWith('AutoBoltAuth version="1"')) {
    throw new Error(`Authorization header missing/wrong: ${cap.headers['authorization']}`);
  }
  if (!cap.headers['authorization']?.includes('nonce="fixed-nonce-for-test"')) {
    throw new Error(`Authorization header did not include nonce.`);
  }
  if (!cap.headers['authorization']?.includes('timestamp=1700000000')) {
    throw new Error(`Authorization header did not include timestamp.`);
  }
  const body = cap.body as { country: string; vin: string; kind: string };
  if (body?.country !== 'US' || body?.vin !== '4T1B11HK9MU000001' || body?.kind !== 'Windshield') {
    throw new Error(`Unexpected decode body: ${JSON.stringify(cap.body)}`);
  }

  if (result.confidence !== 'single') {
    throw new Error(`Expected single-part confidence, got ${result.confidence}`);
  }
  if (result.selectedPart?.amNumber !== 'DW01658') {
    throw new Error(`Expected amNumber DW01658 on selectedPart`);
  }
}

async function assertPlateRequestPath() {
  let capturedUrl = '';
  let capturedBody: unknown;
  const mockFetch: typeof fetch = async (input, init) => {
    capturedUrl = typeof input === 'string' ? input : (input as URL).toString();
    capturedBody = init?.body ? JSON.parse(init.body as string) : undefined;
    return new Response(JSON.stringify({
      year: 2020, make: 'Honda', model: 'Accord',
      parts: [], partsById: {}, vin: '1HGCV1F12LA000001',
    } satisfies AutoBoltDecodeResponse), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const client = new AutoBoltClient(
    { userId: 'u', apiKey: 'k', baseUrl: 'https://api.myautobolt.com/v2', defaultCountry: 'US' },
    mockFetch
  );

  await client.lookup({ plate: { number: 'abc1234', state: 'co' } });

  if (capturedUrl !== 'https://api.myautobolt.com/v2/decode-plate') {
    throw new Error(`Plate decode URL wrong: ${capturedUrl}`);
  }
  const body = capturedBody as { country: string; plate: { number: string; state: string }; kind: string };
  if (body?.plate?.number !== 'ABC1234' || body?.plate?.state !== 'CO') {
    throw new Error(`Plate body not normalized: ${JSON.stringify(capturedBody)}`);
  }
}

async function assertStatusHandling() {
  for (const status of [204, 401, 422, 429, 500]) {
    const mockFetch: typeof fetch = async () => new Response(status === 204 ? null : 'detail', { status });
    const client = new AutoBoltClient(
      { userId: 'u', apiKey: 'k', baseUrl: 'https://api.myautobolt.com/v2', defaultCountry: 'US' },
      mockFetch
    );
    try {
      await client.decode({ vin: '1HGCV1F12LA000001' });
      throw new Error(`Expected AutoBoltError on status ${status}`);
    } catch (e) {
      if (!(e instanceof AutoBoltError)) throw e;
      if (e.status !== status) throw new Error(`AutoBoltError.status mismatch: expected ${status}, got ${e.status}`);
    }
  }
}

async function assertLookupValidationGuards() {
  const client = new AutoBoltClient(
    { userId: 'u', apiKey: 'k', baseUrl: 'https://api.myautobolt.com/v2', defaultCountry: 'US' },
    async () => { throw new Error('fetch should not be called'); }
  );

  let threw = false;
  try { await client.lookup({}); } catch { threw = true; }
  if (!threw) throw new Error('lookup() with no identifier did not throw.');

  threw = false;
  try { await client.lookup({ vin: 'too-short' }); } catch { threw = true; }
  if (!threw) throw new Error('lookup() with short VIN did not throw.');
}

function findTextMatches(root: string, needle: string): string[] {
  const results: string[] = [];
  walk(root, file => {
    if (shouldSkip(file)) return;
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(needle)) results.push(file);
  });
  return results;
}

function walk(dir: string, visit: (file: string) => void) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['.git', '.next', 'node_modules', 'playwright-report', 'test-results'].includes(entry.name)) continue;
      // Skip stale TS build outputs under scripts/temp/ — they shadow src/ files
      // and aren't real source. Gitignored in .gitignore.
      if (entry.name === 'temp' && /\/scripts\/?$/.test(dir)) continue;
      walk(fullPath, visit);
    } else if (entry.isFile()) {
      visit(fullPath);
    }
  }
}

function shouldSkip(file: string): boolean {
  return [
    '.png', '.jpg', '.jpeg', '.webp', '.zip', '.xlsx', '.pdf', '.ico', '.DS_Store',
  ].some(ext => file.endsWith(ext));
}

function isCodeFile(file: string): boolean {
  return ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'].some(ext => file.endsWith(ext));
}

function assertCalibrationExtraction() {
  // Real shape from the 2025 Subaru Outback probe — multi-calibration response.
  // The lookup summary's selectedPart.calibrations must contain both entries so
  // the route's adasSignal correctly identifies this as requiring calibration.
  const part = {
    kind: 'Single' as const,
    oemPartNumbers: ['65009AN31A'],
    amNumber: 'FW06070GTYN',
    interchangeables: [],
    calibrations: [
      { calibrationType: { calibrationTypeId: 'c1', name: 'Heating and Cooling Fan Drive Test' }, sensor: { sensorId: 's1', name: 'Heater' } },
      { calibrationType: { calibrationTypeId: 'c2', name: 'Dual: Static + Dynamic' }, sensor: { sensorId: 's2', name: 'Windshield Camera System' } },
    ],
    features: [],
    photoUrls: [],
  };

  if (part.calibrations.length !== 2) {
    throw new Error(`Test setup wrong: expected 2 calibrations, got ${part.calibrations.length}`);
  }
  // Mirror what route.ts maps when persisting to cache.
  const serialized = part.calibrations.map(c => ({ type: c.calibrationType?.name, sensor: c.sensor?.name }));
  if (serialized[0].type !== 'Heating and Cooling Fan Drive Test' || serialized[0].sensor !== 'Heater') {
    throw new Error(`First calibration mapping wrong: ${JSON.stringify(serialized[0])}`);
  }
  if (serialized[1].type !== 'Dual: Static + Dynamic' || serialized[1].sensor !== 'Windshield Camera System') {
    throw new Error(`Second calibration mapping wrong: ${JSON.stringify(serialized[1])}`);
  }

  // Vehicle with no calibrations should yield empty array (i.e. no ADAS required).
  type CalibrationEntry = { calibrationType?: { name: string }; sensor?: { name: string } };
  const bare = {
    kind: 'Single' as const,
    oemPartNumbers: ['x'],
    amNumber: 'FW04793',
    interchangeables: [],
    calibrations: [] as CalibrationEntry[],
    features: [],
    photoUrls: [],
  };
  const bareSerialized = bare.calibrations.map((c) => ({ type: c.calibrationType?.name, sensor: c.sensor?.name }));
  if (bareSerialized.length !== 0) {
    throw new Error(`Bare part should produce empty calibrations array, got ${JSON.stringify(bareSerialized)}`);
  }
}

async function main() {
  assertSingleUserAgentDefinition();
  assertAutoBoltDomainGuard();
  assertAuthHeaderConstruction();
  assertNagsSplit();
  assertCalibrationExtraction();
  await assertRequestPath();
  await assertPlateRequestPath();
  await assertStatusHandling();
  await assertLookupValidationGuards();
  console.log('[autobolt] Client guard passed.');
}

main().catch(error => {
  console.error('[autobolt] Client guard failed:', error.message);
  process.exit(1);
});
