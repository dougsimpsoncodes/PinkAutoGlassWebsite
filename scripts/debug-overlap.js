require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Normalize phone for matching
function normalize(phone) {
  return phone ? phone.replace(/[^0-9]/g, '').slice(-10) : null;
}

async function checkPhoneMatching() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get all calls
  const { data: calls } = await supabase
    .from('ringcentral_calls')
    .select('call_id, from_number, start_time, ad_platform')
    .eq('direction', 'Inbound')
    .gte('duration', 30)
    .gte('start_time', thirtyDaysAgo.toISOString());

  // Get all leads with click IDs
  const { data: leads } = await supabase
    .from('leads')
    .select('phone, gclid, msclkid, created_at');

  console.log('\n=== PHONE NUMBER MATCHING ===\n');
  console.log('Total calls:', calls.length);
  console.log('Total leads:', leads ? leads.length : 0);
  console.log('Leads with GCLID:', leads ? leads.filter(l => l.gclid).length : 0);
  console.log('Leads with MSCLKID:', leads ? leads.filter(l => l.msclkid).length : 0);

  // Build lead phone map
  const leadsByPhone = {};
  if (leads) {
    leads.forEach(lead => {
      const norm = normalize(lead.phone);
      if (norm) {
        if (!leadsByPhone[norm]) leadsByPhone[norm] = [];
        leadsByPhone[norm].push(lead);
      }
    });
  }

  console.log('Unique lead phone numbers:', Object.keys(leadsByPhone).length);

  // Match calls to leads
  let matchedGoogle = 0;
  let matchedMicrosoft = 0;
  let matchedNoAttribution = 0;
  let notMatched = 0;

  for (const call of calls) {
    const callerPhone = normalize(call.from_number);
    const matchingLeads = leadsByPhone[callerPhone];

    if (matchingLeads && matchingLeads.length > 0) {
      const hasGoogle = matchingLeads.some(l => l.gclid);
      const hasMicrosoft = matchingLeads.some(l => l.msclkid);

      if (hasGoogle) matchedGoogle++;
      else if (hasMicrosoft) matchedMicrosoft++;
      else matchedNoAttribution++;
    } else {
      notMatched++;
    }
  }

  console.log('\n=== PHONE MATCHING RESULTS ===');
  console.log('Calls where caller phone matches a lead phone:');
  console.log('  With Google attribution:', matchedGoogle);
  console.log('  With Microsoft attribution:', matchedMicrosoft);
  console.log('  With no click ID:', matchedNoAttribution);
  console.log('Calls with no matching lead:', notMatched);

  console.log('\n=== CONCLUSION ===');
  const total = matchedGoogle + matchedMicrosoft;
  console.log('We can reliably attribute ' + total + ' additional calls via phone matching.');
  console.log('The remaining ' + notMatched + ' calls have no provable link to any ad click.');
}

async function debugAttribution() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get session counts
  const { data: googleSessions } = await supabase
    .from('user_sessions')
    .select('session_id, gclid, visitor_id, started_at')
    .not('gclid', 'is', null)
    .gte('started_at', thirtyDaysAgo.toISOString());

  const { data: microsoftSessions } = await supabase
    .from('user_sessions')
    .select('session_id, msclkid, visitor_id, started_at')
    .not('msclkid', 'is', null)
    .gte('started_at', thirtyDaysAgo.toISOString());

  console.log('=== SESSION ANALYSIS ===\n');
  console.log('Google sessions (with GCLID):', googleSessions.length);
  console.log('Microsoft sessions (with MSCLKID):', microsoftSessions.length);

  // Check for sessions that have BOTH gclid AND msclkid (impossible in reality)
  const { data: bothSessions } = await supabase
    .from('user_sessions')
    .select('session_id, gclid, msclkid, visitor_id, started_at, landing_page')
    .not('gclid', 'is', null)
    .not('msclkid', 'is', null)
    .gte('started_at', thirtyDaysAgo.toISOString())
    .limit(10);

  console.log('\n=== IMPOSSIBLE: Sessions with BOTH gclid AND msclkid ===');
  console.log('Count:', bothSessions?.length || 0);

  if (bothSessions && bothSessions.length > 0) {
    console.log('\nThis should NOT happen! A single click cannot come from both Google AND Microsoft.');
    console.log('Sample problematic sessions:');
    bothSessions.slice(0, 5).forEach(s => {
      console.log('\n  Session:', s.session_id);
      console.log('    Started:', s.started_at);
      console.log('    GCLID:', s.gclid);
      console.log('    MSCLKID:', s.msclkid);
      console.log('    Landing:', s.landing_page);
    });
  }

  // Check unique visitors
  const googleVisitors = new Set(googleSessions.map(s => s.visitor_id));
  const microsoftVisitors = new Set(microsoftSessions.map(s => s.visitor_id));

  console.log('\n=== UNIQUE VISITORS ===');
  console.log('Unique Google visitors:', googleVisitors.size);
  console.log('Unique Microsoft visitors:', microsoftVisitors.size);

  // How many visitors used BOTH platforms?
  let bothPlatformVisitors = 0;
  const overlappingVisitors = [];
  googleVisitors.forEach(v => {
    if (microsoftVisitors.has(v)) {
      bothPlatformVisitors++;
      overlappingVisitors.push(v);
    }
  });
  console.log('Visitors who clicked ads on BOTH platforms:', bothPlatformVisitors);

  if (bothPlatformVisitors > 0) {
    console.log('\nThis is suspicious - very few people use both Google and Bing.');
    console.log('Sample overlapping visitor IDs:', overlappingVisitors.slice(0, 5));
  }

  console.log('\n=== THE CORE PROBLEM ===');
  console.log('');
  console.log('When I said 71% of calls had "both platforms in window", I meant:');
  console.log('  - In the 7 days before that call, SOME user clicked a Google ad');
  console.log('  - AND in the same 7 days, SOME OTHER user clicked a Microsoft ad');
  console.log('');
  console.log('This does NOT mean the caller used both platforms.');
  console.log('It means there was ad activity on both platforms from ANY user.');
  console.log('');
  console.log('Without linking the callers phone number to a session, we cannot');
  console.log('know which (if any) of those sessions belongs to the caller.');
}

async function main() {
  await debugAttribution();
  await checkPhoneMatching();
}

main();
