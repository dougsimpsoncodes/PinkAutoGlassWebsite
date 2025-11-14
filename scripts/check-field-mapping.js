#!/usr/bin/env node
/**
 * Check if firstName/lastName and phone are being saved correctly
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });

async function checkFields() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Get recent leads
  const { data: leads, error } = await supabase
    .from('leads')
    .select('first_name, last_name, phone_e164, zip, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n📊 Recent 10 Leads:\n');
  console.log('First Name | Last Name | Phone | Zip | Created');
  console.log('-'.repeat(80));

  leads.forEach(lead => {
    console.log(
      `${(lead.first_name || 'NULL').padEnd(15)} | ` +
      `${(lead.last_name || 'NULL').padEnd(15)} | ` +
      `${(lead.phone_e164 || 'NULL').padEnd(15)} | ` +
      `${(lead.zip || 'NULL').padEnd(10)} | ` +
      new Date(lead.created_at).toLocaleString()
    );
  });

  // Count nulls
  const nullLastNames = leads.filter(l => !l.last_name).length;
  const nullPhones = leads.filter(l => !l.phone_e164).length;
  const nullZips = leads.filter(l => !l.zip).length;

  console.log('\n📈 Summary:');
  console.log(`Leads with NULL last_name: ${nullLastNames}/10`);
  console.log(`Leads with NULL phone_e164: ${nullPhones}/10`);
  console.log(`Leads with NULL zip: ${nullZips}/10\n`);
}

checkFields();
