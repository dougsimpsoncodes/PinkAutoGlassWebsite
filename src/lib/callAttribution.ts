/**
 * Call Attribution Matching Algorithm
 *
 * Canonical attribution must be based on direct evidence only.
 * Heuristic time-correlation is intentionally excluded from canonical writes.
 */

import { createClient } from '@supabase/supabase-js';
import { ATTRIBUTION_WINDOW_MINUTES } from './constants';
import { applyQualifyingFilter } from './callQualifying';

const METHOD_PRIORITY: Record<string, number> = {
  google_call_view: 100,
  microsoft_uploaded_call: 95,
  direct_match: 80,
  direct_match_conflict: 50,
  session_fallback: 45,
  unknown: 0,
};

// Shared constant: attribution methods backed by deterministic platform evidence.
// Import this in any builder that needs a canonical-method check so they can
// never silently diverge (metricsBuilder, unifiedLeadsBuilder, etc.).
export const CANONICAL_ATTRIBUTION_METHODS: ReadonlySet<string> = new Set([
  'google_call_view',
  'microsoft_uploaded_call',
  'direct_match',
]);

export interface AttributionResult {
  callId: string;
  fromNumber: string;
  callTimestamp: string;
  attributionMethod:
    | 'google_call_view'
    | 'microsoft_uploaded_call'
    | 'direct_match'
    | 'direct_match_conflict'
    | 'session_fallback'
    | 'unknown';
  attributionConfidence: number;
  adPlatform: string | null;
  campaignId: string | null;
  campaignName: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm?: string | null;
  gclid?: string | null;
  msclkid?: string | null;
  sessionId?: string | null;
  matchDetails: string;
}

interface ConversionEvent {
  created_at: string;
  session_id: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  gclid?: string | null;
  msclkid?: string | null;
}

interface UserSessionAttribution {
  session_id: string;
  started_at: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  gclid?: string | null;
  msclkid?: string | null;
}

interface HydratedConversionEvent extends ConversionEvent {
  platform: string | null;
}

interface RingCentralCall {
  call_id: string;
  from_number: string;
  start_time: string;
  direction: 'Inbound' | 'Outbound';
  duration?: number;
  google_ads_call_match?: boolean | null;
  google_ads_call_resource_name?: string | null;
  google_ads_uploaded_at?: string | null;
  microsoft_ads_uploaded_at?: string | null;
  ad_platform?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  website_session_id?: string | null;
}

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not configured');
  }

  return createClient(supabaseUrl, supabaseKey);
}

function inferPaidPlatform(source?: string | null, medium?: string | null, gclid?: string | null, msclkid?: string | null): string | null {
  const normalizedSource = (source || '').toLowerCase();
  const normalizedMedium = (medium || '').toLowerCase();

  if (gclid) return 'google';
  if (msclkid) return 'microsoft';
  if (normalizedSource === 'google' && ['cpc', 'ppc', 'paid', 'paid_search'].includes(normalizedMedium)) return 'google';
  if (['bing', 'microsoft', 'microsoft-ads'].includes(normalizedSource) && ['cpc', 'ppc', 'paid', 'paid_search'].includes(normalizedMedium)) {
    return 'microsoft';
  }
  return null;
}

function hydrateEventWithSession(
  event: ConversionEvent,
  sessionById: Map<string, UserSessionAttribution>
): HydratedConversionEvent {
  const session = sessionById.get(event.session_id);
  const gclid = event.gclid || session?.gclid || null;
  const msclkid = event.msclkid || session?.msclkid || null;
  const utmSource = event.utm_source || session?.utm_source || null;
  const utmMedium = event.utm_medium || session?.utm_medium || null;
  const utmCampaign = event.utm_campaign || session?.utm_campaign || null;
  const utmTerm = event.utm_term || session?.utm_term || null;
  const platform = inferPaidPlatform(utmSource, utmMedium, gclid, msclkid);

  return {
    ...event,
    gclid,
    msclkid,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    utm_term: utmTerm,
    platform,
  };
}

