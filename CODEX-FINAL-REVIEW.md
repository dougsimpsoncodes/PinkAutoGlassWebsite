# PAG Market Filter Final Review

Reviewed: 2026-03-24

## Verified, not counted as bugs

1. `metricsBuilder` and `unifiedLeadsBuilder` are consistent with each other after the outbound fix. Both only query inbound calls and classify by `to_number`, which is correct for lead counting: [src/lib/metricsBuilder.ts](src/lib/metricsBuilder.ts) lines 305-321 and [src/lib/unifiedLeadsBuilder.ts](src/lib/unifiedLeadsBuilder.ts) lines 214-229. Outbound handling is only needed on the conversation-style calls page.
2. The new `/api/admin/calls` `.or()` clause is valid PostgREST syntax. I verified the generated Supabase request serializes to `or=(and(...),and(...))`. The bug is not the syntax; it is the exact-string phone matching described below.

## Findings

### P0-1: Google Ads, Microsoft Ads, and Search Ads Control capture the initial market value and keep using it

Files:
- `src/app/admin/dashboard/google-ads/page.tsx:108-121`
- `src/app/admin/dashboard/microsoft-ads/page.tsx:107-120`
- `src/app/admin/dashboard/search-ads-control/page.tsx:130-149`

All three pages reference `market` inside `useCallback(...)` fetchers, but those callbacks have empty dependency arrays. Because `MarketProvider` starts with `market = 'all'`, these callbacks usually capture `'all'` on first render and never update. The page badge can say "Phoenix / AZ" or "Denver / CO" while the requests keep using the original market.

Impact:
- Google/Microsoft lead tables can stay all-market after a market change or after hydration from localStorage.
- Search Ads Control lead and revenue summary can stay all-market even when the UI says otherwise.

### P0-2: `/api/admin/roi` does not use the canonical market rules and double-counts unclassified data

Files:
- `src/app/api/admin/roi/route.ts:114-121`
- `src/app/api/admin/roi/route.ts:131-139`
- `src/app/api/admin/roi/route.ts:154-186`

Problems in the current ROI route:
- Revenue leads are selected without `utm_source`, so `classifyLeadMarket()` loses its fallback path for utm-only leads.
- Cost, calls, forms, and revenue all use `m === market || m === null`, which means unclassified rows are included in both market-specific views instead of being excluded like the canonical builders do.

Impact:
- Call leads whose `state`/`zip` are null can leak into both markets through the forms/revenue path.
- Satellite-domain or utm-only revenue can become `null` and then be included in both markets.
- Colorado + Arizona can exceed All Markets on the ROI page.

### P0-3: `/api/admin/total-revenue` still cannot classify several market-filtered revenue cases correctly

Files:
- `src/app/api/admin/total-revenue/route.ts:37-38`
- `src/app/api/admin/total-revenue/route.ts:55-62`
- `src/app/api/admin/total-revenue/route.ts:74-89`

The batching itself is fine, but the classification inputs are incomplete:
- Attributed revenue rows only select `revenue_amount, state, zip`, so utm-only market attribution is lost.
- The lead lookup for `matched_lead_id` only selects `id, state, zip`, so matched installs that depend on `utm_source` cannot be classified.
- Rows with no `matched_lead_id` are intentionally kept in both market views, which prevents a drop-to-zero but makes per-market gross revenue non-exclusive.

Impact:
- Cash jobs / unmatched installs appear in both Colorado and Arizona gross revenue.
- UTM-only matched leads can fall out of both specific markets.

### P1-1: Paid-platform spend and search-term routes are still all-market, so the market badge is misleading

Files:
- `src/app/admin/dashboard/google-ads/page.tsx:123-137`
- `src/app/admin/dashboard/microsoft-ads/page.tsx:122-136`
- `src/app/admin/dashboard/search-ads-control/page.tsx:151-174`
- `src/app/api/admin/dashboard/google-ads/route.ts:17-29`
- `src/app/api/admin/dashboard/microsoft-ads/route.ts:17-29`
- `src/app/api/admin/dashboard/search-performance/route.ts:79-170`

The pages now show a market badge, but the spend/impression/click/search-term APIs still accept no `market` parameter and return global data.

Impact:
- Google Ads and Microsoft Ads pages mix market-specific lead tables with all-market spend and impressions.
- Search Ads Control mixes market-specific lead counts with all-market paid-search spend and term data.
- CPL and ROAS can be materially wrong.

