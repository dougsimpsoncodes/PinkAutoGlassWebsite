# Ads + SEO Session Recap — 2026-06-02

Full ads/SEO/CRO/GBP audit. 12 of 14 items complete. ~$8,000/month in combined Google + Microsoft spend now cleaned up, intent-segmented, and geo-corrected.

---

## What Was Done

### Google Ads

**#1 — Geo targeting fix (Denver campaign 23241807298)**
Excluded Colorado Springs, Fountain, and Pueblo from the Denver campaign. Added 11 city-name phrase-match negatives (Colorado Springs, Pueblo, Monument, etc.) so the intent segmentation doesn't accidentally serve those markets via broad-phrase.

**#2 — Competitor brand negatives**
Added to both campaigns: bullseye auto glass, elite auto glass, hartford glass, pittsburgh windshield, jiffy lube windshield, 20/20 auto glass. Phoenix only: desert auto glass, american auto glass phoenix. GEICO intentionally left unblocked — insurance jobs are revenue.

**#3 — Conversion action cleanup**
- "Calls from ads" (7351179314): bumped to $55 value
- "Calls from ads (1)" (7513990530): excluded from bidding (duplicate)
- Callback / text-me-price (7633459171): promoted to Primary
- Auto-apply emergency fix: MAXIMIZE_CONVERSIONS_OPT_IN and OPTIMIZE_AD_ROTATION paused; 4 UI rules turned off

**#5 + #11 — Intent segmentation (created as part of #11)**
Replaced the single "Denver Keywords" catch-all with 4 purpose-built ad groups:

| Ad Group | ID | Landing Page |
|---|---|---|
| Denver - Replacement | 198743781004 | /colorado/services/windshield-replacement |
| Denver - Repair | 198115313498 | / |
| Denver - Brand | 197550783776 | / |
| Denver - Insurance | 198115314418 | /services/insurance-claims/ |

Old "Denver Keywords" (183541239330) → PAUSED.

Phoenix segmentation added:

| Ad Group | ID | Landing Page |
|---|---|---|
| Phoenix - Repair | 198743781244 | /arizona/ |
| Phoenix - Brand | 197550784936 | /arizona/ |

Script: `scripts/create-intent-ad-groups.js`

**#6 — Denver paid landing page (PR #38)**
`/colorado/services/windshield-replacement/` rebuilt with quoter in hero, insurance copy removed. Denver replacement ads now point here. Old ad paused.

**#7 — Aurora SEO (PR #39)**
Title/H1 aligned to geographic + service keyword. `/colorado/aurora/` deleted, 301 → `/locations/aurora-co/`.

**#8 — ADAS SEO + ads (PR #40)**
Title/H1: "ADAS Calibration Denver CO." `/colorado/services/adas-calibration/` deleted, 301 → `/services/adas-calibration/`. ADAS ad group (195819116303): 7 keywords + RSA added.

**#9 — Header quoter link (PR #42)**
Both header CTAs changed: `/quote` → `/#quote-tool`.

---

### Google Business Profile

**#10 — GBP audit**

CO listing (7687655513474076881) + AZ listing (7649078763384235379):
- Descriptions updated: typo fixed, ADAS + insurance + OEM + warranty added
- Secondary category "Glass repair service" added to both (console only — API blocks category changes for service-area businesses that lack a storefront address)
- Photos confirmed present on both listings via Google search
- 4 posts published via API (had to enable `mybusiness.googleapis.com` on GCP project 246734799203 first):
  - CO: Colorado zero-deductible law, ADAS calibration
  - AZ: Insurance coverage, Phoenix heat angle (revised after council recommended stronger local angle)

Note: "Auto glass shop" category is unavailable for SABs — it requires a physical storefront address in the API. "Glass repair service" is the correct alternative.

---

### Microsoft Ads

**#4 — Re-auth**
Token had expired (AADSTS700082, 90-day inactivity). Re-authed as `doug@pinkautoglass.com` via `scripts/ms_ads_refresh_token.js` (must run in Terminal.app — Claude Code `!` prefix can't open browser). Token updated in `.env.local.service` + Vercel production.

**#14 — Full rebuild (account 187138247, campaign 523490791)**

Audit found: ~$2,600/month spend, 46% estimated waste from geo bleed, wrong-intent terms, and competitor clicks.

Geo setup:
- LocationIntent: PeopleIn (was already set — no change needed)
- 19 Denver metro + Front Range positive targets added
- Excluded: Colorado Springs (66459 + 8 sub-area IDs), Monument (91664), Pueblo (44475, 88923, 89225), Canon City (89589)
- CS keywords paused: "auto glass colorado springs" + "windshield replacement colorado springs"

30+ campaign-level negatives added: out-of-area cities, wrong-service terms (scuff repair, church glass, golf cart, sunroof, window tint, wiper blade, mirror repair, rear window), competitors (bright auto glass, elite auto glass, bullseye, mygrant, glass techniques, lakeside auto), wrong-intent (customer provides, supplier, wholesale).

New intent-segmented ad groups (old "Pink Auto Glass 1" id:1316118104030931 → PAUSED):

| Ad Group | ID | Landing Page |
|---|---|---|
| MS - Replacement | 1315018814973378 | /colorado/services/windshield-replacement |
| MS - Repair | 1316118325513235 | / |
| MS - Brand | 1317217837510180 | / |
| MS - Insurance | 1318317349072821 | /services/insurance-claims/ |

Script: `scripts/create-microsoft-intent-ad-groups.js`

---

## What's Pending

| # | Item | Status |
|---|---|---|
| 12 | Performance Max reactivation | Hold until ~2026-07-02 (30d clean conversion data needed post #3 fix) |
| 13 | Satellite site execution | Separate workstream — see `tasks/2026-06-02-satellite-quoter-rollout-spec.md` |

---

## Key IDs

| Resource | ID |
|---|---|
| Google Ads — Denver campaign | 23241807298 |
| Google Ads — Phoenix campaign | 23805458143 |
| Google Ads — ADAS ad group | 195819116303 |
| Microsoft Ads — Account | 187138247 |
| Microsoft Ads — Customer | 254615294 |
| Microsoft Ads — Campaign | 523490791 |
| GBP — CO listing | 7687655513474076881 |
| GBP — AZ listing | 7649078763384235379 |
| GBP — Account | 116490772118016000666 |
| Microsoft UET tag | 343218744 |

---

## Expected Improvements

- **Wasted spend reduction:** ~40–50% of Google spend on non-converting traffic should drop off (geo bleed, wrong-intent). Microsoft: ~46% waste identified ($1,191/$2,594/mo).
- **Quality score + ad relevance:** Intent-matched keywords → ad copy → landing pages lifts relevance scores. Lower CPC over 30–60 days.
- **Conversion tracking accuracy:** With the duplicate conversion removed and primary correctly set, Smart Bidding now optimizes against real leads instead of junk signals. CPA should improve 20–40% over 30d.
- **GBP local ranking:** Secondary category + 4 fresh posts signals activity to Google. Posts index within hours–1 day.

---

## Credentials

All secrets in `/Users/dougsimpson/clients/pink-auto-glass/website/.env.local.service`.

Microsoft Ads re-auth procedure: `~/.claude/projects/-Users-dougsimpson/memory/reference_microsoft_ads_oauth.md`
