const { test, expect } = require('@playwright/test');

test('Quick admin login test', async ({ page }) => {
  // Go to login page
  await page.goto('http://localhost:3000/admin/login');

  // Fill in credentials
  await page.fill('input[type="email"]', 'admin@pinkautoglass.com');
  await page.fill('input[type="password"]', 'PinkGlass2025!');

  // Click sign in
  await page.click('button:has-text("Sign In")');

  // Wait for navigation and check we're on dashboard
  await page.waitForURL('**/admin/dashboard', { timeout: 10000 });

  // Verify we're on the dashboard
  expect(page.url()).toContain('/admin/dashboard');

  console.log('✓ Login successful! Redirected to:', page.url());
});
