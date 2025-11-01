# Google Ads Competitive Analysis Tool

AI-powered competitive intelligence tool that analyzes Google Ads Auction Insights data and generates strategic recommendations to outrank competitors and grow market share.

## What It Does

This tool analyzes your Google Ads auction insights data to:

1. **Identify Your Competitive Position** - Shows your impression share, top-of-page rate, and ranking metrics
2. **Detect Market Leaders** - Identifies competitors dominating the market (>20% impression share)
3. **Find Threats** - Highlights competitors who frequently rank above you (>50% position above rate)
4. **Spot Opportunities** - Discovers competitors you can easily outrank (high overlap, low position above)
5. **Generate AI Strategies** - Uses Claude AI to create 8-12 actionable competitive recommendations

## Key Features

- **Competitive Metrics Analysis**: Impression share, overlap rate, position above rate, top-of-page rate
- **Threat Assessment**: Automatic identification of high/medium threat competitors
- **Opportunity Detection**: Find weak competitors with high overlap
- **AI-Powered Recommendations**: Claude generates specific, data-driven strategies with:
  - Priority levels (critical, high, medium, low)
  - Expected impact metrics
  - Implementation steps
  - Budget estimates
  - Target competitors
- **JSON Export**: Save all insights and recommendations for later review

## Setup

### 1. Get Anthropic API Key

Sign up at [https://console.anthropic.com](https://console.anthropic.com) and create an API key.

### 2. Add API Key to Environment

Add this line to your `.env.local` file:

```bash
ANTHROPIC_API_KEY=your_api_key_here
```

### 3. Install Dependencies

Dependencies should already be installed, but if needed:

```bash
npm install @anthropic-ai/sdk csv-parse
```

## How to Use

### Step 1: Export Auction Insights from Google Ads

1. Go to Google Ads console
2. Navigate to **Reports** → **Predefined Reports** → **Auction Insights**
3. Select **Search** campaign type
4. Choose your date range (7-30 days recommended)
5. Click **Download** → **CSV**
6. Save the file (e.g., `auction-insights.csv`)

### Step 2: Run the Analysis

Place the CSV file in the `assets/Google ads reports/` directory, then run:

```bash
node scripts/analyze-competitive-insights.js "assets/Google ads reports/Auction insights - search.csv"
```

Or with a custom path:

```bash
node scripts/analyze-competitive-insights.js /path/to/your/auction-insights.csv
```

### Step 3: Review Results

The tool will:
1. Parse your auction insights data
2. Analyze competitive metrics
3. Generate AI recommendations using Claude
4. Display results in terminal
5. Save to `assets/Google ads reports/competitive-insights.json`

## Example Output

```
═══════════════════════════════════════════════════════════════
🎯 AI-GENERATED COMPETITIVE STRATEGY RECOMMENDATIONS
═══════════════════════════════════════════════════════════════

📊 YOUR CURRENT POSITION:
   Impression Share: 20.20%
   Top of Page Rate: 43.16%
   Absolute Top Rate: 11.08%
   Outranking Share: 0%

🏆 COMPETITIVE LANDSCAPE: 8 competitors identified

1. 🔴 INCREASE BIDS TO OUTRANK SAFELITE.COM
   Priority: CRITICAL | Category: bid_strategy | Effort: medium
   🎯 Target Competitors: safelite.com

   Safelite dominates with 59% impression share and ranks above you 80% of the time...

   💡 Why This Matters:
   Safelite's 52% overlap rate means they appear in half your auctions...

   📊 Expected Impact: impression share +8%

   💰 Estimated Budget: $1500 monthly

   ✅ Implementation Steps:
      1. Increase bid multiplier by 25% for top-performing keywords
      2. Enable Target Impression Share bidding at 40% target
      3. Monitor for 7 days and adjust based on position metrics
```

## Understanding the Metrics

### Your Metrics
- **Impression Share**: % of total available impressions you received
- **Top of Page Rate**: % of times you appeared at top of search results
- **Absolute Top Rate**: % of times you appeared in #1 position
- **Outranking Share**: % of auctions where you ranked higher than competitors

### Competitor Metrics
- **Overlap Rate**: % of auctions where both you and competitor appeared
- **Position Above Rate**: % of times competitor ranked higher than you
- **Search Impression Share**: Competitor's overall impression share

### Competitive Classifications

**Market Leaders** (>20% impression share)
- Dominant players with significant market share
- Require defensive and offensive strategies

**Threats** (>50% position above rate)
- Frequently outrank you
- Prioritize strategies to increase bids or improve quality score

**Opportunities** (>30% overlap, <40% position above)
- High visibility but weaker positioning
- Easy wins with modest bid increases

## Recommendation Categories

The AI generates recommendations in these categories:

1. **Bid Strategy** - Adjust bids to compete more effectively
2. **Ad Positioning** - Improve placement and visibility
3. **Competitor Targeting** - Target specific competitor weaknesses
4. **Budget Allocation** - Optimize spending across campaigns
5. **Quality Score** - Reduce costs vs competitors
6. **Market Share Growth** - Increase overall impression share
7. **Defensive Tactics** - Protect against competitor aggression
8. **Geographic Targeting** - Find less competitive markets

## Files Generated

- `assets/Google ads reports/competitive-insights.json` - Full analysis results including:
  - Your metrics
  - Competitive landscape summary
  - All competitors with full metrics
  - Market leaders, threats, and opportunities
  - AI-generated recommendations

## Tips for Best Results

1. **Use Recent Data** - Export auction insights from the last 7-30 days
2. **Run Weekly** - Competitive landscape changes frequently
3. **Track Changes** - Compare insights over time to spot trends
4. **Implement Gradually** - Start with critical/high priority recommendations
5. **Measure Impact** - Re-run analysis after implementing changes

## Companion Tool

This tool works alongside the Search Terms Analysis tool (`analyze-google-ads.js`):

- **Search Terms Tool**: What users are searching for (demand side)
- **Competitive Analysis Tool**: Who you're competing against (supply side)

Use both together for complete Google Ads optimization.

## Troubleshooting

**"Could not resolve authentication method"**
- Add `ANTHROPIC_API_KEY` to `.env.local`

**"CSV file not found"**
- Check file path is correct
- Ensure CSV is in the expected location

**"Could not find JSON in Claude response"**
- API may have rate limits
- Check internet connection
- Verify API key is valid

**"Loaded 0 competitors"**
- CSV format may be incorrect
- Check that file contains auction insights data (not search terms)
- Ensure headers include "Display URL domain" or "Search Impr. share"

## Cost Estimate

Using Claude 3.5 Sonnet:
- ~5,000 tokens per analysis
- Cost: ~$0.015 per run (~1.5 cents)
- Extremely cost-effective for the insights provided

## Support

For issues or questions, check:
- Claude API docs: https://docs.anthropic.com
- Google Ads Auction Insights: https://support.google.com/google-ads/answer/2579754
