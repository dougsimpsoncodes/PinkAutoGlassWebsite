# Performance & Accessibility Testing Runbook
## Pink Auto Glass Website - Testing Procedures & Tools

### Quick Reference
| Target | Performance | Accessibility | SEO | Best Practices |
|--------|-------------|---------------|-----|----------------|
| **Production** | ≥ 90 | ≥ 95 | ≥ 95 | ≥ 90 |
| **Staging** | ≥ 85 | ≥ 90 | ≥ 90 | ≥ 85 |
| **Dev** | ≥ 80 | ≥ 85 | ≥ 85 | ≥ 80 |

---

## Testing Tools & Setup

### Required Tools Installation

#### 1. Lighthouse CLI
```bash
# Install globally
npm install -g @lhci/cli lighthouse

# Verify installation
lighthouse --version
lhci --version
```

#### 2. Accessibility Testing Tools
```bash
# Pa11y for automated accessibility testing
npm install -g pa11y pa11y-ci

# axe-core for unit testing
npm install --save-dev @axe-core/playwright @axe-core/cli

# Verify installation
pa11y --version
axe --version
```

#### 3. Performance Monitoring Tools
```bash
# WebPageTest CLI
npm install -g webpagetest

# Bundle analyzer
npm install --save-dev webpack-bundle-analyzer next-bundle-analyzer

# Performance monitoring
npm install --save-dev @next/bundle-analyzer
```

#### 4. Browser Testing Setup
```bash
# Playwright for cross-browser testing
npm install --save-dev @playwright/test

# Initialize Playwright
npx playwright install
```

### Environment Configuration

#### Lighthouse CI Configuration
Create `lighthouserc.js` in project root:
```javascript
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/services/windshield-repair',
        'http://localhost:3000/services/windshield-replacement', 
        'http://localhost:3000/booking',
        'http://localhost:3000/areas/denver'
      ],
      startServerCommand: 'npm run build && npm run start',
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        preset: 'desktop', // Also test 'mobile'
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1
        }
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
```

#### Pa11y Configuration  
Create `.pa11yrc` in project root:
```json
{
  "standard": "WCAG2AA",
  "level": "AA",
  "reporter": "cli",
  "timeout": 30000,
  "wait": 3000,
  "chromeLaunchConfig": {
    "args": [
      "--no-sandbox",
      "--disable-dev-shm-usage"
    ]
  },
  "actions": [
    "wait for element #main-content to be visible"
  ]
}
```

---

## Hero Video Performance Testing Procedures

### 1. Hero Video Performance Testing

#### Hero Video Load Testing
```bash
# Test hero video performance specifically
lighthouse http://localhost:3000 \
  --throttling.rttMs=150 \
  --throttling.throughputKbps=1600 \
  --throttling.cpuSlowdownMultiplier=4 \
  --preset=desktop \
  --view

# Test mobile (should show no video loading)
lighthouse http://localhost:3000 \
  --preset=mobile \
  --emulated-form-factor=mobile \
  --view

# Test with slow 3G (video should not load)
lighthouse http://localhost:3000 \
  --throttling.rttMs=300 \
  --throttling.throughputKbps=400 \
  --throttling.cpuSlowdownMultiplier=4 \
  --view
```

#### Hero Poster Image Optimization Testing
```bash
# Test poster image formats and sizes
# Check if AVIF is served to supporting browsers
curl -H "Accept: image/avif,image/webp,image/*,*/*" http://localhost:3000/images/hero-poster.avif -I

# Verify WebP fallback
curl -H "Accept: image/webp,image/*,*/*" http://localhost:3000/images/hero-poster.webp -I

# Test JPEG fallback
curl -H "Accept: image/*,*/*" http://localhost:3000/images/hero-poster.jpg -I

# Check file sizes meet requirements
ls -la public/images/hero-poster.*
# Expected: AVIF ≤45KB, WebP ≤60KB, JPEG ≤80KB
```

#### Hero Video Loading Logic Testing
```javascript
// Test hero video loading conditions
// Add to browser console for testing

function testHeroVideoConditions() {
  const conditions = {
    screenWidth: window.innerWidth >= 1024,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    connectionSpeed: navigator.connection?.effectiveType || 'unknown',
    dataSaver: navigator.connection?.saveData || false
  };
  
  console.log('Hero Video Loading Conditions:', conditions);
  
  const shouldLoadVideo = conditions.screenWidth && 
                         !conditions.reducedMotion && 
                         !conditions.dataSaver &&
                         !['slow-2g', '2g'].includes(conditions.connectionSpeed);
  
  console.log('Should load hero video:', shouldLoadVideo);
  
  return shouldLoadVideo;
}

// Run test
testHeroVideoConditions();
```

#### Mobile vs Desktop Hero Testing
```bash
# Create comprehensive mobile/desktop test script
cat << 'EOF' > scripts/hero-video-test.sh
#!/bin/bash
echo "Hero Video Performance Test Suite"
echo "===================================="

# Test 1: Desktop with video
echo "1. Testing Desktop Hero Video..."
lighthouse http://localhost:3000 \
  --preset=desktop \
  --emulated-form-factor=desktop \
  --throttling.rttMs=40 \
  --throttling.throughputKbps=10240 \
  --output=json \
  --output-path=reports/desktop-hero.json

# Test 2: Mobile without video  
echo "2. Testing Mobile Hero (poster only)..."
lighthouse http://localhost:3000 \
  --preset=mobile \
  --emulated-form-factor=mobile \
  --throttling.rttMs=150 \
  --throttling.throughputKbps=1600 \
  --output=json \
  --output-path=reports/mobile-hero.json

# Test 3: Reduced motion preference
echo "3. Testing with reduced motion..."
lighthouse http://localhost:3000 \
  --preset=desktop \
  --chrome-flags="--force-prefers-reduced-motion" \
  --output=json \
  --output-path=reports/reduced-motion-hero.json

# Analyze results
node scripts/analyze-hero-performance.js
EOF

chmod +x scripts/hero-video-test.sh
```

