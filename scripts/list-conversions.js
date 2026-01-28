require('dotenv').config({ path: '.env.local' });

async function listConversions() {
  try {
    console.log('🔍 Checking Google Ads conversion actions...\n');
    const { getGoogleAdsClient } = await import('../src/lib/googleAds.ts');
    const { customer } = getGoogleAdsClient();

    const query = `
      SELECT
        conversion_action.id,
        conversion_action.name,
        conversion_action.type,
        conversion_action.category,
        conversion_action.status,
        conversion_action.phone_call_duration_seconds
      FROM conversion_action
      WHERE conversion_action.status != 'REMOVED'
      ORDER BY conversion_action.name
    `;

    const results = await customer.query(query);
    console.log(`Found ${results.length} conversion actions:\n`);
    console.log('='.repeat(80));

    results.forEach((row, i) => {
      const a = row.conversion_action;
      console.log(`\n${i + 1}. ${a.name}`);
      console.log(`   ID: ${a.id}`);
      console.log(`   Type: ${a.type}`);
      console.log(`   Category: ${a.category}`);
      console.log(`   Status: ${a.status}`);

      if (a.type === 'PHONE_CALL_LEAD' || a.type === 2) {
        console.log('   📞 PHONE CALL CONVERSION');
        if (a.phone_call_duration_seconds) {
          console.log(`   Min duration: ${a.phone_call_duration_seconds} seconds`);
        }
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ VERIFICATION:\n');

    // Check for expected conversions
    const hasPhoneFromAds = results.some(r =>
      r.conversion_action.type === 'PHONE_CALL_LEAD' ||
      r.conversion_action.type === 2 ||
      r.conversion_action.name.toLowerCase().includes('calls from ads')
    );

    const hasPhoneClicks = results.some(r =>
      r.conversion_action.name.toLowerCase().includes('phone number clicks') ||
      r.conversion_action.name.toLowerCase().includes('click to call')
    );

    const hasLeadForm = results.some(r =>
      r.conversion_action.name.toLowerCase().includes('lead') ||
      r.conversion_action.name.toLowerCase().includes('quote')
    );

    console.log(`   Phone Calls from Ads: ${hasPhoneFromAds ? '✅ SET UP' : '❌ MISSING'}`);
    console.log(`   Phone Number Clicks (Website): ${hasPhoneClicks ? '✅ SET UP' : '❌ MISSING'}`);
    console.log(`   Lead Form Submissions: ${hasLeadForm ? '✅ SET UP' : '❌ MISSING'}`);

    console.log('\n📝 Expected conversion labels in code:');
    console.log('   Lead Form: 3CXNCJaG9cEbEJSayehB');
    console.log('   Text Click: zs3xCJyG9cEbEJSayehB');
    console.log('   Call Click: NRHDCJmG9cEbEJSayehB');
    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

listConversions();
