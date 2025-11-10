#!/usr/bin/env node
/**
 * Clear ONLY test/smoke/internal leads from the database
 * Preserves real customer leads
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });

async function clearTestLeadsOnly() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔍 Identifying test/smoke/internal leads...\n');

  // Get all leads
  const { data: allLeads, error: fetchError } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.error('❌ Error fetching leads:', fetchError);
    process.exit(1);
  }

  console.log(`📊 Total leads in database: ${allLeads.length}`);

  // Internal admin emails
  const adminEmailsStr = process.env.ADMIN_EMAIL || 'doug@pinkautoglass.com,kody@pinkautoglass.com,dan@pinkautoglass.com';
  const adminEmails = adminEmailsStr.split(',').map(e => e.trim().toLowerCase());

  // Filter test/smoke/internal leads
  const testLeads = allLeads.filter(lead => {
    if (!lead.email) return true; // No email = likely test data

    const email = lead.email.toLowerCase();
    const firstName = (lead.first_name || '').toLowerCase();
    const lastName = (lead.last_name || '').toLowerCase();

    // Check if it's a test lead
    const isTest =
      email.includes('test') ||
      email.includes('example.com') ||
      email.includes('temp.pinkautoglass.com') || // Temporary emails from quote form
      firstName.includes('test') ||
      firstName.includes('smoke') ||
      firstName.includes('e2e') ||
      lastName.includes('test') ||
      lastName.includes('smoke') ||
      lastName.includes('e2e') ||
      adminEmails.some(admin => email === admin); // Internal admin emails

    return isTest;
  });

  const realLeads = allLeads.filter(lead => {
    if (!lead.email) return false;

    const email = lead.email.toLowerCase();
    const firstName = (lead.first_name || '').toLowerCase();
    const lastName = (lead.last_name || '').toLowerCase();

    const isReal =
      !email.includes('test') &&
      !email.includes('example.com') &&
      !email.includes('temp.pinkautoglass.com') &&
      !firstName.includes('test') &&
      !firstName.includes('smoke') &&
      !firstName.includes('e2e') &&
      !lastName.includes('test') &&
      !lastName.includes('smoke') &&
      !lastName.includes('e2e') &&
      !adminEmails.some(admin => email === admin);

    return isReal;
  });

  console.log(`\n📋 Breakdown:`);
  console.log(`  • Test/Internal leads: ${testLeads.length}`);
  console.log(`  • Real customer leads: ${realLeads.length}`);

  if (testLeads.length === 0) {
    console.log('\n✅ No test leads to delete!');
    return;
  }

  console.log(`\n🗑️  Test leads to be deleted:\n`);
  testLeads.slice(0, 10).forEach((lead, i) => {
    console.log(`${i + 1}. ${lead.first_name} ${lead.last_name} (${lead.email}) - ${new Date(lead.created_at).toLocaleDateString()}`);
  });
  if (testLeads.length > 10) {
    console.log(`   ... and ${testLeads.length - 10} more`);
  }

  if (realLeads.length > 0) {
    console.log(`\n✅ Real leads that will be PRESERVED:\n`);
    realLeads.slice(0, 10).forEach((lead, i) => {
      console.log(`${i + 1}. ${lead.first_name} ${lead.last_name} (${lead.email}) - ${new Date(lead.created_at).toLocaleDateString()}`);
    });
    if (realLeads.length > 10) {
      console.log(`   ... and ${realLeads.length - 10} more`);
    }
  }

  // Delete test leads by ID
  const testLeadIds = testLeads.map(l => l.id);

  console.log(`\n🗑️  Deleting ${testLeadIds.length} test leads...`);

  const { error: deleteError } = await supabase
    .from('leads')
    .delete()
    .in('id', testLeadIds);

  if (deleteError) {
    console.error('❌ Error deleting test leads:', deleteError);
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

  console.log(`\n✅ Successfully deleted ${testLeadIds.length} test leads!`);
  console.log(`📊 Remaining leads (all real customers): ${remainingCount}`);
  console.log('\n🎉 Database cleaned - only real customer leads remain!\n');
}

clearTestLeadsOnly().catch(console.error);
