#!/usr/bin/env node
/**
 * Creates 6 intent-segmented ad groups across Denver + Phoenix campaigns:
 *   Denver: Replacement, Repair, Brand, Insurance
 *   Phoenix: Repair, Brand
 *
 * Then pauses the old Denver Keywords catch-all group.
 */
require('dotenv').config({ path: '.env.local.service' });
const { GoogleAdsApi, ResourceNames, enums } = require('google-ads-api');

const CUSTOMER_ID      = '9961188891';
const DENVER_CAMP      = '23241807298';
const PHOENIX_CAMP     = '23805458143';
const OLD_DENVER_KW_AG = '183541239330'; // "Denver Keywords" — paused after migration

const client = new GoogleAdsApi({
  client_id:       process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret:   process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
});
const customer = client.Customer({
  customer_id:   CUSTOMER_ID,
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
});

// ── Group definitions ─────────────────────────────────────────────────────────
// tempId must be unique negative integers within a mutateResources call.

const GROUPS = [
  {
    label:    'Denver - Replacement',
    campaign: DENVER_CAMP,
    tempId:   '-10',
    finalUrl: 'https://pinkautoglass.com/colorado/services/windshield-replacement',
    keywords: [
      { text: 'windshield replacement denver',        match: enums.KeywordMatchType.EXACT },
      { text: 'windshield replacement near me',       match: enums.KeywordMatchType.EXACT },
      { text: 'mobile windshield replacement denver', match: enums.KeywordMatchType.EXACT },
      { text: 'auto glass replacement denver',        match: enums.KeywordMatchType.EXACT },
      { text: 'auto glass',                           match: enums.KeywordMatchType.PHRASE },
      { text: 'auto glass repair',                    match: enums.KeywordMatchType.PHRASE },
      { text: 'auto glass repair near me',            match: enums.KeywordMatchType.PHRASE },
      { text: 'car windshield replacement',           match: enums.KeywordMatchType.PHRASE },
      { text: 'mobile windshield replacement',        match: enums.KeywordMatchType.PHRASE },
      { text: 'windshield replacement',               match: enums.KeywordMatchType.PHRASE },
      { text: 'auto glass replacement near me',       match: enums.KeywordMatchType.PHRASE },
      { text: 'windshield replacement near me',       match: enums.KeywordMatchType.PHRASE },
      { text: 'windshield replacement denver',        match: enums.KeywordMatchType.PHRASE },
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
    label:    'Denver - Repair',
    campaign: DENVER_CAMP,
    tempId:   '-11',
    finalUrl: 'https://pinkautoglass.com/',
    keywords: [
      { text: 'windshield chip repair denver',    match: enums.KeywordMatchType.EXACT },
      { text: 'windshield chip repair near me',   match: enums.KeywordMatchType.EXACT },
      { text: 'rock chip repair denver',          match: enums.KeywordMatchType.EXACT },
      { text: 'windshield chip repair',           match: enums.KeywordMatchType.PHRASE },
      { text: 'rock chip windshield repair',      match: enums.KeywordMatchType.PHRASE },
      { text: 'windshield chip repair denver',    match: enums.KeywordMatchType.PHRASE },
      { text: 'auto glass chip repair denver',    match: enums.KeywordMatchType.PHRASE },
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
    label:    'Denver - Brand',
    campaign: DENVER_CAMP,
    tempId:   '-12',
    finalUrl: 'https://pinkautoglass.com/',
    keywords: [
      { text: 'pink auto glass',        match: enums.KeywordMatchType.EXACT },
      { text: 'pink auto glass denver', match: enums.KeywordMatchType.EXACT },
      { text: 'pink auto glass',        match: enums.KeywordMatchType.PHRASE },
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
    label:    'Denver - Insurance',
    campaign: DENVER_CAMP,
    tempId:   '-13',
    finalUrl: 'https://pinkautoglass.com/services/insurance-claims/',
    keywords: [
      { text: 'windshield insurance claim denver',       match: enums.KeywordMatchType.EXACT },
      { text: 'windshield insurance denver',             match: enums.KeywordMatchType.PHRASE },
      { text: 'insurance windshield replacement denver', match: enums.KeywordMatchType.PHRASE },
      { text: 'zero deductible windshield denver',       match: enums.KeywordMatchType.PHRASE },
      { text: 'free windshield replacement denver',      match: enums.KeywordMatchType.PHRASE },
      { text: 'windshield replacement no deductible',    match: enums.KeywordMatchType.PHRASE },
      { text: 'windshield covered by insurance denver',  match: enums.KeywordMatchType.PHRASE },
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
  {
    label:    'Phoenix - Repair',
    campaign: PHOENIX_CAMP,
    tempId:   '-14',
    finalUrl: 'https://pinkautoglass.com/arizona/',
    keywords: [
      { text: 'windshield chip repair phoenix',    match: enums.KeywordMatchType.EXACT },
      { text: 'windshield chip repair near me',    match: enums.KeywordMatchType.EXACT },
      { text: 'rock chip repair phoenix',          match: enums.KeywordMatchType.PHRASE },
      { text: 'windshield chip repair phoenix',    match: enums.KeywordMatchType.PHRASE },
      { text: 'windshield chip repair scottsdale', match: enums.KeywordMatchType.PHRASE },
    ],
    headlines: [
      'Windshield Chip Repair Phoenix',
      'Fix a Chip Before It Spreads',
      'Same-Day Mobile Chip Repair',
      'Phoenix Mobile Glass Service',
      'We Come to You in Phoenix',
      'Chips Fixed Same Day',
      'Scottsdale Mesa Tempe Gilbert',
      'Get an Instant Quote',
      'Lifetime Warranty on Repairs',
    ],
    descriptions: [
      'Fix chips before Phoenix heat makes them spread. Same-day mobile service across the metro.',
      'Chip repairs done at your home or office. Fast, affordable, covered by most AZ insurance.',
    ],
  },
  {
    label:    'Phoenix - Brand',
    campaign: PHOENIX_CAMP,
    tempId:   '-15',
    finalUrl: 'https://pinkautoglass.com/arizona/',
    keywords: [
      { text: 'pink auto glass',         match: enums.KeywordMatchType.EXACT },
      { text: 'pink auto glass phoenix', match: enums.KeywordMatchType.EXACT },
      { text: 'pink auto glass',         match: enums.KeywordMatchType.PHRASE },
    ],
    headlines: [
      'Pink Auto Glass Phoenix',
      'Official Pink Auto Glass Site',
      'Mobile Windshield Phoenix',
      'Same-Day Phoenix Service',
      'Get an Instant Quote',
      'We Come to You',
      'OEM Glass. Lifetime Warranty.',
      'Phoenix Scottsdale Mesa Tempe',
    ],
    descriptions: [
      "Phoenix's mobile windshield service. We come to you — home, office, or anywhere.",
      'OEM-quality glass, lifetime warranty, ADAS recalibration included. Same-day appointments.',
    ],
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // Build one big batch: ad groups + keywords + RSAs
  console.log('\n── Building operations batch ──');
  const ops = [];

  for (const g of GROUPS) {
    const agResourceName = ResourceNames.adGroup(CUSTOMER_ID, g.tempId);

    // Ad group
    ops.push({
      entity:    'ad_group',
      operation: 'create',
      resource: {
        resource_name: agResourceName,
        campaign:      ResourceNames.campaign(CUSTOMER_ID, g.campaign),
        name:          g.label,
        status:        enums.AdGroupStatus.ENABLED,
        type:          enums.AdGroupType.SEARCH_STANDARD,
      },
    });

    // Keywords
    for (const kw of g.keywords) {
      ops.push({
        entity:    'ad_group_criterion',
        operation: 'create',
        resource: {
          ad_group: agResourceName,
          status:   enums.AdGroupCriterionStatus.ENABLED,
          keyword:  { text: kw.text, match_type: kw.match },
        },
      });
    }

    // RSA
    ops.push({
      entity:    'ad_group_ad',
      operation: 'create',
      resource: {
        ad_group: agResourceName,
        status:   enums.AdGroupAdStatus.ENABLED,
        ad: {
          final_urls: [g.finalUrl],
          responsive_search_ad: {
            headlines:    g.headlines.map(text => ({ text })),
            descriptions: g.descriptions.map(text => ({ text })),
          },
        },
      },
    });

    console.log(`  Queued: ${g.label} (${g.keywords.length} kws + RSA)`);
  }

  console.log(`\n── Sending ${ops.length} operations ──`);
  await customer.mutateResources(ops);
  console.log('  ✅ All ad groups, keywords, and RSAs created.');

  // Pause old Denver Keywords group (separate call — uses real resource name)
  console.log('\n── Pausing old Denver Keywords group ──');
  await customer.mutateResources([{
    entity:    'ad_group',
    operation: 'update',
    resource: {
      resource_name: ResourceNames.adGroup(CUSTOMER_ID, OLD_DENVER_KW_AG),
      status:        enums.AdGroupStatus.PAUSED,
    },
  }]);
  console.log(`  ✅ Denver Keywords (ag:${OLD_DENVER_KW_AG}) → PAUSED`);

  console.log('\n✅ Done. 6 intent-segmented ad groups are live.\n');
}

main().catch(e => {
  console.error('Fatal:', e.errors || e.message || e);
  process.exit(1);
});
