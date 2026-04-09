#!/usr/bin/env node
/**
 * Weekly Search Term Review — Pink Auto Glass
 *
 * Syncs fresh data from both ad platforms, analyzes search terms,
 * and outputs a report flagging wasted spend and negative keyword candidates.
 *
 * Usage:
 *   node scripts/weekly-search-term-review.js                  # Last 7 days
 *   node scripts/weekly-search-term-review.js --days 14        # Last 14 days
 *   node scripts/weekly-search-term-review.js --sync           # Sync first, then review
 *
 * Set up as cron: every Monday at 8am MT
 *   0 8 * * 1 cd /Users/dougsimpson/clients/pink-auto-glass/website && node scripts/weekly-search-term-review.js --sync >> data/search-term-reviews.log 2>&1
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const DAYS = parseInt(process.argv.find((_, i, a) => a[i - 1] === '--days') || '7');
const DO_SYNC = process.argv.includes('--sync');
const SITE_URL = 'https://pinkautoglass.com';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

function getAuthHeader() {
  return 'Basic ' + Buffer.from(
    `${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}`
  ).toString('base64');
}

async function syncPlatform(platform) {
  const url = `${SITE_URL}/api/admin/sync/${platform}?days=${DAYS}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { Authorization: getAuthHeader() },
  });
  return await resp.json();
}

async function main() {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - DAYS);
  const startStr = startDate.toISOString().split('T')[0];
  const endStr = now.toISOString().split('T')[0];

  console.log(`\n${'='.repeat(70)}`);
  console.log(`WEEKLY SEARCH TERM REVIEW — Pink Auto Glass`);
  console.log(`Period: ${startStr} to ${endStr} (${DAYS} days)`);
  console.log(`Run at: ${now.toISOString()}`);
  console.log(`${'='.repeat(70)}\n`);

  // Step 1: Sync if requested
  if (DO_SYNC) {
    console.log('Syncing fresh data...');
    const [googleSync, msSync] = await Promise.all([
      syncPlatform('google-ads'),
      syncPlatform('microsoft-ads'),
    ]);
    console.log(`  Google Ads: ${googleSync.ok ? '✓' : '✗'} (${googleSync.summary?.recordsFetched || 0} records)`);
    console.log(`  Microsoft Ads: ${msSync.ok ? '✓' : '✗'} (${msSync.campaigns?.fetched || 0} campaign records, ${msSync.searchTerms?.fetched || 0} search terms)`);
    console.log('');
  }

  const supabase = getSupabase();

  // Step 2: Microsoft Ads search terms analysis
  console.log('MICROSOFT ADS — SEARCH TERM REVIEW');
  console.log('-'.repeat(70));

  const { data: msTerms } = await supabase
    .from('microsoft_ads_search_terms')
    .select('search_term,clicks,cost_micros,conversions')
    .gte('date', startStr)
    .lte('date', endStr);

  if (msTerms && msTerms.length > 0) {
    // Aggregate
    const agg = {};
    for (const r of msTerms) {
      const t = r.search_term;
      if (!agg[t]) agg[t] = { clicks: 0, cost: 0, conv: 0 };
      agg[t].clicks += r.clicks || 0;
      agg[t].cost += (r.cost_micros || 0) / 1_000_000;
      agg[t].conv += r.conversions || 0;
    }

    const ranked = Object.entries(agg).sort((a, b) => b[1].cost - a[1].cost);
    const totalSpend = ranked.reduce((s, [, d]) => s + d.cost, 0);
    const wasted = ranked.filter(([, d]) => d.conv === 0);
    const wastedSpend = wasted.reduce((s, [, d]) => s + d.cost, 0);

    console.log(`Total search terms: ${ranked.length}`);
    console.log(`Total spend: $${totalSpend.toFixed(2)}`);
    console.log(`Wasted spend (0 conv): $${wastedSpend.toFixed(2)} (${(wastedSpend / totalSpend * 100).toFixed(1)}%)\n`);

    if (wasted.length > 0) {
      console.log('TOP WASTED TERMS (0 conversions, sorted by spend):');
      for (const [term, d] of wasted.slice(0, 20)) {
        console.log(`  $${d.cost.toFixed(2).padStart(8)} | ${d.clicks} clicks | ${term}`);
      }
    }

    // Flag potential negative keyword candidates
    console.log('\nNEGATIVE KEYWORD CANDIDATES:');
    const patterns = {
      'Competitor': /safelite|glass doctor|novus|gerber|action auto|native auto|anders|timberwolf|a&a|valley glass|quickset|auto glass now/i,
      'Out of area': /cheyenne|annandale|canon city|longmont|colorado springs|fort collins|salt lake|santa fe|boulder|greeley|pueblo|grand junction|virginia|utah|wyoming/i,
      'Wrong service': /tint|calibration|wiper|sunroof|body shop|auto body|mirror|supplier/i,
      'Informational': /how much|how to|cost of|anybody|what is|can you|diy|kit/i,
      'Job seeker': /jobs|careers|hiring|employment|salary/i,
    };

    for (const [category, regex] of Object.entries(patterns)) {
      const matches = wasted.filter(([term]) => regex.test(term));
      if (matches.length > 0) {
        console.log(`\n  ${category}:`);
        for (const [term, d] of matches.slice(0, 5)) {
          console.log(`    $${d.cost.toFixed(2).padStart(8)} | ${term}`);
        }
      }
    }
  } else {
    console.log('No Microsoft Ads search term data for this period.\n');
  }

  // Step 3: Google Ads summary (from synced daily performance)
  console.log(`\n\nGOOGLE ADS — PERFORMANCE SUMMARY`);
  console.log('-'.repeat(70));

  const { data: gStats } = await supabase
    .from('google_ads_daily_performance')
    .select('impressions,clicks,cost,conversions,conversions_value')
    .gte('date', startStr)
    .lte('date', endStr);

  if (gStats && gStats.length > 0) {
    const totalImpr = gStats.reduce((s, r) => s + (r.impressions || 0), 0);
    const totalClicks = gStats.reduce((s, r) => s + (r.clicks || 0), 0);
    const totalCost = gStats.reduce((s, r) => s + (r.cost || 0), 0);
    const totalConv = gStats.reduce((s, r) => s + (r.conversions || 0), 0);
    const totalValue = gStats.reduce((s, r) => s + (r.conversions_value || 0), 0);
    const ctr = totalImpr > 0 ? (totalClicks / totalImpr * 100) : 0;
    const cpa = totalConv > 0 ? totalCost / totalConv : 0;

    console.log(`Impressions: ${totalImpr.toLocaleString()}`);
    console.log(`Clicks: ${totalClicks.toLocaleString()}`);
    console.log(`Spend: $${totalCost.toFixed(2)}`);
    console.log(`Conversions: ${totalConv}`);
    console.log(`Conv Value: $${totalValue.toFixed(2)}`);
    console.log(`CTR: ${ctr.toFixed(2)}%`);
    console.log(`CPA: $${cpa.toFixed(2)}`);
  } else {
    console.log('No Google Ads data for this period.');
  }

  // Step 4: Cross-platform comparison
  console.log(`\n\n${'='.repeat(70)}`);
  console.log('NEXT ACTIONS:');
  console.log(`${'='.repeat(70)}`);
  console.log('1. Review flagged negative keyword candidates above');
  console.log('2. Add confirmed negatives via: node scripts/upload-microsoft-negative-keywords.js');
  console.log('3. Check conversion tracking accuracy (should be Unique, not All)');
  console.log(`4. Next review: ${new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0]}`);
  console.log('');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
