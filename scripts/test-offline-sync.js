/**
 * Test Offline Conversion Sync
 *
 * Tests the attribution logic and optionally uploads conversions
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ATTRIBUTION_WINDOW_DAYS = 7;
const MIN_CALL_DURATION_SECONDS = 30;

async function findAttributableCalls() {
  const lookbackDate = new Date();
  lookbackDate.setDate(lookbackDate.getDate() - ATTRIBUTION_WINDOW_DAYS);

  // Get recent inbound calls that haven't been uploaded
  const { data: calls, error: callsError } = await supabase
    .from('ringcentral_calls')
    .select('call_id, start_time, from_number, duration, google_ads_uploaded_at, microsoft_ads_uploaded_at')
    .eq('direction', 'Inbound')
    .gte('start_time', lookbackDate.toISOString())
    .gte('duration', MIN_CALL_DURATION_SECONDS);

  if (callsError) {
    console.error('Error fetching calls:', callsError);
    return { google: [], microsoft: [] };
  }

  // Filter to not-yet-uploaded
  const notUploadedGoogle = calls.filter(c => !c.google_ads_uploaded_at);
  const notUploadedMicrosoft = calls.filter(c => !c.microsoft_ads_uploaded_at);

  console.log(`📞 Found ${notUploadedGoogle.length} calls not uploaded to Google Ads`);
  console.log(`📞 Found ${notUploadedMicrosoft.length} calls not uploaded to Microsoft Ads`);

  const googleAttributed = [];
  const microsoftAttributed = [];

  for (const call of calls) {
    const callTime = new Date(call.start_time);
    const fiveMinBefore = new Date(callTime.getTime() - 5 * 60 * 1000);
    const attributionWindowStart = new Date(callTime);
    attributionWindowStart.setDate(attributionWindowStart.getDate() - ATTRIBUTION_WINDOW_DAYS);

    // Strategy 1: Look for phone_click with GCLID within 5 min
    if (!call.google_ads_uploaded_at) {
      const { data: gclidEvents } = await supabase
        .from('conversion_events')
        .select('session_id, gclid, created_at')
        .eq('event_type', 'phone_click')
        .not('gclid', 'is', null)
        .gte('created_at', fiveMinBefore.toISOString())
        .lte('created_at', callTime.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (gclidEvents && gclidEvents.length > 0) {
        googleAttributed.push({
          callId: call.call_id,
          callTime,
          gclid: gclidEvents[0].gclid,
          sessionId: gclidEvents[0].session_id,
          strategy: 'phone_click',
        });
        continue; // Skip to next call
      }

      // Strategy 2: Session-based attribution (7-day window)
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('session_id, gclid, started_at')
        .not('gclid', 'is', null)
        .gte('started_at', attributionWindowStart.toISOString())
        .lte('started_at', callTime.toISOString())
        .order('started_at', { ascending: false })
        .limit(1);

      if (sessions && sessions.length > 0) {
        googleAttributed.push({
          callId: call.call_id,
          callTime,
          gclid: sessions[0].gclid,
          sessionId: sessions[0].session_id,
          strategy: 'session',
        });
      }
    }

    // Strategy 1: Look for phone_click with MSCLKID within 5 min
    if (!call.microsoft_ads_uploaded_at) {
      const { data: msclkidEvents } = await supabase
        .from('conversion_events')
        .select('session_id, msclkid, created_at')
        .eq('event_type', 'phone_click')
        .not('msclkid', 'is', null)
        .gte('created_at', fiveMinBefore.toISOString())
        .lte('created_at', callTime.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (msclkidEvents && msclkidEvents.length > 0) {
        microsoftAttributed.push({
          callId: call.call_id,
          callTime,
          msclkid: msclkidEvents[0].msclkid,
          sessionId: msclkidEvents[0].session_id,
          strategy: 'phone_click',
        });
        continue;
      }

      // Strategy 2: Session-based attribution (7-day window)
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('session_id, msclkid, started_at')
        .not('msclkid', 'is', null)
        .gte('started_at', attributionWindowStart.toISOString())
        .lte('started_at', callTime.toISOString())
        .order('started_at', { ascending: false })
        .limit(1);

      if (sessions && sessions.length > 0) {
        microsoftAttributed.push({
          callId: call.call_id,
          callTime,
          msclkid: sessions[0].msclkid,
          sessionId: sessions[0].session_id,
          strategy: 'session',
        });
      }
    }
  }

  return { google: googleAttributed, microsoft: microsoftAttributed };
}

async function main() {
  console.log('=== Testing Offline Conversion Sync ===\n');

  const { google, microsoft } = await findAttributableCalls();

  console.log(`\n✅ Google Ads attributable calls: ${google.length}`);
  const googleByStrategy = { phone_click: 0, session: 0 };
  google.forEach(c => googleByStrategy[c.strategy]++);
  console.log(`   Strategy breakdown: phone_click=${googleByStrategy.phone_click}, session=${googleByStrategy.session}`);
  google.slice(0, 5).forEach(c => {
    console.log(`   - ${c.callTime.toISOString()} | ${c.strategy} | GCLID: ${c.gclid.slice(0, 30)}...`);
  });

  console.log(`\n✅ Microsoft Ads attributable calls: ${microsoft.length}`);
  const msftByStrategy = { phone_click: 0, session: 0 };
  microsoft.forEach(c => msftByStrategy[c.strategy]++);
  console.log(`   Strategy breakdown: phone_click=${msftByStrategy.phone_click}, session=${msftByStrategy.session}`);
  microsoft.slice(0, 5).forEach(c => {
    console.log(`   - ${c.callTime.toISOString()} | ${c.strategy} | MSCLKID: ${c.msclkid.slice(0, 30)}...`);
  });

  console.log('\n=== Summary ===');
  console.log(`Ready to upload to Google Ads: ${google.length} calls`);
  console.log(`Ready to upload to Microsoft Ads: ${microsoft.length} calls`);

  if (google.length > 0 || microsoft.length > 0) {
    console.log('\nTo upload these conversions, run:');
    console.log('  curl -X GET "https://pinkautoglass.com/api/cron/sync-search-data" -H "Authorization: Bearer $CRON_SECRET"');
    console.log('\nOr wait for the daily cron job at 6am MT.');
  }
}

main().catch(console.error);
