const { test, expect } = require('@playwright/test');

test('Debug conversion tracking', async ({ page }) => {
  // Listen to console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push(`${msg.type()}: ${msg.text()}`);
  });

  // Visit homepage
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n📱 Clicking phone button...');

  // Click phone button
  const phoneButton = page.locator('a[href^="tel:"]').first();
  await phoneButton.click();
  await page.waitForTimeout(3000);

  // Print all console messages
  console.log('\n📊 Browser Console Output:');
  console.log('='.repeat(60));
  consoleMessages.forEach(msg => console.log(msg));
  console.log('='.repeat(60));
});
