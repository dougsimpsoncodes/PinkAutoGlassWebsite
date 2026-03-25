#!/usr/bin/env node
/**
 * GEO Brand Mention Scanner
 * Checks what AI engines and training-data platforms "know" about Pink Auto Glass.
 * Scans: YouTube, Reddit, schema sameAs links, brand entity signals across all sat sites.
 *
 * Research basis:
 * - Brand mentions correlate 3x stronger with AI visibility than backlinks
 * - AI training data sources: YouTube (25%), Reddit (25%), Wikipedia (20%), LinkedIn (15%), other (15%)
 * - Only 11% of domains appear in both ChatGPT and Google AI Overview — platforms need different strategies
 *
 * Usage: node scripts/audit-geo-brand-mentions.mjs
 * Output: tasks/2026-03-20-geo-brand-mentions-audit.md
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const BRAND_NAME = 'Pink Auto Glass';
const BRAND_DOMAIN = 'pinkautoglass.com';
const BRAND_PHONE_DENVER = '(720) 918-7465';
const BRAND_PHONE_PHOENIX = '(480) 712-7465';

const SATELLITE_DOMAINS = [
  { domain: 'windshieldcostcalculator.com', label: 'WS Cost Calculator', market: 'Denver' },
  { domain: 'windshielddenver.com', label: 'WS Denver', market: 'Denver' },
  { domain: 'windshieldchiprepairdenver.com', label: 'Chip Repair Denver', market: 'Denver' },
  { domain: 'windshieldchiprepairboulder.com', label: 'Chip Repair Boulder', market: 'Denver' },
  { domain: 'aurorawindshield.com', label: 'Aurora WS', market: 'Denver' },
  { domain: 'mobilewindshielddenver.com', label: 'Mobile WS Denver', market: 'Denver' },
  { domain: 'cheapestwindshieldnearme.com', label: 'Cheapest WS Near Me', market: 'Denver' },
  { domain: 'newwindshieldcost.com', label: 'New WS Cost', market: 'Denver' },
  { domain: 'getawindshieldquote.com', label: 'Get WS Quote', market: 'Denver' },
  { domain: 'newwindshieldnearme.com', label: 'New WS Near Me', market: 'Denver' },
  { domain: 'windshieldpricecompare.com', label: 'WS Price Compare', market: 'Denver' },
  { domain: 'windshieldchiprepairmesa.com', label: 'Chip Repair Mesa', market: 'Phoenix' },
  { domain: 'windshieldchiprepairphoenix.com', label: 'Chip Repair Phoenix', market: 'Phoenix' },
  { domain: 'windshieldchiprepairscottsdale.com', label: 'Chip Repair Scottsdale', market: 'Phoenix' },
  { domain: 'windshieldchiprepairtempe.com', label: 'Chip Repair Tempe', market: 'Phoenix' },
  { domain: 'windshieldcostphoenix.com', label: 'WS Cost Phoenix', market: 'Phoenix' },
  { domain: 'mobilewindshieldphoenix.com', label: 'Mobile WS Phoenix', market: 'Phoenix' },
  { domain: 'carwindshieldprices.com', label: 'Car WS Prices', market: 'National' },
  { domain: 'windshieldrepairprices.com', label: 'WS Repair Prices', market: 'National' },
  { domain: 'carglassprices.com', label: 'Car Glass Prices', market: 'National' },
  { domain: 'coloradospringswindshield.com', label: 'CS Windshield', market: 'CO Springs' },
  { domain: 'autoglasscoloradosprings.com', label: 'CS Auto Glass', market: 'CO Springs' },
  { domain: 'mobilewindshieldcoloradosprings.com', label: 'CS Mobile WS', market: 'CO Springs' },
  { domain: 'windshieldreplacementfortcollins.com', label: 'Ft Collins WS', market: 'CO Springs' },
];

// ─── Fetch helper ────────────────────────────────────────────────────────────
async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' },
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
      ...options,
    });
    return { status: res.status, body: await res.text(), headers: Object.fromEntries(res.headers.entries()) };
  } catch (err) {
    return { status: 0, body: '', error: err.message };
  }
}

// ─── 1. Schema Brand Entity Audit (per satellite site) ──────────────────────
async function auditSchemaEntity(domain) {
  const res = await safeFetch(`https://${domain}/`);
  if (res.status !== 200) return { domain, error: `HTTP ${res.status}`, checks: {} };

  const html = res.body;
  const jsonLdBlocks = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];

  const checks = {
    hasOrganization: false,
    hasLocalBusiness: false,
    hasSameAs: false,
    sameAsLinks: [],
    hasName: false,
    brandName: null,
    hasUrl: false,
    hasLogo: false,
    hasTelephone: false,
    hasAddress: false,
    hasAggregateRating: false,
    hasAreaServed: false,
  };

  for (const block of jsonLdBlocks) {
    const content = block.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
    try {
      const schema = JSON.parse(content);
      const items = schema['@graph'] ? schema['@graph'] : [schema];
      for (const item of items) {
        const type = item['@type'];
        if (type === 'Organization' || type === 'AutoRepair' || type === 'LocalBusiness') {
          if (type === 'Organization') checks.hasOrganization = true;
          if (type === 'AutoRepair' || type === 'LocalBusiness') checks.hasLocalBusiness = true;
          if (item.name) { checks.hasName = true; checks.brandName = item.name; }
          if (item.url) checks.hasUrl = true;
          if (item.logo) checks.hasLogo = true;
          if (item.telephone) checks.hasTelephone = true;
          if (item.address) checks.hasAddress = true;
          if (item.aggregateRating) checks.hasAggregateRating = true;
          if (item.areaServed) checks.hasAreaServed = true;
          if (item.sameAs) {
            checks.hasSameAs = true;
            const links = Array.isArray(item.sameAs) ? item.sameAs : [item.sameAs];
            checks.sameAsLinks.push(...links);
          }
        }
      }
    } catch {
      // Invalid JSON-LD, skip
    }
  }

  // Score entity completeness
  let entityScore = 0;
  if (checks.hasOrganization || checks.hasLocalBusiness) entityScore += 15;
  if (checks.hasName) entityScore += 10;
  if (checks.hasUrl) entityScore += 10;
  if (checks.hasLogo) entityScore += 10;
  if (checks.hasTelephone) entityScore += 10;
  if (checks.hasAddress) entityScore += 10;
  if (checks.hasAggregateRating) entityScore += 10;
  if (checks.hasAreaServed) entityScore += 10;
  if (checks.hasSameAs) entityScore += 15;

  return { domain, checks, entityScore };
}

// ─── 2. Brand mention in page content (cross-linking) ────────────────────────
async function auditBrandMentions(domain) {
  const res = await safeFetch(`https://${domain}/`);
  if (res.status !== 200) return { domain, mentions: {}, score: 0 };

  const html = res.body;
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ');

  const mentions = {
    brandName: (text.match(/Pink\s+Auto\s+Glass/gi) || []).length,
    mainDomain: (html.match(/pinkautoglass\.com/gi) || []).length,
    denverPhone: (text.match(/720[.\-\s]*918[.\-\s]*7465/g) || []).length,
    phoenixPhone: (text.match(/480[.\-\s]*712[.\-\s]*7465/g) || []).length,
    linkToMain: (html.match(/href=["'][^"']*pinkautoglass\.com[^"']*["']/gi) || []).length,
  };

  // Score: does the sat site properly reference the parent brand?
  let score = 0;
  if (mentions.brandName > 0) score += 30;
  if (mentions.mainDomain > 0 || mentions.linkToMain > 0) score += 30;
  if (mentions.denverPhone > 0 || mentions.phoenixPhone > 0) score += 20;
  if (mentions.linkToMain > 0) score += 20;

  return { domain, mentions, score };
}

// ─── 3. External platform presence check ─────────────────────────────────────
async function checkExternalPlatforms() {
  console.log('  Checking external platform presence...');
  const results = {};

  // NOTE: Search result pages echo query strings in their HTML, so we can't
  // reliably detect brand presence by searching and checking for the brand name.
  // Instead, check for direct brand profile URLs where possible, or look for
  // result-specific signals that go beyond the echoed query.

  // Google Business Profile — check direct GBP profile existence
  // A Maps search page always echoes the query, so we look for signals of actual
  // business listing content (place IDs, rating markup, address blocks)
  const gbpRes = await safeFetch(`https://www.google.com/maps/search/${encodeURIComponent('Pink Auto Glass Denver CO')}`);
  results.googleMaps = {
    checked: true,
    status: gbpRes.status,
    // Look for actual business listing signals, not just the echoed query
    mentionFound: gbpRes.status === 200 && (
      gbpRes.body.includes('pinkautoglass.com') || // Our domain in results
      gbpRes.body.includes('720) 918-7465') || // Our phone number
      gbpRes.body.includes('data-place-id') // Actual place result rendered
    ),
  };

  // YouTube — check for a direct brand channel, not search results
  const ytRes = await safeFetch(`https://www.youtube.com/@pinkautoglass`);
  results.youtube = {
    checked: true,
    status: ytRes.status,
    // A direct channel URL returning 200 means the channel exists
    mentionFound: ytRes.status === 200,
    note: ytRes.status === 404 ? 'No YouTube channel found' : ytRes.status !== 200 ? 'YouTube may block automated requests' : 'Channel exists',
  };

  // Reddit — search is unreliable (echoes query). Check if any results link to our domain.
  const redditRes = await safeFetch(`https://www.reddit.com/search/?q=${encodeURIComponent('"Pink Auto Glass"')}&type=link`);
  results.reddit = {
    checked: true,
    status: redditRes.status,
    // Look for actual result links containing our domain, not just the echoed query
    mentionFound: redditRes.status === 200 && (
      redditRes.body.includes('pinkautoglass.com') ||
      // Reddit renders result titles in specific markup — check for non-query mentions
      (redditRes.body.match(/data-click-id="body"[^>]*>[\s\S]*?pink auto glass/gi) || []).length > 0
    ),
    note: redditRes.status !== 200 ? 'Reddit may block automated requests' : '',
  };

  // Yelp — direct brand page URL (not a search). 200 = exists, 404 = doesn't.
  const yelpRes = await safeFetch(`https://www.yelp.com/biz/pink-auto-glass-denver`);
  results.yelp = {
    checked: true,
    status: yelpRes.status,
    exists: yelpRes.status === 200,
  };

  // BBB — direct search. Look for actual business link, not just echoed query.
  const bbbRes = await safeFetch(`https://www.bbb.org/search?find_text=${encodeURIComponent('Pink Auto Glass')}&find_loc=${encodeURIComponent('Denver, CO')}`);
  results.bbb = {
    checked: true,
    status: bbbRes.status,
    // Look for actual BBB profile link or accreditation badge, not just echoed query
    mentionFound: bbbRes.status === 200 && (
      bbbRes.body.includes('/profile/') || // BBB profile link in results
      bbbRes.body.includes('Accredited') // Accreditation indicator
    ),
  };

  return results;
}

// ─── 4. AI search engine brand test ──────────────────────────────────────────
// Note: We can't directly query ChatGPT/Perplexity APIs here, but we can check
// if our content is structured to appear in AI search results by analyzing
// what signals we're sending.
function assessAIReadiness(schemaResults, mentionResults) {
  const signals = [];
  const gaps = [];

  // Check if brand entity is consistent across sites
  const brandNames = new Set(schemaResults.filter(r => r.checks.brandName).map(r => r.checks.brandName));
  if (brandNames.size === 1) {
    signals.push(`Consistent brand name across all sites: "${[...brandNames][0]}"`);
  } else if (brandNames.size > 1) {
    gaps.push(`Inconsistent brand names across sites: ${[...brandNames].join(', ')}`);
  } else {
    gaps.push('No brand name found in schema across any site');
  }

  // Check sameAs coverage
  const allSameAs = new Set(schemaResults.flatMap(r => r.checks.sameAsLinks));
  const sameAsPlatforms = {
    google: [...allSameAs].some(u => u.includes('google.com/maps') || u.includes('goo.gl')),
    yelp: [...allSameAs].some(u => u.includes('yelp.com')),
    facebook: [...allSameAs].some(u => u.includes('facebook.com')),
    instagram: [...allSameAs].some(u => u.includes('instagram.com')),
    linkedin: [...allSameAs].some(u => u.includes('linkedin.com')),
    bbb: [...allSameAs].some(u => u.includes('bbb.org')),
    youtube: [...allSameAs].some(u => u.includes('youtube.com')),
  };

  for (const [platform, present] of Object.entries(sameAsPlatforms)) {
    if (present) signals.push(`sameAs link to ${platform}`);
    else gaps.push(`Missing sameAs link to ${platform}`);
  }

  // Check brand mention consistency across sat sites
  const sitesWithBrand = mentionResults.filter(r => r.mentions.brandName > 0);
  const sitesWithLink = mentionResults.filter(r => r.mentions.linkToMain > 0);
  signals.push(`${sitesWithBrand.length}/${mentionResults.length} sat sites mention brand name`);
  signals.push(`${sitesWithLink.length}/${mentionResults.length} sat sites link to main domain`);

  if (sitesWithBrand.length < mentionResults.length) {
    gaps.push(`${mentionResults.length - sitesWithBrand.length} sat sites don't mention "${BRAND_NAME}"`);
  }
  if (sitesWithLink.length < mentionResults.length) {
    gaps.push(`${mentionResults.length - sitesWithLink.length} sat sites don't link to ${BRAND_DOMAIN}`);
  }

  // Overall readiness score
  let score = 0;
  if (brandNames.size === 1) score += 20;
  const sameAsCount = Object.values(sameAsPlatforms).filter(Boolean).length;
  score += Math.min(30, sameAsCount * 5); // Up to 30 for sameAs coverage
  score += Math.min(25, (sitesWithBrand.length / mentionResults.length) * 25);
  score += Math.min(25, (sitesWithLink.length / mentionResults.length) * 25);

  return { score: Math.round(score), signals, gaps, sameAsPlatforms, allSameAs: [...allSameAs] };
}

// ─── Report generation ───────────────────────────────────────────────────────
function generateReport(schemaResults, mentionResults, externalPlatforms, aiReadiness) {
  const lines = [];
  const w = (s) => lines.push(s);

  w('# Pink Auto Glass — GEO Brand Mention Audit');
  w(`**Generated:** ${new Date().toISOString().slice(0, 10)}`);
  w(`**Brand:** ${BRAND_NAME} (${BRAND_DOMAIN})`);
  w(`**Satellite Sites Audited:** ${SATELLITE_DOMAINS.length}`);
  w('');

  // Executive summary
  w('## Executive Summary');
  w('');

  const avgEntityScore = Math.round(schemaResults.reduce((s, r) => s + r.entityScore, 0) / schemaResults.length);
  const avgMentionScore = Math.round(mentionResults.reduce((s, r) => s + r.score, 0) / mentionResults.length);

  w(`| Metric | Value |`);
  w(`|--------|-------|`);
  w(`| AI Brand Readiness Score | **${aiReadiness.score}/100** |`);
  w(`| Avg Schema Entity Score | ${avgEntityScore}/100 |`);
  w(`| Avg Brand Mention Score | ${avgMentionScore}/100 |`);
  w(`| Brand Signals | ${aiReadiness.signals.length} |`);
  w(`| Brand Gaps | ${aiReadiness.gaps.length} |`);
  w('');

  // External platform presence
  w('## External Platform Presence');
  w('');
  w('These platforms are AI training data sources. Brand mentions here directly impact AI search visibility.');
  w('');
  w('| Platform | AI Weight | Status | Detail |');
  w('|----------|-----------|--------|--------|');

  const platformStatus = (p) => {
    if (p.exists) return '✅ Found';
    if (p.mentionFound) return '✅ Mentioned';
    if (p.status === 200) return '❌ Not found';
    return `⚠️ Check failed (${p.status || p.note || 'error'})`;
  };

  w(`| YouTube | 25% | ${platformStatus(externalPlatforms.youtube)} | Videos about brand |`);
  w(`| Reddit | 25% | ${platformStatus(externalPlatforms.reddit)} | Community discussions |`);
  w(`| Google Maps/GBP | 15% | ${platformStatus(externalPlatforms.googleMaps)} | Business profile |`);
  w(`| Yelp | 10% | ${platformStatus(externalPlatforms.yelp)} | Review profile |`);
  w(`| BBB | 5% | ${platformStatus(externalPlatforms.bbb)} | Business accreditation |`);
  w('');

  // sameAs coverage
  w('## Schema sameAs Coverage');
  w('');
  w('`sameAs` links in structured data tell AI engines where your brand exists across the web.');
  w('');
  w('| Platform | In sameAs? | Action |');
  w('|----------|-----------|--------|');
  for (const [platform, present] of Object.entries(aiReadiness.sameAsPlatforms)) {
    w(`| ${platform} | ${present ? '✅' : '❌'} | ${present ? 'Present' : `Add ${platform} profile URL to sameAs`} |`);
  }
  w('');
  if (aiReadiness.allSameAs.length > 0) {
    w('**Current sameAs links found:**');
    for (const url of aiReadiness.allSameAs) {
      w(`- ${url}`);
    }
    w('');
  } else {
    w('**No sameAs links found in any satellite site schema.**');
    w('');
  }

  // AI Readiness signals and gaps
  w('## AI Brand Readiness Assessment');
  w('');
  if (aiReadiness.signals.length > 0) {
    w('**Signals (what\'s working):**');
    for (const s of aiReadiness.signals) {
      w(`- ✅ ${s}`);
    }
    w('');
  }
  if (aiReadiness.gaps.length > 0) {
    w('**Gaps (what needs fixing):**');
    for (const g of aiReadiness.gaps) {
      w(`- ❌ ${g}`);
    }
    w('');
  }

  // Per-site scorecard
  w('## Satellite Site Scorecard');
  w('');
  w('| Domain | Entity Score | Mention Score | Brand Name | Link to Main | Phone | sameAs |');
  w('|--------|-------------|---------------|------------|-------------|-------|--------|');
  for (let i = 0; i < SATELLITE_DOMAINS.length; i++) {
    const schema = schemaResults[i];
    const mention = mentionResults[i];
    const icon = schema.entityScore >= 80 ? '🟢' : schema.entityScore >= 60 ? '🟡' : '🟠';
    w(`| ${schema.domain} | ${icon} ${schema.entityScore} | ${mention.score} | ${mention.mentions.brandName > 0 ? '✅' : '❌'} ${mention.mentions.brandName || 0} | ${mention.mentions.linkToMain > 0 ? '✅' : '❌'} ${mention.mentions.linkToMain || 0} | ${(mention.mentions.denverPhone + mention.mentions.phoenixPhone) > 0 ? '✅' : '❌'} | ${schema.checks.hasSameAs ? '✅' : '❌'} |`);
  }
  w('');

  // Detailed schema per site
  w('---');
  w('');
  w('## Detailed Schema Entity Reports');
  w('');
  for (const r of schemaResults) {
    w(`### ${r.domain}`);
    if (r.error) {
      w(`Error: ${r.error}`);
      w('');
      continue;
    }
    const c = r.checks;
    w(`| Property | Status |`);
    w(`|----------|--------|`);
    w(`| Organization/@type | ${c.hasOrganization ? '✅' : '❌'} |`);
    w(`| LocalBusiness/AutoRepair | ${c.hasLocalBusiness ? '✅' : '❌'} |`);
    w(`| name | ${c.hasName ? `✅ "${c.brandName}"` : '❌'} |`);
    w(`| url | ${c.hasUrl ? '✅' : '❌'} |`);
    w(`| logo | ${c.hasLogo ? '✅' : '❌'} |`);
    w(`| telephone | ${c.hasTelephone ? '✅' : '❌'} |`);
    w(`| address | ${c.hasAddress ? '✅' : '❌'} |`);
    w(`| aggregateRating | ${c.hasAggregateRating ? '✅' : '❌'} |`);
    w(`| areaServed | ${c.hasAreaServed ? '✅' : '❌'} |`);
    w(`| sameAs | ${c.hasSameAs ? `✅ (${c.sameAsLinks.length} links)` : '❌'} |`);
    w('');
  }

  // Recommendations
  w('## Recommendations');
  w('');

  w('### P0: Add sameAs Links to All Satellite Sites');
  w('Brand mentions correlate 3x stronger with AI visibility than backlinks. `sameAs` links connect your brand entity across platforms.');
  w('**Action:** Add these to every satellite site\'s Organization/AutoRepair schema:');
  w('```json');
  w('"sameAs": [');
  w('  "https://www.google.com/maps/place/Pink+Auto+Glass/...",');
  w('  "https://www.yelp.com/biz/pink-auto-glass-denver",');
  w('  "https://www.facebook.com/pinkautoglass",');
  w('  "https://www.bbb.org/us/co/denver/profile/auto-glass/pink-auto-glass-...",');
  w('  "https://www.youtube.com/@pinkautoglass"');
  w(']');
  w('```');
  w('');

  const noMention = mentionResults.filter(r => r.mentions.brandName === 0);
  if (noMention.length > 0) {
    w('### P1: Add Brand Name to All Satellite Sites');
    w(`${noMention.length} satellite site(s) don't mention "${BRAND_NAME}" anywhere on their homepage.`);
    w('**Action:** Add "Powered by Pink Auto Glass" or "A Pink Auto Glass Service" to footer/about sections.');
    w('');
  }

  const noLink = mentionResults.filter(r => r.mentions.linkToMain === 0);
  if (noLink.length > 0) {
    w('### P1: Link All Satellite Sites to Main Domain');
    w(`${noLink.length} satellite site(s) don't link to ${BRAND_DOMAIN}.`);
    w('**Action:** Add a footer link "Visit pinkautoglass.com" on every satellite site. This builds entity association for AI engines.');
    w('');
  }

  if (!externalPlatforms.youtube.mentionFound) {
    w('### P2: Create YouTube Presence');
    w('YouTube is 25% of AI training data weight. No brand videos found.');
    w('**Action:** Create 3-5 short videos: "How Windshield Chip Repair Works", "Pink Auto Glass Denver Review", "ADAS Calibration Explained". YouTube content gets cited by ChatGPT and Perplexity.');
    w('');
  }

  if (!externalPlatforms.reddit.mentionFound) {
    w('### P2: Build Reddit Presence');
    w('Reddit is 25% of AI training data weight. No brand mentions found.');
    w('**Action:** Participate authentically in r/Denver, r/phoenix, r/AutoGlass. Answer windshield questions, share expertise. Do NOT spam — organic mentions only.');
    w('');
  }

  return lines.join('\n');
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Starting GEO Brand Mention audit...\n');

  // 1. Schema entity audit (all sat sites)
  console.log('Phase 1: Schema entity audit across satellite sites...');
  const schemaResults = [];
  const batchSize = 4;
  for (let i = 0; i < SATELLITE_DOMAINS.length; i += batchSize) {
    const batch = SATELLITE_DOMAINS.slice(i, i + batchSize);
    console.log(`  Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(SATELLITE_DOMAINS.length / batchSize)}: ${batch.map(b => b.domain).join(', ')}`);
    const results = await Promise.all(batch.map(d => auditSchemaEntity(d.domain)));
    schemaResults.push(...results);
    if (i + batchSize < SATELLITE_DOMAINS.length) await new Promise(r => setTimeout(r, 300));
  }

  // 2. Brand mention audit (all sat sites)
  console.log('\nPhase 2: Brand mention audit across satellite sites...');
  const mentionResults = [];
  for (let i = 0; i < SATELLITE_DOMAINS.length; i += batchSize) {
    const batch = SATELLITE_DOMAINS.slice(i, i + batchSize);
    console.log(`  Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(SATELLITE_DOMAINS.length / batchSize)}: ${batch.map(b => b.domain).join(', ')}`);
    const results = await Promise.all(batch.map(d => auditBrandMentions(d.domain)));
    mentionResults.push(...results);
    if (i + batchSize < SATELLITE_DOMAINS.length) await new Promise(r => setTimeout(r, 300));
  }

  // 3. External platform presence
  console.log('\nPhase 3: External platform presence...');
  const externalPlatforms = await checkExternalPlatforms();

  // 4. AI readiness assessment
  console.log('\nPhase 4: AI readiness assessment...');
  const aiReadiness = assessAIReadiness(schemaResults, mentionResults);

  // Generate report
  console.log('\nGenerating report...');
  const report = generateReport(schemaResults, mentionResults, externalPlatforms, aiReadiness);

  const outPath = resolve(ROOT, 'tasks', '2026-03-20-geo-brand-mentions-audit.md');
  writeFileSync(outPath, report);
  console.log(`Report saved to: ${outPath}`);
  console.log(`\nAI Brand Readiness Score: ${aiReadiness.score}/100`);
}

main().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