#### Hero Video Resource Monitoring
```javascript
// Add to _app.tsx or layout.tsx for hero video monitoring
const monitorHeroVideoPerformance = () => {
  const heroVideo = document.querySelector('.hero-video');
  const heroPoster = document.querySelector('.hero-poster img');
  
  if (heroPoster) {
    // Monitor poster image load time (critical for LCP)
    const posterObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes('hero-poster')) {
          console.log('Hero poster load time:', entry.duration + 'ms');
          
          // Send to analytics
          gtag('event', 'hero_poster_load', {
            event_category: 'Performance',
            value: Math.round(entry.duration)
          });
        }
      });
    });
    
    posterObserver.observe({ entryTypes: ['resource'] });
  }
  
  if (heroVideo) {
    // Monitor video load and play events
    heroVideo.addEventListener('loadstart', () => {
      console.log('Hero video load started');
    });
    
    heroVideo.addEventListener('canplay', () => {
      const loadTime = performance.now();
      console.log('Hero video can play at:', loadTime + 'ms');
      
      gtag('event', 'hero_video_ready', {
        event_category: 'Performance', 
        value: Math.round(loadTime)
      });
    });
    
    heroVideo.addEventListener('error', (e) => {
      console.error('Hero video error:', e);
      gtag('event', 'hero_video_error', {
        event_category: 'Error',
        event_label: e.message
      });
    });
  }
};

// Initialize monitoring after DOM load
document.addEventListener('DOMContentLoaded', monitorHeroVideoPerformance);
```

### 2. Poster Image Optimization Workflow

#### Image Conversion & Optimization Script
```bash
# Create automated poster optimization workflow
cat << 'EOF' > scripts/optimize-hero-poster.sh
#!/bin/bash
echo "Hero Poster Image Optimization Workflow"
echo "======================================"

# Input source image (should be high quality)
SOURCE_IMAGE="$1"
if [ -z "$SOURCE_IMAGE" ]; then
  echo "Usage: $0 <source-image.jpg>"
  exit 1
fi

# Create output directory
mkdir -p public/images/optimized

# Generate AVIF (best compression)
echo "Generating AVIF format..."
npx @squoosh/cli \
  --avif '{"cqLevel":35,"cqAlphaLevel":-1,"denoiseLevel":0,"tileColsLog2":0,"tileRowsLog2":0,"speed":6,"subsample":1,"chromaDeltaQ":false,"sharpness":0,"tune":0}' \
  --output-dir public/images/optimized \
  "$SOURCE_IMAGE"

# Generate WebP (good compression) 
echo "Generating WebP format..."
npx @squoosh/cli \
  --webp '{"quality":85,"target_size":0,"target_PSNR":0,"method":4,"sns_strength":50,"filter_strength":60,"filter_sharpness":0,"filter_type":1,"partitions":0,"segments":4,"pass":1,"show_compressed":0,"preprocessing":0,"autofilter":0,"partition_limit":0,"alpha_compression":1,"alpha_filtering":1,"alpha_quality":100,"lossless":0,"exact":0,"image_hint":0,"emulate_jpeg_size":0,"thread_level":0,"low_memory":0,"near_lossless":100,"use_delta_palette":0,"use_sharp_yuv":0}' \
  --output-dir public/images/optimized \
  "$SOURCE_IMAGE"

# Generate JPEG fallback
echo "Generating JPEG fallback..."
npx @squoosh/cli \
  --mozjpeg '{"quality":88,"baseline":false,"arithmetic":false,"progressive":true,"optimize_coding":true,"smoothing":0,"color_space":3,"quant_table":3,"trellis_multipass":false,"trellis_opt_zero":false,"trellis_opt_table":false,"trellis_loops":1,"auto_subsample":true,"chroma_subsample":2,"separate_chroma_quality":false,"chroma_quality":75}' \
  --output-dir public/images/optimized \
  "$SOURCE_IMAGE"

# Check file sizes
echo "\nOptimized file sizes:"
ls -lh public/images/optimized/

# Validate against requirements
echo "\nValidating against size requirements..."
AVIF_SIZE=$(stat -c%s public/images/optimized/*.avif 2>/dev/null || echo "0")
WEBP_SIZE=$(stat -c%s public/images/optimized/*.webp 2>/dev/null || echo "0")
JPEG_SIZE=$(stat -c%s public/images/optimized/*.jpg 2>/dev/null || echo "0")

# Size limits in bytes
AVIF_LIMIT=46080  # 45KB
WEBP_LIMIT=61440  # 60KB  
JPEG_LIMIT=81920  # 80KB

if [ "$AVIF_SIZE" -gt "$AVIF_LIMIT" ]; then
  echo "❌ AVIF size ($AVIF_SIZE bytes) exceeds limit (45KB)"
else
  echo "✅ AVIF size acceptable"
fi

if [ "$WEBP_SIZE" -gt "$WEBP_LIMIT" ]; then
  echo "❌ WebP size ($WEBP_SIZE bytes) exceeds limit (60KB)"
else
  echo "✅ WebP size acceptable"
fi

if [ "$JPEG_SIZE" -gt "$JPEG_LIMIT" ]; then
  echo "❌ JPEG size ($JPEG_SIZE bytes) exceeds limit (80KB)" 
else
  echo "✅ JPEG size acceptable"
fi

echo "\nOptimization complete!"
EOF

chmod +x scripts/optimize-hero-poster.sh
```

