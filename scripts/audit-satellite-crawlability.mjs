#!/usr/bin/env node
/**
 * Satellite Sites Crawlability Audit
 * Checks robots.txt, noindex tags, sitemap validity, redirect chains,
 * canonical tags, and key page responses for all satellite domains.
 *
 * Usage: node scripts/audit-satellite-crawlability.mjs
 * Output: tasks/2026-03-19-satellite-crawlability-audit.md
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const DOMAINS = [
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

// Key pages to check on each site (common across all sat sites)
const KEY_PATHS = ['/', '/about', '/cost', '/blog', '/sitemap.xml', '/robots.txt'];

// ─── Fetch with redirect tracking ────────────────────────────────────────────
async function fetchWithRedirects(url, maxRedirects = 10) {
  const chain = [];
  let currentUrl = url;

  for (let i = 0; i < maxRedirects; i++) {
    try {
      const res = await fetch(currentUrl, {
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        },
        signal: AbortSignal.timeout(15000),
      });

      chain.push({ url: currentUrl, status: res.status });

      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const location = res.headers.get('location');
        if (!location) break;
        currentUrl = location.startsWith('http') ? location : new URL(location, currentUrl).href;
        continue;
      }

      // Final response — read headers and partial body
      const headers = Object.fromEntries(res.headers.entries());
      let body = '';
      try {
        body = await res.text();
      } catch {
        body = '';
      }

      return { chain, finalStatus: res.status, headers, body, finalUrl: currentUrl };
    } catch (err) {
      chain.push({ url: currentUrl, status: 0, error: err.message });
      return { chain, finalStatus: 0, headers: {}, body: '', finalUrl: currentUrl, error: err.message };
    }
  }

  return { chain, finalStatus: 0, headers: {}, body: '', finalUrl: currentUrl, error: 'Too many redirects' };
}

// ─── Check a single page ─────────────────────────────────────────────────────
async function checkPage(url) {
  const result = await fetchWithRedirects(url);
  const issues = [];

  // Redirect chain length
  if (result.chain.length > 2) {
    issues.push({ severity: 'MEDIUM', message: `Redirect chain (${result.chain.length} hops): ${result.chain.map(c => `${c.status} ${c.url}`).join(' → ')}` });
  }

  // HTTP to HTTPS redirect (expected but note if missing)
  const hasHttpToHttps = result.chain.some((c, i) =>
    c.url.startsWith('http://') && i + 1 < result.chain.length && result.chain[i + 1].url.startsWith('https://')
  );

  // Check for non-301 redirects (307/302 = temporary, bad for SEO)
  for (const hop of result.chain) {
    if ([302, 307].includes(hop.status)) {
      issues.push({ severity: 'HIGH', message: `Temporary redirect (${hop.status}) at ${hop.url} — should be 301 or 308 for SEO` });
    }
  }

  // Error status
  if (result.finalStatus >= 500) {
    issues.push({ severity: 'CRITICAL', message: `Server error (${result.finalStatus})` });
  } else if (result.finalStatus === 404) {
    issues.push({ severity: 'HIGH', message: `Page not found (404)` });
  } else if (result.finalStatus === 0) {
    issues.push({ severity: 'CRITICAL', message: `Could not connect: ${result.error}` });
  }

  // Check HTML for noindex
  let hasNoindex = false;
  let hasCanonical = null;
  let metaTitle = null;
  let metaDescription = null;
  let hasHreflang = false;

  if (result.body && result.finalStatus === 200) {
    // noindex in meta tag
    const noindexMeta = result.body.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i)
      || result.body.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']robots["'][^>]*>/i);
    if (noindexMeta && noindexMeta[1].toLowerCase().includes('noindex')) {
      hasNoindex = true;
      issues.push({ severity: 'CRITICAL', message: `Page has noindex meta tag: ${noindexMeta[0]}` });
    }

    // canonical
    const canonicalMatch = result.body.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i)
      || result.body.match(/<link[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["'][^>]*>/i);
    if (canonicalMatch) {
      hasCanonical = canonicalMatch[1];
    }

    // meta title
    const titleMatch = result.body.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleMatch) metaTitle = titleMatch[1].trim();

    // meta description
    const descMatch = result.body.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
      || result.body.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
    if (descMatch) metaDescription = descMatch[1].trim();

    // hreflang
    hasHreflang = /<link[^>]*hreflang/i.test(result.body);
  }

  // X-Robots-Tag header
  const xRobotsTag = result.headers['x-robots-tag'];
  if (xRobotsTag && xRobotsTag.toLowerCase().includes('noindex')) {
    hasNoindex = true;
    issues.push({ severity: 'CRITICAL', message: `X-Robots-Tag header contains noindex: ${xRobotsTag}` });
  }

  return {
    url,
    finalUrl: result.finalUrl,
    status: result.finalStatus,
    redirectChain: result.chain,
    hasNoindex,
    canonical: hasCanonical,
    metaTitle,
    metaDescription,
    xRobotsTag,
    issues,
  };
}

// ─── Parse robots.txt ────────────────────────────────────────────────────────
function parseRobotsTxt(body, domain) {
  const issues = [];
  const lines = body.split('\n').map(l => l.trim());
  const disallowRules = [];
  let hasSitemapDirective = false;
  let sitemapUrls = [];
  let currentAgent = null;
  let blocksGooglebot = false;
  let blocksAll = false;

  for (const line of lines) {
    if (line.startsWith('#') || line === '') continue;

    const lower = line.toLowerCase();
    if (lower.startsWith('user-agent:')) {
      currentAgent = line.split(':')[1].trim().toLowerCase();
    } else if (lower.startsWith('disallow:')) {
      const path = line.split(':').slice(1).join(':').trim();
      if (path) {
        disallowRules.push({ agent: currentAgent, path });
        if (path === '/' && (currentAgent === '*' || currentAgent === 'googlebot')) {
          if (currentAgent === '*') blocksAll = true;
          if (currentAgent === 'googlebot') blocksGooglebot = true;
        }
      }
    } else if (lower.startsWith('sitemap:')) {
      hasSitemapDirective = true;
      sitemapUrls.push(line.split(':').slice(1).join(':').trim());
    }
  }

  if (blocksAll) {
    issues.push({ severity: 'CRITICAL', message: 'robots.txt blocks ALL crawlers with Disallow: /' });
  }
  if (blocksGooglebot) {
    issues.push({ severity: 'CRITICAL', message: 'robots.txt specifically blocks Googlebot with Disallow: /' });
  }
  if (!hasSitemapDirective) {
    issues.push({ severity: 'MEDIUM', message: 'robots.txt has no Sitemap directive — add Sitemap: https://' + domain + '/sitemap.xml' });
  }

  // Check for overly broad disallow rules
  const broadDisallows = disallowRules.filter(r =>
    (r.agent === '*' || r.agent === 'googlebot') &&
    (r.path === '/blog' || r.path === '/blog/' || r.path === '/api' || r.path === '/api/')
  );
  for (const rule of broadDisallows) {
    if (rule.path.startsWith('/blog')) {
      issues.push({ severity: 'HIGH', message: `robots.txt disallows ${rule.path} for ${rule.agent} — this blocks blog indexing` });
    }
  }

  return { disallowRules, sitemapUrls, hasSitemapDirective, blocksAll, blocksGooglebot, issues, raw: body };
}

// ─── Validate sitemap XML ────────────────────────────────────────────────────
async function checkSitemap(url, domain) {
  const result = await fetchWithRedirects(url);
  const issues = [];

  if (result.finalStatus !== 200) {
    issues.push({ severity: 'HIGH', message: `Sitemap returned status ${result.finalStatus}` });
    return { url, status: result.finalStatus, urlCount: 0, issues, urls: [] };
  }

  const body = result.body;

  // Check content type
  const contentType = result.headers['content-type'] || '';
  if (!contentType.includes('xml') && !contentType.includes('text/')) {
    issues.push({ severity: 'LOW', message: `Sitemap content-type is "${contentType}" — should be application/xml` });
  }

  // Count URLs
  const urlMatches = body.match(/<loc>([^<]*)<\/loc>/gi) || [];
  const urls = urlMatches.map(m => m.replace(/<\/?loc>/gi, ''));

  if (urls.length === 0) {
    issues.push({ severity: 'HIGH', message: 'Sitemap contains 0 URLs' });
  }

  // Check for lastmod
  const hasLastmod = /<lastmod>/i.test(body);
  if (!hasLastmod && urls.length > 0) {
    issues.push({ severity: 'LOW', message: 'Sitemap missing <lastmod> tags — adding these helps Google prioritize fresh content' });
  }

  // Check if URLs match domain
  const wrongDomain = urls.filter(u => {
    try {
      const host = new URL(u).hostname;
      return host !== domain && host !== `www.${domain}`;
    } catch {
      return true;
    }
  });
  if (wrongDomain.length > 0) {
    issues.push({ severity: 'HIGH', message: `Sitemap contains ${wrongDomain.length} URLs pointing to wrong domain: ${wrongDomain.slice(0, 3).join(', ')}${wrongDomain.length > 3 ? '...' : ''}` });
  }

  // Check for http:// URLs (should be https)
  const httpUrls = urls.filter(u => u.startsWith('http://'));
  if (httpUrls.length > 0) {
    issues.push({ severity: 'MEDIUM', message: `Sitemap contains ${httpUrls.length} http:// URLs (should be https)` });
  }

  // Check for duplicate URLs
  const uniqueUrls = new Set(urls);
  if (uniqueUrls.size < urls.length) {
    issues.push({ severity: 'MEDIUM', message: `Sitemap has ${urls.length - uniqueUrls.size} duplicate URLs` });
  }

  return { url, status: result.finalStatus, urlCount: urls.length, issues, urls };
}

// ─── Audit one domain ────────────────────────────────────────────────────────
async function auditDomain(domainInfo) {
  const { domain, label, market } = domainInfo;
  console.log(`  Auditing ${domain}...`);

  const results = { domain, label, market, issues: [] };

  // 1. Check robots.txt
  const robotsResult = await fetchWithRedirects(`https://${domain}/robots.txt`);
  if (robotsResult.finalStatus === 200) {
    results.robots = parseRobotsTxt(robotsResult.body, domain);
    results.issues.push(...results.robots.issues);
  } else {
    results.robots = { raw: null, issues: [{ severity: 'MEDIUM', message: `robots.txt returned ${robotsResult.finalStatus} — no robots.txt found` }] };
    results.issues.push(...results.robots.issues);
  }

  // 2. Check sitemap
  results.sitemap = await checkSitemap(`https://${domain}/sitemap.xml`, domain);
  results.issues.push(...results.sitemap.issues);

  // 3. Check key pages (homepage, about, cost, blog)
  results.pages = {};
  const pageChecks = KEY_PATHS.filter(p => p !== '/sitemap.xml' && p !== '/robots.txt').map(async (path) => {
    const pageResult = await checkPage(`https://${domain}${path}`);
    results.pages[path] = pageResult;
    results.issues.push(...pageResult.issues.map(i => ({ ...i, message: `[${path}] ${i.message}` })));
    return pageResult;
  });
  await Promise.all(pageChecks);

  // 4. Check http→https redirect
  const httpCheck = await fetchWithRedirects(`http://${domain}/`);
  const redirectsToHttps = httpCheck.chain.some((c, i) =>
    c.url.startsWith('http://') && c.status >= 300 && c.status < 400 &&
    i + 1 < httpCheck.chain.length && httpCheck.chain[i + 1].url.startsWith('https://')
  ) || (httpCheck.finalUrl && httpCheck.finalUrl.startsWith('https://'));
  if (!redirectsToHttps && httpCheck.finalStatus !== 0) {
    results.issues.push({ severity: 'HIGH', message: 'No HTTP→HTTPS redirect — site may be accessible over insecure connection' });
  }
  results.httpRedirect = { redirectsToHttps, chain: httpCheck.chain };

  // 5. Check www vs non-www
  const wwwCheck = await fetchWithRedirects(`https://www.${domain}/`);
  results.wwwRedirect = {
    status: wwwCheck.finalStatus,
    finalUrl: wwwCheck.finalUrl,
    chain: wwwCheck.chain,
  };
  // Check if www resolves differently or has issues
  if (wwwCheck.finalStatus === 0) {
    // www doesn't resolve — fine, just means no www variant
    results.wwwRedirect.note = 'www subdomain does not resolve (OK if intentional)';
  } else if (wwwCheck.finalUrl && !wwwCheck.finalUrl.includes(`//${domain}`) && !wwwCheck.finalUrl.includes(`//www.${domain}`)) {
    results.issues.push({ severity: 'MEDIUM', message: `www.${domain} redirects to unexpected URL: ${wwwCheck.finalUrl}` });
  }

  // 6. Canonical consistency check (homepage)
  const homePage = results.pages['/'];
  if (homePage && homePage.canonical) {
    const expectedCanonical = `https://${domain}/`;
    const expectedCanonicalNoSlash = `https://${domain}`;
    if (homePage.canonical !== expectedCanonical && homePage.canonical !== expectedCanonicalNoSlash &&
        homePage.canonical !== `https://www.${domain}/` && homePage.canonical !== `https://www.${domain}`) {
      // Canonical points elsewhere — this is the likely indexing killer
      results.issues.push({ severity: 'CRITICAL', message: `Homepage canonical points to external domain: ${homePage.canonical} — this tells Google NOT to index this site` });
    }
  } else if (homePage && !homePage.canonical && homePage.status === 200) {
    results.issues.push({ severity: 'MEDIUM', message: 'Homepage missing canonical tag' });
  }

  return results;
}

// ─── Generate report ─────────────────────────────────────────────────────────
function generateReport(allResults) {
  const lines = [];
  const w = (s) => lines.push(s);

  w('# Pink Auto Glass — Satellite Sites Crawlability Audit');
  w(`**Generated:** ${new Date().toISOString().slice(0, 10)}`);
  w(`**Checked:** robots.txt, sitemap.xml, noindex tags, redirects, canonicals, key pages`);
  w('');

  // Executive summary
  w('## Executive Summary');
  w('');

  const allIssues = allResults.flatMap(r => r.issues);
  const criticals = allIssues.filter(i => i.severity === 'CRITICAL');
  const highs = allIssues.filter(i => i.severity === 'HIGH');
  const mediums = allIssues.filter(i => i.severity === 'MEDIUM');

  w(`| Severity | Count |`);
  w(`|----------|-------|`);
  w(`| 🔴 CRITICAL | ${criticals.length} |`);
  w(`| 🟠 HIGH | ${highs.length} |`);
  w(`| 🟡 MEDIUM | ${mediums.length} |`);
  w('');

  // Cross-domain issues
  const noindexSites = allResults.filter(r => r.pages['/']?.hasNoindex);
  const badCanonicalSites = allResults.filter(r => r.issues.some(i => i.message.includes('canonical points to external')));
  const noRobotsSites = allResults.filter(r => r.robots.raw === null);
  const blockedSites = allResults.filter(r => r.robots.blocksAll || r.robots.blocksGooglebot);
  const noSitemapDirective = allResults.filter(r => r.robots.hasSitemapDirective === false && r.robots.raw !== null);
  const sitemapErrors = allResults.filter(r => r.sitemap.issues.some(i => i.severity === 'HIGH'));
  const noHttpsRedirect = allResults.filter(r => !r.httpRedirect.redirectsToHttps);
  const tempRedirects = allResults.filter(r => r.issues.some(i => i.message.includes('Temporary redirect')));

  w('### Cross-Domain Issue Summary');
  w('');
  w(`| Issue | Domains Affected | Severity |`);
  w(`|-------|-----------------|----------|`);
  if (badCanonicalSites.length > 0) w(`| Canonical points to external domain | ${badCanonicalSites.length} | 🔴 CRITICAL |`);
  if (noindexSites.length > 0) w(`| Homepage has noindex | ${noindexSites.length} | 🔴 CRITICAL |`);
  if (blockedSites.length > 0) w(`| robots.txt blocks crawlers | ${blockedSites.length} | 🔴 CRITICAL |`);
  if (tempRedirects.length > 0) w(`| Temporary (302/307) redirects | ${tempRedirects.length} | 🟠 HIGH |`);
  if (sitemapErrors.length > 0) w(`| Sitemap errors | ${sitemapErrors.length} | 🟠 HIGH |`);
  if (noHttpsRedirect.length > 0) w(`| No HTTP→HTTPS redirect | ${noHttpsRedirect.length} | 🟠 HIGH |`);
  if (noRobotsSites.length > 0) w(`| Missing robots.txt | ${noRobotsSites.length} | 🟡 MEDIUM |`);
  if (noSitemapDirective.length > 0) w(`| robots.txt missing Sitemap directive | ${noSitemapDirective.length} | 🟡 MEDIUM |`);

  if (badCanonicalSites.length === 0 && noindexSites.length === 0 && blockedSites.length === 0 &&
      tempRedirects.length === 0 && sitemapErrors.length === 0 && noHttpsRedirect.length === 0 &&
      noRobotsSites.length === 0 && noSitemapDirective.length === 0) {
    w('| No cross-domain issues detected | 0 | 🟢 |');
  }
  w('');

  // Quick reference scorecard
  w('## Scorecard');
  w('');
  w('| Domain | Status | robots.txt | Sitemap | Canonical | noindex | HTTPS | Issues |');
  w('|--------|--------|------------|---------|-----------|---------|-------|--------|');
  for (const r of allResults) {
    const homeStatus = r.pages['/']?.status || '?';
    const robotsOk = r.robots.raw !== null && !r.robots.blocksAll && !r.robots.blocksGooglebot;
    const smOk = r.sitemap.status === 200 && r.sitemap.urlCount > 0;
    const canonOk = r.pages['/']?.canonical && !r.issues.some(i => i.message.includes('canonical points to external'));
    const noNoindex = !r.pages['/']?.hasNoindex;
    const httpsOk = r.httpRedirect.redirectsToHttps;
    const issueCount = r.issues.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH').length;
    const severity = r.issues.some(i => i.severity === 'CRITICAL') ? '🔴' :
                     r.issues.some(i => i.severity === 'HIGH') ? '🟠' :
                     r.issues.some(i => i.severity === 'MEDIUM') ? '🟡' : '🟢';
    w(`| ${r.domain} | ${homeStatus} | ${robotsOk ? '✅' : '❌'} | ${smOk ? `✅ (${r.sitemap.urlCount})` : '❌'} | ${canonOk ? '✅' : canonOk === false ? '⚠️' : '❌'} | ${noNoindex ? '✅' : '❌'} | ${httpsOk ? '✅' : '❌'} | ${severity} ${issueCount} |`);
  }
  w('');

  // Detailed per-domain reports
  w('---');
  w('');
  w('## Detailed Domain Reports');
  w('');

  for (const r of allResults) {
    w(`### ${r.domain} (${r.label} — ${r.market})`);
    w('');

    // robots.txt
    w('**robots.txt:**');
    if (r.robots.raw) {
      w('```');
      w(r.robots.raw.trim());
      w('```');
      if (r.robots.sitemapUrls.length > 0) {
        w(`Sitemap directives: ${r.robots.sitemapUrls.join(', ')}`);
      }
    } else {
      w('Not found');
    }
    w('');

    // Sitemap
    w(`**Sitemap:** ${r.sitemap.urlCount} URLs, status ${r.sitemap.status}`);
    if (r.sitemap.issues.length > 0) {
      for (const issue of r.sitemap.issues) {
        w(`- ${issue.severity === 'HIGH' ? '🟠' : '🟡'} ${issue.message}`);
      }
    }
    w('');

    // Key pages
    w('**Key Pages:**');
    w('| Path | Status | Canonical | noindex | Title |');
    w('|------|--------|-----------|---------|-------|');
    for (const path of KEY_PATHS.filter(p => p !== '/sitemap.xml' && p !== '/robots.txt')) {
      const page = r.pages[path];
      if (page) {
        const title = page.metaTitle ? (page.metaTitle.length > 50 ? page.metaTitle.slice(0, 50) + '...' : page.metaTitle) : '—';
        w(`| ${path} | ${page.status} | ${page.canonical || '—'} | ${page.hasNoindex ? '❌ YES' : '✅ No'} | ${title} |`);
      }
    }
    w('');

    // Redirects
    w(`**HTTP→HTTPS:** ${r.httpRedirect.redirectsToHttps ? '✅ Yes' : '❌ No'}`);
    if (r.httpRedirect.chain.length > 1) {
      w(`Redirect chain: ${r.httpRedirect.chain.map(c => `${c.status}`).join(' → ')}`);
    }
    w(`**www redirect:** ${r.wwwRedirect.note || (r.wwwRedirect.finalUrl ? `→ ${r.wwwRedirect.finalUrl}` : `status ${r.wwwRedirect.status}`)}`);
    w('');

    // Issues
    if (r.issues.length > 0) {
      w('**Issues:**');
      for (const issue of r.issues) {
        const icon = issue.severity === 'CRITICAL' ? '🔴' : issue.severity === 'HIGH' ? '🟠' : issue.severity === 'MEDIUM' ? '🟡' : '🔵';
        w(`- ${icon} **${issue.severity}**: ${issue.message}`);
      }
    } else {
      w('**Issues:** None');
    }
    w('');
    w('---');
    w('');
  }

  return lines.join('\n');
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Starting crawlability audit for 24 satellite domains...\n');

  const allResults = [];
  // Process in batches of 3 to avoid hammering servers
  const batchSize = 3;
  for (let i = 0; i < DOMAINS.length; i += batchSize) {
    const batch = DOMAINS.slice(i, i + batchSize);
    console.log(`Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(DOMAINS.length / batchSize)}:`);
    const results = await Promise.all(batch.map(d => auditDomain(d)));
    allResults.push(...results);
    if (i + batchSize < DOMAINS.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log('\nGenerating report...');
  const report = generateReport(allResults);

  const outPath = resolve(ROOT, 'tasks', '2026-03-19-satellite-crawlability-audit.md');
  writeFileSync(outPath, report);
  console.log(`Report saved to: ${outPath}`);

  // Quick summary
  const critCount = allResults.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'CRITICAL').length, 0);
  const highCount = allResults.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'HIGH').length, 0);
  console.log(`\n── Summary ──`);
  console.log(`Critical issues: ${critCount}`);
  console.log(`High issues: ${highCount}`);
}

main().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
