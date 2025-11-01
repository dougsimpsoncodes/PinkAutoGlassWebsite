#!/usr/bin/env node

/**
 * Google Ads Competitive Analysis Tool
 *
 * This script reads Google Ads Auction Insights CSV exports and uses Claude AI
 * to generate competitive strategy recommendations.
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

  // Find the header line (auction insights columns)
  let headerIndex = 0;
  let headerContent = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Check for auction insights columns
    if (line.includes('Display URL domain') ||
        line.includes('Display name') ||
        (line.includes('Search Impr. share') && line.includes('overlap'))) {
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
 * Analyze competitive metrics to find key insights
 */
function analyzeCompetitors(auctionData) {
  const insights = {
    totalCompetitors: 0,
    yourMetrics: null,
    competitors: [],
    threats: [],
    opportunities: [],
    marketLeaders: [],
  };

  auctionData.forEach(row => {
    const displayName = row['Display URL domain'] || row['Display name'] || row['Domain'] || '';
    if (!displayName) return;

    // Parse metrics (handle percentage strings and -- for N/A)
    const parsePercent = (val) => {
      if (!val || val === '--') return 0;
      return parseFloat(val.replace('%', '').replace('<', '').replace('>', '').trim());
    };

    const imprShare = parsePercent(row['Search Impr. share (Auction Insights)'] || row['Search Impr. share'] || row['Impr. share'] || '0');
    const overlapRate = parsePercent(row['Search overlap rate'] || row['Overlap rate'] || '0');
    const positionAboveRate = parsePercent(row['Position above rate'] || '0');
    const topOfPageRate = parsePercent(row['Top of page rate'] || '0');
    const absTopRate = parsePercent(row['Abs. Top of page rate'] || row['Absolute top of page rate'] || '0');
    const outRankingShare = parsePercent(row['Search outranking share'] || row['Outranking share'] || '0');

    const competitor = {
      name: displayName,
      imprShare,
      overlapRate,
      positionAboveRate,
      topOfPageRate,
      absTopRate,
      outRankingShare,
    };

    // Identify if this is Pink Auto Glass (your company)
    const isPinkAutoGlass = displayName.toLowerCase().includes('pink') ||
                           displayName.toLowerCase().includes('pinkautoglass') ||
                           displayName.toLowerCase() === 'you';

    if (isPinkAutoGlass) {
      insights.yourMetrics = competitor;
      insights.yourMetrics.name = 'Pink Auto Glass (You)';
    } else {
      insights.totalCompetitors++;
      insights.competitors.push(competitor);

      // Identify threats (competitors who rank above you frequently)
      if (positionAboveRate > 50) {
        insights.threats.push({
          ...competitor,
          threatLevel: positionAboveRate > 75 ? 'high' : 'medium',
        });
      }

      // Identify market leaders (high impression share)
      if (imprShare > 20) {
        insights.marketLeaders.push(competitor);
      }

      // Identify opportunities (high overlap but low position above)
      if (overlapRate > 30 && positionAboveRate < 40) {
        insights.opportunities.push({
          ...competitor,
          opportunityType: 'outrank',
        });
      }
    }
  });

  // Sort arrays
  insights.competitors.sort((a, b) => b.imprShare - a.imprShare);
  insights.threats.sort((a, b) => b.positionAboveRate - a.positionAboveRate);
  insights.marketLeaders.sort((a, b) => b.imprShare - a.imprShare);
  insights.opportunities.sort((a, b) => b.overlapRate - a.overlapRate);

  return insights;
}

/**
 * Generate AI recommendations using Claude
 */
