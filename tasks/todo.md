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

---

## 2026-04-12 — Google Ads call attribution cascade fix

**Decision and reasoning:** The "March direct-traffic spike" that appeared on the dashboard was diagnosed as a tracking artifact, not a real demand signal. Root cause: `fetchCallConversions` throws a GAQL v21 enum-filter error (`segments.conversion_action_category = 'PHONE_CALL'` is no longer valid), and the cron wrapped 2.5a and 2.5b in a shared outer try/catch, so the throw skipped `fetchCallView` entirely. `google_ads_calls` table had been frozen at 266 rows since 2026-03-01.

**Fix shipped:** Wrapped step 2.5a in an inner try/catch so 2.5b runs regardless of 2.5a outcome. Commit `b8b7c5e`, deployed.

**Deliberately NOT done:** The underlying `fetchCallConversions` GAQL bug is unfixed. `google_ads_call_conversions` table stays empty. Noise in cron logs as `call_conversions sync failed (non-fatal)`. Deferred because the dashboard's primary attribution path reads `google_ads_calls` (step 2.5b), not the conversions table.

**Backfill:** POST `/api/admin/sync/google-ads-calls?days=42` pulled 204 call records, matched 192 to RingCentral via `timestamp+duration+area` cross-reference, errors=0. Table went 266 → 467 rows. March/April attribution rate now 33% and 30% — back in line with Oct-Feb baseline of 21-35%.

**Also shipped (separate commits, same session):**
- `ac15cf4` — `trackGoogleAdsConversion` now sends `value` + `currency: 'USD'` to gtag. Smart Bidding was optimizing for count, not value.
- `d5a4640` — `combineSchemas` strips redundant `@context` from `@graph` members (JSON-LD correctness).

**Verification:**
- Direct DB query: `google_ads_calls` max sync_timestamp = 2026-04-12T14:48 UTC, 467 rows total
- Dashboard `call-attribution` endpoint: March googleAdsForwardingCalls = 158/473 (33.4%), April = 43/143 (30.1%)
- Live probe `fetchCallView('2026-04-11')` against Google Ads v21 returned 3 rows ✓
- `resource_name UNIQUE NOT NULL` confirmed in migration `20260227_call_attribution.sql`

**What's next:**
1. Tomorrow morning: verify the first post-fix scheduled cron run (23:00 UTC tonight or 06:00 UTC tomorrow) wrote new rows to `google_ads_calls`
2. `fetchCallConversions` query fix (separate ticket)
3. Silent-failure alerting: watermark check that fires if `max(sync_timestamp)` is stale >24h
4. Microsoft Ads attribution — check for same class of bug
5. Revisit any bid strategy changes Doug made during the March/April broken window (decisions were based on phantom dashboard data)

**Full session log:** `tasks/2026-04-12-google-ads-call-attribution-cascade-fix.md`

## 2026-05-09 — Automated Quote Engine MVP Foundation

**Decision and reasoning:** MVP target is exact cash windshield quote when the vehicle-to-part match is confident, with estimate/manual review for ambiguous vehicles. PlateToVIN is the first plate lookup provider; Mygrant is used for SOAP inquiry/price/availability, not ordering.

**What changed:**
- Added centralized Mygrant SOAP client at `src/lib/mygrant/client.ts` with the required fixed User-Agent.
- Added Mygrant guard script `scripts/verify-mygrant-client.ts`.
- Added PlateToVIN client and smoke script.
- Added `/api/quote/identify` server-only plate lookup endpoint.
- Added cash windshield pricing helper.
- Added draft migration `supabase/migrations/20260509_automated_quotes.sql` for quote attempts, line items, and plate lookup cache.
- Documented new env vars in `.env.example`.

**Deliberately NOT done:**
- Migration not applied yet.
- No customer-facing `/quote` UI yet.
- No Mygrant live calls yet because credentials are not present in `.env.local`.
- No Mygrant order requests; inquiry only.

**Verification:**
- `npx tsx scripts/verify-mygrant-client.ts` passed.
- Quote modules imported successfully through `tsx`.
- Smoke scripts fail cleanly with missing credential messages.
- Full `npx tsc --noEmit` still fails on pre-existing unrelated project errors.

