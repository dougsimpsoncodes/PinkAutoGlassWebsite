# Pink Auto Glass - Quality Assurance Checklist

## 📋 Purpose
Use this checklist to verify each page meets all technical, SEO, and conversion requirements before deployment.

---

## 🔍 Service Pages QA (5 Pages)

### Pages to Check:
- [ ] `/services/windshield-replacement`
- [ ] `/services/windshield-repair`
- [ ] `/services/mobile-service`
- [ ] `/services/adas-calibration`
- [ ] `/services/insurance-claims`

### For Each Service Page:

#### ✅ SEO & Metadata
- [ ] Unique `<title>` tag with primary keyword (50-60 characters)
- [ ] Meta description with CTA (155-160 characters)
- [ ] H1 matches title intent and includes primary keyword
- [ ] H2-H3 hierarchy follows logical structure
- [ ] Self-referencing canonical tag
- [ ] Open Graph tags (og:title, og:description, og:image)

#### ✅ Schema Markup
- [ ] Service schema present
- [ ] FAQPage schema present
- [ ] BreadcrumbList schema present
- [ ] Validated in Rich Results Test (0 critical errors)
- [ ] NO fake AggregateRating (unless real reviews)

#### ✅ Content Quality
- [ ] 1000+ words of unique content
- [ ] Primary keyword in first paragraph
- [ ] Secondary keywords naturally integrated
- [ ] 6-8 FAQs with rich answers (100+ words each)
- [ ] No duplicate content from other pages

#### ✅ Conversion Elements
- [ ] Hero CTA visible above fold
- [ ] AboveFoldCTA after first paragraph
- [ ] Bottom CTA before footer
- [ ] Phone number clickable: `tel:+17209187465`
- [ ] SMS link clickable: `sms:+17209187465`
- [ ] Book button links to `/book`

#### ✅ Navigation & UX
- [ ] Breadcrumbs visible and functional
- [ ] Breadcrumbs navigate correctly (Home > Services > Page)
- [ ] Sidebar with quick actions visible
- [ ] Sidebar links to 3+ locations
- [ ] Sidebar links to related services

#### ✅ Internal Linking
- [ ] Links to 8-10 top vehicle pages
- [ ] Links to 3+ location pages
- [ ] Links to related service pages
- [ ] Link back to homepage (breadcrumb)
- [ ] All links use correct URL format (no broken links)

#### ✅ Mobile Responsiveness
- [ ] Test at 375px width (iPhone SE)
- [ ] Test at 428px width (iPhone 14 Pro Max)
- [ ] Test at 360px width (Samsung Galaxy)
- [ ] CTAs stack vertically on mobile
- [ ] Text readable without zoom
- [ ] Touch targets ≥ 44px
- [ ] Phone/SMS links work on mobile

#### ✅ Performance
- [ ] Lighthouse Performance ≥ 85 (mobile)
- [ ] Lighthouse Performance ≥ 90 (desktop)
- [ ] LCP < 2.5 seconds
- [ ] CLS < 0.1
- [ ] FID < 100ms
- [ ] Images optimized (WebP, lazy loading)

#### ✅ Analytics
- [ ] Page view tracked
- [ ] CTA clicks tracked (call, text, book)
- [ ] Scroll depth tracked (25%, 50%, 75%, 100%)
- [ ] FAQ interactions tracked
- [ ] No console errors when clicking CTAs

---

## 🌆 Location Pages QA (10 Pages)

### Pages to Check:
- [ ] `/locations/denver-co`
- [ ] `/locations/aurora-co`
- [ ] `/locations/lakewood-co`
- [ ] `/locations/boulder-co`
- [ ] `/locations/highlands-ranch-co`
- [ ] `/locations/thornton-co`
- [ ] `/locations/arvada-co`
- [ ] `/locations/westminster-co`
- [ ] `/locations/parker-co`
- [ ] `/locations/centennial-co`

### For Each Location Page:

#### ✅ SEO & Metadata
- [ ] Title includes city name
- [ ] Meta description includes city + CTA
- [ ] H1 includes city name
- [ ] URL slug matches city name format
- [ ] Self-referencing canonical

#### ✅ Schema Markup
- [ ] LocalBusiness schema present
- [ ] FAQPage schema present
- [ ] BreadcrumbList schema present
- [ ] Latitude/longitude accurate
- [ ] Address accurate
- [ ] Phone number correct: +17209187465
- [ ] Validated in Rich Results Test

#### ✅ Content Quality
- [ ] 800+ words of unique, city-specific content
- [ ] City name appears 8-12 times naturally
- [ ] 15-20 neighborhoods listed
- [ ] 2-3 city-specific references (roads, landmarks)
- [ ] 3 local testimonials with names + neighborhoods
- [ ] 4-6 city-specific FAQs

