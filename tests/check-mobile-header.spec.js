const { test } = require('@playwright/test');

test('capture mobile header layout on iPhone', async ({ browser }) => {
  // Test multiple iPhone sizes
  const devices = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
  ];

  for (const device of devices) {
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    });

    const page = await context.newPage();

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Wait for logo to load
    await page.waitForSelector('img[alt*="Pink Auto Glass"]', { timeout: 5000 });

    // Take screenshot of the header
    await page.screenshot({
      path: `mobile-header-${device.name.replace(/\s+/g, '-')}.png`,
      clip: { x: 0, y: 0, width: device.width, height: 120 }
    });

    console.log(`✓ Screenshot saved: mobile-header-${device.name.replace(/\s+/g, '-')}.png`);

    await context.close();
  }
});
