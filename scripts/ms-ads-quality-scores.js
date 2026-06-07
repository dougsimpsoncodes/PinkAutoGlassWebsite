#!/usr/bin/env node
// QualityScore is NOT available via GetKeywordsByAdGroupId SOAP.
// It must be fetched via the Reporting API (KeywordPerformanceReport).
// This script combines both: keyword list (SOAP) + QS data (Reporting REST).

process.env.DOTENV_CONFIG_QUIET = 'true';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const ACCOUNT_ID = process.env.MICROSOFT_ADS_ACCOUNT_ID;
const CUSTOMER_ID = process.env.MICROSOFT_ADS_CUSTOMER_ID;
const DEV_TOKEN = process.env.MICROSOFT_ADS_DEVELOPER_TOKEN;

// ── Auth ──────────────────────────────────────────────────────────────────────

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

// ── SOAP (Campaign Management) ────────────────────────────────────────────────

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

// ── REST (Reporting) ──────────────────────────────────────────────────────────

function restHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'DeveloperToken': DEV_TOKEN,
    'CustomerId': CUSTOMER_ID,
    'CustomerAccountId': ACCOUNT_ID,
    'Content-Type': 'application/json',
  };
}

async function submitReport(token, reportRequest) {
  const res = await fetch('https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Submit', {
    method: 'POST',
    headers: restHeaders(token),
    body: JSON.stringify({ ReportRequest: reportRequest }),
  });
  const data = await res.json();
  if (!res.ok || !data.ReportRequestId) throw new Error('Report submit failed: ' + JSON.stringify(data).slice(0, 400));
  return data.ReportRequestId;
}

