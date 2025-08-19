# Pink Auto Glass Header & Footer Layout Specifications

## Header Component

### Layout Structure
```html
<header class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 transition-all duration-300">
  <!-- Skip to content for accessibility -->
  <a href="#main-content" class="skip-link">Skip to main content</a>
  
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <nav class="flex items-center justify-between h-16 md:h-20" role="navigation" aria-label="Main navigation">
      
      <!-- Logo Lockup (Left) -->
      <div class="flex-shrink-0">
        <a href="/" 
           class="focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 rounded"
           aria-label="Pink Auto Glass - Go to homepage">
          <img src="/public/brand/pink-logo.png" 
               alt="Pink Auto Glass - Mobile Windshield Service Denver" 
               width="140" 
               height="36"
               class="h-7 sm:h-8 md:h-9 w-auto">
        </a>
      </div>
      
      <!-- Desktop Navigation (Center) -->
      <ul class="hidden md:flex items-center space-x-6 lg:space-x-8" role="menubar">
        <li role="none">
          <a href="/services" 
             class="text-gray-700 hover:text-pink-500 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-pink-500 after:transition-all hover:after:w-full"
             role="menuitem">
            Services
          </a>
        </li>
        <li role="none">
          <a href="/locations" 
             class="text-gray-700 hover:text-pink-500 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-pink-500 after:transition-all hover:after:w-full"
             role="menuitem">
            Locations
          </a>
        </li>
        <li role="none">
          <a href="/vehicles" 
             class="text-gray-700 hover:text-pink-500 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-pink-500 after:transition-all hover:after:w-full"
             role="menuitem">
            Vehicles
          </a>
        </li>
        <li role="none">
          <a href="/about" 
             class="text-gray-700 hover:text-pink-500 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-pink-500 after:transition-all hover:after:w-full"
             role="menuitem">
            About
          </a>
        </li>
      </ul>
      
      <!-- CTA Button (Right) -->
      <div class="flex items-center space-x-4">
        <a href="tel:+13035557465" 
           class="hidden sm:flex items-center space-x-2 text-gray-700 hover:text-pink-500 transition-colors"
           aria-label="Call Pink Auto Glass">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span class="font-medium">(303) 555-PINK</span>
        </a>
        
        <a href="/book?utm_source=header&utm_medium=cta&utm_campaign=header_primary"
           class="bg-gradient-to-r from-[#f0536d] via-[#ee6aa3] to-[#d946ef] text-white px-4 sm:px-6 py-2 rounded-md font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2">
          Schedule Now
        </a>
      </div>
      
      <!-- Mobile Menu Button -->
      <button class="md:hidden p-2 text-gray-700 hover:text-pink-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 rounded" 
              aria-label="Open mobile menu"
              aria-expanded="false"
              aria-controls="mobile-menu"
              data-mobile-menu-trigger>
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </nav>
  </div>
  
  <!-- Mobile Menu Overlay -->
  <div id="mobile-menu" 
       class="md:hidden fixed inset-0 top-16 bg-white z-40 transform translate-x-full transition-transform duration-300 ease-in-out"
       aria-hidden="true">
    <nav class="h-full px-4 py-6 overflow-y-auto" role="navigation" aria-label="Mobile navigation">
      <ul class="space-y-4" role="menu">
        <li role="none">
          <a href="/services" 
             class="block py-3 text-lg font-medium text-gray-900 hover:text-pink-500 transition-colors border-b border-gray-100"
             role="menuitem">
            Services
          </a>
        </li>
        <li role="none">
          <a href="/locations" 
             class="block py-3 text-lg font-medium text-gray-900 hover:text-pink-500 transition-colors border-b border-gray-100"
             role="menuitem">
            Locations
          </a>
        </li>
        <li role="none">
          <a href="/vehicles" 
             class="block py-3 text-lg font-medium text-gray-900 hover:text-pink-500 transition-colors border-b border-gray-100"
             role="menuitem">
            Vehicles
          </a>
        </li>
        <li role="none">
          <a href="/about" 
             class="block py-3 text-lg font-medium text-gray-900 hover:text-pink-500 transition-colors border-b border-gray-100"
             role="menuitem">
            About
          </a>
        </li>
        <li role="none" class="pt-4">
          <a href="tel:+13035557465" 
             class="flex items-center space-x-3 py-3 text-lg font-medium text-gray-900 hover:text-pink-500 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>(303) 555-PINK</span>
          </a>
        </li>
        <li role="none" class="pt-2">
          <a href="/book?utm_source=mobile_menu&utm_medium=cta&utm_campaign=mobile_primary"
             class="block w-full bg-gradient-to-r from-[#f0536d] via-[#ee6aa3] to-[#d946ef] text-white text-center px-6 py-3 rounded-md font-semibold text-lg">
            Schedule Now
          </a>
        </li>
      </ul>
    </nav>
  </div>
</header>
```

