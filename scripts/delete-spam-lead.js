#!/usr/bin/env node

/**
 * Delete spam lead from database
 * Usage: node scripts/delete-spam-lead.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteSpamLead() {
  const spamEmail = 'quote-1772483347998@temp.pin';
  
  console.log(`🔍 Searching for lead with email: ${spamEmail}`);
  
  // Find the lead
  const { data: leads, error: findError } = await supabase
    .from('leads')
    .select('*')
    .eq('email', spamEmail);
  
  if (findError) {
    console.error('❌ Error searching for lead:', findError.message);
    process.exit(1);
  }
  
  if (!leads || leads.length === 0) {
    console.log('✅ No lead found with that email (may have already been deleted or honeypot caught it)');
    process.exit(0);
  }
  
  console.log(`📋 Found ${leads.length} lead(s):`);
  leads.forEach(lead => {
    console.log(`   - ID: ${lead.id}`);
    console.log(`   - Name: ${lead.first_name} ${lead.last_name}`);
    console.log(`   - Phone: ${lead.phone_e164}`);
    console.log(`   - Created: ${lead.created_at}`);
  });
  
  // Delete the lead(s)
  const { error: deleteError } = await supabase
    .from('leads')
    .delete()
    .eq('email', spamEmail);
  
  if (deleteError) {
    console.error('❌ Error deleting lead:', deleteError.message);
    process.exit(1);
  }
  
  console.log(`✅ Successfully deleted ${leads.length} spam lead(s)`);
}

deleteSpamLead();
