import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getMountainDayBounds, type DateFilter } from '@/lib/dateUtils';
import {
  BUSINESS_PHONE_NUMBER,
  MIN_CALL_DURATION_SECONDS,
} from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TOLL_FREE_PREFIXES = ['+1800', '+1833', '+1844', '+1855', '+1866', '+1877', '+1888'];

/**
 * GET /api/admin/debug/lead-consistency?period=today
 *
 * Runs both the metricsBuilder path and the fetchUnifiedLeads-equivalent path
 * side by side, returning raw counts at each step so we can identify where
 * the two diverge.
 */
export async function GET(req: NextRequest) {
  try {
    const period = (req.nextUrl.searchParams.get('period') || 'today') as DateFilter;
    const bounds = getMountainDayBounds(period);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ── PATH A: metricsBuilder-style (server-side, date-filtered) ──

    // A1: Form leads from leads table (date-filtered)
    const { data: aLeads, count: aLeadsCount } = await supabase
      .from('leads')
      .select('id, first_contact_method, phone_e164, created_at, is_test', { count: 'exact' })
      .eq('is_test', false)
      .gte('created_at', bounds.startUTC)
      .lte('created_at', bounds.endUTC);

    const aLeadRows = aLeads || [];
    const aFormCount = aLeadRows.filter(l => !l.first_contact_method || l.first_contact_method === 'form').length;
    const aCallCount = aLeadRows.filter(l => l.first_contact_method === 'call').length;
    const aSmsCount = aLeadRows.filter(l => l.first_contact_method === 'sms').length;

    // A2: Calls from ringcentral_calls (date-filtered, inbound only)
    const { data: aCalls } = await supabase
      .from('ringcentral_calls')
      .select('from_number, start_time, duration, direction, result')
      .gte('start_time', bounds.startUTC)
      .lte('start_time', bounds.endUTC)
      .eq('direction', 'Inbound');

    const aRawCalls = aCalls || [];

    // A3: Qualifying calls (same filter as metricsBuilder)
    const aQualifying = aRawCalls.filter(call => {
      const num = call.from_number || '';
      if (num === BUSINESS_PHONE_NUMBER) return false;
      if (TOLL_FREE_PREFIXES.some(p => num.startsWith(p))) return false;
      if ((call.duration || 0) < MIN_CALL_DURATION_SECONDS) return false;
      if (!num) return false;
      return true;
    });

    // A4: Call phones already in leads table (suppressed)
    const { data: aCallLeadPhones } = await supabase
      .from('leads')
      .select('phone_e164')
      .eq('is_test', false)
      .eq('first_contact_method', 'call');

    const aExistingCallPhones = new Set((aCallLeadPhones || []).map(r => r.phone_e164).filter(Boolean));

    // A5: Deduplicated call leads (not already in leads table)
    const aSeenPhones = new Set<string>();
    let aNewCallLeads = 0;
    let aSuppressedByLeads = 0;
    let aDeduplicated = 0;

    for (const call of aQualifying) {
      if (aExistingCallPhones.has(call.from_number)) { aSuppressedByLeads++; continue; }
      if (aSeenPhones.has(call.from_number)) { aDeduplicated++; continue; }
      aSeenPhones.add(call.from_number);
      aNewCallLeads++;
    }

    const aTotalLeads = aLeadRows.length + aNewCallLeads;

    // ── PATH B: fetchUnifiedLeads-style (all data, then filter) ──

    // B1: All leads from leads table (no date filter, limit 10000)
    const { data: bAllLeads, count: bAllLeadsCount } = await supabase
      .from('leads')
      .select('id, first_contact_method, phone_e164, created_at, is_test', { count: 'exact' })
      .eq('is_test', false)
      .order('created_at', { ascending: false })
      .range(0, 9999);

    const bAllLeadRows = bAllLeads || [];

    // B2: Filter to period (client-side equivalent)
    const bLeadsInRange = bAllLeadRows.filter(l => {
      const d = new Date(l.created_at);
      const start = new Date(bounds.startUTC);
      const end = new Date(bounds.endUTC);
      return d >= start && d <= end;
    });

    // B3: All calls (limit 1000, no date filter)
    const { data: bAllCalls, count: bAllCallsCount } = await supabase
      .from('ringcentral_calls')
      .select('from_number, start_time, duration, direction, result', { count: 'exact' })
      .order('start_time', { ascending: false })
      .range(0, 999);

    const bAllCallRows = bAllCalls || [];

    // B4: Existing call-type lead phones (for suppression)
    const bExistingCallPhones = new Set(
      bAllLeadRows
        .filter(l => l.first_contact_method === 'call' && l.phone_e164)
        .map(l => l.phone_e164)
    );

    // B5: Qualifying calls from the 1000-call window
    const bQualifying = bAllCallRows.filter(call => {
      const num = call.from_number || '';
      return (
        call.direction === 'Inbound' &&
        num &&
        num !== BUSINESS_PHONE_NUMBER &&
        !TOLL_FREE_PREFIXES.some(p => num.startsWith(p)) &&
        (call.duration || 0) >= MIN_CALL_DURATION_SECONDS
      );
    });

    // B6: Deduplicate + suppress
    const bSeenPhones = new Set<string>();
    let bNewCallLeads = 0;
    let bSuppressedByLeads = 0;
    let bDeduplicated = 0;
    const bNewCallLeadDetails: { phone: string; start_time: string; duration: number }[] = [];

    for (const call of bQualifying) {
      if (bExistingCallPhones.has(call.from_number)) { bSuppressedByLeads++; continue; }
      if (bSeenPhones.has(call.from_number)) { bDeduplicated++; continue; }
      bSeenPhones.add(call.from_number);
      bNewCallLeads++;
      bNewCallLeadDetails.push({
        phone: call.from_number,
        start_time: call.start_time,
        duration: call.duration,
      });
    }

    // B7: Filter new call leads to period
    const bNewCallLeadsInRange = bNewCallLeadDetails.filter(c => {
      const d = new Date(c.start_time);
      const start = new Date(bounds.startUTC);
      const end = new Date(bounds.endUTC);
      return d >= start && d <= end;
    });

    const bTotalInRange = bLeadsInRange.length + bNewCallLeadsInRange.length;

    // ── SAMPLE DATA (show actual leads for debugging) ──
    const aLeadSamples = aLeadRows.slice(0, 10).map(l => ({
      id: l.id,
      type: l.first_contact_method,
      phone: l.phone_e164?.slice(-4) || '?',
      created_at: l.created_at,
    }));

    const aCallSamples = aQualifying.slice(0, 10).map(c => ({
      phone: c.from_number?.slice(-4) || '?',
      start_time: c.start_time,
      duration: c.duration,
      suppressed: aExistingCallPhones.has(c.from_number),
    }));

    return NextResponse.json({
      period,
      bounds: {
        startUTC: bounds.startUTC,
        endUTC: bounds.endUTC,
        startDate: bounds.startDate,
        endDate: bounds.endDate,
        display: bounds.display,
      },

      pathA_metricsBuilder: {
        leadsTableCount: aLeadRows.length,
        breakdown: { form: aFormCount, call: aCallCount, sms: aSmsCount },
        rawInboundCalls: aRawCalls.length,
        qualifyingCalls: aQualifying.length,
        callPhonesSuppressedByLeadsTable: aSuppressedByLeads,
        callPhonesDeduplicated: aDeduplicated,
        newCallLeads: aNewCallLeads,
        TOTAL: aTotalLeads,
        samples: { leads: aLeadSamples, calls: aCallSamples },
      },

      pathB_fetchUnifiedLeads: {
        allLeadsInDB: bAllLeadsCount,
        allLeadsFetched: bAllLeadRows.length,
        leadsInDateRange: bLeadsInRange.length,
        allCallsInDB: bAllCallsCount,
        allCallsFetched: bAllCallRows.length,
        qualifyingCalls: bQualifying.length,
        callPhonesSuppressedByLeadsTable: bSuppressedByLeads,
        callPhonesDeduplicated: bDeduplicated,
        newCallLeadsTotal: bNewCallLeads,
        newCallLeadsInDateRange: bNewCallLeadsInRange.length,
        TOTAL: bTotalInRange,
      },

      delta: aTotalLeads - bTotalInRange,
      diagnosis: aTotalLeads === bTotalInRange
        ? 'MATCH — both paths agree'
        : `MISMATCH by ${Math.abs(aTotalLeads - bTotalInRange)}. Check: leadsInDateRange (${aLeadRows.length} vs ${bLeadsInRange.length}), newCallLeads (${aNewCallLeads} vs ${bNewCallLeadsInRange.length})`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
