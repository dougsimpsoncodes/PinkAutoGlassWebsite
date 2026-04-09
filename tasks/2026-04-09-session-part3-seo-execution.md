# 2026-04-09 — SEO Execution (Session Part 3)

## What Was Done

### CRO: Tracking Bug Fix
- **Root cause:** AboveFoldCTA and StickyCallbackBar used `trackCTAClick()` (GA4 only) instead of `trackPhoneClick()`/`trackTextClick()` (DB + Google Ads + Microsoft Ads). Pages using these components showed 0 tracked conversions despite real clicks.
- **Fix:** Switched both components to proper tracking functions. Created ContactCards client component for /contact page's raw tel/sms links.
- **Commits:** a65600f, 29fbaf9

### SEO: Title Tag Overhaul (84 pages)
- All titles under 60 chars, descriptions under 155 chars
- Service pages: removed city names, use "CO & AZ" (Gemini's recommendation)
- CO template: "Windshield Replacement [City] CO | Mobile, $0 Deductible"
- AZ template: "Windshield Replacement [City] AZ | $0 Out of Pocket"
- Insurance template: "[Carrier] Windshield Replacement CO | $0 Deductible"
- Verified by Codex + Gemini post-deployment
- **Commits:** 2e7d545, 7508925

### SEO: Page Consolidation
- Merged /services/rock-chip-repair into /services/windshield-repair (keyword cannibalization)
- Added pricing section, 3 unique FAQs, removed duplicate process section
- 301 redirect configured, internal links updated, old page deleted
- **Commit:** 4259603

### SEO: High-Intent Content Pages (Item 8)
- /does-insurance-cover-windshield-replacement — CO/AZ state laws, comprehensive vs liability, claims process, 10 carrier links, 5 FAQs with schema
- /how-long-does-windshield-replacement-take — step-by-step timeline (6 steps with time estimates), factors affecting time, mobile vs shop comparison, 5 FAQs
- /adas-calibration-cost — cost by vehicle type ($150-$400), what affects cost, safety warning, ADAS feature checklist, 5 FAQs
- /windshield-replacement-cost — 301 redirect to existing /pricing page (already comprehensive at 385 lines)
- All pages include: FAQ JSON-LD schema, breadcrumbs, internal links to service/location/insurance pages, sidebar quick answers, tracked CTAs
- **Commit:** d957f83

## Remaining SEO Items

### Item 7: Deepen Location Page Content (HIGH PRIORITY)
**Status:** Not started
**Scope:** 15+ template CO cities with identical content (only city name swapped)

**Plan (from Codex + Gemini consensus):**
1. Rewrite hero paragraph per city (2-3 sentences with local specifics — highways, weather, landmarks)
2. Add "Windshield Damage in [City]" section (150-200 words on local causes)
3. Replace 2-3 generic FAQs with city-specific ones
4. Enhance neighborhood descriptions with specifics
5. Add "Nearby Cities" cross-link section (supports Item 9)

**Efficient approach:**
- Group cities by corridor: I-25 North, I-25 South, US-36, I-70
- Create data spreadsheet: city, population, highways, damage causes, key neighborhoods, unique FAQs, adjacent cities
- Generate content per city from data

**Template cities to deepen:** Commerce City, Englewood, Evergreen, Golden, Greeley, Lafayette, Littleton, Longmont, Louisville, Loveland, Manitou Springs, Castle Rock, Broomfield, Brighton, Fountain, Fort Collins, Colorado Springs, Parker, Highlands Ranch + others

### Item 9: Internal Linking Structure
**Status:** Not started
**Scope:** Wire all pages together with contextual links

**Plan (from Codex + Gemini consensus):**
- Location pages → service pages (contextual links in body text)
- Location pages → adjacent location pages ("Nearby Cities" section)
- Service pages → top 8-10 location pages per state (service area section)
- Service pages → other service pages (related services)
- New high-intent pages → existing pages (already done in the new pages)
- Blog posts → service + location pages (audit ~10 posts)
- Insurance pages → related service and location pages

### Item 10: GBP Optimization
**Status:** Not started
**Scope:** Weekly posting, review strategy, UTM tracking

**Plan (from Codex + Gemini consensus):**
1. Add UTM params to GBP links (disambiguate 71.4% "direct/none" traffic)
   - Website link: ?utm_source=google&utm_medium=gbp&utm_campaign=listing
   - Posts: ?utm_source=google&utm_medium=gbp&utm_campaign=posts
   - Appointment: ?utm_source=google&utm_medium=gbp&utm_campaign=appointment
2. Weekly posting cadence (alternate service posts + local posts)
3. Review request after every completed job (target 2-5/week)
4. Respond to every review within 24 hours (mention city name)
5. Verify all service categories and attributes

## Also Flagged (Lower Priority)
- Optimize /locations index for "near me" queries (Codex flagged)
- /services/mobile-service may cannibalize homepage — shift focus to "is mobile service free?" intent
- Core Web Vitals audit (Gemini flagged)
- Backlink building strategy (Gemini flagged, long-term)

## How We Worked
- All strategy from Codex + Gemini with identical prompts
- I (Claude) executed code changes, pulled data, built pages
- Codex + Gemini reviewed deployed changes post-deployment
- User made strategic decisions when reviewers disagreed
