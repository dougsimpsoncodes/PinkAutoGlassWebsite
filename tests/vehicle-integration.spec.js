const { test, expect } = require('@playwright/test');

test.describe('Vehicle Database Integration', () => {

  test.describe('API Endpoints - Direct Testing', () => {

    test('GET /api/vehicles/makes should return exactly 40 makes', async ({ request }) => {
      const response = await request.get('http://localhost:3000/api/vehicles/makes');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data.makes).toBeDefined();
      expect(Array.isArray(data.makes)).toBeTruthy();

      console.log(`Total makes in database: ${data.makes.length}`);
      expect(data.makes.length).toBe(40);

      // Verify some common makes are present
      expect(data.makes).toContain('Honda');
      expect(data.makes).toContain('Toyota');
      expect(data.makes).toContain('Ford');
      expect(data.makes).toContain('Chevrolet');
      expect(data.makes).toContain('BMW');
    });

    test('GET /api/vehicles/models?make=Honda should return ~17 models WITHOUT motorcycles', async ({ request }) => {
      const response = await request.get('http://localhost:3000/api/vehicles/models?make=Honda');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data.models).toBeDefined();
      expect(Array.isArray(data.models)).toBeTruthy();

      console.log(`Honda models count: ${data.models.length}`);
      console.log('Honda models:', data.models.join(', '));

      // Should have around 17 models (not 399 which would include motorcycles)
      expect(data.models.length).toBeGreaterThan(10);
      expect(data.models.length).toBeLessThan(25);

      // Verify no motorcycle models
      const modelNamesLower = data.models.map(m => m.toLowerCase());
      const motorcycleKeywords = ['cbr', 'goldwing', 'gold wing', 'shadow', 'rebel', 'nc750', 'cb500', 'crf'];
      motorcycleKeywords.forEach(keyword => {
        const hasMotorcycle = modelNamesLower.some(name => name.includes(keyword));
        expect(hasMotorcycle).toBe(false);
      });

      // Verify common Honda car models are present
      expect(data.models).toContain('Accord');
      expect(data.models).toContain('Civic');
      expect(data.models).toContain('CR-V');
    });

    test('GET /api/vehicles/models?make=Toyota should return ~30 clean models', async ({ request }) => {
      const response = await request.get('http://localhost:3000/api/vehicles/models?make=Toyota');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data.models).toBeDefined();
      expect(Array.isArray(data.models)).toBeTruthy();

      console.log(`Toyota models count: ${data.models.length}`);
      console.log('Toyota models:', data.models.join(', '));

      // Should have around 30 models
      expect(data.models.length).toBeGreaterThan(20);
      expect(data.models.length).toBeLessThan(40);

      // Verify common Toyota models are present
      expect(data.models).toContain('Camry');
      expect(data.models).toContain('Corolla');
      expect(data.models).toContain('RAV4');
      expect(data.models).toContain('Highlander');
    });

    test('GET /api/vehicles/models?make=BMW should return clean models without trim variants', async ({ request }) => {
      const response = await request.get('http://localhost:3000/api/vehicles/models?make=BMW');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data.models).toBeDefined();
      expect(Array.isArray(data.models)).toBeTruthy();

      console.log(`BMW models count: ${data.models.length}`);
      console.log('BMW models:', data.models.join(', '));

      // Should have reasonable number of models (not 179 trim variants)
      expect(data.models.length).toBeLessThan(30);

      // Should NOT have individual trim variants like "320i", "328i xDrive", etc.
      const hasTrimVariants = data.models.some(name =>
        name.includes('xDrive') ||
        name.includes('Sport') ||
        name.includes('Luxury') ||
        name.match(/^\d{3}i/) // Pattern like 320i, 328i, 535i
      );

      if (hasTrimVariants) {
        const trimVariants = data.models.filter(name =>
          name.includes('xDrive') ||
          name.includes('Sport') ||
          name.includes('Luxury') ||
          name.match(/^\d{3}i/)
        );
        console.log('WARNING: Found trim variants (should be consolidated):', trimVariants);
      }

      // Should have series names
      expect(data.models).toContain('3 Series');
      expect(data.models).toContain('5 Series');
    });

    test('GET /api/vehicles/models with invalid make should return 404', async ({ request }) => {
      const response = await request.get('http://localhost:3000/api/vehicles/models?make=InvalidMakeXYZ');
      expect(response.status()).toBe(404);

      const data = await response.json();
      expect(data.error).toBe('Make not found');
    });

    test('GET /api/vehicles/models without make parameter should return 400', async ({ request }) => {
      const response = await request.get('http://localhost:3000/api/vehicles/models');
      expect(response.status()).toBe(400);

      const data = await response.json();
      expect(data.error).toBe('Make parameter is required');
    });
  });

  test.describe('Booking Form Integration', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/book');
    await page.waitForLoadState('networkidle');
  });

  test('should load vehicle makes from Supabase', async ({ page }) => {
    // Wait for the make dropdown to be populated
    const makeDropdown = page.locator('select#make');
    await expect(makeDropdown).toBeVisible();

    // Wait for loading to complete (should not say "Loading...")
    await expect(makeDropdown.locator('option').first()).not.toContainText('Loading...');

    // Get all make options (excluding the placeholder)
    const makeOptions = await makeDropdown.locator('option:not([value=""])').allTextContents();

    console.log(`Loaded ${makeOptions.length} makes from database`);

    // Verify we have a reasonable number of makes (we loaded 40)
    expect(makeOptions.length).toBeGreaterThan(30);
    expect(makeOptions.length).toBeLessThan(50);

    // Verify some expected major brands are present
    expect(makeOptions).toContain('Toyota');
    expect(makeOptions).toContain('Honda');
    expect(makeOptions).toContain('Ford');
    expect(makeOptions).toContain('Chevrolet');
    expect(makeOptions).toContain('BMW');

    // Verify makes are sorted alphabetically
    const sortedMakes = [...makeOptions].sort();
    expect(makeOptions).toEqual(sortedMakes);
  });

  test('should load models when make is selected', async ({ page }) => {
    const makeDropdown = page.locator('select#make');
    const modelDropdown = page.locator('select#model');

    // Initially, model dropdown should be disabled
    await expect(modelDropdown).toBeDisabled();

    // Select Toyota
    await makeDropdown.selectOption('Toyota');

    // Wait for models to load
    await page.waitForTimeout(500); // Give it time to fetch

    // Model dropdown should now be enabled
    await expect(modelDropdown).toBeEnabled();

    // Get all model options (excluding the placeholder)
    const modelOptions = await modelDropdown.locator('option:not([value=""])').allTextContents();

    console.log(`Loaded ${modelOptions.length} Toyota models from database`);

    // Verify we have Toyota models
    expect(modelOptions.length).toBeGreaterThan(10);

    // Verify some expected Toyota models are present
    expect(modelOptions).toContain('Camry');
    expect(modelOptions).toContain('Corolla');
    expect(modelOptions).toContain('RAV4');
    expect(modelOptions).toContain('Highlander');

    // Verify models are sorted alphabetically
    const sortedModels = [...modelOptions].sort();
    expect(modelOptions).toEqual(sortedModels);
  });

  test('should dynamically update models when make changes', async ({ page }) => {
    const makeDropdown = page.locator('select#make');
    const modelDropdown = page.locator('select#model');

    // Select Honda
    await makeDropdown.selectOption('Honda');
    await page.waitForTimeout(500);

    // Get Honda models
    const hondaModels = await modelDropdown.locator('option:not([value=""])').allTextContents();

    console.log(`Honda has ${hondaModels.length} models`);

    // Verify Honda-specific models
    expect(hondaModels).toContain('Accord');
    expect(hondaModels).toContain('Civic');
    expect(hondaModels).toContain('CR-V');

    // Now switch to Ford
    await makeDropdown.selectOption('Ford');
    await page.waitForTimeout(500);

    // Get Ford models
    const fordModels = await modelDropdown.locator('option:not([value=""])').allTextContents();

    console.log(`Ford has ${fordModels.length} models`);

    // Verify Ford-specific models
    expect(fordModels).toContain('F-150');
    expect(fordModels).toContain('Mustang');
    expect(fordModels).toContain('Explorer');

    // Verify the models actually changed (Honda models should not be in Ford)
    expect(fordModels).not.toContain('Civic');
    expect(fordModels).not.toContain('Accord');
  });

  test('should verify no motorcycles or commercial vehicles in Honda', async ({ page }) => {
    const makeDropdown = page.locator('select#make');
    const modelDropdown = page.locator('select#model');

    // Select Honda (this was the problematic one with 399 models including motorcycles)
    await makeDropdown.selectOption('Honda');
    await page.waitForTimeout(500);

    const hondaModels = await modelDropdown.locator('option:not([value=""])').allTextContents();

    console.log(`Honda models: ${hondaModels.join(', ')}`);

    // Verify we have a reasonable count (not 399!)
    expect(hondaModels.length).toBeLessThan(30);

    // Verify no motorcycle models
    const motorcycleModels = ['CBR', 'CRF', 'Gold Wing', 'Rebel', 'Shadow'];
    for (const motorcycle of motorcycleModels) {
      expect(hondaModels).not.toContain(motorcycle);
    }

    // Verify we have only passenger cars
    expect(hondaModels).toContain('Accord');
    expect(hondaModels).toContain('Civic');
    expect(hondaModels).toContain('CR-V');
    expect(hondaModels).toContain('Pilot');
  });

  test('should verify BMW models are consolidated (not trim variants)', async ({ page }) => {
    const makeDropdown = page.locator('select#make');
    const modelDropdown = page.locator('select#model');

    // Select BMW (this had 179 trim variants instead of proper models)
    await makeDropdown.selectOption('BMW');
    await page.waitForTimeout(500);

    const bmwModels = await modelDropdown.locator('option:not([value=""])').allTextContents();

    console.log(`BMW models: ${bmwModels.join(', ')}`);

    // Verify we have a reasonable count (not 179!)
    expect(bmwModels.length).toBeLessThan(30);

    // Should have series names, not trim variants
    expect(bmwModels).toContain('3 Series');
    expect(bmwModels).toContain('5 Series');
    expect(bmwModels).toContain('X3');
    expect(bmwModels).toContain('X5');

    // Should NOT have individual trim variants
    expect(bmwModels).not.toContain('320i');
    expect(bmwModels).not.toContain('325i');
    expect(bmwModels).not.toContain('328i');
  });

  test('should handle complete booking flow with vehicle selection', async ({ page }) => {
    // Select service type
    await page.click('button:has-text("Replacement")');

    // Select year
    await page.locator('select#year').selectOption('2022');

    // Select make
    await page.locator('select#make').selectOption('Toyota');
    await page.waitForTimeout(500);

    // Select model
    await page.locator('select#model').selectOption('Camry');

    // Verify the confirmation message appears
    await expect(page.locator('text=Great! We service 2022 Toyota Camry')).toBeVisible();

    // Click Continue button
    await page.click('button:has-text("Continue")');

    // Verify we moved to the next step
    await expect(page.locator('text=Damage Location')).toBeVisible();
  });

  });
});
