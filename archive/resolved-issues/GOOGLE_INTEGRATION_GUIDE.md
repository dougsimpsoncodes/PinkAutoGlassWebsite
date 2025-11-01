# Google Integration Guide
**Pink Auto Glass - Post-Deployment Setup**

---

## 1. Google Search Console Setup

### Step 1: Verify Domain Ownership
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add Property"
3. Choose "Domain" (recommended) or "URL prefix"
4. Enter: `pinkautoglass.com`
5. Verify ownership via:
   - **DNS TXT record** (recommended), OR
   - **HTML file upload**, OR
   - **HTML tag** in site header

### Step 2: Submit Sitemap
1. Once verified, go to **Sitemaps** in left menu
2. Enter sitemap URL: `https://pinkautoglass.com/sitemap.xml`
3. Click "Submit"
4. Verify 81 pages are discovered

### Step 3: Request Indexing (Priority Pages)
Manually request indexing for these high-value pages:
1. Homepage: `https://pinkautoglass.com`
2. Main service: `https://pinkautoglass.com/services/windshield-replacement`
3. Denver location: `https://pinkautoglass.com/locations/denver-co`
4. Booking page: `https://pinkautoglass.com/book`
5. Top vehicles: `/vehicles/honda-accord-windshield-replacement-denver`

**How to Request:**
- Go to URL Inspection tool
- Enter URL
- Click "Request Indexing"
- Repeat for each priority page

---

## 2. Google Analytics 4 Setup

### Step 1: Verify GA4 Property
**Measurement ID:** `G-F7WMMDK4H4` (already configured in .env.production)

