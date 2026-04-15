# 2026-04-14 — Call attribution remediation

## Background

Pink Auto Glass runs Google Ads + Microsoft Ads search campaigns. Lead attribution for calls (the dominant lead source — 345 of 504 leads since 2026-03-01 are call-originated) is corrupted. The dashboard reads `ringcentral_calls.ad_platform`, which is written by **three competing background jobs** in last-writer-wins order, and the canonical attribution columns (`attribution_method`, `attribution_confidence`) sit on the table but are populated on only 9 of 896 calls — almost all from dev test runs.

### Audit findings (verified 2026-04-14 via service-role SQL)

- **896 calls in `ringcentral_calls` since 2026-03-01.** 887 (99%) have `attribution_method = NULL`. The Phase 2 resolver at `src/lib/callAttribution.ts` is feature-complete but never scheduled (`CRON_SETUP.md` references `/api/cron/run-attribution` — that endpoint does not exist in the codebase).
- **27 calls have BOTH `google_ads_call_match = true` AND `microsoft_ads_uploaded_at IS NOT NULL`** — dual-platform conflicts caused by the offline upload job overwriting the Google call_view match.
- **195 phone_click events in `conversion_events`** since 2026-03-01: 80% carry `gclid`/`msclkid`, 100% have `session_id` and `visitor_id`. The raw data for deterministic call attribution exists; nothing stitches it to calls.
- **Form leads are fine.** 96.3% click-ID capture (105 of 109 paid form leads). The original spec's "67% of paid leads missing click IDs" framing was misleading — 192 of those 217 are call/SMS leads that structurally cannot carry a click ID on the lead record at all.
- `leads.website_session_id` is populated on **0 of 504 rows** (zombie column). `leads.session_id` is the live field. `ringcentral_calls.website_session_id` IS written by the resolver's `saveAttributionResults()`.

### The three writers to `ringcentral_calls.ad_platform`

| File | Line | Writes | Status |
|---|---|---|---|
| `src/lib/callAttributionSync.ts` | 145 | `ad_platform: 'google'` + `google_ads_call_match: true` when Google call_view match lands | Alive (cron `/api/cron/sync-search-data` daily 06:00 + 13:00 UTC) — strongest evidence source, kept as the only `ad_platform` writer for now |
| `src/lib/offlineConversionSync.ts` | 301 (was) | `ad_platform: 'google'` after upload bookkeeping | **Removed in PR1** |
| `src/lib/offlineConversionSync.ts` | 722 (was) | `ad_platform: 'microsoft'` after upload bookkeeping | **Removed in PR1** |

### The orphaned resolver

`src/lib/callAttribution.ts` (499 lines) contains:
- `matchDirectConversions()` — phone_click → call match by time proximity within 5 min. **Critical caveat (line 135–141):** phone_click events store the *business* number, not the caller's, so matching is time-only. No caller fingerprint, no dual-platform conflict detection.
- `matchTimeCorrelation()` — for unmatched calls, picks platform with highest impressions in same hour from `google_ads_daily_performance` / `microsoft_ads_daily_performance`. Confidence capped at 80. **This is impression-volume guessing, not attribution.** Also has a timezone bug at lines 214–216: uses `Date.getHours()` (server-local, UTC on Vercel) but compares against `hour_of_day` stored in the Ads account timezone (probably `America/Phoenix`).
- `attributeAllCalls()` — runs direct match first, then time correlation on unmatched.
- `saveAttributionResults()` — writes `attribution_method` + `attribution_confidence` + `ad_platform` + `website_session_id`. Per-row update in a for loop (N+1 write problem). No precedence guard — a weaker method can overwrite a stronger one.

### Resolver fitness vs the spec's precedence rules

The spec defines call attribution precedence as:
1. Google `call_view` deterministic match (highest confidence)
2. Direct `phone_click` to call match with click ID/session evidence
3. Session-based single-platform match
4. Organic/direct/referral
5. Unknown

The existing resolver maps to those rules:
- **Rule 1** is NOT in `callAttribution.ts` — lives in `callAttributionSync.ts:145` and never writes `attribution_method`. Highest-evidence path doesn't reach the canonical column.
- **Rule 2**: implemented but time-only, no caller fingerprint, no dual-platform conflict detection.
- **Rule 3**: `matchTimeCorrelation` approximates this but it's impression-volume guessing, not session-linked.
- **Rule 4**: not distinguished. Resolver uses `'direct'` as catch-all.
- **Rule 5**: exists.

## The 3-PR remediation plan (synthesized from Claude + Gemini + Codex reviews)

