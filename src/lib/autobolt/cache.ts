import crypto from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
  AutoBoltLookupSummary,
  AutoBoltDecodeResponse,
  AutoBoltSinglePart,
  NagsIdentifier,
  extractNagsFromPart,
} from './client';
import { detectHudFromFeatures } from '@/lib/quote/markup';
import { parseAmNumberToNags } from '@/lib/quote/nags-compatibility';

export interface CachedNagsLookup {
  resolvedFrom: 'vin' | 'plate';
  vin?: string;
  plateLast4?: string;
  plateState?: string;
  year?: number;
  make?: string;
  model?: string;
  bodyStyle?: string;
  confidence: 'single' | 'multi' | 'none';
  partCount: number;
  nags?: NagsIdentifier;
  amNumber?: string;
  oemPartNumbers: string[];
  interchangeables: string[];
  /**
   * AutoBolt's calibration_summary array (e.g. [{type:"Static", sensor:"Windshield Camera System"}]).
   * Non-empty length means the vehicle requires ADAS calibration as part of the install.
   * Used by /api/quote/price to auto-include the calibration line item.
   */
  calibrations: Array<{ type?: string; sensor?: string }>;
  /**
   * Derived at cache-write from AutoBolt's features[] array. Drives the +$75
   * HUD markup adder. Defaults to false on legacy rows; bumping NAGS_MAP_VERSION
   * invalidates all pre-HUD entries so we re-decode and populate accurately.
   */
  hasHud: boolean;
  /**
   * NAGS variants that AutoBolt lists as interchangeable with the selected
   * part. We query Mygrant for each compatible one alongside the primary so
   * the customer gets the cheapest fit. Only includes interchangeables whose
   * features are a functional superset of the primary (per
   * checkCompatibility); cosmetic-only diffs (logo/grille) are tolerated.
   * Derived at cache-write from raw partsById; empty array when none.
   */
  interchangeableParts: InterchangeableNagsPart[];
  /**
   * Features of the primary (selectedPart). Needed at query time alongside
   * interchangeableParts so we can re-run the compatibility filter when an
   * interchangeable's features change (we only re-decode on NAGS_MAP_VERSION
   * bump; if AutoBolt rolls out a new feature ID we'd otherwise misjudge).
   */
  primaryFeatures: Array<{ name: string }>;
}

export interface InterchangeableNagsPart {
  amNumber: string;
  nags: { prefix: string; number: string };
  features: Array<{ name: string }>;
}

/**
 * Lookup key shape (versioned):
 *   - VIN identifier: sha256("NAGS_MAP_VERSION:VIN:" + uppercase 17-char VIN)
 *   - Plate identifier: sha256("NAGS_MAP_VERSION:PLATE:" + uppercase plate + ":" + uppercase 2-letter state)
 *
 * The version prefix invalidates every cached entry without manual cleanup
 * whenever the cached payload's MEANING changes. Bump when:
 *   - The AutoBolt-response→NAGS extraction strategy changes (e.g. amNumber → oemPartNumbers[0])
 *   - The cache schema gains a new field that the route now depends on
 *     (e.g. calibrations[] becoming authoritative for ADAS detection)
 *
 * v2-with-calibrations: calibrations[] became the source of truth for whether a
 * vehicle requires ADAS calibration. Pre-v2 rows may have had calibration_summary
 * defaulted to []; bumping forces a fresh AutoBolt lookup which populates the
 * real value.
 *
 * v3-with-hud-and-markup: hasHud became part of the cached payload to drive the
 * +$75 HUD markup adder in the markup-v1 pricing engine. Pre-v3 rows do not
 * have has_hud populated, so bumping forces a fresh decode that scans
 * AutoBolt's features[] array. Coincident with the markup-v1 rollout.
 *
 * v4-with-interchangeable-search: cached lookup now derives the full set of
 * NAGS variants (primary + compatible interchangeables) from AutoBolt's raw
 * partsById, so the route can batch-query Mygrant for the cheapest fit
 * instead of only the OEM/factory-fit NAGS. Bumping invalidates v3 rows so
 * the interchangeable list gets populated on next decode.
 *
 * Plate keys include the literal "PLATE:" prefix so a 17-char plate cannot
 * collide with a VIN.
 */
export const NAGS_MAP_VERSION = 'v4-with-interchangeable-search';

export function vinLookupKey(vin: string): string {
  const normalized = `${NAGS_MAP_VERSION}:VIN:${vin.trim().toUpperCase()}`;
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}

