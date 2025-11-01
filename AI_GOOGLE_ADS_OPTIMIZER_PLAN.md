# AI-Powered Google Ads Optimization System
## Automated Campaign Analysis & Optimization Recommendations

---

## 🎯 Vision

Build an intelligent Google Ads optimization assistant that:
1. **Scrapes** comprehensive campaign data from Google Ads interface
2. **Analyzes** performance using AI (Claude)
3. **Recommends** specific optimizations with reasoning
4. **Creates** actionable todo lists in admin dashboard
5. **Automates** implementation of approved changes

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Admin Dashboard UI                     │
│  [Run Analysis] → [View Insights] → [Approve Changes]  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Playwright Google Ads Scraper              │
│  • Login to Google Ads                                  │
│  • Navigate through all reports                         │
│  • Extract comprehensive data                           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Data Storage Layer                    │
│  • Campaign performance metrics                         │
│  • Search term reports                                  │
│  • Auction insights                                     │
│  • Ad schedule performance                              │
│  • Geographic performance                               │
│  • Device performance                                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              AI Analysis Engine (Claude API)            │
│  • Analyze all collected data                           │
│  • Identify optimization opportunities                  │
│  • Generate specific recommendations                    │
│  • Prioritize by impact                                 │
│  • Create implementation steps                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│           Recommendations & Todo Management             │
│  • Display AI-generated insights                        │
│  • Create actionable todo items                         │
│  • Track approval/rejection                             │
│  • Monitor implementation status                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│            Google Ads Automation (Optional)             │
│  • Auto-implement approved changes                      │
│  • Update bids, budgets, keywords                       │
│  • Pause/enable ads and keywords                        │
│  • Add negative keywords                                │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Data Collection Plan

### **Phase 1: Google Ads Data Extraction**

#### **1.1 Campaign Overview Data**
**Location:** Google Ads → Campaigns tab

**Data to Extract:**
- Campaign names and status (enabled/paused)
- Campaign type (Search, Display, etc.)
- Daily budget and spend
- Impressions, clicks, CTR
- Conversions and conversion rate
- Cost per conversion
- Average CPC
- Quality Score

**Playwright Script:**
```javascript
async function extractCampaignOverview(page) {
  await page.goto('https://ads.google.com/aw/campaigns');
  await page.waitForSelector('[data-test-id="awsui-table"]');

  const campaigns = await page.$$eval('table tbody tr', rows => {
    return rows.map(row => ({
      name: row.querySelector('[data-field="campaign.name"]')?.textContent,
      status: row.querySelector('[data-field="campaign.status"]')?.textContent,
      budget: row.querySelector('[data-field="campaign_budget.amount"]')?.textContent,
      impressions: row.querySelector('[data-field="metrics.impressions"]')?.textContent,
      clicks: row.querySelector('[data-field="metrics.clicks"]')?.textContent,
      conversions: row.querySelector('[data-field="metrics.conversions"]')?.textContent,
      cost: row.querySelector('[data-field="metrics.cost"]')?.textContent,
    }));
  });

  return campaigns;
}
```

---

#### **1.2 Search Terms Report**
**Location:** Google Ads → Keywords → Search Terms tab

**Data to Extract:**
- Search terms that triggered ads
- Match type (Exact, Phrase, Broad)
- Impressions, clicks, CTR for each term
- Conversions and conversion rate
- Cost per conversion
- Added as keyword (yes/no)
- Added as negative (yes/no)

**AI Analysis Focus:**
- Identify high-performing search terms to add as keywords
- Find irrelevant terms to add as negatives
- Discover new keyword opportunities
- Identify match type optimization opportunities

---

#### **1.3 Auction Insights**
**Location:** Google Ads → Campaigns → Auction Insights

**Data to Extract:**
- Competitors in auction
- Impression share (yours vs competitors)
- Overlap rate with competitors
- Position above rate
- Top of page rate
- Absolute top of page rate
- Outranking share

**AI Analysis Focus:**
- Identify where you're losing to competitors
- Suggest bid adjustments to improve position
- Find opportunities to outrank competitors
- Analyze when competitors are most active

---

#### **1.4 Ad Schedule Performance**
**Location:** Google Ads → Campaigns → Ad Schedule tab