### PR1 — Stop the bleeding + schema cleanup + builder reader prep (this commit)
1. **Migration `20260414_expand_attribution_constraints.sql`** — expand `ringcentral_calls.check_attribution_method` to allow `google_call_view` and `direct_match_conflict` (kept `time_correlation` for backward compat). Expand `ringcentral_calls.check_ad_platform` to add `google_organic`, `microsoft_organic`, `facebook` for parity with `leads.check_leads_ad_platform` (added 2026-01-02 by `20260102_update_ad_platform_constraint.sql`). Pure constraint expansion; no data touched.
2. **Delete `ad_platform` writes** at `offlineConversionSync.ts` markCallsAsUploaded + markCallsAsUploadedToMicrosoft (was lines 301 + 722). Both helpers now do timestamp-only updates. Function comments updated to explain why and to point at this task file.
3. **Update dashboard builders** `metricsBuilder.ts` (deduplicateCalls) + `unifiedLeadsBuilder.ts` (deduplicateCallRows) to:
   - SELECT `attribution_method` + `attribution_confidence` from `ringcentral_calls`
   - Prefer canonical method when set to one of the allowlisted values: `google_call_view` or `direct_match`
   - Fall through to existing legacy logic (`ad_platform` column + 60-min session window heuristic) for any other method or null
   - Backward-compatible no-op until the resolver starts writing canonical methods

**PR1 effect:** dual-platform conflict count stops growing immediately. Some rows previously labeled `'microsoft'` by the upload job after the fact will now stay whatever the earlier writer set (either `'google'` from call_view match or NULL). Dashboard numbers should be unchanged — the builders still fall through to legacy logic for every existing row because no canonical methods are set yet.

### PR2 — Resolver integration + qualification alignment + precedence guards + upload allowlist
1. Extract Google call_view matching from `callAttributionSync.ts` into `callAttribution.ts` as a new `matchGoogleCallView()` function. Method: `'google_call_view'`, confidence 100, ad_platform: `'google'`. Make it Rule 1 in `attributeAllCalls()`. Deprecate the standalone write at `callAttributionSync.ts:145` so the resolver becomes the single canonical writer.
2. **Add shared `isQualifyingCall()` helper** used by all three consumers (resolver, dashboard, offline upload) so qualifying-call rules can never drift again. Currently three different filters live in `metricsBuilder.ts:343-351`, `unifiedLeadsBuilder.ts:293-300`, and `offlineConversionSync.ts:602-605`. Resolver at `callAttribution.ts:355` has none.
3. Tighten `matchDirectConversions()`:
   - Density check: if 5-min window contains BOTH a `gclid` phone_click AND a `msclkid` phone_click, set `attribution_method='direct_match_conflict'`, confidence 50.
   - Batch-fetch phone_click events for the date range once (fix N+1).
   - Document the time-only-proximity weakness as a known issue. Real fix requires form-side caller fingerprinting — separate ticket.
