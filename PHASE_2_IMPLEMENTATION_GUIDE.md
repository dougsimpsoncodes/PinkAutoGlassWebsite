# Phase 2 — Polish & Scale Implementation Guide

## ✅ Completed Infrastructure

### 1. Sitemap System
**File:** `src/app/sitemap.ts`

**Status:** ✅ COMPLETE

**Includes:**
- 4 core pages (homepage, book, thank-you, track)
- 5 service pages (all defined, 1 built)
- 10 location pages (all defined, 1 built)
- 20 vehicle pages (dynamically generated from data)

**Total URLs:** 39 pages when complete

**Verification:**
```bash
npm run build
# Visit http://localhost:3000/sitemap.xml
# Should show all 39 URLs
```

### 2. Robots.txt
**File:** `src/app/robots.ts`

**Status:** ✅ COMPLETE

**Configuration:**
- Allows all user agents
- Blocks `/api/` and `/tmp/`
- References sitemap at `https://pinkautoglass.com/sitemap.xml`

### 3. Breadcrumbs Component
**File:** `src/components/Breadcrumbs.tsx`

**Status:** ✅ COMPLETE

**Features:**
- Visual breadcrumb navigation
- Home icon + chevron separators
- Hover states
- Aria labels for accessibility
- Works with `generateBreadcrumbSchema()` from schema.ts

**Usage:**
```tsx
import Breadcrumbs from '@/components/Breadcrumbs';

<Breadcrumbs
  items={[
    { label: 'Services', href: '/services' },
    { label: 'Windshield Replacement', href: '/services/windshield-replacement' }
  ]}
/>
```

---

## 📋 Tasks Remaining

### Task 1: Add Above-Fold CTA Block to All Templates

**Requirement:** Add CTA block directly after first paragraph on all pages

**Create Component:** `src/components/AboveFoldCTA.tsx`

```tsx
import { Phone, MessageSquare, Calendar } from 'lucide-react';
import Link from 'next/link';
import { trackCTAClick } from '@/lib/analytics';

interface AboveFoldCTAProps {
  location?: string; // For analytics tracking
}

export default function AboveFoldCTA({ location = 'above-fold' }: AboveFoldCTAProps) {
  return (
    <div className="my-8 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-300 rounded-xl p-6">
      <div className="grid md:grid-cols-3 gap-4">
        <a
          href="tel:+17209187465"
          onClick={() => trackCTAClick('call', location)}
          className="flex flex-col items-center justify-center bg-pink-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-pink-700 transition-all shadow-lg hover:shadow-xl group"
        >
          <Phone className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-lg">Call Now</span>
          <span className="text-sm text-pink-100">(720) 918-7465</span>
        </a>

        <a
          href="sms:+17209187465"
          onClick={() => trackCTAClick('text', location)}
          className="flex flex-col items-center justify-center bg-gray-700 text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl group"
        >
          <MessageSquare className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-lg">Text Us</span>
          <span className="text-sm text-gray-300">Quick Response</span>
        </a>

        <Link
          href="/book"
          onClick={() => trackCTAClick('book', location)}
          className="flex flex-col items-center justify-center bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl group"
        >
          <Calendar className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-lg">Book Online</span>
          <span className="text-sm text-blue-100">Same-Day Available</span>
        </Link>
      </div>
    </div>
  );
}
```

**Where to Add:**

**Service Pages:** After first paragraph under H1
```tsx
<section>
  <p className="text-lg text-gray-700 mb-4">
    Your opening paragraph here...
  </p>
  <AboveFoldCTA location="service-windshield-replacement" />
  <p className="text-lg text-gray-700 mb-4">
    Continuation of content...
  </p>
</section>
```

**Location Pages:** After introduction paragraph
```tsx
<section>
  <p className="text-lg text-gray-700 mb-4">
    Denver introduction...
  </p>
  <AboveFoldCTA location="location-denver" />
</section>
```

