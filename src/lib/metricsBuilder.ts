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
 * | Leads (call)        | ringcentral_calls         | start_time     | UTC timestamp, MT day boundaries    | Per phone number (global, matches Leads page) |
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
 * Key: phone_number (global — matches Leads page behavior)
 * - Same phone calling multiple times in any period = 1 lead
 * - This matches fetchUnifiedLeads() which groups by phone globally
 * - Calls from business number, toll-free, or < 30s duration are excluded
 * - Calls are NOT suppressed when phone exists in leads table (repeat customers are valid)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { type DateFilter, getMountainDayBounds, type MountainDayBounds } from './dateUtils';
import {
  ATTRIBUTION_WINDOW_MINUTES,
  BUSINESS_PHONE_NUMBER,
  MIN_CALL_DURATION_SECONDS,
} from './constants';
import {
  type Market,
  type MarketFilter,
  classifyCallMarket,
  classifyCampaignMarket,
  classifyLeadMarket,
  normalizePhoneDigits,
} from './market';

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
    callsSuppressedByLeadsTable: number;
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
  debug = false,
  market: MarketFilter = 'all'
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
    existingCallPhones,
    sessionAttribution,
  ] = await Promise.all([
    fetchSpend(supabase, bounds, market),
    fetchFormLeads(supabase, bounds, market),
    fetchCalls(supabase, bounds, market),
    fetchGrossRevenue(supabase, bounds, market),
    fetchTraffic(supabase, bounds, market),
    fetchClickEvents(supabase, bounds, market),
    fetchCallLeadPhones(supabase, market),
    fetchSessionAttribution(supabase, bounds),
  ]);

  // Process calls into deduplicated leads, suppressing phones already in leads table
  const callDedup = deduplicateCalls(callsResult.calls, bounds, existingCallPhones, sessionAttribution);

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
      callsSuppressedByLeadsTable: callDedup.suppressedByLeadsTable,
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

interface SessionAttribution {
  googleSessions: { started_at: string }[];
  microsoftSessions: { started_at: string }[];
}

function matchesMarketFilter(market: MarketFilter, classifiedMarket: Market | null): boolean {
  return market === 'all' || classifiedMarket === market;
}

// ── Data fetchers ──────────────────────────────────────────────────

async function fetchSpend(
  supabase: SupabaseClient,
  bounds: MountainDayBounds,
  market: MarketFilter
) {
  const [{ data: gData }, { data: mData }] = await Promise.all([
    supabase
      .from('google_ads_daily_performance')
      .select('cost, campaign_name')
      .gte('date', bounds.startDate)
      .lte('date', bounds.endDate),
    supabase
      .from('microsoft_ads_daily_performance')
      .select('cost, campaign_name')
      .gte('date', bounds.startDate)
      .lte('date', bounds.endDate),
  ]);

  const googleRows = (gData || []).filter((row: any) =>
    matchesMarketFilter(market, classifyCampaignMarket(row.campaign_name))
  );
  const microsoftRows = (mData || []).filter((row: any) =>
    matchesMarketFilter(market, classifyCampaignMarket(row.campaign_name))
  );

  const google = googleRows.reduce((sum: number, row: any) => sum + (row.cost || 0), 0);
  const microsoft = microsoftRows.reduce((sum: number, row: any) => sum + (row.cost || 0), 0);

  return { google, microsoft, total: google + microsoft };
}

async function fetchFormLeads(
  supabase: SupabaseClient,
  bounds: MountainDayBounds,
  market: MarketFilter
): Promise<{ leads: MetricLead[] }> {
  const { data } = await supabase
    .from('leads')
    .select('first_contact_method, ad_platform, gclid, msclkid, revenue_amount, state, zip, utm_source')
    .eq('is_test', false)
    .gte('created_at', bounds.startUTC)
    .lte('created_at', bounds.endUTC);

  const leads: MetricLead[] = (data || [])
    .filter((lead: any) => matchesMarketFilter(market, classifyLeadMarket(lead)))
    .map((lead: any) => {
      let platform = lead.ad_platform;
      if (!platform) {
        if (lead.gclid) platform = 'google';
        else if (lead.msclkid) platform = 'microsoft';
      }
      // Normalize platform to just google/microsoft/null
      if (platform && platform !== 'google' && platform !== 'microsoft') {
        platform = null;
      }

      return {
        type: lead.first_contact_method === 'sms' ? 'text' as const
          : lead.first_contact_method === 'call' ? 'call' as const
          : 'form' as const,
        platform,
        revenue: lead.revenue_amount || 0,
      };
    });

  return { leads };
}

