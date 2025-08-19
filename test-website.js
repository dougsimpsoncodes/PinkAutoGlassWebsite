const { chromium } = require('playwright');
const fs = require('fs');

async function testPinkAutoGlassWebsite() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const results = {
    url: 'http://localhost:3001',
    timestamp: new Date().toISOString(),
    sections: [],
    navigation: [],
    accessibility: [],
    responsive: [],
    forms: [],
    issues: [],
    recommendations: []
  };

  try {
    console.log('🚀 Starting Pink Auto Glass website test...');
    
    // Navigate to the site
    console.log('📍 Navigating to localhost:3001...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    console.log('📸 Taking full page screenshot...');
    await page.screenshot({ 
      path: 'screenshots/homepage-full.png', 
      fullPage: true 
    });

    // Analyze page structure
    console.log('🔍 Analyzing page structure...');
    const title = await page.title();
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', els => 
      els.map(el => ({ tag: el.tagName, text: el.textContent.trim() }))
    );
    
    results.title = title;
    results.headings = headings;

    // Check for Pink Auto Glass specific content
    console.log('🎯 Looking for Pink Auto Glass content...');
    const pinkContent = await page.$$eval('*', els => {
      const text = els.map(el => el.textContent).join(' ').toLowerCase();
      return {
        hasPinkAutoGlass: text.includes('pink auto glass'),
        hasQuoteForm: text.includes('quote') || text.includes('estimate'),
        hasServices: text.includes('service') || text.includes('windshield'),
        hasContact: text.includes('contact') || text.includes('phone')
      };
    });
    results.content = pinkContent;

    // Test navigation elements
    console.log('🧭 Testing navigation...');
    const navLinks = await page.$$eval('nav a, header a', links => 
      links.map(link => ({
        text: link.textContent.trim(),
        href: link.href,
        visible: window.getComputedStyle(link).display !== 'none'
      }))
    );
    results.navigation = navLinks;

    // Test responsive design
    console.log('📱 Testing responsive design...');
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      const screenshot = `screenshots/responsive-${viewport.name.toLowerCase()}.png`;
      await page.screenshot({ path: screenshot });
      
      const layout = await page.evaluate(() => {
        const nav = document.querySelector('nav');
        const mobileMenu = document.querySelector('[aria-label*="mobile" i], [class*="mobile" i]');
        return {
          navVisible: nav ? window.getComputedStyle(nav).display !== 'none' : false,
          mobileMenuExists: !!mobileMenu,
          bodyWidth: document.body.scrollWidth
        };
      });
      
      results.responsive.push({
        viewport: viewport.name,
        ...layout
      });
    }

    // Reset to desktop for remaining tests
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Test accessibility
    console.log('♿ Testing accessibility...');
    const accessibility = await page.evaluate(() => {
      const results = {
        skipLinks: document.querySelectorAll('a[href="#main-content"], .skip-link').length,
        altAttributes: document.querySelectorAll('img[alt]').length,
        totalImages: document.querySelectorAll('img').length,
        ariaLabels: document.querySelectorAll('[aria-label]').length,
        headingStructure: [],
        focusableElements: document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').length
      };
      
      // Check heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(h => {
        results.headingStructure.push({
          level: parseInt(h.tagName.charAt(1)),
          text: h.textContent.trim()
        });
      });
      
      return results;
    });
    results.accessibility.push(accessibility);

    // Test forms
    console.log('📝 Testing forms...');
    const forms = await page.$$eval('form', forms => 
      forms.map(form => ({
        action: form.action,
        method: form.method,
        inputCount: form.querySelectorAll('input, select, textarea').length,
        hasSubmit: !!form.querySelector('input[type="submit"], button[type="submit"], button:not([type])')
      }))
    );
    results.forms = forms;

    // Test for quote form specifically
    const quoteFormExists = await page.$('form') !== null;
    if (quoteFormExists) {
      console.log('📋 Testing quote form interactions...');
      
      const formInputs = await page.$$eval('input, select, textarea', inputs => 
        inputs.map(input => ({
          type: input.type || input.tagName.toLowerCase(),
          name: input.name,
          required: input.required,
          placeholder: input.placeholder
        }))
      );
      results.formInputs = formInputs;

      // Test form validation
      try {
        const submitButton = await page.$('button[type="submit"], input[type="submit"]');
        if (submitButton) {
          await submitButton.click();
          await page.waitForTimeout(1000);
          
          const validationMessages = await page.$$eval(':invalid, .error, [aria-invalid="true"]', els => 
            els.map(el => el.textContent || el.validationMessage)
          );
          results.formValidation = validationMessages;
        }
      } catch (e) {
        results.formValidation = ['Could not test form validation'];
      }
    }

    // Test keyboard navigation
    console.log('⌨️ Testing keyboard navigation...');
    try {
      await page.keyboard.press('Tab');
      const firstFocused = await page.evaluate(() => document.activeElement.tagName);
      
      let tabCount = 0;
      let focusedElements = [firstFocused];
      
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const focused = await page.evaluate(() => ({
          tag: document.activeElement.tagName,
          text: document.activeElement.textContent?.slice(0, 50),
          class: document.activeElement.className
        }));
        focusedElements.push(focused);
        tabCount++;
      }
      
      results.keyboardNav = {
        tabCount,
        focusedElements
      };
    } catch (e) {
      results.keyboardNav = { error: e.message };
    }

    console.log('✅ Testing complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    results.error = error.message;
  }

  await browser.close();
  return results;
}

// Run the test
testPinkAutoGlassWebsite().then(results => {
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log(`Title: ${results.title}`);
  console.log(`Content Analysis:`, results.content);
  console.log(`Navigation Links: ${results.navigation.length}`);
  console.log(`Forms Found: ${results.forms.length}`);
  console.log(`Responsive Viewports Tested: ${results.responsive.length}`);
  
  // Save detailed results
  fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
  console.log('\n📁 Detailed results saved to test-results.json');
  console.log('📸 Screenshots saved to screenshots/ directory');
});