4. **Stop writing `time_correlation` to canonical attribution.** `matchTimeCorrelation()` either gets removed entirely or kept only for a separate analytics widget that doesn't write to `attribution_method`. Per Codex's review: impression-volume guessing should never populate canonical attribution at any confidence level.
5. **Fix timezone bug** in `matchTimeCorrelation` lines 214–216 if it ships at all. Use `America/Phoenix` (PAG's Ads account timezone, no DST) for `callHour` derivation.
6. **Add overwrite-precedence guard** in `saveAttributionResults`: only update if the new method is stronger than (or equal to) the existing method. Prevents a weaker method from overwriting a stronger one if cron runs overlap.
7. **Method-allowlist guards in offline conversion uploads:**
   - Google upload: only ship calls where `attribution_method='google_call_view'` OR (`attribution_method='direct_match'` AND `gclid IS NOT NULL`)
   - Microsoft upload: only ship calls where `attribution_method='direct_match'` AND `msclkid IS NOT NULL`
   - Replaces a single confidence threshold; cleaner, platform-specific.

### PR3 — Schedule + backfill + cleanup
1. Create `src/app/api/cron/run-attribution/route.ts` that calls `attributeAllCalls(last 7 days)`.
2. Add `vercel.json` cron entry at `"0 14 * * *"` (14:00 UTC — 1 hour after `sync-search-data` at 13:00 UTC so deterministic data has landed).
3. Backfill via existing admin endpoint `POST /api/admin/attribution/match-calls?startDate=2026-03-01&endDate=…&saveToDatabase=false` for dry run, eyeball the diff, then re-run with writes.
4. Drop `leads.website_session_id` zombie column. Keep `ringcentral_calls.website_session_id` (resolver writes it).
5. Update stale `CRON_SETUP.md` to reflect reality.

## Decisions made (with reviewers)

- **Claude initial review:** identified 7 issues. Proposed full plan structure.
- **Gemini second opinion (2026-04-14):** SHIP-WITH-CHANGES verdict. Caught 3 things Claude missed:
  - The offline upload guard concept (preventing self-amplifying garbage being sent back to Google/Microsoft bidding)
  - Reorder dashboard swap before resolver deploy (so dashboard is ready when first resolver write lands)
  - Density check naming (`direct_match_conflict` over `attribution_conflict_flag`)
- **Codex second opinion (2026-04-14):** SHIP-WITH-CHANGES verdict. Caught 2 critical things Claude AND Gemini both missed:
  - **Schema enum drift:** the migration's existing CHECK constraints on `attribution_method` did not include `google_call_view`, `direct_match_conflict`, or `statistical_probability`. PR1's writes would have failed the constraint without an explicit migration. A later migration (`20260102_fix_ringcentral_ad_platform_constraint.sql`) had already updated `ad_platform` to allow `'microsoft'` instead of `'bing'`, which Claude missed by not grepping for later constraint changes.
  - **Resolver scope mismatch:** `callAttribution.ts:355` (`attributeAllCalls`) pulls every inbound call with no qualifying-call filter. The dashboard (`metricsBuilder.ts:343-351`), the offline upload (`offlineConversionSync.ts:602-605`), and the unifiedLeadsBuilder all apply different filters. If the resolver is scheduled as-is, it will write `attribution_method` onto rows that the dashboard does not even count as leads.
- **Final synthesis:** PR1 includes the schema migration upfront (catches the enum drift), and PR2 will introduce a shared `isQualifyingCall()` helper so all four consumers (resolver, dashboard, leads builder, offline upload) cannot drift again.

## Decisions NOT made (deliberately deferred)

- **`matchTimeCorrelation` final disposition** — Claude and Gemini agreed it shouldn't ship as canonical attribution. Codex agreed and went further: don't write it to canonical at any confidence. The exact decision (remove entirely vs keep as a non-canonical widget) is being made in PR2.
- **Form-side click-ID capture fix** — Form leads are at 96.3% capture, the booking-form dedup attribution-refresh bug noted in the earlier Stage-5 audit is real but low-impact. Separate ticket.
- **`attribution_resolver_version` column** — Claude proposed adding a smallint version field for safe re-runs of future resolver fixes. Useful but not strictly blocking. Holding for PR2 or later.
- **Caller fingerprinting on phone_click events** — would dramatically improve `matchDirectConversions` accuracy by linking the click to the actual caller, not just the closest one in time. Form-side change, separate ticket.

## PR1 changelog (this commit)

**Files added:**
- `supabase/migrations/20260414_expand_attribution_constraints.sql`
- `tasks/2026-04-14-attribution-remediation.md` (this file)

**Files modified:**
- `src/lib/offlineConversionSync.ts` — removed two `ad_platform` writes from upload-bookkeeping helpers, updated function docstrings to explain the new boundary
- `src/lib/metricsBuilder.ts` — `fetchCalls` SELECT expanded with `attribution_method` + `attribution_confidence`; `deduplicateCalls` attribution resolution updated to prefer canonical methods when set to `google_call_view` or `direct_match`
- `src/lib/unifiedLeadsBuilder.ts` — same changes as metricsBuilder, mirrored in `fetchCallRows` and `deduplicateCallRows`

**Verification:**
- `npx tsc --noEmit` — 11 pre-existing TypeScript errors, **none in files this PR touches**. Build is intentionally tolerant of those.
- `npm run build` — Next.js production build clean. All routes prerender.
- Self-review of diff: the canonical-method allowlist (`google_call_view`, `direct_match` only) is correct; `direct_match_conflict` deliberately excluded because it indicates "we couldn't decide"; `time_correlation` and `unknown` excluded because they're not canonical evidence.
- `grep` confirmed: zero remaining `ad_platform: '...'` writes in `offlineConversionSync.ts`. Stop-the-bleeding is complete.
- Codex review on uncommitted changes: hit OpenAI quota at both `model_reasoning_effort=high` and `=low`. Fell back to Claude self-review for this PR. Will retry Codex on PR2 once quota resets.

**What this PR does NOT do (intentional scope control):**
- Does not schedule the resolver (PR3)
- Does not modify `callAttribution.ts` (PR2)
- Does not add the offline upload method-allowlist guards (PR2)
- Does not fix the docstring/legacy `bing` references in `src/app/api/admin/attribution/match-calls/route.ts` (cosmetic, can wait)
- Does not drop the zombie `leads.website_session_id` column (PR3)
- Does not delete the `tasks/2026-04-12-google-ads-call-attribution-cascade-fix.md` historical context (kept for the record)

## Where to resume

If picking this up in a future session:
1. Read this file end to end.
2. Read `src/lib/callAttribution.ts` end to end (499 lines, the orphaned resolver).
3. Check git log for which PRs have shipped: `git log --oneline main..` from any of the `fix/attribution-*` branches.
4. PR2 starts by extracting the Google call_view logic from `src/lib/callAttributionSync.ts:30-170` into a new function in `callAttribution.ts`, then adding the shared `isQualifyingCall()` helper.
