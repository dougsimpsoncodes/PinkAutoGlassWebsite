/**
 * Comprehensive Conversion Tracking Test Script
 * Tests all components of the conversion tracking system
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConversionTracking() {
  console.log('='.repeat(70));
  console.log('CONVERSION TRACKING SYSTEM DIAGNOSTIC');
  console.log('='.repeat(70));
  console.log('');

  // 1. Check conversion_events table
  console.log('1️⃣  CONVERSION EVENTS TABLE');
  console.log('-'.repeat(50));

  const { data: conversionEvents, error: convError } = await supabase
    .from('conversion_events')
    .select('id, event_type, gclid, msclkid, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (convError) {
    console.log('   ❌ Error querying conversion_events:', convError.message);
  } else {
    console.log(`   Total recent events: ${conversionEvents.length}`);

    // Count by type
    const byType = {};
    const withGclid = conversionEvents.filter(e => e.gclid).length;
    const withMsclkid = conversionEvents.filter(e => e.msclkid).length;

    conversionEvents.forEach(e => {
      byType[e.event_type] = (byType[e.event_type] || 0) + 1;
    });

    console.log('   By type:', byType);
    console.log(`   With GCLID: ${withGclid}`);
    console.log(`   With MSCLKID: ${withMsclkid}`);

    // Show sample with attribution
    const attributed = conversionEvents.filter(e => e.gclid || e.msclkid).slice(0, 5);
    if (attributed.length > 0) {
      console.log('\n   Sample attributed events:');
      attributed.forEach(e => {
        const clickId = e.gclid ? `gclid=${e.gclid.substring(0, 20)}...` : `msclkid=${e.msclkid?.substring(0, 20)}...`;
        console.log(`   - ${e.event_type} at ${e.created_at} (${clickId})`);
      });
    }
  }

  // 2. Check user_sessions table
  console.log('\n2️⃣  USER SESSIONS TABLE');
  console.log('-'.repeat(50));

  const { data: sessions, error: sessError } = await supabase
    .from('user_sessions')
    .select('session_id, gclid, msclkid, fbclid, utm_source, utm_medium, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (sessError) {
    console.log('   ❌ Error querying user_sessions:', sessError.message);
  } else {
    console.log(`   Total recent sessions: ${sessions.length}`);

    const sessWithGclid = sessions.filter(s => s.gclid).length;
    const sessWithMsclkid = sessions.filter(s => s.msclkid).length;
    const sessWithFbclid = sessions.filter(s => s.fbclid).length;

    console.log(`   With GCLID: ${sessWithGclid}`);
    console.log(`   With MSCLKID: ${sessWithMsclkid}`);
    console.log(`   With FBCLID: ${sessWithFbclid}`);

    // UTM sources
    const utmSources = {};
    sessions.forEach(s => {
      if (s.utm_source) {
        utmSources[s.utm_source] = (utmSources[s.utm_source] || 0) + 1;
      }
    });
    console.log('   UTM Sources:', utmSources);

    // Sample sessions with click IDs
    const sessAttributed = sessions.filter(s => s.gclid || s.msclkid).slice(0, 5);
    if (sessAttributed.length > 0) {
      console.log('\n   Sample sessions with click IDs:');
      sessAttributed.forEach(s => {
        const platform = s.gclid ? 'Google' : 'Microsoft';
        const clickId = s.gclid || s.msclkid;
        console.log(`   - ${platform}: ${clickId?.substring(0, 30)}... at ${s.created_at}`);
      });
    }
  }

  // 3. Check leads table attribution
  console.log('\n3️⃣  LEADS TABLE ATTRIBUTION');
  console.log('-'.repeat(50));

  const { data: leads, error: leadError } = await supabase
    .from('leads')
    .select('id, gclid, msclkid, ad_platform, utm_source, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (leadError) {
    console.log('   ❌ Error querying leads:', leadError.message);
  } else {
    console.log(`   Total recent leads: ${leads.length}`);

    const leadsWithGclid = leads.filter(l => l.gclid).length;
    const leadsWithMsclkid = leads.filter(l => l.msclkid).length;

    console.log(`   With GCLID: ${leadsWithGclid}`);
    console.log(`   With MSCLKID: ${leadsWithMsclkid}`);

    // By ad platform
    const byPlatform = {};
    leads.forEach(l => {
      const platform = l.ad_platform || 'unknown';
      byPlatform[platform] = (byPlatform[platform] || 0) + 1;
    });
    console.log('   By ad_platform:', byPlatform);
  }

  // 4. Check RingCentral calls attribution
  console.log('\n4️⃣  RINGCENTRAL CALLS ATTRIBUTION');
  console.log('-'.repeat(50));

  const { data: calls, error: callError } = await supabase
    .from('ringcentral_calls')
    .select('call_id, ad_platform, attribution_method, attribution_confidence, google_ads_uploaded_at, microsoft_ads_uploaded_at, direction, duration, start_time')
    .eq('direction', 'Inbound')
    .gte('duration', 30)
    .order('start_time', { ascending: false })
    .limit(100);

  if (callError) {
    console.log('   ❌ Error querying ringcentral_calls:', callError.message);
  } else {
    console.log(`   Total recent qualified calls (30s+): ${calls.length}`);

    const googleAttributed = calls.filter(c => c.ad_platform === 'google').length;
    const microsoftAttributed = calls.filter(c => c.ad_platform === 'microsoft').length;
    const directAttributed = calls.filter(c => c.ad_platform === 'direct' || !c.ad_platform).length;

    console.log(`   Google Ads attributed: ${googleAttributed}`);
    console.log(`   Microsoft Ads attributed: ${microsoftAttributed}`);
    console.log(`   Direct/Unknown: ${directAttributed}`);

    // Uploaded to ad platforms
    const uploadedGoogle = calls.filter(c => c.google_ads_uploaded_at).length;
    const uploadedMicrosoft = calls.filter(c => c.microsoft_ads_uploaded_at).length;

    console.log(`   Uploaded to Google Ads: ${uploadedGoogle}`);
    console.log(`   Uploaded to Microsoft Ads: ${uploadedMicrosoft}`);

    // Attribution methods
    const byMethod = {};
    calls.forEach(c => {
      const method = c.attribution_method || 'none';
      byMethod[method] = (byMethod[method] || 0) + 1;
    });
    console.log('   Attribution methods:', byMethod);
  }

  // 5. Check for conversion events with click IDs in last 30 days
  console.log('\n5️⃣  ATTRIBUTION SUMMARY (Last 30 Days)');
  console.log('-'.repeat(50));

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentConv } = await supabase
    .from('conversion_events')
    .select('event_type, gclid, msclkid')
    .gte('created_at', thirtyDaysAgo.toISOString());

  if (recentConv) {
    const googlePhoneClicks = recentConv.filter(e => e.event_type === 'phone_click' && e.gclid).length;
    const googleTextClicks = recentConv.filter(e => e.event_type === 'text_click' && e.gclid).length;
    const googleFormSubmits = recentConv.filter(e => e.event_type === 'form_submit' && e.gclid).length;

    const msPhoneClicks = recentConv.filter(e => e.event_type === 'phone_click' && e.msclkid).length;
    const msTextClicks = recentConv.filter(e => e.event_type === 'text_click' && e.msclkid).length;
    const msFormSubmits = recentConv.filter(e => e.event_type === 'form_submit' && e.msclkid).length;

    console.log('   Google Ads Conversions:');
    console.log(`     Phone clicks: ${googlePhoneClicks}`);
    console.log(`     Text clicks: ${googleTextClicks}`);
    console.log(`     Form submits: ${googleFormSubmits}`);
    console.log(`     TOTAL: ${googlePhoneClicks + googleTextClicks + googleFormSubmits}`);

    console.log('   Microsoft Ads Conversions:');
    console.log(`     Phone clicks: ${msPhoneClicks}`);
    console.log(`     Text clicks: ${msTextClicks}`);
    console.log(`     Form submits: ${msFormSubmits}`);
    console.log(`     TOTAL: ${msPhoneClicks + msTextClicks + msFormSubmits}`);
  }

  // 6. DIAGNOSIS: Check for potential issues
  console.log('\n6️⃣  POTENTIAL ISSUES DIAGNOSIS');
  console.log('-'.repeat(50));

  // Check if we're capturing msclkid properly
  const { data: msSessions } = await supabase
    .from('user_sessions')
    .select('session_id, msclkid, landing_page, created_at')
    .not('msclkid', 'is', null)
    .gte('created_at', thirtyDaysAgo.toISOString());

  if (msSessions && msSessions.length > 0) {
    console.log(`   ✅ MSCLKID capture is working (${msSessions.length} sessions)`);
  } else {
    console.log('   ⚠️  No MSCLKID sessions found in last 30 days');
    console.log('      Possible issues:');
    console.log('      - Microsoft Ads not sending msclkid in URLs');
    console.log('      - Auto-tagging not enabled in Microsoft Ads');
    console.log('      - Frontend not capturing msclkid from URL');
  }

  // Check msclkid to conversion ratio
  const { data: msConv } = await supabase
    .from('conversion_events')
    .select('id')
    .not('msclkid', 'is', null)
    .gte('created_at', thirtyDaysAgo.toISOString());

  const msConvCount = msConv?.length || 0;
  const msSessionCount = msSessions?.length || 0;

  if (msSessionCount > 0 && msConvCount > 0) {
    const ratio = (msConvCount / msSessionCount * 100).toFixed(1);
    console.log(`   Microsoft Ads conversion rate from sessions: ${ratio}%`);
  }

  // Check if phone_click events have msclkid
  const { data: phoneClicks } = await supabase
    .from('conversion_events')
    .select('gclid, msclkid, created_at')
    .eq('event_type', 'phone_click')
    .gte('created_at', thirtyDaysAgo.toISOString());

  if (phoneClicks && phoneClicks.length > 0) {
    const totalPhoneClicks = phoneClicks.length;
    const phoneWithGclid = phoneClicks.filter(p => p.gclid).length;
    const phoneWithMsclkid = phoneClicks.filter(p => p.msclkid).length;
    const phoneNoAttribution = phoneClicks.filter(p => !p.gclid && !p.msclkid).length;

    console.log(`\n   Phone clicks breakdown (last 30 days):`);
    console.log(`     Total: ${totalPhoneClicks}`);
    console.log(`     With GCLID: ${phoneWithGclid} (${(phoneWithGclid/totalPhoneClicks*100).toFixed(1)}%)`);
    console.log(`     With MSCLKID: ${phoneWithMsclkid} (${(phoneWithMsclkid/totalPhoneClicks*100).toFixed(1)}%)`);
    console.log(`     No attribution: ${phoneNoAttribution} (${(phoneNoAttribution/totalPhoneClicks*100).toFixed(1)}%)`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('END OF DIAGNOSTIC');
  console.log('='.repeat(70));
}

testConversionTracking().catch(console.error);
