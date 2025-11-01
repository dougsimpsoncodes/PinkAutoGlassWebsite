# In-Dashboard Data Quality Testing System
## Run Automated Tests from Admin Dashboard

---

## 🎯 Overview

Build a comprehensive testing system directly into the admin dashboard that allows you to:
- ✅ Run data quality checks on-demand with one click
- ✅ Verify tracking accuracy (server-side vs Google Ads)
- ✅ Monitor data integrity across all analytics tables
- ✅ View test results in real-time
- ✅ Track test history over time
- ✅ Schedule automated daily/weekly tests
- ✅ Get alerted to data quality issues

---

## 🏗️ System Architecture

```
Admin Dashboard UI
       ↓
  [Run Tests Button]
       ↓
  API Endpoint (/api/admin/run-tests)
       ↓
  Server-side Test Runner
       ↓
  Playwright Test Execution
       ↓
  Results Storage (Supabase)
       ↓
  Real-time Results Display
```

---

## 📊 Test Suites to Implement

### **Suite 1: Tracking Accuracy Tests** ⭐ HIGH PRIORITY
**What it tests:**
- UTM parameter capture accuracy
- Session tracking completeness
- Page view tracking
- Conversion tracking reliability

**Tests:**
1. ✅ UTM Parameters - Verify all UTM params captured correctly
2. ✅ Session Creation - Verify sessions created for all visits
3. ✅ Page View Tracking - Verify page views recorded
4. ✅ Conversion Attribution - Verify conversions linked to sessions
5. ✅ Multi-page Journey - Verify tracking persists across pages

**Expected Results:**
- 100% UTM capture rate
- 95%+ session creation rate
- 100% page view tracking
- 100% conversion attribution

---

### **Suite 2: Data Integrity Tests** ⭐ HIGH PRIORITY
**What it tests:**
- Database consistency
- No duplicate records
- No orphaned data
- Valid data types

**Tests:**
1. ✅ No Duplicate Sessions - Check for duplicate session_id
2. ✅ No Orphaned Page Views - All page views link to valid session
3. ✅ No Orphaned Conversions - All conversions link to valid session
4. ✅ Valid Timestamps - All timestamps in correct format
5. ✅ Required Fields - No null values in required fields
6. ✅ Data Consistency - Entry/exit pages match page view records

**Expected Results:**
- 0 duplicates
- 0 orphaned records
- 100% valid data

---

### **Suite 3: Google Ads Comparison** ⭐ MEDIUM PRIORITY
**What it tests:**
- Server-side data vs Google Ads reports
- Click-to-session conversion rate
- Conversion tracking parity

**Tests:**
1. ✅ Click-to-Session Ratio - Should be 85-95%
2. ✅ Conversion Match - Server vs Ads should match 95%+
3. ✅ Campaign Attribution - Campaign names should match 100%
4. ✅ Date Alignment - Data grouped by same dates

**Expected Results:**
- 85-95% click-to-session
- 95-100% conversion match
- 100% attribution accuracy

---

### **Suite 4: Performance Tests** ⭐ LOW PRIORITY
**What it tests:**
- Page load times
- Tracking script performance
- API response times

**Tests:**
1. ✅ Page Load Speed - Pages load in <3 seconds
2. ✅ Tracking Script Load - Script loads in <500ms
3. ✅ API Response Time - Analytics API responds in <1s

---

## 🎨 UI Design: Data Quality Page

### **New Admin Page:** `/admin/dashboard/data-quality`

