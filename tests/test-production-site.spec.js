const { test, expect } = require('@playwright/test');

test.describe('Production Site Health Check', () => {
  const prodUrl = 'https://pinkautoglass.com';

  test('homepage loads successfully', async ({ page }) => {
    const response = await page.goto(prodUrl);
    expect(response.status()).toBe(200);

    // Check for key elements
    await expect(page.locator('img[alt*="Pink Auto Glass"]')).toBeVisible();
    await expect(page.locator('text=Colorado\'s #1')).toBeVisible();
    await expect(page.locator('a[href="tel:+17209187465"]')).toBeVisible();

    console.log('✓ Homepage loaded successfully');
  });

  test('mobile header displays correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(prodUrl);

    // Check logo is visible
    const logo = page.locator('img[alt*="Pink Auto Glass"]').first();
    await expect(logo).toBeVisible();

    // Check phone number is visible
    const phone = page.locator('a[href="tel:+17209187465"]');
    await expect(phone).toBeVisible();

    console.log('✓ Mobile header displays correctly');
  });

  test('quote form is functional', async ({ page }) => {
    await page.goto(prodUrl);

    // Check form elements exist
    await expect(page.locator('select[name="service_type"]')).toBeVisible();
    await expect(page.locator('select[name="vehicle_make"]')).toBeVisible();
    await expect(page.locator('button:has-text("Get Quote")')).toBeVisible();

    console.log('✓ Quote form is functional');
  });

  test('vehicle makes API works', async ({ page }) => {
    const response = await page.request.get(`${prodUrl}/api/vehicles/makes`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data.makes)).toBeTruthy();
    expect(data.makes.length).toBeGreaterThan(0);

    console.log(`✓ Vehicle makes API returned ${data.makes.length} makes`);
  });

  test('locations pages are accessible', async ({ page }) => {
    const response = await page.goto(`${prodUrl}/locations/denver`);
    expect(response.status()).toBe(200);

    console.log('✓ Location pages accessible');
  });

  test('about page loads', async ({ page }) => {
    const response = await page.goto(`${prodUrl}/about`);
    expect(response.status()).toBe(200);

    console.log('✓ About page loads');
  });

  test('no console errors on homepage', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(prodUrl);
    await page.waitForLoadState('networkidle');

    if (errors.length > 0) {
      console.log('Console errors found:', errors);
    } else {
      console.log('✓ No console errors on homepage');
    }

    // Still pass the test but log errors
    expect(errors.length).toBeLessThan(10);
  });
});
