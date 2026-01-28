/**
 * Test script to verify Microsoft Ads daily data fetching
 * This tests the exact same code path as the daily report cron
 */

const AdmZip = require('adm-zip');

// Microsoft Ads API configuration
const MICROSOFT_ADS_CLIENT_ID = process.env.MICROSOFT_ADS_CLIENT_ID;
const MICROSOFT_ADS_CLIENT_SECRET = process.env.MICROSOFT_ADS_CLIENT_SECRET;
const MICROSOFT_ADS_REFRESH_TOKEN = process.env.MICROSOFT_ADS_REFRESH_TOKEN;
const MICROSOFT_ADS_DEVELOPER_TOKEN = process.env.MICROSOFT_ADS_DEVELOPER_TOKEN;
const MICROSOFT_ADS_CUSTOMER_ID = process.env.MICROSOFT_ADS_CUSTOMER_ID;
const MICROSOFT_ADS_ACCOUNT_ID = process.env.MICROSOFT_ADS_ACCOUNT_ID;

async function getAccessToken() {
  const tokenEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

  console.log('Getting access token...');
  console.log('CLIENT_ID:', MICROSOFT_ADS_CLIENT_ID ? 'set' : 'MISSING');
  console.log('CLIENT_SECRET:', MICROSOFT_ADS_CLIENT_SECRET ? 'set' : 'MISSING');
  console.log('REFRESH_TOKEN:', MICROSOFT_ADS_REFRESH_TOKEN ? 'set' : 'MISSING');

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: MICROSOFT_ADS_CLIENT_ID,
      client_secret: MICROSOFT_ADS_CLIENT_SECRET,
      refresh_token: MICROSOFT_ADS_REFRESH_TOKEN,
      grant_type: 'refresh_token',
      scope: 'https://ads.microsoft.com/msads.manage',
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Token error response:', errorBody);
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Access token obtained');
  return data.access_token;
}

async function submitReportRequest(columns, dateRange, aggregation) {
  const accessToken = await getAccessToken();
  const endpoint = 'https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Submit';

  const startParts = dateRange.start.split('-');
  const endParts = dateRange.end.split('-');

  const requestBody = {
    ReportRequest: {
      ExcludeColumnHeaders: false,
      ExcludeReportFooter: true,
      ExcludeReportHeader: true,
      Format: 'Csv',
      FormatVersion: '2.0',
      ReportName: `Test_${Date.now()}`,
      ReturnOnlyCompleteData: false,
      Aggregation: aggregation,
      Columns: columns,
      Scope: { AccountIds: [parseInt(MICROSOFT_ADS_ACCOUNT_ID)] },
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
      Type: 'AccountPerformanceReportRequest',
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'DeveloperToken': MICROSOFT_ADS_DEVELOPER_TOKEN,
      'CustomerId': MICROSOFT_ADS_CUSTOMER_ID,
      'CustomerAccountId': MICROSOFT_ADS_ACCOUNT_ID,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Submit error:', response.status, errorText);
    return null;
  }

  const data = await response.json();
  return data.ReportRequestId || null;
}

async function pollReportStatus(reportId) {
  const accessToken = await getAccessToken();
  const endpoint = 'https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Poll';

  for (let attempt = 0; attempt < 30; attempt++) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'DeveloperToken': MICROSOFT_ADS_DEVELOPER_TOKEN,
        'CustomerId': MICROSOFT_ADS_CUSTOMER_ID,
        'CustomerAccountId': MICROSOFT_ADS_ACCOUNT_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ReportRequestId: reportId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Poll error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log(`Poll attempt ${attempt + 1}: ${data.ReportRequestStatus?.Status}`);

    if (data.ReportRequestStatus?.Status === 'Success') {
      return data.ReportRequestStatus.ReportDownloadUrl || null;
    } else if (data.ReportRequestStatus?.Status === 'Error') {
      console.error('Report error:', data.ReportRequestStatus);
      return null;
    }

    await new Promise(r => setTimeout(r, 2000));
  }
  return null;
}