**Data to Extract:**
- Performance by day of week
- Performance by hour of day
- Conversions by time period
- Cost per conversion by time
- CTR by time period

**AI Analysis Focus:**
- Identify best performing days/hours
- Suggest schedule adjustments
- Recommend bid adjustments by time
- Find wasted spend during low-performing times

---

#### **1.5 Geographic Performance**
**Location:** Google Ads → Campaigns → Locations tab

**Data to Extract:**
- Performance by city/state
- Conversions by location
- Cost per conversion by location
- CTR by location
- Impression share by location

**AI Analysis Focus:**
- Identify high-performing locations to increase bids
- Find underperforming locations to decrease/exclude
- Suggest geographic expansion opportunities
- Recommend location-specific ad copy

---

#### **1.6 Device Performance**
**Location:** Google Ads → Campaigns → Devices tab

**Data to Extract:**
- Performance by device (Mobile, Desktop, Tablet)
- Conversions by device
- Cost per conversion by device
- CTR by device

**AI Analysis Focus:**
- Identify optimal device bid adjustments
- Suggest device-specific ad copy
- Find device optimization opportunities

---

#### **1.7 Ad Performance**
**Location:** Google Ads → Ads & Extensions tab

**Data to Extract:**
- Ad copy and headlines
- CTR by ad variant
- Conversions by ad
- Quality Score components
- Ad strength rating

**AI Analysis Focus:**
- Identify winning ad copy elements
- Suggest new ad variations to test
- Recommend pausing poor performers
- Generate new headline/description ideas

---

#### **1.8 Keyword Performance**
**Location:** Google Ads → Keywords tab

**Data to Extract:**
- Keyword text and match type
- Quality Score (1-10)
- Expected CTR
- Ad relevance
- Landing page experience
- Impressions, clicks, CTR
- Conversions, cost per conversion
- Average CPC vs. First page CPC

**AI Analysis Focus:**
- Identify low Quality Score keywords to optimize
- Suggest bid adjustments
- Recommend pausing poor performers
- Find keyword expansion opportunities

---

## 🤖 AI Analysis Engine

### **Phase 2: Claude API Integration**

#### **2.1 Analysis Prompt Template**

```javascript
const analysisPrompt = `
You are a Google Ads optimization expert analyzing campaign data for Pink Auto Glass,
an auto glass repair and replacement service.

# Campaign Data
${JSON.stringify(campaignData, null, 2)}

# Search Terms Report
${JSON.stringify(searchTerms, null, 2)}

# Auction Insights
${JSON.stringify(auctionInsights, null, 2)}

# Ad Schedule Performance
${JSON.stringify(adSchedule, null, 2)}

# Geographic Performance
${JSON.stringify(geoPerformance, null, 2)}

# Device Performance
${JSON.stringify(devicePerformance, null, 2)}

# Keyword Performance
${JSON.stringify(keywordPerformance, null, 2)}

# Business Context
- Industry: Auto glass repair/replacement
- Target audience: Vehicle owners needing windshield/window services
- Service area: [Cities/regions]
- Average order value: $200-800
- Primary conversions: Phone calls, online bookings

# Analysis Required
Please analyze this data and provide:

1. **Performance Summary**
   - Overall campaign health (1-10 score)
   - Top 3 strengths
   - Top 3 weaknesses

2. **Search Terms Analysis**
   - High-value terms to add as keywords (with rationale)
   - Irrelevant terms to add as negatives (with rationale)
   - New keyword themes to explore

3. **Auction Insights Analysis**
   - Competitive position assessment
   - Bid adjustment recommendations
   - Opportunities to outrank competitors

4. **Time-Based Optimizations**
   - Best performing days/hours
   - Recommended schedule adjustments
   - Bid modifier recommendations by time

5. **Geographic Optimizations**
   - Top performing locations to scale
   - Underperforming locations to reduce/exclude
   - Expansion opportunities

6. **Device Optimizations**
   - Recommended bid adjustments by device
   - Device-specific ad copy suggestions

7. **Ad Copy Recommendations**
   - Winning headline/description elements
   - New ad variations to test
   - Ads to pause

8. **Keyword Optimizations**
   - Low Quality Score keywords to fix (with specific actions)
   - Bid adjustment recommendations
   - Keywords to pause
   - New keywords to add

