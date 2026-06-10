#!/usr/bin/env node
// View or set Google Ads campaign status.
// Usage: node scripts/set-campaign-status.js                       (view all)
//        node scripts/set-campaign-status.js <campaignId> <ENABLED|PAUSED>
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
  const [, , campaignId, status] = process.argv;

  if (campaignId && status) {
    await customer.mutateResources([
      {
        entity: 'campaign',
        operation: 'update',
        resource: {
          resource_name: `customers/${customerId}/campaigns/${campaignId}`,
          status,
        },
        update_mask: { paths: ['status'] },
      },
    ]);
    console.log(`Set campaign ${campaignId} -> ${status}`);
  }

  const rows = await customer.query(`
    SELECT campaign.id, campaign.name, campaign.status
    FROM campaign
    ORDER BY campaign.name
  `);
  console.log('Campaigns:');
  for (const r of rows) {
    console.log(`  ${r.campaign.id}  ${r.campaign.name}  status=${r.campaign.status}`);
  }
}

main().catch((err) => {
  console.error('Error:', err.message || '(no message)');
  if (err.errors) console.error(JSON.stringify(err.errors, null, 2).slice(0, 1000));
  process.exit(1);
});
