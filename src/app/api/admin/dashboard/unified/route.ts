import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchCampaignPerformance, validateGoogleAdsConfig } from '@/lib/googleAds';
import { fetchAccountPerformance, validateMicrosoftAdsConfig } from '@/lib/microsoftAds';
import { getCache, getCacheKey, CACHE_TTL, setCache } from '@/lib/cache';
import {
  getMountainDateRange,
  getLeadMetrics,
  getCallMetrics,
  DateFilter,
  MIN_CALL_DURATION_SECONDS,
  ATTRIBUTION_WINDOW_MINUTES,
} from '@/lib/dashboardData';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Fetch unified metrics using shared functions (consistent with Leads/Calls pages)
    const [unifiedLeadMetrics, unifiedCallMetrics] = await Promise.all([
      getLeadMetrics(supabase, start, end),
      getCallMetrics(supabase, start, end),
    ]);

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
    const matchWindowMs = ATTRIBUTION_WINDOW_MINUTES * 60 * 1000;

    const calls = allCalls.data || [];
    // NOTE: Database stores 'microsoft' (not 'bing') per src/lib/attribution.ts
    let googleCalls = calls.filter(c => c.ad_platform === 'google').length;
    let microsoftCalls = calls.filter(c => c.ad_platform === 'microsoft').length;
    const answeredCalls = calls.filter(c => c.result === 'Accepted' || c.result === 'Call connected').length;
    const missedCalls = calls.filter(c => c.result === 'Missed').length;

    // For unattributed calls, check session-based attribution (5-min window)
    // OPTIMIZED: Batch query instead of N+1 queries per call
    const unattributedCalls = calls.filter(c => !c.ad_platform || c.ad_platform === 'direct');

    if (unattributedCalls.length > 0) {
      // Find the full time range needed for all calls (earliest window start to latest call time)
      const callTimes = unattributedCalls.map(c => new Date(c.start_time).getTime());
      const earliestWindowStart = new Date(Math.min(...callTimes) - matchWindowMs);
      const latestCallTime = new Date(Math.max(...callTimes));

      // Fetch ALL relevant sessions in ONE query (instead of 2 queries per call)
      const [{ data: googleSessions }, { data: msSessions }] = await Promise.all([
        supabase
          .from('user_sessions')
          .select('session_id, started_at')
          .not('gclid', 'is', null)
          .gte('started_at', earliestWindowStart.toISOString())
          .lte('started_at', latestCallTime.toISOString()),
        supabase
          .from('user_sessions')
          .select('session_id, started_at')
          .not('msclkid', 'is', null)
          .gte('started_at', earliestWindowStart.toISOString())
          .lte('started_at', latestCallTime.toISOString()),
      ]);

      // Match calls to sessions in JavaScript (O(n*m) but in-memory = fast)
      for (const call of unattributedCalls) {
        const callTime = new Date(call.start_time).getTime();
        const windowStart = callTime - matchWindowMs;

        // Check for Google session in this call's 5-min window
        const hasGoogle = (googleSessions || []).some(s => {
          const sessionTime = new Date(s.started_at).getTime();
          return sessionTime >= windowStart && sessionTime <= callTime;
        });

        // Check for Microsoft session in this call's 5-min window
        const hasMs = (msSessions || []).some(s => {
          const sessionTime = new Date(s.started_at).getTime();
          return sessionTime >= windowStart && sessionTime <= callTime;
        });

        // Only attribute if exactly one platform has a session (no conflict)
        if (hasGoogle && !hasMs) {
          googleCalls++;
        } else if (hasMs && !hasGoogle) {
          microsoftCalls++;
        }
      }
    }

    const directCalls = calls.length - googleCalls - microsoftCalls;

    // Process leads by attribution
    // NOTE: Database stores 'microsoft' (not 'bing') per src/lib/attribution.ts
    const leads = allLeads.data || [];
    const googleLeads = leads.filter(l => l.ad_platform === 'google').length;
    const microsoftLeads = leads.filter(l => l.ad_platform === 'microsoft').length;
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

    // Build response data
    const responseData = {
      // Executive Summary KPIs - uses unified metrics (consistent with Leads page)
      summary: {
        totalSpend,
        // UNIFIED: Total leads = form submissions + unique qualifying callers
        totalLeads: unifiedLeadMetrics.total,
        costPerLead: unifiedLeadMetrics.total > 0 ? totalSpend / unifiedLeadMetrics.total : 0,
        totalClicks,
        totalImpressions,
        overallCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        conversionRate: totalClicks > 0 ? (unifiedLeadMetrics.total / totalClicks) * 100 : 0,
        totalRevenue: unifiedLeadMetrics.totalRevenue,
        roas: totalSpend > 0 ? unifiedLeadMetrics.totalRevenue / totalSpend : 0,
      },

      // Platform breakdown (attributed leads for ads reporting)
      platforms: {
        google,
        microsoft,
        other,
      },

      // Call metrics - uses unified metrics (consistent with Calls page)
      calls: {
        total: unifiedCallMetrics.total,
        uniqueCallers: unifiedCallMetrics.uniqueCallers,
        answered: unifiedCallMetrics.answered,
        missed: unifiedCallMetrics.missed,
        answerRate: unifiedCallMetrics.answerRate,
        avgDuration: unifiedCallMetrics.avgDuration,
        byPlatform: {
          google: googleCalls,
          microsoft: microsoftCalls,
          direct: directCalls,
        },
      },

      // Form lead metrics (consistent with Leads page)
      formLeads: {
        total: unifiedLeadMetrics.forms,
        new: unifiedLeadMetrics.byStatus.new,
        byPlatform: {
          google: googleLeads,
          microsoft: microsoftLeads,
          direct: directLeads,
        },
        byStatus: unifiedLeadMetrics.byStatus,
      },

      // Unified lead metrics (forms + unique callers - matches Leads page exactly)
      unifiedLeads: {
        total: unifiedLeadMetrics.total,
        forms: unifiedLeadMetrics.forms,
        uniqueCallers: unifiedLeadMetrics.uniqueCallers,
        revenue: unifiedLeadMetrics.totalRevenue,
      },

      // Legacy "leads" field for backwards compatibility
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
    };

    // Cache the response for next time (fire and forget)
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
  // Cache for 5 minutes (external API data doesn't change frequently)
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

  const result = { spend, clicks, impressions, ctr };
  // Cache for 5 minutes (external API data doesn't change frequently)
  setCache(cacheKey, result, CACHE_TTL.MICROSOFT_ADS).catch(() => {});
  return result;
}
