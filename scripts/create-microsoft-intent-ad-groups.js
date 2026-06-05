#!/usr/bin/env node
/**
 * Rebuilds Microsoft Ads PinkAutoGlass campaign with intent-segmented ad groups:
 *   MS - Replacement, MS - Repair, MS - Brand, MS - Insurance
 *
 * Then pauses the old catch-all "Pink Auto Glass 1" ad group.
 */
require('dotenv').config({ path: '.env.local.service' });
const https = require('https');

const CAMPAIGN_ID     = 523490791;
const OLD_AD_GROUP_ID = 1316118104030931;

function msReq(token, path, method, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const req = https.request({
      hostname: 'campaign.api.bingads.microsoft.com',
      path, method,
      headers: {
        'Authorization':    `Bearer ${token}`,
        'DeveloperToken':   process.env.MICROSOFT_ADS_DEVELOPER_TOKEN,
        'CustomerId':       process.env.MICROSOFT_ADS_CUSTOMER_ID,
        'CustomerAccountId': process.env.MICROSOFT_ADS_ACCOUNT_ID,
        'Content-Type':     'application/json',
        'Content-Length':   Buffer.byteLength(postData),
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { resolve({ raw: d }); } });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function getToken() {
  const r = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.MICROSOFT_ADS_CLIENT_ID,
      client_secret: process.env.MICROSOFT_ADS_CLIENT_SECRET,
      grant_type:    'refresh_token',
      refresh_token: process.env.MICROSOFT_ADS_REFRESH_TOKEN,
      scope:         'https://ads.microsoft.com/msads.manage offline_access',
    }),
  });
  const d = await r.json();
  if (!d.access_token) throw new Error('Token failed: ' + JSON.stringify(d));
  return d.access_token;
}

// ── Group definitions ─────────────────────────────────────────────────────────

