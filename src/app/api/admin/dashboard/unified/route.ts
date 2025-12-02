import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchCampaignPerformance, validateGoogleAdsConfig } from '@/lib/googleAds';
import { fetchAccountPerformance, validateMicrosoftAdsConfig } from '@/lib/microsoftAds';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MIN_CALL_DURATION_SECONDS = 30;

interface DateRangeResult {
  start: Date;
  end: Date;
  display: string;
}

// Get current time in Mountain Time (UTC-7)
function getMountainTime(): Date {
  const now = new Date();
  const mtOffset = -7 * 60; // Mountain Time offset in minutes
  const utcNow = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utcNow + (mtOffset * 60000));
}

function getDateRange(period: string): DateRangeResult {
  // Use Mountain Time for all date calculations (business is in Denver)
  const mtNow = getMountainTime();
  const today = new Date(mtNow.getFullYear(), mtNow.getMonth(), mtNow.getDate());

  switch (period) {
    case 'today':
      // For today: start at midnight, end at current time
      // Note: For Ads API dates (YYYY-MM-DD), both are the same day
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

interface PlatformMetrics {
  spend: number;
  clicks: number;
  impressions: number;
  ctr: number;
  leads: {
    total: number;
    calls: number;
    texts: number;
    forms: number;
  };
  costPerLead: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30days';
    const { start, end, display } = getDateRange(period);

    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];

    // Fetch all data in parallel
    const [
      googleConvEvents,
      microsoftConvEvents,
      allLeads,
      allCalls,
      googleApiData,
      microsoftApiData,
    ] = await Promise.all([
      // Google conversion events
      supabase
        .from('conversion_events')
        .select('event_type, gclid, created_at')
        .not('gclid', 'is', null)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString()),
      // Microsoft conversion events
      supabase
        .from('conversion_events')
        .select('event_type, msclkid, created_at')
        .not('msclkid', 'is', null)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString()),
      // All leads with attribution
      supabase
        .from('leads')
        .select('id, ad_platform, created_at, status, revenue_amount')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString()),
      // All calls with attribution
      supabase
        .from('ringcentral_calls')
        .select('call_id, ad_platform, start_time, duration, direction, result')
        .eq('direction', 'Inbound')
        .gte('duration', MIN_CALL_DURATION_SECONDS)
        .gte('start_time', start.toISOString())
        .lte('start_time', end.toISOString()),
      // Google Ads API
      fetchGoogleAdsData(startDateStr, endDateStr),
      // Microsoft Ads API (with session fallback)
      fetchMicrosoftAdsData(startDateStr, endDateStr, start, end),
    ]);

    // Process Google Ads leads
    const googleEvents = googleConvEvents.data || [];
    const googlePhoneClicks = googleEvents.filter(e => e.event_type === 'phone_click').length;
    const googleTextClicks = googleEvents.filter(e => e.event_type === 'text_click').length;
    const googleFormSubmits = googleEvents.filter(e => e.event_type === 'form_submit').length;

    // Process Microsoft Ads leads
    const microsoftEvents = microsoftConvEvents.data || [];
    const microsoftPhoneClicks = microsoftEvents.filter(e => e.event_type === 'phone_click').length;
    const microsoftTextClicks = microsoftEvents.filter(e => e.event_type === 'text_click').length;
    const microsoftFormSubmits = microsoftEvents.filter(e => e.event_type === 'form_submit').length;

    // Process calls by attribution (including session-based matching)
    const ATTRIBUTION_WINDOW_MINUTES = 5;
    const matchWindowMs = ATTRIBUTION_WINDOW_MINUTES * 60 * 1000;

    const calls = allCalls.data || [];
    let googleCalls = calls.filter(c => c.ad_platform === 'google').length;
    let microsoftCalls = calls.filter(c => c.ad_platform === 'bing').length;
    const answeredCalls = calls.filter(c => c.result === 'Accepted' || c.result === 'Call connected').length;
    const missedCalls = calls.filter(c => c.result === 'Missed').length;

    // For unattributed calls, check session-based attribution (5-min window)
    const unattributedCalls = calls.filter(c => !c.ad_platform || c.ad_platform === 'direct');

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

      // Check for Microsoft session in window
      const { data: msSessions } = await supabase
        .from('user_sessions')
        .select('session_id')
        .not('msclkid', 'is', null)
        .gte('started_at', windowStart.toISOString())
        .lte('started_at', callTime.toISOString())
        .limit(1);

      const hasGoogle = googleSessions && googleSessions.length > 0;
      const hasMs = msSessions && msSessions.length > 0;

      // Only attribute if exactly one platform has a session (no conflict)
      if (hasGoogle && !hasMs) {
        googleCalls++;
      } else if (hasMs && !hasGoogle) {
        microsoftCalls++;
      }
    }

    const directCalls = calls.length - googleCalls - microsoftCalls;

    // Process leads by attribution
    const leads = allLeads.data || [];
    const googleLeads = leads.filter(l => l.ad_platform === 'google').length;
    const microsoftLeads = leads.filter(l => l.ad_platform === 'bing').length;
    const directLeads = leads.filter(l => l.ad_platform === 'direct' || !l.ad_platform).length;
    const newLeads = leads.filter(l => l.status === 'new').length;
    const totalRevenue = leads.reduce((sum, l) => sum + (l.revenue_amount || 0), 0);

    // Calculate totals for each platform (calls + texts + forms)
    const googleTotalLeads = googleCalls + googleTextClicks + googleFormSubmits;
    const microsoftTotalLeads = microsoftCalls + microsoftTextClicks + microsoftFormSubmits;

    // Calculate "other" leads (unattributed calls + events without click IDs)
    const otherCalls = directCalls;
    const { data: otherEvents } = await supabase
      .from('conversion_events')
      .select('event_type')
      .is('gclid', null)
      .is('msclkid', null)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());

    const otherTextClicks = otherEvents?.filter(e => e.event_type === 'text_click').length || 0;
    const otherFormSubmits = otherEvents?.filter(e => e.event_type === 'form_submit').length || 0;
    const otherTotalLeads = otherCalls + otherTextClicks + otherFormSubmits;

    // Build platform metrics
    const google: PlatformMetrics = {
      spend: googleApiData.spend,
      clicks: googleApiData.clicks,
      impressions: googleApiData.impressions,
      ctr: googleApiData.ctr,
      leads: {
        total: googleTotalLeads,
        calls: googleCalls,
        texts: googleTextClicks,
        forms: googleFormSubmits,
      },
      costPerLead: googleTotalLeads > 0 ? googleApiData.spend / googleTotalLeads : 0,
    };

    const microsoft: PlatformMetrics = {
      spend: microsoftApiData.spend,
      clicks: microsoftApiData.clicks,
      impressions: microsoftApiData.impressions,
      ctr: microsoftApiData.ctr,
      leads: {
        total: microsoftTotalLeads,
        calls: microsoftCalls,
        texts: microsoftTextClicks,
        forms: microsoftFormSubmits,
      },
      costPerLead: microsoftTotalLeads > 0 ? microsoftApiData.spend / microsoftTotalLeads : 0,
    };

    const other: PlatformMetrics = {
      spend: 0,
      clicks: 0,
      impressions: 0,
      ctr: 0,
      leads: {
        total: otherTotalLeads,
        calls: otherCalls,
        texts: otherTextClicks,
        forms: otherFormSubmits,
      },
      costPerLead: 0,
    };

    // Combined totals (including other/unattributed)
    const totalSpend = google.spend + microsoft.spend;
    const totalLeads = googleTotalLeads + microsoftTotalLeads + otherTotalLeads;
    const attributedLeads = googleTotalLeads + microsoftTotalLeads;
    const totalClicks = google.clicks + microsoft.clicks;
    const totalImpressions = google.impressions + microsoft.impressions;

    return NextResponse.json({
      // Executive Summary KPIs
      summary: {
        totalSpend,
        totalLeads,
        costPerLead: totalLeads > 0 ? totalSpend / totalLeads : 0,
        totalClicks,
        totalImpressions,
        overallCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        conversionRate: totalClicks > 0 ? (totalLeads / totalClicks) * 100 : 0,
        totalRevenue,
        roas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
      },

      // Platform breakdown
      platforms: {
        google,
        microsoft,
        other,
      },

      // Call metrics
      calls: {
        total: calls.length,
        answered: answeredCalls,
        missed: missedCalls,
        answerRate: calls.length > 0 ? (answeredCalls / calls.length) * 100 : 0,
        byPlatform: {
          google: googleCalls,
          microsoft: microsoftCalls,
          direct: directCalls,
        },
      },

      // Lead metrics (form submissions)
      leads: {
        total: leads.length,
        new: newLeads,
        byPlatform: {
          google: googleLeads,
          microsoft: microsoftLeads,
          direct: directLeads,
        },
      },

      // Comparison metrics
      comparison: {
        cplDifference: google.costPerLead - microsoft.costPerLead,
        ctrDifference: google.ctr - microsoft.ctr,
        spendShare: {
          google: totalSpend > 0 ? (google.spend / totalSpend) * 100 : 0,
          microsoft: totalSpend > 0 ? (microsoft.spend / totalSpend) * 100 : 0,
        },
        leadShare: {
          google: totalLeads > 0 ? (googleTotalLeads / totalLeads) * 100 : 0,
          microsoft: totalLeads > 0 ? (microsoftTotalLeads / totalLeads) * 100 : 0,
          other: totalLeads > 0 ? (otherTotalLeads / totalLeads) * 100 : 0,
        },
        winningPlatform: {
          cpl: google.costPerLead < microsoft.costPerLead ? 'google' :
               microsoft.costPerLead < google.costPerLead ? 'microsoft' : 'tie',
          ctr: google.ctr > microsoft.ctr ? 'google' :
               microsoft.ctr > google.ctr ? 'microsoft' : 'tie',
          volume: googleTotalLeads > microsoftTotalLeads ? 'google' :
                  microsoftTotalLeads > googleTotalLeads ? 'microsoft' : 'tie',
        },
      },

      // Date range info
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
        display,
        period,
      },
    });
  } catch (error) {
    console.error('Error in unified dashboard API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

async function fetchGoogleAdsData(startDate: string, endDate: string) {
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

  return { spend, clicks, impressions, ctr };
}

async function fetchMicrosoftAdsData(startDate: string, endDate: string, startDateObj: Date, endDateObj: Date) {
  let spend = 0;
  let clicks = 0;
  let impressions = 0;
  let ctr = 0;

  const config = validateMicrosoftAdsConfig();
  console.log('Unified - Microsoft Ads config valid:', config.isValid, 'missing:', config.missingVars);

  let usedFallback = false;

  if (config.isValid) {
    try {
      console.log('Unified - Fetching Microsoft Ads data for', startDate, 'to', endDate);
      const accountData = await fetchAccountPerformance(startDate, endDate);
      console.log('Unified - Microsoft Ads API response:', accountData);

      if (accountData && accountData.spend > 0) {
        spend = accountData.spend;
        clicks = accountData.clicks;
        impressions = accountData.impressions;
        ctr = accountData.ctr;
        console.log('Unified - Microsoft Ads: Using API data - spend:', spend, 'clicks:', clicks);
      } else {
        console.log('Unified - Microsoft Ads: API returned null or zero spend, using session fallback');
        usedFallback = true;
      }
    } catch (error) {
      console.error('Error fetching Microsoft Ads data:', error);
      usedFallback = true;
    }
  } else {
    console.log('Unified - Microsoft Ads: Config invalid, using session fallback');
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
    spend = msClickCount * 2.50; // Estimate at $2.50 CPC
    clicks = msClickCount;
    impressions = msClickCount * 60; // Estimate at ~1.67% CTR
    ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    console.log('Unified - Microsoft Ads: Using session estimates - sessions:', msClickCount, 'spend:', spend);
  }

  return { spend, clicks, impressions, ctr };
}
