# Pink Auto Glass Homepage Design Specifications

## Split Cinematic Hero Section

### Layout Architecture
The Split Cinematic hero uses a full-viewport approach with carefully orchestrated content layers that work seamlessly across all devices.

#### Desktop Layout (1024px+)
```
┌─────────────────────────────────────────────────┐
│  Background Image (fixed attachment, filtered)   │
│  ┌─────────────────────────────────────────────┐ │
│  │  Gradient Overlay (45° angle)              │ │
│  │  ┌───────────────────────────────────────┐ │ │
│  │  │  Content Container (max-width: 600px) │ │ │
│  │  │  • Hero Badge                        │ │ │
│  │  │  • Main Headline (Poppins, 4xl)      │ │ │
│  │  │  • Subheadline (Inter, xl)           │ │ │
│  │  │  • Primary CTA                       │ │ │
│  │  │  • Secondary CTA                     │ │ │
│  │  └───────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

#### Mobile Layout (768px-)
```
┌─────────────────────┐
│  Background Image   │
│  ┌─────────────────┐ │
│  │  Dark Overlay   │ │
│  │  ┌───────────┐  │ │
│  │  │ Hero Badge│  │ │
│  │  │ Headline  │  │ │
│  │  │ (3xl)     │  │ │
│  │  │ Subtitle  │  │ │
│  │  │ (lg)      │  │ │
│  │  │ CTAs      │  │ │
│  │  │ (stacked) │  │ │
│  │  └───────────┘  │ │
│  └─────────────────┘ │
└─────────────────────┘
```

### Hero Overlay Specifications

#### Overlay Gradient System
```css
.hero-overlay {
  background: linear-gradient(
    45deg, 
    rgba(0, 0, 0, 0.6) 0%,     /* Dark anchor - bottom left */
    rgba(0, 0, 0, 0.3) 50%,    /* Light center for readability */
    rgba(0, 0, 0, 0.7) 100%    /* Dark anchor - top right */
  );
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}
```

#### Responsive Overlay Adjustments
- **Desktop**: 45-degree gradient for dynamic visual interest
- **Tablet**: 30-degree gradient to accommodate centered text
- **Mobile**: Vertical gradient (0 degrees) for optimal text readability

#### Background Image Treatment
```css
.hero-background {
  background-attachment: fixed; /* Parallax effect on desktop */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: brightness(0.8) contrast(1.1); /* Enhance image drama */
  transform: scale(1.05); /* Subtle zoom for depth */
  will-change: transform; /* Optimize for animations */
}

/* Mobile optimization */
@media (max-width: 768px) {
  .hero-background {
    background-attachment: scroll; /* Prevent iOS issues */
    transform: none; /* Remove scale on mobile */
  }
}
```

### Content Positioning & Animation

#### Text Content Specifications
```css
.hero-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
  padding: 4rem;
  color: #ffffff;
}

/* Responsive padding */
@media (max-width: 1024px) { padding: 3rem; }
@media (max-width: 768px) { padding: 2rem; }
```

#### Animation Sequence
All animations use `cubic-bezier(0.25, 0.46, 0.45, 0.94)` for smooth, professional motion.

1. **Hero Badge** (delay: 0.2s, duration: 0.8s)
   - Fade in from 20px below
   - Scale from 0.9 to 1.0

2. **Main Headline** (delay: 0.5s, duration: 0.6s)
   - Slide in from left (-50px)
   - Fade in simultaneously

3. **Subheadline** (delay: 0.8s, duration: 0.4s)
   - Fade in from 30px below
   - Slightly faster than headline

4. **CTA Buttons** (delay: 1.0s, duration: 0.4s)
   - Scale in from 0.95
   - Stagger secondary CTA by 0.1s

## Badge Component System

### Hero Badge Specifications
```css
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #ef4444 0%, #ec4899 100%);
  color: #ffffff;
  border-radius: 9999px;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25;
  box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

#### Badge Variants

**Primary Badge** (Brand gradient)
- Use for: Hero section, featured services, key messaging
- Background: Brand gradient
- Text: White

