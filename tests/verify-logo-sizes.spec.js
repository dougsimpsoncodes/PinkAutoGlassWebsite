const { test } = require('@playwright/test');

test('verify logo sizes - mobile vs desktop', async ({ browser }) => {
  // Test Mobile (iPhone SE)
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  const mobileLogoHeight = await mobilePage.evaluate(() => {
    // Get all logos and find the visible one
    const logos = document.querySelectorAll('img[alt*="Pink Auto Glass"]');
    for (let logo of logos) {
      const style = window.getComputedStyle(logo);
      // Check if logo is visible (not display:none or hidden)
      if (style.display !== 'none' && style.visibility !== 'hidden' && logo.offsetHeight > 0) {
        return logo.offsetHeight;
      }
    }
    return 0;
  });

  await mobilePage.screenshot({
    path: 'mobile-logo-verification.png',
    clip: { x: 0, y: 0, width: 375, height: 150 }
  });

  await mobileContext.close();

  // Test Desktop
  const desktopContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  const desktopLogoHeight = await desktopPage.evaluate(() => {
    // Get all logos and find the visible one
    const logos = document.querySelectorAll('img[alt*="Pink Auto Glass"]');
    for (let logo of logos) {
      const style = window.getComputedStyle(logo);
      // Check if logo is visible (not display:none or hidden)
      if (style.display !== 'none' && style.visibility !== 'hidden' && logo.offsetHeight > 0) {
        return logo.offsetHeight;
      }
    }
    return 0;
  });

  await desktopPage.screenshot({
    path: 'desktop-logo-verification.png',
    clip: { x: 0, y: 0, width: 1920, height: 250 }
  });

  await desktopContext.close();

  console.log(`\n✓ Mobile logo height: ${mobileLogoHeight}px (expected: 80px)`);
  console.log(`✓ Desktop logo height: ${desktopLogoHeight}px (expected: 194px)`);

  if (mobileLogoHeight === 80 && desktopLogoHeight === 194) {
    console.log(`\n✅ SUCCESS: Logo sizes are correct!`);
  } else {
    console.log(`\n❌ ERROR: Logo sizes don't match expectations`);
  }
});
