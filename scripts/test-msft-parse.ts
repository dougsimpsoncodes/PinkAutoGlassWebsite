import { config } from 'dotenv';
config({ path: '.env.local', override: true });
import AdmZip from 'adm-zip';

async function main() {
  // Get access token
  const tokenResp = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_ADS_CLIENT_ID || '',
      client_secret: process.env.MICROSOFT_ADS_CLIENT_SECRET || '',
      refresh_token: process.env.MICROSOFT_ADS_REFRESH_TOKEN || '',
      grant_type: 'refresh_token',
      scope: 'https://ads.microsoft.com/msads.manage',
    }),
  });
  const { access_token: accessToken } = await tokenResp.json();

  const headers = {
    'Authorization': 'Bearer ' + accessToken,
    'DeveloperToken': process.env.MICROSOFT_ADS_DEVELOPER_TOKEN || '',
    'CustomerId': process.env.MICROSOFT_ADS_CUSTOMER_ID || '',
    'CustomerAccountId': process.env.MICROSOFT_ADS_ACCOUNT_ID || '',
    'Content-Type': 'application/json',
  };

  // Submit report
  const submitResp = await fetch('https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Submit', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      ReportRequest: {
        ExcludeColumnHeaders: false,
        ExcludeReportFooter: true,
        ExcludeReportHeader: true,
        Format: 'Csv',
        FormatVersion: '2.0',
        ReportName: 'ParseTest',
        ReturnOnlyCompleteData: false,
        Aggregation: 'Summary',
        Columns: ['SearchQuery', 'CampaignName', 'AdGroupName', 'Keyword', 'DeliveredMatchType', 'Impressions', 'Clicks', 'Spend', 'Conversions'],
        Scope: { AccountIds: [parseInt(process.env.MICROSOFT_ADS_ACCOUNT_ID || '0')] },
        Time: {
          CustomDateRangeStart: { Year: 2026, Month: 2, Day: 3 },
          CustomDateRangeEnd: { Year: 2026, Month: 2, Day: 10 },
        },
        Type: 'SearchQueryPerformanceReportRequest',
      },
    }),
  });
  const { ReportRequestId } = await submitResp.json();
  console.log('Report ID:', ReportRequestId);

  // Poll
  let downloadUrl = '';
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const pollResp = await fetch('https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Poll', {
      method: 'POST', headers,
      body: JSON.stringify({ ReportRequestId }),
    });
    const pollData = await pollResp.json();
    const status = pollData.ReportRequestStatus?.Status;
    if (status === 'Success') {
      downloadUrl = pollData.ReportRequestStatus?.ReportDownloadUrl || '';
      break;
    }
    if (status === 'Error') { console.error('Error:', pollData); return; }
  }

  if (!downloadUrl) { console.log('No download URL'); return; }

  // Download
  const dlResp = await fetch(downloadUrl);
  const buffer = await dlResp.arrayBuffer();
  console.log('Download size:', buffer.byteLength, 'bytes');

  // Parse exactly like microsoftAds.ts does
  let csvText = '';
  try {
    const zip = new AdmZip(Buffer.from(buffer));
    const zipEntries = zip.getEntries();
    console.log('ZIP entries:', zipEntries.length);
    for (const entry of zipEntries) {
      console.log('  Entry:', entry.entryName, 'size:', entry.header.size);
      if (entry.entryName.endsWith('.csv')) {
        csvText = entry.getData().toString('utf8');
        break;
      }
    }
  } catch (e) {
    console.error('ZIP parse failed:', e);
    csvText = Buffer.from(buffer).toString('utf8');
  }

  console.log('\nCSV length:', csvText.length);
  console.log('First 500 chars:\n', csvText.slice(0, 500));

  const lines = csvText.trim().split('\n');
  console.log('\nTotal lines:', lines.length);
  console.log('Header:', lines[0]);
  if (lines.length >= 2) console.log('First data row:', lines[1]);
  if (lines.length >= 3) console.log('Second data row:', lines[2]);
}

main().catch(e => console.error(e));