```
┌─────────────────────────────────────────────────────────┐
│  Data Quality & Testing                                 │
│  Run automated tests to verify tracking accuracy        │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Quick Actions                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Run All Tests│  │ Run Tracking │  │ View History │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Test Suites                                             │
│                                                          │
│  ✅ Tracking Accuracy Tests      [Run] [Last: 2h ago]  │
│     └─ 5 tests · All passing · 100% success rate        │
│                                                          │
│  ✅ Data Integrity Tests         [Run] [Last: 5h ago]  │
│     └─ 6 tests · All passing · 100% success rate        │
│                                                          │
│  ⚠️  Google Ads Comparison       [Run] [Last: 1d ago]  │
│     └─ 4 tests · 1 warning · 90% click-to-session      │
│                                                          │
│  ✅ Performance Tests            [Run] [Last: 3h ago]  │
│     └─ 3 tests · All passing · Avg load: 1.2s          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Current Test Run                                        │
│  ⏳ Running: Tracking Accuracy Tests                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 60%  │
│                                                          │
│  ✅ UTM Parameter Test - PASSED                         │
│  ✅ Session Creation Test - PASSED                      │
│  ✅ Page View Tracking - PASSED                         │
│  ⏳ Conversion Attribution - RUNNING...                 │
│  ⏸  Multi-page Journey - PENDING                        │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Test Results Summary (Last 7 Days)                     │
│                                                          │
│  📊 Total Test Runs: 42                                 │
│  ✅ Passing Rate: 98.5%                                 │
│  ⚠️  Warnings: 3                                        │
│  ❌ Failures: 1                                         │
│                                                          │
│  [View Detailed History]                                │
└──────────────────────────────────────────────────────────┘
```

---

## 🛠️ Implementation Plan

### **Phase 1: Core Infrastructure** (Build First)

#### **1.1 Database Schema**
Create new table to store test results:

```sql
-- File: supabase/migrations/create_test_results_table.sql

CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  suite_name TEXT NOT NULL,
  test_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'warning', 'running')),
  duration_ms INTEGER,
  error_message TEXT,
  details JSONB,
  metadata JSONB
);

-- Index for quick queries
CREATE INDEX idx_test_results_created_at ON test_results(created_at DESC);
CREATE INDEX idx_test_results_suite ON test_results(suite_name, created_at DESC);

-- Store test run metadata
CREATE TABLE IF NOT EXISTS test_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  suite_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  total_tests INTEGER,
  passed_tests INTEGER,
  failed_tests INTEGER,
  warnings INTEGER,
  duration_ms INTEGER,
  triggered_by TEXT
);
```

#### **1.2 API Endpoint: Run Tests**
```typescript
// File: src/app/api/admin/run-tests/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { isAuthenticated } from '@/lib/auth';

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { suites } = await req.json();
  // suites: ['tracking', 'integrity', 'ads', 'performance'] or 'all'

  // Create test run record
  const testRunId = await createTestRun(suites);

  // Trigger Playwright tests in background
  runTestsInBackground(testRunId, suites);

  return NextResponse.json({
    ok: true,
    testRunId,
    message: 'Tests started',
  });
}
```

#### **1.3 API Endpoint: Get Test Results**
```typescript
// File: src/app/api/admin/test-results/route.ts

export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const runId = searchParams.get('runId');
  const suite = searchParams.get('suite');
  const limit = parseInt(searchParams.get('limit') || '50');

  let query = supabase.from('test_results').select('*');

  if (runId) query = query.eq('run_id', runId);
  if (suite) query = query.eq('suite_name', suite);

  query = query.order('created_at', { ascending: false }).limit(limit);

  const { data, error } = await query;

  return NextResponse.json({ ok: true, data });
}
```

#### **1.4 Test Runner Service**
```typescript
// File: src/lib/test-runner.ts

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function runTestSuite(suite: string, runId: string) {
  const suiteMap = {
    tracking: 'tests/data-quality/tracking-accuracy.spec.js',
    integrity: 'tests/data-quality/data-integrity.spec.js',
    ads: 'tests/data-quality/google-ads-comparison.spec.js',
    performance: 'tests/data-quality/performance.spec.js',
  };

  const testFile = suiteMap[suite];

  try {
    // Run Playwright tests
    const { stdout, stderr } = await execAsync(
      `npx playwright test ${testFile} --reporter=json`
    );

    // Parse results
    const results = JSON.parse(stdout);

    // Store results in database
    await storeTestResults(runId, suite, results);

    return { success: true, results };
  } catch (error) {
    console.error('Test execution failed:', error);
    await storeTestFailure(runId, suite, error);
    return { success: false, error };
  }
}
```

