# Local SEO Enhancement Plan — Feb 7 2026

## Overview
Five features to deepen local SEO and turn completed jobs into a growth flywheel: review generation, GBP integration, case study pages, neighborhood pages, and blog pipeline.

---

## Phase 1: Review Request System (Highest ROI)
**Why first:** Reviews are the #1 local ranking factor. You have Twilio/SMS, SendGrid/email, and a drip system already. This plugs right in.

### 1a. Add "Mark Job Complete" to Admin Dashboard
- Add a button/status dropdown on the lead detail view in admin
- Update `leads.status` to `'completed'` (field already exists from Omega integration)
- This is the trigger for the review request sequence

### 1b. Review Request Drip Templates
- **SMS (2 hours after completion):** "Hi {name}, thanks for choosing Pink Auto Glass! If you're happy with your {vehicleMake} {vehicleModel} windshield service, a Google review would mean the world to us: {reviewLink}"
- **SMS (3 days later, if no review detected):** Gentle reminder with the link
- **Email (2 hours after completion):** Branded HTML email with one-click Google review button
- Uses existing `scheduled_messages` table and `processScheduledMessages()` cron

### 1c. Review Request Scheduling
- New `REVIEW_REQUEST_STEPS` in drip scheduler
- New `scheduleReviewRequest()` function triggered when status → 'completed'
- Reuses TCPA compliance, retry logic, dedup from existing drip system

### Files to Create
- None — extends existing drip templates, scheduler, and processor

### Files to Modify
- `src/lib/drip/templates.ts` — add review request SMS + email templates
- `src/lib/drip/scheduler.ts` — add REVIEW_REQUEST_STEPS + scheduleReviewRequest()
- `src/app/admin/dashboard/leads/page.tsx` — add "Mark Complete" button
- `src/app/api/admin/leads/complete/route.ts` (NEW) — API to mark lead complete + schedule review drip

---

## Phase 2: GBP Integration on Location Pages
**Why:** Google Maps embed + reviews on location pages signals relevance to Google and keeps users on-site longer (engagement signals).

### 2a. Google Maps Embed
- Add responsive Google Maps iframe to each of the 44 location pages
- Center map on each city's coordinates (already have lat/lng in schema data)
- Consistent styling across all location pages via shared component

### 2b. Google Reviews Display
- Create `GoogleReviewsWidget` component showing recent reviews
- **Approach decision (for user):**
  - Option A: Static reviews (manually curated, no API cost, always fast)
  - Option B: Google Places API (live reviews, costs ~$17/1000 requests, needs caching)
  - **Recommendation:** Start static, upgrade to API later if needed

### 2c. GBP Info Card
- Business hours, phone, address card on each location page
- Uses data already in schema.ts (generateLocalBusinessSchema)

### Files to Create
- `src/components/GoogleMapEmbed.tsx`
- `src/components/GoogleReviewsWidget.tsx`
- `src/data/reviews.ts` (curated review data)

### Files to Modify
- All 44 location page files (add components) — can be done programmatically

---

## Phase 3: Case Study System
**Why:** "AC repair in Aurora: fixed in 45 mins" pages rank for long-tail keywords and build trust. Real jobs → real content → real rankings.

### 3a. Case Study Data Structure
- TypeScript data file: `src/data/case-studies.ts`
- Fields: slug, title, vehicle (year/make/model), service type, city, duration, description, beforeAfter photos, customerQuote, publishDate
- Each case study generates a page at `/case-studies/[slug]`

### 3b. Dynamic Case Study Pages
- Route: `src/app/case-studies/[slug]/page.tsx`
- Index page: `src/app/case-studies/page.tsx`
- Schema markup: Article + LocalBusiness + Service
- FAQ schema per case study
- Internal links to related location + service + vehicle pages

### 3c. Admin Case Study Management
- Admin page at `/admin/dashboard/case-studies`
- Form to create/edit case studies with all fields
- Draft/Published status
- Stores in Supabase `case_studies` table (new)

### 3d. Sitemap + SEO Integration
- Add case studies to `src/app/sitemap.ts`
- Add breadcrumbs
- Cross-link from location pages ("Recent jobs in {city}")

