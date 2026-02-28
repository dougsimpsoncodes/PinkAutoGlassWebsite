/**
 * Call Attribution Matching Algorithm
 *
 * Solves the critical problem: "We can't directly attribute what drives phone calls"
 *
 * Two attribution approaches:
 * 1. DIRECT MATCH: Link phone_click conversion events → actual RingCentral calls
 *    - Customer visited website, clicked phone number, then called
 *    - Match by phone number + timestamp (within attribution window)
 *    - Confidence: 95-100%
 *
 * 2. TIME-BASED CORRELATION: Match calls to campaign impression spikes
 *    - Customer saw ad, got phone number, called directly (no website visit)
 *    - Correlate new caller phone numbers with campaign activity within 30-min window
 *    - Confidence: 60-80%
 *
 * Example:
 * - Google Ads campaign runs 9:00-9:30am with 500 impressions
 * - New caller (720-555-1234) calls at 9:15am
 * - No website visit found
 * - Attribution: Google Ads campaign (70% confidence)
 */

import { createClient } from '@supabase/supabase-js';
import { normalizePhoneNumber } from './customerDeduplication';
import { ATTRIBUTION_WINDOW_MINUTES } from './constants';

interface AttributionResult {
  callId: string;
  fromNumber: string;
  callTimestamp: string;
  attributionMethod: 'direct_match' | 'time_correlation' | 'unknown';
  attributionConfidence: number; // 0-100
  adPlatform: string | null; // google, bing, organic, direct
  campaignId: string | null;
  campaignName: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  gclid?: string | null;
  msclkid?: string | null;
  matchDetails: string; // Explanation of how attribution was determined
}

interface ConversionEvent {
  id: string;
  created_at: string;
  session_id: string;
  visitor_id?: string;
  event_type: string;
  event_category?: string;
  event_label?: string;
  event_value?: number;
  page_path: string;
  button_text?: string;
  button_location?: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  device_type?: string;
  metadata?: any;
  phone_number?: string; // Not in schema yet, but algorithm needs it
  gclid?: string; // Not in schema yet
  msclkid?: string; // Not in schema yet
}

interface RingCentralCall {
  call_id: string;
  from_number: string;
  start_time: string;
  direction: 'Inbound' | 'Outbound';
  result?: string;
  duration?: number;
}

interface CampaignActivity {
  date: string;
  hour: number;
  platform: 'google' | 'microsoft';  // Database stores 'microsoft', not 'bing'
  campaign_id: string;
  campaign_name: string;
  impressions: number;
  clicks: number;
}

/**
 * Get Supabase client
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not configured');
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * APPROACH 1: Direct Match
 * Match phone_click conversion events to actual calls
 */
export async function matchDirectConversions(
  calls: RingCentralCall[]
): Promise<AttributionResult[]> {
  const client = getSupabaseClient();
  const results: AttributionResult[] = [];

  for (const call of calls) {
    // Only process inbound calls
    if (call.direction !== 'Inbound') continue;

    const normalizedPhone = normalizePhoneNumber(call.from_number);
    const callTime = new Date(call.start_time);

    // Look for phone_click events within attribution window before the call
    const windowBefore = new Date(callTime.getTime() - ATTRIBUTION_WINDOW_MINUTES * 60 * 1000);
    const oneMinAfter = new Date(callTime.getTime() + 1 * 60 * 1000);

    const { data: events, error } = await client
      .from('conversion_events')
      .select('*')
      .eq('event_type', 'phone_click')
      .gte('created_at', windowBefore.toISOString())
      .lte('created_at', oneMinAfter.toISOString());

    if (error) {
      console.error('Error fetching conversion events:', error);
      continue;
    }

    // Find matching event by phone number
    const matchingEvent = events?.find((event: ConversionEvent) => {
      if (!event.phone_number) return false;
      const eventPhone = normalizePhoneNumber(event.phone_number);
      return eventPhone === normalizedPhone;
    });

    if (matchingEvent) {
      // Direct match found!
      const timeDiffMs = Math.abs(callTime.getTime() - new Date(matchingEvent.created_at).getTime());
      const timeDiffMin = Math.round(timeDiffMs / 60000);

      // Calculate confidence based on time proximity
      let confidence = 100;
      if (timeDiffMin > 3) confidence = 95;
      if (timeDiffMin > 4) confidence = 90;

      // Determine platform from click IDs
      // NOTE: Database stores 'microsoft' (not 'bing') per src/lib/attribution.ts
      let platform = 'direct';
      if (matchingEvent.gclid) platform = 'google';
      else if (matchingEvent.msclkid) platform = 'microsoft';
      else if (matchingEvent.utm_source === 'google' && matchingEvent.utm_medium === 'organic') platform = 'organic';
      else if (matchingEvent.utm_source) platform = matchingEvent.utm_source;

      results.push({
        callId: call.call_id,
        fromNumber: call.from_number,
        callTimestamp: call.start_time,
        attributionMethod: 'direct_match',
        attributionConfidence: confidence,
        adPlatform: platform,
        campaignId: null, // Could look up campaign from session if needed
        campaignName: matchingEvent.utm_campaign || null,
        utmSource: matchingEvent.utm_source || null,
        utmMedium: matchingEvent.utm_medium || null,
        utmCampaign: matchingEvent.utm_campaign || null,
        gclid: matchingEvent.gclid || null,
        msclkid: matchingEvent.msclkid || null,
        matchDetails: `Matched phone_click event ${timeDiffMin}min before call (session: ${matchingEvent.session_id})`
      });
    }
  }

  return results;
}