**Second-opinion review updates:**
- Gemini and Claude reviewed the foundation. Applied follow-up fixes for plate validation status codes, PlateToVIN response shape checks, HTTP timeouts, Mygrant XML logging warning, stronger User-Agent guard, explicit RLS deny policies, no full plate column in the quote table, and pricing input/floor signals.
- Deferred larger Mygrant XML parser refactor until dependency/test decision.

## 2026-05-31 — Team booking-alert SMS reliability fix (serverless freeze)
**Trigger:** Doug asked to verify new auto-quoter bookings reach colleagues via RingCentral. They didn't, reliably.
- **Root cause:** `book/route.ts` fired the team alert as a bare `void sendTeamAlert(...)` (fire-and-forget). Vercel freezes the lambda after the handler returns; inside `sendTeamAlert` email is awaited first (fast Resend → lands), SMS second (gated behind a ~1.5s RingCentral JWT cold-login). On COLD lambdas the freeze cut the SMS leg after the email already went out → bookings got a team EMAIL but no team SMS, intermittently (warm lambdas reuse the module-cached RC client and finish in time).
- **Not a regression:** `booking-notifications.ts` byte-identical between last-working SHA (068eea8/PR#37) and failing prod (9679da5). Decisive in-codebase proof: every other admin-alert site `await`s its sends; `lead/route.ts` + `booking/submit/route.ts` literally comment `// MUST await to prevent Vercel from killing the async operation`. The quoter route was the only one that didn't.
- **Fix (prod SHA 52ddb64, on main):** `after(() => sendTeamAlert(...).catch(...))` from `next/server` (waitUntil-backed, keeps the function alive, still non-blocking for the customer) + `export const maxDuration = 30`. Single file: `src/app/api/quote/book/route.ts`.
- **Gates:** council 3/3 (after() correct, verify in prod); 7-agent adversarial workflow (fix correct on all 5 after() dims, no blocker); codex pre-deploy review (clean, no regression); tsc clean; build green.
- **Live-verified on prod (cold lambda):** test booking PAG-CDB4 (is_test) → Vercel logs `✅ RingCentral authenticated successfully` then `✅ SMS sent` to both team numbers in the `ƒ /api/quote/book` context post-response; RC message-store = **Delivered** to both Kody/Dan with the real buildTeamSmsText format. Test quote/booking/lead deleted after.
- **Deliberately NOT done (flagged to Doug):** same fire-and-forget bug exists at `src/app/api/webhook/ringcentral/sms/route.ts:322` (RC inbound auto-reply) — lower impact, separate route, recommended as a fast-follow rather than bundled.

## 2026-05-31 — Webhook auto-reply: same serverless-freeze fix (fast-follow)
- **Bug:** `webhook/ringcentral/sms/route.ts:322` fired the inbound auto-reply as un-awaited `sendCustomerSMS(...).then(...).catch(...)`, and the nested `ringcentral_sms` status update was never returned by the `.then` — both could be cut by the post-response lambda freeze. (BeeTexting, not RC; same defect class as the team alert.)
- **Fix (prod SHA b075046, on main):** wrapped in `after()` with async/await (now genuinely awaits the 'Sent' status update) + `maxDuration=30`. One file.
- **Gates:** tsc clean (blast radius); codex pre-deploy review clean ("no actionable regressions"); build green; prod deploy 68wjzrcpd Ready/200.
- **Verification:** synthetic-webhook live test was correctly BLOCKED by the safety classifier (would need RINGCENTRAL_WEBHOOK_TOKEN written to a file + a forged webhook — beyond a general "go"). Did NOT work around it. Verified-by-equivalence (identical after() pattern already proven live on the booking fix) + clean review. Optional live confirm: text +17209187465 from a non-team phone → auto-reply `ringcentral_sms` row flips Queued→Sent inside the after() callback.

## 2026-06-05 — Lead Attribution Architecture: PR 1 (reporting parity + field normalization)

**Branch:** `feat/attribution-parity-pr1` (pushed, SHA 3c70b2e)

**What changed:**
- `callAttribution.ts`: Exported `CANONICAL_ATTRIBUTION_METHODS` constant (shared source of truth). Added `utmTerm` to `AttributionResult`. Select `utm_term` from `conversion_events` in `matchDirectConversions()`. Write `gclid`, `msclkid`, `utm_term` to `ringcentral_calls` in `saveAttributionResults()` — only for direct_match results.
- `metricsBuilder.ts`: Replaced inline `hasCanonicalMethod` with `CANONICAL_ATTRIBUTION_METHODS.has()` import. Now includes `microsoft_uploaded_call`.
- `unifiedLeadsBuilder.ts`: Same — uses shared constant instead of inline check. Dashboard and Leads page now definitionally agree.
- `answeringServiceIngest.ts`: `CallAnchor` interface added. `gclid`, `msclkid`, `utm_term`, `website_session_id` selected from RC call and passed through to lead insert. Answering service leads now eligible for offline conversion upload.
- Migration: `20260605_add_attribution_fields_to_ringcentral_calls.sql` adds `gclid`, `msclkid`, `utm_term` to `ringcentral_calls`.

**Not done (deliberate — per plan must-have vs defer split):**
- Direct attribution columns on automated_quotes/bookings (indirect chain via lead_id is sufficient)
- Direct columns on ringcentral_sms (fix was ingest path, not table schema)
- landing_page propagation (needs verification first)

**Still pending:**
- **Migration not applied yet** — run `node scripts/run-migration.js supabase/migrations/20260605_add_attribution_fields_to_ringcentral_calls.sql` before next attribution cron (06:00 or 13:00 UTC)
- PR 2: Architectural unification (export eligibility consumes canonical attribution) — requires Option A vs Option B decision first
- PR 3: Google Ads bidding model — HOLD until PR 2 verified + per-action conversion query run

**Verification queries (run after migration + next attribution cron):**
```sql
-- gclid/msclkid/utm_term populated on calls with direct_match
SELECT gclid, msclkid, utm_term, COUNT(*) FROM ringcentral_calls
WHERE start_time > NOW()-INTERVAL '7 days' AND gclid IS NOT NULL GROUP BY 1,2,3;

-- Answering service leads now have click IDs (created with first_contact_method='call')
SELECT gclid, notes FROM leads
WHERE notes LIKE '%[answering service]%'
AND created_at > NOW()-INTERVAL '7 days';
```

## ✅ RESOLVED (2026-06-02) — PAG-9983 test pollution
Booking (7134b854), quote (e0b55647, 2012 Jeep Wrangler), and lead (1f9f717c "TEST alert verify") all confirmed is_test=true in prod. No further action needed.

## 2026-06-05 — Lead Attribution PR 2: Export Candidates Builder (observe-only)

**Branch:** `feat/attribution-export-contract-pr2`  
**Commit:** ce972bb  
**Migration applied to prod:** `20260605_attribution_export_contract_pr2.sql`

### What was built
- `export_candidates` table: one eligibility decision row per (call/lead × platform) per cron run
- `src/lib/exportCandidateBuilder.ts`: pure `decideCallCandidates()` function + batch IO layer
  - 7-branch evidence hierarchy: skip_google_call_view → skip_realtime_tap → direct_attribution → direct_phone_click → session_fallback → conflict → missing_click_id
  - Batch design: 4 pre-fetched arrays replace N+1 per-call DB queries
- `src/lib/__tests__/exportCandidateDecision.test.ts`: 13 unit tests (all green via `npm run test:unit`)
- `src/lib/attributionHealth.ts`: `upload_coverage_rate` and `session_proximity_eligible_count` added to health snapshot (non-fatal if export_candidates not yet populated)
- `src/app/api/cron/sync-search-data/route.ts`: new step 10.5 runs builder after crossRef (step 10)
- `scripts/compare-export-candidates.js`: dry-run comparison script (7/30 day breakdown)
- vitest added as devDependency, `npm run test:unit` script

### What was deliberately NOT done (PR 2 is observe-only)
- Cron ordering NOT changed (steps 6/7 still run before step 10) — that's PR 2b
- `syncOfflineConversions` / `syncMicrosoftOfflineConversions` NOT modified — PR 2b
- `exported_at` on export_candidates stays NULL until PR 2b uploader writes it

### How to validate
After 7+ days of cron runs:
```
node scripts/compare-export-candidates.js
```
Look for:
- "newly eligible" count > 0 (new coverage from session/direct_attribution paths)
- "newly skipped" count should be low (these are calls the old uploader sent but contract says no)
- upload_coverage_rate in health snapshot (check `/api/admin/health-status`)

**Next step: PR 2b** — flip the uploaders + fix cron ordering
- Pre-condition: compare script shows < 5% newly-skipped rate (no major regressions)
- Then: move step 10 before steps 6/7, rewrite syncOfflineConversions to read from export_candidates

**PR 3 (Google Ads bidding) still on HOLD** until PR 2b verified + per-action conversion query run.

## 2026-06-10 (PM) — Comms-process review fixes
- Reviewed the morning's discount-rescue/comms commits (53f544a, b099754, 54d1d89, 7a5cc18). Verdict: solid; two fixes applied per Doug's "go".
- Fix 1: `dedup_lookup_failed` in the discount processor was completed as terminal `skipped`; one transient Supabase error silently killed a customer's offer forever. Now routes to retryable `failed` (cron retries up to MAX_ATTEMPTS=5). Reproducing test written FIRST (failed on old code), fix delegated to subagent, both tests pass.
- Fix 2: 24h-boundary price mismatch — booking page evaluates the discount window at render, RPC at submit; a customer could see the discounted price and get booked at full price. RPC window now 25h (1h grace); page/copy stay 24h. `supabase/migrations/20260610_discount_grace_window.sql`, applied to prod via management API (POSTGRES_URL still stale), function def verified before/after.
- Bonus finding while verifying grants: morning migration's `REVOKE ALL FROM public` never removed Supabase default `anon`/`authenticated` EXECUTE grants on `fn_create_quote_booking` — anyone with the anon key could call the booking RPC directly, bypassing route validation. Revoked; grantees now postgres + service_role only. Verified the only caller (book route) uses the service-role client.
- Deliberately NOT done: partial-index `processing` predicate, PAG-XXXX token retry loop, SMS segment trimming, review-dedup transient-failure nuance — all logged as low-priority in the review, none blocking.
- Verification: vitest 15/15, `npm run build` clean, prod function def + grants confirmed via management API. (.next/types tsc noise is pre-existing, generated files only.)

## 2026-06-10 (PM, part 2) — Manual-review comms observability + Tim Rendall verification
- Verified Tim Rendall's manual-review comms ALL delivered (the events table just didn't record them): Resend shows team alert (doug/kody/dan) + customer email both "delivered" 16:11:58 UTC; RingCentral message store shows customer SMS + 2 team SMS all "Delivered". The path worked; it just left no DB trace.
- Fixed the observability gap: manual_review comms now claim/complete a notification event with per-channel statuses, exactly like quote_ready (test-first, 4 new tests; subagent implemented). New event type 'manual_review' added to the CHECK constraint — migration 20260610_manual_review_event_type.sql applied to prod BEFORE deploy (claim insert would violate the old constraint and silently skip sends).
- Fixed on sight per project rule: ADMIN_EMAIL and ADMIN_EMAIL_ALERTS in Vercel production had trailing literal \n corruption — re-added clean via printf, verified pulled values clean. (Runtime was unaffected; email.ts strips \n defensively.) Preview-branch copies on feat/auto-quoter-notification-policy left alone.
- Also resolved review item #6: $299 quotes are the intentional QUOTE_MIN_TOTAL_CENTS floor (Doug 2026-05-28, pricing.ts). Noted: rescue discount pierces the floor ($299→$269.10) per Doug's no-floor-cap decision; 3 of today's 4 discount offers were floor-price quotes.
- Verification: 19/19 unit tests, clean build, prod constraint verified, Resend + RingCentral delivery logs cited above.

