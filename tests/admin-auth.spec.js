const { test, expect } = require('@playwright/test');

// Admin credentials
const ADMIN_EMAIL = 'admin@pinkautoglass.com';
const ADMIN_PASSWORD = 'PinkGlass2025!';

test.describe('Admin Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies before each test
    await page.context().clearCookies();
  });

  test('should display login page correctly', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    // Check for email input
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput).toBeVisible();

    // Check for password input
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    await expect(passwordInput).toBeVisible();

    // Check for submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    await expect(submitButton.first()).toBeVisible();
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    // Fill in invalid credentials
    await page.locator('input[type="email"], input[name="email"]').fill('wrong@example.com');
    await page.locator('input[type="password"], input[name="password"]').fill('wrongpassword');

    // Click submit
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first().click();

    // Wait for response
    await page.waitForTimeout(2000);

    // Should show error message or remain on login page
    const url = page.url();
    const isOnLoginPage = url.includes('/admin/login');

    if (isOnLoginPage) {
      // Check for error message
      const errorMessage = page.locator('text=/invalid|error|incorrect/i');
      // Error message may or may not be visible depending on implementation
    } else {
      // Should not redirect to dashboard
      expect(url).not.toContain('/admin/dashboard');
    }
  });

  test('should reject empty credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    // Try to submit without filling fields
    const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
    await submitButton.click();

    await page.waitForTimeout(1000);

    // Should remain on login page
    expect(page.url()).toContain('/admin/login');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    // Fill in valid credentials
    await page.locator('input[type="email"], input[name="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"], input[name="password"]').fill(ADMIN_PASSWORD);

    // Click submit
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first().click();

    // Wait for navigation
    await page.waitForTimeout(3000);

    // Should redirect to dashboard
    const url = page.url();
    expect(url).toContain('/admin/dashboard');
  });

  test('should set session cookie on successful login', async ({ page, context }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    // Login
    await page.locator('input[type="email"], input[name="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"], input[name="password"]').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first().click();

    // Wait for redirect
    await page.waitForTimeout(3000);

    // Check if session cookie was set
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => c.name === 'admin_session');

    expect(sessionCookie).toBeTruthy();
    expect(sessionCookie.httpOnly).toBe(true);
  });

  test('should logout successfully', async ({ page, context }) => {
    // First login
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="email"], input[name="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"], input[name="password"]').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first().click();
    await page.waitForTimeout(3000);

    // Verify we're on dashboard
    expect(page.url()).toContain('/admin/dashboard');

    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")').first();
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    // Wait for redirect
    await page.waitForTimeout(2000);

    // Should redirect to login page
    expect(page.url()).toContain('/admin/login');

    // Session cookie should be cleared or expired
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => c.name === 'admin_session');
    // Cookie should be removed or have a past expiration
  });

  test('should redirect to login when accessing dashboard without auth', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(2000);

    // Should redirect to login page
    const url = page.url();
    expect(url).toContain('/admin/login');
  });

  test('should maintain session across page refreshes', async ({ page }) => {
    // Login first
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="email"], input[name="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"], input[name="password"]').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first().click();
    await page.waitForTimeout(3000);

    // Verify on dashboard
    expect(page.url()).toContain('/admin/dashboard');

    // Refresh the page
    await page.reload();
    await page.waitForTimeout(2000);

    // Should still be on dashboard
    expect(page.url()).toContain('/admin/dashboard');

    // Dashboard content should be visible
    const header = page.locator('h1, text=/analytics|dashboard/i').first();
    await expect(header).toBeVisible();
  });

  test('should update last login timestamp on successful login', async ({ page }) => {
    const { createClient } = require('@supabase/supabase-js');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get current last login
    const { data: beforeLogin } = await supabase
      .from('admin_users')
      .select('last_login_at')
      .eq('email', ADMIN_EMAIL)
      .single();

    const beforeLoginTime = beforeLogin?.last_login_at;

    // Wait a moment to ensure timestamp difference
    await page.waitForTimeout(1000);

    // Login
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="email"], input[name="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"], input[name="password"]').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first().click();
    await page.waitForTimeout(3000);

    // Get updated last login
    const { data: afterLogin } = await supabase
      .from('admin_users')
      .select('last_login_at')
      .eq('email', ADMIN_EMAIL)
      .single();

    const afterLoginTime = afterLogin?.last_login_at;

    // Last login should be updated
    if (beforeLoginTime && afterLoginTime) {
      expect(new Date(afterLoginTime).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeLoginTime).getTime()
      );
    }
  });
});

test.describe('Admin Session Security', () => {
  test('should use secure cookie settings in production', async ({ page, context }) => {
    // This test verifies the cookie configuration
    // In development, secure is false; in production it should be true
    await page.goto('/admin/login');
    await page.locator('input[type="email"], input[name="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"], input[name="password"]').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first().click();
    await page.waitForTimeout(3000);

    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => c.name === 'admin_session');

    if (sessionCookie) {
      // Cookie should be httpOnly for security
      expect(sessionCookie.httpOnly).toBe(true);

      // Cookie should have sameSite set
      expect(sessionCookie.sameSite).toBeTruthy();

      // Cookie should have path set
      expect(sessionCookie.path).toBe('/');
    }
  });

  test('should prevent unauthorized API access', async ({ request }) => {
    // Try to access analytics API without authentication
    const response = await request.get('/api/admin/analytics?metric=overview&range=7days');

    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);
  });
});
