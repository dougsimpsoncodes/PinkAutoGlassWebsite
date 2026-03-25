# PAG Attribution System Overhaul — 2026-03-24

## Summary

Claude and Codex performed a full audit of the PAG attribution pipeline. Found 17 verified issues causing inflated conversion counts, lost attribution data, and a 38% "Unknown" bucket that makes it impossible to trust which ad campaigns are driving revenue.

## What's Wrong

### Data Corruption (Active — affecting reporting now)
- **GA4 form_submit fires twice per submission** — inflating conversion count in Google Analytics
- **Microsoft Ads UET has no dedup** — every phone/text click counts as a separate conversion
- **Forms default utmSource to 'direct' when UTMs are missing** — masks broken attribution as intentional direct traffic, inflating the "direct" bucket
- **InsuranceQuoteForm hardcodes smsConsent: true** — TCPA legal risk, user never agreed

### Attribution Gaps (Causing the 38% Unknown bucket)
- **Call attribution finds gclid/msclkid but throws them away** — `saveAttributionResults()` only saves platform + UTMs, discards click IDs
- **callLeadSync only copies ad_platform to leads** — gclid, msclkid, campaign, UTMs all lost when creating leads from calls
- **90-second call attribution window is too tight** — users who take >90s to dial after clicking the number get no attribution
- **Dedup leads don't get attribution updated** — returning visitor from Google Ad keeps stale first-visit attribution
- **offlineConversionSync can double-count** — direct click path doesn't check for Google/Microsoft session conflict

### Dead Code & Missing Tracking
- `firstTouch`/`lastTouch` sent by forms but never consumed by API
- `utmTerm`/`utmContent` stripped by validation schema — form values are dead
- InsuranceQuoteForm "Prefer to call?" phone link is untracked
- `trackFormSubmission()` is fire-and-forget — DB failures don't stop ad conversion fires
- GA4 double-fire extends to `form_start` and `scroll_depth` too

## Fix Plan

### Phase 1 — Stop the Bleeding (now)
1. Remove GA4 double-fire (form_submit, form_start, scroll_depth)
2. Change utmSource default from `'direct'` to `null`
3. Fix InsuranceQuoteForm smsConsent hardcode
4. Add Microsoft UET transaction_id dedup

### Phase 2 — Close Attribution Gaps
5. Persist gclid/msclkid in `saveAttributionResults()`
6. Expand callLeadSync to copy full attribution to leads
7. Widen call attribution window from 90s to 5 minutes
8. Fix offlineConversionSync cross-platform conflict
9. Update dedup leads to refresh attribution on new click IDs

### Phase 3 — Cleanup
10. Remove firstTouch/lastTouch dead code
11. Add utmTerm/utmContent to validation schema
12. Track InsuranceQuoteForm phone link
13. Make trackFormSubmission await trackConversion

## Expected Impact
- Phase 1: Accurate GA4 and Microsoft Ads conversion counts
- Phase 2: Unknown bucket drops from 38% to ~15%, campaign-level revenue attribution works
- Phase 3: Clean codebase, no data leaks

## Key Files
- `src/lib/tracking.ts` — Core tracking, double-fire bugs
- `src/lib/analytics.ts` — Ad platform conversion firing
- `src/lib/attribution.ts` — Platform derivation logic
- `src/lib/callAttribution.ts` — Call-to-ad matching
- `src/lib/callLeadSync.ts` — Call-to-lead creation
- `src/lib/offlineConversionSync.ts` — Offline conversion uploads
- `src/components/QuoteForm.tsx` — Main form, direct default
- `src/components/InsuranceQuoteForm.tsx` — Insurance form, smsConsent bug
- `src/app/api/lead/route.ts` — Lead API, dedup logic

## Status
Plan approved. Starting Phase 1 execution.
