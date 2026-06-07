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
    SELECT
      campaign.name,
      ad_group.name,
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      ad_group_criterion.status
    FROM keyword_view
    WHERE campaign.status = 'ENABLED'
      AND ad_group.status = 'ENABLED'
    ORDER BY campaign.name, ad_group.name, ad_group_criterion.keyword.text
  `);

  // Organize by campaign → ad group
  const tree = {};
  for (const r of rows) {
    const camp = r.campaign.name;
    const ag = r.ad_group.name;
    const kw = r.ad_group_criterion?.keyword;
    if (!kw) continue;

    if (!tree[camp]) tree[camp] = {};
    if (!tree[camp][ag]) tree[camp][ag] = [];
    tree[camp][ag].push({
      text: kw.text,
      matchType: kw.match_type,
      status: r.ad_group_criterion.status,
    });
  }

  // match_type and status may be numeric enums — normalize to string
  const MATCH = { 2: 'BROAD', 3: 'PHRASE', 4: 'EXACT', BROAD: 'BROAD', PHRASE: 'PHRASE', EXACT: 'EXACT' };
  const STATUS = { 2: 'ENABLED', 3: 'PAUSED', 4: 'REMOVED', ENABLED: 'ENABLED', PAUSED: 'PAUSED', REMOVED: 'REMOVED' };

  let totalKws = 0;
  for (const [camp, adGroups] of Object.entries(tree)) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`CAMPAIGN: ${camp}`);
    console.log('='.repeat(70));
    for (const [ag, kws] of Object.entries(adGroups)) {
      console.log(`\n  AD GROUP: ${ag} (${kws.length} keywords)`);
      for (const kw of kws) {
        const mt = (MATCH[kw.matchType] || String(kw.matchType)).padEnd(6);
        const st = (STATUS[kw.status] || String(kw.status)).padEnd(8);
        console.log(`    [${mt}] [${st}] ${kw.text}`);
      }
      totalKws += kws.length;
    }
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`TOTAL: ${totalKws} keywords across ${Object.keys(tree).length} campaigns`);
  if (totalKws === 0) {
    console.log('No active keywords found.');
  }
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