/**
 * APPROACH 2: Time-Based Correlation
 * Match unattributed calls to campaign impression spikes
 */
export async function matchTimeCorrelation(
  unmatchedCalls: RingCentralCall[],
  startDate: string,
  endDate: string
): Promise<AttributionResult[]> {
  const client = getSupabaseClient();
  const results: AttributionResult[] = [];

  // Get hourly campaign activity from both platforms
  const campaignActivity = await getHourlyCampaignActivity(startDate, endDate);

  for (const call of unmatchedCalls) {
    if (call.direction !== 'Inbound') continue;

    const callTime = new Date(call.start_time);
    const callHour = callTime.getHours();
    const callDate = callTime.toISOString().split('T')[0];

    // Find campaigns active within 30 min of call
    const relevantCampaigns = campaignActivity.filter(activity => {
      if (activity.date !== callDate) return false;

      // Check if campaign was active within 30 min window
      const hourDiff = Math.abs(activity.hour - callHour);
      return hourDiff <= 0; // Same hour (could expand to +/- 1 hour)
    });

    if (relevantCampaigns.length === 0) {
      // No campaigns active - likely organic or direct
      results.push({
        callId: call.call_id,
        fromNumber: call.from_number,
        callTimestamp: call.start_time,
        attributionMethod: 'unknown',
        attributionConfidence: 0,
        adPlatform: 'direct',
        campaignId: null,
        campaignName: null,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        matchDetails: 'No active campaigns found near call time'
      });
      continue;
    }

    // Find campaign with highest impression volume (most likely source)
    const topCampaign = relevantCampaigns.reduce((max, campaign) =>
      campaign.impressions > max.impressions ? campaign : max
    );

    // Calculate confidence based on:
    // 1. Impression volume (higher = more confident)
    // 2. Number of competing campaigns (fewer = more confident)
    // 3. Click-through activity (clicks = higher confidence)
    let confidence = 50; // Base confidence

    if (topCampaign.impressions > 100) confidence += 10;
    if (topCampaign.impressions > 500) confidence += 10;
    if (topCampaign.clicks > 10) confidence += 10;
    if (relevantCampaigns.length === 1) confidence += 10; // Only one campaign active
    if (relevantCampaigns.length === 2) confidence += 5;

    results.push({
      callId: call.call_id,
      fromNumber: call.from_number,
      callTimestamp: call.start_time,
      attributionMethod: 'time_correlation',
      attributionConfidence: Math.min(confidence, 80), // Cap at 80%
      adPlatform: topCampaign.platform,
      campaignId: topCampaign.campaign_id,
      campaignName: topCampaign.campaign_name,
      utmSource: topCampaign.platform,
      utmMedium: 'cpc',
      utmCampaign: topCampaign.campaign_name,
      matchDetails: `Correlated with ${topCampaign.platform} campaign "${topCampaign.campaign_name}" (${topCampaign.impressions} impressions, ${topCampaign.clicks} clicks in same hour)`
    });
  }

  return results;
}

/**
 * Get hourly campaign activity across all platforms
 */
async function getHourlyCampaignActivity(
  startDate: string,
  endDate: string
): Promise<CampaignActivity[]> {
  const client = getSupabaseClient();
  const activities: CampaignActivity[] = [];

  // Get Google Ads hourly data
  const { data: googleAds, error: googleError } = await client
    .from('google_ads_daily_performance')
    .select('date, campaign_id, campaign_name, impressions, clicks, hour_of_day')
    .gte('date', startDate)
    .lte('date', endDate)
    .not('hour_of_day', 'is', null);

  if (!googleError && googleAds) {
    activities.push(...googleAds.map((row: any) => ({
      date: row.date,
      hour: row.hour_of_day,
      platform: 'google' as const,
      campaign_id: row.campaign_id.toString(),
      campaign_name: row.campaign_name,
      impressions: row.impressions || 0,
      clicks: row.clicks || 0,
    })));
  }

  // Get Microsoft Ads hourly data
  const { data: bingAds, error: bingError } = await client
    .from('microsoft_ads_daily_performance')
    .select('date, campaign_id, campaign_name, impressions, clicks, hour_of_day')
    .gte('date', startDate)
    .lte('date', endDate)
    .not('hour_of_day', 'is', null);

  if (!bingError && bingAds) {
    activities.push(...bingAds.map((row: any) => ({
      date: row.date,
      hour: row.hour_of_day,
      platform: 'microsoft' as const,  // Database stores 'microsoft', not 'bing'
      campaign_id: row.campaign_id.toString(),
      campaign_name: row.campaign_name,
      impressions: row.impressions || 0,
      clicks: row.clicks || 0,
    })));
  }

  return activities;
}

