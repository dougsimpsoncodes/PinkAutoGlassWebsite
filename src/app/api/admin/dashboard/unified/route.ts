import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchCampaignPerformance, validateGoogleAdsConfig } from '@/lib/googleAds';
import { fetchAccountPerformance, validateMicrosoftAdsConfig } from '@/lib/microsoftAds';
import { getCache, getCacheKey, CACHE_TTL, setCache } from '@/lib/cache';
import {
  getMountainDateRange,
  getCallMetrics,
  DateFilter,
} from '@/lib/dashboardData';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Unified Dashboard API Route
 *
 * Provides: ad spend/clicks/impressions (from ad platform APIs),
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

    // Fetch call metrics, revenue, cost-of-goods, and ad platform data in parallel
    const [
      callMetrics,
      revenueResult,
      costResult,
      googleApiData,
      microsoftApiData,
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
      fetchGoogleAdsData(startDateStr, endDateStr),
      fetchMicrosoftAdsData(startDateStr, endDateStr, start, end),
    ]);

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

async function fetchGoogleAdsData(startDate: string, endDate: string) {
  // Check cache first (5-min TTL for external APIs)
  const cacheKey = `google-ads:${startDate}:${endDate}`;
  const cached = await getCache<{ spend: number; clicks: number; impressions: number; ctr: number }>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  let spend = 0;
  let clicks = 0;
  let impressions = 0;
  let ctr = 0;

  const config = validateGoogleAdsConfig();
  if (config.isValid) {
    try {
      const campaignData = await fetchCampaignPerformance(startDate, endDate);
      for (const row of campaignData) {
        spend += row.cost || 0;
        clicks += row.clicks || 0;
        impressions += row.impressions || 0;
      }
      ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    } catch (error) {
      console.error('Error fetching Google Ads data:', error);
    }
  }

  const result = { spend, clicks, impressions, ctr };
  setCache(cacheKey, result, CACHE_TTL.GOOGLE_ADS).catch(() => {});
  return result;
}

async function fetchMicrosoftAdsData(startDate: string, endDate: string, startDateObj: Date, endDateObj: Date) {
  // Check cache first (5-min TTL for external APIs)
  const cacheKey = `microsoft-ads:${startDate}:${endDate}`;
  const cached = await getCache<{ spend: number; clicks: number; impressions: number; ctr: number }>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  let spend = 0;
  let clicks = 0;
  let impressions = 0;
  let ctr = 0;

  const config = validateMicrosoftAdsConfig();
  let usedFallback = false;

  if (config.isValid) {
    try {
      const accountData = await fetchAccountPerformance(startDate, endDate);

      if (accountData && accountData.spend > 0) {
        spend = accountData.spend;
        clicks = accountData.clicks;
        impressions = accountData.impressions;
        ctr = accountData.ctr;
      } else {
        usedFallback = true;
      }
    } catch (error) {
      console.error('Error fetching Microsoft Ads data:', error);
      usedFallback = true;
    }
  } else {
    usedFallback = true;
  }

  // Fallback to session-based estimates
  if (usedFallback) {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('session_id')
      .not('msclkid', 'is', null)
      .gte('started_at', startDateObj.toISOString())
      .lte('started_at', endDateObj.toISOString());

    const msClickCount = sessions?.length || 0;
    spend = msClickCount * 2.50;
    clicks = msClickCount;
    impressions = msClickCount * 60;
    ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  }

  const result = { spend, clicks, impressions, ctr };
  setCache(cacheKey, result, CACHE_TTL.MICROSOFT_ADS).catch(() => {});
  return result;
}
