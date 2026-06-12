/**
 * Offline Conversion Sync (PR 2b — export-contract consumer)
 *
 * Uploads offline conversions to Google Ads and Microsoft Ads by consuming
 * export_candidates (built every cron run by exportCandidateBuilder, which owns
 * ALL attribution/eligibility logic). This module no longer does inline
 * attribution — it:
 *
 *   1. Fetches eligible, not-yet-uploaded candidates for its platform
 *   2. Plans uploads via prepareCandidateUploads (pure, unit-tested):
 *      - backstamps candidates whose source row was already uploaded by the
 *        pre-PR2b uploader (transition safety — never re-upload)
 *      - re-checks test/excluded sources (defense in depth)
 *   3. Uploads, then stamps BOTH export_candidates.uploaded_at AND the legacy
 *      per-source columns (ringcentral_calls.*_uploaded_at,
 *      leads.*_form_uploaded_at) — dashboards, getAttributionStats, and the
 *      compare script still read the legacy columns.
 *
 * Failures set export_candidates.upload_error and leave uploaded_at NULL, so
 * the next cron run retries (Google/Microsoft reject true duplicates
 * server-side, so a retry after a partially-failed batch is safe).
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
import {
  MIN_CALL_DURATION_SECONDS,
  isExcludedPhone,
  isTestPhone,
} from './constants';

// Default conversion value for phone calls (15.3% close rate × $360 avg ticket)
const DEFAULT_CALL_VALUE = 55;
// Default conversion value for form leads (25.2% close rate × $360 avg ticket)
const DEFAULT_FORM_VALUE = 91;

// How far back to consider candidates. The builder only writes a 7-day window,
// but a candidate that failed upload repeatedly may be older; 30 days matches
// the platforms' click-attribution ceilings.
const CANDIDATE_LOOKBACK_DAYS = 30;
const CANDIDATE_BATCH_LIMIT = 2000;

// Optional: separate conversion action for form leads.
// SAFETY: if enabled, this action MUST be a distinct action from GOOGLE_ADS_LEAD_FORM_LABEL
// (the online gtag action). Using the same action would double-count every gclid form lead —
// once from the live gtag fire and once from this offline upload.
const GOOGLE_ADS_FORM_CONVERSION_ACTION_ID = process.env.GOOGLE_ADS_OFFLINE_LEAD_FORM_ACTION_ID;
const MICROSOFT_OFFLINE_FORM_CONVERSION_NAME = process.env.MICROSOFT_OFFLINE_FORM_CONVERSION_NAME;

// Microsoft Ads offline conversion goal name (must match exactly what was created in UI)
const MICROSOFT_OFFLINE_CONVERSION_NAME = 'Phone Call (Ring Central)';

// ── Types ─────────────────────────────────────────────────────────────────────

/** Subset of export_candidates columns the uploader consumes. */
export interface UploadCandidateRow {
  id: string;
  source_type: 'call' | 'lead';
  source_id: string;
  platform: 'google' | 'microsoft';
  click_id_type: 'gclid' | 'msclkid' | null;
  click_id: string | null;
  conversion_time: string;
  call_value: number | null;
}

interface SourceCallContext {
  legacyUploadedAt: string | null;
  fromNumber: string | null;
}

interface SourceLeadContext {
  legacyUploadedAt: string | null;
  revenueAmount: number | null;
  isTest: boolean;
}

export interface PrepareContext {
  callRows: Map<string, SourceCallContext>;
  leadRows: Map<string, SourceLeadContext>;
  /** Is the platform's separate form-lead conversion action configured? */
  formActionConfigured: boolean;
  /** Defense in depth: true → never upload this candidate's source. */
  isExcludedSource: (candidate: UploadCandidateRow) => boolean;
  now: Date;
}

export interface PlannedUpload {
  candidateId: string;
  sourceType: 'call' | 'lead';
  sourceId: string;
  clickId: string;
  conversionTime: Date;
  value: number;
  isFormLead: boolean;
}

