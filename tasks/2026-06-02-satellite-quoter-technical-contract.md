# Pink Auto Glass — Shared Satellite Quoter Technical Contract
**Date:** 2026-06-02  
**Status:** draft for implementation  
**Purpose:** Define the exact technical contract for delivering one shared Pink Auto Glass quoter across satellite sites without forking logic.

## Core rule

There must be exactly **one** quoter behavior system.

- The behavior source of truth is the Pink Auto Glass quoter system in `website/`
- Satellite sites may customize wrapper copy and presentation
- Satellite sites may **not** implement their own quote logic, service-area logic, pricing flow, or booking flow

## Live behavior source of truth

Primary source:
- `src/components/AutomatedQuoteForm.tsx`

Supporting sources:
- `src/components/QuoteBookingForm.tsx`
- `src/lib/quote/service-area.ts`
- `src/app/api/quote/identify/route.ts`
- `src/app/api/quote/price/route.ts`
- `src/app/api/quote/book/route.ts`

## Product behavior contract

### Shared flow
All satellite quoter experiences must follow the same live behavior:

1. vehicle entry starts with:
   - license plate
   - state
2. VIN is the fallback path
3. if pricing succeeds:
   - show instant price
   - allow immediate booking
4. if service area fails:
   - stop the flow cleanly

### Explicit exclusions
The shared satellite quoter system must not expose:
- Year / Make / Model entry
- YMM recovery flows
- YMM lead-capture flows

## Delivery contract

### Delivery method
The satellite quoter must be delivered as a **centrally hosted JS/shared embed**, not an iframe.

### Reason
- preserves one source of truth
- supports mobile-native UX better than iframe delivery
- avoids per-satellite quote logic drift

### High-level shape

Satellite page includes:
- one loader script from Pink Auto Glass-controlled hosting
- one mount node
- one config object

Conceptual example:

```html
<div id="pag-satellite-quoter"></div>
<script src="https://pinkautoglass.com/embed/satellite-quoter.js"></script>
<script>
  window.PAGSatelliteQuoter.mount('#pag-satellite-quoter', {
    mode: 'zip-first',
    siteKey: 'windshieldcostcalculator',
    marketHint: 'national',
    headline: "DON'T WAIT. Get an instant quote and book your service now.",
    subhead: "No phone calls. Just quote and book."
  });
</script>
```

This snippet is illustrative only. Final API shape should match the implementation below.

## Public embed API contract

### Global entrypoint

```ts
window.PAGSatelliteQuoter.mount(target, config)
```

### Parameters

#### `target`
Type:
- CSS selector string or DOM element

Behavior:
- required
- if target is missing, embed should fail safely with a logged error and no partial UI

#### `config`
Type:

```ts
interface SatelliteQuoterConfig {
  mode: 'standard' | 'zip-first';
  siteKey: string;
  marketHint?: 'colorado' | 'arizona' | 'national';
  utmSource?: string;
  wrapperCopy?: {
    headline?: string;
    subhead?: string;
    startLabel?: string;
    zipTitle?: string;
    zipBody?: string;
    zipCta?: string;
    quoteCardTitle?: string;
    quoteCardBody?: string;
  };
  styleVariant?: 'standard' | 'compact' | 'hero';
}
```

### Required config fields
- `mode`
- `siteKey`

### Recommended config fields
- `utmSource`
- `wrapperCopy`

## Mode contract

### `standard`
Use for local-name sites.

Behavior:
- render the live shared quoter immediately
- do not add a pre-gate
- use existing live ZIP capture/validation behavior in the shared flow

Intended domains:
- Denver / Boulder / Aurora / Colorado Springs / Fort Collins / Phoenix / Mesa / Tempe / Scottsdale local-name sites

### `zip-first`
Use for national price / quote sites.

Behavior:
1. show ZIP gate first
2. validate ZIP with the existing shared service-area logic
3. only if ZIP passes:
   - render the same live shared quoter
4. if ZIP fails:
   - stop before the quote flow

Important:
- the ZIP gate is part of the shared quoter system
- it is not a separate satellite-side custom logic fork

## Wrapper contract

### Allowed to vary by satellite
- headline
- subhead
- supporting wrapper text
- button labels for wrapper-level UI
- layout shell around the embedded quoter

### Not allowed to vary by satellite
- quote logic
- service-area logic
- pricing request flow
- booking request flow
- field order inside the core live quote flow, except through centrally controlled shared modes

## Tracking contract

### Required attribution inputs
Each embed instance must pass enough metadata so quote behavior can be tied back to the satellite source.

Minimum fields:
- `siteKey`
- `utmSource` or deterministic equivalent
- `mode`
- `marketHint` if known

### Required metrics
- ZIP gate impressions
- ZIP pass rate
- quote starts
- plate lookup attempts
- plate lookup success rate
- VIN fallback usage
- price shown
- booking starts
- booking completions

### Tracking rule
Tracking must be emitted by the shared quoter system, not separately reimplemented by each satellite site.

## Styling contract

### Goals
- mobile-first
- native-feeling inside each satellite page
- insulated from satellite CSS conflicts

### Requirements
- embed must scope its styles so satellite theme CSS does not break quoter functionality
- mobile keyboard, viewport, and form layout must work as if the component were page-native
- wrapper styling may vary, but core interaction styling should remain consistent enough to avoid QA drift

## Error-handling contract

### If mount fails
- fail safe
- do not render broken partial UI
- log a clear console error in development

### If ZIP is invalid/out of area
- show a clean shared message
- do not advance into quote flow

### If quote APIs fail
- use the same shared fallback messaging as the main Pink Auto Glass quoter

## Implementation boundary

### Shared system responsibilities
- config parsing
- mode selection
- ZIP-first gate behavior
- rendering the live quoter flow
- shared tracking
- service-area validation

### Satellite page responsibilities
- provide mount target
- provide approved config
- provide wrapper placement in the page layout

## Versioning rule

The embed system should support explicit versioning so rollout changes do not silently break all satellites.

Recommended shape:
- `window.PAGSatelliteQuoterV1`
or
- versioned bundle path

Reason:
- one source of truth should not mean uncontrolled breaking changes

## Minimum implementation milestones

### Milestone 1
- clean stale YMM references from shared quoter code/comments
- define shared config type in code

### Milestone 2
- implement `standard` and `zip-first` modes centrally

### Milestone 3
- implement embeddable mount API

### Milestone 4
- wire shared tracking metadata

### Milestone 5
- integrate first canary satellite

## Canary recommendation

First canary for `zip-first` mode:
- `windshieldcostcalculator.com`

First canary for `standard` mode:
- `windshieldchiprepairdenver.com`

Reason:
- both are high-priority sites
- each represents one of the two required modes

## Acceptance criteria

The shared satellite quoter contract is ready to build only when:

- one source of truth is preserved
- no YMM path exists anywhere in the satellite plan
- `standard` and `zip-first` are defined as shared modes
- satellite wrappers are clearly separated from core behavior
- tracking inputs and outputs are defined
- delivery method is JS/shared embed, not iframe

## Immediate next build step

Translate this contract into code tasks:
- shared config interface
- mode-aware wrapper system
- ZIP-first pre-gate component
- embeddable mount entrypoint
