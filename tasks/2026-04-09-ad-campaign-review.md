# 2026-04-09 — Ad Campaign Review & Conversion Tracking Overhaul

## Summary

Full review of Google Ads and Microsoft Ads campaigns with data sync, analysis, and multiple fixes applied via API + code changes. Cross-validated with Codex and Gemini.

## Changes Made

### Conversion Tracking (code — offlineConversionSync.ts + constants.ts)
- **Fixed double-counting:** Phone calls from website clicks were counted twice (real-time phone_click conversion + offline Ring Central upload). Added dedup logic: if a phone_click fired within 3 minutes of a call, skip the offline upload.
- **Split attribution windows:** New `DEDUP_WINDOW_MINUTES = 3` (tight, for same-event matching) and `ATTRIBUTION_WINDOW_MINUTES = 60` (wide, for browse-then-call attribution). Previously a single constant at 15 min.
- **Updated default values:** `DEFAULT_CALL_VALUE` 150→55, `DEFAULT_FORM_VALUE` 150→91. Derived from actual data: 15.3% call close rate × $360 avg ticket, 25.2% form close rate × $360.

### Google Ads (applied via API)
- **Conversion values set from data:** Submit lead form=$91, Phone number clicks=$55, Phone call Ring Central=$55, Text=$47
- **Calls from ads → secondary at $0** (0 calls in 30 days, not active)
- **Calls from ads (1) → secondary** (orphan duplicate, removed from bidding)
- **Counting type:** "Calls from ads" changed from MANY_PER_CLICK to ONE_PER_CLICK (was inflating counts)

### Microsoft Ads (applied via SOAP API)
- **Conversion values set from data:** Quick quote=$91, Phone call website click=$55, Phone Call Ring Central=$55, Text_click=$47
- **Counting type:** All 5 goals changed from "All" → "Unique" (was counting every page load as a conversion)
- **Lead submitted page → Paused + excluded from bidding** (duplicate of Quick quote URL goal)
- **83 negative keywords uploaded** (33 competitors, 19 out-of-area, 13 wrong service, 11 informational, 4 job seekers, 1 own brand, 2 generic)
- **Match types tightened:** 16 broad→paused, 12 phrase replacements added. Kept 2 broad (top performers: "front windscreen" 14 conv/$6.89 CPA, "auto glass place" 4 conv/$13.87 CPA)
- **"auto glass now" keyword paused** (competitor name running as keyword)

### Service Area Fix
- Wrongly blocked 6 in-service-area cities as negative keywords (Colorado Springs, Fort Collins, Boulder, Longmont, Greeley, Black Forest). Removed all 6 immediately. Service area saved to memory for future sessions.

## Data That Drove Decisions

| Metric | Source | Value |
|--------|--------|-------|
| Average ticket | omega_installs (273 invoices) | $360 |
| Form close rate | leads table (377→95) | 25.2% |
| Call close rate | leads table (849→130) | 15.3% |
| Text close rate | leads table (46→6) | 13.0% |
| Phone click match rate | conversion_events + ringcentral_calls | 20% of calls have a phone_click, 80% do not |
| Dedup window sweet spot | Multi-window analysis (1-60 min) | 93% of click→call at 1 min, 96.7% at 3 min |

## What Was NOT Done
- Google CPC investigation ($9.04→$14.30 increase since Nov 2025) — P2, deferred
- PMax restart evaluation — P2, deferred until clean data window
- Microsoft ad copy audit (0.49% CTR) — P2, deferred
- GA4 import cleanup (close_convert_lead, qualify_lead, purchase) — investigate if "purchase" maps to real closed deal

## Verification Needed
- **48-72 hours:** Confirm conversions still recording correctly on both platforms
- **Week 1-2:** Monitor for volume drops from match type tightening + value changes. Do NOT change bid strategies during this period.
- **May 9:** Cross-platform CPA comparison with 30 days of clean data

## Scripts Created
- `scripts/weekly-search-term-review.js` — syncs data + flags wasted spend + negative keyword candidates
- `scripts/fix-google-conversion-value.js` — update Google conversion action settings
- `scripts/upload-microsoft-negative-keywords.js` — upload negatives to Microsoft Ads
- `scripts/fix-microsoft-geo-targeting.js` — check/update geo intent settings