## 2026-06-10 (evening) — Curt Huntsman invisibility: root cause + fixes
- Curt called to book ($530.16, ref 23AB09D4) and Doug couldn't find him in admin. Three layers, all diagnosed with evidence:
  (1) Search: admin search is literal substring; record says "Curt", searches for "Kurt" miss. No code change — search by phone/last name.
  (2) Emails: both team alerts (12:16 AM + 12:25 AM hot-quote) confirmed DELIVERED via Resend log to all three addresses — buried overnight / possibly spam. No code change.
  (3) Market filter: Denver/CO view does eq('market', ...) and Curt's row has market=NULL — 8 of last 23 real quotes invisible. Root cause: VIN-tab quoters never collect state; market is stamped from state/zip at price time only.
- Fixes shipped: VIN tab now requires state (same dropdown + service-area gate as plate tab — VIN users previously bypassed the CO/AZ gate entirely); admin quotes API includes market-NULL rows in market-filtered views.
- Per Doug: state is enough at quote — explicitly NOT adding a zip stage (preserves 2026-06-05 Codex+Gemini council decision against zip-stage friction).
- NOT done: backfill of the 8 NULL-market rows (no state data exists to classify them; view fix surfaces them), morning-digest email (offered, not requested yet).

## 2026-06-10 (night) — Google Ads quoter creative
- Researched how quote-tool companies write ad copy (Carvana plate/VIN→instant offer, Geico minute-quotes 3.7x CTR, Safelite makes NO speed/price promise — open lane). Full reco built via Codex+Gemini panel, Doug picked "Carvana-plain" register.
- LIVE: RSA 812440528078 in Denver > Denver Keywords, lands /quote, top-3 quote-first headlines pinned pos 1, phone-first control 811492665732 untouched. No insurance copy (cash-pay positioning), lifetime warranty in, charity in one description, phone # out of headlines (call asset 301656778957 covers).
- Detail: tasks/2026-06-10-search-ads-deep-dive.md addendum. Script: scripts/create-quoter-rsa.js.
- Verify next: ad approval clears (~1 day), then Jun 17 measurement week — judge on cost per booked job, not quote volume.

