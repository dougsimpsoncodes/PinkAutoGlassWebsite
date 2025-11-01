# 🤖 Google Ads AI Analysis Scripts

## Quick Start

### 1. Install Dependencies

```bash
npm install @anthropic-ai/sdk csv-parse
```

### 2. Get Your Anthropic API Key

1. Visit https://console.anthropic.com/
2. Sign up or log in
3. Go to "API Keys" section
4. Create a new key
5. Copy it (starts with `sk-ant-`)

### 3. Set Your API Key

#### Option A: Environment Variable (Recommended)

```bash
export ANTHROPIC_API_KEY="sk-ant-api03-your-key-here"
```

#### Option B: .env File

Edit `.env.google-ads`:
```
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

Then run:
```bash
source .env.google-ads
```

### 4. Export Your Google Ads Data

1. Go to Google Ads → Campaigns
2. Click "Insights and Reports" (top nav)
3. Select "Report Editor"
4. Choose "Search Terms" report
5. Set date range to "All time" (or desired period)
6. Click "Download" → CSV
7. Save to `assets/Google ads reports/search-terms.csv`

### 5. Run the Analysis

#### Test Data Parsing (no API key needed):

```bash
node scripts/test-analysis.js
```

#### Full AI Analysis (requires API key):

```bash
node scripts/analyze-google-ads.js
```

---

## 📊 What Each Script Does

### `analyze-google-ads.js`
**Main AI analysis script**

- Reads all Google Ads CSV files
- Analyzes search terms for patterns
- Calls Claude AI for optimization recommendations
- Generates actionable todo list
- Saves results to `assets/Google ads reports/ai-recommendations.json`

**Output:**
- 8-12 prioritized recommendations
- Specific implementation steps
- Expected impact metrics
- Ready-to-use negative keywords list
- Bid adjustment suggestions

### `test-analysis.js`
**Data analysis tester (no API needed)**

- Parses CSV files
- Calculates metrics
- Identifies converters, wasted spend, competitors
- Great for validating your data before running AI analysis

**Output:**
- Total spend/conversions/CPA
- Top converting terms
- Wasted spend list
- Competitor searches
- Missed opportunities

### `debug-csv.js`
**CSV debugging tool**

- Shows raw CSV structure
- Helps diagnose parsing issues
- Displays column names and sample rows

---

## 📁 Expected File Structure

```
/Users/dougsimpson/Projects/pinkautoglasswebsite/
├── assets/
│   └── Google ads reports/
│       ├── search-terms.csv                    # Search terms report (required)
│       ├── extracted/
│       │   ├── Campaigns(date-range).csv       # Campaign overview
│       │   ├── Time_series(date-range).csv     # Daily breakdown
│       │   ├── Optimization_score(date-range).csv
│       │   └── Biggest_changes(date-range).csv
│       └── ai-recommendations.json             # Generated output
├── scripts/
│   ├── analyze-google-ads.js
│   ├── test-analysis.js
│   └── debug-csv.js
└── .env.google-ads                             # API key configuration
```

---

## 💡 Usage Examples

### Example 1: Weekly Optimization Review

```bash
# 1. Export fresh data from Google Ads (search-terms.csv)

# 2. Run analysis
export ANTHROPIC_API_KEY="your-key"
node scripts/analyze-google-ads.js

# 3. Review recommendations
cat assets/Google\ ads\ reports/ai-recommendations.json | jq

# 4. Implement top 3 recommendations in Google Ads

# 5. Repeat next week to measure impact
```

### Example 2: Before/After Comparison

```bash
# Before optimization
node scripts/test-analysis.js > analysis-before.txt

# [Make changes in Google Ads]

# Wait 7 days, export new data

# After optimization
node scripts/test-analysis.js > analysis-after.txt

# Compare
diff analysis-before.txt analysis-after.txt
```

### Example 3: Quick Data Check

```bash
# Just want to see what's in your CSV?
node scripts/debug-csv.js
```

---

## 🎯 What the AI Analyzes

The Claude AI looks for:

1. **High-converting terms** → Recommends increasing bids
2. **Wasted spend terms** → Creates negative keyword list
3. **Competitor searches** → Strategy recommendations
4. **High-intent missed opportunities** → Ad copy improvements
5. **Geographic patterns** → Location targeting suggestions
6. **Time-based patterns** → Bid scheduling recommendations
7. **Device performance** → Device bid adjustments
8. **Ad copy effectiveness** → Creative optimization ideas
9. **Landing page alignment** → Quality Score improvements
10. **Budget allocation** → Spend optimization strategies

---

## 💰 Cost

### Anthropic API Costs (Claude 3.5 Sonnet):
- **Input:** $3 per million tokens
- **Output:** $15 per million tokens

### Per Analysis:
- ~20,000 input tokens (your data)
- ~4,000 output tokens (recommendations)
- **Cost per analysis:** ~$0.12-0.30

**Worth it?** If it saves you even $10 in wasted ad spend, you've made 30-100x ROI 🚀

---

## 🔧 Troubleshooting

### "Cannot find module '@anthropic-ai/sdk'"
```bash
npm install @anthropic-ai/sdk
```

### "Parsed 0 records" or "Total Clicks: 0"
Your CSV format might be different. Run:
```bash
node scripts/debug-csv.js
```

Check the header line detection. You may need to adjust the parsing logic in `parseCSV()`.

### "401 Unauthorized" from Anthropic API
Your API key is wrong or not set. Check:
```bash
echo $ANTHROPIC_API_KEY
```

Should show `sk-ant-...`. If empty, set it again.

### "Cost per Conversion: $NaN"
This means no conversions were found in the data. Check:
1. Did you enable conversion tracking in Google Ads?
2. Is your CSV export from the right date range?
3. Run `node scripts/debug-csv.js` to see what's in the "Conversions" column

---

## 🚀 Future Enhancements

**Coming Soon:**
- [ ] Automated weekly email reports
- [ ] Integration with admin dashboard UI
- [ ] Automated negative keyword addition via Google Ads API
- [ ] A/B testing recommendations
- [ ] Budget forecasting based on patterns
- [ ] Competitive intelligence integration

---

## 📞 Questions?

Check the main analysis report:
```bash
cat GOOGLE_ADS_ANALYSIS_REPORT.md
```

Or review the detailed implementation plan:
```bash
cat AI_GOOGLE_ADS_OPTIMIZER_PLAN.md
```

---

**Built for Pink Auto Glass** 🌸
