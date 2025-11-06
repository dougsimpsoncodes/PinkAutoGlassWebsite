/**
 * Unified Customer Deduplication Logic
 *
 * Combines phone calls and form submissions into unique customers.
 * Key insight: Same phone number = same customer, regardless of channel.
 *
 * Example:
 * - Customer calls on Monday (720-555-1234)
 * - Same customer submits form on Tuesday (720-555-1234)
 * - Result: 1 unique customer, first contact method = call
 */

export interface RingCentralCall {
  from_number: string;
  start_time: string;
  direction: 'Inbound' | 'Outbound';
  result?: string;
  duration?: number;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  ad_platform?: string | null;
}

export interface FormLead {
  phone: string;
  created_at: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  ad_platform?: string | null;
  gclid?: string | null;
  msclkid?: string | null;
}

export interface UniqueCustomer {
  phoneNumber: string; // Normalized format
  rawPhoneNumber: string; // Original format
  firstContactTimestamp: string;
  firstContactMethod: 'call' | 'form';
  totalCallCount: number;
  totalFormCount: number;
  attribution: {
    platform: string | null; // google, bing, organic, direct
    source: string | null;
    medium: string | null;
    campaign: string | null;
    gclid?: string | null;
    msclkid?: string | null;
  };
  allContacts: Array<{
    timestamp: string;
    method: 'call' | 'form';
    platform: string | null;
  }>;
}

/**
 * Normalize phone number to E.164 format (or best effort)
 * Handles various formats: (720) 555-1234, 720-555-1234, +17205551234, etc.
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Handle US numbers (10 or 11 digits)
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  // Return as-is if already in good format
  if (digits.length > 10) {
    return `+${digits}`;
  }

  return digits; // Fallback
}

/**
 * Deduplicate customers across calls and forms
 * Returns unique customers with first-touch attribution
 */