function matchCanonicalPlatformEvidence(calls: RingCentralCall[]): AttributionResult[] {
  return calls.flatMap((call): AttributionResult[] => {
    const hasGoogleCallView = Boolean(call.google_ads_call_match || call.google_ads_call_resource_name);
    const hasMicrosoftUpload = Boolean(call.microsoft_ads_uploaded_at);

    if (hasGoogleCallView) {
      return [{
        callId: call.call_id,
        fromNumber: call.from_number,
        callTimestamp: call.start_time,
        attributionMethod: 'google_call_view',
        attributionConfidence: 100,
        adPlatform: 'google',
        campaignId: null,
        campaignName: call.utm_campaign || null,
        utmSource: call.utm_source || 'google',
        utmMedium: call.utm_medium || 'cpc',
        utmCampaign: call.utm_campaign || null,
        sessionId: call.website_session_id || null,
        matchDetails: hasMicrosoftUpload
          ? `Matched deterministic Google call_view record ${call.google_ads_call_resource_name || 'marker'}; ignored weaker Microsoft offline-upload bookkeeping marker`
          : call.google_ads_call_resource_name
            ? `Matched deterministic Google call_view record ${call.google_ads_call_resource_name}`
            : 'Matched deterministic Google call_view marker on RingCentral call',
      }];
    }

    if (hasMicrosoftUpload) {
      return [{
        callId: call.call_id,
        fromNumber: call.from_number,
        callTimestamp: call.start_time,
        attributionMethod: 'microsoft_uploaded_call',
        attributionConfidence: 95,
        adPlatform: 'microsoft',
        campaignId: null,
        campaignName: call.utm_campaign || null,
        utmSource: call.utm_source || 'microsoft',
        utmMedium: call.utm_medium || 'cpc',
        utmCampaign: call.utm_campaign || null,
        sessionId: call.website_session_id || null,
        matchDetails: `Matched deterministic Microsoft uploaded-call marker from ${call.microsoft_ads_uploaded_at}`,
      }];
    }

    return [];
  });
}

export async function matchDirectConversions(calls: RingCentralCall[]): Promise<AttributionResult[]> {
  if (calls.length === 0) return [];

  const client = getSupabaseClient();
  const results: AttributionResult[] = [];

  const callTimes = calls.map(call => new Date(call.start_time).getTime());
  const windowStart = new Date(Math.min(...callTimes) - ATTRIBUTION_WINDOW_MINUTES * 60 * 1000);
  const windowEnd = new Date(Math.max(...callTimes) + 60 * 1000);

  const { data: events, error } = await client
    .from('conversion_events')
    .select('created_at, session_id, utm_source, utm_medium, utm_campaign, utm_term, gclid, msclkid')
    .eq('event_type', 'phone_click')
    .eq('is_test', false)
    .gte('created_at', windowStart.toISOString())
    .lte('created_at', windowEnd.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching conversion events:', error);
    return results;
  }

  const sessionIds = Array.from(new Set((events || []).map((event: ConversionEvent) => event.session_id).filter(Boolean)));
  const { data: sessions, error: sessionsError } = sessionIds.length > 0
    ? await client
      .from('user_sessions')
      .select('session_id, started_at, utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, msclkid')
      .in('session_id', sessionIds)
      .eq('is_test', false)
    : { data: [], error: null };

  if (sessionsError) {
    console.error('Error fetching conversion sessions:', sessionsError);
  }

  const sessionById = new Map(
    ((sessions || []) as UserSessionAttribution[]).map(session => [session.session_id, session])
  );
  const attributedEvents = (events || [])
    .map((event: ConversionEvent) => hydrateEventWithSession(event, sessionById))
    .filter(event => Boolean(event.platform));

  for (const call of calls) {
    if (call.direction !== 'Inbound') continue;

    const callTime = new Date(call.start_time).getTime();
    const matchWindowStart = callTime - ATTRIBUTION_WINDOW_MINUTES * 60 * 1000;
    const matchWindowEnd = callTime + 60 * 1000;

    const windowEvents = attributedEvents.filter((event: ConversionEvent) => {
      const eventTime = new Date(event.created_at).getTime();
      return eventTime >= matchWindowStart && eventTime <= matchWindowEnd;
    });

    if (windowEvents.length === 0) continue;

    const hasGoogle = windowEvents.some(event => event.platform === 'google');
    const hasMicrosoft = windowEvents.some(event => event.platform === 'microsoft');

    const nearestEvent = windowEvents.reduce<{ event: HydratedConversionEvent | null; diff: number }>((best, event) => {
      const diff = Math.abs(callTime - new Date(event.created_at).getTime());
      return diff < best.diff ? { event, diff } : best;
    }, { event: null, diff: Infinity });

    const sessionMatchedEvents = call.website_session_id
      ? windowEvents.filter((event: ConversionEvent) => event.session_id === call.website_session_id)
      : [];
    const sessionMatchedNearest = sessionMatchedEvents.reduce<{ event: HydratedConversionEvent | null; diff: number }>((best, event) => {
      const diff = Math.abs(callTime - new Date(event.created_at).getTime());
      return diff < best.diff ? { event, diff } : best;
    }, { event: null, diff: Infinity });

    const matchingEvent = sessionMatchedNearest.event || nearestEvent.event;
    const bestTimeDiff = sessionMatchedNearest.event ? sessionMatchedNearest.diff : nearestEvent.diff;

    if (!matchingEvent || bestTimeDiff > 300_000) continue;

    const timeDiffSec = Math.round(bestTimeDiff / 1000);
    let confidence = 100;
    if (timeDiffSec > 30) confidence = 95;
    if (timeDiffSec > 60) confidence = 90;
    if (timeDiffSec > 120) confidence = 85;
    if (timeDiffSec > 180) confidence = 80;

    const platform: string | null = matchingEvent.platform || null;

    const resolvedBySessionLink = Boolean(sessionMatchedNearest.event && hasGoogle && hasMicrosoft && platform);
    const remainsConflict = Boolean(hasGoogle && hasMicrosoft && !resolvedBySessionLink);

    if (remainsConflict) {
      confidence = 50;
    } else if (resolvedBySessionLink) {
      confidence = Math.max(confidence, 95);
    }

    results.push({
      callId: call.call_id,
      fromNumber: call.from_number,
      callTimestamp: call.start_time,
      attributionMethod: remainsConflict ? 'direct_match_conflict' : 'direct_match',
      attributionConfidence: confidence,
      adPlatform: remainsConflict ? null : platform,
      campaignId: null,
      campaignName: matchingEvent.utm_campaign || null,
      utmSource: matchingEvent.utm_source || null,
      utmMedium: matchingEvent.utm_medium || null,
      utmCampaign: matchingEvent.utm_campaign || null,
      utmTerm: matchingEvent.utm_term || null,
      gclid: matchingEvent.gclid || null,
      msclkid: matchingEvent.msclkid || null,
      sessionId: matchingEvent.session_id || null,
      matchDetails: remainsConflict
        ? `Conflicting phone_click evidence within ${timeDiffSec}s of call`
        : resolvedBySessionLink
          ? `Resolved mixed-platform phone_click evidence via call-linked session ${matchingEvent.session_id} (${timeDiffSec}s from call)`
          : `Matched phone_click event ${timeDiffSec}s from call (session: ${matchingEvent.session_id})`,
    });
  }

  return results;
}