async function generateRecommendations(insights) {
  console.log('\n🤖 Analyzing competitive landscape with Claude AI...\n');

  const yourMetrics = insights.yourMetrics || { name: 'Pink Auto Glass', imprShare: 0 };

  const prompt = `You are an expert Google Ads competitive strategist analyzing auction insights data for Pink Auto Glass, an auto glass repair and replacement company in Colorado.

# Your Competitive Position

**Pink Auto Glass Metrics:**
- Impression Share: ${yourMetrics.imprShare}%
- Overlap Rate: ${yourMetrics.overlapRate}%
- Position Above Rate: ${yourMetrics.positionAboveRate}%
- Top of Page Rate: ${yourMetrics.topOfPageRate}%
- Absolute Top Rate: ${yourMetrics.absTopRate}%
- Outranking Share: ${yourMetrics.outRankingShare}%

# Competitive Landscape

**Total Competitors Analyzed:** ${insights.totalCompetitors}

## Market Leaders (Impression Share > 20%):
${insights.marketLeaders.length > 0 ? insights.marketLeaders.map(c =>
  `- ${c.name}: ${c.imprShare}% impr share, ${c.topOfPageRate}% top of page, ${c.absTopRate}% absolute top`
).join('\n') : 'None identified'}

## Top Threats (Rank Above You > 50% of the time):
${insights.threats.length > 0 ? insights.threats.slice(0, 5).map(t =>
  `- ${t.name}: Ranks above ${t.positionAboveRate}% | ${t.overlapRate}% overlap | ${t.imprShare}% impr share | Threat: ${t.threatLevel}`
).join('\n') : 'None identified'}

## Outranking Opportunities (High Overlap, Lower Position Above):
${insights.opportunities.length > 0 ? insights.opportunities.slice(0, 5).map(o =>
  `- ${o.name}: ${o.overlapRate}% overlap, only ${o.positionAboveRate}% position above (you can outrank!)`
).join('\n') : 'None identified'}

## All Competitors (sorted by impression share):
${insights.competitors.slice(0, 10).map(c =>
  `- ${c.name}: ${c.imprShare}% impr | ${c.overlapRate}% overlap | ${c.positionAboveRate}% above | ${c.topOfPageRate}% top | ${c.absTopRate}% abs top | ${c.outRankingShare}% outranking`
).join('\n')}

# Your Task

Provide 8-12 actionable competitive strategy recommendations in the following JSON format:

\`\`\`json
{
  "recommendations": [
    {
      "category": "bid_strategy" | "ad_positioning" | "competitor_targeting" | "budget_allocation" | "quality_score" | "market_share_growth" | "defensive_tactics" | "geographic_targeting",
      "priority": "critical" | "high" | "medium" | "low",
      "title": "Short, action-oriented title (max 60 chars)",
      "description": "Clear description of the competitive issue and opportunity (2-3 sentences)",
      "reasoning": "Data-driven explanation using specific competitor metrics (2-3 sentences with numbers)",
      "expectedImpact": {
        "metric": "impression_share" | "position_above_rate" | "top_of_page_rate" | "outranking_share" | "overlap_rate",
        "value": 15.5,
        "unit": "percent" | "absolute"
      },
      "effort": "low" | "medium" | "high",
      "implementationSteps": [
        "Step 1: Specific action",
        "Step 2: Specific action",
        "Step 3: Specific action"
      ],
      "targetCompetitors": ["competitor1.com", "competitor2.com"],
      "estimatedBudget": {
        "amount": 500,
        "frequency": "monthly" | "daily" | "one-time"
      }
    }
  ]
}
\`\`\`

Focus on:
1. **Competitive bidding strategies** to outrank key threats
2. **Market share growth tactics** to increase impression share
3. **Defensive positioning** against strong competitors
4. **Opportunity exploitation** for weak competitors with high overlap
5. **Budget optimization** to compete efficiently
6. **Quality Score improvements** to reduce costs vs competitors
7. **Geographic targeting** to find less competitive areas
8. **Ad scheduling** to avoid peak competitive hours

Be specific, data-driven, and actionable. Prioritize recommendations that will have the highest ROI based on the competitive data. Consider both offensive (gain share) and defensive (protect share) strategies.`;

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
function displayRecommendations(recommendations, insights) {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🎯 AI-GENERATED COMPETITIVE STRATEGY RECOMMENDATIONS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Display your metrics first
  if (insights.yourMetrics) {
    const m = insights.yourMetrics;
    console.log('📊 YOUR CURRENT POSITION:');
    console.log(`   Impression Share: ${m.imprShare}%`);
    console.log(`   Top of Page Rate: ${m.topOfPageRate}%`);
    console.log(`   Absolute Top Rate: ${m.absTopRate}%`);
    console.log(`   Outranking Share: ${m.outRankingShare}%`);
    console.log('');
  }

  console.log(`🏆 COMPETITIVE LANDSCAPE: ${insights.totalCompetitors} competitors identified\n`);

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

    if (rec.targetCompetitors && rec.targetCompetitors.length > 0) {
      console.log(`   🎯 Target Competitors: ${rec.targetCompetitors.join(', ')}`);
    }

    console.log(`\n   ${rec.description}`);
    console.log(`\n   💡 Why This Matters:`);
    console.log(`   ${rec.reasoning}`);

    if (rec.expectedImpact) {
      const unit = rec.expectedImpact.unit === 'percent' ? '%' : '';
      console.log(`\n   📊 Expected Impact: ${rec.expectedImpact.metric.replace(/_/g, ' ')} +${rec.expectedImpact.value}${unit}`);
    }

    if (rec.estimatedBudget) {
      console.log(`\n   💰 Estimated Budget: $${rec.estimatedBudget.amount} ${rec.estimatedBudget.frequency}`);
    }

    console.log(`\n   ✅ Implementation Steps:`);
    rec.implementationSteps.forEach((step, i) => {
      console.log(`      ${i + 1}. ${step}`);
    });

    console.log('\n   ───────────────────────────────────────────────────────────');
  });

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`✨ Generated ${sorted.length} competitive strategy recommendations`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

