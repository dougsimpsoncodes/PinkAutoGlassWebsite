#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { GoogleAdsApi, ResourceNames, resources, enums, toMicros } = require('google-ads-api');

const DRY_RUN = process.argv.includes('--dry-run');
const budgetArgIndex = process.argv.findIndex(a => a === '--daily-budget');
const DAILY_BUDGET = budgetArgIndex !== -1 ? Number(process.argv[budgetArgIndex + 1]) : null;

const CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/[-\s]/g, '');
const LOGIN_CUSTOMER_ID = (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || '').replace(/[-\s]/g, '') || undefined;
const CAMPAIGN_NAME = 'Phoenix | Windshield Replacement';
const BUDGET_NAME = `${CAMPAIGN_NAME} | Budget`;
const REPLACEMENT_ADGROUP = 'Core Replacement';
const INSURANCE_ADGROUP = 'Insurance / Zero-Deductible Replacement';
const DEFAULT_NEGATIVE_CSV = path.resolve(__dirname, '../data/google-ads/phoenix-negative-keywords-upload.csv');

const GEO_TARGETS = [
  'Phoenix,Arizona,United States',
  'Scottsdale,Arizona,United States',
  'Mesa,Arizona,United States',
  'Tempe,Arizona,United States',
];

const KEYWORDS = {
  [REPLACEMENT_ADGROUP]: {
    exact: [
      'windshield replacement phoenix',
      'windshield replacement near me',
      'mobile windshield replacement phoenix',
      'auto glass replacement phoenix',
      'car windshield replacement phoenix',
      'same day windshield replacement phoenix',
      'windshield replacement scottsdale',
      'windshield replacement mesa',
      'windshield replacement tempe',
    ],
    phrase: [
      'windshield replacement phoenix',
      'mobile windshield replacement phoenix',
      'auto glass replacement phoenix',
      'same day windshield replacement',
      'windshield replacement near me',
      'windshield replacement scottsdale',
      'windshield replacement mesa',
      'windshield replacement tempe',
    ],
  },
  [INSURANCE_ADGROUP]: {
    exact: [
      'insurance windshield replacement phoenix',
      'windshield insurance claim phoenix',
      'zero deductible windshield replacement phoenix',
      'free windshield replacement phoenix',
      'arizona windshield insurance claim',
      'phoenix auto glass insurance claim',
    ],
    phrase: [
      'insurance windshield replacement phoenix',
      'windshield insurance claim phoenix',
      'zero deductible windshield replacement phoenix',
      'free windshield replacement phoenix',
      'arizona windshield insurance claim',
    ],
  },
};

const ADS = {
  [REPLACEMENT_ADGROUP]: {
    finalUrl: 'https://pinkautoglass.com/arizona/services/windshield-replacement/',
    path1: 'arizona',
    path2: 'replacement',
    headlines: [
      'Windshield Replacement Phoenix',
      'Mobile Windshield Replacement',
      'Same-Day Service Available',
      'We Come To You',
      'Phoenix Auto Glass Replacement',
      'Windshield Near You',
      'Scottsdale Windshield',
      'Mesa Windshield Replacement',
      'Tempe Windshield Replacement',
      'Fast Mobile Auto Glass Service',
      'OEM-Quality Windshield Glass',
      'Easy Phone Quote In Minutes',
      'Insurance Help Available',
      'Book Mobile Service Today',
      'Trusted Phoenix Metro Service',
    ],
    descriptions: [
      'Mobile windshield replacement in Phoenix metro. Fast quotes and easy scheduling.',
      'Need replacement fast? We come to your home or office with mobile service.',
      'Phoenix metro replacement with mobile service, clear pricing, and insurance help.',
      'Call now for a fast replacement quote and easy scheduling.',
    ],
  },
  [INSURANCE_ADGROUP]: {
    finalUrl: 'https://pinkautoglass.com/arizona/services/insurance-claims/arizona/',
    path1: 'arizona',
    path2: 'insurance',
    headlines: [
      'Zero Deductible Windshield AZ',
      'Phoenix Insurance Help',
      'Free Windshield Replacement AZ',
      'We Handle Insurance Claims',
      'Arizona Glass Coverage',
      'Windshield Claim Phoenix',
      '$0 Windshield Replacement AZ',
      'Phoenix Mobile Replacement',
      'Scottsdale Insurance Glass',
      'Mesa Insurance Help',
      'Tempe Windshield Claim',
      'We Bill Insurance Directly',
      'Replace Your Windshield Fast',
      'Phoenix Drivers May Be Covered',
      'Call For Coverage Check',
    ],
    descriptions: [
      'Arizona drivers may qualify for zero-deductible replacement. We help with the claim.',
      'Phoenix metro windshield replacement with insurance support. We handle paperwork.',
      'Use Arizona glass coverage for windshield replacement in Phoenix metro.',
      'Call now for a quick coverage check and mobile replacement quote.',
    ],
  },
};

