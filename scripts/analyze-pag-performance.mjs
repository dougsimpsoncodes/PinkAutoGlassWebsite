#!/usr/bin/env node
/**
 * Pink Auto Glass — GSC Performance + Indexing Analysis
 * Pulls 90-day performance, sitemap status, striking-distance keywords,
 * CTR opportunities, and correlates with indexing gaps from Coverage report.
 *
 * Usage: node scripts/analyze-pag-performance.mjs
 */

import { google } from 'googleapis';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SITE = 'sc-domain:pinkautoglass.com';

// ─── Load .env.local ─────────────────────────────────────────────────────────
function loadEnv() {
  const content = readFileSync(resolve(ROOT, '.env.local'), 'utf-8');
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

// ─── GSC Client ───────────────────────────────────────────────────────────────
function gscClient() {
  const clientId = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) throw new Error('Missing GSC credentials in .env.local');
  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });
  return google.searchconsole({ version: 'v1', auth });
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
// GSC has ~3 day data lag
const END = fmtDate(daysAgo(3));
const START_90 = fmtDate(daysAgo(93));
const START_28 = fmtDate(daysAgo(31));
const PREV_END = fmtDate(daysAgo(32));
const PREV_START = fmtDate(daysAgo(60));

// ─── API Helpers ──────────────────────────────────────────────────────────────
async function query(client, body) {
  const res = await client.searchanalytics.query({ siteUrl: SITE, requestBody: body });
  return res.data.rows || [];
}

async function getSummary(client, start, end) {
  const rows = await query(client, { startDate: start, endDate: end, dimensions: [] });
  const r = rows[0] || {};
  return { clicks: r.clicks || 0, impressions: r.impressions || 0, ctr: r.ctr || 0, position: r.position || 0 };
}

async function getQueries(client, start, end, limit = 1000) {
  return query(client, { startDate: start, endDate: end, dimensions: ['query'], rowLimit: limit });
}

async function getPages(client, start, end, limit = 1000) {
  return query(client, { startDate: start, endDate: end, dimensions: ['page'], rowLimit: limit });
}

async function getDevice(client, start, end) {
  return query(client, { startDate: start, endDate: end, dimensions: ['device'] });
}

async function getSitemaps(client) {
  const res = await client.sitemaps.list({ siteUrl: SITE });
  return res.data.sitemap || [];
}

