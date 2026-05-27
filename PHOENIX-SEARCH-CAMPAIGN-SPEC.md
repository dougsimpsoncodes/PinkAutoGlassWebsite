# Phoenix Search Campaign Spec

## Date
2026-04-28

## Task
Create the initial Phoenix Google Search campaign in the live Pink Auto Glass Google Ads account via API.

## 1. Role
Senior Google Ads implementation team:
- Nancy leads and verifies
- Codex provides implementation/logic pushback
- Gemini provides campaign/message/market pushback

## 2. Constraints
- Create via Google Ads API, not manually in UI unless API fails
- Create paused first; do not let it serve yet
- One Search campaign only
- Two ad groups only:
  - Core Replacement
  - Insurance / Zero-Deductible Replacement
- Geo targeting only: Phoenix, Scottsdale, Mesa, Tempe
- Match types: exact + phrase only
- No brand campaign
- No repair spend
- No ADAS spend
- Use broader Phoenix negative baseline, not the strict 4-city fallback
- No new dependencies
- Must verify created objects after mutation

## 3. Architecture expectations
- Reuse existing Google Ads client/auth patterns already in repo
- Prefer a one-off script under `scripts/` that is idempotent or at least duplicate-aware
- Query Google geo target constants by city name/state/country instead of guessing IDs
- Create campaign budget, paused Search campaign, two ad groups, keywords, and campaign-level/shared negative entries needed for this launch package
- Keep naming simple and explicit
- Do not attach brand/repair/ADAS assets or keywords

## 4. Output format
Before execution:
- SPEC file
- Codex and Gemini plan reviews

After execution:
- exact objects created (budget, campaign, ad groups, keyword counts)
- paused/active status verification
- geo verification
- negative-list import/apply summary
- Codex notes
- Gemini notes
- Nancy final verdict

## 5. Real-world context
- Denver audit showed one live Search campaign (`Keywords`) and replacement-led winning demand
- Phoenix launch decisions already locked:
  - 80% replacement / 20% insurance as planning target
  - insurance should be a support ad-group theme inside replacement, not a separate campaign
  - broader Phoenix negative baseline should remain default; geo targeting is the main 4-city control
- Existing docs/files:
  - `data/google-ads/phoenix-negative-keywords-upload.csv`
  - `data/google-ads/phoenix-launch-ad-copy.md`
  - `data/google-ads/phoenix-launch-build-sheet.md`
  - `data/google-ads/phoenix-launch-4city-negative-keywords-upload.csv` (fallback only)

## Communication protocol
- Nancy plans first
- Codex + Gemini review the plan before live mutation
- Nancy executes
- Nancy verifies live results
- Codex + Gemini review the created package/results

## Priority order
1. Verify safe API creation path
2. Create paused campaign shell + budget + geos
3. Create ad groups + keywords
4. Apply default Phoenix negative baseline
5. Verify every created object

## Definition of done
- Paused Search campaign exists in Google Ads with the approved name
- Two approved ad groups exist
- Only exact/phrase keywords loaded
- No brand/repair/ADAS keywords loaded
- Geo targeting limited to Phoenix, Scottsdale, Mesa, Tempe
- Default Phoenix negative baseline applied
- Campaign confirmed paused
- Results verified and reviewed by Codex + Gemini

## Requires Doug approval before proceeding
- Any deviation from the confirmed scope above
- Any switch from API creation to manual UI work
- Any decision to enable serving instead of paused
