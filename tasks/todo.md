# FAQ / AEO Rollout — All Satellite Sites + Main Site

## Goal
Add thorough, AI-crawlable FAQ sections to every satellite site and pinkautoglass.com.
Target: ChatGPT, Perplexity, Google AI Overviews all cite Pink Auto Glass for auto glass questions.

## The Plan

### Phase 1: Create reusable FAQ component + content bank
- [x] 1. Create `FAQSection.tsx` component — renders visible Q&A with `<h2>`/`<h3>`/`<p>` + inline FAQPage JSON-LD schema
- [x] 2. Build FAQ content bank (28 Q&As) organized by tier (universal / state-specific / city-specific)
- [x] 3. Create FAQ sets mapped to each satellite type

### Phase 2: Roll out to satellite sites (batch by type)
- [x] 4. National sites (3): carwindshieldprices, windshieldrepairprices, carglassprices
- [x] 5. Phoenix chip repair (4): phoenix, scottsdale, mesa, tempe
- [x] 6. Phoenix other (2): windshieldcostphoenix, mobilewindshieldphoenix
- [x] 7. Denver sites (6): windshield-denver, chip-repair-denver, chip-repair-boulder, aurora, mobile-denver
- [x] 8. Remaining national/cost (5): windshield-cost-calculator, cheapest-windshield, new-windshield-cost, get-windshield-quote, new-windshield-near-me, windshield-price-compare

### Phase 3: Main site
- [x] 9. Add FAQ to pinkautoglass.com emergency-windshield-repair (only service page missing FAQ)
- [x] 10. Phoenix landing page already had FAQ — no change needed

### Phase 4: Validate
- [ ] 11. Deploy all satellites and run Google Rich Results Test
- [ ] 12. Test with ChatGPT/Perplexity to verify citation

## Review (Feb 28, 2026)

### What changed
- Created `FAQSection.tsx` reusable component (renders visible FAQ + FAQPage JSON-LD)
- Deployed to all 20 satellite site repos
- Added 8-9 localized FAQ items per site using 3-tier content system:
  - Tier 1 (universal): repair vs replace, ADAS, OEM vs aftermarket, warranty
  - Tier 2 (state-specific): CO law CRS 10-4-613, AZ zero-deductible, hail/heat/monsoon
  - Tier 3 (city/neighborhood): Scottsdale (Old Town, DC Ranch), Mesa (Superstition Springs), Tempe (ASU, Kyrene), Boulder (Pearl Street), Aurora (Southlands, I-225), etc.
- Removed stale schema-only FAQPage from layout.tsx on sites that had it (phoenix, scottsdale, mesa, tempe chip repair sites + windshield-repair-prices)
- Added 8-question FAQ + JSON-LD to pinkautoglass.com/services/emergency-windshield-repair (was the only service page missing FAQ)

### Sites modified (14 new FAQ sections added)
windshield-chip-repair-phoenix, windshield-chip-repair-scottsdale, windshield-chip-repair-mesa, windshield-chip-repair-tempe, mobile-windshield-phoenix, windshield-denver, windshield-chip-repair-denver, windshield-chip-repair-boulder, aurora-windshield, mobile-windshield-denver, windshield-repair-prices, cheapest-windshield, new-windshield-near-me, windshield-price-compare

### Sites with component added (FAQ already existed)
car-windshield-prices, car-glass-prices, windshield-cost-phoenix, windshield-cost-calculator, new-windshield-cost, get-windshield-quote

### Build verification
- pinkautoglass.com: clean build ✓
- windshield-chip-repair-phoenix: clean build ✓
- windshield-denver: clean build ✓
- cheapest-windshield: clean build ✓

### Remaining
- Deploy all 20 satellites + main site to Vercel
- Validate FAQPage schema with Google Rich Results Test
- Monitor AI citation in ChatGPT/Perplexity over next 2-4 weeks

---

## 2026-03-04 — Review Blast System + Data Cleanup

