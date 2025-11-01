#!/usr/bin/env node

/**
 * Test the data analysis without API call
 */

const { analyzeSearchTerms } = require('./analyze-google-ads');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');

  // Find the header line (must be the actual column headers, not title)
  let headerIndex = 0;
  let headerContent = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Check for actual data columns (not just title rows)
    if ((line.includes('Search term') && line.includes('Clicks')) ||
        (line.includes('Campaign Name') && line.includes('Cost')) ||
        (line.includes('Date') && line.includes('Impressions'))) {
      headerIndex = i;
      headerContent = lines.slice(i).join('\n');
      break;
    }
  }

  // Parse CSV starting from header
  const records = parse(headerContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  return records;
}

console.log('Loading search terms data...');
const searchTerms = parseCSV(path.join(__dirname, '../assets/Google ads reports/search-terms.csv'));
console.log(`Loaded ${searchTerms.length} rows`);

console.log('\nAnalyzing...');
const insights = analyzeSearchTerms(searchTerms);

console.log('\n📊 ANALYSIS RESULTS\n');
console.log(`Total Clicks: ${insights.totalClicks}`);
console.log(`Total Impressions: ${insights.totalImpressions}`);
console.log(`Total Cost: $${insights.totalCost.toFixed(2)}`);
console.log(`Total Conversions: ${insights.totalConversions}`);
console.log(`Cost per Conversion: $${(insights.totalCost / insights.totalConversions).toFixed(2)}`);
console.log(`Overall CTR: ${((insights.totalClicks / insights.totalImpressions) * 100).toFixed(2)}%`);
console.log(`Overall Conv Rate: ${((insights.totalConversions / insights.totalClicks) * 100).toFixed(2)}%`);

console.log('\n🎯 TOP 5 CONVERTING TERMS:');
insights.converters.slice(0, 5).forEach((c, i) => {
  console.log(`  ${i + 1}. "${c.term}"`);
  console.log(`     ${c.conversions} conversions @ ${c.convRate}% rate, $${c.costPerConv.toFixed(2)} CPA`);
  console.log(`     ${c.clicks} clicks, $${c.cost.toFixed(2)} spent`);
});

console.log('\n💸 TOP 5 WASTED SPEND (No Conversions):');
insights.wasted.slice(0, 5).forEach((w, i) => {
  console.log(`  ${i + 1}. "${w.term}" - ${w.clicks} clicks, $${w.cost.toFixed(2)} wasted`);
});

console.log('\n🏢 COMPETITOR BRAND SEARCHES:');
insights.competitors.slice(0, 5).forEach((c, i) => {
  console.log(`  ${i + 1}. "${c.term}" - ${c.impressions} impressions, ${c.clicks} clicks, $${c.cost.toFixed(2)}`);
});

console.log('\n🔍 TOP 5 HIGH-INTENT MISSED OPPORTUNITIES:');
insights.highIntent.slice(0, 5).forEach((h, i) => {
  console.log(`  ${i + 1}. "${h.term}" - ${h.impressions} impressions (0 clicks)`);
});

console.log('\n✅ Analysis complete!');