#### Responsive Image Testing
```javascript
// Test responsive hero poster loading
const testResponsiveHeroPoster = () => {
  const picture = document.querySelector('.hero-poster');
  if (!picture) return;
  
  const sources = picture.querySelectorAll('source');
  const img = picture.querySelector('img');
  
  console.log('Testing responsive hero poster:');
  
  // Test AVIF support
  const supportsAVIF = document.createElement('canvas')
    .toDataURL('image/avif').indexOf('image/avif') === 5;
  console.log('AVIF support:', supportsAVIF);
  
  // Test WebP support  
  const supportsWebP = document.createElement('canvas')
    .toDataURL('image/webp').indexOf('image/webp') === 5;
  console.log('WebP support:', supportsWebP);
  
  // Monitor which source is actually used
  const currentSrc = img.currentSrc || img.src;
  console.log('Current image source:', currentSrc);
  
  // Test image load performance
  img.addEventListener('load', function() {
    const naturalWidth = this.naturalWidth;
    const naturalHeight = this.naturalHeight;
    const displayWidth = this.offsetWidth;
    const displayHeight = this.offsetHeight;
    
    console.log(`Image loaded: ${naturalWidth}x${naturalHeight} (natural) -> ${displayWidth}x${displayHeight} (display)`);
    
    // Check if we're serving oversized images
    const oversized = naturalWidth > displayWidth * 1.5 || naturalHeight > displayHeight * 1.5;
    if (oversized) {
      console.warn('⚠️ Hero poster may be oversized for current display');
    }
  });
};

// Run test
testResponsiveHeroPoster();
```

### 3. Performance Testing Procedures

#### 3.1. Local Performance Testing

#### Quick Hero Performance Check
```bash
# Single page test focusing on hero performance
lighthouse http://localhost:3000 --view --throttling-method=devtools

# Test desktop hero video loading
lighthouse http://localhost:3000 --preset=desktop --view \
  --emulated-form-factor=desktop

# Test mobile hero (poster only)
lighthouse http://localhost:3000 --preset=mobile --view \
  --emulated-form-factor=mobile

# Test specific hero metrics
lighthouse http://localhost:3000 \
  --output=html \
  --output-path=./reports/hero-performance.html \
  --only-categories=performance \
  --throttling.rttMs=150 \
  --throttling.throughputKbps=1600
```

#### Hero Video File Size Validation
```bash
# Check hero video file sizes
echo "Checking hero video file sizes..."
ls -lh public/videos/hero-loop.*

# Validate against requirements
WEBM_SIZE=$(stat -c%s public/videos/hero-loop.webm 2>/dev/null || echo "0")
MP4_SIZE=$(stat -c%s public/videos/hero-loop.mp4 2>/dev/null || echo "0")

WEBM_LIMIT=768000  # 750KB
MP4_LIMIT=921600   # 900KB

if [ "$WEBM_SIZE" -gt "$WEBM_LIMIT" ]; then
  echo "❌ WebM video size ($WEBM_SIZE bytes) exceeds 750KB limit"
else
  echo "✅ WebM video size acceptable"
fi

if [ "$MP4_SIZE" -gt "$MP4_LIMIT" ]; then
  echo "❌ MP4 video size ($MP4_SIZE bytes) exceeds 900KB limit"
else
  echo "✅ MP4 video size acceptable"
fi
```

#### Comprehensive Hero Performance Suite
```bash
# Run full hero performance test suite
echo "Running comprehensive hero performance tests..."

# Test 1: Desktop hero with video
lhci collect --url="http://localhost:3000" --numberOfRuns=3 \
  --settings.preset="desktop" \
  --settings.emulatedFormFactor="desktop"

# Test 2: Mobile hero with poster only  
lhci collect --url="http://localhost:3000" --numberOfRuns=3 \
  --settings.preset="mobile" \
  --settings.emulatedFormFactor="mobile"

# Test 3: Slow connection (should skip video)
lighthouse http://localhost:3000 \
  --throttling.rttMs=300 \
  --throttling.throughputKbps=400 \
  --throttling.cpuSlowdownMultiplier=4 \
  --preset=desktop \
  --output=json \
  --output-path=reports/hero-slow-connection.json

# Test 4: Hero LCP timing specifically
lighthouse http://localhost:3000 \
  --throttling.rttMs=40 \
  --throttling.throughputKbps=10240 \
  --preset=desktop \
  --only-categories=performance \
  --output=json \
  --output-path=reports/hero-lcp-analysis.json

# Analyze hero-specific results
node scripts/analyze-hero-performance.js

# Bundle size analysis (check hero video impact)
npm run analyze
```

#### Hero Video Network Testing
```bash
# Test hero video on different connection speeds
echo "Testing hero video on various connection speeds..."

# Fast 4G - should load video
lighthouse http://localhost:3000 \
  --throttling.rttMs=40 \
  --throttling.throughputKbps=10240 \
  --preset=desktop \
  --output=json \
  --output-path=reports/hero-4g.json

# 3G - should load video but slower  
lighthouse http://localhost:3000 \
  --throttling.rttMs=150 \
  --throttling.throughputKbps=1600 \
  --preset=desktop \
  --output=json \
  --output-path=reports/hero-3g.json

# Slow 3G - should skip video
lighthouse http://localhost:3000 \
  --throttling.rttMs=300 \
  --throttling.throughputKbps=400 \
  --preset=desktop \
  --output=json \
  --output-path=reports/hero-slow-3g.json

# Compare results
node scripts/compare-hero-network-performance.js
```

### 2. WebPageTest Integration
```bash
# Test from Denver location (closest to target audience)
webpagetest test http://pinkautoglass.com \
  --location "Dulles:Chrome" \
  --connectivity "3G" \
  --runs 3 \
  --video

# Mobile device testing
webpagetest test http://pinkautoglass.com \
  --location "Dulles:Chrome.Mobile" \
  --connectivity "3GFast" \
  --runs 5
```

### 3. Core Web Vitals Monitoring

#### Real User Monitoring Setup
```javascript
// Add to _app.tsx or layout.tsx with hero video context
import { getCLS, getFID, getFCP, getLCP, getTTFB, getINP } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to Google Analytics 4
  gtag('event', metric.name, {
    event_category: 'Web Vitals',
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_label: metric.id,
    non_interaction: true,
  });
}

// Hero-specific performance tracking
function trackHeroPerformance() {
  // Track if hero video loaded
  const heroVideo = document.querySelector('.hero-video');
  const isDesktop = window.innerWidth >= 1024;
  
  gtag('event', 'hero_strategy', {
    event_category: 'Performance',
    event_label: isDesktop ? 'desktop_video' : 'mobile_poster',
    value: isDesktop ? 1 : 0
  });
  
  if (heroVideo && isDesktop) {
    heroVideo.addEventListener('loadstart', () => {
      gtag('event', 'hero_video_load_start', {
        event_category: 'Performance',
        event_label: 'video_loading'
      });
    });
    
    heroVideo.addEventListener('canplaythrough', () => {
      gtag('event', 'hero_video_ready', {
        event_category: 'Performance',
        event_label: 'video_playable'
      });
    });
  }
}

// Measure all Core Web Vitals (updated for 2024)
getCLS(sendToAnalytics);
getINP(sendToAnalytics);  // Replaces FID
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);

// Initialize hero tracking
document.addEventListener('DOMContentLoaded', trackHeroPerformance);
```