export async function matchSessionFallback(calls: RingCentralCall[]): Promise<AttributionResult[]> {
  if (calls.length === 0) return [];

  const client = getSupabaseClient();
  const callTimes = calls.map(call => new Date(call.start_time).getTime());
  const windowStart = new Date(Math.min(...callTimes) - ATTRIBUTION_WINDOW_MINUTES * 60 * 1000);
  const windowEnd = new Date(Math.max(...callTimes) + 60 * 1000);

  const { data: sessions, error } = await client
    .from('user_sessions')
    .select('session_id, started_at, utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, msclkid')
    .eq('is_test', false)
    .gte('started_at', windowStart.toISOString())
    .lte('started_at', windowEnd.toISOString())
    .order('started_at', { ascending: true });

  if (error) {
    console.error('Error fetching session fallback candidates:', error);
    return [];
  }

  const paidSessions = ((sessions || []) as UserSessionAttribution[])
    .map(session => ({
      ...session,
      platform: inferPaidPlatform(session.utm_source, session.utm_medium, session.gclid, session.msclkid),
    }))
    .filter(session => Boolean(session.platform));

  return calls.flatMap((call): AttributionResult[] => {
    if (call.direction !== 'Inbound') return [];

    const callTime = new Date(call.start_time).getTime();
    const matchWindowStart = callTime - ATTRIBUTION_WINDOW_MINUTES * 60 * 1000;
    const matchWindowEnd = callTime + 60 * 1000;
    const windowSessions = paidSessions.filter(session => {
      const sessionTime = new Date(session.started_at).getTime();
      return sessionTime >= matchWindowStart && sessionTime <= matchWindowEnd;
    });

    if (windowSessions.length === 0) return [];

    const platforms = new Set(windowSessions.map(session => session.platform));
    if (platforms.size !== 1) return [];

    const nearest = windowSessions.reduce<{ session: (UserSessionAttribution & { platform: string | null }) | null; diff: number }>((best, session) => {
      const diff = Math.abs(callTime - new Date(session.started_at).getTime());
      return diff < best.diff ? { session, diff } : best;
    }, { session: null, diff: Infinity });

    if (!nearest.session) return [];

    const timeDiffMin = Math.round(nearest.diff / 60_000);
    let confidence = 70;
    if (timeDiffMin > 15) confidence = 60;
    if (timeDiffMin > 30) confidence = 50;
    if (timeDiffMin > 45) confidence = 45;

    return [{
      callId: call.call_id,
      fromNumber: call.from_number,
      callTimestamp: call.start_time,
      attributionMethod: 'session_fallback',
      attributionConfidence: confidence,
      adPlatform: nearest.session.platform,
      campaignId: null,
      campaignName: nearest.session.utm_campaign || null,
      utmSource: nearest.session.utm_source || null,
      utmMedium: nearest.session.utm_medium || null,
      utmCampaign: nearest.session.utm_campaign || null,
      utmTerm: nearest.session.utm_term || null,
      // Do not persist fallback click IDs onto ringcentral_calls. Downstream
      // export logic treats call-level click IDs as direct attribution evidence.
      gclid: undefined,
      msclkid: undefined,
      sessionId: nearest.session.session_id,
      matchDetails: `Fallback matched ${nearest.session.platform} session ${nearest.session.session_id} ${timeDiffMin}m from call; no phone_click event was available`,
    }];
  });
}

