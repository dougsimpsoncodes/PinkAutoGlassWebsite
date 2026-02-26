import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getMountainDateRange, type DateFilter } from '@/lib/dashboardData';

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

    const client = getSupabaseClient();

    // Build date-filtered queries
    let grossQuery = client.from('omega_installs').select('total_revenue');
    let attributedQuery = client.from('leads').select('revenue_amount').eq('is_test', false).not('revenue_amount', 'is', null);

    if (period !== 'all') {
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

    const grossRevenue = (grossResult.data || []).reduce(
      (sum: number, row: any) => sum + (row.total_revenue || 0),
      0
    );
    const invoiceCount = (grossResult.data || []).length;

    const attributedRevenue = (attributedResult.data || []).reduce(
      (sum: number, row: any) => sum + (row.revenue_amount || 0),
      0
    );
    const attributedLeadCount = (attributedResult.data || []).length;

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
