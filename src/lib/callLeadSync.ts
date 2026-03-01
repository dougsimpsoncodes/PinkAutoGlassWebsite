/**
 * Call-Based Lead Sync
 *
 * Creates a lead for every qualifying inbound call that doesn't already have one.
 * If a lead already exists for that phone, updates attribution if it's currently
 * unattributed (null/unknown/direct).
 *
 * This bridges the gap between phone-only customers and the revenue attribution
 * pipeline: match_omega_to_leads() matches invoices to leads by phone, so a lead
 * MUST exist for the match to happen.
 *
 * Runs daily after RingCentral sync (Step 1.5 in sync-search-data cron).
 * Idempotent — safe to rerun with the same date range.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { MIN_CALL_DURATION_SECONDS, isExcludedPhone, isTestPhone } from '@/lib/constants';

export interface CallLeadSyncResult {
  created: number;
  updated: number;
  skipped: number;
}

// Platform priority for dedup: prefer the most specific attribution
const PLATFORM_PRIORITY: Record<string, number> = {
  google: 1,
  microsoft: 2,
  organic: 3,
  direct: 4,
};

function platformRank(platform: string | null): number {
  if (!platform) return 99;
  return PLATFORM_PRIORITY[platform] ?? 5;
}

/**
 * Sync call-based leads from RingCentral call logs.
 *
 * For each qualifying inbound call:
 * - If no lead exists for that phone → create one
 * - If a lead exists but has no/weak attribution → update it
 * - If a lead exists with good attribution → skip
 */
export async function syncCallLeads(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string
): Promise<CallLeadSyncResult> {
  const result: CallLeadSyncResult = { created: 0, updated: 0, skipped: 0 };

  // 1. Fetch qualifying inbound calls
  const { data: calls, error: callsError } = await supabase
    .from('ringcentral_calls')
    .select('call_id, from_number, start_time, ad_platform')
    .eq('direction', 'Inbound')
    .gte('duration', MIN_CALL_DURATION_SECONDS)
    .gte('start_time', `${startDate}T00:00:00.000Z`)
    .lte('start_time', `${endDate}T23:59:59.999Z`)
    .not('from_number', 'is', null)
    .neq('from_number', '');

  if (callsError) {
    console.error('callLeadSync: Failed to fetch RC calls:', callsError.message);
    return result;
  }

  if (!calls || calls.length === 0) {
    console.log('callLeadSync: No qualifying calls found');
    return result;
  }

  // 2. Deduplicate by from_number — keep the call with the best ad_platform
  const byPhone = new Map<string, { from_number: string; start_time: string; ad_platform: string | null }>();
  for (const call of calls) {
    const phone = call.from_number;
    if (!phone) continue;

    const existing = byPhone.get(phone);
    if (!existing || platformRank(call.ad_platform) < platformRank(existing.ad_platform)) {
      byPhone.set(phone, {
        from_number: phone,
        start_time: call.start_time,
        ad_platform: call.ad_platform,
      });
    }
  }

  console.log(`callLeadSync: ${calls.length} qualifying calls → ${byPhone.size} unique callers`);

  // 3. Process each unique caller
  for (const [phone, call] of byPhone) {
    const isTest = isExcludedPhone(phone) || isTestPhone(phone);

    // Check if a lead already exists for this phone (match is_test status to avoid
    // endlessly recreating test leads on every rerun)
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, ad_platform, is_test')
      .eq('phone_e164', phone)
      .eq('is_test', isTest)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingLead) {
      // Lead exists — update attribution if currently unattributed and call has better data
      const weakPlatform = !existingLead.ad_platform
        || existingLead.ad_platform === 'direct'
        || existingLead.ad_platform === 'unknown';

      const callHasPlatform = call.ad_platform
        && call.ad_platform !== 'direct'
        && call.ad_platform !== 'unknown';

      if (weakPlatform && callHasPlatform) {
        const { error: updateError } = await supabase
          .from('leads')
          .update({
            ad_platform: call.ad_platform,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingLead.id);

        if (updateError) {
          console.error(`callLeadSync: Failed to update lead ${existingLead.id}:`, updateError.message);
        } else {
          result.updated++;
        }
      } else {
        result.skipped++;
      }
    } else {
      // No lead exists — create one
      const { error: insertError } = await supabase
        .from('leads')
        .insert({
          phone_e164: phone,
          first_name: '',
          last_name: '',
          first_contact_method: 'call',
          ad_platform: call.ad_platform || null,
          is_test: isTest,
          status: 'new',
          created_at: call.start_time,
        });

      if (insertError) {
        // Unique constraint violation = another process created the lead first (race condition).
        // This is expected and safe — treat as a skip, not an error.
        if (insertError.code === '23505') {
          result.skipped++;
        } else {
          console.error(`callLeadSync: Failed to create lead for ${phone}:`, insertError.message);
        }
      } else {
        result.created++;
      }
    }
  }

  console.log(
    `callLeadSync: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped`
  );

  return result;
}
