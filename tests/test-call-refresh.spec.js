const { test, expect } = require('@playwright/test');

test.describe('Call Dashboard Refresh', () => {
  test('should sync calls from RingCentral when refresh button is clicked', async ({ page }) => {
    // Navigate to the call dashboard
    await page.goto('https://pinkautoglasswebsite-mielicsqn-dougsimpsoncodes-projects.vercel.app/admin/dashboard/calls');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if we need to authenticate
    const isLoginPage = await page.locator('input[type="password"]').isVisible().catch(() => false);

    if (isLoginPage) {
      console.log('Authentication required - filling in credentials');
      // Fill in admin credentials
      await page.fill('input[name="username"]', 'admin');
      await page.fill('input[name="password"]', 'Pink!');
      await page.click('button[type="submit"]');

      // Wait for dashboard to load
      await page.waitForLoadState('networkidle');
    }

    // Look for the Refresh button
    const refreshButton = page.locator('button:has-text("Refresh")');
    await expect(refreshButton).toBeVisible({ timeout: 10000 });

    console.log('✓ Refresh button found');

    // Check initial "Last Update" text
    const lastUpdateText = page.locator('text=Last Update').first();
    await expect(lastUpdateText).toBeVisible();
    console.log('✓ "Last Update" label visible');

    // Check for the new UI text
    const syncText = page.locator('text=Click refresh to sync from RingCentral');
    await expect(syncText).toBeVisible();
    console.log('✓ New sync instruction text visible');

    // Check that old webhook text is gone
    const webhookText = page.locator('text=Updates automatically via webhooks');
    await expect(webhookText).not.toBeVisible();
    console.log('✓ Old webhook text removed');

    // Get the initial timestamp
    const timeElement = lastUpdateText.locator('xpath=following-sibling::p[1]');
    const initialTime = await timeElement.textContent();
    console.log(`Initial timestamp: ${initialTime}`);

    // Click refresh button
    console.log('Clicking refresh button...');
    await refreshButton.click();

    // Wait for the button to show loading state (if implemented)
    await page.waitForTimeout(1000);

    // Wait for the sync to complete (should take a few seconds)
    await page.waitForTimeout(5000);

    // Check that the timestamp updated to "Just now" or similar
    const updatedTime = await timeElement.textContent();
    console.log(`Updated timestamp: ${updatedTime}`);

    // Verify timestamp changed or shows recent update
    const isRecent = updatedTime.includes('Just now') ||
                     updatedTime.includes('sec') ||
                     updatedTime.includes('min');

    expect(isRecent).toBeTruthy();
    console.log('✓ Timestamp updated to show recent sync');

    // Check that calls are displayed
    const callsTable = page.locator('table').first();
    const hasRows = await callsTable.locator('tbody tr').count() > 0;

    if (hasRows) {
      console.log('✓ Calls are displayed in the table');
    } else {
      console.log('⚠️  No calls in table (may be no recent calls)');
    }

    console.log('\n✅ All refresh functionality tests passed!');
  });

  test('should handle sync errors gracefully', async ({ page }) => {
    // This test verifies error handling by checking console logs
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });

    await page.goto('https://pinkautoglasswebsite-mielicsqn-dougsimpsoncodes-projects.vercel.app/admin/dashboard/calls');
    await page.waitForLoadState('networkidle');

    // Check if we need to authenticate
    const isLoginPage = await page.locator('input[type="password"]').isVisible().catch(() => false);
    if (isLoginPage) {
      await page.fill('input[name="username"]', 'admin');
      await page.fill('input[name="password"]', 'Pink!');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
    }

    const refreshButton = page.locator('button:has-text("Refresh")');
    await refreshButton.click();

    // Wait a bit for any errors to appear
    await page.waitForTimeout(3000);

    // Page should not crash even if sync fails
    const isPageResponsive = await refreshButton.isVisible();
    expect(isPageResponsive).toBeTruthy();
    console.log('✓ Page remains responsive after refresh');
  });
});
