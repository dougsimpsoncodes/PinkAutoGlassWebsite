/**
 * Apply fn_insert_lead Attribution Fix
 *
 * This script verifies the database columns and provides instructions
 * for applying the SQL function update.
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testConnection() {
  const { data, error } = await supabase
    .from('leads')
    .select('id, gclid, msclkid, ad_platform, utm_source')
    .limit(3);

  if (error) {
    console.log('Connection test failed:', error.message);
    return false;
  }

  console.log('Connection OK.');
  console.log('');
  console.log('Sample leads with attribution columns:');
  data.forEach((lead, i) => {
    console.log(`  Lead ${i + 1}:`);
    console.log(`    id: ${lead.id.slice(0, 8)}...`);
    console.log(`    gclid: ${lead.gclid || '(null)'}`);
    console.log(`    msclkid: ${lead.msclkid || '(null)'}`);
    console.log(`    ad_platform: ${lead.ad_platform || '(null)'}`);
    console.log(`    utm_source: ${lead.utm_source || '(null)'}`);
  });

  return true;
}

async function checkCurrentFunction() {
  // We can't directly query the function definition through Supabase JS,
  // but we can verify the columns are being read correctly
  console.log('');
  console.log('Checking leads table for attribution data...');

  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true });

  const { count: leadsWithGclid } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .not('gclid', 'is', null);

  const { count: leadsWithMsclkid } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .not('msclkid', 'is', null);

  const { count: leadsWithAdPlatform } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .not('ad_platform', 'is', null);

  console.log('');
  console.log('Lead Attribution Status:');
  console.log(`  Total leads: ${totalLeads}`);
  console.log(`  With GCLID: ${leadsWithGclid} (${totalLeads ? ((leadsWithGclid / totalLeads) * 100).toFixed(1) : 0}%)`);
  console.log(`  With MSCLKID: ${leadsWithMsclkid} (${totalLeads ? ((leadsWithMsclkid / totalLeads) * 100).toFixed(1) : 0}%)`);
  console.log(`  With ad_platform: ${leadsWithAdPlatform} (${totalLeads ? ((leadsWithAdPlatform / totalLeads) * 100).toFixed(1) : 0}%)`);
}

async function main() {
  console.log('=== fn_insert_lead Attribution Fix ===');
  console.log('');

  await testConnection();
  await checkCurrentFunction();

  console.log('');
  console.log('='.repeat(60));
  console.log('NEXT STEP: Apply the SQL migration');
  console.log('='.repeat(60));
  console.log('');
  console.log('1. Open Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/fypzafbsfrrlrrufzkol/sql/new');
  console.log('');
  console.log('2. Copy and paste the SQL from:');
  console.log('   supabase/migrations/20251129_fix_fn_insert_lead_attribution.sql');
  console.log('');
  console.log('3. Click "Run" to execute the migration');
  console.log('');
  console.log('After applying, new leads from ad clicks will have:');
  console.log('  - gclid populated (Google Ads)');
  console.log('  - msclkid populated (Microsoft Ads)');
  console.log('  - ad_platform set (google/bing/organic/direct)');
  console.log('  - utm_* fields populated');
}

main().catch(console.error);
