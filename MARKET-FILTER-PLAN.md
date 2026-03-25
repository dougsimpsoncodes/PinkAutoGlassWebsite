# PAG Market Filter — Implementation Plan
**Date:** 2026-03-24  
**Goal:** Wire up the "Market toggle coming soon" placeholder in the Admin Executive Dashboard so the user can filter every report to a specific geographic market: **Denver/CO** or **Phoenix/AZ** (or "All").

---

## 1. Current State Audit

### What we have
- `src/lib/market.ts` — defines `Market = 'arizona' | 'colorado'`, `getPhoneForMarket()` returns two phone numbers:
  - Colorado/Denver: `+17209187465` (720)
  - Arizona/Phoenix: `+14807127465` (480)
- `SATELLITE_DOMAINS` in `/api/admin/satellite-domains/route.ts` already categorizes every domain as Denver, Phoenix, National, or CO Springs
- `leads` table has a `state` column (+ `zip`, `city`) — usable for market segmentation
- `leads` table has a `market_type` column (added 2026-02-27): `in_market | out_of_market | NULL` based on zip prefix; Phoenix = 850xx-855xx, Denver = 800xx-806xx
- `ringcentral_calls` has a `to_number` column — inbound calls to `+17209187465` = Denver, calls to `+14807127465` = Phoenix
- `google_ads_daily_performance` and `microsoft_ads_daily_performance` have `campaign_name` — Denver vs Phoenix campaigns are likely named with geo in the name (need to verify)
- Satellite domains already clearly tagged as Denver vs Phoenix vs National
- No market column on `omega_installs` yet — revenue attribution via matched leads

### What we DON'T have yet
- A `market` param on any API route
- A `MarketFilter` UI component in the admin center
- Global market state in a React context
- Market filtering logic in `metricsBuilder.ts` or `unifiedLeadsBuilder.ts`

---

## 2. Market Classification Logic

### Leads (form + SMS)
**Primary signal:** `state` column
- `state = 'CO'` → colorado
- `state = 'AZ'` → arizona
- Fallback: `market_type` column (`in_market` + zip prefix check)
- Fallback 2: `utm_source` — if it matches a Colorado satellite domain → colorado; Phoenix domain → arizona

### Calls (ringcentral_calls)
**Primary signal:** `to_number` column
- `to_number = '+17209187465'` → colorado (Denver main line)
- `to_number = '+14807127465'` → arizona (Phoenix line)

### Ad Spend (google_ads_daily_performance / microsoft_ads_daily_performance)
**Primary signal:** `campaign_name` ILIKE patterns
- Contains 'denver' OR 'boulder' OR 'aurora' OR 'colorado' OR ' CO ' → colorado
- Contains 'phoenix' OR 'scottsdale' OR 'mesa' OR 'tempe' OR 'arizona' OR ' AZ ' → arizona
- No match → include in 'All' but NOT in either individual market (or split 50/50 — TBD)

### Omega Revenue (omega_installs)
**Primary signal:** Matched lead's market (via `matched_lead_id` → leads.state)
- Join omega_installs → leads → use state/market of the matched lead

### Traffic & Click Events (user_sessions, page_views, conversion_events)
**Primary signal:** `page_path` or `referrer`
- Session's `page_path` contains `/phoenix` or AZ satellite UTM source → arizona
- Otherwise → colorado (default market for main site)
- Can also use `utm_source` on sessions if tracked

### Satellite Domains
Already tagged — use the categorization from `SATELLITE_DOMAINS` const. Add a `market` property to each domain entry.

---

## 3. Implementation Plan

### Phase 1 — Foundation (no UI yet, just market-aware backend)