export function deduplicateCustomers(
  calls: RingCentralCall[],
  forms: FormLead[]
): UniqueCustomer[] {
  const customerMap = new Map<string, UniqueCustomer>();

  // Process calls
  for (const call of calls) {
    // Only count inbound calls as customer contacts
    if (call.direction !== 'Inbound') continue;

    const normalized = normalizePhoneNumber(call.from_number);
    if (!normalized) continue;

    const existing = customerMap.get(normalized);
    const callTimestamp = call.start_time;

    if (!existing) {
      // New customer
      customerMap.set(normalized, {
        phoneNumber: normalized,
        rawPhoneNumber: call.from_number,
        firstContactTimestamp: callTimestamp,
        firstContactMethod: 'call',
        totalCallCount: 1,
        totalFormCount: 0,
        attribution: {
          platform: call.ad_platform || 'unknown',
          source: call.utm_source || null,
          medium: call.utm_medium || null,
          campaign: call.utm_campaign || null,
        },
        allContacts: [{
          timestamp: callTimestamp,
          method: 'call',
          platform: call.ad_platform || null,
        }],
      });
    } else {
      // Existing customer - update counts and check if this is earlier contact
      existing.totalCallCount++;
      existing.allContacts.push({
        timestamp: callTimestamp,
        method: 'call',
        platform: call.ad_platform || null,
      });

      // If this call was earlier than recorded first contact, update it
      if (new Date(callTimestamp) < new Date(existing.firstContactTimestamp)) {
        existing.firstContactTimestamp = callTimestamp;
        existing.firstContactMethod = 'call';
        // Update attribution to first-touch
        existing.attribution = {
          platform: call.ad_platform || existing.attribution.platform,
          source: call.utm_source || existing.attribution.source,
          medium: call.utm_medium || existing.attribution.medium,
          campaign: call.utm_campaign || existing.attribution.campaign,
        };
      }
    }
  }

  // Process forms
  for (const form of forms) {
    const normalized = normalizePhoneNumber(form.phone);
    if (!normalized) continue;

    const existing = customerMap.get(normalized);
    const formTimestamp = form.created_at;

    if (!existing) {
      // New customer
      customerMap.set(normalized, {
        phoneNumber: normalized,
        rawPhoneNumber: form.phone,
        firstContactTimestamp: formTimestamp,
        firstContactMethod: 'form',
        totalCallCount: 0,
        totalFormCount: 1,
        attribution: {
          platform: form.ad_platform || 'unknown',
          source: form.utm_source || null,
          medium: form.utm_medium || null,
          campaign: form.utm_campaign || null,
          gclid: form.gclid || undefined,
          msclkid: form.msclkid || undefined,
        },
        allContacts: [{
          timestamp: formTimestamp,
          method: 'form',
          platform: form.ad_platform || null,
        }],
      });
    } else {
      // Existing customer - update counts and check if this is earlier contact
      existing.totalFormCount++;
      existing.allContacts.push({
        timestamp: formTimestamp,
        method: 'form',
        platform: form.ad_platform || null,
      });

      // If this form was earlier than recorded first contact, update it
      if (new Date(formTimestamp) < new Date(existing.firstContactTimestamp)) {
        existing.firstContactTimestamp = formTimestamp;
        existing.firstContactMethod = 'form';
        // Update attribution to first-touch
        existing.attribution = {
          platform: form.ad_platform || existing.attribution.platform,
          source: form.utm_source || existing.attribution.source,
          medium: form.utm_medium || existing.attribution.medium,
          campaign: form.utm_campaign || existing.attribution.campaign,
          gclid: form.gclid || existing.attribution.gclid,
          msclkid: form.msclkid || existing.attribution.msclkid,
        };
      }
    }
  }

  // Sort all contacts by timestamp for each customer
  for (const customer of customerMap.values()) {
    customer.allContacts.sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  return Array.from(customerMap.values());
}

/**
 * Get unique customer count broken down by first contact method
 * Returns: { total: 78, byCall: 65, byForm: 13 }
 */
export function getCustomerBreakdown(uniqueCustomers: UniqueCustomer[]): {
  total: number;
  byCall: number;
  byForm: number;
} {
  return {
    total: uniqueCustomers.length,
    byCall: uniqueCustomers.filter(c => c.firstContactMethod === 'call').length,
    byForm: uniqueCustomers.filter(c => c.firstContactMethod === 'form').length,
  };
}

/**
 * Filter unique customers by date range
 */
export function filterByDateRange(
  customers: UniqueCustomer[],
  startDate: Date,
  endDate: Date
): UniqueCustomer[] {
  return customers.filter(customer => {
    const contactDate = new Date(customer.firstContactTimestamp);
    return contactDate >= startDate && contactDate <= endDate;
  });
}

/**
 * Filter unique customers by platform
 */
export function filterByPlatform(
  customers: UniqueCustomer[],
  platform: string
): UniqueCustomer[] {
  return customers.filter(customer =>
    customer.attribution.platform === platform
  );
}

/**
 * Get unique customers by campaign
 * Groups customers by campaign name for ROI analysis
 */
export function groupByCampaign(
  customers: UniqueCustomer[]
): Map<string, UniqueCustomer[]> {
  const grouped = new Map<string, UniqueCustomer[]>();

  for (const customer of customers) {
    const campaign = customer.attribution.campaign || 'No Campaign';
    const existing = grouped.get(campaign) || [];
    existing.push(customer);
    grouped.set(campaign, existing);
  }

  return grouped;
}

/**
 * Calculate customer counts for funnel metrics
 * Example: { google: 45, bing: 12, organic: 15, direct: 6 }
 */
export function getCustomerCountsByPlatform(
  customers: UniqueCustomer[]
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const customer of customers) {
    const platform = customer.attribution.platform || 'unknown';
    counts[platform] = (counts[platform] || 0) + 1;
  }

  return counts;
}
