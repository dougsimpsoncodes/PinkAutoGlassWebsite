/**
 * Test API Connections for Google Ads and Microsoft Ads
 */

require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(70));
console.log('API CONNECTION TESTS');
console.log('='.repeat(70));
console.log('');

// Test Google Ads
async function testGoogleAds() {
  console.log('1️⃣  GOOGLE ADS API');
  console.log('-'.repeat(50));

  const { GoogleAdsApi } = require('google-ads-api');

  const requiredVars = [
    'GOOGLE_ADS_CLIENT_ID',
    'GOOGLE_ADS_CLIENT_SECRET',
    'GOOGLE_ADS_REFRESH_TOKEN',
    'GOOGLE_ADS_DEVELOPER_TOKEN',
    'GOOGLE_ADS_CUSTOMER_ID',
  ];

  const missingVars = requiredVars.filter(v => !process.env[v]);
  if (missingVars.length > 0) {
    console.log('   ❌ Missing credentials:', missingVars.join(', '));
    return;
  }

  console.log('   ✅ All credentials present');

  try {
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    });

    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/[-\s]/g, '');
    const customer = client.Customer({
      customer_id: customerId,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    });

    // Test query
    const results = await customer.query(`
      SELECT customer.id, customer.descriptive_name
      FROM customer
      LIMIT 1
    `);

    if (results.length > 0) {
      console.log('   ✅ Connection successful');
      console.log(`   Account: ${results[0].customer.descriptive_name}`);
      console.log(`   ID: ${results[0].customer.id}`);
    }

    // Check conversion actions
    const convActions = await customer.query(`
      SELECT conversion_action.id, conversion_action.name, conversion_action.type, conversion_action.status
      FROM conversion_action
      WHERE conversion_action.status != 'REMOVED'
      ORDER BY conversion_action.name
    `);

    console.log(`\n   Conversion Actions (${convActions.length} total):`);
    convActions.slice(0, 10).forEach(row => {
      console.log(`     - ${row.conversion_action.name} (${row.conversion_action.type})`);
    });

    // Check offline conversion action
    const offlineId = process.env.GOOGLE_ADS_OFFLINE_CONVERSION_ACTION_ID;
    if (offlineId) {
      const offline = convActions.find(c => c.conversion_action.id.toString() === offlineId);
      if (offline) {
        console.log(`\n   ✅ Offline conversion action configured: ${offline.conversion_action.name}`);
      } else {
        console.log(`\n   ⚠️  GOOGLE_ADS_OFFLINE_CONVERSION_ACTION_ID (${offlineId}) not found in account`);
      }
    } else {
      console.log('\n   ⚠️  GOOGLE_ADS_OFFLINE_CONVERSION_ACTION_ID not set');
    }

  } catch (error) {
    console.log('   ❌ Connection failed:', error.message);
  }
}

