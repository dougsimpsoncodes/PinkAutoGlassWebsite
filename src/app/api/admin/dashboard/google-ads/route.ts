import { NextRequest, NextResponse } from 'next/server';
import { fetchCampaignPerformance, fetchSearchQueryReport, validateGoogleAdsConfig } from '@/lib/googleAds';
import {
  getMountainDateRange,
  getAttributedLeadMetrics,
  getSupabaseClient,
  DateFilter,
} from '@/lib/dashboardData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || '30days') as DateFilter;

    // Use shared date range function (Mountain Time)
    const { start, end, display, startDateStr, endDateStr } = getMountainDateRange(period);
    const supabase = getSupabaseClient();

    // Use shared attribution function for consistent lead counting
    // This counts: forms from leads table + unique callers (30s+ calls)
    const attributedMetrics = await getAttributedLeadMetrics(supabase, start, end);

    // Extract Google-attributed leads
    const googleLeads = attributedMetrics.google;
    const totalLeads = googleLeads.total;
    const actualCalls = googleLeads.calls;  // Unique callers attributed to Google
    const formSubmissions = googleLeads.forms;

    // Fetch real data from Google Ads API
    let spend = 0;
    let clicks = 0;
    let impressions = 0;
    let ctr = 0;
    let apiConversions = 0;

    const config = validateGoogleAdsConfig();
    if (config.isValid) {
      try {
        const campaignData = await fetchCampaignPerformance(startDateStr, endDateStr);

        // Aggregate campaign data
        for (const row of campaignData) {
          spend += row.cost || 0;
          clicks += row.clicks || 0;
          impressions += row.impressions || 0;
          apiConversions += row.conversions || 0;
        }

        ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

        console.log('Google Ads totals:', { spend, clicks, impressions, apiConversions, ctr });
      } catch (apiError) {
        console.error('Error fetching from Google Ads API:', apiError);
        // Fall back to estimates if API fails
        const { data: sessions } = await supabase
          .from('user_sessions')
          .select('session_id')
          .not('gclid', 'is', null)
          .gte('started_at', start.toISOString())
          .lte('started_at', end.toISOString());

        const clickCount = sessions?.length || 0;
        spend = clickCount * 3.00; // Estimate at $3.00 CPC
        clicks = clickCount;
        impressions = clickCount * 50; // Estimate at ~2% CTR
        ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      }
    } else {
      // No API credentials - use session data as fallback
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('session_id')
        .not('gclid', 'is', null)
        .gte('started_at', start.toISOString())
        .lte('started_at', end.toISOString());

      const clickCount = sessions?.length || 0;
      spend = clickCount * 3.00; // Estimate at $3.00 CPC
      clicks = clickCount;
      impressions = clickCount * 50; // Estimate at ~2% CTR
      ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    }

    const costPerLead = totalLeads > 0 ? spend / totalLeads : 0;

    // Fetch search terms data if API is configured
    let topConverters: any[] = [];

    if (config.isValid) {
      try {
        const searchTerms = await fetchSearchQueryReport(startDateStr, endDateStr);

        // Group by search term and aggregate
        const termStats = new Map<string, { clicks: number; cost: number; conversions: number; impressions: number }>();
        for (const row of searchTerms) {
          const term = row.search_term;
          if (!term) continue;

          const existing = termStats.get(term) || { clicks: 0, cost: 0, conversions: 0, impressions: 0 };
          existing.clicks += row.clicks || 0;
          existing.cost += row.cost || 0;
          existing.conversions += row.conversions || 0;
          existing.impressions += row.impressions || 0;
          termStats.set(term, existing);
        }

        // Find top converters (conversions > 0, sorted by conversion rate)
        const convertersList = Array.from(termStats.entries())
          .filter(([, stats]) => stats.conversions > 0 && stats.clicks > 0)
          .map(([term, stats]) => ({
            term,
            conversions: stats.conversions,
            convRate: (stats.conversions / stats.clicks) * 100,
            cpa: stats.cost / stats.conversions,
            clicks: stats.clicks,
          }))
          .sort((a, b) => b.convRate - a.convRate)
          .slice(0, 5);

        topConverters = convertersList;
      } catch (searchError) {
        console.error('Error fetching search terms:', searchError);
      }
    }

    return NextResponse.json({
      spend,
      clicks,
      impressions,
      ctr,
      leads: {
        total: totalLeads,
        calls: actualCalls,  // Unique callers attributed to Google (30s+ calls)
        forms: formSubmissions,  // Form submissions attributed to Google
      },
      costPerLead,
      apiConversions,
      topConverters,
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
