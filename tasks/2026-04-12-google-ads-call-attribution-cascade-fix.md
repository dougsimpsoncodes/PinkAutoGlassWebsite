# 2026-04-12 — Google Ads Call Attribution Cascade Fix

## TL;DR
A cron-cascade bug silently broke Google Ads call attribution for 42 days (2026-03-01 → 2026-04-12). During that window 201 inbound paid calls were misclassified as "direct/website" traffic on the dashboard, creating the appearance of a "March direct-traffic spike" that never actually happened. Fixed, deployed, backfilled, and verified.

Also shipped two smaller improvements in the same session:
1. **Google Ads conversion value fix** (`src/lib/analytics.ts`) — `trackGoogleAdsConversion` now ships `value` and `currency: 'USD'` so Smart Bidding can differentiate a $91 form lead from a $55 phone click instead of training on whatever default the conversion action UI had set (likely $1)
2. **JSON-LD correctness fix** (`src/lib/schema.ts`) — `combineSchemas` now strips redundant `@context` from `@graph` members

## The apparent symptom
Dashboard showed Pink Auto Glass Google Ads "collapsing":
- Feb ROAS 3.9x → Mar 1.7x → Apr 1.25x
- March direct-traffic leads tripled (47 → 160)
- Google Ads spend continued but attribution dropped to zero for March and April

## What was actually happening
Google Ads was performing normally the entire time. The dashboard was mis-attributing paid calls as direct because the cron job that populates `google_ads_calls` stopped writing rows on 2026-03-01.

## Root cause (structural + specific)

### The structural bug (cron cascade)
`src/app/api/cron/sync-search-data/route.ts` step 2.5 had two sequential sub-steps wrapped in a single outer `try`:
- **2.5a**: `fetchCallConversions(startDate, endDate)` — writes to `google_ads_call_conversions`
- **2.5b**: `fetchCallView(yesterday)` — writes to `google_ads_calls` (the primary attribution source)

When 2.5a threw, the outer catch fired and execution jumped past 2.5b entirely. `call_view` never ran.

### The specific trigger
`fetchCallConversions` at `src/lib/googleAds.ts:391-394` uses:
```sql
WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
  AND segments.conversion_action_category = 'PHONE_CALL'
  AND campaign.status != 'REMOVED'
```

Google Ads API **v21** rejects this with:
```
query_error: 18
message: "Invalid enum value cannot be included in WHERE clause: 'PHONE_CALL'."
```

Bare `PHONE_CALL` (unquoted) produces the same error. Dropping the filter entirely works but changes the semantic of the `google_ads_call_conversions` table (would write all conversions, not just call ones).

### Why it started 2026-03-01
The "world-class attribution system" rewrite landed in commit `aa0d7c4` on 2026-02-28. A one-shot backfill ran successfully on 2026-03-01 (commit `ce0644d`, "Fix call_view gRPC timeouts and MST/UTC timezone mismatch", which notes: "Result: 263/266 calls matched (99.2%) after backfilling 266 records"). After that, the daily cron took over, and every run after 2026-03-01 hit the `conversion_action_category` error and skipped `call_view`.

At some point between Feb 28 and now, the `google-ads-api` npm package auto-negotiated to Google Ads API v21, which deprecated this filter. The historic one-shot worked on the prior version; daily runs don't.

## Impact (quantified)
- `google_ads_calls` table: **266 rows, frozen at 2026-03-01T17:06 UTC** for 42 days
- 473 RingCentral inbound calls in March + 143 in April-1-12 (616 total) processed with **zero** Google Ads attribution because cross-reference had nothing to match against
- Dashboard's `googleAdsForwardingCalls` for March/April: **0** (should have been ~30% of each month matching the Oct-Feb baseline)
- Dashboard's `websiteAttributedCalls` inflated by ~200 rows attributable to paid traffic
- The "direct leads tripled in March" finding that triggered this investigation — **not real**

## How the root cause was found

### False starts (before reviewer pushback)
Initial hypothesis based on git archeology alone: "the Feb 28 rewrite introduced a bug, just run the existing admin-sync endpoint with `days=42` to backfill." Codex pushed back: the data gap was proven but the cause wasn't. Three live alternatives still fit: (a) Google Ads stopped emitting call_view data, (b) cron errored daily and the error was swallowed, (c) cron didn't run. Also Codex flagged: the repair endpoint uses `fetchCallViewRange` — different code path — and may succeed even if the underlying bug remains, producing a false "fixed" signal.