#### ✅ Conversion Elements
- [ ] Hero CTA above fold
- [ ] AboveFoldCTA after introduction
- [ ] Bottom CTA
- [ ] Phone/SMS links functional
- [ ] Sidebar with quick quote form

#### ✅ Navigation & UX
- [ ] Breadcrumbs: Home > Locations > City
- [ ] Neighborhoods displayed in grid/list
- [ ] Testimonials section visible
- [ ] Services offered section visible

#### ✅ Internal Linking
- [ ] Links to all 5 service pages
- [ ] Links to 5 popular vehicle pages
- [ ] Links to 4-5 nearby cities
- [ ] Pricing visible for top vehicles
- [ ] No broken links

#### ✅ Geographic Accuracy
- [ ] Latitude within ±0.05 of city center
- [ ] Longitude within ±0.05 of city center
- [ ] Neighborhoods are actually in this city
- [ ] Roads/landmarks mentioned exist
- [ ] Zip code matches city

#### ✅ Mobile & Performance
- [ ] Responsive at 375px
- [ ] LCP < 2.5s
- [ ] CTA buttons easy to tap
- [ ] Neighborhood grid responsive
- [ ] Lighthouse ≥ 85 mobile

#### ✅ Analytics
- [ ] Page view tracked with city dimension
- [ ] CTA clicks tracked
- [ ] Neighborhood link clicks tracked
- [ ] Nearby city clicks tracked

---

## 🚗 Vehicle Pages QA (20 Pages)

### Sample Pages to Test (test 5-6 thoroughly):
- [ ] `/vehicles/honda-accord-windshield-replacement-denver`
- [ ] `/vehicles/toyota-camry-windshield-replacement-denver`
- [ ] `/vehicles/ford-f150-windshield-replacement-denver`
- [ ] `/vehicles/tesla-model-3-windshield-replacement-denver`
- [ ] `/vehicles/subaru-outback-windshield-replacement-denver`
- [ ] `/vehicles/jeep-wrangler-windshield-replacement-denver`

### For Each Vehicle Page:

#### ✅ SEO & Metadata
- [ ] Title: "{Make} {Model} Windshield Replacement Denver - From ${Price}"
- [ ] Meta description includes make, model, price, features
- [ ] H1 includes make + model
- [ ] URL slug matches make-model-service-city format
- [ ] Self-referencing canonical

#### ✅ Schema Markup
- [ ] Service schema present
- [ ] Product schema present
- [ ] FAQPage schema present
- [ ] BreadcrumbList schema present
- [ ] Price accurate from data
- [ ] Make and model correct
- [ ] Validated in Rich Results Test

#### ✅ Dynamic Data Accuracy
- [ ] Make name correct
- [ ] Model name correct
- [ ] Replacement price accurate
- [ ] Repair price accurate
- [ ] ADAS info correct (true/false)
- [ ] ADAS year start accurate (if applicable)
- [ ] Glass type recommendation correct
- [ ] Common issues displayed (if any)

#### ✅ Content Quality
- [ ] 700+ words of vehicle-specific content
- [ ] Make/model mentioned 6-10 times
- [ ] ADAS section only shows if hasADAS: true
- [ ] Common issues only show if exists
- [ ] 5 vehicle-specific FAQs
- [ ] FAQ answers reference make/model

#### ✅ Conversion Elements
- [ ] Hero CTA
- [ ] AboveFoldCTA after "Why This Matters"
- [ ] Bottom CTA
- [ ] Sidebar instant quote
- [ ] Phone/SMS links functional

#### ✅ Navigation & UX
- [ ] Breadcrumbs: Home > Vehicles > Make > Model
- [ ] Sidebar shows pricing
- [ ] Sidebar shows related models from same make
- [ ] "Also serving" cities line present
- [ ] Process steps visible

#### ✅ Internal Linking
- [ ] Link to `/services/windshield-replacement`
- [ ] Link to `/services/adas-calibration` (if ADAS)
- [ ] Link to `/locations/denver-co`
- [ ] Links to 4 other cities
- [ ] Links to 3-5 related vehicle pages
- [ ] Sidebar links to same-brand models

#### ✅ Conditional Logic
- [ ] ADAS section only appears if `hasADAS: true`
- [ ] ADAS year start shows correct year
- [ ] Common issues only appear if defined in data
- [ ] OEM vs aftermarket guidance matches `glassType`

