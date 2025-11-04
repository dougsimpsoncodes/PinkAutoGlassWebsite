#!/usr/bin/env node

/**
 * One-time script to register RingCentral webhook
 * Run: node scripts/setup-ringcentral-webhook.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { SDK } = require('@ringcentral/sdk');

const RC_SERVER_URL = process.env.RINGCENTRAL_SERVER_URL || 'https://platform.ringcentral.com';
const RC_JWT_TOKEN = process.env.RINGCENTRAL_JWT_TOKEN;
const RC_CLIENT_ID = process.env.RINGCENTRAL_CLIENT_ID;
const RC_CLIENT_SECRET = process.env.RINGCENTRAL_CLIENT_SECRET;
const WEBHOOK_URL = 'https://pinkautoglass.com/api/webhooks/ringcentral';

async function setupWebhook() {
  console.log('🔧 Setting up RingCentral webhook...\n');

  if (!RC_JWT_TOKEN || !RC_CLIENT_ID || !RC_CLIENT_SECRET) {
    console.error('❌ Missing RingCentral credentials in environment variables');
    process.exit(1);
  }

  try {
    // Initialize SDK
    const rcsdk = new SDK({
      server: RC_SERVER_URL,
      clientId: RC_CLIENT_ID.trim(),
      clientSecret: RC_CLIENT_SECRET.trim(),
    });

    const platform = rcsdk.platform();

    // Authenticate
    console.log('🔐 Authenticating with RingCentral...');
    await platform.login({ jwt: RC_JWT_TOKEN.trim() });
    console.log('✓ Authenticated\n');

    // Create webhook subscription
    console.log('📤 Creating webhook subscription...');
    console.log(`   Webhook URL: ${WEBHOOK_URL}`);
    console.log('   Event Filter: /restapi/v1.0/account/~/telephony/sessions\n');

    const response = await platform.post('/restapi/v1.0/subscription', {
      eventFilters: [
        '/restapi/v1.0/account/~/telephony/sessions'
      ],
      deliveryMode: {
        transportType: 'WebHook',
        address: WEBHOOK_URL,
      },
      expiresIn: 157680000, // ~5 years
    });

    const subscription = await response.json();

    console.log('✅ Webhook subscription created successfully!\n');
    console.log('📋 Subscription Details:');
    console.log(`   ID: ${subscription.id}`);
    console.log(`   Status: ${subscription.status}`);
    console.log(`   Expires: ${subscription.expirationTime}`);
    console.log('\n🎉 Setup complete! Your call data will now sync automatically.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      const errorData = await error.response.json();
      console.error('   Details:', JSON.stringify(errorData, null, 2));
    }
    process.exit(1);
  }
}

setupWebhook();