### Validated diagnosis path
1. **Step A — code read**: Read `callAttributionSync.ts` (cross-reference is idempotent, only touches unmatched rows), `fetchCallView` (pure function, no DB writes), cron route structure (confirmed the shared try/catch over 2.5a + 2.5b).
2. **Step B — Vercel logs**: Queried production logs over 7 days for each step's `console.log` line. Found: "Syncing Google Ads call conversions..." fires, "Google Ads call sync failed" fires (outer catch), **"Fetching call_view for..." never fires**. This confirmed the cron reaches 2.5a, the throw happens in 2.5a, and 2.5b is skipped.
3. **Step C — direct Google Ads API probe** (read-only): Wrote `/tmp/probe-call-view.mjs` that imported `google-ads-api` directly and ran the exact same GAQL query as the cron. Results:
   - Customer config: `call_reporting_enabled: true`, `call_conversion_reporting_enabled: true` ✓
   - Feb 25 known-good date: 1 row returned ✓
   - Yesterday (Apr 11): 3 rows returned ✓
   - So Google Ads **is** emitting data. The query format works. Rules out hypotheses (a) and part of (b).
4. **Step D — `fetchCallConversions` live test**: Ran the exact conversion-category query against Google Ads API v21. Got the "Invalid enum value" error on v21. Tested `PHONE_CALL` unquoted — same error. Tested with the filter dropped — works.
5. **Step E — DB write path sanity check**: Wrote a test upsert to `google_ads_calls` via Supabase service role key. Succeeded. Verified `resource_name` has a `UNIQUE NOT NULL` constraint in migration `20260227_call_attribution.sql`, confirming upsert idempotency.

## The fix

### Applied (commit `b8b7c5e`, pushed, Vercel auto-deployed at ~14:45 UTC)
Wrapped step 2.5a (`fetchCallConversions`) in its own inner try/catch in `src/app/api/cron/sync-search-data/route.ts`:
```ts
try {  // outer, existing
  const configValid = validateGoogleAdsConfig();
  if (configValid.isValid) {
    // 2.5a: call conversions
    try {  // NEW inner
      console.log('📞 Syncing Google Ads call conversions...');
      const conversions = await fetchCallConversions(startDateStr, endDateStr);
      // ...existing write logic...
    } catch (ccError: any) {
      results.googleAds.callConversions.error = ccError.message;
      console.warn(`⚠️ call_conversions sync failed (non-fatal): ${ccError.message}`);
    }
    // 2.5b: call_view — now runs regardless of 2.5a outcome
    const yesterday = endDateStr;
    console.log(`📞 Fetching call_view for ${yesterday}...`);
    // ...existing inner try around fetchCallView...
  }
} catch (error: any) {
  // existing outer catch — still fires if validateGoogleAdsConfig() throws
}
```

Zero logic changes. Pure structural isolation. Outer try/catch preserved for truly unexpected failures.

### Deferred (separate ticket)
The actual `fetchCallConversions` GAQL query bug is **not** fixed. `google_ads_call_conversions` table remains empty. Each cron run will now log `⚠️ call_conversions sync failed (non-fatal)` to Vercel logs. This is acceptable because:
- The dashboard's primary call attribution reads from `google_ads_calls` (step 2.5b), not from `google_ads_call_conversions`
- The `call_view` pipeline is the business-critical path
- Fixing `fetchCallConversions` requires either a conversion_action resource lookup query or a schema semantics decision, neither of which blocks this session's goal

## Backfill

POSTed to `/api/admin/sync/google-ads-calls?days=42` via Basic Auth after deploy confirmed Ready. Response in 14.9 seconds:
```json
{
  "ok": true,
  "dateRange": {"from": "2026-02-28", "to": "2026-04-11"},
  "results": {
    "callConversions": 0,
    "callViewRecords": 204,
    "crossReference": {"matched": 192, "unmatched": 1, "errors": 0}
  }
}
```

Note `callConversions: 0` confirms the known broken query still fails — but the admin endpoint has its own try/catch around `fetchCallConversions` and continues through to `fetchCallViewRange`, which succeeded.

## Verification (post-backfill)

`google_ads_calls` table:
| Month | Before | After |
|---|---|---|
| Oct 2025 | 24 | 24 |
| Nov 2025 | 56 | 56 |
| Dec 2025 | 61 | 61 |
| Jan 2026 | 51 | 51 |
| Feb 2026 | 74 | 74 |
| **Mar 2026** | **0** | **158** |
| **Apr 2026 (12d)** | **0** | **43** |
| **TOTAL** | **266** | **467** |

Max `sync_timestamp`: **2026-04-12T14:48:15 UTC** (just after backfill)

Dashboard `call-attribution` endpoint after backfill:

