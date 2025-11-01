const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTrafficSources() {
  console.log('\n📊 Checking Traffic Sources Data...\n');

  // Get recent sessions
  const { data: sessions, error } = await supabase
    .from('user_sessions')
    .select('started_at, utm_source, utm_medium, utm_campaign, referrer, landing_page')
    .order('started_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error:', error);
    return;
  }

  // Count sources
  const sourceCounts = {
    withUTM: 0,
    withReferrer: 0,
    withNeither: 0,
    googleReferrer: 0,
    googleUTM: 0,
  };

  console.log('Recent Sessions:\n');
  sessions.forEach((session, i) => {
    if (i < 10) { // Show first 10
      console.log(`${i + 1}. ${new Date(session.started_at).toLocaleString()}`);
      console.log(`   UTM Source: ${session.utm_source || 'NONE'}`);
      console.log(`   UTM Medium: ${session.utm_medium || 'NONE'}`);
      console.log(`   UTM Campaign: ${session.utm_campaign || 'NONE'}`);
      console.log(`   Referrer: ${session.referrer || 'NONE'}`);
      console.log(`   Landing Page: ${session.landing_page || 'NONE'}`);
      console.log('');
    }

    // Count stats
    if (session.utm_source) sourceCounts.withUTM++;
    if (session.referrer) sourceCounts.withReferrer++;
    if (!session.utm_source && !session.referrer) sourceCounts.withNeither++;

    if (session.referrer && session.referrer.toLowerCase().includes('google')) {
      sourceCounts.googleReferrer++;
    }
    if (session.utm_source && session.utm_source.toLowerCase().includes('google')) {
      sourceCounts.googleUTM++;
    }
  });

  console.log('\n📈 Summary of 50 Most Recent Sessions:\n');
  console.log(`Sessions with UTM source: ${sourceCounts.withUTM} (${((sourceCounts.withUTM / sessions.length) * 100).toFixed(1)}%)`);
  console.log(`Sessions with referrer: ${sourceCounts.withReferrer} (${((sourceCounts.withReferrer / sessions.length) * 100).toFixed(1)}%)`);
  console.log(`Sessions with neither: ${sourceCounts.withNeither} (${((sourceCounts.withNeither / sessions.length) * 100).toFixed(1)}%)`);
  console.log(`Google in referrer: ${sourceCounts.googleReferrer}`);
  console.log(`Google in UTM: ${sourceCounts.googleUTM}`);
  console.log('');
}

checkTrafficSources().catch(console.error);
