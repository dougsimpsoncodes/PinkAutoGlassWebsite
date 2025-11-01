// Quick script to check database state
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load env vars from .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.+)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDatabase() {
  console.log('🔍 Checking database state...\n');

  // Check leads count
  const { data: leads, error: leadsError, count } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true });

  if (leadsError) {
    console.error('❌ Error checking leads:', leadsError.message);
  } else {
    console.log(`📊 Leads table: ${count} records`);
  }

  // Get sample of recent leads (if any)
  const { data: recentLeads, error: recentError } = await supabase
    .from('leads')
    .select('id, created_at, first_name, last_name, service_type')
    .order('created_at', { ascending: false })
    .limit(5);

  if (!recentError && recentLeads && recentLeads.length > 0) {
    console.log('\n📋 Most recent leads:');
    recentLeads.forEach((lead, i) => {
      console.log(`  ${i + 1}. ${lead.first_name} ${lead.last_name} - ${lead.service_type} (${new Date(lead.created_at).toLocaleDateString()})`);
    });
  } else if (recentLeads && recentLeads.length === 0) {
    console.log('\n✅ Database is EMPTY - ready for new leads');
  }

  // Check media table
  const { data: media, error: mediaError, count: mediaCount } = await supabase
    .from('media')
    .select('*', { count: 'exact', head: true });

  if (!mediaError) {
    console.log(`\n📸 Media table: ${mediaCount || 0} files`);
  }

  console.log('\n✅ Database check complete');
}

checkDatabase().catch(console.error);
