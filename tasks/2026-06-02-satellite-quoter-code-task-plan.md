# Pink Auto Glass — Shared Satellite Quoter Code Task Plan
**Date:** 2026-06-02  
**Status:** ready for implementation planning  
**Purpose:** Translate the satellite quoter technical contract into concrete code changes against the current Pink Auto Glass codebase.

## Current code reality

### Already live and reusable

- `src/components/AutomatedQuoteForm.tsx`
  - Core quote flow
  - Plate-first lookup
  - VIN fallback
  - Price display
  - Manual-review fallback
- `src/components/QuoteBookingForm.tsx`
  - Booking flow after price is shown
- `src/components/QuoterEmbed.tsx`
  - Thin existing marketing wrapper around the quoter
- `src/lib/quote/service-area.ts`
  - Shared ZIP3 service-area gate
- `src/app/api/quote/identify/route.ts`
  - Plate decode path
- `src/app/api/quote/price/route.ts`
  - Pricing path
- `src/app/api/quote/book/route.ts`
  - Booking path

### Not yet built

- Shared satellite embed entrypoint
- `standard` vs `zip-first` mode layer
- ZIP-first pre-gate component
- Config-driven wrapper copy system
- Satellite-specific tracking metadata contract in code

## File-by-file change plan

## 1. `src/components/AutomatedQuoteForm.tsx`

### Keep
- Core quote logic
- Plate and VIN flows
- Price state
- Booking handoff
- Existing tracking hooks

### Change
- Remove stale YMM references in comments
- Introduce optional config props rather than hardcoded wrapper assumptions
- Allow external mode/config metadata to pass through for tracking and behavior

### Proposed additions

```ts
interface AutomatedQuoteFormProps {
  flowMode?: 'standard' | 'zip-first-unlocked';
  context?: {
    siteKey?: string;
    utmSource?: string;
    marketHint?: 'colorado' | 'arizona' | 'national';
    surface?: string;
  };
}
```

### Reason
- The core logic should remain here
- But it needs a shared contract for satellite wrappers and tracking context

### Important constraint
- Do **not** add satellite-specific UI branching directly throughout this file
- Keep this file focused on the actual quote flow

## 2. New file: `src/components/satellite/SatelliteQuoterShell.tsx`

### Create
A new shared satellite shell component

### Responsibility
- Accept config
- Decide whether flow is `standard` or `zip-first`
- Render wrapper copy
- Mount either:
  - ZIP-first gate first, then unlocked quoter
  - standard quoter immediately

### Proposed shape

```ts
interface SatelliteQuoterShellProps {
  config: SatelliteQuoterConfig;
}
```

### Reason
- Keeps satellite presentation logic out of `AutomatedQuoteForm`
- Gives us one place to manage the wrapper behavior

## 3. New file: `src/components/satellite/ZipFirstGate.tsx`

### Create
A dedicated ZIP-first pre-gate component

### Responsibility
- collect ZIP
- validate ZIP with `isInServiceArea`
- on pass: unlock the shared quoter
- on fail: show the shared out-of-area message

### Must reuse
- `src/lib/quote/service-area.ts`

### Must not do
- custom satellite service-area logic
- alternate ZIP allowlists

## 4. New file: `src/lib/satellite-quoter/config.ts`

### Create
Central types + defaults for the satellite quoter config contract

### Responsibility
- define `SatelliteQuoterConfig`
- define wrapper-copy defaults
- define mode-safe validation

### Reason
- Prevent config shape drift between sites

## 5. New file: `src/lib/satellite-quoter/tracking.ts`

### Create
Shared tracking helpers for satellite quoter context

### Responsibility
- normalize embed context
- attach `siteKey`, `utmSource`, `mode`, `marketHint`
- provide wrapper-level events like:
  - ZIP gate viewed
  - ZIP gate passed
  - ZIP gate failed

### Reason
- Keep satellite embed tracking explicit and centralized

## 6. `src/components/QuoterEmbed.tsx`

### Keep
- Existing main-site usage for Pink Auto Glass pages

### Change
- Potentially refactor to consume shared wrapper config rather than remain a one-off wrapper

### Recommended role after refactor
- main-site convenience wrapper around `AutomatedQuoteForm` or shared shell primitives

### Reason
- Avoid maintaining separate wrapper systems for main site vs satellites if the abstractions can be shared cleanly

## 7. New file: `src/embed/satellite-quoter-entry.tsx`

### Create
Embeddable mount entrypoint for the shared JS delivery

### Responsibility
- expose `window.PAGSatelliteQuoter.mount(...)`
- parse config
- render the shared shell into target DOM node

### Output
- bundle target for the shared hosted embed script

### Reason
- This is the actual bridge from satellite site to the shared Pink Auto Glass quoter system

## 8. `src/app/api/quote/price/route.ts`

### Keep
- Current pricing behavior
- Current service-area defense-in-depth behavior

### Review
- verify no stale YMM-client assumptions remain in comments or request expectations

### Likely no major change needed
- because live client already sends plate/VIN-derived vehicle data only

## 9. `src/app/api/quote/book/route.ts`

### Keep
- Current booking flow
- Service-area validation at booking step
- Booking notifications

### Review
- ensure satellite attribution context can pass through cleanly if needed

### Likely change
- enrich metadata if satellite embed context needs to be persisted at booking time

## 10. `src/lib/quote/service-area.ts`

### Keep
- Existing ZIP3 gate as source of truth

### No change unless business rules change

### Reason
- This is already the shared service-area engine we want

## First implementation slice

### Slice 1 — Minimal contracts only
- Add `SatelliteQuoterConfig` type
- Add tracking-context contract
- Keep both intentionally minimal
- Do not change quoter behavior yet

### Slice 2 — Shared mode layer
- Build `ZipFirstGate`
- Build `SatelliteQuoterShell`
- Support:
  - `standard`
  - `zip-first`

### Slice 3 — Embed entrypoint
- Build `window.PAGSatelliteQuoter.mount(...)`
- Render shell into mount node

### Slice 4 — Canary rollout
- Canary `zip-first`: `windshieldcostcalculator.com`
- Canary `standard`: `windshieldchiprepairdenver.com`

## What should stay untouched at first

- pricing math
- booking notification behavior
- booking slot logic
- service-area ZIP tables
- core quote API endpoints, unless tracking metadata requires small additions

## Primary technical risks

### 1. Letting wrapper logic leak into core quoter logic
Mitigation:
- keep `AutomatedQuoteForm` focused on quote behavior only

### 2. Reintroducing per-site logic drift
Mitigation:
- all site differences flow through typed config only

### 3. Mobile embed regressions
Mitigation:
- canary one `zip-first` and one `standard` site before broader rollout

### 4. Tracking gaps
Mitigation:
- define tracking contract before first embed goes live

## Recommended next coding step

Begin with **Slice 1**:
- define the shared `SatelliteQuoterConfig`
- define the tracking-context contract

Then fold stale YMM comment cleanup into the first real quoter edit, rather than making it a standalone change.
