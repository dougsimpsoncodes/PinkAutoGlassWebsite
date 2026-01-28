require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function simulateDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const now = new Date();

  const ATTRIBUTION_WINDOW_MINUTES = 5;
  const matchWindowMs = ATTRIBUTION_WINDOW_MINUTES * 60 * 1000;

  // Get all qualifying inbound calls in this period
  const { data: allCalls, error: callsError } = await supabase
    .from('ringcentral_calls')
    .select('call_id, start_time, ad_platform')
    .eq('direction', 'Inbound')
    .gte('duration', 30)
    .gte('start_time', today.toISOString())
    .lte('start_time', now.toISOString());

  console.log('All calls today:', allCalls?.length);

  // Count already-attributed Google calls
  let actualCalls = allCalls?.filter(c => c.ad_platform === 'google').length || 0;
  console.log('Already attributed to Google:', actualCalls);

  // For unattributed calls, check session-based attribution
  const unattributedCalls = allCalls?.filter(c => !c.ad_platform || c.ad_platform === 'direct') || [];
  console.log('Unattributed calls to check:', unattributedCalls.length);

  for (const call of unattributedCalls) {
    const callTime = new Date(call.start_time);
    const windowStart = new Date(callTime.getTime() - matchWindowMs);

    console.log('');
    console.log('Checking call at:', call.start_time);

    // Check for Google session in window
    const { data: googleSessions } = await supabase
      .from('user_sessions')
      .select('session_id')
      .not('gclid', 'is', null)
      .gte('started_at', windowStart.toISOString())
      .lte('started_at', callTime.toISOString())
      .limit(1);

    console.log('  Google sessions found:', googleSessions?.length || 0);

    if (googleSessions && googleSessions.length > 0) {
      // Check for conflict with Microsoft
      const { data: msSessions } = await supabase
        .from('user_sessions')
        .select('session_id')
        .not('msclkid', 'is', null)
        .gte('started_at', windowStart.toISOString())
        .lte('started_at', callTime.toISOString())
        .limit(1);

      console.log('  Microsoft sessions found:', msSessions?.length || 0);

      // Only count if no Microsoft session (no conflict)
      if (!msSessions || msSessions.length === 0) {
        actualCalls++;
        console.log('  -> Attributed to Google!');
      } else {
        console.log('  -> CONFLICT - skipped');
      }
    }
  }

  console.log('');
  console.log('=== FINAL RESULT ===');
  console.log('Total Google-attributed calls:', actualCalls);
}

simulateDashboard();
