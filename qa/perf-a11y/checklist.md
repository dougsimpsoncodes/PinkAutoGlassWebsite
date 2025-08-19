# Performance & Accessibility Checklist
## Pink Auto Glass Website Specifications

### Core Web Vitals Budgets & Targets

#### Performance Budgets
| Metric | Mobile Target | Desktop Target | Acceptable | Fail |
|--------|---------------|----------------|------------|------|
| **Largest Contentful Paint (LCP)** | ≤ 2.5s | ≤ 2.0s (4G) | 2.5-4.0s | > 4.0s |
| **Interaction to Next Paint (INP)** | ≤ 200ms | ≤ 200ms | 200-500ms | > 500ms |
| **Cumulative Layout Shift (CLS)** | ≤ 0.1 | ≤ 0.1 | 0.1-0.25 | > 0.25 |
| **First Contentful Paint (FCP)** | ≤ 1.8s | ≤ 1.2s | 1.8-3.0s | > 3.0s |
| **Time to Interactive (TTI)** | ≤ 3.8s | ≤ 2.9s | 3.8-7.3s | > 7.3s |
| **Total Blocking Time (TBT)** | ≤ 200ms | ≤ 150ms | 200-600ms | > 600ms |
| **Speed Index** | ≤ 3.4s | ≤ 2.3s | 3.4-5.8s | > 5.8s |

#### Resource Budgets
| Resource Type | Mobile Budget | Desktop Budget | Notes |
|---------------|---------------|----------------|-------|
| **Total Page Weight** | ≤ 1.5MB | ≤ 2.0MB | Compressed, first load |
| **JavaScript Bundle** | ≤ 200KB | ≤ 300KB | Minified + gzipped |
| **CSS** | ≤ 50KB | ≤ 75KB | Minified + gzipped |
| **Images** | ≤ 800KB | ≤ 1.2MB | Optimized, WebP preferred |
| **Hero Video (Desktop)** | N/A | ≤ 900KB | WebM/MP4, deferred load |
| **Hero Poster** | ≤ 60KB | ≤ 80KB | AVIF/WebP + JPEG fallback |
| **Fonts** | ≤ 100KB | ≤ 150KB | WOFF2 format, 2 families max |
| **Third-party Scripts** | ≤ 150KB | ≤ 200KB | Combined weight |

### Hero Video Performance Requirements

#### Device-Specific Hero Video Strategy

##### Desktop Hero Video Specifications
```yaml
Format Priority:
  1. WebM (VP9/VP8): Preferred for smaller file sizes
  2. MP4 (H.264): Fallback for broader compatibility

Quality Settings (Desktop Only):
  Resolution: 1920x1080 (Full HD) or 1280x720 (HD)
  Bitrate: 2.5-3.5Mbps maximum
  Frame Rate: 24fps or 30fps
  Duration: 5-8 seconds (short loop)
  File Size: ≤ 900KB total
  Audio: None (muted video only)

Required Attributes:
  - muted (mandatory for autoplay)
  - autoplay (desktop only)
  - loop (seamless 5-8s loop)
  - playsinline (prevent fullscreen on mobile)
  - preload="none" (defer until after LCP)

Loading Strategy:
  - Load poster first (critical for LCP)
  - Defer video loading until after page load complete
  - Only load on desktop (min-width: 1024px)
  - Respect prefers-reduced-motion
```

##### Mobile Hero Strategy (NO VIDEO)
```yaml
Mobile Implementation:
  - Poster image ONLY (no video autoplay)
  - High-quality static image
  - Optimized for touch interactions
  - Respects data saver preferences

Reason for No Mobile Video:
  - Preserves mobile data usage
  - Improves battery life
  - Faster load times on slower connections
  - Better accessibility (reduced motion)
  - iOS Safari autoplay restrictions
```

