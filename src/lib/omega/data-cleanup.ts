/**
 * Omega Install Data Cleanup
 *
 * Auto-fixes mechanical errors in vehicle_make and vehicle_model fields.
 * NEVER modifies customer_name or first_name — those are flagged only.
 *
 * Called after every sync-omega cron run and every import-invoices upload.
 */

import { createClient } from '@supabase/supabase-js';

// ── Known makes (canonical form) ─────────────────────────────────────────────

const KNOWN_MAKES = new Set([
  'Acura', 'Alfa Romeo', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet',
  'Chrysler', 'Dodge', 'Ferrari', 'Fiat', 'Ford', 'Genesis', 'GMC', 'Honda',
  'Hyundai', 'Infiniti', 'Jaguar', 'Jeep', 'Kia', 'Land Rover', 'Lexus',
  'Lincoln', 'Maserati', 'Mazda', 'Mercedes-Benz', 'Mini', 'Mitsubishi',
  'Nissan', 'Porsche', 'Ram', 'Rolls-Royce', 'Subaru', 'Tesla', 'Toyota',
  'Volkswagen', 'Volvo', 'Freightliner', 'Sprinter',
]);

// ── Abbreviation → canonical make ────────────────────────────────────────────

const MAKE_ALIASES: Record<string, string> = {
  'chev': 'Chevrolet',
  'chevy': 'Chevrolet',
  'vw': 'Volkswagen',
  'gmc': 'GMC',
  'bmw': 'BMW',
  'kia': 'Kia',
  'mercedes': 'Mercedes-Benz',
  'merc': 'Mercedes-Benz',
  'landrover': 'Land Rover',
  'land rover': 'Land Rover',
};

// ── Known model corrections ───────────────────────────────────────────────────

const MODEL_CORRECTIONS: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /^esca5$/i,   replacement: 'Escape' },
  { pattern: /^escpe$/i,   replacement: 'Escape' },
  { pattern: /^escape$/i,  replacement: 'Escape' },
  { pattern: /^cr-?v$/i,   replacement: 'CR-V' },
  { pattern: /^crv$/i,     replacement: 'CR-V' },
  { pattern: /^equinx$/i,  replacement: 'Equinox' },
  { pattern: /^equinox$/i, replacement: 'Equinox' },
];

// ── NHTSA VIN decode ──────────────────────────────────────────────────────────

interface NHTSAResult {
  make: string | null;
  model: string | null;
  year: number | null;
}

