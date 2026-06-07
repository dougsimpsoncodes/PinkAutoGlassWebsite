#!/usr/bin/env node
process.env.DOTENV_CONFIG_QUIET = 'true';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const ACCOUNT_ID = process.env.MICROSOFT_ADS_ACCOUNT_ID;
const CUSTOMER_ID = process.env.MICROSOFT_ADS_CUSTOMER_ID;
const DEV_TOKEN = process.env.MICROSOFT_ADS_DEVELOPER_TOKEN;

const AD_GROUP_ID = '1316118104030931';
const TARGET_KEYWORDS = [
  { text: 'auto glass colorado springs', matchType: 'Phrase' },
  { text: 'windshield replacement colorado springs', matchType: 'Broad' },
];

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

function parseKeywords(xml) {
  const keywords = [];
  for (const [kwStr] of xml.matchAll(/<Keyword>[\s\S]*?<\/Keyword>/g)) {
    const id = kwStr.match(/<Id>(.*?)<\/Id>/)?.[1];
    const text = kwStr.match(/<Text>(.*?)<\/Text>/)?.[1];
    const matchType = kwStr.match(/<MatchType>(.*?)<\/MatchType>/)?.[1];
    const status = kwStr.match(/<Status>(.*?)<\/Status>/)?.[1];
    if (id && text) keywords.push({ id, text, matchType, status });
  }
  return keywords;
}

async function getKeywords(token) {
  const xml = await soapCall(token, 'GetKeywordsByAdGroupId',
    `<GetKeywordsByAdGroupIdRequest xmlns="https://bingads.microsoft.com/CampaignManagement/v13">
      <AdGroupId>${AD_GROUP_ID}</AdGroupId>
    </GetKeywordsByAdGroupIdRequest>`);

  if (xml.includes('Fault') || xml.includes('faultstring')) {
    const fault = xml.match(/<faultstring>(.*?)<\/faultstring>/)?.[1] || xml.slice(0, 300);
    throw new Error('GetKeywords SOAP fault: ' + fault);
  }
  return parseKeywords(xml);
}

async function pauseKeywords(token, keywordIds) {
  const kwXml = keywordIds.map(id => `
    <Keyword>
      <Id>${id}</Id>
      <Status>Paused</Status>
    </Keyword>`).join('');

  const xml = await soapCall(token, 'UpdateKeywords',
    `<UpdateKeywordsRequest xmlns="https://bingads.microsoft.com/CampaignManagement/v13">
      <AdGroupId>${AD_GROUP_ID}</AdGroupId>
      <Keywords>${kwXml}
      </Keywords>
    </UpdateKeywordsRequest>`);

  if (xml.includes('Fault') || xml.includes('faultstring')) {
    const fault = xml.match(/<faultstring>(.*?)<\/faultstring>/)?.[1] || xml.slice(0, 500);
    throw new Error('UpdateKeywords SOAP fault: ' + fault);
  }
  return xml;
}

async function main() {
  console.log('Authenticating...');
  const token = await getToken();
  console.log('Auth OK\n');

  // Step 1: fetch all keywords, find the two CS keywords
  console.log(`=== Fetching keywords for ad group ${AD_GROUP_ID} ===`);
  const keywords = await getKeywords(token);
  console.log(`Found ${keywords.length} total keywords`);

  const topause = [];
  for (const target of TARGET_KEYWORDS) {
    const match = keywords.find(
      kw => kw.text.toLowerCase() === target.text.toLowerCase() &&
            kw.matchType.toLowerCase() === target.matchType.toLowerCase()
    );
    if (!match) {
      console.warn(`  WARNING: "${target.text}" [${target.matchType}] not found`);
    } else {
      console.log(`  Found: "${match.text}" [${match.matchType}] id:${match.id} status:${match.status}`);
      topause.push(match);
    }
  }

  if (topause.length === 0) {
    console.error('No matching keywords found — nothing to pause.');
    process.exit(1);
  }

  // Step 2: pause them
  console.log(`\n=== Pausing ${topause.length} keyword(s) ===`);
  await pauseKeywords(token, topause.map(k => k.id));
  console.log('UpdateKeywords call succeeded\n');

  // Step 3: verify by re-fetching
  console.log('=== Verifying (re-fetching keywords) ===');
  const updated = await getKeywords(token);
  for (const target of topause) {
    const kw = updated.find(k => k.id === target.id);
    const status = kw?.status || 'NOT FOUND';
    const marker = status === 'Paused' ? 'PAUSED' : `UNEXPECTED STATUS: ${status}`;
    console.log(`  "${target.text}" [${target.matchType}] id:${target.id} → ${marker}`);
  }
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
