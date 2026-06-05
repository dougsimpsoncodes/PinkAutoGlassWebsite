# Codex Desktop Test Script — QuoterEmbed Satellite Rollout

You are verifying that the `<QuoterEmbed>` component works correctly across
the Pink Auto Glass satellite sites after a batch deploy that replaced
`<LeadForm>` with the shared quoter embed on all 20 satellite sites.

## What changed

- `src/components/QuoterEmbed.tsx` added to every satellite
- `src/data/questions.ts` now exports `quoterConfig` (siteKey, marketHint, mode, utmSource)
- `src/app/page.tsx` — both LeadForm instances swapped to `<QuoterEmbed {...quoterConfig} />`
- `src/app/questions/[slug]/page.tsx` — LeadForm swapped to `<QuoterEmbed {...quoterConfig} />`
- LeadForm is kept as a silent fallback: if bundle fails to load within 8s, LeadForm renders automatically

## Goal

Confirm the embed mounts correctly, the right mode is used per site type,
the fallback works, and no pages are broken. QA only — do not modify code
unless you find a clear bug, explain it first with file:line references.

---

## Local setup

### IMPORTANT — local vs production testing

`QuoterEmbed` hardcodes `https://pinkautoglass.com/embed/satellite-quoter.v1.js`
as the bundle URL. There is no local dev path. This means:
- Local satellite dev servers always load the bundle from PRODUCTION
- Stopping a local pinkautoglass.com dev server does NOT test the fallback
- Section A + B run locally but the quoter itself comes from prod
- Section C (fallback) must be tested by blocking the prod URL (e.g. browser
  network throttle → offline), not by stopping a local server

### Step 1 — Start a satellite in standard mode

```bash
cd /Users/dougsimpson/clients/pink-auto-glass/sites/windshield-chip-repair-denver
npm run dev -- --port 3002
```

Visit: `http://localhost:3002`
Visit: `http://localhost:3002/questions/does-windshield-chip-repair-prevent-replacement-denver`

### Step 2 — Start a satellite in zip-first mode

```bash
cd /Users/dougsimpson/clients/pink-auto-glass/sites/windshield-cost-calculator
npm run dev -- --port 3003
```

Visit: `http://localhost:3003`
Visit: `http://localhost:3003/questions/average-windshield-replacement-cost-2026`

### Step 3 — Test fallback (simulate bundle unavailable)

In Chrome DevTools → Network tab → throttle to "Offline".
Reload one of the satellite pages.
Wait 8 seconds. The LeadForm should appear automatically (phone + carrier dropdown).
Re-enable network before continuing.

---

## Key files

### Shared embed source (main website)
- `public/embed/satellite-quoter.v1.js` — the bundle served to all satellites
- `src/embed/satellite-quoter-entry.tsx` — entry point
- `src/components/satellite/SatelliteQuoterShell.tsx` — shell component

### Per-satellite (check windshield-chip-repair-denver as representative)
- `src/components/QuoterEmbed.tsx` — the wrapper component with fallback logic
- `src/data/questions.ts` — exports `quoterConfig` with siteKey/mode/marketHint
- `src/app/page.tsx` — homepage, should have NO `<LeadForm />` remaining
- `src/app/questions/[slug]/page.tsx` — question pages, should use `<QuoterEmbed>`

---

## QA checklist

### A — Standard-mode site: `windshield-chip-repair-denver` (localhost:3002)

**Homepage (`/`)**
- [ ] Page loads without console errors
- [ ] Quoter embed mounts in the hero section (not LeadForm)
- [ ] Quoter embed mounts in the mid-page section (not LeadForm)
- [ ] `window.PAGSatelliteQuoterV1` exists in console
- [ ] Quoter shows "License plate" and "VIN" tabs — NO YMM tab
- [ ] Plate tab is active by default
- [ ] Mobile layout is clean — quoter does not overflow or clip
- [ ] Loading spinner shows briefly before quoter mounts

**Question page (`/questions/does-windshield-chip-repair-prevent-replacement-denver`)**
- [ ] Page loads without console errors
- [ ] Quoter embed mounts inside the blue CTA box (not LeadForm)
- [ ] CTA headline text appears above the quoter
- [ ] Related questions section still renders below
- [ ] Breadcrumb nav is present

**Quoter flow (standard)**
- [ ] Enter a real CO plate (e.g. `ABC123`, state `CO`) → price appears
- [ ] Enter a bad plate → error message shown, no crash
- [ ] Switch to VIN tab → VIN input appears
- [ ] `quote_generated` fires in browser console after price shown (look for `✅ Conversion tracked: quote_generated`)

---

### B — Zip-first mode site: `windshield-cost-calculator` (localhost:3003)

