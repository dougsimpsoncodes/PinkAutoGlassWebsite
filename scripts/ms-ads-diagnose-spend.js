#!/usr/bin/env node
process.env.DOTENV_CONFIG_QUIET = 'true';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const ACCOUNT_ID = process.env.MICROSOFT_ADS_ACCOUNT_ID;
const CUSTOMER_ID = process.env.MICROSOFT_ADS_CUSTOMER_ID;
const DEV_TOKEN = process.env.MICROSOFT_ADS_DEVELOPER_TOKEN;

async function getToken() {
  const res = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
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
  const data = await res.json();
  if (!data.access_token) throw new Error('Auth failed: ' + (data.error_description || data.error));
  return data.access_token;
}

function restHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'DeveloperToken': DEV_TOKEN,
    'CustomerId': CUSTOMER_ID,
    'CustomerAccountId': ACCOUNT_ID,
    'Content-Type': 'application/json',
  };
}

function soapEnvelope(token, bodyXml) {
  return `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Header>
    <AuthenticationToken xmlns="https://bingads.microsoft.com/CampaignManagement/v13">${token}</AuthenticationToken>
    <CustomerAccountId xmlns="https://bingads.microsoft.com/CampaignManagement/v13">${ACCOUNT_ID}</CustomerAccountId>
    <CustomerId xmlns="https://bingads.microsoft.com/CampaignManagement/v13">${CUSTOMER_ID}</CustomerId>
    <DeveloperToken xmlns="https://bingads.microsoft.com/CampaignManagement/v13">${DEV_TOKEN}</DeveloperToken>
  </s:Header>
  <s:Body>${bodyXml}</s:Body>
</s:Envelope>`;
}

async function soapCall(token, action, bodyXml) {
  const res = await fetch('https://campaign.api.bingads.microsoft.com/Api/Advertiser/CampaignManagement/v13/CampaignManagementService.svc', {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction': action },
    body: soapEnvelope(token, bodyXml),
  });
  return res.text();
}

async function submitReport(token, reportRequest) {
  const res = await fetch('https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Submit', {
    method: 'POST',
    headers: restHeaders(token),
    body: JSON.stringify({ ReportRequest: reportRequest }),
  });
  const data = await res.json();
  if (!res.ok || !data.ReportRequestId) throw new Error('Report submit failed: ' + JSON.stringify(data).slice(0, 300));
  return data.ReportRequestId;
}

