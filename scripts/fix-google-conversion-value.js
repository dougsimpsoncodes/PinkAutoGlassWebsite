/**
 * Fix Google Ads Conversion Action Values
 *
 * Problem: "Calls from ads" (ID 7351179314) has default_value = $1 and counting = EVERY.
 * This means each call counts as a $1 conversion, breaking ROI reporting.
 *
 * Fix: Update default_value to $300 (avg job ticket) and counting to ONE_PER_CLICK.
 *
 * Usage: node scripts/fix-google-conversion-value.js [--dry-run]
 */
require('dotenv').config({ path: '.env.local' });
const { GoogleAdsApi, ResourceNames } = require('google-ads-api');

const DRY_RUN = process.argv.includes('--dry-run');
const CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/[-\s]/g, '');
const LOGIN_CUSTOMER_ID = (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || '').replace(/[-\s]/g, '') || undefined;

// Conversion action fixes:
// - "Calls from ads" (7351179314): $1 → $300, MANY → ONE_PER_CLICK
const FIXES = [
  {
    id: '7351179314',
    name: 'Calls from ads',
    newDefaultValue: 300,
    newCountingType: 2, // ONE_PER_CLICK (enum value 2)
  },
];

async function main() {
  console.log(DRY_RUN ? '=== DRY RUN ===' : '=== LIVE RUN ===');

  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  });

  const customer = client.Customer({
    customer_id: CUSTOMER_ID,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    login_customer_id: LOGIN_CUSTOMER_ID,
  });

  // Verify current state first
  console.log('\nCurrent state:');
  const actions = await customer.query(`
    SELECT conversion_action.id, conversion_action.name,
           conversion_action.value_settings.default_value,
           conversion_action.value_settings.always_use_default_value,
           conversion_action.counting_type
    FROM conversion_action
    WHERE conversion_action.id IN (${FIXES.map(f => f.id).join(',')})
  `);

  for (const r of actions) {
    const a = r.conversion_action;
    console.log(`  ${a.name} (ID ${a.id}): value=$${a.value_settings?.default_value}, counting=${a.counting_type}`);
  }

  if (DRY_RUN) {
    console.log('\nProposed changes:');
    for (const fix of FIXES) {
      console.log(`  ${fix.name}: value → $${fix.newDefaultValue}, counting → ONE_PER_CLICK`);
    }
    console.log('\nRun without --dry-run to apply.');
    return;
  }

  // Apply fixes
  for (const fix of FIXES) {
    console.log(`\nUpdating "${fix.name}" (ID ${fix.id})...`);

    try {
      const resourceName = ResourceNames.conversionAction(CUSTOMER_ID, fix.id);

      await customer.conversionActions.update({
        customer_id: CUSTOMER_ID,
        operations: [{
          update: {
            resource_name: resourceName,
            value_settings: {
              default_value: fix.newDefaultValue,
              always_use_default_value: true,
            },
            counting_type: fix.newCountingType,
          },
          update_mask: {
            paths: [
              'value_settings.default_value',
              'value_settings.always_use_default_value',
              'counting_type',
            ],
          },
        }],
      });

      console.log(`  ✓ Updated: value=$${fix.newDefaultValue}, counting=ONE_PER_CLICK`);
    } catch (e) {
      console.error(`  ✗ Failed: ${e.message}`);

      // Fallback: try mutateResources
      console.log('  Trying mutateResources fallback...');
      try {
        await customer.mutateResources([{
          _resource: 'ConversionAction',
          _operation: 'update',
          resource_name: ResourceNames.conversionAction(CUSTOMER_ID, fix.id),
          value_settings: {
            default_value: fix.newDefaultValue,
            always_use_default_value: true,
          },
          counting_type: fix.newCountingType,
        }]);
        console.log(`  ✓ Updated via mutateResources`);
      } catch (e2) {
        console.error(`  ✗ Fallback also failed: ${e2.message}`);
      }
    }
  }

  // Verify
  console.log('\nVerifying...');
  const after = await customer.query(`
    SELECT conversion_action.id, conversion_action.name,
           conversion_action.value_settings.default_value,
           conversion_action.counting_type
    FROM conversion_action
    WHERE conversion_action.id IN (${FIXES.map(f => f.id).join(',')})
  `);
  for (const r of after) {
    const a = r.conversion_action;
    console.log(`  ${a.name}: value=$${a.value_settings?.default_value}, counting=${a.counting_type}`);
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