#### 1a. Extend `market.ts` — add constants (server-safe version)
```typescript
// Market classification helpers
export const COLORADO_PHONE = '+17209187465';
export const ARIZONA_PHONE = '+14807127465';

export const DENVER_SATELLITE_SOURCES = [
  'windshieldcostcalculator', 'windshielddenver', 'chiprepairdenver', 
  'chiprepairboulder', 'aurorawindshield', 'mobilewindshielddenver',
  'cheapestwindshield', 'newwindshieldcost', 'getawindshieldquote',
  'newwindshieldnearme', 'windshieldpricecompare',
  'coloradospringswindshield', 'autoglasscoloradosprings',
  'mobilewindshieldcoloradosprings', 'windshieldreplacementfortcollins',
];

export const PHOENIX_SATELLITE_SOURCES = [
  'chiprepairmesa', 'chiprepairphoenix', 'chiprepairscottsdale',
  'chiprepairtempe', 'windshieldcostphoenix', 'mobilewindshieldphoenix',
];

export function classifyLeadMarket(lead: { state?: string; zip?: string; utm_source?: string }): Market | null {
  if (lead.state === 'CO') return 'colorado';
  if (lead.state === 'AZ') return 'arizona';
  if (lead.zip) {
    const prefix = lead.zip.substring(0, 3);
    if (['800','801','802','803','804','805','806'].includes(prefix)) return 'colorado';
    if (['850','851','852','853','854','855'].includes(prefix)) return 'arizona';
  }
  if (lead.utm_source) {
    if (DENVER_SATELLITE_SOURCES.some(s => lead.utm_source!.includes(s))) return 'colorado';
    if (PHOENIX_SATELLITE_SOURCES.some(s => lead.utm_source!.includes(s))) return 'arizona';
  }
  return null;
}

export function classifyCallMarket(toNumber: string): Market | null {
  if (toNumber === COLORADO_PHONE) return 'colorado';
  if (toNumber === ARIZONA_PHONE) return 'arizona';
  return null;
}

export function classifyCampaignMarket(campaignName: string): Market | null {
  const name = campaignName.toLowerCase();
  if (name.includes('denver') || name.includes('boulder') || name.includes('aurora') || 
      name.includes('colorado') || name.includes(' co ') || name.endsWith(' co')) return 'colorado';
  if (name.includes('phoenix') || name.includes('scottsdale') || name.includes('mesa') ||
      name.includes('tempe') || name.includes('arizona') || name.includes(' az ') || name.endsWith(' az')) return 'arizona';
  return null;
}
```

#### 1b. Add `market` param to `metricsBuilder.ts`
- `buildMetrics(period, debug, market?: Market | 'all')` — default `'all'`
- In `fetchFormLeads`: add `.filter()` for state = CO/AZ when market is set
- In `fetchCalls`: add `.eq('to_number', marketPhone)` when market is set
- In `fetchSpend`: filter rows post-fetch by `classifyCampaignMarket(row.campaign_name)`
- In `fetchGrossRevenue`: join via matched_lead_id to filter by lead.state

#### 1c. Add `market` param to `unifiedLeadsBuilder.ts` (same pattern)

#### 1d. Add `market` query param to `/api/admin/dashboard/metrics` route
- `?period=7days&market=colorado`
- Pass through to `buildMetrics()`

#### 1e. Add `market` query param to other relevant API routes:
- `/api/admin/leads` — filter by state
- `/api/admin/calls` — filter by to_number
- `/api/admin/roi` — filter spend by campaign name

---

### Phase 2 — UI Components

#### 2a. Create `MarketContext` (global state)
**File:** `src/contexts/MarketContext.tsx`
```typescript
type MarketFilter = 'all' | 'colorado' | 'arizona';

interface MarketContextType {
  market: MarketFilter;
  setMarket: (m: MarketFilter) => void;
}
```
- Wraps admin dashboard layout
- Persists to `localStorage` so it survives page navigations

#### 2b. Create `MarketSelector` component
**File:** `src/components/admin/MarketSelector.tsx`
- Three-button toggle: "All Markets" | "Denver / CO" | "Phoenix / AZ"
- Pink gradient for active state (matches existing design)
- Replaces the "Market toggle coming soon" placeholder in `admin/dashboard/page.tsx`
- Also add to the `DashboardLayout` header area so it's always visible

#### 2c. Wire `useMarket()` hook into every dashboard page
Each page that makes an API call adds `&market=${market}` to its fetch URL:
- `page.tsx` (Executive Dashboard)
- `leads/page.tsx`
- `calls/page.tsx`
- `roi/page.tsx`
- `website-analytics/page.tsx`
- `satellite-domains/page.tsx` — filter domain list by market tag
- `google-ads/page.tsx`
- `microsoft-ads/page.tsx`
- `external-leads/page.tsx`
- `gridscope/page.tsx` — show market-appropriate GridScope results

