/**
 * Test Script for Microsoft Ads Library Functions
 * Tests the fetchAccountPerformance function from microsoftAds.ts
 */

require('dotenv').config({ path: '.env.local' });

// We need to compile and import the TypeScript module
const { execSync } = require('child_process');
const path = require('path');

console.log('='.repeat(60));
console.log('MICROSOFT ADS LIBRARY FUNCTION TEST');
console.log('='.repeat(60));
console.log('');

// Get date range: last 30 days
const endDate = new Date();
const startDate = new Date();
startDate.setDate(startDate.getDate() - 30);

const startDateStr = startDate.toISOString().split('T')[0];
const endDateStr = endDate.toISOString().split('T')[0];

console.log('Date Range:', startDateStr, 'to', endDateStr);
console.log('');

// Directly test the same API call that fetchAccountPerformance makes
const MS_CLIENT_ID = process.env.MICROSOFT_ADS_CLIENT_ID;
const MS_CLIENT_SECRET = process.env.MICROSOFT_ADS_CLIENT_SECRET;
const MS_REFRESH_TOKEN = process.env.MICROSOFT_ADS_REFRESH_TOKEN;
const MS_DEVELOPER_TOKEN = process.env.MICROSOFT_ADS_DEVELOPER_TOKEN;
const MS_CUSTOMER_ID = process.env.MICROSOFT_ADS_CUSTOMER_ID;
const MS_ACCOUNT_ID = process.env.MICROSOFT_ADS_ACCOUNT_ID;

async function getAccessToken() {
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
    console.log('✅ Access token obtained');
    return data.access_token;
  } else {
    console.log('❌ Failed to get access token:', data.error_description || data.error);
    throw new Error('Failed to get access token');
  }
}

async function testAccountPerformanceRequest() {
  const accessToken = await getAccessToken();

  // Parse dates
  const startParts = startDateStr.split('-');
  const endParts = endDateStr.split('-');

  // This mirrors exactly what fetchAccountPerformance does
  const reportRequest = {
    ExcludeColumnHeaders: false,
    ExcludeReportFooter: true,
    ExcludeReportHeader: true,
    Format: 'Csv',
    FormatVersion: '2.0',
    ReportName: `AccountPerformanceReportRequest_${Date.now()}`,
    ReturnOnlyCompleteData: false,
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
        Year: parseInt(startParts[0]),
        Month: parseInt(startParts[1]),
        Day: parseInt(startParts[2]),
      },
      CustomDateRangeEnd: {
        Year: parseInt(endParts[0]),
        Month: parseInt(endParts[1]),
        Day: parseInt(endParts[2]),
      },
    },
  };

  const requestBody = {
    ReportRequest: {
      ...reportRequest,
      Type: 'AccountPerformanceReportRequest',
    },
  };

  console.log('📊 Submitting report with body:', JSON.stringify(requestBody, null, 2));
  console.log('');

  const response = await fetch('https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Submit', {
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
  console.log('Response Status:', response.status);
  console.log('Response:', responseText.substring(0, 500));

  if (response.ok) {
    const data = JSON.parse(responseText);
    console.log('✅ Report ID:', data.ReportRequestId);
  }
}

testAccountPerformanceRequest().catch(console.error);
