#!/usr/bin/env node
// View/add campaign-level negative keywords in Google Ads.
// Usage: node scripts/manage-negative-keyword.js find <text-fragment>
//        node scripts/manage-negative-keyword.js add <campaignId> <matchType:PHRASE|EXACT|BROAD> <keyword text...>
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { GoogleAdsApi } = require('google-ads-api');

const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
});
const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/[-\s]/g, '');
const customer = client.Customer({
  customer_id: customerId,
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
});

async function main() {
  const [, , cmd, ...args] = process.argv;

  if (cmd === 'find') {
    const frag = args.join(' ');
    const rows = await customer.query(`
      SELECT campaign.name, campaign_criterion.keyword.text, campaign_criterion.keyword.match_type
      FROM campaign_criterion
      WHERE campaign_criterion.negative = TRUE AND campaign_criterion.type = 'KEYWORD'
    `);
    for (const r of rows) {
      const kw = r.campaign_criterion.keyword;
      if (!frag || kw.text.includes(frag)) {
        console.log(`${r.campaign.name} | "${kw.text}" | match_type=${kw.match_type}`);
      }
    }
    return;
  }

  if (cmd === 'add') {
    const [campaignId, matchType, ...textParts] = args;
    const text = textParts.join(' ');
    if (!campaignId || !matchType || !text) {
      console.error('Usage: add <campaignId> <PHRASE|EXACT|BROAD> <keyword text>');
      process.exit(1);
    }
    const result = await customer.mutateResources([
      {
        entity: 'campaign_criterion',
        operation: 'create',
        resource: {
          campaign: `customers/${customerId}/campaigns/${campaignId}`,
          negative: true,
          keyword: { text, match_type: matchType },
        },
      },
    ]);
    console.log(`Added negative "${text}" (${matchType}) to campaign ${campaignId}`);
    console.log(JSON.stringify(result.mutate_operation_responses?.[0] ?? result, null, 1).slice(0, 300));
    return;
  }

  console.error('Unknown command. Use: find <fragment> | add <campaignId> <matchType> <text>');
  process.exit(1);
}

main().catch((err) => {
  console.error('Error:', err.message || '(no message)');
  if (err.errors) console.error(JSON.stringify(err.errors, null, 2).slice(0, 1000));
  process.exit(1);
});
