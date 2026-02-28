import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3001';
const AUTH = Buffer.from('admin:changeme').toString('base64');

test.describe('GridScope Page', () => {
  test.use({
    baseURL: BASE,
    extraHTTPHeaders: {
      'Authorization': `Basic ${AUTH}`,
    },
  });

  test('page loads with map and controls', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/admin/dashboard/gridscope', { waitUntil: 'networkidle' });

    // Page elements
    await expect(page.locator('h1:has-text("GridScope")')).toBeVisible();
    await expect(page.locator('button:has-text("Run Scan")')).toBeVisible();
    await expect(page.locator('button:has-text("Phoenix")')).toBeVisible();

    // Wait for map to load (Loading map... disappears)
    await expect(page.locator('text=Loading map...')).toBeHidden({ timeout: 15000 });

    // Verify no map error shown
    await expect(page.locator('text=Map error')).toBeHidden();

    // Google Maps should exist
    const googleMapsExists = await page.evaluate(() => !!(window as any).google?.maps);
    expect(googleMapsExists).toBe(true);

    // City switcher works (proves React hydrated)
    await page.locator('button:has-text("Denver")').click();
    await page.waitForTimeout(500);
    const denverActive = await page.locator('button:has-text("Denver")').getAttribute('class');
    expect(denverActive).toContain('bg-white');

    // No fatal page errors (ignore removeChild hydration noise)
    const realErrors = pageErrors.filter(e => !e.includes('removeChild'));
    expect(realErrors.length).toBe(0);
  });

  test('Run Scan works and shows results', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/admin/dashboard/gridscope', { waitUntil: 'networkidle' });

    // Wait for map
    await expect(page.locator('text=Loading map...')).toBeHidden({ timeout: 15000 });

    // Click Run Scan
    await page.locator('button:has-text("Run Scan")').click();

    // Button should show Scanning state
    await expect(page.locator('text=Scanning...')).toBeVisible({ timeout: 5000 });

    // Wait for scan to complete (up to 90s for 7x7 grid)
    await expect(page.locator('button:has-text("Run Scan")')).toBeVisible({ timeout: 90000 });

    // Metric cards should appear — check the grid of 4 cards
    const metricCards = page.locator('.grid-cols-4 > div');
    await expect(metricCards).toHaveCount(4, { timeout: 5000 });

    // Competitor table should appear (at least one competitor)
    await expect(page.locator('text=Competitor Overview')).toBeVisible({ timeout: 5000 });

    // History dropdown should now have an entry
    await expect(page.locator('text=SoLV')).toBeVisible();

    // Take a screenshot for the user
    await page.screenshot({ path: 'test-results/gridscope-scan-success.png', fullPage: true });
  });
});
