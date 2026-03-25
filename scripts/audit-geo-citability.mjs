#!/usr/bin/env node
/**
 * GEO Citability Auditor
 * Scores satellite site content for AI citation readiness.
 * Checks: passage length, answer blocks, statistics density, definition patterns,
 * Q&A format, proper noun density, content uniqueness signals.
 *
 * Research basis:
 * - Passages 134-167 words get cited 2.1x more by AI engines
 * - Fact-dense passages see 40% higher citation rates
 * - Explicit definitions ("X is...") get cited 2.1x more
 *
 * Usage: node scripts/audit-geo-citability.mjs
 * Output: tasks/2026-03-20-geo-citability-audit.md
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

// Pages to audit per domain (homepage + key content pages)
const PAGES_TO_CHECK = ['/', '/about', '/blog'];

// ─── Fetch helper ────────────────────────────────────────────────────────────
async function safeFetch(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)' },
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
    });
    if (res.status !== 200) return { status: res.status, body: '' };
    return { status: res.status, body: await res.text() };
  } catch (err) {
    return { status: 0, body: '', error: err.message };
  }
}

// ─── Extract text content from HTML ──────────────────────────────────────────
function extractTextContent(html) {
  // Remove script, style, nav, footer, header tags
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '');

  // Extract text from remaining HTML
  const text = cleaned.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text;
}

// ─── Extract passages (paragraphs / content blocks) ──────────────────────────
function extractPassages(html) {
  // Remove nav, footer, header, script, style
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '');

  // Extract paragraphs and list items as passages
  const passages = [];
  const pMatches = cleaned.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  for (const m of pMatches) {
    const text = m.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length > 20) passages.push(text);
  }

  // Also extract <li> items grouped by parent <ul>/<ol>
  const liMatches = cleaned.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
  for (const m of liMatches) {
    const text = m.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length > 20) passages.push(text);
  }

  return passages;
}

// ─── Extract headings ────────────────────────────────────────────────────────
function extractHeadings(html) {
  const headings = [];
  const matches = html.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi) || [];
  for (const m of matches) {
    const levelMatch = m.match(/<h([1-6])/i);
    const text = m.replace(/<[^>]+>/g, '').trim();
    if (text) headings.push({ level: parseInt(levelMatch[1]), text });
  }
  return headings;
}

// ─── Extract FAQ sections ────────────────────────────────────────────────────
function extractFAQs(html) {
  // Look for FAQ schema
  const faqSchemaMatch = html.match(/"@type"\s*:\s*"FAQPage"/i);
  const hasFAQSchema = !!faqSchemaMatch;

  // Count question patterns in content
  const questionPatterns = html.match(/<h[2-4][^>]*>[^<]*\?[^<]*<\/h[2-4]>/gi) || [];
  const faqHeadings = questionPatterns.length;

  return { hasFAQSchema, faqHeadings };
}

// ─── Citability scoring functions ────────────────────────────────────────────

// Score 1: Passage length distribution (optimal: 134-167 words)
function scorePassageLength(passages) {
  if (passages.length === 0) return { score: 0, detail: 'No passages found' };

  let optimalCount = 0;
  let tooShort = 0;
  let tooLong = 0;
  const passageLengths = [];

  for (const p of passages) {
    const wordCount = p.split(/\s+/).length;
    passageLengths.push(wordCount);
    if (wordCount >= 100 && wordCount <= 200) optimalCount++; // Wider range for practical purposes
    else if (wordCount < 50) tooShort++;
    else if (wordCount > 300) tooLong++;
  }

  const avgLength = Math.round(passageLengths.reduce((a, b) => a + b, 0) / passageLengths.length);
  const optimalPct = (optimalCount / passages.length) * 100;

  let score;
  if (optimalPct >= 40) score = 100;
  else if (optimalPct >= 25) score = 80;
  else if (optimalPct >= 15) score = 60;
  else if (optimalPct >= 5) score = 40;
  else score = 20;

  return {
    score,
    total: passages.length,
    optimal: optimalCount,
    tooShort,
    tooLong,
    avgLength,
    detail: `${optimalCount}/${passages.length} passages in optimal range (100-200 words), avg ${avgLength} words`,
  };
}

// Score 2: Self-contained answer blocks
function scoreAnswerBlocks(passages) {
  if (passages.length === 0) return { score: 0, detail: 'No passages found' };

  let selfContainedCount = 0;
  const examples = [];

  for (const p of passages) {
    const words = p.split(/\s+/);
    if (words.length < 15) continue;

    // Check for self-containment signals:
    // - Contains a subject (proper noun or "the/a" + noun)
    // - Doesn't start with pronouns (it, they, this, that, these, those)
    // - Contains a verb
    // - Doesn't heavily rely on context (low pronoun ratio)
    const startsWithPronoun = /^(it|they|this|that|these|those|he|she|we)\s/i.test(p);
    const pronounCount = (p.match(/\b(it|they|this|that|these|those|he|she|we|its|their|them)\b/gi) || []).length;
    const pronounRatio = pronounCount / words.length;

    // Contains concrete information (numbers, proper nouns, specific terms)
    const hasNumbers = /\d/.test(p);
    const hasProperNouns = /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/.test(p);

    if (!startsWithPronoun && pronounRatio < 0.08 && (hasNumbers || hasProperNouns)) {
      selfContainedCount++;
      if (examples.length < 3) examples.push(p.slice(0, 120) + (p.length > 120 ? '...' : ''));
    }
  }

  const ratio = selfContainedCount / passages.length;
  let score;
  if (ratio >= 0.5) score = 100;
  else if (ratio >= 0.35) score = 80;
  else if (ratio >= 0.2) score = 60;
  else if (ratio >= 0.1) score = 40;
  else score = 20;

  return {
    score,
    selfContained: selfContainedCount,
    total: passages.length,
    ratio: (ratio * 100).toFixed(1) + '%',
    examples,
    detail: `${selfContainedCount}/${passages.length} passages are self-contained (${(ratio * 100).toFixed(0)}%)`,
  };
}

// Score 3: Statistics/data density
function scoreStatistics(text) {
  // Count various statistical patterns
  const patterns = {
    percentages: (text.match(/\d+(\.\d+)?%/g) || []).length,
    dollarAmounts: (text.match(/\$\d[\d,]*/g) || []).length,
    yearRefs: (text.match(/\b20[12]\d\b/g) || []).length,
    numberRanges: (text.match(/\d+\s*[-–—to]+\s*\d+/g) || []).length,
    measurements: (text.match(/\d+\s*(inch|inches|mm|cm|feet|ft|mile|pound|lb|minute|hour|day|week|month|year)s?\b/gi) || []).length,
    comparisons: (text.match(/\b(average|typically|usually|most|approximately|about|around|nearly|over|under)\s+\d/gi) || []).length,
  };

  const totalStats = Object.values(patterns).reduce((a, b) => a + b, 0);
  const wordCount = text.split(/\s+/).length;
  const statDensity = wordCount > 0 ? (totalStats / wordCount) * 1000 : 0; // Stats per 1000 words

  let score;
  if (statDensity >= 15) score = 100;
  else if (statDensity >= 10) score = 80;
  else if (statDensity >= 5) score = 60;
  else if (statDensity >= 2) score = 40;
  else score = 20;

  return {
    score,
    totalStats,
    statDensity: statDensity.toFixed(1),
    patterns,
    detail: `${totalStats} statistics found (${statDensity.toFixed(1)} per 1000 words)`,
  };
}

