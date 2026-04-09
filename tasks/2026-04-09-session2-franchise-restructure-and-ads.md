# Session 2 Log — April 9, 2026
## Franchise URL Restructure + Google Ads Deep Dive

---

## Part 1: Quick Wins (SEO)

### A. AZ Location Page Deepening — ALREADY DONE
All 20 AZ cities in `src/data/arizonaCities.ts` already have unique localContext, challenges, FAQs, neighborhoods, and nearby links. Verified via API — no work needed.

### B. Blog Contextual Links — DONE (commit 4bcafad)
- Added `renderTextWithLinks()` parser to blog renderer (`src/app/blog/[slug]/page.tsx`) — converts `[text](url)` markdown to Next.js `<Link>` for internal URLs
- Applied to paragraph and list item rendering
- Added 2-3 contextual links per blog post (all 12 posts) pointing to:
  - `/services/windshield-repair`, `/services/windshield-replacement`, `/services/adas-calibration`
  - `/services/insurance-claims`, `/services/mobile-service`
  - `/locations/denver-co`, `/locations/phoenix-az`
  - `/adas-calibration-cost`

### C. Core Web Vitals Audit — DONE (no code changes)
Ran Lighthouse CLI on 3 page types:

| Page | Performance | Accessibility | SEO | LCP | CLS |
|------|------------|--------------|-----|-----|-----|
| Homepage | 72 | 87 | 100 | 5.4s | 0.001 |
| /locations/denver-co | 97 | 96 | 100 | 2.5s | 0 |
| /services/windshield-replacement | 96 | 96 | 100 | 2.6s | 0.007 |

**Main bottleneck:** Google Ads + GA4 + UET tracking scripts (122KB unused JS, 429ms script eval). Already using `afterInteractive` strategy — no further optimization possible without risking conversion tracking. Location and service pages are excellent.

---

## Part 2: Franchise URL Restructure — Phase 1 (commit 1b934ec)

### What was built
New subfolder route structure alongside existing routes (coexistence — no redirects active):

**Infrastructure:**
- `src/data/stateConfig.ts` — CO/AZ state configs (phone, legal context, metro label, link prefixes)
- `src/data/arizonaCities.ts` — updated `getArizonaCity()` to accept slugs with or without `-az` suffix; added `getAllArizonaCitySlugs()` for `generateStaticParams`

**New routes (136 total):**
- `/arizona/` — AZ state hub (adapted from `/phoenix`)
- `/arizona/[city]/` — 20 AZ city pages via single dynamic route with `generateStaticParams`
- `/colorado/` — CO state hub (adapted from current homepage)
- `/colorado/[city]/` — 44 CO city pages (script-copied from `/locations/[city]-co/`)
- `/colorado/[city]/[neighborhood]/` — 6 neighborhood sub-pages
- `/colorado/services/[slug]/` — 6 CO service pages
- `/arizona/services/[slug]/` — 6 AZ service pages (phone numbers swapped to AZ)
- `/colorado/insurance/[carrier]/` — 10 CO insurance pages
- `/arizona/insurance/[carrier]/` — 10 AZ insurance pages (phone numbers swapped)
- `/[state]/pricing/` — state-specific pricing (2 pages)
- `/[state]/insurance-coverage-guide/` — state-specific (2 pages)
- `/[state]/how-long-windshield-replacement/` — state-specific (2 pages)
- `/[state]/adas-calibration-cost/` — state-specific (2 pages)
- Services index pages for both states

**Key decisions:**
- All new pages have `robots: { index: false }` — prevents duplicate content issues during coexistence
- CO city pages: direct copy (not data-driven) — 44 unique hand-written pages are too large to extract to data layer in Phase 1
- AZ city pages: single dynamic route using existing `arizonaCities.ts` data
- National homepage transformation deferred to Phase 2 (changing `/` before redirects are live would break current UX)
- Build passes, 0 existing routes modified

