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

    test('should handle photo uploads in booking flow', async ({ page }) => {
      await page.goto('/book');

      // Navigate through steps to reach photo upload
      // Step 1: Select service
      await page.getByRole('button', { name: /repair/i }).first().click();
      await page.fill('input[placeholder*="year" i]', '2020');
      await page.fill('input[placeholder*="make" i]', 'Toyota');
      await page.fill('input[placeholder*="model" i]', 'Camry');
      await page.getByRole('button', { name: /continue|next/i }).click();

      // Step 2: Fill contact info
      await page.fill('input[placeholder*="first" i]', 'Test');
      await page.fill('input[placeholder*="last" i]', 'User');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="tel"]', '3035551234');
      await page.fill('input[placeholder*="address" i]', '123 Main St');
      await page.fill('input[placeholder*="city" i]', 'Denver');
      await page.fill('input[placeholder*="state" i]', 'CO');
      await page.fill('input[placeholder*="zip" i]', '80202');
      await page.getByRole('button', { name: /continue|next/i }).click();

      // Step 3: Photo upload section should be visible
      await expect(page.getByText(/add photos of the damage/i)).toBeVisible();

      // Check for file input
      const fileInput = page.locator('input[type="file"][accept*="image"]');
      await expect(fileInput).toBeHidden(); // Should be hidden but present (sr-only)

      // Check for upload area
      const uploadArea = page.getByRole('button', { name: /upload photo/i });
      await expect(uploadArea).toBeVisible();
    });

    test('should validate photo file types', async ({ page }) => {
      await page.goto('/book');

      // Navigate to step 3 (simplified)
      await page.evaluate(() => {
        // Direct navigation for testing
        window.location.hash = '#step3';
      });

      // Create test files programmatically
      const validImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      const invalidTextBuffer = Buffer.from('This is not an image', 'utf8');

      // Test valid image upload
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.getByRole('button', { name: /upload photo/i }).click();
      const fileChooser = await fileChooserPromise;

      await fileChooser.setFiles([
        {
          name: 'test.png',
          mimeType: 'image/png',
          buffer: validImageBuffer,
        }
      ]);

      // Should show preview
      await expect(page.locator('img[alt*="Preview"]').first()).toBeVisible();

      // Test invalid file type
      const fileChooserPromise2 = page.waitForEvent('filechooser');
      await page.getByRole('button', { name: /upload photo/i }).click();
      const fileChooser2 = await fileChooserPromise2;

      await fileChooser2.setFiles([
        {
          name: 'test.txt',
          mimeType: 'text/plain',
          buffer: invalidTextBuffer,
        }
      ]);

      // Should show error for invalid type
      await expect(page.getByText(/invalid file type/i)).toBeVisible();
    });

    test('should enforce maximum file count', async ({ page }) => {
      await page.goto('/book');

      // Navigate to upload section
      await page.evaluate(() => {
        window.location.hash = '#step3';
      });

      // Create 6 test images (exceeds max of 5)
      const validImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

      const files = Array.from({ length: 6 }, (_, i) => ({
        name: `test${i + 1}.png`,
        mimeType: 'image/png',
        buffer: validImageBuffer,
      }));

      // Try to upload 6 files
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.getByRole('button', { name: /upload photo/i }).click();
      const fileChooser = await fileChooserPromise;

      await fileChooser.setFiles(files);

      // Should show error about maximum files
      await expect(page.getByText(/maximum.*5.*files/i)).toBeVisible();

      // Should only show 5 previews
      const previews = page.locator('img[alt*="Preview"]');
      await expect(previews).toHaveCount(5);
    });
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

    test('should reject invalid file types', async ({ page }) => {
      const formData = new FormData();

      // Add payload
      const payload = JSON.stringify({
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
        privacyAcknowledgment: true
      });

      const response = await page.request.post('/api/booking/submit', {
        multipart: {
          payload: payload,
          file: {
            name: 'test.txt',
            mimeType: 'text/plain',
            buffer: Buffer.from('invalid file')
          }
        }
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty('ok', false);
      expect(body.error).toContain('Invalid file type');
    });
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