/**
 * Save recommendations to JSON file
 */
function saveRecommendations(recommendations, insights) {
  const outputPath = path.join(__dirname, '../assets/Google ads reports/competitive-insights.json');

  const output = {
    generatedAt: new Date().toISOString(),
    yourMetrics: insights.yourMetrics,
    competitiveLandscape: {
      totalCompetitors: insights.totalCompetitors,
      marketLeaders: insights.marketLeaders,
      threats: insights.threats,
      opportunities: insights.opportunities,
    },
    recommendations: recommendations.recommendations,
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`💾 Competitive insights saved to: ${outputPath}\n`);
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🚀 Starting Google Ads Competitive Analysis...\n');

  try {
    // Check for CSV file path argument
    const csvPath = process.argv[2] || path.join(__dirname, '../assets/Google ads reports/auction-insights.csv');

    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found: ${csvPath}\n\nUsage: node analyze-competitive-insights.js [path-to-auction-insights.csv]`);
    }

    // Load and parse auction insights data
    console.log('📊 Loading auction insights data...');
    console.log(`   File: ${csvPath}`);
    const auctionData = parseCSV(csvPath);
    console.log(`   ✓ Loaded ${auctionData.length} competitors\n`);

    // Analyze competitive metrics
    console.log('🔍 Analyzing competitive landscape...');
    const insights = analyzeCompetitors(auctionData);
    console.log(`   ✓ Your impression share: ${insights.yourMetrics?.imprShare || 0}%`);
    console.log(`   ✓ Market leaders identified: ${insights.marketLeaders.length}`);
    console.log(`   ✓ Competitive threats: ${insights.threats.length}`);
    console.log(`   ✓ Outranking opportunities: ${insights.opportunities.length}`);

    // Generate AI recommendations
    const recommendations = await generateRecommendations(insights);

    // Display results
    displayRecommendations(recommendations, insights);

    // Save to file
    saveRecommendations(recommendations, insights);

    console.log('✅ Competitive analysis complete!\n');

  } catch (error) {
    console.error('\n❌ Error during analysis:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { analyzeCompetitors, generateRecommendations };