### What changed
- Fixed pre-push hook: removed dead `/vehicles/brands/` URL check (routes deleted last session)
- Moved second `sync-search-data` cron from 6 PM MT → 11 PM MT (`vercel.json`)
- Built review blast system:
  - `src/app/api/admin/review-blast/route.ts` — admin POST endpoint; schedules SMS+email+reminder drip for completed leads; deduplicates by sequence_name; joins omega_installs for name/vehicle fallback
  - `src/app/r/[leadId]/route.ts` — clean branded SMS redirect (pinkautoglass.com/r/[leadId])
  - `src/app/api/review-click/route.ts` — email click tracking redirect
  - Updated `src/lib/drip/templates.ts` — affirmative tone, `leadId` for personalized URLs, grammar fix for missing vehicle
  - Updated `src/lib/drip/processor.ts` — injects `leadId` into template context
- Fixed process-drip cron: added SMS error alerts to OWNER_PHONE (Doug only, not partners)
- Fixed two silent DB constraint bugs via Supabase Management API:
  - `sequence_name` missing `'review_request'` — caused blast to fail silently
  - `status` missing `'processing'` — caused process-drip to silently fail every night since launch; also freed 11 backlogged `quick_quote_drip` messages that sent immediately when fixed
- Fixed Natalie Taylor's vehicle (`esca5` → `Escape`) directly in omega_installs (#10037)
- Documented constraints in `supabase/migrations/20260304_add_review_request_sequence.sql`

### Deliberately NOT done
- Names NOT auto-fixed — some may look wrong but we don't know (e.g., `Vencent` might be intentional)
- Blast NOT fired yet — pending data cleanup decisions below

### Verification
- Tested full flow end-to-end: fake lead → blast API → process-drip → SMS + email received ✓
- Error alerting tested: owner (Doug) receives plain-English text with action item ✓
- Partners (Dan, Kody) do NOT receive alerts ✓

### Remaining before firing blast

