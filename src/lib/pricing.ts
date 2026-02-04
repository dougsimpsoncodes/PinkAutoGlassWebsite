/**
 * Dynamic Pricing Module
 *
 * Lookup order:
 * 1. Pricing cache (Supabase pricing_cache table — wired in Phase 2)
 * 2. Omega EDI parts API (wired in Phase 2)
 * 3. Environment variable fallback (PRICING_FALLBACK_AMOUNT, default $299)
 *
 * Markup is applied via PRICING_MARKUP_PERCENT env var (default 40%).
 */

export interface QuotePriceResult {
  price: number;       // Final quoted price (after markup)
  source: 'omega_api' | 'cache' | 'fallback';
  supplierCost?: number; // Raw supplier cost before markup (if available)
}

/**
 * Get a quote price for a vehicle + service type.
 *
 * Currently returns the env-var fallback. Once Omega parts API and
 * pricing_cache table are wired (Phase 2), this will check the cache
 * first, then call Omega, then fall back.
 */
export async function getQuotePrice(
  _year: number,
  _make: string,
  _model: string,
  _serviceType: string
): Promise<QuotePriceResult> {
  const fallbackAmount = parseFloat(process.env.PRICING_FALLBACK_AMOUNT || '299');

  // Phase 2 placeholder: pricing_cache lookup would go here
  // Phase 2 placeholder: Omega parts API call with 2s timeout would go here

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