// Score 4: Definition patterns ("X is...", "X refers to...", "X means...")
function scoreDefinitions(passages) {
  const definitionPatterns = [
    /^[A-Z][^.]*\bis\s+(a|an|the|when|where|how)\b/i,
    /\brefers?\s+to\b/i,
    /\bmeans?\s+(that|the|a|an)\b/i,
    /\bdefined\s+as\b/i,
    /\bknown\s+as\b/i,
    /\bconsists?\s+of\b/i,
    /\binvolves?\s+(the|a|an)\b/i,
  ];

  let definitionCount = 0;
  const examples = [];

  for (const p of passages) {
    for (const pattern of definitionPatterns) {
      if (pattern.test(p)) {
        definitionCount++;
        if (examples.length < 3) examples.push(p.slice(0, 120) + (p.length > 120 ? '...' : ''));
        break;
      }
    }
  }

  const ratio = passages.length > 0 ? definitionCount / passages.length : 0;
  let score;
  if (ratio >= 0.15) score = 100;
  else if (ratio >= 0.10) score = 80;
  else if (ratio >= 0.05) score = 60;
  else if (ratio >= 0.02) score = 40;
  else score = 20;

  return {
    score,
    definitions: definitionCount,
    total: passages.length,
    ratio: (ratio * 100).toFixed(1) + '%',
    examples,
    detail: `${definitionCount} definition-style passages (${(ratio * 100).toFixed(0)}% of content)`,
  };
}

