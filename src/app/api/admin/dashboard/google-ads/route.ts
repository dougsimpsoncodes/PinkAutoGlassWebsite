import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchCampaignPerformance, fetchSearchQueryReport, validateGoogleAdsConfig } from '@/lib/googleAds';

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
      // For today: start at midnight, end at current time
      // Note: For Google Ads API dates (YYYY-MM-DD), both are the same day
      // But for database queries we need the full time range
      return {
        start: today,
        end: mtNow,  // Current time for database queries
        display: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);
      // For yesterday: start at midnight, end at 23:59:59
      return {
        start: yesterday,
        end: yesterdayEnd,  // End of yesterday for database queries
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

    // Format dates for Google Ads API (YYYY-MM-DD)
    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];

    // Get conversion events with gclid for this period (from our database)
    const { data: conversionEvents, error: convError } = await supabase
      .from('conversion_events')
      .select('*')
      .not('gclid', 'is', null)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());

    if (convError) {
      console.error('Error fetching conversion events:', convError);
    }

    // Count website conversion events (clicks on phone/text buttons, form submissions)
    const phoneClicks = conversionEvents?.filter(e => e.event_type === 'phone_click').length || 0;
    const textClicks = conversionEvents?.filter(e => e.event_type === 'text_click').length || 0;
    const formSubmissions = conversionEvents?.filter(e => e.event_type === 'form_submit').length || 0;

    // Count phone calls attributed to Google Ads
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

    // Count already-attributed Google calls
    let actualCalls = allCalls?.filter(c => c.ad_platform === 'google').length || 0;

    // For unattributed calls, check session-based attribution
    const unattributedCalls = allCalls?.filter(c => !c.ad_platform || c.ad_platform === 'direct') || [];

    for (const call of unattributedCalls) {
      const callTime = new Date(call.start_time);
      const windowStart = new Date(callTime.getTime() - matchWindowMs);

      // Check for Google session in window
      const { data: googleSessions } = await supabase
        .from('user_sessions')
        .select('session_id')
        .not('gclid', 'is', null)
        .gte('started_at', windowStart.toISOString())
        .lte('started_at', callTime.toISOString())
        .limit(1);

      if (googleSessions && googleSessions.length > 0) {
        // Check for conflict with Microsoft
        const { data: msSessions } = await supabase
          .from('user_sessions')
          .select('session_id')
          .not('msclkid', 'is', null)
          .gte('started_at', windowStart.toISOString())
          .lte('started_at', callTime.toISOString())
          .limit(1);

        // Only count if no Microsoft session (no conflict)
        if (!msSessions || msSessions.length === 0) {
          actualCalls++;
        }
      }
    }

    // Total leads = actual phone calls + text clicks + form submissions
    const totalLeads = actualCalls + textClicks + formSubmissions;

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
        calls: actualCalls,  // Actual RingCentral calls attributed to Google
        texts: textClicks,
        forms: formSubmissions,
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
