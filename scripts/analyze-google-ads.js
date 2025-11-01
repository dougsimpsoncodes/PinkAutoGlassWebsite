#!/usr/bin/env node

/**
 * Google Ads AI Analyzer
 *
 * This script reads Google Ads CSV exports and uses Claude AI to generate
 * actionable optimization recommendations.
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const Anthropic = require('@anthropic-ai/sdk');

// Initialize Anthropic client with API key
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Parse CSV file into array of objects
 */
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

/**
 * Read all Google Ads data files
 */
function loadGoogleAdsData() {
  const baseDir = path.join(__dirname, '../assets/Google ads reports');

  const data = {
    searchTerms: parseCSV(path.join(baseDir, 'search-terms.csv')),
    campaigns: parseCSV(path.join(baseDir, 'extracted/Campaigns(2025.10.26-2025.10.27).csv')),
    timeSeries: parseCSV(path.join(baseDir, 'extracted/Time_series(2025.10.26-2025.10.27).csv')),
    biggestChanges: parseCSV(path.join(baseDir, 'extracted/Biggest_changes(2025.10.26-2025.10.27_compared_to_2025.10.19-2025.10.20).csv')),
    optimizationScore: parseCSV(path.join(baseDir, 'extracted/Optimization_score(2025.10.26-2025.10.27).csv')),
  };

  return data;
}

/**
 * Analyze search terms to find key insights
 */
function analyzeSearchTerms(searchTerms) {
  const insights = {
    totalClicks: 0,
    totalImpressions: 0,
    totalCost: 0,
    totalConversions: 0,
    converters: [],
    wasted: [],
    competitors: [],
    highIntent: [],
  };

  searchTerms.forEach(term => {
    // Skip rows without a search term
    if (!term['Search term']) return;

    const clicks = parseInt(term.Clicks) || 0;
    const impressions = parseInt(term['Impr.']) || 0;
    const cost = term.Cost ? parseFloat(term.Cost.replace('$', '')) : 0;
    const conversions = parseFloat(term.Conversions) || 0;
    const convRate = term['Conv. rate'] ? parseFloat(term['Conv. rate'].replace('%', '')) : 0;

    insights.totalClicks += clicks;
    insights.totalImpressions += impressions;
    insights.totalCost += cost;
    insights.totalConversions += conversions;

    const searchTerm = term['Search term'];
    const termLower = searchTerm.toLowerCase();

    // Identify converters
    if (conversions > 0) {
      insights.converters.push({
        term: searchTerm,
        clicks,
        conversions,
        cost,
        convRate,
        costPerConv: cost / conversions,
      });
    }

    // Identify wasted spend (clicks but no conversions)
    if (clicks > 0 && conversions === 0 && cost > 5) {
      insights.wasted.push({
        term: searchTerm,
        clicks,
        cost,
      });
    }

    // Identify competitor searches
    const competitorNames = ['safelite', 'safe light', 'jiffy', 'primos', 'anders', 'native', 'tavos'];
    if (competitorNames.some(comp => termLower.includes(comp))) {
      insights.competitors.push({
        term: searchTerm,
        impressions,
        clicks,
        cost,
      });
    }

    // Identify high-intent terms with impressions but no clicks
    const highIntentKeywords = ['replacement', 'repair', 'mobile', 'near me', 'cost'];
    if (impressions > 5 && clicks === 0 && highIntentKeywords.some(kw => termLower.includes(kw))) {
      insights.highIntent.push({
        term: searchTerm,
        impressions,
      });
    }
  });

  // Sort by relevance
  insights.converters.sort((a, b) => b.convRate - a.convRate);
  insights.wasted.sort((a, b) => b.cost - a.cost);
  insights.competitors.sort((a, b) => b.impressions - a.impressions);
  insights.highIntent.sort((a, b) => b.impressions - a.impressions);

  return insights;
}

/**
 * Generate AI recommendations using Claude
 */