9. **Budget Allocation**
   - Campaigns to increase budget
   - Campaigns to decrease budget
   - Overall budget reallocation plan

10. **Priority Action Items**
    - Ranked list of optimizations by expected impact
    - Effort required (Low/Medium/High)
    - Expected impact (Low/Medium/High)
    - Implementation steps

Please format your response as structured JSON with clear, actionable recommendations.
Each recommendation should include:
- Action title
- Detailed explanation
- Expected impact (% improvement estimate)
- Implementation steps
- Priority (Critical/High/Medium/Low)
`;
```

#### **2.2 AI Response Processing**

```typescript
// File: src/lib/ai-optimizer.ts

import Anthropic from '@anthropic-ai/sdk';

interface OptimizationRecommendation {
  id: string;
  category: 'search_terms' | 'bidding' | 'schedule' | 'geography' | 'device' | 'ad_copy' | 'keywords' | 'budget';
  title: string;
  description: string;
  reasoning: string;
  expectedImpact: {
    metric: string; // 'conversions', 'cost_per_conversion', 'ctr', etc.
    improvement: number; // percentage
  };
  priority: 'critical' | 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  implementationSteps: string[];
  data?: any; // Specific data for automation (keyword to add, bid amount, etc.)
}

export async function analyzeGoogleAdsData(adsData: any): Promise<OptimizationRecommendation[]> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: generateAnalysisPrompt(adsData),
      },
    ],
  });

  const analysis = JSON.parse(message.content[0].text);

  // Convert AI recommendations to structured format
  const recommendations = parseRecommendations(analysis);

  // Store in database
  await storeRecommendations(recommendations);

  return recommendations;
}
```

---

## 📋 Todo List System

### **Phase 3: Actionable Todo Management**

#### **3.1 Database Schema**

```sql
-- Store optimization recommendations
CREATE TABLE optimization_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  expected_impact JSONB NOT NULL,
  priority TEXT NOT NULL,
  effort TEXT NOT NULL,
  implementation_steps TEXT[] NOT NULL,
  automation_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'implemented', 'archived')),
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  implemented_at TIMESTAMPTZ,
  implemented_by TEXT,
  results JSONB,
  notes TEXT
);

-- Store Google Ads data snapshots
CREATE TABLE google_ads_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  snapshot_type TEXT NOT NULL, -- 'campaigns', 'search_terms', 'auction', etc.
  data JSONB NOT NULL,
  analysis_id UUID REFERENCES optimization_recommendations(id)
);

-- Track implementation history
CREATE TABLE optimization_implementations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  recommendation_id UUID REFERENCES optimization_recommendations(id),
  action_taken TEXT NOT NULL,
  method TEXT NOT NULL, -- 'manual', 'automated'
  results JSONB,
  success BOOLEAN
);
```

#### **3.2 UI Components**

**New Dashboard Page:** `/admin/dashboard/ads-optimizer`

```tsx
// File: src/app/admin/dashboard/ads-optimizer/page.tsx

'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { Play, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function AdsOptimizerPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const runAnalysis = async () => {
    setAnalyzing(true);

    // Trigger Playwright scraper
    const scrapedData = await fetch('/api/admin/google-ads/scrape', {
      method: 'POST',
    }).then(r => r.json());

    // Send to AI for analysis
    const aiAnalysis = await fetch('/api/admin/google-ads/analyze', {
      method: 'POST',
      body: JSON.stringify(scrapedData),
    }).then(r => r.json());

    setRecommendations(aiAnalysis.recommendations);
    setAnalyzing(false);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Google Ads Optimizer</h1>
        <p className="text-gray-600 mt-1">AI-powered campaign optimization recommendations</p>
      </div>

      {/* Run Analysis Button */}
      <div className="bg-gradient-to-r from-pink-600 to-blue-600 rounded-lg shadow-lg p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Ready to Optimize Your Campaigns?</h2>
            <p className="text-sm opacity-90">
              AI will analyze your Google Ads data and generate personalized optimization recommendations
            </p>
          </div>
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="bg-white text-pink-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            {analyzing ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {/* Analysis Progress */}
      {analyzing && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="font-medium">Collecting campaign data from Google Ads...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations by Category */}
      {recommendations.length > 0 && (
        <div className="space-y-6">
          <RecommendationsGrid recommendations={recommendations} />
        </div>
      )}
    </DashboardLayout>
  );
}
```

