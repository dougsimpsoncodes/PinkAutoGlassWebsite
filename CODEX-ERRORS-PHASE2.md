# Phase 2 Market Filter UI Layer — Error Review

**Reviewed:** 2026-03-24
**Scope:** `MarketContext`, `MarketSelector`, dashboard pages, and the `/api/admin/calls` market filter path

---

## Findings

### P1-1: Market preference hydration still races the first data fetch, and stale responses can win

**Files:** `src/contexts/MarketContext.tsx:27-40`, `src/app/admin/dashboard/page.tsx:78-96`, `src/app/admin/dashboard/leads/page.tsx:270-327`, `src/app/admin/dashboard/calls/page.tsx:93-121`

`MarketProvider` still renders children immediately with `market = 'all'`, then hydrates `localStorage` in a `useEffect`. That means every market-aware page mounts and starts its first request with `'all'` before the saved preference is loaded.

Because those page fetches are not aborted or version-checked, the first `'all'` request can resolve after the second market-specific request and overwrite state with stale data. The user can end up with "Phoenix / AZ" selected while seeing all-market results.

**Impact:** Initial flash of incorrect data on every reload when a saved market exists, plus a real stale-response race during hydration or rapid market toggles.

---

### P2-1: `MarketSelector` is not exposed as an accessible toggle group

**File:** `src/components/admin/MarketSelector.tsx:20-50`

The selector renders three plain buttons, but it does not expose selected state with `aria-pressed`, `aria-checked`, or radiogroup semantics. Screen reader users have no reliable way to know which market is active. There is also no group label relationship beyond visible text.

**Impact:** The control is keyboard-focusable, but its current state is not announced correctly to assistive technology.

---

### P2-2: Executive dashboard now renders the market selector twice

**Files:** `src/components/admin/DashboardLayout.tsx:92-94`, `src/app/admin/dashboard/page.tsx:163-168`

`DashboardLayout` already injects `MarketSelector` into the sidebar. The executive dashboard page renders a second `MarketSelector` in its header. Both share the same context, so they stay in sync, but the UI is duplicated on the main dashboard page.

**Impact:** Duplicate controls, extra focus stops, and inconsistent page chrome versus the rest of the admin dashboard.

---

### P2-3: Sync subscription effects are wired too broadly and cause duplicate refetches after any completed sync

**Files:** `src/contexts/SyncContext.tsx:113-115`, `src/app/admin/dashboard/page.tsx:93-103`, `src/app/admin/dashboard/leads/page.tsx:317-327`, `src/app/admin/dashboard/calls/page.tsx:113-121`

Once `syncVersion` increments above `0`, the "refresh on sync" effects stay armed forever. On the executive dashboard and leads page, changing `dateFilter` or `market` triggers the normal fetch effect and the sync effect. On the calls page, changing `market` triggers both effects.

This does not create an infinite render loop, but it does create duplicate network requests and widens the stale-response race window.

**Impact:** Redundant refetches after the first successful sync, especially noticeable on market/date changes.

---

### P1-2: `/api/admin/calls` applies market filtering after `LIMIT/OFFSET`, so pagination and totals are wrong

**File:** `src/app/api/admin/calls/route.ts:49-76`

The route fetches one page of `ringcentral_calls` first, then applies the market filter in memory:

- `.range(offset, offset + limit - 1)` runs on the unfiltered dataset
- market filtering happens afterward with `.filter(...)`
- `total` for filtered requests is set to `filteredCalls.length`

This breaks filtered pagination in two ways:

1. Pages can underfill because matching calls outside the current unfiltered slice are never seen.
2. `total` becomes "items left after post-filtering this page" instead of "total matching rows in the dataset".

**Impact:** Filtered call views can miss valid calls and cannot paginate correctly.

---

### P1-3: Market-filtered call views drop outbound follow-ups because classification only uses `to_number`

**Files:** `src/app/api/admin/calls/route.ts:65-67`, `src/lib/market.ts:149-153`, `src/app/admin/dashboard/calls/page.tsx:3-13`

The calls API classifies every row with `classifyCallMarket(call.to_number)`. That works for inbound calls because `to_number` is the business line, but outbound calls store the customer number in `to_number`, so they classify as `null` and disappear from Colorado/Arizona views.

The calls page is explicitly a conversation-thread view, not a lead-only view, so dropping outbound rows breaks the thread history the page is supposed to show.