async function fetchCalls(
  supabase: SupabaseClient,
  bounds: MountainDayBounds,
  market: MarketFilter
): Promise<{ calls: any[] }> {
  const { data } = await supabase
    .from('ringcentral_calls')
    .select('from_number, to_number, start_time, duration, direction, result, ad_platform, attribution_method, attribution_confidence')
    .gte('start_time', bounds.startUTC)
    .lte('start_time', bounds.endUTC)
    .eq('direction', 'Inbound');

  const calls = (data || []).filter((call: any) =>
    matchesMarketFilter(market, classifyCallMarket(call.to_number))
  );

  return { calls };
}

interface CallDedupResult {
  leads: MetricLead[];
  excludedDuration: number;
  excludedBusinessNumber: number;
  excludedTollFree: number;
  deduplicated: number;
  suppressedByLeadsTable: number;
}

function deduplicateCalls(
  calls: any[],
  _bounds: MountainDayBounds,
  existingCallPhones: Set<string>,
  sessionAttr: SessionAttribution
): CallDedupResult {
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

  // Dedup: one lead per unique phone number (matches Leads page global dedup)
  // Also suppress calls whose phone already exists as a call-type lead in the leads table
  const seen = new Set<string>();
  let deduplicated = 0;
  let suppressedByLeadsTable = 0;
  const leads: MetricLead[] = [];

  for (const call of qualifying) {
    // Normalize from_number for consistent comparison (RC may return various formats)
    const normalizedFrom = normalizePhoneDigits(call.from_number) || call.from_number;

    // Skip if this caller already has a lead record (avoid double-counting)
    if (existingCallPhones.has(normalizedFrom)) { suppressedByLeadsTable++; continue; }

    const key = normalizedFrom;

    if (seen.has(key)) {
      deduplicated++;
      continue;
    }
    seen.add(key);

    // Platform attribution precedence:
    //   1. Canonical resolver (attribution_method + ad_platform written together)
    //      Only honor canonical methods that represent real evidence — never
    //      heuristic methods like time_correlation/statistical_probability.
    //   2. Legacy ad_platform column (still written by callAttributionSync.ts)
    //   3. Session-based fallback within the existing 60-min window
    let platform: string | null = null;
    const hasCanonicalMethod =
      call.attribution_method === 'google_call_view' ||
      call.attribution_method === 'direct_match';
    if (hasCanonicalMethod && call.ad_platform) {
      platform = call.ad_platform;
    } else {
      platform = call.ad_platform;
      if (!platform || platform === 'direct') {
        platform = resolveSessionPlatform(call, sessionAttr);
      }
    }
    if (platform && platform !== 'google' && platform !== 'microsoft') {
      platform = null;
    }

    leads.push({
      type: 'call',
      platform,
      revenue: 0, // Calls don't carry revenue directly
    });
  }

  return { leads, excludedDuration, excludedBusinessNumber, excludedTollFree, deduplicated, suppressedByLeadsTable };
}

/**
 * Fetch phone numbers that already exist as call-type leads in the leads table.
 * These are suppressed from ringcentral_calls to avoid double-counting.
 * When a market filter is active, only suppress call leads that can be
 * classified into that same market, so unclassified persisted call leads
 * do not hide otherwise-valid filtered RingCentral rows.
 */
async function fetchCallLeadPhones(
  supabase: SupabaseClient,
  market: MarketFilter
): Promise<Set<string>> {
  const { data } = await supabase
    .from('leads')
    .select('phone_e164, state, zip, utm_source')
    .eq('is_test', false)
    .eq('first_contact_method', 'call');

  const phones = new Set<string>();
  for (const row of data || []) {
    if (!row.phone_e164) continue;
    if (!matchesMarketFilter(market, classifyLeadMarket(row))) continue;
    // Normalize to 11-digit string so comparison works regardless of E.164 formatting
    const normalized = normalizePhoneDigits(row.phone_e164);
    if (normalized) phones.add(normalized);
  }
  return phones;
}