---

## 🎯 Recommendation Categories & Examples

### **Category 1: Search Terms to Add as Keywords**

**Example Recommendation:**
```json
{
  "category": "search_terms",
  "title": "Add High-Performing Search Term: 'mobile windshield repair near me'",
  "description": "This search term has generated 45 conversions with a 12.5% conversion rate and $35 cost per conversion, which is 40% better than campaign average.",
  "reasoning": "Currently triggering via broad match keyword 'windshield repair', but exact match would give us more control and likely improve Quality Score. Search volume is high (850 searches/month) and intent is clear.",
  "expectedImpact": {
    "metric": "conversions",
    "improvement": 15
  },
  "priority": "high",
  "effort": "low",
  "implementationSteps": [
    "Add keyword: [mobile windshield repair near me] (exact match)",
    "Set initial bid: $4.50 (10% above current CPC)",
    "Create mobile-specific ad copy emphasizing convenience",
    "Monitor for 7 days and adjust bid as needed"
  ],
  "automationData": {
    "action": "add_keyword",
    "keyword": "mobile windshield repair near me",
    "matchType": "exact",
    "bid": 4.50,
    "campaign": "Auto Glass - Search",
    "adGroup": "Windshield Repair"
  }
}
```

---

### **Category 2: Negative Keywords to Add**

**Example Recommendation:**
```json
{
  "category": "search_terms",
  "title": "Add Negative Keyword: 'DIY'",
  "description": "Search terms containing 'DIY' (e.g., 'DIY windshield repair kit') have generated 234 clicks with 0 conversions, wasting $287 in ad spend.",
  "reasoning": "DIY searchers are looking for self-service solutions, not professional services. These clicks will never convert and are depleting budget that could go to qualified traffic.",
  "expectedImpact": {
    "metric": "cost_per_conversion",
    "improvement": -8
  },
  "priority": "high",
  "effort": "low",
  "implementationSteps": [
    "Add 'DIY' as broad match negative keyword at campaign level",
    "Add related terms: 'do it yourself', 'diy kit', 'repair kit'",
    "Monitor search terms report for similar patterns"
  ],
  "automationData": {
    "action": "add_negative_keyword",
    "keywords": ["DIY", "do it yourself", "repair kit"],
    "matchType": "broad",
    "level": "campaign"
  }
}
```

---

### **Category 3: Bid Adjustments**

**Example Recommendation:**
```json
{
  "category": "bidding",
  "title": "Increase Bids During Peak Hours (8 AM - 10 AM)",
  "description": "8-10 AM weekdays shows 2.3x higher conversion rate (18.5% vs 8.1% average) with 25% lower cost per conversion.",
  "reasoning": "This time slot captures commuters discovering windshield damage on their way to work, with high purchase intent. Currently missing impression share due to low bids during this period.",
  "expectedImpact": {
    "metric": "conversions",
    "improvement": 22
  },
  "priority": "high",
  "effort": "low",
  "implementationSteps": [
    "Set bid adjustment: +40% for weekdays 8 AM - 10 AM",
    "Monitor impression share improvement",
    "Track conversion rate and CPA",
    "Adjust further if ROI justifies"
  ],
  "automationData": {
    "action": "set_ad_schedule_bid_adjustment",
    "days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "startHour": 8,
    "endHour": 10,
    "adjustment": 1.40
  }
}
```

---

### **Category 4: Geographic Adjustments**

**Example Recommendation:**
```json
{
  "category": "geography",
  "title": "Increase Bids in Phoenix Metro by 30%",
  "description": "Phoenix metro area shows 45% higher conversion rate than average with 20% lower CPA. Currently losing 35% impression share due to rank.",
  "reasoning": "Phoenix is your strongest market with high demand and low competition. Competitors are less active here, giving opportunity to capture more market share at favorable CPAs.",
  "expectedImpact": {
    "metric": "conversions",
    "improvement": 18
  },
  "priority": "high",
  "effort": "low",
  "implementationSteps": [
    "Set location bid adjustment: +30% for Phoenix metro",
    "Consider separate Phoenix-specific campaign for more control",
    "Create Phoenix-specific ad copy mentioning local service",
    "Monitor daily to ensure CPA stays profitable"
  ],
  "automationData": {
    "action": "set_location_bid_adjustment",
    "location": "Phoenix, AZ",
    "adjustment": 1.30
  }
}
```

