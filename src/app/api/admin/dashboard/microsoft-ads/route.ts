import { NextRequest, NextResponse } from 'next/server';
import {
  getMountainDateRange,
  getSupabaseClient,
  DateFilter,
  getPaidPlatformDailyMetrics,
  getPaidPlatformSearchTermInsights,
} from '@/lib/dashboardData';

/**
 * Microsoft Ads API Route
 *
 * Provides: ad spend, clicks, impressions, CTR, top converters, wasted spend, date range.
 * Lead counts are NOT returned — the Microsoft Ads page computes them
 * client-side via fetchUnifiedLeads() for a single source of truth.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || '30days') as DateFilter;

    // Use shared date range function (Mountain Time)
    const { start, end, display, startDateStr, endDateStr } = getMountainDateRange(period);
    const supabase = getSupabaseClient();

    const [metrics, searchInsights] = await Promise.all([
      getPaidPlatformDailyMetrics(supabase, 'microsoft', startDateStr, endDateStr),
      getPaidPlatformSearchTermInsights(supabase, 'microsoft', startDateStr, endDateStr),
    ]);

    return NextResponse.json({
      spend: metrics.spend,
      clicks: metrics.clicks,
      impressions: metrics.impressions,
      ctr: metrics.ctr,
      topConverters: searchInsights.topConverters,
      wastedSpend: searchInsights.wastedSpend,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
        display,
      },
    });
  } catch (error) {
    console.error('Error in Microsoft Ads API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Microsoft Ads data' },
      { status: 500 }
    );
  }
}