function getClient() {
  return new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  });
}

function getCustomer() {
  return getClient().Customer({
    customer_id: CUSTOMER_ID,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    login_customer_id: LOGIN_CUSTOMER_ID,
  });
}

function readNegatives() {
  const raw = fs.readFileSync(DEFAULT_NEGATIVE_CSV, 'utf8').trim();
  const lines = raw.split(/\r?\n/);
  const rows = lines.slice(1).map(line => {
    const idx = line.lastIndexOf(',');
    return {
      keyword: line.slice(0, idx),
      matchType: line.slice(idx + 1),
    };
  });
  return rows;
}

function matchTypeEnum(matchType) {
  const map = {
    Exact: enums.KeywordMatchType.EXACT,
    Phrase: enums.KeywordMatchType.PHRASE,
    Broad: enums.KeywordMatchType.BROAD,
  };
  return map[matchType];
}

async function ensureNoDuplicates(customer) {
  const existingCampaigns = await customer.query(`
    SELECT campaign.id, campaign.name, campaign.status
    FROM campaign
    WHERE campaign.name = '${CAMPAIGN_NAME.replace(/'/g, "\\'")}'
  `);
  if (existingCampaigns.length > 0) {
    throw new Error(`Campaign already exists: ${CAMPAIGN_NAME}`);
  }
}

async function resolveGeoTargets(customer) {
  const names = GEO_TARGETS.map(name => `'${name.replace(/'/g, "\\'")}'`).join(', ');
  const rows = await customer.query(`
    SELECT geo_target_constant.resource_name,
           geo_target_constant.canonical_name,
           geo_target_constant.target_type,
           geo_target_constant.status
    FROM geo_target_constant
    WHERE geo_target_constant.canonical_name IN (${names})
  `);
  const map = new Map(rows.map(r => [r.geo_target_constant.canonical_name, r.geo_target_constant.resource_name]));
  for (const target of GEO_TARGETS) {
    if (!map.has(target)) throw new Error(`Geo target not found: ${target}`);
  }
  return GEO_TARGETS.map(target => ({ canonicalName: target, resourceName: map.get(target) }));
}

function buildAdGroupAdResource(adGroupResourceName, cfg) {
  return {
    ad_group: adGroupResourceName,
    status: enums.AdGroupAdStatus.PAUSED,
    ad: {
      type: enums.AdType.RESPONSIVE_SEARCH_AD,
      final_urls: [cfg.finalUrl],
      responsive_search_ad: {
        headlines: cfg.headlines.map(text => ({ text })),
        descriptions: cfg.descriptions.map(text => ({ text })),
        path1: cfg.path1,
        path2: cfg.path2,
      },
    },
  };
}