---

### **Category 5: Ad Copy Recommendations**

**Example Recommendation:**
```json
{
  "category": "ad_copy",
  "title": "Create New Ad Emphasizing 'Same Day Service'",
  "description": "Analysis of winning ads shows 'same day' messaging drives 2.1x higher CTR and 35% more conversions.",
  "reasoning": "Your top-performing ad includes 'Same Day Repair' in headline and has 15.8% CTR vs 7.2% average. But only 1 of 6 active ads uses this messaging. Speed/convenience is clearly a strong motivator.",
  "expectedImpact": {
    "metric": "ctr",
    "improvement": 40
  },
  "priority": "high",
  "effort": "medium",
  "implementationSteps": [
    "Create 3 new ad variations with 'Same Day' in headline",
    "Test different descriptions: 'At Your Home/Office', 'Most Jobs Done in 1 Hour', 'Book Online in 60 Seconds'",
    "Pause lowest performing current ads after 2 weeks",
    "Monitor for ad strength improvement"
  ],
  "automationData": {
    "action": "create_ads",
    "adGroup": "Windshield Repair",
    "ads": [
      {
        "headlines": ["Same Day Windshield Repair", "Pink Auto Glass", "Mobile Service Available"],
        "descriptions": ["Expert repairs at your home or office. Most jobs done in 1 hour.", "Book online in 60 seconds. Lifetime warranty included."]
      }
    ]
  }
}
```

---

## 🤖 Automation Engine (Optional Phase 4)

### **Automated Implementation**

```typescript
// File: src/lib/google-ads-automation.ts

export async function implementRecommendation(recommendation: OptimizationRecommendation) {
  const { automationData } = recommendation;

  switch (automationData.action) {
    case 'add_keyword':
      return await addKeyword(automationData);

    case 'add_negative_keyword':
      return await addNegativeKeyword(automationData);

    case 'set_ad_schedule_bid_adjustment':
      return await setAdScheduleBidAdjustment(automationData);

    case 'set_location_bid_adjustment':
      return await setLocationBidAdjustment(automationData);

    case 'pause_keyword':
      return await pauseKeyword(automationData);

    case 'create_ads':
      return await createAds(automationData);

    case 'adjust_budget':
      return await adjustBudget(automationData);
  }
}

async function addKeyword(data: any) {
  // Use Google Ads API or Playwright to add keyword
  const googleAds = await GoogleAdsAPI.create();

  return await googleAds.keywords.create({
    campaign: data.campaign,
    adGroup: data.adGroup,
    keyword: data.keyword,
    matchType: data.matchType,
    bid: data.bid,
  });
}
```

---

## 📊 Dashboard UI Design

### **Ads Optimizer Page Layout**