#### Hero Poster Image Requirements
```yaml
Format Strategy:
  Primary: AVIF (when supported)
  Secondary: WebP (broad support)
  Fallback: JPEG (universal)

File Size Limits:
  AVIF: ≤ 45KB (best compression)
  WebP: ≤ 60KB (good compression)
  JPEG: ≤ 80KB (fallback)

Responsive Breakpoints:
  Mobile: 375w, 768w (portrait optimized)
  Tablet: 1024w, 1200w
  Desktop: 1920w, 2560w

Dimensions & Quality:
  Aspect Ratio: 16:9 (cinematic)
  Max Width: 2560px
  Max Height: 1440px
  Quality: 85-90% (balance size/quality)
  Color Space: sRGB

Optimization Requirements:
  - Compress with mozjpeg/cwebp
  - Generate responsive srcset
  - Implement lazy loading below fold
  - Preload critical above-fold image
```

#### Exact Hero Video Implementation
```html
<!-- Desktop Hero Video with Poster Fallback -->
<div class="hero-video-container">
  <!-- Poster image for immediate LCP -->
  <picture class="hero-poster">
    <source srcset="/images/hero-poster.avif" type="image/avif">
    <source srcset="/images/hero-poster.webp" type="image/webp">
    <img src="/images/hero-poster.jpg" 
         alt="Pink Auto Glass mobile technician replacing windshield on location"
         width="1920"
         height="1080"
         loading="eager"
         fetchpriority="high">
  </picture>
  
  <!-- Video element (desktop only, loaded after LCP) -->
  <video class="hero-video desktop-only"
         muted
         loop
         playsinline
         preload="none"
         poster="/images/hero-poster.jpg"
         aria-label="Background video showing auto glass repair process"
         data-autoplay="desktop">
    <source src="/videos/hero-loop.webm" type="video/webm">
    <source src="/videos/hero-loop.mp4" type="video/mp4">
    <!-- Fallback for no video support -->
    <img src="/images/hero-poster.jpg" 
         alt="Pink Auto Glass mobile technician replacing windshield">
  </video>
  
  <!-- Noscript fallback -->
  <noscript>
    <img src="/images/hero-poster.jpg" 
         alt="Pink Auto Glass mobile technician replacing windshield"
         width="1920"
         height="1080">
  </noscript>
</div>

<!-- CSS for hero video performance -->
<style>
.hero-video-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.hero-poster {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.hero-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.hero-video.loaded {
  opacity: 1;
}

/* Hide video on mobile/tablet */
@media (max-width: 1023px) {
  .desktop-only {
    display: none !important;
  }
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .hero-video {
    display: none !important;
  }
}
</style>

<!-- JavaScript for smart video loading -->
<script>
(function() {
  // Only load video on desktop after page load
  if (window.innerWidth >= 1024 && 
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    
    window.addEventListener('load', function() {
      setTimeout(function() {
        const video = document.querySelector('.hero-video');
        if (video && video.readyState >= 2) {
          video.play().then(function() {
            video.classList.add('loaded');
          }).catch(function(error) {
            console.log('Video autoplay failed:', error);
          });
        }
      }, 1000); // Delay 1s after page load
    });
  }
})();
</script>
```

#### Hero Video Performance Optimization Pipeline
1. **Video Creation**:
   - Record in 1920x1080 at 30fps
   - Edit to 5-8 second seamless loop
   - Remove audio track entirely
   - Export in highest quality

2. **Compression Pipeline**:
   - WebM: Use VP9 codec, 2-pass encoding, target 750KB
   - MP4: Use H.264 codec, high profile, target 900KB
   - Test on target devices for quality/size balance

3. **Validation Checklist**:
   - [ ] File size ≤ 900KB (MP4) or ≤ 750KB (WebM)
   - [ ] Duration 5-8 seconds
   - [ ] Seamless loop (no visible cut)
   - [ ] No audio track
   - [ ] Loads only on desktop
   - [ ] Poster image loads first
   - [ ] Respects reduced motion

### Font Loading Strategy & Performance

#### Font Stack Hierarchy
```css
/* Display Font (Headings) */
font-family: 'Poppins', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;

/* UI Font (Body/Interface) */
font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;

/* Monospace (Code/Data) */
font-family: 'Fira Code', ui-monospace, 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
```

#### Loading Strategy
```html
<!-- Preload critical fonts -->
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/poppins-semibold.woff2" as="font" type="font/woff2" crossorigin>

<!-- Font display optimization -->
<style>
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;
  font-style: normal;
}

@font-face {
  font-family: 'Poppins';
  src: url('/fonts/poppins-semibold.woff2') format('woff2');
  font-weight: 600;
  font-display: swap;
  font-style: normal;
}
</style>
```

