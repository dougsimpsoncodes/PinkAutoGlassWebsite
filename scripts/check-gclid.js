const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkGclid() {
  console.log('\n🔍 Checking for GCLID in database...\n');

  // Check if gclid column exists by trying to select it
  const { data: sessions, error } = await supabase
    .from('user_sessions')
    .select('started_at, landing_page, utm_source, utm_medium, utm_campaign, referrer')
    .order('started_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Recent 10 sessions:');
  sessions.forEach((s, i) => {
    console.log(`\n${i + 1}. ${new Date(s.started_at).toLocaleString()}`);
    console.log(`   Landing page: ${s.landing_page}`);
    console.log(`   UTM source: ${s.utm_source || 'NONE'}`);
    console.log(`   Referrer: ${s.referrer || 'NONE'}`);

    // Check if landing page has gclid parameter
    if (s.landing_page && s.landing_page.includes('gclid=')) {
      const match = s.landing_page.match(/gclid=([^&]+)/);
      console.log(`   ⚠️ GCLID in URL: ${match ? match[1] : 'found but could not parse'}`);
    }
  });

  console.log('\n📋 Summary:');
  console.log('The landing_page column may contain gclid in the URL query string.');
  console.log('We need to check if we have a dedicated gclid column or if we need to add one.');
  console.log('');
}

checkGclid().catch(console.error);
