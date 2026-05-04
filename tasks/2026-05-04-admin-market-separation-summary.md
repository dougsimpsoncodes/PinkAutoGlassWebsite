# Admin Market Separation — Summary
**Date:** 2026-05-04
**Status:** P1–P3 shipped + verified. P4 open backlog.

## Problem

Admin dashboard had a market toggle (Denver / Phoenix / All) on multiple pages that silently mis-filtered. Doug spotted it on `/admin/dashboard/website-analytics` — toggling Phoenix showed Denver satellite traffic sources mixed in. A full audit found:

- 5 admin pages with working filters
- 3 admin pages with toggles their APIs ignored ("liars")
- 11 pages with no toggle at all
- 20 of 25 admin API routes had zero market handling

Root cause: `src/lib/market.ts` had classifiers for leads, calls, campaigns, and paths — but not for sessions / page_views / conversion_events, the data driving the admin pages. Even routes with "market support" had leaky sub-fetchers (the KPI bug found by browser regression).

## What shipped (today)

| Phase | Commit | Scope |
|---|---|---|
| P1 | `da1fee7` | Read-time market filter on `/api/admin/analytics` (band-aid before column existed) |
| P2a | `04edcf2` | Nullable `market TEXT` column + partial index on 5 event tables: `user_sessions`, `page_views`, `conversion_events`, `leads`, `ringcentral_calls` |
| P2b | `571fb7c` | `tracking.ts` writes market via `classifySessionMarket()` at session start; child events denormalize via sessionStorage. 14k-row backfill ran cleanly. |
| P2c | `0c518b4` | `BEFORE INSERT/UPDATE` triggers on leads + ringcentral_calls. PL/pgSQL `derive_lead_market()` and `derive_call_market()` mirror TS classifiers. `WHEN NEW.market IS NULL` guard on triggers. 41/41 parity test asserts TS ≡ SQL. |
| P2d | `eeb3211` | Removed P1 band-aid; replaced with `applyMarket(query, market)` SQL helper. Fixed Unique-Visitors KPI bug found by browser regression (fetchTraffic + fetchClickEvents in `metricsBuilder.ts` now take market). |
| P3 | `8a0664e` | microsoft-ads spend + satellite-domains route. Spend filters via `classifyCampaignMarket(campaign_name)`. Satellite-domains list filtered server-side by hardcoded `market` field per domain. |
| Retro | (this) | Per Codex+Gemini retrospective: changed `classifyCampaignMarket` default from `'colorado'` to `null`. Added campaign-classifier fixtures to parity test (62/62 pass). |

## Browser-verification (Codex Desktop, 30-day window)

- Phase A (website-analytics): all 4 assertions pass after P2d. KPI matches table totals.
- Phase B (leads): counts ordered correctly (345 / 310 / 15 across All / Denver / Phoenix).
- Phase C (calls): 522 / 475 / 24, no cross-contamination.
- Phase D (microsoft-ads): post-P3, spend filters correctly. Phoenix=$0 because no Phoenix MS campaigns exist yet (correct, not a bug).
- Phase E (satellite-domains): exact counts 24 / 15 / 6, zero cross-contamination.

## Key design decisions (locked)

1. **Nullable `market` column** on event tables. NULL means "no usable market signal" — factually accurate, not a default. Specific-market views hide NULL records; All Markets includes them.
2. **Classifier signal precedence for sessions**: utm_campaign → utm_source against satellite list → referrer hostname → landing_page path. Most authoritative signal first.
3. **Trigger-based write-side population on leads + calls** (vs modifying the critical `fn_insert_lead` RPC). Trigger has `WHEN NEW.market IS NULL` clause so explicit caller values win.
4. **Parity test (`scripts/test-market-classifier-parity.ts`)** runs 62 fixture cases asserting TS classifiers match SQL trigger functions. Re-run on any change to `market.ts` or the migration.
5. **`classifyCampaignMarket` default → NULL** (not Colorado). Both reviewers flagged the previous Colorado default as a data integrity risk for the moment Phoenix MS launches with a non-market-bearing campaign name.

