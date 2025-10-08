const { test, expect } = require('@playwright/test');

/**
 * Smoke Tests - Critical functionality validation
 * 5 essential tests to verify the system is working correctly
 */

test.describe('Smoke Tests - Critical Functionality', () => {

  test('1. Homepage loads correctly with all key elements', async ({ page }) => {
    await page.goto('/');

    // Page loads
    await expect(page).toHaveTitle(/Pink Auto Glass/);

    // Main heading visible
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading.first()).toBeVisible();

    // CTA button present and links to booking
    const ctaButton = page.getByRole('link', { name: /get.*quote|book|schedule/i }).first();
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveAttribute('href', /book/);

    // Phone number visible
    const phoneLink = page.locator('a[href*="tel:"]').first();
    await expect(phoneLink).toBeVisible();

    console.log('✓ Homepage loads with all critical elements');
  });

  test('2. Booking page loads and shows service selection', async ({ page }) => {
    await page.goto('/book');

    // Booking page loads
    await expect(page).toHaveURL(/\/book/);

    // Main heading visible
    await expect(page.getByRole('heading', { name: /get your.*free quote/i })).toBeVisible();

    // Repair and replacement options present
    const repairButton = page.getByRole('button', { name: /repair/i }).first();
    const replacementButton = page.getByRole('button', { name: /replacement/i }).first();
    await expect(repairButton).toBeVisible();
    await expect(replacementButton).toBeVisible();

    console.log('✓ Booking page functional with service selection');
  });

  test('3. API booking endpoint accepts valid submission', async ({ page }) => {
    const response = await page.request.post('/api/booking/submit', {
      data: {
        serviceType: 'repair',
        firstName: 'Smoke',
        lastName: 'Test',
        email: 'smoke.test@example.com',
        phoneE164: '+13035551111',
        address: '123 Test St',
        city: 'Denver',
        state: 'CO',
        zip: '80202',
        vehicleYear: 2020,
        vehicleMake: 'Toyota',
        vehicleModel: 'Camry',
        termsAccepted: true,
        privacyAcknowledgment: true,
        clientId: 'smoke-test-client',
        sessionId: 'smoke-test-session',
        firstTouch: { utm_source: 'smoke_test' },
        lastTouch: { utm_source: 'smoke_test' }
      }
    });

    // Should succeed
    expect(response.status()).toBe(200);

    // Should return expected fields
    const body = await response.json();
    expect(body).toHaveProperty('ok', true);
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('referenceNumber');

    console.log('✓ API booking endpoint functional');
    console.log(`  Reference: ${body.referenceNumber}`);
  });

  test('4. API lead endpoint accepts valid submission', async ({ page }) => {
    const response = await page.request.post('/api/lead', {
      data: {
        name: 'Smoke Test',
        phone: '3035552222',
        vehicle: '2021 Honda Civic',
        zip: '80202',
        hasInsurance: 'yes',
        source: 'smoke_test',
        clientId: 'smoke-lead-client',
        sessionId: 'smoke-lead-session',
        firstTouch: { utm_source: 'smoke_test' },
        lastTouch: { utm_source: 'smoke_test' }
      }
    });

    // Should succeed
    expect(response.status()).toBe(200);

    // Should return success
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body).toHaveProperty('leadId');

    console.log('✓ API lead endpoint functional');
    console.log(`  Lead ID: ${body.leadId}`);
  });

  test('5. Mobile responsive design works correctly', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Page should load
    await expect(page).toHaveTitle(/Pink Auto Glass/);

    // Mobile menu should be visible
    const mobileMenu = page.getByRole('button', { name: /menu/i }).first();
    await expect(mobileMenu).toBeVisible();

    // No horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBe(clientWidth);

    // Content should be visible
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading.first()).toBeVisible();

    console.log('✓ Mobile responsive design functional');
  });

});
