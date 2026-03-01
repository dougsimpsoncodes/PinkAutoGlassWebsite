/**
 * Call Attribution Cross-Reference
 *
 * Deterministically matches Google Ads call_view records to RingCentral call logs
 * by comparing timestamps and durations. This bridges the gap between Google's
 * forwarding number system and our RingCentral phone system.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface CrossReferenceResult {
  matched: number;
  unmatched: number;
  errors: number;
  leadsCreated: number;
  leadsUpdated: number;
}

/**
 * Match Google Ads call_view records to RingCentral calls.
 *
 * Matching criteria (deterministic, not probabilistic):
 * - start_time within 60 seconds of each other
 * - duration within 10 seconds of each other
 * - If caller_area_code available, also verify area code matches from_number
 *
 * Match method recorded for transparency:
 * - 'timestamp+duration+area' — highest confidence
 * - 'timestamp+duration' — high confidence
 * - 'timestamp_only' — moderate confidence (duration mismatch but times align)
 */
export async function crossReferenceCallsToRingCentral(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string
): Promise<CrossReferenceResult> {
  // Fetch unmatched Google Ads calls
  const { data: gadsCalls, error: gadsError } = await supabase
    .from('google_ads_calls')
    .select('id, resource_name, start_date_time, call_duration_seconds, caller_area_code')
    .is('matched_rc_call_id', null)
    .gte('start_date_time', `${startDate}T00:00:00`)
    .lte('start_date_time', `${endDate}T23:59:59`);

  if (gadsError || !gadsCalls || gadsCalls.length === 0) {
    if (gadsError) console.error('Error fetching Google Ads calls:', gadsError);
    return { matched: 0, unmatched: 0, errors: gadsError ? 1 : 0, leadsCreated: 0, leadsUpdated: 0 };
  }

  // Fetch RingCentral calls for the same period (with buffer for timezone differences)
  const bufferStart = new Date(`${startDate}T00:00:00`);
  bufferStart.setHours(bufferStart.getHours() - 2);
  const bufferEnd = new Date(`${endDate}T23:59:59`);
  bufferEnd.setHours(bufferEnd.getHours() + 2);

  const { data: rcCalls, error: rcError } = await supabase
    .from('ringcentral_calls')
    .select('call_id, start_time, duration, from_number, google_ads_call_match')
    .eq('direction', 'Inbound')
    .eq('google_ads_call_match', false)
    .gte('start_time', bufferStart.toISOString())
    .lte('start_time', bufferEnd.toISOString());

  if (rcError || !rcCalls) {
    if (rcError) console.error('Error fetching RingCentral calls:', rcError);
    return { matched: 0, unmatched: gadsCalls.length, errors: 1, leadsCreated: 0, leadsUpdated: 0 };
  }

  let matched = 0;
  let errors = 0;
  let leadsCreated = 0;
  let leadsUpdated = 0;

  // Build test phone set for filtering
  const excludedPhones = new Set(
    (process.env.EXCLUDED_DRIP_PHONES || '').split(',').map(p => p.trim()).filter(Boolean)
  );
  const testPhones = new Set(
    (process.env.TEST_PHONES || '').split(',').map(p => p.trim()).filter(Boolean)
  );
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Track which RC calls have been claimed (prevent double-matching)
  const claimedRcIds = new Set<string>();

  for (const gadsCall of gadsCalls) {
    const gadsTime = new Date(gadsCall.start_date_time).getTime();
    const gadsDuration = gadsCall.call_duration_seconds;
    const gadsAreaCode = gadsCall.caller_area_code || '';

    let bestMatch: (typeof rcCalls)[number] | null = null;
    let bestMethod = '';
    let bestTimeDiff = Infinity;

    for (const rcCall of rcCalls) {
      if (claimedRcIds.has(rcCall.call_id)) continue;

      const rcTime = new Date(rcCall.start_time).getTime();
      const timeDiffMs = Math.abs(gadsTime - rcTime);
      const timeDiffSec = timeDiffMs / 1000;
      const durationDiff = Math.abs(gadsDuration - rcCall.duration);

      // Must be within 60 seconds of each other
      if (timeDiffSec > 60) continue;

      // Check area code match if available
      const areaCodeMatch = gadsAreaCode &&
        rcCall.from_number &&
        rcCall.from_number.replace(/\D/g, '').includes(gadsAreaCode);

      // Determine match method and quality
      let method = '';
      if (durationDiff <= 10 && areaCodeMatch) {
        method = 'timestamp+duration+area';
      } else if (durationDiff <= 10) {
        method = 'timestamp+duration';
      } else if (timeDiffSec <= 30) {
        // Looser: times very close even if duration differs
        method = 'timestamp_only';
      } else {
        continue; // Not a good enough match
      }

      // Prefer the closest time match
      if (timeDiffSec < bestTimeDiff) {
        bestMatch = rcCall;
        bestMethod = method;
        bestTimeDiff = timeDiffSec;
      }
    }

    if (bestMatch) {
      claimedRcIds.add(bestMatch.call_id);

      // Update both tables with the cross-reference
      const [gadsUpdate, rcUpdate] = await Promise.all([
        supabase
          .from('google_ads_calls')
          .update({
            matched_rc_call_id: bestMatch.call_id,
            match_method: bestMethod,
          })
          .eq('id', gadsCall.id),
        supabase
          .from('ringcentral_calls')
          .update({
            google_ads_call_match: true,
            google_ads_call_resource_name: gadsCall.resource_name,
            ad_platform: 'google',
          })
          .eq('call_id', bestMatch.call_id),
      ]);

      if (gadsUpdate.error || rcUpdate.error) {
        console.error('Error updating cross-reference:', gadsUpdate.error || rcUpdate.error);
        errors++;
      } else {
        matched++;

        // Fix B: Create or update lead for call-only Google Ads customers
        const callerPhone = bestMatch.from_number;
        if (callerPhone && !excludedPhones.has(callerPhone) && !testPhones.has(callerPhone)) {
          try {
            // Dedup: check for existing lead with same phone in last 7 days
            const { data: existingLead } = await supabase
              .from('leads')
              .select('id, ad_platform')
              .eq('phone_e164', callerPhone)
              .in('status', ['new', 'contacted', 'quoted', 'scheduled'])
              .gte('created_at', sevenDaysAgo.toISOString())
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (existingLead) {
              // Update existing lead attribution if it's unattributed
              if (!existingLead.ad_platform || existingLead.ad_platform === 'direct' || existingLead.ad_platform === 'unknown') {
                await supabase
                  .from('leads')
                  .update({ ad_platform: 'google', first_contact_method: 'call' })
                  .eq('id', existingLead.id);
                leadsUpdated++;
              }
            } else {
              // Create a new lead for this call-only customer
              const callTime = new Date(gadsCall.start_date_time);
              await supabase
                .from('leads')
                .insert({
                  first_name: 'Google Ads',
                  last_name: 'Caller',
                  phone_e164: callerPhone,
                  email: `call-${callTime.getTime()}@temp.pinkautoglass.com`,
                  vehicle_year: 2000,
                  vehicle_make: 'Unknown',
                  vehicle_model: 'Unknown',
                  service_type: 'repair',
                  ad_platform: 'google',
                  first_contact_method: 'call',
                  is_test: false,
                  status: 'new',
                  created_at: callTime.toISOString(),
                });
              leadsCreated++;
            }
          } catch (leadErr) {
            // Non-fatal: log but don't fail the cross-reference
            console.error('Error creating/updating lead for Google Ads call:', leadErr);
          }
        }
      }
    }
  }

  const unmatched = gadsCalls.length - matched;

  console.log(
    `📞 Cross-reference: ${matched} matched, ${unmatched} unmatched, ${errors} errors ` +
    `(${gadsCalls.length} Google Ads calls, ${rcCalls.length} RingCentral calls)` +
    (leadsCreated || leadsUpdated ? ` | Leads: ${leadsCreated} created, ${leadsUpdated} updated` : '')
  );

  return { matched, unmatched, errors, leadsCreated, leadsUpdated };
}
