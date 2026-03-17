import { NextRequest, NextResponse } from 'next/server';
import { buildUnifiedLeads } from '@/lib/unifiedLeadsBuilder';
import { type DateFilter } from '@/lib/dateUtils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VALID_PERIODS: DateFilter[] = ['today', 'yesterday', '7days', '30days', 'all'];

/**
 * GET /api/admin/dashboard/unified-leads?period=today
 *
 * Returns individual lead rows using the same server-side logic as
 * metricsBuilder. This is the canonical source of truth for lead data
 * across all admin pages.
 *
 * Optional: &platform=google to filter to a single platform.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = (searchParams.get('period') || 'today') as DateFilter;
    const platform = searchParams.get('platform') || undefined;

    if (!VALID_PERIODS.includes(period)) {
      return NextResponse.json(
        { ok: false, error: `Invalid period. Must be one of: ${VALID_PERIODS.join(', ')}` },
        { status: 400 }
      );
    }

    const result = await buildUnifiedLeads(period, platform);

    const res = NextResponse.json({ ok: true, ...result });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (error: any) {
    console.error('Unified leads API error:', error.message || error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
