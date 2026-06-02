import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getMountainDateRange, type DateFilter } from '@/lib/dashboardData';
import { type Market } from '@/lib/market';
import { getGrossRevenue } from '@/lib/grossRevenue';
import { getAttributedRevenue } from '@/lib/attributedRevenue';

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

    // Resolve the reporting date range. Explicit startDate/endDate (from the ROI
    // page) overrides period. Gross uses it as install_date; attributed as close_date.
    let rangeStart: string | null = null;
    let rangeEnd: string | null = null;
    if (startDateParam && endDateParam) {
      rangeStart = startDateParam;
      rangeEnd = endDateParam;
    } else if (period !== 'all') {
      const { start, end } = getMountainDateRange(period);
      rangeStart = start.toISOString();
      rangeEnd = end.toISOString();
    }

    // Gross (install_date) + attributed (close_date, completed) via the shared
    // canonical helpers — same column + market + status rules as the Exec
    // Dashboard, so the surfaces can't drift (F01/3b/F09).
    const [gross, attributed] = await Promise.all([
      getGrossRevenue(client, { startDate: rangeStart, endDate: rangeEnd }, market),
      getAttributedRevenue(client, { startDate: rangeStart, endDate: rangeEnd }, market),
    ]);

    const grossRevenue = gross.total;
    const invoiceCount = gross.invoiceCount;
    const attributedRevenue = attributed.total;
    const attributedLeadCount = attributed.leadCount;

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