**Outline Badge** (Transparent with brand border)
- Use for: Secondary features, service areas, non-critical highlights
- Background: Transparent
- Border: 1px solid brand color
- Text: Brand color

**Trust Badge** (Subtle background)
- Use for: Certifications, ratings, guarantees
- Background: rgba(255, 255, 255, 0.1)
- Border: 1px solid rgba(255, 255, 255, 0.2)
- Text: White

### Badge Icon Integration
```html
<div class="hero-badge">
  <svg class="badge-icon" width="16" height="16">
    <!-- Icon content -->
  </svg>
  <span>Licensed & Insured</span>
</div>
```

Icons should be:
- 16x16px at base size
- Use stroke-width of 1.5
- Match text color
- Positioned with 0.5rem gap

## CTA Button System

### Primary CTA Specifications
```css
.cta-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #ef4444 0%, #ec4899 100%);
  color: #ffffff;
  border: none;
  border-radius: 0.5rem;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.2);
  position: relative;
  overflow: hidden;
}

.cta-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg, 
    transparent, 
    rgba(255, 255, 255, 0.2), 
    transparent
  );
  transition: left 0.6s;
}

.cta-primary:hover::before {
  left: 100%;
}

.cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px 0 rgba(239, 68, 68, 0.3);
}

.cta-primary:active {
  transform: translateY(0);
}
```

### Secondary CTA Specifications
```css
.cta-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
}

.cta-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}
```

### CTA Layout Patterns

#### Desktop CTA Group
```html
<div class="cta-group">
  <button class="cta-primary">Get Free Quote</button>
  <button class="cta-secondary">Call (555) 123-4567</button>
</div>
```

```css
.cta-group {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}
```

#### Mobile CTA Stack
```css
@media (max-width: 640px) {
  .cta-group {
    flex-direction: column;
    width: 100%;
  }
  
  .cta-group > * {
    width: 100%;
    justify-content: center;
  }
}
```

#### CTA Minimum Touch Targets
- Height: 44px minimum (iOS/Android accessibility standards)
- Width: 44px minimum for icon-only buttons
- Padding: Never less than 0.75rem vertical, 1.5rem horizontal

## Quote Card Design System

### Base Quote Card Structure
```css
.quote-card {
  position: relative;
  background: #ffffff;
  border-radius: 1rem;
  padding: 2.5rem 2rem 2rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
              0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
  max-width: 500px;
  transition: all 0.2s ease;
  overflow: hidden;
}

.quote-card::before {
  content: '"';
  position: absolute;
  top: 1rem;
  left: 1.5rem;
  font-family: 'Poppins', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  color: #ef4444;
  line-height: 1;
  opacity: 0.3;
}

.quote-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
```

### Quote Content Layout
```html
<div class="quote-card">
  <blockquote class="quote-text">
    Pink Auto Glass saved my day! Same-day service and my windshield looks perfect.
  </blockquote>
  <footer class="quote-footer">
    <div class="quote-author">
      <img class="author-avatar" src="/avatar.jpg" alt="Sarah M.">
      <div class="author-info">
        <cite class="author-name">Sarah M.</cite>
        <div class="author-location">Denver, CO</div>
      </div>
    </div>
    <div class="quote-rating">
      <!-- 5-star rating display -->
    </div>
  </footer>
</div>
```

### Quote Typography
```css
.quote-text {
  font-family: 'Inter', sans-serif;
  font-size: 1.125rem;
  line-height: 1.6;
  color: #374151;
  margin: 0 0 1.5rem 0;
  font-style: italic;
}

.author-name {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  font-style: normal;
}

.author-location {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  color: #6b7280;
}
```

### Quote Card Variants

**Featured Quote** (Larger, more prominent)
- Padding: 3rem 2.5rem 2.5rem
- Max-width: 600px
- Larger quote mark (4rem font-size)
- Enhanced shadow on hover

**Compact Quote** (For testimonial grids)
- Padding: 1.5rem
- Max-width: 350px
- Smaller quote mark (2rem font-size)
- Reduced text size (1rem)

## Service Area Chips

