#!/usr/bin/env node
process.env.DOTENV_CONFIG_QUIET = 'true';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { GoogleAdsApi } = require('google-ads-api');

const CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/[-\s]/g, '');
const DUPLICATE_ID = '7513990530';

const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
});

const customer = client.Customer({
  customer_id: CUSTOMER_ID,
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
});

async function main() {
  console.log(`Removing duplicate "Calls from ads (1)" (ID: ${DUPLICATE_ID})...\n`);

  const [row] = await customer.query(`
    SELECT conversion_action.id, conversion_action.name, conversion_action.status,
           conversion_action.value_settings.default_value, conversion_action.primary_for_goal
    FROM conversion_action
    WHERE conversion_action.id = ${DUPLICATE_ID}
  `);

  if (!row) { console.error('Not found!'); process.exit(1); }

  const ca = row.conversion_action;
  console.log(`Found: "${ca.name}" | Value: $${ca.value_settings?.default_value || 0} | Primary: ${ca.primary_for_goal}`);

  if (ca.primary_for_goal) { console.error('ABORT: PRIMARY!'); process.exit(1); }

  const resourceName = `customers/${CUSTOMER_ID}/conversionActions/${DUPLICATE_ID}`;

  const result = await customer.conversionActions.remove([resourceName]);
  console.log('Removed:', JSON.stringify(result).slice(0, 300));

  console.log('\n=== Verifying ===');
  const rows = await customer.query(`
    SELECT conversion_action.id, conversion_action.name, conversion_action.status
    FROM conversion_action
    WHERE conversion_action.name LIKE 'Calls from ads%'
  `);
  const statusMap = { 2: 'ENABLED', 3: 'REMOVED', 4: 'HIDDEN' };
  for (const r of rows) {
    console.log(`  "${r.conversion_action.name}" — ${statusMap[r.conversion_action.status] || r.conversion_action.status}`);
  }
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
