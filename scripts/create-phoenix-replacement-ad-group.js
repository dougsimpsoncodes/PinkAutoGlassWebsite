/**
 * Creates Phoenix - Replacement ad group in the Phoenix campaign,
 * migrates the 20 replacement keywords from Phoenix Keywords into it,
 * then pauses the old Phoenix Keywords ad group.
 *
 * Mirrors the Denver - Replacement setup from create-intent-ad-groups.js.
 * Landing page: /arizona/services/windshield-replacement
 */

require('dotenv').config({ path: '.env.vercel.full' });

const { GoogleAdsApi, enums } = require('google-ads-api');

const PHOENIX_CAMPAIGN_ID = '23805458143';
const PHOENIX_KEYWORDS_AD_GROUP_ID = ''; // fetched dynamically
const LANDING_PAGE = 'https://pinkautoglass.com/arizona/services/windshield-replacement';

const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
});

const customer = client.Customer({
  customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
});

async function run() {
  console.log('\n=== Phoenix - Replacement Ad Group Setup ===\n');

  // Step 1: Get Phoenix Keywords ad group ID
  const agRows = await customer.query(`
    SELECT ad_group.id, ad_group.name, ad_group.status
    FROM ad_group
    WHERE ad_group.name = 'Phoenix Keywords'
    AND campaign.id = ${PHOENIX_CAMPAIGN_ID}
  `);
  if (!agRows.length) throw new Error('Phoenix Keywords ad group not found');
  const phoenixKeywordsId = agRows[0].ad_group.id;
  console.log(`Phoenix Keywords ad group ID: ${phoenixKeywordsId}`);

  // Step 2: Get all keywords from Phoenix Keywords
  const kwRows = await customer.query(`
    SELECT
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      ad_group_criterion.status
    FROM ad_group_criterion
    WHERE ad_group.id = ${phoenixKeywordsId}
    AND ad_group_criterion.type = 'KEYWORD'
    AND ad_group_criterion.status != 'REMOVED'
  `);
  console.log(`Found ${kwRows.length} keywords to migrate.`);

  // Step 3: Create Phoenix - Replacement ad group
  console.log('\n→ Creating Phoenix - Replacement ad group...');
  const newAdGroupResults = await customer.adGroups.create([{
    campaign: `customers/${process.env.GOOGLE_ADS_CUSTOMER_ID}/campaigns/${PHOENIX_CAMPAIGN_ID}`,
    name: 'Phoenix - Replacement',
    status: enums.AdGroupStatus.ENABLED,
    type: enums.AdGroupType.SEARCH_STANDARD,
    cpc_bid_micros: 10000,
  }]);
  const newAdGroup = Array.isArray(newAdGroupResults)
    ? newAdGroupResults[0]
    : newAdGroupResults?.results?.[0]?.adGroup?.resourceName || newAdGroupResults?.results?.[0]?.resource_name;
  console.log('Raw result:', JSON.stringify(newAdGroupResults).slice(0, 200));
  const newAdGroupId = String(newAdGroup).split('/').pop();
  console.log(`✅ Created ad group ID: ${newAdGroupId}`);

  // Step 4: Add keywords to new ad group
  console.log('\n→ Adding keywords to Phoenix - Replacement...');
  const keywordsToCreate = kwRows.map(r => ({
    ad_group: `customers/${process.env.GOOGLE_ADS_CUSTOMER_ID}/adGroups/${newAdGroupId}`,
    status: enums.AdGroupCriterionStatus.ENABLED,
    keyword: {
      text: r.ad_group_criterion.keyword.text,
      match_type: r.ad_group_criterion.keyword.match_type,
    },
    final_urls: [LANDING_PAGE],
  }));

  // Batch in chunks of 10
  for (let i = 0; i < keywordsToCreate.length; i += 10) {
    const chunk = keywordsToCreate.slice(i, i + 10);
    await customer.adGroupCriteria.create(chunk);
    console.log(`  Added keywords ${i + 1}–${Math.min(i + 10, keywordsToCreate.length)}`);
  }
  console.log(`✅ All ${keywordsToCreate.length} keywords added.`);

  // Step 5: Pause Phoenix Keywords ad group
  console.log('\n→ Pausing Phoenix Keywords ad group...');
  await customer.adGroups.update([{
    resource_name: `customers/${process.env.GOOGLE_ADS_CUSTOMER_ID}/adGroups/${phoenixKeywordsId}`,
    status: enums.AdGroupStatus.PAUSED,
  }]);
  console.log('✅ Phoenix Keywords paused.');

  console.log('\n=== Done ===');
  console.log(`New ad group: Phoenix - Replacement (${newAdGroupId})`);
  console.log(`Landing page: ${LANDING_PAGE}`);
  console.log(`Old ad group: Phoenix Keywords (${phoenixKeywordsId}) → PAUSED`);
}

run().catch(e => {
  console.error('❌ Fatal:', e.message);
  process.exit(1);
});
