#!/usr/bin/env node
/**
 * Satellite Sites GSC Audit Script
 * Pulls Search Console data for all satellite domains and generates
 * a comprehensive audit report with issues and recommendations.
 *
 * Usage: node scripts/audit-satellite-gsc.mjs
 * Output: tasks/2026-03-19-satellite-gsc-audit.md
 */

import { google } from 'googleapis';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── Load .env.local ────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = resolve(ROOT, '.env.local');
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

// ─── Domain list ─────────────────────────────────────────────────────────────
const SATELLITE_DOMAINS = [
  // Denver / Colorado
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
  // Phoenix / Arizona
  { domain: 'windshieldchiprepairmesa.com', label: 'Chip Repair Mesa', market: 'Phoenix' },
  { domain: 'windshieldchiprepairphoenix.com', label: 'Chip Repair Phoenix', market: 'Phoenix' },
  { domain: 'windshieldchiprepairscottsdale.com', label: 'Chip Repair Scottsdale', market: 'Phoenix' },
  { domain: 'windshieldchiprepairtempe.com', label: 'Chip Repair Tempe', market: 'Phoenix' },
  { domain: 'windshieldcostphoenix.com', label: 'WS Cost Phoenix', market: 'Phoenix' },
  { domain: 'mobilewindshieldphoenix.com', label: 'Mobile WS Phoenix', market: 'Phoenix' },
  // National
  { domain: 'carwindshieldprices.com', label: 'Car WS Prices', market: 'National' },
  { domain: 'windshieldrepairprices.com', label: 'WS Repair Prices', market: 'National' },
  { domain: 'carglassprices.com', label: 'Car Glass Prices', market: 'National' },
  // Colorado Springs / Fort Collins
  { domain: 'coloradospringswindshield.com', label: 'CS Windshield', market: 'CO Springs' },
  { domain: 'autoglasscoloradosprings.com', label: 'CS Auto Glass', market: 'CO Springs' },
  { domain: 'mobilewindshieldcoloradosprings.com', label: 'CS Mobile WS', market: 'CO Springs' },
  { domain: 'windshieldreplacementfortcollins.com', label: 'Ft Collins WS', market: 'CO Springs' },
];

// ─── GSC Client ──────────────────────────────────────────────────────────────
function createGscClient() {
  const clientId = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing GSC credentials');
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return google.searchconsole({ version: 'v1', auth: oauth2Client });
}

// ─── Date helpers ────────────────────────────────────────────────────────────
function formatDate(d) {
  // Use local date components to avoid UTC shift (e.g. 11:30 PM MT → next day in UTC)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getDates() {
  const today = new Date();
  // GSC data has ~3 day delay
  const currentEnd = new Date(today);
  currentEnd.setDate(currentEnd.getDate() - 3);
  const currentStart = new Date(currentEnd);
  currentStart.setDate(currentStart.getDate() - 27); // 28 day window

  const prevEnd = new Date(currentStart);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - 27);

  return {
    current: { start: formatDate(currentStart), end: formatDate(currentEnd) },
    previous: { start: formatDate(prevStart), end: formatDate(prevEnd) },
  };
}

