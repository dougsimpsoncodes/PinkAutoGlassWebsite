/**
 * List all conversion actions in Google Ads account
 * Run: node scripts/list-google-ads-conversions.js
 */

require('dotenv').config({ path: '.env.local' });

const { GoogleAdsApi } = require('google-ads-api');

// Initialize Google Ads client
function getGoogleAdsClient() {
  const GOOGLE_ADS_CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/[-\s]/g, '');

  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  });

  const customer = client.Customer({
    customer_id: GOOGLE_ADS_CUSTOMER_ID,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
  });

  return { client, customer };
}

async function listConversionActions() {
  const { customer } = getGoogleAdsClient();

  const query = `
    SELECT
      conversion_action.id,
      conversion_action.name,
      conversion_action.type,
      conversion_action.status,
      conversion_action.category
    FROM conversion_action
    WHERE conversion_action.status != 'REMOVED'
    ORDER BY conversion_action.name
  `;

  const results = await customer.query(query);

  return results.map((row) => ({
    id: row.conversion_action.id?.toString() || '',
    name: row.conversion_action.name || '',
    type: row.conversion_action.type || '',
    status: row.conversion_action.status || '',
    category: row.conversion_action.category || '',
  }));
}

async function main() {
  console.log('===========================================');
  console.log('Google Ads Conversion Actions');
  console.log('===========================================\n');

  try {
    const actions = await listConversionActions();

    if (actions.length === 0) {
      console.log('No conversion actions found.');
      console.log('\nYou need to create a conversion action in Google Ads:');
      console.log('1. Go to Google Ads → Tools & Settings → Measurement → Conversions');
      console.log('2. Click "+ New conversion action"');
      console.log('3. Select "Import" → "Other data sources or CRMs"');
      console.log('4. Choose "Track conversions from clicks"');
      console.log('5. Name it "Phone Call (RingCentral)" or similar');
      console.log('6. Set value to $150 (or your preferred value)');
      return;
    }

    console.log(`Found ${actions.length} conversion actions:\n`);

    // Group by type for easier reading
    const byType = {};
    for (const action of actions) {
      if (!byType[action.type]) {
        byType[action.type] = [];
      }
      byType[action.type].push(action);
    }

    for (const [type, typeActions] of Object.entries(byType)) {
      console.log(`\n📊 ${type}:`);
      console.log('─'.repeat(60));
      for (const action of typeActions) {
        console.log(`  ID: ${action.id}`);
        console.log(`  Name: ${action.name}`);
        console.log(`  Status: ${action.status}`);
        console.log(`  Category: ${action.category}`);
        console.log('');
      }
    }

    console.log('\n===========================================');
    console.log('To use a conversion action for offline uploads:');
    console.log('===========================================');
    console.log('\nAdd to .env.local:');
    console.log('GOOGLE_ADS_OFFLINE_CONVERSION_ACTION_ID=<ID from above>');
    console.log('\nRecommended: Create a new "Phone Call (RingCentral)" action');
    console.log('with type "Import" for offline conversion uploads.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