### What's next (Phase 2)
1. Activate 301 redirects in `next.config.js`
2. Update all internal links site-wide to new URLs
3. Transform `/` to national homepage with state selector
4. Remove `noindex` from new pages
5. Update JSON-LD structured data URLs
6. Update Google Ads final URLs, GBP links, sitemap

---

## Part 3: Google Ads Deep Dive

### Problem
Keywords campaign showed 0 impressions all day (since midnight, detected at 1pm CO time). Campaign was ENABLED, SERVING, with approved ads and active billing.

### Root Cause (verified via API)
**Campaign `primary_status`: LIMITED, reason: BUDGET_CONSTRAINED**

Three contributing factors:
1. **Maximize Conversions tCPA ($78) too restrictive** — 14-day average CPA was $84. Algorithm refused to bid because it couldn't consistently hit the target. 78-84% of impression share lost to rank.
2. **Offline conversion action misconfigured** — Action ID 7401053894 was type `UPLOAD_CALLS` (6) but received GCLID-based click data. 100% of offline uploads were failing. This fed bad/no signals to the bidding algorithm.
3. **Ad final URL was HTTP** — `http://pinkautoglass.com` instead of `https://`, adding a redirect hop and potentially hurting Landing Page Experience QS component.

### Fixes Applied

**Fix 1: Created new offline conversion action (via API)**
- New action: ID `7568909259`, name "Offline Phone Call (Click Import)", type `UPLOAD_CLICKS` (7)
- Category: QUALIFIED_LEAD, default value $55, ENABLED
- Updated `.env.local` and Vercel production env to new ID
- Old action (7401053894) confirmed inactive in Google Ads UI

**Fix 2: Removed tCPA (user did in Google Ads UI)**
- Bidding now: pure Maximize Conversions, no target CPA
- Campaign primary_status immediately changed from LIMITED → ELIGIBLE
- Budget ($240/day) acts as the only daily cap
- Gemini recommended $120 tCPA; Codex recommended removing entirely — user chose remove

**Fix 3: Updated ad final URL to HTTPS (via API)**
- Changed from `http://pinkautoglass.com` to `https://pinkautoglass.com`
- Ad went to UNDER_REVIEW (normal after edit, typically re-approved within hours)

### Result
Impressions resumed immediately after tCPA removal — 9 impressions within minutes.

### Keyword Performance Summary (30-day data from API)
Only 8 of 157 keywords get any impressions. 145 are ad-group-level negative keywords (exact match competitor brands), not bidding keywords.

| Keyword | Match | QS | 30d Spend | Conv | CPA | IS |
|---------|-------|----|-----------|------|-----|-----|
| windshield replacement | BROAD | 7 | $5,394 | 83 | $65 | 19.8% |
| windshield replacement near me | BROAD | 6 | $306 | 5 | $61 | 14.7% |
| auto glass | BROAD | 5 | $176 | 1 | $176 | 11.5% |
| windshield replacement denver | PHRASE | 7 | $150 | 1 | $150 | 14.2% |
| mobile windshield replacement | BROAD | 8 | $133 | 3 | $44 | 35.2% |

"windshield replacement" broad match = 86% of spend, 89% of conversions.

### Monitoring Plan
- **Next 24-48 hours:** Verify ad re-approved, impressions ramping, daily spend approaching budget
- **Next 1-2 weeks:** Algorithm recalibrating with correct conversion data — expect CPA volatility
- **30 days out:** Evaluate whether to re-add tCPA based on actual unconstrained CPA data
- **Do NOT increase budget** until rank loss (78-84%) is addressed

### Consultant consensus (Gemini + Codex)
- Both agreed: remove tCPA, update HTTPS, don't increase budget
- Both agreed: disable old conversion action
- Gemini flagged: expect 3-7 day recalibration period
- Codex recommended: wait for 30+ unconstrained conversions before re-adding tCPA
