const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // Slow down for better visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  const screenshotDir = '/Users/dougsimpson/Projects/pinkautoglasswebsite/tmp/gsc-analysis';

  console.log('🔍 Starting Google Search Console analysis...\n');

  try {
    // Navigate to Google Search Console
    console.log('1. Navigating to Google Search Console...');
    await page.goto('https://search.google.com/search-console', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    // Wait for manual login if needed
    console.log('⏳ Waiting for login and property selection...');
    console.log('   Please log in and select "pinkautoglass.com" property if needed');
    console.log('   The script will continue automatically once the overview page loads\n');

    // Wait for either the property selector or the overview page
    try {
      await page.waitForSelector('body', { timeout: 10000 });
      console.log('   Page body loaded, waiting for GSC interface...');

      // Wait for any sign that GSC has loaded
      await page.waitForFunction(() => {
        const bodyText = document.body.textContent || '';
        return bodyText.includes('Search Console') ||
               bodyText.includes('Performance') ||
               document.querySelector('[role="main"]') !== null ||
               document.querySelector('nav') !== null;
      }, { timeout: 180000 });

      console.log('   ✅ GSC interface detected');
    } catch (e) {
      console.log('   ⚠️ Timeout waiting for GSC. Taking screenshot for debugging...');
      await page.screenshot({
        path: path.join(screenshotDir, '00-timeout-debug.png'),
        fullPage: true
      });
      throw e;
    }

    // Additional wait to ensure page is fully loaded
    await page.waitForTimeout(5000);

    // Try to select pinkautoglass.com property if property selector is visible
    try {
      const propertySelector = await page.locator('text=pinkautoglass.com').first();
      if (await propertySelector.isVisible({ timeout: 5000 })) {
        console.log('📍 Selecting pinkautoglass.com property...');
        await propertySelector.click();
        await page.waitForTimeout(5000);
      }
    } catch (e) {
      console.log('   (Property already selected or selector not found)');
    }

    // ========================================
    // 2. OVERVIEW METRICS
    // ========================================
    console.log('\n2. Capturing Overview Metrics...');

    // Navigate to Overview if not already there
    try {
      const overviewLink = page.locator('text=Overview').first();
      if (await overviewLink.isVisible({ timeout: 5000 })) {
        await overviewLink.click();
        await page.waitForTimeout(5000);
      }
    } catch (e) {
      console.log('   (Already on Overview or navigation not needed)');
    }

    await page.screenshot({
      path: path.join(screenshotDir, '01-overview-metrics.png'),
      fullPage: true
    });
    console.log('   ✅ Screenshot saved: 01-overview-metrics.png');

    // ========================================
    // 3. PERFORMANCE ANALYSIS
    // ========================================
    console.log('\n3. Navigating to Performance section...');

    // Click Performance in sidebar
    try {
      // Try multiple selectors for Performance link
      let clicked = false;

      // Try clicking by text content
      const performanceSelectors = [
        'a:has-text("Performance")',
        'button:has-text("Performance")',
        '[href*="performance"]',
        'nav a:has-text("Performance")',
        '[role="navigation"] a:has-text("Performance")'
      ];

      for (const selector of performanceSelectors) {
        try {
          const link = page.locator(selector).first();
          if (await link.isVisible({ timeout: 5000 })) {
            await link.click();
            clicked = true;
            console.log(`   ✅ Clicked Performance using selector: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!clicked) {
        console.log('   ⚠️ Could not find Performance link, may already be on Performance page');
      }

      await page.waitForTimeout(5000);
    } catch (e) {
      console.log('   ⚠️ Error navigating to Performance:', e.message);
    }

    // Set date range to last 3 months
    console.log('   Setting date range to Last 3 months...');
    try {
      const dateButton = page.locator('[aria-label*="date"], button:has-text("Date")').first();
      await dateButton.click({ timeout: 5000 });
      await page.waitForTimeout(1000);

      const threeMonths = page.locator('text=Last 3 months').first();
      await threeMonths.click({ timeout: 5000 });
      await page.waitForTimeout(5000);
    } catch (e) {
      console.log('   (Date range selector not found, using default)');
    }

    await page.screenshot({
      path: path.join(screenshotDir, '02-performance-overview.png'),
      fullPage: true
    });
    console.log('   ✅ Screenshot saved: 02-performance-overview.png');

    // Extract performance metrics
    console.log('\n   Extracting performance metrics...');
    const metrics = await page.evaluate(() => {
      const data = {};

      // Try to find metric cards
      const metricElements = document.querySelectorAll('[class*="metric"], [class*="card"]');
      metricElements.forEach(el => {
        const text = el.textContent || '';
        if (text.includes('Total clicks')) {
          const match = text.match(/[\d,]+/);
          if (match) data.totalClicks = match[0];
        }
        if (text.includes('Total impressions')) {
          const match = text.match(/[\d,]+/);
          if (match) data.totalImpressions = match[0];
        }
        if (text.includes('Average CTR')) {
          const match = text.match(/[\d.]+%/);
          if (match) data.avgCTR = match[0];
        }
        if (text.includes('Average position')) {
          const match = text.match(/[\d.]+/);
          if (match) data.avgPosition = match[0];
        }
      });

      return data;
    });
    console.log('   Metrics:', JSON.stringify(metrics, null, 2));

    // ========================================
    // 4. QUERIES TAB - TOP QUERIES
    // ========================================
    console.log('\n4. Analyzing Queries...');

    // Make sure Queries tab is selected
    const queriesTab = page.locator('button:has-text("Queries"), tab:has-text("Queries")').first();
    await queriesTab.click();
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: path.join(screenshotDir, '03-top-queries.png'),
      fullPage: true
    });
    console.log('   ✅ Screenshot saved: 03-top-queries.png');

    // Extract query data
    const queryData = await page.evaluate(() => {
      const queries = [];
      const rows = document.querySelectorAll('table tbody tr, [role="row"]');

      rows.forEach((row, index) => {
        if (index === 0) return; // Skip header if present
        if (queries.length >= 20) return; // Get top 20

        const cells = row.querySelectorAll('td, [role="cell"]');
        if (cells.length >= 4) {
          queries.push({
            query: cells[0]?.textContent?.trim() || '',
            clicks: cells[1]?.textContent?.trim() || '',
            impressions: cells[2]?.textContent?.trim() || '',
            ctr: cells[3]?.textContent?.trim() || '',
            position: cells[4]?.textContent?.trim() || ''
          });
        }
      });

      return queries;
    });
    console.log(`   Extracted ${queryData.length} queries`);

    // ========================================
    // 5. FILTER FOR OPPORTUNITY QUERIES (Position 11-20)
    // ========================================
    console.log('\n5. Filtering for opportunity queries (Position 11-20)...');

    // Try to open filters
    try {
      const filterButton = page.locator('button:has-text("+ New"), button[aria-label*="filter"]').first();
      await filterButton.click({ timeout: 5000 });
      await page.waitForTimeout(1000);

      // Select Position filter
      const positionFilter = page.locator('text=Position').first();
      await positionFilter.click({ timeout: 5000 });
      await page.waitForTimeout(1000);

      // Set position range 11-20
      const minInput = page.locator('input[placeholder*="min"], input[type="number"]').first();
      await minInput.fill('11');
      const maxInput = page.locator('input[placeholder*="max"], input[type="number"]').last();
      await maxInput.fill('20');

      const applyButton = page.locator('button:has-text("Apply"), button:has-text("OK")').first();
      await applyButton.click();
      await page.waitForTimeout(5000);

      await page.screenshot({
        path: path.join(screenshotDir, '04-opportunity-queries.png'),
        fullPage: true
      });
      console.log('   ✅ Screenshot saved: 04-opportunity-queries.png');
    } catch (e) {
      console.log('   ⚠️ Could not apply position filter:', e.message);
    }

    // ========================================
    // 6. PAGES TAB - PAGE PERFORMANCE
    // ========================================
    console.log('\n6. Analyzing Page Performance...');

    // Clear filters first if any
    try {
      const clearFilters = page.locator('button:has-text("Clear")').first();
      if (await clearFilters.isVisible({ timeout: 2000 })) {
        await clearFilters.click();
        await page.waitForTimeout(2000);
      }
    } catch (e) {}

    const pagesTab = page.locator('button:has-text("Pages"), tab:has-text("Pages")').first();
    await pagesTab.click();
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: path.join(screenshotDir, '05-page-performance.png'),
      fullPage: true
    });
    console.log('   ✅ Screenshot saved: 05-page-performance.png');

    // ========================================
    // 7. INDEX COVERAGE
    // ========================================
    console.log('\n7. Checking Index Coverage...');

    // Navigate to Pages (indexing section)
    try {
      // Look for "Pages" or "Indexing" in sidebar
      const indexingLink = page.locator('[href*="index"], a:has-text("Pages")').first();
      await indexingLink.click({ timeout: 10000 });
      await page.waitForTimeout(5000);

      await page.screenshot({
        path: path.join(screenshotDir, '06-index-coverage.png'),
        fullPage: true
      });
      console.log('   ✅ Screenshot saved: 06-index-coverage.png');
    } catch (e) {
      console.log('   ⚠️ Could not navigate to index coverage:', e.message);
    }

    // ========================================
    // 8. CORE WEB VITALS
    // ========================================
    console.log('\n8. Checking Core Web Vitals...');

    try {
      // Navigate to Experience > Core Web Vitals
      const experienceLink = page.locator('a:has-text("Experience"), button:has-text("Experience")').first();
      await experienceLink.click({ timeout: 10000 });
      await page.waitForTimeout(2000);

      const coreWebVitalsLink = page.locator('a:has-text("Core Web Vitals")').first();
      await coreWebVitalsLink.click({ timeout: 10000 });
      await page.waitForTimeout(5000);

      await page.screenshot({
        path: path.join(screenshotDir, '07-core-web-vitals.png'),
        fullPage: true
      });
      console.log('   ✅ Screenshot saved: 07-core-web-vitals.png');
    } catch (e) {
      console.log('   ⚠️ Could not navigate to Core Web Vitals:', e.message);
    }

    // ========================================
    // 9. MOBILE USABILITY
    // ========================================
    console.log('\n9. Checking Mobile Usability...');

    try {
      const mobileUsabilityLink = page.locator('a:has-text("Mobile Usability")').first();
      await mobileUsabilityLink.click({ timeout: 10000 });
      await page.waitForTimeout(5000);

      await page.screenshot({
        path: path.join(screenshotDir, '08-mobile-usability.png'),
        fullPage: true
      });
      console.log('   ✅ Screenshot saved: 08-mobile-usability.png');
    } catch (e) {
      console.log('   ⚠️ Could not navigate to Mobile Usability:', e.message);
    }

    // ========================================
    // SAVE DATA TO JSON
    // ========================================
    console.log('\n10. Saving extracted data...');

    const reportData = {
      timestamp: new Date().toISOString(),
      metrics,
      topQueries: queryData,
      screenshotsLocation: screenshotDir
    };

    fs.writeFileSync(
      path.join(screenshotDir, 'gsc-data.json'),
      JSON.stringify(reportData, null, 2)
    );
    console.log('   ✅ Data saved to gsc-data.json');

    console.log('\n✅ Google Search Console analysis complete!');
    console.log(`📁 All files saved to: ${screenshotDir}`);

    // Keep browser open for manual inspection
    console.log('\n👁️  Browser will remain open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ Error during analysis:', error.message);
    await page.screenshot({
      path: path.join(screenshotDir, 'error-screenshot.png'),
      fullPage: true
    });
  } finally {
    await browser.close();
    console.log('\n🔒 Browser closed.');
  }
})();
