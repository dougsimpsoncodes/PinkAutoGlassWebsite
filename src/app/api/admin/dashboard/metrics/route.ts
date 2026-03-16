import { NextRequest, NextResponse } from 'next/server';
import { buildMetrics } from '@/lib/metricsBuilder';
import { type DateFilter } from '@/lib/dateUtils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VALID_PERIODS: DateFilter[] = ['today', 'yesterday', '7days', '30days', 'all'];

/**
 * GET /api/admin/dashboard/metrics?period=today&debug=true
 *
 * Unified metrics endpoint — single source of truth for all dashboard data.
 * Returns spend, leads, revenue, traffic, and click events for a given period.
 * All date filtering uses Mountain Time (America/Denver), DST-aware.
 *
 * Query params:
 *   period: today | yesterday | 7days | 30days | all (default: today)
 *   debug:  true — include _debug subtotals for reconciliation
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = (searchParams.get('period') || 'today') as DateFilter;
    const debug = searchParams.get('debug') === 'true';

    if (!VALID_PERIODS.includes(period)) {
      return NextResponse.json(
        { ok: false, error: `Invalid period. Must be one of: ${VALID_PERIODS.join(', ')}` },
        { status: 400 }
      );
    }

    const metrics = await buildMetrics(period, debug);

    return NextResponse.json({ ok: true, ...metrics });
  } catch (error: any) {
    console.error('Metrics API error:', error.message || error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