async function pollReport(token, reportId) {
  for (let i = 0; i < 30; i++) {
    const res = await fetch('https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Poll', {
      method: 'POST',
      headers: restHeaders(token),
      body: JSON.stringify({ ReportRequestId: reportId }),
    });
    const data = await res.json();
    const status = data.ReportRequestStatus?.Status;
    if (status === 'Success') return data.ReportRequestStatus.ReportDownloadUrl;
    if (status === 'Error') throw new Error('Report error: ' + JSON.stringify(data.ReportRequestStatus));
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error('Report poll timed out');
}

async function downloadReport(url) {
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  try {
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(buf);
    for (const entry of zip.getEntries()) {
      if (entry.entryName.endsWith('.csv')) return entry.getData().toString('utf8');
    }
  } catch {
    return buf.toString('utf8');
  }
  return '';
}

function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const headerIdx = lines.findIndex(l => l.includes('Impressions') || l.includes('AdGroupName') || l.includes('TimePeriod'));
  if (headerIdx < 0) return [];
  const headers = lines[headerIdx].split(',').map(h => h.replace(/"/g, '').trim());
  const rows = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    if (!lines[i].trim() || lines[i].startsWith('©')) continue;
    const vals = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
    const row = {};
    headers.forEach((h, idx) => row[h] = vals[idx]);
    rows.push(row);
  }
  return rows;
}

async function main() {
  const token = await getToken();

  // 1. Ad groups + keywords (SOAP — Campaign Management)
  console.log('=== AD GROUP STATUS + KEYWORDS ===');
  const agXml = await soapCall(token, 'GetAdGroupsByCampaignId',
    `<GetAdGroupsByCampaignIdRequest xmlns="https://bingads.microsoft.com/CampaignManagement/v13">
      <CampaignId>523490791</CampaignId>
    </GetAdGroupsByCampaignIdRequest>`);

  const adGroups = [...agXml.matchAll(/<AdGroup>[\s\S]*?<\/AdGroup>/g)];
  const activeAgs = [];
  for (const [agStr] of adGroups) {
    const name = agStr.match(/<Name>(.*?)<\/Name>/)?.[1];
    const status = agStr.match(/<Status>(.*?)<\/Status>/)?.[1];
    const id = agStr.match(/<Id>(.*?)<\/Id>/)?.[1];
    const network = agStr.match(/<Network>(.*?)<\/Network>/)?.[1];
    console.log(`  [${status}] ${name} (id:${id}) network:${network}`);
    if (status === 'Active') activeAgs.push({ id, name });
  }

  for (const ag of activeAgs) {
    const kwXml = await soapCall(token, 'GetKeywordsByAdGroupId',
      `<GetKeywordsByAdGroupIdRequest xmlns="https://bingads.microsoft.com/CampaignManagement/v13">
        <AdGroupId>${ag.id}</AdGroupId>
      </GetKeywordsByAdGroupIdRequest>`);
    const keywords = [...kwXml.matchAll(/<Keyword>[\s\S]*?<\/Keyword>/g)];
    const active = keywords.filter(([k]) => k.match(/<Status>(.*?)<\/Status>/)?.[1] === 'Active');
    const paused = keywords.length - active.length;
    console.log(`\n  ${ag.name}: ${active.length} active, ${paused} paused`);
    for (const [kwStr] of active) {
      const text = kwStr.match(/<Text>(.*?)<\/Text>/)?.[1];
      const match = kwStr.match(/<MatchType>(.*?)<\/MatchType>/)?.[1];
      console.log(`    [${match}] ${text}`);
    }
  }

  // 2. Ad Group performance report (REST — Reporting API)
  console.log('\n=== AD GROUP DAILY PERFORMANCE (last 14 days) ===');
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 14);

  const reportId = await submitReport(token, {
    ExcludeColumnHeaders: false,
    ExcludeReportFooter: true,
    ExcludeReportHeader: true,
    Format: 'Csv',
    FormatVersion: '2.0',
    ReportName: 'DiagnoseSpend',
    ReturnOnlyCompleteData: false,
    Type: 'AdGroupPerformanceReportRequest',
    Aggregation: 'Daily',
    Columns: [
      'TimePeriod', 'AdGroupName', 'Status',
      'Impressions', 'Clicks', 'Spend', 'Conversions',
      'AverageCpc',
      'ImpressionSharePercent', 'ImpressionLostToBudgetPercent', 'ImpressionLostToRankAggPercent',
    ],
    Scope: {
      AccountIds: [parseInt(ACCOUNT_ID)],
    },
    Time: {
      CustomDateRangeStart: { Day: start.getDate(), Month: start.getMonth() + 1, Year: start.getFullYear() },
      CustomDateRangeEnd: { Day: end.getDate(), Month: end.getMonth() + 1, Year: end.getFullYear() },
    },
  });

  console.log('  Polling...');
  const reportUrl = await pollReport(token, reportId);
  const csv = await downloadReport(reportUrl);
  const rows = parseCSV(csv);

  if (!rows.length) { console.log('  No data'); return; }

  // Daily totals
  const byDate = {};
  for (const r of rows) {
    const d = r.TimePeriod || r.GregorianDate;
    if (!d) continue;
    if (!byDate[d]) byDate[d] = { impressions: 0, clicks: 0, spend: 0, conversions: 0, isLostBudget: [], isLostRank: [], isShare: [] };
    byDate[d].impressions += parseInt(r.Impressions || 0);
    byDate[d].clicks += parseInt(r.Clicks || 0);
    byDate[d].spend += parseFloat(r.Spend || 0);
    byDate[d].conversions += parseFloat(r.Conversions || 0);
    if (r.ImpressionLostToBudgetPercent && r.ImpressionLostToBudgetPercent !== '--') byDate[d].isLostBudget.push(parseFloat(r.ImpressionLostToBudgetPercent));
    if (r.ImpressionLostToRankAggPercent && r.ImpressionLostToRankAggPercent !== '--') byDate[d].isLostRank.push(parseFloat(r.ImpressionLostToRankAggPercent));
    if (r.ImpressionSharePercent && r.ImpressionSharePercent !== '--') byDate[d].isShare.push(parseFloat(r.ImpressionSharePercent));
  }

  console.log('\n  Date         Impr  Clicks  Spend     Conv  IS%     Lost→Budget  Lost→Rank');
  for (const d of Object.keys(byDate).sort()) {
    const r = byDate[d];
    const avg = (arr) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) + '%' : '--';
    console.log(`  ${d}  ${String(r.impressions).padStart(5)}  ${String(r.clicks).padStart(6)}  $${r.spend.toFixed(2).padStart(7)}  ${String(r.conversions).padStart(4)}  ${avg(r.isShare).padStart(6)}  ${avg(r.isLostBudget).padStart(11)}  ${avg(r.isLostRank).padStart(9)}`);
  }

  // By ad group totals
  const byAg = {};
  for (const r of rows) {
    const ag = r.AdGroupName;
    if (!byAg[ag]) byAg[ag] = { impressions: 0, clicks: 0, spend: 0, conversions: 0 };
    byAg[ag].impressions += parseInt(r.Impressions || 0);
    byAg[ag].clicks += parseInt(r.Clicks || 0);
    byAg[ag].spend += parseFloat(r.Spend || 0);
    byAg[ag].conversions += parseFloat(r.Conversions || 0);
  }

  console.log('\n  --- By Ad Group (14-day total) ---');
  for (const [name, r] of Object.entries(byAg).sort((a, b) => b[1].spend - a[1].spend)) {
    const cpa = r.conversions ? '$' + (r.spend / r.conversions).toFixed(2) : '-';
    console.log(`  ${name.padEnd(25)} ${String(r.impressions).padStart(5)} impr  ${String(r.clicks).padStart(4)} clicks  $${r.spend.toFixed(2).padStart(7)}  ${r.conversions} conv  CPA:${cpa}`);
  }

  // Summary
  const totalSpend = Object.values(byDate).reduce((s, d) => s + d.spend, 0);
  const days = Object.keys(byDate).length;
  console.log(`\n  TOTAL: $${totalSpend.toFixed(2)} over ${days} days = $${(totalSpend / days).toFixed(2)}/day avg`);
  console.log(`  Budget cap: $50/day (per Campaign Management API)`);
  console.log(`  Utilization: ${(totalSpend / days / 50 * 100).toFixed(0)}%`);
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
