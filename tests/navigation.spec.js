const { test, expect } = require('@playwright/test');

// ============================================================================
// Navigation Tests - Header & Footer Hub Page Links
// ============================================================================

test.describe('Header Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display all navigation links in header', async ({ page }) => {
    // Check for navigation links
    await expect(page.getByRole('link', { name: 'Services', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Locations', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Vehicles', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get Free Quote' })).toBeVisible();
  });

  test('should navigate to /services from header', async ({ page }) => {
    await page.getByRole('link', { name: 'Services', exact: true }).click();
    await page.waitForURL('/services');

    await expect(page).toHaveURL('/services');
    await expect(page.getByRole('heading', { name: /Complete Auto Glass Services/i })).toBeVisible();
  });

  test('should navigate to /locations from header', async ({ page }) => {
    await page.getByRole('link', { name: 'Locations', exact: true }).click();
    await page.waitForURL('/locations');

    await expect(page).toHaveURL('/locations');
    await expect(page.getByRole('heading', { name: /Mobile Windshield Service/i })).toBeVisible();
  });

  test('should navigate to /vehicles from header', async ({ page }) => {
    await page.getByRole('link', { name: 'Vehicles', exact: true }).click();
    await page.waitForURL('/vehicles');

    await expect(page).toHaveURL('/vehicles');
    await expect(page.getByRole('heading', { name: /Find Your Vehicle/i })).toBeVisible();
  });

  test('should navigate to /book from header Get Free Quote button', async ({ page }) => {
    await page.getByRole('link', { name: 'Get Free Quote' }).click();
    await page.waitForURL('/book');

    await expect(page).toHaveURL('/book');
  });

  test('should show navigation on all hub pages', async ({ page }) => {
    const pages = ['/services', '/locations', '/vehicles'];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');

      // All navigation links should be visible
      await expect(page.getByRole('link', { name: 'Services', exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Locations', exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Vehicles', exact: true })).toBeVisible();
    }
  });
});

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

test.describe('Navigation Flow Between Hub Pages', () => {
  test('should navigate from homepage to all hub pages via header', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Home -> Services
    await page.getByRole('link', { name: 'Services', exact: true }).click();
    await page.waitForURL('/services');
    await expect(page.getByRole('heading', { name: /Complete Auto Glass Services/i })).toBeVisible();

    // Services -> Locations
    await page.getByRole('link', { name: 'Locations', exact: true }).click();
    await page.waitForURL('/locations');
    await expect(page.getByRole('heading', { name: /Mobile Windshield Service/i })).toBeVisible();

    // Locations -> Vehicles
    await page.getByRole('link', { name: 'Vehicles', exact: true }).click();
    await page.waitForURL('/vehicles');
    await expect(page.getByRole('heading', { name: /Find Your Vehicle/i })).toBeVisible();

    // Vehicles -> Book
    await page.getByRole('link', { name: 'Get Free Quote' }).click();
    await page.waitForURL('/book');
  });

  test('should maintain navigation consistency across all pages', async ({ page }) => {
    const pages = ['/', '/services', '/locations', '/vehicles', '/book'];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');

      // Header navigation should exist
      await expect(page.getByRole('link', { name: 'Services', exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Locations', exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Vehicles', exact: true })).toBeVisible();

      // Footer navigation should exist
      await expect(page.getByRole('link', { name: 'View All Services →' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'View All Locations →' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Find Your Vehicle' })).toBeVisible();
    }
  });
});

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display navigation on mobile viewport', async ({ page }) => {
    // Navigation links should be visible even on mobile
    await expect(page.getByRole('link', { name: 'Services', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Locations', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Vehicles', exact: true })).toBeVisible();
  });

  test('should navigate on mobile from header', async ({ page }) => {
    await page.getByRole('link', { name: 'Services', exact: true }).click();
    await page.waitForURL('/services');

    await expect(page).toHaveURL('/services');
    await expect(page.getByRole('heading', { name: /Complete Auto Glass Services/i })).toBeVisible();
  });
});
