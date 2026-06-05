# Codex Desktop Test Script — Shared Satellite Quoter Demo

You are testing the Pink Auto Glass shared satellite quoter demo in the local repo.

## Goal

Verify that the new shared JS/embed quoter works correctly in both modes:

1. `standard` mode for local-intent satellite sites
2. `zip-first` mode for national price/quote satellite sites

This is a QA/testing task only.
Do not modify code unless you find a clear bug and can isolate the fix cleanly.
If you do find a bug, explain it first with exact file references and screenshots before changing anything.

## Repo

`/Users/dougsimpson/clients/pink-auto-glass/website`

## Local page to test

`http://127.0.0.1:3001/embed/satellite-quoter/demo`

If the dev server is not already running, start it with:

```bash
cd /Users/dougsimpson/clients/pink-auto-glass/website
npm run dev
```

Use the local URL printed by Next if the port differs.

## What was just built

This demo mounts the real generated browser bundle, not just an internal React component.

Important files:

- `src/embed/satellite-quoter-entry.tsx`
- `scripts/build-satellite-quoter-embed.mjs`
- `src/components/satellite/SatelliteQuoterShell.tsx`
- `src/components/satellite/ZipFirstGate.tsx`
- `src/components/satellite/SatelliteQuoterBundleDemo.tsx`
- `src/app/embed/satellite-quoter/demo/page.tsx`

## Core product rules

- There must be one shared quoter system.
- No YMM flow.
- Live flow is:
  - plate + state first
  - VIN fallback
  - price
  - booking
- `standard` mode should show the shared quoter immediately.
- `zip-first` mode should require ZIP first, then unlock the same shared quoter.

## Exact QA checklist

### 1. Demo route loads

Verify:

- the page loads without console errors
- both demo columns render
- the page headline appears
- the embed bundle mounts instead of showing empty boxes

### 2. Standard mode behavior

In the `standard` mode panel:

- confirm the approved headline copy renders cleanly
- confirm the title respects line breaks well on mobile
- confirm the live quoter appears immediately
- confirm the flow starts with plate/state, not YMM
- confirm no YMM wording appears anywhere
- confirm VIN fallback still exists where expected

### 3. ZIP-first mode behavior

In the `zip-first` mode panel:

- confirm the ZIP gate appears before the full quoter
- confirm invalid ZIP handling is clean
- confirm out-of-area ZIP handling is clean
- confirm an in-area ZIP unlocks the full shared quoter
- confirm the unlocked flow is the same quoter behavior as standard mode
- confirm there is no YMM anywhere after unlock

Use at least:

- one clearly valid in-area ZIP
- one clearly out-of-area ZIP
- one invalid ZIP

### 4. Mobile-first UX

Test on a mobile viewport.

Verify:

- headline is readable and not awkwardly wrapping
- buttons are large enough
- form fields are usable
- ZIP gate feels natural on mobile
- no weird spacing, clipping, or overflow
- no double-scroll or layout jump issues

### 5. Shared bundle behavior

Confirm:

- the page is mounting the generated bundle from `/embed/satellite-quoter.v1.js`
- `window.PAGSatelliteQuoter`
- `window.PAGSatelliteQuoterV1`
- both exist
- mount succeeds without throwing

### 6. Regression sanity check

Confirm:

- the demo route itself does not break the app
- no obvious hydration/mount issues
- no obvious console errors from the new embed shell

## Output format

Return:

### Verdict
- `GO` or `HOLD`

### Findings
- list any bugs by severity
- include exact `file:line` references when possible

### Evidence
- include screenshots
- include any console errors
- include the ZIP values used and what happened

### Recommendation
- say whether this is ready for canary satellite wiring
- if not, say the smallest next fix

## Important

Do not review the old mockup pages.
Test the real demo route only.
