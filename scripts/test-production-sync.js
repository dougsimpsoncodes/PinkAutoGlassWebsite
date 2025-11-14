#!/usr/bin/env node

const PRODUCTION_URL = 'https://pinkautoglass.com';

async function testProductionSync() {
  console.log('Testing production RingCentral sync...\n');

  // Step 1: Try to trigger sync (will likely fail without auth)
  console.log('1. Attempting to POST to /api/admin/sync/ringcentral...');
  try {
    const syncResponse = await fetch(`${PRODUCTION_URL}/api/admin/sync/ringcentral`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`   Status: ${syncResponse.status} ${syncResponse.statusText}`);

    if (!syncResponse.ok) {
      const errorText = await syncResponse.text();
      console.log(`   Error: ${errorText.substring(0, 200)}`);
    } else {
      const data = await syncResponse.json();
      console.log(`   Success! Records fetched: ${data.summary?.recordsFetched}`);
      console.log(`   New calls: ${data.summary?.newCalls}`);
      console.log(`   Database total: ${data.statistics?.totalCalls}`);
    }
  } catch (error) {
    console.error(`   Failed: ${error.message}`);
  }

  console.log('\n2. Fetching calls from production API...');
  try {
    const callsResponse = await fetch(`${PRODUCTION_URL}/api/admin/calls?limit=10`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`   Status: ${callsResponse.status} ${callsResponse.statusText}`);

    if (!callsResponse.ok) {
      console.log(`   Error: Requires authentication`);
    } else {
      const data = await callsResponse.json();
      console.log(`   Total calls: ${data.total}`);
      if (data.calls && data.calls.length > 0) {
        const latestCall = data.calls[0];
        console.log(`   Latest call: ${latestCall.start_time}`);
      }
    }
  } catch (error) {
    console.error(`   Failed: ${error.message}`);
  }

  console.log('\n3. Checking production health endpoint...');
  try {
    const healthResponse = await fetch(`${PRODUCTION_URL}/api/health/env`);
    console.log(`   Status: ${healthResponse.status} ${healthResponse.statusText}`);

    if (healthResponse.ok) {
      const data = await healthResponse.json();
      console.log(`   Health: ${data.status}`);
      console.log(`   Missing vars: ${data.missing?.length || 0}`);
      if (data.missing && data.missing.length > 0) {
        console.log(`   Missing: ${data.missing.join(', ')}`);
      }
    }
  } catch (error) {
    console.error(`   Failed: ${error.message}`);
  }
}

testProductionSync();
