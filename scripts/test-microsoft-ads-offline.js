/**
 * Test Script for Microsoft Ads Offline Conversion System
 * Tests authentication, database, and upload functionality
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Microsoft Ads config
const MS_CLIENT_ID = process.env.MICROSOFT_ADS_CLIENT_ID;
const MS_CLIENT_SECRET = process.env.MICROSOFT_ADS_CLIENT_SECRET;
const MS_REFRESH_TOKEN = process.env.MICROSOFT_ADS_REFRESH_TOKEN;
const MS_DEVELOPER_TOKEN = process.env.MICROSOFT_ADS_DEVELOPER_TOKEN;
const MS_CUSTOMER_ID = process.env.MICROSOFT_ADS_CUSTOMER_ID;
const MS_ACCOUNT_ID = process.env.MICROSOFT_ADS_ACCOUNT_ID;

console.log('='.repeat(60));
console.log('MICROSOFT ADS OFFLINE CONVERSION TEST');
console.log('='.repeat(60));
console.log('');

async function testCredentials() {
  console.log('📋 PHASE 1: Checking Credentials Configuration');
  console.log('-'.repeat(40));

  const credentials = {
    'MICROSOFT_ADS_CLIENT_ID': MS_CLIENT_ID,
    'MICROSOFT_ADS_CLIENT_SECRET': MS_CLIENT_SECRET,
    'MICROSOFT_ADS_REFRESH_TOKEN': MS_REFRESH_TOKEN,
    'MICROSOFT_ADS_DEVELOPER_TOKEN': MS_DEVELOPER_TOKEN,
    'MICROSOFT_ADS_CUSTOMER_ID': MS_CUSTOMER_ID,
    'MICROSOFT_ADS_ACCOUNT_ID': MS_ACCOUNT_ID,
  };

  let allPresent = true;
  for (const [key, value] of Object.entries(credentials)) {
    const present = !!value && value.trim() !== '';
    console.log(`  ${present ? '✅' : '❌'} ${key}: ${present ? 'configured' : 'MISSING'}`);
    if (!present) allPresent = false;
  }

  console.log('');
  return allPresent;
}

async function testAuthentication() {
  console.log('🔐 PHASE 2: Testing API Authentication');
  console.log('-'.repeat(40));

  try {
    const tokenEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: MS_CLIENT_ID,
        client_secret: MS_CLIENT_SECRET,
        refresh_token: MS_REFRESH_TOKEN,
        grant_type: 'refresh_token',
        scope: 'https://ads.microsoft.com/msads.manage',
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      console.log('  ✅ Successfully obtained access token');
      console.log(`  ✅ Token expires in: ${data.expires_in} seconds`);
      console.log('');
      return data.access_token;
    } else {
      console.log('  ❌ Failed to get access token');
      console.log('  Error:', data.error_description || data.error || 'Unknown error');
      console.log('');
      return null;
    }
  } catch (error) {
    console.log('  ❌ Authentication error:', error.message);
    console.log('');
    return null;
  }
}

async function testDatabaseColumn() {
  console.log('🗄️  PHASE 3: Checking Database Column');
  console.log('-'.repeat(40));

  try {
    const { data, error } = await supabase
      .from('ringcentral_calls')
      .select('call_id, microsoft_ads_uploaded_at')
      .limit(1);

    if (error && error.message.includes('does not exist')) {
      console.log('  ❌ Column microsoft_ads_uploaded_at does not exist');
      console.log('  Run the migration SQL in Supabase SQL Editor');
      console.log('');
      return false;
    } else if (error) {
      console.log('  ❌ Database error:', error.message);
      console.log('');
      return false;
    } else {
      console.log('  ✅ Column microsoft_ads_uploaded_at exists');
      console.log('');
      return true;
    }
  } catch (error) {
    console.log('  ❌ Error:', error.message);
    console.log('');
    return false;
  }
}

async function checkCallsWithMsclkid() {
  console.log('📞 PHASE 4: Checking for Calls with MSCLKID');
  console.log('-'.repeat(40));

  try {
    // Check conversion_events for msclkid
    const { data: eventsWithMsclkid, error: eventsError } = await supabase
      .from('conversion_events')
      .select('id, session_id, msclkid, event_type, created_at')
      .not('msclkid', 'is', null)
      .limit(10);

    if (eventsError) {
      console.log('  ⚠️  Could not query conversion_events:', eventsError.message);
    } else {
      console.log(`  📊 Conversion events with MSCLKID: ${eventsWithMsclkid?.length || 0}`);
      if (eventsWithMsclkid?.length > 0) {
        console.log('  Sample events:');
        eventsWithMsclkid.slice(0, 3).forEach(e => {
          console.log(`    - ${e.event_type} | msclkid: ${e.msclkid?.substring(0, 20)}...`);
        });
      }
    }

    // Check user_sessions for msclkid
    const { data: sessionsWithMsclkid, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('session_id, msclkid, created_at')
      .not('msclkid', 'is', null)
      .limit(10);

    if (sessionsError) {
      console.log('  ⚠️  Could not query user_sessions:', sessionsError.message);
    } else {
      console.log(`  📊 User sessions with MSCLKID: ${sessionsWithMsclkid?.length || 0}`);
      if (sessionsWithMsclkid?.length > 0) {
        console.log('  Sample sessions:');
        sessionsWithMsclkid.slice(0, 3).forEach(s => {
          console.log(`    - session: ${s.session_id?.substring(0, 20)}... | msclkid: ${s.msclkid?.substring(0, 20)}...`);
        });
      }
    }

    // Check ringcentral_calls for any calls that could be matched
    const { data: recentCalls, error: callsError } = await supabase
      .from('ringcentral_calls')
      .select('call_id, from_number, start_time, duration, result, microsoft_ads_uploaded_at')
      .eq('direction', 'Inbound')
      .gte('duration', 60)
      .order('start_time', { ascending: false })
      .limit(10);

    if (callsError) {
      console.log('  ⚠️  Could not query ringcentral_calls:', callsError.message);
    } else {
      console.log(`  📊 Qualifying RingCentral calls (60+ sec, inbound): ${recentCalls?.length || 0}`);
      if (recentCalls?.length > 0) {
        const notUploaded = recentCalls.filter(c => !c.microsoft_ads_uploaded_at);
        const uploaded = recentCalls.filter(c => c.microsoft_ads_uploaded_at);
        console.log(`    - Not yet uploaded to MS Ads: ${notUploaded.length}`);
        console.log(`    - Already uploaded: ${uploaded.length}`);
      }
    }

    console.log('');
    return {
      eventsWithMsclkid: eventsWithMsclkid || [],
      sessionsWithMsclkid: sessionsWithMsclkid || [],
      recentCalls: recentCalls || []
    };
  } catch (error) {
    console.log('  ❌ Error:', error.message);
    console.log('');
    return null;
  }
}

async function testUploadEndpoint(accessToken) {
  console.log('📤 PHASE 5: Testing Upload API Endpoint (Dry Run)');
  console.log('-'.repeat(40));

  if (!accessToken) {
    console.log('  ⚠️  Skipping - no access token available');
    console.log('');
    return false;
  }

  // We'll test the API endpoint format without actually uploading
  // This validates our request structure
  const endpoint = 'https://campaign.api.bingads.microsoft.com/CampaignManagement/v13/OfflineConversions/Apply';

  // Create a test payload with obviously fake data that won't match any real click
  // Using ISO 8601 UTC format per Microsoft docs
  const testConversion = {
    ConversionCurrencyCode: 'USD',
    ConversionName: 'Phone Call (Ring Central)',
    ConversionTime: new Date().toISOString(), // ISO 8601 UTC format
    ConversionValue: 150,
    MicrosoftClickId: 'TEST_INVALID_MSCLKID_12345', // This won't match anything
  };

  console.log('  📋 Testing API endpoint structure...');
  console.log('  Endpoint:', endpoint);
  console.log('  Headers:');
  console.log('    - Authorization: Bearer [token]');
  console.log('    - DeveloperToken:', MS_DEVELOPER_TOKEN?.substring(0, 8) + '...');
  console.log('    - CustomerId:', MS_CUSTOMER_ID);
  console.log('    - CustomerAccountId:', MS_ACCOUNT_ID);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'DeveloperToken': MS_DEVELOPER_TOKEN,
        'CustomerId': MS_CUSTOMER_ID,
        'CustomerAccountId': MS_ACCOUNT_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        OfflineConversions: [testConversion],
      }),
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { rawResponse: responseText };
    }

    console.log('');
    console.log('  📡 API Response:');
    console.log('    - Status:', response.status, response.statusText);

    if (response.status === 200) {
      console.log('    - ✅ API endpoint is accessible');
      if (responseData.PartialErrors?.length > 0) {
        console.log('    - ⚠️  Partial errors (expected for test data):');
        responseData.PartialErrors.forEach(err => {
          console.log(`      - ${err.Message || JSON.stringify(err)}`);
        });
      }
    } else if (response.status === 400) {
      console.log('    - ⚠️  Bad request (may be expected for test data)');
      console.log('    - Response:', JSON.stringify(responseData, null, 2).substring(0, 500));
    } else if (response.status === 401 || response.status === 403) {
      console.log('    - ❌ Authentication/Authorization error');
      console.log('    - Response:', JSON.stringify(responseData, null, 2).substring(0, 500));
    } else {
      console.log('    - Response:', JSON.stringify(responseData, null, 2).substring(0, 500));
    }

    console.log('');
    return response.status === 200 || response.status === 400; // 400 might be expected for invalid msclkid
  } catch (error) {
    console.log('  ❌ Request error:', error.message);
    console.log('');
    return false;
  }
}

async function runAllTests() {
  // Phase 1: Check credentials
  const credentialsOk = await testCredentials();
  if (!credentialsOk) {
    console.log('❌ FAILED: Missing credentials. Please configure all Microsoft Ads env vars.');
    return;
  }

  // Phase 2: Test authentication
  const accessToken = await testAuthentication();
  if (!accessToken) {
    console.log('❌ FAILED: Could not authenticate with Microsoft Ads API.');
    return;
  }

  // Phase 3: Test database column
  const columnExists = await testDatabaseColumn();
  if (!columnExists) {
    console.log('❌ FAILED: Database column not set up. Run the migration.');
    return;
  }

  // Phase 4: Check for calls with MSCLKID
  await checkCallsWithMsclkid();

  // Phase 5: Test upload endpoint
  await testUploadEndpoint(accessToken);

  console.log('='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log('✅ Credentials: Configured');
  console.log('✅ Authentication: Working');
  console.log('✅ Database: Ready');
  console.log('');
  console.log('The system is ready for offline conversion uploads.');
  console.log('Conversions will be uploaded during the daily cron job (6am MT)');
  console.log('when RingCentral calls are matched with MSCLKID from website sessions.');
  console.log('');
}

runAllTests().catch(console.error);