// Score 5: Question-answer format
function scoreQAFormat(html, headings, faqs) {
  let score = 0;
  const signals = [];

  if (faqs.hasFAQSchema) {
    score += 40;
    signals.push('FAQPage schema present');
  }

  if (faqs.faqHeadings >= 5) {
    score += 30;
    signals.push(`${faqs.faqHeadings} question headings`);
  } else if (faqs.faqHeadings >= 2) {
    score += 15;
    signals.push(`${faqs.faqHeadings} question headings`);
  }

  // Check for H2/H3 that are questions
  const questionHeadings = headings.filter(h => h.text.includes('?'));
  if (questionHeadings.length >= 3) {
    score += 30;
    signals.push(`${questionHeadings.length} H2/H3 question headings`);
  }

  score = Math.min(score, 100);

  return {
    score,
    hasFAQSchema: faqs.hasFAQSchema,
    questionHeadings: questionHeadings?.length || 0,
    faqHeadings: faqs.faqHeadings,
    signals,
    detail: signals.length > 0 ? signals.join(', ') : 'No Q&A format detected',
  };
}

// Score 6: Proper noun / entity density
function scoreEntities(text) {
  // Match capitalized multi-word phrases (proper nouns)
  const properNouns = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g) || [];
  // Match brand/location names
  const locations = text.match(/\b(Denver|Boulder|Aurora|Phoenix|Scottsdale|Tempe|Mesa|Colorado Springs|Fort Collins|Colorado|Arizona)\b/gi) || [];
  const brands = text.match(/\b(Pink Auto Glass|Safelite|OEM|aftermarket|ADAS)\b/gi) || [];

  const entityCount = properNouns.length + locations.length + brands.length;
  const wordCount = text.split(/\s+/).length;
  const entityDensity = wordCount > 0 ? (entityCount / wordCount) * 100 : 0;

  let score;
  if (entityDensity >= 5) score = 100;
  else if (entityDensity >= 3) score = 80;
  else if (entityDensity >= 1.5) score = 60;
  else if (entityDensity >= 0.5) score = 40;
  else score = 20;

  return {
    score,
    entities: entityCount,
    properNouns: properNouns.length,
    locations: locations.length,
    brands: brands.length,
    density: entityDensity.toFixed(1) + '%',
    detail: `${entityCount} entities (${entityDensity.toFixed(1)}% density): ${properNouns.length} proper nouns, ${locations.length} locations, ${brands.length} brands`,
  };
}

// ─── Audit one page ──────────────────────────────────────────────────────────
async function auditPage(url) {
  const res = await safeFetch(url);
  if (res.status !== 200) {
    return { url, status: res.status, error: res.error || `HTTP ${res.status}`, scores: {} };
  }

  const text = extractTextContent(res.body);
  const passages = extractPassages(res.body);
  const headings = extractHeadings(res.body);
  const faqs = extractFAQs(res.body);
  const wordCount = text.split(/\s+/).filter(w => w.length > 2).length;

  const passageLength = scorePassageLength(passages);
  const answerBlocks = scoreAnswerBlocks(passages);
  const statistics = scoreStatistics(text);
  const definitions = scoreDefinitions(passages);
  const qaFormat = scoreQAFormat(res.body, headings, faqs);
  const entities = scoreEntities(text);

  // Weighted overall: answer quality 25%, self-containment 20%, stats 15%, definitions 15%, Q&A 15%, entities 10%
  const overall = Math.round(
    passageLength.score * 0.25 +
    answerBlocks.score * 0.20 +
    statistics.score * 0.15 +
    definitions.score * 0.15 +
    qaFormat.score * 0.15 +
    entities.score * 0.10
  );

  return {
    url,
    status: res.status,
    wordCount,
    passageCount: passages.length,
    headingCount: headings.length,
    scores: { overall, passageLength, answerBlocks, statistics, definitions, qaFormat, entities },
  };
}