---

### **Phase 2: Test Suites Implementation**

#### **2.1 Tracking Accuracy Tests**
```javascript
// File: tests/data-quality/tracking-accuracy.spec.js

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

test.describe('Tracking Accuracy Tests', () => {
  test('should capture UTM parameters correctly', async ({ page }) => {
    const testId = Date.now();
    const utmParams = {
      utm_source: `test_${testId}`,
      utm_medium: 'cpc',
      utm_campaign: `campaign_${testId}`,
      utm_term: 'test_keyword',
      utm_content: 'test_ad',
    };

    // Visit with UTM params
    const url = `http://localhost:3000/?${new URLSearchParams(utmParams).toString()}`;
    await page.goto(url);
    await page.waitForTimeout(2000);

    // Verify in database
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('utm_source', `test_${testId}`)
      .order('started_at', { ascending: false })
      .limit(1);

    expect(error).toBeNull();
    expect(data.length).toBe(1);
    expect(data[0].utm_source).toBe(`test_${testId}`);
    expect(data[0].utm_medium).toBe('cpc');
    expect(data[0].utm_campaign).toBe(`campaign_${testId}`);
    expect(data[0].utm_term).toBe('test_keyword');
    expect(data[0].utm_content).toBe('test_ad');
  });

  test('should track page views correctly', async ({ page }) => {
    const testId = Date.now();

    // Visit multiple pages
    await page.goto(`http://localhost:3000/?test_id=${testId}`);
    await page.waitForTimeout(1000);

    await page.goto(`http://localhost:3000/about?test_id=${testId}`);
    await page.waitForTimeout(1000);

    await page.goto(`http://localhost:3000/services?test_id=${testId}`);
    await page.waitForTimeout(2000);

    // Verify page views recorded
    const { data: pageViews } = await supabase
      .from('page_views')
      .select('*')
      .gte('created_at', new Date(Date.now() - 10000).toISOString())
      .order('created_at', { ascending: true });

    expect(pageViews.length).toBeGreaterThanOrEqual(3);
  });

  test('should attribute conversions to correct session', async ({ page }) => {
    const testId = Date.now();

    // Start session with UTM
    await page.goto(`http://localhost:3000/?utm_source=test_${testId}`);
    await page.waitForTimeout(1000);

    // Trigger conversion
    await page.goto('http://localhost:3000/book');
    const phoneButton = page.locator('a[href^="tel:"]').first();
    await phoneButton.click();
    await page.waitForTimeout(2000);

    // Verify conversion has correct attribution
    const { data: conversions } = await supabase
      .from('conversion_events')
      .select('*, user_sessions(*)')
      .eq('utm_source', `test_${testId}`)
      .order('created_at', { ascending: false })
      .limit(1);

    expect(conversions.length).toBe(1);
    expect(conversions[0].utm_source).toBe(`test_${testId}`);
    expect(conversions[0].user_sessions).toBeDefined();
  });

  test('should persist tracking across navigation', async ({ page }) => {
    const testId = Date.now();

    // Visit with UTM
    await page.goto(`http://localhost:3000/?utm_source=test_${testId}&utm_campaign=persistence_test`);
    await page.waitForTimeout(1000);

    // Navigate to multiple pages
    await page.click('text=Services');
    await page.waitForTimeout(1000);

    await page.click('text=Contact');
    await page.waitForTimeout(1000);

    // Check that all page views in this session have UTM params
    const { data: session } = await supabase
      .from('user_sessions')
      .select('session_id, utm_source, utm_campaign')
      .eq('utm_source', `test_${testId}`)
      .order('started_at', { ascending: false })
      .limit(1);

    expect(session.length).toBe(1);
    expect(session[0].utm_campaign).toBe('persistence_test');
  });
});
```

#### **2.2 Data Integrity Tests**
```javascript
// File: tests/data-quality/data-integrity.spec.js