export interface UploadPlan {
  uploads: PlannedUpload[];
  /** Candidates whose source the LEGACY uploader already sent — stamp, don't upload. */
  backstamps: Array<{ candidateId: string; uploadedAt: string }>;
  skipped: Array<{ candidateId: string; reason: string }>;
}

interface SyncResult {
  callsProcessed: number;
  callsAttributed: number;
  conversionsUploaded: number;
  conversionsFailed: number;
  errors: string[];
}

// ── Pure planning function (unit-tested) ──────────────────────────────────────

export function prepareCandidateUploads(
  candidates: UploadCandidateRow[],
  ctx: PrepareContext
): UploadPlan {
  const plan: UploadPlan = { uploads: [], backstamps: [], skipped: [] };

  for (const candidate of candidates) {
    if (!candidate.click_id) {
      plan.skipped.push({ candidateId: candidate.id, reason: 'missing_click_id' });
      continue;
    }

    if (candidate.source_type === 'call') {
      const source = ctx.callRows.get(candidate.source_id);
      if (!source) {
        plan.skipped.push({ candidateId: candidate.id, reason: 'source_row_missing' });
        continue;
      }
      if (ctx.isExcludedSource(candidate)) {
        plan.skipped.push({ candidateId: candidate.id, reason: 'excluded_source' });
        continue;
      }
      if (source.legacyUploadedAt) {
        plan.backstamps.push({ candidateId: candidate.id, uploadedAt: source.legacyUploadedAt });
        continue;
      }
      plan.uploads.push({
        candidateId: candidate.id,
        sourceType: 'call',
        sourceId: candidate.source_id,
        clickId: candidate.click_id,
        conversionTime: new Date(candidate.conversion_time),
        value: candidate.call_value ?? DEFAULT_CALL_VALUE,
        isFormLead: false,
      });
      continue;
    }

    // source_type === 'lead'
    const lead = ctx.leadRows.get(candidate.source_id);
    if (!lead) {
      plan.skipped.push({ candidateId: candidate.id, reason: 'source_row_missing' });
      continue;
    }
    if (lead.isTest) {
      plan.skipped.push({ candidateId: candidate.id, reason: 'test_lead' });
      continue;
    }
    if (ctx.isExcludedSource(candidate)) {
      plan.skipped.push({ candidateId: candidate.id, reason: 'excluded_source' });
      continue;
    }
    if (lead.legacyUploadedAt) {
      plan.backstamps.push({ candidateId: candidate.id, uploadedAt: lead.legacyUploadedAt });
      continue;
    }
    if (!ctx.formActionConfigured) {
      plan.skipped.push({ candidateId: candidate.id, reason: 'form_action_not_configured' });
      continue;
    }
    plan.uploads.push({
      candidateId: candidate.id,
      sourceType: 'lead',
      sourceId: candidate.source_id,
      clickId: candidate.click_id,
      conversionTime: new Date(candidate.conversion_time),
      value: Number(lead.revenueAmount) || DEFAULT_FORM_VALUE,
      isFormLead: true,
    });
  }

  return plan;
}

// ── Supabase plumbing ─────────────────────────────────────────────────────────

function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not configured');
  }

  return createClient(supabaseUrl, supabaseKey);
}

async function fetchUploadableCandidates(
  supabase: SupabaseClient,
  platform: 'google' | 'microsoft'
): Promise<UploadCandidateRow[]> {
  const lookback = new Date();
  lookback.setDate(lookback.getDate() - CANDIDATE_LOOKBACK_DAYS);

  const { data, error } = await supabase
    .from('export_candidates')
    .select('id, source_type, source_id, platform, click_id_type, click_id, conversion_time, call_value')
    .eq('platform', platform)
    .eq('eligible', true)
    .is('uploaded_at', null)
    .in('source_type', ['call', 'lead'])
    .gte('conversion_time', lookback.toISOString())
    .order('conversion_time', { ascending: true })
    .limit(CANDIDATE_BATCH_LIMIT);

  if (error) {
    throw new Error(`export_candidates fetch failed: ${error.message}`);
  }
  return (data || []) as UploadCandidateRow[];
}