#### Font Performance Requirements (Hero Video Context)
- **WOFF2 format only** (95%+ browser support)
- **Variable fonts preferred** for weight ranges
- **font-display: swap** for all custom fonts
- **Preload critical fonts** used above the fold
- **Subset fonts** to Latin character set
- **Maximum 2 font families** total (≤2 families × 2 weights = 4 files max)
- **Self-hosted fonts** (no Google Fonts CDN)
- **Font loading budget**: ≤ 150KB total font files
- **Hero text fonts preloaded** before video loads

```html
<!-- Critical font preloading for hero -->
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/poppins-semibold.woff2" as="font" type="font/woff2" crossorigin>
```

### Color Contrast & Focus Management Rules

#### Color Contrast Requirements (WCAG 2.2 AA)
```yaml
Text Contrast Ratios:
  Normal Text (< 18pt): ≥ 4.5:1
  Large Text (≥ 18pt): ≥ 3:1
  UI Components: ≥ 3:1
  Graphical Objects: ≥ 3:1

Brand Color Compliance:
  Primary Red (#ef4444):
    - On White: 4.53:1 ✓ (AA compliant)
    - On Light Gray (#f9fafb): 4.89:1 ✓ (AA compliant)
    - Minimum usage: Headings, CTAs, links
  
  Magenta (#ec4899):
    - On White: 4.21:1 ✓ (AA compliant)
    - On Light Gray: 4.54:1 ✓ (AA compliant)
    - Usage: Accents, highlights, secondary CTAs
  
  Gray Text (#374151):
    - On White: 10.67:1 ✓ (AAA compliant)
    - Primary body text color
  
  Error Red (#dc2626):
    - On White: 5.74:1 ✓ (AA compliant)
    - Error messages and validation
```

#### Focus Management Standards
```css
/* Custom focus ring for brand consistency */
:focus-visible {
  outline: 2px solid #ef4444;
  outline-offset: 2px;
  border-radius: 4px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :focus-visible {
    outline: 3px solid;
    outline-offset: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### Focus Order Requirements
1. **Skip links** at page top
2. **Main navigation** (hamburger on mobile)
3. **Hero CTA button**
4. **Booking form fields** (logical tab order)
5. **Service cards** (grid order: left-to-right, top-to-bottom)
6. **Footer links** (structured by column)

### Accessibility Compliance Requirements (WCAG 2.2 AA)

#### Level AA Compliance Checklist

##### Perceivable
- [ ] **Text alternatives** for all images (alt attributes)
- [ ] **Captions** for video content (auto-generated minimum)
- [ ] **Color contrast** meets 4.5:1 ratio for normal text
- [ ] **Resize text** up to 200% without loss of content/functionality
- [ ] **Reflow content** at 320px viewport width
- [ ] **Text spacing** can be adjusted without content overlap
- [ ] **Content on hover/focus** remains visible and dismissible

##### Operable
- [ ] **Keyboard accessible** - all functionality available via keyboard
- [ ] **No seizure triggers** - no flashing content >3 times per second
- [ ] **Skip links** provided for main content
- [ ] **Page titles** descriptive and unique
- [ ] **Focus order** logical and intuitive
- [ ] **Link purpose** clear from text or context
- [ ] **Multiple ways** to find pages (nav, search, sitemap)
- [ ] **Headings and labels** descriptive
- [ ] **Focus visible** for keyboard navigation

##### Understandable
- [ ] **Language declared** in HTML lang attribute
- [ ] **Consistent navigation** across site
- [ ] **Consistent identification** of components
- [ ] **Error identification** clear and helpful
- [ ] **Error suggestions** provided where possible
- [ ] **Error prevention** for critical actions (booking submission)

##### Robust
- [ ] **Valid HTML** markup
- [ ] **Compatible** with assistive technologies
- [ ] **Name, role, value** properly conveyed to screen readers

#### Screen Reader Requirements
```html
<!-- Proper heading hierarchy -->
<h1>Pink Auto Glass - Denver's Trusted Windshield Repair</h1>
<h2>Our Services</h2>
<h3>Windshield Repair</h3>

