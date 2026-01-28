/**
 * Test Script for Microsoft Ads SearchQuery Report
 * Tests with the corrected column names
 */

require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(60));
console.log('MICROSOFT ADS SEARCH QUERY REPORT TEST');
console.log('='.repeat(60));
console.log('');

const endDate = new Date();
const startDate = new Date();
startDate.setDate(startDate.getDate() - 30);

const startDateStr = startDate.toISOString().split('T')[0];
const endDateStr = endDate.toISOString().split('T')[0];

console.log('Date Range:', startDateStr, 'to', endDateStr);
console.log('');

const MS_CLIENT_ID = process.env.MICROSOFT_ADS_CLIENT_ID;
const MS_CLIENT_SECRET = process.env.MICROSOFT_ADS_CLIENT_SECRET;
const MS_REFRESH_TOKEN = process.env.MICROSOFT_ADS_REFRESH_TOKEN;
const MS_DEVELOPER_TOKEN = process.env.MICROSOFT_ADS_DEVELOPER_TOKEN;
const MS_CUSTOMER_ID = process.env.MICROSOFT_ADS_CUSTOMER_ID;
const MS_ACCOUNT_ID = process.env.MICROSOFT_ADS_ACCOUNT_ID;

async function getAccessToken() {
  const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
    throw new Error('Failed to get access token');
  }
}

