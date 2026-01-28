/**
 * Check Google Ads conversion data for recent days
 */
require('dotenv').config({ path: '.env.local' });

const { GoogleAdsApi } = require('google-ads-api');

async function checkConversionData() {
  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  });

  const customer = client.Customer({
    customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/[-\s]/g, ''),
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
  });

  console.log('=== Google Ads Conversion Data Analysis ===\n');

  // 1. Check conversion data by conversion action for last 7 days
  console.log('1. Conversions by Action (Last 7 Days):');
  console.log('-'.repeat(60));

  try {
    const conversionsByAction = await customer.query(`
      SELECT
        segments.conversion_action_name,
        segments.date,
        metrics.conversions,
        metrics.all_conversions
      FROM campaign
      WHERE segments.date DURING LAST_7_DAYS
        AND campaign.status != 'REMOVED'
        AND metrics.conversions > 0
    `);

    if (conversionsByAction.length === 0) {
      console.log('   No conversions recorded in the last 7 days.\n');
    } else {
      const byAction = {};
      conversionsByAction.forEach(row => {
        const actionName = row.segments.conversion_action_name;
        const conversions = parseFloat(row.metrics.conversions || 0);
        if (!byAction[actionName]) byAction[actionName] = 0;
        byAction[actionName] += conversions;
      });

      Object.entries(byAction).forEach(([action, count]) => {
        console.log(`   ${action}: ${count}`);
      });
    }
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }

  // 2. Check daily conversion totals
  console.log('\n2. Daily Conversion Totals (Last 7 Days):');
  console.log('-'.repeat(60));

  try {
    const dailyData = await customer.query(`
      SELECT
        segments.date,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.all_conversions
      FROM campaign
      WHERE segments.date DURING LAST_7_DAYS
        AND campaign.status != 'REMOVED'
    `);

    const byDate = {};
    dailyData.forEach(row => {
      const date = row.segments.date;
      if (!byDate[date]) {
        byDate[date] = { impressions: 0, clicks: 0, spend: 0, conversions: 0, allConversions: 0 };
      }
      byDate[date].impressions += parseInt(row.metrics.impressions || 0);
      byDate[date].clicks += parseInt(row.metrics.clicks || 0);
      byDate[date].spend += parseFloat(row.metrics.cost_micros || 0) / 1000000;
      byDate[date].conversions += parseFloat(row.metrics.conversions || 0);
      byDate[date].allConversions += parseFloat(row.metrics.all_conversions || 0);
    });

    console.log('   Date       | Impr  | Clicks | Spend   | Conv | All Conv');
    console.log('   ' + '-'.repeat(55));

    Object.keys(byDate).sort().forEach(date => {
      const d = byDate[date];
      console.log(`   ${date} | ${d.impressions.toString().padStart(5)} | ${d.clicks.toString().padStart(6)} | $${d.spend.toFixed(2).padStart(6)} | ${d.conversions.toString().padStart(4)} | ${d.allConversions.toString().padStart(8)}`);
    });

    const totalConversions = Object.values(byDate).reduce((sum, d) => sum + d.conversions, 0);
    console.log(`\n   Total conversions this week: ${totalConversions}`);

  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  // 3. Explain what conversions represent
  console.log('\n\n3. What "Conversions" Means in Google Ads:');
  console.log('-'.repeat(60));
  console.log(`
   Conversions in Google Ads are tracked actions that you've defined as
   valuable to your business. Based on your account, you have these
   conversion actions configured:

   - "Calls from ads" - Phone calls made directly from clicking on your
      ad's call extension or call-only ad. Google tracks when someone
      clicks the phone number in your ad.

   - "Phone number clicks" - Clicks on phone numbers on your website
      after coming from a Google Ad (requires conversion tracking code).

   - "Submit lead form" - Form submissions on your website after coming
      from a Google Ad (requires conversion tracking code).

   - "Text" - Text/SMS link clicks on your website after coming from
      a Google Ad (requires conversion tracking code).

   If conversions show 0, possible reasons:

   1. No one has completed these actions yet (possible for low-volume days)

   2. Website conversion tracking may not be properly installed:
      - The gtag.js conversion tracking code must be on your website
      - The conversion events must fire when actions occur

   3. Attribution window: Google Ads uses a default 30-day click attribution
      window. Conversions may take time to appear.

   4. "Calls from ads" only tracks calls from ad click - not all phone calls.
      Your RingCentral calls are separate from Google Ads conversions.
`);

  console.log('\n=== End of Analysis ===');
}

checkConversionData().catch(console.error);