#### Performance Budget Monitoring
```bash
# Check bundle sizes
npm run build
npm run analyze

# Fail build if budgets exceeded
cat << 'EOF' > scripts/check-bundle-size.js
const fs = require('fs');
const path = require('path');

const BUNDLE_SIZE_LIMIT = 300 * 1024; // 300KB
const bundlePath = path.join('.next', 'static', 'chunks');

// Check bundle sizes and fail if over limit
// Implementation details...
EOF

node scripts/check-bundle-size.js
```

---

## Accessibility Testing Procedures

### 1. Automated Accessibility Testing

#### Pa11y Testing Suite
```bash
# Single page test
pa11y http://localhost:3000

# Multiple pages with config
pa11y-ci --sitemap http://localhost:3000/sitemap.xml

# Test booking flow with actions
pa11y http://localhost:3000/booking \
  --actions "click element #start-booking" \
  --actions "wait for element #step-1 to be visible" \
  --standard WCAG2AA
```

#### axe-core Testing
```javascript
// Create tests/accessibility.test.js
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('Accessibility Tests', () => {
  test('Homepage should not have accessibility violations', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
      
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Booking flow should be accessible', async ({ page }) => {
    await page.goto('http://localhost:3000/booking');
    
    // Test each step of booking flow
    for (let step = 1; step <= 5; step++) {
      await page.waitForSelector(`[data-step="${step}"]`);
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
        
      expect(results.violations).toEqual([]);
      
      if (step < 5) {
        await page.click('[data-action="next-step"]');
      }
    }
  });
});
```

### 2. Manual Accessibility Testing

#### Screen Reader Testing Checklist
```bash
# Test with different screen readers

# 1. NVDA (Windows)
# - Download NVDA from nvaccess.org
# - Test navigation with Tab, Arrow keys
# - Verify announcements for form errors
# - Check heading navigation (H key)

# 2. VoiceOver (macOS)
# - Enable in System Preferences > Accessibility
# - Test with VO + Arrow keys
# - Verify rotor navigation (VO + U)
# - Check form field announcements

# 3. Screen Reader Testing Script
echo "Screen Reader Test Checklist:
[ ] Page title announced correctly
[ ] Headings navigate in logical order (h1->h2->h3)
[ ] Form labels associated with inputs
[ ] Error messages announced clearly
[ ] Skip links functional
[ ] Landmark navigation works
[ ] Images have alt text or marked decorative
[ ] Live regions announce status changes"
```

#### Keyboard Navigation Testing
```bash
# Create keyboard testing script
cat << 'EOF' > scripts/keyboard-test.sh
#!/bin/bash
echo "Keyboard Navigation Test:"
echo "1. Load homepage"
echo "2. Tab through all interactive elements"
echo "3. Verify focus visible on all elements"
echo "4. Test skip links functionality"
echo "5. Navigate booking form with keyboard only"
echo "6. Verify form submission works"
echo "7. Test mobile menu with keyboard"
echo "8. Check modal dialogs trap focus"

echo "Pass Criteria:"
echo "- All interactive elements reachable"
echo "- Focus order logical"
echo "- No keyboard traps"
echo "- Skip links work"
echo "- Form validation accessible"
EOF

chmod +x scripts/keyboard-test.sh
./scripts/keyboard-test.sh
```

### 3. Accessibility Regression Testing
```javascript
// Add to GitHub Actions workflow
const accessibilityTest = async () => {
  const { chromium } = require('playwright');
  const AxeBuilder = require('@axe-core/playwright').default;
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const pages = [
    '/',
    '/services/windshield-repair',
    '/booking',
    '/areas/denver'
  ];
  
  for (const url of pages) {
    await page.goto(`http://localhost:3000${url}`);
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
      
    if (results.violations.length > 0) {
      console.error(`Accessibility violations on ${url}:`, results.violations);
      process.exit(1);
    }
  }
  
  await browser.close();
  console.log('All accessibility tests passed!');
};

accessibilityTest();
```

---

## Real-World Testing for Booking Flow

### 1. End-to-End Booking Flow Testing

#### Playwright E2E Test Suite
```javascript
// tests/booking-flow.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Booking Flow Performance & Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Start performance monitoring
    await page.goto('http://localhost:3000');
  });

  test('Complete booking flow under 30 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    // Step 1: Service selection
    await page.click('[data-testid="service-windshield-repair"]');
    await page.click('[data-testid="continue-step-1"]');
    
    // Step 2: Vehicle information
    await page.selectOption('[data-testid="vehicle-year"]', '2020');
    await page.selectOption('[data-testid="vehicle-make"]', 'Honda');
    await page.selectOption('[data-testid="vehicle-model"]', 'Civic');
    await page.click('[data-testid="continue-step-2"]');
    
    // Step 3: Contact information
    await page.fill('[data-testid="first-name"]', 'John');
    await page.fill('[data-testid="last-name"]', 'Smith');
    await page.fill('[data-testid="phone"]', '(303) 555-0123');
    await page.click('[data-testid="continue-step-3"]');
    
    // Step 4: Location & schedule
    await page.fill('[data-testid="street-address"]', '123 Main St');
    await page.fill('[data-testid="city"]', 'Denver');
    await page.selectOption('[data-testid="state"]', 'CO');
    await page.fill('[data-testid="zip"]', '80202');
    await page.click('[data-testid="date-tomorrow"]');
    await page.click('[data-testid="continue-step-4"]');
    
    // Step 5: Review & submit
    await page.check('[data-testid="sms-consent"]');
    await page.click('[data-testid="submit-booking"]');
    
    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    const completionTime = Date.now() - startTime;
    expect(completionTime).toBeLessThan(30000); // 30 second max
    
    console.log(`Booking completed in ${completionTime}ms`);
  });

  test('Booking flow accessible via keyboard only', async ({ page }) => {
    // Complete entire flow using only keyboard navigation
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Enter'); // Skip to main content
    
    // Navigate to booking
    await page.keyboard.press('Tab'); // Focus booking button
    await page.keyboard.press('Enter'); // Start booking
    
    // Continue with keyboard-only navigation through all steps
    // Verify each step is accessible
    
    // ... detailed keyboard navigation test
  });
});
```

#### Mobile Device Testing
```javascript
// tests/mobile-booking.spec.js
const { test, expect, devices } = require('@playwright/test');

