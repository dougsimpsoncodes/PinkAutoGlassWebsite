#!/usr/bin/env node
/**
 * Test Resend API connection
 */

const { Resend } = require('resend');
require('dotenv').config({ path: '.env.production' });

async function testResendAPI() {
  console.log('Testing Resend API connection...\n');

  const apiKey = process.env.RESEND_API_KEY;
  console.log('API Key found:', apiKey ? `Yes (${apiKey.substring(0, 8)}...)` : 'No');

  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found in environment');
    process.exit(1);
  }

  const resend = new Resend(apiKey);

  try {
    console.log('\nFetching emails from Resend...\n');
    const response = await resend.emails.list();

    console.log('✅ API Response:', JSON.stringify(response, null, 2));

    if (response.data && response.data.data) {
      console.log(`\n✅ Found ${response.data.data.length} emails`);

      if (response.data.data.length > 0) {
        console.log('\nFirst 3 emails:');
        response.data.data.slice(0, 3).forEach((email, i) => {
          console.log(`\n${i + 1}. ID: ${email.id}`);
          console.log(`   To: ${JSON.stringify(email.to)}`);
          console.log(`   Subject: ${email.subject}`);
          console.log(`   Created: ${email.created_at}`);
        });
      }
    } else {
      console.log('\n⚠️  No emails found or unexpected response format');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testResendAPI();
