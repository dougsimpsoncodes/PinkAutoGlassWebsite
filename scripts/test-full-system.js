/**
 * Full System Test - Conversion Tracking & Attribution
 *
 * Tests the entire flow from click capture to offline conversion upload
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test date range
const DAYS_BACK = 30;
const startDate = new Date();
startDate.setDate(startDate.getDate() - DAYS_BACK);

async function runFullSystemTest() {
  console.log('═'.repeat(70));
  console.log('  FULL SYSTEM TEST - CONVERSION TRACKING & ATTRIBUTION');
  console.log('═'.repeat(70));
  console.log(`\nTesting data from: ${startDate.toISOString().split('T')[0]} to today\n`);

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: []
  };

  // =========================================================================
  // TEST 1: Frontend Click ID Capture
  // =========================================================================
  console.log('\n┌─ TEST 1: FRONTEND CLICK ID CAPTURE');
  console.log('├' + '─'.repeat(68));

  // Check user_sessions for click IDs
  const { data: sessions } = await supabase
    .from('user_sessions')
    .select('session_id, gclid, msclkid, fbclid, started_at, landing_page')
    .gte('started_at', startDate.toISOString())
    .order('started_at', { ascending: false });

  const sessionsWithGclid = sessions?.filter(s => s.gclid) || [];
  const sessionsWithMsclkid = sessions?.filter(s => s.msclkid) || [];
  const totalSessions = sessions?.length || 0;

  console.log(`│  Total sessions: ${totalSessions}`);
  console.log(`│  Sessions with GCLID: ${sessionsWithGclid.length}`);
  console.log(`│  Sessions with MSCLKID: ${sessionsWithMsclkid.length}`);

  if (sessionsWithGclid.length > 0) {
    console.log('│  ✅ GCLID capture is working');
    results.passed++;
    results.tests.push({ name: 'GCLID capture', status: 'passed' });
  } else {
    console.log('│  ❌ No GCLIDs captured - Google Ads tracking may be broken');
    results.failed++;
    results.tests.push({ name: 'GCLID capture', status: 'failed' });
  }

  if (sessionsWithMsclkid.length > 0) {
    console.log('│  ✅ MSCLKID capture is working');
    results.passed++;
    results.tests.push({ name: 'MSCLKID capture', status: 'passed' });
  } else {
    console.log('│  ⚠️  No MSCLKIDs captured - check Microsoft Ads auto-tagging');
    results.warnings++;
    results.tests.push({ name: 'MSCLKID capture', status: 'warning' });
  }

  // Sample landing pages with click IDs
  if (sessionsWithGclid.length > 0) {
    console.log('│');
    console.log('│  Sample Google Ads sessions:');
    sessionsWithGclid.slice(0, 3).forEach(s => {
      console.log(`│    - ${s.started_at?.split('T')[0]} | ${s.landing_page?.substring(0, 40)}...`);
    });
  }

  console.log('└' + '─'.repeat(68));

  // =========================================================================
  // TEST 2: Conversion Event Tracking
  // =========================================================================
  console.log('\n┌─ TEST 2: CONVERSION EVENT TRACKING');
  console.log('├' + '─'.repeat(68));

  const { data: convEvents } = await supabase
    .from('conversion_events')
    .select('id, event_type, gclid, msclkid, phone_number, created_at, session_id')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  const eventsByType = {
    phone_click: convEvents?.filter(e => e.event_type === 'phone_click') || [],
    text_click: convEvents?.filter(e => e.event_type === 'text_click') || [],
    form_submit: convEvents?.filter(e => e.event_type === 'form_submit') || [],
  };

  console.log(`│  Total conversion events: ${convEvents?.length || 0}`);
  console.log(`│    - Phone clicks: ${eventsByType.phone_click.length}`);
  console.log(`│    - Text clicks: ${eventsByType.text_click.length}`);
  console.log(`│    - Form submits: ${eventsByType.form_submit.length}`);

  // Check attribution on events
  const eventsWithGclid = convEvents?.filter(e => e.gclid) || [];
  const eventsWithMsclkid = convEvents?.filter(e => e.msclkid) || [];
  const eventsNoAttribution = convEvents?.filter(e => !e.gclid && !e.msclkid) || [];

  console.log('│');
  console.log(`│  Events with GCLID: ${eventsWithGclid.length} (${((eventsWithGclid.length / (convEvents?.length || 1)) * 100).toFixed(1)}%)`);
  console.log(`│  Events with MSCLKID: ${eventsWithMsclkid.length} (${((eventsWithMsclkid.length / (convEvents?.length || 1)) * 100).toFixed(1)}%)`);
  console.log(`│  Events without attribution: ${eventsNoAttribution.length} (${((eventsNoAttribution.length / (convEvents?.length || 1)) * 100).toFixed(1)}%)`);

  if (convEvents?.length > 0) {
    console.log('│  ✅ Conversion events are being tracked');
    results.passed++;
    results.tests.push({ name: 'Conversion event tracking', status: 'passed' });
  } else {
    console.log('│  ❌ No conversion events found');
    results.failed++;
    results.tests.push({ name: 'Conversion event tracking', status: 'failed' });
  }

  // Check if click IDs are being attached to events
  const attributionRate = (eventsWithGclid.length + eventsWithMsclkid.length) / (convEvents?.length || 1) * 100;
  if (attributionRate > 50) {
    console.log(`│  ✅ Good attribution rate: ${attributionRate.toFixed(1)}% of events have click IDs`);
    results.passed++;
    results.tests.push({ name: 'Event attribution rate', status: 'passed' });
  } else if (attributionRate > 20) {
    console.log(`│  ⚠️  Moderate attribution rate: ${attributionRate.toFixed(1)}%`);
    results.warnings++;
    results.tests.push({ name: 'Event attribution rate', status: 'warning' });
  } else {
    console.log(`│  ❌ Low attribution rate: ${attributionRate.toFixed(1)}% - check click ID persistence`);
    results.failed++;
    results.tests.push({ name: 'Event attribution rate', status: 'failed' });
  }

  console.log('└' + '─'.repeat(68));

  // =========================================================================
  // TEST 3: Lead Attribution
  // =========================================================================
  console.log('\n┌─ TEST 3: LEAD ATTRIBUTION');
  console.log('├' + '─'.repeat(68));

  const { data: leads } = await supabase
    .from('leads')
    .select('id, gclid, msclkid, ad_platform, utm_source, created_at, status')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  const leadsWithGclid = leads?.filter(l => l.gclid) || [];
  const leadsWithMsclkid = leads?.filter(l => l.msclkid) || [];
  const leadsByPlatform = {
    google: leads?.filter(l => l.ad_platform === 'google') || [],
    microsoft: leads?.filter(l => l.ad_platform === 'microsoft') || [],
    direct: leads?.filter(l => l.ad_platform === 'direct' || !l.ad_platform) || [],
  };

  console.log(`│  Total leads: ${leads?.length || 0}`);
  console.log(`│  Leads with GCLID: ${leadsWithGclid.length}`);
  console.log(`│  Leads with MSCLKID: ${leadsWithMsclkid.length}`);
  console.log('│');
  console.log(`│  By ad_platform field:`);
  console.log(`│    - Google: ${leadsByPlatform.google.length}`);
  console.log(`│    - Microsoft: ${leadsByPlatform.microsoft.length}`);
  console.log(`│    - Direct/Unknown: ${leadsByPlatform.direct.length}`);

  if (leadsWithGclid.length > 0 || leadsWithMsclkid.length > 0) {
    console.log('│  ✅ Lead attribution is working');
    results.passed++;
    results.tests.push({ name: 'Lead attribution', status: 'passed' });
  } else {
    console.log('│  ❌ No leads have click ID attribution');
    results.failed++;
    results.tests.push({ name: 'Lead attribution', status: 'failed' });
  }

  console.log('└' + '─'.repeat(68));

  // =========================================================================
  // TEST 4: RingCentral Call Attribution
  // =========================================================================
  console.log('\n┌─ TEST 4: RINGCENTRAL CALL ATTRIBUTION');
  console.log('├' + '─'.repeat(68));

  const { data: calls } = await supabase
    .from('ringcentral_calls')
    .select('call_id, start_time, duration, direction, result, ad_platform, attribution_method, attribution_confidence, google_ads_uploaded_at, microsoft_ads_uploaded_at')
    .eq('direction', 'Inbound')
    .gte('duration', 30)
    .gte('start_time', startDate.toISOString())
    .order('start_time', { ascending: false });

  const callsByPlatform = {
    google: calls?.filter(c => c.ad_platform === 'google') || [],
    microsoft: calls?.filter(c => c.ad_platform === 'microsoft') || [],
    direct: calls?.filter(c => c.ad_platform === 'direct') || [],
    unknown: calls?.filter(c => !c.ad_platform) || [],
  };

  const uploadedToGoogle = calls?.filter(c => c.google_ads_uploaded_at) || [];
  const uploadedToMicrosoft = calls?.filter(c => c.microsoft_ads_uploaded_at) || [];

  console.log(`│  Total qualified inbound calls (30s+): ${calls?.length || 0}`);
  console.log('│');
  console.log(`│  By ad_platform:`);
  console.log(`│    - Google: ${callsByPlatform.google.length}`);
  console.log(`│    - Microsoft: ${callsByPlatform.microsoft.length}`);
  console.log(`│    - Direct: ${callsByPlatform.direct.length}`);
  console.log(`│    - Unknown: ${callsByPlatform.unknown.length}`);
  console.log('│');
  console.log(`│  Uploaded as offline conversions:`);
  console.log(`│    - To Google Ads: ${uploadedToGoogle.length}`);
  console.log(`│    - To Microsoft Ads: ${uploadedToMicrosoft.length}`);

  if (calls?.length > 0) {
    console.log('│  ✅ RingCentral calls are being synced');
    results.passed++;
    results.tests.push({ name: 'RingCentral sync', status: 'passed' });
  } else {
    console.log('│  ❌ No RingCentral calls found');
    results.failed++;
    results.tests.push({ name: 'RingCentral sync', status: 'failed' });
  }

  console.log('└' + '─'.repeat(68));

  // =========================================================================
  // TEST 5: Offline Conversion Sync Readiness
  // =========================================================================
  console.log('\n┌─ TEST 5: OFFLINE CONVERSION SYNC READINESS');
  console.log('├' + '─'.repeat(68));

  // Find calls that can be attributed but haven't been uploaded
  const notUploadedGoogle = calls?.filter(c => !c.google_ads_uploaded_at) || [];
  const notUploadedMicrosoft = calls?.filter(c => !c.microsoft_ads_uploaded_at) || [];

  // Check for attributable calls using session data
  let googleAttributable = 0;
  let microsoftAttributable = 0;

  for (const call of notUploadedGoogle.slice(0, 20)) {
    const callTime = new Date(call.start_time);
    const windowStart = new Date(callTime);
    windowStart.setDate(windowStart.getDate() - 7);

    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('gclid')
      .not('gclid', 'is', null)
      .gte('started_at', windowStart.toISOString())
      .lte('started_at', callTime.toISOString())
      .limit(1);

    if (sessions && sessions.length > 0) googleAttributable++;
  }

  for (const call of notUploadedMicrosoft.slice(0, 20)) {
    const callTime = new Date(call.start_time);
    const windowStart = new Date(callTime);
    windowStart.setDate(windowStart.getDate() - 7);

    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('msclkid')
      .not('msclkid', 'is', null)
      .gte('started_at', windowStart.toISOString())
      .lte('started_at', callTime.toISOString())
      .limit(1);

    if (sessions && sessions.length > 0) microsoftAttributable++;
  }

  console.log(`│  Calls not uploaded to Google Ads: ${notUploadedGoogle.length}`);
  console.log(`│  Calls not uploaded to Microsoft Ads: ${notUploadedMicrosoft.length}`);
  console.log('│');
  console.log(`│  Sample of 20 calls - attributable:`);
  console.log(`│    - To Google Ads: ${googleAttributable}`);
  console.log(`│    - To Microsoft Ads: ${microsoftAttributable}`);

  if (googleAttributable > 0 || microsoftAttributable > 0) {
    console.log('│  ✅ Session-based attribution is working');
    results.passed++;
    results.tests.push({ name: 'Session attribution', status: 'passed' });
  } else {
    console.log('│  ⚠️  No attributable calls found in sample');
    results.warnings++;
    results.tests.push({ name: 'Session attribution', status: 'warning' });
  }

  console.log('└' + '─'.repeat(68));

  // =========================================================================
  // TEST 6: API Connections
  // =========================================================================
  console.log('\n┌─ TEST 6: API CONNECTIONS');
  console.log('├' + '─'.repeat(68));

  // Test Google Ads
  let googleAdsOk = false;
  try {
    const { GoogleAdsApi } = require('google-ads-api');
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    });
    const customer = client.Customer({
      customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/[-\s]/g, ''),
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    });
    const result = await customer.query('SELECT customer.id FROM customer LIMIT 1');
    if (result.length > 0) {
      googleAdsOk = true;
      console.log('│  ✅ Google Ads API: Connected');
      results.passed++;
      results.tests.push({ name: 'Google Ads API', status: 'passed' });
    }
  } catch (e) {
    console.log(`│  ❌ Google Ads API: ${e.message.substring(0, 50)}...`);
    results.failed++;
    results.tests.push({ name: 'Google Ads API', status: 'failed', error: e.message });
  }

  // Test Microsoft Ads
  let microsoftAdsOk = false;
  try {
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_ADS_CLIENT_ID,
        client_secret: process.env.MICROSOFT_ADS_CLIENT_SECRET,
        refresh_token: process.env.MICROSOFT_ADS_REFRESH_TOKEN,
        grant_type: 'refresh_token',
        scope: 'https://ads.microsoft.com/msads.manage',
      }),
    });
    const tokenData = await tokenResponse.json();
    if (tokenData.access_token) {
      microsoftAdsOk = true;
      console.log('│  ✅ Microsoft Ads API: Connected');
      results.passed++;
      results.tests.push({ name: 'Microsoft Ads API', status: 'passed' });
    } else {
      throw new Error(tokenData.error_description || tokenData.error);
    }
  } catch (e) {
    console.log(`│  ❌ Microsoft Ads API: ${e.message?.substring(0, 50)}...`);
    results.failed++;
    results.tests.push({ name: 'Microsoft Ads API', status: 'failed', error: e.message });
  }

  console.log('└' + '─'.repeat(68));

  // =========================================================================
  // TEST 7: Data Consistency Checks
  // =========================================================================
  console.log('\n┌─ TEST 7: DATA CONSISTENCY CHECKS');
  console.log('├' + '─'.repeat(68));

  // Check for orphaned conversion events (no matching session)
  const { data: orphanedEvents } = await supabase
    .from('conversion_events')
    .select('id, session_id')
    .gte('created_at', startDate.toISOString())
    .not('session_id', 'is', null);

  let orphanCount = 0;
  for (const event of (orphanedEvents || []).slice(0, 50)) {
    const { data: session } = await supabase
      .from('user_sessions')
      .select('session_id')
      .eq('session_id', event.session_id)
      .limit(1);
    if (!session || session.length === 0) orphanCount++;
  }

  console.log(`│  Checking first 50 conversion events for orphaned sessions...`);
  if (orphanCount === 0) {
    console.log('│  ✅ All conversion events have matching sessions');
    results.passed++;
    results.tests.push({ name: 'Session-event consistency', status: 'passed' });
  } else {
    console.log(`│  ⚠️  ${orphanCount} events have no matching session`);
    results.warnings++;
    results.tests.push({ name: 'Session-event consistency', status: 'warning' });
  }

  // Check for duplicate conversions
  const { data: duplicateCheck } = await supabase
    .from('conversion_events')
    .select('session_id, event_type')
    .eq('event_type', 'form_submit')
    .gte('created_at', startDate.toISOString());

  const formSubmitsBySession = {};
  (duplicateCheck || []).forEach(e => {
    formSubmitsBySession[e.session_id] = (formSubmitsBySession[e.session_id] || 0) + 1;
  });
  const duplicateSessions = Object.values(formSubmitsBySession).filter(count => count > 1).length;

  if (duplicateSessions === 0) {
    console.log('│  ✅ No duplicate form submissions detected');
    results.passed++;
    results.tests.push({ name: 'Duplicate prevention', status: 'passed' });
  } else {
    console.log(`│  ⚠️  ${duplicateSessions} sessions have multiple form submissions`);
    results.warnings++;
    results.tests.push({ name: 'Duplicate prevention', status: 'warning' });
  }

  console.log('└' + '─'.repeat(68));

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n' + '═'.repeat(70));
  console.log('  SUMMARY');
  console.log('═'.repeat(70));

  console.log(`\n  ✅ Passed: ${results.passed}`);
  console.log(`  ⚠️  Warnings: ${results.warnings}`);
  console.log(`  ❌ Failed: ${results.failed}`);

  console.log('\n  Individual test results:');
  results.tests.forEach(t => {
    const icon = t.status === 'passed' ? '✅' : t.status === 'warning' ? '⚠️ ' : '❌';
    console.log(`    ${icon} ${t.name}`);
    if (t.error) console.log(`       Error: ${t.error.substring(0, 60)}...`);
  });

  // Key metrics
  console.log('\n  KEY METRICS:');
  console.log(`    - Sessions tracked: ${totalSessions}`);
  console.log(`    - Conversion events: ${convEvents?.length || 0}`);
  console.log(`    - Leads captured: ${leads?.length || 0}`);
  console.log(`    - Calls tracked: ${calls?.length || 0}`);
  console.log(`    - Calls uploaded to Google: ${uploadedToGoogle.length}`);
  console.log(`    - Calls uploaded to Microsoft: ${uploadedToMicrosoft.length}`);

  // Attribution breakdown
  const totalConversions = (eventsWithGclid.length + eventsWithMsclkid.length);
  console.log('\n  ATTRIBUTION BREAKDOWN:');
  console.log(`    - Google Ads attributed: ${eventsWithGclid.length} events, ${leadsWithGclid.length} leads`);
  console.log(`    - Microsoft Ads attributed: ${eventsWithMsclkid.length} events, ${leadsWithMsclkid.length} leads`);
  console.log(`    - Unattributed: ${eventsNoAttribution.length} events`);

  console.log('\n' + '═'.repeat(70));

  // Return overall status
  if (results.failed > 0) {
    console.log('  STATUS: ❌ ISSUES DETECTED - Review failed tests above');
    process.exit(1);
  } else if (results.warnings > 0) {
    console.log('  STATUS: ⚠️  MOSTLY WORKING - Review warnings above');
    process.exit(0);
  } else {
    console.log('  STATUS: ✅ ALL SYSTEMS OPERATIONAL');
    process.exit(0);
  }
}

runFullSystemTest().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
