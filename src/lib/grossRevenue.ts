/**
 * Canonical Gross Revenue — single source of truth shared by the Executive
 * Dashboard (/api/admin/dashboard/metrics → metricsBuilder) and the ROI /
 * total-revenue page, so the two can never drift (F01 / 3b in
 * tasks/2026-05-30-reporting-consistency-audit.md).
 *
 * Gross Revenue = sum(omega_installs.total_revenue) over install_date in range —
 * customer-paid revenue, NOT cost-of-goods.
 *
 * Market rule (decided 2026-05-30, council-confirmed):
 *  - 'all'           → every install counts.
 *  - specific market → ONLY installs whose matched lead classifies to that market.
 *    Unmatched cash/walk-in jobs (no matched_lead_id → no geo signal) are counted
 *    in All-Markets but EXCLUDED from a city view — we don't guess their market.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { classifyLeadMarket, type MarketFilter } from './market';

export interface GrossRevenueResult {
  total: number;
  invoiceCount: number;
}

export async function getGrossRevenue(
  supabase: SupabaseClient,
  range: { startDate?: string | null; endDate?: string | null },
  market: MarketFilter
): Promise<GrossRevenueResult> {
  let query = supabase.from('omega_installs').select('total_revenue, matched_lead_id');
  if (range.startDate) query = query.gte('install_date', range.startDate);
  if (range.endDate) query = query.lte('install_date', range.endDate);

  const { data } = await query;
  let rows = data || [];

  if (market !== 'all') {
    const leadIds = [...new Set(rows.map((r: any) => r.matched_lead_id).filter(Boolean))];
    const allowed = new Set<string>();

    // Batch lead lookups in groups of 100 to stay under PostgREST URL limits.
    const BATCH = 100;
    for (let i = 0; i < leadIds.length; i += BATCH) {
      const { data: leads } = await supabase
        .from('leads')
        .select('id, state, zip, utm_source')
        .in('id', leadIds.slice(i, i + BATCH));
      (leads || []).forEach((l: any) => {
        if (classifyLeadMarket(l) === market) allowed.add(l.id);
      });
    }

    // City view: include ONLY installs matched to a lead in this market.
    // Unmatched cash jobs are excluded (counted in All-Markets only).
    rows = rows.filter((r: any) => r.matched_lead_id && allowed.has(r.matched_lead_id));
  }

  const total = rows.reduce((sum: number, r: any) => sum + (r.total_revenue || 0), 0);
  return { total, invoiceCount: rows.length };
}
