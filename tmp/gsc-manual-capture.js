const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

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
    console.log('📍 Opening Google Search Console...');
    await page.goto('https://search.google.com/search-console', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('\n⏳ YOU HAVE 60 SECONDS TO:');
    console.log('   1. Log in to your Google account');
    console.log('   2. Select the "pinkautoglass.com" property');
    console.log('   3. Navigate to Performance page');
    console.log('   4. Set date range to "Last 3 months"\n');

    // Wait 60 seconds for manual login
    for (let i = 60; i > 0; i -= 10) {
      console.log(`   ⏱️  ${i} seconds remaining...`);
      await page.waitForTimeout(10000);
    }

    console.log('\n✅ Starting automated screenshots...\n');

    // Screenshot 1: Current page (should be Performance)
    await page.screenshot({
      path: path.join(screenshotDir, '01-performance-overview.png'),
      fullPage: true
    });
    console.log('✅ 1/8: Performance overview captured');

    // Extract metrics
    const metrics = await page.evaluate(() => {
      const data = {};
      const allText = document.body.innerText;

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

    console.log('   Metrics:', metrics);

    // Wait and capture queries
    console.log('\n⏳ In 20 seconds, ensure you are on the QUERIES tab...');
    await page.waitForTimeout(20000);

    await page.screenshot({
      path: path.join(screenshotDir, '02-top-queries.png'),
      fullPage: true
    });
    console.log('✅ 2/8: Top queries captured');

    // Extract query data
    const queryData = await page.evaluate(() => {
      const queries = [];
      const rows = document.querySelectorAll('table tbody tr');

      rows.forEach((row, index) => {
        if (index >= 30) return;

        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
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

    console.log(`   Extracted ${queryData.length} queries`);

    // Wait and capture pages
    console.log('\n⏳ In 20 seconds, click the PAGES tab...');
    await page.waitForTimeout(20000);

    await page.screenshot({
      path: path.join(screenshotDir, '03-page-performance.png'),
      fullPage: true
    });
    console.log('✅ 3/8: Page performance captured');

    // Extract page data
    const pageData = await page.evaluate(() => {
      const pages = [];
      const rows = document.querySelectorAll('table tbody tr');

      rows.forEach((row, index) => {
        if (index >= 25) return;

        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
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

    console.log(`   Extracted ${pageData.length} pages`);

    // Indexing
    console.log('\n⏳ In 20 seconds, navigate to Pages (Indexing) in left sidebar...');
    await page.waitForTimeout(20000);

    await page.screenshot({
      path: path.join(screenshotDir, '04-index-coverage.png'),
      fullPage: true
    });
    console.log('✅ 4/8: Index coverage captured');

    // Core Web Vitals
    console.log('\n⏳ In 20 seconds, navigate to Experience > Core Web Vitals...');
    await page.waitForTimeout(20000);

    await page.screenshot({
      path: path.join(screenshotDir, '05-core-web-vitals.png'),
      fullPage: true
    });
    console.log('✅ 5/8: Core Web Vitals captured');

    // Mobile Usability
    console.log('\n⏳ In 20 seconds, navigate to Experience > Mobile Usability...');
    await page.waitForTimeout(20000);

    await page.screenshot({
      path: path.join(screenshotDir, '06-mobile-usability.png'),
      fullPage: true
    });
    console.log('✅ 6/8: Mobile Usability captured');

    // Opportunity queries
    console.log('\n⏳ In 30 seconds, do the following:');
    console.log('   1. Navigate back to Performance > Queries');
    console.log('   2. Click "+ NEW" filter');
    console.log('   3. Select "Position"');
    console.log('   4. Set min: 11, max: 20');
    console.log('   5. Click Apply');
    await page.waitForTimeout(30000);

    await page.screenshot({
      path: path.join(screenshotDir, '07-opportunity-queries-p11-20.png'),
      fullPage: true
    });
    console.log('✅ 7/8: Opportunity queries (pos 11-20) captured');

    // Extract opportunity queries
    const opportunityQueries = await page.evaluate(() => {
      const queries = [];
      const rows = document.querySelectorAll('table tbody tr');

      rows.forEach((row, index) => {
        if (index >= 20) return;

        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
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

    console.log(`   Extracted ${opportunityQueries.length} opportunity queries`);

    // High impressions, low CTR
    console.log('\n⏳ In 30 seconds, do the following:');
    console.log('   1. Clear the position filter');
    console.log('   2. Sort by Impressions (descending)');
    console.log('   3. Look for queries with CTR < 2%');
    await page.waitForTimeout(30000);

    await page.screenshot({
      path: path.join(screenshotDir, '08-high-impressions-low-ctr.png'),
      fullPage: true
    });
    console.log('✅ 8/8: High impressions, low CTR captured');

    // Save all data
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
    console.log(`\n📁 Files saved to: ${screenshotDir}`);
    console.log(`📊 Data: gsc-data.json`);
    console.log(`🖼️  Screenshots: 8 files\n`);

    console.log('📈 Summary:');
    console.log(`   Total Clicks: ${metrics.totalClicks || 'N/A'}`);
    console.log(`   Total Impressions: ${metrics.totalImpressions || 'N/A'}`);
    console.log(`   Average CTR: ${metrics.avgCTR || 'N/A'}`);
    console.log(`   Average Position: ${metrics.avgPosition || 'N/A'}`);
    console.log(`   Queries Extracted: ${queryData.length}`);
    console.log(`   Pages Extracted: ${pageData.length}`);
    console.log(`   Opportunity Queries: ${opportunityQueries.length}\n`);

    // Keep browser open for 30 seconds
    console.log('⏳ Browser will remain open for 30 seconds for review...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({
      path: path.join(screenshotDir, '99-error-screenshot.png'),
      fullPage: true
    });
  } finally {
    await browser.close();
    console.log('\n🔒 Browser closed.\n');
  }
})();
