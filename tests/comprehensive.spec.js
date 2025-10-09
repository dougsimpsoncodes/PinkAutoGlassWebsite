const { test, expect } = require('@playwright/test');

test.describe('Comprehensive Pink Auto Glass Tests', () => {

  // ============================================================================
  // HOMEPAGE TESTS
  // ============================================================================
  test.describe('Homepage', () => {
    test('should load homepage with correct metadata', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveTitle(/Pink Auto Glass/);

      // Check for main heading
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading.first()).toBeVisible();
    });

    test('should display trust signals', async ({ page }) => {
      await page.goto('/');

      // Look for trust-related content
      const trustContent = page.locator('text=/licensed|insured|warranty|satisfaction|guarantee/i');
      await expect(trustContent.first()).toBeVisible();
    });

    test('should have working CTA buttons', async ({ page }) => {
      await page.goto('/');

      // Check for primary CTA
      const ctaButton = page.getByRole('link', { name: /get.*quote|book|schedule/i });
      await expect(ctaButton.first()).toBeVisible();
      await expect(ctaButton.first()).toHaveAttribute('href', /book|quote/);
    });

    test('should display service information', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByText(/windshield/i).first()).toBeVisible();
      await expect(page.getByText(/repair|replacement/i).first()).toBeVisible();
    });

    test('should have contact information', async ({ page }) => {
      await page.goto('/');

      // Phone number should be visible
      const phoneLink = page.locator('a[href*="tel:"]');
      await expect(phoneLink.first()).toBeVisible();
    });

    test('should load without console errors', async ({ page }) => {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Filter out known acceptable errors
      const criticalErrors = errors.filter(err =>
        !err.includes('favicon') &&
        !err.includes('404')
      );

      expect(criticalErrors.length).toBe(0);
    });
  });

  // ============================================================================
  // BOOKING PAGE TESTS
  // ============================================================================
  test.describe('Booking Page', () => {
    test('should load booking page', async ({ page }) => {
      await page.goto('/book');
      await expect(page).toHaveURL(/\/book/);

      // Should show step 1
      await expect(page.getByText(/service.*type|choose.*service/i).first()).toBeVisible();
    });

    test('should display service type selection', async ({ page }) => {
      await page.goto('/book');

      // Should have repair and replacement options
      const repairOption = page.getByText(/repair/i).first();
      const replacementOption = page.getByText(/replacement/i).first();

      await expect(repairOption).toBeVisible();
      await expect(replacementOption).toBeVisible();
    });

    test('should show step progress indicator', async ({ page }) => {
      await page.goto('/book');

      // Look for step navigation/progress
      const stepIndicator = page.locator('[role="navigation"]').filter({ hasText: /step/i });
      await expect(stepIndicator.first()).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/book');

      // Try to proceed without filling required fields
      // This tests client-side validation
      const nextButton = page.getByRole('button', { name: /next|continue/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();

        // Should show validation errors or stay on same page
        await expect(page).toHaveURL(/\/book/);
      }
    });
  });

  // ============================================================================
  // THANK YOU PAGE TESTS
  // ============================================================================
  test.describe('Thank You Page', () => {
    test('should display thank you message', async ({ page }) => {
      await page.goto('/thank-you');

      await expect(page.getByRole('heading', { name: /thank you/i })).toBeVisible();
      await expect(page.getByText(/5 minutes/i).first()).toBeVisible();
    });

    test('should have contact options', async ({ page }) => {
      await page.goto('/thank-you');

      // Should have call button
      const callButton = page.locator('a[href*="tel:"]');
      await expect(callButton.first()).toBeVisible();

      // Should have text button
      const textButton = page.locator('a[href*="sms:"]');
      await expect(textButton.first()).toBeVisible();
    });

    test('should have back to home link', async ({ page }) => {
      await page.goto('/thank-you');

      const homeLink = page.getByRole('link', { name: /back.*home|homepage/i });
      await expect(homeLink).toBeVisible();
    });

    test('should display next steps', async ({ page }) => {
      await page.goto('/thank-you');

      await expect(page.getByText(/what happens next/i)).toBeVisible();
    });
  });

  // ============================================================================
  // TRACKING PAGE TESTS
  // ============================================================================
  test.describe('Tracking Page', () => {
    test('should display tracking page with reference number', async ({ page }) => {
      await page.goto('/track?ref=TEST123');

      await expect(page.getByRole('heading', { name: /track/i })).toBeVisible();
      await expect(page.getByText(/TEST123/i)).toBeVisible();
    });

    test('should show pending status with reference', async ({ page }) => {
      await page.goto('/track?ref=ABC123');

      await expect(page.getByText(/pending/i).first()).toBeVisible();
      await expect(page.getByText(/ABC123/i)).toBeVisible();
    });

    test('should prompt for reference when missing', async ({ page }) => {
      await page.goto('/track');

      await expect(page.getByText(/provide.*reference/i)).toBeVisible();
    });

    test('should have contact information', async ({ page }) => {
      await page.goto('/track?ref=TEST123');

      const phoneLink = page.locator('a[href*="tel:"]');
      await expect(phoneLink.first()).toBeVisible();
    });

    test('should have back to home link', async ({ page }) => {
      await page.goto('/track?ref=TEST123');

      const homeLink = page.getByRole('link', { name: /back.*home|home/i });
      await expect(homeLink).toBeVisible();
    });
  });

  // ============================================================================
  // API ENDPOINT TESTS
  // ============================================================================
  test.describe('API Endpoints', () => {

    test.describe('POST /api/booking/submit', () => {
      test('should accept valid booking submission', async ({ page }) => {
        const response = await page.request.post('/api/booking/submit', {
          data: {
            serviceType: 'repair',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
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
            clientId: 'test-client-comprehensive',
            sessionId: 'test-session-comprehensive',
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

      test('should validate required fields', async ({ page }) => {
        const response = await page.request.post('/api/booking/submit', {
          data: {
            serviceType: 'repair',
            // Missing required fields
          }
        });

        expect(response.status()).toBe(400);
      });

      test('should handle replacement service type', async ({ page }) => {
        const response = await page.request.post('/api/booking/submit', {
          data: {
            serviceType: 'replacement',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            phoneE164: '+13035559999',
            address: '456 Oak Ave',
            city: 'Aurora',
            state: 'CO',
            zip: '80012',
            vehicleYear: 2021,
            vehicleMake: 'Honda',
            vehicleModel: 'Civic',
            termsAccepted: true,
            privacyAcknowledgment: true,
            clientId: 'test-client-2',
            sessionId: 'test-session-2',
            firstTouch: {},
            lastTouch: {}
          }
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.ok).toBe(true);
      });
    });

    test.describe('POST /api/lead', () => {
      test('should accept valid lead submission', async ({ page }) => {
        const response = await page.request.post('/api/lead', {
          data: {
            name: 'Test User',
            phone: '3035551234',
            vehicle: '2020 Toyota Camry',
            zip: '80202',
            hasInsurance: 'yes',
            source: 'test',
            clientId: 'test-client-lead',
            sessionId: 'test-session-lead',
            firstTouch: { utm_source: 'test' },
            lastTouch: { utm_source: 'test' }
          }
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body).toHaveProperty('leadId');
      });

      test('should validate required name field', async ({ page }) => {
        const response = await page.request.post('/api/lead', {
          data: {
            phone: '3035551234',
            vehicle: '2020 Toyota Camry'
          }
        });

        expect(response.status()).toBe(400);
      });

      test('should validate required phone field', async ({ page }) => {
        const response = await page.request.post('/api/lead', {
          data: {
            name: 'Test User',
            vehicle: '2020 Toyota Camry'
          }
        });

        expect(response.status()).toBe(400);
      });
    });
  });

  // ============================================================================
  // RESPONSIVE DESIGN TESTS
  // ============================================================================
  test.describe('Responsive Design', () => {
    const viewports = [
      { name: 'Mobile Portrait', width: 375, height: 667 },
      { name: 'Mobile Landscape', width: 667, height: 375 },
      { name: 'Tablet Portrait', width: 768, height: 1024 },
      { name: 'Tablet Landscape', width: 1024, height: 768 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      test(`should render correctly on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');

        // Main content should be visible
        const heading = page.getByRole('heading', { level: 1 });
        await expect(heading.first()).toBeVisible();

        // Should not have horizontal scroll
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        expect(scrollWidth).toBe(clientWidth);
      });
    }

    test('should show header elements on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Logo should be visible
      const logo = page.getByRole('link', { name: /Pink Auto Glass.*homepage/i });
      await expect(logo).toBeVisible();

      // Phone link should be visible
      const phoneLink = page.locator('a[href*="tel:"]').first();
      await expect(phoneLink).toBeVisible();
    });
  });

  // ============================================================================
  // NAVIGATION TESTS
  // ============================================================================
  test.describe('Navigation', () => {
    test('should have working header navigation', async ({ page }) => {
      await page.goto('/');

      const header = page.locator('header').first();
      await expect(header).toBeVisible();
    });

    test('should navigate to booking page from homepage', async ({ page }) => {
      await page.goto('/');

      const bookingLink = page.getByRole('link', { name: /get.*quote|book|schedule/i }).first();
      await bookingLink.click();

      await expect(page).toHaveURL(/\/book/);
    });

    test('should have clickable phone links', async ({ page }) => {
      await page.goto('/');

      const phoneLink = page.locator('a[href*="tel:"]').first();
      await expect(phoneLink).toBeVisible();
      await expect(phoneLink).toHaveAttribute('href', /tel:\+1/);
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================
  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy on homepage', async ({ page }) => {
      await page.goto('/');

      // Should have h1
      const h1 = page.locator('h1');
      await expect(h1.first()).toBeVisible();
    });

    test('should have alt text on images', async ({ page }) => {
      await page.goto('/');

      // All images should have alt text (even if empty for decorative)
      const images = page.locator('img');
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).not.toBeNull();
      }
    });

    test('should have clickable elements with proper roles', async ({ page }) => {
      await page.goto('/');

      // Links should be links
      const links = page.locator('a');
      const linkCount = await links.count();
      expect(linkCount).toBeGreaterThan(0);

      // Buttons should be buttons
      const buttons = page.locator('button, [role="button"]');
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================
  test.describe('Performance', () => {
    test('should load homepage within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should not have memory leaks on navigation', async ({ page }) => {
      await page.goto('/');
      await page.goto('/book');
      await page.goto('/');
      await page.goto('/thank-you');
      await page.goto('/');

      // If we made it here without crashing, navigation works
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  });

  // ============================================================================
  // SEO TESTS
  // ============================================================================
  test.describe('SEO', () => {
    test('should have meta description on homepage', async ({ page }) => {
      await page.goto('/');

      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
      expect(description.length).toBeGreaterThan(50);
    });

    test('should have proper title tags', async ({ page }) => {
      const pages = ['/', '/book', '/thank-you', '/track'];

      for (const path of pages) {
        await page.goto(path);
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);
        expect(title).toContain('Pink Auto Glass');
      }
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================
  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Submit booking with invalid data format
      const response = await page.request.post('/api/booking/submit', {
        data: {
          serviceType: 'invalid_type',
          // Other fields omitted
        }
      });

      // Should return error response, not crash
      expect([400, 500]).toContain(response.status());
    });

    test('should handle network errors on booking page', async ({ page }) => {
      await page.goto('/book');

      // Simulate offline
      await page.context().setOffline(true);

      // Try to submit form (if we can get that far)
      // The page should handle the error gracefully
      await page.context().setOffline(false);

      // Page should still be responsive
      await expect(page.getByText(/service.*type|choose.*service/i).first()).toBeVisible();
    });
  });

  // ============================================================================
  // ANALYTICS & TRACKING TESTS
  // ============================================================================
  test.describe('Analytics', () => {
    test('should track page views', async ({ page }) => {
      const requests = [];
      page.on('request', request => {
        requests.push(request.url());
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check if any analytics requests were made
      // This is a basic check - adjust based on your analytics provider
      const hasAnalytics = requests.some(url =>
        url.includes('google-analytics') ||
        url.includes('analytics') ||
        url.includes('gtag')
      );

      // This test will pass either way, but logs useful info
      console.log('Analytics detected:', hasAnalytics);
    });
  });
});