async function generateRecommendations(data, insights) {
  console.log('\n🤖 Analyzing with Claude AI...\n');

  const prompt = `You are an expert Google Ads optimization consultant analyzing data for Pink Auto Glass, an auto glass repair and replacement company in Colorado.

# Campaign Overview
- Campaign Type: Performance Max
- Date Range: Oct 26-27, 2025 (2 days)
- Total Spend: $${insights.totalCost.toFixed(2)}
- Total Clicks: ${insights.totalClicks}
- Total Impressions: ${insights.totalImpressions}
- Total Conversions: ${insights.totalConversions}
- Cost per Conversion: $${(insights.totalCost / insights.totalConversions).toFixed(2)}
- Optimization Score: ${data.optimizationScore[0]?.['Optimization Score'] || 'N/A'}

# Search Terms Analysis

## Top Converting Terms (${insights.converters.length} total):
${insights.converters.slice(0, 10).map(c =>
  `- "${c.term}": ${c.conversions} conv @ ${c.convRate}% rate, $${c.costPerConv.toFixed(2)} CPA (${c.clicks} clicks, $${c.cost.toFixed(2)} spent)`
).join('\n')}

## Wasted Spend - Clicks with NO Conversions (${insights.wasted.length} total):
${insights.wasted.slice(0, 10).map(w =>
  `- "${w.term}": ${w.clicks} clicks, $${w.cost.toFixed(2)} wasted`
).join('\n')}

## Competitor Brand Searches (${insights.competitors.length} total):
${insights.competitors.slice(0, 10).map(c =>
  `- "${c.term}": ${c.impressions} impressions, ${c.clicks} clicks, $${c.cost.toFixed(2)}`
).join('\n')}

## High-Intent Terms with Impressions but NO Clicks (${insights.highIntent.length} total):
${insights.highIntent.slice(0, 10).map(h =>
  `- "${h.term}": ${h.impressions} impressions (0 clicks)`
).join('\n')}

# Your Task

Provide 8-12 actionable optimization recommendations in the following JSON format:

\`\`\`json
{
  "recommendations": [
    {
      "category": "negative_keywords" | "bid_adjustments" | "ad_copy" | "landing_pages" | "audience_targeting" | "budget_allocation" | "campaign_structure" | "conversion_tracking",
      "priority": "critical" | "high" | "medium" | "low",
      "title": "Short, action-oriented title (max 60 chars)",
      "description": "Clear description of the issue and opportunity (2-3 sentences)",
      "reasoning": "Data-driven explanation of why this matters (2-3 sentences with specific numbers)",
      "expectedImpact": {
        "metric": "CPA" | "conversion_rate" | "wasted_spend" | "CTR" | "quality_score",
        "value": 15.5,
        "unit": "percent" | "dollars" | "absolute"
      },
      "effort": "low" | "medium" | "high",
      "implementationSteps": [
        "Step 1: Specific action",
        "Step 2: Specific action",
        "Step 3: Specific action"
      ],
      "automationData": {
        "negativeKeywords": ["keyword1", "keyword2"],
        "bidMultiplier": 1.25,
        "targetCPA": 50.00
      }
    }
  ]
}
\`\`\`

Focus on:
1. **Negative keywords** to eliminate competitor searches and non-converting terms
2. **Bid optimization** for high-converting terms
3. **Ad copy improvements** based on what's working
4. **Landing page optimization** for better conversion rates
5. **Geographic targeting** refinement
6. **Budget reallocation** to best performers

Be specific, data-driven, and actionable. Each recommendation should have clear implementation steps that can be executed in Google Ads within 5-10 minutes.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const responseText = message.content[0].text;

    // Extract JSON from response
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      throw new Error('Could not find JSON in Claude response');
    }

    const recommendations = JSON.parse(jsonMatch[1]);
    return recommendations;

  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

/**
 * Display recommendations in a readable format
 */
function displayRecommendations(recommendations) {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🎯 AI-GENERATED GOOGLE ADS OPTIMIZATION RECOMMENDATIONS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
  const sorted = recommendations.recommendations.sort((a, b) =>
    priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  sorted.forEach((rec, index) => {
    const priorityEmoji = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢',
    }[rec.priority];

    console.log(`\n${index + 1}. ${priorityEmoji} ${rec.title.toUpperCase()}`);
    console.log(`   Priority: ${rec.priority.toUpperCase()} | Category: ${rec.category} | Effort: ${rec.effort}`);
    console.log(`\n   ${rec.description}`);
    console.log(`\n   💡 Why This Matters:`);
    console.log(`   ${rec.reasoning}`);

    if (rec.expectedImpact) {
      const unit = rec.expectedImpact.unit === 'percent' ? '%' :
                   rec.expectedImpact.unit === 'dollars' ? '$' : '';
      const prefix = rec.expectedImpact.unit === 'dollars' ? '$' : '';
      console.log(`\n   📊 Expected Impact: ${rec.expectedImpact.metric} ${prefix}${rec.expectedImpact.value}${unit}`);
    }

    console.log(`\n   ✅ Implementation Steps:`);
    rec.implementationSteps.forEach((step, i) => {
      console.log(`      ${i + 1}. ${step}`);
    });

    if (rec.automationData && Object.keys(rec.automationData).length > 0) {
      console.log(`\n   🤖 Automation Data:`);
      console.log(`      ${JSON.stringify(rec.automationData, null, 2).replace(/\n/g, '\n      ')}`);
    }

    console.log('\n   ───────────────────────────────────────────────────────────');
  });

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`✨ Generated ${sorted.length} recommendations`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

/**
 * Save recommendations to JSON file
 */
function saveRecommendations(recommendations) {
  const outputPath = path.join(__dirname, '../assets/Google ads reports/ai-recommendations.json');
  fs.writeFileSync(outputPath, JSON.stringify(recommendations, null, 2));
  console.log(`💾 Recommendations saved to: ${outputPath}\n`);
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🚀 Starting Google Ads AI Analysis...\n');

  try {
    // Load data
    console.log('📊 Loading Google Ads data...');
    const data = loadGoogleAdsData();
    console.log(`   ✓ Loaded ${data.searchTerms.length} search terms`);
    console.log(`   ✓ Loaded ${data.campaigns.length} campaign(s)`);
    console.log(`   ✓ Loaded ${data.timeSeries.length} time series data points`);

    // Analyze search terms
    console.log('\n🔍 Analyzing search terms...');
    const insights = analyzeSearchTerms(data.searchTerms);
    console.log(`   ✓ Found ${insights.converters.length} converting terms`);
    console.log(`   ✓ Identified ${insights.wasted.length} wasted spend terms`);
    console.log(`   ✓ Detected ${insights.competitors.length} competitor searches`);
    console.log(`   ✓ Found ${insights.highIntent.length} high-intent missed opportunities`);

    // Generate AI recommendations
    const recommendations = await generateRecommendations(data, insights);

    // Display results
    displayRecommendations(recommendations);

    // Save to file
    saveRecommendations(recommendations);

    console.log('✅ Analysis complete!\n');

  } catch (error) {
    console.error('\n❌ Error during analysis:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { analyzeSearchTerms, generateRecommendations };