export async function attributeAllCalls(
  startDate: string,
  endDate: string
): Promise<{
  attributed: AttributionResult[];
  summary: {
    total: number;
    qualifyingCalls: number;
    googleCallViewMatches: number;
    microsoftUploadedMatches: number;
    directMatches: number;
    conflictedMatches: number;
    sessionFallbackMatches: number;
    timeCorrelated: number;
    unknown: number;
    avgConfidence: number;
  };
}> {
  const client = getSupabaseClient();

  const { data: calls, error } = await client
    .from('ringcentral_calls')
    .select('call_id, from_number, start_time, direction, duration, google_ads_call_match, google_ads_call_resource_name, google_ads_uploaded_at, microsoft_ads_uploaded_at, ad_platform, utm_source, utm_medium, utm_campaign, website_session_id')
    .eq('direction', 'Inbound')
    .gte('start_time', `${startDate}T00:00:00.000Z`)
    .lte('start_time', `${endDate}T23:59:59.999Z`);

  if (error || !calls) {
    console.error('Error fetching calls:', error);
    return {
      attributed: [],
      summary: {
        total: 0,
        qualifyingCalls: 0,
        googleCallViewMatches: 0,
        microsoftUploadedMatches: 0,
        directMatches: 0,
        conflictedMatches: 0,
        sessionFallbackMatches: 0,
        timeCorrelated: 0,
        unknown: 0,
        avgConfidence: 0,
      },
    };
  }

  const qualifyingCalls = applyQualifyingFilter(calls as RingCentralCall[]);
  console.log(`📞 Attributing ${qualifyingCalls.length} qualifying inbound calls...`);

  const canonicalEvidenceMatches = matchCanonicalPlatformEvidence(qualifyingCalls);
  const evidenceMatchedCallIds = new Set(canonicalEvidenceMatches.map(result => result.callId));

  const remainingCalls = qualifyingCalls.filter(call => !evidenceMatchedCallIds.has(call.call_id));
  const directMatches = await matchDirectConversions(remainingCalls);
  const directMatchedCallIds = new Set(directMatches.map(result => result.callId));
  const fallbackCalls = remainingCalls.filter(call => !directMatchedCallIds.has(call.call_id));
  const sessionFallbackMatches = await matchSessionFallback(fallbackCalls);
  const matchedCallIds = new Set([
    ...evidenceMatchedCallIds,
    ...directMatches.map(result => result.callId),
    ...sessionFallbackMatches.map(result => result.callId),
  ]);

  const unknownResults: AttributionResult[] = qualifyingCalls
    .filter(call => !matchedCallIds.has(call.call_id))
    .map(call => ({
      callId: call.call_id,
      fromNumber: call.from_number,
      callTimestamp: call.start_time,
      attributionMethod: 'unknown' as const,
      attributionConfidence: 0,
      adPlatform: null,
      campaignId: null,
      campaignName: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      sessionId: null,
      matchDetails: 'No direct attribution evidence found',
    }));

  const allResults = [...canonicalEvidenceMatches, ...directMatches, ...sessionFallbackMatches, ...unknownResults];
  const summary = {
    total: allResults.length,
    qualifyingCalls: qualifyingCalls.length,
    googleCallViewMatches: allResults.filter(result => result.attributionMethod === 'google_call_view').length,
    microsoftUploadedMatches: allResults.filter(result => result.attributionMethod === 'microsoft_uploaded_call').length,
    directMatches: allResults.filter(result => result.attributionMethod === 'direct_match').length,
    conflictedMatches: allResults.filter(result => result.attributionMethod === 'direct_match_conflict').length,
    sessionFallbackMatches: allResults.filter(result => result.attributionMethod === 'session_fallback').length,
    timeCorrelated: 0,
    unknown: allResults.filter(result => result.attributionMethod === 'unknown').length,
    avgConfidence: allResults.reduce((sum, result) => sum + result.attributionConfidence, 0) / allResults.length || 0,
  };

  console.log('📊 Attribution complete:', summary);
  return { attributed: allResults, summary };
}