test.describe('Data Integrity Tests', () => {
  test('should have no duplicate session IDs', async () => {
    const { data: duplicates } = await supabase.rpc('find_duplicate_sessions');
    expect(duplicates.length).toBe(0);
  });

  test('should have no orphaned page views', async () => {
    const { data: orphaned } = await supabase
      .from('page_views')
      .select('id, session_id, user_sessions(session_id)')
      .is('user_sessions', null)
      .limit(100);

    expect(orphaned.length).toBe(0);
  });

  test('should have valid timestamps', async () => {
    const { data: invalidTimestamps } = await supabase
      .from('user_sessions')
      .select('*')
      .or('started_at.is.null,ended_at.lt.started_at')
      .limit(10);

    expect(invalidTimestamps.length).toBe(0);
  });

  test('should have consistent entry/exit pages', async () => {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('session_id, entry_page, exit_page')
      .gte('started_at', new Date(Date.now() - 24*60*60*1000).toISOString())
      .limit(100);

    for (const session of sessions) {
      if (session.entry_page) {
        expect(session.entry_page).toMatch(/^\//); // Should start with /
      }
      if (session.exit_page) {
        expect(session.exit_page).toMatch(/^\//);
      }
    }
  });
});
```

#### **2.3 Google Ads Comparison Tests**
```javascript
// File: tests/data-quality/google-ads-comparison.spec.js

test.describe('Google Ads Comparison', () => {
  test('should have acceptable click-to-session ratio', async () => {
    // This test requires Google Ads data to be available
    // For now, we'll simulate with known data

    const googleAdsClicks = 100; // From CSV or API

    const { count: serverSessions } = await supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('utm_source', 'google')
      .eq('utm_medium', 'cpc')
      .gte('started_at', new Date(Date.now() - 7*24*60*60*1000).toISOString());

    const ratio = serverSessions / googleAdsClicks;

    expect(ratio).toBeGreaterThan(0.80); // At least 80% of clicks tracked
    expect(ratio).toBeLessThan(1.05); // No more than 5% over-tracking
  });

  test('should match conversion counts', async () => {
    const googleAdsConversions = 45; // From CSV or API

    const { count: serverConversions } = await supabase
      .from('conversion_events')
      .select('*', { count: 'exact', head: true })
      .eq('utm_source', 'google')
      .eq('utm_medium', 'cpc')
      .gte('created_at', new Date(Date.now() - 7*24*60*60*1000).toISOString());

    const matchPercentage = (serverConversions / googleAdsConversions) * 100;

    expect(matchPercentage).toBeGreaterThan(90); // At least 90% match
  });
});
```

---

### **Phase 3: Dashboard UI**

#### **3.1 Data Quality Page Component**
```typescript
// File: src/app/admin/dashboard/data-quality/page.tsx

'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { Play, RefreshCw, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function DataQualityPage() {
  const [testRuns, setTestRuns] = useState([]);
  const [currentRun, setCurrentRun] = useState(null);
  const [running, setRunning] = useState(false);

  const runTests = async (suite: string) => {
    setRunning(true);

    const res = await fetch('/api/admin/run-tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suites: suite === 'all' ? ['tracking', 'integrity', 'ads', 'performance'] : [suite] }),
    });

    const { testRunId } = await res.json();

    // Poll for results
    pollTestResults(testRunId);
  };

  const pollTestResults = async (runId: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/admin/test-results?runId=${runId}`);
      const { data } = await res.json();

      setCurrentRun(data);

      // Check if all tests completed
      const allCompleted = data.every((test: any) => test.status !== 'running');
      if (allCompleted) {
        clearInterval(interval);
        setRunning(false);
      }
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Data Quality & Testing</h1>
        <p className="text-gray-600 mt-1">Run automated tests to verify tracking accuracy</p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <button
            onClick={() => runTests('all')}
            disabled={running}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-blue-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            <Play className="w-5 h-5" />
            Run All Tests
          </button>

          <button
            onClick={() => runTests('tracking')}
            disabled={running}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Run Tracking Tests
          </button>

          <button
            onClick={() => fetchTestHistory()}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-5 h-5" />
            View History
          </button>
        </div>
      </div>

      {/* Test Suites Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <TestSuiteCard
          name="Tracking Accuracy"
          tests={5}
          lastRun="2 hours ago"
          status="passed"
          successRate={100}
          onRun={() => runTests('tracking')}
        />
        <TestSuiteCard
          name="Data Integrity"
          tests={6}
          lastRun="5 hours ago"
          status="passed"
          successRate={100}
          onRun={() => runTests('integrity')}
        />
        <TestSuiteCard
          name="Google Ads Comparison"
          tests={4}
          lastRun="1 day ago"
          status="warning"
          successRate={90}
          onRun={() => runTests('ads')}
        />
        <TestSuiteCard
          name="Performance"
          tests={3}
          lastRun="3 hours ago"
          status="passed"
          successRate={100}
          onRun={() => runTests('performance')}
        />
      </div>

      {/* Current Test Run */}
      {currentRun && (
        <CurrentTestRun results={currentRun} running={running} />
      )}

      {/* Test History Summary */}
      <TestHistorySummary />
    </DashboardLayout>
  );
}
```

---

## 🚀 Implementation Timeline

### **Week 1: Core Infrastructure**
- [ ] Day 1-2: Database schema + migrations
- [ ] Day 2-3: API endpoints (run-tests, test-results)
- [ ] Day 3-4: Test runner service
- [ ] Day 4-5: Basic UI page

### **Week 2: Test Suites**
- [ ] Day 1-2: Tracking accuracy tests
- [ ] Day 3: Data integrity tests
- [ ] Day 4: Google Ads comparison tests
- [ ] Day 5: Performance tests

### **Week 3: UI & Polish**
- [ ] Day 1-2: Complete data quality page UI
- [ ] Day 3: Real-time results display
- [ ] Day 4: Test history tracking
- [ ] Day 5: Alerts and notifications

---

## 📋 Features Checklist

### **Must Have (Phase 1):**
- [ ] Database tables for test results
- [ ] API to trigger tests
- [ ] API to fetch results
- [ ] Basic tracking accuracy tests
- [ ] Data integrity tests
- [ ] Simple UI to run tests and view results

### **Should Have (Phase 2):**
- [ ] Google Ads comparison tests
- [ ] Real-time progress display
- [ ] Test history tracking
- [ ] Export test results as PDF/CSV
- [ ] Performance tests

### **Nice to Have (Phase 3):**
- [ ] Scheduled automated tests (daily/weekly)
- [ ] Email alerts for test failures
- [ ] Slack/Discord notifications
- [ ] Trend analysis (data quality over time)
- [ ] Automated remediation suggestions

---

## 🎯 Success Metrics

**System will be successful when:**
- ✅ You can run all tests with one click
- ✅ Tests complete in < 5 minutes
- ✅ Results displayed in real-time
- ✅ Test history tracked for 90 days
- ✅ 95%+ tests passing at all times
- ✅ Alerts sent for any failures within 5 minutes

---

## 💡 Next Steps

1. **Approve this plan** - Confirm approach looks good
2. **Prioritize features** - What to build first?
3. **Set timeline** - When do you need this operational?

**Recommended: Start with Phase 1 (core infrastructure + basic tests)**
- Build database schema
- Create test runner API
- Implement 3-5 critical tests
- Build simple UI to trigger and view results

**This gives you immediate value while we build out advanced features.**

Ready to start implementation?
