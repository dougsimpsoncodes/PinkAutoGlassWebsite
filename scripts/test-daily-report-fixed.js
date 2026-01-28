/**
 * Test Daily Report with Fixed Issues
 * This script manually triggers the daily report to test the fixes
 */

require('dotenv').config({ path: '.env.local' });

async function importFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function testDailyReport() {
  const fetch = await importFetch();
  
  const CRON_SECRET = process.env.CRON_SECRET;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  if (!CRON_SECRET) {
    console.error('❌ CRON_SECRET not found in environment variables');
    process.exit(1);
  }

  console.log('🔄 Testing daily report with fixes...');
  console.log(`   Using endpoint: ${SITE_URL}/api/cron/daily-report`);

  try {
    const response = await fetch(`${SITE_URL}/api/cron/daily-report`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Daily report test successful!');
      console.log('📊 Report stats:', {
        phoneCalls: data.stats?.phoneCalls || 0,
        quoteRequests: data.stats?.quoteRequests || 0,
        clickToCalls: data.stats?.clickToCalls || 0,
        clickToTexts: data.stats?.clickToTexts || 0,
        googleAdsSpend: `$${data.stats?.spend?.toFixed(2) || '0.00'}`,
        msAdsSpend: `$${data.stats?.msSpend?.toFixed(2) || '0.00'}`,
        totalContacts: data.stats?.totalContacts || 0,
      });
    } else {
      console.error('❌ Daily report test failed:');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${data.error || 'Unknown error'}`);
      console.error('   Full response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Daily report test error:', error.message);
  }
}

testDailyReport().catch(console.error);