### Header Specifications

#### Logo Requirements
- **Desktop sizes**: 28px (sm), 32px (md), 36px (lg+) height
- **Mobile sizes**: 28px height minimum
- **Aspect ratio**: Maintain original logo proportions
- **Background**: White or transparent header backgrounds only
- **Alt text**: Descriptive and includes location ("Mobile Windshield Service Denver")

#### Navigation Requirements
- **Accessibility**: ARIA landmarks, proper roles, keyboard navigation
- **Focus management**: Visible focus indicators with brand pink color
- **Mobile menu**: Slide-in overlay with proper state management
- **Skip link**: For screen reader users
- **Touch targets**: Minimum 44px height for mobile

#### CTA Button
- **Colors**: Brand gradient background, white text
- **Hover effects**: Lift animation (-2px transform), shadow increase
- **Focus states**: Outline ring with brand colors
- **UTM tracking**: Source, medium, campaign parameters

#### Performance
- **Sticky positioning**: `position: fixed` with backdrop blur
- **Smooth scrolling**: Transform-based animations for 60fps
- **Mobile optimization**: Optimized touch interactions and gestures

---

## Footer Component

### Layout Structure
```html
<footer class="bg-navy-900 text-white" role="contentinfo">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    
    <!-- Main Footer Content -->
    <div class="py-12 lg:py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
        
        <!-- Company Info & Logo -->
        <div class="lg:col-span-1">
          <div class="mb-6">
            <img src="/public/brand/pink-logo.png" 
                 alt="Pink Auto Glass" 
                 width="120" 
                 height="31"
                 class="h-6 w-auto mb-4">
            <p class="text-gray-300 text-sm leading-relaxed">
              Professional mobile windshield repair and replacement throughout Denver Metro. 
              We come to you with same-day service and lifetime warranty.
            </p>
          </div>
          
          <!-- Contact Info -->
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-pink-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href="tel:+13035557465" 
                 class="text-gray-300 hover:text-white transition-colors">
                (303) 555-PINK
              </a>
            </div>
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-pink-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href="mailto:service@pinkautoglass.com" 
                 class="text-gray-300 hover:text-white transition-colors">
                service@pinkautoglass.com
              </a>
            </div>
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-gray-300">
                Mobile Service Throughout<br>
                Denver Metro Area
              </span>
            </div>
          </div>
        </div>
        
        <!-- Services -->
        <div>
          <h3 class="font-semibold text-lg mb-4">Services</h3>
          <ul class="space-y-2">
            <li>
              <a href="/services/windshield-replacement" 
                 class="text-gray-300 hover:text-white transition-colors">
                Windshield Replacement
              </a>
            </li>
            <li>
              <a href="/services/windshield-repair" 
                 class="text-gray-300 hover:text-white transition-colors">
                Rock Chip Repair
              </a>
            </li>
            <li>
              <a href="/services/mobile-service" 
                 class="text-gray-300 hover:text-white transition-colors">
                Mobile Service
              </a>
            </li>
            <li>
              <a href="/services/adas-calibration" 
                 class="text-gray-300 hover:text-white transition-colors">
                ADAS Calibration
              </a>
            </li>
            <li>
              <a href="/services/insurance-claims" 
                 class="text-gray-300 hover:text-white transition-colors">
                Insurance Claims
              </a>
            </li>
          </ul>
        </div>
        
        <!-- Service Area -->
        <div>
          <h3 class="font-semibold text-lg mb-4">Service Area</h3>
          <ul class="space-y-2">
            <li>
              <a href="/locations/denver-co" 
                 class="text-gray-300 hover:text-white transition-colors">
                Denver
              </a>
            </li>
            <li>
              <a href="/locations/aurora-co" 
                 class="text-gray-300 hover:text-white transition-colors">
                Aurora
              </a>
            </li>
            <li>
              <a href="/locations/lakewood-co" 
                 class="text-gray-300 hover:text-white transition-colors">
                Lakewood
              </a>
            </li>
            <li>
              <a href="/locations/boulder-co" 
                 class="text-gray-300 hover:text-white transition-colors">
                Boulder
              </a>
            </li>
            <li>
              <a href="/locations" 
                 class="text-pink-400 hover:text-pink-300 transition-colors">
                View All Locations →
              </a>
            </li>
          </ul>
        </div>
        
        <!-- Company -->
        <div>
          <h3 class="font-semibold text-lg mb-4">Company</h3>
          <ul class="space-y-2 mb-6">
            <li>
              <a href="/about" 
                 class="text-gray-300 hover:text-white transition-colors">
                About Us
              </a>
            </li>
            <li>
              <a href="/contact" 
                 class="text-gray-300 hover:text-white transition-colors">
                Contact
              </a>
            </li>
            <li>
              <a href="/blog" 
                 class="text-gray-300 hover:text-white transition-colors">
                Blog
              </a>
            </li>
            <li>
              <a href="/careers" 
                 class="text-gray-300 hover:text-white transition-colors">
                Careers
              </a>
            </li>
          </ul>
          
          <!-- Social Media -->
          <div>
            <h4 class="font-medium mb-3">Follow Us</h4>
            <div class="flex space-x-4">
              <a href="https://www.facebook.com/PinkAutoGlassDenver" 
                 class="text-gray-400 hover:text-white transition-colors"
                 aria-label="Follow us on Facebook">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/pinkautoglassdenver" 
                 class="text-gray-400 hover:text-white transition-colors"
                 aria-label="Follow us on Instagram">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.73-3.016-1.8-.145-.274-.145-.602 0-.876.568-1.07 1.719-1.8 3.016-1.8s2.448.73 3.016 1.8c.145.274.145.602 0 .876-.568 1.07-1.719 1.8-3.016 1.8zm7.518 0c-1.297 0-2.448-.73-3.016-1.8-.145-.274-.145-.602 0-.876.568-1.07 1.719-1.8 3.016-1.8s2.448.73 3.016 1.8c.145.274.145.602 0 .876-.568 1.07-1.719 1.8-3.016 1.8z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/pink-auto-glass" 
                 class="text-gray-400 hover:text-white transition-colors"
                 aria-label="Follow us on LinkedIn">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer Bottom -->
    <div class="border-t border-gray-700 py-6">
      <div class="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-400">
          <p>&copy; 2024 Pink Auto Glass. All rights reserved.</p>
          <div class="flex space-x-4">
            <a href="/privacy" class="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" class="hover:text-white transition-colors">Terms of Service</a>
            <a href="/sitemap" class="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
        <div class="flex items-center space-x-4 text-sm text-gray-400">
          <span>Licensed & Insured</span>
          <span>•</span>
          <span>Lifetime Warranty</span>
        </div>
      </div>
    </div>
  </div>
</footer>
```

