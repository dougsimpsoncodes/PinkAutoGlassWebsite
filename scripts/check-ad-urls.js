#!/usr/bin/env node
process.env.DOTENV_CONFIG_QUIET = 'true';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { GoogleAdsApi } = require('google-ads-api');

const customer = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
}).Customer({
  customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/[-\s]/g, ''),
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
});

async function main() {
  const rows = await customer.query(`
    SELECT campaign.name, ad_group.name, ad_group_ad.ad.final_urls, ad_group_ad.ad.type
    FROM ad_group_ad
    WHERE campaign.status = 'ENABLED'
      AND ad_group.status = 'ENABLED'
      AND ad_group_ad.status = 'ENABLED'
  `);
  for (const r of rows) {
    console.log(`${r.campaign.name} | ${r.ad_group.name} | ${r.ad_group_ad.ad.final_urls} | ${r.ad_group_ad.ad.type}`);
  }
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