**Impact:** Market-specific call views lose outbound callbacks and show incomplete customer conversations.

---

### P1-4: Google Ads and Microsoft Ads dashboards are still all-market pages

**Files:** `src/app/admin/dashboard/google-ads/page.tsx:104-168`, `src/app/admin/dashboard/microsoft-ads/page.tsx:103-167`, `src/app/api/admin/dashboard/unified-leads/route.ts:23-41`

Both paid-platform pages still fetch without a `market` parameter:

- `/api/admin/dashboard/unified-leads?period=...&platform=google`
- `/api/admin/dashboard/unified-leads?period=...&platform=microsoft`
- `/api/admin/dashboard/google-ads?period=...`
- `/api/admin/dashboard/microsoft-ads?period=...`

The unified-leads API already supports `market`, but these pages never pass it, and the ads API routes do not accept it.

**Impact:** Two of the most market-sensitive reporting pages still show all-market spend/leads even after the Phase 2 UI rollout.

---

### P1-5: Search Ads Control and ROI/Funnel reporting are still disconnected from the market filter

**Files:** `src/app/admin/dashboard/search-ads-control/page.tsx:128-210`, `src/app/admin/dashboard/search-ads-control/page.tsx:223-232`, `src/app/admin/dashboard/roi/page.tsx:111-119`, `src/app/admin/dashboard/roi/page.tsx:153-161`, `src/app/api/admin/roi/route.ts:61-120`, `src/app/api/admin/funnel/route.ts:66-123`, `src/app/api/admin/total-revenue/route.ts:28-50`

These pages still fetch global datasets only:

- Search Ads Control uses `/api/admin/dashboard/metrics`, `/google-ads`, `/microsoft-ads`, and `/search-performance` with no `market`.
- ROI uses `/api/admin/roi`, `/api/admin/funnel`, and `/api/admin/total-revenue` with no `market`.

Search Ads Control even shows a `"Market toggle coming soon"` placeholder, which confirms the rollout is incomplete.

**Impact:** Market-specific spend, CPL, ROAS, and revenue views are still unavailable in major decision-making screens.

---

### P1-6: Website analytics pages and their drill-down siblings still ignore market selection

**Files:** `src/app/admin/dashboard/website-analytics/page.tsx:140-169`, `src/app/admin/dashboard/website-analytics/page.tsx:242-253`, `src/app/admin/dashboard/traffic/page.tsx:27-46`, `src/app/admin/dashboard/conversions/page.tsx:33-52`, `src/app/admin/dashboard/pages/page.tsx:27-46`, `src/app/api/admin/analytics/route.ts:94-130`

The website analytics dashboard and the older traffic/conversions/pages drill-down routes all fetch from `/api/admin/analytics` with no market param, and the analytics API does not accept one. The main website analytics page explicitly says `"Market toggle coming soon"`.

This matters because the Phase 1 market classifier already treats traffic and click events as part of the market-filter story, even if some data remains unattributed.

**Impact:** Market switching stops at the executive dashboard. Traffic, page performance, and click-event screens remain all-market, which makes cross-page comparisons inconsistent.

---

### P2-4: Satellite domain selection uses the old market’s selection for one render after a market switch

**Files:** `src/app/admin/dashboard/satellite-domains/page.tsx:250-258`, `src/app/admin/dashboard/satellite-domains/page.tsx:383-385`

On a market change, `filteredDomains` recomputes immediately, but `selectedDomainKeys` still contains the old market’s selection until the reset effect runs. During that render, `chartDomains` filters the new market with the old selection set.

If the old selection has no overlap with the new market, the chart briefly renders empty before the reset effect restores the selection.

**Impact:** Brief blank chart / blank selected state when switching markets after using a custom domain selection.

---

## Checked But Not Counted As Bugs

- `setMarket` is typed correctly in `src/contexts/MarketContext.tsx` as `Dispatch<SetStateAction<MarketFilter>>`.
- `MarketProvider` placement in `src/app/admin/dashboard/layout.tsx` is correct. Children under `/admin/dashboard/*` receive the provider before rendering.
- `src/app/admin/dashboard/leads/page.tsx` still has an initial load via the `[dateFilter, fetchAllData]` effect.
- `src/app/admin/dashboard/calls/page.tsx` still has an initial load via the `[fetchCalls]` effect.
