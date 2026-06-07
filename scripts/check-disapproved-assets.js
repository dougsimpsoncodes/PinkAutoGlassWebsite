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
  console.log('=== ASSET POLICY INFO ===\n');

  const rows = await customer.query(`
    SELECT
      asset.id,
      asset.name,
      asset.type,
      asset.image_asset.file_size,
      asset.image_asset.full_size.width_pixels,
      asset.image_asset.full_size.height_pixels,
      asset.policy_summary.approval_status,
      asset.policy_summary.review_status,
      asset.policy_summary.policy_topic_entries
    FROM asset
    WHERE asset.type = 'IMAGE'
  `);

  for (const r of rows) {
    const a = r.asset;
    const ps = a.policy_summary;
    const dims = a.image_asset?.full_size
      ? `${a.image_asset.full_size.width_pixels}x${a.image_asset.full_size.height_pixels}`
      : '?';
    const size = a.image_asset?.file_size
      ? `${Math.round(a.image_asset.file_size / 1024)}KB`
      : '?';

    console.log(`[${ps?.approval_status || '?'}] Asset ${a.id} — ${dims} ${size}`);
    if (ps?.policy_topic_entries?.length) {
      for (const entry of ps.policy_topic_entries) {
        console.log(`  Policy: ${entry.topic || '?'} — ${entry.type || '?'}`);
        if (entry.evidences?.length) {
          for (const ev of entry.evidences) {
            console.log(`    Evidence: ${JSON.stringify(ev).slice(0, 200)}`);
          }
        }
      }
    }
    console.log();
  }
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