async function decodeVin(vin: string): Promise<NHTSAResult> {
  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${encodeURIComponent(vin)}?format=json`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return { make: null, model: null, year: null };
    const data = await res.json();
    const results: Array<{ Variable: string; Value: string }> = data.Results || [];
    const get = (name: string) =>
      results.find(r => r.Variable === name)?.Value?.trim() || null;

    const yearStr = get('Model Year');
    return {
      make: get('Make') || null,
      model: get('Model') || null,
      year: yearStr && yearStr !== '0' ? parseInt(yearStr) : null,
    };
  } catch {
    return { make: null, model: null, year: null };
  }
}

// ── Core record cleaner ───────────────────────────────────────────────────────

export interface CleanupFlag {
  field_name: string;
  raw_value: string | null;
  flag_reason: string;
}

export interface CleanedRecord {
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  flags: CleanupFlag[];
  changed: boolean;
}

export async function cleanOmegaRecord(record: {
  invoice_number: string;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  vin: string | null;
}): Promise<CleanedRecord> {
  let make = record.vehicle_make?.trim() || null;
  let model = record.vehicle_model?.trim() || null;
  const year = record.vehicle_year;
  const flags: CleanupFlag[] = [];
  let changed = false;

  // ── Fix make ───────────────────────────────────────────────────
  if (make) {
    const alias = MAKE_ALIASES[make.toLowerCase()];
    if (alias) {
      make = alias;
      changed = true;
    } else if (!KNOWN_MAKES.has(make)) {
      // Title-case if all-lowercase
      const titleCased = make.charAt(0).toUpperCase() + make.slice(1);
      if (titleCased !== make) { make = titleCased; changed = true; }

      // Still unrecognized — try VIN lookup
      if (!KNOWN_MAKES.has(make)) {
        if (record.vin) {
          const vin = await decodeVin(record.vin);
          if (vin.make) {
            make = vin.make;
            if (vin.model && !model) model = vin.model;
            changed = true;
          } else {
            flags.push({ field_name: 'vehicle_make', raw_value: record.vehicle_make, flag_reason: 'Unrecognized make; VIN lookup returned no result' });
          }
        } else {
          flags.push({ field_name: 'vehicle_make', raw_value: record.vehicle_make, flag_reason: 'Unrecognized make; no VIN available' });
        }
      }
    }
  }

  // ── Fix model ──────────────────────────────────────────────────
  if (model) {
    // Remove trailing #N suffix
    const noSuffix = model.replace(/\s*#\d+$/, '').trim();
    if (noSuffix !== model) { model = noSuffix; changed = true; }

    // Apply known corrections
    for (const { pattern, replacement } of MODEL_CORRECTIONS) {
      if (pattern.test(model)) { model = replacement; changed = true; break; }
    }

    // Title-case single all-lowercase word
    if (/^[a-z]+$/.test(model)) {
      model = model.charAt(0).toUpperCase() + model.slice(1);
      changed = true;
    }
  }

  return { vehicle_make: make, vehicle_model: model, vehicle_year: year, flags, changed };
}

// ── Batch cleanup runner ──────────────────────────────────────────────────────

export interface CleanupSummary {
  checked: number;
  updated: number;
  flagged: number;
  errors: number;
}

export async function runOmegaCleanup(
  supabase: ReturnType<typeof createClient>,
  options: { daysSince?: number } = {}
): Promise<CleanupSummary> {
  const days = options.daysSince ?? 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data: records, error } = await supabase
    .from('omega_installs')
    .select('id, invoice_number, vehicle_make, vehicle_model, vehicle_year, vin')
    .gte('synced_at', since);

  if (error) {
    console.error('Omega cleanup: failed to fetch records:', error.message);
    return { checked: 0, updated: 0, flagged: 0, errors: 1 };
  }

  const summary: CleanupSummary = { checked: records.length, updated: 0, flagged: 0, errors: 0 };

  for (const record of records) {
    try {
      const cleaned = await cleanOmegaRecord(record);

      if (cleaned.changed) {
        const { error: updateErr } = await supabase
          .from('omega_installs')
          .update({
            vehicle_make: cleaned.vehicle_make,
            vehicle_model: cleaned.vehicle_model,
            vehicle_year: cleaned.vehicle_year,
            updated_at: new Date().toISOString(),
          })
          .eq('id', record.id);

        if (updateErr) {
          console.error(`Omega cleanup: update failed for ${record.invoice_number}:`, updateErr.message);
          summary.errors++;
        } else {
          summary.updated++;
        }
      }

      if (cleaned.flags.length > 0) {
        const flagRows = cleaned.flags.map(f => ({
          invoice_number: record.invoice_number,
          field_name: f.field_name,
          raw_value: f.raw_value,
          flag_reason: f.flag_reason,
          created_at: new Date().toISOString(),
        }));

        // Skip if already flagged (avoid duplicate flags)
        for (const flag of flagRows) {
          const { data: existing } = await supabase
            .from('omega_data_flags')
            .select('id')
            .eq('invoice_number', flag.invoice_number)
            .eq('field_name', flag.field_name)
            .is('resolved_at', null)
            .limit(1)
            .single();

          if (!existing) {
            await supabase.from('omega_data_flags').insert(flag);
            summary.flagged++;
          }
        }
      }
    } catch (err: any) {
      console.error(`Omega cleanup: error on ${record.invoice_number}:`, err.message);
      summary.errors++;
    }
  }

  console.log(`Omega cleanup: checked=${summary.checked} updated=${summary.updated} flagged=${summary.flagged} errors=${summary.errors}`);
  return summary;
}