export function plateLookupKey(plate: string, state: string): string {
  const normalized = `${NAGS_MAP_VERSION}:PLATE:${plate.trim().toUpperCase()}:${state.trim().toUpperCase()}`;
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}

interface VehicleNagsCacheRow {
  lookup_key: string;
  resolved_from: 'vin' | 'plate';
  vin: string | null;
  plate_last4: string | null;
  plate_state: string | null;
  vehicle_year: number | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_body_style: string | null;
  confidence: 'single' | 'multi' | 'none';
  part_count: number;
  nags_prefix: string | null;
  nags_number: string | null;
  am_number: string | null;
  oem_part_numbers: unknown;
  interchangeables: unknown;
  calibration_summary: unknown;
  has_hud: boolean | null;
  raw_response: unknown;
  expires_at: string;
}

export async function readCachedNagsLookup(
  supabase: SupabaseClient,
  lookupKey: string
): Promise<CachedNagsLookup | null> {
  const { data, error } = await supabase
    .from('vehicle_nags_cache')
    .select('lookup_key, resolved_from, vin, plate_last4, plate_state, vehicle_year, vehicle_make, vehicle_model, vehicle_body_style, confidence, part_count, nags_prefix, nags_number, am_number, oem_part_numbers, interchangeables, calibration_summary, has_hud, raw_response, expires_at')
    .eq('lookup_key', lookupKey)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle<VehicleNagsCacheRow>();

  if (error || !data) return null;
  return mapRowToCached(data);
}

// amNumber → NAGS mapping confirmed across 6 vehicles 2026-05-26 (Honda Accord,
// Audi e-tron, Hyundai Kona, Subaru Outback, Mitsubishi Outlander, Ford Ranger).
// Bumped to 180 from the safety-margin 14 once the mapping was proven correct.
// NAGS_MAP_VERSION still serves as the invalidation lever if cache semantics change.
const CACHE_TTL_DAYS = 180;

