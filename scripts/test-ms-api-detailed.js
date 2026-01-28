#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });

async function testMicrosoftAds() {
  console.log('=== Testing Microsoft Ads API ===');

  const CLIENT_ID = process.env.MICROSOFT_ADS_CLIENT_ID;
  const CLIENT_SECRET = process.env.MICROSOFT_ADS_CLIENT_SECRET;
  const REFRESH_TOKEN = process.env.MICROSOFT_ADS_REFRESH_TOKEN;
  const DEVELOPER_TOKEN = process.env.MICROSOFT_ADS_DEVELOPER_TOKEN;
  const CUSTOMER_ID = process.env.MICROSOFT_ADS_CUSTOMER_ID;
  const ACCOUNT_ID = process.env.MICROSOFT_ADS_ACCOUNT_ID;

  console.log('\nCredentials check:');
  console.log('- CLIENT_ID:', CLIENT_ID ? CLIENT_ID.substring(0, 10) + '...' : 'MISSING');
  console.log('- CLIENT_SECRET:', CLIENT_SECRET ? 'SET (' + CLIENT_SECRET.length + ' chars)' : 'MISSING');
  console.log('- REFRESH_TOKEN:', REFRESH_TOKEN ? 'SET (' + REFRESH_TOKEN.length + ' chars)' : 'MISSING');
  console.log('- DEVELOPER_TOKEN:', DEVELOPER_TOKEN ? DEVELOPER_TOKEN.substring(0, 10) + '...' : 'MISSING');
  console.log('- CUSTOMER_ID:', CUSTOMER_ID || 'MISSING');
  console.log('- ACCOUNT_ID:', ACCOUNT_ID || 'MISSING');

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !DEVELOPER_TOKEN || !CUSTOMER_ID || !ACCOUNT_ID) {
    console.log('\nERROR: Missing required credentials');
    return;
  }

  // Step 1: Get access token
  console.log('\n=== Step 1: OAuth Token Exchange ===');
  const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
      scope: 'https://ads.microsoft.com/msads.manage',
    }),
  });

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    console.log('ERROR:', tokenData.error);
    console.log('Description:', tokenData.error_description);
    return;
  }

  console.log('Access token obtained:', tokenData.access_token ? 'YES (' + tokenData.access_token.length + ' chars)' : 'NO');
  const accessToken = tokenData.access_token;

  // Step 2: Test Report API
  console.log('\n=== Step 2: Submit Account Performance Report ===');

  const reportRequest = {
    ReportRequest: {
      ExcludeColumnHeaders: false,
      ExcludeReportFooter: true,
      ExcludeReportHeader: true,
      Format: 'Csv',
      FormatVersion: '2.0',
      ReportName: 'AccountPerformance_' + Date.now(),
      ReturnOnlyCompleteData: false,
      Aggregation: 'Summary',
      Columns: ['AccountName', 'Impressions', 'Clicks', 'Spend', 'Conversions', 'Ctr'],
      Scope: { AccountIds: [parseInt(ACCOUNT_ID)] },
      Time: {
        CustomDateRangeStart: { Year: 2025, Month: 11, Day: 2 },
        CustomDateRangeEnd: { Year: 2025, Month: 12, Day: 2 },
      },
      Type: 'AccountPerformanceReportRequest',
    },
  };

  console.log('Request headers:');
  console.log('  DeveloperToken:', DEVELOPER_TOKEN);
  console.log('  CustomerId:', CUSTOMER_ID);
  console.log('  CustomerAccountId:', ACCOUNT_ID);

  const submitResponse = await fetch('https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Submit', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'DeveloperToken': DEVELOPER_TOKEN,
      'CustomerId': CUSTOMER_ID,
      'CustomerAccountId': ACCOUNT_ID,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reportRequest),
  });

  console.log('Submit status:', submitResponse.status);
  const submitText = await submitResponse.text();
  console.log('Submit response:', submitText);

  let submitData;
  try {
    submitData = JSON.parse(submitText);
  } catch (e) {
    console.log('Failed to parse JSON response');
    return;
  }

  if (!submitData.ReportRequestId) {
    console.log('ERROR: No ReportRequestId returned');
    return;
  }

  // Step 3: Poll for report completion
  console.log('\n=== Step 3: Poll for Report ===');
  let downloadUrl = null;

  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 2000));

    const pollResponse = await fetch('https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Poll', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'DeveloperToken': DEVELOPER_TOKEN,
        'CustomerId': CUSTOMER_ID,
        'CustomerAccountId': ACCOUNT_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ReportRequestId: submitData.ReportRequestId }),
    });

    const pollData = await pollResponse.json();
    console.log('Poll attempt', i + 1, '- Status:', pollData.ReportRequestStatus?.Status);

    if (pollData.ReportRequestStatus?.Status === 'Success') {
      downloadUrl = pollData.ReportRequestStatus.ReportDownloadUrl;
      break;
    } else if (pollData.ReportRequestStatus?.Status === 'Error') {
      console.log('Report error:', JSON.stringify(pollData.ReportRequestStatus, null, 2));
      return;
    }
  }

  if (!downloadUrl) {
    console.log('ERROR: Report did not complete in time');
    return;
  }

  // Step 4: Download and parse report
  console.log('\n=== Step 4: Download Report ===');
  console.log('Download URL:', downloadUrl.substring(0, 80) + '...');

  const downloadResponse = await fetch(downloadUrl);
  const buffer = await downloadResponse.arrayBuffer();

  const AdmZip = require('adm-zip');
  const zip = new AdmZip(Buffer.from(buffer));
  const zipEntries = zip.getEntries();

  let csvText = '';
  for (const entry of zipEntries) {
    if (entry.entryName.endsWith('.csv')) {
      csvText = entry.getData().toString('utf8');
      break;
    }
  }

  // Remove BOM if present
  if (csvText.charCodeAt(0) === 0xFEFF) {
    csvText = csvText.slice(1);
  }

  console.log('\nCSV content:');
  console.log(csvText);

  // Parse CSV
  const lines = csvText.trim().split('\n');
  if (lines.length >= 2) {
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const values = lines[1].split(',').map(v => v.replace(/"/g, '').trim());

    console.log('\n=== Parsed Results ===');
    for (let i = 0; i < headers.length; i++) {
      console.log(headers[i] + ':', values[i]);
    }

    // Calculate spend
    const spendIndex = headers.indexOf('Spend');
    if (spendIndex !== -1) {
      console.log('\n*** SPEND: $' + parseFloat(values[spendIndex]).toFixed(2) + ' ***');
    }
  }
}

testMicrosoftAds().catch(console.error);
