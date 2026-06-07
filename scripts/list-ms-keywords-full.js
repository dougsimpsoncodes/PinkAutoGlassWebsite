#!/usr/bin/env node
process.env.DOTENV_CONFIG_QUIET = 'true';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const ACCOUNT_ID = process.env.MICROSOFT_ADS_ACCOUNT_ID;
const CUSTOMER_ID = process.env.MICROSOFT_ADS_CUSTOMER_ID;
const DEV_TOKEN = process.env.MICROSOFT_ADS_DEVELOPER_TOKEN;
const CAMPAIGN_ID = '523490791';

const AD_GROUPS = [
  { id: '1315018814973378', name: 'MS - Replacement' },
  { id: '1316118104030931', name: 'Pink Auto Glass 1' },
  { id: '1316118325513235', name: 'MS - Repair' },
  { id: '1317217837510180', name: 'MS - Brand' },
  { id: '1318317349072821', name: 'MS - Insurance' },
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

function extractAll(xml, tag) {
  const re = new RegExp(`<${tag}>[\\s\\S]*?<\\/${tag}>`, 'g');
  return [...xml.matchAll(re)].map(m => m[0]);
}

function extractOne(str, tag) {
  return str.match(new RegExp(`<${tag}>(.*?)<\\/${tag}>`))?.[1] ?? '';
}

async function main() {
  const token = await getToken();

  // ── 1. Keywords per ad group ──────────────────────────────────────────────
  console.log('=== KEYWORDS BY AD GROUP ===\n');

  for (const ag of AD_GROUPS) {
    const xml = await soapCall(token, 'GetKeywordsByAdGroupId',
      `<GetKeywordsByAdGroupIdRequest xmlns="https://bingads.microsoft.com/CampaignManagement/v13">
        <AdGroupId>${ag.id}</AdGroupId>
      </GetKeywordsByAdGroupIdRequest>`);

    const keywords = extractAll(xml, 'Keyword');

    if (!keywords.length) {
      // Check for a fault
      const fault = xml.match(/<faultstring>(.*?)<\/faultstring>/)?.[1] ?? '';
      const detail = xml.match(/<ErrorCode>(.*?)<\/ErrorCode>/)?.[1] ?? '';
      console.log(`[${ag.name}] (id:${ag.id})`);
      if (fault) console.log(`  ERROR: ${fault} ${detail}`);
      else console.log('  No keywords returned.');
      console.log();
      continue;
    }

    const active = keywords.filter(k => extractOne(k, 'Status') === 'Active');
    const paused = keywords.filter(k => extractOne(k, 'Status') === 'Paused');
    const deleted = keywords.filter(k => extractOne(k, 'Status') === 'Deleted');

    console.log(`[${ag.name}] (id:${ag.id}) — ${active.length} active, ${paused.length} paused, ${deleted.length} deleted`);

    if (active.length) {
      console.log('  ACTIVE:');
      for (const kw of active) {
        const text = extractOne(kw, 'Text');
        const match = extractOne(kw, 'MatchType');
        const bid = extractOne(kw, 'Amount') || 'inherited';
        console.log(`    [${match.padEnd(8)}] ${text}  (bid: ${bid})`);
      }
    }

    if (paused.length) {
      console.log('  PAUSED:');
      for (const kw of paused) {
        const text = extractOne(kw, 'Text');
        const match = extractOne(kw, 'MatchType');
        console.log(`    [${match.padEnd(8)}] ${text}`);
      }
    }

    if (deleted.length) {
      console.log('  DELETED:');
      for (const kw of deleted) {
        const text = extractOne(kw, 'Text');
        const match = extractOne(kw, 'MatchType');
        console.log(`    [${match.padEnd(8)}] ${text}`);
      }
    }

    console.log();
  }

  // ── 2. Campaign-level negative keywords ──────────────────────────────────
  console.log('=== CAMPAIGN-LEVEL NEGATIVE KEYWORDS ===\n');

  const negXml = await soapCall(token, 'GetNegativeKeywordsByEntityIds',
    `<GetNegativeKeywordsByEntityIdsRequest xmlns="https://bingads.microsoft.com/CampaignManagement/v13">
      <EntityIds xmlns:a="http://schemas.microsoft.com/2003/10/Serialization/Arrays">
        <a:long>${CAMPAIGN_ID}</a:long>
      </EntityIds>
      <EntityType>Campaign</EntityType>
      <ParentEntityId>${CAMPAIGN_ID}</ParentEntityId>
    </GetNegativeKeywordsByEntityIdsRequest>`);

  // Check for fault first
  const negFault = negXml.match(/<faultstring>(.*?)<\/faultstring>/)?.[1];
  if (negFault) {
    const errCode = negXml.match(/<ErrorCode>(.*?)<\/ErrorCode>/)?.[1] ?? '';
    console.log(`ERROR: ${negFault} ${errCode}`);
    console.log('Raw response (first 800 chars):');
    console.log(negXml.slice(0, 800));
    return;
  }

  // The response wraps each campaign's negatives in IdCollection / NegativeKeyword
  const negKeywords = extractAll(negXml, 'NegativeKeyword');

  if (!negKeywords.length) {
    console.log('No campaign-level negative keywords found.');
    console.log('(Raw snippet for debug):');
    console.log(negXml.slice(0, 800));
  } else {
    console.log(`Campaign ${CAMPAIGN_ID} — ${negKeywords.length} negative keyword(s):\n`);
    for (const nk of negKeywords) {
      const text = extractOne(nk, 'Text');
      const match = extractOne(nk, 'MatchType');
      const id = extractOne(nk, 'Id');
      console.log(`  [${match.padEnd(8)}] ${text}  (id:${id})`);
    }
  }
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
