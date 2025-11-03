const { test } = require('@playwright/test');

test('measure mobile header height', async ({ browser }) => {
  const device = { name: 'iPhone SE', width: 375, height: 667 };

  const context = await browser.newContext({
    viewport: { width: device.width, height: device.height },
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Measure header height
  const headerHeight = await page.evaluate(() => {
    const header = document.querySelector('header');
    return header ? header.offsetHeight : 0;
  });

  // Measure hero section top position
  const heroTop = await page.evaluate(() => {
    const hero = document.querySelector('.bg-gradient-hero');
    return hero ? hero.getBoundingClientRect().top : 0;
  });

  // Take screenshot
  await page.screenshot({
    path: `mobile-header-measurement.png`,
    fullPage: false
  });

  console.log(`✓ Mobile header height: ${headerHeight}px`);
  console.log(`✓ Hero section top position: ${heroTop}px`);
  console.log(`✓ Gap needed: ${headerHeight}px or more`);

  await context.close();
});
