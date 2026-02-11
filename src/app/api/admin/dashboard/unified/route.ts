import { NextRequest, NextResponse } from 'next/server';
import { getCache, getCacheKey, CACHE_TTL, setCache } from '@/lib/cache';
import {
  getMountainDateRange,
  getSupabaseClient,
  getCallMetrics,
  getPaidAdsDailyMetrics,
  DateFilter,
} from '@/lib/dashboardData';

/**
 * Unified Dashboard API Route
 *
 * Provides: ad spend/clicks/impressions (from synced DB performance tables),
 * call metrics (from getCallMetrics), revenue (from leads table),
 * and date range info.
 *
 * Lead counts are NOT returned here — the dashboard computes them
 * client-side via fetchUnifiedLeads() for a single source of truth.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || '30days') as DateFilter;
    const skipCache = searchParams.get('fresh') === 'true';

    // Check cache first (unless fresh data requested)
    const cacheKey = getCacheKey('unified', period);
    if (!skipCache) {
      const cached = await getCache<Record<string, unknown>>(cacheKey);
      if (cached !== null) {
        return NextResponse.json({ ...cached, _cached: true });
      }
    }

    // Use shared date range function for consistent timezone handling
    const { start, end, display, startDateStr, endDateStr } = getMountainDateRange(period);
    const supabase = getSupabaseClient();

    // Fetch call metrics, revenue, cost-of-goods, and paid platform data in parallel
    const [
      callMetrics,
      revenueResult,
      costResult,
      paidMetrics,
    ] = await Promise.all([
      getCallMetrics(supabase, start, end),
      // Lightweight revenue query (just sum revenue_amount from leads table)
      supabase
        .from('leads')
        .select('revenue_amount')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString()),
      // Cost-of-goods from omega_installs (parts + labor)
      supabase
        .from('omega_installs')
        .select('parts_cost, labor_cost')
        .gte('install_date', start.toISOString())
        .lte('install_date', end.toISOString())
        .eq('status', 'completed'),
      getPaidAdsDailyMetrics(supabase, startDateStr, endDateStr),
    ]);

    const googleApiData = paidMetrics.google;
    const microsoftApiData = paidMetrics.microsoft;

    // Calculate revenue from leads
    const totalRevenue = (revenueResult.data || []).reduce(
      (sum, l) => sum + (l.revenue_amount || 0),
      0
    );

    // Calculate cost-of-goods from omega_installs
    const costOfGoods = (costResult.data || []).reduce(
      (sum, row) => sum + (row.parts_cost || 0) + (row.labor_cost || 0),
      0
    );
    const grossProfit = totalRevenue - costOfGoods;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Combined ad spend totals
    const totalSpend = googleApiData.spend + microsoftApiData.spend;
    const totalClicks = googleApiData.clicks + microsoftApiData.clicks;
    const totalImpressions = googleApiData.impressions + microsoftApiData.impressions;

    // Build response data
    const responseData = {
      summary: {
        totalSpend,
        totalClicks,
        totalImpressions,
        overallCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        totalRevenue,
        roas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
        costOfGoods,
        grossProfit,
        profitMargin,
      },

      platforms: {
        google: {
          spend: googleApiData.spend,
          clicks: googleApiData.clicks,
          impressions: googleApiData.impressions,
          ctr: googleApiData.ctr,
        },
        microsoft: {
          spend: microsoftApiData.spend,
          clicks: microsoftApiData.clicks,
          impressions: microsoftApiData.impressions,
          ctr: microsoftApiData.ctr,
        },
      },

      calls: {
        total: callMetrics.total,
        uniqueCallers: callMetrics.uniqueCallers,
        answered: callMetrics.answered,
        missed: callMetrics.missed,
        answerRate: callMetrics.answerRate,
        avgDuration: callMetrics.avgDuration,
        byPlatform: callMetrics.byPlatform,
      },

      comparison: {
        spendShare: {
          google: totalSpend > 0 ? (googleApiData.spend / totalSpend) * 100 : 0,
          microsoft: totalSpend > 0 ? (microsoftApiData.spend / totalSpend) * 100 : 0,
        },
        winningPlatform: {
          ctr: googleApiData.ctr > microsoftApiData.ctr ? 'google' :
               microsoftApiData.ctr > googleApiData.ctr ? 'microsoft' : 'tie',
        },
      },

      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
        display,
        period,
      },
    };

    // Cache the response (fire and forget)
    setCache(cacheKey, responseData, CACHE_TTL.DASHBOARD_DATA).catch(() => {});

    return NextResponse.json({ ...responseData, _cached: false });
  } catch (error) {
    console.error('Error in unified dashboard API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
