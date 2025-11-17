const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  const screenshotDir = '/Users/dougsimpson/Projects/pinkautoglasswebsite/tmp/gsc-analysis';

  console.log('\n========================================');
  console.log('🔍 Google Search Console SEO Analysis');
  console.log('========================================\n');

  try {
    // Navigate to Google Search Console
    console.log('📍 Step 1: Opening Google Search Console...');
    await page.goto('https://search.google.com/search-console', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('\n⏳ PLEASE COMPLETE THESE STEPS MANUALLY:');
    console.log('   1. Log in to your Google account');
    console.log('   2. Select the "pinkautoglass.com" property');
    console.log('   3. Wait for the overview or performance page to load');
    console.log('   4. Make sure you can see data on the screen\n');

    await question('Press ENTER when you are logged in and can see the GSC dashboard...');

    console.log('\n✅ Proceeding with automated analysis...\n');

    // Take initial screenshot
    await page.screenshot({
      path: path.join(screenshotDir, '01-current-page.png'),
      fullPage: true
    });
    console.log('✅ Screenshot 1/8: Current page captured');

    // ========================================
    // NAVIGATE TO PERFORMANCE
    // ========================================
    console.log('\n📊 Step 2: Navigating to Performance...');

    // Try to find and click Performance link
    const performanceSelectors = [
      'a[href*="performance"]',
      'text=Performance >> visible=true',
      'nav a:has-text("Performance")',
      '[aria-label*="Performance"]'
    ];

    let performanceClicked = false;
    for (const selector of performanceSelectors) {
      try {
        const element = await page.locator(selector).first().elementHandle({ timeout: 2000 });
        if (element) {
          await element.click();
          performanceClicked = true;
          console.log(`   Found Performance link with: ${selector}`);
          await page.waitForTimeout(3000);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!performanceClicked) {
      console.log('   ⚠️ Could not auto-navigate to Performance');
      await question('   Please manually click "Performance" in the sidebar, then press ENTER...');
    }

    await page.waitForTimeout(3000);

    // Set date range to 3 months
    console.log('   Setting date range to Last 3 months...');
    try {
      // Click date selector
      await page.click('button:has-text("Date")', { timeout: 5000 });
      await page.waitForTimeout(1000);

      // Click "Last 3 months"
      await page.click('text=Last 3 months', { timeout: 5000 });
      await page.waitForTimeout(3000);
      console.log('   ✅ Date range set to Last 3 months');
    } catch (e) {
      console.log('   ℹ️ Using default date range');
    }

    await page.screenshot({
      path: path.join(screenshotDir, '02-performance-overview.png'),
      fullPage: true
    });
    console.log('✅ Screenshot 2/8: Performance overview captured');

    // Extract metrics
    console.log('\n📈 Extracting performance metrics...');
    const metrics = await page.evaluate(() => {
      const data = {};
      const allText = document.body.innerText;

      // Extract metrics from visible text
      const clicksMatch = allText.match(/Total clicks[:\s]*([\d,]+)/i);
      const impressionsMatch = allText.match(/Total impressions[:\s]*([\d,]+)/i);
      const ctrMatch = allText.match(/Average CTR[:\s]*([\d.]+%)/i);
      const positionMatch = allText.match(/Average position[:\s]*([\d.]+)/i);

      if (clicksMatch) data.totalClicks = clicksMatch[1];
      if (impressionsMatch) data.totalImpressions = impressionsMatch[1];
      if (ctrMatch) data.avgCTR = ctrMatch[1];
      if (positionMatch) data.avgPosition = positionMatch[1];

      return data;
    });

    console.log('   Metrics found:', metrics);

    // ========================================
    // QUERIES TAB
    // ========================================
    console.log('\n🔎 Step 3: Analyzing top queries...');

    try {
      await page.click('button:has-text("QUERIES"), tab:has-text("QUERIES")', { timeout: 5000 });
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('   ℹ️ Queries tab may already be selected');
    }

    await page.screenshot({
      path: path.join(screenshotDir, '03-top-queries.png'),
      fullPage: true
    });
    console.log('✅ Screenshot 3/8: Top queries captured');

    // Extract query data from table
    const queryData = await page.evaluate(() => {
      const queries = [];
      const rows = document.querySelectorAll('table tbody tr');

      rows.forEach((row, index) => {
        if (index >= 25) return; // Top 25 queries

        const cells = row.querySelectorAll('td');
        if (cells.length >= 4) {
          queries.push({
            query: cells[0]?.innerText?.trim() || '',
            clicks: cells[1]?.innerText?.trim() || '',
            impressions: cells[2]?.innerText?.trim() || '',
            ctr: cells[3]?.innerText?.trim() || '',
            position: cells[4]?.innerText?.trim() || ''
          });
        }
      });

      return queries;
    });

    console.log(`   ✅ Extracted ${queryData.length} queries`);

    // ========================================
    // PAGES TAB
    // ========================================
    console.log('\n📄 Step 4: Analyzing page performance...');

    try {
      await page.click('button:has-text("PAGES"), tab:has-text("PAGES")', { timeout: 5000 });
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('   ⚠️ Could not click PAGES tab');
    }

    await page.screenshot({
      path: path.join(screenshotDir, '04-page-performance.png'),
      fullPage: true
    });
    console.log('✅ Screenshot 4/8: Page performance captured');

    // Extract page data
    const pageData = await page.evaluate(() => {
      const pages = [];
      const rows = document.querySelectorAll('table tbody tr');

      rows.forEach((row, index) => {
        if (index >= 20) return; // Top 20 pages

        const cells = row.querySelectorAll('td');
        if (cells.length >= 4) {
          pages.push({
            page: cells[0]?.innerText?.trim() || '',
            clicks: cells[1]?.innerText?.trim() || '',
            impressions: cells[2]?.innerText?.trim() || '',
            ctr: cells[3]?.innerText?.trim() || '',
            position: cells[4]?.innerText?.trim() || ''
          });
        }
      });

      return pages;
    });

    console.log(`   ✅ Extracted ${pageData.length} pages`);

    // ========================================
    // INDEXING / PAGES
    // ========================================
    console.log('\n📇 Step 5: Checking indexing status...');

    console.log('   Please manually navigate to "Pages" under Indexing in the left sidebar');
    await question('   Press ENTER when the indexing page is loaded...');

    await page.screenshot({
      path: path.join(screenshotDir, '05-index-coverage.png'),
      fullPage: true
    });
    console.log('✅ Screenshot 5/8: Index coverage captured');

    // ========================================
    // CORE WEB VITALS
    // ========================================
    console.log('\n⚡ Step 6: Checking Core Web Vitals...');

    console.log('   Please manually navigate to Experience > Core Web Vitals');
    await question('   Press ENTER when Core Web Vitals page is loaded (or press ENTER to skip)...');

    await page.screenshot({
      path: path.join(screenshotDir, '06-core-web-vitals.png'),
      fullPage: true
    });
    console.log('✅ Screenshot 6/8: Core Web Vitals captured');

    // ========================================
    // MOBILE USABILITY
    // ========================================
    console.log('\n📱 Step 7: Checking Mobile Usability...');

    console.log('   Please manually navigate to Experience > Mobile Usability');
    await question('   Press ENTER when Mobile Usability page is loaded (or press ENTER to skip)...');

    await page.screenshot({
      path: path.join(screenshotDir, '07-mobile-usability.png'),
      fullPage: true
    });
    console.log('✅ Screenshot 7/8: Mobile Usability captured');

    // ========================================
    // BACK TO PERFORMANCE FOR OPPORTUNITY ANALYSIS
    // ========================================
    console.log('\n🎯 Step 8: Identifying opportunity queries (Position 11-20)...');

    console.log('   Please navigate back to Performance > Queries');
    await question('   Press ENTER when on Performance > Queries...');

    console.log('\n   Now we will filter for positions 11-20 (page 2 opportunities)');
    console.log('   Please follow these steps:');
    console.log('   1. Click "+ NEW" button to add a filter');
    console.log('   2. Select "Position"');
    console.log('   3. Set minimum: 11, maximum: 20');
    console.log('   4. Click "Apply"\n');

    await question('   Press ENTER when the filter is applied and results are showing...');

    await page.screenshot({
      path: path.join(screenshotDir, '08-opportunity-queries.png'),
      fullPage: true
    });
    console.log('✅ Screenshot 8/8: Opportunity queries captured');

    // Extract opportunity queries
    const opportunityQueries = await page.evaluate(() => {
      const queries = [];
      const rows = document.querySelectorAll('table tbody tr');

      rows.forEach((row, index) => {
        if (index >= 15) return; // Top 15 opportunity queries

        const cells = row.querySelectorAll('td');
        if (cells.length >= 4) {
          queries.push({
            query: cells[0]?.innerText?.trim() || '',
            clicks: cells[1]?.innerText?.trim() || '',
            impressions: cells[2]?.innerText?.trim() || '',
            ctr: cells[3]?.innerText?.trim() || '',
            position: cells[4]?.innerText?.trim() || ''
          });
        }
      });

      return queries;
    });

    console.log(`   ✅ Extracted ${opportunityQueries.length} opportunity queries`);

    // ========================================
    // SAVE ALL DATA
    // ========================================
    console.log('\n💾 Saving all extracted data...');

    const reportData = {
      timestamp: new Date().toISOString(),
      dateRange: 'Last 3 months',
      property: 'pinkautoglass.com',
      metrics,
      topQueries: queryData,
      topPages: pageData,
      opportunityQueries,
      screenshotsLocation: screenshotDir
    };

    fs.writeFileSync(
      path.join(screenshotDir, 'gsc-data.json'),
      JSON.stringify(reportData, null, 2)
    );

    console.log('\n========================================');
    console.log('✅ ANALYSIS COMPLETE!');
    console.log('========================================');
    console.log(`\n📁 All files saved to: ${screenshotDir}`);
    console.log(`📊 Data file: ${path.join(screenshotDir, 'gsc-data.json')}`);
    console.log(`🖼️  Screenshots: 8 files (01-08)\n`);

    console.log('📈 Quick Summary:');
    console.log(`   Total Clicks: ${metrics.totalClicks || 'N/A'}`);
    console.log(`   Total Impressions: ${metrics.totalImpressions || 'N/A'}`);
    console.log(`   Average CTR: ${metrics.avgCTR || 'N/A'}`);
    console.log(`   Average Position: ${metrics.avgPosition || 'N/A'}`);
    console.log(`   Top Queries Extracted: ${queryData.length}`);
    console.log(`   Top Pages Extracted: ${pageData.length}`);
    console.log(`   Opportunity Queries: ${opportunityQueries.length}\n`);

  } catch (error) {
    console.error('\n❌ Error during analysis:', error.message);
    await page.screenshot({
      path: path.join(screenshotDir, '99-error-screenshot.png'),
      fullPage: true
    });
  } finally {
    rl.close();
    await browser.close();
    console.log('🔒 Browser closed.\n');
  }
})();
