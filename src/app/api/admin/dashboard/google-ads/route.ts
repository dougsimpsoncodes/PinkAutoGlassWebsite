import { NextRequest, NextResponse } from 'next/server';
import {
  getMountainDateRange,
  getSupabaseClient,
  DateFilter,
  getPaidPlatformDailyMetrics,
  getPaidPlatformSearchTermInsights,
} from '@/lib/dashboardData';
import { isMarketFilter, type MarketFilter } from '@/lib/market';

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

    // Honor the market filter exactly like the Microsoft Ads route. Without this
    // the page divided all-market Google spend by market-scoped leads, producing
    // wrong Cost/Lead and ROAS in any Denver/Phoenix view. See
    // tasks/2026-05-30-reporting-consistency-audit.md (F04).
    const marketParam = searchParams.get('market');
    if (marketParam !== null && !isMarketFilter(marketParam)) {
      return NextResponse.json(
        { error: 'Invalid market. Must be one of: all, colorado, arizona' },
        { status: 400 }
      );
    }
    const market: MarketFilter = (marketParam as MarketFilter) || 'all';

    // Use shared date range function (Mountain Time)
    const { start, end, display, startDateStr, endDateStr } = getMountainDateRange(period);
    const supabase = getSupabaseClient();

    const [metrics, searchInsights] = await Promise.all([
      getPaidPlatformDailyMetrics(supabase, 'google', startDateStr, endDateStr, market),
      getPaidPlatformSearchTermInsights(supabase, 'google', startDateStr, endDateStr, market),
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
