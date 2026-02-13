import { config } from 'dotenv';
config({ path: '.env.local', override: true });

const tokenEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

async function main() {
  // Get access token
  const tokenResp = await fetch(tokenEndpoint, {
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
  const tokenData = await tokenResp.json();
  const accessToken = tokenData.access_token;
  if (!accessToken) { console.error('No access token:', tokenData); return; }

  const accountId = process.env.MICROSOFT_ADS_ACCOUNT_ID || '';
  const customerId = process.env.MICROSOFT_ADS_CUSTOMER_ID || '';
  const devToken = process.env.MICROSOFT_ADS_DEVELOPER_TOKEN || '';

  // List campaigns
  const resp = await fetch('https://campaign.api.bingads.microsoft.com/CampaignManagement/v13/Campaigns/QueryByAccountId', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'DeveloperToken': devToken,
      'CustomerId': customerId,
      'CustomerAccountId': accountId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      AccountId: parseInt(accountId),
      CampaignType: ['Search', 'Shopping', 'Audience', 'PerformanceMax'],
      ReturnAdditionalFields: 'None',
    }),
  });

  const data = await resp.json();
  if (data.Campaigns) {
    console.log('Campaigns found:', data.Campaigns.length);
    data.Campaigns.forEach((c: any) => {
      console.log(' -', c.Name, '| Type:', c.CampaignType, '| Status:', c.Status);
    });
  } else {
    console.log('Campaign API response:', JSON.stringify(data, null, 2));
  }

  // Now try the search terms report
  console.log('\n--- Submitting SearchQueryPerformanceReport ---');
  const submitResp = await fetch('https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Submit', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'DeveloperToken': devToken,
      'CustomerId': customerId,
      'CustomerAccountId': accountId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ReportRequest: {
        ExcludeColumnHeaders: false,
        ExcludeReportFooter: true,
        ExcludeReportHeader: true,
        Format: 'Csv',
        FormatVersion: '2.0',
        ReportName: 'SearchTermTest',
        ReturnOnlyCompleteData: false,
        Aggregation: 'Summary',
        Columns: ['SearchQuery', 'CampaignName', 'Impressions', 'Clicks', 'Spend', 'Conversions'],
        Scope: { AccountIds: [parseInt(accountId)] },
        Time: {
          CustomDateRangeStart: { Year: 2026, Month: 2, Day: 3 },
          CustomDateRangeEnd: { Year: 2026, Month: 2, Day: 10 },
        },
        Type: 'SearchQueryPerformanceReportRequest',
      },
    }),
  });

  console.log('Submit status:', submitResp.status);
  const submitData = await submitResp.json();
  console.log('Submit response:', JSON.stringify(submitData, null, 2));

  if (!submitData.ReportRequestId) return;

  // Poll
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const pollResp = await fetch('https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Poll', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'DeveloperToken': devToken,
        'CustomerId': customerId,
        'CustomerAccountId': accountId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ReportRequestId: submitData.ReportRequestId }),
    });
    const pollData = await pollResp.json();
    const status = pollData.ReportRequestStatus?.Status;
    console.log(`Poll ${i+1}: ${status}`);

    if (status === 'Success') {
      const url = pollData.ReportRequestStatus?.ReportDownloadUrl;
      console.log('Download URL:', url ? 'present' : 'NULL (no data)');
      if (url) {
        const dlResp = await fetch(url);
        const buf = Buffer.from(await dlResp.arrayBuffer());
        console.log('Download size:', buf.length, 'bytes');
        // Try to read first few bytes
        console.log('First 200 chars:', buf.toString('utf8').slice(0, 200));
      }
      break;
    } else if (status === 'Error') {
      console.log('Report error:', JSON.stringify(pollData, null, 2));
      break;
    }
  }
}

main().catch(e => console.error(e));
