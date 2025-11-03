const { test } = require('@playwright/test');

test('analyze mobile header spacing in detail', async ({ browser }) => {
  const device = { name: 'iPhone SE', width: 375, height: 667 };

  const context = await browser.newContext({
    viewport: { width: device.width, height: device.height },
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  const measurements = await page.evaluate(() => {
    const nav = document.querySelector('nav.md\\:hidden');
    const logo = document.querySelector('nav.md\\:hidden img');
    const phoneLink = document.querySelector('nav.md\\:hidden a[href^="tel:"]');

    const navStyles = window.getComputedStyle(nav);
    const logoStyles = window.getComputedStyle(logo.parentElement);

    return {
      navPaddingTop: navStyles.paddingTop,
      navPaddingBottom: navStyles.paddingBottom,
      logoHeight: logo.offsetHeight,
      logoMarginBottom: logoStyles.marginBottom,
      phoneLinkHeight: phoneLink.offsetHeight,
      totalNavHeight: nav.offsetHeight,
      header: document.querySelector('header').offsetHeight
    };
  });

  console.log('\n=== Mobile Header Spacing Analysis ===');
  console.log(`Header total height: ${measurements.header}px`);
  console.log(`Nav padding-top: ${measurements.navPaddingTop}`);
  console.log(`Logo height: ${measurements.logoHeight}px`);
  console.log(`Logo margin-bottom: ${measurements.logoMarginBottom}`);
  console.log(`Phone link height: ${measurements.phoneLinkHeight}px`);
  console.log(`Nav padding-bottom: ${measurements.navPaddingBottom}`);
  console.log(`Nav total height: ${measurements.totalNavHeight}px`);

  const paddingTopPx = parseInt(measurements.navPaddingTop);
  const paddingBottomPx = parseInt(measurements.navPaddingBottom);
  const marginBottomPx = parseInt(measurements.logoMarginBottom);
  const totalPadding = paddingTopPx + paddingBottomPx + marginBottomPx;

  console.log(`\nTotal padding/margin: ${totalPadding}px`);
  console.log(`Content (logo + phone): ${measurements.logoHeight + measurements.phoneLinkHeight}px`);
  console.log(`\nPotential logo increase if we minimize padding:`);
  console.log(`- Remove py-3 (save ~20px), reduce mb-2 to mb-0 (save ~8px)`);
  console.log(`- Could increase logo by ~28px: 125px → 153px`);

  await context.close();
});
