#!/usr/bin/env node
/**
 * Lighthouse Audit Script
 * Runs performance, SEO, and accessibility audits on key pages
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

const pages = [
  { url: 'http://localhost:3000', name: 'Homepage' },
  { url: 'http://localhost:3000/services/windshield-replacement', name: 'Service Page' },
  { url: 'http://localhost:3000/locations/denver-co', name: 'Location Page' },
  { url: 'http://localhost:3000/vehicles/honda-accord-windshield-replacement-denver', name: 'Vehicle Page' },
  { url: 'http://localhost:3000/blog/windshield-replacement-cost-colorado-insurance-guide', name: 'Blog Article' },
  { url: 'http://localhost:3000/book', name: 'Booking Page' }
];

const config = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'mobile',
    throttling: {
      rttMs: 40,
      throughputKbps: 10 * 1024,
      cpuSlowdownMultiplier: 1,
    },
  },
};

async function runLighthouse(url, name) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'error',
    output: 'json',
    port: chrome.port,
  };

  try {
    const runnerResult = await lighthouse(url, options, config);
    await chrome.kill();

    const { lhr } = runnerResult;
    const categories = lhr.categories;

    return {
      name,
      url,
      scores: {
        performance: Math.round(categories.performance.score * 100),
        accessibility: Math.round(categories.accessibility.score * 100),
        bestPractices: Math.round(categories['best-practices'].score * 100),
        seo: Math.round(categories.seo.score * 100),
      },
    };
  } catch (error) {
    await chrome.kill();
    return {
      name,
      url,
      error: error.message,
    };
  }
}

async function main() {
  console.log('🚀 Pink Auto Glass - Lighthouse Audit Report\n');
  console.log('=' .repeat(70));
  console.log('Testing mobile performance on localhost:3000...\n');

  const results = [];

  for (const page of pages) {
    console.log(`⏳ Auditing: ${page.name}...`);
    const result = await runLighthouse(page.url, page.name);
    results.push(result);

    if (result.error) {
      console.log(`   ❌ Error: ${result.error}\n`);
    } else {
      const { scores } = result;
      console.log(`   Performance:     ${scores.performance >= 85 ? '✅' : '⚠️'}  ${scores.performance}`);
      console.log(`   Accessibility:   ${scores.accessibility >= 90 ? '✅' : '⚠️'}  ${scores.accessibility}`);
      console.log(`   Best Practices:  ${scores.bestPractices >= 90 ? '✅' : '⚠️'}  ${scores.bestPractices}`);
      console.log(`   SEO:             ${scores.seo === 100 ? '✅' : '⚠️'}  ${scores.seo}\n`);
    }
  }

  // Summary
  console.log('='.repeat(70));
  console.log('\n📊 Summary\n');
  console.log('Page                    | Perf | A11y | BP  | SEO');
  console.log('-'.repeat(70));

  results.forEach((result) => {
    if (result.error) {
      console.log(`${result.name.padEnd(23)} | ERROR`);
    } else {
      const { scores } = result;
      const row = `${result.name.padEnd(23)} | ${String(scores.performance).padStart(4)} | ${String(scores.accessibility).padStart(4)} | ${String(scores.bestPractices).padStart(3)} | ${String(scores.seo).padStart(3)}`;
      console.log(row);
    }
  });

  console.log('\n✅ Lighthouse audit complete\n');

  // Save results to JSON
  fs.writeFileSync(
    'lighthouse-results.json',
    JSON.stringify(results, null, 2)
  );
  console.log('📁 Full results saved to lighthouse-results.json\n');
}

main().catch(console.error);
