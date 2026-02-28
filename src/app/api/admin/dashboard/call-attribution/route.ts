import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getMountainDateRange, DateFilter } from '@/lib/dashboardData';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/admin/dashboard/call-attribution
 *
 * Returns detailed call attribution data with daily breakdown by source.
 * Sources: Google Ads forwarding, Google Business Profile, website-attributed (RingCentral),
 * and unattributed calls.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || '30days') as DateFilter;
    const { start, end, display, startDateStr, endDateStr } = getMountainDateRange(period);
    const supabase = getSupabaseClient();

    const [
      gadsConversions,
      gadsCalls,
      gbpMetrics,
      rcCalls,
    ] = await Promise.all([
      // Daily Google Ads call conversions (aggregate)
      supabase
        .from('google_ads_call_conversions')
        .select('date, call_conversions, campaign_name')
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date'),

      // Individual Google Ads call records with match status
      supabase
        .from('google_ads_calls')
        .select('start_date_time, call_duration_seconds, call_status, campaign_name, matched_rc_call_id, match_method')
        .gte('start_date_time', `${startDateStr}T00:00:00`)
        .lte('start_date_time', `${endDateStr}T23:59:59`)
        .order('start_date_time'),

      // GBP daily call metrics
      supabase
        .from('gbp_call_metrics')
        .select('date, total_calls, missed_calls, answered_calls')
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date'),

      // Total RingCentral calls for the period (to compute unattributed)
      supabase
        .from('ringcentral_calls')
        .select('start_time, duration, result, google_ads_call_match')
        .gte('start_time', start.toISOString())
        .lte('start_time', end.toISOString())
        .eq('direction', 'Inbound'),
    ]);

    // --- Build daily breakdown ---
    const dailyMap = new Map<string, {
      date: string;
      googleAdsForwarding: number;
      gbpCalls: number;
      websiteAttributed: number;
      unattributed: number;
      totalCalls: number;
    }>();

    // Helper to ensure a day exists in the map
    const ensureDay = (dateStr: string) => {
      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, {
          date: dateStr,
          googleAdsForwarding: 0,
          gbpCalls: 0,
          websiteAttributed: 0,
          unattributed: 0,
          totalCalls: 0,
        });
      }
      return dailyMap.get(dateStr)!;
    };

    // Populate Google Ads forwarding calls by day
    for (const call of gadsCalls.data || []) {
      const dateStr = call.start_date_time?.split('T')[0];
      if (dateStr) {
        ensureDay(dateStr).googleAdsForwarding++;
      }
    }

    // Populate GBP calls by day
    for (const row of gbpMetrics.data || []) {
      const day = ensureDay(row.date);
      day.gbpCalls += row.total_calls || 0;
    }

    // Count RingCentral calls by day and attribution status
    for (const call of rcCalls.data || []) {
      const dateStr = call.start_time?.split('T')[0];
      if (dateStr) {
        const day = ensureDay(dateStr);
        day.totalCalls++;
        if (call.google_ads_call_match) {
          // Already counted as googleAdsForwarding — skip to avoid double-counting
        } else {
          // Website-attributed = inbound calls NOT matched to Google Ads forwarding
          day.websiteAttributed++;
        }
      }
    }

    // Sort daily data
    const dailyBreakdown = Array.from(dailyMap.values()).sort(
      (a, b) => a.date.localeCompare(b.date)
    );

    // --- Aggregates ---
    const totalGadsForwarding = (gadsCalls.data || []).length;
    const matchedToRc = (gadsCalls.data || []).filter(c => c.matched_rc_call_id).length;
    const totalGbp = (gbpMetrics.data || []).reduce((s, r) => s + (r.total_calls || 0), 0);
    const totalRcInbound = (rcCalls.data || []).length;
    const rcMatchedToGads = (rcCalls.data || []).filter(c => c.google_ads_call_match).length;
    const websiteOnly = totalRcInbound - rcMatchedToGads;

    // Aggregate conversion count (from conversion actions, may differ from call_view count)
    const conversionTotal = (gadsConversions.data || []).reduce(
      (s, r) => s + parseFloat(r.call_conversions || 0), 0
    );

    // Match method breakdown
    const matchMethods: Record<string, number> = {};
    for (const call of gadsCalls.data || []) {
      if (call.match_method) {
        matchMethods[call.match_method] = (matchMethods[call.match_method] || 0) + 1;
      }
    }

    // Campaign breakdown for Google Ads forwarding calls
    const campaignCalls: Record<string, number> = {};
    for (const call of gadsCalls.data || []) {
      const name = call.campaign_name || 'Unknown';
      campaignCalls[name] = (campaignCalls[name] || 0) + 1;
    }

    return NextResponse.json({
      summary: {
        googleAdsForwardingCalls: totalGadsForwarding,
        googleAdsConversions: conversionTotal,
        matchedToRingCentral: matchedToRc,
        unmatchedForwarding: totalGadsForwarding - matchedToRc,
        gbpCalls: totalGbp,
        websiteAttributedCalls: websiteOnly,
        totalRingCentralInbound: totalRcInbound,
      },
      matchMethods,
      campaignBreakdown: campaignCalls,
      dailyBreakdown,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
        display,
        period,
      },
    });
  } catch (error: any) {
    console.error('Call attribution detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call attribution data' },
      { status: 500 }
    );
  }
}
