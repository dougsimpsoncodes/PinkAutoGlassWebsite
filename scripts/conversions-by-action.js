#!/usr/bin/env node
// Segments Google Ads conversions by conversion action for a date range.
// Usage: node scripts/conversions-by-action.js [start] [end]
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { GoogleAdsApi } = require('google-ads-api');

const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
});
const customer = client.Customer({
  customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/[-\s]/g, ''),
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
});

async function main() {
  const start = process.argv[2] || '2026-06-03';
  const end = process.argv[3] || '2026-06-10';
  const rows = await customer.query(`
    SELECT segments.conversion_action_name, campaign.name, metrics.conversions, metrics.all_conversions
    FROM campaign
    WHERE segments.date BETWEEN '${start}' AND '${end}'
      AND metrics.all_conversions > 0
  `);
  const agg = {};
  for (const r of rows) {
    const k = `${r.campaign.name} | ${r.segments.conversion_action_name}`;
    agg[k] = agg[k] || { conv: 0, all: 0 };
    agg[k].conv += r.metrics.conversions;
    agg[k].all += r.metrics.all_conversions;
  }
  console.log(`Range ${start}..${end}`);
  console.log('campaign | action | conversions(biddable) | all_conversions');
  for (const [k, v] of Object.entries(agg).sort((a, b) => b[1].all - a[1].all)) {
    console.log(`${k} | ${v.conv.toFixed(1)} | ${v.all.toFixed(1)}`);
  }
}

main().catch((err) => { console.error('Error:', err.message); process.exit(1); });