### Chip Base Styling
```css
.service-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  background: #f3f4f6;
  color: #374151;
  border-radius: 9999px;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25;
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  border: 1px solid transparent;
  text-decoration: none;
}

.service-chip:hover {
  background: #e5e7eb;
  transform: scale(1.05);
  border-color: #d1d5db;
}

.service-chip:active {
  transform: scale(0.98);
}
```

### Interactive Chip States
```css
.service-chip.active {
  background: linear-gradient(135deg, #ef4444 0%, #ec4899 100%);
  color: #ffffff;
  box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.2);
}

.service-chip.active:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px 0 rgba(239, 68, 68, 0.3);
}
```

### Chip Layout Patterns

#### Chip Grid (Desktop)
```css
.chip-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-start;
}
```

#### Chip Scroll (Mobile)
```css
@media (max-width: 768px) {
  .chip-container {
    display: flex;
    overflow-x: auto;
    gap: 0.75rem;
    padding: 0.5rem 0;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .chip-container::-webkit-scrollbar {
    display: none;
  }
  
  .service-chip {
    white-space: nowrap;
    flex-shrink: 0;
  }
}
```

### Chip Content Guidelines

#### Text Patterns
- Keep to 2-3 words maximum
- Use proper case (not ALL CAPS)
- Include state abbreviation for clarity
- Examples: "Denver, CO", "Boulder County", "Metro Area"

#### Icon Integration (Optional)
```html
<div class="service-chip">
  <svg class="chip-icon" width="14" height="14">
    <path d="...location icon..."/>
  </svg>
  <span>Denver, CO</span>
</div>
```

## FAQ Accordion Specifications

### Accordion Container
```css
.faq-accordion {
  background: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 
              0 1px 2px 0 rgba(0, 0, 0, 0.06);
  overflow: hidden;
  border: 1px solid #f3f4f6;
}
```

### Accordion Item Structure
```html
<div class="faq-accordion">
  <div class="accordion-item">
    <button class="accordion-trigger" aria-expanded="false">
      <span class="trigger-text">How long does windshield replacement take?</span>
      <svg class="trigger-icon" width="20" height="20">
        <!-- Chevron down icon -->
      </svg>
    </button>
    <div class="accordion-content" aria-hidden="true">
      <div class="content-inner">
        Most windshield replacements take 60-90 minutes. We use fast-curing adhesives that are safe to drive immediately, but we recommend waiting one hour before highway speeds.
      </div>
    </div>
  </div>
</div>
```

### Accordion Trigger Styling
```css
.accordion-trigger {
  width: 100%;
  padding: 1.5rem;
  text-align: left;
  background: transparent;
  border: none;
  font-family: 'Poppins', sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.accordion-trigger:hover {
  background: #f9fafb;
  color: #ef4444;
}

.accordion-trigger:focus {
  outline: 2px solid #ef4444;
  outline-offset: -2px;
}

.accordion-trigger[aria-expanded="true"] .trigger-icon {
  transform: rotate(180deg);
}
```

### Accordion Content Animation
```css
.accordion-content {
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  max-height: 0;
  opacity: 0;
}

.accordion-content.open {
  max-height: 500px; /* Adjust based on content */
  opacity: 1;
}

.content-inner {
  padding: 0 1.5rem 1.5rem;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: #6b7280;
}
```

### Accordion Item Separators
```css
.accordion-item:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}

.accordion-item:not(:last-child) .accordion-trigger {
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.accordion-item:not(:last-child) .accordion-trigger:hover {
  border-bottom-color: #f3f4f6;
}
```

### Mobile Accordion Optimizations
```css
@media (max-width: 768px) {
  .accordion-trigger {
    padding: 1.25rem 1rem;
    font-size: 1rem;
  }
  
  .content-inner {
    padding: 0 1rem 1.25rem;
    font-size: 0.875rem;
  }
  
  .trigger-icon {
    width: 18px;
    height: 18px;
  }
}
```

## Accessibility Requirements

### Focus Management
- All interactive elements must have visible focus indicators
- Focus should remain within accordions when navigating with keyboard
- Skip links should be provided for screen readers

