#!/usr/bin/env node
process.env.DOTENV_CONFIG_QUIET = 'true';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const ACCOUNT_ID = process.env.MICROSOFT_ADS_ACCOUNT_ID;
const CUSTOMER_ID = process.env.MICROSOFT_ADS_CUSTOMER_ID;
const DEV_TOKEN = process.env.MICROSOFT_ADS_DEVELOPER_TOKEN;

const AD_GROUP_ID = '1316118104030931';

// Only pause the BROAD match versions of these exact keyword texts.
// Phrase/Exact match versions of the same text must be left untouched.
const BROAD_TEXTS_TO_PAUSE = new Set([
  'auto glass',
  'auto windshield company',
  'auto car glass',
  'car windshield replacement',
  'mobile windshield replacement',
  'windshield replacement denver',
]);

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
  const res = await fetch(
    'https://campaign.api.bingads.microsoft.com/Api/Advertiser/CampaignManagement/v13/CampaignManagementService.svc',
    {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction': action },
      body: soapEnvelope(token, bodyXml),
    }
  );
  return res.text();
}

function extractKeywords(xml) {
  const keywords = [];
  for (const [kwStr] of xml.matchAll(/<Keyword>[\s\S]*?<\/Keyword>/g)) {
    const id = kwStr.match(/<Id>(.*?)<\/Id>/)?.[1];
    const text = kwStr.match(/<Text>(.*?)<\/Text>/)?.[1];
    const matchType = kwStr.match(/<MatchType>(.*?)<\/MatchType>/)?.[1];
    const status = kwStr.match(/<Status>(.*?)<\/Status>/)?.[1];
    if (id && text && matchType) keywords.push({ id, text, matchType, status });
  }
  return keywords;
}

async function fetchKeywords(token) {
  console.log(`\nFetching keywords for ad group ${AD_GROUP_ID}...`);
  const xml = await soapCall(
    token,
    'GetKeywordsByAdGroupId',
    `<GetKeywordsByAdGroupIdRequest xmlns="https://bingads.microsoft.com/CampaignManagement/v13">
      <AdGroupId>${AD_GROUP_ID}</AdGroupId>
    </GetKeywordsByAdGroupIdRequest>`
  );
  const keywords = extractKeywords(xml);
  if (!keywords.length) {
    // Surface raw XML for debugging if parse fails
    console.error('No keywords parsed. Raw XML snippet:\n', xml.slice(0, 1000));
    throw new Error('No keywords found — check ad group ID or auth');
  }
  return keywords;
}

async function pauseKeywords(token, targets) {
  // Build one <Keyword> update element per target.
  // MS Ads UpdateKeywords: only Id + Status are needed; including Text or MatchType
  // triggers CampaignServiceCannotChangeTextOnUpdate (error 1504) and rejects the row.
  const keywordElements = targets
    .map(
      kw => `<Keyword>
        <Id>${kw.id}</Id>
        <Status>Paused</Status>
      </Keyword>`
    )
    .join('\n');

  const xml = await soapCall(
    token,
    'UpdateKeywords',
    `<UpdateKeywordsRequest xmlns="https://bingads.microsoft.com/CampaignManagement/v13">
      <AdGroupId>${AD_GROUP_ID}</AdGroupId>
      <Keywords>
        ${keywordElements}
      </Keywords>
    </UpdateKeywordsRequest>`
  );
  return xml;
}

async function main() {
  const token = await getToken();
  console.log('Auth OK.');

  // Step 1: Fetch current keyword state
  const before = await fetchKeywords(token);

  console.log('\n=== CURRENT KEYWORDS (all statuses) ===');
  for (const kw of before) {
    console.log(`  [${kw.status.padEnd(6)}] [${kw.matchType.padEnd(6)}] ${kw.text}  (id:${kw.id})`);
  }

  // Step 2: Identify targets — must match BOTH text (case-insensitive) AND Broad match type
  const targets = before.filter(
    kw =>
      kw.matchType === 'Broad' &&
      BROAD_TEXTS_TO_PAUSE.has(kw.text.toLowerCase()) &&
      kw.status !== 'Paused'  // skip already-paused to avoid a no-op update
  );

  const alreadyPaused = before.filter(
    kw =>
      kw.matchType === 'Broad' &&
      BROAD_TEXTS_TO_PAUSE.has(kw.text.toLowerCase()) &&
      kw.status === 'Paused'
  );

  const notFound = [...BROAD_TEXTS_TO_PAUSE].filter(
    text => !before.some(kw => kw.text.toLowerCase() === text && kw.matchType === 'Broad')
  );

  console.log('\n=== PLAN ===');
  if (targets.length) {
    console.log(`Will pause ${targets.length} broad keyword(s):`);
    for (const kw of targets) console.log(`  -> "${kw.text}" [${kw.matchType}] id:${kw.id}`);
  } else {
    console.log('No active broad keywords found to pause.');
  }
  if (alreadyPaused.length) {
    console.log(`Already paused (skipping):`);
    for (const kw of alreadyPaused) console.log(`  -- "${kw.text}" [${kw.matchType}]`);
  }
  if (notFound.length) {
    console.log(`Not found in ad group (not present or wrong match type):`);
    for (const t of notFound) console.log(`  ?? "${t}" [Broad]`);
  }

  if (!targets.length) {
    console.log('\nNothing to update. Exiting.');
    return;
  }

  // Step 3: Pause the targets
  console.log('\nSending UpdateKeywords...');
  const updateXml = await pauseKeywords(token, targets);

  // The API always emits <PartialErrors .../> (self-closing = empty = no errors).
  // A real error contains <BatchError> children inside <PartialErrors>.
  // A SOAP fault is a separate <s:Fault> element.
  const hasFault = updateXml.includes('<s:Fault>') || updateXml.includes('ApiFaultDetail');
  const hasBatchErrors = updateXml.includes('<BatchError>');
  if (hasFault || hasBatchErrors) {
    console.error('API returned a fault or batch errors:\n', updateXml.slice(0, 3000));
    process.exit(1);
  }
  console.log('UpdateKeywords response OK (no errors).');

  // Step 4: Verify by re-fetching
  console.log('\n=== VERIFICATION (re-fetching keywords) ===');
  const after = await fetchKeywords(token);

  let allGood = true;
  for (const kw of after) {
    const wasPausedByUs = targets.some(t => t.id === kw.id);
    const marker = wasPausedByUs ? ' <-- JUST PAUSED' : '';
    console.log(`  [${kw.status.padEnd(6)}] [${kw.matchType.padEnd(6)}] ${kw.text}${marker}`);
    if (wasPausedByUs && kw.status !== 'Paused') {
      console.error(`  ERROR: "${kw.text}" should be Paused but is ${kw.status}`);
      allGood = false;
    }
  }

  if (allGood) {
    console.log(`\nDone. ${targets.length} broad keyword(s) successfully paused.`);
  } else {
    console.error('\nVerification failed — some keywords may not have updated. Review above.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