/**
 * Session-based call attribution — matches the logic in getAttributedLeadMetrics().
 * Fetches user_sessions with gclid/msclkid within the period's time window,
 * so calls can be attributed to Google/Microsoft even without ad_platform on the RC record.
 */
async function fetchSessionAttribution(
  supabase: SupabaseClient,
  bounds: MountainDayBounds
): Promise<SessionAttribution> {
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

/**
 * Resolve platform for a call using session-based time correlation.
 * If a Google/Microsoft ad-click session happened within ATTRIBUTION_WINDOW_MINUTES
 * before the call, attribute the call to that platform.
 */
function resolveSessionPlatform(call: any, attr: SessionAttribution): string | null {
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

  // Only attribute if exactly one platform matches (no conflict)
  if (hasGoogle && !hasMs) return 'google';
  if (hasMs && !hasGoogle) return 'microsoft';
  return null;
}

async function fetchGrossRevenue(
  supabase: SupabaseClient,
  bounds: MountainDayBounds,
  market: MarketFilter
): Promise<{ total: number; invoiceCount: number }> {
  const { data } = await supabase
    .from('omega_installs')
    .select('parts_cost, labor_cost, matched_lead_id')
    .gte('install_date', bounds.startDate)
    .lte('install_date', bounds.endDate);

  let rows = data || [];

  if (market !== 'all') {
    const leadIds = [...new Set(rows.map((row: any) => row.matched_lead_id).filter(Boolean))];

    let allowedLeadIds = new Set<string>();
    if (leadIds.length > 0) {
      // Batch in groups of 100 to avoid PostgREST URL length limits
      const BATCH_SIZE = 100;
      const allLeads: any[] = [];
      for (let i = 0; i < leadIds.length; i += BATCH_SIZE) {
        const batch = leadIds.slice(i, i + BATCH_SIZE);
        const { data: batchLeads } = await supabase
          .from('leads')
          .select('id, state, zip, utm_source')
          .in('id', batch);
        allLeads.push(...(batchLeads || []));
      }
      allowedLeadIds = new Set(
        allLeads
          .filter((lead: any) => classifyLeadMarket(lead) === market)
          .map((lead: any) => lead.id)
      );
    }

    // Keep rows that EITHER match the market OR have no matched_lead_id (unclassifiable)
    // Unmatched installs (cash jobs, walk-ins) cannot be attributed to a market,
    // so they are included in both market views rather than silently dropped.
    rows = rows.filter((row: any) =>
      !row.matched_lead_id || allowedLeadIds.has(row.matched_lead_id)
    );
  }

  const total = rows.reduce((sum: number, r: any) =>
    sum + (r.parts_cost || 0) + (r.labor_cost || 0), 0);

  return { total, invoiceCount: rows.length };
}

async function fetchTraffic(
  supabase: SupabaseClient,
  bounds: MountainDayBounds,
  market: MarketFilter
): Promise<{ visitors: number; pageViews: number }> {
  // Both tables now carry a denormalized `market` column populated by
  // tracking.ts at write time and backfilled by P2b. SQL filter is direct.
  // 'all' bypasses the filter entirely so unclassified rows count toward
  // the total — same policy as everywhere else.
  let sessionsQuery = supabase
    .from('user_sessions')
    .select('id')
    .gte('started_at', bounds.startUTC)
    .lte('started_at', bounds.endUTC);
  let viewsQuery = supabase
    .from('page_views')
    .select('id')
    .gte('created_at', bounds.startUTC)
    .lte('created_at', bounds.endUTC);

  if (market !== 'all') {
    sessionsQuery = sessionsQuery.eq('market', market);
    viewsQuery = viewsQuery.eq('market', market);
  }

  const [{ data: sessions }, { data: views }] = await Promise.all([
    sessionsQuery,
    viewsQuery,
  ]);

  return {
    visitors: (sessions || []).length,
    pageViews: (views || []).length,
  };
}

async function fetchClickEvents(
  supabase: SupabaseClient,
  bounds: MountainDayBounds,
  market: MarketFilter
): Promise<{ phoneClicks: number; textClicks: number; formSubmits: number; total: number }> {
  let query = supabase
    .from('conversion_events')
    .select('event_type')
    .gte('created_at', bounds.startUTC)
    .lte('created_at', bounds.endUTC)
    .not('page_path', 'like', '/admin%');

  if (market !== 'all') {
    query = query.eq('market', market);
  }

  const { data } = await query;
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
