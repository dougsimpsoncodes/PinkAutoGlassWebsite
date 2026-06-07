#!/usr/bin/env node
process.env.DOTENV_CONFIG_QUIET = 'true';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { GoogleAdsApi, enums } = require('google-ads-api');

const customer = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
}).Customer({
  customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/[-\s]/g, ''),
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
});

const PHOENIX_PHONE = '4807127465';
const DENVER_PHONE  = '7209187465';
const COUNTRY = 'US';
const normalize = (p) => (p || '').replace(/\D/g, '');

async function main() {
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/[-\s]/g, '');

  // 1) Find the Phoenix campaign
  console.log('Querying campaigns for Phoenix...');
  const campaigns = await customer.query(`
    SELECT campaign.id, campaign.name, campaign.resource_name
    FROM campaign
    WHERE campaign.status = 'ENABLED'
  `);
  const phoenixCampaigns = campaigns.filter(c =>
    c.campaign.name.toLowerCase().includes('phoenix')
  );
  if (!phoenixCampaigns.length) {
    console.error('No enabled Phoenix campaign found. Aborting.');
    process.exit(1);
  }
  if (phoenixCampaigns.length > 1) {
    console.warn(`Found ${phoenixCampaigns.length} Phoenix campaigns — processing all:`);
  }
  phoenixCampaigns.forEach(c => console.log(`  Phoenix campaign: ${c.campaign.name} — ${c.campaign.resource_name}`));

  // 2) List all call assets
  console.log('\nFetching all CALL assets...');
  const allAssets = await customer.query(`
    SELECT asset.id, asset.resource_name, asset.call_asset.phone_number
    FROM asset
    WHERE asset.type = 'CALL'
  `);
  allAssets.forEach(a =>
    console.log(`  Asset: ${a.asset.resource_name} — ${a.asset.call_asset?.phone_number}`)
  );

  // 3) Find or create the Phoenix (480) call asset
  const phoenixAssetMatch = allAssets.find(a =>
    normalize(a.asset.call_asset?.phone_number) === PHOENIX_PHONE
  );
  let phoenixAssetRN;
  if (phoenixAssetMatch) {
    phoenixAssetRN = phoenixAssetMatch.asset.resource_name;
    console.log(`\nFound existing Phoenix call asset: ${phoenixAssetRN}`);
  } else {
    console.log('\nNo Phoenix (480) call asset found — creating one...');
    const createResult = await customer.mutateResources([{
      entity: 'asset',
      operation: 'create',
      resource: {
        resource_name: `customers/${customerId}/assets/-1`,
        type: enums.AssetType.CALL,
        call_asset: {
          country_code: COUNTRY,
          phone_number: PHOENIX_PHONE,
        },
      },
    }]);
    phoenixAssetRN = createResult.mutate_operation_responses[0].asset_result.resource_name;
    console.log(`Created Phoenix call asset: ${phoenixAssetRN}`);
  }

  // 4) Find Denver call asset resource name (for removal)
  const denverAssetMatch = allAssets.find(a =>
    normalize(a.asset.call_asset?.phone_number) === DENVER_PHONE
  );
  const denverAssetRN = denverAssetMatch?.asset.resource_name ?? null;
  if (denverAssetRN) {
    console.log(`\nDenver call asset: ${denverAssetRN}`);
  } else {
    console.log('\nDenver call asset not found in asset list.');
  }

  // 5) Fetch current campaign-level CALL links for Phoenix campaigns
  console.log('\nFetching current call links on Phoenix campaign(s)...');
  const allLinks = await customer.query(`
    SELECT campaign_asset.resource_name, campaign_asset.campaign,
           campaign_asset.asset, campaign_asset.status
    FROM campaign_asset
    WHERE campaign_asset.field_type = 'CALL'
      AND campaign_asset.status != 'REMOVED'
  `);

  const phoenixResourceNames = new Set(phoenixCampaigns.map(c => c.campaign.resource_name));

  const phoenixLinks = allLinks.filter(l =>
    phoenixResourceNames.has(l.campaign_asset.campaign)
  );
  console.log('Current call links on Phoenix campaign(s):');
  phoenixLinks.forEach(l =>
    console.log(`  ${l.campaign_asset.campaign} — asset: ${l.campaign_asset.asset} — status: ${l.campaign_asset.status}`)
  );

  // Separate: Denver links to remove, Phoenix links already correct
  const denverLinksOnPhoenix = phoenixLinks.filter(l =>
    denverAssetRN && l.campaign_asset.asset === denverAssetRN
  );
  const phoenixAlreadyLinked = phoenixLinks.filter(l =>
    l.campaign_asset.asset === phoenixAssetRN
  );

  const ops = [];

  // Remove Denver links from Phoenix campaigns
  if (denverLinksOnPhoenix.length) {
    console.log(`\nRemoving ${denverLinksOnPhoenix.length} Denver call link(s) from Phoenix campaign(s)...`);
    denverLinksOnPhoenix.forEach(l => {
      ops.push({
        entity: 'campaign_asset',
        operation: 'remove',
        resource: l.campaign_asset.resource_name,
      });
    });
  } else {
    console.log('\nNo Denver call links found on Phoenix campaign(s) — nothing to remove.');
  }

  // Add Phoenix call asset to each Phoenix campaign that doesn't already have it
  const linkedPhoenixCampaigns = new Set(phoenixAlreadyLinked.map(l => l.campaign_asset.campaign));
  const toLink = phoenixCampaigns.filter(c => !linkedPhoenixCampaigns.has(c.campaign.resource_name));
  if (toLink.length) {
    console.log(`Linking Phoenix call asset to ${toLink.length} campaign(s)...`);
    toLink.forEach(c => {
      ops.push({
        entity: 'campaign_asset',
        operation: 'create',
        resource: {
          asset: phoenixAssetRN,
          campaign: c.campaign.resource_name,
          field_type: enums.AssetFieldType.CALL,
        },
      });
    });
  } else {
    console.log('Phoenix call asset already linked to all Phoenix campaigns.');
  }

  if (ops.length === 0) {
    console.log('\nNothing to do — Phoenix campaign already has correct call extension.');
  } else {
    const result = await customer.mutateResources(ops);
    console.log('\nMutation result:');
    result.mutate_operation_responses.forEach((r, i) => {
      const op = ops[i];
      if (op.operation === 'remove') {
        console.log(`  REMOVED: ${op.resource_name}`);
      } else {
        console.log(`  CREATED: ${r.campaign_asset_result?.resource_name}`);
      }
    });
  }

  // 6) Verify — show final state for ALL campaigns
  console.log('\n=== FINAL STATE — all active campaign-level call extensions ===');
  const verify = await customer.query(`
    SELECT campaign_asset.resource_name, campaign_asset.status,
           campaign.name, asset.call_asset.phone_number
    FROM campaign_asset
    WHERE campaign_asset.field_type = 'CALL'
      AND campaign_asset.status != 'REMOVED'
  `);
  verify.forEach(v =>
    console.log(`  ${v.campaign.name} — ${v.asset.call_asset?.phone_number} — ${v.campaign_asset.status}`)
  );

  console.log('\nDone.');
}

main().catch(err => { console.error('Error:', err.message || err); process.exit(1); });
