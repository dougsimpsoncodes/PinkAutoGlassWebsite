/**
 * Unified Dashboard Data Functions
 *
 * This module provides consistent data definitions across all admin dashboard reports.
 * All pages should use these functions to ensure metrics match everywhere.
 *
 * DEFINITIONS:
 * - Lead: Form submission OR qualifying inbound call (30s+)
 * - Qualifying Call: Inbound call with duration >= 30 seconds
 * - Form Lead: Completed quote/booking form submission
 * - Unique Caller: Distinct phone number that called
 * - Timezone: Mountain Time (America/Denver) for all calculations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  BUSINESS_PHONE_NUMBER,
  MIN_CALL_DURATION_SECONDS,
  ATTRIBUTION_WINDOW_MINUTES,
} from './constants';

export type DateFilter = 'today' | 'yesterday' | '7days' | '30days' | 'all';

export interface DateRangeResult {
  start: Date;
  end: Date;
  display: string;
  period: string;
  // For API queries that need YYYY-MM-DD format
  startDateStr: string;
  endDateStr: string;
}

export interface CallMetrics {
  total: number;           // Total qualifying calls (not unique)
  uniqueCallers: number;   // Unique phone numbers
  answered: number;
  missed: number;
  answerRate: number;
  avgDuration: number;
  byPlatform: {
    google: number;
    microsoft: number;
    direct: number;
  };
}

export interface AttributedLeadMetrics {
  google: {
    total: number;
    calls: number;
    forms: number;
    callerPhones?: string[];
  };
  microsoft: {
    total: number;
    calls: number;
    forms: number;
    callerPhones?: string[];
  };
  direct: {
    total: number;
    calls: number;
    forms: number;
    callerPhones?: string[];
  };
}

/**
 * Get current time in Mountain Time (UTC-7)
 * Business is located in Denver, so all date calculations use Mountain Time
 */
export function getMountainTime(): Date {
  const now = new Date();
  // Mountain Standard Time is UTC-7, Mountain Daylight Time is UTC-6
  // For simplicity, using UTC-7 (MST). For production, consider using a proper
  // timezone library like date-fns-tz or luxon for DST handling.
  const mtOffset = -7 * 60; // Mountain Time offset in minutes
  const utcNow = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utcNow + (mtOffset * 60000));
}

/**
 * Get date range for a given period filter
 * Uses Mountain Time for all calculations
 */