### P1-2: `metricsBuilder` traffic and click events are still all-market, and Website Analytics detail routes are also unfiltered

Files:
- `src/lib/metricsBuilder.ts:151-159`
- `src/lib/metricsBuilder.ts:533-560`
- `src/app/admin/dashboard/website-analytics/page.tsx:145-167`

`buildMetrics()` never passes `market` into `fetchTraffic()` or `fetchClickEvents()`, and those functions have no market logic. The Website Analytics page also still calls `/api/admin/analytics` detail endpoints with no market filter.

Impact:
- Executive Dashboard traffic/click cards are still all-market.
- Website Analytics shows a market badge while both the top-line metrics and the drill-down tables remain global.

### P1-3: ROI page gross revenue banner ignores the selected date range

File:
- `src/app/admin/dashboard/roi/page.tsx:113-122`

The ROI page fetches ROI and funnel data with the selected date range, but gross revenue is fetched as `/api/admin/total-revenue?market=${market}` with no `period` or explicit dates.

Impact:
- Changing from 7 days to 30 or 90 days does not change the gross revenue banner.
- Attribution rate on that page compares period-filtered ROI data to all-time gross revenue.

### P1-4: Market hydration is still visible to users, and the selector has no loading state

Files:
- `src/contexts/MarketContext.tsx:27-37`
- `src/components/admin/MarketSelector.tsx:17-51`

`MarketProvider` renders children immediately with `market = 'all'`, then hydrates from localStorage in an effect. `MarketSelector` does not read `isHydrated`, so it renders "All Markets" immediately with no placeholder, skeleton, or disabled state.

Impact:
- Users briefly see the wrong active market after reload if they previously saved a specific market.
- Pages that do not gate on `isHydrated` can fire an initial all-market request before the saved market is loaded.

### P1-5: `/api/admin/calls` market filtering depends on exact stored phone formatting

Files:
- `src/app/api/admin/calls/route.ts:32-37`
- `src/app/api/admin/calls/route.ts:101-113`
- `src/app/api/admin/sync/ringcentral/route.ts:159-170`

The `.or()` filter uses exact `eq` matches against `+17209187465` / `+14807127465`, but RingCentral sync stores `record.from?.phoneNumber` and `record.to?.phoneNumber` exactly as received. If historical rows are stored as `4807127465`, `(480) 712-7465`, or any other variant, the DB filter misses them before `classifyCallMarket()` ever runs.

Impact:
- Market-specific call threads can disappear even though the number would have classified correctly after normalization.

### P1-6: Repeat callers across periods are still suppressed out of metrics and unified leads

Files:
- `src/lib/metricsBuilder.ts:158`
- `src/lib/metricsBuilder.ts:402-420`
- `src/lib/unifiedLeadsBuilder.ts:236-255`

`fetchCallLeadPhones()` still pulls all persisted call-lead phones ever, with no date bounds. A caller who first called months ago and calls again in the current period can still be suppressed out of the current-period metrics/unified leads response.

Impact:
- Current-period lead counts can under-report repeat callers.
- The bug exists in both the aggregate metrics and the row-level unified leads source.

### P2-1: Some `unified-leads` consumers still do not pass `market`

Files:
- `src/app/admin/dashboard/data-validation/page.tsx:54-60`
- `src/components/admin/PlatformLeadsTable.tsx:106-120`

`external-leads` and `funnel` do not use `/api/admin/dashboard/unified-leads`, so they are not the misses here. The actual misses are:
- the hidden Data Validation page
- the self-fetched fallback path inside `PlatformLeadsTable`

Impact:
- Diagnostic comparisons can report all-market numbers while the rest of the UI is market-specific.
- If `PlatformLeadsTable` is reused without external leads, it will silently ignore market.

### P2-2: The lead detail modal still does not reset when market changes

Files:
- `src/app/admin/dashboard/leads/page.tsx:250-335`
- `src/components/admin/PlatformLeadsTable.tsx:79-134`

`selectedLead` is stored locally in both components, but there is still no `useEffect(() => setSelectedLead(null), [market])` or equivalent reset when the dataset changes.

Impact:
- A user can switch from All Markets to Arizona and still see a Colorado lead open in the modal.
- Follow-up actions in the modal are disconnected from the current filtered table.
