#!/usr/bin/env node
process.env.DOTENV_CONFIG_QUIET = 'true';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const ACCOUNT_ID = process.env.MICROSOFT_ADS_ACCOUNT_ID;
const CUSTOMER_ID = process.env.MICROSOFT_ADS_CUSTOMER_ID;
const DEV_TOKEN = process.env.MICROSOFT_ADS_DEVELOPER_TOKEN;
const CAMPAIGN_ID = '523490791';

const NEGATIVES_TO_ADD = [
  '$99 windshield replacement',
  '18 wheeler',
  '20/20 auto glass',
  '2020 auto glass',
  'arizona',
  'arvada',
  'bullseye auto glass',
  'bullseye glass',
  'co springs',
  'colorado springs',
  'commerce city',
  'foco',
  'fort collins',
  'fountain co',
  'fountain colorado',
  'hartford auto glass',
  'hartford glass',
  'jiffy lube auto glass',
  'jiffy lube windshield',
  'lakewood',
  'loveland co',
  'loveland colorado',
  'phoenix auto glass',
  'pittsburgh glass',
  'pittsburgh windshield',
  'pueblo co',
  'pueblo colorado',
  'tavos auto glass denver',
  'the springs',
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

async function main() {
  console.log('Authenticating...');
  const token = await getToken();
  console.log('Auth OK\n');

  const negXml = NEGATIVES_TO_ADD.map(text =>
    `<NegativeKeyword>
       <MatchType>Phrase</MatchType>
       <Text>${text}</Text>
     </NegativeKeyword>`
  ).join('\n');

  console.log(`Adding ${NEGATIVES_TO_ADD.length} campaign-level negative keywords...`);

  const xml = await soapCall(token, 'AddNegativeKeywordsToEntities',
    `<AddNegativeKeywordsToEntitiesRequest xmlns="https://bingads.microsoft.com/CampaignManagement/v13">
      <EntityNegativeKeywords>
        <EntityNegativeKeyword>
          <EntityId>${CAMPAIGN_ID}</EntityId>
          <EntityType>Campaign</EntityType>
          <NegativeKeywords>
            ${negXml}
          </NegativeKeywords>
        </EntityNegativeKeyword>
      </EntityNegativeKeywords>
    </AddNegativeKeywordsToEntitiesRequest>`);

  if (xml.includes('faultstring')) {
    const fault = xml.match(/<faultstring>(.*?)<\/faultstring>/)?.[1] || '';
    const detail = xml.match(/<Message>(.*?)<\/Message>/)?.[1] || '';
    console.error('SOAP fault:', fault, detail);
    console.error('Response (first 1000 chars):', xml.slice(0, 1000));
    process.exit(1);
  }

  const ids = [...xml.matchAll(/<a:long>(.*?)<\/a:long>/g)].map(m => m[1]);
  const errors = [...xml.matchAll(/<BatchError>[\s\S]*?<\/BatchError>/g)];

  console.log(`\nResponse: ${ids.length} IDs returned, ${errors.length} errors`);

  if (errors.length) {
    console.log('\nErrors:');
    for (const [errStr] of errors) {
      const idx = errStr.match(/<Index>(.*?)<\/Index>/)?.[1];
      const code = errStr.match(/<Code>(.*?)<\/Code>/)?.[1];
      const msg = errStr.match(/<Message>(.*?)<\/Message>/)?.[1];
      console.log(`  [${idx}] ${NEGATIVES_TO_ADD[parseInt(idx)] || '?'}: ${code} - ${msg}`);
    }
  }

  const added = ids.filter(id => id !== '0').length;
  console.log(`\nSUCCESS: ${added} negative keywords added to campaign ${CAMPAIGN_ID}`);

  // Verify by re-fetching
  console.log('\n=== Verifying (fetching campaign negatives) ===');
  const verifyXml = await soapCall(token, 'GetNegativeKeywordsByEntityIds',
    `<GetNegativeKeywordsByEntityIdsRequest xmlns="https://bingads.microsoft.com/CampaignManagement/v13">
      <EntityIds xmlns:a="http://schemas.microsoft.com/2003/10/Serialization/Arrays">
        <a:long>${CAMPAIGN_ID}</a:long>
      </EntityIds>
      <EntityType>Campaign</EntityType>
      <ParentEntityId>${CAMPAIGN_ID}</ParentEntityId>
    </GetNegativeKeywordsByEntityIdsRequest>`);

  const allNegs = [...verifyXml.matchAll(/<NegativeKeyword>[\s\S]*?<\/NegativeKeyword>/g)];
  console.log(`Total campaign negatives now: ${allNegs.length}`);

  for (const neg of NEGATIVES_TO_ADD) {
    const found = allNegs.some(([n]) => n.toLowerCase().includes(`<Text>${neg}</Text>`.toLowerCase()));
    console.log(`  ${found ? 'OK' : 'MISSING'}: "${neg}"`);
  }
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
