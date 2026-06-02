/**
 * Canonical Attributed Revenue — shared by the Exec Dashboard (metricsBuilder),
 * the ROI / total-revenue page, and the unified dashboard, so they can't drift.
 *
 * Attributed Revenue = revenue from COMPLETED jobs, recognized on `close_date`
 * (when the money was earned), NOT on `created_at` (when the lead first arrived).
 * Counts a lead's `revenue_amount` only when `status = 'completed'`. Decided
 * 2026-05-30 (F09) — see tasks/2026-05-30-reporting-consistency-audit.md.
 *
 * Platform attribution matches the canonical lead logic: ad_platform, falling
 * back to gclid → google / msclkid → microsoft, normalized to google/microsoft/
 * unattributed.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { classifyLeadMarket, type MarketFilter } from './market';

export interface AttributedRevenueResult {
  total: number;
  byPlatform: { google: number; microsoft: number; unattributed: number };
  leadCount: number;
}

export async function getAttributedRevenue(
  supabase: SupabaseClient,
  range: { startDate?: string | null; endDate?: string | null },
  market: MarketFilter
): Promise<AttributedRevenueResult> {
  let query = supabase
    .from('leads')
    // `market` MUST be selected: classifyLeadMarket() treats the market column
    // as the authoritative first signal (set by the lead trigger / callLeadSync).
    // Without it, completed leads whose market was set server-side but which
    // lack state/zip/UTM classify as null and get dropped from market-filtered
    // attributed revenue (codex pre-deploy F-market-1, 2026-05-31).
    .select('ad_platform, gclid, msclkid, revenue_amount, market, state, zip, utm_source')
    .eq('is_test', false)
    .eq('status', 'completed')
    .not('revenue_amount', 'is', null);

  // Recognize revenue on close_date (when earned), not created_at.
  if (range.startDate) query = query.gte('close_date', range.startDate);
  if (range.endDate) query = query.lte('close_date', range.endDate);

  const { data } = await query;

  const byPlatform = { google: 0, microsoft: 0, unattributed: 0 };
  let total = 0;
  let leadCount = 0;

  for (const lead of (data || []) as any[]) {
    if (market !== 'all' && classifyLeadMarket(lead) !== market) continue;
    const rev = lead.revenue_amount || 0;
    if (!rev) continue;

    let platform: string | null = lead.ad_platform;
    if (!platform) {
      if (lead.gclid) platform = 'google';
      else if (lead.msclkid) platform = 'microsoft';
    }
    if (platform !== 'google' && platform !== 'microsoft') platform = null;

    total += rev;
    leadCount++;
    if (platform === 'google') byPlatform.google += rev;
    else if (platform === 'microsoft') byPlatform.microsoft += rev;
    else byPlatform.unattributed += rev;
  }

  return { total, byPlatform, leadCount };
}
