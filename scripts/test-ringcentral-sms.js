#!/usr/bin/env node

/**
 * Test RingCentral SMS Integration
 *
 * This script tests sending SMS via RingCentral to verify configuration
 */

const fs = require('fs');
const path = require('path');
const { SDK } = require('@ringcentral/sdk');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

async function testSMS() {
  console.log('\n🧪 Testing RingCentral SMS Integration...\n');

  try {
    const clientId = process.env.RINGCENTRAL_CLIENT_ID;
    const clientSecret = process.env.RINGCENTRAL_CLIENT_SECRET;
    const jwtToken = process.env.RINGCENTRAL_JWT_TOKEN;
    const fromNumber = process.env.RINGCENTRAL_PHONE_NUMBER;
    const toNumber = process.env.ADMIN_PHONE;
    const serverUrl = process.env.RINGCENTRAL_SERVER_URL || 'https://platform.ringcentral.com';

    console.log('📋 Configuration:');
    console.log(`   Client ID: ${clientId}`);
    console.log(`   From Number: ${fromNumber}`);
    console.log(`   To Number: ${toNumber}`);
    console.log(`   Server: ${serverUrl}`);
    console.log('');

    if (!clientId || !clientSecret || !jwtToken || !fromNumber || !toNumber) {
      throw new Error('Missing required RingCentral configuration. Check .env.local file.');
    }

    // Initialize RingCentral SDK
    console.log('🔐 Authenticating with RingCentral...');
    const rcClient = new SDK({
      server: serverUrl,
      clientId: clientId,
      clientSecret: clientSecret,
    });

    // Authenticate using JWT (using platform().login() as recommended)
    await rcClient.platform().login({ jwt: jwtToken });
    console.log('✅ Authentication successful!\n');

    // Test message
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'America/Denver',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const testMessage = `🧪 Pink Auto Glass - RingCentral SMS Test

This is a test message from your lead notification system.

Timestamp: ${timestamp} MT`;

    console.log('📤 Sending test SMS...\n');
    console.log(`Message:\n${testMessage}\n`);

    // Send SMS using RingCentral API
    const platform = rcClient.platform();
    const response = await platform.post('/restapi/v1.0/account/~/extension/~/sms', {
      from: { phoneNumber: fromNumber },
      to: [{ phoneNumber: toNumber }],
      text: testMessage,
    });

    const result = await response.json();

    console.log('✅ SUCCESS! SMS sent via RingCentral');
    console.log(`   Message ID: ${result.id}`);
    console.log(`   Status: ${result.messageStatus}`);
    console.log(`   Direction: ${result.direction}`);
    console.log('');
    console.log('📱 Check your phone for the test message\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);

    if (error.response) {
      try {
        const errorBody = await error.response.json();
        console.error('\n❌ RingCentral API Error Details:');
        console.error(JSON.stringify(errorBody, null, 2));
      } catch (e) {
        console.error('Could not parse error response');
      }
    }

    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testSMS();
