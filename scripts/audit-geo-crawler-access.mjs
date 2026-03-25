#!/usr/bin/env node
/**
 * GEO AI Crawler Access Audit
 * Verifies AI crawlers can actually access and parse satellite site content.
 * Checks: robots.txt AI bot rules, SSR vs JS rendering, llms.txt, speakable schema,
 * meta tag quality, X-Robots-Tag headers.
 *
 * Usage: node scripts/audit-geo-crawler-access.mjs
 * Output: tasks/2026-03-20-geo-crawler-access-audit.md
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

// 14 AI crawler user-agents to verify
const AI_CRAWLERS = [
  { name: 'GPTBot', ua: 'GPTBot', owner: 'OpenAI' },
  { name: 'OAI-SearchBot', ua: 'OAI-SearchBot', owner: 'OpenAI' },
  { name: 'ChatGPT-User', ua: 'ChatGPT-User', owner: 'OpenAI' },
  { name: 'ClaudeBot', ua: 'ClaudeBot', owner: 'Anthropic' },
  { name: 'Claude-SearchBot', ua: 'Claude-SearchBot', owner: 'Anthropic' },
  { name: 'PerplexityBot', ua: 'PerplexityBot', owner: 'Perplexity' },
  { name: 'Google-Extended', ua: 'Google-Extended', owner: 'Google' },
  { name: 'GoogleOther', ua: 'GoogleOther', owner: 'Google' },
  { name: 'Applebot-Extended', ua: 'Applebot-Extended', owner: 'Apple' },
  { name: 'Amazonbot', ua: 'Amazonbot', owner: 'Amazon' },
  { name: 'FacebookBot', ua: 'FacebookBot', owner: 'Meta' },
  { name: 'CCBot', ua: 'CCBot', owner: 'Common Crawl' },
  { name: 'Bytespider', ua: 'Bytespider', owner: 'ByteDance' },
  { name: 'meta-externalagent', ua: 'meta-externalagent', owner: 'Meta' },
];

// ─── Fetch helper ────────────────────────────────────────────────────────────
async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
    });
    const body = await res.text();
    return { status: res.status, headers: Object.fromEntries(res.headers.entries()), body };
  } catch (err) {
    return { status: 0, headers: {}, body: '', error: err.message };
  }
}

// ─── Parse robots.txt for AI bot rules ───────────────────────────────────────
// Handles case-insensitive matching and shared groups (multiple User-agent
// lines before a single rule block, per the robots.txt spec).
function checkRobotsForAiBots(robotsTxt) {
  const results = {};
  const lines = robotsTxt.split('\n').map(l => l.trim());

  // Parse into groups: each group has one or more user-agents sharing rules.
  // A new group starts when a User-agent line follows a non-User-agent line
  // (or is the first line).
  const groups = []; // { agents: string[], rules: string[] }
  let currentGroup = null;
  let lastWasAgent = false;

  for (const line of lines) {
    if (line === '' || line.startsWith('#')) {
      lastWasAgent = false;
      continue;
    }
    const lower = line.toLowerCase();
    if (lower.startsWith('user-agent:')) {
      const agent = line.split(':').slice(1).join(':').trim().toLowerCase();
      if (!lastWasAgent || !currentGroup) {
        // Start a new group
        currentGroup = { agents: [agent], rules: [] };
        groups.push(currentGroup);
      } else {
        // Continuation of the same group (shared agents)
        currentGroup.agents.push(agent);
      }
      lastWasAgent = true;
    } else if (lower.startsWith('allow:') || lower.startsWith('disallow:')) {
      if (currentGroup) currentGroup.rules.push(line);
      lastWasAgent = false;
    } else {
      lastWasAgent = false;
    }
  }

  for (const crawler of AI_CRAWLERS) {
    const crawlerLower = crawler.ua.toLowerCase();

    // Find explicit group matching this crawler
    const explicitGroup = groups.find(g => g.agents.includes(crawlerLower));
    // Find wildcard group
    const wildcardGroup = groups.find(g => g.agents.includes('*'));

    const rules = explicitGroup?.rules || wildcardGroup?.rules || [];
    const isExplicit = !!explicitGroup;

    let status = 'allowed';
    let detail = '';

    if (rules.length === 0) {
      detail = 'No restrictions (no matching rules)';
    } else {
      const hasDisallow = rules.some(r => {
        const val = r.split(':').slice(1).join(':').trim();
        return r.toLowerCase().startsWith('disallow:') && val === '/';
      });
      const hasAllow = rules.some(r => r.toLowerCase().startsWith('allow:'));

      // Check if Allow explicitly covers root path (/), not just a sub-path
      const hasRootAllow = rules.some(r => {
        if (!r.toLowerCase().startsWith('allow:')) return false;
        const val = r.split(':').slice(1).join(':').trim();
        return val === '/' || val === '/*';
      });

      if (hasDisallow && !hasRootAllow) {
        status = 'blocked';
        detail = isExplicit ? 'Explicitly blocked via Disallow: /' : 'Blocked by wildcard Disallow: /';
      } else if (hasDisallow && hasRootAllow) {
        // Only a root-level Allow (/ or /*) overrides Disallow: /
        status = 'allowed';
        detail = isExplicit ? 'Explicitly allowed (Allow: / overrides Disallow)' : 'Allowed by wildcard (Allow: / overrides Disallow)';
      } else if (hasAllow) {
        status = 'allowed';
        detail = isExplicit ? 'Explicitly allowed' : 'Allowed by wildcard';
      } else {
        status = 'allowed';
        detail = 'No blocking rules';
      }
    }

    results[crawler.name] = { status, detail, owner: crawler.owner };
  }

  return results;
}

// ─── Check SSR content quality ───────────────────────────────────────────────
function checkSSRContent(html) {
  const issues = [];
  const checks = {};

  // Check if page has meaningful text content (not just JS shell)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;

  // Strip script and style tags
  const textContent = bodyContent
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const wordCount = textContent.split(/\s+/).filter(w => w.length > 2).length;
  checks.wordCount = wordCount;

  if (wordCount < 50) {
    issues.push({ severity: 'CRITICAL', message: `Only ${wordCount} words in SSR HTML — page may be JS-rendered (AI bots see empty page)` });
  } else if (wordCount < 200) {
    issues.push({ severity: 'MEDIUM', message: `Only ${wordCount} words in SSR HTML — thin content for AI citation` });
  }

  // Check for React/Next.js hydration markers (indicates SSR is working)
  const hasNextData = html.includes('__NEXT_DATA__') || html.includes('__next');
  const hasReactRoot = html.includes('data-reactroot') || html.includes('__next');
  checks.hasNextData = hasNextData;
  checks.isSSR = wordCount > 100; // Heuristic: if substantial text, SSR is working

  if (!hasNextData && wordCount < 50) {
    issues.push({ severity: 'HIGH', message: 'No __NEXT_DATA__ found and low word count — SSR may be broken' });
  }

  // Check for JSON-LD schema in SSR
  const jsonLdMatches = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || [];
  checks.schemaCount = jsonLdMatches.length;
  if (jsonLdMatches.length === 0) {
    issues.push({ severity: 'HIGH', message: 'No JSON-LD schema in SSR HTML — structured data may be JS-rendered only' });
  }

  // Check for speakable schema
  const hasSpeakable = jsonLdMatches.some(m => m.includes('speakable'));
  checks.hasSpeakable = hasSpeakable;

  // Check schema types present
  const schemaTypes = [];
  for (const m of jsonLdMatches) {
    const typeMatches = m.match(/"@type"\s*:\s*"([^"]+)"/g) || [];
    for (const t of typeMatches) {
      const type = t.match(/"@type"\s*:\s*"([^"]+)"/)[1];
      if (!schemaTypes.includes(type)) schemaTypes.push(type);
    }
  }
  checks.schemaTypes = schemaTypes;

  // Check for sameAs in Organization/LocalBusiness schema
  const hasSameAs = jsonLdMatches.some(m => m.includes('sameAs'));
  checks.hasSameAs = hasSameAs;
  if (!hasSameAs && jsonLdMatches.length > 0) {
    issues.push({ severity: 'LOW', message: 'Schema missing sameAs links — helps AI engines connect brand across platforms' });
  }

  return { checks, issues };
}

// ─── Check meta tags ─────────────────────────────────────────────────────────
function checkMetaTags(html, domain) {
  const issues = [];
  const meta = {};

  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  meta.title = titleMatch ? titleMatch[1].trim() : null;
  if (!meta.title) {
    issues.push({ severity: 'HIGH', message: 'Missing <title> tag' });
  } else if (meta.title.length > 60) {
    issues.push({ severity: 'LOW', message: `Title too long (${meta.title.length} chars, ideal <=60)` });
  }

  // Description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  meta.description = descMatch ? descMatch[1].trim() : null;
  if (!meta.description) {
    issues.push({ severity: 'HIGH', message: 'Missing meta description' });
  } else if (meta.description.length < 50) {
    issues.push({ severity: 'MEDIUM', message: `Meta description too short (${meta.description.length} chars, ideal 120-160)` });
  } else if (meta.description.length > 160) {
    issues.push({ severity: 'LOW', message: `Meta description too long (${meta.description.length} chars, ideal 120-160)` });
  }

  // Open Graph
  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
  const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
  const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
  const ogUrl = html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']*)["']/i);

  meta.ogTitle = ogTitle ? ogTitle[1] : null;
  meta.ogDesc = ogDesc ? ogDesc[1] : null;
  meta.ogImage = ogImage ? ogImage[1] : null;
  meta.ogUrl = ogUrl ? ogUrl[1] : null;

  if (!meta.ogTitle) issues.push({ severity: 'MEDIUM', message: 'Missing og:title' });
  if (!meta.ogDesc) issues.push({ severity: 'MEDIUM', message: 'Missing og:description' });
  if (!meta.ogImage) issues.push({ severity: 'MEDIUM', message: 'Missing og:image' });

  // X-Robots-Tag in meta
  const robotsMeta = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
  meta.robotsMeta = robotsMeta ? robotsMeta[1] : null;
  if (meta.robotsMeta && meta.robotsMeta.toLowerCase().includes('noindex')) {
    issues.push({ severity: 'CRITICAL', message: `Meta robots contains noindex: ${meta.robotsMeta}` });
  }

  return { meta, issues };
}

// ─── Check llms.txt ──────────────────────────────────────────────────────────
async function checkLlmsTxt(domain) {
  const issues = [];
  const checks = {};

  // Try /llms.txt and /llms.txt route
  for (const path of ['/llms.txt', '/llms-full.txt']) {
    const res = await safeFetch(`https://${domain}${path}`);
    if (res.status === 200 && res.body.length > 10) {
      checks[path] = {
        exists: true,
        length: res.body.length,
        lines: res.body.split('\n').length,
        preview: res.body.slice(0, 200),
      };

      // Validate llms.txt format (should be markdown-ish)
      const hasTitle = res.body.startsWith('#') || res.body.includes('\n#');
      if (!hasTitle) {
        issues.push({ severity: 'LOW', message: `${path} exists but doesn't start with a heading — may not follow llms.txt spec` });
      }
    } else {
      checks[path] = { exists: false, status: res.status };
    }
  }

  if (!checks['/llms.txt']?.exists) {
    issues.push({ severity: 'MEDIUM', message: 'No /llms.txt found — this helps AI systems understand your site structure' });
  }

  return { checks, issues };
}

// ─── Check X-Robots-Tag header ───────────────────────────────────────────────
function checkXRobotsHeader(headers) {
  const issues = [];
  const xRobots = headers['x-robots-tag'];
  if (xRobots) {
    if (xRobots.toLowerCase().includes('noindex')) {
      issues.push({ severity: 'CRITICAL', message: `X-Robots-Tag header blocks indexing: ${xRobots}` });
    }
    if (xRobots.toLowerCase().includes('noai') || xRobots.toLowerCase().includes('noimageai')) {
      issues.push({ severity: 'HIGH', message: `X-Robots-Tag restricts AI: ${xRobots}` });
    }
  }
  return { xRobots: xRobots || null, issues };
}

// ─── Audit one domain ────────────────────────────────────────────────────────
async function auditDomain(domainInfo) {
  const { domain, label, market } = domainInfo;
  console.log(`  Auditing ${domain}...`);

  const result = { domain, label, market, issues: [], scores: {} };

  // 1. Fetch robots.txt and check AI bot rules
  const robotsRes = await safeFetch(`https://${domain}/robots.txt`);
  if (robotsRes.status === 200) {
    result.robotsBots = checkRobotsForAiBots(robotsRes.body);
    const blockedBots = Object.entries(result.robotsBots).filter(([, v]) => v.status === 'blocked');
    if (blockedBots.length > 0) {
      result.issues.push({ severity: 'CRITICAL', message: `${blockedBots.length} AI crawlers blocked: ${blockedBots.map(([k]) => k).join(', ')}` });
    }
    result.scores.crawlerAccess = ((AI_CRAWLERS.length - blockedBots.length) / AI_CRAWLERS.length) * 100;
  } else {
    result.robotsBots = {};
    result.issues.push({ severity: 'MEDIUM', message: `robots.txt returned ${robotsRes.status}` });
    result.scores.crawlerAccess = 100; // No robots.txt = all allowed
  }

  // 2. Fetch homepage and check SSR + meta + headers
  const homeRes = await safeFetch(`https://${domain}/`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)' },
  });

  if (homeRes.status === 200) {
    const ssr = checkSSRContent(homeRes.body);
    result.ssr = ssr.checks;
    result.issues.push(...ssr.issues);

    const metaResult = checkMetaTags(homeRes.body, domain);
    result.meta = metaResult.meta;
    result.issues.push(...metaResult.issues);

    const headerResult = checkXRobotsHeader(homeRes.headers);
    result.xRobots = headerResult.xRobots;
    result.issues.push(...headerResult.issues);

    // SSR score: based on word count
    const wc = ssr.checks.wordCount;
    result.scores.ssrQuality = wc >= 500 ? 100 : wc >= 200 ? 80 : wc >= 100 ? 50 : wc >= 50 ? 25 : 0;

    // Schema score
    result.scores.schema = ssr.checks.schemaCount >= 3 ? 100 : ssr.checks.schemaCount >= 1 ? 60 : 0;

    // Meta score
    let metaScore = 0;
    if (metaResult.meta.title) metaScore += 25;
    if (metaResult.meta.description) metaScore += 25;
    if (metaResult.meta.ogTitle) metaScore += 15;
    if (metaResult.meta.ogDesc) metaScore += 15;
    if (metaResult.meta.ogImage) metaScore += 10;
    if (metaResult.meta.ogUrl) metaScore += 10;
    result.scores.metaTags = metaScore;
  } else {
    result.issues.push({ severity: 'CRITICAL', message: `Homepage returned ${homeRes.status} for GPTBot user-agent` });
    result.scores.ssrQuality = 0;
    result.scores.schema = 0;
    result.scores.metaTags = 0;
  }

  // 3. Check llms.txt
  const llmsResult = await checkLlmsTxt(domain);
  result.llmsTxt = llmsResult.checks;
  result.issues.push(...llmsResult.issues);
  result.scores.llmsTxt = llmsResult.checks['/llms.txt']?.exists ? 100 : 0;

  // 4. Overall GEO crawler access score
  result.scores.overall = Math.round(
    result.scores.crawlerAccess * 0.25 +
    result.scores.ssrQuality * 0.30 +
    result.scores.schema * 0.15 +
    result.scores.metaTags * 0.15 +
    result.scores.llmsTxt * 0.15
  );

  return result;
}

// ─── Report generation ───────────────────────────────────────────────────────
function generateReport(allResults) {
  const lines = [];
  const w = (s) => lines.push(s);

  w('# Pink Auto Glass — GEO AI Crawler Access Audit');
  w(`**Generated:** ${new Date().toISOString().slice(0, 10)}`);
  w(`**AI Crawlers Tested:** ${AI_CRAWLERS.length} (${AI_CRAWLERS.map(c => c.name).join(', ')})`);
  w('');

  // Executive summary
  w('## Executive Summary');
  w('');

  const avgScore = Math.round(allResults.reduce((s, r) => s + r.scores.overall, 0) / allResults.length);
  const criticals = allResults.filter(r => r.issues.some(i => i.severity === 'CRITICAL'));
  const blockedCrawlerSites = allResults.filter(r => r.issues.some(i => i.message.includes('crawlers blocked')));
  const noLlmsTxt = allResults.filter(r => !r.llmsTxt?.['/llms.txt']?.exists);
  const lowSSR = allResults.filter(r => (r.ssr?.wordCount || 0) < 200);

  w(`| Metric | Value |`);
  w(`|--------|-------|`);
  w(`| Average GEO Crawler Score | **${avgScore}/100** |`);
  w(`| Domains with critical issues | ${criticals.length} |`);
  w(`| Domains blocking AI crawlers | ${blockedCrawlerSites.length} |`);
  w(`| Domains without llms.txt | ${noLlmsTxt.length} |`);
  w(`| Domains with thin SSR content (<200 words) | ${lowSSR.length} |`);
  w('');

  // Scorecard
  w('## Scorecard');
  w('');
  w('| Domain | Overall | Crawler | SSR | Schema | Meta | llms.txt | Issues |');
  w('|--------|---------|---------|-----|--------|------|----------|--------|');
  for (const r of allResults.sort((a, b) => b.scores.overall - a.scores.overall)) {
    const s = r.scores;
    const issueCount = r.issues.filter(i => i.severity !== 'LOW').length;
    const icon = s.overall >= 80 ? '🟢' : s.overall >= 60 ? '🟡' : s.overall >= 40 ? '🟠' : '🔴';
    w(`| ${r.domain} | ${icon} ${s.overall} | ${s.crawlerAccess?.toFixed(0) || '?'} | ${s.ssrQuality} | ${s.schema} | ${s.metaTags} | ${s.llmsTxt} | ${issueCount} |`);
  }
  w('');

  // AI Crawler Access Matrix
  w('## AI Crawler Access Matrix');
  w('');
  const crawlerNames = AI_CRAWLERS.map(c => c.name);
  w(`| Domain | ${crawlerNames.join(' | ')} |`);
  w(`|--------| ${crawlerNames.map(() => '---').join(' | ')} |`);
  for (const r of allResults) {
    const cells = crawlerNames.map(name => {
      const bot = r.robotsBots[name];
      if (!bot) return '?';
      return bot.status === 'allowed' ? '✅' : bot.status === 'blocked' ? '❌' : '⚠️';
    });
    w(`| ${r.domain} | ${cells.join(' | ')} |`);
  }
  w('');

  // Detailed reports
  w('---');
  w('');
  w('## Detailed Domain Reports');
  w('');

  for (const r of allResults) {
    w(`### ${r.domain} (${r.label} — ${r.market})`);
    w(`**Overall Score: ${r.scores.overall}/100**`);
    w('');

    // SSR Content
    w(`**SSR Content:** ${r.ssr?.wordCount || 0} words | ${r.ssr?.schemaCount || 0} JSON-LD schemas | Types: ${r.ssr?.schemaTypes?.join(', ') || 'none'}`);
    w(`**speakable:** ${r.ssr?.hasSpeakable ? '✅ Yes' : '❌ No'} | **sameAs:** ${r.ssr?.hasSameAs ? '✅ Yes' : '❌ No'}`);
    w('');

    // Meta tags
    if (r.meta) {
      w(`**Meta Title:** ${r.meta.title || '—'}`);
      w(`**Meta Desc:** ${r.meta.description ? r.meta.description.slice(0, 100) + (r.meta.description.length > 100 ? '...' : '') : '—'}`);
      w(`**OG:** title=${r.meta.ogTitle ? '✅' : '❌'} desc=${r.meta.ogDesc ? '✅' : '❌'} image=${r.meta.ogImage ? '✅' : '❌'} url=${r.meta.ogUrl ? '✅' : '❌'}`);
      w('');
    }

    // llms.txt
    if (r.llmsTxt) {
      const llms = r.llmsTxt['/llms.txt'];
      if (llms?.exists) {
        w(`**llms.txt:** ✅ ${llms.length} bytes, ${llms.lines} lines`);
      } else {
        w(`**llms.txt:** ❌ Not found`);
      }
      const llmsFull = r.llmsTxt['/llms-full.txt'];
      if (llmsFull?.exists) {
        w(`**llms-full.txt:** ✅ ${llmsFull.length} bytes, ${llmsFull.lines} lines`);
      }
      w('');
    }

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

  // Recommendations
  w('## Recommendations');
  w('');

  if (blockedCrawlerSites.length > 0) {
    w('### P0: Unblock AI Crawlers');
    w(`${blockedCrawlerSites.length} domain(s) are blocking AI crawlers in robots.txt.`);
    w('**Action:** Update robots.txt to explicitly Allow all 14 AI crawlers.');
    w('');
  }

  if (noLlmsTxt.length > 0) {
    w('### P1: Add llms.txt to All Sites');
    w(`${noLlmsTxt.length} domain(s) missing llms.txt. This emerging standard helps AI systems understand site structure.`);
    w('**Action:** Add /llms.txt route to each Next.js site with service descriptions, key pages, and contact info.');
    w('');
  }

  const noSpeakable = allResults.filter(r => !r.ssr?.hasSpeakable);
  if (noSpeakable.length > 0) {
    w('### P2: Add Speakable Schema');
    w(`${noSpeakable.length} domain(s) missing speakable schema markup.`);
    w('**Action:** Add speakable property to Article/WebPage schemas — identifies content suitable for voice/AI assistants.');
    w('');
  }

  const noSameAs = allResults.filter(r => !r.ssr?.hasSameAs);
  if (noSameAs.length > 0) {
    w('### P2: Add sameAs Links to Schema');
    w(`${noSameAs.length} domain(s) missing sameAs in structured data.`);
    w('**Action:** Add sameAs links (Google Maps, Yelp, BBB, social profiles) to Organization/LocalBusiness schema — helps AI engines connect brand across platforms.');
    w('');
  }

  if (lowSSR.length > 0) {
    w('### P2: Improve SSR Content Density');
    w(`${lowSSR.length} domain(s) have fewer than 200 words in initial HTML.`);
    w('**Action:** Ensure key content renders server-side, not client-side only. AI crawlers don\'t execute JavaScript.');
    w('');
  }

  return lines.join('\n');
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Starting GEO AI Crawler Access audit for 24 satellite domains...\n');

  const allResults = [];
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

  const outPath = resolve(ROOT, 'tasks', '2026-03-20-geo-crawler-access-audit.md');
  writeFileSync(outPath, report);
  console.log(`Report saved to: ${outPath}`);

  const avgScore = Math.round(allResults.reduce((s, r) => s + r.scores.overall, 0) / allResults.length);
  console.log(`\nAverage GEO Crawler Score: ${avgScore}/100`);
}

main().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
