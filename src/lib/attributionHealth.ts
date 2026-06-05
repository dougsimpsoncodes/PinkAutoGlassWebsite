import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { applyQualifyingFilter } from './callQualifying';
import { sendAdminAlertEmail } from './notifications/email';

export interface AttributionHealthSnapshot {
  snapshot_date: string;
  window_start_date: string;
  window_end_date: string;
  raw_inbound_calls: number;
  qualifying_calls: number;
  attributed_calls: number;
  google_call_view_count: number;
  microsoft_uploaded_call_count: number;
  direct_match_count: number;
  direct_match_conflict_count: number;
  unknown_count: number;
  unknown_rate: number;
  conflict_rate: number;
  google_rate: number;
  microsoft_rate: number;
  direct_rate: number;
  avg_confidence: number;
  data_freshness_lag_hours: number | null;
  latest_ringcentral_sync_at: string | null;
  latest_qualifying_call_at: string | null;
  job_runtime_seconds: number | null;
  source: string;
  // Export-contract coverage (added PR 2 — null until export_candidates table populated)
  upload_coverage_rate: number | null;
  session_proximity_eligible_count: number | null;
}

interface CallRow {
  call_id: string;
  from_number: string | null;
  start_time: string;
  direction: string | null;
  duration: number | null;
  attribution_method: string | null;
  attribution_confidence: number | null;
  sync_timestamp: string | null;
}

export interface AttributionHealthAlert {
  metric: string;
  severity: 'warning' | 'critical';
  summary: string;
  details: string;
}

export function getSupabaseServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

function round(value: number, places = 2): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const variance = values.reduce((sum, value) => sum + ((value - avg) ** 2), 0) / values.length;
  return Math.sqrt(variance);
}

function rate(count: number, total: number): number {
  if (!total) return 0;
  return round(count / total, 5);
}

