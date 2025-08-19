const { chromium } = require('playwright');

async function testNavigationAndForms() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const results = {
    navigation: [],
    formTesting: [],
    accessibility: [],
    issues: [],
    recommendations: []
  };

  try {
    console.log('🧭 Testing Navigation Functionality...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    // Test all navigation links
    const navLinks = await page.$$('nav a, header a');
    for (const link of navLinks) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      
      if (href && !href.startsWith('tel:') && !href.startsWith('mailto:')) {
        try {
          // Check if link is clickable
          await link.hover();
          const isVisible = await link.isVisible();
          const isEnabled = await link.isEnabled();
          
          results.navigation.push({
            text: text?.trim(),
            href,
            isVisible,
            isEnabled,
            status: 'accessible'
          });
        } catch (e) {
          results.navigation.push({
            text: text?.trim(),
            href,
            status: 'error',
            error: e.message
          });
        }
      }
    }

    console.log('📝 Testing Form Interactions...');
    
    // Test form dropdowns
    const yearSelect = await page.$('#year');
    if (yearSelect) {
      await yearSelect.click();
      await yearSelect.selectOption('2023');
      const selectedValue = await yearSelect.inputValue();
      results.formTesting.push({
        field: 'year',
        action: 'select option',
        result: selectedValue === '2023' ? 'success' : 'failed',
        value: selectedValue
      });
    }

    const makeSelect = await page.$('#make');
    if (makeSelect) {
      await makeSelect.click();
      await makeSelect.selectOption('Toyota');
      const selectedValue = await makeSelect.inputValue();
      results.formTesting.push({
        field: 'make',
        action: 'select option',
        result: selectedValue === 'Toyota' ? 'success' : 'failed',
        value: selectedValue
      });
    }

    // Test text input
    const modelInput = await page.$('#model');
    if (modelInput) {
      await modelInput.click();
      await modelInput.fill('Camry');
      const inputValue = await modelInput.inputValue();
      results.formTesting.push({
        field: 'model',
        action: 'text input',
        result: inputValue === 'Camry' ? 'success' : 'failed',
        value: inputValue
      });
    }

    const serviceSelect = await page.$('#service');
    if (serviceSelect) {
      await serviceSelect.click();
      await serviceSelect.selectOption('windshield-repair');
      const selectedValue = await serviceSelect.inputValue();
      results.formTesting.push({
        field: 'service',
        action: 'select option',
        result: selectedValue === 'windshield-repair' ? 'success' : 'failed',
        value: selectedValue
      });
    }

    const phoneInput = await page.$('#phone');
    if (phoneInput) {
      await phoneInput.click();
      await phoneInput.fill('(303) 555-1234');
      const inputValue = await phoneInput.inputValue();
      results.formTesting.push({
        field: 'phone',
        action: 'text input',
        result: inputValue === '(303) 555-1234' ? 'success' : 'failed',
        value: inputValue
      });
    }

    // Test form submission (without actually submitting)
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      const isVisible = await submitButton.isVisible();
      const isEnabled = await submitButton.isEnabled();
      const buttonText = await submitButton.textContent();
      
      results.formTesting.push({
        field: 'submit_button',
        action: 'availability check',
        result: isVisible && isEnabled ? 'success' : 'failed',
        text: buttonText?.trim(),
        visible: isVisible,
        enabled: isEnabled
      });
    }

    console.log('♿ Testing Accessibility Features...');
    
    // Test keyboard navigation through form
    await page.keyboard.press('Tab');
    let focusPath = [];
    for (let i = 0; i < 15; i++) {
      const focused = await page.evaluate(() => ({
        tag: document.activeElement.tagName,
        id: document.activeElement.id,
        className: document.activeElement.className,
        text: document.activeElement.textContent?.slice(0, 30)
      }));
      focusPath.push(focused);
      await page.keyboard.press('Tab');
    }
    
    results.accessibility.push({
      test: 'keyboard_navigation',
      result: 'completed',
      focusPath
    });

    // Test ARIA labels and roles
    const ariaElements = await page.$$eval('[aria-label], [role]', els => 
      els.map(el => ({
        tag: el.tagName,
        ariaLabel: el.getAttribute('aria-label'),
        role: el.getAttribute('role'),
        text: el.textContent?.slice(0, 50)
      }))
    );
    
    results.accessibility.push({
      test: 'aria_elements',
      result: 'completed',
      count: ariaElements.length,
      elements: ariaElements
    });

    // Test form validation
    console.log('✅ Testing Form Validation...');
    
    // Clear form and try to submit empty
    await page.$eval('#year', el => el.value = '');
    await page.$eval('#make', el => el.value = '');
    await page.$eval('#model', el => el.value = '');
    await page.$eval('#service', el => el.value = '');
    await page.$eval('#phone', el => el.value = '');
    
    if (submitButton) {
      await submitButton.click();
      await page.waitForTimeout(1000);
      
      const validationMessages = await page.$$eval(':invalid', els => 
        els.map(el => ({
          id: el.id,
          name: el.name,
          validationMessage: el.validationMessage,
          required: el.required
        }))
      );
      
      results.formTesting.push({
        field: 'validation',
        action: 'empty form submission',
        result: validationMessages.length > 0 ? 'success' : 'failed',
        validationMessages
      });
    }

    console.log('📱 Testing Mobile Menu...');
    
    // Test mobile menu functionality
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const mobileMenuButton = await page.$('button[aria-label*="menu" i]');
    if (mobileMenuButton) {
      const isVisible = await mobileMenuButton.isVisible();
      results.navigation.push({
        element: 'mobile_menu_button',
        isVisible,
        viewport: 'mobile'
      });
      
      if (isVisible) {
        await mobileMenuButton.click();
        await page.waitForTimeout(500);
        
        const mobileMenu = await page.$('#mobile-menu');
        if (mobileMenu) {
          const menuVisible = await mobileMenu.isVisible();
          results.navigation.push({
            element: 'mobile_menu',
            isVisible: menuVisible,
            viewport: 'mobile',
            action: 'opened'
          });
        }
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    results.error = error.message;
  }

  await browser.close();
  return results;
}

// Run the test
testNavigationAndForms().then(results => {
  console.log('\n📊 Navigation & Form Test Results:');
  console.log('===================================');
  console.log(`Navigation links tested: ${results.navigation.length}`);
  console.log(`Form fields tested: ${results.formTesting.length}`);
  console.log(`Accessibility tests: ${results.accessibility.length}`);
  
  // Save detailed results
  require('fs').writeFileSync('navigation-form-results.json', JSON.stringify(results, null, 2));
  console.log('\n📁 Detailed results saved to navigation-form-results.json');
});