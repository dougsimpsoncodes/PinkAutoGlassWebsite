/**
 * Offline Conversion Sync
 *
 * Matches RingCentral phone calls to Google Ads clicks (via stored GCLID)
 * and Microsoft Ads clicks (via stored MSCLKID) and uploads them as offline conversions.
 *
 * Attribution Methods (in priority order):
 *
 * 1. Direct phone_click match (highest confidence)
 *    - User clicks phone button on website (phone_click event recorded with click ID)
 *    - User calls within 5 minutes
 *    - Direct link between click and call
 *
 * 2. Session-based match (5-minute window)
 *    - User visits website from ad (session recorded with click ID)
 *    - User calls within 5 minutes of session start
 *    - Only used when exactly ONE platform has a session in the window
 *    - Skipped if both Google and Microsoft have sessions (conflict)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  uploadOfflineConversions,
  formatConversionDateTime,
  OfflineConversion,
} from './googleAds';
import {
  uploadOfflineConversions as uploadMicrosoftOfflineConversions,
  formatMicrosoftConversionDateTime,
  MicrosoftOfflineConversion,
  validateMicrosoftAdsConfig,
} from './microsoftAds';

// Attribution window in minutes (session/phone_click to actual call)
const ATTRIBUTION_WINDOW_MINUTES = 5;

// Minimum call duration in seconds to count as a valid conversion
// Filters out hang-ups and wrong numbers
const MIN_CALL_DURATION_SECONDS = 30;

// Default conversion value for phone calls
const DEFAULT_CALL_VALUE = 150;

interface AttributedCall {
  callId: string;
  callTime: Date;
  fromNumber: string;
  duration: number;
  gclid: string;
  sessionId: string;
  clickTime: Date;
}

interface MicrosoftAttributedCall {
  callId: string;
  callTime: Date;
  fromNumber: string;
  duration: number;
  msclkid: string;
  sessionId: string;
  clickTime: Date;
}

interface SyncResult {
  callsProcessed: number;
  callsAttributed: number;
  conversionsUploaded: number;
  conversionsFailed: number;
  errors: string[];
}

interface MicrosoftSyncResult {
  callsProcessed: number;
  callsAttributed: number;
  conversionsUploaded: number;
  conversionsFailed: number;
  errors: string[];
}

// Microsoft Ads offline conversion goal name (must match exactly what was created in UI)
const MICROSOFT_OFFLINE_CONVERSION_NAME = 'Phone Call (Ring Central)';

/**
 * Get Supabase client
 */
function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not configured');
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Find calls that can be attributed to Google Ads clicks
 *
 * Attribution priority:
 * 1. Direct phone_click match - user clicked phone button with GCLID within 5 min
 * 2. Session match - user visited from Google ad within 5 min (only if no Microsoft session)
 */
