#!/usr/bin/env node
/**
 * Apply the fn_insert_lead fix migration
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.production' });

async function applyMigration() {
  console.log('📋 Reading migration file...');
  const sql = fs.readFileSync('supabase/migrations/20251110_fix_fn_insert_lead_lastname.sql', 'utf8');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔧 Applying migration to fix fn_insert_lead...\n');

  const { data, error } = await supabase.rpc('exec_sql', {
    query: sql
  });

  if (error) {
    // exec_sql might not exist, try direct execution
    console.log('ℹ️  exec_sql not available, using direct SQL execution...\n');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const statement of statements) {
      if (!statement) continue;

      console.log(`Executing: ${statement.substring(0, 60)}...`);

      const { error: stmtError } = await supabase.rpc('exec', {
        sql: statement
      });

      if (stmtError) {
        console.error(`❌ Error:`, stmtError);
        console.log('\n⚠️  Migration may need to be applied manually via Supabase Dashboard > SQL Editor');
        console.log('\nSQL to run:');
        console.log(sql);
        process.exit(1);
      }
    }
  } else {
    console.log('✅ Migration applied successfully!');
  }

  // Test the fix
  console.log('\n🧪 Testing the fix...\n');

  const testId = '00000000-0000-0000-0000-000000000002';
  const testPayload = {
    firstName: 'FixTest',
    lastName: 'AfterMigration',
    email: 'fixtest@test.com',
    phoneE164: '+17205552222',
    zip: '80203',
    vehicleYear: 2021,
    vehicleMake: 'Honda',
    vehicleModel: 'Accord',
    serviceType: 'repair'
  };

  const { data: insertResult, error: insertError } = await supabase.rpc('fn_insert_lead', {
    p_id: testId,
    p_payload: testPayload
  });

  if (insertError) {
    console.error('❌ Test insert failed:', insertError);
    process.exit(1);
  }

  // Check result
  await new Promise(resolve => setTimeout(resolve, 1000));

  const { data: lead, error: queryError } = await supabase
    .from('leads')
    .select('first_name, last_name, phone_e164, zip')
    .eq('id', testId)
    .single();

  if (queryError) {
    console.error('❌ Test query failed:', queryError);
    process.exit(1);
  }

  console.log('Test Result:');
  console.log('  first_name:', lead.first_name);
  console.log('  last_name:', lead.last_name);
  console.log('  phone_e164:', lead.phone_e164);
  console.log('  zip:', lead.zip);

  if (lead.last_name === 'AfterMigration') {
    console.log('\n✅ SUCCESS! Migration fixed the lastName issue!');
  } else {
    console.log('\n❌ Migration did not fix the issue. lastName is still:', lead.last_name);
    console.log('\n⚠️  Please apply the migration manually via Supabase Dashboard.');
  }
}

applyMigration().catch(console.error);
