import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getMountainDateRange, type DateFilter } from '@/lib/dashboardData';
import { classifyLeadMarket, type Market } from '@/lib/market';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/total-revenue?period=7days
 *
 * Returns gross revenue from uploaded invoices (omega_installs)
 * alongside attributed revenue (leads matched to invoices),
 * filtered by the selected date period.
 *
 * Query params:
 *   period: today | yesterday | 7days | 30days | all (default: all)
 */

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) throw new Error('Supabase env vars not configured');
  return createClient(supabaseUrl, supabaseKey);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || 'all') as DateFilter;
    const market = (searchParams.get('market') || 'all') as 'all' | Market;
    // Allow explicit startDate/endDate (from ROI page) to override period
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const client = getSupabaseClient();

    // Build date-filtered queries
    // Include matched_lead_id for market filtering via lead lookup
    let grossQuery = client.from('omega_installs').select('total_revenue, matched_lead_id');
    // Include utm_source for market classification when state/zip is missing
    let attributedQuery = client.from('leads').select('revenue_amount, state, zip, utm_source').eq('is_test', false).not('revenue_amount', 'is', null);

    // Apply date filter: explicit startDate/endDate takes priority over period
    if (startDateParam && endDateParam) {
      const startISO = `${startDateParam}T00:00:00.000Z`;
      const endISO = `${endDateParam}T23:59:59.999Z`;
      grossQuery = grossQuery
        .gte('install_date', startDateParam)
        .lte('install_date', endDateParam);
      attributedQuery = attributedQuery
        .gte('created_at', startISO)
        .lte('created_at', endISO);
    } else if (period !== 'all') {
      const { start, end } = getMountainDateRange(period);
      grossQuery = grossQuery
        .gte('install_date', start.toISOString())
        .lte('install_date', end.toISOString());
      attributedQuery = attributedQuery
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());
    }

    const [grossResult, attributedResult] = await Promise.all([
      grossQuery,
      attributedQuery,
    ]);

    // Market-filter attributed leads (exclude unclassifiable from specific-market views)
    let attributedRows = attributedResult.data || [];
    if (market !== 'all') {
      attributedRows = attributedRows.filter((lead: any) => classifyLeadMarket(lead) === market);
    }

    // Market-filter gross revenue via matched_lead_id lookup (same pattern as metricsBuilder.fetchGrossRevenue)
    let grossRows = grossResult.data || [];
    if (market !== 'all') {
      const leadIds = [...new Set(grossRows.map((row: any) => row.matched_lead_id).filter(Boolean))];
      let allowedLeadIds = new Set<string>();
      if (leadIds.length > 0) {
        const BATCH_SIZE = 100;
        const allLeads: any[] = [];
        for (let i = 0; i < leadIds.length; i += BATCH_SIZE) {
          const batch = leadIds.slice(i, i + BATCH_SIZE);
          const { data: batchLeads } = await client
            .from('leads')
            .select('id, state, zip, utm_source') // include utm_source for full market classification
            .in('id', batch);
          allLeads.push(...(batchLeads || []));
        }
        allowedLeadIds = new Set(
          allLeads
            .filter((lead: any) => classifyLeadMarket(lead) === market)
            .map((lead: any) => lead.id)
        );
      }
      // For market-specific views: only include installs that are matched to a lead in that market.
      // Unmatched cash jobs have no geo signal and are excluded from specific-market revenue
      // to prevent them from inflating both market totals.
      grossRows = grossRows.filter((row: any) =>
        row.matched_lead_id && allowedLeadIds.has(row.matched_lead_id)
      );
    }

    const grossRevenue = grossRows.reduce(
      (sum: number, row: any) => sum + (row.total_revenue || 0),
      0
    );
    const invoiceCount = grossRows.length;

    const attributedRevenue = attributedRows.reduce(
      (sum: number, row: any) => sum + (row.revenue_amount || 0),
      0
    );
    const attributedLeadCount = attributedRows.length;

    const attributionRate =
      grossRevenue > 0
        ? parseFloat(((attributedRevenue / grossRevenue) * 100).toFixed(1))
        : 0;

    return NextResponse.json({
      grossRevenue: parseFloat(grossRevenue.toFixed(2)),
      attributedRevenue: parseFloat(attributedRevenue.toFixed(2)),
      invoiceCount,
      attributedLeadCount,
      attributionRate,
    });
  } catch (error: any) {
    console.error('Total revenue error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