const GROUPS = [
  {
    name: 'MS - Replacement',
    finalUrl: 'https://pinkautoglass.com/colorado/services/windshield-replacement',
    keywords: [
      { text: 'windshield replacement denver',        match: 'Exact'  },
      { text: 'windshield replacement near me',       match: 'Exact'  },
      { text: 'mobile windshield replacement denver', match: 'Exact'  },
      { text: 'auto glass replacement denver',        match: 'Exact'  },
      { text: 'windshield replacement',               match: 'Phrase' },
      { text: 'auto glass replacement',               match: 'Phrase' },
      { text: 'auto glass repair near me',            match: 'Phrase' },
      { text: 'car windshield replacement',           match: 'Phrase' },
      { text: 'mobile windshield replacement',        match: 'Phrase' },
      { text: 'windshield replacement near me',       match: 'Phrase' },
      { text: 'auto glass near me',                   match: 'Phrase' },
    ],
    headlines: [
      'Denver Windshield Replacement',
      'Same-Day Mobile Service',
      'Get an Instant Quote Online',
      'We Come to You',
      'OEM-Quality Glass',
      'Lifetime Warranty Included',
      'Front Range Coverage',
      'Windshield Replaced Today',
      'Mobile Windshield Experts',
      'Book Your Install Online',
      'Aurora Fort Collins Greeley',
    ],
    descriptions: [
      'We replace your windshield at home or office. Same-day service across Denver Front Range.',
      'OEM glass. Lifetime warranty. ADAS recalibration for 2018+ vehicles included. Book online.',
      'CO law provides $0-deductible windshield coverage. We bill your insurer directly.',
      'Instant quote in 60 seconds. We serve Denver, Aurora, Fort Collins, Greeley, and Loveland.',
    ],
  },
  {
    name: 'MS - Repair',
    finalUrl: 'https://pinkautoglass.com/',
    keywords: [
      { text: 'windshield chip repair denver',    match: 'Exact'  },
      { text: 'windshield chip repair near me',   match: 'Exact'  },
      { text: 'rock chip repair denver',          match: 'Exact'  },
      { text: 'windshield chip repair',           match: 'Phrase' },
      { text: 'rock chip windshield repair',      match: 'Phrase' },
      { text: 'windshield chip repair denver',    match: 'Phrase' },
      { text: 'chip repair near me',              match: 'Phrase' },
    ],
    headlines: [
      'Denver Windshield Chip Repair',
      'Fix a Chip Before It Spreads',
      'Same-Day Mobile Chip Repair',
      'Chips Fixed Fast',
      'We Come to Your Home or Office',
      'Get an Instant Quote Online',
      'Lifetime Warranty on Repairs',
      'Mobile Repair Across Denver',
      'Rock Chip Specialists',
      'Book Same-Day Service',
    ],
    descriptions: [
      'Small chip? We fix it before it becomes a crack. Mobile service across Denver Front Range.',
      'Chip repairs done at your location. Fast, affordable, covered by most insurance policies.',
    ],
  },
  {
    name: 'MS - Brand',
    finalUrl: 'https://pinkautoglass.com/',
    keywords: [
      { text: 'pink auto glass',        match: 'Exact'  },
      { text: 'pink auto glass denver', match: 'Exact'  },
      { text: 'pink auto glass',        match: 'Phrase' },
    ],
    headlines: [
      'Pink Auto Glass Denver',
      'Official Pink Auto Glass Site',
      'Mobile Windshield Service',
      'Same-Day Front Range Service',
      'Get an Instant Quote',
      'We Come to You',
      'OEM Glass. Lifetime Warranty.',
    ],
    descriptions: [
      "Denver's mobile windshield service. We come to you — home, office, or anywhere.",
      'OEM-quality glass, lifetime warranty, and ADAS recalibration included. Same-day available.',
    ],
  },
  {
    name: 'MS - Insurance',
    finalUrl: 'https://pinkautoglass.com/services/insurance-claims/',
    keywords: [
      { text: 'windshield insurance claim denver',       match: 'Exact'  },
      { text: 'windshield insurance denver',             match: 'Phrase' },
      { text: 'insurance windshield replacement denver', match: 'Phrase' },
      { text: 'zero deductible windshield denver',       match: 'Phrase' },
      { text: 'free windshield replacement denver',      match: 'Phrase' },
      { text: 'windshield replacement no deductible',    match: 'Phrase' },
    ],
    headlines: [
      'Windshield Insurance Denver',
      'CO Law: Zero Deductible Glass',
      'We Bill Your Insurance Direct',
      'Zero Out-of-Pocket Cost',
      'We Handle All Paperwork',
      'Free Windshield via Insurance',
      'Same-Day Mobile Service',
      'Get an Instant Quote',
      "Colorado's $0 Glass Coverage",
    ],
    descriptions: [
      'CO law: $0-deductible windshield coverage. We handle all paperwork and bill your insurer.',
      'Mobile service across Denver Front Range. Same-day available. No shop visit needed.',
    ],
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const token = await getToken();

  // Step 1 — Create ad groups
  console.log('\n── Step 1: Creating ad groups ──');
  const agRes = await msReq(token, '/CampaignManagement/v13/AdGroups', 'POST', {
    CampaignId: CAMPAIGN_ID,
    AdGroups: GROUPS.map(g => ({
      Name:     g.name,
      Status:   'Active',
      Language: 'English',
      CpcBid:   { Amount: 5.0 },
    })),
  });

  if (!agRes.AdGroupIds) {
    console.error('Ad group creation failed:', JSON.stringify(agRes));
    process.exit(1);
  }

  GROUPS.forEach((g, i) => {
    g.adGroupId = agRes.AdGroupIds[i];
    console.log(`  ✅ ${g.name} → id:${g.adGroupId}`);
  });

  // Step 2 — Add keywords to each group
  console.log('\n── Step 2: Adding keywords ──');
  for (const g of GROUPS) {
    const kwRes = await msReq(token, '/CampaignManagement/v13/Keywords', 'POST', {
      AdGroupId: g.adGroupId,
      Keywords:  g.keywords.map(k => ({
        Text:      k.text,
        MatchType: k.match,
        Status:    'Active',
      })),
    });
    const errors = (kwRes.PartialErrors || []).filter(Boolean);
    console.log(`  ✅ ${g.name}: ${g.keywords.length - errors.length}/${g.keywords.length} keywords added`);
    if (errors.length) console.log(`     Errors: ${errors.map(e => e.Message).join(', ')}`);
  }

  // Step 3 — Create RSA for each group
  console.log('\n── Step 3: Creating RSAs ──');
  for (const g of GROUPS) {
    const adRes = await msReq(token, '/CampaignManagement/v13/Ads', 'POST', {
      AdGroupId: g.adGroupId,
      Ads: [{
        Type:      'ResponsiveSearch',
        Status:    'Active',
        FinalUrls: { string: [g.finalUrl] },
        Headlines:    g.headlines.map(text => ({ Text: text, PinnedField: null })),
        Descriptions: g.descriptions.map(text => ({ Text: text, PinnedField: null })),
      }],
    });
    const errors = (adRes.PartialErrors || []).filter(Boolean);
    if (!errors.length) {
      console.log(`  ✅ ${g.name}: RSA created → ${g.finalUrl}`);
    } else {
      console.log(`  ❌ ${g.name}: ${errors.map(e => e.Message).join(', ')}`);
    }
  }

  // Step 4 — Pause old catch-all ad group
  console.log('\n── Step 4: Pausing old ad group ──');
  const pauseRes = await msReq(token, '/CampaignManagement/v13/AdGroups', 'PATCH', {
    AdGroups: [{ Id: OLD_AD_GROUP_ID, Status: 'Paused' }],
  });
  const pauseErrors = (pauseRes.PartialErrors || []).filter(Boolean);
  if (!pauseErrors.length) {
    console.log(`  ✅ "Pink Auto Glass 1" (id:${OLD_AD_GROUP_ID}) → PAUSED`);
  } else {
    console.log(`  ❌ Pause failed: ${JSON.stringify(pauseErrors)}`);
  }

  console.log('\n✅ Microsoft Ads rebuild complete. 4 intent-segmented ad groups live.\n');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
