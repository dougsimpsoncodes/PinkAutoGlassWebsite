/**
 * Unified Metrics Builder
 *
 * Single source of truth for dashboard metrics. Every admin page should
 * use this (via /api/admin/dashboard/metrics) instead of assembling
 * its own data from multiple tables.
 *
 * ── METRIC DEFINITION SPEC ──────────────────────────────────────────
 *
 * | Metric              | Source Table              | Date Column    | Date Basis                          | Dedup Rule                                    |
 * |---------------------|--------------------------|----------------|-------------------------------------|-----------------------------------------------|
 * | Ad Spend (Google)   | google_ads_daily          | date           | Ad reporting day (calendar date)    | One row per campaign per day                  |
 * | Ad Spend (Microsoft)| microsoft_ads_daily       | date           | Ad reporting day (calendar date)    | One row per campaign per day                  |
 * | Leads (form/SMS)    | leads                     | created_at     | UTC timestamp, MT day boundaries    | One per DB row (already unique)               |
 * | Leads (call)        | ringcentral_calls         | start_time     | UTC timestamp, MT day boundaries    | Per phone + MT calendar day + channel         |
 * | Revenue (gross)     | omega_installs            | install_date   | Calendar date (date-only column)    | One per invoice                               |
 * | Revenue (attributed)| leads                     | close_date     | Calendar date (when status=completed)| One per lead                                 |
 * | Click Events        | conversion_events         | created_at     | UTC timestamp, MT day boundaries    | No dedup (every click counts)                 |
 * | Traffic             | user_sessions             | started_at     | UTC timestamp, MT day boundaries    | One per session                               |
 * | Page Views          | page_views                | created_at     | UTC timestamp, MT day boundaries    | No dedup                                      |
 *
 * ── TERMINOLOGY ─────────────────────────────────────────────────────
 *
 * "Leads" = actual contacts: form submissions, qualifying calls (30s+), SMS leads.
 * "Click Events" = website button clicks: phone_click, text_click, form_submit.
 *   Click events are engagement signals, NOT confirmed contacts.
 *   A user can generate 5 click events and 0 leads (e.g., clicking call but not connecting).
 *
 * ── CALL DEDUP ──────────────────────────────────────────────────────
 *
 * Key: phone_number + MT_calendar_day
 * - Same phone calling twice in one MT day = 1 lead (most recent call used for metadata)
 * - Same phone calling on different MT days = separate leads
 * - Calls from business number, toll-free, or < 30s duration are excluded
 * - Calls are NOT suppressed when phone exists in leads table (repeat customers are valid)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { type DateFilter, getMountainDayBounds, type MountainDayBounds } from './dateUtils';
import {
  BUSINESS_PHONE_NUMBER,
  MIN_CALL_DURATION_SECONDS,
} from './constants';

const TOLL_FREE_PREFIXES = ['+1800', '+1833', '+1844', '+1855', '+1866', '+1877', '+1888'];

// ── Types ──────────────────────────────────────────────────────────

export interface PlatformBreakdown {
  total: number;
  calls: number;
  forms: number;
  texts: number;
}

export interface UnifiedMetrics {
  period: {
    start: string;
    end: string;
    startDate: string;
    endDate: string;
    label: string;
  };
  spend: {
    google: number;
    microsoft: number;
    total: number;
  };
  leads: {
    total: number;
    calls: number;
    forms: number;
    texts: number;
    byPlatform: {
      google: PlatformBreakdown;
      microsoft: PlatformBreakdown;
      unattributed: PlatformBreakdown;
    };
  };
  revenue: {
    gross: number;
    attributed: number;
    byPlatform: {
      google: number;
      microsoft: number;
      unattributed: number;
    };
  };
  traffic: {
    visitors: number;
    pageViews: number;
  };
  clickEvents: {
    phoneClicks: number;
    textClicks: number;
    formSubmits: number;
    total: number;
  };
  // Debug subtotals — included when debug=true to trace mismatches
  _debug?: {
    formLeadCount: number;
    smsLeadCount: number;
    callLeadCount: number;
    rawCallCount: number;
    callsExcludedDuration: number;
    callsExcludedBusinessNumber: number;
    callsExcludedTollFree: number;
    callsDeduplicated: number;
    grossRevenueInvoices: number;
    attributedRevenueLeads: number;
  };
}

// ── Builder ──────────────────────────────────────────────────────────

function getServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function buildMetrics(
  period: DateFilter,
  debug = false
): Promise<UnifiedMetrics> {
  const bounds = getMountainDayBounds(period);
  const supabase = getServiceClient();

  // Run all queries in parallel
  const [
    spendResult,
    formLeadsResult,
    callsResult,
    revenueGrossResult,
    trafficResult,
    clickEventsResult,
  ] = await Promise.all([
    fetchSpend(supabase, bounds),
    fetchFormLeads(supabase, bounds),
    fetchCalls(supabase, bounds),
    fetchGrossRevenue(supabase, bounds),
    fetchTraffic(supabase, bounds),
    fetchClickEvents(supabase, bounds),
  ]);

  // Process calls into deduplicated leads
  const callDedup = deduplicateCalls(callsResult.calls, bounds);

  // Combine form leads + call leads
  const allLeads = [...formLeadsResult.leads, ...callDedup.leads];

  // Build platform breakdowns
  const byPlatform = buildPlatformBreakdown(allLeads);

  // Build revenue attribution
  const revenueByPlatform = buildRevenueByPlatform(formLeadsResult.leads);

  const metrics: UnifiedMetrics = {
    period: {
      start: bounds.startUTC,
      end: bounds.endUTC,
      startDate: bounds.startDate,
      endDate: bounds.endDate,
      label: bounds.display,
    },
    spend: spendResult,
    leads: {
      total: allLeads.length,
      calls: allLeads.filter(l => l.type === 'call').length,
      forms: allLeads.filter(l => l.type === 'form').length,
      texts: allLeads.filter(l => l.type === 'text').length,
      byPlatform,
    },
    revenue: {
      gross: revenueGrossResult.total,
      attributed: formLeadsResult.leads.reduce((sum, l) => sum + (l.revenue || 0), 0),
      byPlatform: revenueByPlatform,
    },
    traffic: trafficResult,
    clickEvents: clickEventsResult,
  };

  if (debug) {
    metrics._debug = {
      formLeadCount: formLeadsResult.leads.filter(l => l.type === 'form').length,
      smsLeadCount: formLeadsResult.leads.filter(l => l.type === 'text').length,
      callLeadCount: callDedup.leads.length,
      rawCallCount: callsResult.calls.length,
      callsExcludedDuration: callDedup.excludedDuration,
      callsExcludedBusinessNumber: callDedup.excludedBusinessNumber,
      callsExcludedTollFree: callDedup.excludedTollFree,
      callsDeduplicated: callDedup.deduplicated,
      grossRevenueInvoices: revenueGrossResult.invoiceCount,
      attributedRevenueLeads: formLeadsResult.leads.filter(l => (l.revenue || 0) > 0).length,
    };
  }

  return metrics;
}

// ── Internal types ──────────────────────────────────────────────────

interface MetricLead {
  type: 'form' | 'call' | 'text';
  platform: string | null; // 'google' | 'microsoft' | null
  revenue: number;
}

// ── Data fetchers ──────────────────────────────────────────────────

async function fetchSpend(supabase: SupabaseClient, bounds: MountainDayBounds) {
  const [{ data: gData }, { data: mData }] = await Promise.all([
    supabase
      .from('google_ads_daily_performance')
      .select('cost')
      .gte('date', bounds.startDate)
      .lte('date', bounds.endDate),
    supabase
      .from('microsoft_ads_daily_performance')
      .select('cost')
      .gte('date', bounds.startDate)
      .lte('date', bounds.endDate),
  ]);

  const google = (gData || []).reduce((sum: number, r: any) => sum + (r.cost || 0), 0);
  const microsoft = (mData || []).reduce((sum: number, r: any) => sum + (r.cost || 0), 0);

  return { google, microsoft, total: google + microsoft };
}

async function fetchFormLeads(
  supabase: SupabaseClient,
  bounds: MountainDayBounds
): Promise<{ leads: MetricLead[] }> {
  const { data } = await supabase
    .from('leads')
    .select('first_contact_method, ad_platform, gclid, msclkid, revenue_amount')
    .eq('is_test', false)
    .gte('created_at', bounds.startUTC)
    .lte('created_at', bounds.endUTC);

  const leads: MetricLead[] = (data || []).map((l: any) => {
    let platform = l.ad_platform;
    if (!platform) {
      if (l.gclid) platform = 'google';
      else if (l.msclkid) platform = 'microsoft';
    }
    // Normalize platform to just google/microsoft/null
    if (platform && platform !== 'google' && platform !== 'microsoft') {
      platform = null;
    }

    return {
      type: l.first_contact_method === 'sms' ? 'text' as const
        : l.first_contact_method === 'call' ? 'call' as const
        : 'form' as const,
      platform,
      revenue: l.revenue_amount || 0,
    };
  });

  return { leads };
}

async function fetchCalls(
  supabase: SupabaseClient,
  bounds: MountainDayBounds
): Promise<{ calls: any[] }> {
  const { data } = await supabase
    .from('ringcentral_calls')
    .select('from_number, start_time, duration, direction, result, ad_platform')
    .gte('start_time', bounds.startUTC)
    .lte('start_time', bounds.endUTC)
    .eq('direction', 'Inbound');

  return { calls: data || [] };
}

interface CallDedupResult {
  leads: MetricLead[];
  excludedDuration: number;
  excludedBusinessNumber: number;
  excludedTollFree: number;
  deduplicated: number;
}

function deduplicateCalls(calls: any[], _bounds: MountainDayBounds): CallDedupResult {
  let excludedDuration = 0;
  let excludedBusinessNumber = 0;
  let excludedTollFree = 0;

  // Filter qualifying calls
  const qualifying = calls.filter(call => {
    const num = call.from_number || '';
    if (num === BUSINESS_PHONE_NUMBER) { excludedBusinessNumber++; return false; }
    if (TOLL_FREE_PREFIXES.some(p => num.startsWith(p))) { excludedTollFree++; return false; }
    if ((call.duration || 0) < MIN_CALL_DURATION_SECONDS) { excludedDuration++; return false; }
    if (!num) return false;
    return true;
  });

  // Dedup: one lead per phone + MT calendar day
  const seen = new Set<string>();
  let deduplicated = 0;
  const leads: MetricLead[] = [];

  for (const call of qualifying) {
    const mtDateStr = new Date(call.start_time)
      .toLocaleDateString('en-CA', { timeZone: 'America/Denver' });
    const key = `${call.from_number}-${mtDateStr}`;

    if (seen.has(key)) {
      deduplicated++;
      continue;
    }
    seen.add(key);

    let platform = call.ad_platform;
    if (platform && platform !== 'google' && platform !== 'microsoft') {
      platform = null;
    }

    leads.push({
      type: 'call',
      platform,
      revenue: 0, // Calls don't carry revenue directly
    });
  }

  return { leads, excludedDuration, excludedBusinessNumber, excludedTollFree, deduplicated };
}

async function fetchGrossRevenue(
  supabase: SupabaseClient,
  bounds: MountainDayBounds
): Promise<{ total: number; invoiceCount: number }> {
  const { data } = await supabase
    .from('omega_installs')
    .select('parts_cost, labor_cost')
    .gte('install_date', bounds.startDate)
    .lte('install_date', bounds.endDate);

  const rows = data || [];
  const total = rows.reduce((sum: number, r: any) =>
    sum + (r.parts_cost || 0) + (r.labor_cost || 0), 0);

  return { total, invoiceCount: rows.length };
}

async function fetchTraffic(
  supabase: SupabaseClient,
  bounds: MountainDayBounds
): Promise<{ visitors: number; pageViews: number }> {
  const [{ data: sessions }, { data: views }] = await Promise.all([
    supabase
      .from('user_sessions')
      .select('id')
      .gte('started_at', bounds.startUTC)
      .lte('started_at', bounds.endUTC),
    supabase
      .from('page_views')
      .select('id')
      .gte('created_at', bounds.startUTC)
      .lte('created_at', bounds.endUTC),
  ]);

  return {
    visitors: (sessions || []).length,
    pageViews: (views || []).length,
  };
}

async function fetchClickEvents(
  supabase: SupabaseClient,
  bounds: MountainDayBounds
): Promise<{ phoneClicks: number; textClicks: number; formSubmits: number; total: number }> {
  const { data } = await supabase
    .from('conversion_events')
    .select('event_type')
    .gte('created_at', bounds.startUTC)
    .lte('created_at', bounds.endUTC)
    .not('page_path', 'like', '/admin%');

  const events = data || [];
  const phoneClicks = events.filter((e: any) => e.event_type === 'phone_click').length;
  const textClicks = events.filter((e: any) => e.event_type === 'text_click').length;
  const formSubmits = events.filter((e: any) => e.event_type === 'form_submit').length;

  return { phoneClicks, textClicks, formSubmits, total: events.length };
}

// ── Breakdown builders ──────────────────────────────────────────────

function buildPlatformBreakdown(leads: MetricLead[]): UnifiedMetrics['leads']['byPlatform'] {
  const empty = (): PlatformBreakdown => ({ total: 0, calls: 0, forms: 0, texts: 0 });
  const result = { google: empty(), microsoft: empty(), unattributed: empty() };

  for (const lead of leads) {
    const bucket = lead.platform === 'google' ? result.google
      : lead.platform === 'microsoft' ? result.microsoft
      : result.unattributed;

    bucket.total++;
    if (lead.type === 'call') bucket.calls++;
    else if (lead.type === 'form') bucket.forms++;
    else if (lead.type === 'text') bucket.texts++;
  }

  return result;
}

function buildRevenueByPlatform(leads: MetricLead[]): UnifiedMetrics['revenue']['byPlatform'] {
  const result = { google: 0, microsoft: 0, unattributed: 0 };

  for (const lead of leads) {
    if (!lead.revenue) continue;
    if (lead.platform === 'google') result.google += lead.revenue;
    else if (lead.platform === 'microsoft') result.microsoft += lead.revenue;
    else result.unattributed += lead.revenue;
  }

  return result;
}