**Homepage (`/`)**
- [ ] Page loads without console errors
- [ ] ZIP gate mounts (not the full quoter, not LeadForm)
- [ ] Invalid ZIP `12` → clean error message
- [ ] Out-of-area ZIP `10001` → clean "we don't serve this area" message
- [ ] In-area ZIP `80212` → quoter unlocks with plate + VIN tabs
- [ ] No YMM tab appears after unlock

**Question page (`/questions/average-windshield-replacement-cost-2026`)**
- [ ] Quoter embed mounts (full standard quoter, no ZIP gate on question pages)
- [ ] Page loads without console errors

---

### C — Fallback behavior

In Chrome DevTools → Network tab → select "Offline" throttle preset.
Reload `localhost:3002`. (Do NOT stop a local dev server — bundle loads from prod.)

- [ ] Loading spinner shows for ~8 seconds
- [ ] After 8 seconds, LeadForm renders automatically (phone + carrier dropdown)
- [ ] No crash, no blank white box, no JavaScript error
- [ ] Re-enable network, reload — quoter mounts again (not stuck in fallback)

---

### D — Cross-site spot checks (prod URLs — verify Vercel deployed)

Check these live URLs. Use a private/incognito window to avoid cached state.
Allow 10+ seconds for the quoter to mount before declaring failure.

- `https://windshieldchiprepairdenver.com` — `QuoterEmbed` standard mode (recently redeployed — was SharedSatelliteQuoter)
- `https://windshielddenver.com` — `QuoterEmbed` standard mode
- `https://windshieldcostcalculator.com` — `QuoterEmbed` zip-first mode (recently redeployed — was SharedSatelliteQuoter)
- `https://windshieldchiprepairphoenix.com` — `QuoterEmbed` standard mode (AZ market)
- `https://windshieldchiprepairdenver.com/questions/does-windshield-chip-repair-prevent-replacement-denver` — question page quoter

Expected quoter mount IDs (run in console):
```javascript
document.querySelector('[id^="pag-quoter-"]')?.id
```
- `windshieldchiprepairdenver.com` → `pag-quoter-windshieldchiprepairdenver`
- `windshielddenver.com` → `pag-quoter-windshielddenver`
- `windshieldcostcalculator.com` → `pag-quoter-windshieldcostcalculator`
- `windshieldchiprepairphoenix.com` → `pag-quoter-windshieldchiprepairphoenix`

For each:
- [ ] Quoter (or ZIP gate) visible without scrolling
- [ ] No LeadForm (carrier dropdown) visible — if LeadForm shows, quoter fell back
- [ ] No JavaScript console errors
- [ ] `window.PAGSatelliteQuoterV1` is defined (not null)

---

### E — quoterConfig sanity check

In the browser console on any satellite page, run:

```javascript
// Should print the correct siteKey for that site
document.querySelector('[id^="pag-quoter-"]')?.id
```

Expected for `windshieldchiprepairdenver.com`: `pag-quoter-windshieldchiprepairdenver`
Expected for `windshieldcostcalculator.com`: `pag-quoter-windshieldcostcalculator`

---

## Output format

Return:

### Verdict
`GO` — all checks pass, embed is working across both modes and fallback is safe
`HOLD` — one or more critical issues found

### Findings
List bugs by severity (CRITICAL / HIGH / LOW).
Include `file:line` for any code issues.
Include exact ZIP codes, plates, or actions used that triggered each issue.

### Evidence
- Screenshots of: hero quoter mounted, question-page quoter mounted, fallback LeadForm
- Console output showing `✅ Conversion tracked: quote_generated`
- Console output of `document.querySelector('[id^="pag-quoter-"]')?.id`
- Any console errors

### Recommendation
`GO` → ready for Vercel deploys to go live as-is
`HOLD` → describe the smallest fix needed before going live

---

## Round 3 changes (since last HOLD)

- `QuoterEmbed.tsx` — `useId()` now generates unique mount ID per instance (`pag-quoter-<siteKey>-<instanceId>`). Two quoters on the same page no longer collide.
- `questions/[slug]/page.tsx` — added `mode="standard"` override. National sites (zip-first) now show full quoter on question pages, not the ZIP gate.
- `windshieldchiprepairphoenix.com` — Vercel was serving a stale build (no QuoterEmbed in JS chunks). Fresh deploy triggered. Wait 3 min before testing.
- `windshieldchiprepairdenver.com` and `windshieldcostcalculator.com` — `SharedSatelliteQuoter` replaced with `QuoterEmbed` (amber card fallback → LeadForm fallback).

Re-check specifically:
- [ ] `windshieldchiprepairphoenix.com` — `window.PAGSatelliteQuoterV1` now defined, quoter mounts
- [ ] `windshieldcostcalculator.com/questions/average-windshield-replacement-cost-2026` — standard quoter (no ZIP gate)
- [ ] `windshielddenver.com` — two quoters on same page have DIFFERENT IDs (e.g. `pag-quoter-windshielddenver-r0` and `pag-quoter-windshielddenver-r1`)
