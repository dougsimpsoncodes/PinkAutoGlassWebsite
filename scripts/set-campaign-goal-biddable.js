#!/usr/bin/env node
// View or set campaign conversion goal biddability in Google Ads.
// Usage: node scripts/set-campaign-goal-biddable.js                       (view)
//        node scripts/set-campaign-goal-biddable.js <campaignId> <category> <origin> <true|false>
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { GoogleAdsApi } = require('google-ads-api');

const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
});
const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/[-\s]/g, '');
const customer = client.Customer({
  customer_id: customerId,
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
});

async function main() {
  const [, , campaignId, category, origin, biddable] = process.argv;

  const goals = await customer.query(`
    SELECT campaign.id, campaign.name, campaign_conversion_goal.category,
           campaign_conversion_goal.origin, campaign_conversion_goal.biddable
    FROM campaign_conversion_goal
    WHERE campaign.status = 'ENABLED'
    ORDER BY campaign.name, campaign_conversion_goal.category
  `);
  console.log('Current campaign conversion goals:');
  for (const r of goals) {
    const g = r.campaign_conversion_goal;
    console.log(`  campaign=${r.campaign.id} (${r.campaign.name}) category=${g.category} origin=${g.origin} biddable=${g.biddable}`);
  }

  if (!campaignId || !category || !origin || biddable === undefined) return;

  // Resource names use enum NAMES, not numeric values.
  const CATEGORY_NAMES = { 7: 'DOWNLOAD', 11: 'PHONE_CALL_LEAD', 13: 'SUBMIT_LEAD_FORM', 15: 'REQUEST_QUOTE', 18: 'CONTACT', 22: 'QUALIFIED_LEAD' };
  const ORIGIN_NAMES = { 2: 'WEBSITE', 4: 'APP', 5: 'CALL_FROM_ADS' };
  const categoryName = CATEGORY_NAMES[category] || category;
  const originName = ORIGIN_NAMES[origin] || origin;
  const resourceName = `customers/${customerId}/campaignConversionGoals/${campaignId}~${categoryName}~${originName}`;
  const result = await customer.mutateResources([
    {
      entity: 'campaign_conversion_goal',
      operation: 'update',
      resource: {
        resource_name: resourceName,
        biddable: biddable === 'true',
      },
      update_mask: { paths: ['biddable'] },
    },
  ]);
  console.log(`\nUpdated ${resourceName} biddable=${biddable}`);
  console.log(JSON.stringify(result, null, 2).slice(0, 400));
}

main().catch((err) => {
  console.error('Error:', err.message || '(no message)');
  if (err.errors) console.error(JSON.stringify(err.errors, null, 2).slice(0, 1500));
  else console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2).slice(0, 1500));
  process.exit(1);
});
