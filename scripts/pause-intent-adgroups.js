#!/usr/bin/env node
process.env.DOTENV_CONFIG_QUIET = 'true';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const ACCOUNT_ID = process.env.MICROSOFT_ADS_ACCOUNT_ID;
const CUSTOMER_ID = process.env.MICROSOFT_ADS_CUSTOMER_ID;
const DEV_TOKEN = process.env.MICROSOFT_ADS_DEVELOPER_TOKEN;

const CAMPAIGN_ID = '523490791';

const AD_GROUPS_TO_PAUSE = [
  { id: '1315018814973378', name: 'MS - Replacement' },
  { id: '1316118325513235', name: 'MS - Repair' },
  { id: '1317217837510180', name: 'MS - Brand' },
  { id: '1318317349072821', name: 'MS - Insurance' },
];

const KEEP_ACTIVE_ID = '1316118104030931'; // Pink Auto Glass 1 — do not touch

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

async function main() {
  const token = await getToken();
  console.log('Auth OK\n');

  // Safety check: confirm KEEP_ACTIVE_ID is not in the pause list
  for (const ag of AD_GROUPS_TO_PAUSE) {
    if (ag.id === KEEP_ACTIVE_ID) {
      throw new Error(`SAFETY: ${ag.name} (${ag.id}) is the keep-active group — aborting`);
    }
  }

  // === PAUSE ===
  console.log('=== PAUSING AD GROUPS ===');
  const adGroupsXml = AD_GROUPS_TO_PAUSE.map(ag =>
    `<AdGroup><Id>${ag.id}</Id><Status>Paused</Status></AdGroup>`
  ).join('\n    ');

  const updateXml = await soapCall(token, 'UpdateAdGroups',
    `<UpdateAdGroupsRequest xmlns="https://bingads.microsoft.com/CampaignManagement/v13">
      <CampaignId>${CAMPAIGN_ID}</CampaignId>
      <AdGroups>
        ${adGroupsXml}
      </AdGroups>
    </UpdateAdGroupsRequest>`);

  // Check for SOAP fault
  if (updateXml.includes('faultstring')) {
    const fault = updateXml.match(/<faultstring[^>]*>([\s\S]*?)<\/faultstring>/)?.[1];
    throw new Error('SOAP fault: ' + fault);
  }
  if (updateXml.includes('BatchError') || updateXml.includes('OperationError')) {
    const code = updateXml.match(/<Code>(.*?)<\/Code>/)?.[1];
    const msg = updateXml.match(/<Message>(.*?)<\/Message>/)?.[1];
    throw new Error(`API error ${code}: ${msg}`);
  }

  console.log('UpdateAdGroups response: success (no fault)\n');

  // === VERIFY ===
  console.log('=== VERIFYING VIA GetAdGroupsByCampaignId ===');
  const verifyXml = await soapCall(token, 'GetAdGroupsByCampaignId',
    `<GetAdGroupsByCampaignIdRequest xmlns="https://bingads.microsoft.com/CampaignManagement/v13">
      <CampaignId>${CAMPAIGN_ID}</CampaignId>
    </GetAdGroupsByCampaignIdRequest>`);

  const adGroups = [...verifyXml.matchAll(/<AdGroup>[\s\S]*?<\/AdGroup>/g)];
  for (const [agStr] of adGroups) {
    const name = agStr.match(/<Name>(.*?)<\/Name>/)?.[1];
    const status = agStr.match(/<Status>(.*?)<\/Status>/)?.[1];
    const id = agStr.match(/<Id>(.*?)<\/Id>/)?.[1];
    const marker = id === KEEP_ACTIVE_ID ? ' ← KEEP ACTIVE' : '';
    const paused = AD_GROUPS_TO_PAUSE.find(ag => ag.id === id);
    const expected = paused ? 'Paused' : (id === KEEP_ACTIVE_ID ? 'Active' : '?');
    const ok = expected === '?' || status === expected;
    console.log(`  [${status}] ${name} (id:${id})${marker} ${ok ? '✓' : `✗ EXPECTED ${expected}`}`);
  }
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
