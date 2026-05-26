import crypto from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
  AutoBoltLookupSummary,
  NagsIdentifier,
  extractNagsFromPart,
} from './client';

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
}

/**
 * Lookup key shape (versioned):
 *   - VIN identifier: sha256("NAGS_MAP_VERSION:VIN:" + uppercase 17-char VIN)
 *   - Plate identifier: sha256("NAGS_MAP_VERSION:PLATE:" + uppercase plate + ":" + uppercase 2-letter state)
 *
 * The version prefix means changing the AutoBolt-response→NAGS extraction
 * strategy (currently `amNumber`, pending Nick's confirmation) automatically
 * invalidates every cached entry without manual cleanup. Bump `NAGS_MAP_VERSION`
 * whenever the mapping logic in extractNagsFromPart changes.
 *
 * Plate keys include the literal "PLATE:" prefix so a 17-char plate cannot
 * collide with a VIN.
 */
export const NAGS_MAP_VERSION = 'v1-amNumber';

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
  expires_at: string;
}

export async function readCachedNagsLookup(
  supabase: SupabaseClient,
  lookupKey: string
): Promise<CachedNagsLookup | null> {
  const { data, error } = await supabase
    .from('vehicle_nags_cache')
    .select('lookup_key, resolved_from, vin, plate_last4, plate_state, vehicle_year, vehicle_make, vehicle_model, vehicle_body_style, confidence, part_count, nags_prefix, nags_number, am_number, oem_part_numbers, interchangeables, expires_at')
    .eq('lookup_key', lookupKey)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle<VehicleNagsCacheRow>();

  if (error || !data) return null;
  return mapRowToCached(data);
}

// Short TTL while the AM→NAGS mapping is pending Nick's confirmation. Once
// vendor confirms the right response field, this can grow back to 180.
// The NAGS_MAP_VERSION above also invalidates the cache automatically if we
// change the extraction strategy, so this TTL is a belt-and-suspenders safety
// margin against a wrong mapping going undetected.
const CACHE_TTL_DAYS = 14;

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
  };
}
