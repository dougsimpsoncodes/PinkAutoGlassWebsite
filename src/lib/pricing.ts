/**
 * Dynamic Pricing Module
 *
 * Lookup order:
 * 1. Pricing cache (Supabase pricing_cache table, 7-day TTL)
 * 2. Omega EDI parts API (2s timeout, results cached on success)
 * 3. Environment variable fallback (PRICING_FALLBACK_AMOUNT, default $299)
 *
 * Markup is applied via PRICING_MARKUP_PERCENT env var (default 40%).
 */

import { createClient } from '@supabase/supabase-js';
import { getOmegaClient, validateOmegaConfig } from '@/lib/omegaEDI';

export interface QuotePriceResult {
  price: number;       // Final quoted price (after markup)
  source: 'omega_api' | 'cache' | 'fallback';
  supplierCost?: number; // Raw supplier cost before markup (if available)
}

/**
 * Get a quote price for a vehicle + service type.
 *
 * Checks pricing_cache first (fast), then Omega parts API (2s timeout),
 * then falls back to PRICING_FALLBACK_AMOUNT env var.
 */
export async function getQuotePrice(
  year: number,
  make: string,
  model: string,
  serviceType: string
): Promise<QuotePriceResult> {
  const fallbackAmount = parseFloat(process.env.PRICING_FALLBACK_AMOUNT || '299');

  // Normalize inputs for consistent cache keys
  const normalizedMake = make.trim().toLowerCase();
  const normalizedModel = model.trim().toLowerCase();
  const normalizedService = serviceType.trim().toLowerCase() || 'windshield';

  // --- Step 1: Check pricing_cache ---
  try {
    const cached = await lookupCache(year, normalizedMake, normalizedModel, normalizedService);
    if (cached) {
      return {
        price: cached.quoted_price,
        source: 'cache',
        supplierCost: cached.supplier_cost,
      };
    }
  } catch (err) {
    console.error('Pricing cache lookup failed:', err);
  }

  // --- Step 2: Omega parts API (2s timeout) ---
  const omegaConfig = validateOmegaConfig();
  if (omegaConfig.isValid) {
    try {
      const omega = getOmegaClient();
      const parts = await Promise.race([
        omega.getPartsByVehicle(year, make, model),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Omega parts API timeout')), 2000)
        ),
      ]);

      if (parts.length > 0) {
        // Use the first matching part's supplier cost
        const part = parts[0];
        const quotedPrice = applyMarkup(part.supplier_cost);

        // Cache the result (fire and forget)
        writeCache({
          vehicle_year: year,
          vehicle_make: normalizedMake,
          vehicle_model: normalizedModel,
          service_type: normalizedService,
          nags_part_number: part.nags_part_number,
          supplier_cost: part.supplier_cost,
          list_price: part.list_price,
          quoted_price: quotedPrice,
          source: 'omega_api',
        }).catch((err) => console.error('Failed to write pricing cache:', err));

        return {
          price: quotedPrice,
          source: 'omega_api',
          supplierCost: part.supplier_cost,
        };
      }
    } catch (err) {
      console.error('Omega parts API call failed:', err);
    }
  }

  // --- Step 3: Fallback ---
  return {
    price: fallbackAmount,
    source: 'fallback',
  };
}

/**
 * Apply markup percentage to a supplier cost.
 * Used when Omega API returns a supplier/wholesale price.
 */
export function applyMarkup(supplierCost: number): number {
  const markupPercent = parseFloat(process.env.PRICING_MARKUP_PERCENT || '40');
  return Math.round(supplierCost * (1 + markupPercent / 100) * 100) / 100;
}

// ============================================================================
// CACHE HELPERS (private)
// ============================================================================

interface CachedPrice {
  quoted_price: number;
  supplier_cost: number;
}

interface CacheWriteData {
  vehicle_year: number;
  vehicle_make: string;
  vehicle_model: string;
  service_type: string;
  nags_part_number?: string;
  supplier_cost: number;
  list_price?: number;
  quoted_price: number;
  source: string;
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function lookupCache(
  year: number,
  make: string,
  model: string,
  serviceType: string
): Promise<CachedPrice | null> {
  const { data, error } = await getSupabase()
    .from('pricing_cache')
    .select('quoted_price, supplier_cost')
    .eq('vehicle_year', year)
    .eq('vehicle_make', make)
    .eq('vehicle_model', model)
    .eq('service_type', serviceType)
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('pricing_cache query error:', error.message);
    return null;
  }

  return data;
}

async function writeCache(entry: CacheWriteData): Promise<void> {
  const markupPercent = parseFloat(process.env.PRICING_MARKUP_PERCENT || '40');

  const { error } = await getSupabase()
    .from('pricing_cache')
    .upsert({
      ...entry,
      markup_percent: markupPercent,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'vehicle_year,vehicle_make,vehicle_model,service_type' });

  if (error) {
    console.error('pricing_cache upsert error:', error.message);
  }
}
