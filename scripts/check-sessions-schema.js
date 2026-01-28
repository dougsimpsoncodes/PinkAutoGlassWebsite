require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  // Check user_sessions columns
  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .limit(1);

  if (error) {
    console.log('Error:', error.message);
  } else if (data && data.length > 0) {
    console.log('user_sessions columns:');
    Object.keys(data[0]).forEach(k => console.log('  -', k));
  }

  // Check with started_at
  const { data: sessions, error: sessError } = await supabase
    .from('user_sessions')
    .select('session_id, gclid, started_at')
    .not('gclid', 'is', null)
    .order('started_at', { ascending: false })
    .limit(5);

  if (sessError) {
    console.log('\nError querying with started_at:', sessError.message);
  } else {
    console.log('\nSessions with GCLID (using started_at):', sessions?.length);
    sessions?.forEach(s => console.log('  -', s.session_id, s.started_at));
  }
}

checkSchema();