### ARIA Implementation
```html
<!-- Accordion with proper ARIA -->
<div class="faq-accordion" role="region" aria-label="Frequently Asked Questions">
  <div class="accordion-item">
    <button 
      class="accordion-trigger" 
      aria-expanded="false"
      aria-controls="content-1"
      id="trigger-1"
    >
      Question text
    </button>
    <div 
      class="accordion-content" 
      id="content-1"
      aria-labelledby="trigger-1"
      role="region"
    >
      Answer content
    </div>
  </div>
</div>
```

### Color Contrast Requirements
- Text on backgrounds must meet WCAG AA standards (4.5:1 minimum)
- Interactive states must maintain contrast ratios
- Focus indicators must have 3:1 contrast ratio with background

### Touch Target Sizes
- Minimum 44x44px for all interactive elements
- Adequate spacing between touch targets (8px minimum)
- Consider thumb reach zones on mobile devices

## Performance Considerations

### Image Optimization
- Hero background images should be optimized WebP with JPEG fallback
- Use appropriate sizing for different breakpoints
- Implement lazy loading for below-the-fold images

## Interactions & Flows

### Homepage to Booking Integration

#### CTA Routing & Analytics
All CTAs link to the booking flow with proper UTM tracking for conversion analysis:

##### Hero Primary CTA
- **Target**: `/book?utm_source=homepage&utm_medium=hero&utm_campaign=hero_primary`
- **Analytics Event**: `gtag('event', 'cta_click', { 'cta_location': 'hero_primary', 'cta_text': 'Schedule Now' })`
- **Hover State**: Scale 1.05, shadow increase
- **Click State**: Scale 0.98, immediate feedback

##### Hero Secondary CTA
- **Target**: `/book?utm_source=homepage&utm_medium=hero&utm_campaign=hero_secondary`
- **Analytics Event**: `gtag('event', 'cta_click', { 'cta_location': 'hero_secondary', 'cta_text': 'Get Quote' })`
- **Hover State**: Border color change to brand pink
- **Click State**: Background fade to light pink

##### Quote Card Continue Button
- **Target**: `/book?utm_source=homepage&utm_medium=quote_card&utm_campaign=quick_quote&year={year}&make={make}&model={model}&trim={trim}`
- **Analytics Event**: 
```javascript
gtag('event', 'quote_start', {
  'vehicle_year': year,
  'vehicle_make': make,
  'vehicle_model': model,
  'vehicle_trim': trim,
  'entry_point': 'quote_card'
})
```
- **Data Persistence**: Vehicle data passes via URL params for prefill
- **Validation**: Basic year validation (1990-2025) before redirect

#### Interactive Quote Card Flow
```
┌──────────────────────────────────┐
│       Quick Quote Card           │
│ ┌──────────────────────────────┐ │
│ │   Select Your Vehicle:       │ │
│ │   [Year ▼] [Make ▼]          │ │
│ │   [Model ▼] [Trim ▼]         │ │
│ │                              │ │
│ │   [Continue to Quote →]      │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

**Progressive Disclosure**:
1. Year selection enables Make dropdown
2. Make selection enables Model dropdown  
3. Model selection enables Trim dropdown
4. All fields selected enables Continue button

**API Integration**:
- Year dropdown: Static 1990-2025
- Make dropdown: Fetch from `/api/vehicles/makes?year={year}`
- Model dropdown: Fetch from `/api/vehicles/models?year={year}&make={make}`
- Trim dropdown: Fetch from `/api/vehicles/trims?year={year}&make={make}&model={model}`

#### Service Selection Cards
Each service card includes a direct booking link:

```html
<a href="/book?utm_source=homepage&utm_medium=service_card&utm_campaign=service_selection&service=windshield-replacement"
   class="service-card-link"
   data-service="windshield-replacement">
  <!-- Card content -->
</a>
```

**Analytics Events**:
```javascript
document.querySelectorAll('.service-card-link').forEach(card => {
  card.addEventListener('click', (e) => {
    gtag('event', 'service_select', {
      'service_type': e.currentTarget.dataset.service,
      'entry_point': 'homepage_service_card'
    });
  });
});
```

#### Location Chips Interaction
Service area chips link to location-specific pages:

```html
<a href="/locations/denver-co?utm_source=homepage&utm_medium=location_chip"
   class="location-chip">
  Denver