test.describe('Mobile Booking Performance', () => {
  test('iPhone booking flow performance', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
      // Simulate slow 3G
      offline: false,
      downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5Mbps
      uploadThroughput: 750 * 1024 / 8, // 750Kbps
      latency: 150 // 150ms RTT
    });
    
    const page = await context.newPage();
    
    // Start performance measurement
    await page.goto('http://localhost:3000/booking', { waitUntil: 'networkidle' });
    
    // Measure Core Web Vitals
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });
    
    expect(lcp).toBeLessThan(4000); // 4 second LCP limit on mobile
    
    // Complete booking flow and measure performance
    // ... booking steps with performance monitoring
  });
});
```

### 2. Performance Budget Testing for Image-Heavy Content

#### Damage Photo Upload Testing
```javascript
// tests/photo-upload-performance.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Photo Upload Performance', () => {
  test('Multiple photo uploads should not degrade performance', async ({ page }) => {
    await page.goto('http://localhost:3000/booking');
    
    // Navigate to photo upload step
    await completeBookingSteps(page, 2); // Get to step 2
    
    // Monitor memory usage before upload
    const initialMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize);
    
    // Upload multiple test images
    const fileInput = page.locator('[data-testid="damage-photos"]');
    await fileInput.setInputFiles([
      'tests/fixtures/damage-1.jpg',
      'tests/fixtures/damage-2.jpg', 
      'tests/fixtures/damage-3.jpg'
    ]);
    
    // Wait for uploads to complete
    await page.waitForSelector('[data-testid="upload-complete"]');
    
    // Check memory didn't increase too much
    const finalMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize);
    const memoryIncrease = finalMemory - initialMemory;
    
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
    
    // Verify images are properly compressed
    const uploadedImages = page.locator('[data-testid="uploaded-image"]');
    const imageCount = await uploadedImages.count();
    
    expect(imageCount).toBe(3);
    
    // Check each image file size
    for (let i = 0; i < imageCount; i++) {
      const imageSrc = await uploadedImages.nth(i).getAttribute('src');
      const response = await page.request.get(imageSrc);
      const contentLength = parseInt(response.headers()['content-length'] || '0');
      
      expect(contentLength).toBeLessThan(150 * 1024); // Less than 150KB per image
    }
  });
});
```

---

## Automated Testing Integration

### 1. GitHub Actions Workflow

#### Performance & Accessibility CI
```yaml
# .github/workflows/perf-a11y.yml
name: Performance & Accessibility Testing

on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]

jobs:
  lighthouse-ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
          
  accessibility-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Start application
        run: npm run start &
        
      - name: Wait for server
        run: npx wait-on http://localhost:3000
        
      - name: Run Pa11y tests
        run: |
          npm install -g pa11y-ci
          pa11y-ci --sitemap http://localhost:3000/sitemap.xml
          
      - name: Run Playwright accessibility tests
        run: npx playwright test tests/accessibility.spec.js
        
  performance-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
          
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Check bundle size
        run: |
          npm run build
          npm run analyze:ci
          
      - name: Performance budget check
        run: node scripts/check-performance-budget.js
```

### 2. Pre-commit Hooks

#### Husky Configuration
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test:a11y:quick"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "eslint-plugin-jsx-a11y"
    ],
    "*.{css,scss}": [
      "stylelint --fix"
    ]
  }
}
```

#### Quick Accessibility Check
```bash
# scripts/quick-a11y-check.sh
#!/bin/bash
echo "Running quick accessibility check..."

# Check critical pages
pa11y http://localhost:3000 --reporter cli --level error
pa11y http://localhost:3000/booking --reporter cli --level error

if [ $? -eq 0 ]; then
  echo "✅ Quick accessibility check passed"
else
  echo "❌ Accessibility issues found. Run full test suite."
  exit 1
fi
```

---

## Performance Monitoring Setup

### 1. Real User Monitoring (RUM)

#### Google Analytics 4 Integration
```javascript
// lib/analytics.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

// Initialize GA4
export const initGA = () => {
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Send Web Vitals to GA4
const sendToGA = (metric) => {
  window.gtag('event', metric.name, {
    event_category: 'Web Vitals',
    event_label: metric.id,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    non_interaction: true,
  });
};

// Custom booking flow metrics
export const trackBookingStep = (step, duration) => {
  window.gtag('event', 'booking_step_complete', {
    event_category: 'Booking Flow',
    event_label: `Step ${step}`,
    value: Math.round(duration),
  });
};

export const trackBookingComplete = (totalDuration) => {
  window.gtag('event', 'booking_complete', {
    event_category: 'Booking Flow',
    event_label: 'Complete',
    value: Math.round(totalDuration),
  });
};

// Initialize monitoring
getCLS(sendToGA);
getFID(sendToGA);
getFCP(sendToGA);
getLCP(sendToGA);
getTTFB(sendToGA);
```

#### Core Web Vitals Monitoring Dashboard
```javascript
// Create dashboard component for admin
const WebVitalsMonitor = () => {
  const [metrics, setMetrics] = useState({});
  
  useEffect(() => {
    // Collect metrics from users
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Process and send metrics to monitoring service
        sendMetricToService(entry);
      });
    });
    
    observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div className="vitals-dashboard">
      <MetricCard title="LCP" value={metrics.lcp} target="< 2.5s" />
      <MetricCard title="FID" value={metrics.fid} target="< 100ms" />
      <MetricCard title="CLS" value={metrics.cls} target="< 0.1" />
    </div>
  );
};
```

