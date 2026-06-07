#!/usr/bin/env node
process.env.DOTENV_CONFIG_QUIET = 'true';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { GoogleAdsApi } = require('google-ads-api');

const customer = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
}).Customer({
  customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/[-\s]/g, ''),
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
});

// Google Ads enum values (numeric and string forms)
const QS_LABELS = {
  UNKNOWN: '?', UNSPECIFIED: '?', BELOW_AVERAGE: 'Below avg', AVERAGE: 'Average', ABOVE_AVERAGE: 'Above avg',
  0: '?', 1: '?', 2: 'Below avg', 3: 'Average', 4: 'Above avg',
};
function qlabel(v) { return QS_LABELS[v] ?? String(v ?? '?'); }

async function fetchQualityScores() {
  return customer.query(`
    SELECT
      ad_group.name,
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      ad_group_criterion.quality_info.quality_score,
      ad_group_criterion.quality_info.creative_quality_score,
      ad_group_criterion.quality_info.post_click_quality_score,
      ad_group_criterion.quality_info.search_predicted_ctr
    FROM keyword_view
    WHERE campaign.status = 'ENABLED'
      AND ad_group.status = 'ENABLED'
      AND ad_group_criterion.status = 'ENABLED'
    ORDER BY ad_group.name
  `);
}

async function fetchExtensions() {
  return customer.query(`
    SELECT
      campaign.status,
      asset.type,
      asset.name,
      campaign_asset.status
    FROM campaign_asset
    WHERE campaign.status = 'ENABLED'
  `);
}

async function main() {
  console.log('=== KEYWORD QUALITY SCORES ===\n');

  const kwRows = await fetchQualityScores();

  const byGroup = {};
  for (const r of kwRows) {
    const group = r.ad_group?.name || 'Unknown';
    if (!byGroup[group]) byGroup[group] = [];
    const qi = r.ad_group_criterion?.quality_info || {};
    byGroup[group].push({
      keyword: r.ad_group_criterion?.keyword?.text || '(unknown)',
      matchType: r.ad_group_criterion?.keyword?.match_type || '',
      qs: qi.quality_score ?? 'N/A',
      ctr: qlabel(qi.search_predicted_ctr),
      adRelevance: qlabel(qi.creative_quality_score),
      landingPage: qlabel(qi.post_click_quality_score),
    });
  }

  for (const [group, kws] of Object.entries(byGroup)) {
    console.log(`Ad Group: ${group}  (${kws.length} keywords)`);
    console.log(`  ${'Keyword'.padEnd(45)} ${'MT'.padEnd(8)} ${'QS'.padEnd(4)} ${'Exp CTR'.padEnd(12)} ${'Ad Rel'.padEnd(12)} Landing Page`);
    console.log(`  ${'-'.repeat(100)}`);
    for (const k of kws) {
      const mt = String(k.matchType).replace('BROAD', 'BMM').replace('EXACT', 'Exact').replace('PHRASE', 'Phrase').replace('UNSPECIFIED', '?').replace('UNKNOWN', '?');
      console.log(`  ${k.keyword.padEnd(45)} ${mt.padEnd(8)} ${String(k.qs).padEnd(4)} ${k.ctr.padEnd(12)} ${k.adRelevance.padEnd(12)} ${k.landingPage}`);
    }
    console.log();
  }

  if (kwRows.length === 0) {
    console.log('No active keywords found.\n');
  }

  // Summary stats
  const allQs = kwRows
    .map(r => r.ad_group_criterion?.quality_info?.quality_score)
    .filter(v => v != null && v > 0);
  if (allQs.length > 0) {
    const avg = (allQs.reduce((a, b) => a + b, 0) / allQs.length).toFixed(1);
    const below = allQs.filter(v => v <= 5).length;
    const good = allQs.filter(v => v >= 7).length;
    console.log(`=== QUALITY SCORE SUMMARY ===`);
    console.log(`  Total keywords with QS data: ${allQs.length}`);
    console.log(`  Average QS: ${avg}/10`);
    console.log(`  QS ≤ 5 (needs attention): ${below}`);
    console.log(`  QS ≥ 7 (good): ${good}\n`);
  }

  console.log('=== AD EXTENSIONS (CAMPAIGN ASSETS) ===\n');

  const extRows = await fetchExtensions();

  // Asset type numeric enum (Google Ads API v21)
  const ASSET_TYPE_NUM = {
    2: 'Image', 3: 'Text', 4: 'Lead Form', 5: 'Book on Google',
    6: 'Promotion', 7: 'Callout', 8: 'Structured Snippet', 9: 'Sitelink',
    10: 'Page Feed', 11: 'Dynamic Education', 12: 'Mobile App',
    13: 'Hotel Callout', 14: 'Call Extension', 15: 'Price',
    16: 'Call to Action', 17: 'Dynamic Real Estate', 18: 'Dynamic Custom',
    19: 'Dynamic Hotels and Rentals', 20: 'Dynamic Flights',
    21: 'Discovery Carousel Card', 22: 'Dynamic Travel',
    23: 'Dynamic Local', 24: 'Dynamic Jobs',
  };
  // campaign_asset resource_name encodes the extension type as the last segment
  // e.g. customers/.../campaignAssets/...~SITELINK → type label from there
  const EXT_NAME_MAP = {
    SITELINK: 'Sitelink', CALLOUT: 'Callout', STRUCTURED_SNIPPET: 'Structured Snippet',
    CALL: 'Call Extension', LOCATION: 'Location Extension', SELLER_RATING: 'Seller Rating',
    PROMOTION: 'Promotion', IMAGE: 'Image', LEAD_FORM: 'Lead Form',
  };
  // Status numeric: 2=ENABLED, 3=PAUSED, 4=REMOVED
  const STATUS_NUM = { 2: 'ENABLED', 3: 'PAUSED', 4: 'REMOVED' };

  const byType = {};
  for (const r of extRows) {
    // Try to get a friendly label from resource_name first
    const rn = r.campaign_asset?.resource_name || '';
    const rnPart = rn.split('~').pop() || '';
    const label = EXT_NAME_MAP[rnPart] || ASSET_TYPE_NUM[r.asset?.type] || rnPart || String(r.asset?.type);
    const statusRaw = r.campaign_asset?.status;
    const s = STATUS_NUM[statusRaw] || String(statusRaw).toUpperCase();
    if (!byType[label]) byType[label] = { enabled: 0, paused: 0, removed: 0, other: 0 };
    if (s === 'ENABLED') byType[label].enabled++;
    else if (s === 'PAUSED') byType[label].paused++;
    else if (s === 'REMOVED') byType[label].removed++;
    else byType[label].other++;
  }

  if (Object.keys(byType).length === 0) {
    console.log('No campaign assets found.\n');
  } else {
    const CARE_ABOUT = ['Sitelink', 'Callout', 'Seller Rating', 'Structured Snippet', 'Call Extension', 'Location Extension'];
    const prioritized = [...CARE_ABOUT, ...Object.keys(byType).filter(k => !CARE_ABOUT.includes(k))];
    for (const label of prioritized) {
      if (!byType[label]) continue;
      const { enabled, paused, removed, other } = byType[label];
      const status = enabled > 0 ? '✓ ENABLED' : (paused > 0 ? '~ PAUSED' : '✗ NONE ACTIVE');
      console.log(`  ${label.padEnd(25)} ${status}  (enabled: ${enabled}, paused: ${paused}, removed: ${removed})`);
    }
  }
  console.log();
}

main().catch(err => { console.error('Error:', err.message || err); process.exit(1); });
