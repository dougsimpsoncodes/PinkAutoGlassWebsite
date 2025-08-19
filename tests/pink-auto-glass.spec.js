const { test, expect } = require('@playwright/test');

test.describe('Pink Auto Glass Website', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Homepage Content', () => {
    test('should display correct page title and meta information', async ({ page }) => {
      await expect(page).toHaveTitle(/Pink Auto Glass - Professional Windshield Repair & Replacement in Denver/);
      
      const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
      expect(metaDescription).toContain('Expert auto glass repair and replacement services in Denver');
    });

    test('should display main hero section with correct content', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('Expert Auto Glass Services');
      await expect(page.locator('h1')).toContainText('You Can Trust');
      
      const heroText = page.locator('section.hero-section p');
      await expect(heroText).toContainText('Professional windshield repair and replacement in Denver');
    });

    test('should display all main sections', async ({ page }) => {
      await expect(page.locator('h2:has-text("Get Your Free Quote")')).toBeVisible();
      await expect(page.locator('h2:has-text("Our Services")')).toBeVisible();
      await expect(page.locator('h2:has-text("Contact Pink Auto Glass")')).toBeVisible();
    });

    test('should display service cards with correct content', async ({ page }) => {
      await expect(page.locator('h3:has-text("Windshield Replacement")')).toBeVisible();
      await expect(page.locator('h3:has-text("Windshield Repair")')).toBeVisible();
      await expect(page.locator('h3:has-text("Mobile Service")')).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should have working header navigation', async ({ page }) => {
      await expect(page.locator('nav a:has-text("Services")')).toBeVisible();
      await expect(page.locator('nav a:has-text("Locations")')).toBeVisible();
      await expect(page.locator('nav a:has-text("Vehicles")')).toBeVisible();
      await expect(page.locator('nav a:has-text("About")')).toBeVisible();
    });

    test('should have working phone links', async ({ page }) => {
      const phoneLinks = page.locator('a[href="tel:+13035557465"]');
      await expect(phoneLinks.first()).toBeVisible();
      await expect(phoneLinks.first()).toContainText('(303) 555-PINK');
    });

    test('should have working CTA buttons', async ({ page }) => {
      await expect(page.locator('a:has-text("Get Free Quote")')).toBeVisible();
      await expect(page.locator('a:has-text("Schedule Now")')).toBeVisible();
    });

    test('should display mobile menu on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const mobileMenuButton = page.locator('button[aria-label*="menu"]');
      await expect(mobileMenuButton).toBeVisible();
      
      await mobileMenuButton.click();
      await expect(page.locator('#mobile-menu')).toBeVisible();
    });
  });

  test.describe('Quote Form', () => {
    test('should display quote form with all required fields', async ({ page }) => {
      await expect(page.locator('#year')).toBeVisible();
      await expect(page.locator('#make')).toBeVisible();
      await expect(page.locator('#model')).toBeVisible();
      await expect(page.locator('#service')).toBeVisible();
      await expect(page.locator('#phone')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should have proper form labels and accessibility', async ({ page }) => {
      await expect(page.locator('label[for="year"]')).toContainText('Vehicle Year');
      await expect(page.locator('label[for="make"]')).toContainText('Make');
      await expect(page.locator('label[for="model"]')).toContainText('Model');
      await expect(page.locator('label[for="service"]')).toContainText('Service Needed');
      await expect(page.locator('label[for="phone"]')).toContainText('Phone Number');
    });

    test('should allow selecting dropdown options', async ({ page }) => {
      await page.selectOption('#year', '2023');
      await expect(page.locator('#year')).toHaveValue('2023');
      
      await page.selectOption('#make', 'Toyota');
      await expect(page.locator('#make')).toHaveValue('Toyota');
      
      await page.selectOption('#service', 'windshield-repair');
      await expect(page.locator('#service')).toHaveValue('windshield-repair');
    });

    test('should allow filling text inputs', async ({ page }) => {
      await page.fill('#model', 'Camry');
      await expect(page.locator('#model')).toHaveValue('Camry');
      
      await page.fill('#phone', '(303) 555-1234');
      await expect(page.locator('#phone')).toHaveValue('(303) 555-1234');
    });

    test('should validate required fields', async ({ page }) => {
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Check that form doesn't submit (validation should prevent it)
      const yearField = page.locator('#year');
      await expect(yearField).toHaveAttribute('required');
      
      const makeField = page.locator('#make');
      await expect(makeField).toHaveAttribute('required');
      
      const modelField = page.locator('#model');
      await expect(modelField).toHaveAttribute('required');
      
      const serviceField = page.locator('#service');
      await expect(serviceField).toHaveAttribute('required');
      
      const phoneField = page.locator('#phone');
      await expect(phoneField).toHaveAttribute('required');
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('button[aria-label*="menu"]')).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
    });

    test('should work on desktop devices', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('button[aria-label*="menu"]')).not.toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
      
      const h2Elements = page.locator('h2');
      await expect(h2Elements).toHaveCount(3); // Quote, Services, Contact
    });

    test('should have skip link for accessibility', async ({ page }) => {
      const skipLink = page.locator('a:has-text("Skip to main content")');
      await expect(skipLink).toBeInDOM(); // May not be visible until focused
    });

    test('should have proper form accessibility', async ({ page }) => {
      await expect(page.locator('form')).toHaveAttribute('role', 'form');
      await expect(page.locator('form')).toHaveAttribute('aria-label', 'Quote request form');
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Tab through form elements
      await page.keyboard.press('Tab');
      await expect(page.locator('#year')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('#make')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('#model')).toBeFocused();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      const elementsWithAria = page.locator('[aria-label]');
      const count = await elementsWithAria.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Contact Information', () => {
    test('should display contact information', async ({ page }) => {
      await expect(page.locator('text=Call Us')).toBeVisible();
      await expect(page.locator('text=Service Area')).toBeVisible();
      await expect(page.locator('text=Hours')).toBeVisible();
      
      await expect(page.locator('text=Denver Metro Area')).toBeVisible();
      await expect(page.locator('text=Mon-Fri: 8AM-6PM')).toBeVisible();
    });
  });

  test.describe('Performance & UX', () => {
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('http://localhost:3001');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(5000); // Should load in under 5 seconds
    });

    test('should have visible call-to-action buttons', async ({ page }) => {
      const ctaButtons = page.locator('.btn-primary');
      const count = await ctaButtons.count();
      expect(count).toBeGreaterThan(0);
      
      await expect(ctaButtons.first()).toBeVisible();
    });
  });
});

// Additional test configuration
test.describe('Cross-browser Testing', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`should work in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
      test.skip(currentBrowser !== browserName, `Skipping ${browserName} test`);
      
      await page.goto('http://localhost:3001');
      await expect(page.locator('h1')).toContainText('Expert Auto Glass Services');
      await expect(page.locator('form')).toBeVisible();
    });
  });
});