async function buildPrepareContext(
  supabase: SupabaseClient,
  candidates: UploadCandidateRow[],
  platform: 'google' | 'microsoft'
): Promise<PrepareContext> {
  const callIds = [...new Set(candidates.filter((c) => c.source_type === 'call').map((c) => c.source_id))];
  const leadIds = [...new Set(candidates.filter((c) => c.source_type === 'lead').map((c) => c.source_id))];

  const callRows = new Map<string, SourceCallContext>();
  if (callIds.length > 0) {
    const { data, error } = await supabase
      .from('ringcentral_calls')
      .select('call_id, from_number, google_ads_uploaded_at, microsoft_ads_uploaded_at')
      .in('call_id', callIds);
    if (error) throw new Error(`ringcentral_calls fetch failed: ${error.message}`);
    for (const row of data || []) {
      callRows.set(row.call_id, {
        legacyUploadedAt:
          platform === 'google' ? row.google_ads_uploaded_at : row.microsoft_ads_uploaded_at,
        fromNumber: row.from_number,
      });
    }
  }

  const leadRows = new Map<string, SourceLeadContext>();
  if (leadIds.length > 0) {
    const { data, error } = await supabase
      .from('leads')
      .select('id, revenue_amount, is_test, google_ads_form_uploaded_at, microsoft_ads_form_uploaded_at')
      .in('id', leadIds);
    if (error) throw new Error(`leads fetch failed: ${error.message}`);
    for (const row of data || []) {
      leadRows.set(row.id, {
        legacyUploadedAt:
          platform === 'google' ? row.google_ads_form_uploaded_at : row.microsoft_ads_form_uploaded_at,
        revenueAmount: row.revenue_amount,
        isTest: !!row.is_test,
      });
    }
  }

  const formActionConfigured =
    platform === 'google'
      ? !!GOOGLE_ADS_FORM_CONVERSION_ACTION_ID
      : !!MICROSOFT_OFFLINE_FORM_CONVERSION_NAME;

  return {
    callRows,
    leadRows,
    formActionConfigured,
    isExcludedSource: (candidate) => {
      if (candidate.source_type !== 'call') return false;
      const fromNumber = callRows.get(candidate.source_id)?.fromNumber || '';
      return isExcludedPhone(fromNumber) || isTestPhone(fromNumber);
    },
    now: new Date(),
  };
}

async function applyBackstamps(
  supabase: SupabaseClient,
  backstamps: UploadPlan['backstamps']
): Promise<void> {
  for (const stamp of backstamps) {
    const { error } = await supabase
      .from('export_candidates')
      .update({ uploaded_at: stamp.uploadedAt })
      .eq('id', stamp.candidateId);
    if (error) {
      console.error(`Error backstamping candidate ${stamp.candidateId}:`, error.message);
    }
  }
}

async function markCandidatesUploaded(
  supabase: SupabaseClient,
  candidateIds: string[]
): Promise<void> {
  if (candidateIds.length === 0) return;
  const { error } = await supabase
    .from('export_candidates')
    .update({ uploaded_at: new Date().toISOString(), upload_error: null })
    .in('id', candidateIds);
  if (error) {
    console.error('Error marking candidates uploaded:', error.message);
  }
}

async function markCandidateErrors(
  supabase: SupabaseClient,
  failures: Array<{ candidateId: string; error: string }>
): Promise<void> {
  for (const failure of failures) {
    const { error } = await supabase
      .from('export_candidates')
      .update({ upload_error: failure.error.slice(0, 500) })
      .eq('id', failure.candidateId);
    if (error) {
      console.error(`Error recording upload_error for ${failure.candidateId}:`, error.message);
    }
  }
}

