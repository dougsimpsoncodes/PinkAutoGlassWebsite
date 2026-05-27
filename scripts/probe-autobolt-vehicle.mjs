import crypto from 'node:crypto';
import { config } from 'dotenv';
config({ path: '/Users/dougsimpson/clients/pink-auto-glass/website/.env.local' });

const userId = process.env.AUTOBOLT_USER_ID;
const apiKey = process.env.AUTOBOLT_API_KEY;
const baseUrl = 'https://api.myautobolt.com/v2';
const VIN = process.argv[2];
const PLATE = process.argv[3];
const STATE = process.argv[4];
if (!VIN || !PLATE || !STATE) { console.error('usage: node _temp-probe.mjs <VIN> <PLATE> <STATE>'); process.exit(1); }

function authHeader() {
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = crypto.randomBytes(12).toString('base64url').slice(0, 20);
  const digest = crypto.createHash('sha256').update(`${nonce}${timestamp}${apiKey}`, 'utf8').digest('base64');
  return `AutoBoltAuth version="1", timestamp=${timestamp}, digest="${digest}", nonce="${nonce}", userid="${userId}"`;
}

async function call(path, body) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader(),
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'PinkAutoGlass-OMS/1.0 (+https://pinkautoglass.com; doug@pinkautoglass.com)',
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.text() };
}

function showPart(p, indent) {
  console.log(`${indent}amNumber: ${p.amNumber}  (length=${p.amNumber?.length})`);
  console.log(`${indent}oemPartNumbers: ${(p.oemPartNumbers || []).join(', ') || '(none)'}`);
  console.log(`${indent}features (${p.features?.length || 0}): ${(p.features || []).map(f => f.name).join(', ') || '(none)'}`);
  console.log(`${indent}calibrations (${p.calibrations?.length || 0}): ${(p.calibrations || []).map(c => `${c.calibrationType?.name}→${c.sensor?.name}`).join('; ') || '(none)'}`);
}

console.log(`Probing VIN=${VIN}, Plate=${PLATE}/${STATE}`);

const r1 = await call('/decode', { country: 'US', vin: VIN, kind: 'Windshield' });
const r2 = await call('/decode-plate', { country: 'US', plate: { number: PLATE, state: STATE }, kind: 'Windshield' });

let v1, v2;
try { v1 = JSON.parse(r1.body); } catch { console.log('VIN body non-JSON:', r1.body.slice(0,300)); }
try { v2 = JSON.parse(r2.body); } catch { console.log('Plate body non-JSON:', r2.body.slice(0,300)); }

console.log(`\n--- VIN decode (status ${r1.status}) ---`);
if (v1) {
  console.log(`  Vehicle: ${v1.year} ${v1.make} ${v1.model} (${v1.bodyStyle})`);
  console.log(`  parts: ${v1.parts?.length || 0}`);
  for (const pid of (v1.parts || [])) {
    const p = v1.partsById?.[pid];
    if (p?.kind === 'Single') showPart(p, '    ');
    else console.log(`    (kind=${p?.kind})`);
  }
}

console.log(`\n--- Plate decode (status ${r2.status}) ---`);
if (v2) {
  console.log(`  Vehicle: ${v2.year} ${v2.make} ${v2.model} (${v2.bodyStyle})`);
  console.log(`  Derived VIN: ${v2.vin}  ${v2.vin === VIN ? '✓ matches' : '✗ MISMATCH'}`);
  console.log(`  parts: ${v2.parts?.length || 0}`);
  for (const pid of (v2.parts || [])) {
    const p = v2.partsById?.[pid];
    if (p?.kind === 'Single') showPart(p, '    ');
    else console.log(`    (kind=${p?.kind})`);
  }
}
