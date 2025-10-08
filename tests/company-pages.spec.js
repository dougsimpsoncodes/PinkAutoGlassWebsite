const { test, expect } = require('@playwright/test');

// ============================================================================
// Company Pages - Contact & Careers Tests
// ============================================================================

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
  });

  test('should load with correct heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Contact Pink Auto Glass/i })).toBeVisible();
  });

  test('should display all three contact methods', async ({ page }) => {
    // Call Us card
    await expect(page.getByRole('heading', { name: 'Call Us', exact: true })).toBeVisible();
    await expect(page.getByText('(720) 918-7465').first()).toBeVisible();

    // Text Us card
    await expect(page.getByRole('heading', { name: 'Text Us', exact: true })).toBeVisible();

    // Email Us card
    await expect(page.getByRole('heading', { name: 'Email Us', exact: true })).toBeVisible();
    await expect(page.getByText(/service@pinkautoglass\.com/i).first()).toBeVisible();
  });

  test('should have working phone link', async ({ page }) => {
    const phoneLink = page.getByRole('link', { name: /Call Us/i }).first();
    await expect(phoneLink).toHaveAttribute('href', 'tel:+17209187465');
  });

  test('should have working email link', async ({ page }) => {
    const emailLink = page.getByRole('link', { name: /Email Us/i }).first();
    await expect(emailLink).toHaveAttribute('href', 'mailto:service@pinkautoglass.com');
  });

  test('should display business hours', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Business Hours/i })).toBeVisible();
    await expect(page.getByText(/Monday - Friday/i)).toBeVisible();
    await expect(page.getByText(/7:00 AM - 7:00 PM/i).first()).toBeVisible();
  });

  test('should display service area information', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Service Area', exact: true }).first()).toBeVisible();
    await expect(page.getByText('Denver').first()).toBeVisible();
    await expect(page.getByText('Aurora').first()).toBeVisible();
  });

  test('should have link to locations page', async ({ page }) => {
    const locationsLink = page.getByRole('link', { name: /View All Locations/i }).first();
    await expect(locationsLink).toBeVisible();
    await expect(locationsLink).toHaveAttribute('href', '/locations');
  });

  test('should display "Get Free Quote" CTA', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Ready to Get Started/i })).toBeVisible();
    const quoteLink = page.getByRole('link', { name: /Get Free Quote Now/i });
    await expect(quoteLink).toBeVisible();
    await expect(quoteLink).toHaveAttribute('href', '/book');
  });

  test('should display FAQ section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Common Questions/i })).toBeVisible();
    await expect(page.getByText(/How quickly can you respond/i)).toBeVisible();
    await expect(page.getByText(/insurance companies/i)).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { name: /Contact Pink Auto Glass/i })).toBeVisible();
    await expect(page.getByText('(720) 918-7465').first()).toBeVisible();
  });
});

test.describe('Careers Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/careers');
    await page.waitForLoadState('networkidle');
  });

  test('should load with correct heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Join the Pink Auto Glass Team/i })).toBeVisible();
  });

  test('should display "We\'re Hiring!" badge', async ({ page }) => {
    await expect(page.getByText(/We're Hiring!/i)).toBeVisible();
  });

  test('should display why work with us section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Why Choose Pink Auto Glass/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Competitive Pay', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Flexible Schedule', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Career Growth', exact: true })).toBeVisible();
  });

  test('should display benefits section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Benefits & Perks/i })).toBeVisible();
    await expect(page.getByText(/Health, dental, and vision insurance/i).first()).toBeVisible();
    await expect(page.getByText(/Paid training/i).first()).toBeVisible();
  });

  test('should display current job openings', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Current Openings/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Mobile Auto Glass Technician/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Customer Service Representative/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Auto Glass Apprentice/i })).toBeVisible();
  });

  test('should display job details and requirements', async ({ page }) => {
    // Check for job type badges
    await expect(page.getByText('Full-Time').first()).toBeVisible();
    await expect(page.getByText('Denver Metro Area').first()).toBeVisible();

    // Check for requirements section
    await expect(page.getByText(/Requirements:/i).first()).toBeVisible();
  });

  test('should have apply buttons for each position', async ({ page }) => {
    const applyButtons = page.getByRole('link', { name: /Apply for This Position/i });
    expect(await applyButtons.count()).toBeGreaterThan(0);

    // Check first apply button has correct email link
    const firstButton = applyButtons.first();
    const href = await firstButton.getAttribute('href');
    expect(href).toContain('mailto:careers@pinkautoglass.com');
  });

  test('should display application process', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /How to Apply/i })).toBeVisible();
    await expect(page.getByText(/Send Resume/i)).toBeVisible();
    await expect(page.getByText(/Phone Screen/i)).toBeVisible();
    await expect(page.getByText(/Interview/i)).toBeVisible();
    await expect(page.getByText(/Get Started/i).first()).toBeVisible();
  });

  test('should display contact information for careers', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Questions About Careers/i })).toBeVisible();

    const emailLink = page.getByRole('link', { name: /careers@pinkautoglass\.com/i });
    await expect(emailLink).toBeVisible();
    await expect(emailLink).toHaveAttribute('href', 'mailto:careers@pinkautoglass.com');

    const phoneLink = page.getByRole('link', { name: /\(720\) 918-7465/i }).last();
    await expect(phoneLink).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { name: /Join the Pink Auto Glass Team/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Mobile Auto Glass Technician/i })).toBeVisible();
  });
});

test.describe('Footer Navigation to Company Pages', () => {
  test('should navigate from footer to contact page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const contactLink = page.getByRole('link', { name: 'Contact', exact: true });
    await contactLink.click();
    await page.waitForURL('/contact');

    await expect(page).toHaveURL('/contact');
    await expect(page.getByRole('heading', { name: /Contact Pink Auto Glass/i })).toBeVisible();
  });

  test('should navigate from footer to careers page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const careersLink = page.getByRole('link', { name: 'Careers', exact: true });
    await careersLink.click();
    await page.waitForURL('/careers');

    await expect(page).toHaveURL('/careers');
    await expect(page.getByRole('heading', { name: /Join the Pink Auto Glass Team/i })).toBeVisible();
  });
});

test.describe('Breadcrumbs', () => {
  test('should display breadcrumbs on contact page', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('link', { name: 'Home', exact: true }).first()).toBeVisible();
    await expect(page.getByText('Contact').first()).toBeVisible();
  });

  test('should display breadcrumbs on careers page', async ({ page }) => {
    await page.goto('/careers');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('link', { name: 'Home', exact: true }).first()).toBeVisible();
    await expect(page.getByText('Careers').first()).toBeVisible();
  });

  test('breadcrumb home link should navigate to homepage', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    const homeLink = page.getByRole('link', { name: 'Home' }).first();
    await homeLink.click();
    await page.waitForURL('/');

    await expect(page).toHaveURL('/');
  });
});
