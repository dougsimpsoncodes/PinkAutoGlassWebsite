import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchAccountPerformance, fetchSearchTerms, validateMicrosoftAdsConfig } from '@/lib/microsoftAds';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get current time in Mountain Time (UTC-7)
function getMountainTime(): Date {
  const now = new Date();
  const mtOffset = -7 * 60; // Mountain Time offset in minutes
  const utcNow = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utcNow + (mtOffset * 60000));
}

function getDateRange(period: string): { start: Date; end: Date; display: string } {
  // Use Mountain Time for all date calculations (business is in Denver)
  const mtNow = getMountainTime();
  const today = new Date(mtNow.getFullYear(), mtNow.getMonth(), mtNow.getDate());

  switch (period) {
    case 'today':
      // For single day, use same date for start and end (BETWEEN is inclusive in reporting APIs)
      return {
        start: today,
        end: today,  // Same day
        display: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      // For single day, use same date for start and end (BETWEEN is inclusive in reporting APIs)
      return {
        start: yesterday,
        end: yesterday,  // Same day
        display: yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
    case '7days':
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return {
        start: sevenDaysAgo,
        end: mtNow,
        display: `${sevenDaysAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${mtNow.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      };
    case '30days':
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return {
        start: thirtyDaysAgo,
        end: mtNow,
        display: `${thirtyDaysAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${mtNow.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      };
    case 'all':
    default:
      const allTimeStart = new Date('2024-01-01');
      return {
        start: allTimeStart,
        end: mtNow,
        display: `${allTimeStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${mtNow.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30days';
    const { start, end, display } = getDateRange(period);

    // Format dates for Microsoft Ads API (YYYY-MM-DD)
    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];

    // Get conversion events with msclkid for this period (from our database)
    const { data: conversionEvents, error: convError } = await supabase
      .from('conversion_events')
      .select('*')
      .not('msclkid', 'is', null)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());

    if (convError) {
      console.error('Error fetching conversion events:', convError);
    }

    // Count website conversion events (clicks on phone/text buttons, form submissions)
    const phoneClicks = conversionEvents?.filter(e => e.event_type === 'phone_click').length || 0;
    const textClicks = conversionEvents?.filter(e => e.event_type === 'text_click').length || 0;
    const formSubmissions = conversionEvents?.filter(e => e.event_type === 'form_submit').length || 0;

    // Count phone calls attributed to Microsoft Ads
    // Includes: direct phone_click match + session-based match (5-min window)
    const ATTRIBUTION_WINDOW_MINUTES = 5;
    const matchWindowMs = ATTRIBUTION_WINDOW_MINUTES * 60 * 1000;

    // Get all qualifying inbound calls in this period
    const { data: allCalls, error: callsError } = await supabase
      .from('ringcentral_calls')
      .select('call_id, start_time, ad_platform')
      .eq('direction', 'Inbound')
      .gte('duration', 30)
      .gte('start_time', start.toISOString())
      .lte('start_time', end.toISOString());

    if (callsError) {
      console.error('Error fetching calls:', callsError);
    }

    // Count already-attributed Microsoft/Bing calls
    let actualCalls = allCalls?.filter(c => c.ad_platform === 'bing').length || 0;

    // For unattributed calls, check session-based attribution
    const unattributedCalls = allCalls?.filter(c => !c.ad_platform || c.ad_platform === 'direct') || [];

    for (const call of unattributedCalls) {
      const callTime = new Date(call.start_time);
      const windowStart = new Date(callTime.getTime() - matchWindowMs);

      // Check for Microsoft session in window
      const { data: msSessions } = await supabase
        .from('user_sessions')
        .select('session_id')
        .not('msclkid', 'is', null)
        .gte('started_at', windowStart.toISOString())
        .lte('started_at', callTime.toISOString())
        .limit(1);

      if (msSessions && msSessions.length > 0) {
        // Check for conflict with Google
        const { data: googleSessions } = await supabase
          .from('user_sessions')
          .select('session_id')
          .not('gclid', 'is', null)
          .gte('started_at', windowStart.toISOString())
          .lte('started_at', callTime.toISOString())
          .limit(1);

        // Only count if no Google session (no conflict)
        if (!googleSessions || googleSessions.length === 0) {
          actualCalls++;
        }
      }
    }

    // Total leads = actual phone calls + text clicks + form submissions
    const totalLeads = actualCalls + textClicks + formSubmissions;

    // Fetch real data from Microsoft Ads API
    let spend = 0;
    let clicks = 0;
    let impressions = 0;
    let ctr = 0;
    let apiConversions = 0;

    const config = validateMicrosoftAdsConfig();
    console.log('Microsoft Ads config valid:', config.isValid, 'missing:', config.missingVars);

    if (config.isValid) {
      try {
        console.log('Fetching Microsoft Ads account performance for', startDateStr, 'to', endDateStr);
        const accountData = await fetchAccountPerformance(startDateStr, endDateStr);
        console.log('Microsoft Ads API response:', accountData);

        if (accountData && accountData.spend > 0) {
          spend = accountData.spend;
          clicks = accountData.clicks;
          impressions = accountData.impressions;
          ctr = accountData.ctr;
          apiConversions = accountData.conversions;
          console.log('Microsoft Ads: Using API data - spend:', spend, 'clicks:', clicks);
        } else {
          // API returned null or zero spend - fall back to estimates
          console.log('Microsoft Ads: API returned no data, using session estimates');
          const { data: sessions } = await supabase
            .from('user_sessions')
            .select('session_id')
            .not('msclkid', 'is', null)
            .gte('started_at', start.toISOString())
            .lte('started_at', end.toISOString());

          const msClickCount = sessions?.length || 0;
          spend = msClickCount * 2.50; // Estimate at $2.50 CPC
          clicks = msClickCount;
          impressions = msClickCount * 60; // Estimate at ~1.67% CTR
          ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
          console.log('Microsoft Ads: Using session estimates - sessions:', msClickCount, 'spend:', spend);
        }
      } catch (apiError) {
        console.error('Error fetching from Microsoft Ads API:', apiError);
        // Fall back to estimates if API fails
        const { data: sessions } = await supabase
          .from('user_sessions')
          .select('session_id')
          .not('msclkid', 'is', null)
          .gte('started_at', start.toISOString())
          .lte('started_at', end.toISOString());

        const msClickCount = sessions?.length || 0;
        spend = msClickCount * 2.50; // Estimate
        clicks = msClickCount;
        impressions = msClickCount * 60;
        ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        console.log('Microsoft Ads: API error, using session estimates - sessions:', msClickCount);
      }
    } else {
      // No API credentials - use session data as fallback
      console.log('Microsoft Ads: No valid config, using session estimates');
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('session_id')
        .not('msclkid', 'is', null)
        .gte('started_at', start.toISOString())
        .lte('started_at', end.toISOString());

      const msClickCount = sessions?.length || 0;
      spend = msClickCount * 2.50; // Estimate at $2.50 CPC
      clicks = msClickCount;
      impressions = msClickCount * 60; // Estimate at ~1.67% CTR
      ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    }

    const costPerLead = totalLeads > 0 ? spend / totalLeads : 0;

    // Fetch search terms data if API is configured
    let topConverters: any[] = [];
    let wastedSpend: any[] = [];

    if (config.isValid) {
      try {
        const searchTerms = await fetchSearchTerms(startDateStr, endDateStr);

        // Group by search term and aggregate
        const termStats = new Map<string, { clicks: number; cost: number; conversions: number; impressions: number }>();
        for (const row of searchTerms) {
          const term = row.search_term || row.SearchQuery;
          if (!term) continue;

          const existing = termStats.get(term) || { clicks: 0, cost: 0, conversions: 0, impressions: 0 };
          existing.clicks += row.clicks || parseInt(row.Clicks) || 0;
          existing.cost += row.cost_micros ? row.cost_micros / 1000000 : parseFloat(row.Spend) || 0;
          existing.conversions += row.conversions || parseFloat(row.Conversions) || 0;
          existing.impressions += row.impressions || parseInt(row.Impressions) || 0;
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

        // Find wasted spend (clicks > 3, no conversions)
        const wastedList = Array.from(termStats.entries())
          .filter(([, stats]) => stats.conversions === 0 && stats.clicks > 3)
          .map(([term, stats]) => ({
            term,
            clicks: stats.clicks,
            cost: stats.cost,
            conversions: 0,
          }))
          .sort((a, b) => b.cost - a.cost)
          .slice(0, 5);

        wastedSpend = wastedList;
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
        calls: actualCalls,  // Actual RingCentral calls attributed to Microsoft
        texts: textClicks,
        forms: formSubmissions,
      },
      costPerLead,
      topConverters,
      wastedSpend,
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
