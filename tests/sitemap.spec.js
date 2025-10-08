const { test, expect } = require('@playwright/test');

test.describe('Sitemap Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sitemap');
    await page.waitForLoadState('networkidle');
  });

  test('should load with correct heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Site Map/i })).toBeVisible();
  });

  test('should display breadcrumbs', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Home', exact: true }).first()).toBeVisible();
    await expect(page.getByText('Sitemap').first()).toBeVisible();
  });

  test('should display main pages section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Main Pages', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: '→ Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Get Free Quote/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: '→ Track Your Request' })).toBeVisible();
  });

  test('should display services section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Services', exact: true }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: '→ View All Services' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Windshield Replacement/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Windshield Repair/i }).first()).toBeVisible();
  });

  test('should display service areas section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Service Areas', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: '→ View All Locations' })).toBeVisible();
    await expect(page.getByRole('link', { name: /• Denver/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /• Aurora/i })).toBeVisible();
  });

  test('should display vehicles section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Vehicles', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: '→ Find Your Vehicle' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /• Toyota/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /• Honda/i })).toBeVisible();
  });

  test('should display company section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Company', exact: true }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: '→ About Us' })).toBeVisible();
    await expect(page.getByRole('link', { name: '→ Contact' })).toBeVisible();
    await expect(page.getByRole('link', { name: '→ Careers' })).toBeVisible();
  });

  test('should have link to XML sitemap', async ({ page }) => {
    const xmlLink = page.getByRole('link', { name: /sitemap\.xml/i });
    await expect(xmlLink).toBeVisible();
    await expect(xmlLink).toHaveAttribute('href', '/sitemap.xml');
  });

  test('should navigate from footer to sitemap page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const sitemapLink = page.getByRole('link', { name: 'Sitemap', exact: true });
    await sitemapLink.click();
    await page.waitForURL('/sitemap');

    await expect(page).toHaveURL('/sitemap');
    await expect(page.getByRole('heading', { name: /Site Map/i })).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { name: /Site Map/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Services', exact: true }).first()).toBeVisible();
  });
});