// ─── Fetch functions ─────────────────────────────────────────────────────────
async function fetchSummary(client, domain, startDate, endDate) {
  try {
    const res = await client.searchanalytics.query({
      siteUrl: `sc-domain:${domain}`,
      requestBody: { startDate, endDate, dimensions: [], rowLimit: 1 },
    });
    const row = res.data.rows?.[0];
    if (!row) return { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    return { clicks: row.clicks || 0, impressions: row.impressions || 0, ctr: row.ctr || 0, position: row.position || 0 };
  } catch (err) {
    const code = err?.code || err?.status;
    if (code === 403 || code === 404) return { clicks: 0, impressions: 0, ctr: 0, position: 0, error: `Not verified (${code})` };
    return { clicks: 0, impressions: 0, ctr: 0, position: 0, error: err?.message || 'Unknown error' };
  }
}

async function fetchPages(client, domain, startDate, endDate) {
  try {
    const res = await client.searchanalytics.query({
      siteUrl: `sc-domain:${domain}`,
      requestBody: { startDate, endDate, dimensions: ['page'], rowLimit: 500 },
    });
    if (!res.data.rows) return [];
    return res.data.rows.map(r => ({
      page: r.keys[0],
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
      ctr: r.ctr || 0,
      position: r.position || 0,
    }));
  } catch {
    return [];
  }
}

async function fetchQueries(client, domain, startDate, endDate) {
  try {
    const res = await client.searchanalytics.query({
      siteUrl: `sc-domain:${domain}`,
      requestBody: { startDate, endDate, dimensions: ['query'], rowLimit: 500 },
    });
    if (!res.data.rows) return [];
    return res.data.rows.map(r => ({
      query: r.keys[0],
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
      ctr: r.ctr || 0,
      position: r.position || 0,
    }));
  } catch {
    return [];
  }
}

async function fetchDaily(client, domain, startDate, endDate) {
  try {
    const res = await client.searchanalytics.query({
      siteUrl: `sc-domain:${domain}`,
      requestBody: { startDate, endDate, dimensions: ['date'], rowLimit: 500 },
    });
    if (!res.data.rows) return [];
    return res.data.rows.map(r => ({
      date: r.keys[0],
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
      ctr: r.ctr || 0,
      position: r.position || 0,
    }));
  } catch {
    return [];
  }
}

async function fetchDeviceBreakdown(client, domain, startDate, endDate) {
  try {
    const res = await client.searchanalytics.query({
      siteUrl: `sc-domain:${domain}`,
      requestBody: { startDate, endDate, dimensions: ['device'], rowLimit: 10 },
    });
    if (!res.data.rows) return [];
    return res.data.rows.map(r => ({
      device: r.keys[0],
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
      ctr: r.ctr || 0,
      position: r.position || 0,
    }));
  } catch {
    return [];
  }
}

async function fetchSitemaps(client, domain) {
  try {
    const res = await client.sitemaps.list({ siteUrl: `sc-domain:${domain}` });
    if (!res.data.sitemap) return [];
    return res.data.sitemap.map(s => ({
      path: s.path,
      lastSubmitted: s.lastSubmitted,
      isPending: s.isPending,
      warnings: s.warnings || 0,
      errors: s.errors || 0,
      contents: s.contents?.map(c => ({ type: c.type, submitted: c.submitted, indexed: c.indexed })) || [],
    }));
  } catch {
    return [];
  }
}

async function listVerifiedSites(client) {
  try {
    const res = await client.sites.list({});
    return res.data.siteEntry?.map(s => s.siteUrl) || [];
  } catch {
    return [];
  }
}

// ─── Analysis functions ──────────────────────────────────────────────────────
function analyzeIssues(data) {
  const issues = [];

  // Not verified / no GSC access
  if (data.current.error) {
    issues.push({ severity: 'CRITICAL', type: 'ACCESS', message: `GSC access error: ${data.current.error}` });
    return issues;
  }

  // Zero impressions = not indexed or not ranking
  if (data.current.impressions === 0) {
    issues.push({ severity: 'CRITICAL', type: 'INDEXING', message: 'Zero impressions — site may not be indexed or has no ranking pages' });
    return issues;
  }

  // Very low impressions (< 10/day avg)
  if (data.current.impressions < 280) {
    issues.push({ severity: 'HIGH', type: 'VISIBILITY', message: `Very low impressions (${data.current.impressions} in 28 days, avg ${(data.current.impressions / 28).toFixed(1)}/day)` });
  }

  // Zero clicks despite impressions
  if (data.current.clicks === 0 && data.current.impressions > 0) {
    issues.push({ severity: 'HIGH', type: 'CTR', message: `Zero clicks despite ${data.current.impressions} impressions — titles/descriptions need work` });
  }

  // Very low CTR (< 1%)
  if (data.current.ctr < 0.01 && data.current.impressions > 100) {
    issues.push({ severity: 'HIGH', type: 'CTR', message: `Very low CTR (${(data.current.ctr * 100).toFixed(2)}%) — meta titles and descriptions may not be compelling` });
  }

  // Poor average position (> 50)
  if (data.current.position > 50 && data.current.impressions > 0) {
    issues.push({ severity: 'HIGH', type: 'RANKING', message: `Poor avg position (${data.current.position.toFixed(1)}) — content may not match search intent` });
  } else if (data.current.position > 20 && data.current.impressions > 0) {
    issues.push({ severity: 'MEDIUM', type: 'RANKING', message: `Avg position ${data.current.position.toFixed(1)} — not on page 1-2 for most queries` });
  }

  // Traffic drop vs previous period
  if (data.previous.impressions > 0) {
    const impressionDelta = ((data.current.impressions - data.previous.impressions) / data.previous.impressions) * 100;
    const clickDelta = data.previous.clicks > 0
      ? ((data.current.clicks - data.previous.clicks) / data.previous.clicks) * 100
      : 0;

    if (impressionDelta < -30) {
      issues.push({ severity: 'HIGH', type: 'TREND', message: `Impressions dropped ${Math.abs(impressionDelta).toFixed(0)}% vs previous 28 days (${data.previous.impressions} → ${data.current.impressions})` });
    } else if (impressionDelta < -15) {
      issues.push({ severity: 'MEDIUM', type: 'TREND', message: `Impressions down ${Math.abs(impressionDelta).toFixed(0)}% vs previous period` });
    }

    if (clickDelta < -30 && data.previous.clicks > 5) {
      issues.push({ severity: 'HIGH', type: 'TREND', message: `Clicks dropped ${Math.abs(clickDelta).toFixed(0)}% vs previous 28 days (${data.previous.clicks} → ${data.current.clicks})` });
    }

    // Position regression
    if (data.current.position > data.previous.position + 5 && data.previous.position > 0) {
      issues.push({ severity: 'MEDIUM', type: 'RANKING', message: `Position regressed from ${data.previous.position.toFixed(1)} → ${data.current.position.toFixed(1)}` });
    }
  }

  // Few indexed pages
  if (data.pages.length <= 1 && data.current.impressions > 0) {
    issues.push({ severity: 'MEDIUM', type: 'INDEXING', message: `Only ${data.pages.length} page(s) getting impressions — most pages may not be indexed` });
  } else if (data.pages.length <= 3) {
    issues.push({ severity: 'LOW', type: 'INDEXING', message: `Only ${data.pages.length} pages getting impressions` });
  }

  // Sitemap issues
  if (data.sitemaps.length === 0) {
    issues.push({ severity: 'MEDIUM', type: 'SITEMAP', message: 'No sitemap submitted to GSC' });
  } else {
    for (const sm of data.sitemaps) {
      if (sm.errors > 0) {
        issues.push({ severity: 'HIGH', type: 'SITEMAP', message: `Sitemap ${sm.path} has ${sm.errors} errors` });
      }
      if (sm.warnings > 0) {
        issues.push({ severity: 'LOW', type: 'SITEMAP', message: `Sitemap ${sm.path} has ${sm.warnings} warnings` });
      }
      for (const c of sm.contents) {
        if (c.submitted && c.indexed && parseInt(c.indexed) < parseInt(c.submitted) * 0.5) {
          issues.push({ severity: 'HIGH', type: 'INDEXING', message: `Sitemap: only ${c.indexed}/${c.submitted} ${c.type} URLs indexed` });
        }
      }
    }
  }

  // Striking distance keywords (position 8-20, decent impressions)
  const strikingDistance = data.queries.filter(q => q.position >= 8 && q.position <= 20 && q.impressions >= 10);
  if (strikingDistance.length > 0) {
    issues.push({ severity: 'INFO', type: 'OPPORTUNITY', message: `${strikingDistance.length} keywords in striking distance (pos 8-20) that could reach page 1` });
  }

  // High impression, low CTR queries
  const lowCtrQueries = data.queries.filter(q => q.impressions >= 50 && q.ctr < 0.02);
  if (lowCtrQueries.length > 0) {
    issues.push({ severity: 'MEDIUM', type: 'CTR', message: `${lowCtrQueries.length} queries with 50+ impressions but <2% CTR — title/meta optimization needed` });
  }

  // Device issues
  if (data.devices.length > 0) {
    const mobile = data.devices.find(d => d.device === 'MOBILE');
    const desktop = data.devices.find(d => d.device === 'DESKTOP');
    if (mobile && desktop && mobile.position > desktop.position + 10) {
      issues.push({ severity: 'MEDIUM', type: 'MOBILE', message: `Mobile position (${mobile.position.toFixed(1)}) much worse than desktop (${desktop.position.toFixed(1)}) — possible mobile usability issues` });
    }
  }

  return issues;
}

// ─── Report generation ───────────────────────────────────────────────────────
function pct(n) { return (n * 100).toFixed(2) + '%'; }
function delta(curr, prev) {
  if (prev === 0) return curr > 0 ? '+∞' : '—';
  const d = ((curr - prev) / prev) * 100;
  return (d >= 0 ? '+' : '') + d.toFixed(1) + '%';
}

function generateReport(allResults, dates, verifiedSites) {
  const lines = [];
  const w = (s) => lines.push(s);

  w('# Pink Auto Glass — Satellite Sites GSC Audit');
  w(`**Generated:** ${new Date().toISOString().slice(0, 10)}`);
  w(`**Current Period:** ${dates.current.start} → ${dates.current.end} (28 days)`);
  w(`**Previous Period:** ${dates.previous.start} → ${dates.previous.end} (28 days)`);
  w('');

  // ── Executive Summary ──
  w('## Executive Summary');
  w('');

  const criticals = allResults.filter(r => r.issues.some(i => i.severity === 'CRITICAL'));
  const highs = allResults.filter(r => r.issues.some(i => i.severity === 'HIGH'));
  const withTraffic = allResults.filter(r => r.data.current.impressions > 0);
  const totalClicks = allResults.reduce((sum, r) => sum + r.data.current.clicks, 0);
  const totalImpressions = allResults.reduce((sum, r) => sum + r.data.current.impressions, 0);
  const prevTotalClicks = allResults.reduce((sum, r) => sum + r.data.previous.clicks, 0);
  const prevTotalImpressions = allResults.reduce((sum, r) => sum + r.data.previous.impressions, 0);

  w(`| Metric | Value |`);
  w(`|--------|-------|`);
  w(`| Total domains | ${allResults.length} |`);
  w(`| Domains with traffic | ${withTraffic.length} |`);
  w(`| Domains with critical issues | ${criticals.length} |`);
  w(`| Domains with high-severity issues | ${highs.length} |`);
  w(`| Total clicks (28d) | ${totalClicks.toLocaleString()} (${delta(totalClicks, prevTotalClicks)}) |`);
  w(`| Total impressions (28d) | ${totalImpressions.toLocaleString()} (${delta(totalImpressions, prevTotalImpressions)}) |`);
  w(`| Avg CTR | ${totalImpressions > 0 ? pct(totalClicks / totalImpressions) : 'N/A'} |`);
  w('');

  // ── Verified Sites Check ──
  w('## GSC Verification Status');
  w('');
  const unverified = allResults.filter(r => !verifiedSites.includes(`sc-domain:${r.domain}`));
  if (unverified.length > 0) {
    w(`**${unverified.length} domains NOT verified in GSC** (cannot pull full data):`);
    for (const u of unverified) {
      w(`- ❌ ${u.domain}`);
    }
  } else {
    w('All domains verified in GSC.');
  }
  w('');

  // ── Scorecard ──
  w('## Domain Scorecard');
  w('');
  w('| Domain | Market | Impressions | Clicks | CTR | Avg Pos | Imp Δ | Pages | Issues |');
  w('|--------|--------|-------------|--------|-----|---------|-------|-------|--------|');
  for (const r of allResults.sort((a, b) => b.data.current.impressions - a.data.current.impressions)) {
    const d = r.data;
    const impD = delta(d.current.impressions, d.previous.impressions);
    const issueCount = r.issues.filter(i => i.severity !== 'INFO').length;
    const severity = r.issues.some(i => i.severity === 'CRITICAL') ? '🔴' :
                     r.issues.some(i => i.severity === 'HIGH') ? '🟠' :
                     r.issues.some(i => i.severity === 'MEDIUM') ? '🟡' : '🟢';
    w(`| ${r.domain} | ${r.market} | ${d.current.impressions.toLocaleString()} | ${d.current.clicks} | ${pct(d.current.ctr)} | ${d.current.position > 0 ? d.current.position.toFixed(1) : '—'} | ${impD} | ${d.pages.length} | ${severity} ${issueCount} |`);
  }
  w('');

  // ── Market Rollup ──
  w('## Market Summary');
  w('');
  const markets = {};
  for (const r of allResults) {
    if (!markets[r.market]) markets[r.market] = { clicks: 0, impressions: 0, prevClicks: 0, prevImpressions: 0, count: 0, withTraffic: 0 };
    markets[r.market].clicks += r.data.current.clicks;
    markets[r.market].impressions += r.data.current.impressions;
    markets[r.market].prevClicks += r.data.previous.clicks;
    markets[r.market].prevImpressions += r.data.previous.impressions;
    markets[r.market].count++;
    if (r.data.current.impressions > 0) markets[r.market].withTraffic++;
  }
  w('| Market | Sites | With Traffic | Impressions | Clicks | Imp Δ |');
  w('|--------|-------|-------------|-------------|--------|-------|');
  for (const [name, m] of Object.entries(markets)) {
    w(`| ${name} | ${m.count} | ${m.withTraffic} | ${m.impressions.toLocaleString()} | ${m.clicks} | ${delta(m.impressions, m.prevImpressions)} |`);
  }
  w('');

  // ── Detailed Per-Domain Reports ──
  w('---');
  w('');
  w('## Detailed Domain Reports');
  w('');

  for (const r of allResults) {
    const d = r.data;
    w(`### ${r.domain} (${r.label} — ${r.market})`);
    w('');

    // Performance summary
    w('**Performance (28 days):**');
    w(`| Metric | Current | Previous | Change |`);
    w(`|--------|---------|----------|--------|`);
    w(`| Impressions | ${d.current.impressions.toLocaleString()} | ${d.previous.impressions.toLocaleString()} | ${delta(d.current.impressions, d.previous.impressions)} |`);
    w(`| Clicks | ${d.current.clicks} | ${d.previous.clicks} | ${delta(d.current.clicks, d.previous.clicks)} |`);
    w(`| CTR | ${pct(d.current.ctr)} | ${pct(d.previous.ctr)} | ${delta(d.current.ctr, d.previous.ctr)} |`);
    w(`| Avg Position | ${d.current.position > 0 ? d.current.position.toFixed(1) : '—'} | ${d.previous.position > 0 ? d.previous.position.toFixed(1) : '—'} | ${d.current.position > 0 && d.previous.position > 0 ? (d.current.position - d.previous.position > 0 ? '+' : '') + (d.current.position - d.previous.position).toFixed(1) : '—'} |`);
    w('');

    // Issues
    if (r.issues.length > 0) {
      w('**Issues:**');
      for (const issue of r.issues) {
        const icon = issue.severity === 'CRITICAL' ? '🔴' : issue.severity === 'HIGH' ? '🟠' : issue.severity === 'MEDIUM' ? '🟡' : issue.severity === 'LOW' ? '🔵' : 'ℹ️';
        w(`- ${icon} **${issue.severity}** [${issue.type}]: ${issue.message}`);
      }
      w('');
    } else {
      w('**Issues:** None detected');
      w('');
    }

    // Top pages
    if (d.pages.length > 0) {
      w('**Top Pages:**');
      w('| Page | Impressions | Clicks | CTR | Pos |');
      w('|------|-------------|--------|-----|-----|');
      for (const p of d.pages.slice(0, 10)) {
        const shortPage = p.page.replace(`https://${r.domain}`, '').replace(`https://www.${r.domain}`, '') || '/';
        w(`| ${shortPage} | ${p.impressions} | ${p.clicks} | ${pct(p.ctr)} | ${p.position.toFixed(1)} |`);
      }
      w('');
    }

    // Top queries
    if (d.queries.length > 0) {
      w('**Top Queries:**');
      w('| Query | Impressions | Clicks | CTR | Pos |');
      w('|-------|-------------|--------|-----|-----|');
      for (const q of d.queries.slice(0, 10)) {
        w(`| ${q.query} | ${q.impressions} | ${q.clicks} | ${pct(q.ctr)} | ${q.position.toFixed(1)} |`);
      }
      w('');

      // Striking distance keywords
      const striking = d.queries.filter(q => q.position >= 8 && q.position <= 20 && q.impressions >= 5);
      if (striking.length > 0) {
        w('**Striking Distance Keywords (pos 8-20, push to page 1):**');
        w('| Query | Impressions | Pos | Action |');
        w('|-------|-------------|-----|--------|');
        for (const q of striking.slice(0, 10)) {
          const action = q.position <= 12 ? 'Quick win — minor content optimization' : 'Add/improve dedicated section';
          w(`| ${q.query} | ${q.impressions} | ${q.position.toFixed(1)} | ${action} |`);
        }
        w('');
      }
    }

    // Sitemaps
    if (d.sitemaps.length > 0) {
      w('**Sitemaps:**');
      for (const sm of d.sitemaps) {
        const indexed = sm.contents.map(c => `${c.indexed || '?'}/${c.submitted || '?'} ${c.type}`).join(', ');
        w(`- ${sm.path} — Errors: ${sm.errors}, Warnings: ${sm.warnings}${indexed ? `, Indexed: ${indexed}` : ''}`);
      }
      w('');
    } else {
      w('**Sitemaps:** None submitted');
      w('');
    }

    // Device breakdown
    if (d.devices.length > 0) {
      w('**Device Breakdown:**');
      w('| Device | Impressions | Clicks | CTR | Pos |');
      w('|--------|-------------|--------|-----|-----|');
      for (const dev of d.devices) {
        w(`| ${dev.device} | ${dev.impressions} | ${dev.clicks} | ${pct(dev.ctr)} | ${dev.position.toFixed(1)} |`);
      }
      w('');
    }

    w('---');
    w('');
  }

  // ── Recommendations ──
  w('## Recommendations');
  w('');

  // Group by priority
  const recos = [];

  // Critical: unverified domains
  if (unverified.length > 0) {
    recos.push({
      priority: 'P0',
      title: 'Verify unverified domains in GSC',
      details: `${unverified.length} domain(s) aren't verified: ${unverified.map(u => u.domain).join(', ')}. Without verification, Google can't report data and you can't submit sitemaps.`,
      action: 'Add each domain as a property in GSC (sc-domain: format) and verify via DNS TXT record.',
    });
  }

  // Critical: zero-impression sites
  const zeroImpression = allResults.filter(r => r.data.current.impressions === 0 && !r.data.current.error);
  if (zeroImpression.length > 0) {
    recos.push({
      priority: 'P0',
      title: 'Fix zero-impression domains',
      details: `${zeroImpression.length} domain(s) have zero impressions: ${zeroImpression.map(z => z.domain).join(', ')}. These sites are either not indexed or have no ranking content.`,
      action: '1. Check if site is live (curl homepage). 2. Submit sitemap in GSC. 3. Request indexing of homepage. 4. Check robots.txt isn\'t blocking crawlers.',
    });
  }

  // High: no sitemaps
  const noSitemaps = allResults.filter(r => r.data.sitemaps.length === 0 && !r.data.current.error);
  if (noSitemaps.length > 0) {
    recos.push({
      priority: 'P1',
      title: 'Submit sitemaps for all domains',
      details: `${noSitemaps.length} domain(s) have no sitemap submitted: ${noSitemaps.map(n => n.domain).join(', ')}.`,
      action: 'Each Next.js sat site should have a /sitemap.xml. Submit it in GSC for each property.',
    });
  }

  // High: low CTR
  const lowCtr = allResults.filter(r => r.data.current.ctr < 0.02 && r.data.current.impressions > 100);
  if (lowCtr.length > 0) {
    recos.push({
      priority: 'P1',
      title: 'Improve CTR on underperforming domains',
      details: `${lowCtr.length} domain(s) have CTR below 2% with 100+ impressions. Users are seeing these in search but not clicking.`,
      action: 'Review and rewrite meta titles and descriptions. Make them more compelling with pricing, "free quote", location names, and urgency.',
    });
  }

  // Medium: traffic drops
  const dropping = allResults.filter(r => {
    if (r.data.previous.impressions < 50) return false;
    return ((r.data.current.impressions - r.data.previous.impressions) / r.data.previous.impressions) < -0.25;
  });
  if (dropping.length > 0) {
    recos.push({
      priority: 'P2',
      title: 'Investigate traffic drops',
      details: `${dropping.length} domain(s) saw 25%+ impression drops: ${dropping.map(d => d.domain).join(', ')}.`,
      action: 'Check for: algorithm updates, lost backlinks, content changes, technical errors (5xx, redirect loops). Review GSC Coverage report for each.',
    });
  }

  // Opportunity: striking distance
  const strikingDomains = allResults.filter(r => r.data.queries.some(q => q.position >= 8 && q.position <= 20 && q.impressions >= 10));
  if (strikingDomains.length > 0) {
    recos.push({
      priority: 'P2',
      title: 'Push striking-distance keywords to page 1',
      details: `${strikingDomains.length} domain(s) have keywords ranking 8-20 that could reach page 1 with optimization.`,
      action: 'For each keyword: strengthen the target page content, add internal links, improve title tag relevance, and consider building backlinks.',
    });
  }

  // Few indexed pages
  const fewPages = allResults.filter(r => r.data.pages.length > 0 && r.data.pages.length <= 3);
  if (fewPages.length > 0) {
    recos.push({
      priority: 'P2',
      title: 'Improve page indexing',
      details: `${fewPages.length} domain(s) have only 1-3 pages getting impressions despite having 20+ pages of content.`,
      action: 'Check internal linking structure. Add sitemap. Use GSC URL Inspection tool to request indexing of key pages. Ensure content is unique (not duplicate across sites).',
    });
  }

  for (const reco of recos) {
    w(`### ${reco.priority}: ${reco.title}`);
    w(`${reco.details}`);
    w(`**Action:** ${reco.action}`);
    w('');
  }

  return lines.join('\n');
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Starting satellite GSC audit...');
  const client = createGscClient();
  const dates = getDates();
  console.log(`Current period: ${dates.current.start} → ${dates.current.end}`);
  console.log(`Previous period: ${dates.previous.start} → ${dates.previous.end}`);

  // First, list all verified sites
  console.log('Checking verified sites...');
  const verifiedSites = await listVerifiedSites(client);
  console.log(`Found ${verifiedSites.length} verified sites in GSC account`);

  const allResults = [];

  // Process domains in batches of 4 to avoid rate limits
  const batchSize = 4;
  for (let i = 0; i < SATELLITE_DOMAINS.length; i += batchSize) {
    const batch = SATELLITE_DOMAINS.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(SATELLITE_DOMAINS.length / batchSize)}: ${batch.map(b => b.domain).join(', ')}`);

    const batchResults = await Promise.all(batch.map(async (sat) => {
      // Fetch current and previous period data in parallel
      const [currentSummary, prevSummary, pages, queries, daily, devices, sitemaps] = await Promise.all([
        fetchSummary(client, sat.domain, dates.current.start, dates.current.end),
        fetchSummary(client, sat.domain, dates.previous.start, dates.previous.end),
        fetchPages(client, sat.domain, dates.current.start, dates.current.end),
        fetchQueries(client, sat.domain, dates.current.start, dates.current.end),
        fetchDaily(client, sat.domain, dates.current.start, dates.current.end),
        fetchDeviceBreakdown(client, sat.domain, dates.current.start, dates.current.end),
        fetchSitemaps(client, sat.domain),
      ]);

      const data = {
        current: currentSummary,
        previous: prevSummary,
        pages,
        queries,
        daily,
        devices,
        sitemaps,
      };

      const issues = analyzeIssues(data);

      return {
        domain: sat.domain,
        label: sat.label,
        market: sat.market,
        data,
        issues,
      };
    }));

    allResults.push(...batchResults);

    // Small delay between batches to be nice to the API
    if (i + batchSize < SATELLITE_DOMAINS.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log('\nGenerating report...');
  const report = generateReport(allResults, dates, verifiedSites);

  const outPath = resolve(ROOT, 'tasks', '2026-03-19-satellite-gsc-audit.md');
  writeFileSync(outPath, report);
  console.log(`\nReport saved to: ${outPath}`);

  // Print quick summary
  console.log('\n── Quick Summary ──');
  const critCount = allResults.filter(r => r.issues.some(i => i.severity === 'CRITICAL')).length;
  const highCount = allResults.filter(r => r.issues.some(i => i.severity === 'HIGH')).length;
  const withTraffic = allResults.filter(r => r.data.current.impressions > 0).length;
  console.log(`Domains with traffic: ${withTraffic}/${allResults.length}`);
  console.log(`Critical issues: ${critCount} domains`);
  console.log(`High issues: ${highCount} domains`);
}

main().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
