import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getMountainDateRange, type DateFilter } from '@/lib/dashboardData';
import { classifyLeadMarket, type Market } from '@/lib/market';
import { getGrossRevenue } from '@/lib/grossRevenue';

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

    // Attributed revenue (leads matched to invoices), date-filtered on created_at.
    let attributedQuery = client.from('leads').select('revenue_amount, state, zip, utm_source').eq('is_test', false).not('revenue_amount', 'is', null);

    // Resolve the gross-revenue date range (install_date). Explicit startDate/endDate
    // (from the ROI page) overrides period.
    let grossStart: string | null = null;
    let grossEnd: string | null = null;
    if (startDateParam && endDateParam) {
      grossStart = startDateParam;
      grossEnd = endDateParam;
      attributedQuery = attributedQuery
        .gte('created_at', `${startDateParam}T00:00:00.000Z`)
        .lte('created_at', `${endDateParam}T23:59:59.999Z`);
    } else if (period !== 'all') {
      const { start, end } = getMountainDateRange(period);
      grossStart = start.toISOString();
      grossEnd = end.toISOString();
      attributedQuery = attributedQuery
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());
    }

    // Gross revenue via the shared canonical helper — same column AND market rule
    // as the Exec Dashboard so the two surfaces can't drift (F01 / 3b).
    const [gross, attributedResult] = await Promise.all([
      getGrossRevenue(client, { startDate: grossStart, endDate: grossEnd }, market),
      attributedQuery,
    ]);

    // Market-filter attributed leads (exclude unclassifiable from specific-market views)
    let attributedRows = attributedResult.data || [];
    if (market !== 'all') {
      attributedRows = attributedRows.filter((lead: any) => classifyLeadMarket(lead) === market);
    }

    const grossRevenue = gross.total;
    const invoiceCount = gross.invoiceCount;

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