export async function writeCachedNagsLookup(
  supabase: SupabaseClient,
  lookupKey: string,
  summary: AutoBoltLookupSummary,
  identifier: { vin?: string; plateLast4?: string; plateState?: string }
): Promise<void> {
  const nags = summary.selectedPart ? extractNagsFromPart(summary.selectedPart) : undefined;
  // Set expires_at on every write (insert or update). The DB default only fires
  // on INSERT; an upsert that hits an existing row keeps the old expires_at
  // unless we send a fresh value, which would leave the row permanently expired
  // after the first TTL window.
  const expiresAt = new Date(Date.now() + CACHE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const payload = {
    lookup_key: lookupKey,
    source: 'autobolt',
    resolved_from: summary.resolvedFrom,
    vin: identifier.vin ?? summary.vin ?? null,
    plate_last4: identifier.plateLast4 ?? null,
    plate_state: identifier.plateState ?? null,
    vehicle_year: summary.year ?? null,
    vehicle_make: summary.make ?? null,
    vehicle_model: summary.model ?? null,
    vehicle_body_style: summary.bodyStyle ?? null,
    confidence: summary.confidence,
    part_count: summary.partCount,
    nags_prefix: nags?.prefix ?? null,
    nags_number: nags?.number ?? null,
    am_number: summary.selectedPart?.amNumber ?? null,
    oem_part_numbers: summary.selectedPart?.oemPartNumbers ?? [],
    interchangeables: summary.selectedPart?.interchangeables ?? [],
    calibration_summary: summary.selectedPart?.calibrations?.map(c => ({
      type: c.calibrationType?.name,
      sensor: c.sensor?.name,
    })) ?? [],
    has_hud: detectHudFromFeatures(summary.selectedPart?.features),
    raw_response: summary.raw,
    expires_at: expiresAt,
  };

  const { error } = await supabase
    .from('vehicle_nags_cache')
    .upsert(payload, { onConflict: 'lookup_key' });

  if (error) {
    console.error('[autobolt-cache] upsert failed:', error.message);
  }
}

function mapRowToCached(row: VehicleNagsCacheRow): CachedNagsLookup {
  // Reconstruct the NAGS identifier whenever EITHER part is populated.
  // splitNagsIdentifier emits prefix='' for numeric-only inputs like "01658"
  // and the route accepts an empty prefix; treating "no prefix" as "no nags"
  // would make those rows look like cache misses on every read.
  const hasNags = !!(row.nags_prefix || row.nags_number);
  const nags = hasNags
    ? {
        prefix: row.nags_prefix ?? '',
        number: row.nags_number ?? '',
        raw: row.am_number ?? `${row.nags_prefix ?? ''}${row.nags_number ?? ''}`,
      }
    : undefined;

  return {
    resolvedFrom: row.resolved_from,
    vin: row.vin ?? undefined,
    plateLast4: row.plate_last4 ?? undefined,
    plateState: row.plate_state ?? undefined,
    year: row.vehicle_year ?? undefined,
    make: row.vehicle_make ?? undefined,
    model: row.vehicle_model ?? undefined,
    bodyStyle: row.vehicle_body_style ?? undefined,
    confidence: row.confidence,
    partCount: row.part_count,
    nags,
    amNumber: row.am_number ?? undefined,
    oemPartNumbers: Array.isArray(row.oem_part_numbers) ? row.oem_part_numbers as string[] : [],
    interchangeables: Array.isArray(row.interchangeables) ? row.interchangeables as string[] : [],
    calibrations: parseCalibrationSummary(row.calibration_summary),
    hasHud: row.has_hud === true,
    interchangeableParts: extractInterchangeablesFromRaw(row.raw_response, row.am_number),
    primaryFeatures: extractPrimaryFeaturesFromRaw(row.raw_response, row.am_number),
  };
}

/**
 * Walk an AutoBolt raw_response.partsById map, find the selectedPart (matched
 * by amNumber), and return the interchangeable Single parts with parseable
 * NAGS identifiers. Each returned part has its own features array so the
 * route can run the compatibility filter at query time.
 *
 * Returns [] when the data isn't shaped as expected — defensive against
 * cached rows from versions before raw_response was populated reliably.
 *
 * Exported so the quote route can use the same extraction on a fresh
 * AutoBolt decode without going through Supabase.
 */
export function extractInterchangeablesFromSummary(summary: AutoBoltLookupSummary): InterchangeableNagsPart[] {
  return extractInterchangeablesFromRaw(summary.raw, summary.selectedPart?.amNumber ?? null);
}

export function extractPrimaryFeaturesFromSummary(summary: AutoBoltLookupSummary): Array<{ name: string }> {
  return (summary.selectedPart?.features ?? []).map(f => ({ name: f.name })).filter(f => f.name);
}

function extractInterchangeablesFromRaw(raw: unknown, primaryAmNumber: string | null): InterchangeableNagsPart[] {
  const decoded = raw as Partial<AutoBoltDecodeResponse> | null | undefined;
  if (!decoded?.partsById) return [];
  const partsById = decoded.partsById as Record<string, unknown>;

  // Find the selected part's UUID by matching amNumber.
  let primary: AutoBoltSinglePart | undefined;
  for (const value of Object.values(partsById)) {
    const part = value as { kind?: string; amNumber?: string } | undefined;
    if (part?.kind === 'Single' && part.amNumber === primaryAmNumber) {
      primary = value as AutoBoltSinglePart;
      break;
    }
  }
  if (!primary) return [];

  const out: InterchangeableNagsPart[] = [];
  const seen = new Set<string>();
  // Normalize the primary's NAGS so we never re-emit it as an interchangeable.
  const primaryNags = parseAmNumberToNags(primary.amNumber);
  if (primaryNags) seen.add(`${primaryNags.prefix}${primaryNags.number}`);

  for (const uuid of primary.interchangeables ?? []) {
    const part = partsById[uuid] as AutoBoltSinglePart | undefined;
    if (!part || part.kind !== 'Single') continue;
    const nags = parseAmNumberToNags(part.amNumber);
    if (!nags) continue;
    const key = `${nags.prefix}${nags.number}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      amNumber: part.amNumber,
      nags,
      features: (part.features ?? []).map(f => ({ name: f.name })),
    });
  }
  return out;
}

function extractPrimaryFeaturesFromRaw(raw: unknown, primaryAmNumber: string | null): Array<{ name: string }> {
  const decoded = raw as Partial<AutoBoltDecodeResponse> | null | undefined;
  if (!decoded?.partsById) return [];
  const partsById = decoded.partsById as Record<string, unknown>;
  for (const value of Object.values(partsById)) {
    const part = value as { kind?: string; amNumber?: string; features?: Array<{ name?: string }> } | undefined;
    if (part?.kind === 'Single' && part.amNumber === primaryAmNumber) {
      return (part.features ?? []).map(f => ({ name: f.name ?? '' })).filter(f => f.name);
    }
  }
  return [];
}

function parseCalibrationSummary(raw: unknown): Array<{ type?: string; sensor?: string }> {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((c): c is Record<string, unknown> => !!c && typeof c === 'object')
    .map((c) => ({
      type: typeof c.type === 'string' ? c.type : undefined,
      sensor: typeof c.sensor === 'string' ? c.sensor : undefined,
    }));
}