// ─── Audit one domain ────────────────────────────────────────────────────────
async function auditDomain(domainInfo) {
  const { domain, label, market } = domainInfo;
  console.log(`  Auditing ${domain}...`);

  const pageResults = [];
  for (const path of PAGES_TO_CHECK) {
    const result = await auditPage(`https://${domain}${path}`);
    pageResults.push({ path, ...result });
  }

  // Also check first blog post if blog index exists
  const blogRes = pageResults.find(p => p.path === '/blog');
  if (blogRes && blogRes.status === 200) {
    // Try to find first blog post link
    const blogPage = await safeFetch(`https://${domain}/blog`);
    if (blogPage.status === 200) {
      const blogLinks = blogPage.body.match(/href=["'](\/blog\/[^"']+)["']/gi) || [];
      if (blogLinks.length > 0) {
        const firstBlogPath = blogLinks[0].match(/href=["'](\/blog\/[^"']+)["']/i)[1];
        const blogPost = await auditPage(`https://${domain}${firstBlogPath}`);
        pageResults.push({ path: firstBlogPath, ...blogPost });
      }
    }
  }

  // Calculate domain-level scores (average across pages with content)
  const validPages = pageResults.filter(p => p.scores?.overall > 0);
  const domainScore = validPages.length > 0
    ? Math.round(validPages.reduce((s, p) => s + p.scores.overall, 0) / validPages.length)
    : 0;

  // Aggregate issues
  const issues = [];
  const homeResult = pageResults.find(p => p.path === '/');
  if (homeResult?.scores) {
    const s = homeResult.scores;
    if (s.passageLength.score < 60) issues.push({ severity: 'HIGH', message: `Homepage passage length: ${s.passageLength.detail}` });
    if (s.answerBlocks.score < 60) issues.push({ severity: 'HIGH', message: `Low self-contained content: ${s.answerBlocks.detail}` });
    if (s.statistics.score < 40) issues.push({ severity: 'MEDIUM', message: `Low statistics density: ${s.statistics.detail}` });
    if (s.definitions.score < 40) issues.push({ severity: 'MEDIUM', message: `Few definition patterns: ${s.definitions.detail}` });
    if (s.qaFormat.score < 40) issues.push({ severity: 'MEDIUM', message: `Weak Q&A format: ${s.qaFormat.detail}` });
    if (s.entities.score < 40) issues.push({ severity: 'LOW', message: `Low entity density: ${s.entities.detail}` });
  }

  return { domain, label, market, domainScore, pages: pageResults, issues };
}

