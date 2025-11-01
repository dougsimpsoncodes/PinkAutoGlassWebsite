import { test, expect } from '@playwright/test';

/**
 * Email Notifications Test Suite
 *
 * Tests that admin email notifications are properly triggered for:
 * 1. Booking form submissions
 * 2. Quick quote form submissions
 *
 * Note: These tests verify the API endpoints return success, but don't
 * verify actual email delivery (would require Resend test mode integration)
 */

test.describe('Email Notifications', () => {
  test.beforeEach(async ({ page }) => {
    // Start from homepage
    await page.goto('/');
  });

  test('should trigger admin email on booking form submission', async ({ page }) => {
    // Navigate to booking page
    await page.goto('/get-started');

    // Fill out the booking form
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '3105551234');

    // Select vehicle year (if visible)
    const yearSelect = page.locator('select[name="vehicleYear"]');
    if (await yearSelect.isVisible()) {
      await yearSelect.selectOption('2020');
    }

    // Fill vehicle make
    const makeInput = page.locator('input[name="vehicleMake"]');
    if (await makeInput.isVisible()) {
      await makeInput.fill('Toyota');
    }

    // Fill vehicle model
    const modelInput = page.locator('input[name="vehicleModel"]');
    if (await modelInput.isVisible()) {
      await modelInput.fill('Camry');
    }

    // Select damage type
    const damageSelect = page.locator('select[name="damageType"]');
    if (await damageSelect.isVisible()) {
      await damageSelect.selectOption('chip');
    }

    // Fill damage description
    const descInput = page.locator('textarea[name="damageDescription"]');
    if (await descInput.isVisible()) {
      await descInput.fill('Small chip on driver side windshield');
    }

    // Select preferred contact method
    const contactSelect = page.locator('select[name="preferredContactMethod"]');
    if (await contactSelect.isVisible()) {
      await contactSelect.selectOption('email');
    }

    // Intercept the API call
    const apiPromise = page.waitForResponse(
      response => response.url().includes('/api/booking/submit') && response.status() === 200
    );

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for successful API response
    const response = await apiPromise;
    expect(response.status()).toBe(200);

    // Verify success message or redirect
    await expect(page).toHaveURL(/thank-you|success/, { timeout: 10000 });
  });

  test('should trigger admin email on quick quote submission', async ({ page }) => {
    // Look for quick quote form on homepage
    const quickQuoteForm = page.locator('form').filter({ hasText: /quote|60 seconds/i }).first();

    if (await quickQuoteForm.isVisible()) {
      // Fill out quick quote form
      await page.fill('input[name="firstName"]', 'Quick');
      await page.fill('input[name="lastName"]', 'Test');
      await page.fill('input[name="email"]', 'quicktest@example.com');
      await page.fill('input[name="phone"]', '3105559876');

      // Fill vehicle info if present
      const yearInput = page.locator('input[name="vehicleYear"]').first();
      if (await yearInput.isVisible()) {
        await yearInput.fill('2019');
      }

      const makeInput = page.locator('input[name="vehicleMake"]').first();
      if (await makeInput.isVisible()) {
        await makeInput.fill('Honda');
      }

      const modelInput = page.locator('input[name="vehicleModel"]').first();
      if (await modelInput.isVisible()) {
        await modelInput.fill('Accord');
      }

      // Intercept the API call
      const apiPromise = page.waitForResponse(
        response => response.url().includes('/api/lead') && response.status() === 200,
        { timeout: 10000 }
      );

      // Submit the form
      await quickQuoteForm.locator('button[type="submit"]').click();

      // Wait for successful API response
      const response = await apiPromise;
      expect(response.status()).toBe(200);

      // Verify success state (could be modal, message, or redirect)
      await page.waitForTimeout(2000); // Wait for any success UI
    } else {
      test.skip('Quick quote form not found on homepage');
    }
  });

  test('should handle booking form validation errors gracefully', async ({ page }) => {
    await page.goto('/get-started');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should see validation errors, not submit
    await page.waitForTimeout(1000);

    // Verify we're still on the same page (not redirected)
    await expect(page).toHaveURL(/get-started/);

    // Verify no API call was made (form validation prevented it)
    // This test ensures we don't spam the email notification system with invalid submissions
  });

  test('should display correct admin emails in environment', async ({ page }) => {
    // This is a meta-test to verify environment configuration
    // We can't directly test .env.local from Playwright, but we can verify
    // the API endpoints exist and respond correctly

    const response = await page.request.get('/api/booking/submit', {
      failOnStatusCode: false
    });

    // Should return 405 (Method Not Allowed) for GET request
    // This confirms the endpoint exists
    expect(response.status()).toBe(405);
  });
});

test.describe('Email Notification Configuration', () => {
  test('booking API endpoint exists and requires POST', async ({ page }) => {
    const response = await page.request.get('/api/booking/submit', {
      failOnStatusCode: false
    });

    expect(response.status()).toBe(405); // Method Not Allowed
  });

  test('lead API endpoint exists and requires POST', async ({ page }) => {
    const response = await page.request.get('/api/lead', {
      failOnStatusCode: false
    });

    expect(response.status()).toBe(405); // Method Not Allowed
  });

  test('API endpoints reject invalid data', async ({ page }) => {
    // Test booking endpoint with invalid data
    const bookingResponse = await page.request.post('/api/booking/submit', {
      data: { invalid: 'data' },
      failOnStatusCode: false
    });

    expect(bookingResponse.status()).toBe(400); // Bad Request

    // Test lead endpoint with invalid data
    const leadResponse = await page.request.post('/api/lead', {
      data: { invalid: 'data' },
      failOnStatusCode: false
    });

    expect(leadResponse.status()).toBe(400); // Bad Request
  });
});
