/**
 * Export Candidate Builder
 *
 * Populates the export_candidates table with one eligibility decision per
 * (source × platform) pair. Runs after crossReferenceCallsToRingCentral so
 * google_ads_call_match is already set on ringcentral_calls.
 *
 * PR 2 OBSERVE-ONLY: this step builds candidates but does NOT change upload
 * behavior. The existing syncOfflineConversions / syncMicrosoftOfflineConversions
 * functions continue to run unchanged. Use scripts/compare-export-candidates.js
 * to compare this contract against the active uploader for 7/30 day windows
 * before flipping in PR 2b.
 *
 * Evidence hierarchy (applied once per call, covers both platforms):
 *   1. google_ads_call_match=true     → skip_google_call_view (ineligible, both)
 *   2. phone_click + click ID in dedup window → skip_realtime_tap (ineligible, both)
 *   3. ringcentral_calls.gclid/msclkid set by canonical resolver → direct_attribution
 *   4. phone_click with click ID outside dedup, inside attribution window → direct_phone_click
 *   5. user_session with click ID in attribution window (unambiguous platform) → session_fallback
 *   6. Both platforms have evidence in steps 4/5 → conflict (ineligible, both)
 *   7. No evidence → missing_click_id (ineligible)
 *
 * Batch design: pre-fetches all evidence in the full evidence window, then
 * applies the decision function in memory — no N+1 DB round-trips per call.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  ATTRIBUTION_WINDOW_MINUTES,
  DEDUP_WINDOW_MINUTES,
  MIN_CALL_DURATION_SECONDS,
  isExcludedPhone,
  isTestPhone,
} from './constants';

// Mirrors DEFAULT_CALL_VALUE in offlineConversionSync (15.3% close × $360 avg ticket)
const CALL_VALUE = 55;
const LOOKBACK_DAYS = 7;
const BATCH_CAP = 10_000;

// ── Types ─────────────────────────────────────────────────────────────────────

export type ExportReason =
  | 'skip_google_call_view'
  | 'skip_realtime_tap'
  | 'direct_attribution'
  | 'direct_phone_click'
  | 'session_fallback'
  | 'conflict'
  | 'missing_click_id';

export interface ExportCandidate {
  source_type: 'call' | 'lead';
  source_id: string;
  platform: 'google' | 'microsoft';
  click_id_type: 'gclid' | 'msclkid' | null;
  click_id: string | null;
  conversion_action: string | null;
  conversion_time: string; // ISO
  call_value: number | null;
  eligible: boolean;
  reason: ExportReason;
  confidence: number;
  generated_at: string;
}

export interface BuilderResult {
  built: number;
  errors: number;
}

// Internal row shapes (only the columns the builder actually needs)

interface CallRow {
  call_id: string;
  from_number: string | null;
  start_time: string;
  google_ads_call_match: boolean | null;
  gclid: string | null;
  msclkid: string | null;
}

interface GclidClickEvent {
  gclid: string;
  created_at: string;
}

interface MsclkidClickEvent {
  msclkid: string;
  created_at: string;
}

interface GoogleSession {
  gclid: string;
  started_at: string;
}

interface MsSession {
  msclkid: string;
  started_at: string;
}

// ── Pure decision function ────────────────────────────────────────────────────
//
// Takes pre-fetched, window-scoped evidence arrays.
// Returns exactly [googleCandidate, microsoftCandidate] — one pair per call.
// No DB calls, fully testable.
//
// Note on Microsoft + Google phone_click interaction: if only gclid phone_click
// events exist in the window, Microsoft is marked missing_click_id (not session
// fallback). A call attributed via a Google ad click should not also be credited
// to Microsoft via session proximity — this is intentionally stricter than the
// current findMicrosoftAttributableCalls() behavior.

export function decideCallCandidates(
  call: CallRow,
  allGclidClicks: GclidClickEvent[],
  allMsclkidClicks: MsclkidClickEvent[],
  allGoogleSessions: GoogleSession[],
  allMsSessions: MsSession[],
  nowMs: number
): [ExportCandidate, ExportCandidate] {
  const callTimeMs = new Date(call.start_time).getTime();
  const generatedAt = new Date(nowMs).toISOString();

  const mk = (
    platform: 'google' | 'microsoft',
    eligible: boolean,
    reason: ExportReason,
    clickIdType: 'gclid' | 'msclkid' | null,
    clickId: string | null,
    confidence: number
  ): ExportCandidate => ({
    source_type: 'call',
    source_id: call.call_id,
    platform,
    click_id_type: clickIdType,
    click_id: clickId,
    conversion_action: null,
    conversion_time: call.start_time,
    call_value: CALL_VALUE,
    eligible,
    reason,
    confidence,
    generated_at: generatedAt,
  });

  const no = (p: 'google' | 'microsoft', r: ExportReason) => mk(p, false, r, null, null, 0);
  const yes = (p: 'google' | 'microsoft', r: ExportReason, k: 'gclid' | 'msclkid', id: string, conf: number) =>
    mk(p, true, r, k, id, conf);

  const dedupStartMs = callTimeMs - DEDUP_WINDOW_MINUTES * 60 * 1000;
  const attrStartMs = callTimeMs - ATTRIBUTION_WINDOW_MINUTES * 60 * 1000;

  // 1. Google call-view already claimed this call
  if (call.google_ads_call_match) {
    return [no('google', 'skip_google_call_view'), no('microsoft', 'skip_google_call_view')];
  }

  // 2. Phone_click with any ad click ID fired inside the dedup window —
  //    real-time gtag already counted this; skip offline upload for both platforms
  const inDedup = (clicks: Array<{ created_at: string }>) =>
    clicks.some(e => {
      const t = new Date(e.created_at).getTime();
      return t >= dedupStartMs && t <= callTimeMs;
    });

  if (inDedup(allGclidClicks) || inDedup(allMsclkidClicks)) {
    return [no('google', 'skip_realtime_tap'), no('microsoft', 'skip_realtime_tap')];
  }

  // 3. Direct attribution already written to ringcentral_calls by PR 1 canonical
  //    resolver (callAttribution.ts → saveAttributionResults)
  if (call.gclid || call.msclkid) {
    return [
      call.gclid ? yes('google', 'direct_attribution', 'gclid', call.gclid, 90) : no('google', 'missing_click_id'),
      call.msclkid ? yes('microsoft', 'direct_attribution', 'msclkid', call.msclkid, 90) : no('microsoft', 'missing_click_id'),
    ];
  }

  // 4. Phone_click event outside the dedup window, inside the attribution window
  const outsideDedup = <T extends { created_at: string }>(clicks: T[]): T[] =>
    clicks.filter(e => {
      const t = new Date(e.created_at).getTime();
      return t >= attrStartMs && t < dedupStartMs;
    });

  const gclidClicksOuter = outsideDedup(allGclidClicks);
  const msclkidClicksOuter = outsideDedup(allMsclkidClicks);

  if (gclidClicksOuter.length > 0 || msclkidClicksOuter.length > 0) {
    const hasG = gclidClicksOuter.length > 0;
    const hasM = msclkidClicksOuter.length > 0;
    if (hasG && hasM) {
      return [no('google', 'conflict'), no('microsoft', 'conflict')];
    }
    if (hasG) {
      return [
        yes('google', 'direct_phone_click', 'gclid', gclidClicksOuter[0].gclid, 85),
        no('microsoft', 'missing_click_id'),
      ];
    }
    return [
      no('google', 'missing_click_id'),
      yes('microsoft', 'direct_phone_click', 'msclkid', msclkidClicksOuter[0].msclkid, 85),
    ];
  }

  // 5. Session fallback — browse-then-call within attribution window
  const inAttrWindow = <T extends { started_at: string }>(sessions: T[]): T[] =>
    sessions.filter(s => {
      const t = new Date(s.started_at).getTime();
      return t >= attrStartMs && t <= callTimeMs;
    });

  const gSessions = inAttrWindow(allGoogleSessions);
  const mSessions = inAttrWindow(allMsSessions);
  const hasGS = gSessions.length > 0;
  const hasMS = mSessions.length > 0;

  if (hasGS && hasMS) {
    return [no('google', 'conflict'), no('microsoft', 'conflict')];
  }
  if (hasGS) {
    return [
      yes('google', 'session_fallback', 'gclid', gSessions[0].gclid, 60),
      no('microsoft', 'missing_click_id'),
    ];
  }
  if (hasMS) {
    return [
      no('google', 'missing_click_id'),
      yes('microsoft', 'session_fallback', 'msclkid', mSessions[0].msclkid, 60),
    ];
  }

  return [no('google', 'missing_click_id'), no('microsoft', 'missing_click_id')];
}

// ── IO layer ──────────────────────────────────────────────────────────────────

function getServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

async function upsertCandidates(
  supabase: SupabaseClient,
  candidates: ExportCandidate[]
): Promise<number> {
  const CHUNK = 500;
  let errors = 0;
  for (let i = 0; i < candidates.length; i += CHUNK) {
    const chunk = candidates.slice(i, i + CHUNK);
    // upsert updates all non-key columns except uploaded_at / upload_error
    // (those are absent from ExportCandidate and Supabase only updates provided fields)
    const { error } = await supabase
      .from('export_candidates')
      .upsert(chunk, { onConflict: 'source_type,source_id,platform' });
    if (error) {
      console.error(`❌ export_candidates upsert error (chunk ${i / CHUNK}): ${error.message}`);
      errors++;
    }
  }
  return errors;
}

export async function buildCallExportCandidates(
  supabase: SupabaseClient,
  lookbackDays = LOOKBACK_DAYS
): Promise<BuilderResult> {
  const nowMs = Date.now();
  const now = new Date(nowMs);
  const lookbackStart = new Date(nowMs - lookbackDays * 24 * 60 * 60 * 1000);
  // Extend evidence window by attribution window so calls near lookbackStart
  // can still find session evidence from before the lookback boundary
  const evidenceStart = new Date(nowMs - (lookbackDays * 24 * 60 + ATTRIBUTION_WINDOW_MINUTES) * 60 * 1000);

  // ── Batch 1: qualifying calls ──
  const { data: rawCalls, error: callsError } = await supabase
    .from('ringcentral_calls')
    .select('call_id, from_number, start_time, google_ads_call_match, gclid, msclkid')
    .eq('direction', 'Inbound')
    .gte('start_time', lookbackStart.toISOString())
    .gte('duration', MIN_CALL_DURATION_SECONDS)
    .limit(BATCH_CAP);

  if (callsError) throw new Error(`exportCandidateBuilder: calls fetch failed: ${callsError.message}`);
  if (!rawCalls?.length) return { built: 0, errors: 0 };
  if (rawCalls.length >= BATCH_CAP) {
    console.warn(`⚠️ exportCandidateBuilder: calls batch hit ${BATCH_CAP} cap — some candidates may be missing`);
  }

  const calls = rawCalls.filter(
    (c: any) => !isExcludedPhone(c.from_number || '') && !isTestPhone(c.from_number || '')
  ) as CallRow[];

  // ── Batch 2–5: all evidence in evidence window ──
  const [
    { data: gclidClicks, error: gcErr },
    { data: msclkidClicks, error: msclkErr },
    { data: googleSessions, error: gsErr },
    { data: msSessions, error: msErr },
  ] = await Promise.all([
    supabase
      .from('conversion_events')
      .select('gclid, created_at')
      .eq('event_type', 'phone_click')
      .not('gclid', 'is', null)
      .gte('created_at', evidenceStart.toISOString())
      .lte('created_at', now.toISOString())
      .limit(BATCH_CAP),
    supabase
      .from('conversion_events')
      .select('msclkid, created_at')
      .eq('event_type', 'phone_click')
      .not('msclkid', 'is', null)
      .gte('created_at', evidenceStart.toISOString())
      .lte('created_at', now.toISOString())
      .limit(BATCH_CAP),
    supabase
      .from('user_sessions')
      .select('gclid, started_at')
      .not('gclid', 'is', null)
      .gte('started_at', evidenceStart.toISOString())
      .lte('started_at', now.toISOString())
      .limit(BATCH_CAP),
    supabase
      .from('user_sessions')
      .select('msclkid, started_at')
      .not('msclkid', 'is', null)
      .gte('started_at', evidenceStart.toISOString())
      .lte('started_at', now.toISOString())
      .limit(BATCH_CAP),
  ]);

  if (gcErr) throw new Error(`exportCandidateBuilder: gclid_clicks fetch failed: ${gcErr.message}`);
  if (msclkErr) throw new Error(`exportCandidateBuilder: msclkid_clicks fetch failed: ${msclkErr.message}`);
  if (gsErr) throw new Error(`exportCandidateBuilder: google_sessions fetch failed: ${gsErr.message}`);
  if (msErr) throw new Error(`exportCandidateBuilder: ms_sessions fetch failed: ${msErr.message}`);

  for (const [name, data] of [
    ['gclid_clicks', gclidClicks], ['msclkid_clicks', msclkidClicks],
    ['google_sessions', googleSessions], ['ms_sessions', msSessions],
  ] as Array<[string, unknown[] | null]>) {
    if ((data?.length ?? 0) >= BATCH_CAP) {
      console.warn(`⚠️ exportCandidateBuilder: ${name} batch hit ${BATCH_CAP} cap`);
    }
  }

  // ── Decision pass (pure, in-memory) ──
  const candidates: ExportCandidate[] = [];
  for (const call of calls) {
    const [g, m] = decideCallCandidates(
      call,
      (gclidClicks || []) as GclidClickEvent[],
      (msclkidClicks || []) as MsclkidClickEvent[],
      (googleSessions || []) as GoogleSession[],
      (msSessions || []) as MsSession[],
      nowMs
    );
    candidates.push(g, m);
  }

  const errors = await upsertCandidates(supabase, candidates);
  return { built: candidates.length - errors * 500, errors };
}

export async function buildLeadExportCandidates(
  supabase: SupabaseClient,
  lookbackDays = LOOKBACK_DAYS
): Promise<BuilderResult> {
  const nowMs = Date.now();
  const lookbackStart = new Date(nowMs - lookbackDays * 24 * 60 * 60 * 1000);

  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, created_at, gclid, msclkid')
    .eq('is_test', false)
    .gte('created_at', lookbackStart.toISOString())
    .not('gclid', 'is', null)
    .limit(BATCH_CAP);

  if (error) throw new Error(`exportCandidateBuilder: leads fetch failed: ${error.message}`);

  const generatedAt = new Date(nowMs).toISOString();
  const candidates: ExportCandidate[] = [];

  for (const lead of leads || []) {
    if (lead.gclid) {
      candidates.push({
        source_type: 'lead',
        source_id: lead.id,
        platform: 'google',
        click_id_type: 'gclid',
        click_id: lead.gclid,
        conversion_action: null,
        conversion_time: lead.created_at,
        call_value: null,
        eligible: true,
        reason: 'direct_attribution',
        confidence: 90,
        generated_at: generatedAt,
      });
    }
    if (lead.msclkid) {
      candidates.push({
        source_type: 'lead',
        source_id: lead.id,
        platform: 'microsoft',
        click_id_type: 'msclkid',
        click_id: lead.msclkid,
        conversion_action: null,
        conversion_time: lead.created_at,
        call_value: null,
        eligible: true,
        reason: 'direct_attribution',
        confidence: 90,
        generated_at: generatedAt,
      });
    }
  }

  // Also capture leads with msclkid but no gclid (excluded by the NOT NULL gclid filter above)
  const { data: msLeads, error: msErr } = await supabase
    .from('leads')
    .select('id, created_at, msclkid')
    .eq('is_test', false)
    .gte('created_at', lookbackStart.toISOString())
    .is('gclid', null)
    .not('msclkid', 'is', null)
    .limit(BATCH_CAP);

  if (msErr) throw new Error(`exportCandidateBuilder: ms_leads fetch failed: ${msErr.message}`);
  for (const lead of msLeads || []) {
    if (lead.msclkid) {
      candidates.push({
        source_type: 'lead',
        source_id: lead.id,
        platform: 'microsoft',
        click_id_type: 'msclkid',
        click_id: lead.msclkid,
        conversion_action: null,
        conversion_time: lead.created_at,
        call_value: null,
        eligible: true,
        reason: 'direct_attribution',
        confidence: 90,
        generated_at: generatedAt,
      });
    }
  }

  const errors = await upsertCandidates(supabase, candidates);
  return { built: candidates.length - errors * 500, errors };
}

export async function buildAllExportCandidates(
  supabase?: SupabaseClient,
  lookbackDays = LOOKBACK_DAYS
): Promise<BuilderResult> {
  const client = supabase ?? getServiceClient();
  const [callResult, leadResult] = await Promise.all([
    buildCallExportCandidates(client, lookbackDays),
    buildLeadExportCandidates(client, lookbackDays),
  ]);
  return {
    built: callResult.built + leadResult.built,
    errors: callResult.errors + leadResult.errors,
  };
}