async function pollReport(token, reportId) {
  process.stdout.write('  Polling report');
  for (let i = 0; i < 30; i++) {
    const res = await fetch('https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Poll', {
      method: 'POST',
      headers: restHeaders(token),
      body: JSON.stringify({ ReportRequestId: reportId }),
    });
    const data = await res.json();
    const status = data.ReportRequestStatus?.Status;
    if (status === 'Success') { console.log(' done'); return data.ReportRequestStatus.ReportDownloadUrl; }
    if (status === 'Error') throw new Error('Report error: ' + JSON.stringify(data.ReportRequestStatus));
    process.stdout.write('.');
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
  const headerIdx = lines.findIndex(l => l.includes('Keyword') || l.includes('QualityScore'));
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

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const token = await getToken();
  console.log('Auth OK\n');

  const AD_GROUP_ID = '1316118104030931';
  const AD_GROUP_NAME = 'Pink Auto Glass 1';

  // Step 1: Get keyword list via SOAP
  console.log(`Fetching keyword list for ${AD_GROUP_NAME}...`);
  const kwXml = await soapCall(token, 'GetKeywordsByAdGroupId',
    `<GetKeywordsByAdGroupIdRequest xmlns="https://bingads.microsoft.com/CampaignManagement/v13">
      <AdGroupId>${AD_GROUP_ID}</AdGroupId>
    </GetKeywordsByAdGroupIdRequest>`);

  const kwMatches = [...kwXml.matchAll(/<Keyword>[\s\S]*?<\/Keyword>/g)];
  if (!kwMatches.length) {
    console.log('No keywords returned. Raw snippet:');
    console.log(kwXml.slice(0, 1500));
    return;
  }

  const keywords = kwMatches.map(([kwStr]) => ({
    id:     kwStr.match(/<Id>(.*?)<\/Id>/)?.[1] ?? '?',
    text:   kwStr.match(/<Text>(.*?)<\/Text>/)?.[1] ?? '(unknown)',
    match:  kwStr.match(/<MatchType>(.*?)<\/MatchType>/)?.[1] ?? '?',
    status: kwStr.match(/<Status>(.*?)<\/Status>/)?.[1] ?? '?',
  }));

  console.log(`Found ${keywords.length} keywords (${keywords.filter(k => k.status === 'Active').length} active)\n`);

  // Step 2: Pull QS via KeywordPerformanceReport (last 30 days for coverage)
  console.log('Requesting KeywordPerformanceReport for QualityScore data...');
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);

  const reportId = await submitReport(token, {
    ExcludeColumnHeaders: false,
    ExcludeReportFooter: true,
    ExcludeReportHeader: true,
    Format: 'Csv',
    FormatVersion: '2.0',
    ReportName: 'KeywordQualityScores',
    ReturnOnlyCompleteData: false,
    Type: 'KeywordPerformanceReportRequest',
    Aggregation: 'Summary',
    // Valid KeywordPerformanceReportColumn enum values (v13). Note: LandingPageExperience, NOT LandingPageRelevance.
    Columns: [
      'AdGroupId', 'AdGroupName', 'KeywordId', 'Keyword', 'KeywordStatus',
      'BidMatchType', 'QualityScore', 'AdRelevance', 'LandingPageExperience', 'ExpectedCtr',
      'Impressions', 'Clicks',
    ],
    Scope: {
      AccountIds: [parseInt(ACCOUNT_ID)],
    },
    Time: {
      CustomDateRangeStart: { Day: start.getDate(), Month: start.getMonth() + 1, Year: start.getFullYear() },
      CustomDateRangeEnd: { Day: end.getDate(), Month: end.getMonth() + 1, Year: end.getFullYear() },
    },
  });

  const reportUrl = await pollReport(token, reportId);
  const csv = await downloadReport(reportUrl);
  const rows = parseCSV(csv);

  // Step 3: Join keyword list with QS data by KeywordId
  const qsByKeywordId = {};
  for (const row of rows) {
    const kid = row['KeywordId'] || row['Keyword Id'];
    if (kid) qsByKeywordId[kid] = row;
  }

  // Step 4: Output
  console.log(`\n=== KEYWORD QUALITY SCORES: ${AD_GROUP_NAME} ===\n`);
  console.log(`${'Keyword'.padEnd(42)} ${'Match'.padEnd(8)} ${'Status'.padEnd(7)} ${'QS'.padEnd(4)} ${'AdRel'.padEnd(7)} ${'LPRel'.padEnd(7)} ${'ExpCTR'.padEnd(8)} ${'Impr'.padEnd(7)} Clicks`);
  console.log('-'.repeat(110));

  let noQSCount = 0;
  for (const kw of keywords) {
    const qs = qsByKeywordId[kw.id];
    const qsScore  = qs?.QualityScore     ?? qs?.['Quality Score']     ?? '--';
    const adRel    = qs?.AdRelevance          ?? qs?.['Ad Relevance']          ?? '--';
    const lpRel    = qs?.LandingPageExperience ?? qs?.['Landing Page Experience'] ?? '--';
    const expCtr   = qs?.ExpectedCtr      ?? qs?.['Expected Ctr']      ?? '--';
    const impr     = qs?.Impressions      ?? '--';
    const clicks   = qs?.Clicks           ?? '--';

    if (qsScore === '--') noQSCount++;

    console.log(
      `${kw.text.slice(0, 41).padEnd(42)} ${kw.match.slice(0, 7).padEnd(8)} ${kw.status.slice(0, 6).padEnd(7)} ${String(qsScore).padEnd(4)} ${String(adRel).padEnd(7)} ${String(lpRel).padEnd(7)} ${String(expCtr).padEnd(8)} ${String(impr).padEnd(7)} ${clicks}`
    );
  }

  console.log('-'.repeat(110));

  if (rows.length && !keywords.some(k => qsByKeywordId[k.id])) {
    // Report returned rows but none matched by keyword ID — show raw report rows
    console.log('\nNOTE: Report rows exist but did not join by KeywordId. Showing raw report rows:\n');
    console.log(`${'Keyword'.padEnd(42)} ${'Match'.padEnd(8)} ${'Status'.padEnd(7)} ${'QS'.padEnd(4)} ${'AdRel'.padEnd(7)} ${'LPRel'.padEnd(7)} ${'ExpCTR'.padEnd(8)} ${'Impr'.padEnd(7)} Clicks`);
    console.log('-'.repeat(110));
    for (const row of rows) {
      const kw     = (row['Keyword'] || '').slice(0, 41).padEnd(42);
      const match  = (row['MatchType'] || row['Match Type'] || '').slice(0, 7).padEnd(8);
      const status = (row['KeywordStatus'] || row['Keyword Status'] || '').slice(0, 6).padEnd(7);
      const qs     = String(row['QualityScore'] || row['Quality Score'] || '--').padEnd(4);
      const adRel  = String(row['AdRelevance'] || row['Ad Relevance'] || '--').padEnd(7);
      const lpRel  = String(row['LandingPageExperience'] || row['Landing Page Experience'] || '--').padEnd(7);
      const expCtr = String(row['ExpectedCtr'] || row['Expected Ctr'] || '--').padEnd(8);
      const impr   = String(row['Impressions'] || '--').padEnd(7);
      const clicks = String(row['Clicks'] || '--');
      console.log(`${kw} ${match} ${status} ${qs} ${adRel} ${lpRel} ${expCtr} ${impr} ${clicks}`);
    }
  }

  console.log(`\nSummary: ${keywords.length} keywords total, ${noQSCount} missing QS data`);
  if (noQSCount > 0 && rows.length === 0) {
    console.log('No report rows returned — keywords may have zero impressions in the last 30 days.');
    console.log('QualityScore requires at least some search traffic to be populated by MS Ads.');
  }
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