// ─── Report generation ───────────────────────────────────────────────────────
function generateReport(allResults) {
  const lines = [];
  const w = (s) => lines.push(s);

  w('# Pink Auto Glass — GEO Citability Audit');
  w(`**Generated:** ${new Date().toISOString().slice(0, 10)}`);
  w('**Scoring:** Passage length (25%) + Self-containment (20%) + Statistics (15%) + Definitions (15%) + Q&A format (15%) + Entity density (10%)');
  w('');

  // Executive summary
  w('## Executive Summary');
  w('');

  const avgScore = Math.round(allResults.reduce((s, r) => s + r.domainScore, 0) / allResults.length);
  const highScorers = allResults.filter(r => r.domainScore >= 70);
  const lowScorers = allResults.filter(r => r.domainScore < 50);

  w(`| Metric | Value |`);
  w(`|--------|-------|`);
  w(`| Average Citability Score | **${avgScore}/100** |`);
  w(`| Domains scoring 70+ | ${highScorers.length} |`);
  w(`| Domains scoring below 50 | ${lowScorers.length} |`);
  w('');

  // Scorecard
  w('## Scorecard');
  w('');
  w('| Domain | Market | Overall | Passage Len | Self-Contained | Stats | Definitions | Q&A | Entities |');
  w('|--------|--------|---------|-------------|----------------|-------|-------------|-----|----------|');
  for (const r of allResults.sort((a, b) => b.domainScore - a.domainScore)) {
    const home = r.pages.find(p => p.path === '/')?.scores || {};
    const icon = r.domainScore >= 70 ? '🟢' : r.domainScore >= 50 ? '🟡' : r.domainScore >= 30 ? '🟠' : '🔴';
    w(`| ${r.domain} | ${r.market} | ${icon} ${r.domainScore} | ${home.passageLength?.score ?? '—'} | ${home.answerBlocks?.score ?? '—'} | ${home.statistics?.score ?? '—'} | ${home.definitions?.score ?? '—'} | ${home.qaFormat?.score ?? '—'} | ${home.entities?.score ?? '—'} |`);
  }
  w('');

  // Detailed reports
  w('---');
  w('');
  w('## Detailed Domain Reports');
  w('');

  for (const r of allResults) {
    w(`### ${r.domain} (${r.label} — ${r.market})`);
    w(`**Citability Score: ${r.domainScore}/100**`);
    w('');

    for (const page of r.pages) {
      if (!page.scores?.overall) {
        w(`**${page.path}:** ${page.error || `HTTP ${page.status}`}`);
        continue;
      }
      const s = page.scores;
      w(`**${page.path}** (${page.wordCount} words, ${page.passageCount} passages) — Score: ${s.overall}/100`);
      w(`| Factor | Score | Detail |`);
      w(`|--------|-------|--------|`);
      w(`| Passage Length | ${s.passageLength.score} | ${s.passageLength.detail} |`);
      w(`| Self-Contained | ${s.answerBlocks.score} | ${s.answerBlocks.detail} |`);
      w(`| Statistics | ${s.statistics.score} | ${s.statistics.detail} |`);
      w(`| Definitions | ${s.definitions.score} | ${s.definitions.detail} |`);
      w(`| Q&A Format | ${s.qaFormat.score} | ${s.qaFormat.detail} |`);
      w(`| Entities | ${s.entities.score} | ${s.entities.detail} |`);
      w('');

      // Show example self-contained passages
      if (s.answerBlocks.examples?.length > 0) {
        w('**Best citable passages:**');
        for (const ex of s.answerBlocks.examples) {
          w(`> ${ex}`);
        }
        w('');
      }
    }

    // Issues
    if (r.issues.length > 0) {
      w('**Issues:**');
      for (const issue of r.issues) {
        const icon = issue.severity === 'HIGH' ? '🟠' : issue.severity === 'MEDIUM' ? '🟡' : '🔵';
        w(`- ${icon} **${issue.severity}**: ${issue.message}`);
      }
      w('');
    }

    w('---');
    w('');
  }

  // Recommendations
  w('## Recommendations');
  w('');

  // Aggregate weak areas
  const weakPassageLen = allResults.filter(r => {
    const home = r.pages.find(p => p.path === '/')?.scores;
    return home && home.passageLength.score < 60;
  });
  const weakStats = allResults.filter(r => {
    const home = r.pages.find(p => p.path === '/')?.scores;
    return home && home.statistics.score < 40;
  });
  const weakDefs = allResults.filter(r => {
    const home = r.pages.find(p => p.path === '/')?.scores;
    return home && home.definitions.score < 40;
  });
  const weakQA = allResults.filter(r => {
    const home = r.pages.find(p => p.path === '/')?.scores;
    return home && home.qaFormat.score < 60;
  });

  if (weakPassageLen.length > 0) {
    w('### P1: Optimize Passage Length');
    w(`${weakPassageLen.length} domain(s) have suboptimal passage lengths.`);
    w('**Action:** Rewrite key content blocks to 100-200 words. Each paragraph should be a complete, self-contained answer. Break up long walls of text; merge overly short bullet points into proper paragraphs.');
    w('');
  }

  if (weakStats.length > 0) {
    w('### P1: Add More Statistics and Data');
    w(`${weakStats.length} domain(s) have low statistics density.`);
    w('**Action:** Add specific numbers: pricing ranges ("$199-$400"), time estimates ("30-45 minutes"), percentages ("95% of repairs"), year references. Fact-dense content is cited 40% more by AI engines.');
    w('');
  }

  if (weakDefs.length > 0) {
    w('### P2: Add Definition-Style Content');
    w(`${weakDefs.length} domain(s) lack definition patterns.`);
    w('**Action:** Start key paragraphs with definitions: "Windshield chip repair is...", "ADAS calibration refers to...", "Mobile windshield service involves...". These patterns are cited 2.1x more by AI engines.');
    w('');
  }

  if (weakQA.length > 0) {
    w('### P2: Strengthen Q&A Format');
    w(`${weakQA.length} domain(s) have weak Q&A formatting.`);
    w('**Action:** Ensure FAQ sections use question headings (H2/H3 ending with ?), have FAQPage schema markup, and include at least 5 Q&A pairs per page.');
    w('');
  }

  w('### General: Content Citability Best Practices');
  w('- **Lead with the answer.** First sentence of each paragraph should directly answer a question.');
  w('- **Use "X is..." patterns.** Start definitions clearly so AI can extract them.');
  w('- **Include specific numbers.** "$199-$400", "30-45 minutes", "95% success rate".');
  w('- **Name entities.** Use "Denver", "Colorado", "Pink Auto Glass" — not "our city" or "we".');
  w('- **Keep passages 100-200 words.** Long enough to be substantive, short enough to cite.');
  w('');

  return lines.join('\n');
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Starting GEO Citability audit for 24 satellite domains...\n');

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

  const outPath = resolve(ROOT, 'tasks', '2026-03-20-geo-citability-audit.md');
  writeFileSync(outPath, report);
  console.log(`Report saved to: ${outPath}`);

  const avgScore = Math.round(allResults.reduce((s, r) => s + r.domainScore, 0) / allResults.length);
  console.log(`\nAverage Citability Score: ${avgScore}/100`);
}

main().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