export async function saveAttributionResults(
  results: AttributionResult[]
): Promise<{ success: number; failed: number }> {
  const client = getSupabaseClient();
  let success = 0;
  let failed = 0;

  const { data: existingRows, error: existingError } = await client
    .from('ringcentral_calls')
    .select('call_id, attribution_method')
    .in('call_id', results.map(result => result.callId));

  if (existingError) {
    console.error('Failed to load existing attribution rows:', existingError);
  }

  const existingByCallId = new Map(
    (existingRows || []).map((row: any) => [row.call_id, row.attribution_method || 'unknown'])
  );

  for (const result of results) {
    const existingMethod = existingByCallId.get(result.callId) || 'unknown';
    const existingPriority = METHOD_PRIORITY[existingMethod] ?? 0;
    const nextPriority = METHOD_PRIORITY[result.attributionMethod] ?? 0;

    if (nextPriority < existingPriority) {
      continue;
    }

    const updateData: Record<string, any> = {
      attribution_method: result.attributionMethod,
      attribution_confidence: result.attributionConfidence,
      ad_platform: result.adPlatform,
      utm_source: result.utmSource,
      utm_medium: result.utmMedium,
      utm_campaign: result.utmCampaign,
    };

    if (result.sessionId) {
      updateData.website_session_id = result.sessionId;
    }
    // Only write click IDs and utm_term when present in the result — canonical
    // evidence matches (google_call_view, microsoft_uploaded_call) don't carry
    // these fields and should not overwrite whatever is already on the row.
    if (result.gclid !== undefined) updateData.gclid = result.gclid;
    if (result.msclkid !== undefined) updateData.msclkid = result.msclkid;
    if (result.utmTerm !== undefined) updateData.utm_term = result.utmTerm;

    const { error } = await client
      .from('ringcentral_calls')
      .update(updateData)
      .eq('call_id', result.callId);

    if (error) {
      console.error('Failed to update call:', result.callId, error);
      failed++;
    } else {
      success++;
    }
  }

  console.log(`💾 Saved attribution: ${success} success, ${failed} failed`);
  return { success, failed };
}

export function getAttributionBreakdown(results: AttributionResult[]): Record<string, {
  count: number;
  avgConfidence: number;
  directMatches: number;
  conflictedMatches: number;
  googleCallViewMatches: number;
  microsoftUploadedMatches: number;
  sessionFallbackMatches: number;
}> {
  const breakdown: Record<string, any> = {};

  for (const result of results) {
    const platform = result.adPlatform || 'unknown';

    if (!breakdown[platform]) {
      breakdown[platform] = {
        count: 0,
        totalConfidence: 0,
        directMatches: 0,
        conflictedMatches: 0,
        googleCallViewMatches: 0,
        microsoftUploadedMatches: 0,
        sessionFallbackMatches: 0,
      };
    }

    breakdown[platform].count++;
    breakdown[platform].totalConfidence += result.attributionConfidence;

    if (result.attributionMethod === 'direct_match') {
      breakdown[platform].directMatches++;
    } else if (result.attributionMethod === 'direct_match_conflict') {
      breakdown[platform].conflictedMatches++;
    } else if (result.attributionMethod === 'google_call_view') {
      breakdown[platform].googleCallViewMatches++;
    } else if (result.attributionMethod === 'microsoft_uploaded_call') {
      breakdown[platform].microsoftUploadedMatches++;
    } else if (result.attributionMethod === 'session_fallback') {
      breakdown[platform].sessionFallbackMatches++;
    }
  }

  const final: Record<string, any> = {};
  for (const [platform, data] of Object.entries(breakdown)) {
    final[platform] = {
      count: data.count,
      avgConfidence: Math.round(data.totalConfidence / data.count),
      directMatches: data.directMatches,
      conflictedMatches: data.conflictedMatches,
      googleCallViewMatches: data.googleCallViewMatches,
      microsoftUploadedMatches: data.microsoftUploadedMatches,
      sessionFallbackMatches: data.sessionFallbackMatches,
    };
  }

  return final;
}