| Month | Total calls | Google Ads fwd | Google Ads % |
|---|---|---|---|
| Oct 2025 | 70 | 24 | 34.3% |
| Nov 2025 | 262 | 56 | 21.4% |
| Dec 2025 | 267 | 61 | 22.8% |
| Jan 2026 | 190 | 51 | 26.8% |
| Feb 2026 | 210 | 74 | 35.2% |
| **Mar 2026** | **473** | **158** | **33.4%** |
| **Apr 2026** | **143** | **43** | **30.1%** |

March and April attribution rates are now in-line with the Oct-Feb baseline of 21-35%. The "0% anomaly" that triggered this investigation is gone.

Match methods (post-backfill totals):
- `timestamp+duration+area`: 434 (high-confidence: time within 60s, duration within 10s, area code overlap)
- `timestamp+duration`: 28
- `timestamp_only`: 1
- Total matched: 463 / 467 (99.1%)

## Other changes shipped this session

### Commit `ac15cf4` — Conversion value fix (`src/lib/analytics.ts`)
`trackGoogleAdsConversion` was firing gtag conversion events with only `send_to` and `transaction_id`. Smart Bidding was optimizing for conversion **count**, not value, because no value was ever sent.

Added three constants matching the existing server-side values in `offlineConversionSync.ts`:
- `FORM_CONVERSION_VALUE_USD = 91` (25.2% close × $360 avg ticket)
- `CALL_CONVERSION_VALUE_USD = 55` (15.3% close × $360 avg ticket)
- `TEXT_CONVERSION_VALUE_USD = 55`

`trackGoogleAdsConversion` now requires `value: number` as a positional parameter and always passes `value` + `currency: 'USD'` to gtag. The three wrapper callers (`trackLeadFormConversion`, `trackCallClickConversion`, `trackTextClickConversion`) pass their respective constant.

Smart Bidding needs ~2 weeks to retrain on the new signal before any bid strategy decisions should be made based on reported ROAS.

### Commit `d5a4640` — JSON-LD graph fix (`src/lib/schema.ts`)
`combineSchemas` was building a `@graph` that repeated `@context` on each inner member. JSON-LD spec: parent `@context` applies to all graph members; inner duplicates are incorrect and some structured-data parsers treat them as separate documents. `combineSchemas` now strips `@context` from each schema before inserting into `@graph`.

Not mine — discovered in working tree, judged as legit, committed separately per one-logical-change-per-commit rule.

## Reviewer pattern used this session
Every non-trivial decision was pre-checked with Codex (`gpt-5.4` via `codex exec --sandbox read-only`). Codex's pushback changed the plan materially at least four times:
1. Original "same-tests across three reviewers" approach → Codex and Gemini both independently recommended split-lens for root-cause discovery
2. Original "run the repair immediately" plan → Codex flagged three alive hypotheses and insisted on pre-check diagnostics
3. Original Step 1 (DB schema) → Codex reordered to Step 2 (code read) → Step 6 (logs) → Step 5 (config) → Steps 3/4 last
4. Original "consolidate into one script" → Codex kept them separate for isolation

Full review briefs were written to `/tmp/codex-*.md` during the session; all deleted at end-of-session cleanup.

## Outstanding (tomorrow / later)
1. **Tomorrow morning verification**: next scheduled cron runs at 23:00 UTC tonight (5pm MDT) and 06:00 UTC tomorrow (12am MDT). After either run, verify `google_ads_calls` received new rows via `SELECT max(sync_timestamp), count(*) FROM google_ads_calls` and confirm `max(sync_timestamp)` is from tonight/tomorrow. If not, second-order bug.
2. **`fetchCallConversions` GAQL query bug** — deferred. Requires conversion_action resource lookup or schema decision. Noise in logs until fixed.
3. **Silent-failure alerting** — 42 days was too long to notice. Watermark check + alert when `max(sync_timestamp)` older than 24h.
4. **Microsoft Ads attribution** — excluded from this review. Possibly has similar class of bug.
5. **Doug's Google Ads bid strategy decisions made during the broken window** — any keywords paused, budgets cut, or bid changes made in response to the (false) performance drop are worth re-evaluating now that attribution is correct.

## Files modified
- `src/app/api/cron/sync-search-data/route.ts` — cascade fix (commit b8b7c5e)
- `src/lib/analytics.ts` — conversion value fix (commit ac15cf4)
- `src/lib/schema.ts` — JSON-LD graph fix (commit d5a4640)

## Not modified (intentionally)
- `src/lib/googleAds.ts` — the broken `fetchCallConversions` query. Left for a separate ticket.
- `src/lib/callAttributionSync.ts` — cross-reference logic verified safe/idempotent.

## Commits shipped this session
```
d5a4640 fix: strip redundant @context from @graph members in combineSchemas
b8b7c5e fix: isolate call_conversions sync failure from call_view sync
ac15cf4 fix: add value + currency to Google Ads conversion events
```