<!-- Descriptive labels -->
<label for="phone-input">Phone Number (required)</label>
<input id="phone-input" type="tel" required aria-describedby="phone-help">
<div id="phone-help">We'll call you within 15 minutes to confirm</div>

<!-- Live regions for dynamic content -->
<div aria-live="polite" id="form-status"></div>
<div aria-live="assertive" id="error-announcements"></div>

<!-- Landmark roles -->
<header role="banner">
<nav role="navigation" aria-label="Main navigation">
<main role="main">
<aside role="complementary" aria-label="Service areas">
<footer role="contentinfo">
```

### Mobile Performance Considerations

#### Mobile-First Optimizations
```yaml
Viewport Configuration:
  - meta viewport: width=device-width, initial-scale=1
  - Responsive breakpoints: 375px, 768px, 1024px, 1280px
  - Touch target minimum: 44px x 44px

Network Considerations:
  - 3G network performance baseline
  - Offline capability for critical booking flow
  - Progressive enhancement strategy
  - Service Worker for asset caching

Battery Optimization:
  - CSS animations on GPU-accelerated properties only
  - Intersection Observer for lazy loading
  - Reduce JavaScript execution on scroll
  - Optimize background video playback
```

#### Mobile Performance Checklist
- [ ] **Critical CSS** inlined (≤ 14KB)
- [ ] **JavaScript code splitting** by route
- [ ] **Image lazy loading** below the fold
- [ ] **Font preloading** for hero text
- [ ] **Touch gestures** optimized (no 300ms delay)
- [ ] **Tap highlights** customized for brand
- [ ] **Scroll performance** 60fps maintained
- [ ] **Memory usage** monitored for long sessions

### Third-Party Script Management

#### Approved Third-Party Scripts
```yaml
Analytics:
  - Google Analytics 4: gtag.js (≤ 45KB)
  - Privacy-compliant configuration
  - Cookie consent integration

Marketing:
  - Meta Pixel: facebook pixel (≤ 35KB)
  - LinkedIn Insight Tag: insight.adsystem (≤ 25KB)
  - Load after user interaction

Communication:
  - SMS service integration: Twilio (≤ 40KB)
  - Load on booking form initialization

Maps:
  - Google Maps API: maps.googleapis.com (≤ 200KB)
  - Load on service area page only
  - Static map fallback for mobile
```

#### Loading Strategy
```javascript
// Critical: Load immediately
// Non-critical: Load after page load
// Interactive: Load on user interaction

// Example: Lazy load marketing pixels
function loadMarketingScripts() {
  if (document.readyState === 'complete') {
    // Load Meta Pixel
    !function(f,b,e,v,n,t,s) { /* pixel code */ }
    
    // Load LinkedIn Insight
    _linkedin_partner_id = "123456";
    // insight script
  }
}

// Load after user interaction or 5 seconds
const loadTimer = setTimeout(loadMarketingScripts, 5000);
document.addEventListener('click', () => {
  clearTimeout(loadTimer);
  loadMarketingScripts();
}, { once: true });
```

#### Third-Party Performance Budget
| Category | Weight Limit | Loading Priority |
|----------|--------------|------------------|
| Analytics | ≤ 60KB | After page load |
| Marketing | ≤ 80KB | User interaction |
| Communication | ≤ 50KB | Form initialization |
| Maps | ≤ 250KB | Page-specific |
| **Total** | ≤ 300KB | Staged loading |

### Split Cinematic Hero Performance

#### Implementation Strategy
```yaml
Above-the-fold Content:
  - Hero text and CTA (critical CSS)
  - Background poster image (preload)
  - Skip video loading on slow connections

Progressive Enhancement:
  1. Static poster image (immediate)
  2. CSS background video (fast connections)
  3. Full video element (desktop only)

Performance Checks:
  - Connection speed detection
  - Battery level consideration (if available)
  - Reduced motion preference respect
```

#### Loading Logic
```javascript
// Connection-aware video loading
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
const slowConnection = connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';
const dataSaver = connection?.saveData;

// Battery-aware loading
const battery = await navigator.getBattery?.();
const lowBattery = battery?.level < 0.2;

const shouldLoadVideo = !slowConnection && !dataSaver && !lowBattery && window.innerWidth > 768;

