# Phase 3 — Market Filter Wiring (Remaining Pages)

## Summary

Wired the global market filter (MarketContext `useMarket()` hook) to the 5 remaining admin dashboard pages plus 2 API routes. The market selector in the sidebar now controls data on every dashboard page.

## Frontend Pages Updated

### 1. Google Ads (`src/app/admin/dashboard/google-ads/page.tsx`)
- Imported `useMarket` + `MapPin`
- Added `&market=${market}` to `/api/admin/dashboard/unified-leads` fetch
- Added `useEffect` dependency on `market` to re-fetch + clear cache on market change
- Added market indicator badge in header

### 2. Microsoft Ads (`src/app/admin/dashboard/microsoft-ads/page.tsx`)
- Same changes as Google Ads page (unified-leads fetch, market re-fetch, header badge)

### 3. ROI / Ad Performance (`src/app/admin/dashboard/roi/page.tsx`)
- Imported `useMarket` + `MapPin`
- Added `&market=${market}` to `/api/admin/roi` and `/api/admin/total-revenue` fetches
- Added `market` to `useEffect` dependency on `dateRange`
- Added market indicator badge next to SyncButton in header
- **Note:** `/api/admin/funnel` does NOT yet support market filtering (uses `customerDeduplication` which is complex to modify). A code comment marks this as pending.

### 4. Search Ads Control Room (`src/app/admin/dashboard/search-ads-control/page.tsx`)
- Imported `useMarket` + `MapPin`
- Added `&market=${market}` to `/api/admin/dashboard/metrics` fetch
- Added `useEffect` dependency on `market` to re-fetch + clear all caches
- Replaced "Market toggle coming soon" badge with live market indicator

### 5. Website Analytics (`src/app/admin/dashboard/website-analytics/page.tsx`)
- Imported `useMarket` + `MapPin`
- Added `&market=${market}` to `/api/admin/dashboard/metrics` fetch
- Added `market` to `useEffect` dependency on `dateRange`
- Replaced "Market toggle coming soon" badge with live market indicator
- **Note:** `/api/admin/analytics` does NOT yet support market filtering. A code comment marks this. Traffic/page/conversion detail data remains unfiltered; only the metrics (leads/revenue) are market-filtered.

## API Routes Updated

### 6. `/api/admin/roi/route.ts`
- Reads `market` query param
- Filters Google/Microsoft ad spend by `classifyCampaignMarket(campaign_name)`
- Filters RingCentral calls by `classifyCallMarket(to_number)`
- Filters form leads by `classifyLeadMarket(state, zip)`
- Filters revenue leads by `classifyLeadMarket`
- Added `campaign_name` to ad spend selects and `to_number` to calls select, `state, zip` to leads selects

### 7. `/api/admin/total-revenue/route.ts`
- Reads `market` query param
- Filters attributed revenue leads by `classifyLeadMarket(state, zip)`
- Filters gross revenue (omega_installs) via `matched_lead_id` batch-lookup pattern (same as `metricsBuilder.fetchGrossRevenue`): fetches linked leads in batches of 100, classifies by market, keeps rows that match OR have no matched_lead_id

## Endpoints NOT Yet Market-Filtered

| Endpoint | Reason |
|----------|--------|
| `/api/admin/funnel` | Uses `customerDeduplication` — complex dedup logic needs careful refactor |
| `/api/admin/analytics` | Traffic/page/conversion detail is session-based, not lead-based — needs domain-to-market mapping |
| `/api/admin/dashboard/google-ads` | Returns ad platform data (spend/clicks/impressions) — needs campaign_name market classification |
| `/api/admin/dashboard/microsoft-ads` | Same as above |
| `/api/admin/dashboard/search-performance` | Combined search term data — needs campaign-level market split |

## TypeScript Verification

```
npx tsc --noEmit 2>&1 | grep 'error TS' | grep -E 'google-ads|microsoft-ads|roi|search-ads-control|website-analytics|total-revenue'
```

Result: **No errors in any modified files.** Pre-existing errors in `sync/google-ads/route.ts` (unrelated).
