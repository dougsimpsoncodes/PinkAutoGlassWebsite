# Codex Desktop Test Script — Canary Satellite Pages

You are testing the first two real canary satellite pages that now mount the shared Pink Auto Glass quoter.

## Goal

Verify that the real satellite canary pages work correctly with the shared quoter embed:

1. `windshieldchiprepairdenver.com` style canary in `standard` mode
2. `windshieldcostcalculator.com` style canary in `zip-first` mode

This is a QA/testing task only.
Do not modify code unless you find a clear bug and can isolate the fix cleanly.
If you find a bug, explain it first with exact file references and screenshots before changing anything.

## Repos / pages

### Denver standard-mode canary
- Repo: `/Users/dougsimpson/clients/pink-auto-glass/sites/windshield-chip-repair-denver`
- Important files:
  - `src/app/page.tsx`
  - `src/components/SharedSatelliteQuoter.tsx`

### Cost calculator ZIP-first canary
- Repo: `/Users/dougsimpson/clients/pink-auto-glass/sites/windshield-cost-calculator`
- Important files:
  - `src/app/page.tsx`
  - `src/components/SharedSatelliteQuoter.tsx`

### Shared embed source
- Repo: `/Users/dougsimpson/clients/pink-auto-glass/website`
- Important files:
  - `public/embed/satellite-quoter.v1.js`
  - `src/embed/satellite-quoter-entry.tsx`
  - `src/components/satellite/SatelliteQuoterShell.tsx`
  - `src/components/satellite/ZipFirstGate.tsx`
  - `src/components/AutomatedQuoteForm.tsx`

## Required local setup

### 1. Start the embed host app

In the Pink Auto Glass website repo:

```bash
cd /Users/dougsimpson/clients/pink-auto-glass/website
npm run dev
```

Use the actual local port if it is not `3001`.

### 2. Start each satellite app with the embed origin pointed at the host app

For Denver:

```bash
cd /Users/dougsimpson/clients/pink-auto-glass/sites/windshield-chip-repair-denver
NEXT_PUBLIC_PAG_QUOTER_EMBED_ORIGIN=http://127.0.0.1:3001 npm run dev
```

For calculator:

```bash
cd /Users/dougsimpson/clients/pink-auto-glass/sites/windshield-cost-calculator
NEXT_PUBLIC_PAG_QUOTER_EMBED_ORIGIN=http://127.0.0.1:3001 npm run dev
```

If the embed host uses a different port, replace `3001` in both commands.

## Pages to test

- Denver canary local page: use the local URL printed by Next for `windshield-chip-repair-denver`
- Calculator canary local page: use the local URL printed by Next for `windshield-cost-calculator`

## Core product rules

- One shared quoter system
- No YMM flow
- Live flow is:
  - plate + state first
  - VIN fallback
  - price
  - booking
- `standard` mode should show the live shared quoter immediately
- `zip-first` mode should require ZIP first, then unlock the same shared quoter

## Exact QA checklist

### 1. Denver standard-mode canary

Verify:

- the page loads without console errors
- the shared quoter mounts in the hero area
- it does not show the old lead-form behavior anymore
- the flow starts with plate + state
- no YMM appears anywhere
- VIN fallback exists
- mobile layout is clean

### 2. Calculator ZIP-first canary

Verify:

- the page loads without console errors
- the shared ZIP gate mounts in the hero area
- invalid ZIP handling is clean
- out-of-area ZIP handling is clean
- in-area ZIP unlocks the same live shared quoter
- unlocked flow starts with plate + state
- no YMM appears anywhere
- VIN fallback exists after unlock
- mobile layout is clean

Use at least:

- invalid ZIP: `12`
- out-of-area ZIP: `10001`
- in-area ZIP: `80212`

### 3. Shared bundle behavior

Confirm on both pages:

- the page requests the shared embed bundle from the Pink Auto Glass host app
- `window.PAGSatelliteQuoterV1` exists
- mount succeeds
- no broken blank state

### 4. Fallback behavior

If possible, verify what happens when the embed host is unavailable:

- page should fail soft
- page should show the fallback call message
- page should not crash

## Output format

Return:

### Verdict
- `GO` or `HOLD`

### Findings
- list any bugs by severity
- include exact `file:line` references when possible

### Evidence
- screenshots
- console errors
- ZIP values used and results
- confirmation that no YMM appeared

### Recommendation
- say whether the canaries are ready for preview/prod rollout
- if not, give the smallest next fix