### 2. Synthetic Monitoring

#### Continuous WebPageTest Monitoring
```javascript
// scripts/continuous-monitoring.js
const WebPageTest = require('webpagetest');
const wpt = new WebPageTest('www.webpagetest.org', process.env.WPT_API_KEY);

const monitorPerformance = async () => {
  const testConfig = {
    location: 'Dulles:Chrome',
    connectivity: '3G',
    runs: 3,
    firstViewOnly: false,
    video: true,
    lighthouse: true
  };
  
  const result = await wpt.runTest('https://pinkautoglass.com', testConfig);
  
  // Check performance budgets
  const data = result.data;
  if (data.median.firstView.loadTime > 3000) { // 3s budget
    sendAlert('Performance regression detected', data);
  }
  
  return data;
};

// Run every hour
setInterval(monitorPerformance, 60 * 60 * 1000);
```

---

## Accessibility Audit Procedures

### 1. Comprehensive Manual Audit

#### WCAG 2.2 AA Checklist
```markdown
## Perceivable
- [ ] 1.1.1 Non-text Content (Level A)
- [ ] 1.2.1 Audio-only/Video-only (Level A)  
- [ ] 1.2.2 Captions (Level A)
- [ ] 1.2.3 Audio Description (Level A)
- [ ] 1.3.1 Info and Relationships (Level A)
- [ ] 1.3.2 Meaningful Sequence (Level A)
- [ ] 1.3.3 Sensory Characteristics (Level A)
- [ ] 1.3.4 Orientation (Level AA)
- [ ] 1.3.5 Identify Input Purpose (Level AA)
- [ ] 1.4.1 Use of Color (Level A)
- [ ] 1.4.2 Audio Control (Level A)
- [ ] 1.4.3 Contrast (Level AA)
- [ ] 1.4.4 Resize Text (Level AA)
- [ ] 1.4.5 Images of Text (Level AA)
- [ ] 1.4.6 Contrast (Enhanced) (Level AAA)
- [ ] 1.4.10 Reflow (Level AA)
- [ ] 1.4.11 Non-text Contrast (Level AA)
- [ ] 1.4.12 Text Spacing (Level AA)
- [ ] 1.4.13 Content on Hover/Focus (Level AA)

## Operable
- [ ] 2.1.1 Keyboard (Level A)
- [ ] 2.1.2 No Keyboard Trap (Level A)
- [ ] 2.1.4 Character Key Shortcuts (Level A)
- [ ] 2.2.1 Timing Adjustable (Level A)
- [ ] 2.2.2 Pause, Stop, Hide (Level A)
- [ ] 2.3.1 Three Flashes (Level A)
- [ ] 2.4.1 Bypass Blocks (Level A)
- [ ] 2.4.2 Page Titled (Level A)
- [ ] 2.4.3 Focus Order (Level A)
- [ ] 2.4.4 Link Purpose (Level A)
- [ ] 2.4.5 Multiple Ways (Level AA)
- [ ] 2.4.6 Headings and Labels (Level AA)
- [ ] 2.4.7 Focus Visible (Level AA)
- [ ] 2.5.1 Pointer Gestures (Level A)
- [ ] 2.5.2 Pointer Cancellation (Level A)
- [ ] 2.5.3 Label in Name (Level A)
- [ ] 2.5.4 Motion Actuation (Level A)

## Understandable  
- [ ] 3.1.1 Language of Page (Level A)
- [ ] 3.1.2 Language of Parts (Level AA)
- [ ] 3.2.1 On Focus (Level A)
- [ ] 3.2.2 On Input (Level A)
- [ ] 3.2.3 Consistent Navigation (Level AA)
- [ ] 3.2.4 Consistent Identification (Level AA)
- [ ] 3.3.1 Error Identification (Level A)
- [ ] 3.3.2 Labels or Instructions (Level A)
- [ ] 3.3.3 Error Suggestion (Level AA)
- [ ] 3.3.4 Error Prevention (Level AA)

## Robust
- [ ] 4.1.1 Parsing (Level A)
- [ ] 4.1.2 Name, Role, Value (Level A)
- [ ] 4.1.3 Status Messages (Level AA)
```

### 2. User Testing with Assistive Technologies

#### Screen Reader User Testing Protocol
```markdown
## Test Participants
- NVDA users (Windows)
- JAWS users (Windows)  
- VoiceOver users (macOS/iOS)
- TalkBack users (Android)

## Testing Scenarios
1. **Homepage Navigation**
   - Understand site purpose and services
   - Navigate to booking page
   - Find contact information
   
2. **Booking Flow Completion**
   - Complete entire booking process
   - Handle form validation errors
   - Understand confirmation details
   
3. **Service Information Discovery**
   - Learn about repair vs replacement
   - Understand pricing
   - Find coverage areas

## Success Metrics
- Task completion rate: ≥ 90%
- Time to complete booking: ≤ 10 minutes
- Error recovery rate: ≥ 95%
- User satisfaction score: ≥ 4.5/5
```

---

## Troubleshooting & Debugging

### Common Performance Issues

#### 1. Large Contentful Paint (LCP) Problems
```bash
# Debug LCP issues
lighthouse http://localhost:3000 --only-categories=performance --view

# Common LCP issues:
# - Large hero images not optimized
# - Fonts loading slowly
# - JavaScript blocking rendering
# - Server response times too slow

# Solutions:
# - Optimize images (WebP, proper sizing)
# - Preload critical fonts
# - Code split JavaScript
# - Implement proper caching
```

#### 2. Cumulative Layout Shift (CLS) Debugging
```javascript
// Debug CLS with PerformanceObserver
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Layout shift detected:', {
      value: entry.value,
      sources: entry.sources.map(source => ({
        element: source.node,
        previousRect: source.previousRect,
        currentRect: source.currentRect
      }))
    });
  }
});

observer.observe({ type: 'layout-shift', buffered: true });
```

### Common Accessibility Issues

