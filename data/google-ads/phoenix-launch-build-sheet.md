# Phoenix Google Search Launch Build Sheet

Goal
- Launch a Phoenix lead-gen search campaign modeled on Denver learnings.
- Keep structure simple, replacement-first, and tightly controlled.

Pre-launch blockers flagged by second-opinion review
- Do not send paid traffic to `/arizona/services/windshield-replacement/` until the page is fully Arizona-localized and stripped of Denver/Colorado messaging.
- Clean up Arizona insurance page copy before launch; current law-heavy copy needs a proofread.
- Reconcile tracking inconsistency before launch: local admin sync status is failing and Google call/conversion reporting currently disagrees across endpoints.

Denver lessons applied
- Denver currently concentrates live Google Search demand in one active Search campaign.
- Strongest demand cluster is windshield replacement.
- Broad match is unnecessary at launch.
- Insurance messaging helps replacement but does not justify a separate campaign on day 1.

Launch decisions locked
- Geo launch: Phoenix + Scottsdale + Mesa + Tempe
- Budget split: 80% replacement, 20% insurance
- No brand campaign
- No repair spend
- No ADAS spend
- Match types: exact + phrase only
- Structure: one Search campaign with two ad groups

## Campaign structure
Campaign name
- Phoenix | Windshield Replacement

Bidding
- Maximize Conversions to start
- No tCPA on day 1

Networks
- Search Network only
- Turn off Display expansion
- No Search Partners at launch if you want the cleanest start

Location targeting
- Include: Phoenix, Scottsdale, Mesa, Tempe
- Presence setting: People in or regularly in your targeted locations
- Do not use interest-based location targeting

Ad schedule
- Start with business-answering hours if call handling is sensitive
- If phones are covered reliably, expand later

## Ad groups
### Ad Group 1 — Core Replacement
Spend share inside campaign
- Target ~80%
- Note: with one Maximize Conversions campaign and two ad groups, this is a planning target, not a hard-enforceable split.

Keyword focus
- Windshield replacement
- Mobile windshield replacement
- Auto glass replacement
- Same-day replacement
- City-modified replacement terms

Landing page
- `/arizona/services/windshield-replacement/`

### Ad Group 2 — Insurance / Zero-Deductible Replacement
Spend share inside campaign
- Target ~20%
- Note: this supports the replacement campaign; Google may not hold an exact ad-group-level split.

Keyword focus
- Insurance windshield replacement
- Windshield insurance claim
- Zero-deductible windshield replacement
- Free windshield replacement Arizona

Landing page
- `/arizona/services/insurance-claims/arizona/`

## Keyword policy
Use only
- exact
- phrase

Do not use at launch
- broad
- repair keywords
- ADAS keywords
- brand terms

## Negative keyword files
Primary baseline for option A
- `data/google-ads/phoenix-negative-keywords-upload.csv`

Strict launch-only alternate
- `data/google-ads/phoenix-launch-4city-negative-keywords-upload.csv`

Recommended use
- Because you chose option A, use geo targeting to hold the 4-city launch.
- Keep the broader Phoenix negative file as the default baseline.
- Keep the strict 4-city negative file as a fallback if search-term leakage appears.

## Required settings checklist
- Search campaign only
- Exact + phrase only
- Display expansion off
- Geo set to Phoenix / Scottsdale / Mesa / Tempe only
- Presence targeting only
- Call assets enabled
- Conversion tracking verified before launch
- Shared negatives uploaded

## Conversion checklist
Before launch verify
- Calls track correctly to the Arizona number
- Forms track correctly on Arizona pages
- No duplicate conversion actions
- Insurance page and replacement page both route correctly
- Mobile click-to-call behavior is working

## Search term review plan
Days 1-2
- Review search terms daily
- Add negatives aggressively
- Watch for city leakage outside launch zone
- Watch for repair-intent leakage

Days 3-7
- Keep daily review if volume is meaningful
- Tighten negatives fast
- Promote clean winners into exact match if needed
- Pause anything that drifts toward low-intent traffic

## What to watch first
- Generic junk queries
- Repair-intent traffic
- Out-of-service-area location leakage
- Competitor-only traffic that does not convert
- Search partner/display-like low-quality behavior if those settings were left on

## Simple operator sequence
1. Create campaign
2. Set geo to Phoenix, Scottsdale, Mesa, Tempe
3. Set presence targeting only
4. Turn off display expansion
5. Add two ad groups
6. Load exact + phrase keywords only
7. Upload Phoenix negative baseline
8. Add ad copy
9. Map final URLs
10. Verify conversions
11. Launch
12. Review search terms daily
