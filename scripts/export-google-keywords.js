require('dotenv').config({ path: '.env.local' });
const { GoogleAdsApi } = require('google-ads-api');

async function exportGoogleKeywords() {
  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  });

  const customer = client.Customer({
    customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/[-\s]/g, ''),
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
  });

  const results = await customer.query(`
    SELECT
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      ad_group_criterion.status
    FROM ad_group_criterion
    WHERE ad_group_criterion.type = 'KEYWORD'
      AND ad_group_criterion.status = 'ENABLED'
      AND campaign.status = 'ENABLED'
      AND ad_group.status = 'ENABLED'
    ORDER BY ad_group_criterion.keyword.text
  `);

  console.log(`Found ${results.length} active Google Ads keywords\n`);

  const matchTypeMap = { EXACT: 'Exact', PHRASE: 'Phrase', BROAD: 'Broad' };

  results.forEach(row => {
    const kw = row.ad_group_criterion.keyword.text;
    const mt = matchTypeMap[row.ad_group_criterion.keyword.match_type] || row.ad_group_criterion.keyword.match_type;
    console.log(`${kw}\t${mt}`);
  });
}

exportGoogleKeywords().catch(console.error);
