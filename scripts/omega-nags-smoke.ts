#!/usr/bin/env -S npx tsx
/**
 * Phase 0 smoke test for Omega NAGS vehicle/glass endpoints.
 *
 * Read-only by default. It does not print the API key or the raw VIN.
 *
 * Usage:
 *   npx tsx scripts/omega-nags-smoke.ts --vin=17_CHARACTER_VIN
 *   npx tsx scripts/omega-nags-smoke.ts --vin=17_CHARACTER_VIN --quote-first
 *   npx tsx scripts/omega-nags-smoke.ts --vehicle-id=NAGS_CAR_ID --nags=FW04792
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

type JsonObject = Record<string, unknown>;

interface OmegaGlassCandidate {
  nagsPartNumber: string | null;
  description: string | null;
  glassType: string | null;
  options: string[];
  rawKeys: string[];
}

interface SmokeSummary {
  vehicleIdKind: 'vin' | 'vehicle_id';
  vehicleIdFingerprint: string;
  vehicleStatus: number;
  quoteStatus?: number;
  candidateCount: number;
  candidates: OmegaGlassCandidate[];
  selectedForQuote?: string;
  quoteSummary?: {
    keys: string[];
    priceSignals: JsonObject;
  };
  notes: string[];
}

const ROOT = path.resolve(__dirname, '..');
loadEnv(path.join(ROOT, '.env.local'));
loadEnv(path.join(ROOT, '.env.local.service'));

const baseUrl = (process.env.OMEGA_EDI_BASE_URL || 'https://app.omegaedi.com/api/2.0').replace(/\/+$/, '');
const apiKey = process.env.OMEGA_EDI_API_KEY;
const vinArg = argValue('vin');
const vehicleIdArg = argValue('vehicle-id');
const nagsArg = normalizeNags(argValue('nags'));
const quoteFirst = process.argv.includes('--quote-first');

async function main() {
  if (!apiKey) {
    throw new Error('Missing OMEGA_EDI_API_KEY in .env.local. Add the existing Omega API key before running this smoke test.');
  }

  const vehicleId = normalizeVehicleId(vinArg || vehicleIdArg || '');
  if (!vehicleId) {
    throw new Error('Pass --vin=17_CHARACTER_VIN or --vehicle-id=NAGS_CAR_ID.');
  }

  const vehicleIdKind = isVin(vehicleId) ? 'vin' : 'vehicle_id';
  const vehicleResponse = await omegaGet(`/NagsVehicles/${encodeURIComponent(vehicleId)}`, {
    load_glass: 'WINDSHIELD',
    load_options: 'true',
  });

  const candidates = extractGlassCandidates(vehicleResponse.data);
  const selectedForQuote = nagsArg || (quoteFirst ? candidates.find(candidate => candidate.nagsPartNumber)?.nagsPartNumber || undefined : undefined);
  let quoteResponse: { status: number; data: unknown } | undefined;
  if (selectedForQuote) {
    quoteResponse = await omegaGet(`/NagsQuotes/${encodeURIComponent(vehicleId)}/${encodeURIComponent(selectedForQuote)}`);
  }

  const summary: SmokeSummary = {
    vehicleIdKind,
    vehicleIdFingerprint: fingerprint(vehicleId),
    vehicleStatus: vehicleResponse.status,
    ...(quoteResponse ? { quoteStatus: quoteResponse.status } : {}),
    candidateCount: candidates.length,
    candidates: candidates.slice(0, 20),
    ...(selectedForQuote ? { selectedForQuote } : {}),
    ...(quoteResponse ? { quoteSummary: summarizeQuote(quoteResponse.data) } : {}),
    notes: [
      'Raw API key and raw VIN are intentionally not printed.',
      'If this returns 401/403, verify Omega NAGS license/API scope for the key.',
      'If VIN lookup fails but vehicle-id works, verify VIN lookup credits separately.',
    ],
  };

  console.log(JSON.stringify(summary, null, 2));
}

async function omegaGet(endpoint: string, query?: Record<string, string>): Promise<{ status: number; data: unknown }> {
  const url = new URL(`${baseUrl}${endpoint}`);
  for (const [key, value] of Object.entries(query || {})) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      api_key: apiKey || '',
    },
    signal: AbortSignal.timeout(parseTimeoutMs()),
  });

  const text = await response.text();
  const data = parseResponseBody(text);
  if (!response.ok) {
    throw new Error(`Omega NAGS request failed: HTTP ${response.status} ${response.statusText} ${safePreview(data)}`);
  }

  return { status: response.status, data };
}

function extractGlassCandidates(data: unknown): OmegaGlassCandidate[] {
  const values = flattenObjects(data);
  const candidates = values
    .filter(value => {
      const text = searchable(value);
      return /\b(?:DW|FW|WS)[-\s]?\d{3,5}\b/i.test(text)
        && /windshield|windscreen|glass|WINDSHIELD/i.test(text);
    })
    .map(toGlassCandidate)
    .filter(candidate => candidate.nagsPartNumber);

  const byNags = new Map<string, OmegaGlassCandidate>();
  for (const candidate of candidates) {
    if (!candidate.nagsPartNumber) continue;
    if (!byNags.has(candidate.nagsPartNumber)) byNags.set(candidate.nagsPartNumber, candidate);
  }

  return [...byNags.values()].sort((a, b) => String(a.nagsPartNumber).localeCompare(String(b.nagsPartNumber)));
}

function toGlassCandidate(value: JsonObject): OmegaGlassCandidate {
  const nagsPartNumber = extractNags(searchable(value));
  return {
    nagsPartNumber,
    description: firstStringByKey(value, /description|desc|name|part/i),
    glassType: firstStringByKey(value, /glass.*type|type/i),
    options: optionSignals(value),
    rawKeys: Object.keys(value).slice(0, 30),
  };
}

function summarizeQuote(data: unknown): { keys: string[]; priceSignals: JsonObject } {
  const objects = flattenObjects(data);
  const merged: JsonObject = {};
  for (const object of objects) {
    for (const [key, value] of Object.entries(object)) {
      if (/price|cost|labor|tax|total|amount|quote|list/i.test(key) && ['string', 'number', 'boolean'].includes(typeof value)) {
        merged[key] = value;
      }
    }
  }

  return {
    keys: objects[0] ? Object.keys(objects[0]).slice(0, 40) : [],
    priceSignals: merged,
  };
}

function optionSignals(value: unknown): string[] {
  const text = searchable(value);
  const signals = [
    ['ADAS', /\badas\b|lane|ldws|camera|fca|hi-?beam|forward collision/i],
    ['HUD', /\bhud\b|heads?\s*up/i],
    ['rain_sensor', /rain/i],
    ['heated', /heated|htd|wiper park/i],
    ['acoustic', /acoustic|acstc/i],
    ['electrochromic_mirror', /electrochromic/i],
    ['solar', /\bslr\b|solar/i],
  ]
    .filter(([, pattern]) => (pattern as RegExp).test(text))
    .map(([label]) => label as string);

  return [...new Set(signals)];
}

function flattenObjects(value: unknown, depth = 0): JsonObject[] {
  if (!value || typeof value !== 'object' || depth > 8) return [];
  const object = value as JsonObject;
  const children = Object.values(object).flatMap(child => {
    if (Array.isArray(child)) return child.flatMap(item => flattenObjects(item, depth + 1));
    return flattenObjects(child, depth + 1);
  });
  return [object, ...children];
}

function firstStringByKey(value: JsonObject, pattern: RegExp): string | null {
  for (const [key, child] of Object.entries(value)) {
    if (pattern.test(key) && typeof child === 'string' && child.trim()) return child.trim();
  }
  return null;
}

function searchable(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

function extractNags(value: string): string | null {
  const match = value.match(/\b(?:DW|FW|WS)[-\s]?\d{3,5}\b/i);
  return match ? match[0].toUpperCase().replace(/[\s-]/g, '') : null;
}

function normalizeNags(value?: string): string | undefined {
  if (!value) return undefined;
  const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return /^(?:DW|FW|WS)\d{3,5}$/.test(normalized) ? normalized : undefined;
}

function normalizeVehicleId(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
}

function isVin(value: string): boolean {
  return /^[A-HJ-NPR-Z0-9]{17}$/i.test(value);
}

function fingerprint(value: string): string {
  const salt = process.env.VIN_CACHE_HASH_SALT || process.env.NEXT_PUBLIC_SUPABASE_URL || 'local-omega-nags-smoke';
  return crypto.createHash('sha256').update(`${salt}:${value}`).digest('hex').slice(0, 16);
}

function parseResponseBody(text: string): unknown {
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { text: text.slice(0, 1000) };
  }
}

function safePreview(data: unknown): string {
  return JSON.stringify(data)
    .replace(/[A-HJ-NPR-Z0-9]{17}/gi, '[redacted-vin]')
    .slice(0, 500);
}

function argValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find(arg => arg.startsWith(prefix))?.slice(prefix.length);
}

function parseTimeoutMs(): number {
  const parsed = Number.parseInt(process.env.OMEGA_EDI_TIMEOUT_MS || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 25_000;
}

function loadEnv(envPath: string) {
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value.replace(/\\n$/, '');
  }
}

main().catch(error => {
  console.error('[omega-nags] Failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