// ─── Formatting ───────────────────────────────────────────────────────────────
const pct = (n) => (n * 100).toFixed(2) + '%';
const pos = (n) => n > 0 ? n.toFixed(1) : '—';
const delta = (curr, prev) => {
  if (prev === 0) return curr > 0 ? '+∞' : '—';
  const d = ((curr - prev) / prev) * 100;
  return (d >= 0 ? '+' : '') + d.toFixed(1) + '%';
};
const shortUrl = (url) => url.replace('https://pinkautoglass.com', '').replace('https://www.pinkautoglass.com', '') || '/';

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const client = gscClient();
  console.log(`Pulling GSC data for pinkautoglass.com...`);
  console.log(`90-day window: ${START_90} → ${END}`);
  console.log(`28-day current: ${START_28} → ${END}`);
  console.log(`28-day previous: ${PREV_START} → ${PREV_END}\n`);

  const [
    summary90, summary28, summaryPrev,
    queries90, queries28,
    pages28, pages90,
    devices,
    sitemaps,
  ] = await Promise.all([
    getSummary(client, START_90, END),
    getSummary(client, START_28, END),
    getSummary(client, PREV_START, PREV_END),
    getQueries(client, START_90, END),
    getQueries(client, START_28, END),
    getPages(client, START_28, END),
    getPages(client, START_90, END),
    getDevice(client, START_28, END),
    getSitemaps(client),
  ]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const q28rows = queries28.map(r => ({
    query: r.keys[0],
    clicks: r.clicks || 0,
    impressions: r.impressions || 0,
    ctr: r.ctr || 0,
    position: r.position || 0,
  }));

  const p28rows = pages28.map(r => ({
    page: r.keys[0],
    clicks: r.clicks || 0,
    impressions: r.impressions || 0,
    ctr: r.ctr || 0,
    position: r.position || 0,
  }));

  const p90rows = pages90.map(r => ({
    page: r.keys[0],
    clicks: r.clicks || 0,
    impressions: r.impressions || 0,
    ctr: r.ctr || 0,
    position: r.position || 0,
  }));

  const q90rows = queries90.map(r => ({
    query: r.keys[0],
    clicks: r.clicks || 0,
    impressions: r.impressions || 0,
    ctr: r.ctr || 0,
    position: r.position || 0,
  }));

  // Striking distance (pos 8-20)
  const strikingQ = q28rows.filter(q => q.position >= 8 && q.position <= 20 && q.impressions >= 10)
    .sort((a, b) => b.impressions - a.impressions);

  // Quick wins (pos 4-8 — almost page 1 top)
  const quickWins = q28rows.filter(q => q.position >= 4 && q.position < 8 && q.impressions >= 10)
    .sort((a, b) => b.impressions - a.impressions);

  // High impression, low CTR (title needs work)
  const lowCtrQ = q28rows.filter(q => q.impressions >= 30 && q.ctr < 0.03)
    .sort((a, b) => b.impressions - a.impressions);

  // ── Build report ──────────────────────────────────────────────────────────
  const lines = [];
  const w = (s = '') => lines.push(s);

  w('# Pink Auto Glass — GSC Performance Analysis');
  w(`**Generated:** ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`);
  w(`**28-day window:** ${START_28} → ${END} (current) vs ${PREV_START} → ${PREV_END} (previous)`);
  w(`**90-day window:** ${START_90} → ${END}`);
  w();

  // ── Overview ──
  w('## Performance Overview');
  w();
  w('| Metric | 28-day current | 28-day previous | Δ | 90-day |');
  w('|--------|---------------|-----------------|---|--------|');
  w(`| Clicks | ${summary28.clicks.toLocaleString()} | ${summaryPrev.clicks.toLocaleString()} | ${delta(summary28.clicks, summaryPrev.clicks)} | ${summary90.clicks.toLocaleString()} |`);
  w(`| Impressions | ${summary28.impressions.toLocaleString()} | ${summaryPrev.impressions.toLocaleString()} | ${delta(summary28.impressions, summaryPrev.impressions)} | ${summary90.impressions.toLocaleString()} |`);
  w(`| CTR | ${pct(summary28.ctr)} | ${pct(summaryPrev.ctr)} | ${delta(summary28.ctr, summaryPrev.ctr)} | ${pct(summary90.ctr)} |`);
  w(`| Avg Position | ${pos(summary28.position)} | ${pos(summaryPrev.position)} | — | ${pos(summary90.position)} |`);
  w(`| Pages w/ impressions | ${p28rows.length} | — | — | ${p90rows.length} |`);
  w(`| Queries driving traffic | ${q28rows.filter(q => q.clicks > 0).length} | — | — | ${q90rows.filter(q => q.clicks > 0).length} |`);
  w();

  // ── Indexing Gap Summary (from Coverage report data in screenshot) ──
  w('## Indexing Status (from Coverage Report)');
  w();
  w('> Source: GSC Page Indexing report — captured 2026-06-13');
  w();
  w('| Status | Count | Priority |');
  w('|--------|-------|----------|');
  w('| ✅ Indexed (approx, based on pages w/ impressions 90d) | ~' + p90rows.length + ' | — |');
  w('| 🔴 Crawled — currently not indexed | 58 | HIGH |');
  w('| 🟠 Discovered — currently not indexed | 47 | MEDIUM |');
  w('| 🟡 Excluded by noindex tag | 4 | REVIEW |');
  w('| 🟡 Page with redirect | 4 | REVIEW |');
  w('| 🟡 Alternate page with proper canonical | 2 | OK (expected) |');
  w('| 🔴 Not found (404) | 1 | FIX |');
  w();
  w('**Total non-indexed: 116 pages.** The 58 "Crawled - currently not indexed" is the most impactful issue — Google crawled these pages and actively chose not to index them, almost always due to thin/duplicate content.');
  w();

  // ── Device Breakdown ──
  if (devices.length > 0) {
    w('## Device Breakdown (28d)');
    w();
    w('| Device | Impressions | Clicks | CTR | Position |');
    w('|--------|-------------|--------|-----|---------|');
    for (const r of devices) {
      w(`| ${r.keys[0]} | ${(r.impressions||0).toLocaleString()} | ${r.clicks||0} | ${pct(r.ctr||0)} | ${pos(r.position||0)} |`);
    }
    w();
  }

  // ── Sitemaps ──
  w('## Sitemap Status');
  w();
  if (sitemaps.length === 0) {
    w('❌ No sitemaps submitted to GSC');
  } else {
    for (const sm of sitemaps) {
      w(`**${sm.path}**`);
      w(`- Last submitted: ${sm.lastSubmitted || 'unknown'}`);
      w(`- Errors: ${sm.errors || 0} | Warnings: ${sm.warnings || 0}`);
      for (const c of (sm.contents || [])) {
        const subm = c.submitted || '?';
        const idx = c.indexed || '?';
        const ratio = (subm !== '?' && idx !== '?') ? ` (${Math.round((parseInt(idx)/parseInt(subm))*100)}% indexed)` : '';
        w(`- ${c.type}: ${idx}/${subm} indexed${ratio}`);
      }
      w();
    }
  }

  // ── Top Pages ──
  w('## Top Pages by Clicks (28d)');
  w();
  w('| Page | Clicks | Impressions | CTR | Position |');
  w('|------|--------|-------------|-----|---------|');
  for (const p of p28rows.sort((a, b) => b.clicks - a.clicks).slice(0, 25)) {
    w(`| ${shortUrl(p.page)} | ${p.clicks} | ${p.impressions} | ${pct(p.ctr)} | ${pos(p.position)} |`);
  }
  w();

  // ── Top Queries ──
  w('## Top Queries by Clicks (28d)');
  w();
  w('| Query | Clicks | Impressions | CTR | Position |');
  w('|-------|--------|-------------|-----|---------|');
  for (const q of q28rows.sort((a, b) => b.clicks - a.clicks).slice(0, 30)) {
    w(`| ${q.query} | ${q.clicks} | ${q.impressions} | ${pct(q.ctr)} | ${pos(q.position)} |`);
  }
  w();

  // ── Quick Wins (pos 4-8) ──
  w('## Quick Wins — Position 4-8 (push to top 3)');
  w();
  w('These queries rank 4-8 and have meaningful volume. Small content/title improvements could move them to top 3, significantly increasing CTR.');
  w();
  if (quickWins.length === 0) {
    w('No keywords in position 4-8 with 10+ impressions.');
  } else {
    w('| Query | Impressions | Clicks | CTR | Position | Action |');
    w('|-------|-------------|--------|-----|---------|--------|');
    for (const q of quickWins.slice(0, 20)) {
      const action = q.position <= 5 ? 'Strengthen title tag + add schema' : 'Add dedicated section or FAQ entry';
      w(`| ${q.query} | ${q.impressions} | ${q.clicks} | ${pct(q.ctr)} | ${pos(q.position)} | ${action} |`);
    }
  }
  w();

  // ── Striking Distance (pos 8-20) ──
  w('## Striking Distance — Position 8-20 (push to page 1)');
  w();
  w('Queries ranking 8-20 with 10+ impressions. Most are on page 2+ and invisible to searchers. Getting even half of these to page 1 could double traffic.');
  w();
  if (strikingQ.length === 0) {
    w('No keywords in striking distance with 10+ impressions.');
  } else {
    w('| Query | Impressions | Clicks | CTR | Position | Priority |');
    w('|-------|-------------|--------|-----|---------|---------|');
    for (const q of strikingQ.slice(0, 30)) {
      const priority = q.impressions >= 100 ? '🔴 HIGH' : q.impressions >= 30 ? '🟠 MED' : '🟡 LOW';
      w(`| ${q.query} | ${q.impressions} | ${q.clicks} | ${pct(q.ctr)} | ${pos(q.position)} | ${priority} |`);
    }
  }
  w();

  // ── Low CTR Opportunities ──
  w('## CTR Opportunities — High Impressions, Low CTR (<3%)');
  w();
  w('These queries get shown often but users rarely click. Rewriting meta titles and descriptions for these could increase clicks without improving rankings.');
  w();
  if (lowCtrQ.length === 0) {
    w('No high-impression / low-CTR queries found.');
  } else {
    w('| Query | Impressions | Clicks | CTR | Position |');
    w('|-------|-------------|--------|-----|---------|');
    for (const q of lowCtrQ.slice(0, 25)) {
      w(`| ${q.query} | ${q.impressions} | ${q.clicks} | ${pct(q.ctr)} | ${pos(q.position)} |`);
    }
  }
  w();

  // ── Pages with Zero Clicks (indexed but not converting) ──
  w('## Pages with Impressions but Zero Clicks (20+ impressions)');
  w();
  w('These pages appear in search results but nobody clicks. Their meta titles/descriptions are failing.');
  w();
  const zeroCtrRows = p28rows.filter(p => p.impressions >= 20 && p.clicks === 0).sort((a, b) => b.impressions - a.impressions);
  if (zeroCtrRows.length === 0) {
    w('All pages with 20+ impressions are generating clicks.');
  } else {
    w('| Page | Impressions | Position |');
    w('|------|-------------|---------|');
    for (const p of zeroCtrRows.slice(0, 20)) {
      w(`| ${shortUrl(p.page)} | ${p.impressions} | ${pos(p.position)} |`);
    }
  }
  w();

  // ── Action Plan ──────────────────────────────────────────────────────────
  w('## Action Plan (Priority Order)');
  w();

  w('### P0 — Fix the 404 (1 page)');
  w('One page returns 404. Find it in GSC Coverage report → Not Found tab. Either redirect it to the right URL or restore the page. A live 404 wastes crawl budget and loses any backlink equity.');
  w();

  w('### P1 — Diagnose "Crawled - Currently Not Indexed" (58 pages)');
  w('This is the biggest issue. Google crawled these pages and decided not to index them. Root causes, ranked by likelihood:');
  w('1. **Thin content** — pages with < 300 words of unique text. Fix: expand to 600-800 words with location-specific details.');
  w('2. **Duplicate content** — pages too similar to other pages (especially satellite sites). Fix: differentiate content or add canonical tags pointing to the strongest version.');
  w('3. **Low quality signals** — no internal links pointing to these pages. Fix: add internal links from the homepage and service pages.');
  w('4. **Soft 404** — pages that return 200 but say "Page not found" in the body. Fix: check each page loads real content.');
  w('**Action:** In GSC Coverage report, click "Crawled - currently not indexed" → export the URL list. Paste here and I\'ll audit each one.');
  w();

  w('### P2 — Unlock "Discovered - Currently Not Indexed" (47 pages)');
  w('Google knows these pages exist but hasn\'t crawled them yet. Usually because crawl budget is being spent elsewhere or Google doesn\'t think they\'re worth crawling.');
  w('**Action:** Ensure these pages are in the sitemap and have internal links. Check that robots.txt isn\'t accidentally slowing crawl rate.');
  w();

  w('### P3 — Review noindex pages (4)');
  w('Four pages are intentionally excluded via noindex tag. Verify these should be excluded (admin pages, thank-you pages, etc.) vs. pages accidentally tagged noindex.');
  w();

  w('### P4 — Review redirect pages (4)');
  w('Four redirect pages. Ensure redirects are 301 (permanent) not 302 (temporary), and that the destination URLs are the canonical versions you want indexed.');
  w();

  const strikingCount = strikingQ.length;
  const quickWinCount = quickWins.length;
  w(`### P5 — Keyword Optimization`);
  w(`- **${quickWinCount} quick-win keywords** (pos 4-8): These are close to top-3. Strengthen title tags, add FAQ schema, build 1-2 internal links to target pages.`);
  w(`- **${strikingQ.filter(q => q.impressions >= 100).length} high-volume striking-distance keywords** (pos 8-20, 100+ impressions): These have the most traffic potential. Each needs a dedicated page or section expansion.`);
  w(`- **${lowCtrQ.length} CTR improvement targets**: Rewrite meta descriptions for these queries to include pricing, "free quote", and location. Even moving from 1% → 3% CTR triples clicks without changing rankings.`);
  w();

  w('---');
  w(`*Report generated by analyze-pag-performance.mjs — data from Google Search Console API*`);

  const outPath = resolve(ROOT, `tasks/${new Date().toISOString().slice(0, 10)}-pag-gsc-analysis.md`);
  writeFileSync(outPath, lines.join('\n'));
  console.log(`\nReport saved: ${outPath}`);

  // Console summary
  console.log('\n── Performance Summary ──');
  console.log(`28d clicks: ${summary28.clicks.toLocaleString()} (${delta(summary28.clicks, summaryPrev.clicks)} vs prev 28d)`);
  console.log(`28d impressions: ${summary28.impressions.toLocaleString()} (${delta(summary28.impressions, summaryPrev.impressions)} vs prev 28d)`);
  console.log(`28d CTR: ${pct(summary28.ctr)} | Avg position: ${pos(summary28.position)}`);
  console.log(`90d clicks: ${summary90.clicks.toLocaleString()}`);
  console.log(`\nPages w/ impressions (28d): ${p28rows.length}`);
  console.log(`Queries driving clicks (28d): ${q28rows.filter(q => q.clicks > 0).length}`);
  console.log(`\nOpportunities:`);
  console.log(`  Quick wins (pos 4-8): ${quickWinCount} keywords`);
  console.log(`  Striking distance (pos 8-20): ${strikingCount} keywords`);
  console.log(`  Low CTR (<3%, 30+ impressions): ${lowCtrQ.length} queries`);
  console.log(`  Zero-click pages (20+ impressions): ${zeroCtrRows.length} pages`);
  console.log(`\nSitemaps: ${sitemaps.length}`);

  return outPath;
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
