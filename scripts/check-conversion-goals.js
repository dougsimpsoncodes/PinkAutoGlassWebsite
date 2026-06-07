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
  console.log('=== CONVERSION ACTIONS ===\n');

  const rows = await customer.query(`
    SELECT
      conversion_action.id,
      conversion_action.name,
      conversion_action.status,
      conversion_action.type,
      conversion_action.category,
      conversion_action.value_settings.default_value,
      conversion_action.counting_type,
      conversion_action.primary_for_goal
    FROM conversion_action
    ORDER BY conversion_action.name
  `);

  for (const r of rows) {
    const ca = r.conversion_action;
    const primary = ca.primary_for_goal ? 'PRIMARY' : 'secondary';
    console.log(`[${ca.status}] ${ca.name}`);
    console.log(`  ID: ${ca.id} | Type: ${ca.type} | Category: ${ca.category}`);
    console.log(`  Value: $${ca.value_settings?.default_value || 0} | Counting: ${ca.counting_type} | ${primary}`);
    console.log();
  }
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