**Vehicle Pages:** After "Why This Matters" section first paragraph
```tsx
<section>
  <h2>Why {vehicle.make} {vehicle.model} Windshield Replacement Requires Expertise</h2>
  <p>...</p>
  <AboveFoldCTA location={`vehicle-${vehicle.slug}`} />
</section>
```

---

### Task 2: Add Breadcrumbs to All Pages

**Service Pages:**
```tsx
import Breadcrumbs from '@/components/Breadcrumbs';

// Add after hero section, before main content
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
  <Breadcrumbs
    items={[
      { label: 'Services', href: '/services' },
      { label: 'Windshield Replacement', href: '/services/windshield-replacement' }
    ]}
  />
</div>
```

**Location Pages:**
```tsx
<Breadcrumbs
  items={[
    { label: 'Locations', href: '/locations' },
    { label: 'Denver, CO', href: '/locations/denver-co' }
  ]}
/>
```

**Vehicle Pages** (Already in template - verify it renders):
```tsx
<Breadcrumbs
  items={[
    { label: 'Vehicles', href: '/vehicles' },
    { label: vehicle.make, href: `/vehicles?make=${vehicle.make}` },
    { label: `${vehicle.make} ${vehicle.model}`, href: `/vehicles/${vehicle.slug}` }
  ]}
/>
```

---

### Task 3: Internal Linking Requirements

#### From `/services/windshield-replacement`

Add this section before the final CTA:

```tsx
<section>
  <h2 className="text-2xl font-bold text-gray-900 mb-4">
    Popular Vehicles We Service
  </h2>
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[
      { make: 'Toyota', model: 'Camry', slug: 'toyota-camry-windshield-replacement-denver' },
      { make: 'Honda', model: 'Accord', slug: 'honda-accord-windshield-replacement-denver' },
      { make: 'Subaru', model: 'Outback', slug: 'subaru-outback-windshield-replacement-denver' },
      { make: 'Ford', model: 'F-150', slug: 'ford-f150-windshield-replacement-denver' },
      { make: 'Jeep', model: 'Wrangler', slug: 'jeep-wrangler-windshield-replacement-denver' },
      { make: 'Tesla', model: 'Model 3', slug: 'tesla-model-3-windshield-replacement-denver' },
      { make: 'Toyota', model: 'RAV4', slug: 'toyota-rav4-windshield-replacement-denver' },
      { make: 'Honda', model: 'CR-V', slug: 'honda-cr-v-windshield-replacement-denver' },
    ].map(v => (
      <Link
        key={v.slug}
        href={`/vehicles/${v.slug}`}
        className="bg-white border border-gray-200 rounded-lg p-4 hover:border-pink-500 hover:shadow-md transition-all"
      >
        <div className="font-semibold text-gray-900">{v.make} {v.model}</div>
        <div className="text-sm text-pink-600">View Pricing →</div>
      </Link>
    ))}
  </div>
</section>
```

#### From `/locations/denver-co`

Update sidebar "Popular in Denver" section:

```tsx
<div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-lg font-bold text-gray-900 mb-3">
    Popular Vehicles in Denver
  </h3>
  <p className="text-sm text-gray-600 mb-3">Get vehicle-specific pricing:</p>
  <ul className="space-y-2 text-sm">
    <li>
      <Link href="/vehicles/subaru-outback-windshield-replacement-denver" className="text-pink-600 hover:underline flex justify-between">
        <span>Subaru Outback</span>
        <span className="text-gray-600">$420</span>
      </Link>
    </li>
    <li>
      <Link href="/vehicles/toyota-rav4-windshield-replacement-denver" className="text-pink-600 hover:underline flex justify-between">
        <span>Toyota RAV4</span>
        <span className="text-gray-600">$390</span>
      </Link>
    </li>
    <li>
      <Link href="/vehicles/honda-cr-v-windshield-replacement-denver" className="text-pink-600 hover:underline flex justify-between">
        <span>Honda CR-V</span>
        <span className="text-gray-600">$380</span>
      </Link>
    </li>
    <li>
      <Link href="/vehicles/ford-f150-windshield-replacement-denver" className="text-pink-600 hover:underline flex justify-between">
        <span>Ford F-150</span>
        <span className="text-gray-600">$450</span>
      </Link>
    </li>
    <li>
      <Link href="/vehicles/jeep-wrangler-windshield-replacement-denver" className="text-pink-600 hover:underline flex justify-between">
        <span>Jeep Wrangler</span>
        <span className="text-gray-600">$380</span>
      </Link>
    </li>
  </ul>
  <Link href="/services/windshield-replacement" className="block mt-4 text-blue-600 hover:underline font-semibold">
    View All Services →
  </Link>
</div>
```