async function downloadAndParseReport(downloadUrl) {
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    console.error('Download failed:', response.status);
    return [];
  }

  const buffer = await response.arrayBuffer();
  let csvText = '';

  try {
    const zip = new AdmZip(Buffer.from(buffer));
    const zipEntries = zip.getEntries();
    for (const entry of zipEntries) {
      if (entry.entryName.endsWith('.csv')) {
        csvText = entry.getData().toString('utf8');
        break;
      }
    }
  } catch {
    csvText = Buffer.from(buffer).toString('utf8');
  }

  if (!csvText) return [];

  // Remove BOM
  if (csvText.charCodeAt(0) === 0xFEFF) {
    csvText = csvText.slice(1);
  }

  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j];
    }
    results.push(row);
  }

  return results;
}

async function fetchDailyAccountPerformance(startDate, endDate) {
  console.log(`\nFetching Microsoft Ads daily data: ${startDate} to ${endDate}`);

  // This is the exact same code as in microsoftAds.ts
  const columns = [
    'TimePeriod',
    'AccountName',
    'Impressions',
    'Clicks',
    'Spend',
    'Conversions',
  ];

  const reportId = await submitReportRequest(columns, { start: startDate, end: endDate }, 'Daily');
  if (!reportId) {
    console.error('Failed to submit report');
    return [];
  }
  console.log('Report ID:', reportId);

  const downloadUrl = await pollReportStatus(reportId);
  if (!downloadUrl) {
    console.error('Failed to get download URL');
    return [];
  }
  console.log('Download URL obtained');

  const results = await downloadAndParseReport(downloadUrl);
  console.log('Raw results:', results.length, 'rows');

  // Transform - same as microsoftAds.ts
  return results.map(row => {
    let dateStr = row.TimePeriod;
    if (dateStr && dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const month = parts[0].padStart(2, '0');
        const day = parts[1].padStart(2, '0');
        const year = parts[2];
        dateStr = `${year}-${month}-${day}`;
      }
    }

    return {
      date: dateStr,
      impressions: parseInt(row.Impressions) || 0,
      clicks: parseInt(row.Clicks) || 0,
      spend: parseFloat(row.Spend) || 0,
      conversions: parseFloat(row.Conversions) || 0,
    };
  });
}

async function test() {
  // Test with same date range as daily report (14 days)
  const today = new Date();
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const startDate = fourteenDaysAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  console.log('=== Testing Microsoft Ads Daily Performance ===');
  console.log(`Date range: ${startDate} to ${endDate}`);

  const dailyData = await fetchDailyAccountPerformance(startDate, endDate);

  console.log('\n=== Results ===');
  console.log('Total days returned:', dailyData.length);

  if (dailyData.length > 0) {
    console.log('\nDaily breakdown:');
    dailyData.forEach(d => {
      console.log(`  ${d.date}: ${d.impressions} impr, ${d.clicks} clicks, $${d.spend.toFixed(2)} spend`);
    });

    // Aggregate by date (same as daily report does)
    const msAdsDataByDate = {};
    dailyData.forEach(record => {
      const { date, impressions, clicks, spend, conversions } = record;
      if (!msAdsDataByDate[date]) {
        msAdsDataByDate[date] = { impressions: 0, clicks: 0, spend: 0, conversions: 0 };
      }
      msAdsDataByDate[date].impressions += impressions || 0;
      msAdsDataByDate[date].clicks += clicks || 0;
      msAdsDataByDate[date].spend += spend || 0;
      msAdsDataByDate[date].conversions += conversions || 0;
    });

    console.log('\nAggregated msAdsDataByDate:');
    Object.entries(msAdsDataByDate).forEach(([date, data]) => {
      console.log(`  ${date}:`, data);
    });

    // Check yesterday specifically (what daily report uses)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    console.log(`\n=== Yesterday (${yesterdayStr}) ===`);
    const yesterdayData = msAdsDataByDate[yesterdayStr];
    if (yesterdayData) {
      console.log('✅ Data found:', yesterdayData);
    } else {
      console.log('❌ No data for yesterday!');
      console.log('Available dates:', Object.keys(msAdsDataByDate));
    }
  } else {
    console.log('❌ No daily data returned!');
  }
}

test().catch(console.error);