/**
 * Mark calls as uploaded (legacy bookkeeping columns).
 *
 * Dashboards, getAttributionStats, and compare-export-candidates.js read these
 * columns. Does NOT write ad_platform: that's the canonical attribution
 * resolver's job (src/lib/callAttribution.ts) — see
 * tasks/2026-04-14-attribution-remediation.md.
 */
async function markCallsAsUploaded(
  supabase: SupabaseClient,
  platform: 'google' | 'microsoft',
  callIds: string[]
): Promise<void> {
  if (callIds.length === 0) return;
  const column = platform === 'google' ? 'google_ads_uploaded_at' : 'microsoft_ads_uploaded_at';
  const { error } = await supabase
    .from('ringcentral_calls')
    .update({ [column]: new Date().toISOString() })
    .in('call_id', callIds);
  if (error) {
    console.error(`Error marking calls as uploaded (${platform}):`, error.message);
  }
}

async function markLeadsAsUploaded(
  supabase: SupabaseClient,
  platform: 'google' | 'microsoft',
  leadIds: string[]
): Promise<void> {
  if (leadIds.length === 0) return;
  const column =
    platform === 'google' ? 'google_ads_form_uploaded_at' : 'microsoft_ads_form_uploaded_at';
  const { error } = await supabase
    .from('leads')
    .update({ [column]: new Date().toISOString() })
    .in('id', leadIds);
  if (error) {
    console.error(`Error marking leads as uploaded (${platform}):`, error.message);
  }
}

// ── Shared sync driver ────────────────────────────────────────────────────────