async function testSearchQueryReport() {
  const accessToken = await getAccessToken();

  const startParts = startDateStr.split('-');
  const endParts = endDateStr.split('-');

  // Corrected columns for SearchQueryPerformanceReportRequest
  const columns = [
    'SearchQuery',        // Required dimension
    'CampaignName',
    'AdGroupName',
    'Keyword',
    'DeliveredMatchType', // Not MatchType
    'Impressions',
    'Clicks',
    'Spend',
    'Conversions',
  ];

  const requestBody = {
    ReportRequest: {
      ExcludeColumnHeaders: false,
      ExcludeReportFooter: true,
      ExcludeReportHeader: true,
      Format: 'Csv',
      FormatVersion: '2.0',
      ReportName: `SearchQueryReport_${Date.now()}`,
      ReturnOnlyCompleteData: false,
      Aggregation: 'Summary',
      Columns: columns,
      Scope: {
        AccountIds: [parseInt(MS_ACCOUNT_ID)],
      },
      Time: {
        CustomDateRangeStart: { Year: parseInt(startParts[0]), Month: parseInt(startParts[1]), Day: parseInt(startParts[2]) },
        CustomDateRangeEnd: { Year: parseInt(endParts[0]), Month: parseInt(endParts[1]), Day: parseInt(endParts[2]) },
      },
      Type: 'SearchQueryPerformanceReportRequest',
    },
  };

  console.log('📊 Testing SearchQueryPerformanceReportRequest with columns:', columns);
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

  if (response.ok) {
    const data = JSON.parse(responseText);
    console.log('✅ Report ID:', data.ReportRequestId);
    console.log('');
    console.log('Now polling for report...');

    // Poll for completion
    for (let attempt = 0; attempt < 30; attempt++) {
      const pollResp = await fetch('https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Poll', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'DeveloperToken': MS_DEVELOPER_TOKEN,
          'CustomerId': MS_CUSTOMER_ID,
          'CustomerAccountId': MS_ACCOUNT_ID,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ReportRequestId: data.ReportRequestId }),
      });

      const pollData = await pollResp.json();
      const status = pollData.ReportRequestStatus?.Status;
      console.log(`  Attempt ${attempt + 1}: ${status}`);

      if (status === 'Success') {
        console.log('✅ Report ready!');
        console.log('Download URL:', pollData.ReportRequestStatus.ReportDownloadUrl);

        // Download and analyze full report
        const AdmZip = require('adm-zip');
        const dlResp = await fetch(pollData.ReportRequestStatus.ReportDownloadUrl);
        const buffer = await dlResp.arrayBuffer();
        const zip = new AdmZip(Buffer.from(buffer));
        const zipEntries = zip.getEntries();
        for (const entry of zipEntries) {
          if (entry.entryName.endsWith('.csv')) {
            const csvText = entry.getData().toString('utf8');
            const lines = csvText.split('\n');

            // Parse CSV
            const termStats = {};
            let totalSpend = 0;
            let totalClicks = 0;
            let totalConversions = 0;

            for (let i = 1; i < lines.length; i++) {
              if (!lines[i].trim()) continue;
              // Parse CSV with quoted fields
              const match = lines[i].match(/"([^"]*)","([^"]*)","([^"]*)","([^"]*)","([^"]*)","(\d+)","(\d+)","([\d.]+)","([\d.]+)"/);
              if (!match) continue;

              const [, searchQuery, campaign, adGroup, keyword, matchType, impressions, clicks, spend, conversions] = match;

              if (!termStats[searchQuery]) {
                termStats[searchQuery] = { impressions: 0, clicks: 0, spend: 0, conversions: 0 };
              }
              termStats[searchQuery].impressions += parseInt(impressions);
              termStats[searchQuery].clicks += parseInt(clicks);
              termStats[searchQuery].spend += parseFloat(spend);
              termStats[searchQuery].conversions += parseFloat(conversions);

              totalSpend += parseFloat(spend);
              totalClicks += parseInt(clicks);
              totalConversions += parseFloat(conversions);
            }

            console.log('\n=== MICROSOFT ADS ANALYSIS ===\n');

            // Top converting terms
            console.log('--- TOP CONVERTING SEARCH TERMS ---\n');
            const converters = Object.entries(termStats)
              .filter(([, s]) => s.conversions > 0)
              .sort((a, b) => b[1].conversions - a[1].conversions)
              .slice(0, 15);

            if (converters.length === 0) {
              console.log('No converting search terms found.\n');
            } else {
              converters.forEach(([term, s]) => {
                console.log(`"${term}"`);
                console.log(`  Conv: ${s.conversions} | Clicks: ${s.clicks} | Cost: $${s.spend.toFixed(2)} | CPA: $${(s.spend / s.conversions).toFixed(2)}`);
              });
            }

            // Wasted spend
            console.log('\n--- WASTED SPEND (No Conversions, 2+ Clicks) ---\n');
            const wasted = Object.entries(termStats)
              .filter(([, s]) => s.conversions === 0 && s.clicks >= 2)
              .sort((a, b) => b[1].spend - a[1].spend)
              .slice(0, 20);

            if (wasted.length === 0) {
              console.log('No significant wasted spend found!\n');
            } else {
              let wastedTotal = 0;
              wasted.forEach(([term, s]) => {
                console.log(`"${term}"`);
                console.log(`  Clicks: ${s.clicks} | Cost: $${s.spend.toFixed(2)}`);
                wastedTotal += s.spend;
              });
              console.log(`\nTotal wasted (shown): $${wastedTotal.toFixed(2)}`);
            }

            // High volume terms
            console.log('\n--- HIGH VOLUME TERMS (Most Clicks) ---\n');
            Object.entries(termStats)
              .sort((a, b) => b[1].clicks - a[1].clicks)
              .slice(0, 15)
              .forEach(([term, s]) => {
                const convRate = s.clicks > 0 ? (s.conversions / s.clicks * 100).toFixed(1) : '0';
                console.log(`"${term}"`);
                console.log(`  Clicks: ${s.clicks} | Conv: ${s.conversions} | Rate: ${convRate}%`);
              });

            // Summary
            console.log('\n=== SUMMARY ===');
            console.log(`Total Search Terms: ${Object.keys(termStats).length}`);
            console.log(`Total Spend: $${totalSpend.toFixed(2)}`);
            console.log(`Total Clicks: ${totalClicks}`);
            console.log(`Total Conversions: ${totalConversions}`);
            console.log(`Overall CPA: $${totalConversions > 0 ? (totalSpend / totalConversions).toFixed(2) : 'N/A'}`);
            console.log(`Conversion Rate: ${totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0'}%`);
          }
        }
        return;
      } else if (status === 'Error') {
        console.log('❌ Report error:', pollData.ReportRequestStatus);
        return;
      }

      await new Promise(r => setTimeout(r, 2000));
    }
  } else {
    console.log('❌ Submit failed:', responseText);
  }
}

testSearchQueryReport().catch(console.error);
