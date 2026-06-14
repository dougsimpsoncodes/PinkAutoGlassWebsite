#!/usr/bin/env node
/**
 * GSC URL Inspection — bucket every sitemap URL by coverage state.
 *
 * Reconstructs the "Crawled - currently not indexed" / "Discovered - currently
 * not indexed" lists (which the API can't list directly) by inspecting each
 * URL from the live sitemap and grouping by indexStatusResult.coverageState.
 *
 * Usage: node scripts/inspect-indexing-status.mjs
 * Output: tasks/<date>-indexing-status.md  (+ console summary)
 *
 * Quota: 2,000 inspections/day/property. ~208 URLs is fine.
 */

import { google } from 'googleapis';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SITE = 'sc-domain:pinkautoglass.com';
const SITEMAP_URL = 'https://pinkautoglass.com/sitemap.xml';

function loadEnv() {
  const content = readFileSync(resolve(ROOT, '.env.local'), 'utf-8');
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

function gscClient() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID,
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET,
  );
  auth.setCredentials({ refresh_token: process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN });
  return google.searchconsole({ version: 'v1', auth });
}

async function getSitemapUrls() {
  const res = await fetch(SITEMAP_URL);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
}

async function inspect(client, url) {
  try {
    const res = await client.urlInspection.index.inspect({
      requestBody: { inspectionUrl: url, siteUrl: SITE },
    });
    const r = res.data.inspectionResult?.indexStatusResult || {};
    return {
      url,
      verdict: r.verdict || 'UNKNOWN',
      coverageState: r.coverageState || 'unknown',
      robotsTxtState: r.robotsTxtState || '',
      indexingState: r.indexingState || '',
      lastCrawlTime: r.lastCrawlTime || '',
      googleCanonical: r.googleCanonical || '',
      userCanonical: r.userCanonical || '',
      pageFetchState: r.pageFetchState || '',
    };
  } catch (err) {
    return { url, coverageState: `ERROR: ${err.message}`, verdict: 'ERROR' };
  }
}

// Simple concurrency limiter (API is rate-limited; keep it modest)
async function mapLimit(items, limit, fn) {
  const out = [];
  let i = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return out;
}

async function main() {
  const client = gscClient();
  console.log('Fetching live sitemap URLs...');
  const urls = await getSitemapUrls();
  console.log(`Inspecting ${urls.length} URLs (this takes a few minutes)...\n`);

  let done = 0;
  const results = await mapLimit(urls, 4, async (url) => {
    const r = await inspect(client, url);
    done++;
    if (done % 20 === 0) console.log(`  ${done}/${urls.length} inspected`);
    return r;
  });

  // Bucket by coverageState
  const buckets = {};
  for (const r of results) {
    const key = r.coverageState || 'unknown';
    (buckets[key] ||= []).push(r);
  }

  const order = Object.keys(buckets).sort((a, b) => buckets[b].length - buckets[a].length);

  // ── Report ──
  const lines = [];
  const w = (s = '') => lines.push(s);
  w('# Pink Auto Glass — Indexing Status by URL');
  w(`**Generated:** ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`);
  w(`**Method:** GSC URL Inspection API over ${urls.length} live sitemap URLs`);
  w('');
  w('## Summary');
  w('');
  w('| Coverage State | Count |');
  w('|----------------|-------|');
  for (const k of order) w(`| ${k} | ${buckets[k].length} |`);
  w('');

  for (const k of order) {
    w(`## ${k} (${buckets[k].length})`);
    w('');
    if (/indexed|Submitted and indexed/i.test(k) && !/not indexed/i.test(k)) {
      w('*(indexed — listed for completeness, collapsed)*');
      w('');
      w('<details><summary>Show URLs</summary>');
      w('');
    }
    w('| URL | Last Crawl | Google Canonical ≠ URL? |');
    w('|-----|-----------|------------------------|');
    for (const r of buckets[k].sort((a, b) => a.url.localeCompare(b.url))) {
      const path = r.url.replace('https://pinkautoglass.com', '') || '/';
      const crawl = r.lastCrawlTime ? r.lastCrawlTime.slice(0, 10) : '—';
      const canonMismatch = r.googleCanonical && r.googleCanonical !== r.url ? `yes → ${r.googleCanonical.replace('https://pinkautoglass.com', '')}` : '';
      w(`| ${path} | ${crawl} | ${canonMismatch} |`);
    }
    if (/indexed|Submitted and indexed/i.test(k) && !/not indexed/i.test(k)) {
      w('');
      w('</details>');
    }
    w('');
  }

  const outPath = resolve(ROOT, `tasks/${new Date().toISOString().slice(0, 10)}-indexing-status.md`);
  writeFileSync(outPath, lines.join('\n'));

  console.log('\n── Coverage Summary ──');
  for (const k of order) console.log(`  ${buckets[k].length.toString().padStart(3)}  ${k}`);
  console.log(`\nReport: ${outPath}`);
}

main().catch(err => { console.error('Failed:', err.message); process.exit(1); });