function buildCreateOps(geoTargets, negatives) {
  const budgetResourceName = ResourceNames.campaignBudget(CUSTOMER_ID, '-1');
  const campaignResourceName = ResourceNames.campaign(CUSTOMER_ID, '-2');
  const replacementAdGroupResourceName = ResourceNames.adGroup(CUSTOMER_ID, '-3');
  const insuranceAdGroupResourceName = ResourceNames.adGroup(CUSTOMER_ID, '-4');

  const ops = [
    {
      entity: 'campaign_budget',
      operation: 'create',
      resource: {
        resource_name: budgetResourceName,
        name: BUDGET_NAME,
        delivery_method: enums.BudgetDeliveryMethod.STANDARD,
        amount_micros: toMicros(DAILY_BUDGET),
        explicitly_shared: false,
      },
    },
    {
      entity: 'campaign',
      operation: 'create',
      resource: {
        resource_name: campaignResourceName,
        name: CAMPAIGN_NAME,
        advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
        status: enums.CampaignStatus.PAUSED,
        campaign_budget: budgetResourceName,
        manual_cpc: { enhanced_cpc_enabled: false },
        contains_eu_political_advertising: enums.EuPoliticalAdvertisingStatus.DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING,
        network_settings: {
          target_google_search: true,
          target_search_network: false,
          target_partner_search_network: false,
          target_content_network: false,
        },
        geo_target_type_setting: {
          positive_geo_target_type: enums.PositiveGeoTargetType.PRESENCE,
        },
      },
    },
    {
      entity: 'ad_group',
      operation: 'create',
      resource: {
        resource_name: replacementAdGroupResourceName,
        campaign: campaignResourceName,
        name: REPLACEMENT_ADGROUP,
        status: enums.AdGroupStatus.ENABLED,
        type: enums.AdGroupType.SEARCH_STANDARD,
      },
    },
    {
      entity: 'ad_group',
      operation: 'create',
      resource: {
        resource_name: insuranceAdGroupResourceName,
        campaign: campaignResourceName,
        name: INSURANCE_ADGROUP,
        status: enums.AdGroupStatus.ENABLED,
        type: enums.AdGroupType.SEARCH_STANDARD,
      },
    },
  ];

  for (const geo of geoTargets) {
    ops.push({
      entity: 'campaign_criterion',
      operation: 'create',
      resource: {
        campaign: campaignResourceName,
        location: { geo_target_constant: geo.resourceName },
      },
    });
  }

  for (const kw of KEYWORDS[REPLACEMENT_ADGROUP].exact) {
    ops.push({
      entity: 'ad_group_criterion',
      operation: 'create',
      resource: {
        ad_group: replacementAdGroupResourceName,
        status: enums.AdGroupCriterionStatus.ENABLED,
        keyword: { text: kw, match_type: enums.KeywordMatchType.EXACT },
      },
    });
  }
  for (const kw of KEYWORDS[REPLACEMENT_ADGROUP].phrase) {
    ops.push({
      entity: 'ad_group_criterion',
      operation: 'create',
      resource: {
        ad_group: replacementAdGroupResourceName,
        status: enums.AdGroupCriterionStatus.ENABLED,
        keyword: { text: kw, match_type: enums.KeywordMatchType.PHRASE },
      },
    });
  }
  for (const kw of KEYWORDS[INSURANCE_ADGROUP].exact) {
    ops.push({
      entity: 'ad_group_criterion',
      operation: 'create',
      resource: {
        ad_group: insuranceAdGroupResourceName,
        status: enums.AdGroupCriterionStatus.ENABLED,
        keyword: { text: kw, match_type: enums.KeywordMatchType.EXACT },
      },
    });
  }
  for (const kw of KEYWORDS[INSURANCE_ADGROUP].phrase) {
    ops.push({
      entity: 'ad_group_criterion',
      operation: 'create',
      resource: {
        ad_group: insuranceAdGroupResourceName,
        status: enums.AdGroupCriterionStatus.ENABLED,
        keyword: { text: kw, match_type: enums.KeywordMatchType.PHRASE },
      },
    });
  }

  for (const neg of negatives) {
    const mt = matchTypeEnum(neg.matchType);
    if (!mt) throw new Error(`Unknown negative match type: ${neg.matchType}`);
    ops.push({
      entity: 'campaign_criterion',
      operation: 'create',
      resource: {
        campaign: campaignResourceName,
        negative: true,
        keyword: {
          text: neg.keyword,
          match_type: mt,
        },
      },
    });
  }

  ops.push({
    entity: 'ad_group_ad',
    operation: 'create',
    resource: buildAdGroupAdResource(replacementAdGroupResourceName, ADS[REPLACEMENT_ADGROUP]),
  });
  ops.push({
    entity: 'ad_group_ad',
    operation: 'create',
    resource: buildAdGroupAdResource(insuranceAdGroupResourceName, ADS[INSURANCE_ADGROUP]),
  });

  return ops;
}

