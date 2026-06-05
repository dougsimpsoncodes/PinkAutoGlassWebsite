# Pink Auto Glass — Satellite Quoter Rollout Spec
**Date:** 2026-06-02  
**Status:** advisory-only  
**Goal:** Use the automated quoter to turn in-area satellite visitors into instant-price + immediate-booking customers.

## Core strategy

The conversion promise is:

`Get an instant quote and book your service now. No phone calls. Just quote and book.`

The rollout should use two quoter modes:

1. `Standard quoter`
   Use on local-name satellite sites where the domain already implies local service intent.
   Let visitors enter the normal quoter flow and rely on the existing ZIP field in the quoter to validate service area.

2. `ZIP-first quoter`
   Use on national / price / quote-intent sites where a much larger share of visitors may be outside the service area.
   Ask for ZIP first, then unlock the full quoter only for in-area users.

## Source of truth for service area

Current live quoter gate in [service-area.ts](/Users/dougsimpson/clients/pink-auto-glass/website/src/lib/quote/service-area.ts:1):

- Colorado Front Range ZIP3:
  - `800`
  - `801`
  - `802`
  - `803`
  - `805`
  - `806`
  - `808`
  - `809`
- Phoenix metro ZIP3:
  - `850`
  - `851`
  - `852`
  - `853`

## Launch groups

### Group A — Standard quoter
Use the current quoter flow with the existing ZIP field.

- `windshielddenver.com`
- `mobilewindshielddenver.com`
- `windshieldchiprepairdenver.com`
- `windshieldchiprepairboulder.com`
- `aurorawindshield.com`
- `coloradospringswindshield.com`
- `autoglasscoloradosprings.com`
- `mobilewindshieldcoloradosprings.com`
- `windshieldreplacementfortcollins.com`
- `windshieldchiprepairphoenix.com`
- `mobilewindshieldphoenix.com`
- `windshieldchiprepairmesa.com`
- `windshieldchiprepairtempe.com`
- `windshieldchiprepairscottsdale.com`

### Group B — ZIP-first quoter
Ask ZIP first, then reveal the full quoter only for in-area ZIPs.

- `windshieldcostcalculator.com`
- `windshieldpricecompare.com`
- `newwindshieldcost.com`
- `windshieldcostphoenix.com`
- `getawindshieldquote.com`
- `newwindshieldnearme.com`
- `cheapestwindshieldnearme.com`

### Group C — Monitor mode (opportunistic deploy, 2026-06-04)

Originally "hold for later" in this spec. The 2026-06-04 batch rollout deployed ZIP-first quoter to all 23 satellites, including these three. They are now live with `mode: 'zip-first'` and returning 200. Decision (2026-06-05): do not revert — ZIP-first is the least risky quoter mode for broader domains and gates availability before exposing the full flow. Treating as accepted rollout drift. Monitor for lead quality before any further changes.

- `carglassprices.com` — live, zip-first, 0 question URLs in sitemap (question pages not in this network)
- `carwindshieldprices.com` — live, zip-first, 0 question URLs in sitemap
- `windshieldrepairprices.com` — live, zip-first, 0 question URLs in sitemap

## Copy system

### Master promise

Preferred core line:

`Get an instant quote and book your service now. No phone calls. Just quote and book.`

### Group A — Standard quoter copy

#### Headline
`DON'T WAIT — Get an instant quote and book your service now.`

#### Subhead
`No phone calls. Just quote and book.`

#### CTA
`Get My Instant Quote`

#### Alternate shorter version
`Instant quote. Book now. No phone calls.`

### Group B — ZIP-first quoter copy

#### Headline
`DON'T WAIT — Check your ZIP to unlock instant pricing and online booking.`

#### Subhead
`If you're in our service area, you can get your quote and book right now. No phone calls.`

#### ZIP CTA
`Check My ZIP`

#### Quoter CTA after pass
`Get My Instant Quote`

### Localized variants

Use when space allows:

- Denver:
  `Get your instant Denver quote and book mobile service now. No phone calls.`
- Phoenix:
  `Get your instant Phoenix quote and book mobile service now. No phone calls.`
- Aurora:
  `Get your instant Aurora quote and book mobile service now. No phone calls.`
- Boulder:
  `Get your instant Boulder quote and book mobile service now. No phone calls.`
- Colorado Springs:
  `Get your instant Colorado Springs quote and book now. No phone calls.`
- Fort Collins:
  `Get your instant Fort Collins quote and book now. No phone calls.`

## UX rules

### Standard quoter sites
- Put the quoter high on the page.
- Lead with action-oriented copy.
- Keep the flow simple:
  - vehicle info
  - instant quote
  - immediate booking
- Do not add an extra pre-gate.

### ZIP-first quoter sites
- ZIP is step 1.
- Only show the full quoter after an in-area ZIP passes.
- Keep the pre-gate short and practical.
- Do not over-explain service boundaries.

## Recommended implementation order

### Phase 1A — All price / quote sites
- `windshieldcostcalculator.com`
- `windshieldpricecompare.com`
- `newwindshieldcost.com`
- `windshieldcostphoenix.com`
- `getawindshieldquote.com`
- `newwindshieldnearme.com`
- `cheapestwindshieldnearme.com`

Reason:
- strongest pricing/quote fit
- clearest alignment with the instant-price promise

### Phase 1B — All local-name sites in one wave
- `windshielddenver.com`
- `mobilewindshielddenver.com`
- `windshieldchiprepairdenver.com`
- `windshieldchiprepairboulder.com`
- `aurorawindshield.com`
- `coloradospringswindshield.com`
- `autoglasscoloradosprings.com`
- `mobilewindshieldcoloradosprings.com`
- `windshieldreplacementfortcollins.com`
- `windshieldchiprepairphoenix.com`
- `mobilewindshieldphoenix.com`
- `windshieldchiprepairmesa.com`
- `windshieldchiprepairtempe.com`
- `windshieldchiprepairscottsdale.com`

Reason:
- you want every clearly local-intent domain to get the quoter at the same time
- these domains already imply service-area intent, so the standard quoter is the right behavior
- this gives Pink Auto Glass the broadest immediate test of `instant quote + immediate booking + no phone call`

### Phase 1C
Hold Group C sites until we learn from the first two waves.

## Metrics to watch

- ZIP pass rate
- quote start rate
- quote completion rate
- booking completion rate
- booked jobs by `utm_source`
- lead-to-booking rate by satellite domain

## Working hypothesis

This rollout is valuable if it improves conversion on the exact traffic the satellite network already earns:

`price / quote / local service intent -> instant quote -> immediate booking`

The differentiator is not just pricing. It is:

`instant price + immediate booking + no phone call required`
