const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/**
 * Google Search Console Performance Analyzer
 *
 * This script will:
 * 1. Open Google Search Console for pinkautoglass.com
 * 2. Navigate to Performance report
 * 3. Extract key metrics (clicks, impressions, CTR, position)
 * 4. Export top queries and pages
 * 5. Save data for analysis
 */

async function analyzeSearchConsole() {
  console.log('🔍 Starting Google Search Console Analysis...\n');

  // Launch browser with user data to use existing Google login
  const browser = await chromium.launch({
    headless: false, // Show browser so you can interact if needed
    slowMo: 100, // Slow down actions for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  try {
    console.log('📱 Navigating to Google Search Console...');

    // Navigate to GSC for pinkautoglass.com
    await page.goto('https://search.google.com/search-console?resource_id=sc-domain:pinkautoglass.com', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    // Wait a bit to see if login is needed
    await page.waitForTimeout(3000);

    // Check if we need to log in
    const isLoginPage = await page.locator('input[type="email"]').isVisible().catch(() => false);

    if (isLoginPage) {
      console.log('⚠️  Please log in to your Google account in the browser window...');
      console.log('⏳ Waiting for you to complete login (up to 2 minutes)...\n');

      // Wait for navigation away from login page
      await page.waitForURL('**/search-console/**', { timeout: 120000 });
      console.log('✅ Login successful!\n');
    }

    // Wait for the page to load
    console.log('⏳ Loading Search Console data...');
    await page.waitForTimeout(5000);

    // Click on Performance if not already there
    try {
      const perfButton = page.locator('text=Performance').first();
      if (await perfButton.isVisible()) {
        await perfButton.click();
        await page.waitForTimeout(3000);
      }
    } catch (e) {
      console.log('Already on Performance page or unable to click');
    }

    console.log('📊 Extracting performance metrics...\n');

    // Try to get the summary metrics
    const metrics = {
      totalClicks: 'N/A',
      totalImpressions: 'N/A',
      avgCTR: 'N/A',
      avgPosition: 'N/A'
    };

    // Take screenshot of the dashboard
    const screenshotPath = path.join(__dirname, '..', 'data', 'google-ads', 'search-console-dashboard.png');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    console.log(`📸 Screenshot saved: ${screenshotPath}\n`);

    // Try to extract metrics from the page
    try {
      // Wait for metrics to load
      await page.waitForTimeout(2000);

      // Look for metric cards - GSC has a specific structure
      const clicksText = await page.locator('text=Total clicks').first().textContent().catch(() => null);
      const impressionsText = await page.locator('text=Total impressions').first().textContent().catch(() => null);

      console.log('📈 Found metrics on page:');
      if (clicksText) console.log(`   Clicks: ${clicksText}`);
      if (impressionsText) console.log(`   Impressions: ${impressionsText}`);

    } catch (e) {
      console.log('⚠️  Could not auto-extract metrics. Taking screenshot for manual review.');
    }

    // Navigate to the Queries tab
    console.log('\n🔍 Navigating to Queries tab...');
    try {
      await page.click('text=Queries', { timeout: 5000 });
      await page.waitForTimeout(3000);

      // Take screenshot of queries
      const queriesScreenshot = path.join(__dirname, '..', 'data', 'google-ads', 'search-console-queries.png');
      await page.screenshot({
        path: queriesScreenshot,
        fullPage: true
      });
      console.log(`📸 Queries screenshot saved: ${queriesScreenshot}\n`);
    } catch (e) {
      console.log('⚠️  Could not navigate to Queries tab');
    }

    // Navigate to the Pages tab
    console.log('📄 Navigating to Pages tab...');
    try {
      await page.click('text=Pages', { timeout: 5000 });
      await page.waitForTimeout(3000);

      // Take screenshot of pages
      const pagesScreenshot = path.join(__dirname, '..', 'data', 'google-ads', 'search-console-pages.png');
      await page.screenshot({
        path: pagesScreenshot,
        fullPage: true
      });
      console.log(`📸 Pages screenshot saved: ${pagesScreenshot}\n`);
    } catch (e) {
      console.log('⚠️  Could not navigate to Pages tab');
    }

    // Try to export data
    console.log('💾 Looking for export option...');
    try {
      // Look for export button (usually an icon)
      const exportButton = page.locator('[aria-label*="Export"]').first();
      if (await exportButton.isVisible({ timeout: 2000 })) {
        console.log('📥 Export button found. Click it manually to download CSV if needed.');
        console.log('   The CSV will contain all queries/pages data for deeper analysis.\n');
      }
    } catch (e) {
      console.log('⚠️  Export button not found or not accessible');
    }

    console.log('\n✅ Analysis complete!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Review the screenshots in data/google-ads/');
    console.log('   2. Manually export CSV from GSC if you want detailed data');
    console.log('   3. I will analyze the screenshots to provide recommendations\n');

    // Keep browser open for manual interaction
    console.log('⏸️  Browser will stay open for 30 seconds for you to explore...');
    console.log('   You can manually export data or review the interface.');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Error occurred:', error.message);

    // Take error screenshot
    try {
      const errorScreenshot = path.join(__dirname, '..', 'data', 'google-ads', 'search-console-error.png');
      await page.screenshot({
        path: errorScreenshot,
        fullPage: true
      });
      console.log(`📸 Error screenshot saved: ${errorScreenshot}`);
    } catch (e) {
      // Ignore screenshot errors
    }
  } finally {
    await browser.close();
    console.log('\n👋 Browser closed. Analysis complete!');
  }
}

// Run the analyzer
analyzeSearchConsole().catch(console.error);
