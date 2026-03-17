/**
 * Unified Leads Builder — Server-side source of truth for lead rows.
 *
 * Uses the SAME logic as metricsBuilder (date-filtered Supabase queries,
 * no row limits, server-side dedup/suppression) but returns individual
 * lead rows instead of just aggregate counts.
 *
 * This replaces client-side fetchUnifiedLeads() as the canonical source
 * for lead data on all admin dashboard pages.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { type DateFilter, getMountainDayBounds, type MountainDayBounds } from './dateUtils';
import {
  ATTRIBUTION_WINDOW_MINUTES,
  BUSINESS_PHONE_NUMBER,
  MIN_CALL_DURATION_SECONDS,
} from './constants';

const TOLL_FREE_PREFIXES = ['+1800', '+1833', '+1844', '+1855', '+1866', '+1877', '+1888'];

// ── Types ──────────────────────────────────────────────────────────

export interface UnifiedLeadRow {
  id: string;
  type: 'form' | 'call' | 'text';
  name: string;
  phone: string;
  email?: string;
  created_at: string;
  status: string;

  // Detail fields
  vehicle_year?: number;
  vehicle_make?: string;
  vehicle_model?: string;
  service_type?: string;
  city?: string;
  state?: string;
  zip?: string;
  quote_amount?: number;
  revenue_amount?: number;
  close_date?: string;
  notes?: string;

  // Call-specific
  direction?: string;
  duration?: number;
  result?: string;
  recording_id?: string;

  // Attribution
  ad_platform: string | null; // 'google' | 'microsoft' | null
  utm_campaign?: string;
  utm_source?: string;
  utm_medium?: string;
  gclid?: string;
  msclkid?: string;
}

export interface UnifiedLeadsResult {
  period: { start: string; end: string; display: string };
  leads: UnifiedLeadRow[];
  counts: {
    total: number;
    calls: number;
    forms: number;
    texts: number;
    byPlatform: {
      google: number;
      microsoft: number;
      unattributed: number;
    };
  };
}

// ── Builder ──────────────────────────────────────────────────────────

function getServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function buildUnifiedLeads(
  period: DateFilter,
  platformFilter?: string
): Promise<UnifiedLeadsResult> {
  const bounds = getMountainDayBounds(period);
  const supabase = getServiceClient();

  // Fetch form/SMS leads, calls, and suppression data in parallel
  const [formLeads, callsData, existingCallPhones, sessionAttr] = await Promise.all([
    fetchFormLeadRows(supabase, bounds),
    fetchCallRows(supabase, bounds),
    fetchCallLeadPhones(supabase),
    fetchSessionAttribution(supabase, bounds),
  ]);

  // Process calls into deduplicated lead rows
  const callLeads = deduplicateCallRows(callsData, existingCallPhones, sessionAttr);

  // Combine
  let allLeads: UnifiedLeadRow[] = [...formLeads, ...callLeads];

  // Apply platform filter if requested
  if (platformFilter) {
    allLeads = allLeads.filter(l => l.ad_platform === platformFilter);
  }

  // Sort newest first
  allLeads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Build counts
  const counts = {
    total: allLeads.length,
    calls: allLeads.filter(l => l.type === 'call').length,
    forms: allLeads.filter(l => l.type === 'form').length,
    texts: allLeads.filter(l => l.type === 'text').length,
    byPlatform: {
      google: allLeads.filter(l => l.ad_platform === 'google').length,
      microsoft: allLeads.filter(l => l.ad_platform === 'microsoft').length,
      unattributed: allLeads.filter(l => !l.ad_platform || (l.ad_platform !== 'google' && l.ad_platform !== 'microsoft')).length,
    },
  };

  return {
    period: { start: bounds.startUTC, end: bounds.endUTC, display: bounds.display },
    leads: allLeads,
    counts,
  };
}

// ── Data fetchers (mirrors metricsBuilder logic, returns full rows) ──

async function fetchFormLeadRows(
  supabase: SupabaseClient,
  bounds: MountainDayBounds
): Promise<UnifiedLeadRow[]> {
  const { data } = await supabase
    .from('leads')
    .select('*')
    .eq('is_test', false)
    .gte('created_at', bounds.startUTC)
    .lte('created_at', bounds.endUTC)
    .order('created_at', { ascending: false });

  return (data || []).map((l: any) => {
    let platform = l.ad_platform;
    if (!platform) {
      if (l.gclid) platform = 'google';
      else if (l.msclkid) platform = 'microsoft';
    }
    // Normalize: only google/microsoft count as attributed
    if (platform && platform !== 'google' && platform !== 'microsoft') {
      platform = null;
    }

    return {
      id: l.id,
      type: l.first_contact_method === 'sms' ? 'text' as const
        : l.first_contact_method === 'call' ? 'call' as const
        : 'form' as const,
      name: `${l.first_name || ''} ${l.last_name || ''}`.trim() || 'Unknown',
      phone: l.phone_e164 || l.phone || '',
      email: l.email,
      created_at: l.created_at,
      status: l.status || 'new',
      vehicle_year: l.vehicle_year,
      vehicle_make: l.vehicle_make,
      vehicle_model: l.vehicle_model,
      service_type: l.service_type,
      city: l.city,
      state: l.state,
      zip: l.zip,
      quote_amount: l.quote_amount,
      revenue_amount: l.revenue_amount,
      close_date: l.close_date,
      notes: l.notes,
      ad_platform: platform,
      utm_campaign: l.utm_campaign,
      utm_source: l.utm_source,
      utm_medium: l.utm_medium,
      gclid: l.gclid,
      msclkid: l.msclkid,
    };
  });
}

async function fetchCallRows(
  supabase: SupabaseClient,
  bounds: MountainDayBounds
): Promise<any[]> {
  const { data } = await supabase
    .from('ringcentral_calls')
    .select('from_number, from_name, start_time, duration, direction, result, recording_id, ad_platform')
    .gte('start_time', bounds.startUTC)
    .lte('start_time', bounds.endUTC)
    .eq('direction', 'Inbound');

  return data || [];
}

/**
 * Get ALL call-type lead phone numbers (global, no date filter).
 * Used to suppress calls that already have a lead record.
 * Matches metricsBuilder.fetchCallLeadPhones() exactly.
 */
