#!/usr/bin/env node
/**
 * Compare Google Ads vs Microsoft Ads keywords and negatives for Denver campaign.
 * Runs the existing listing scripts, parses their output, and produces a clear diff.
 */
process.env.DOTENV_CONFIG_QUIET = 'true';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const { execFileSync } = require('child_process');
const path = require('path');

// ── Helpers ──────────────────────────────────────────────────────────────────

function run(script) {
  return execFileSync('node', [path.join(__dirname, script)], {
    env: { ...process.env, DOTENV_CONFIG_QUIET: 'true' },
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
}

function normalize(text) {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

// ── 1. Parse Google Keywords (Denver only, ENABLED only) ─────────────────────

function parseGoogleKeywords(output) {
  const keywords = [];
  let inDenver = false;
  let inDenverKw = false;

  for (const line of output.split('\n')) {
    if (line.includes('CAMPAIGN: Denver')) inDenver = true;
    if (line.includes('CAMPAIGN: Phoenix')) inDenver = false;

    if (inDenver && line.includes('AD GROUP: Denver Keywords')) inDenverKw = true;
    if (inDenverKw && line.match(/^\s+AD GROUP:/) && !line.includes('Denver Keywords')) inDenverKw = false;

    if (inDenverKw) {
      const m = line.match(/\[(\w+)\s*\]\s+\[(\w+)\s*\]\s+(.+)/);
      if (m) {
        keywords.push({
          text: m[3].trim(),
          matchType: m[1].trim(),
          status: m[2].trim(),
        });
      }
    }
  }
  return keywords;
}

// ── 2. Parse MS Keywords (all ad groups) ─────────────────────────────────────

function parseMsKeywords(output) {
  // Only parse the keywords section, stop before campaign-level negatives
  const keywordsSection = output.split('=== CAMPAIGN-LEVEL NEGATIVE KEYWORDS ===')[0] || output;

  const adGroups = {};
  let currentGroup = null;
  let currentSection = null; // ACTIVE, PAUSED, DELETED

  for (const line of keywordsSection.split('\n')) {
    const groupMatch = line.match(/^\[(.+?)\]\s+\(id:\d+\)/);
    if (groupMatch) {
      currentGroup = groupMatch[1];
      if (!adGroups[currentGroup]) adGroups[currentGroup] = [];
      currentSection = null;
      continue;
    }

    if (line.match(/^\s+ACTIVE:/)) { currentSection = 'Active'; continue; }
    if (line.match(/^\s+PAUSED:/)) { currentSection = 'Paused'; continue; }
    if (line.match(/^\s+DELETED:/)) { currentSection = 'Deleted'; continue; }

    if (currentGroup && currentSection) {
      const kwMatch = line.match(/\[(\w+)\s*\]\s+(.+?)(?:\s+\(bid:.*\))?$/);
      if (kwMatch) {
        adGroups[currentGroup].push({
          text: kwMatch[2].trim(),
          matchType: kwMatch[1].trim(),
          status: currentSection,
        });
      }
    }
  }
  return adGroups;
}

// ── 3. Parse Google campaign-level negatives (Denver only) ────────────────────

function parseGoogleCampaignNegatives(output) {
  const negatives = [];
  let inDenver = false;

  for (const line of output.split('\n')) {
    if (line.match(/^Denver:/)) inDenver = true;
    if (line.match(/^Phoenix:/)) inDenver = false;

    if (inDenver) {
      const m = line.match(/^\s+-\s+(.+)/);
      if (m) negatives.push(m[1].trim());
    }
  }
  return negatives;
}

// ── 4. Parse Google ad-group-level negatives (Denver Keywords only) ───────────

function parseGoogleAdGroupNegatives(output) {
  const negatives = [];
  let inDenverKw = false;

  for (const line of output.split('\n')) {
    if (line.match(/^Denver Keywords:/)) inDenverKw = true;
    // Stop at next ad group header
    if (inDenverKw && line.match(/^\w/) && !line.match(/^Denver Keywords:/)) inDenverKw = false;

    if (inDenverKw) {
      const m = line.match(/^\s+-\s+(.+?)\s+\[\d+\]$/);
      if (m) negatives.push(m[1].trim());
    }
  }
  return negatives;
}

// ── 5. Parse MS campaign-level negatives ─────────────────────────────────────

function parseMsCampaignNegatives(output) {
  const negatives = [];
  const section = output.split('=== CAMPAIGN-LEVEL NEGATIVE KEYWORDS ===')[1];
  if (!section) return negatives;

  for (const line of section.split('\n')) {
    const m = line.match(/\[(\w+)\s*\]\s+(.+?)\s+\(id:\d+\)/);
    if (m) {
      negatives.push({
        text: m[2].trim(),
        matchType: m[1].trim(),
      });
    }
  }
  return negatives;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching data from Google Ads and Microsoft Ads...\n');

  const googleKwOutput = run('list-google-keywords.js');
  const msOutput = run('list-ms-keywords-full.js');
  const googleCampaignNegOutput = run('check-negatives.js');
  const googleAdGroupNegOutput = run('list-google-negatives-full.js');

  // ── Parse everything ───────────────────────────────────────────────────────
  const googleKws = parseGoogleKeywords(googleKwOutput);
  const msAdGroups = parseMsKeywords(msOutput);
  const googleCampaignNegs = parseGoogleCampaignNegatives(googleCampaignNegOutput);
  const googleAdGroupNegs = parseGoogleAdGroupNegatives(googleAdGroupNegOutput);
  const msCampaignNegs = parseMsCampaignNegatives(msOutput);

  // ── Active Google Denver keywords ──────────────────────────────────────────
  const googleActive = googleKws.filter(k => k.status === 'ENABLED');
  const googleActiveTexts = new Set(googleActive.map(k => normalize(k.text)));

  // ── MS active keywords across all ad groups ────────────────────────────────
  const allMsActive = [];
  for (const [group, kws] of Object.entries(msAdGroups)) {
    for (const kw of kws) {
      if (kw.status === 'Active') {
        allMsActive.push({ ...kw, adGroup: group });
      }
    }
  }
  const allMsActiveTexts = new Set(allMsActive.map(k => normalize(k.text)));

  // ════════════════════════════════════════════════════════════════════════════
  // REPORT
  // ════════════════════════════════════════════════════════════════════════════

  const sep = '='.repeat(78);
  const sep2 = '-'.repeat(78);

  console.log(sep);
  console.log('  GOOGLE ADS vs MICROSOFT ADS -- DENVER CAMPAIGN COMPARISON');
  console.log(sep);

  // ── Keyword Counts ─────────────────────────────────────────────────────────
  console.log(`\n${sep2}`);
  console.log('  KEYWORD COUNTS');
  console.log(sep2);
  console.log(`  Google "Denver Keywords" -- ${googleActive.length} active keywords`);
  for (const [group, kws] of Object.entries(msAdGroups)) {
    const active = kws.filter(k => k.status === 'Active');
    const paused = kws.filter(k => k.status === 'Paused');
    console.log(`  MS "${group}" -- ${active.length} active, ${paused.length} paused`);
  }
  console.log(`  MS total active: ${allMsActive.length}`);

  // ── Keywords in Google but NOT in any MS ad group ──────────────────────────
  const inGoogleNotMs = googleActive.filter(k => !allMsActiveTexts.has(normalize(k.text)));

  console.log(`\n${sep2}`);
  console.log(`  KEYWORDS IN GOOGLE (ACTIVE) BUT NOT IN MS (ACTIVE) -- ${inGoogleNotMs.length} gaps`);
  console.log('  > These need to be ADDED to MS Ads');
  console.log(sep2);

  if (inGoogleNotMs.length === 0) {
    console.log('  (none -- MS covers all active Google keywords)');
  } else {
    for (const kw of inGoogleNotMs.sort((a, b) => a.text.localeCompare(b.text))) {
      console.log(`  + [${kw.matchType.padEnd(6)}] ${kw.text}`);
    }
  }

  // ── Keywords in MS but NOT in Google (active) ──────────────────────────────
  const inMsNotGoogle = allMsActive.filter(k => !googleActiveTexts.has(normalize(k.text)));

  console.log(`\n${sep2}`);
  console.log(`  KEYWORDS IN MS (ACTIVE) BUT NOT IN GOOGLE (ACTIVE) -- ${inMsNotGoogle.length}`);
  console.log('  > Consider pausing these in MS (or they are MS-specific intentional adds)');
  console.log(sep2);

  if (inMsNotGoogle.length === 0) {
    console.log('  (none)');
  } else {
    for (const kw of inMsNotGoogle.sort((a, b) => a.text.localeCompare(b.text))) {
      console.log(`  - [${kw.matchType.padEnd(8)}] [${kw.adGroup}] ${kw.text}`);
    }
  }

  // ── Keywords in BOTH (match type differences) ──────────────────────────────
  const matchTypeDiffs = [];
  for (const gkw of googleActive) {
    const nText = normalize(gkw.text);
    const msMatches = allMsActive.filter(m => normalize(m.text) === nText);
    if (msMatches.length > 0) {
      const gType = gkw.matchType.toUpperCase();
      const msTypes = [...new Set(msMatches.map(m => m.matchType))];
      // Check if Google's match type is represented in MS
      const gTypeNorm = gType === 'BROAD' ? 'Broad' : gType === 'PHRASE' ? 'Phrase' : gType === 'EXACT' ? 'Exact' : gType;
      if (!msTypes.includes(gTypeNorm)) {
        matchTypeDiffs.push({
          text: gkw.text,
          googleType: gType,
          msTypes: msTypes.join(', '),
          msGroups: msMatches.map(m => m.adGroup).join(', '),
        });
      }
    }
  }

  console.log(`\n${sep2}`);
  console.log(`  MATCH TYPE DIFFERENCES (keyword exists in both, different match type) -- ${matchTypeDiffs.length}`);
  console.log(sep2);

  if (matchTypeDiffs.length === 0) {
    console.log('  (none)');
  } else {
    for (const d of matchTypeDiffs.sort((a, b) => a.text.localeCompare(b.text))) {
      console.log(`  ~ "${d.text}" -- Google: ${d.googleType}, MS: ${d.msTypes} [${d.msGroups}]`);
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // NEGATIVES COMPARISON
  // ════════════════════════════════════════════════════════════════════════════

  console.log(`\n${sep}`);
  console.log('  NEGATIVE KEYWORDS COMPARISON');
  console.log(sep);

  const googleCampNegSet = new Set(googleCampaignNegs.map(n => normalize(n)));
  const googleAgNegSet = new Set(googleAdGroupNegs.map(n => normalize(n)));
  const googleAllNegsSet = new Set([...googleCampNegSet, ...googleAgNegSet]);
  const msCampNegSetDecoded = new Set(msCampaignNegs.map(n => normalize(n.text.replace(/&amp;/g, '&'))));

  console.log(`\n  Google Denver campaign-level negatives: ${googleCampaignNegs.length}`);
  console.log(`  Google Denver ad-group-level negatives (Denver Keywords): ${googleAdGroupNegs.length}`);
  console.log(`  Google Denver ALL negatives (combined, deduplicated): ${googleAllNegsSet.size}`);
  console.log(`  MS campaign-level negatives: ${msCampaignNegs.length}`);

  // ── Negatives in Google (campaign-level) but NOT in MS ─────────────────────
  const campNegsInGoogleNotMs = googleCampaignNegs.filter(n => !msCampNegSetDecoded.has(normalize(n)));

  console.log(`\n${sep2}`);
  console.log(`  CAMPAIGN-LEVEL NEGATIVES: In Google but NOT in MS -- ${campNegsInGoogleNotMs.length} gaps`);
  console.log('  > These should be ADDED to MS campaign negatives');
  console.log(sep2);

  if (campNegsInGoogleNotMs.length === 0) {
    console.log('  (none -- MS has all Google campaign-level negatives)');
  } else {
    for (const n of campNegsInGoogleNotMs.sort()) {
      console.log(`  + ${n}`);
    }
  }

  // ── Ad-group negatives in Google but NOT in MS campaign negatives ───────────
  const agNegsNotInMs = googleAdGroupNegs.filter(n => !msCampNegSetDecoded.has(normalize(n)));

  console.log(`\n${sep2}`);
  console.log(`  AD-GROUP NEGATIVES (Google "Denver Keywords"): NOT in MS campaign negatives -- ${agNegsNotInMs.length}`);
  console.log('  > These are only blocking at the ad-group level in Google;');
  console.log('    consider adding to MS campaign negatives for equivalent coverage');
  console.log(sep2);

  if (agNegsNotInMs.length === 0) {
    console.log('  (none -- MS campaign negatives cover all Google ad-group negatives)');
  } else {
    for (const n of agNegsNotInMs.sort()) {
      console.log(`  + ${n}`);
    }
  }

  // ── Negatives in MS but NOT in Google (either level) ───────────────────────
  const negsInMsNotGoogle = msCampaignNegs.filter(n => {
    const decoded = normalize(n.text.replace(/&amp;/g, '&'));
    return !googleAllNegsSet.has(decoded);
  });

  console.log(`\n${sep2}`);
  console.log(`  CAMPAIGN NEGATIVES: In MS but NOT in Google (either level) -- ${negsInMsNotGoogle.length}`);
  console.log('  > Extra coverage in MS; probably fine to keep');
  console.log(sep2);

  if (negsInMsNotGoogle.length === 0) {
    console.log('  (none)');
  } else {
    for (const n of negsInMsNotGoogle.sort((a, b) => a.text.localeCompare(b.text))) {
      console.log(`  * [${n.matchType.padEnd(8)}] ${n.text}`);
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ════════════════════════════════════════════════════════════════════════════

  console.log(`\n${sep}`);
  console.log('  SUMMARY');
  console.log(sep);
  console.log(`  Keywords to ADD to MS:                  ${inGoogleNotMs.length}`);
  console.log(`  Keywords to consider PAUSING in MS:     ${inMsNotGoogle.length}`);
  console.log(`  Match type differences:                 ${matchTypeDiffs.length}`);
  console.log(`  Campaign negatives to ADD to MS:        ${campNegsInGoogleNotMs.length}`);
  console.log(`  Ad-group negatives missing from MS:     ${agNegsNotInMs.length}`);
  console.log(`  Extra MS negatives (keep):              ${negsInMsNotGoogle.length}`);
  console.log(sep);
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