#### From Vehicle Pages

Add "Also serving" line after first paragraph:

```tsx
<p className="text-lg text-gray-700 mb-4">
  Your {vehicle.make} {vehicle.model} deserves specialized care...
</p>

<p className="text-sm text-gray-600 mb-6 flex flex-wrap gap-2">
  <span className="font-medium">Also serving:</span>
  <Link href="/locations/aurora-co" className="text-pink-600 hover:underline">Aurora</Link>
  <span>•</span>
  <Link href="/locations/lakewood-co" className="text-pink-600 hover:underline">Lakewood</Link>
  <span>•</span>
  <Link href="/locations/boulder-co" className="text-pink-600 hover:underline">Boulder</Link>
  <span>•</span>
  <Link href="/locations/highlands-ranch-co" className="text-pink-600 hover:underline">Highlands Ranch</Link>
</p>
```

---

### Task 4: Add VIN Field to Quote Form

**File to Edit:** `src/components/QuoteForm.tsx`

**Find the form fields section and add:**

```tsx
{/* Existing fields: name, phone, vehicle, zip, insurance */}

{/* Add VIN field (optional) */}
<div>
  <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">
    VIN (Optional)
    <span className="text-gray-500 font-normal ml-1">- for faster quote</span>
  </label>
  <input
    type="text"
    id="vin"
    name="vin"
    maxLength={17}
    placeholder="17-character VIN"
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 uppercase"
    style={{ textTransform: 'uppercase' }}
  />
  <p className="text-xs text-gray-500 mt-1">
    Find your VIN on your driver's side dashboard or insurance card
  </p>
</div>
```

**Update form submission to include VIN:**

```tsx
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  const formData = new FormData(e.target as HTMLFormElement);
  const data = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    vehicle: formData.get('vehicle'),
    zip: formData.get('zip'),
    hasInsurance: formData.get('insurance'),
    vin: formData.get('vin'), // Add this
    // ... rest of tracking data
  };

  // Send to API
  const response = await fetch('/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  // ... handle response
};
```

**Update API route to accept VIN:**

In `src/app/api/lead/route.ts`, add VIN to the insert:

```typescript
const { data, error } = await supabase
  .from('leads')
  .insert({
    // ... existing fields
    vin: body.vin || null, // Add this
  })
  .select()
  .single();
```

---

### Task 5: Create Remaining 4 Service Pages

Copy `src/app/services/windshield-replacement/page.tsx` and modify:

#### 5.1 Windshield Repair (`/services/windshield-repair`)

**Changes:**
- **Title:** "Fast Windshield Repair - From $89 in Denver"
- **H1:** "Professional Windshield Repair in Denver"
- **Price:** From $89 (not $299)
- **Focus:** Chip and crack repair vs replacement
- **Content adjustments:**
  - When to repair vs replace
  - Repair process (resin injection)
  - 30-minute service time
  - Insurance often covers 100%
  - Prevents spreading

