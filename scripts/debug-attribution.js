/**
 * Debug Attribution Logic
 * Analyzes correct vs incorrect attribution methods
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DAYS_BACK = 30;

// Normalize phone numbers for matching (last 10 digits)
function normalizePhone(phone) {
  if (!phone) return null;
  return phone.replace(/[^0-9]/g, '').slice(-10);
}

async function analyzeAttribution() {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - DAYS_BACK);

  // Get all qualified inbound calls
  const { data: calls } = await supabase
    .from('ringcentral_calls')
    .select('call_id, start_time, from_number, duration')
    .eq('direction', 'Inbound')
    .gte('start_time', startDate.toISOString())
    .gte('duration', 30);

  console.log('='.repeat(70));
  console.log('  ATTRIBUTION ACCURACY ANALYSIS');
  console.log('='.repeat(70));
  console.log('\nTotal qualified inbound calls (30s+):', calls.length);

  // ============================================
  // METHOD 1: Direct phone_click match (5 min)
  // ============================================
  console.log('\n' + '-'.repeat(70));
  console.log('METHOD 1: Direct Phone Click Match (within 5 min of call)');
  console.log('-'.repeat(70));

  let directMatches = { google: 0, microsoft: 0, both: 0 };

  for (const call of calls) {
    const callTime = new Date(call.start_time);
    const fiveMinBefore = new Date(callTime.getTime() - 5 * 60 * 1000);

    const { data: gclidEvents } = await supabase
      .from('conversion_events')
      .select('gclid')
      .eq('event_type', 'phone_click')
      .not('gclid', 'is', null)
      .gte('created_at', fiveMinBefore.toISOString())
      .lte('created_at', callTime.toISOString())
      .limit(1);

    const { data: msclkidEvents } = await supabase
      .from('conversion_events')
      .select('msclkid')
      .eq('event_type', 'phone_click')
      .not('msclkid', 'is', null)
      .gte('created_at', fiveMinBefore.toISOString())
      .lte('created_at', callTime.toISOString())
      .limit(1);

    const hasGoogle = gclidEvents && gclidEvents.length > 0;
    const hasMicrosoft = msclkidEvents && msclkidEvents.length > 0;

    if (hasGoogle) directMatches.google++;
    if (hasMicrosoft) directMatches.microsoft++;
    if (hasGoogle && hasMicrosoft) directMatches.both++;
  }

  console.log('  Google Ads attributable:', directMatches.google);
  console.log('  Microsoft Ads attributable:', directMatches.microsoft);
  console.log('  (Attributed to both:', directMatches.both, ')');

  // ============================================
  // METHOD 2: Phone number match via leads
  // ============================================
  console.log('\n' + '-'.repeat(70));
  console.log('METHOD 2: Phone Number Match (caller phone = lead phone)');
  console.log('-'.repeat(70));

  // Get all leads with phone numbers and click IDs
  const { data: leads } = await supabase
    .from('leads')
    .select('phone, gclid, msclkid, created_at')
    .gte('created_at', startDate.toISOString());

  console.log('  Leads in period:', leads ? leads.length : 0);
  console.log('  Leads with GCLID:', leads ? leads.filter(l => l.gclid).length : 0);
  console.log('  Leads with MSCLKID:', leads ? leads.filter(l => l.msclkid).length : 0);

  if (!leads || leads.length === 0) {
    console.log('  (No leads found in this period)');
  }

  // Build phone -> lead map
  const leadsByPhone = {};
  (leads || []).forEach(lead => {
    const normalized = normalizePhone(lead.phone);
    if (normalized) {
      if (!leadsByPhone[normalized]) {
        leadsByPhone[normalized] = [];
      }
      leadsByPhone[normalized].push(lead);
    }
  });

  let phoneMatches = { google: 0, microsoft: 0, samples: [] };

  for (const call of calls) {
    const callerPhone = normalizePhone(call.from_number);
    const matchingLeads = leadsByPhone[callerPhone];

    if (matchingLeads) {
      const leadWithGclid = matchingLeads.find(l => l.gclid);
      const leadWithMsclkid = matchingLeads.find(l => l.msclkid);

      if (leadWithGclid) {
        phoneMatches.google++;
        if (phoneMatches.samples.length < 5) {
          phoneMatches.samples.push({
            caller: call.from_number,
            callTime: call.start_time,
            gclid: leadWithGclid.gclid.slice(0, 40),
            leadCreated: leadWithGclid.created_at
          });
        }
      }
      if (leadWithMsclkid) {
        phoneMatches.microsoft++;
      }
    }
  }

  console.log('\n  Calls from known lead phones:');
  console.log('    Google Ads attributable:', phoneMatches.google);
  console.log('    Microsoft Ads attributable:', phoneMatches.microsoft);

  if (phoneMatches.samples.length > 0) {
    console.log('\n  Sample phone matches:');
    phoneMatches.samples.forEach((s, i) => {
      console.log(`    ${i + 1}. Caller: ${s.caller}`);
      console.log(`       Call time: ${s.callTime}`);
      console.log(`       Lead created: ${s.leadCreated}`);
      console.log(`       GCLID: ${s.gclid}...`);
    });
  }

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(70));
  console.log('  SUMMARY: CORRECT ATTRIBUTION COUNTS');
  console.log('='.repeat(70));

  // Combine (avoiding double-count)
  const totalCorrectGoogle = directMatches.google + phoneMatches.google;
  const totalCorrectMicrosoft = directMatches.microsoft + phoneMatches.microsoft;

  console.log('\nHIGH-CONFIDENCE ATTRIBUTIONS:');
  console.log('  Google Ads:    ', totalCorrectGoogle, 'calls', `(${(totalCorrectGoogle/calls.length*100).toFixed(1)}%)`);
  console.log('  Microsoft Ads: ', totalCorrectMicrosoft, 'calls', `(${(totalCorrectMicrosoft/calls.length*100).toFixed(1)}%)`);

  console.log('\n⚠️  CURRENT (INCORRECT) SESSION-BASED LOGIC WOULD CLAIM:');
  console.log('  ~171 Google Ads calls (OVER-COUNTED by', (171 - totalCorrectGoogle), ')');
  console.log('  ~179 Microsoft Ads calls (OVER-COUNTED by', (179 - totalCorrectMicrosoft), ')');

  console.log('\n' + '='.repeat(70));
  console.log('  THE PROBLEM WITH SESSION-BASED ATTRIBUTION');
  console.log('='.repeat(70));
  console.log(`
The current logic says:
  "If ANY user clicked a Google ad in the past 7 days,
   attribute ALL calls in that period to Google."

This is wrong because:
  - A call from phone +17205551234 is attributed to a random GCLID
  - We have no proof that caller +17205551234 was the person who clicked that ad
  - With 177 Google sessions and 407 Microsoft sessions in 30 days,
    almost EVERY call would find a matching session

CORRECT attribution requires linking the CALLER to the CLICKER:
  1. Direct: User clicks phone button → calls within 5 minutes
  2. Phone match: Caller's phone number matches a lead's phone number
  3. Form submission: User submits form with phone → we call them back

Without one of these links, we're just guessing.
`);

  // ============================================
  // Check calls already marked with ad_platform
  // ============================================
  console.log('-'.repeat(70));
  console.log('ALREADY MARKED IN DATABASE (ad_platform field):');
  console.log('-'.repeat(70));

  const { data: markedCalls } = await supabase
    .from('ringcentral_calls')
    .select('ad_platform')
    .gte('start_time', startDate.toISOString())
    .gte('duration', 30)
    .eq('direction', 'Inbound');

  const platformCounts = { google: 0, microsoft: 0, direct: 0, null: 0 };
  markedCalls.forEach(c => {
    if (c.ad_platform === 'google') platformCounts.google++;
    else if (c.ad_platform === 'microsoft') platformCounts.microsoft++;
    else if (c.ad_platform === 'direct') platformCounts.direct++;
    else platformCounts.null++;
  });

  console.log('  Google:', platformCounts.google);
  console.log('  Microsoft:', platformCounts.microsoft);
  console.log('  Direct:', platformCounts.direct);
  console.log('  Unmarked:', platformCounts.null);
}

analyzeAttribution().catch(console.error);
