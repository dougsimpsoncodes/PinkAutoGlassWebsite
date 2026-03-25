# PAG Market Filter Bug Status

Reviewed: 2026-03-24

Status meanings:
- `FIXED`: implemented in the current codebase
- `DEFERRED`: still present or only partially addressed
- `WON'T FIX`: intentionally left as-is

## Phase 1 backend review

| ID | Severity | Issue | Status | Notes |
| --- | --- | --- | --- | --- |
| PH1-01 | P0 | Missing Colorado/Arizona zip prefixes in `market.ts` | FIXED | Full CO `800-816` and AZ `850-865` coverage is now present. |
| PH1-02 | P0 | `metricsBuilder` gross revenue dropped unmatched installs under market filter | FIXED | `metricsBuilder.fetchGrossRevenue()` now keeps unmatched installs instead of returning zero. |
| PH1-03 | P1 | Phone-format mismatch in call suppression | FIXED | `normalizePhoneDigits()` is now used in metrics and unified leads suppression. |
| PH1-04 | P1 | `fetchCallLeadPhones()` had no date bounds | DEFERRED | Still global in both builders, so repeat callers can disappear across periods. |
| PH1-05 | P1 | Large `.in()` query could exceed URL limits | FIXED | Lead lookups are now batched in groups of 100. |
| PH1-06 | P1 | `classifyLeadMarket()` only handled 2-letter state abbreviations | FIXED | Full state names are now supported. |
| PH1-07 | P2 | Traffic and click events were not market-filtered | DEFERRED | `fetchTraffic()` and `fetchClickEvents()` still ignore market. |
| PH1-08 | P2 | Redundant `colorado springs` campaign pattern | FIXED | Separate pattern removed; Colorado catch-all remains. |
| PH1-09 | P2 | Dual-market campaign names silently returned `null` | FIXED | Still excluded from specific-market spend, but a warning is now logged. |

## Phase 2 UI review

| ID | Severity | Issue | Status | Notes |
| --- | --- | --- | --- | --- |
| PH2-01 | P1 | Market hydration raced first fetch and stale responses could win | DEFERRED | Some pages gate on `isHydrated`, but selector/render flow still starts at `all` and several pages still fetch too early. |
| PH2-02 | P2 | `MarketSelector` lacked accessible selected-state semantics | DEFERRED | Buttons still have no `aria-pressed` or radiogroup semantics. |
| PH2-03 | P2 | Executive dashboard rendered the market selector twice | FIXED | Dashboard header now shows a badge instead of a second selector. |
| PH2-04 | P2 | Sync subscription effects caused duplicate refetches | FIXED | Current dashboard/leads/calls pages guard on `lastFetchedSyncVersionRef`. |
| PH2-05 | P1 | `/api/admin/calls` filtered after `LIMIT/OFFSET`, breaking pagination | FIXED | Market filtering moved into the DB query with `.or(...)`. |
| PH2-06 | P1 | Market-filtered calls page dropped outbound follow-ups | FIXED | `/api/admin/calls` now handles inbound via `to_number` and outbound via `from_number`. |
| PH2-07 | P1 | Google Ads and Microsoft Ads dashboards remained all-market | DEFERRED | Lead fetches were wired, but spend/impression APIs are still global and the new callbacks capture stale market. |
| PH2-08 | P1 | Search Ads Control and ROI/Funnel were disconnected from market | DEFERRED | Search, funnel, and revenue paths are still inconsistent or incomplete. |
| PH2-09 | P1 | Website analytics pages ignored market selection | DEFERRED | Analytics drill-downs still use unfiltered endpoints; metrics traffic/clicks are still global. |
| PH2-10 | P2 | Satellite domain selection used old-market selection for one render | FIXED | The page now reconciles selected domain keys against the visible market set. |

## Final review

| ID | Severity | Issue | Status | Notes |
| --- | --- | --- | --- | --- |
| FR-01 | P0 | Google Ads, Microsoft Ads, and Search Ads Control capture the initial `market` value in callback fetchers | DEFERRED | `useCallback(..., [])` keeps the first market, usually `all`, even after toggles/hydration. |
| FR-02 | P0 | `/api/admin/roi` includes unclassified rows in both specific-market views and omits `utm_source` for revenue leads | DEFERRED | Market totals can exceed All Markets and utm-only revenue cannot be classified correctly. |
| FR-03 | P0 | `/api/admin/total-revenue` omits `utm_source` and duplicates unmatched installs across both markets | DEFERRED | Batch lookup is fine, but classification inputs are incomplete and cash jobs are non-exclusive. |
| FR-04 | P1 | ROI page requests total revenue without the selected date range | DEFERRED | Gross revenue banner stays all-time while ROI/funnel switch periods. |
| FR-05 | P2 | `unified-leads` consumers still omit `market` in Data Validation and `PlatformLeadsTable` fallback mode | DEFERRED | Hidden diagnostics and future reuse paths can silently ignore market. |
| FR-06 | P2 | Lead modal state is not reset on market change | DEFERRED | Stale lead details can remain open after the table switches markets. |
| FR-07 | P1 | `/api/admin/calls` market filter depends on exact stored phone formatting | DEFERRED | Raw RingCentral phone strings are stored as received, so exact `eq` can miss rows before classification runs. |
