const { test, expect } = require('@playwright/test');

// ============================================================================
// Navigation Tests - Footer Hub Page Links
// ============================================================================

test.describe('Footer Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display "View All Services" link in footer', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'View All Services →' })).toBeVisible();
  });

  test('should display "Find Your Vehicle" link in footer', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Find Your Vehicle' })).toBeVisible();
  });

  test('should display "View All Locations" link in footer', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'View All Locations →' })).toBeVisible();
  });

  test('should navigate to /services from footer "View All Services" link', async ({ page }) => {
    await page.getByRole('link', { name: 'View All Services →' }).click();
    await page.waitForURL('/services');

    await expect(page).toHaveURL('/services');
    await expect(page.getByRole('heading', { name: /Complete Auto Glass Services/i })).toBeVisible();
  });

  test('should navigate to /vehicles from footer "Find Your Vehicle" link', async ({ page }) => {
    await page.getByRole('link', { name: 'Find Your Vehicle' }).click();
    await page.waitForURL('/vehicles');

    await expect(page).toHaveURL('/vehicles');
    await expect(page.getByRole('heading', { name: /Find Your Vehicle/i })).toBeVisible();
  });

  test('should navigate to /locations from footer "View All Locations" link', async ({ page }) => {
    await page.getByRole('link', { name: 'View All Locations →' }).click();
    await page.waitForURL('/locations');

    await expect(page).toHaveURL('/locations');
    await expect(page.getByRole('heading', { name: /Mobile Windshield Service/i })).toBeVisible();
  });
});
