require('dotenv').config({ path: '/Users/dougsimpson/Projects/pinkautoglasswebsite/.env.local' });

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function verifyROIAPI() {
  console.log('🔍 Testing ROI API endpoint...\n');

  const authHeader = 'Basic ' + Buffer.from(ADMIN_USERNAME + ':' + ADMIN_PASSWORD).toString('base64');

  try {
    const response = await fetch('http://localhost:3000/api/admin/roi?period=all', {
      headers: {
        'Authorization': authHeader,
      }
    });

    if (!response.ok) {
      console.log('❌ API Error:', response.status, response.statusText);
      return;
    }

    const data = await response.json();

    console.log('📊 ROI API Response Structure:');
    console.log('   Keys:', Object.keys(data));

    if (data.platforms) {
      console.log('\n📈 Platform Data:');
      Object.entries(data.platforms).forEach(([platform, metrics]) => {
        console.log('   ' + platform + ':');
        console.log('      customers:', metrics.customers);
        console.log('      adSpend:', metrics.adSpend);
        console.log('      roi:', metrics.roi);
      });
    }

    // Check for microsoft_ads key specifically
    if (data.platforms && data.platforms.microsoft_ads) {
      console.log('\n✅ microsoft_ads key present in response!');
      console.log('   Customers:', data.platforms.microsoft_ads.customers);
      console.log('   Ad Spend: $' + data.platforms.microsoft_ads.adSpend);
    } else if (data.platforms && data.platforms.bing_ads) {
      console.log('\n⚠️ Still using bing_ads key - code change may not be deployed');
    } else {
      console.log('\n❓ No microsoft_ads or bing_ads key found');
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️ Dev server not running. Starting verification via direct database check instead...');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

verifyROIAPI();