```
┌─────────────────────────────────────────────────────────────┐
│  Google Ads Optimizer                                       │
│  AI-powered campaign optimization recommendations           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🚀 Ready to Optimize Your Campaigns?                       │
│  AI will analyze your Google Ads data and generate          │
│  personalized optimization recommendations                   │
│                                                              │
│                                          [Run Analysis]      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Campaign Health Score: 7.2/10  ⚡ 12 Optimizations Found  │
│                                                              │
│  Last Analysis: 2 hours ago                                 │
│  Next Scheduled: Tomorrow 9:00 AM                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🔥 Critical Priority (3)                                   │
│                                                              │
│  ❌ Add Negative: "DIY"                           [Approve] │
│     Wasting $287/month on non-converting clicks             │
│     Expected Savings: -$287/mo                              │
│                                                              │
│  📈 Increase Phoenix Bids +30%                    [Approve] │
│     Best market, losing 35% impression share                │
│     Expected Impact: +18% conversions                       │
│                                                              │
│  ⏰ Bid +40% During 8-10 AM                       [Approve] │
│     Peak conversion time (18.5% vs 8.1% avg)                │
│     Expected Impact: +22% conversions                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ⭐ High Priority (5)                                       │
│  [View All]                                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  📊 Medium Priority (4)                                     │
│  [View All]                                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Implementation Queue (2 approved, pending)                 │
│                                                              │
│  ✓ Add keyword: "mobile windshield repair"    [Implement] │
│  ✓ Pause low QS keyword: "glass fix"          [Implement] │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Implementation Phases

### **Phase 1: Data Collection (Week 1-2)**
- [ ] Set up Playwright Google Ads scraper
- [ ] Implement login/authentication
- [ ] Extract campaign overview data
- [ ] Extract search terms report
- [ ] Extract auction insights
- [ ] Extract ad schedule performance
- [ ] Extract geographic performance
- [ ] Extract device performance
- [ ] Extract keyword performance
- [ ] Extract ad performance
- [ ] Store data in database

### **Phase 2: AI Analysis (Week 3)**
- [ ] Set up Claude API integration
- [ ] Create analysis prompt templates
- [ ] Build recommendation parser
- [ ] Implement impact estimation
- [ ] Create priority scoring system
- [ ] Store recommendations in database

### **Phase 3: UI & Todo System (Week 4)**
- [ ] Build Ads Optimizer dashboard page
- [ ] Create recommendation cards UI
- [ ] Implement approval/rejection workflow
- [ ] Build implementation queue
- [ ] Add filtering and sorting
- [ ] Create detail view for each recommendation

### **Phase 4: Automation (Week 5-6) - OPTIONAL**
- [ ] Set up Google Ads API access
- [ ] Build automated keyword addition
- [ ] Build automated negative keyword addition
- [ ] Build automated bid adjustments
- [ ] Build automated ad creation
- [ ] Add safety checks and limits
- [ ] Implement rollback capabilities

---

## ⚙️ Configuration & Safety

### **Safety Guardrails**

```typescript
const SAFETY_LIMITS = {
  maxBidIncrease: 0.50, // Max 50% bid increase at once
  maxBidDecrease: 0.30, // Max 30% bid decrease at once
  maxDailyBudgetIncrease: 0.25, // Max 25% budget increase
  minQualityScoreForNewKeywords: 5, // Don't add keywords likely to have QS < 5
  maxNegativeKeywordsPerDay: 50, // Limit to prevent accidental over-negation
  requireApprovalFor: [
    'budget_changes',
    'campaign_pause',
    'large_bid_changes' // >20%
  ]
};
```

### **Approval Workflows**

- **Auto-approve:** Low-risk, low-effort items (adding negatives <$50 waste)
- **Requires approval:** Medium impact items
- **Requires + reason:** High impact items (budget changes, campaign structure)

---

## 📈 Expected Outcomes

### **Performance Improvements (30-90 days)**
- 📊 15-30% reduction in cost per conversion
- 📈 20-40% increase in conversion volume
- 🎯 10-20% improvement in Quality Scores
- 💰 25-35% improvement in ROAS
- 📉 40-60% reduction in wasted spend

### **Time Savings**
- ⏱️ Save 5-10 hours/week on manual analysis
- 🤖 Automated implementation of routine optimizations
- 📊 Instant insights vs. hours of spreadsheet work

---

## 🔐 Security & Access

### **Google Ads Authentication**
1. **Option A:** Service account with read-only access
2. **Option B:** User provides credentials (encrypted storage)
3. **Option C:** OAuth flow for secure access

### **API Rate Limiting**
- Scraping: Max 1 full analysis per day
- API calls: Respect Google Ads API limits
- Storage: 90-day data retention

---

## 📝 Next Steps

**To build this system, I need:**

1. **Google Ads Access**
   - Login credentials (for Playwright scraping), OR
   - API access (for Google Ads API integration)
   - Account ID / Customer ID

2. **Anthropic API Key**
   - For Claude AI analysis
   - Recommend setting up usage limits

3. **Priority Decision**
   - Start with data collection only? (no AI yet)
   - Start with AI analysis? (manual data import)
   - Build full system?

4. **Automation Preference**
   - Manual implementation only? (safest)
   - Semi-automated with approvals?
   - Fully automated for low-risk items?

**Recommended Approach:**
1. **Week 1:** Build Playwright scraper, verify data collection
2. **Week 2:** Integrate Claude AI, generate first recommendations
3. **Week 3:** Build UI and todo system
4. **Week 4:** Test and refine
5. **Week 5+:** Add automation if desired

**Full plan documented in:** `AI_GOOGLE_ADS_OPTIMIZER_PLAN.md`

**Ready to start when you provide Google Ads access!** 🚀
