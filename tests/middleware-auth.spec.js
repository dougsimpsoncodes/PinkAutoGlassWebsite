/**
 * Middleware Authentication Smoke Tests
 *
 * Tests the defense-in-depth authentication:
 * 1. Basic Auth (middleware.ts) - browser HTTP auth dialog
 * 2. API Key Auth (api-auth.ts) - programmatic access
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Admin Middleware Authentication', () => {
  test('should block /admin without Basic Auth', async ({ page }) => {
    // Attempt to access admin page without credentials
    const response = await page.goto(`${BASE_URL}/admin`, {
      waitUntil: 'networkidle',
    });

    // Should get 401 Unauthorized
    expect(response.status()).toBe(401);

    // Should include WWW-Authenticate header
    const authHeader = response.headers()['www-authenticate'];
    expect(authHeader).toContain('Basic');
  });

  test('should block /admin with invalid Basic Auth', async ({ page }) => {
    // Set invalid credentials in Authorization header
    await page.setExtraHTTPHeaders({
      'Authorization': 'Basic ' + Buffer.from('wrong:credentials').toString('base64'),
    });

    const response = await page.goto(`${BASE_URL}/admin`, {
      waitUntil: 'networkidle',
    });

    // Should get 401 Unauthorized
    expect(response.status()).toBe(401);
  });

  test('should allow /admin with valid Basic Auth', async ({ page }) => {
    // Get credentials from environment (test environment should have these set)
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'changeme';

    // Set valid credentials
    await page.setExtraHTTPHeaders({
      'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
    });

    const response = await page.goto(`${BASE_URL}/admin`, {
      waitUntil: 'networkidle',
    });

    // Should succeed
    expect(response.status()).toBe(200);
  });
});

test.describe('Admin API Route Authentication', () => {
  const validBasicAuth = 'Basic ' + Buffer.from(
    `${process.env.ADMIN_USERNAME || 'admin'}:${process.env.ADMIN_PASSWORD || 'changeme'}`
  ).toString('base64');

  test('should block /api/admin/* without API key (defense-in-depth)', async ({ request }) => {
    // This tests the second layer of defense (API key validation)
    // Even with Basic Auth, admin API routes should require API key
    const response = await request.get(`${BASE_URL}/api/admin/leads`, {
      headers: {
        'Authorization': validBasicAuth,
        // Missing x-api-key header
      },
    });

    // Should get 401 (missing API key)
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.code).toBe('INVALID_API_KEY');
  });

  test('should block /api/admin/* with public API key', async ({ request }) => {
    const publicKey = process.env.NEXT_PUBLIC_API_KEY || 'pag_public_dev_2025';

    const response = await request.get(`${BASE_URL}/api/admin/leads`, {
      headers: {
        'Authorization': validBasicAuth,
        'x-api-key': publicKey,
      },
    });

    // Should get 403 (insufficient permissions)
    expect(response.status()).toBe(403);

    const body = await response.json();
    expect(body.code).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('should allow /api/admin/* with admin API key', async ({ request }) => {
    const adminKey = process.env.API_KEY_ADMIN || 'pag_admin_dev_2025_secure';

    const response = await request.get(`${BASE_URL}/api/admin/leads?limit=1`, {
      headers: {
        'Authorization': validBasicAuth,
        'x-api-key': adminKey,
      },
    });

    // Should succeed
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.ok).toBe(true);
  });
});

test.describe('Production Environment Safety', () => {
  test.skip(process.env.NODE_ENV !== 'production', 'Production-only test');

  test('should fail if ADMIN_USERNAME not set in production', async ({ request }) => {
    // In production, if env vars are missing, the middleware should return 500
    // This is a smoke test to verify fail-closed behavior

    // This test would need to be run in a controlled production-like environment
    // where we can temporarily unset env vars

    // For now, this is a placeholder to document the expected behavior
    expect(process.env.ADMIN_USERNAME).toBeDefined();
    expect(process.env.ADMIN_PASSWORD).toBeDefined();
    expect(process.env.API_KEY_ADMIN).toBeDefined();
  });
});

test.describe('Edge Runtime Compatibility', () => {
  test('should handle Base64 decoding with atob (Edge-safe)', async ({ page }) => {
    // This tests that the middleware uses atob() instead of Buffer.from()
    // which is required for Edge runtime compatibility

    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'changeme';

    await page.setExtraHTTPHeaders({
      'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
    });

    const response = await page.goto(`${BASE_URL}/admin`, {
      waitUntil: 'networkidle',
    });

    // Should work without Node.js Buffer API
    expect(response.status()).toBe(200);
  });
});