async function findAttributableCalls(
  supabase: SupabaseClient,
  lookbackDays: number = 7
): Promise<AttributedCall[]> {
  const lookbackDate = new Date();
  lookbackDate.setDate(lookbackDate.getDate() - lookbackDays);

  // Get recent inbound calls that haven't been uploaded to Google Ads
  let calls;
  let callsError;

  try {
    const result = await supabase
      .from('ringcentral_calls')
      .select('call_id, start_time, from_number, duration, direction, result, google_ads_uploaded_at')
      .eq('direction', 'Inbound')
      .gte('start_time', lookbackDate.toISOString())
      .is('google_ads_uploaded_at', null)
      .gte('duration', MIN_CALL_DURATION_SECONDS);

    calls = result.data;
    callsError = result.error;

    if (callsError?.message?.includes('does not exist')) {
      console.warn('⚠️ google_ads_uploaded_at column not found - fetching all calls');
      const fallbackResult = await supabase
        .from('ringcentral_calls')
        .select('call_id, start_time, from_number, duration, direction, result')
        .eq('direction', 'Inbound')
        .gte('start_time', lookbackDate.toISOString())
        .gte('duration', MIN_CALL_DURATION_SECONDS);

      calls = fallbackResult.data;
      callsError = fallbackResult.error;
    }
  } catch (err: any) {
    console.error('Error fetching calls:', err.message);
    return [];
  }

  if (callsError) {
    console.error('Error fetching calls:', callsError);
    return [];
  }

  if (!calls || calls.length === 0) {
    console.log('📞 No new calls to process');
    return [];
  }

  console.log(`📞 Found ${calls.length} calls to check for Google Ads attribution`);

  const attributedCalls: AttributedCall[] = [];
  const matchWindowMs = ATTRIBUTION_WINDOW_MINUTES * 60 * 1000;

  for (const call of calls) {
    const callTime = new Date(call.start_time);
    const windowStart = new Date(callTime.getTime() - matchWindowMs);

    // Strategy 1: Direct phone_click match (highest confidence)
    const { data: clickEvents } = await supabase
      .from('conversion_events')
      .select('session_id, gclid, created_at')
      .eq('event_type', 'phone_click')
      .not('gclid', 'is', null)
      .gte('created_at', windowStart.toISOString())
      .lte('created_at', callTime.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (clickEvents && clickEvents.length > 0 && clickEvents[0].gclid) {
      attributedCalls.push({
        callId: call.call_id,
        callTime,
        fromNumber: call.from_number,
        duration: call.duration,
        gclid: clickEvents[0].gclid,
        sessionId: clickEvents[0].session_id,
        clickTime: new Date(clickEvents[0].created_at),
      });
      continue;
    }

    // Strategy 2: Session-based match (only if no conflict with Microsoft)
    const { data: googleSessions } = await supabase
      .from('user_sessions')
      .select('session_id, gclid, started_at')
      .not('gclid', 'is', null)
      .gte('started_at', windowStart.toISOString())
      .lte('started_at', callTime.toISOString())
      .order('started_at', { ascending: false })
      .limit(1);

    if (googleSessions && googleSessions.length > 0 && googleSessions[0].gclid) {
      // Check if Microsoft also has a session in this window (conflict)
      const { data: msSessions } = await supabase
        .from('user_sessions')
        .select('session_id')
        .not('msclkid', 'is', null)
        .gte('started_at', windowStart.toISOString())
        .lte('started_at', callTime.toISOString())
        .limit(1);

      // Only attribute to Google if no Microsoft session in window
      if (!msSessions || msSessions.length === 0) {
        attributedCalls.push({
          callId: call.call_id,
          callTime,
          fromNumber: call.from_number,
          duration: call.duration,
          gclid: googleSessions[0].gclid,
          sessionId: googleSessions[0].session_id,
          clickTime: new Date(googleSessions[0].started_at),
        });
      }
    }
  }

  console.log(`✅ Attributed ${attributedCalls.length} calls to Google Ads`);

  return attributedCalls;
}

/**
 * Mark calls as uploaded to Google Ads and set ad_platform
 */
async function markCallsAsUploaded(
  supabase: SupabaseClient,
  callIds: string[]
): Promise<void> {
  if (callIds.length === 0) return;

  const { error } = await supabase
    .from('ringcentral_calls')
    .update({
      google_ads_uploaded_at: new Date().toISOString(),
      ad_platform: 'google', // Mark as Google Ads attributed
    })
    .in('call_id', callIds);

  if (error) {
    console.error('Error marking calls as uploaded:', error);
  }
}

/**
 * Sync RingCentral calls to Google Ads as offline conversions
 *
 * This should be called as part of the daily sync cron job
 */
export async function syncOfflineConversions(): Promise<SyncResult> {
  console.log('\n📤 Starting offline conversion sync...');
  console.log(`   Attribution method: Direct phone_click match (${DIRECT_MATCH_WINDOW_MINUTES} min window)`);
  console.log(`   Min call duration: ${MIN_CALL_DURATION_SECONDS} seconds`);

  const result: SyncResult = {
    callsProcessed: 0,
    callsAttributed: 0,
    conversionsUploaded: 0,
    conversionsFailed: 0,
    errors: [],
  };

  try {
    const supabase = getSupabaseClient();

    // Find calls that can be attributed to Google Ads
    const attributedCalls = await findAttributableCalls(supabase);
    result.callsAttributed = attributedCalls.length;

    if (attributedCalls.length === 0) {
      console.log('📭 No calls to upload');
      return result;
    }

    // Convert to offline conversion format
    const conversions: OfflineConversion[] = attributedCalls.map((call) => ({
      gclid: call.gclid,
      conversionDateTime: formatConversionDateTime(call.callTime),
      conversionValue: DEFAULT_CALL_VALUE,
      currencyCode: 'USD',
    }));

    // Upload to Google Ads
    const uploadResult = await uploadOfflineConversions(conversions);
    result.conversionsUploaded = uploadResult.successCount;
    result.conversionsFailed = uploadResult.failureCount;

    // Mark successful uploads
    const successfulCallIds = attributedCalls
      .filter((call, index) => uploadResult.results[index]?.success)
      .map((call) => call.callId);

    await markCallsAsUploaded(supabase, successfulCallIds);

    // Log failures
    for (const failedResult of uploadResult.results.filter((r) => !r.success)) {
      const errorMsg = `Failed to upload GCLID ${failedResult.gclid}: ${failedResult.error}`;
      result.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }

    console.log(`\n✅ Offline conversion sync complete:`);
    console.log(`   Calls attributed: ${result.callsAttributed}`);
    console.log(`   Conversions uploaded: ${result.conversionsUploaded}`);
    console.log(`   Failures: ${result.conversionsFailed}`);

  } catch (error: any) {
    const errorMsg = `Offline conversion sync failed: ${error.message}`;
    result.errors.push(errorMsg);
    console.error(`❌ ${errorMsg}`);
  }

  return result;
}

/**
 * Get attribution stats for a date range
 */
export async function getAttributionStats(
  startDate: string,
  endDate: string
): Promise<{
  totalCalls: number;
  attributedCalls: number;
  uploadedCalls: number;
  pendingCalls: number;
  attributionRate: number;
}> {
  const supabase = getSupabaseClient();

  // Total inbound calls
  const { count: totalCalls } = await supabase
    .from('ringcentral_calls')
    .select('*', { count: 'exact', head: true })
    .eq('direction', 'Inbound')
    .gte('start_time', startDate)
    .lte('start_time', endDate)
    .gte('duration', MIN_CALL_DURATION_SECONDS);

  // Calls uploaded to Google Ads
  const { count: uploadedCalls } = await supabase
    .from('ringcentral_calls')
    .select('*', { count: 'exact', head: true })
    .eq('direction', 'Inbound')
    .gte('start_time', startDate)
    .lte('start_time', endDate)
    .gte('duration', MIN_CALL_DURATION_SECONDS)
    .not('google_ads_uploaded_at', 'is', null);

  // Calls with attribution data (from attribution_method field)
  const { count: attributedCalls } = await supabase
    .from('ringcentral_calls')
    .select('*', { count: 'exact', head: true })
    .eq('direction', 'Inbound')
    .gte('start_time', startDate)
    .lte('start_time', endDate)
    .gte('duration', MIN_CALL_DURATION_SECONDS)
    .not('ad_platform', 'is', null);

  const total = totalCalls || 0;
  const attributed = attributedCalls || 0;
  const uploaded = uploadedCalls || 0;

  return {
    totalCalls: total,
    attributedCalls: attributed,
    uploadedCalls: uploaded,
    pendingCalls: attributed - uploaded,
    attributionRate: total > 0 ? (attributed / total) * 100 : 0,
  };
}

// ============================================================================
// MICROSOFT ADS OFFLINE CONVERSION SYNC
// ============================================================================

/**
 * Find calls that can be attributed to Microsoft Ads clicks (via MSCLKID)
 *
 * Attribution priority:
 * 1. Direct phone_click match - user clicked phone button with MSCLKID within 5 min
 * 2. Session match - user visited from Microsoft ad within 5 min (only if no Google session)
 */
async function findMicrosoftAttributableCalls(
  supabase: SupabaseClient,
  lookbackDays: number = 7
): Promise<MicrosoftAttributedCall[]> {
  const lookbackDate = new Date();
  lookbackDate.setDate(lookbackDate.getDate() - lookbackDays);

  // Get recent inbound calls that haven't been uploaded to Microsoft Ads
  let calls;
  let callsError;

  try {
    const result = await supabase
      .from('ringcentral_calls')
      .select('call_id, start_time, from_number, duration, direction, result, microsoft_ads_uploaded_at')
      .eq('direction', 'Inbound')
      .gte('start_time', lookbackDate.toISOString())
      .is('microsoft_ads_uploaded_at', null)
      .gte('duration', MIN_CALL_DURATION_SECONDS);

    calls = result.data;
    callsError = result.error;

    if (callsError?.message?.includes('does not exist')) {
      console.warn('⚠️ microsoft_ads_uploaded_at column not found - fetching all calls');
      const fallbackResult = await supabase
        .from('ringcentral_calls')
        .select('call_id, start_time, from_number, duration, direction, result')
        .eq('direction', 'Inbound')
        .gte('start_time', lookbackDate.toISOString())
        .gte('duration', MIN_CALL_DURATION_SECONDS);

      calls = fallbackResult.data;
      callsError = fallbackResult.error;
    }
  } catch (err: any) {
    console.error('Error fetching calls for Microsoft Ads:', err.message);
    return [];
  }

  if (callsError) {
    console.error('Error fetching calls for Microsoft Ads:', callsError);
    return [];
  }

  if (!calls || calls.length === 0) {
    console.log('📞 No new calls to process for Microsoft Ads');
    return [];
  }

  console.log(`📞 Found ${calls.length} calls to check for Microsoft Ads attribution`);

  const attributedCalls: MicrosoftAttributedCall[] = [];
  const matchWindowMs = ATTRIBUTION_WINDOW_MINUTES * 60 * 1000;

  for (const call of calls) {
    const callTime = new Date(call.start_time);
    const windowStart = new Date(callTime.getTime() - matchWindowMs);

    // Strategy 1: Direct phone_click match (highest confidence)
    const { data: clickEvents } = await supabase
      .from('conversion_events')
      .select('session_id, msclkid, created_at')
      .eq('event_type', 'phone_click')
      .not('msclkid', 'is', null)
      .gte('created_at', windowStart.toISOString())
      .lte('created_at', callTime.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (clickEvents && clickEvents.length > 0 && clickEvents[0].msclkid) {
      attributedCalls.push({
        callId: call.call_id,
        callTime,
        fromNumber: call.from_number,
        duration: call.duration,
        msclkid: clickEvents[0].msclkid,
        sessionId: clickEvents[0].session_id,
        clickTime: new Date(clickEvents[0].created_at),
      });
      continue;
    }

    // Strategy 2: Session-based match (only if no conflict with Google)
    const { data: msSessions } = await supabase
      .from('user_sessions')
      .select('session_id, msclkid, started_at')
      .not('msclkid', 'is', null)
      .gte('started_at', windowStart.toISOString())
      .lte('started_at', callTime.toISOString())
      .order('started_at', { ascending: false })
      .limit(1);

    if (msSessions && msSessions.length > 0 && msSessions[0].msclkid) {
      // Check if Google also has a session in this window (conflict)
      const { data: googleSessions } = await supabase
        .from('user_sessions')
        .select('session_id')
        .not('gclid', 'is', null)
        .gte('started_at', windowStart.toISOString())
        .lte('started_at', callTime.toISOString())
        .limit(1);

      // Only attribute to Microsoft if no Google session in window
      if (!googleSessions || googleSessions.length === 0) {
        attributedCalls.push({
          callId: call.call_id,
          callTime,
          fromNumber: call.from_number,
          duration: call.duration,
          msclkid: msSessions[0].msclkid,
          sessionId: msSessions[0].session_id,
          clickTime: new Date(msSessions[0].started_at),
        });
      }
    }
  }

  console.log(`✅ Attributed ${attributedCalls.length} calls to Microsoft Ads`);

  return attributedCalls;
}

/**
 * Mark calls as uploaded to Microsoft Ads and set ad_platform
 */
async function markCallsAsUploadedToMicrosoft(
  supabase: SupabaseClient,
  callIds: string[]
): Promise<void> {
  if (callIds.length === 0) return;

  const { error } = await supabase
    .from('ringcentral_calls')
    .update({
      microsoft_ads_uploaded_at: new Date().toISOString(),
      ad_platform: 'microsoft', // Mark as Microsoft Ads attributed (database stores 'microsoft', not 'bing')
    })
    .in('call_id', callIds);

  if (error) {
    console.error('Error marking calls as uploaded to Microsoft Ads:', error);
  }
}

/**
 * Sync RingCentral calls to Microsoft Ads as offline conversions
 */
export async function syncMicrosoftOfflineConversions(): Promise<MicrosoftSyncResult> {
  console.log('\n📤 Starting Microsoft Ads offline conversion sync...');
  console.log(`   Attribution method: Direct phone_click match (${DIRECT_MATCH_WINDOW_MINUTES} min window)`);
  console.log(`   Min call duration: ${MIN_CALL_DURATION_SECONDS} seconds`);
  console.log(`   Conversion name: ${MICROSOFT_OFFLINE_CONVERSION_NAME}`);

  const result: MicrosoftSyncResult = {
    callsProcessed: 0,
    callsAttributed: 0,
    conversionsUploaded: 0,
    conversionsFailed: 0,
    errors: [],
  };

  // Check if Microsoft Ads is configured
  const msConfig = validateMicrosoftAdsConfig();
  if (!msConfig.isValid) {
    console.log('⚠️ Microsoft Ads not configured, skipping sync');
    return result;
  }

  try {
    const supabase = getSupabaseClient();

    // Find calls that can be attributed to Microsoft Ads
    const attributedCalls = await findMicrosoftAttributableCalls(supabase);
    result.callsAttributed = attributedCalls.length;

    if (attributedCalls.length === 0) {
      console.log('📭 No calls to upload to Microsoft Ads');
      return result;
    }

    // Convert to Microsoft offline conversion format
    const conversions: MicrosoftOfflineConversion[] = attributedCalls.map((call) => ({
      msclkid: call.msclkid,
      conversionName: MICROSOFT_OFFLINE_CONVERSION_NAME,
      conversionTime: formatMicrosoftConversionDateTime(call.callTime),
      conversionValue: DEFAULT_CALL_VALUE,
      conversionCurrency: 'USD',
    }));

    // Upload to Microsoft Ads
    const uploadResult = await uploadMicrosoftOfflineConversions(conversions);
    result.conversionsUploaded = uploadResult.successCount;
    result.conversionsFailed = uploadResult.failureCount;

    // Mark successful uploads
    const successfulCallIds = attributedCalls
      .filter((call, index) => uploadResult.results[index]?.success)
      .map((call) => call.callId);

    await markCallsAsUploadedToMicrosoft(supabase, successfulCallIds);

    // Log failures
    for (const failedResult of uploadResult.results.filter((r) => !r.success)) {
      const errorMsg = `Failed to upload MSCLKID ${failedResult.msclkid}: ${failedResult.error}`;
      result.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }

    console.log(`\n✅ Microsoft Ads offline conversion sync complete:`);
    console.log(`   Calls attributed: ${result.callsAttributed}`);
    console.log(`   Conversions uploaded: ${result.conversionsUploaded}`);
    console.log(`   Failures: ${result.conversionsFailed}`);

  } catch (error: any) {
    const errorMsg = `Microsoft Ads offline conversion sync failed: ${error.message}`;
    result.errors.push(errorMsg);
    console.error(`❌ ${errorMsg}`);
  }

  return result;
}

/**
 * Sync offline conversions to both Google Ads and Microsoft Ads
 */
export async function syncAllOfflineConversions(): Promise<{
  googleAds: SyncResult;
  microsoftAds: MicrosoftSyncResult;
}> {
  console.log('\n🔄 Starting offline conversion sync for all platforms...');

  const googleAdsResult = await syncOfflineConversions();
  const microsoftAdsResult = await syncMicrosoftOfflineConversions();

  console.log('\n📊 Summary:');
  console.log(`   Google Ads: ${googleAdsResult.conversionsUploaded} uploaded, ${googleAdsResult.conversionsFailed} failed`);
  console.log(`   Microsoft Ads: ${microsoftAdsResult.conversionsUploaded} uploaded, ${microsoftAdsResult.conversionsFailed} failed`);

  return {
    googleAds: googleAdsResult,
    microsoftAds: microsoftAdsResult,
  };
}
