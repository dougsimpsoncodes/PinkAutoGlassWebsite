const { test, expect } = require('@playwright/test');

test.describe('Pink Auto Glass Website', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Homepage Content', () => {
    test('should display correct page title', async ({ page }) => {
      await expect(page).toHaveTitle(/Pink Auto Glass/);
    });

    test('should display main hero section', async ({ page }) => {
      // Look for key elements using role-based selectors
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading.first()).toBeVisible();

      // Check for call-to-action buttons
      const bookButton = page.getByRole('link', { name: /book|quote|schedule/i });
      await expect(bookButton.first()).toBeVisible();
    });

    test('should display service information', async ({ page }) => {
      // Check for service-related content
      await expect(page.getByText(/windshield/i).first()).toBeVisible();
      await expect(page.getByText(/repair|replacement/i).first()).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should have visible header', async ({ page }) => {
      const header = page.locator('header').first();
      await expect(header).toBeVisible();
    });

    test('should have booking link', async ({ page }) => {
      const bookingLink = page.getByRole('link', { name: /book|quote|get started/i });
      await expect(bookingLink.first()).toBeVisible();
    });
  });

  test.describe('Booking Form', () => {
    test('should navigate to booking page', async ({ page }) => {
      // Find and click booking link
      const bookingLink = page.getByRole('link', { name: /book|quote|get started/i }).first();
      await bookingLink.click();

      // Verify we're on the booking page
      await expect(page).toHaveURL(/\/book/);

      // Check for step tracker
      const stepTracker = page.locator('[role="navigation"]').filter({ hasText: /step/i });
      await expect(stepTracker.first()).toBeVisible();
    });

    test('should show service selection in step 1', async ({ page }) => {
      await page.goto('/book');

      // Check for service type selection
      await expect(page.getByText(/service type/i).first()).toBeVisible();
      await expect(page.getByRole('button', { name: /repair/i }).or(page.getByText(/repair/i)).first()).toBeVisible();
      await expect(page.getByRole('button', { name: /replacement/i }).or(page.getByText(/replacement/i)).first()).toBeVisible();
    });

    // Photo uploads are out of scope for MVP

    // Upload validation tests removed for MVP

    // File count tests removed for MVP
  });

  test.describe('API Endpoints', () => {
    test('should accept JSON booking submission', async ({ page }) => {
      const response = await page.request.post('/api/booking/submit', {
        data: {
          serviceType: 'repair',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phoneE164: '+13035551234',
          address: '123 Main St',
          city: 'Denver',
          state: 'CO',
          zip: '80202',
          vehicleYear: 2020,
          vehicleMake: 'Toyota',
          vehicleModel: 'Camry',
          termsAccepted: true,
          privacyAcknowledgment: true,
          clientId: 'test-client',
          sessionId: 'test-session',
          firstTouch: { utm_source: 'test' },
          lastTouch: { utm_source: 'test' }
        }
      });

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body).toHaveProperty('ok', true);
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('referenceNumber');
    });

    // API upload negative tests removed for MVP
  });

  test.describe('Responsive Design', () => {
    test('should be mobile responsive', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Check that mobile menu is available
      const mobileMenu = page.getByRole('button', { name: /menu/i });
      await expect(mobileMenu.first()).toBeVisible();
    });

    test('should handle tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');

      // Main content should still be visible
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading.first()).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle rate limiting gracefully', async ({ page }) => {
      // Send multiple requests quickly to trigger rate limit
      const requests = [];
      for (let i = 0; i < 6; i++) {
        requests.push(page.request.post('/api/booking/submit', {
          data: {
            serviceType: 'repair',
            firstName: `Test${i}`,
            lastName: 'User',
            email: `test${i}@example.com`,
            phoneE164: '+13035551234',
            termsAccepted: true,
            privacyAcknowledgment: true
          }
        }));
      }

      const responses = await Promise.all(requests);

      // At least one should be rate limited
      const rateLimited = responses.some(r => r.status() === 429);
      expect(rateLimited).toBe(true);

      // Check for Retry-After header
      const limitedResponse = responses.find(r => r.status() === 429);
      if (limitedResponse) {
        expect(limitedResponse.headers()['retry-after']).toBeDefined();
      }
    });
  });
});
