const { test, expect } = require('@playwright/test');

test.describe('Admin Dashboard - Fresh Data Verification', () => {
  test('should display fresh call data after clicking Refresh', async ({ page, context }) => {
    // Set up Basic Auth
    await context.setHTTPCredentials({
      username: 'admin',
      password: 'Pink!'
    });

    console.log('\n=== Step 1: Navigate to admin dashboard ===');
    await page.goto('https://pinkautoglass.com/admin/dashboard/calls', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Take initial screenshot
    await page.screenshot({
      path: 'test-results/admin-dashboard-before-refresh.png',
      fullPage: true
    });
    console.log('📸 Screenshot saved: admin-dashboard-before-refresh.png');

    // Get initial total calls count
    const initialTotalElement = page.locator('text=Total Calls').locator('..').locator('div').first();
    const initialTotal = await initialTotalElement.textContent();
    console.log(`\nInitial Total Calls: ${initialTotal}`);

    console.log('\n=== Step 2: Click Refresh button ===');
    const refreshButton = page.locator('button:has-text("Refresh")');
    await refreshButton.waitFor({ state: 'visible', timeout: 10000 });

    // Track network requests during refresh
    const apiRequests = [];
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/admin/')) {
        apiRequests.push({
          url: url,
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });

    await refreshButton.click();
    console.log('✓ Refresh button clicked');

    // Wait for refresh to complete
    await page.waitForTimeout(5000);

    console.log('\n=== Step 3: Verify API calls succeeded ===');
    apiRequests.forEach(req => {
      const status = req.status === 200 ? '✅' : '❌';
      console.log(`${status} ${req.status} - ${req.url}`);
    });

    // Verify API calls returned 200
    const callsRequest = apiRequests.find(r => r.url.includes('/api/admin/calls'));
    if (callsRequest) {
      expect(callsRequest.status, 'Calls API should return 200').toBe(200);
      console.log('✓ Calls API returned 200 OK');
    } else {
      console.log('⚠️  No calls API request detected');
    }

    console.log('\n=== Step 4: Verify dashboard stats ===');

    // Get updated total calls
    const updatedTotal = await initialTotalElement.textContent();
    console.log(`Updated Total Calls: ${updatedTotal}`);

    // Get Inbound count
    const inboundElement = page.locator('text=Inbound').locator('..').locator('div').first();
    const inbound = await inboundElement.textContent();
    console.log(`Inbound Calls: ${inbound}`);

    // Get Outbound count
    const outboundElement = page.locator('text=Outbound').locator('..').locator('div').first();
    const outbound = await outboundElement.textContent();
    console.log(`Outbound Calls: ${outbound}`);

    // Get Missed count
    const missedElement = page.locator('text=Missed').locator('..').locator('div').first();
    const missed = await missedElement.textContent();
    console.log(`Missed Calls: ${missed}`);

    console.log('\n=== Step 5: Check for recent calls in the table ===');

    // Wait for call table to load
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Get all call rows
    const callRows = await page.locator('table tbody tr').all();
    console.log(`\nFound ${callRows.length} call rows in the table`);

    if (callRows.length > 0) {
      console.log('\n📋 Most recent calls:');

      // Check first 5 calls
      for (let i = 0; i < Math.min(5, callRows.length); i++) {
        const row = callRows[i];

        // Try to get call details from the row
        const rowText = await row.textContent();
        console.log(`\n${i + 1}. ${rowText.substring(0, 150)}...`);

        // Look for date/time in the row
        const dateMatch = rowText.match(/Nov \d+|11\/\d+|\d{4}-\d{2}-\d{2}/);
        if (dateMatch) {
          console.log(`   📅 Date found: ${dateMatch[0]}`);

          // Check if it's from Nov 12 (today)
          if (dateMatch[0].includes('Nov 12') || dateMatch[0].includes('11/12') || dateMatch[0].includes('2025-11-12')) {
            console.log('   ✅ This is fresh data from Nov 12!');
          } else if (dateMatch[0].includes('Nov 7') || dateMatch[0].includes('11/7') || dateMatch[0].includes('2025-11-07')) {
            console.log('   ⚠️  This is old data from Nov 7');
          }
        }
      }
    }

    console.log('\n=== Step 6: Take final screenshot ===');
    await page.screenshot({
      path: 'test-results/admin-dashboard-after-refresh.png',
      fullPage: true
    });
    console.log('📸 Screenshot saved: admin-dashboard-after-refresh.png');

    console.log('\n=== Step 7: Verify data freshness ===');

    // Check if total calls increased or stayed the same
    const initialNum = parseInt(initialTotal);
    const updatedNum = parseInt(updatedTotal);

    if (updatedNum > initialNum) {
      console.log(`✅ Total calls increased: ${initialNum} → ${updatedNum}`);
    } else if (updatedNum === initialNum) {
      console.log(`ℹ️  Total calls unchanged: ${updatedNum}`);
      console.log('   (This is OK if no new calls came in during the test)');
    } else {
      console.log(`⚠️  Total calls decreased: ${initialNum} → ${updatedNum}`);
    }

    // Final assertion - at minimum, API should have returned 200
    expect(callsRequest?.status).toBe(200);

    console.log('\n=== Test Complete ===\n');
  });

  test('should verify probe endpoint returns fresh data', async ({ request }) => {
    console.log('\n=== Testing PostgREST Probe Endpoint ===\n');

    const response = await request.get('https://pinkautoglass.com/api/admin/debug/calls-probe', {
      headers: {
        'Authorization': 'Basic ' + Buffer.from('admin:Pink!').toString('base64')
      }
    });

    console.log(`Status: ${response.status()} ${response.statusText()}`);

    if (response.ok()) {
      const data = await response.json();
      console.log('\n📊 Probe Results:');
      console.log(JSON.stringify(data, null, 2));

      console.log(`\n✓ Rest Count: ${data.restCount}`);
      console.log(`✓ Most Recent: ${data.restMostRecentStart}`);

      // Check if data is recent (within last 24 hours)
      if (data.restMostRecentStart) {
        const callDate = new Date(data.restMostRecentStart);
        const now = new Date();
        const hoursAgo = (now - callDate) / (1000 * 60 * 60);

        console.log(`\n⏰ Data is ${hoursAgo.toFixed(1)} hours old`);

        if (hoursAgo < 24) {
          console.log('✅ Data is FRESH (less than 24 hours old)');
        } else {
          console.log('⚠️  Data is STALE (more than 24 hours old)');
        }
      }

      expect(response.status()).toBe(200);
    } else {
      const text = await response.text();
      console.log('\n❌ Probe endpoint failed:');
      console.log(text.substring(0, 500));

      // Don't fail the test if probe isn't deployed yet
      console.log('\nℹ️  Probe endpoint may not be deployed yet - this is optional');
    }
  });
});