#### ✅ Mobile & Performance
- [ ] Responsive at 375px
- [ ] LCP < 2.5s
- [ ] Pricing visible on mobile
- [ ] Related models grid responsive
- [ ] Lighthouse ≥ 85 mobile

#### ✅ Analytics
- [ ] Page view tracked with vehicle dimension
- [ ] `vehicle_selected` event fires
- [ ] Make and model tracked separately
- [ ] CTA clicks tracked
- [ ] Related vehicle clicks tracked

---

## 🌐 Global Elements QA

### Header
- [ ] Logo visible and links to `/`
- [ ] Phone number: (720) 918-7465
- [ ] Navigation menu functional
- [ ] "Book Now" button prominent
- [ ] Mobile menu works (hamburger)
- [ ] Sticky header on scroll

### Footer
- [ ] Links to all 5 service pages
- [ ] Links to top 5 location pages
- [ ] Contact info accurate
- [ ] Hours of operation listed
- [ ] Social media links (if applicable)
- [ ] Copyright year current
- [ ] Privacy policy link
- [ ] Terms of service link

### Sitemap
- [ ] `/sitemap.xml` accessible
- [ ] Contains all 39 URLs
- [ ] Priority values correct
- [ ] Change frequency values correct
- [ ] Last modified dates present

### Robots.txt
- [ ] `/robots.txt` accessible
- [ ] Allows all user agents
- [ ] Disallows `/api/`
- [ ] Disallows `/tmp/`
- [ ] References sitemap URL

---

## 🧪 Technical Testing

### Cross-Browser Testing
- [ ] Chrome (desktop)
- [ ] Safari (desktop)
- [ ] Firefox (desktop)
- [ ] Edge (desktop)
- [ ] Chrome (mobile)
- [ ] Safari iOS (mobile)

### Device Testing
- [ ] iPhone 12 / 13 / 14
- [ ] Samsung Galaxy S21 / S22
- [ ] iPad
- [ ] Desktop 1920x1080
- [ ] Desktop 1366x768

### Form Testing
- [ ] Quote form submits successfully
- [ ] VIN field accepts 17 characters
- [ ] VIN field auto-uppercases
- [ ] Phone field accepts (XXX) XXX-XXXX format
- [ ] Validation errors display
- [ ] Success message shows
- [ ] Lead saved to database
- [ ] Analytics event fires on submit

### Link Testing
- [ ] No 404 errors (test all internal links)
- [ ] External links open in new tab
- [ ] Phone links work: `tel:+17209187465`
- [ ] SMS links work: `sms:+17209187465`
- [ ] Email links work (if any)
- [ ] Breadcrumb links navigate correctly

### Performance Testing
- [ ] Run Lighthouse on 3 service pages
- [ ] Run Lighthouse on 3 location pages
- [ ] Run Lighthouse on 3 vehicle pages
- [ ] All scores ≥ 85 mobile
- [ ] All scores ≥ 90 desktop
- [ ] No console errors
- [ ] No console warnings

---

## 📊 SEO Validation

### Google Rich Results Test
Test these URLs in https://search.google.com/test/rich-results

#### Service Pages (test all 5):
- [ ] Service schema valid
- [ ] FAQPage schema valid
- [ ] Breadcrumb schema valid
- [ ] 0 critical errors

#### Location Pages (test all 10):
- [ ] LocalBusiness schema valid
- [ ] FAQPage schema valid
- [ ] Breadcrumb schema valid
- [ ] Geo coordinates valid
- [ ] 0 critical errors

#### Vehicle Pages (test 5):
- [ ] Service schema valid
- [ ] Product schema valid
- [ ] FAQPage schema valid
- [ ] Breadcrumb schema valid
- [ ] 0 critical errors

### Meta Tag Validation
- [ ] All pages have unique titles
- [ ] All pages have unique descriptions
- [ ] All pages have self-referencing canonicals
- [ ] No duplicate content issues
- [ ] No missing alt tags on images

### Structured Data
- [ ] Organization schema on homepage
- [ ] AggregateRating only if 200+ real reviews
- [ ] Review schema only with real reviews
- [ ] No fake data in any schema

---

## 📈 Analytics Validation

### Google Analytics 4
- [ ] GA4 property connected
- [ ] Measurement ID correct
- [ ] Page views tracking
- [ ] Events tracking

### Custom Events to Verify:
- [ ] `cta_call_click` fires on phone clicks
- [ ] `cta_text_click` fires on SMS clicks
- [ ] `cta_book_click` fires on book button
- [ ] `form_field_focus` fires on form interactions
- [ ] `vehicle_selected` fires when vehicle chosen
- [ ] `service_selected` fires when service chosen
- [ ] `location_entered` fires when zip entered
- [ ] `scroll_depth` fires at 25%, 50%, 75%, 100%
- [ ] `form_submit_success` fires on successful submission
- [ ] `form_submit_error` fires on error

