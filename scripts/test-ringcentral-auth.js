#!/usr/bin/env node

const { SDK } = require('@ringcentral/sdk');

const RC_SERVER_URL = process.env.RINGCENTRAL_SERVER_URL || 'https://platform.ringcentral.com';
const RC_JWT_TOKEN = process.env.RINGCENTRAL_JWT_TOKEN;
const RC_CLIENT_ID = process.env.RINGCENTRAL_CLIENT_ID;
const RC_CLIENT_SECRET = process.env.RINGCENTRAL_CLIENT_SECRET;

async function testRingCentralAuth() {
  console.log('Testing RingCentral authentication...\n');

  if (!RC_JWT_TOKEN || !RC_CLIENT_ID || !RC_CLIENT_SECRET) {
    console.error('❌ Missing RingCentral credentials in environment');
    console.log('   RINGCENTRAL_JWT_TOKEN:', RC_JWT_TOKEN ? '✓ Set' : '✗ Missing');
    console.log('   RINGCENTRAL_CLIENT_ID:', RC_CLIENT_ID ? '✓ Set' : '✗ Missing');
    console.log('   RINGCENTRAL_CLIENT_SECRET:', RC_CLIENT_SECRET ? '✓ Set' : '✗ Missing');
    process.exit(1);
  }

  console.log('✓ All credentials present\n');

  try {
    // Step 1: Initialize SDK
    console.log('1. Initializing RingCentral SDK...');
    const rcsdk = new SDK({
      server: RC_SERVER_URL,
      clientId: RC_CLIENT_ID.trim(),
      clientSecret: RC_CLIENT_SECRET.trim(),
    });
    const platform = rcsdk.platform();
    console.log('   ✓ SDK initialized\n');

    // Step 2: Authenticate with JWT
    console.log('2. Authenticating with JWT...');
    await platform.login({ jwt: RC_JWT_TOKEN.trim() });
    console.log('   ✓ Authentication successful!\n');

    // Step 3: Get access token
    const authData = await platform.auth().data();
    console.log('3. Access token info:');
    console.log(`   Token expires at: ${new Date(authData.expire_time).toLocaleString()}`);
    console.log(`   Token type: ${authData.token_type}`);
    console.log(`   Scope: ${authData.scope}\n`);

    // Step 4: Test API call - fetch recent calls
    console.log('4. Testing API call - fetching last 10 calls...');
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 7); // Last 7 days

    const callLogResponse = await fetch(
      `${RC_SERVER_URL}/restapi/v1.0/account/~/call-log?` +
        new URLSearchParams({
          dateFrom: dateFrom.toISOString(),
          perPage: '10',
          view: 'Detailed',
        }),
      {
        headers: {
          Authorization: `Bearer ${authData.access_token}`,
        },
      }
    );

    if (!callLogResponse.ok) {
      const errorText = await callLogResponse.text();
      console.error(`   ❌ API call failed: ${callLogResponse.status} ${callLogResponse.statusText}`);
      console.error(`   Error: ${errorText}`);
      return;
    }

    const callLogData = await callLogResponse.json();
    const records = callLogData.records || [];

    console.log(`   ✓ Successfully fetched ${records.length} calls\n`);

    if (records.length > 0) {
      console.log('5. Recent calls:');
      records.slice(0, 5).forEach((call, i) => {
        console.log(`   ${i + 1}. ${call.direction} call`);
        console.log(`      Time: ${call.startTime}`);
        console.log(`      From: ${call.from?.name || 'Unknown'} (${call.from?.phoneNumber})`);
        console.log(`      To: ${call.to?.name || 'Unknown'} (${call.to?.phoneNumber})`);
        console.log(`      Duration: ${call.duration}s`);
        console.log(`      Result: ${call.result}`);
        console.log('');
      });

      // Check date range
      const dates = records.map(r => new Date(r.startTime));
      const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
      const latest = new Date(Math.max(...dates.map(d => d.getTime())));
      console.log(`\n   Date range: ${earliest.toLocaleString()} to ${latest.toLocaleString()}`);
    } else {
      console.log('   ⚠️  No calls found in the last 7 days');
    }

    console.log('\n✅ RingCentral authentication and API access working correctly!');

  } catch (error) {
    console.error('\n❌ RingCentral authentication failed:');
    console.error(`   Error: ${error.message}`);
    if (error.response) {
      console.error(`   Response: ${JSON.stringify(error.response, null, 2)}`);
    }
    process.exit(1);
  }
}

testRingCentralAuth();