if (shouldLoadVideo) {
  loadHeroVideo();
} else {
  enhancePosterImage();
}
```

### Auto Glass Industry-Specific Accessibility

#### Damage Photo Upload Accessibility
```html
<!-- Accessible file upload -->
<fieldset>
  <legend>Upload Damage Photos (Optional)</legend>
  <div role="group" aria-describedby="photo-instructions">
    <p id="photo-instructions">
      Upload up to 5 photos of the damage. Accepted formats: JPG, PNG. 
      Maximum 2MB each. This helps us provide a more accurate estimate.
    </p>
    
    <input type="file" 
           id="damage-photos" 
           accept="image/jpeg,image/png"
           multiple 
           aria-describedby="photo-status photo-error">
    
    <div id="photo-status" aria-live="polite"></div>
    <div id="photo-error" aria-live="assertive" role="alert"></div>
  </div>
</fieldset>
```

#### Service Selection Accessibility
```html
<!-- Accessible service cards -->
<fieldset role="radiogroup" aria-labelledby="service-selection-heading">
  <legend id="service-selection-heading">Choose Your Service</legend>
  
  <div class="service-option">
    <input type="radio" id="repair" name="service" value="repair">
    <label for="repair">
      <strong>Windshield Repair</strong>
      <span class="description">Fix chips and cracks</span>
      <span class="price">Starting at $89</span>
    </label>
  </div>
  
  <div class="service-option">
    <input type="radio" id="replacement" name="service" value="replacement">
    <label for="replacement">
      <strong>Windshield Replacement</strong>
      <span class="description">Complete windshield replacement</span>
      <span class="price">From $299</span>
    </label>
  </div>
</fieldset>
```

#### Location Services Accessibility
```html
<!-- Accessible location input -->
<div role="group" aria-labelledby="location-heading">
  <h3 id="location-heading">Service Location</h3>
  
  <button type="button" 
          class="location-detect"
          aria-describedby="location-help">
    <span aria-hidden="true">📍</span>
    Use My Location
  </button>
  
  <p id="location-help">
    Or enter your address manually below. We serve the Denver metro area.
  </p>
  
  <!-- Address form with proper labeling -->
</div>
```

### Performance Monitoring Requirements

#### Core Metrics Collection
```yaml
Real User Monitoring (RUM):
  - Core Web Vitals for all page types
  - Business metrics: booking completion rate
  - Error tracking: JavaScript and network errors
  - Performance by device/connection type

Synthetic Monitoring:
  - Lighthouse CI on every deployment
  - WebPageTest from Denver location
  - Multi-step booking flow testing
  - Performance budget enforcement
```

#### Alert Thresholds
| Metric | Warning | Critical | Action |
|--------|---------|----------|---------|
| LCP | > 2.5s | > 4.0s | Immediate investigation |
| FID | > 100ms | > 300ms | Performance review |
| CLS | > 0.1 | > 0.25 | Layout debugging |
| Booking Completion | < 85% | < 75% | UX audit required |
| 404 Error Rate | > 1% | > 5% | Route debugging |

---

## Validation & Testing Requirements

### Automated Testing Integration
- **Lighthouse CI** in GitHub Actions
- **Pa11y** accessibility testing
- **WebPageTest API** performance monitoring  
- **axe-core** accessibility unit tests
- **Playwright** end-to-end booking flow tests

### Manual Testing Checklist
- [ ] **Screen reader testing** (NVDA, VoiceOver, JAWS)
- [ ] **Keyboard navigation** (tab order, focus management)
- [ ] **Mobile device testing** (iOS Safari, Chrome Android)
- [ ] **Network throttling** (3G, offline scenarios)
- [ ] **High contrast mode** (Windows, macOS)
- [ ] **Zoom testing** (up to 200% zoom level)

### Performance Regression Prevention
- **Performance budgets** enforced in CI/CD
- **Bundle size analysis** on every pull request  
- **Visual regression testing** for layout shifts
- **Accessibility regression testing** with automated tools

### Success Criteria
- **Lighthouse Performance Score**: ≥ 90
- **Lighthouse Accessibility Score**: ≥ 95  
- **Lighthouse SEO Score**: ≥ 95
- **Zero accessibility violations** in automated testing
- **Booking flow completion rate**: ≥ 85%