1. Go to [Google Analytics](https://analytics.google.com)
2. Select property: Pink Auto Glass
3. Go to **Admin** → **Data Streams**
4. Verify web stream exists for `pinkautoglass.com`
5. Check Enhanced Measurement is enabled

### Step 2: Configure Conversion Goals
Go to **Admin** → **Events** → **Create Event** (or mark as conversion):

#### Primary Conversions
1. **Phone Clicks**
   - Event name: `click_to_call`
   - Mark as conversion: ✅
   - Value: $50 (estimated)

2. **Booking Form Submissions**
   - Event name: `form_submit`
   - Condition: `event_label` contains `booking-form`
   - Mark as conversion: ✅
   - Value: $100 (estimated)

3. **Quote Requests**
   - Event name: `form_submit`
   - Condition: `event_label` contains `quote-form`
   - Mark as conversion: ✅
   - Value: $75 (estimated)

#### Secondary Conversions
4. **SMS Clicks**
   - Event name: `click_to_text`
   - Mark as conversion: ✅
   - Value: $40 (estimated)

5. **Vehicle Selected**
   - Event name: `vehicle_selected`
   - Mark as conversion: ❌ (engagement only)

### Step 3: Enable Real-Time Reporting
1. Go to **Reports** → **Realtime**
2. Test by visiting site and clicking CTAs
3. Verify events appear in real-time

### Step 4: Set Up Audiences (Optional)
Create audiences for remarketing:
- Booking form starters (didn't complete)
- High-engagement visitors (2+ min on site)
- Specific vehicle viewers

---

## 3. Google Business Profile Integration

### Step 1: Update GBP Website Links (Per Location)
For each of the 10 location pages, add UTM-tagged links to GBP:

#### Denver GBP
**Website URL:**
```
https://pinkautoglass.com/locations/denver-co?utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=denver
```

**Book Appointment URL:**
```
https://pinkautoglass.com/book?utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=denver-book
```

#### Aurora GBP
**Website URL:**
```
https://pinkautoglass.com/locations/aurora-co?utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=aurora
```

**Book Appointment URL:**
```
https://pinkautoglass.com/book?utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=aurora-book
```

**Repeat for all 10 locations:**
- Denver, Aurora, Lakewood, Boulder, Highlands Ranch
- Thornton, Arvada, Westminster, Parker, Centennial

### Step 2: Add Services to GBP
For each location, add these services in GBP dashboard:
1. Windshield Replacement - From $299
2. Windshield Repair - From $89
3. Mobile Auto Glass Service - No extra charge
4. ADAS Calibration - Included free
5. Insurance Claims Assistance - $0 out of pocket

### Step 3: Update Business Hours
Ensure all GBP locations show:
```
Monday - Sunday: 7:00 AM - 7:00 PM
```

### Step 4: Add Photos (When Available)
Upload photos to each GBP location:
- Team photos
- Service vehicle
- Work in progress
- Before/after windshields
- Shop exterior/interior

---

## 4. Rich Results Validation

### Step 1: Test Schema Markup
Use Google's [Rich Results Test](https://search.google.com/test/rich-results)

#### Test These URLs:
1. **Service Page:**
   - URL: `https://pinkautoglass.com/services/windshield-replacement`
   - Expected: Service, FAQPage, BreadcrumbList
   - Status: Should show "Valid"

2. **Location Page:**
   - URL: `https://pinkautoglass.com/locations/denver-co`
   - Expected: AutoRepair (LocalBusiness), FAQPage, BreadcrumbList
   - Status: Should show "Valid" with Google Maps eligibility

3. **Vehicle Page:**
   - URL: `https://pinkautoglass.com/vehicles/toyota-camry-windshield-replacement-denver`
   - Expected: Service, Product, FAQPage, BreadcrumbList
   - Status: Should show "Valid"

4. **Blog Article:**
   - URL: `https://pinkautoglass.com/blog/windshield-replacement-cost-colorado-insurance-guide`
   - Expected: Article, BreadcrumbList
   - Status: Should show "Valid" with Article rich results eligibility

### Step 2: Fix Any Warnings
- Review warnings in Rich Results Test
- Most warnings are optional (e.g., missing images)
- Ensure no errors (red X)
- Prioritize fixing errors over warnings

### Step 3: Monitor Rich Results in Search Console
- Go to **Search Console** → **Enhancements**
- Check for:
  - FAQ rich results
  - Article rich results
  - LocalBusiness rich results
- Address any issues found

---

## 5. Analytics Event Testing

### Step 1: Enable Debug Mode
In browser console, run:
```javascript
gtag('set', 'debug_mode', true);
```

Or install **Google Analytics Debugger** Chrome extension.

### Step 2: Test Each Event Type

#### Conversion Events
1. **Phone Click:**
   - Click any "Call Now" button
   - Verify: `click_to_call` event fires
   - Check: `event_label` shows correct source (e.g., `homepage-hero`)

2. **SMS Click:**
   - Click "Text Us" button
   - Verify: `click_to_text` event fires
   - Check: `event_label` shows correct source

3. **Book Online Click:**
   - Click "Book Online" button
   - Verify: `click_book_online` event fires
   - Check: Redirects to `/book`

4. **Form Submission:**
   - Fill out booking form
   - Submit form
   - Verify: `form_submit` event fires
   - Check: `event_label` = `booking-form`

#### Engagement Events
5. **Scroll Depth:**
   - Scroll to 25% of page
   - Verify: `scroll_depth` event fires with `value=25`
   - Continue to 50%, 75%, 100%

6. **Time on Page:**
   - Stay on page for 15 seconds
   - Verify: `time_on_page` event fires with `value=15`
   - Continue to 30s, 60s, 120s

7. **Mobile Callback Bar:**
   - On mobile, wait 3 seconds
   - Verify sticky callback bar appears
   - Click "Call Now"
   - Verify: `cta_call_click` with `label=sticky-callback`

### Step 3: Review in GA4 DebugView
1. Go to **GA4** → **Admin** → **DebugView**
2. Visit site with debug mode enabled
3. Interact with CTAs and scroll
4. Verify all events appear in real-time
5. Check event parameters are correct

---

## 6. Performance Monitoring Setup

### Step 1: Enable Core Web Vitals Tracking
- **Search Console** → **Core Web Vitals**
- Wait 28 days for data collection
- Monitor:
  - LCP (Largest Contentful Paint) - Target: < 2.5s
  - FID (First Input Delay) - Target: < 100ms
  - CLS (Cumulative Layout Shift) - Target: < 0.1

### Step 2: PageSpeed Insights
Run baseline tests after launch:
```
https://pagespeed.web.dev/
```

**Test URLs:**
- Homepage
- Main service page
- Denver location page
- Booking page
- Top vehicle page

**Target Scores:**
- Mobile Performance: ≥ 85
- Desktop Performance: ≥ 90
- SEO: 100
- Accessibility: ≥ 90

### Step 3: Set Up Alerts
In Google Analytics:
1. Go to **Admin** → **Custom Alerts**
2. Create alerts for:
   - Traffic drop > 25% day-over-day
   - Bounce rate > 70%
   - Conversion rate < 1%
   - Zero conversions for 24 hours

---

## 7. Weekly Monitoring Checklist

### Search Console (Weekly)
- [ ] Check Coverage report for errors
- [ ] Review Performance report (impressions, clicks, CTR)
- [ ] Check Core Web Vitals
- [ ] Review Mobile Usability issues
- [ ] Monitor manual actions

### Google Analytics (Weekly)
- [ ] Review traffic sources
- [ ] Check conversion rates
- [ ] Analyze top landing pages
- [ ] Review user flow to booking page
- [ ] Check event tracking (scroll, time, CTAs)
- [ ] Monitor bounce rate by page type

### GBP (Weekly)
- [ ] Respond to reviews
- [ ] Check insights (views, clicks, calls)
- [ ] Update posts/offers if needed
- [ ] Verify business info is accurate
- [ ] Add new photos

---

## 8. First 30 Days Action Plan

### Week 1: Setup
- [ ] Verify domain in Search Console
- [ ] Submit sitemap
- [ ] Request indexing for top 10 pages
- [ ] Verify GA4 tracking
- [ ] Set up conversion goals
- [ ] Update GBP website links (all 10 locations)
- [ ] Test all analytics events

### Week 2: Optimization
- [ ] Run Lighthouse audits on all page types
- [ ] Address any performance issues
- [ ] Check for Search Console errors
- [ ] Review initial GA4 data
- [ ] Test conversion funnels
- [ ] Validate all forms working

### Week 3: Content
- [ ] Monitor which pages are indexed
- [ ] Check ranking positions for target keywords
- [ ] Review user behavior in GA4
- [ ] Identify high-bounce pages
- [ ] Plan content improvements
- [ ] Draft next blog article

### Week 4: Refinement
- [ ] Review 30-day performance
- [ ] Analyze conversion paths
- [ ] Identify optimization opportunities
- [ ] A/B test CTA placements
- [ ] Review GBP insights
- [ ] Plan Phase 5 features

---

## 9. Troubleshooting Common Issues

### "Pages not indexing"
**Causes:**
- Sitemap not submitted
- robots.txt blocking
- Domain not verified
- New domain (patience needed)

**Solutions:**
1. Verify sitemap in Search Console
2. Check robots.txt allows crawling
3. Manually request indexing
4. Wait 1-2 weeks for new domains

### "GA4 events not firing"
**Causes:**
- Ad blocker enabled
- Incorrect Measurement ID
- JavaScript errors
- Event not properly configured

**Solutions:**
1. Test in incognito mode
2. Verify Measurement ID matches
3. Check browser console for errors
4. Use GA Debugger extension
5. Review event code in analytics.ts

### "Rich Results not showing"
**Causes:**
- Schema errors
- Site too new
- Competition for featured snippets
- Not all pages eligible

**Solutions:**
1. Validate with Rich Results Test
2. Fix any schema errors
3. Wait for Google to crawl (can take weeks)
4. Continue creating high-quality content

### "Low conversion rate"
**Causes:**
- CTA not visible
- Slow page load
- Form errors
- Trust issues

**Solutions:**
1. Review heatmaps (if available)
2. Test all CTAs on mobile
3. Improve page speed
4. Add more trust signals
5. Simplify booking form
6. A/B test different CTAs

---

## 10. Google Tag Manager (Optional Advanced Setup)

For advanced tracking, consider migrating to GTM:

### Benefits
- More control over tracking
- Easier to add new tags
- Event tracking without code changes
- Third-party integrations

### Setup Steps
1. Create GTM container
2. Add GTM snippet to site
3. Migrate GA4 to GTM
4. Set up triggers for events
5. Test in GTM preview mode
6. Publish container

**Note:** Current implementation uses direct GA4 integration. GTM is optional for future expansion.

---

## 11. Useful Tools & Resources

### Validation Tools
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Schema.org Validator](https://validator.schema.org/)

### Analytics Tools
- [Google Analytics](https://analytics.google.com)
- [Google Search Console](https://search.google.com/search-console)
- [Google Tag Manager](https://tagmanager.google.com)
- [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/)

### SEO Tools
- [Ahrefs](https://ahrefs.com) - Keyword research, backlinks
- [SEMrush](https://semrush.com) - Competitive analysis
- [Moz](https://moz.com) - Domain authority, rankings

### Local SEO Tools
- [BrightLocal](https://brightlocal.com) - Local SEO tracking
- [Google Business Profile](https://business.google.com)
- [Whitespark](https://whitespark.ca) - Local citation building

---

## 12. Support Contacts

### Google Support
- **Search Console:** [Help Center](https://support.google.com/webmasters)
- **Analytics:** [Help Center](https://support.google.com/analytics)
- **Business Profile:** [Help Center](https://support.google.com/business)

### Technical Support
- **Next.js:** [Documentation](https://nextjs.org/docs)
- **Supabase:** [Documentation](https://supabase.com/docs)
- **Vercel:** [Documentation](https://vercel.com/docs)

---

**Document Version:** 1.0
**Last Updated:** October 4, 2025
**Status:** Ready for Implementation
