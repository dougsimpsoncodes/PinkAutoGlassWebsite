// Probe Mygrant inquireByNags three ways with the Audi e-tron's NAGS data:
//   1. Bare (prefix + 5-digit number only)
//   2. Full variant (prefix + number + color + hardware + premium)
//   3. Raw 11-char string as nagsNumber (no parsing at all)
//
// This tells us how Mygrant treats the variant suffix fields.
//
// Tries all three sequentially. Costs zero AutoBolt lookups.

import { config } from 'dotenv';
config({ path: '/Users/dougsimpson/clients/pink-auto-glass/website/.env.local' });

// We can't import the TS Mygrant client directly from .mjs, so this script builds
// the SOAP envelope inline. Mirror of src/lib/mygrant/client.ts logic.

const OMS_UA = 'PinkAutoGlass-OMS/1.0 (+https://pinkautoglass.com; doug@pinkautoglass.com)';

const config_my = {
  authToken: process.env.MYGRANT_AUTH_TOKEN,
  customerId: process.env.MYGRANT_CUSTOMER_ID,
  webUserId: process.env.MYGRANT_WEB_USER_ID,
  password: process.env.MYGRANT_PASSWORD,
  environment: process.env.MYGRANT_ENVIRONMENT || 'TEST',
  baseUrl: process.env.MYGRANT_BASE_URL,
};

if (!config_my.authToken || !config_my.customerId || !config_my.password || !config_my.baseUrl) {
  console.error('Missing Mygrant env. Check .env.local.');
  process.exit(1);
}

function tag(name, value) { return `<${name}>${escapeXml(String(value))}</${name}>`; }
function optionalTag(name, value) { return value ? tag(name, value) : ''; }
function escapeXml(v) { return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;'); }

function nagsItemXml(item, itemNo) {
  return [
    '<RequestItem>',
    tag('RequestItemNo', itemNo),
    '<RequestDetail>',
    tag('RequestNAGSPrefix', item.nagsPrefix),
    tag('RequestNAGSNumber', item.nagsNumber),
    optionalTag('RequestNAGSColor', item.nagsColor),
    optionalTag('RequestNAGSHardwareIndicator', item.hardwareIndicator),
    optionalTag('RequestNAGSPremiumIndicator', item.premiumIndicator),
    tag('RequestQuantity', 1),
    '</RequestDetail>',
    '</RequestItem>',
  ].join('');
}

function buildXml(items) {
  const itemsXml = items.map((it, i) => nagsItemXml(it, i + 1)).join('');
  const inner = [
    '<MygrantXMLOrderingSystemRequest>',
    '<RequestHeader>',
    tag('EnvironmentID', config_my.environment),
    tag('CustomerID', config_my.customerId),
    tag('CustomerContact', ''),
    tag('WebUserID', config_my.webUserId),
    tag('Password', config_my.password),
    tag('RequestType', 'Inquiry'),
    tag('VersionNumber', '1.0'),
    '</RequestHeader>',
    '<RequestSet>',
    itemsXml,
    '</RequestSet>',
    '</MygrantXMLOrderingSystemRequest>',
  ].join('');
  return [
    '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">',
    '<soapenv:Header/>',
    '<soapenv:Body>',
    '<tem:InboundTraffic>',
    '<tem:request><![CDATA[',
    inner,
    ']]></tem:request>',
    '</tem:InboundTraffic>',
    '</soapenv:Body>',
    '</soapenv:Envelope>',
  ].join('');
}

async function call(item, label) {
  const xml = buildXml([item]);
  const res = await fetch(config_my.baseUrl, {
    method: 'POST',
    headers: {
      Accept: 'text/xml, application/xml',
      'Accept-Encoding': 'gzip,deflate',
      AuthToken: config_my.authToken,
      'Content-Type': 'text/xml;charset=UTF-8',
      SOAPAction: '"http://tempuri.org/InboundTraffic"',
      'User-Agent': OMS_UA,
    },
    body: xml,
  });
  const text = await res.text();

  // Mygrant double-encodes: the inner XML is HTML-escaped inside CDATA. Decode.
  const inner = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');

  const statusCode = (inner.match(/<RequestStatusCode>([^<]*)<\/RequestStatusCode>/) || [])[1] || (inner.match(/<ReturnCode>([^<]*)<\/ReturnCode>/) || [])[1] || '?';
  const statusText = (inner.match(/<RequestStatusText>([^<]*)<\/RequestStatusText>/) || [])[1] || (inner.match(/<ReturnText>([^<]*)<\/ReturnText>/) || [])[1] || '?';
  const responseBlocks = (inner.match(/<Response>[\s\S]*?<\/Response>/g) || []);

  console.log(`\n=== ${label} ===`);
  console.log(`HTTP ${res.status} | Mygrant status: ${statusCode} (${statusText})`);
  console.log(`Response candidates: ${responseBlocks.length}`);

  responseBlocks.slice(0, 5).forEach((block, idx) => {
    const get = (t) => (block.match(new RegExp(`<${t}>([^<]*)</${t}>`)) || [])[1] || '';
    const nagsPrefix = get('ResponseNAGSPrefix');
    const nagsNumber = get('ResponseNAGSNumber');
    const nagsColor = get('ResponseNAGSColor');
    const hwInd = get('ResponseNAGSHardwareIndicator');
    const premInd = get('ResponseNAGSPremiumIndicator');
    const brand = get('ResponseBrand');
    const price = get('CustomerUnitPrice');
    const qty = get('QtyAvailable');
    const branch = get('ResponseShipFromBranchName');
    const desc = get('ResponsePartDesc') || get('ResponsePart');
    console.log(`  [${idx}] ${nagsPrefix}${nagsNumber}${nagsColor}${hwInd}${premInd} | brand=${brand} | price=$${price} | qty=${qty} | ${branch}`);
    if (desc) console.log(`      ${desc.slice(0, 80)}`);
  });

  return { statusCode, statusText, candidates: responseBlocks.length };
}

console.log('Mygrant inquireByNags probe — Audi e-tron amNumber: FW06453GTYN');
console.log('Test 1: bare prefix+number (FW + 06453)');
console.log('Test 2: full variant (FW + 06453 + GT + Y + N)');
console.log('Test 3: raw 11-char as nagsNumber (FW + 06453GTYN)');

const t1 = await call({ nagsPrefix: 'FW', nagsNumber: '06453' }, '1. Bare');
const t2 = await call({ nagsPrefix: 'FW', nagsNumber: '06453', nagsColor: 'GT', hardwareIndicator: 'Y', premiumIndicator: 'N' }, '2. Full variant');
const t3 = await call({ nagsPrefix: 'FW', nagsNumber: '06453GTYN' }, '3. Raw 11-char in nagsNumber');

console.log('\n=== Summary ===');
console.log(`1. Bare           → status ${t1.statusCode}, ${t1.candidates} candidates`);
console.log(`2. Full variant   → status ${t2.statusCode}, ${t2.candidates} candidates`);
console.log(`3. Raw 11-char    → status ${t3.statusCode}, ${t3.candidates} candidates`);