</a>
```

#### Trust Signals to Booking
Trust badges and guarantees link to booking with confidence tracking:

```html
<a href="/book?utm_source=homepage&utm_medium=trust_signal&utm_campaign=lifetime_warranty"
   class="trust-badge-link">
  <img src="/public/brand/lifetime-warranty-badge.svg" alt="Lifetime Warranty">
</a>
```

### Header Integration with Logo

The header must incorporate the Pink Auto Glass logo with proper placement and interactions:

```html
<header class="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
  <div class="container mx-auto px-4">
    <nav class="flex items-center justify-between h-16">
      <!-- Logo Lockup (Left) -->
      <a href="/" class="flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 rounded">
        <img src="/public/brand/pink-logo.png" 
             alt="Pink Auto Glass - Mobile Windshield Service Denver" 
             height="32" 
             width="auto"
             class="h-8 md:h-9">
      </a>
      
      <!-- Navigation (Center) - Desktop Only -->
      <ul class="hidden md:flex items-center space-x-8">
        <li><a href="/services" class="text-gray-700 hover:text-pink-500 transition-colors">Services</a></li>
        <li><a href="/locations" class="text-gray-700 hover:text-pink-500 transition-colors">Locations</a></li>
        <li><a href="/vehicles" class="text-gray-700 hover:text-pink-500 transition-colors">Vehicles</a></li>
        <li><a href="/about" class="text-gray-700 hover:text-pink-500 transition-colors">About</a></li>
      </ul>
      
      <!-- CTA (Right) -->
      <a href="/book?utm_source=header&utm_medium=cta&utm_campaign=header_primary"
         class="bg-gradient-to-r from-pink-500 via-pink-400 to-purple-400 text-white px-6 py-2 rounded-md font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
        Schedule Now
      </a>
      
      <!-- Mobile Menu Button -->
      <button class="md:hidden p-2" aria-label="Open menu">
        <svg class="w-6 h-6" fill="none" stroke="currentColor">
          <!-- Hamburger icon -->
        </svg>
      </button>
    </nav>
  </div>
</header>
```

### Scroll-Triggered Interactions

#### Parallax Effects
```javascript
// Hero background parallax
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const parallax = document.querySelector('.hero-background');
  parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
});
```

#### Sticky CTA Appearance
When user scrolls past hero, show sticky mobile CTA:

```javascript
const heroHeight = document.querySelector('.hero-section').offsetHeight;
const stickyCTA = document.querySelector('.sticky-cta-mobile');

window.addEventListener('scroll', () => {
  if (window.pageYOffset > heroHeight) {
    stickyCTA.classList.add('visible');
  } else {
    stickyCTA.classList.remove('visible');
  }
});
```

### Form Pre-population Strategy

When users arrive at `/book` from homepage CTAs, the booking form intelligently prefills:

1. **From Quote Card**: Year, Make, Model, Trim pre-selected
2. **From Service Cards**: Service type pre-selected
3. **From Location Chips**: Service location pre-filled
4. **From Trust Signals**: Display relevant trust badge in booking header

### Performance Tracking

All interactions are monitored for performance impact:

```javascript
// Measure CTA interaction performance
performance.mark('cta-interaction-start');
// ... interaction logic ...
performance.mark('cta-interaction-end');
performance.measure('cta-interaction', 'cta-interaction-start', 'cta-interaction-end');
```

### Animation Performance
- Use `transform` and `opacity` for smooth animations
- Add `will-change` property for elements that will animate
- Remove `will-change` after animations complete
- Respect `prefers-reduced-motion` media query

### Loading States
- Implement skeleton screens for content loading
- Provide feedback during form submissions
- Use progressive enhancement for JavaScript-dependent features

This design system provides the foundation for a cohesive, accessible, and performant Pink Auto Glass website that prioritizes user experience across all devices while maintaining brand consistency and professional presentation.