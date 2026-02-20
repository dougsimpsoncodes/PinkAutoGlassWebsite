/**
 * Pricing Cache Refresh Endpoint
 *
 * Pre-warms the pricing_cache table by looking up parts for the top
 * vehicles from recent leads. Rate-limited to respect Omega's 200 req/min.
 *
 * POST /api/admin/pricing/refresh
 * Auth: Basic auth via middleware (ADMIN_USERNAME / ADMIN_PASSWORD)
 *
 * Optional body: { limit?: number } — how many vehicles to refresh (default 50)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getOmegaClient, validateOmegaConfig } from '@/lib/omegaEDI';
import { applyMarkup } from '@/lib/pricing';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const supabase = getSupabase();
    // Check Omega config
    const config = validateOmegaConfig();
    if (!config.isValid) {
      return NextResponse.json({
        ok: false,
        error: 'Omega EDI not configured',
        missing: config.missingVars,
      }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const limit = Math.min(body.limit || 50, 100); // Cap at 100

    // Get top vehicles from recent leads (last 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data: topVehicles, error: queryError } = await supabase
      .from('leads')
      .select('vehicle_year, vehicle_make, vehicle_model')
      .gte('created_at', ninetyDaysAgo)
      .not('vehicle_year', 'is', null)
      .not('vehicle_make', 'is', null)
      .not('vehicle_model', 'is', null);

    if (queryError) {
      return NextResponse.json({ ok: false, error: queryError.message }, { status: 500 });
    }

    // Deduplicate and count by year/make/model
    const vehicleCounts = new Map<string, { year: number; make: string; model: string; count: number }>();
    for (const lead of topVehicles || []) {
      const key = `${lead.vehicle_year}|${lead.vehicle_make?.toLowerCase()}|${lead.vehicle_model?.toLowerCase()}`;
      const existing = vehicleCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        vehicleCounts.set(key, {
          year: lead.vehicle_year,
          make: lead.vehicle_make.toLowerCase(),
          model: lead.vehicle_model.toLowerCase(),
          count: 1,
        });
      }
    }

    // Sort by frequency and take top N
    const sorted = [...vehicleCounts.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    if (sorted.length === 0) {
      return NextResponse.json({
        ok: true,
        message: 'No vehicles found in recent leads to refresh',
        refreshed: 0,
      });
    }

    const omega = getOmegaClient();
    const markupPercent = parseFloat(process.env.PRICING_MARKUP_PERCENT || '40');
    const results = { refreshed: 0, failed: 0, skipped: 0, errors: [] as string[] };

    // Process with rate limiting (max ~10/sec to stay well under 200/min)
    for (const vehicle of sorted) {
      try {
        const parts = await omega.getPartsByVehicle(vehicle.year, vehicle.make, vehicle.model);

        if (parts.length === 0) {
          results.skipped++;
          continue;
        }

        const part = parts[0];
        const quotedPrice = applyMarkup(part.supplier_cost);

        const { error: upsertError } = await supabase
          .from('pricing_cache')
          .upsert({
            vehicle_year: vehicle.year,
            vehicle_make: vehicle.make,
            vehicle_model: vehicle.model,
            service_type: 'windshield',
            nags_part_number: part.nags_part_number,
            supplier_cost: part.supplier_cost,
            list_price: part.list_price,
            quoted_price: quotedPrice,
            markup_percent: markupPercent,
            source: 'omega_api',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'vehicle_year,vehicle_make,vehicle_model,service_type' });

        if (upsertError) {
          results.errors.push(`${vehicle.year} ${vehicle.make} ${vehicle.model}: ${upsertError.message}`);
          results.failed++;
        } else {
          results.refreshed++;
        }
      } catch (err: any) {
        results.errors.push(`${vehicle.year} ${vehicle.make} ${vehicle.model}: ${err.message}`);
        results.failed++;
      }

      // Rate limit: ~100ms between requests (max 600/min)
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      ok: true,
      duration_ms: Date.now() - startTime,
      vehicles_checked: sorted.length,
      ...results,
    });
  } catch (error: any) {
    console.error('Pricing refresh failed:', error.message);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