export async function buildAttributionHealthSnapshot(
  supabase: SupabaseClient,
  snapshotDate: string,
  runtimeSeconds?: number | null,
  source = 'check-attribution-health'
): Promise<AttributionHealthSnapshot> {
  const startIso = `${snapshotDate}T00:00:00.000Z`;
  const endIso = `${snapshotDate}T23:59:59.999Z`;

  const [
    { data: calls, error: callsError },
    { data: latestSyncRow, error: syncError },
    { data: exportCandidates, error: ecError },
  ] = await Promise.all([
    supabase
      .from('ringcentral_calls')
      .select('call_id, from_number, start_time, direction, duration, attribution_method, attribution_confidence, sync_timestamp')
      .eq('direction', 'Inbound')
      .gte('start_time', startIso)
      .lte('start_time', endIso),
    supabase
      .from('ringcentral_calls')
      .select('sync_timestamp')
      .not('sync_timestamp', 'is', null)
      .order('sync_timestamp', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('export_candidates')
      .select('eligible, reason, uploaded_at')
      .eq('source_type', 'call')
      .gte('conversion_time', startIso)
      .lte('conversion_time', endIso),
  ]);

  if (callsError) {
    throw new Error(`Failed to fetch attribution-health calls: ${callsError.message}`);
  }
  if (syncError) {
    throw new Error(`Failed to fetch latest RingCentral sync timestamp: ${syncError.message}`);
  }
  // ecError is non-fatal — table may not exist yet on first deploy
  if (ecError) {
    console.warn(`⚠️ attribution-health: export_candidates query failed (${ecError.message}) — coverage metrics will be null`);
  }

  const rawCalls = (calls || []) as CallRow[];
  const qualifyingCalls = applyQualifyingFilter(rawCalls);
  const total = qualifyingCalls.length;

  const googleCallViewCount = qualifyingCalls.filter(c => c.attribution_method === 'google_call_view').length;
  const microsoftUploadedCallCount = qualifyingCalls.filter(c => c.attribution_method === 'microsoft_uploaded_call').length;
  const directMatchCount = qualifyingCalls.filter(c => c.attribution_method === 'direct_match').length;
  const directMatchConflictCount = qualifyingCalls.filter(c => c.attribution_method === 'direct_match_conflict').length;
  const unknownCount = qualifyingCalls.filter(c => !c.attribution_method || c.attribution_method === 'unknown').length;
  const attributedCalls = total - unknownCount;
  const avgConfidence = total
    ? round(qualifyingCalls.reduce((sum, call) => sum + (call.attribution_confidence || 0), 0) / total, 2)
    : 0;

  const latestQualifyingCallAt = qualifyingCalls.length
    ? qualifyingCalls.reduce((latest, call) => call.start_time > latest ? call.start_time : latest, qualifyingCalls[0].start_time)
    : null;

  const latestRingcentralSyncAt = latestSyncRow?.sync_timestamp || null;
  const dataFreshnessLagHours = latestRingcentralSyncAt
    ? round((Date.now() - new Date(latestRingcentralSyncAt).getTime()) / 36e5, 2)
    : null;

  // Export-contract coverage (requires export_candidates to be populated by the builder)
  let uploadCoverageRate: number | null = null;
  let sessionProximityEligibleCount: number | null = null;

  if (exportCandidates && !ecError) {
    const eligible = exportCandidates.filter((c: any) => c.eligible);
    const uploaded = eligible.filter((c: any) => c.uploaded_at != null);
    uploadCoverageRate = eligible.length ? rate(uploaded.length, eligible.length) : 0;
    sessionProximityEligibleCount = eligible.filter(
      (c: any) => c.reason === 'session_fallback'
    ).length;
  }

  return {
    snapshot_date: snapshotDate,
    window_start_date: snapshotDate,
    window_end_date: snapshotDate,
    raw_inbound_calls: rawCalls.length,
    qualifying_calls: total,
    attributed_calls: attributedCalls,
    google_call_view_count: googleCallViewCount,
    microsoft_uploaded_call_count: microsoftUploadedCallCount,
    direct_match_count: directMatchCount,
    direct_match_conflict_count: directMatchConflictCount,
    unknown_count: unknownCount,
    unknown_rate: rate(unknownCount, total),
    conflict_rate: rate(directMatchConflictCount, total),
    google_rate: rate(googleCallViewCount, total),
    microsoft_rate: rate(microsoftUploadedCallCount, total),
    direct_rate: rate(directMatchCount, total),
    avg_confidence: avgConfidence,
    data_freshness_lag_hours: dataFreshnessLagHours,
    latest_ringcentral_sync_at: latestRingcentralSyncAt,
    latest_qualifying_call_at: latestQualifyingCallAt,
    job_runtime_seconds: runtimeSeconds == null ? null : round(runtimeSeconds, 2),
    source,
    upload_coverage_rate: uploadCoverageRate,
    session_proximity_eligible_count: sessionProximityEligibleCount,
  };
}

export async function saveAttributionHealthSnapshot(
  supabase: SupabaseClient,
  snapshot: AttributionHealthSnapshot
): Promise<void> {
  const { error } = await supabase
    .from('attribution_health_snapshots')
    .upsert(snapshot, { onConflict: 'snapshot_date' });

  if (error) {
    throw new Error(`Failed to save attribution-health snapshot: ${error.message}`);
  }
}

export async function loadRecentAttributionHealthSnapshots(
  supabase: SupabaseClient,
  beforeDate: string,
  limit = 7
): Promise<AttributionHealthSnapshot[]> {
  const { data, error } = await supabase
    .from('attribution_health_snapshots')
    .select('*')
    .lt('snapshot_date', beforeDate)
    .order('snapshot_date', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load attribution-health history: ${error.message}`);
  }

  return (data || []) as AttributionHealthSnapshot[];
}

export function evaluateAttributionHealth(
  current: AttributionHealthSnapshot,
  history: AttributionHealthSnapshot[]
): AttributionHealthAlert[] {
  const alerts: AttributionHealthAlert[] = [];

  if (current.qualifying_calls === 0) {
    alerts.push({
      metric: 'qualifying_calls',
      severity: 'critical',
      summary: 'No qualifying calls were available for attribution.',
      details: 'A zero-call day can indicate an upstream sync failure or a severe tracking gap. Check RingCentral sync and qualifying-call filters immediately.',
    });
  }

  if ((current.data_freshness_lag_hours || 0) > 26) {
    alerts.push({
      metric: 'data_freshness_lag_hours',
      severity: 'critical',
      summary: `RingCentral sync freshness lag is ${current.data_freshness_lag_hours}h.`,
      details: 'Freshness beyond 26 hours risks stale attribution decisions. Check /api/cron/sync-search-data and RingCentral ingestion health.',
    });
  }

  if (current.unknown_rate > 0.8) {
    alerts.push({
      metric: 'unknown_rate',
      severity: 'critical',
      summary: `Unknown attribution rate is ${round(current.unknown_rate * 100, 1)}%.`,
      details: 'This guardrail indicates severe attribution loss. Inspect recent unknown calls and upstream evidence capture immediately.',
    });
  }

  if (current.conflict_rate > 0.2) {
    alerts.push({
      metric: 'conflict_rate',
      severity: 'warning',
      summary: `Conflict rate is ${round(current.conflict_rate * 100, 1)}%.`,
      details: 'Dual-evidence conflicts are materially elevated. Review deterministic marker overlap before trusting paid-channel splits.',
    });
  }

  const anomalyConfigs = [
    {
      metric: 'unknown_rate',
      direction: 'high' as const,
      label: 'Unknown attribution rate',
      currentValue: current.unknown_rate,
      values: history.map(row => row.unknown_rate),
      minDelta: 0.05,
    },
    {
      metric: 'conflict_rate',
      direction: 'high' as const,
      label: 'Conflict rate',
      currentValue: current.conflict_rate,
      values: history.map(row => row.conflict_rate),
      minDelta: 0.03,
    },
    {
      metric: 'google_rate',
      direction: 'both' as const,
      label: 'Google call-view share',
      currentValue: current.google_rate,
      values: history.map(row => row.google_rate),
      minDelta: 0.05,
    },
    {
      metric: 'microsoft_rate',
      direction: 'both' as const,
      label: 'Microsoft uploaded-call share',
      currentValue: current.microsoft_rate,
      values: history.map(row => row.microsoft_rate),
      minDelta: 0.04,
    },
  ];

  for (const config of anomalyConfigs) {
    if (config.values.length < 5) continue;

    const avg = mean(config.values);
    const sigma = stddev(config.values);
    const delta = config.currentValue - avg;
    const threshold = Math.max(sigma * 2, config.minDelta);

    const highBreach = delta > threshold;
    const lowBreach = -delta > threshold;
    const breached = config.direction === 'high'
      ? highBreach
      : highBreach || lowBreach;

    if (!breached) continue;

    alerts.push({
      metric: config.metric,
      severity: config.metric === 'unknown_rate' ? 'critical' : 'warning',
      summary: `${config.label} moved to ${round(config.currentValue * 100, 1)}% vs ${round(avg * 100, 1)}% 7-day avg.`,
      details: `Delta ${round(delta * 100, 1)} pts exceeded anomaly threshold of ${round(threshold * 100, 1)} pts. Review recent attribution outputs and upstream sync health.`,
    });
  }

  return alerts;
}

export async function sendAttributionHealthAlertEmail(
  snapshot: AttributionHealthSnapshot,
  alerts: AttributionHealthAlert[]
): Promise<boolean> {
  if (alerts.length === 0) return true;

  const severity = alerts.some(alert => alert.severity === 'critical') ? 'CRITICAL' : 'Warning';
  const subject = `🚨 ${severity}: Pink Auto Glass attribution health alert (${snapshot.snapshot_date})`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
      <h2 style="margin-bottom:8px">Attribution health alert</h2>
      <p style="margin-top:0;color:#4b5563">Snapshot date: <strong>${snapshot.snapshot_date}</strong></p>
      <ul>
        ${alerts.map(alert => `<li><strong>${alert.summary}</strong><br/><span style="color:#4b5563">${alert.details}</span></li>`).join('')}
      </ul>
      <h3>Snapshot metrics</h3>
      <table cellpadding="6" cellspacing="0" style="border-collapse:collapse">
        <tr><td><strong>Qualifying calls</strong></td><td>${snapshot.qualifying_calls}</td></tr>
        <tr><td><strong>Unknown rate</strong></td><td>${round(snapshot.unknown_rate * 100, 1)}%</td></tr>
        <tr><td><strong>Conflict rate</strong></td><td>${round(snapshot.conflict_rate * 100, 1)}%</td></tr>
        <tr><td><strong>Google share</strong></td><td>${round(snapshot.google_rate * 100, 1)}%</td></tr>
        <tr><td><strong>Microsoft share</strong></td><td>${round(snapshot.microsoft_rate * 100, 1)}%</td></tr>
        <tr><td><strong>Direct-match share</strong></td><td>${round(snapshot.direct_rate * 100, 1)}%</td></tr>
        <tr><td><strong>Freshness lag</strong></td><td>${snapshot.data_freshness_lag_hours ?? 'n/a'}h</td></tr>
        ${snapshot.upload_coverage_rate != null ? `<tr><td><strong>Upload coverage</strong></td><td>${round(snapshot.upload_coverage_rate * 100, 1)}%</td></tr>` : ''}
        ${snapshot.session_proximity_eligible_count != null ? `<tr><td><strong>Session-proximity eligible</strong></td><td>${snapshot.session_proximity_eligible_count}</td></tr>` : ''}
      </table>
    </div>
  `;

  return sendAdminAlertEmail(subject, html);
}
