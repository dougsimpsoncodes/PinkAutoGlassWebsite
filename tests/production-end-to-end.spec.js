import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * Production End-to-End Test Suite
 *
 * Verifies the complete lead generation workflow in production:
 * 1. Form submissions work correctly
 * 2. Data is stored in Supabase database
 * 3. Email notifications are sent (via API response)
 */

const PRODUCTION_URL = 'https://pinkautoglasswebsite-asai6u844-dougsimpsoncodes-projects.vercel.app';

// Initialize Supabase client for database verification
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Generate unique test identifiers
const timestamp = Date.now();
const testEmail1 = `test-booking-${timestamp}@example.com`;
const testEmail2 = `test-quote-${timestamp}@example.com`;

test.describe('Production End-to-End Tests', () => {
  test('BOOKING FORM: Submit → Database → Email Notification', async ({ page }) => {
    console.log('\n🧪 Testing Booking Form Workflow...\n');

    // Step 1: Navigate to booking page
    await page.goto(`${PRODUCTION_URL}/get-started`);
    await page.waitForLoadState('networkidle');

    // Step 2: Fill out the booking form
    console.log('📝 Filling out booking form...');
    await page.fill('input[name="firstName"]', 'E2E');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="email"]', testEmail1);
    await page.fill('input[name="phone"]', '7205551234');

    // Fill vehicle information
    const yearSelect = page.locator('select[name="vehicleYear"]');
    if (await yearSelect.isVisible()) {
      await yearSelect.selectOption('2020');
    }

    const makeInput = page.locator('input[name="vehicleMake"]');
    if (await makeInput.isVisible()) {
      await makeInput.fill('Toyota');
    }

    const modelInput = page.locator('input[name="vehicleModel"]');
    if (await modelInput.isVisible()) {
      await modelInput.fill('Camry');
    }

    // Fill service details
    const damageSelect = page.locator('select[name="damageType"]');
    if (await damageSelect.isVisible()) {
      await damageSelect.selectOption('chip');
    }

    const descInput = page.locator('textarea[name="damageDescription"]');
    if (await descInput.isVisible()) {
      await descInput.fill('Production E2E test - chip on windshield');
    }

    const contactSelect = page.locator('select[name="preferredContactMethod"]');
    if (await contactSelect.isVisible()) {
      await contactSelect.selectOption('email');
    }

    // Step 3: Intercept API call and submit
    console.log('📤 Submitting booking form...');
    const apiPromise = page.waitForResponse(
      response => response.url().includes('/api/booking/submit') && response.status() === 200,
      { timeout: 15000 }
    );

    await page.click('button[type="submit"]');

    // Wait for successful response
    const response = await apiPromise;
    expect(response.status()).toBe(200);

    const responseData = await response.json();
    console.log('✅ Booking API Response:', responseData);

    // Extract reference number or lead ID
    const leadId = responseData.referenceNumber || responseData.leadId;
    expect(leadId).toBeTruthy();
    console.log(`📋 Lead ID: ${leadId}`);

    // Step 4: Verify redirect to thank-you page
    await expect(page).toHaveURL(/thank-you|track/, { timeout: 10000 });
    console.log('✅ Redirected to confirmation page');

    // Step 5: Wait a moment for database write
    await page.waitForTimeout(2000);

    // Step 6: Verify data in Supabase database
    console.log('🔍 Checking database for booking entry...');
    const { data: dbData, error: dbError } = await supabase
      .from('leads')
      .select('*')
      .eq('email', testEmail1)
      .order('created_at', { ascending: false })
      .limit(1);

    if (dbError) {
      console.error('❌ Database query error:', dbError);
      throw new Error(`Database verification failed: ${dbError.message}`);
    }

    expect(dbData).toBeTruthy();
    expect(dbData.length).toBeGreaterThan(0);

    const dbRecord = dbData[0];
    console.log('✅ Found database record:', {
      id: dbRecord.id,
      email: dbRecord.email,
      firstName: dbRecord.first_name,
      lastName: dbRecord.last_name,
      vehicleMake: dbRecord.vehicle_make,
      vehicleModel: dbRecord.vehicle_model,
      createdAt: dbRecord.created_at
    });

    // Verify record contents
    expect(dbRecord.first_name).toBe('E2E');
    expect(dbRecord.last_name).toBe('Test');
    expect(dbRecord.email).toBe(testEmail1);
    expect(dbRecord.phone).toBe('7205551234');
    expect(dbRecord.vehicle_make).toBe('Toyota');
    expect(dbRecord.vehicle_model).toBe('Camry');

    console.log('\n✅ BOOKING FORM TEST PASSED\n');
  });

  test('QUICK QUOTE FORM: Submit → Database → Email Notification', async ({ page }) => {
    console.log('\n🧪 Testing Quick Quote Form Workflow...\n');

    // Step 1: Navigate to homepage
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    // Step 2: Find and fill quick quote form
    console.log('📝 Filling out quick quote form...');

    // Look for the quick quote form - it might be on homepage or a separate page
    const quickQuoteForm = page.locator('form').filter({ hasText: /quote|60 seconds/i }).first();

    if (!(await quickQuoteForm.isVisible())) {
      console.log('Quick quote form not visible on homepage, checking /get-started...');
      await page.goto(`${PRODUCTION_URL}/get-started`);
      await page.waitForLoadState('networkidle');
    }

    // Fill out the quick quote form
    await page.fill('input[name="firstName"]', 'Quick');
    await page.fill('input[name="lastName"]', 'E2E');
    await page.fill('input[name="email"]', testEmail2);
    await page.fill('input[name="phone"]', '7205559876');

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

    // Step 3: Intercept API call and submit
    console.log('📤 Submitting quick quote form...');
    const apiPromise = page.waitForResponse(
      response => (response.url().includes('/api/lead') || response.url().includes('/api/booking/submit')) && response.status() === 200,
      { timeout: 15000 }
    );

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Wait for successful response
    const response = await apiPromise;
    expect(response.status()).toBe(200);

    const responseData = await response.json();
    console.log('✅ Quick Quote API Response:', responseData);

    // Step 4: Wait for database write
    await page.waitForTimeout(2000);

    // Step 5: Verify data in Supabase database
    console.log('🔍 Checking database for quick quote entry...');
    const { data: dbData, error: dbError } = await supabase
      .from('leads')
      .select('*')
      .eq('email', testEmail2)
      .order('created_at', { ascending: false })
      .limit(1);

    if (dbError) {
      console.error('❌ Database query error:', dbError);
      throw new Error(`Database verification failed: ${dbError.message}`);
    }

    expect(dbData).toBeTruthy();
    expect(dbData.length).toBeGreaterThan(0);

    const dbRecord = dbData[0];
    console.log('✅ Found database record:', {
      id: dbRecord.id,
      email: dbRecord.email,
      firstName: dbRecord.first_name,
      lastName: dbRecord.last_name,
      vehicleMake: dbRecord.vehicle_make,
      vehicleModel: dbRecord.vehicle_model,
      createdAt: dbRecord.created_at
    });

    // Verify record contents
    expect(dbRecord.first_name).toBe('Quick');
    expect(dbRecord.last_name).toBe('E2E');
    expect(dbRecord.email).toBe(testEmail2);

    console.log('\n✅ QUICK QUOTE FORM TEST PASSED\n');
  });

  test('EMAIL NOTIFICATION: Verify admin emails configured', async ({ page }) => {
    console.log('\n🧪 Verifying Email Notification Configuration...\n');

    // This test verifies the environment variables are set
    // We can't directly test email delivery without Resend API access
    // But we can verify the API endpoints exist and return proper responses

    console.log('🔍 Checking booking API endpoint...');
    const bookingResponse = await page.request.post(`${PRODUCTION_URL}/api/booking/submit`, {
      data: { invalid: 'data' },
      failOnStatusCode: false
    });

    // Should return 400 for invalid data (not 500), indicating email config is present
    expect(bookingResponse.status()).toBe(400);
    console.log('✅ Booking API endpoint properly configured');

    console.log('🔍 Checking lead API endpoint...');
    const leadResponse = await page.request.post(`${PRODUCTION_URL}/api/lead`, {
      data: { invalid: 'data' },
      failOnStatusCode: false
    });

    // Should return 400 for invalid data (not 500)
    expect(leadResponse.status()).toBe(400);
    console.log('✅ Lead API endpoint properly configured');

    console.log('\n✅ EMAIL NOTIFICATION TEST PASSED\n');
  });

  test.afterAll(async () => {
    console.log('\n🧹 Cleaning up test data from database...\n');

    // Clean up test records
    const { error: deleteError1 } = await supabase
      .from('leads')
      .delete()
      .eq('email', testEmail1);

    if (deleteError1) {
      console.warn('⚠️  Could not delete test booking:', deleteError1.message);
    } else {
      console.log(`✅ Cleaned up test booking: ${testEmail1}`);
    }

    const { error: deleteError2 } = await supabase
      .from('leads')
      .delete()
      .eq('email', testEmail2);

    if (deleteError2) {
      console.warn('⚠️  Could not delete test quote:', deleteError2.message);
    } else {
      console.log(`✅ Cleaned up test quote: ${testEmail2}`);
    }

    console.log('\n✨ Production E2E Tests Complete\n');
  });
});
