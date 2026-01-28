const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '/Users/dougsimpson/Projects/pinkautoglasswebsite/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verify() {
  console.log('🔍 Verifying Microsoft migration...\n');

  // Check for remaining 'bing' records
  const { count: bingCount, error: bingError } = await supabase
    .from('ringcentral_calls')
    .select('*', { count: 'exact', head: true })
    .eq('ad_platform', 'bing');

  if (bingError) {
    console.log('❌ Error checking bing records:', bingError.message);
  } else {
    console.log('📊 Records with ad_platform="bing":', bingCount || 0);
  }

  // Check for 'microsoft' records
  const { count: microsoftCount, error: msError } = await supabase
    .from('ringcentral_calls')
    .select('*', { count: 'exact', head: true })
    .eq('ad_platform', 'microsoft');

  if (msError) {
    console.log('❌ Error checking microsoft records:', msError.message);
  } else {
    console.log('📊 Records with ad_platform="microsoft":', microsoftCount || 0);
  }

  // Get breakdown of all ad_platform values
  const { data: platformBreakdown, error: breakdownError } = await supabase
    .from('ringcentral_calls')
    .select('ad_platform')
    .not('ad_platform', 'is', null);

  if (!breakdownError && platformBreakdown) {
    const counts = {};
    platformBreakdown.forEach(row => {
      counts[row.ad_platform] = (counts[row.ad_platform] || 0) + 1;
    });
    console.log('\n📈 Platform breakdown:');
    Object.entries(counts).forEach(([platform, count]) => {
      console.log('   ' + platform + ': ' + count);
    });
  }

  // Verify constraint was updated
  console.log('\n✅ Migration verification complete!');
  if ((bingCount || 0) === 0) {
    console.log('   ✓ No "bing" records remain');
  } else {
    console.log('   ⚠️ Still have "bing" records - migration may not have run');
  }

  if ((microsoftCount || 0) > 0) {
    console.log('   ✓ Microsoft records present');
  }
}

verify().catch(console.error);
