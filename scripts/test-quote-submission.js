#!/usr/bin/env node
/**
 * Test Quick Quote submission to verify lastName, phone, and zip are saved
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });

async function testQuoteSubmission() {
  console.log('🧪 Testing Quick Quote submission...\n');

  // Simulate QuoteForm submission
  const quoteData = {
    name: 'Test LastName',
    phone: '720-555-9999',
    zip: '80202',
    vehicle: '2020 Toyota Camry',
    serviceType: 'repair',
    website: '', // honeypot
    formStartTime: Date.now() - 5000, // 5 seconds ago
  };

  console.log('📤 Submitting quote with:', quoteData);

  // Submit to API
  const response = await fetch('http://localhost:3000/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quoteData),
  });

  const result = await response.json();
  console.log('📥 API Response:', result);

  if (!result.success) {
    console.error('❌ Quote submission failed!');
    return;
  }

  const leadId = result.leadId;
  console.log(`\n✅ Quote submitted successfully! Lead ID: ${leadId}`);

  // Wait 2 seconds for DB to process
  console.log('⏳ Waiting 2 seconds for DB to process...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Check database
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: lead, error } = await supabase
    .from('leads')
    .select('first_name, last_name, phone_e164, zip, created_at')
    .eq('id', leadId)
    .single();

  if (error) {
    console.error('❌ Database query failed:', error);
    return;
  }

  console.log('\n📊 Database Record:');
  console.log('  First Name:', lead.first_name);
  console.log('  Last Name:', lead.last_name);
  console.log('  Phone:', lead.phone_e164);
  console.log('  Zip:', lead.zip);

  // Verify
  const issues = [];
  if (lead.first_name !== 'Test') issues.push('❌ First name incorrect');
  if (lead.last_name !== 'LastName') issues.push('❌ Last name missing or incorrect');
  if (!lead.phone_e164 || lead.phone_e164 === 'NULL') issues.push('❌ Phone missing');
  if (!lead.zip || lead.zip === 'NULL') issues.push('❌ Zip missing');

  console.log('\n' + '='.repeat(80));
  if (issues.length === 0) {
    console.log('✅ TEST PASSED! All fields saved correctly.');
  } else {
    console.log('❌ TEST FAILED!');
    issues.forEach(issue => console.log('  ' + issue));
  }
  console.log('='.repeat(80) + '\n');
}

testQuoteSubmission().catch(console.error);