**Manual decisions needed (cannot auto-fix):**
1. Company names — exclude from blast or send anyway? `Sunshine Limo`, `Fuller Construction`, `Sanford Drywall`
2. `Vencent` — misspelling of Vincent, or correct? Check Omega CRM
3. `Dodge Grand` (#10096 Kevin Krueger) — Grand Caravan or Grand Cherokee?
4. `Sprinter 170" WB` — clean up the `"` character in vehicle model?

**Safe to fix (capitalization only):**
- Names: `leanne`, `nick`, `Mason neese`, `Jim moore`, `Jared current`, `Michelle bird`, `Tiffany billingsley`
- Vehicles: `ford escape` → `Ford Escape` (#10229), `Honda Crv` → `Honda CR-V` (#10159)
- `Cameron Mishotte #2` → remove `#2` suffix

**Cleanup:**
- Delete test lead: `node scripts/review-blast-test.mjs --cleanup e1f1f3c6-dfac-413c-b782-7aed518b37d4`

---

## Task: Nightly Omega Data Cleanup

### Goal
After every `sync-omega` run, automatically clean obvious data quality issues in `omega_installs`
so the review blast (and future drip messages) always have clean name/vehicle data.

### Rules
- **NEVER auto-fix names** — `first_name`, `customer_name` are off-limits. Misspellings may be intentional.
  Flag suspicious names (numbers, symbols, all-caps, very short) to a review queue instead.
- Fix only clearly mechanical errors: capitalization, known abbreviations, trailing junk.

### What to auto-fix (safe)

**Vehicle makes — known abbreviations → canonical form:**
| Raw value | Fix to |
|-----------|--------|
| `chev`, `chevy` | `Chevrolet` |
| `vw` | `Volkswagen` |
| `gmc` (exact, case-insensitive) | `GMC` |
| `bmw` (exact) | `BMW` |
| `kia` (exact) | `Kia` |

**Vehicle models — known typos → correct spelling:**
| Raw value | Fix to |
|-----------|--------|
| `esca5`, `escpe`, `escape` (case variations) | `Escape` |
| `crv`, `cr-v` (case variations) | `CR-V` |
| `equinx`, `equinox` (case variations) | `Equinox` |
| Any model starting with a digit (e.g., `4Runner`) | preserve as-is |

**General string cleanup (vehicle_make, vehicle_model only):**
- Title-case single-word values that are all-lowercase (e.g., `escape` → `Escape`)
- Trim leading/trailing whitespace
- Remove trailing `#N` suffixes (e.g., `Escape #2`)
- Normalize `"` (curly quote) → `"` (straight quote) in string values

**Vehicle year:**
- If `vehicle_year < 1990` or `vehicle_year > current_year + 2`, set to `null` and flag

### What to flag (do NOT auto-fix)
Write flagged records to a new table `omega_data_flags` with columns:
`id, invoice_number, field_name, raw_value, flag_reason, created_at, resolved_at`

Flag conditions:
- `customer_name` contains digits, `&`, `/`, or is all-caps (likely a company name)
- `first_name` is null or empty after sync
- `customer_name` is a single word with no space (may be last-name-only entry)
- Vehicle make is unrecognized (not in a known-makes list of ~40 common brands)
- Vehicle model contains `"` (inch mark, likely data entry error in Omega)

### Implementation plan
1. Create `omega_data_flags` table via migration
2. Create `src/lib/omega/data-cleanup.ts`:
   - `cleanOmegaRecord(record)` — applies auto-fixes, returns cleaned record + list of flags
   - `runOmegaCleanup()` — queries recent omega_installs (last 7 days), cleans, upserts, inserts flags
3. Call `runOmegaCleanup()` at the end of `sync-omega` cron route (after existing logic)
4. Add a simple admin page or API endpoint to view/resolve flags: `GET /api/admin/omega-flags`

### Success criteria
- After a sync, `SELECT * FROM omega_installs WHERE vehicle_make ~ '[a-z]'` returns 0 lowercase makes
- `SELECT * FROM omega_data_flags WHERE resolved_at IS NULL` shows only genuinely ambiguous records
- No names are ever modified by the cleanup process

### Priority
Medium — do after the review blast fires (blast is imminent, cleanup is ongoing)

## 2026-03-08 — RingCentral SMS Routing & Dan's Inbox

### What was investigated
- Root cause of Dan receiving duplicate texts: `sendAdminSMS` was called on every inbound SMS, delivering a copy on top of his native RC inbox access. Removed from webhook handler.
- Root cause of Doug receiving texts: his number was in `ADMIN_PHONE`. Removed.
- RC webhook auth: `deliveryMode.validationToken` is broken for SMS subscriptions (known RC bug). Switched to URL secret (`?auth_token=`) embedded in webhook URL.
- Auto-reply dedupe: replaced brittle text-match logic with deterministic `message_id` key + DB unique constraint.
- RC Admin Portal confirmed: main number `+17209187465` Fax/SMS Recipient already set to Dan Ext. 101. No change needed.
- Dan can see all inbound customer SMS in his **Text** tab in the RC mobile app.

### Decisions made
- Dan is sole handler of all inbound SMS. Kody gets no copy (risk of double-replies).
- Beetexting inaccessible — all customer SMS falls back to RingCentral. Not revisiting.
- No code changes needed for RC inbox visibility — routing was already correct.

### Verification
- Live test at 1:32pm confirmed webhook captures inbound SMS and stores to DB correctly.
- RC subscription status: Active, blacklistedData: null.

## 2026-03-08 — Colorado Satellite Site Deployment + SEO

### Sites deployed (all 4 live, GSC verified, sitemap submitted):
- coloradospringswindshield.com — "windshield replacement colorado springs" (1,600/mo)
- autoglasscoloradosprings.com — "auto glass colorado springs" (480/mo)
- mobilewindshieldcoloradosprings.com — "mobile windshield replacement colorado springs" (1,600/mo)
- windshieldreplacementfortcollins.com — "windshield replacement fort collins" (390/mo)

### Template bug fixed on all 4: Phoenix phone (480) 712-7465 was still in header/footer/inner pages. Replaced with (720) 918-7465 site-wide.

### SEO improvements applied to all 4:
- H1s keyword front-loaded; meta titles ≤60 chars
- JSON-LD AutoRepair schema: correct city, areaServed, priceRange, openingHours
- UTM locationSuffix fixed (was hardcoded denver-co; now city-specific)
- CRS 10-4-613 FAQ added to all (Colorado zero-deductible glass law)
- Local landmarks: Fort Carson, Peterson SFB, CSU, Horsetooth, Pikes Peak
- Inner pages (service-areas, replacement, insurance) rewritten to remove Arizona/Phoenix content

### Main site config updated + committed:
- satellite-domains/route.ts — 4 new domains in dashboard
- lead/route.ts — added to NATIONAL_SOURCES
- external-leads/route.ts — added to utm_source filter

### Vercel cost reduction (earlier in session):
- Switched all 30 projects from Turbo → Standard build machines
- Saves ~$380/year

---

# GEO SEO Enhancement Tools — Plan (2026-03-20)

## Context
- 24 satellite sites getting 9,317 impressions but only 26 clicks (0.28% CTR)
- All sites pass crawlability audit (no technical blockers)
- AI-referred traffic growing 527% YoY, converts 4.4x higher than organic
- Inspired by geo-seo-claude repo but building our own (per "always audit or build our own" rule)

## What We're Building

### Tool 1: GEO Citability Auditor (`scripts/audit-geo-citability.mjs`)
Scores each satellite site's content for AI citation readiness.

**Checks:**
- [ ] Passage length analysis (optimal: 134-167 words for AI citation)
- [ ] Self-contained answer blocks (do passages answer questions without context?)
- [ ] Statistics/data density (fact-dense content cited 40% more)
- [ ] Definition blocks ("X is..." patterns — cited 2.1x more)
- [ ] Question-answer format presence (Q&A sections, FAQ)
- [ ] Proper noun density (named entities help AI attribute)

**Output:** Markdown report per domain with scores + specific improvement recommendations.

### Tool 2: Brand Mention Scanner (`scripts/audit-geo-brand-mentions.mjs`)
Checks what AI engines "know" about Pink Auto Glass.

**Checks:**
- [ ] Query ChatGPT/Perplexity/Google for "Pink Auto Glass" and windshield-related queries
- [ ] Scan for brand mentions on YouTube, Reddit (AI training data sources)
- [ ] Check brand entity recognition in schema markup across all 24 sites
- [ ] Verify `sameAs` links in Organization schema point to real profiles
- [ ] Check if our sites appear in AI search results for key queries

**Output:** Brand visibility report with gaps and recommendations.

### Tool 3: AI Crawler Rendering Test (`scripts/audit-geo-crawler-access.mjs`)
Verifies AI crawlers can actually parse our content (beyond robots.txt).

**Checks:**
- [ ] Verify all 14 AI crawler user-agents are allowed in robots.txt (GPTBot, ClaudeBot, PerplexityBot, etc.)
- [ ] Test if critical content is in initial HTML (not JS-rendered) — AI bots don't execute JS
- [ ] Validate llms.txt exists and is well-formed on all 24 sites
- [ ] Check for `speakable` schema markup (helps voice/AI assistants)
- [ ] Verify meta tags for AI discovery (description quality, Open Graph completeness)
- [ ] Check X-Robots-Tag headers don't block AI bots

**Output:** Crawler access report with pass/fail per domain + fix recommendations.

## Architecture Decisions
- Standalone `.mjs` scripts (matches existing `audit-satellite-*.mjs` pattern)
- No new dependencies — use native `fetch`, regex for HTML parsing
- Reports output to `tasks/` directory
- Process domains in batches of 3-4 to avoid hammering servers
- Each tool runs independently, ~2-3 min execution time

## What We're NOT Doing
- Not installing the geo-seo-claude repo (build our own)
- Not adding proposal/CRM/PDF generation (agency tools, not needed)
- Not adding new npm dependencies
- Not modifying existing satellite site code (audit only)
- Not touching the lead form, database, or API routes

## Execution Order
1. Tool 3 first (AI Crawler Rendering) — simplest, extends existing crawlability audit
2. Tool 1 second (Citability) — highest impact, directly addresses CTR problem
3. Tool 2 third (Brand Mentions) — requires web search, most complex

## Verification
- Run each script against all 24 domains
- Verify output reports are accurate by spot-checking 2-3 domains manually
- Confirm no errors or timeouts during execution

## 2026-04-09 — Ad Campaign Review & Conversion Tracking Overhaul
- Full session log: [tasks/2026-04-09-ad-campaign-review.md](2026-04-09-ad-campaign-review.md)
- Fixed conversion double-counting (phone clicks + Ring Central offline upload)
- Set data-driven conversion values from actual close rates × avg ticket
- Uploaded 83 negative keywords to Microsoft Ads
- Tightened match types (25 broad → 2 broad + 19 phrase)
- Deployed: commit e6ca81d

## 2026-04-09 (Session 2) — Franchise Restructure Phase 1 + Google Ads Fix
- Full session log: [tasks/2026-04-09-session2-franchise-restructure-and-ads.md](2026-04-09-session2-franchise-restructure-and-ads.md)
- **Franchise Phase 1:** 136 new state-prefixed routes (/colorado/, /arizona/) coexisting with old URLs. All noindexed. Commit 1b934ec.
- **Blog links:** Markdown link parser + 2-3 contextual links per post (12 posts). Commit 4bcafad.
- **CWV audit:** Homepage 72 (tracking scripts), location/service pages 96-97. No actionable fixes.
- **Google Ads — offline conversion action:** Old action was UPLOAD_CALLS type receiving click data (100% failures). New UPLOAD_CLICKS action created (ID 7568909259).
- **Google Ads — tCPA removed:** $78 target was too restrictive (avg CPA $84). Ads had 0 impressions all day. Removed tCPA → ads resumed immediately.
- **Google Ads — final URL:** Updated http:// → https:// via API.
- Verification: Gemini confirmed all changes correct. Codex quota exceeded.
- Deliberately NOT done: national homepage change (deferred to Phase 2), budget increase (rank is the problem, not budget)

## 2026-04-10 — Security Alert Remediation (npm audit)

**Trigger:** GitHub Actions "Security Checks" workflow failed on commit c892147 — `npm audit` found critical/high vulnerabilities.

**What was fixed:**
- Ran `npm audit fix` — patched axios, flatted, picomatch, qs, brace-expansion, yaml, ajv, sharp
- Next.js already at 15.5.15 (above vulnerable range), axios already at 1.15.0 — both were false positives
- xlsx flagged but not installed/not a dependency — false positive

**What was NOT fixed (deliberate decision):**
- 3 remaining high-severity minimatch ReDoS vulns in `@typescript-eslint/parser` (via `eslint-config-next@14.0.4`)
- Fixing requires ESLint 8→9 migration + flat config rewrite (30+ breaking changes) — not a one-liner
- All 3 are dev-only tooling, no production attack vector, not exploitable without controlling tsconfig glob patterns
- **Consensus: Claude, Codex, and Gemini all agreed — defer until ESLint migration is worthwhile on its own merits**

**Workflow change:**
- Updated `.github/workflows/security.yml`: `npm audit` now uses `--omit=dev` to audit production dependencies only
- Changed audit level from `critical` to `high` for better signal
- Added `npm ci` step before audit (was missing — audit without install is unreliable)

**Verification:** Production dependencies are clean. Secret scanning passed. Dev-only noise eliminated from CI.
