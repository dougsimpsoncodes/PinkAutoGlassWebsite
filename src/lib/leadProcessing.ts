/**
 * Shared Lead Processing
 *
 * Single source of truth for building UnifiedLead arrays from API data.
 * Used by the Leads page and PlatformLeadsTable to ensure consistent
 * lead counts across the dashboard.
 *
 * Key behaviors:
 * - Filters calls to duration >= MIN_CALL_DURATION_SECONDS (qualifying leads only)
 * - Filters out BUSINESS_PHONE_NUMBER from caller lists
 * - Deduplicates calls by phone number (one lead per unique caller)
 * - Optionally applies session-based attribution from /api/admin/calls/attributed
 */

import {
  BUSINESS_PHONE_NUMBER,
  MIN_CALL_DURATION_SECONDS,
} from './constants';

export interface UnifiedLead {
  id: string;
  type: 'form' | 'call' | 'text';
  name: string;
  phone: string;
  email?: string;
  created_at: string;
  status: string;

  // Form-specific
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
  ad_platform?: string;
  utm_campaign?: string;
}

interface FetchOptions {
  /** When true, also fetches session-based attribution data for calls */
  includeAttribution?: boolean;
}

/**
 * Fetch leads and calls from APIs, apply consistent filtering, and return
 * a unified lead list. This is the canonical way to build the lead array.
 */
export async function fetchUnifiedLeads(
  options: FetchOptions = {}
): Promise<UnifiedLead[]> {
  const { includeAttribution = false } = options;

  // Build parallel fetch list
  const fetches: Promise<Response>[] = [
    fetch('/api/admin/leads?limit=10000'),
    fetch('/api/admin/calls?limit=1000'),
  ];
  if (includeAttribution) {
    fetches.push(fetch('/api/admin/calls/attributed'));
  }

  const responses = await Promise.all(fetches);
  const [formRes, callsRes] = responses;
  const attrRes = includeAttribution ? responses[2] : null;

  // Parse attribution data if requested
  let googlePhoneSet = new Set<string>();
  let microsoftPhoneSet = new Set<string>();
  if (attrRes && attrRes.ok) {
    const attributedPhones: { google: string[]; microsoft: string[] } = await attrRes.json();
    googlePhoneSet = new Set(attributedPhones.google || []);
    microsoftPhoneSet = new Set(attributedPhones.microsoft || []);
  }

  const allLeads: UnifiedLead[] = [];

  // Process form leads
  if (formRes.ok) {
    const formData = await formRes.json();
    const formLeads = (formData.leads || []).map((lead: any) => ({
      id: lead.id,
      type: lead.first_contact_method === 'sms'
        ? 'text' as const
        : lead.first_contact_method === 'call'
          ? 'call' as const
          : 'form' as const,
      name: `${lead.first_name} ${lead.last_name}`,
      phone: lead.phone,
      email: lead.email,
      created_at: lead.created_at,
      status: lead.status || 'new',
      vehicle_year: lead.vehicle_year,
      vehicle_make: lead.vehicle_make,
      vehicle_model: lead.vehicle_model,
      service_type: lead.service_type,
      city: lead.city,
      state: lead.state,
      zip: lead.zip,
      quote_amount: lead.quote_amount,
      revenue_amount: lead.revenue_amount,
      close_date: lead.close_date,
      notes: lead.notes,
      ad_platform: lead.ad_platform,
      utm_campaign: lead.utm_campaign,
    }));
    allLeads.push(...formLeads);
  }

  // Process calls — deduplicate by customer phone number
  if (callsRes.ok) {
    const callsData = await callsRes.json();
    const calls = callsData.calls || [];

    // Group inbound calls by customer phone number
    const customerMap = new Map<string, any[]>();

    calls.forEach((call: any) => {
      if (
        call.direction === 'Inbound' &&
        call.from_number !== BUSINESS_PHONE_NUMBER &&
        (call.duration || 0) >= MIN_CALL_DURATION_SECONDS
      ) {
        const customerNumber = call.from_number;
        if (!customerMap.has(customerNumber)) {
          customerMap.set(customerNumber, []);
        }
        customerMap.get(customerNumber)!.push(call);
      }
    });

    // Create one lead per unique caller
    customerMap.forEach((customerCalls, phoneNumber) => {
      customerCalls.sort(
        (a: any, b: any) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      );

      const mostRecent = customerCalls[0];
      const hasAnswered = customerCalls.some(
        (c: any) => c.result === 'Accepted' || c.result === 'Call connected'
      );

      // Derive ad_platform: use DB value if set, otherwise use session-based attribution
      let callPlatform = mostRecent.ad_platform;
      if (includeAttribution && (!callPlatform || callPlatform === 'direct')) {
        if (googlePhoneSet.has(phoneNumber)) {
          callPlatform = 'google';
        } else if (microsoftPhoneSet.has(phoneNumber)) {
          callPlatform = 'microsoft';
        }
      }

      allLeads.push({
        id: `call-${phoneNumber}`,
        type: 'call',
        name: mostRecent.from_name || 'Unknown Caller',
        phone: phoneNumber,
        created_at: mostRecent.start_time,
        status: hasAnswered ? 'contacted' : 'new',
        direction: mostRecent.direction,
        duration: customerCalls.reduce(
          (sum: number, c: any) => sum + (c.duration || 0),
          0
        ),
        result: mostRecent.result,
        recording_id: mostRecent.recording_id,
        ad_platform: callPlatform,
        notes: `${customerCalls.length} total call(s)`,
      });
    });
  }

  return allLeads;
}