---

### Phase 3 — Satellite Domains Page

Add a `market` property to the `SATELLITE_DOMAINS` const:
```typescript
{ domain: 'windshielddenver.com', ..., market: 'colorado' }
{ domain: 'windshieldchiprepairphoenix.com', ..., market: 'arizona' }
{ domain: 'carwindshieldprices.com', ..., market: 'national' }
```

When market filter is 'colorado', show only colorado + national domains.
When market filter is 'arizona', show only arizona + national domains.

---

### Phase 4 — DB Migration (optional enhancement)

Add a `geo_market` column to `ringcentral_calls` (computed from `to_number`):
```sql
ALTER TABLE ringcentral_calls ADD COLUMN IF NOT EXISTS geo_market varchar(20) GENERATED ALWAYS AS (
  CASE 
    WHEN to_number = '+17209187465' THEN 'colorado'
    WHEN to_number = '+14807127465' THEN 'arizona'
    ELSE NULL
  END
) STORED;

CREATE INDEX IF NOT EXISTS idx_ringcentral_calls_geo_market ON ringcentral_calls(geo_market);
```

Add `geo_market` to `leads` as a computed/indexed column based on state + zip for faster filtering.

---

## 4. Data Gaps & Known Unknowns

| Data Source | Market Signal | Confidence |
|---|---|---|
| leads.state | CO / AZ | High — set at form submission |
| leads.zip | 800xx / 850xx prefix | High — fallback for leads without state |
| ringcentral_calls.to_number | 720 vs 480 | High — definitive phone line |
| google_ads_daily.campaign_name | keyword matching | Medium — need to verify campaign naming convention |
| microsoft_ads_daily.campaign_name | keyword matching | Medium — same |
| omega_installs | join via matched_lead_id | High — inherits lead's market |
| user_sessions / page_views | page_path / utm_source | Medium — main site is mostly Denver, /phoenix is AZ |

**Key question for Doug:** Are Google/Microsoft Ads campaigns named with geo identifiers? (e.g., "Pink Auto Glass - Denver", "PAG Phoenix", etc.) This determines whether spend can be filtered accurately per market.

---

## 5. Execution Order

1. **Codex + Claude Code review this plan** — catch anything missed
2. **Phase 1 backend** — market.ts extensions + metricsBuilder/unifiedLeadsBuilder market param
3. **Phase 2 UI** — MarketContext + MarketSelector component + wire all pages
4. **Phase 3 satellite domains** — tag domains, filter in UI
5. **Phase 4 DB migration** — optional, for performance
6. **Test** — toggle to Denver, verify Phoenix leads/calls disappear and vice versa

---

## 6. Files to Create/Modify

### New files
- `src/contexts/MarketContext.tsx`
- `src/components/admin/MarketSelector.tsx`

### Modified files
- `src/lib/market.ts` — add classification helpers + constants (remove 'use client' so it works server-side too)
- `src/lib/metricsBuilder.ts` — add market param
- `src/lib/unifiedLeadsBuilder.ts` — add market param
- `src/app/api/admin/dashboard/metrics/route.ts` — pass market param
- `src/app/api/admin/leads/route.ts` — filter by state
- `src/app/api/admin/calls/route.ts` — filter by to_number
- `src/app/api/admin/roi/route.ts` — filter by campaign
- `src/app/api/admin/satellite-domains/route.ts` — add market tag to domain list
- `src/app/admin/dashboard/layout.tsx` — add MarketContext provider
- `src/components/admin/DashboardLayout.tsx` — add MarketSelector in header
- `src/app/admin/dashboard/page.tsx` — replace placeholder, use market
- All other dashboard pages — add `&market=${market}` to fetch calls
- Optional: new migration for `geo_market` computed columns

---

## Notes
- The `'use client'` directive on `market.ts` needs to be removed — it's imported by server-side code (metricsBuilder). Split into `market-client.ts` and `market-server.ts` if needed, or just remove the directive.
- National satellite domains should show in BOTH market views (they generate leads for both)
- "All Markets" = current behavior, no regression