// Test Microsoft Ads
async function testMicrosoftAds() {
  console.log('\n2️⃣  MICROSOFT ADS API');
  console.log('-'.repeat(50));

  const requiredVars = [
    'MICROSOFT_ADS_CLIENT_ID',
    'MICROSOFT_ADS_CLIENT_SECRET',
    'MICROSOFT_ADS_REFRESH_TOKEN',
    'MICROSOFT_ADS_DEVELOPER_TOKEN',
    'MICROSOFT_ADS_CUSTOMER_ID',
    'MICROSOFT_ADS_ACCOUNT_ID',
  ];

  const missingVars = requiredVars.filter(v => !process.env[v]);
  if (missingVars.length > 0) {
    console.log('   ❌ Missing credentials:', missingVars.join(', '));
    return;
  }

  console.log('   ✅ All credentials present');

  try {
    // Get access token
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_ADS_CLIENT_ID,
        client_secret: process.env.MICROSOFT_ADS_CLIENT_SECRET,
        refresh_token: process.env.MICROSOFT_ADS_REFRESH_TOKEN,
        grant_type: 'refresh_token',
        scope: 'https://ads.microsoft.com/msads.manage',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      console.log('   ❌ Token error:', tokenData.error_description || tokenData.error);
      return;
    }

    if (tokenData.access_token) {
      console.log('   ✅ OAuth token obtained');
    }

    // Test account performance report
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    const startParts = startStr.split('-');
    const endParts = endStr.split('-');

    const reportRequest = {
      ReportRequest: {
        ExcludeColumnHeaders: false,
        ExcludeReportFooter: true,
        ExcludeReportHeader: true,
        Format: 'Csv',
        FormatVersion: '2.0',
        ReportName: `Test_${Date.now()}`,
        ReturnOnlyCompleteData: false,
        Aggregation: 'Summary',
        Columns: ['AccountName', 'Impressions', 'Clicks', 'Spend', 'Conversions'],
        Scope: {
          AccountIds: [parseInt(process.env.MICROSOFT_ADS_ACCOUNT_ID)],
        },
        Time: {
          CustomDateRangeStart: { Year: parseInt(startParts[0]), Month: parseInt(startParts[1]), Day: parseInt(startParts[2]) },
          CustomDateRangeEnd: { Year: parseInt(endParts[0]), Month: parseInt(endParts[1]), Day: parseInt(endParts[2]) },
        },
        Type: 'AccountPerformanceReportRequest',
      },
    };

    const submitResp = await fetch('https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'DeveloperToken': process.env.MICROSOFT_ADS_DEVELOPER_TOKEN,
        'CustomerId': process.env.MICROSOFT_ADS_CUSTOMER_ID,
        'CustomerAccountId': process.env.MICROSOFT_ADS_ACCOUNT_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportRequest),
    });

    const submitData = await submitResp.json();
    if (submitData.ReportRequestId) {
      console.log('   ✅ Report submission successful');
      console.log(`   Report ID: ${submitData.ReportRequestId}`);

      // Poll for completion
      console.log('   Polling for report completion...');
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 2000));

        const pollResp = await fetch('https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Poll', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'DeveloperToken': process.env.MICROSOFT_ADS_DEVELOPER_TOKEN,
            'CustomerId': process.env.MICROSOFT_ADS_CUSTOMER_ID,
            'CustomerAccountId': process.env.MICROSOFT_ADS_ACCOUNT_ID,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ReportRequestId: submitData.ReportRequestId }),
        });

        const pollData = await pollResp.json();
        const status = pollData.ReportRequestStatus?.Status;

        if (status === 'Success') {
          console.log('   ✅ Report ready');

          // Download and parse
          const AdmZip = require('adm-zip');
          const dlResp = await fetch(pollData.ReportRequestStatus.ReportDownloadUrl);
          const buffer = await dlResp.arrayBuffer();
          const zip = new AdmZip(Buffer.from(buffer));
          const zipEntries = zip.getEntries();

          for (const entry of zipEntries) {
            if (entry.entryName.endsWith('.csv')) {
              const csvText = entry.getData().toString('utf8');
              const lines = csvText.trim().split('\n');
              if (lines.length >= 2) {
                const values = lines[1].split(',').map(v => v.replace(/"/g, '').trim());
                console.log(`\n   Last 7 days performance:`);
                console.log(`     Account: ${values[0]}`);
                console.log(`     Impressions: ${values[1]}`);
                console.log(`     Clicks: ${values[2]}`);
                console.log(`     Spend: $${values[3]}`);
                console.log(`     Conversions: ${values[4]}`);
              }
            }
          }
          break;
        } else if (status === 'Error') {
          console.log('   ❌ Report error:', pollData.ReportRequestStatus);
          break;
        }
      }
    } else {
      console.log('   ❌ Report submission failed:', submitData);
    }

  } catch (error) {
    console.log('   ❌ Connection failed:', error.message);
  }
}

async function main() {
  await testGoogleAds();
  await testMicrosoftAds();

  console.log('\n' + '='.repeat(70));
  console.log('END OF API TESTS');
  console.log('='.repeat(70));
}

main().catch(console.error);