#### 1. Focus Management Problems
```javascript
// Debug focus issues
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    console.log('Focus moved to:', document.activeElement);
    
    // Check if focus is visible
    const focusVisible = window.getComputedStyle(document.activeElement)
      .getPropertyValue('outline') !== 'none';
    
    if (!focusVisible) {
      console.warn('Focus not visible on:', document.activeElement);
    }
  }
});
```

#### 2. Screen Reader Announcement Issues
```javascript
// Debug screen reader announcements
const liveRegions = document.querySelectorAll('[aria-live]');
liveRegions.forEach(region => {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      console.log('Live region updated:', {
        element: mutation.target,
        addedNodes: mutation.addedNodes,
        removedNodes: mutation.removedNodes,
        ariaLive: mutation.target.getAttribute('aria-live')
      });
    });
  });
  
  observer.observe(region, { childList: true, subtree: true });
});
```

---

## Reporting & Documentation

### 1. Performance Report Template

```markdown
# Performance Audit Report
**Date**: [Date]
**Tested By**: [Name]
**Environment**: [Production/Staging]

## Executive Summary
- Overall Performance Score: X/100
- Key Issues Found: X
- Critical Issues: X
- Time to Complete Audit: X hours

## Core Web Vitals Results
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| LCP | Xs | ≤2.5s | ✅/❌ |
| FID | Xms | ≤100ms | ✅/❌ |
| CLS | X | ≤0.1 | ✅/❌ |

## Recommendations
1. **High Priority**
   - Issue description
   - Impact on users
   - Recommended solution
   - Estimated effort

2. **Medium Priority**
   - [Same format]

3. **Low Priority**  
   - [Same format]

## Performance Budget Status
- Bundle size: X KB (limit: 300KB)
- Image assets: X KB (limit: 1.2MB)
- Third-party scripts: X KB (limit: 200KB)

## Action Items
- [ ] Fix critical LCP issue
- [ ] Optimize hero images
- [ ] Implement font preloading
- [ ] Review third-party scripts
```

### 2. Accessibility Report Template

```markdown
# Accessibility Audit Report
**Date**: [Date]
**Auditor**: [Name]  
**Standard**: WCAG 2.2 Level AA

## Summary
- **Conformance Level**: AA/Partial AA/Non-conformant
- **Total Issues**: X (X critical, X moderate, X minor)
- **Pages Tested**: X
- **Testing Methods**: Automated + Manual + Screen Reader

## Critical Issues (Must Fix)
### Issue 1: [Title]
- **WCAG Criterion**: X.X.X
- **Impact**: High
- **Users Affected**: Screen reader users
- **Location**: Homepage hero section
- **Description**: Missing alt text on hero image
- **Solution**: Add descriptive alt text
- **Effort**: 1 hour

## Testing Results by Page
| Page | Issues | Status | Notes |
|------|--------|--------|-------|
| Homepage | 2 | ❌ | Missing alt text |
| Booking | 0 | ✅ | Fully accessible |
| Services | 1 | ⚠️ | Color contrast issue |

## Recommendations
1. **Immediate Actions** (Critical)
2. **Short-term** (1-2 weeks)
3. **Long-term** (1-3 months)

## Testing Evidence
- Screen reader testing videos
- Lighthouse accessibility report
- axe-core automated scan results
- Manual testing checklist
```

---

## Quick Start Commands

### Daily Development Testing (Hero Video Focus)
```bash
# Quick hero performance check
npm run hero:perf:quick

# Quick accessibility check  
npm run a11y:quick

# Hero video file validation
npm run hero:validate

# Full test suite with hero focus (takes 10-15 minutes)
npm run test:full

# Continuous hero monitoring mode
npm run monitor:hero
```

### Pre-deployment Testing
```bash
# Complete performance audit
npm run perf:full

# Complete accessibility audit
npm run a11y:full

# Cross-browser testing
npm run test:browsers

# Mobile device testing
npm run test:mobile
```

### Package.json Scripts (Updated for Hero Video)
```json
{
  "scripts": {
    "hero:perf:quick": "lighthouse http://localhost:3000 --preset=desktop --quiet && lighthouse http://localhost:3000 --preset=mobile --quiet",
    "hero:validate": "node scripts/validate-hero-assets.js",
    "hero:optimize": "node scripts/optimize-hero-poster.sh",
    "perf:full": "lhci autorun",
    "a11y:quick": "pa11y http://localhost:3000",
    "a11y:full": "pa11y-ci --sitemap http://localhost:3000/sitemap.xml",
    "test:full": "npm run hero:validate && npm run perf:full && npm run a11y:full",
    "test:hero:network": "bash scripts/hero-video-network-test.sh",
    "monitor:hero": "nodemon --exec 'npm run hero:perf:quick' --watch src/ --watch public/videos/ --watch public/images/",
    "test:browsers": "npx playwright test --config=playwright-cross-browser.config.js",
    "test:mobile": "npx playwright test --config=playwright-mobile.config.js"
  }
}
```

### Success Criteria Checklist (Hero Video Enhanced)
```markdown
## Deployment Ready Checklist

### Hero Video Performance ✅
- [ ] Desktop hero video ≤900KB (MP4) and ≤750KB (WebM)
- [ ] Hero video 5-8 seconds duration with seamless loop
- [ ] Mobile shows poster only (no video autoplay)
- [ ] Hero poster ≤60KB (WebP) and ≤80KB (JPEG fallback)
- [ ] AVIF format served when supported (≤45KB)
- [ ] Video defers loading until after LCP
- [ ] Respects prefers-reduced-motion
- [ ] Font loading ≤2 families × 2 weights

### Core Web Vitals ✅
- [ ] LCP ≤2.0s on desktop (4G connection)
- [ ] LCP ≤2.5s on mobile
- [ ] CLS ≤0.1 (no layout shift from video loading)
- [ ] INP ≤200ms (replaces FID)
- [ ] Hero poster contributes to good LCP

### Performance ✅
- [ ] Lighthouse Performance Score ≥ 90
- [ ] Bundle size under budget
- [ ] Hero assets optimized
- [ ] Third-party scripts optimized
- [ ] Desktop/mobile loading strategies working

### Accessibility ✅  
- [ ] Lighthouse Accessibility Score ≥ 95
- [ ] Zero critical Pa11y violations
- [ ] Hero video has proper aria-label
- [ ] Reduced motion preference respected
- [ ] Noscript fallback functional
- [ ] Screen reader testing complete
- [ ] Keyboard navigation functional
- [ ] Color contrast compliant

### User Experience ✅
- [ ] Hero loads instantly on all devices
- [ ] Video enhances but doesn't block experience
- [ ] Booking flow completion rate ≥ 85%
- [ ] Mobile performance acceptable
- [ ] Error handling accessible
- [ ] Form validation clear

### Monitoring ✅
- [ ] Hero video load tracking active
- [ ] Desktop vs mobile strategy tracking
- [ ] RUM data collection active
- [ ] Synthetic monitoring configured
- [ ] Performance budgets enforced
- [ ] Alert thresholds set
```

