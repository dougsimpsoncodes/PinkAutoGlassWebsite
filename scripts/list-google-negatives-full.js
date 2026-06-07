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
    SELECT ad_group.name, ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type
    FROM ad_group_criterion
    WHERE ad_group_criterion.negative = true
      AND campaign.status = 'ENABLED'
      AND ad_group.status = 'ENABLED'
      AND ad_group_criterion.type = 'KEYWORD'
    ORDER BY ad_group.name
  `);

  const byGroup = {};
  for (const r of rows) {
    const g = r.ad_group.name;
    if (!byGroup[g]) byGroup[g] = [];
    const kw = r.ad_group_criterion?.keyword;
    if (kw) byGroup[g].push(`${kw.text} [${kw.match_type}]`);
  }

  if (Object.keys(byGroup).length === 0) {
    console.log('No ad-group-level negative keywords found on any enabled ad group.');
    return;
  }

  for (const [group, kws] of Object.entries(byGroup)) {
    console.log(`\n${group}: ${kws.length} ad-group-level negatives`);
    kws.forEach(k => console.log(`  - ${k}`));
  }
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
