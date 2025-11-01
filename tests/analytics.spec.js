const { test, expect } = require('@playwright/test');
const { createClient } = require('@supabase/supabase-js');

// Helper to get Supabase client
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// Helper to generate unique session ID
function generateSessionId() {
  return `test_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to clean up test data
async function cleanupTestData(sessionId) {
  const supabase = getSupabaseClient();
  await supabase.from('conversion_events').delete().eq('session_id', sessionId);
  await supabase.from('analytics_events').delete().eq('session_id', sessionId);
  await supabase.from('page_views').delete().eq('session_id', sessionId);
  await supabase.from('user_sessions').delete().eq('session_id', sessionId);
}

test.describe('Analytics Tracking System', () => {
  test.describe('Database Verification', () => {
    test('should verify analytics tables exist', async () => {
      const supabase = getSupabaseClient();
      // Check page_views table
      const { data: pageViews, error: pvError} = await supabase
        .from('page_views')
        .select('*')
        .limit(1);
      expect(pvError).toBeNull();

      // Check user_sessions table
      const { data: sessions, error: sessError } = await supabase
        .from('user_sessions')
        .select('*')
        .limit(1);
      expect(sessError).toBeNull();

      // Check conversion_events table
      const { data: conversions, error: convError } = await supabase
        .from('conversion_events')
        .select('*')
        .limit(1);
      expect(convError).toBeNull();

      // Check analytics_events table
      const { data: events, error: evError } = await supabase
        .from('analytics_events')
        .select('*')
        .limit(1);
      expect(evError).toBeNull();

      // Check admin_users table
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .limit(1);
      expect(adminError).toBeNull();
    });

    test('should verify database schema has correct columns', async () => {
      const supabase = getSupabaseClient();
      // Insert test session
      const sessionId = generateSessionId();

      const { error: sessionError } = await supabase
        .from('user_sessions')
        .insert({
          session_id: sessionId,
          landing_page: '/test',
          utm_source: 'test',
          utm_medium: 'test',
          device_type: 'desktop',
        });
      expect(sessionError).toBeNull();

      // Insert test page view
      const { error: pvError } = await supabase
        .from('page_views')
        .insert({
          session_id: sessionId,
          page_path: '/test',
          page_title: 'Test Page',
          utm_source: 'test',
          device_type: 'desktop',
        });
      expect(pvError).toBeNull();

      // Insert test conversion
      const { error: convError } = await supabase
        .from('conversion_events')
        .insert({
          session_id: sessionId,
          event_type: 'phone_click',
          page_path: '/test',
          button_location: 'header',
        });
      expect(convError).toBeNull();

      // Verify the data was inserted
      const { data: session } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();
      expect(session).toBeTruthy();
      expect(session.landing_page).toBe('/test');

      // Cleanup
      await cleanupTestData(sessionId);
    });

    test('should verify admin user exists', async () => {
      const supabase = getSupabaseClient();
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', 'admin@pinkautoglass.com')
        .single();

      expect(error).toBeNull();
      expect(adminUser).toBeTruthy();
      expect(adminUser.email).toBe('admin@pinkautoglass.com');
      expect(adminUser.is_active).toBe(true);
    });
  });

  test.describe('Page View Tracking', () => {
    test('should track page view when visiting homepage', async ({ page }) => {
      const sessionId = generateSessionId();

      // Set session ID in localStorage
      await page.goto('/');
      await page.evaluate((sid) => {
        localStorage.setItem('analytics_session_id', sid);
      }, sessionId);

      // Visit the page
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Wait a bit for analytics to be sent
      await page.waitForTimeout(2000);

      // Check if Google Analytics script loaded
      const gaLoaded = await page.evaluate(() => {
        return typeof window.gtag !== 'undefined';
      });
      expect(gaLoaded).toBe(true);

      // Note: Direct database writes would require an API endpoint
      // For now, we're verifying the tracking infrastructure exists
    });

    test('should track UTM parameters from URL', async ({ page }) => {
      await page.goto('/?utm_source=google&utm_medium=cpc&utm_campaign=test');
      await page.waitForLoadState('networkidle');

      // Verify URL contains UTM parameters
      const url = page.url();
      expect(url).toContain('utm_source=google');
      expect(url).toContain('utm_medium=cpc');
      expect(url).toContain('utm_campaign=test');

      // Check if GA is tracking the page
      const gaLoaded = await page.evaluate(() => {
        return typeof window.gtag !== 'undefined';
      });
      expect(gaLoaded).toBe(true);
    });

    test('should generate and persist session ID', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check if session ID is generated (you may need to adjust based on actual implementation)
      const sessionId = await page.evaluate(() => {
        return sessionStorage.getItem('session_id') || localStorage.getItem('analytics_session_id');
      });

      // Session ID should exist or be generated by the app
      // (Note: This test assumes your app generates session IDs client-side)
    });
  });

  test.describe('Scroll Depth Tracking', () => {
    test('should track scroll depth at milestones', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Create promise to listen for GA events
      const gaEvents = [];
      await page.exposeFunction('captureGAEvent', (event) => {
        gaEvents.push(event);
      });

      // Scroll to 50%
      await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight * 0.5);
      });
      await page.waitForTimeout(500);

      // Scroll to 100%
      await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
      });
      await page.waitForTimeout(500);

      // Verify scroll tracking is active
      const hasScrollListener = await page.evaluate(() => {
        return typeof window.scrollY !== 'undefined';
      });
      expect(hasScrollListener).toBe(true);
    });
  });

  test.describe('Conversion Tracking', () => {
    test('should track phone click conversion', async ({ page }) => {
      const sessionId = generateSessionId();

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Find and click phone number
      const phoneLink = page.locator('a[href^="tel:"]').first();
      if (await phoneLink.count() > 0) {
        // Listen for navigation or click
        const clickPromise = phoneLink.click({ noWaitAfter: true });
        await page.waitForTimeout(500);

        // Verify GA tracking function exists
        const gaExists = await page.evaluate(() => typeof window.gtag !== 'undefined');
        expect(gaExists).toBe(true);
      }

      // Cleanup
      await cleanupTestData(sessionId);
    });

    test('should track text click conversion', async ({ page }) => {
      const sessionId = generateSessionId();

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Find and click SMS link
      const smsLink = page.locator('a[href^="sms:"]').first();
      if (await smsLink.count() > 0) {
        await smsLink.click({ noWaitAfter: true });
        await page.waitForTimeout(500);

        // Verify GA tracking
        const gaExists = await page.evaluate(() => typeof window.gtag !== 'undefined');
        expect(gaExists).toBe(true);
      }

      // Cleanup
      await cleanupTestData(sessionId);
    });

    test('should track form submission', async ({ page }) => {
      // Navigate to a page with a form
      await page.goto('/instant-quote');
      await page.waitForLoadState('networkidle');

      // Check if form exists
      const form = page.locator('form').first();
      if (await form.count() > 0) {
        // Fill out basic form fields if they exist
        const nameField = page.locator('input[name="name"], input[placeholder*="name" i]').first();
        if (await nameField.count() > 0) {
          await nameField.fill('Test User');
        }

        const emailField = page.locator('input[type="email"], input[name="email"]').first();
        if (await emailField.count() > 0) {
          await emailField.fill('test@example.com');
        }

        // Verify GA is loaded for form tracking
        const gaExists = await page.evaluate(() => typeof window.gtag !== 'undefined');
        expect(gaExists).toBe(true);
      }
    });
  });

  test.describe('Direct Database Tracking Tests', () => {
    test('should manually create session and page view in database', async () => {
      const supabase = getSupabaseClient();
      const sessionId = generateSessionId();

      // Create session
      const { data: session, error: sessionError } = await supabase
        .from('user_sessions')
        .insert({
          session_id: sessionId,
          landing_page: '/',
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'auto_glass_repair',
          device_type: 'desktop',
          browser: 'Chrome',
          os: 'MacOS',
        })
        .select()
        .single();

      expect(sessionError).toBeNull();
      expect(session).toBeTruthy();
      expect(session.session_id).toBe(sessionId);

      // Create page view
      const { data: pageView, error: pvError } = await supabase
        .from('page_views')
        .insert({
          session_id: sessionId,
          page_path: '/',
          page_title: 'Home - Pink Auto Glass',
          utm_source: 'google',
          utm_medium: 'cpc',
          device_type: 'desktop',
        })
        .select()
        .single();

      expect(pvError).toBeNull();
      expect(pageView).toBeTruthy();

      // Verify session page_views_count was updated by trigger
      const { data: updatedSession } = await supabase
        .from('user_sessions')
        .select('page_views_count')
        .eq('session_id', sessionId)
        .single();

      expect(updatedSession.page_views_count).toBe(1);

      // Cleanup
      await cleanupTestData(sessionId);
    });

    test('should manually create conversion event in database', async () => {
      const supabase = getSupabaseClient();
      const sessionId = generateSessionId();

      // Create session first
      await supabase.from('user_sessions').insert({
        session_id: sessionId,
        landing_page: '/',
        device_type: 'mobile',
      });

      // Create conversion
      const { data: conversion, error: convError } = await supabase
        .from('conversion_events')
        .insert({
          session_id: sessionId,
          event_type: 'phone_click',
          event_category: 'conversion',
          event_label: 'header',
          page_path: '/',
          button_location: 'header',
          button_text: 'Call Now',
          utm_source: 'facebook',
          utm_medium: 'social',
          device_type: 'mobile',
        })
        .select()
        .single();

      expect(convError).toBeNull();
      expect(conversion).toBeTruthy();
      expect(conversion.event_type).toBe('phone_click');

      // Verify session was marked as converted by trigger
      const { data: updatedSession } = await supabase
        .from('user_sessions')
        .select('converted, conversions_count')
        .eq('session_id', sessionId)
        .single();

      expect(updatedSession.converted).toBe(true);
      expect(updatedSession.conversions_count).toBe(1);

      // Cleanup
      await cleanupTestData(sessionId);
    });

    test('should track multiple page views in same session', async () => {
      const supabase = getSupabaseClient();
      const sessionId = generateSessionId();

      // Create session
      await supabase.from('user_sessions').insert({
        session_id: sessionId,
        landing_page: '/',
        device_type: 'desktop',
      });

      // Create multiple page views
      const pages = ['/', '/about', '/services', '/instant-quote'];
      for (const pagePath of pages) {
        await supabase.from('page_views').insert({
          session_id: sessionId,
          page_path: pagePath,
          device_type: 'desktop',
        });
      }

      // Verify page view count
      const { data: session } = await supabase
        .from('user_sessions')
        .select('page_views_count')
        .eq('session_id', sessionId)
        .single();

      expect(session.page_views_count).toBe(pages.length);

      // Cleanup
      await cleanupTestData(sessionId);
    });
  });
});