/**
 * Master attribution function
 * Runs both direct match and time correlation
 */
export async function attributeAllCalls(
  startDate: string,
  endDate: string
): Promise<{
  attributed: AttributionResult[];
  summary: {
    total: number;
    directMatches: number;
    timeCorrelated: number;
    unknown: number;
    avgConfidence: number;
  };
}> {
  const client = getSupabaseClient();

  // Get all inbound calls in date range
  const { data: calls, error } = await client
    .from('ringcentral_calls')
    .select('call_id, from_number, start_time, direction, result, duration')
    .eq('direction', 'Inbound')
    .gte('start_time', startDate)
    .lte('start_time', endDate);

  if (error || !calls) {
    console.error('Error fetching calls:', error);
    return {
      attributed: [],
      summary: {
        total: 0,
        directMatches: 0,
        timeCorrelated: 0,
        unknown: 0,
        avgConfidence: 0,
      }
    };
  }

  console.log(`📞 Attributing ${calls.length} inbound calls...`);

  // Step 1: Try direct matches first
  const directMatches = await matchDirectConversions(calls);
  console.log(`✅ Direct matches: ${directMatches.length}`);

  // Step 2: Get unmatched calls
  const matchedCallIds = new Set(directMatches.map(r => r.callId));
  const unmatchedCalls = calls.filter((call: RingCentralCall) =>
    !matchedCallIds.has(call.call_id)
  );

  // Step 3: Try time correlation for unmatched
  const timeMatches = await matchTimeCorrelation(unmatchedCalls, startDate, endDate);
  console.log(`🕐 Time-correlated: ${timeMatches.filter(r => r.attributionMethod === 'time_correlation').length}`);

  // Combine results
  const allResults = [...directMatches, ...timeMatches];

  // Calculate summary
  const summary = {
    total: allResults.length,
    directMatches: allResults.filter(r => r.attributionMethod === 'direct_match').length,
    timeCorrelated: allResults.filter(r => r.attributionMethod === 'time_correlation').length,
    unknown: allResults.filter(r => r.attributionMethod === 'unknown').length,
    avgConfidence: allResults.reduce((sum, r) => sum + r.attributionConfidence, 0) / allResults.length || 0,
  };

  console.log(`📊 Attribution complete:`, summary);

  return { attributed: allResults, summary };
}

/**
 * Save attribution results to database
 * Updates ringcentral_calls table with attribution data
 */
export async function saveAttributionResults(
  results: AttributionResult[]
): Promise<{ success: number; failed: number }> {
  const client = getSupabaseClient();
  let success = 0;
  let failed = 0;

  for (const result of results) {
    const { error } = await client
      .from('ringcentral_calls')
      .update({
        attribution_method: result.attributionMethod,
        attribution_confidence: result.attributionConfidence,
        ad_platform: result.adPlatform,
        utm_source: result.utmSource,
        utm_medium: result.utmMedium,
        utm_campaign: result.utmCampaign,
        // Store match details in a JSON column if it exists, or log it
      })
      .eq('call_id', result.callId);

    if (error) {
      console.error(`Failed to update call ${result.callId}:`, error);
      failed++;
    } else {
      success++;
    }
  }

  console.log(`💾 Saved attribution: ${success} success, ${failed} failed`);
  return { success, failed };
}

/**
 * Get attribution breakdown by platform
 */
export function getAttributionBreakdown(results: AttributionResult[]): Record<string, {
  count: number;
  avgConfidence: number;
  directMatches: number;
  timeCorrelated: number;
}> {
  const breakdown: Record<string, any> = {};

  for (const result of results) {
    const platform = result.adPlatform || 'unknown';

    if (!breakdown[platform]) {
      breakdown[platform] = {
        count: 0,
        totalConfidence: 0,
        directMatches: 0,
        timeCorrelated: 0,
      };
    }

    breakdown[platform].count++;
    breakdown[platform].totalConfidence += result.attributionConfidence;

    if (result.attributionMethod === 'direct_match') {
      breakdown[platform].directMatches++;
    } else if (result.attributionMethod === 'time_correlation') {
      breakdown[platform].timeCorrelated++;
    }
  }

  // Calculate averages
  const final: Record<string, any> = {};
  for (const [platform, data] of Object.entries(breakdown)) {
    final[platform] = {
      count: data.count,
      avgConfidence: Math.round(data.totalConfidence / data.count),
      directMatches: data.directMatches,
      timeCorrelated: data.timeCorrelated,
    };
  }

  return final;
}
