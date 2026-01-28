/**
 * Test Script for Microsoft Ads Reporting API
 * Tests fetching campaign performance data
 */

require('dotenv').config({ path: '.env.local' });

const MS_CLIENT_ID = process.env.MICROSOFT_ADS_CLIENT_ID;
const MS_CLIENT_SECRET = process.env.MICROSOFT_ADS_CLIENT_SECRET;
const MS_REFRESH_TOKEN = process.env.MICROSOFT_ADS_REFRESH_TOKEN;
const MS_DEVELOPER_TOKEN = process.env.MICROSOFT_ADS_DEVELOPER_TOKEN;
const MS_CUSTOMER_ID = process.env.MICROSOFT_ADS_CUSTOMER_ID;
const MS_ACCOUNT_ID = process.env.MICROSOFT_ADS_ACCOUNT_ID;

console.log('='.repeat(60));
console.log('MICROSOFT ADS REPORTING API TEST');
console.log('='.repeat(60));
console.log('');

async function getAccessToken() {
  console.log('🔐 Getting access token...');

  const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
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
    console.log('  ✅ Access token obtained');
    return data.access_token;
  } else {
    console.log('  ❌ Failed to get access token:', data.error_description || data.error);
    throw new Error('Failed to get access token');
  }
}

async function submitReport(accessToken) {
  console.log('📊 Submitting report request...');

  const endpoint = 'https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Submit';

  // Get date range: last 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const requestBody = {
    ReportRequest: {
      ExcludeColumnHeaders: false,
      ExcludeReportFooter: true,
      ExcludeReportHeader: true,
      Format: 'Csv',
      FormatVersion: '2.0',
      ReportName: `AccountPerformance_${Date.now()}`,
      ReturnOnlyCompleteData: false,
      Type: 'AccountPerformanceReportRequest',
      Aggregation: 'Summary',
      Columns: [
        'AccountName',
        'Impressions',
        'Clicks',
        'Spend',
        'Conversions',
        'Ctr',
      ],
      Scope: {
        AccountIds: [parseInt(MS_ACCOUNT_ID)],
      },
      Time: {
        CustomDateRangeStart: {
          Year: startDate.getFullYear(),
          Month: startDate.getMonth() + 1,
          Day: startDate.getDate(),
        },
        CustomDateRangeEnd: {
          Year: endDate.getFullYear(),
          Month: endDate.getMonth() + 1,
          Day: endDate.getDate(),
        },
      },
    },
  };

  console.log('  Date Range:', startDate.toISOString().split('T')[0], 'to', endDate.toISOString().split('T')[0]);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'DeveloperToken': MS_DEVELOPER_TOKEN,
      'CustomerId': MS_CUSTOMER_ID,
      'CustomerAccountId': MS_ACCOUNT_ID,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();
  console.log('  Status:', response.status);

  if (!response.ok) {
    console.log('  ❌ Submit failed:', responseText.substring(0, 500));
    return null;
  }

  const data = JSON.parse(responseText);
  console.log('  ✅ Report submitted, ID:', data.ReportRequestId);
  return data.ReportRequestId;
}

async function pollReport(accessToken, reportId) {
  console.log('⏳ Polling for report status...');

  const endpoint = 'https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Poll';

  for (let attempt = 0; attempt < 30; attempt++) {
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
        ReportRequestId: reportId,
      }),
    });

    const data = await response.json();
    const status = data.ReportRequestStatus?.Status;
    console.log(`  Attempt ${attempt + 1}: ${status}`);

    if (status === 'Success') {
      console.log('  ✅ Report ready!');
      return data.ReportRequestStatus.ReportDownloadUrl;
    } else if (status === 'Error') {
      console.log('  ❌ Report error:', data.ReportRequestStatus);
      return null;
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('  ❌ Polling timed out');
  return null;
}

async function downloadReport(downloadUrl) {
  console.log('📥 Downloading report...');

  const response = await fetch(downloadUrl);
  if (!response.ok) {
    console.log('  ❌ Download failed:', response.status);
    return null;
  }

  // Microsoft returns a ZIP file, need to extract it
  const AdmZip = require('adm-zip');
  const buffer = await response.arrayBuffer();

  try {
    const zip = new AdmZip(Buffer.from(buffer));
    const zipEntries = zip.getEntries();

    console.log('  ✅ Downloaded ZIP with', zipEntries.length, 'file(s)');

    for (const entry of zipEntries) {
      if (entry.entryName.endsWith('.csv')) {
        const csvText = entry.getData().toString('utf8');
        console.log('');
        console.log('  CSV File:', entry.entryName);
        console.log('');
        console.log(csvText);
        console.log('');

        // Parse CSV
        const lines = csvText.trim().split('\n');
        if (lines.length >= 2) {
          const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
          const values = lines[1].split(',').map(v => v.replace(/"/g, '').trim());

          console.log('📈 Parsed Data:');
          for (let i = 0; i < headers.length; i++) {
            console.log(`  ${headers[i]}: ${values[i]}`);
          }
        }
        return csvText;
      }
    }
  } catch (e) {
    // Maybe it's not a ZIP, try as plain text
    console.log('  Note: Response may not be a ZIP, trying as plain text...');
    const csvText = Buffer.from(buffer).toString('utf8');
    console.log(csvText);
    return csvText;
  }

  return null;
}

async function runTest() {
  try {
    // Check credentials
    const creds = { MS_CLIENT_ID, MS_CLIENT_SECRET, MS_REFRESH_TOKEN, MS_DEVELOPER_TOKEN, MS_CUSTOMER_ID, MS_ACCOUNT_ID };
    const missing = Object.entries(creds).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length > 0) {
      console.log('❌ Missing credentials:', missing.join(', '));
      return;
    }

    // Get access token
    const accessToken = await getAccessToken();

    // Submit report
    const reportId = await submitReport(accessToken);
    if (!reportId) return;

    // Poll for completion
    const downloadUrl = await pollReport(accessToken, reportId);
    if (!downloadUrl) return;

    // Download and display
    await downloadReport(downloadUrl);

    console.log('');
    console.log('='.repeat(60));
    console.log('✅ TEST COMPLETE');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runTest();