### Files to Create
- `src/data/case-studies.ts` (initial data + types)
- `src/app/case-studies/page.tsx` (index)
- `src/app/case-studies/[slug]/page.tsx` (detail)
- `src/app/admin/dashboard/case-studies/page.tsx` (admin)
- `src/app/api/admin/case-studies/route.ts` (CRUD API)
- Supabase migration for `case_studies` table

### Files to Modify
- `src/app/sitemap.ts` — add case study URLs
- Location pages — add "Recent jobs in {city}" section

---

## Phase 4: Neighborhood Pages
**Why:** "Windshield replacement Cap Hill Denver" has less competition than "windshield replacement Denver" and captures hyper-local intent.

### 4a. Neighborhood Data
- Define neighborhoods for 6 cities: Denver, Aurora, Lakewood, Colorado Springs, Fort Collins, Boulder
- Data structure: name, slug, parentCity, coordinates, description, populationEstimate
- Store in `src/data/neighborhoods.ts`

### 4b. Neighborhood Pages
- Route: `src/app/locations/[city]/[neighborhood]/page.tsx`
- Content: neighborhood-specific intro, service offerings, FAQ, map zoomed to neighborhood
- Schema: LocalBusiness with neighborhood-level geo
- Internal links to parent city page and service pages

### 4c. Estimated Page Count
- Denver: ~15 neighborhoods (Cap Hill, RiNo, Cherry Creek, LoDo, Highlands, Park Hill, Wash Park, Baker, Sunnyside, Five Points, Stapleton/Central Park, Green Valley Ranch, Montbello, etc.)
- Aurora: ~8 (Original Aurora, Southlands, Saddle Rock, Murphy Creek, etc.)
- Lakewood: ~6 (Belmar, Green Mountain, Bear Creek, etc.)
- Colorado Springs: ~10 (Old Colorado City, Manitou, Briargate, etc.)
- Fort Collins: ~6 (Old Town, Midtown, Timnath, etc.)
- Boulder: ~5 (Pearl Street, University Hill, North Boulder, etc.)
- **Total: ~50 new pages**

### Files to Create
- `src/data/neighborhoods.ts`
- `src/app/locations/[city]/[neighborhood]/page.tsx`
- Neighborhood index component for city pages

### Files to Modify
- `src/app/sitemap.ts` — add neighborhood URLs
- City pages — add "Neighborhoods we serve" section with links
- Schema utilities — neighborhood-level LocalBusiness schema

---

## Phase 5: Blog Pipeline Enhancement
**Why:** 12 posts is solid but 2-4/month keeps you ahead of competitors. Need to make content creation faster.

### 5a. Blog Template System
- Create reusable blog templates for common post types:
  - "Cost of X in Colorado" template
  - "X vs Y comparison" template
  - "Seasonal tip" template
  - "Vehicle-specific guide" template
- Each template has pre-built structure, FAQ section, CTA placement

### 5b. Content Calendar (20 topics)
- Research and plan 20 blog topics based on search volume + gaps
- Mix of evergreen + seasonal + vehicle-specific
- Prioritized by estimated search volume

### 5c. Streamlined Authoring
- Currently blog posts are in a 184KB TypeScript file (`src/data/blog.ts`)
- Consider moving to individual markdown files for easier editing
- Or keep TS file but create a helper script for adding new posts

### Files to Create
- `src/data/blog-templates.ts` (optional — template structures)
- Content calendar document

### Files to Modify
- `src/data/blog.ts` — add new posts as they're created
- Potentially refactor to per-post files

---

## Implementation Order & Effort Estimates

| Phase | Feature | Effort | Dependencies |
|-------|---------|--------|--------------|
| **1** | Review Request System | Medium | None — extends existing drip |
| **2** | GBP on Location Pages | Medium | None |
| **3** | Case Study System | Large | Supabase migration |
| **4** | Neighborhood Pages | Large | Neighborhood data research |
| **5** | Blog Pipeline | Small | None |

**Recommended approach:** Phases 1 + 2 first (most ROI, least risk), then 3 + 4 (content expansion), then 5 (ongoing).

---

## What I Need From You

1. **Phase 1:** Confirm the review request SMS wording — this is a brand voice decision
2. **Phase 2:** Static reviews vs API (I recommend static to start)
3. **Phase 3:** Sample photos/data from a real job for the first case study
4. **Phase 4:** Verify the neighborhood lists per city (I'll research and propose, you confirm)
5. **Phase 5:** What blog topics matter most to your business right now?