async function syncPlatform(
  platform: 'google' | 'microsoft',
  upload: (uploads: PlannedUpload[]) => Promise<{
    results: Array<{ success: boolean; error?: string }>;
    successCount: number;
    failureCount: number;
  }>
): Promise<SyncResult> {
  const result: SyncResult = {
    callsProcessed: 0,
    callsAttributed: 0,
    conversionsUploaded: 0,
    conversionsFailed: 0,
    errors: [],
  };

  try {
    const supabase = getSupabaseClient();

    const candidates = await fetchUploadableCandidates(supabase, platform);
    result.callsProcessed = candidates.length;

    if (candidates.length === 0) {
      console.log(`📭 No pending export candidates for ${platform}`);
      return result;
    }

    const ctx = await buildPrepareContext(supabase, candidates, platform);
    const plan = prepareCandidateUploads(candidates, ctx);
    result.callsAttributed = plan.uploads.length;

    if (plan.backstamps.length > 0) {
      console.log(`🕰️ Backstamping ${plan.backstamps.length} candidate(s) already uploaded by legacy uploader`);
      await applyBackstamps(supabase, plan.backstamps);
    }
    for (const skip of plan.skipped) {
      console.log(`⏭️ Skipping candidate ${skip.candidateId}: ${skip.reason}`);
    }

    if (plan.uploads.length === 0) {
      console.log(`📭 No offline conversions to upload to ${platform}`);
      return result;
    }

    const uploadResult = await upload(plan.uploads);
    result.conversionsUploaded = uploadResult.successCount;
    result.conversionsFailed = uploadResult.failureCount;

    const uploadedCandidateIds: string[] = [];
    const uploadedCallIds: string[] = [];
    const uploadedLeadIds: string[] = [];
    const failures: Array<{ candidateId: string; error: string }> = [];

    uploadResult.results.forEach((res, index) => {
      const planned = plan.uploads[index];
      if (!planned) return;
      if (res.success) {
        uploadedCandidateIds.push(planned.candidateId);
        if (planned.sourceType === 'call') uploadedCallIds.push(planned.sourceId);
        if (planned.sourceType === 'lead') uploadedLeadIds.push(planned.sourceId);
      } else {
        failures.push({ candidateId: planned.candidateId, error: res.error || 'unknown error' });
        const errorMsg = `Failed to upload ${platform} conversion (candidate ${planned.candidateId}): ${res.error}`;
        result.errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    });

    await markCandidatesUploaded(supabase, uploadedCandidateIds);
    await markCallsAsUploaded(supabase, platform, uploadedCallIds);
    await markLeadsAsUploaded(supabase, platform, uploadedLeadIds);
    await markCandidateErrors(supabase, failures);

    console.log(`\n✅ ${platform} offline conversion sync complete:`);
    console.log(`   Candidates fetched: ${candidates.length}`);
    console.log(`   Uploads planned: ${plan.uploads.length} (backstamped: ${plan.backstamps.length}, skipped: ${plan.skipped.length})`);
    console.log(`   Conversions uploaded: ${result.conversionsUploaded}`);
    console.log(`   Failures: ${result.conversionsFailed}`);
  } catch (error: any) {
    const errorMsg = `${platform} offline conversion sync failed: ${error.message}`;
    result.errors.push(errorMsg);
    console.error(`❌ ${errorMsg}`);
  }

  return result;
}

// ── Public API (signatures unchanged from pre-PR2b) ───────────────────────────

/**
 * Upload pending Google Ads offline conversions from export_candidates.
 */
export async function syncOfflineConversions(): Promise<SyncResult> {
  console.log('\n📤 Starting offline conversion sync (export contract)...');
  if (!GOOGLE_ADS_FORM_CONVERSION_ACTION_ID) {
    console.warn('⚠️ GOOGLE_ADS_OFFLINE_LEAD_FORM_ACTION_ID not set - lead candidates will be skipped');
  }

  return syncPlatform('google', async (uploads) => {
    const conversions: OfflineConversion[] = uploads.map((u) => ({
      gclid: u.clickId,
      conversionDateTime: formatConversionDateTime(u.conversionTime),
      conversionValue: u.value,
      currencyCode: 'USD',
      ...(u.isFormLead ? { conversionActionId: GOOGLE_ADS_FORM_CONVERSION_ACTION_ID } : {}),
    }));
    return uploadOfflineConversions(conversions);
  });
}

/**
 * Upload pending Microsoft Ads offline conversions from export_candidates.
 */
export async function syncMicrosoftOfflineConversions(): Promise<SyncResult> {
  console.log('\n📤 Starting Microsoft Ads offline conversion sync (export contract)...');

  const msConfig = validateMicrosoftAdsConfig();
  if (!msConfig.isValid) {
    console.log('⚠️ Microsoft Ads not configured, skipping sync');
    return {
      callsProcessed: 0,
      callsAttributed: 0,
      conversionsUploaded: 0,
      conversionsFailed: 0,
      errors: [],
    };
  }
  if (!MICROSOFT_OFFLINE_FORM_CONVERSION_NAME) {
    console.warn('⚠️ MICROSOFT_OFFLINE_FORM_CONVERSION_NAME not set - lead candidates will be skipped');
  }

  return syncPlatform('microsoft', async (uploads) => {
    const conversions: MicrosoftOfflineConversion[] = uploads.map((u) => ({
      msclkid: u.clickId,
      conversionName: u.isFormLead
        ? MICROSOFT_OFFLINE_FORM_CONVERSION_NAME || MICROSOFT_OFFLINE_CONVERSION_NAME
        : MICROSOFT_OFFLINE_CONVERSION_NAME,
      conversionTime: formatMicrosoftConversionDateTime(u.conversionTime),
      conversionValue: u.value,
      conversionCurrency: 'USD',
    }));
    return uploadMicrosoftOfflineConversions(conversions);
  });
}

/**
 * Sync offline conversions to both Google Ads and Microsoft Ads
 */
export async function syncAllOfflineConversions(): Promise<{
  googleAds: SyncResult;
  microsoftAds: SyncResult;
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

/**
 * Get attribution stats for a date range (reads legacy bookkeeping columns,
 * which the PR2b uploader keeps in sync).
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