async function fetchCallLeadPhones(supabase: SupabaseClient): Promise<Set<string>> {
  const { data } = await supabase
    .from('leads')
    .select('phone_e164')
    .eq('is_test', false)
    .eq('first_contact_method', 'call');

  const phones = new Set<string>();
  for (const row of data || []) {
    if (row.phone_e164) phones.add(row.phone_e164);
  }
  return phones;
}

async function fetchSessionAttribution(
  supabase: SupabaseClient,
  bounds: MountainDayBounds
) {
  const matchWindowMs = ATTRIBUTION_WINDOW_MINUTES * 60 * 1000;
  const windowStart = new Date(new Date(bounds.startUTC).getTime() - matchWindowMs).toISOString();

  const [{ data: googleSessions }, { data: msSessions }] = await Promise.all([
    supabase
      .from('user_sessions')
      .select('started_at')
      .not('gclid', 'is', null)
      .gte('started_at', windowStart)
      .lte('started_at', bounds.endUTC)
      .limit(10000),
    supabase
      .from('user_sessions')
      .select('started_at')
      .not('msclkid', 'is', null)
      .gte('started_at', windowStart)
      .lte('started_at', bounds.endUTC)
      .limit(10000),
  ]);

  return {
    googleSessions: googleSessions || [],
    microsoftSessions: msSessions || [],
  };
}

function deduplicateCallRows(
  calls: any[],
  existingCallPhones: Set<string>,
  sessionAttr: { googleSessions: any[]; microsoftSessions: any[] }
): UnifiedLeadRow[] {
  // Filter qualifying calls (same rules as metricsBuilder)
  const qualifying = calls.filter(call => {
    const num = call.from_number || '';
    if (num === BUSINESS_PHONE_NUMBER) return false;
    if (TOLL_FREE_PREFIXES.some(p => num.startsWith(p))) return false;
    if ((call.duration || 0) < MIN_CALL_DURATION_SECONDS) return false;
    if (!num) return false;
    return true;
  });

  // Dedup: one lead per unique phone, suppress phones already in leads table
  const seen = new Set<string>();
  const leads: UnifiedLeadRow[] = [];

  for (const call of qualifying) {
    if (existingCallPhones.has(call.from_number)) continue;
    if (seen.has(call.from_number)) continue;
    seen.add(call.from_number);

    // Platform attribution: DB column first, then session-based
    let platform = call.ad_platform;
    if (!platform || platform === 'direct') {
      platform = resolveSessionPlatform(call, sessionAttr);
    }
    if (platform && platform !== 'google' && platform !== 'microsoft') {
      platform = null;
    }

    leads.push({
      id: `call-${call.from_number}`,
      type: 'call',
      name: call.from_name || 'Unknown Caller',
      phone: call.from_number,
      created_at: call.start_time,
      status: (call.result === 'Accepted' || call.result === 'Call connected') ? 'contacted' : 'new',
      direction: call.direction,
      duration: call.duration,
      result: call.result,
      recording_id: call.recording_id,
      ad_platform: platform,
    });
  }

  return leads;
}

function resolveSessionPlatform(
  call: any,
  attr: { googleSessions: any[]; microsoftSessions: any[] }
): string | null {
  const callTime = new Date(call.start_time).getTime();
  const windowStart = callTime - ATTRIBUTION_WINDOW_MINUTES * 60 * 1000;

  const hasGoogle = attr.googleSessions.some(s => {
    const t = new Date(s.started_at).getTime();
    return t >= windowStart && t <= callTime;
  });

  const hasMs = attr.microsoftSessions.some(s => {
    const t = new Date(s.started_at).getTime();
    return t >= windowStart && t <= callTime;
  });

  if (hasGoogle && !hasMs) return 'google';
  if (hasMs && !hasGoogle) return 'microsoft';
  return null;
}
