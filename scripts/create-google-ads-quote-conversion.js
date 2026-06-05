/**
 * One-off: create the "Quote priced (web)" Google Ads conversion action.
 *
 * Observation-only by design:
 *   - category REQUEST_QUOTE (15) — isolated from the biddable SUBMIT_LEAD_FORM
 *     (bookings) and CONTACT (call/text) goals, so reporting stays clean and the
 *     July promote-decision is a single clean toggle.
 *   - primary_for_goal=false — secondary actions never feed Smart Bidding,
 *     regardless of campaign goal config. Belt-and-suspenders with the isolated
 *     category.
 *   - $20 default value (~15% quote->book rate x $150). Only matters if the
 *     campaigns ever move to value-based bidding; ignored under MaxConversions.
 *
 * After creating, prints the send_to label to wire into src/lib/analytics.ts.
 * Run: node scripts/create-google-ads-quote-conversion.js
 */
require('dotenv').config({ path: '.env.local' });
const { GoogleAdsApi, enums } = require('google-ads-api');

const CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/[-\s]/g, '');

const customer = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
}).Customer({
  customer_id: CUSTOMER_ID,
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
});

(async () => {
  // Guard against double-create: bail if an action with this name already exists.
  const existing = await customer.query(`
    SELECT conversion_action.id, conversion_action.name
    FROM conversion_action
    WHERE conversion_action.name = 'Quote priced (web)'
      AND conversion_action.status != 'REMOVED'
  `);
  if (existing.length) {
    console.log('⚠️ Already exists — skipping create:',
      existing[0].conversion_action.id, existing[0].conversion_action.name);
  } else {
    console.log('→ Creating "Quote priced (web)" (REQUEST_QUOTE, $20, secondary)...');
    const created = await customer.conversionActions.create([{
      name: 'Quote priced (web)',
      category: enums.ConversionActionCategory.REQUEST_QUOTE,
      type: enums.ConversionActionType.WEBPAGE,
      status: enums.ConversionActionStatus.ENABLED,
      primary_for_goal: false,
      counting_type: enums.ConversionActionCountingType.ONE_PER_CLICK,
      value_settings: { default_value: 20, always_use_default_value: true },
      click_through_lookback_window_days: 30,
      view_through_lookback_window_days: 1,
    }]);
    console.log('  ✅ Created:', created.results?.[0]?.resource_name);
  }

  // Fetch id + tag snippet -> send_to label.
  const rows = await customer.query(`
    SELECT conversion_action.id, conversion_action.name, conversion_action.category,
           conversion_action.primary_for_goal, conversion_action.value_settings.default_value,
           conversion_action.tag_snippets
    FROM conversion_action
    WHERE conversion_action.name = 'Quote priced (web)'
      AND conversion_action.status != 'REMOVED'
  `);
  const a = rows[0]?.conversion_action;
  console.log('\n=== Created action ===');
  console.log('  id:', a?.id, '| category:', a?.category, '| primary_for_goal:', a?.primary_for_goal,
    '| default_value:', a?.value_settings?.default_value);

  let label = null;
  const snippets = a?.tag_snippets || [];
  for (const s of snippets) {
    const tag = s.event_snippet || s.global_site_tag || '';
    const m = tag.match(/send_to['":\s]+['"]AW-[0-9]+\/([^'"]+)['"]/);
    if (m) { label = m[1]; break; }
  }
  console.log('\n=== ACTION REQUIRED — wire into src/lib/analytics.ts ===');
  console.log(`  export const GOOGLE_ADS_QUOTE_LABEL = '${label || 'NOT_FOUND_CHECK_UI'}';`);
})().catch(e => {
  console.error('❌', e.message || e);
  if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
  process.exit(1);
});
