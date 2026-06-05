/**
 * Google Ads Keyword Planner — fetch search volume for luxury auto glass keywords
 * Usage: node scripts/fetch-keyword-planner.js
 */
require('dotenv').config({ path: '.env.local' });
const https = require('https');

async function getAccessToken() {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    grant_type: 'refresh_token'
  });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        const parsed = JSON.parse(data);
        if (!parsed.access_token) throw new Error('Token error: ' + data);
        resolve(parsed.access_token);
      });
    });
    req.on('error', reject);
    req.write(params.toString());
    req.end();
  });
}

async function getKeywordIdeas(accessToken, keywords, geoTargetConstant) {
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
  const body = JSON.stringify({
    geoTargetConstants: [`geoTargetConstants/${geoTargetConstant}`],
    language: 'languageConstants/1000', // English
    keywordSeed: { keywords },
    includeAdultKeywords: false
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'googleads.googleapis.com',
      path: `/v21/customers/${customerId}:generateKeywordIdeas`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Max 20 keywords per request — split into two batches
const KEYWORD_BATCHES = [
  [
    'BMW windshield replacement',
    'BMW windshield repair',
    'Tesla windshield replacement',
    'Tesla windshield repair',
    'Mercedes windshield replacement',
    'Mercedes windshield repair',
    'Audi windshield replacement',
    'Audi windshield repair',
    'Lexus windshield replacement',
    'Lexus windshield repair',
    'Range Rover windshield replacement',
    'Porsche windshield replacement',
    'Volvo windshield replacement',
    'Cadillac windshield replacement',
    'Genesis windshield replacement',
    'windshield replacement Denver',
    'OEM windshield replacement',
    'luxury car windshield replacement',
  ],
  [
    'BMW windshield replacement Denver',
    'Tesla windshield replacement Denver',
    'Mercedes windshield replacement Denver',
    'Audi windshield replacement Denver',
    'Lexus windshield replacement Denver',
    'Range Rover windshield replacement Denver',
    'BMW X5 windshield replacement',
    'Tesla Model Y windshield replacement',
    'ADAS windshield recalibration',
    'ADAS recalibration after windshield replacement',
    'HUD windshield replacement',
    'camera recalibration windshield',
    'OEM windshield replacement Denver',
    'dealer windshield replacement Denver',
    'mobile windshield replacement luxury car',
  ],
];

// Geo: 1014221 = Denver–Aurora–Lakewood DMA, 21136 = Colorado
const GEO_DENVER_DMA = '1014221';
const GEO_US = '2840';

(async () => {
  console.log('Fetching access token...');
  const token = await getAccessToken();
  console.log('✓ Token obtained\n');

  // Run all batches for Denver + US
  console.log('Querying Keyword Planner (Denver DMA + US)...');
  const allDenverResults = [];
  const allUsResults = [];
  for (const batch of KEYWORD_BATCHES) {
    const [d, u] = await Promise.all([
      getKeywordIdeas(token, batch, GEO_DENVER_DMA),
      getKeywordIdeas(token, batch, GEO_US)
    ]);
    allDenverResults.push(d);
    allUsResults.push(u);
  }
  const denverResult = { status: 200, body: { results: allDenverResults.flatMap(r => r.body.results || []) } };
  const usResult = { status: 200, body: { results: allUsResults.flatMap(r => r.body.results || []) } };
  const firstError = allDenverResults.find(r => r.status !== 200) || allUsResults.find(r => r.status !== 200);
  if (firstError) {
    console.error('Error:', JSON.stringify(firstError.body, null, 2).slice(0, 800));
    process.exit(1);
  }

  if (denverResult.status !== 200) {
    console.error('Denver error:', JSON.stringify(denverResult.body, null, 2).slice(0, 800));
    process.exit(1);
  }
  if (usResult.status !== 200) {
    console.error('US error:', JSON.stringify(usResult.body, null, 2).slice(0, 800));
    process.exit(1);
  }

  const compMap = { UNSPECIFIED: '?', UNKNOWN: '?', LOW: 'Low', MEDIUM: 'Med', HIGH: 'High' };

  // Build lookup maps by keyword text
  const denverMap = {};
  (denverResult.body.results || []).forEach(r => {
    denverMap[r.text?.toLowerCase()] = r.keywordIdeaMetrics || {};
  });
  const usMap = {};
  (usResult.body.results || []).forEach(r => {
    usMap[r.text?.toLowerCase()] = r.keywordIdeaMetrics || {};
  });

  // Collect all unique keywords from both results
  const allKeys = new Set([
    ...Object.keys(denverMap),
    ...Object.keys(usMap)
  ]);

  // Filter to relevant ones
  const relevant = [...allKeys].filter(k =>
    k.includes('windshield') || k.includes('adas') || k.includes('hud') || k.includes('oem') || k.includes('glass')
  ).sort();

  console.log('\n=== KEYWORD PLANNER — LUXURY AUTO GLASS ===');
  console.log(`${'Keyword'.padEnd(50)} ${'US/mo'.padStart(8)} ${'Denver/mo'.padStart(10)} ${'Comp'.padStart(6)}`);
  console.log('-'.repeat(80));

  // Group by brand
  const brands = ['bmw', 'tesla', 'mercedes', 'audi', 'lexus', 'range rover', 'porsche', 'volvo', 'cadillac', 'genesis'];
  const shown = new Set();

  for (const brand of [...brands, '_other']) {
    let printed = false;
    for (const key of relevant) {
      if (shown.has(key)) continue;
      if (brand === '_other' && brands.some(b => key.includes(b))) continue;
      if (brand !== '_other' && !key.includes(brand)) continue;

      shown.add(key);
      if (!printed && brand !== '_other') {
        console.log(`\n[${brand.toUpperCase()}]`);
        printed = true;
      }

      const usMetrics = usMap[key] || {};
      const denverMetrics = denverMap[key] || {};
      const usVol = usMetrics.avgMonthlySearches ?? '—';
      const denverVol = denverMetrics.avgMonthlySearches ?? '—';
      const comp = compMap[usMetrics.competition] || '—';
      console.log(`  ${key.padEnd(48)} ${String(usVol).padStart(8)} ${String(denverVol).padStart(10)} ${comp.padStart(6)}`);
    }
  }

  console.log('\n✓ Done. Data from Google Ads Keyword Planner.');
})();