### Event Parameters:
- [ ] `location` parameter tracks page/component
- [ ] `make` parameter tracks vehicle make
- [ ] `model` parameter tracks vehicle model
- [ ] `service_type` parameter tracks service
- [ ] `city` parameter tracks location
- [ ] `value` parameter tracks estimated lead value

---

## 🚀 Pre-Deployment Checklist

### Build & Production
- [ ] `npm run build` completes without errors
- [ ] Build output shows all 39 pages generated
- [ ] Static export successful
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Dependencies up to date

### Environment Variables
- [ ] `.env.local` has all required keys
- [ ] `NEXT_PUBLIC_GA_ID` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` valid
- [ ] `SUPABASE_URL` correct
- [ ] No sensitive data in public vars

### Deployment
- [ ] Vercel project created
- [ ] Environment variables set in Vercel
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Production URL: https://pinkautoglass.com

---

## 📋 Post-Deployment Verification

### Within 24 Hours
- [ ] All 39 pages accessible
- [ ] No 500 errors
- [ ] Forms submit successfully
- [ ] Analytics tracking live
- [ ] Phone/SMS links work on mobile devices
- [ ] No console errors in production

### Within 48 Hours
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Verify sitemap in GSC (no errors)
- [ ] Check mobile usability report
- [ ] Check page experience report

### Within 1 Week
- [ ] 39/39 pages indexed in GSC
- [ ] No indexing issues
- [ ] No crawl errors
- [ ] Core Web Vitals all "Good"
- [ ] First rankings appearing

---

## 🎯 Success Criteria

### Technical
- ✅ 39/39 pages built and deployed
- ✅ 0 critical schema errors
- ✅ 0 broken internal links
- ✅ 0 console errors
- ✅ Lighthouse scores ≥ 85 mobile, ≥ 90 desktop

### SEO
- ✅ All pages indexed within 7 days
- ✅ Sitemap submitted to GSC + Bing
- ✅ No mobile usability issues
- ✅ No duplicate content issues
- ✅ All schema types validated

### Analytics
- ✅ All custom events firing
- ✅ Conversion tracking working
- ✅ Event parameters correct
- ✅ No tracking errors

### User Experience
- ✅ Forms work on all devices
- ✅ CTAs clickable on mobile
- ✅ Page load times < 3s
- ✅ No layout shift
- ✅ Navigation intuitive

---

## 📝 Testing Log Template

Use this template to track testing progress:

```markdown
## Page: [URL]
**Tested by:** [Name]
**Date:** [YYYY-MM-DD]
**Device:** [Desktop/Mobile]
**Browser:** [Chrome/Safari/etc.]

### Results:
- [ ] SEO & Metadata: PASS / FAIL
- [ ] Schema Markup: PASS / FAIL
- [ ] Content Quality: PASS / FAIL
- [ ] Conversion Elements: PASS / FAIL
- [ ] Internal Linking: PASS / FAIL
- [ ] Mobile Responsive: PASS / FAIL
- [ ] Performance: PASS / FAIL
- [ ] Analytics: PASS / FAIL

### Issues Found:
1. [Issue description]
2. [Issue description]

### Fixed:
- [x] [Issue #1] - [How it was fixed]
- [x] [Issue #2] - [How it was fixed]

### Notes:
[Any additional observations]
```

---

## 🔧 Common Issues & Fixes

### Schema Validation Errors

**"Missing required field: priceRange"**
```typescript
// Fix in src/lib/schema.ts
priceRange: "$299-$500" // Add this
```

**"Invalid geo coordinates"**
```typescript
// Fix coordinates format
latitude: 39.7392,  // Must be number, not string
longitude: -104.9903
```

### Performance Issues

**LCP > 2.5s**
- Add `priority` prop to hero images
- Preload critical images
- Reduce JavaScript bundle size

**CLS > 0.1**
- Set explicit width/height on all images
- Avoid injecting content above fold

### Analytics Not Tracking

**Events not firing**
- Check GA4 Measurement ID
- Verify `gtag` function exists
- Check browser console for errors
- Test in incognito mode (extensions can block)

---

## ✅ Final Sign-Off

**Checked by:** ___________________
**Date:** ___________________
**Version:** ___________________

- [ ] All 39 pages tested and passed
- [ ] All schema validated
- [ ] All analytics events verified
- [ ] All performance targets met
- [ ] Ready for production deployment

**Signature:** ___________________

---

**Last Updated:** 2025-10-04
**Document Version:** 1.0