export function getMountainDateRange(period: DateFilter): DateRangeResult {
  const mtNow = getMountainTime();
  const today = new Date(mtNow.getFullYear(), mtNow.getMonth(), mtNow.getDate());

  let start: Date;
  let end: Date;
  let display: string;

  switch (period) {
    case 'today':
      start = today;
      end = mtNow;
      display = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      break;

    case 'yesterday':
      start = new Date(today);
      start.setDate(start.getDate() - 1);
      end = new Date(start);
      end.setHours(23, 59, 59, 999);
      display = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      break;

    case '7days':
      start = new Date(today);
      start.setDate(start.getDate() - 7);
      end = mtNow;
      display = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${mtNow.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      break;

    case '30days':
      start = new Date(today);
      start.setDate(start.getDate() - 30);
      end = mtNow;
      display = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${mtNow.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      break;

    case 'all':
    default:
      start = new Date('2024-01-01');
      end = mtNow;
      display = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${mtNow.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      break;
  }

  return {
    start,
    end,
    display,
    period,
    startDateStr: start.toISOString().split('T')[0],
    endDateStr: end.toISOString().split('T')[0],
  };
}

/**
 * Create a Supabase client for server-side data fetching
 */
export function getSupabaseClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Get call metrics for a date range
 * Uses consistent filtering: inbound calls with duration >= 30 seconds
 */
export async function getCallMetrics(
  supabase: SupabaseClient,
  startDate: Date,
  endDate: Date
): Promise<CallMetrics> {
  // Fetch all qualifying inbound calls (exclude business number)
  const { data: calls } = await supabase
    .from('ringcentral_calls')
    .select('call_id, from_number, duration, result, ad_platform')
    .eq('direction', 'Inbound')
    .neq('from_number', BUSINESS_PHONE_NUMBER)
    .gte('duration', MIN_CALL_DURATION_SECONDS)
    .gte('start_time', startDate.toISOString())
    .lte('start_time', endDate.toISOString());

  const callList = calls || [];

  // Count unique callers
  const uniquePhoneNumbers = new Set<string>();
  callList.forEach(call => {
    if (call.from_number) {
      uniquePhoneNumbers.add(call.from_number);
    }
  });

  // Count answered vs missed
  const answered = callList.filter(
    c => c.result === 'Accepted' || c.result === 'Call connected'
  ).length;
  const missed = callList.filter(c => c.result === 'Missed').length;

  // Calculate average duration
  const totalDuration = callList.reduce((sum, c) => sum + (c.duration || 0), 0);
  const avgDuration = callList.length > 0 ? Math.round(totalDuration / callList.length) : 0;

  // Count by platform (from ad_platform field)
  // NOTE: Database stores 'microsoft' (not 'bing') per src/lib/attribution.ts
  const googleCalls = callList.filter(c => c.ad_platform === 'google').length;
  const microsoftCalls = callList.filter(c => c.ad_platform === 'microsoft').length;
  const directCalls = callList.length - googleCalls - microsoftCalls;

  return {
    total: callList.length,
    uniqueCallers: uniquePhoneNumbers.size,
    answered,
    missed,
    answerRate: callList.length > 0 ? (answered / callList.length) * 100 : 0,
    avgDuration,
    byPlatform: {
      google: googleCalls,
      microsoft: microsoftCalls,
      direct: directCalls,
    },
  };
}

/**
 * Get attributed lead metrics broken down by platform
 * Used for Google Ads and Microsoft Ads pages
 *
 * This function performs session-based attribution for unattributed calls
 */
export async function getAttributedLeadMetrics(
  supabase: SupabaseClient,
  startDate: Date,
  endDate: Date
): Promise<AttributedLeadMetrics> {
  const matchWindowMs = ATTRIBUTION_WINDOW_MINUTES * 60 * 1000;

  // Fetch form leads with attribution
  const { data: formLeads } = await supabase
    .from('leads')
    .select('id, ad_platform')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  // Fetch qualifying calls (exclude business number)
  const { data: calls } = await supabase
    .from('ringcentral_calls')
    .select('call_id, from_number, start_time, ad_platform')
    .eq('direction', 'Inbound')
    .neq('from_number', BUSINESS_PHONE_NUMBER)
    .gte('duration', MIN_CALL_DURATION_SECONDS)
    .gte('start_time', startDate.toISOString())
    .lte('start_time', endDate.toISOString());

  const callList = calls || [];
  const formList = formLeads || [];

  // Get unique callers per platform
  const googleCallers = new Set<string>();
  const microsoftCallers = new Set<string>();
  const directCallers = new Set<string>();

  // First pass: count already-attributed calls
  callList.forEach(call => {
    if (!call.from_number) return;

    if (call.ad_platform === 'google') {
      googleCallers.add(call.from_number);
    } else if (call.ad_platform === 'microsoft') {
      microsoftCallers.add(call.from_number);
    }
  });

  // Second pass: session-based attribution for unattributed calls
  const unattributedCalls = callList.filter(
    c => !c.ad_platform || c.ad_platform === 'direct'
  );

  if (unattributedCalls.length > 0) {
    // Get time range for session lookup
    const callTimes = unattributedCalls.map(c => new Date(c.start_time).getTime());
    const earliestWindowStart = new Date(Math.min(...callTimes) - matchWindowMs);
    const latestCallTime = new Date(Math.max(...callTimes));

    // Fetch sessions with click IDs
    // NOTE: Must use explicit limit to avoid PostgREST default max_rows (1000)
    // which silently truncates results, dropping recent sessions from attribution
    const [{ data: googleSessions }, { data: msSessions }] = await Promise.all([
      supabase
        .from('user_sessions')
        .select('session_id, started_at')
        .not('gclid', 'is', null)
        .gte('started_at', earliestWindowStart.toISOString())
        .lte('started_at', latestCallTime.toISOString())
        .limit(10000),
      supabase
        .from('user_sessions')
        .select('session_id, started_at')
        .not('msclkid', 'is', null)
        .gte('started_at', earliestWindowStart.toISOString())
        .lte('started_at', latestCallTime.toISOString())
        .limit(10000),
    ]);

    // Match unattributed calls to sessions
    for (const call of unattributedCalls) {
      if (!call.from_number) continue;

      const callTime = new Date(call.start_time).getTime();
      const windowStart = callTime - matchWindowMs;

      const hasGoogle = (googleSessions || []).some(s => {
        const sessionTime = new Date(s.started_at).getTime();
        return sessionTime >= windowStart && sessionTime <= callTime;
      });

      const hasMs = (msSessions || []).some(s => {
        const sessionTime = new Date(s.started_at).getTime();
        return sessionTime >= windowStart && sessionTime <= callTime;
      });

      // Only attribute if exactly one platform matches (no conflict)
      if (hasGoogle && !hasMs) {
        googleCallers.add(call.from_number);
      } else if (hasMs && !hasGoogle) {
        microsoftCallers.add(call.from_number);
      } else {
        directCallers.add(call.from_number);
      }
    }
  }

  // Count forms by platform
  // NOTE: Database stores 'microsoft' (not 'bing') per src/lib/attribution.ts
  const googleForms = formList.filter(l => l.ad_platform === 'google').length;
  const microsoftForms = formList.filter(l => l.ad_platform === 'microsoft').length;
  const directForms = formList.filter(
    l => l.ad_platform === 'direct' || !l.ad_platform
  ).length;

  return {
    google: {
      total: googleCallers.size + googleForms,
      calls: googleCallers.size,
      forms: googleForms,
      callerPhones: Array.from(googleCallers),
    },
    microsoft: {
      total: microsoftCallers.size + microsoftForms,
      calls: microsoftCallers.size,
      forms: microsoftForms,
      callerPhones: Array.from(microsoftCallers),
    },
    direct: {
      total: directCallers.size + directForms,
      calls: directCallers.size,
      forms: directForms,
      callerPhones: Array.from(directCallers),
    },
  };
}