## 2026-06-10 (latest) — MS goal revenue fix applied
- Panel (Codex+Gemini) unanimous: VariableValue flip is reporting-only under MaxConversions, going-forward, no learning reset; leave count type/windows alone pre-Jun 17. Applied + verified: Quick quote → VariableValue $91, Text_click → VariableValue $55. Dead-goal deletion deferred to Jun 24 session per Codex.

## 2026-06-14 — GSC Performance: fix orphaned neighborhood pages (indexing)
**Trigger:** Doug asked to improve Google performance; GSC Coverage showed 58 "Crawled - currently not indexed" + 47 "Discovered - not indexed" (116 non-indexed pages total).

**Root cause found:** The 73 neighborhood pages (/locations/{city}-co/{slug}) were orphaned:
- NOT in sitemap.ts (services/locations/vehicles/blog were, neighborhoods weren't)
- No internal links INTO the cluster — city pages rendered hardcoded `<div><span>` neighborhood names (not links), and the marketing names didn't even match page slugs. NeighborhoodPage cross-links siblings + links up to city, but nothing linked down from authoritative pages.
- Content itself is high quality + differentiated (unique landmarks/hazards/FAQs per neighborhood), so NOT a thin-content problem — purely a link-signal problem.

**Changes:**
- `src/components/NeighborhoodLinks.tsx` (NEW): data-driven linked grid, URLs derived from neighborhood data (always match routes).
- `src/app/sitemap.ts`: import allNeighborhoods, emit 73 neighborhood URLs. Sitemap 135 → 208 URLs (verified in build output).
- 6 city pages (denver/aurora/lakewood/boulder/fort-collins/colorado-springs): replaced hardcoded non-linked neighborhood/"areas we serve" grids with `<NeighborhoodLinks citySlug=... />`. Preserved each page's heading + "Don't see your neighborhood?" CTA.
- Resubmitted stale sitemap to GSC via API (was last submitted 2026-03-01 → now 2026-06-14). Script: scripts/resubmit-sitemap.mjs.
- `scripts/analyze-pag-performance.mjs` (NEW): GSC API analysis (perf, striking distance, CTR ops). Report: tasks/2026-06-14-pag-gsc-analysis.md.

**Verification:**
- `npm run build` exit 0. All 73 neighborhood pages prerender as static HTML.
- sitemap.xml body contains 73 neighborhood URLs (verified), 208 total <url> entries.
- aurora-co.html renders 14 real `href="/locations/aurora-co/{slug}"` internal links (verified).

**Deliberately NOT done:**
- Did not touch the 58-URL "crawled not indexed" triage — needs Doug to export the URL list from GSC to confirm which pages they are (hypothesis: the orphaned neighborhood pages; this fix should resolve most).
- Did not fix pre-existing unused-import warnings (Phone/Star/Shield) in location pages — out of scope, pre-existing.
- Did not address CTR/title rewrites (geico pos 11.7, boulder pos 17.9) or the mobile-service page (pos 58) — separate follow-up.

**Performance snapshot (28d):** 68 clicks (+31%), 14,357 impressions (+28%), CTR 0.47%, avg pos 33.4. Momentum positive.

## 2026-06-14 — Complete franchise URL migration (301 redirects + sitemap) [PR #61]
**Decision (Daisy):** Two live page structures (old /locations|services|insurance + new /colorado|arizona franchise) were cannibalizing sitewide. Chose to complete the franchise migration (franchise = canonical).

**Diagnosis:** Both structures returned 200 + self-canonical. Planned 301s (data/url-restructure-redirect-map.md) never built; commit 65f376a un-noindexed franchise tree exposing duplicates. GSC URL inspection (208 sitemap URLs): 108 Discovered-not-indexed, 47 Crawled-not-indexed, 39 indexed.

**Changes:**
- next.config.js: 94 franchise 301s (verified-live targets only). 43 CO cities, 5 CO neighborhood patterns, 20 AZ cities, 5 services, 10 insurance, 4 high-intent, /phoenix, /locations. Legacy redirects repointed to franchise.
- sitemap.ts: rewritten → 233 canonical franchise URLs (122 /colorado, 41 /arizona). 0 leaked old /locations/*-co.
- NeighborhoodLinks: added basePath prop; applied to 5 franchise city pages (else franchise neighborhoods orphaned — same issue as PR #60).
- scripts/inspect-indexing-status.mjs: GSC inspection bucketing tool. Report: tasks/2026-06-14-indexing-status.md.

**Intentionally NOT migrated (no franchise page yet; already consolidated via reverse redirect, not cannibalizing):**
- Aurora (/locations/aurora-co + 14 neighborhoods) — stays canonical on old URL + in sitemap
- /services/adas-calibration — stays canonical on old URL + in sitemap
- FOLLOW-UP: build /colorado/aurora (+[neighborhood]) and /colorado/services/adas-calibration, then flip their redirects.

**Verified:** build exit 0; 109 redirects in routes-manifest; local server 308 old→franchise (denver-co, capitol-hill nbhd, mobile-service, geico, phoenix, pricing, mesa-az); aurora+adas stay 200; franchise denver renders 12 nbhd links; 59 franchise nbhd pages prerender.

**Cleanup follow-up:** old /locations/*-co page files still exist (redirect before render). Safe to delete later.
**Content bug noted (out of scope):** /arizona/insurance/geico title says "CO" — needs AZ copy.
**Note:** PR #60 (neighborhood links on old /locations pages) is now largely superseded by redirects, except Aurora which stays on the old URL — so PR #60's Aurora work remains live and correct.

## 2026-06-14 — Build franchise Aurora + fix neighborhood canonicals [PR pending]
Completes the franchise migration for Aurora (was the one major location stranded on /locations/aurora-co; highest-impression page at 1,290 impr/pos 19).

**Changes:**
- NEW src/app/colorado/aurora/page.tsx (ported from /locations/aurora-co, franchise URLs + NeighborhoodLinks basePath="/colorado/aurora") + src/app/colorado/aurora/[neighborhood]/page.tsx.
- NeighborhoodPage.tsx: now builds franchise /colorado/<citySlug>/<slug> URLs (was /locations/<city>-co). Fixes a latent issue the migration exposed — the 5 existing franchise neighborhood pages were self-canonicaling to the OLD (now-redirecting) URL. Removed dead citySlugToFolder map. Breadcrumb parent now "Colorado" → /colorado.
- 5 franchise [neighborhood]/page.tsx (boulder, colorado-springs, denver, fort-collins, lakewood): canonical /locations → /colorado, removed dead CITY_FOLDER const.
- next.config.js: added aurora to CO_CITIES + CO_NEIGHBORHOOD_CITIES (forward redirects /locations/aurora-co[/:n] → /colorado/aurora[/:n]); removed the two reverse redirects.
- sitemap.ts: aurora now franchise like all others; removed aurora old-URL special-cases.
- NEW scripts/verify-redirects-live.mjs (prod redirect integrity checker — 90/90 clean on PR #61).

**Verified:** build exit 0; franchise aurora city + 14 nbhd pages prerender; aurora city renders 14 franchise nbhd links; redirects flipped (forward present, reverse gone); boulder/university-hill canonical now self-references /colorado/boulder/university-hill.

**STILL OPEN follow-ups:**
- /services/adas-calibration: still only on old URL (no franchise page). Build /colorado/services/adas-calibration, then flip.
- DEAD FILE CLEANUP (deferred from this PR for reviewability): all old src/app/locations/*-co/ dirs (64 cities + 6 nbhd routes) now redirect and never render. Delete them in a dedicated PR + update any inbound internal links from /locations/* to /colorado/*. Safe (redirects cover paths) but large diff.
- /arizona/insurance/* titles say "CO" — needs AZ copy.

## 2026-06-14 — Franchise cleanup: delete dead old-structure pages + repoint internal links [PR pending]
Removes the now-redirecting old-structure page files and points all internal links straight at franchise URLs (no 301 hops).

**Deleted (all 308-redirect to franchise; verified redirect-covered before deleting):**
- src/app/locations/ entirely (64 city pages + 6 [neighborhood] routes + index)
- src/app/insurance/ (10 carriers)
- src/app/services/ EXCEPT adas-calibration (windshield-replacement/-repair, mobile-service, emergency-windshield-repair, insurance-claims + carrier subpages, index)
- src/app/phoenix, pricing, does-insurance-cover-windshield-replacement, how-long-does-windshield-replacement-take, adas-calibration-cost

**Kept on old URL (intentional, no franchise page):** /services/adas-calibration.

**Added redirect:** /services/insurance-claims/arizona → /arizona/services/insurance-claims (was the one uncovered subpage).

**Internal link repoint (~1,000 refs):**
- Static regex across 123 files: /locations/<x>-co→/colorado/<x>, /locations/<x>-az→/arizona/<x>, /services/<x>→/colorado/services/<x> (adas excluded), /insurance/<x>→/colorado/insurance/<x>, /phoenix→/arizona.
- 50 files: absolute breadcrumb-schema URLs (pinkautoglass.com/services...) that the regex lookbehind had skipped.
- NEW src/lib/locationUrl.ts (franchiseLocationPath helper) for dynamic template-literal refs in blog pages, arizona/services, ArizonaCityPage, ServiceAreaLinks, colorado/services.
- schema.ts generateLocalBusinessSchema now emits /colorado|/arizona LocalBusiness url (was /locations/<city>-<state>).
- NeighborhoodLinks default basePath now /colorado/<citySlug> (was /locations/<citySlug>-co).

**Verified:** build exit 0; old /locations,/insurance,/phoenix routes absent from build; /services/adas-calibration kept; franchise aurora+denver intact; denver LocalBusiness schema url = /colorado/denver; final grep for old refs = clean.

**STILL OPEN:** build /colorado/services/adas-calibration then migrate that last page; /arizona/insurance/* titles say "CO".
