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

const PHONE = '7209187465';
const COUNTRY = 'US';

async function main() {
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/[-\s]/g, '');

  // 1) Find enabled campaigns
  console.log('Querying enabled campaigns...');
  const campaigns = await customer.query(`
    SELECT campaign.id, campaign.name, campaign.resource_name
    FROM campaign
    WHERE campaign.status = 'ENABLED'
  `);
  if (!campaigns.length) {
    console.error('No enabled campaigns found.');
    process.exit(1);
  }
  console.log(`Found ${campaigns.length} enabled campaign(s):`);
  campaigns.forEach(c => console.log(`  ${c.campaign.name} — ${c.campaign.resource_name}`));

  // 2) Check for existing call asset with this phone number
  console.log('\nChecking for existing call assets...');
  const existingAssets = await customer.query(`
    SELECT asset.id, asset.resource_name, asset.call_asset.phone_number
    FROM asset
    WHERE asset.type = 'CALL'
  `);

  // Normalize phone numbers for comparison (strip non-digits)
  const normalize = (p) => (p || '').replace(/\D/g, '');
  const match = existingAssets.find(a => normalize(a.asset.call_asset?.phone_number) === normalize(PHONE));

  let assetResourceName;
  if (match) {
    assetResourceName = match.asset.resource_name;
    console.log(`Reusing existing call asset: ${assetResourceName} (${match.asset.call_asset.phone_number})`);
  } else {
    // Create new call asset
    console.log('Creating new call asset...');
    const createResult = await customer.mutateResources([
      {
        entity: 'asset',
        operation: 'create',
        resource: {
          resource_name: `customers/${customerId}/assets/-1`,
          type: enums.AssetType.CALL,
          call_asset: {
            country_code: COUNTRY,
            phone_number: PHONE,
          },
        },
      },
    ]);
    assetResourceName = createResult.mutate_operation_responses[0].asset_result.resource_name;
    console.log(`Created call asset: ${assetResourceName}`);
  }

  // 3) Check which campaigns already have this call asset linked
  console.log('\nChecking existing campaign-level call links...');
  const existingLinks = await customer.query(`
    SELECT campaign_asset.campaign, campaign_asset.asset, campaign_asset.status
    FROM campaign_asset
    WHERE campaign_asset.field_type = 'CALL'
      AND campaign_asset.status != 'REMOVED'
  `);
  const linkedCampaigns = new Set(existingLinks
    .filter(l => l.campaign_asset.asset === assetResourceName)
    .map(l => l.campaign_asset.campaign));

  // 4) Link the call asset to each enabled campaign that doesn't already have it
  const toLink = campaigns.filter(c => !linkedCampaigns.has(c.campaign.resource_name));
  if (!toLink.length) {
    console.log('All enabled campaigns already have this call asset linked. Nothing to do.');
    return;
  }

  console.log(`\nLinking call asset to ${toLink.length} campaign(s)...`);
  const linkOps = toLink.map(c => ({
    entity: 'campaign_asset',
    operation: 'create',
    resource: {
      asset: assetResourceName,
      campaign: c.campaign.resource_name,
      field_type: enums.AssetFieldType.CALL,
    },
  }));

  const linkResult = await customer.mutateResources(linkOps);
  linkResult.mutate_operation_responses.forEach((r, i) => {
    console.log(`  Linked to ${toLink[i].campaign.name}: ${r.campaign_asset_result.resource_name}`);
  });

  // 5) Verify
  console.log('\nVerifying...');
  const verify = await customer.query(`
    SELECT campaign_asset.resource_name, campaign_asset.status, campaign.name,
           asset.call_asset.phone_number
    FROM campaign_asset
    WHERE campaign_asset.field_type = 'CALL'
      AND campaign_asset.status != 'REMOVED'
  `);
  console.log('Active campaign-level call extensions:');
  verify.forEach(v => {
    console.log(`  ${v.campaign.name} — ${v.asset.call_asset?.phone_number} — status: ${v.campaign_asset.status}`);
  });

  console.log('\nDone.');
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
