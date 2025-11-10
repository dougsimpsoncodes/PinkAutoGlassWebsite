#!/usr/bin/env node
/**
 * Clear all leads from the database
 *
 * ⚠️  WARNING: This deletes ALL leads including real customer data!
 * ⚠️  Use clear-test-leads-only.js instead to preserve real customers.
 *
 * To run this script anyway, set environment variable: CONFIRM_DELETE_ALL=yes
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });

async function clearLeadsDatabase() {
  // Safety check
  if (process.env.CONFIRM_DELETE_ALL !== 'yes') {
    console.log('⚠️  WARNING: This script will delete ALL leads including real customer data!\n');
    console.log('💡 To delete ONLY test/smoke/internal leads, use:');
    console.log('   node scripts/clear-test-leads-only.js\n');
    console.log('💡 To proceed with deleting ALL leads anyway, run:');
    console.log('   CONFIRM_DELETE_ALL=yes node scripts/clear-leads-database.js\n');
    process.exit(0);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🗑️  Clearing ALL leads from database...\n');

  // First, count how many leads exist
  const { count, error: countError } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error counting leads:', countError);
    process.exit(1);
  }

  console.log(`📊 Found ${count} leads in database`);

  if (count === 0) {
    console.log('✅ Database is already empty!');
    return;
  }

  // Delete all leads
  const { error: deleteError } = await supabase
    .from('leads')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using a condition that matches everything)

  if (deleteError) {
    console.error('❌ Error deleting leads:', deleteError);
    process.exit(1);
  }

  // Verify deletion
  const { count: remainingCount, error: verifyError } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true });

  if (verifyError) {
    console.error('❌ Error verifying deletion:', verifyError);
    process.exit(1);
  }

  console.log(`\n✅ Successfully deleted ${count} leads!`);
  console.log(`📊 Remaining leads: ${remainingCount}`);

  if (remainingCount === 0) {
    console.log('\n🎉 Database is now completely clear!\n');
  } else {
    console.log(`\n⚠️  Warning: ${remainingCount} leads remain in database\n`);
  }
}

clearLeadsDatabase().catch(console.error);
