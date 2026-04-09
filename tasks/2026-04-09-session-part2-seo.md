# 2026-04-09 — SEO & CRO Work (Session Part 2)

## What Was Done

### CRO — Tracking Bug Fix
- **Root cause:** AboveFoldCTA and StickyCallbackBar used `trackCTAClick()` (GA4 only) instead of `trackPhoneClick()`/`trackTextClick()` (conversion_events + Google Ads + Microsoft Ads). Every page using these components showed 0 conversions despite real user clicks.
- **Fix:** Switched both components to proper tracking functions. Created ContactCards client component for /contact page.
- **Commits:** a65600f, 29fbaf9

### SEO — Title Tag & Meta Description Overhaul (84 pages)
- Codex + Gemini provided independent title/description rewrites from identical prompts
- All titles under 60 chars (were 60-88, causing Google truncation)
- All descriptions under 155 chars
- Removed phone numbers from titles (waste of chars)
- Service pages: removed city names, use "CO & AZ" (Gemini's recommendation — let location pages own city keywords)
- CO location template: "Windshield Replacement [City] CO | Mobile, $0 Deductible"
- AZ location template: "Windshield Replacement [City] AZ | $0 Out of Pocket"
- Insurance template: "[Carrier] Windshield Replacement CO | $0 Deductible"
- **Commits:** 2e7d545, 7508925

## SEO Items Remaining (from exec summary)

| # | Item | Status |
|---|------|--------|
| 6 | Title tags + meta descriptions | **DONE** |
| 7 | Deepen location page content (unique per city) | TODO |
| 8 | Create 3-5 high-intent content pages | TODO |
| 9 | Internal linking structure | TODO |
| 10 | GBP optimization | TODO |

## Also Flagged by Codex + Gemini (not yet addressed)

- Consolidate /services/windshield-repair and /services/rock-chip-repair (keyword cannibalization)
- Optimize /locations index for "near me" queries
- /services/mobile-service may cannibalize homepage — consider shifting focus to "is mobile service free?" intent
- Core Web Vitals audit (Gemini)
- Backlink building strategy (Gemini)

## How We Worked

- I pulled data, Codex + Gemini provided strategy/creative with identical prompts
- User chose Gemini's recommendation on service page geo scope (remove "Denver", use "CO & AZ") based on Google's own architecture guidance
- All title rewrites validated by both before deployment
- Character count audit caught 19 additional over-limit pages post-deploy — fixed and re-verified
