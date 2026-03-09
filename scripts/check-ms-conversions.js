require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // Check what MS ads tables we have
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // Check keyword performance for conversions
  const { data: kwData, error: kwError } = await supabase
    .from('microsoft_ads_keyword_performance')
    .select('date, keyword, conversions, clicks, spend')
    .gte('date', thirtyDaysAgo)
    .order('date', { ascending: false });

  if (kwError) {
    console.log('keyword_performance error:', kwError.message);
  } else {
    const totalConversions = kwData.reduce((sum, r) => sum + (parseFloat(r.conversions) || 0), 0);
    const totalSpend = kwData.reduce((sum, r) => sum + (parseFloat(r.spend) || 0), 0);
    const totalClicks = kwData.reduce((sum, r) => sum + (parseInt(r.clicks) || 0), 0);
    console.log(`\nLast 30 days MS Ads performance (from ${thirtyDaysAgo}):`);
    console.log(`  Conversions: ${totalConversions}`);
    console.log(`  Clicks: ${totalClicks}`);
    console.log(`  Spend: $${totalSpend.toFixed(2)}`);
    console.log(`  CPA: $${totalConversions > 0 ? (totalSpend / totalConversions).toFixed(2) : 'N/A'}`);
    console.log(`\n  Most recent data date: ${kwData[0]?.date || 'none'}`);
  }
}

main().catch(console.error);
