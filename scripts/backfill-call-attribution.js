/**
 * Backfill Call Attribution
 *
 * This script attributes historical phone calls to ad platforms based on
 * phone_click conversion events that occurred shortly before each call.
 *
 * Strategy:
 * 1. Find inbound calls without ad_platform set
 * 2. For each call, look for phone_click events with GCLID/MSCLKID within 5 min before
 * 3. Update the call with the ad_platform (google/bing)
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MIN_CALL_DURATION_SECONDS = 30;

async function backfillCallAttribution() {
  console.log('=== Backfill Call Attribution ===\n');

  // Get all inbound calls without attribution
  const { data: calls, error: callsError } = await supabase
    .from('ringcentral_calls')
    .select('call_id, start_time, from_number, duration, ad_platform')
    .eq('direction', 'Inbound')
    .gte('duration', MIN_CALL_DURATION_SECONDS)
    .is('ad_platform', null)
    .order('start_time', { ascending: false });

  if (callsError) {
    console.error('Error fetching calls:', callsError);
    return;
  }

  console.log(`Found ${calls.length} calls without attribution\n`);

  let googleCount = 0;
  let microsoftCount = 0;
  let directCount = 0;
  let errorCount = 0;

  for (const call of calls) {
    const callTime = new Date(call.start_time);
    const fiveMinBefore = new Date(callTime.getTime() - 5 * 60 * 1000);

    // Look for phone_click with GCLID
    const { data: gclidEvents } = await supabase
      .from('conversion_events')
      .select('gclid, created_at')
      .eq('event_type', 'phone_click')
      .not('gclid', 'is', null)
      .gte('created_at', fiveMinBefore.toISOString())
      .lte('created_at', callTime.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (gclidEvents && gclidEvents.length > 0) {
      const { error: updateError } = await supabase
        .from('ringcentral_calls')
        .update({ ad_platform: 'google' })
        .eq('call_id', call.call_id);

      if (updateError) {
        console.log(`  ❌ Error updating ${call.call_id}: ${updateError.message}`);
        errorCount++;
      } else {
        console.log(`  ✅ ${call.start_time} → Google Ads`);
        googleCount++;
      }
      continue;
    }

    // Look for phone_click with MSCLKID
    const { data: msclkidEvents } = await supabase
      .from('conversion_events')
      .select('msclkid, created_at')
      .eq('event_type', 'phone_click')
      .not('msclkid', 'is', null)
      .gte('created_at', fiveMinBefore.toISOString())
      .lte('created_at', callTime.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (msclkidEvents && msclkidEvents.length > 0) {
      const { error: updateError } = await supabase
        .from('ringcentral_calls')
        .update({ ad_platform: 'microsoft' })
        .eq('call_id', call.call_id);

      if (updateError) {
        console.log(`  ❌ Error updating ${call.call_id}: ${updateError.message}`);
        errorCount++;
      } else {
        console.log(`  ✅ ${call.start_time} → Microsoft Ads`);
        microsoftCount++;
      }
      continue;
    }

    // No matching click found - mark as direct
    const { error: updateError } = await supabase
      .from('ringcentral_calls')
      .update({ ad_platform: 'direct' })
      .eq('call_id', call.call_id);

    if (updateError) {
      errorCount++;
    } else {
      directCount++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Google Ads attributed: ${googleCount}`);
  console.log(`Microsoft Ads attributed: ${microsoftCount}`);
  console.log(`Direct (no ad click): ${directCount}`);
  console.log(`Errors: ${errorCount}`);

  // Final stats
  console.log('\n=== Final Attribution Status ===');

  const { data: finalStats } = await supabase
    .from('ringcentral_calls')
    .select('ad_platform')
    .eq('direction', 'Inbound')
    .gte('duration', MIN_CALL_DURATION_SECONDS);

  const byPlatform = {};
  finalStats?.forEach(c => {
    const platform = c.ad_platform || 'null';
    byPlatform[platform] = (byPlatform[platform] || 0) + 1;
  });

  console.log('Calls by platform:', byPlatform);
}

backfillCallAttribution().catch(console.error);
