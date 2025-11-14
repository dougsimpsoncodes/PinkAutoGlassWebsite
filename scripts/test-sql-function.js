#!/usr/bin/env node
/**
 * Test the fn_insert_lead SQL function directly
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });

async function testSQLFunction() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const testId = '00000000-0000-0000-0000-000000000001';
  const testPayload = {
    firstName: 'SQLTest',
    lastName: 'DirectCall',
    email: 'sqltest@test.com',
    phoneE164: '+17205551111',
    zip: '80202',
    vehicleYear: 2020,
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry',
    serviceType: 'repair'
  };

  console.log('📤 Calling fn_insert_lead directly with:');
  console.log(JSON.stringify(testPayload, null, 2));

  const { data, error } = await supabase.rpc('fn_insert_lead', {
    p_id: testId,
    p_payload: testPayload
  });

  if (error) {
    console.error('❌ Error calling function:', error);
    return;
  }

  console.log('✅ Function returned:', data);

  // Check what was actually saved
  await new Promise(resolve => setTimeout(resolve, 1000));

  const { data: lead, error: queryError } = await supabase
    .from('leads')
    .select('first_name, last_name, phone_e164, zip')
    .eq('id', testId)
    .single();

  if (queryError) {
    console.error('❌ Query error:', queryError);
    return;
  }

  console.log('\n📊 What was saved in database:');
  console.log('  first_name:', lead.first_name);
  console.log('  last_name:', lead.last_name);
  console.log('  phone_e164:', lead.phone_e164);
  console.log('  zip:', lead.zip);

  if (lead.last_name === 'DirectCall') {
    console.log('\n✅ SUCCESS! lastName was saved correctly!');
  } else {
    console.log('\n❌ FAIL! lastName is:', lead.last_name);
  }
}

testSQLFunction().catch(console.error);