### Footer Specifications

#### Logo Requirements
- **Size**: 24px height (smaller than header)
- **Color**: Maintain pink branding on navy background
- **Contrast**: Ensure sufficient contrast for accessibility

#### Contact Information
- **Phone**: Clickable tel: link with proper formatting
- **Email**: Clickable mailto: link
- **Address**: Indicate mobile service coverage area
- **Icons**: Consistent with brand style using pink accent color

#### Navigation
- **Structure**: Organized by category (Services, Locations, Company)
- **Links**: All hover states with smooth transitions
- **Hierarchy**: Important links prominently displayed

#### Social Media
- **Icons**: SVG icons with proper accessibility labels
- **Color**: Gray default, white hover state
- **Links**: Open in new tab with proper rel attributes

#### Legal & Trust Signals
- **Copyright**: Current year with automatic updates
- **Trust badges**: Licensed, insured, warranty messaging
- **Legal links**: Privacy, terms, sitemap

### Accessibility Notes

#### ARIA Landmarks
- `role="banner"` for header
- `role="navigation"` for nav elements  
- `role="contentinfo"` for footer
- `role="main"` for main content area

#### Keyboard Navigation
- Tab order follows logical flow
- Skip links for screen readers
- Focus visible indicators
- Proper focus management for mobile menu

#### Screen Reader Support
- Descriptive alt text for logo
- ARIA labels for interactive elements
- Semantic HTML structure
- Proper heading hierarchy

#### Color Contrast
- Text meets WCAG AA standards (4.5:1 minimum)
- Interactive elements have sufficient contrast
- Focus indicators are clearly visible

### Implementation Notes

#### JavaScript Requirements
- Mobile menu toggle functionality
- Smooth scrolling for anchor links
- Header scroll state management
- Analytics event tracking

#### Performance Considerations
- Logo preloading for critical rendering
- Lazy loading for social media widgets
- Optimized SVG icons
- Efficient CSS animations

#### SEO Optimization
- Proper semantic markup
- Internal linking structure
- Contact information markup for local SEO
- Social media meta tags