async function findCreatedResources(customer) {
  const campaigns = await customer.query(`
    SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type,
           campaign.network_settings.target_google_search,
           campaign.network_settings.target_search_network,
           campaign.network_settings.target_partner_search_network,
           campaign.network_settings.target_content_network,
           campaign.geo_target_type_setting.positive_geo_target_type,
           campaign.geo_target_type_setting.negative_geo_target_type,
           campaign.campaign_budget
    FROM campaign
    WHERE campaign.name = '${CAMPAIGN_NAME.replace(/'/g, "\\'")}'
  `);
  const adGroups = await customer.query(`
    SELECT ad_group.id, ad_group.name, ad_group.status, campaign.name
    FROM ad_group
    WHERE campaign.name = '${CAMPAIGN_NAME.replace(/'/g, "\\'")}'
  `);
  const criteria = await customer.query(`
    SELECT campaign_criterion.type, campaign_criterion.negative,
           campaign_criterion.location.geo_target_constant,
           campaign_criterion.keyword.text,
           campaign_criterion.keyword.match_type,
           campaign.name
    FROM campaign_criterion
    WHERE campaign.name = '${CAMPAIGN_NAME.replace(/'/g, "\\'")}'
  `);
  const keywords = await customer.query(`
    SELECT ad_group.name, ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ad_group_criterion.negative
    FROM ad_group_criterion
    WHERE campaign.name = '${CAMPAIGN_NAME.replace(/'/g, "\\'")}'
      AND ad_group_criterion.type = 'KEYWORD'
  `);
  const ads = await customer.query(`
    SELECT ad_group.name, ad_group_ad.status, ad_group_ad.ad.id, ad_group_ad.ad.final_urls
    FROM ad_group_ad
    WHERE campaign.name = '${CAMPAIGN_NAME.replace(/'/g, "\\'")}'
  `);
  return { campaigns, adGroups, criteria, keywords, ads };
}

async function main() {
  if (!DRY_RUN && (!DAILY_BUDGET || Number.isNaN(DAILY_BUDGET) || DAILY_BUDGET <= 0)) {
    throw new Error('Live run requires --daily-budget <positive number>');
  }

  const customer = getCustomer();
  console.log(DRY_RUN ? '=== DRY RUN ===' : '=== LIVE RUN ===');
  console.log(`Campaign: ${CAMPAIGN_NAME}`);
  if (DAILY_BUDGET) console.log(`Daily budget: $${DAILY_BUDGET}`);

  await ensureNoDuplicates(customer);
  const geoTargets = await resolveGeoTargets(customer);
  const negatives = readNegatives();
  const ops = buildCreateOps(geoTargets, negatives);

  console.log(`Geo targets resolved: ${geoTargets.map(g => g.canonicalName).join(', ')}`);
  console.log(`Will create ${ops.length} mutate operations before ad creation`);
  console.log(`Negative keywords to apply: ${negatives.length}`);
  console.log(`Positive keywords to create: ${Object.values(KEYWORDS).reduce((sum, g) => sum + g.exact.length + g.phrase.length, 0)}`);

  if (DRY_RUN) return;

  const result = await customer.mutateResources(ops);
  console.log(`Mutate created ${result.results.length} resources`);

  const verified = await findCreatedResources(customer);
  if (verified.campaigns.length !== 1) throw new Error(`Expected 1 campaign, found ${verified.campaigns.length}`);
  if (verified.adGroups.length !== 2) throw new Error(`Expected 2 ad groups, found ${verified.adGroups.length}`);

  console.log(JSON.stringify({
    campaign: verified.campaigns.map(r => ({
      id: r.campaign.id,
      name: r.campaign.name,
      status: r.campaign.status,
      channel: r.campaign.advertising_channel_type,
      target_google_search: r.campaign.network_settings.target_google_search,
      target_search_network: r.campaign.network_settings.target_search_network,
      target_partner_search_network: r.campaign.network_settings.target_partner_search_network,
      target_content_network: r.campaign.network_settings.target_content_network,
      positive_geo_target_type: r.campaign.geo_target_type_setting.positive_geo_target_type,
      negative_geo_target_type: r.campaign.geo_target_type_setting.negative_geo_target_type,
    })),
    ad_groups: verified.adGroups.map(r => ({ id: r.ad_group.id, name: r.ad_group.name, status: r.ad_group.status })),
    keyword_count: verified.keywords.length,
    ad_count: verified.ads.length,
    location_targets: verified.criteria.filter(r => r.campaign_criterion.location && !r.campaign_criterion.negative).map(r => r.campaign_criterion.location.geo_target_constant),
    negative_keyword_count: verified.criteria.filter(r => r.campaign_criterion.keyword && r.campaign_criterion.negative).length,
  }, null, 2));
}

main().catch(err => {
  console.error('Fatal object:', err);
  console.error('Fatal message:', err?.message);
  console.error('Fatal stack:', err?.stack);
  process.exit(1);
});