**Key Content Sections:**
1. What is windshield repair
2. When repair is possible (chips < quarter, cracks < 6")
3. Our repair process (5 steps)
4. Repair vs replacement decision guide
5. Insurance coverage (often $0)
6. FAQ (6-8 questions)

#### 5.2 Mobile Service (`/services/mobile-service`)

**Changes:**
- **Title:** "Mobile Windshield Service - We Come to You in Denver"
- **H1:** "Mobile Windshield Repair & Replacement"
- **Price:** No Extra Charge
- **Focus:** Convenience of mobile service

**Key Content Sections:**
1. How mobile service works
2. Service area map (Denver metro)
3. What we bring to you (fully equipped van)
4. Where we serve (home, office, parking lot, anywhere)
5. Scheduling process
6. Same-day availability
7. FAQ (5-7 questions)

#### 5.3 ADAS Calibration (`/services/adas-calibration`)

**Changes:**
- **Title:** "ADAS Calibration After Windshield Replacement | Denver"
- **H1:** "ADAS Calibration - Included Free with Replacement"
- **Price:** Included (normally $150-$300)
- **Focus:** What is ADAS, why it's required

**Key Content Sections:**
1. What is ADAS
2. Why calibration is required
3. Which vehicles need it (2018+)
4. Types of systems (lane departure, collision warning, etc.)
5. Our calibration process
6. Safety importance
7. FAQ (6-8 questions)

#### 5.4 Insurance Claims (`/services/insurance-claims`)

**Changes:**
- **Title:** "Auto Glass Insurance Claims Made Easy | Denver"
- **H1:** "Windshield Insurance Claims - We Handle Everything"
- **Price:** Often $0 Deductible
- **Focus:** How insurance works, we do the paperwork

**Key Content Sections:**
1. How auto glass insurance works
2. Comprehensive vs collision coverage
3. Colorado zero-deductible law
4. We handle all paperwork
5. Direct billing to insurance
6. Approved insurance partners
7. Claims process step-by-step
8. FAQ (6-8 questions)

**File Creation Command:**
```bash
# Create directories
mkdir -p src/app/services/{windshield-repair,mobile-service,adas-calibration,insurance-claims}

# Copy template to each
cp src/app/services/windshield-replacement/page.tsx src/app/services/windshield-repair/page.tsx
cp src/app/services/windshield-replacement/page.tsx src/app/services/mobile-service/page.tsx
cp src/app/services/windshield-replacement/page.tsx src/app/services/adas-calibration/page.tsx
cp src/app/services/windshield-replacement/page.tsx src/app/services/insurance-claims/page.tsx
```

Then edit each file with content changes listed above.

---

### Task 6: Create Remaining 9 Location Pages

Copy `src/app/locations/denver-co/page.tsx` and modify:

#### Location Data Reference

| City | Latitude | Longitude | Zip | Population |
|------|----------|-----------|-----|------------|
| Aurora | 39.7294 | -104.8319 | 80010 | 390,000 |
| Lakewood | 39.7047 | -105.0814 | 80226 | 155,000 |
| Boulder | 40.0150 | -105.2705 | 80301 | 108,000 |
| Highlands Ranch | 39.5539 | -104.9689 | 80126 | 105,000 |
| Thornton | 39.8681 | -104.9719 | 80229 | 141,000 |
| Arvada | 39.8028 | -105.0875 | 80002 | 122,000 |
| Westminster | 39.8367 | -105.0372 | 80031 | 116,000 |
| Parker | 39.5186 | -104.7614 | 80134 | 58,000 |
| Centennial | 39.5807 | -104.8772 | 80112 | 108,000 |

#### For Each Location:

**Find/Replace:**
- "Denver" → "{City Name}"
- Update coordinates in `generateLocalBusinessSchema()`
- Update zip code
- Update neighborhoods (15-20 per city)

**City-Specific Content Ideas:**

**Aurora:**
- Major roads: I-225, E-470, Buckley AFB
- Neighborhoods: Stapleton (now Central Park), Green Valley Ranch, Southlands
- References: Anschutz Medical Campus, Aurora Reservoir

**Lakewood:**
- Major roads: I-70, C-470, 6th Ave (US-6)
- Neighborhoods: Bear Valley, Green Mountain, Belmar
- References: Red Rocks Amphitheatre, Dinosaur Ridge, Green Mountain

**Boulder:**
- Major roads: US-36, Foothills Parkway
- Neighborhoods: University Hill, Table Mesa, Gunbarrel, North Boulder
- References: CU Boulder, Pearl Street Mall, Flatirons
- Note: College town, higher-end market

**Highlands Ranch:**
- Major roads: C-470, Santa Fe Drive
- Neighborhoods: Backcountry, Northridge, Southridge
- References: Planned community, newer vehicles, affluent market

**Thornton:**
- Major roads: I-25, E-470, 120th Ave
- Neighborhoods: Heritage, Eastlake, Thornton Town Center
- References: Growing north metro area

**Arvada:**
- Major roads: I-76, Wadsworth, 80th Ave
- Neighborhoods: Olde Town Arvada, Candelas, Leyden Rock
- References: Historic downtown, family-oriented

**Westminster:**
- Major roads: US-36, I-25, 120th Ave
- Neighborhoods: Legacy Ridge, Westminster Station, Standley Lake
- References: Between Denver and Boulder

**Parker:**
- Major roads: I-25, E-470, Parker Road
- Neighborhoods: Stonegate, Pinery, Newlin Gulch
- References: Southeast growth area, newer vehicles

**Centennial:**
- Major roads: I-25, E-470, Arapahoe Road
- Neighborhoods: Southglenn, Centennial Airport area
- References: Southeast quality market, affluent

**File Creation:**
```bash
mkdir -p src/app/locations/{aurora-co,lakewood-co,boulder-co,highlands-ranch-co,thornton-co,arvada-co,westminster-co,parker-co,centennial-co}

for city in aurora-co lakewood-co boulder-co highlands-ranch-co thornton-co arvada-co westminster-co parker-co centennial-co; do
  cp src/app/locations/denver-co/page.tsx src/app/locations/$city/page.tsx
done
```

---

### Task 7: Schema Validation & Rich Results Testing

#### 7.1 Test Each Template

**Service Pages:**
```bash
# Build and test
npm run build
npm run start

# Test URL in Rich Results Test
https://search.google.com/test/rich-results

# Test these URLs:
http://localhost:3000/services/windshield-replacement
http://localhost:3000/services/windshield-repair
# etc.
```

**Expected Schema on Service Pages:**
- ✅ Service
- ✅ FAQPage
- ✅ BreadcrumbList
- ❌ NO fake AggregateRating (only use if you have real reviews)

**Location Pages:**
```bash
# Test these URLs:
http://localhost:3000/locations/denver-co
http://localhost:3000/locations/aurora-co
# etc.
```

**Expected Schema on Location Pages:**
- ✅ LocalBusiness
- ✅ FAQPage
- ✅ BreadcrumbList
- ✅ AggregateRating (only if you have 200 real reviews)

**Vehicle Pages:**
```bash
# Test these URLs:
http://localhost:3000/vehicles/honda-accord-windshield-replacement-denver
http://localhost:3000/vehicles/toyota-camry-windshield-replacement-denver
# etc.
```

**Expected Schema on Vehicle Pages:**
- ✅ Service
- ✅ Product
- ✅ FAQPage
- ✅ BreadcrumbList

#### 7.2 Fix Common Schema Warnings

**Remove fake ratings if you don't have 200+ reviews:**

In `src/lib/schema.ts`, the `aggregateRating` in schemas should only be added if you have REAL review data.

**Option 1:** Remove from all schemas until you have reviews
**Option 2:** Replace with real review data from Google My Business

#### 7.3 Verify Unique Titles & Canonicals

Every page should have:
- Unique `<title>` tag
- Self-referencing `<link rel="canonical">` tag

Next.js 14 handles this automatically via `metadata` export, but verify:

```tsx
export const metadata: Metadata = {
  title: 'Unique Title Here',
  // ...
};
```

Canonical is auto-generated by Next.js based on the URL.

---

### Task 8: PageSpeed Optimization

#### 8.1 Image Optimization

**Current:** Using Next.js `<Image>` component (already optimized)

**Check:**
```bash
npm run build
npm run start

# Test with Lighthouse
# Target: LCP < 2.5s on mobile
```

**If LCP is slow:**

1. **Preload hero images:**
```tsx
// In page.tsx
export const metadata = {
  // ...
  other: {
    preload: [
      { as: 'image', href: '/hero-windshield.webp' }
    ]
  }
};
```

2. **Use priority loading on above-fold images:**
```tsx
<Image
  src="/hero.jpg"
  alt="..."
  priority
  width={1200}
  height={600}
/>
```

3. **Convert images to WebP:**
```bash
# Install sharp (already in package.json)
# Next.js auto-converts to WebP
```

#### 8.2 JavaScript Optimization

**Current:** Using Next.js 14 server components (minimal JS)

**Check bundle size:**
```bash
npm run build
# Look for "First Load JS" in output
# Target: < 100KB for main pages
```

**If too large:**

1. **Dynamic imports for heavy components:**
```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
```

2. **Use server components by default** (already doing this)

3. **Lazy load images below fold:**
```tsx
<Image
  src="/below-fold.jpg"
  alt="..."
  loading="lazy"
/>
```

---

### Task 9: Analytics Event Verification

#### 9.1 Test Events Fire

**In browser console:**
```javascript
// Open DevTools > Console
// Click a CTA button
// Should see: gtag('event', 'cta_call_click', {...})
```

**Or use Google Tag Assistant:**
- Install Chrome extension
- Visit your pages
- Click CTAs
- Verify events in real-time

#### 9.2 Events to Verify

- [ ] `cta_call_click` - Phone link clicks
- [ ] `cta_text_click` - SMS link clicks
- [ ] `cta_book_click` - Book button clicks
- [ ] `form_field_focus` - Quote form field interactions
- [ ] `quote_form_abandoned` - User leaves form
- [ ] `vehicle_selected` - User picks vehicle in form
- [ ] `service_selected` - User picks repair vs replacement
- [ ] `location_entered` - User enters zip/city
- [ ] `scroll_depth` - 25%, 50%, 75%, 100% scroll
- [ ] `form_submit_success` - Quote form submitted

#### 9.3 Create GA4 Custom Reports

**After events are firing:**

1. Go to Google Analytics 4
2. Create custom exploration
3. Add dimensions: `event_name`, `page_location`
4. Add metrics: `event_count`
5. Filter by your events

---

### Task 10: QA Checklist

Run through this checklist for every page:

#### Service Pages (5 pages)

- [ ] **Unique title** with primary keyword
- [ ] **Meta description** with CTA (155-160 chars)
- [ ] **H1** matches title intent
- [ ] **Breadcrumbs** visible and functional
- [ ] **Above-fold CTA** after first paragraph
- [ ] **Schema markup** (Service + FAQPage + Breadcrumb)
- [ ] **Internal links** to 8-10 vehicle pages
- [ ] **Internal links** to location pages (sidebar)
- [ ] **FAQs** (6-8 questions) with rich answers
- [ ] **3 CTAs** (hero, above-fold, bottom)
- [ ] **Tel/SMS links** work on mobile
- [ ] **Self-canonical** tag present
- [ ] **Mobile responsive** (test at 375px)
- [ ] **LCP < 2.5s** on mobile (Lighthouse)
- [ ] **No console errors**

#### Location Pages (10 pages)

- [ ] **Unique title** with city name
- [ ] **Meta description** with city + CTA
- [ ] **H1** includes city name
- [ ] **Breadcrumbs** visible
- [ ] **Above-fold CTA** after intro
- [ ] **Schema markup** (LocalBusiness + FAQPage + Breadcrumb)
- [ ] **Lat/long coordinates** accurate
- [ ] **15-20 neighborhoods** listed
- [ ] **2-3 city-specific references** (roads, landmarks)
- [ ] **3 local testimonials** (name + neighborhood)
- [ ] **Links to 5 vehicle pages**
- [ ] **Links to services** (windshield-replacement)
- [ ] **Links to nearby cities** (4-5)
- [ ] **City map** embedded (optional)
- [ ] **Mobile responsive**
- [ ] **LCP < 2.5s**

#### Vehicle Pages (20 pages)

- [ ] **Dynamic title** with make, model, city
- [ ] **Meta description** with price + features
- [ ] **H1** includes make + model
- [ ] **Breadcrumbs** (Home > Vehicles > Make > Model)
- [ ] **Above-fold CTA** after first paragraph
- [ ] **Schema markup** (Service + Product + FAQPage + Breadcrumb)
- [ ] **Pricing** accurate from data
- [ ] **ADAS info** correct (if applicable)
- [ ] **Common issues** displayed (if applicable)
- [ ] **5 vehicle FAQs** with make/model specifics
- [ ] **Links to related models** (3-5)
- [ ] **Links to same-brand models** (sidebar)
- [ ] **Link back to /services/windshield-replacement**
- [ ] **Link back to /locations/denver-co**
- [ ] **"Also serving" cities** (4 links)
- [ ] **Mobile responsive**
- [ ] **LCP < 2.5s**

---

## 🚀 Deployment Checklist

Before going live:

### Pre-Launch

- [ ] All 39 pages created (4 core + 5 services + 10 locations + 20 vehicles)
- [ ] All schema validated (no critical errors in Rich Results Test)
- [ ] All internal links verified (no 404s)
- [ ] Sitemap contains all 39 URLs
- [ ] Robots.txt allows crawlers
- [ ] Analytics events tested and firing
- [ ] Mobile responsive on all pages
- [ ] Lighthouse scores ≥85 on key templates
- [ ] No console errors on any page
- [ ] Tel/SMS links work on mobile devices

### Launch

- [ ] Deploy to production (Vercel/hosting)
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Set up Google My Business profile
- [ ] Set up Google Analytics 4 property
- [ ] Configure GA4 events and conversions
- [ ] Set up Search Console alerts
- [ ] Create baseline ranking report (track 20 keywords)

### Post-Launch (Week 1)

- [ ] Monitor Google Search Console for indexing issues
- [ ] Check for crawl errors daily
- [ ] Verify all pages indexed (39 total)
- [ ] Monitor analytics for traffic spikes
- [ ] Check mobile usability report
- [ ] Review page experience signals
- [ ] Test all CTAs and forms
- [ ] Monitor conversion rate

### Post-Launch (Month 1)

- [ ] Weekly ranking checks (top 20 keywords)
- [ ] Add new customer reviews to schema
- [ ] Create first 2 blog posts
- [ ] Monitor competitors' rankings
- [ ] A/B test CTA copy
- [ ] Review and optimize low-performing pages
- [ ] Add more vehicle models (expand to 30)
- [ ] Add more location pages (expand to 15)

---

## 📊 Success Metrics

### Technical SEO

- **Pages Indexed:** 39/39 (100%)
- **Schema Validation:** 0 critical errors
- **Mobile Usability:** 0 issues
- **Core Web Vitals:** All "Good"
- **Lighthouse Performance:** ≥85 mobile, ≥90 desktop

### Rankings (Month 3)

- **Top 3 Rankings:** 10+ keywords
- **Top 10 Rankings:** 30+ keywords
- **Local Pack Appearances:** Denver + 3 suburbs
- **Featured Snippets:** 2+ from FAQs

### Traffic (Month 3)

- **Organic Sessions:** +150% from baseline
- **Organic Leads:** +50 per week
- **Pages/Session:** 2.5+ (good internal linking)
- **Bounce Rate:** <60% (engaging content)

### Conversions (Month 3)

- **Conversion Rate:** 4-5% (up from 2-3%)
- **Phone Calls:** +30 per week from organic
- **Form Submissions:** +20 per week from organic
- **Cost Per Lead:** 50% lower than paid

---

## 🔧 Troubleshooting

### Schema Errors

**"Missing required field"**
- Check Rich Results Test for specific field
- Add missing field to schema generation function
- Rebuild and retest

**"Invalid value for field"**
- Check data type (string vs number)
- Verify URL format (must be full https://)
- Check date format (ISO 8601)

### Indexing Issues

**"Page not indexed"**
- Check robots.txt (must allow page)
- Check sitemap (must include URL)
- Submit URL directly in Search Console
- Wait 48-72 hours for crawling

**"Crawled - currently not indexed"**
- Improve content quality (add 200+ words)
- Add more internal links to page
- Improve page speed (LCP < 2.5s)
- Request indexing again in Search Console

### Performance Issues

**"LCP > 2.5s"**
- Preload hero images
- Use `priority` prop on above-fold images
- Reduce JavaScript bundle size
- Enable caching headers

**"CLS > 0.1"**
- Set explicit width/height on images
- Avoid injecting content above fold
- Use CSS aspect-ratio for responsive images

---

## 📝 Link Map (Internal Linking Strategy)

### From Homepage

Links to:
- 5 service pages (prominent)
- Top 5 location pages (Denver, Aurora, Lakewood, Boulder, Highlands Ranch)
- Top 6 vehicle pages (most popular)
- Blog (when created)

### From Service Pages

Links to:
- 8-10 top vehicle pages
- Related services (sidebar)
- Top 3 location pages (sidebar)
- Homepage (breadcrumb)

### From Location Pages

Links to:
- All 5 service pages
- 5 popular vehicle pages for that city
- 4-5 nearby location pages
- Homepage (breadcrumb)

### From Vehicle Pages

Links to:
- /services/windshield-replacement (main service)
- /services/adas-calibration (if ADAS)
- /locations/denver-co (primary location)
- 4 other cities ("Also serving" line)
- 3-5 related vehicle pages (same make or similar)
- Homepage (breadcrumb)

### Link Flow Depth

```
Homepage (Level 0)
├── Services (Level 1)
│   ├── Windshield Replacement (Level 2)
│   │   └── Links to 8-10 Vehicles (Level 3)
│   ├── Windshield Repair (Level 2)
│   └── ... (3 more services)
├── Locations (Level 1)
│   ├── Denver (Level 2)
│   │   └── Links to 5 Vehicles (Level 3)
│   └── ... (9 more locations)
└── Vehicles (Level 1)
    ├── Honda Accord (Level 2)
    │   └── Links back to Services + Locations
    └── ... (19 more vehicles)
```

**Max Depth:** 3 clicks from homepage to any vehicle page
**Ideal:** Most important pages at Level 2 (services, locations)

---

## ✅ Completion Criteria

Phase 2 is COMPLETE when:

1. ✅ All 39 pages built and deployed
2. ✅ Sitemap contains all URLs
3. ✅ All schema validated (0 critical errors)
4. ✅ All internal links functional
5. ✅ Breadcrumbs on all pages
6. ✅ Above-fold CTAs on all pages
7. ✅ Analytics events firing
8. ✅ Lighthouse scores ≥85 mobile
9. ✅ All pages indexed in GSC
10. ✅ QA checklist 100% passed

---

## 📚 Next Phase: Content Expansion

After Phase 2 completion:

**Phase 3: Blog & Content Marketing**
- 10 blog posts targeting informational keywords
- FAQ hub page
- About page with team bios
- Careers page

**Phase 4: Scale Vehicles**
- Add 30 more vehicle models (total 50)
- Create brand hub pages (/vehicles/honda, /vehicles/toyota)
- Add year-specific pages (2024 Honda Accord)

**Phase 5: Scale Locations**
- Add 10 more cities (total 20)
- Add neighborhood-specific pages
- Create service area map page

**Phase 6: Advanced Features**
- Online booking with time slots
- Live chat widget
- Customer portal
- Review collection system
- Video testimonials
- Before/after gallery

---

## 🎯 Summary

You now have complete instructions to:
- ✅ Polish all 3 templates
- ✅ Create 4 remaining service pages
- ✅ Create 9 remaining location pages
- ✅ Validate schema and performance
- ✅ Establish strong internal linking
- ✅ Deploy with confidence

**Estimated Time:**
- Template enhancements: 4 hours
- 4 service pages: 6 hours
- 9 location pages: 8 hours
- QA and validation: 4 hours
- **Total: ~22 hours of focused work**

**Result:** A complete, SEO-optimized 39-page website ready to dominate Denver metro auto glass search results.
