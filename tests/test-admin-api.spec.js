const { test, expect } = require('@playwright/test');

test('Admin API calls should return 200 OK after firewall bypass', async ({ page, context }) => {
  // Set up Basic Auth
  await context.setHTTPCredentials({
    username: 'admin',
    password: 'Pink!'
  });

  // Track API responses
  const apiResponses = [];

  page.on('response', response => {
    const url = response.url();
    if (url.includes('/api/admin/')) {
      apiResponses.push({
        url,
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });

  console.log('Navigating to admin calls page...');

  // Navigate to admin calls page
  await page.goto('https://pinkautoglass.com/admin/dashboard/calls', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  console.log('Page loaded. Waiting for Refresh button...');

  // Wait for the Refresh button to be visible
  const refreshButton = page.locator('button:has-text("Refresh")');
  await refreshButton.waitFor({ state: 'visible', timeout: 10000 });

  console.log('Clicking Refresh button...');

  // Click the Refresh button
  await refreshButton.click();

  // Wait for API calls to complete
  await page.waitForTimeout(5000);

  console.log('\n=== API Response Summary ===\n');

  // Check the API responses
  const syncCall = apiResponses.find(r => r.url.includes('/api/admin/sync/ringcentral'));
  const callsCall = apiResponses.find(r => r.url.includes('/api/admin/calls'));

  if (syncCall) {
    console.log(`POST /api/admin/sync/ringcentral`);
    console.log(`  Status: ${syncCall.status} ${syncCall.statusText}`);
    console.log(`  Result: ${syncCall.status === 200 ? '✅ SUCCESS' : '❌ FAILED'}`);
  } else {
    console.log('⚠️  No sync call detected');
  }

  if (callsCall) {
    console.log(`\nGET /api/admin/calls`);
    console.log(`  Status: ${callsCall.status} ${callsCall.statusText}`);
    console.log(`  Result: ${callsCall.status === 200 ? '✅ SUCCESS' : '❌ FAILED'}`);
  } else {
    console.log('⚠️  No calls API request detected');
  }

  console.log('\n=== All Admin API Calls ===\n');
  apiResponses.forEach(r => {
    const status = r.status === 200 ? '✅' : '❌';
    console.log(`${status} ${r.status} - ${r.url}`);
  });

  // Assert that the API calls returned 200
  expect(syncCall?.status, 'Sync endpoint should return 200').toBe(200);
  expect(callsCall?.status, 'Calls endpoint should return 200').toBe(200);

  // Check if calls are displayed
  const totalCallsElement = page.locator('text=Total Calls').locator('..').locator('div').first();
  const totalCalls = await totalCallsElement.textContent();

  console.log(`\n=== Dashboard Stats ===`);
  console.log(`Total Calls: ${totalCalls}`);

  // Take a screenshot for verification
  await page.screenshot({ path: 'test-results/admin-api-test.png', fullPage: true });
  console.log('\n📸 Screenshot saved to: test-results/admin-api-test.png');
});
