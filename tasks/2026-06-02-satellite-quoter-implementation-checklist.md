# Pink Auto Glass — Satellite Quoter Implementation Readiness Checklist
**Date:** 2026-06-02  
**Status:** planning-ready  
**Goal:** Build one shared satellite quoter system that reuses the live Pink Auto Glass quoter behavior without creating forked versions.

## Locked product rules

- One source of truth for quoter behavior
- Satellite sites must not have independent quoter logic
- Wrapper copy/layout may vary by site
- `AutomatedQuoteForm` is the behavior source of truth
- Delivery should be shared JS/embed, not iframe
- Local-name sites use `standard` mode
- National price/quote sites use `zip-first` mode
- Quote and booking should stay continuous if technically possible
- Live quoter behavior is now:
  - `plate-first`
  - `VIN fallback`
  - `no Year / Make / Model path`

## What already exists and can be reused

### Core live behavior
- `src/components/AutomatedQuoteForm.tsx`
  - Live quote flow logic
  - Plate lookup path
  - VIN fallback path
  - Price display path
  - Booking handoff
- `src/components/QuoteBookingForm.tsx`
  - Booking UX and submit flow
- `src/lib/quote/service-area.ts`
  - ZIP3 service-area allowlist
- `src/app/api/quote/identify/route.ts`
  - Plate identify path
- `src/app/api/quote/price/route.ts`
  - Pricing path
- `src/app/api/quote/book/route.ts`
  - Booking path

### Existing wrapper pattern
- `src/components/QuoterEmbed.tsx`
  - Thin current wrapper around `AutomatedQuoteForm`
  - Good starting point conceptually, but not yet flexible enough for satellites

### Planning and rollout guidance
- `tasks/2026-06-02-satellite-quoter-rollout-spec.md`
- `tasks/2026-06-02-satellite-opportunity-report.md`

## What is NOT built yet

- Shared JS/embed delivery system for satellite sites
- Configurable `standard` vs `zip-first` quoter modes in the live quoter system
- Satellite wrapper API for copy/layout overrides
- Satellite integration code in the satellite sites
- Analytics contract for satellite embed usage

## Required refactors before rollout

### 1. Separate behavior config from wrapper copy
- Keep quote logic in `AutomatedQuoteForm`
- Move site-facing copy/layout concerns out of the core logic where possible

Reason:
- We need multiple satellite wrappers without multiplying quoter behavior.

### 2. Add explicit quoter mode support
- Add configurable mode support for:
  - `standard`
  - `zip-first`

Expected behavior:
- `standard`
  - render live quoter immediately
- `zip-first`
  - ask ZIP first
  - validate with existing service-area logic
  - render the same live quoter only after ZIP passes

Reason:
- This must be part of the shared system, not an ad hoc per-site wrapper hack.

### 3. Define embed contract
- Decide the real delivery format for satellites:
  - centrally hosted JS bundle
  - mount target API
  - config payload shape

Minimum config needed:
- `mode`
- `marketHint` or `siteKey`
- `headline`
- `subhead`
- `cta labels`
- `tracking source metadata`

Reason:
- The product decision is made; the technical contract is not yet written.

## Implementation checklist

### Phase 0 — Contract-first scaffolding
- [ ] Define minimal `SatelliteQuoterConfig`
- [ ] Define minimal tracking-context contract
- [ ] Keep both intentionally small and easy to revise

### Phase 1 — Quoter system shape
- [ ] Extract wrapper-facing config interface for satellite usage
- [ ] Add `standard` mode support
- [ ] Add `zip-first` mode support
- [ ] Ensure both modes still use the same quote/price/book internals
- [ ] Ensure `zip-first` mode uses only the live service-area gate
- [ ] Clean stale YMM comments when the first real quoter edit touches those lines

### Phase 2 — Shared embed delivery
- [ ] Define embed loader approach
- [ ] Define mount/init API for satellites
- [ ] Ensure mobile layout behaves natively inside host page
- [ ] Ensure host page styling cannot break quoter behavior

### Phase 3 — Tracking contract
- [ ] Define required satellite metadata inputs
- [ ] Preserve `utm_source` / site attribution path
- [ ] Track:
  - quote starts
  - ZIP pass rate
  - plate lookup success
  - VIN fallback usage
  - quote completions
  - booking completions

### Phase 4 — First rollout group
- [ ] Start with Group B (`zip-first`) quote/price sites
- [ ] Then roll out Group A local-name sites
- [ ] Hold Group C until learning review

## Current blockers

### Technical blockers
- Dirty repo state on `main`
- No clean rollout branch isolated yet
- No written embed contract yet

### Product blockers
- Need final implementation branch and cleanup path settled before coding

## Recommended build order

1. Isolate current real work off dirty `main`
2. Define minimal shared config and tracking contracts
3. Add `standard` and `zip-first` modes to the shared system
4. Clean stale YMM comments when the first real quoter edit lands
5. Build one satellite-ready wrapper shell
6. Integrate first on one `zip-first` site
7. Validate mobile behavior and tracking
8. Expand to the rest of Group B
9. Expand to all Group A sites

## Success criteria before rollout starts

- There is exactly one shared quoter behavior path
- No YMM path exists in code, comments, specs, or mockups
- `zip-first` is implemented as a mode of the shared system
- Satellite copy/layout are configurable without changing core logic
- Tracking is defined before the first satellite goes live

## Immediate next action

Define the smallest viable shared code contracts:
- `SatelliteQuoterConfig`
- tracking-context shape

Then use those to start the real mode/wrapper implementation.
