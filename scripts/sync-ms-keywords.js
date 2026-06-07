#!/usr/bin/env node
process.env.DOTENV_CONFIG_QUIET = 'true';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const ACCOUNT_ID = process.env.MICROSOFT_ADS_ACCOUNT_ID;
const CUSTOMER_ID = process.env.MICROSOFT_ADS_CUSTOMER_ID;
const DEV_TOKEN = process.env.MICROSOFT_ADS_DEVELOPER_TOKEN;
const AD_GROUP_ID = '1316118104030931'; // Pink Auto Glass 1

const KEYWORDS_TO_ADD = [
  '$99 windshield replacement',
  '$99 windshield replacement denver',
  '4 bros auto glass',
  '4055 e evans ave',
  '4313 s buckley rd aurora co 80015',
  'a 1 glass depot llc',
  'a auto glass',
  'a glass',
  'a to z glass',
  'a&a glass',
  'a1 auto glass',
  'aa glass',
  'ace glass repair',
  'action auto glass',
  'action auto glass near me',
  'advance industries highlands ranch',
  'all american glass',
  'all around glass',
  'all cracked up tabernash',
  'all star glass',
  'american auto glass',
  'american autoglass',
  'american glass',
  'amobia windshield repair',
  'anchor auto glass loveland co',
  'anders auto glass fort collins colorado',
  "anderson's auto glass",
  "anna's auto glass",
  'anytime auto glass',
  'apex auto glass',
  'arreglo parabrisas cerca de mi',
  'at home windshield repair',
  'ate calibration',
  'auto glass greeley co',
  'auto glass manufacturers near me',
  'auto glass repair',
  'auto glass repair denver',
  'auto glass to go',
  'autoglass repair price',
  'autoplex loveland',
  'best $99 windshield replacement denver',
  'best buy auto glass',
  'broadway autoglass',
  'call fast glass',
  'carefree windshield colorado springs',
  'certified auto parts denver',
  'clear choice auto glass helena mt',
  'colorado mountain auto glass',
  'conifer auto glass',
  'cornerstone glass brush co',
  'cowboy auto glass',
  'crystal auto glass',
  'crystal windshield',
  'elite auto glass',
  'express auto glass',
  'express auto glass greeley',
  'express auto repair colorado springs',
  'fast glass',
  'firestone parker co',
  'freddies auto glass',
  'front range glass',
  'glass guy',
  'glass yes',
  'grandview glass',
  'gwm glass',
  'handy glass loveland',
  'hd auto glass',
  'hd auto glass co',
  'henderson windshield replacement',
  'hv auto glass',
  'hv auto glass denver',
  'insight glass',
  'interstate auto glass',
  'invision auto glass',
  'jd auto glass',
  'jeff auto glass',
  'jiffy auto glass denver',
  'jiffy glass',
  'jiffy windshield replacement',
  'jk auto glass',
  'jn auto glass',
  'js auto glass',
  'king autoglass',
  'kings auto glass',
  'laramie auto glass',
  'latino auto glass',
  'latino auto glass denver co',
  'los primos auto glass',
  'maaco on colfax',
  'masters auto glass',
  'midwest auto glass',
  'mountain air auto glass',
  'mygrant auto glass',
  'national auto glass near me',
  'native glass greeley',
  'next auto glass',
  'paradise auto glass',
  'patriot auto glass',
  'performance auto glass',
  'peterson auto glass',
  'pilkington windshield',
  'pinkerton auto glass',
  'platinum auto glass fort collins',
  'polaris auto glass',
  'precision auto glass',
  'primos auto glass greeley',
  'primos auto glass greeley co',
  'rcc auto glass',
  'rocky auto glass',
  'rocky mountain auto glass',
  'rocky mountain windshield',
  'ryan glass',
  'safe auto glass',
  'safe flight repair',
  'safe flight repair near me',
  'safe glass',
  'safe light',
  'safeco glass company',
  'safelight fort collins',
  'safety auto glass',
  'save auto glass',
  'servicio de vidrios a domicilio',
  'showtime auto glass',
  'sidney auto glass',
  'springs auto glass on platte',
  'summit auto glass',
  'supreme auto glass',
  'tavo auto glass',
  'tavos auto glass denver',
  'ultimate auto glass',
  'ultimate glass',
  'us auto glass',
  'us glass repair',
  'valley auto glass',
  'windshield king',
  'windshield repair',
  'windshield repair grand junction',
  'windshield repair montana',
  'windshield rock chip repair',
  'xtreme auto glass',
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

function xmlEscape(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

async function addKeywordsBatch(token, keywords) {
  const kwXml = keywords.map(text =>
    `<Keyword>
       <MatchType>Broad</MatchType>
       <Status>Active</Status>
       <Text>${xmlEscape(text)}</Text>
     </Keyword>`
  ).join('\n');

  const xml = await soapCall(token, 'AddKeywords',
    `<AddKeywordsRequest xmlns="https://bingads.microsoft.com/CampaignManagement/v13">
      <AdGroupId>${AD_GROUP_ID}</AdGroupId>
      <Keywords>
        ${kwXml}
      </Keywords>
    </AddKeywordsRequest>`);

  if (xml.includes('faultstring')) {
    const fault = xml.match(/<faultstring>(.*?)<\/faultstring>/)?.[1] || '';
    const detail = xml.match(/<Message>(.*?)<\/Message>/)?.[1] || '';
    console.error('SOAP fault:', fault, detail);
    console.error('Response (first 1500 chars):', xml.slice(0, 1500));
    return { added: 0, errors: keywords.length };
  }

  const ids = [...xml.matchAll(/<a:long>(.*?)<\/a:long>/g)].map(m => m[1]);
  const errors = [...xml.matchAll(/<BatchError>[\s\S]*?<\/BatchError>/g)];

  if (errors.length) {
    for (const [errStr] of errors) {
      const idx = errStr.match(/<Index>(.*?)<\/Index>/)?.[1];
      const code = errStr.match(/<Code>(.*?)<\/Code>/)?.[1];
      const msg = errStr.match(/<Message>(.*?)<\/Message>/)?.[1];
      console.log(`  ERROR [${idx}] "${keywords[parseInt(idx)] || '?'}": ${code} - ${msg}`);
    }
  }

  const added = ids.filter(id => id !== '0').length;
  return { added, errors: errors.length };
}

async function main() {
  console.log('Authenticating...');
  const token = await getToken();
  console.log('Auth OK\n');

  console.log(`Adding ${KEYWORDS_TO_ADD.length} BROAD keywords to Pink Auto Glass 1 (${AD_GROUP_ID})...`);
  console.log('Processing in batches of 100...\n');

  let totalAdded = 0;
  let totalErrors = 0;

  for (let i = 0; i < KEYWORDS_TO_ADD.length; i += 100) {
    const batch = KEYWORDS_TO_ADD.slice(i, i + 100);
    console.log(`Batch ${Math.floor(i / 100) + 1}: adding ${batch.length} keywords...`);
    const result = await addKeywordsBatch(token, batch);
    totalAdded += result.added;
    totalErrors += result.errors;
    console.log(`  Added: ${result.added}, Errors: ${result.errors}`);
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total keywords added: ${totalAdded}`);
  console.log(`Total errors: ${totalErrors}`);

  // Verify by re-fetching
  console.log('\n=== Verifying (fetching ad group keywords) ===');
  const verifyXml = await soapCall(token, 'GetKeywordsByAdGroupId',
    `<GetKeywordsByAdGroupIdRequest xmlns="https://bingads.microsoft.com/CampaignManagement/v13">
      <AdGroupId>${AD_GROUP_ID}</AdGroupId>
    </GetKeywordsByAdGroupIdRequest>`);

  const allKws = [...verifyXml.matchAll(/<Keyword>[\s\S]*?<\/Keyword>/g)];
  const active = allKws.filter(([k]) => k.match(/<Status>(.*?)<\/Status>/)?.[1] === 'Active');
  const paused = allKws.filter(([k]) => k.match(/<Status>(.*?)<\/Status>/)?.[1] === 'Paused');
  console.log(`Pink Auto Glass 1 now has: ${active.length} active, ${paused.length} paused keywords`);
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
