const { test } = require('@playwright/test');

test('capture mobile homepage layout - header to buttons', async ({ browser }) => {
  // Test on iPhone SE (smallest common screen)
  const device = { name: 'iPhone SE', width: 375, height: 667 };

  const context = await browser.newContext({
    viewport: { width: device.width, height: device.height },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
  });

  const page = await context.newPage();

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Wait for page to load
  await page.waitForSelector('img[alt*="Pink Auto Glass"]', { timeout: 5000 });

  // Capture full viewport (what user sees without scrolling)
  await page.screenshot({
    path: `mobile-homepage-initial-view.png`,
    fullPage: false
  });

  console.log('✓ Initial viewport screenshot saved: mobile-homepage-initial-view.png');

  // Capture from header through buttons section
  await page.screenshot({
    path: `mobile-homepage-header-to-buttons.png`,
    clip: { x: 0, y: 0, width: device.width, height: device.height }
  });

  console.log('✓ Header-to-buttons screenshot saved: mobile-homepage-header-to-buttons.png');

  // Scroll down slightly to see if buttons are below fold
  await page.evaluate(() => window.scrollBy(0, 100));
  await page.waitForTimeout(500);

  await page.screenshot({
    path: `mobile-homepage-scrolled-100px.png`,
    fullPage: false
  });

  console.log('✓ Scrolled view screenshot saved: mobile-homepage-scrolled-100px.png');

  await context.close();
});
