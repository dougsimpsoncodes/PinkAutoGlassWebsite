/**
 * One-time script: tier Google Ads conversion values.
 *
 * What it does:
 *   1. Updates "Submit lead form" default value $91 → $150 (Booking)
 *   2. Creates "Callback (text-me-price)" secondary action at $75
 *
 * Run: node scripts/mutate-google-ads-conversions.js
 * Uses .env.vercel.full (has the full cred set including refresh token).
 */

require('dotenv').config({ path: '.env.vercel.full' });

const { GoogleAdsApi, enums } = require('google-ads-api');

const CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/[-\s]/g, '');
const LEAD_FORM_ACTION_ID = '7385989910'; // existing "Submit lead form"

function getClient() {
  return new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  }).Customer({
    customer_id: CUSTOMER_ID,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
  });
}

async function listConversions(customer) {
  const rows = await customer.query(`
    SELECT
      conversion_action.id,
      conversion_action.name,
      conversion_action.value_settings.default_value,
      conversion_action.primary_for_goal,
      conversion_action.status
    FROM conversion_action
    WHERE conversion_action.status != 'REMOVED'
    ORDER BY conversion_action.name
  `);
  return rows.map(r => ({
    id: r.conversion_action.id?.toString(),
    name: r.conversion_action.name,
    defaultValue: r.conversion_action.value_settings?.default_value,
    primary: r.conversion_action.primary_for_goal,
    status: r.conversion_action.status,
  }));
}

async function main() {
  const customer = getClient();

  console.log('\n=== Current conversion actions ===');
  const before = await listConversions(customer);
  before.forEach(a => console.log(`  [${a.id}] ${a.name} | $${a.defaultValue} | primary=${a.primary} | ${a.status}`));

  // ── Step 1: Update "Submit lead form" → $150 ──────────────────────────────
  console.log(`\n→ Updating action ${LEAD_FORM_ACTION_ID} ("Submit lead form") default value to $150...`);
  await customer.conversionActions.update([{
    resource_name: `customers/${CUSTOMER_ID}/conversionActions/${LEAD_FORM_ACTION_ID}`,
    value_settings: { default_value: 150, always_use_default_value: false },
  }], { update_mask: { paths: ['value_settings.default_value', 'value_settings.always_use_default_value'] } });
  console.log('  ✅ Updated');

  // ── Step 2: Create "Callback (text-me-price)" secondary at $75 ───────────
  console.log('\n→ Creating "Callback (text-me-price)" secondary action at $75...');
  const created = await customer.conversionActions.create([{
    name: 'Callback (text-me-price)',
    category: enums.ConversionActionCategory.SUBMIT_LEAD_FORM,
    type: enums.ConversionActionType.WEBPAGE,
    status: enums.ConversionActionStatus.ENABLED,
    primary_for_goal: false,
    counting_type: enums.ConversionActionCountingType.ONE_PER_CLICK,
    value_settings: { default_value: 75, always_use_default_value: false },
    click_through_lookback_window_days: 30,
    view_through_lookback_window_days: 1,
  }]);

  const newAction = created.results?.[0];
  const newId = newAction?.resource_name?.split('/').pop();
  console.log(`  ✅ Created — resource: ${newAction?.resource_name}`);
  console.log(`  Action ID: ${newId}`);

  // ── Fetch the tag label for the new action ────────────────────────────────
  console.log('\n→ Fetching tag snippet for the new action...');
  const tagRows = await customer.query(`
    SELECT
      conversion_action.id,
      conversion_action.name,
      conversion_action.tag_snippets
    FROM conversion_action
    WHERE conversion_action.resource_name = '${newAction?.resource_name}'
  `);

  const snippets = tagRows[0]?.conversion_action?.tag_snippets;
  let sendToLabel = null;
  if (snippets && snippets.length > 0) {
    // The global site tag snippet contains the send_to label
    const globalTag = snippets.find(s => s.type === 'GLOBAL_SITE_TAG') || snippets[0];
    const match = globalTag?.global_site_tag?.match(/send_to['":\s]+['"](AW-[^/'"]+\/([^'"]+))['"]/);
    if (match) {
      sendToLabel = match[2];
      console.log(`  ✅ send_to label: ${sendToLabel}`);
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n=== After mutation ===');
  const after = await listConversions(customer);
  after.forEach(a => console.log(`  [${a.id}] ${a.name} | $${a.defaultValue} | primary=${a.primary} | ${a.status}`));

  console.log('\n=== ACTION REQUIRED ===');
  console.log(`In src/lib/analytics.ts, replace GOOGLE_ADS_CALLBACK_LABEL placeholder with:`);
  console.log(`  export const GOOGLE_ADS_CALLBACK_LABEL = '${sendToLabel || 'FETCH_MANUALLY_FROM_GOOGLE_ADS_UI'}';`);
}

main().catch(err => {
  console.error('❌', err.message || err);
  process.exit(1);
});
