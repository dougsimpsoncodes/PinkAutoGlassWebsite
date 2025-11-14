#!/usr/bin/env node
const { Resend } = require('resend');
require('dotenv').config({ path: '.env.production' });

async function test() {
  const resend = new Resend(process.env.RESEND_API_KEY);

  console.log('Test 1: No parameters');
  const response1 = await resend.emails.list();
  console.log('Result:', response1.error || 'Success - got emails');

  console.log('\nTest 2: With limit: 100');
  const response2 = await resend.emails.list({ limit: 100 });
  console.log('Result:', JSON.stringify(response2.error || 'Success - got emails', null, 2));
}

test().catch(console.error);