## Database model (final)

| Table | Market source | Populated by |
|---|---|---|
| `user_sessions` | `classifySessionMarket()` at session start | `tracking.ts` (browser) |
| `page_views` | Inherits from session via sessionStorage | `tracking.ts` (browser) |
| `conversion_events` | Inherits from session via sessionStorage | `tracking.ts` (browser) |
| `leads` | `derive_lead_market(state, zip, utm_source)` | BEFORE INSERT/UPDATE trigger |
| `ringcentral_calls` | `derive_call_market(to_number)` | BEFORE INSERT/UPDATE trigger |

Backfill state: ~16% / 11% / 12% / 29% / 67% tagged on the 5 tables respectively. The remainder are factually un-classifiable (no signal in any source field) — NULL is the correct value.

## Reusable artifacts

- `src/lib/market.ts` — single source of truth for all classifiers (TS)
- `supabase/migrations/20260504_market_triggers_leads_calls.sql` — single source for SQL classifiers + triggers
- `scripts/test-market-classifier-parity.ts` — fixture-tested parity (62/62)
- `scripts/check-backfill-progress.ts` + `scripts/check-leads-calls-progress.ts` — read-only diagnostics
- `scripts/backfill-market-user-sessions.ts` — cursor-paginated backfill pattern (idempotent)

## Open items (P4 + retrospective findings)

1. **P4** — add toggle to 5 silently-all-markets admin pages: `external-leads`, `funnel`, `conversions`, `traffic`, `google-reviews`. Codex flagged these as "trust bugs, not feature gaps" — they can contradict the now-fixed KPI views.
2. **`external_leads` and `invoices`** — no INSERT paths found in app code. Likely come from cron / manual ops. Need a data-owner decision on whether to add a `market` column + populate via separate path.
3. **Bulk-update backfill pattern** — current `backfill-market-user-sessions.ts` is row-at-a-time (~10 min for 14k rows). Refactor to bulk SQL or batched UPDATE before any backfill exceeds ~50k rows.
4. **Synthetic form-submit monitoring** — BEFORE INSERT triggers on `fn_insert_lead`'s critical path. Trigger exceptions abort the form submit. Worth a periodic synthetic submit check.
5. **Operational requirement: market in MS Ads campaign names**. Now that the default is NULL, an unnamed Phoenix campaign falls into "Unknown Market" rather than silent Denver attribution. But the operational best practice is to name campaigns with market literals (`Phoenix - ...`, `Denver - ...`).

## Reviewer findings worth preserving

Both Codex + Gemini converged on the same top concerns at the retrospective. All addressed in the same-day fix:

- ❌ → ✅ classifyCampaignMarket Colorado default (Codex: "the first Phoenix MS launch is exactly when you'll least want silent bad attribution")
- ⚠ noted Trigger ship was sound (nullable column, guard clause, parity tests). Risk caveat: BEFORE INSERT trigger exceptions still abort fn_insert_lead even with the WHEN clause — guard prevents overwrite, not trigger failure.
- ⚠ Row-at-a-time backfill is fine for 14k once but must be bulk-ified before larger backfills (P4 prerequisite).
- ⚠ classifySessionMarket precedence is defensible. Codex recommended adding conflict tests for mixed signals (deferred).
- ⚠ `external_leads`+`invoices` need a data-owner decision, not just "no INSERT paths found" (deferred to P4 prerequisite).

## How to verify the audit holds

1. `npm run build` — compiles clean
2. `npx tsx scripts/test-market-classifier-parity.ts` — 62/62 pass
3. `npx tsx scripts/check-backfill-progress.ts` + `check-leads-calls-progress.ts` — current tagged ratios
4. Browser verification: toggle market on each admin page, confirm displayed numbers change and no cross-contamination. Codex Desktop scripts for this are in `tmp/market-separation-regression*/` (gitignored).
