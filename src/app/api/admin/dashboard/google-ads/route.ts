import { NextRequest, NextResponse } from 'next/server';
import {
  getMountainDateRange,
  getSupabaseClient,
  DateFilter,
  getPaidPlatformDailyMetrics,
  getPaidPlatformSearchTermInsights,
} from '@/lib/dashboardData';

/**
 * Google Ads API Route
 *
 * Provides: ad spend, clicks, impressions, CTR, top converters, date range.
 * Lead counts are NOT returned — the Google Ads page computes them
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
      getPaidPlatformDailyMetrics(supabase, 'google', startDateStr, endDateStr),
      getPaidPlatformSearchTermInsights(supabase, 'google', startDateStr, endDateStr),
    ]);

    return NextResponse.json({
      spend: metrics.spend,
      clicks: metrics.clicks,
      impressions: metrics.impressions,
      ctr: metrics.ctr,
      apiConversions: metrics.conversions,
      topConverters: searchInsights.topConverters,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
        display,
      },
    });
  } catch (error) {
    console.error('Error in Google Ads API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Google Ads data' },
      { status: 500 }
    );
  }
}