### 4. Hero Video Asset Validation Scripts

#### Hero Asset Validation Script
```javascript
// scripts/validate-hero-assets.js
const fs = require('fs');
const path = require('path');

const HERO_REQUIREMENTS = {
  video: {
    webm: { maxSize: 750 * 1024, path: 'public/videos/hero-loop.webm' },
    mp4: { maxSize: 900 * 1024, path: 'public/videos/hero-loop.mp4' }
  },
  poster: {
    avif: { maxSize: 45 * 1024, path: 'public/images/hero-poster.avif' },
    webp: { maxSize: 60 * 1024, path: 'public/images/hero-poster.webp' },
    jpeg: { maxSize: 80 * 1024, path: 'public/images/hero-poster.jpg' }
  }
};

function validateHeroAssets() {
  console.log('🔍 Validating Hero Video Assets...\n');
  let hasErrors = false;

  // Validate video files
  Object.entries(HERO_REQUIREMENTS.video).forEach(([format, req]) => {
    if (fs.existsSync(req.path)) {
      const stats = fs.statSync(req.path);
      if (stats.size > req.maxSize) {
        console.error(`❌ ${format.toUpperCase()} video (${stats.size} bytes) exceeds ${req.maxSize} bytes`);
        hasErrors = true;
      } else {
        console.log(`✅ ${format.toUpperCase()} video size acceptable (${stats.size} bytes)`);
      }
    } else {
      console.error(`❌ Missing ${format.toUpperCase()} video file: ${req.path}`);
      hasErrors = true;
    }
  });

  console.log('');

  // Validate poster files
  Object.entries(HERO_REQUIREMENTS.poster).forEach(([format, req]) => {
    if (fs.existsSync(req.path)) {
      const stats = fs.statSync(req.path);
      if (stats.size > req.maxSize) {
        console.error(`❌ ${format.toUpperCase()} poster (${stats.size} bytes) exceeds ${req.maxSize} bytes`);
        hasErrors = true;
      } else {
        console.log(`✅ ${format.toUpperCase()} poster size acceptable (${stats.size} bytes)`);
      }
    } else {
      console.error(`❌ Missing ${format.toUpperCase()} poster file: ${req.path}`);
      hasErrors = true;
    }
  });

  if (hasErrors) {
    console.error('\n💥 Hero asset validation failed!');
    process.exit(1);
  } else {
    console.log('\n🎉 All hero assets meet requirements!');
  }
}

validateHeroAssets();
```

#### Hero Video Duration Validation
```bash
# scripts/validate-hero-duration.sh
#!/bin/bash
echo "Validating hero video duration and loop seamlessness..."

# Check if ffmpeg is available
if ! command -v ffprobe &> /dev/null; then
    echo "❌ ffprobe not found. Install ffmpeg to validate video duration."
    exit 1
fi

# Check WebM duration
if [ -f "public/videos/hero-loop.webm" ]; then
    WEBM_DURATION=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 public/videos/hero-loop.webm)
    WEBM_DURATION_INT=${WEBM_DURATION%.*}
    
    if [ "$WEBM_DURATION_INT" -ge 5 ] && [ "$WEBM_DURATION_INT" -le 8 ]; then
        echo "✅ WebM duration acceptable (${WEBM_DURATION}s)"
    else
        echo "❌ WebM duration (${WEBM_DURATION}s) outside 5-8s requirement"
    fi
else
    echo "❌ WebM hero video not found"
fi

# Check MP4 duration  
if [ -f "public/videos/hero-loop.mp4" ]; then
    MP4_DURATION=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 public/videos/hero-loop.mp4)
    MP4_DURATION_INT=${MP4_DURATION%.*}
    
    if [ "$MP4_DURATION_INT" -ge 5 ] && [ "$MP4_DURATION_INT" -le 8 ]; then
        echo "✅ MP4 duration acceptable (${MP4_DURATION}s)"
    else
        echo "❌ MP4 duration (${MP4_DURATION}s) outside 5-8s requirement"
    fi
else
    echo "❌ MP4 hero video not found"
fi

echo "✅ Hero video duration validation complete"
```

### 5. Automated Hero Video CI/CD Integration

#### GitHub Actions Hero Video Validation
```yaml
# .github/workflows/hero-video-validation.yml
name: Hero Video Asset Validation

on:
  pull_request:
    paths:
      - 'public/videos/**'
      - 'public/images/hero-**'
  push:
    branches: [main]
    paths:
      - 'public/videos/**'
      - 'public/images/hero-**'

jobs:
  validate-hero-assets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install FFmpeg
        run: |
          sudo apt-get update
          sudo apt-get install -y ffmpeg
          
      - name: Validate hero asset file sizes
        run: node scripts/validate-hero-assets.js
        
      - name: Validate hero video duration
        run: bash scripts/validate-hero-duration.sh
        
      - name: Test hero loading on different devices
        run: |
          npm ci
          npm run build
          npm run start &
          sleep 10
          npm run test:hero:network
```

This comprehensive runbook provides detailed testing procedures with specific tools, commands, validation scripts, and success criteria for maintaining Pink Auto Glass website performance and accessibility standards with a strong focus on hero video optimization.