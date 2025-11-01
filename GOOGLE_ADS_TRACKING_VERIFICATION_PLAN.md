# Google Ads vs Server-Side Tracking Verification Plan

## 🎯 Objective
Compare Google Ads campaign data with server-side analytics to ensure tracking accuracy and identify any discrepancies in:
- Traffic attribution
- Click tracking
- Conversion tracking
- UTM parameter capture

---

## 📊 Metrics to Compare

### **1. Traffic Metrics**
| Metric | Google Ads | Server-Side | Expected Match |
|--------|------------|-------------|----------------|
| **Clicks** | Ad clicks from Google Ads | Sessions with `utm_source=google` AND `utm_medium=cpc` | ~90-95% (some drop-off expected) |
| **Impressions** | Ad impressions | N/A (can't track server-side) | N/A |
| **CTR** | Click-through rate | N/A | N/A |

### **2. Conversion Metrics**
| Metric | Google Ads | Server-Side | Expected Match |
|--------|------------|-------------|----------------|
| **Conversions** | Tracked conversions in Ads | Conversions with `utm_source=google` | 100% (should match exactly) |
| **Conversion Rate** | Conv / Clicks | Conv / Sessions (utm_source=google) | Similar (~±5%) |
| **Cost per Conversion** | Spend / Conversions | N/A | N/A |

### **3. Attribution Metrics**
| Metric | Google Ads | Server-Side | Expected Match |
|--------|------------|-------------|----------------|
| **Campaign Name** | Campaign in Ads | `utm_campaign` in sessions | 100% |
| **Ad Group** | Ad Group in Ads | Not tracked yet | N/A |
| **Keyword** | Keyword triggered | Not tracked yet | N/A |

---

## 🔍 Verification Approach

### **Option 1: Google Ads Web Interface (Manual + Playwright)**
**Steps:**
1. Use Playwright to navigate to Google Ads interface
2. Log in (if credentials available)
3. Navigate to campaign reports
4. Extract data from UI
5. Compare with server-side database

**Pros:**
- No API setup needed
- Can see exact UI that client sees
- Good for visual verification

**Cons:**
- Requires login credentials
- UI may change
- Slower than API

---

### **Option 2: Google Ads CSV Export (Recommended)**
**Steps:**
1. Client exports Google Ads data as CSV for specific date range
2. We parse CSV file with Node.js/Playwright
3. Query server-side database for same date range
4. Generate comparison report

**Pros:**
- No authentication needed
- Faster processing
- Reliable data format
- Can be automated

**Cons:**
- Requires manual export initially
- One-time snapshot (not real-time)

---

### **Option 3: Google Ads API (Most Robust)**
**Steps:**
1. Set up Google Ads API access
2. Use Playwright + API calls to fetch campaign data
3. Query server-side analytics
4. Automated comparison and reporting

**Pros:**
- Fully automated
- Real-time data
- Can run repeatedly
- Best for ongoing monitoring

**Cons:**
- Requires API setup and OAuth
- More complex implementation
- Need Google Ads developer token

---

## 🛠️ Recommended Implementation Plan

### **Phase 1: Manual CSV Comparison (Quick Start)**

#### **Step 1: Export Google Ads Data**
Client exports CSV with these columns:
- Campaign
- Date
- Clicks
- Impressions
- Conversions
- Cost
- CTR
- Conversion Rate

**Date Range:** Last 30 days (or specific campaign period)

#### **Step 2: Create Comparison Script**
```javascript
// File: scripts/compare-google-ads.js

const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { createClient } = require('@supabase/supabase-js');

async function compareGoogleAds() {
  // 1. Parse Google Ads CSV
  const csvData = fs.readFileSync('google-ads-export.csv');
  const googleAdsData = parse(csvData, { columns: true });

  // 2. Query server-side analytics
  const serverData = await queryServerAnalytics(startDate, endDate);

  // 3. Compare metrics
  const comparison = compareMetrics(googleAdsData, serverData);

  // 4. Generate report
  generateReport(comparison);
}
```

#### **Step 3: Query Server-Side Analytics**
```sql
-- Get Google Ads traffic
SELECT
  DATE(started_at) as date,
  utm_campaign,
  COUNT(DISTINCT session_id) as sessions,
  COUNT(DISTINCT visitor_id) as unique_visitors,
  SUM(page_views_count) as page_views
FROM user_sessions
WHERE utm_source = 'google'
  AND utm_medium = 'cpc'
  AND started_at >= '2025-01-01'
  AND started_at < '2025-02-01'
GROUP BY DATE(started_at), utm_campaign
ORDER BY date DESC;

-- Get Google Ads conversions
SELECT
  DATE(created_at) as date,
  utm_campaign,
  event_type,
  COUNT(*) as conversions
FROM conversion_events
WHERE utm_source = 'google'
  AND utm_medium = 'cpc'
  AND created_at >= '2025-01-01'
  AND created_at < '2025-02-01'
GROUP BY DATE(created_at), utm_campaign, event_type
ORDER BY date DESC;
```

#### **Step 4: Comparison Logic**
```javascript
function compareMetrics(googleAds, serverSide) {
  const discrepancies = [];

  // Compare click-to-session ratio
  const clickToSessionRatio = serverSide.sessions / googleAds.clicks;
  if (clickToSessionRatio < 0.85 || clickToSessionRatio > 1.05) {
    discrepancies.push({
      metric: 'Click-to-Session Ratio',
      googleAds: googleAds.clicks,
      serverSide: serverSide.sessions,
      ratio: clickToSessionRatio,
      status: 'WARNING',
      message: 'Significant drop-off between ad clicks and tracked sessions'
    });
  }

  // Compare conversions (should match exactly)
  const conversionMatch = serverSide.conversions / googleAds.conversions;
  if (Math.abs(conversionMatch - 1.0) > 0.1) {
    discrepancies.push({
      metric: 'Conversions',
      googleAds: googleAds.conversions,
      serverSide: serverSide.conversions,
      ratio: conversionMatch,
      status: 'ERROR',
      message: 'Conversion tracking mismatch - investigate tracking setup'
    });
  }

  return discrepancies;
}
```

---

### **Phase 2: Playwright Automated Testing**

#### **Test 1: Verify UTM Parameters**
```javascript
// tests/google-ads-tracking.spec.js

test('should track Google Ads clicks with correct UTM parameters', async ({ page }) => {
  // Simulate Google Ads click with UTM parameters
  const utmParams = {
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'test_campaign',
    utm_term: 'auto_glass_repair',
    utm_content: 'ad_variant_a'
  };

  const url = `http://localhost:3000/?${new URLSearchParams(utmParams).toString()}`;

  // Visit with UTM params
  await page.goto(url);

  // Wait for tracking
  await page.waitForTimeout(2000);

  // Verify session was created with correct UTM params
  const { data: sessions } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('utm_source', 'google')
    .eq('utm_medium', 'cpc')
    .eq('utm_campaign', 'test_campaign')
    .order('started_at', { ascending: false })
    .limit(1);

  expect(sessions.length).toBe(1);
  expect(sessions[0].utm_term).toBe('auto_glass_repair');
  expect(sessions[0].utm_content).toBe('ad_variant_a');
});
```

#### **Test 2: Verify Conversion Attribution**
```javascript
test('should attribute conversions to Google Ads correctly', async ({ page }) => {
  // Visit with Google Ads UTM
  await page.goto('http://localhost:3000/?utm_source=google&utm_medium=cpc&utm_campaign=test_campaign');

  // Trigger conversion
  await page.goto('http://localhost:3000/book');
  const phoneButton = page.locator('a[href^="tel:"]').first();
  await phoneButton.click();

  await page.waitForTimeout(2000);

  // Verify conversion has Google Ads attribution
  const { data: conversions } = await supabase
    .from('conversion_events')
    .select('*')
    .eq('utm_source', 'google')
    .eq('utm_medium', 'cpc')
    .eq('utm_campaign', 'test_campaign')
    .order('created_at', { ascending: false })
    .limit(1);

  expect(conversions.length).toBe(1);
  expect(conversions[0].event_type).toBe('phone_click');
});
```

#### **Test 3: Drop-off Analysis**
```javascript
test('should measure click-to-session drop-off rate', async ({ page, context }) => {
  const testCampaign = 'dropoff_test_' + Date.now();

  // Simulate 100 ad clicks
  const sessions = [];
  for (let i = 0; i < 100; i++) {
    const newPage = await context.newPage();
    await newPage.goto(`http://localhost:3000/?utm_source=google&utm_medium=cpc&utm_campaign=${testCampaign}`);
    await newPage.waitForTimeout(500);
    await newPage.close();
  }

  await page.waitForTimeout(3000);

  // Count tracked sessions
  const { count } = await supabase
    .from('user_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('utm_campaign', testCampaign);

  const dropOffRate = ((100 - count) / 100) * 100;

  console.log(`Drop-off rate: ${dropOffRate}%`);
  console.log(`Expected: 5-15% (industry standard)`);

  expect(dropOffRate).toBeLessThan(20); // Alert if >20% drop-off
});
```

---

## 📋 Verification Checklist

### **Pre-Verification:**
- [ ] Identify active Google Ads campaigns
- [ ] Determine date range for comparison (suggest: last 30 days)
- [ ] Confirm UTM parameter structure used in campaigns
- [ ] Export Google Ads data (CSV or screenshots)

### **Tracking Setup Verification:**
- [ ] Verify UTM parameters are set correctly in all ads
- [ ] Confirm `utm_source=google` and `utm_medium=cpc` are used
- [ ] Check campaign names match between Ads and tracking
- [ ] Verify tracking script is on all landing pages

### **Data Comparison:**
- [ ] Compare total clicks vs total sessions (utm_source=google)
- [ ] Compare conversions: Ads vs Server-side
- [ ] Verify campaign attribution matches
- [ ] Check conversion types match (phone, text, form)
- [ ] Analyze drop-off rate (clicks → sessions)

### **Quality Checks:**
- [ ] Verify no duplicate conversion tracking
- [ ] Check for sessions without UTM params (direct traffic misattribution)
- [ ] Confirm timestamp alignment (timezone issues)
- [ ] Validate conversion values/revenue if tracked

---

## 🚨 Common Discrepancies & Causes

### **Clicks > Sessions (Normal: 5-15% drop-off)**
**Causes:**
- Users close page before it loads (bounce)
- Ad blockers prevent tracking script
- JavaScript disabled
- Network errors
- Multiple clicks same user

**Action:** If >20% drop-off, investigate page load speed

### **Conversions Mismatch**
**Causes:**
- Conversion tracking not implemented on all pages
- UTM parameters lost during navigation
- Cookie/session expiration
- Tracking script errors

**Action:** Review conversion tracking implementation

### **Attribution Issues**
**Causes:**
- UTM parameters not set in ads
- UTM parameters stripped by redirects
- Case sensitivity (Google vs google)
- Special characters in campaign names

**Action:** Audit all ad URLs for correct UTM structure

---

## 🎯 Expected Outcomes

### **Healthy Tracking System:**
```
✅ Click-to-Session Ratio: 85-95%
✅ Conversion Match: 95-100%
✅ Campaign Attribution: 100%
✅ UTM Parameter Capture: 100%
```

### **Action Items if Discrepancies Found:**
1. **Low Click-to-Session (<80%):**
   - Audit ad landing page performance
   - Check tracking script placement
   - Test with different browsers/devices

2. **Conversion Mismatch (>10% difference):**
   - Verify conversion tracking on all pages
   - Check UTM persistence through user journey
   - Review cookie/session storage

3. **Attribution Issues:**
   - Standardize UTM parameter format
   - Add UTM parameters to all ad variants
   - Implement UTM override protection

---

## 📊 Deliverables

### **1. Tracking Accuracy Report**
```markdown
# Google Ads Tracking Accuracy Report

## Summary
- Date Range: [Start] - [End]
- Campaigns Analyzed: [Count]
- Overall Accuracy: [Percentage]

## Metrics Comparison
| Metric | Google Ads | Server-Side | Match % | Status |
|--------|------------|-------------|---------|--------|
| Clicks | 1,234 | 1,156 | 93.7% | ✅ GOOD |
| Conversions | 45 | 43 | 95.6% | ✅ GOOD |
| Campaign Attribution | - | - | 100% | ✅ GOOD |

## Discrepancies Found
[List any issues]

## Recommendations
[Action items]
```

### **2. Automated Test Suite**
- Playwright tests for UTM tracking
- Conversion attribution tests
- Drop-off rate monitoring
- Scheduled daily runs

### **3. Monitoring Dashboard**
- Real-time Google Ads traffic monitoring
- Conversion attribution breakdown
- Alert system for tracking issues

---

## 🚀 Implementation Steps

### **Step 1: Get Google Ads Data** (Choose one)
- **Option A:** Client exports CSV → we parse
- **Option B:** Use Playwright to scrape Ads interface
- **Option C:** Set up Google Ads API integration

### **Step 2: Build Comparison Script**
```bash
# Create script
touch scripts/compare-google-ads.js

# Run comparison
node scripts/compare-google-ads.js --start-date 2025-01-01 --end-date 2025-01-31
```

### **Step 3: Create Playwright Tests**
```bash
# Create test file
touch tests/google-ads-tracking.spec.js

# Run tests
npx playwright test tests/google-ads-tracking.spec.js
```

### **Step 4: Generate Report**
- Create comparison report (markdown or PDF)
- Identify discrepancies
- Provide actionable recommendations

---

## ⏱️ Timeline Estimate

- **Phase 1 (CSV Comparison):** 2-3 hours
  - Get CSV export: 15 min
  - Build comparison script: 1 hour
  - Run analysis: 30 min
  - Generate report: 30 min

- **Phase 2 (Playwright Tests):** 2-3 hours
  - Write test suite: 1.5 hours
  - Run tests: 30 min
  - Document findings: 30 min

- **Total:** 4-6 hours for complete verification

---

## 📝 Next Steps

**To proceed, I need:**
1. **Google Ads access method** - Which option do you prefer?
   - Export CSV (fastest)
   - Provide login credentials for Playwright scraping
   - Set up API access

2. **Date range** - What period should we analyze?
   - Last 7 days
   - Last 30 days
   - Specific campaign dates

3. **Campaign details** - Which campaigns are active?
   - Campaign names
   - Expected traffic volume
   - Conversion goals set up in Ads

**Please advise on access method and I'll proceed with implementation.**
