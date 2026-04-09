# Pink Auto Glass — URL Restructure Redirect Map
## From current structure → Franchise subfolder model
## Generated: April 9, 2026

---

## Architecture Summary

```
CURRENT                                    → NEW
/                                          → / (national brand homepage)
/locations/denver-co                       → /colorado/denver/
/phoenix                                   → /arizona/
/services/windshield-replacement           → /colorado/services/windshield-replacement/ (CO version)
                                             /arizona/services/windshield-replacement/ (AZ version, new)
```

---

## HOMEPAGE

| Current URL | New URL | Type | Notes |
|------------|---------|------|-------|
| `/` | `/` | Rewrite | Changes from CO homepage to national brand homepage with state selector |
| (new) | `/colorado/` | New page | CO state hub — replaces current homepage as CO landing |
| `/phoenix` | `/arizona/` | 301 | AZ state hub — replaces /phoenix |

---

## CO LOCATION PAGES (44 pages)

| Current URL | New URL | Type |
|------------|---------|------|
| `/locations/arvada-co` | `/colorado/arvada/` | 301 |
| `/locations/aurora-co` | `/colorado/aurora/` | 301 |
| `/locations/black-forest-co` | `/colorado/black-forest/` | 301 |
| `/locations/boulder-co` | `/colorado/boulder/` | 301 |
| `/locations/brighton-co` | `/colorado/brighton/` | 301 |
| `/locations/broomfield-co` | `/colorado/broomfield/` | 301 |
| `/locations/castle-rock-co` | `/colorado/castle-rock/` | 301 |
| `/locations/centennial-co` | `/colorado/centennial/` | 301 |
| `/locations/cherry-hills-village-co` | `/colorado/cherry-hills-village/` | 301 |
| `/locations/colorado-springs-co` | `/colorado/colorado-springs/` | 301 |
| `/locations/commerce-city-co` | `/colorado/commerce-city/` | 301 |
| `/locations/denver-co` | `/colorado/denver/` | 301 |
| `/locations/englewood-co` | `/colorado/englewood/` | 301 |
| `/locations/erie-co` | `/colorado/erie/` | 301 |
| `/locations/evergreen-co` | `/colorado/evergreen/` | 301 |
| `/locations/federal-heights-co` | `/colorado/federal-heights/` | 301 |
| `/locations/firestone-co` | `/colorado/firestone/` | 301 |
| `/locations/fort-collins-co` | `/colorado/fort-collins/` | 301 |
| `/locations/fountain-co` | `/colorado/fountain/` | 301 |
| `/locations/frederick-co` | `/colorado/frederick/` | 301 |
| `/locations/golden-co` | `/colorado/golden/` | 301 |
| `/locations/greeley-co` | `/colorado/greeley/` | 301 |
| `/locations/greenwood-village-co` | `/colorado/greenwood-village/` | 301 |
| `/locations/highlands-ranch-co` | `/colorado/highlands-ranch/` | 301 |
| `/locations/johnstown-co` | `/colorado/johnstown/` | 301 |
| `/locations/lafayette-co` | `/colorado/lafayette/` | 301 |
| `/locations/lakewood-co` | `/colorado/lakewood/` | 301 |
| `/locations/littleton-co` | `/colorado/littleton/` | 301 |
| `/locations/lone-tree-co` | `/colorado/lone-tree/` | 301 |
| `/locations/longmont-co` | `/colorado/longmont/` | 301 |
| `/locations/louisville-co` | `/colorado/louisville/` | 301 |
| `/locations/loveland-co` | `/colorado/loveland/` | 301 |
| `/locations/manitou-springs-co` | `/colorado/manitou-springs/` | 301 |
| `/locations/northglenn-co` | `/colorado/northglenn/` | 301 |
| `/locations/parker-co` | `/colorado/parker/` | 301 |
| `/locations/security-widefield-co` | `/colorado/security-widefield/` | 301 |
| `/locations/sheridan-co` | `/colorado/sheridan/` | 301 |
| `/locations/superior-co` | `/colorado/superior/` | 301 |
| `/locations/thornton-co` | `/colorado/thornton/` | 301 |
| `/locations/timnath-co` | `/colorado/timnath/` | 301 |
| `/locations/wellington-co` | `/colorado/wellington/` | 301 |
| `/locations/westminster-co` | `/colorado/westminster/` | 301 |
| `/locations/wheat-ridge-co` | `/colorado/wheat-ridge/` | 301 |
| `/locations/windsor-co` | `/colorado/windsor/` | 301 |

### CO Neighborhood Sub-Pages (dynamic)

| Current Pattern | New Pattern | Type |
|----------------|-------------|------|
| `/locations/aurora-co/[neighborhood]` | `/colorado/aurora/[neighborhood]` | 301 |
| `/locations/boulder-co/[neighborhood]` | `/colorado/boulder/[neighborhood]` | 301 |
| `/locations/colorado-springs-co/[neighborhood]` | `/colorado/colorado-springs/[neighborhood]` | 301 |
| `/locations/denver-co/[neighborhood]` | `/colorado/denver/[neighborhood]` | 301 |
| `/locations/fort-collins-co/[neighborhood]` | `/colorado/fort-collins/[neighborhood]` | 301 |
| `/locations/lakewood-co/[neighborhood]` | `/colorado/lakewood/[neighborhood]` | 301 |

---

## AZ LOCATION PAGES (20 pages)

| Current URL | New URL | Type |
|------------|---------|------|
| `/locations/ahwatukee-az` | `/arizona/ahwatukee/` | 301 |
| `/locations/apache-junction-az` | `/arizona/apache-junction/` | 301 |
| `/locations/avondale-az` | `/arizona/avondale/` | 301 |
| `/locations/buckeye-az` | `/arizona/buckeye/` | 301 |
| `/locations/cave-creek-az` | `/arizona/cave-creek/` | 301 |
| `/locations/chandler-az` | `/arizona/chandler/` | 301 |
| `/locations/el-mirage-az` | `/arizona/el-mirage/` | 301 |
| `/locations/fountain-hills-az` | `/arizona/fountain-hills/` | 301 |
| `/locations/gilbert-az` | `/arizona/gilbert/` | 301 |
| `/locations/glendale-az` | `/arizona/glendale/` | 301 |
| `/locations/goodyear-az` | `/arizona/goodyear/` | 301 |
| `/locations/litchfield-park-az` | `/arizona/litchfield-park/` | 301 |
| `/locations/maricopa-az` | `/arizona/maricopa/` | 301 |
| `/locations/mesa-az` | `/arizona/mesa/` | 301 |
| `/locations/peoria-az` | `/arizona/peoria/` | 301 |
| `/locations/phoenix-az` | `/arizona/phoenix/` | 301 |
| `/locations/queen-creek-az` | `/arizona/queen-creek/` | 301 |
| `/locations/scottsdale-az` | `/arizona/scottsdale/` | 301 |
| `/locations/surprise-az` | `/arizona/surprise/` | 301 |
| `/locations/tempe-az` | `/arizona/tempe/` | 301 |

---

## SERVICE PAGES (split into CO + AZ versions)

| Current URL | New CO URL | New AZ URL | Type |
|------------|-----------|-----------|------|
| `/services` | `/colorado/services/` | `/arizona/services/` | 301 → CO (primary traffic), new AZ |
| `/services/windshield-replacement` | `/colorado/services/windshield-replacement/` | `/arizona/services/windshield-replacement/` | 301 → CO, new AZ |
| `/services/windshield-repair` | `/colorado/services/windshield-repair/` | `/arizona/services/windshield-repair/` | 301 → CO, new AZ |
| `/services/adas-calibration` | `/colorado/services/adas-calibration/` | `/arizona/services/adas-calibration/` | 301 → CO, new AZ |
| `/services/mobile-service` | `/colorado/services/mobile-service/` | `/arizona/services/mobile-service/` | 301 → CO, new AZ |
| `/services/insurance-claims` | `/colorado/services/insurance-claims/` | `/arizona/services/insurance-claims/` | 301 → CO, new AZ |
| `/services/emergency-windshield-repair` | `/colorado/services/emergency-windshield-repair/` | `/arizona/services/emergency-windshield-repair/` | 301 → CO, new AZ |

---

## INSURANCE PAGES (split into CO + AZ versions)

### Top-Level Insurance Pages (/insurance/*)

| Current URL | New CO URL | New AZ URL | Type |
|------------|-----------|-----------|------|
| `/insurance/aaa` | `/colorado/insurance/aaa/` | `/arizona/insurance/aaa/` | 301 → CO, new AZ |
| `/insurance/allstate` | `/colorado/insurance/allstate/` | `/arizona/insurance/allstate/` | 301 → CO, new AZ |
| `/insurance/esurance` | `/colorado/insurance/esurance/` | `/arizona/insurance/esurance/` | 301 → CO, new AZ |
| `/insurance/farmers` | `/colorado/insurance/farmers/` | `/arizona/insurance/farmers/` | 301 → CO, new AZ |
| `/insurance/geico` | `/colorado/insurance/geico/` | `/arizona/insurance/geico/` | 301 → CO, new AZ |
| `/insurance/liberty-mutual` | `/colorado/insurance/liberty-mutual/` | `/arizona/insurance/liberty-mutual/` | 301 → CO, new AZ |
| `/insurance/progressive` | `/colorado/insurance/progressive/` | `/arizona/insurance/progressive/` | 301 → CO, new AZ |
| `/insurance/safeco` | `/colorado/insurance/safeco/` | `/arizona/insurance/safeco/` | 301 → CO, new AZ |
| `/insurance/state-farm` | `/colorado/insurance/state-farm/` | `/arizona/insurance/state-farm/` | 301 → CO, new AZ |
| `/insurance/usaa` | `/colorado/insurance/usaa/` | `/arizona/insurance/usaa/` | 301 → CO, new AZ |

### Insurance Claims Sub-Pages

| Current URL | New URL | Type |
|------------|---------|------|
| `/services/insurance-claims/arizona` | `/arizona/services/insurance-claims/` | 301 |
| `/services/insurance-claims/aaa` | Already redirects to `/insurance/aaa` | Existing redirect → update chain |
| (same for all other carrier sub-pages) | Already redirect to `/insurance/*` | Update final destinations |

---

## HIGH-INTENT CONTENT PAGES (split into CO + AZ)

| Current URL | New CO URL | New AZ URL | Type |
|------------|-----------|-----------|------|
| `/pricing` | `/colorado/pricing/` | `/arizona/pricing/` | 301 → CO, new AZ |
| `/does-insurance-cover-windshield-replacement` | `/colorado/insurance-coverage-guide/` | `/arizona/insurance-coverage-guide/` | 301 → CO, new AZ |
| `/how-long-does-windshield-replacement-take` | `/colorado/how-long-windshield-replacement/` | `/arizona/how-long-windshield-replacement/` | 301 → CO, new AZ |
| `/adas-calibration-cost` | `/colorado/adas-calibration-cost/` | `/arizona/adas-calibration-cost/` | 301 → CO, new AZ |

---

## GLOBAL PAGES (stay at root — no state prefix)

| Current URL | New URL | Type | Notes |
|------------|---------|------|-------|
| `/about` | `/about/` | No change | Global brand page |
| `/blog` | `/blog/` | No change | Global blog |
| `/blog/[slug]` | `/blog/[slug]` | No change | Individual posts stay global |
| `/book` | `/book/` | No change | Booking — market detection from form input |
| `/careers` | `/careers/` | No change | Global |
| `/contact` | `/contact/` | No change | Global with both phone numbers |
| `/vehicles` | `/vehicles/` | No change | Global |
| `/vehicles/[slug]` | `/vehicles/[slug]` | No change | Global |
| `/vehicles/brands/[make]` | `/vehicles/brands/[make]` | No change | Global |
| `/brand-assets` | `/brand-assets/` | No change | Internal |
| `/locations` | Redirect or remove | 301 → `/` | National homepage replaces location index |

---

## EXISTING REDIRECTS (must update final destinations)

| Current Redirect | Updated Redirect |
|-----------------|------------------|
| `/services/rock-chip-repair` → `/services/windshield-repair` | → `/colorado/services/windshield-repair/` |
| `/windshield-replacement-cost` → `/pricing` | → `/colorado/pricing/` |
| `/services/insurance-claims/:carrier` → `/insurance/:carrier` | → `/colorado/insurance/:carrier/` |
| `/locations/denver` → `/locations/denver-co` | → `/colorado/denver/` |
| `/locations/boulder` → `/locations/boulder-co` | → `/colorado/boulder/` |
| `/locations/phoenix` → `/locations/phoenix-az` | → `/arizona/phoenix/` |
| `/quote` → `/book` | No change (stays `/book`) |
| `/get-quote` → `/book` | No change |
| `/faq` → `/` | No change (national homepage) |
| `/reviews` → `/about` | No change |

---

## GBP URL UPDATES

| Profile | Current | New |
|---------|---------|-----|
| Colorado GBP | `pinkautoglass.com?utm_source=google&utm_medium=gbp&utm_campaign=listing-co` | `pinkautoglass.com/colorado/?utm_source=google&utm_medium=gbp&utm_campaign=listing-co` |
| Arizona GBP | `pinkautoglass.com/phoenix?utm_source=google&utm_medium=gbp&utm_campaign=listing-az` | `pinkautoglass.com/arizona/?utm_source=google&utm_medium=gbp&utm_campaign=listing-az` |

---

## COUNTS

| Category | Current Pages | New CO Pages | New AZ Pages | New Global Pages | 301 Redirects |
|----------|--------------|-------------|-------------|-----------------|---------------|
| Homepage | 1 | 1 (state hub) | 1 (state hub) | 1 (national) | 0 |
| Location pages | 64 | 44 | 20 | 0 | 64 |
| Neighborhood pages | 6 patterns | 6 patterns | 0 | 0 | 6 patterns |
| Service pages | 7 | 7 | 7 (new) | 0 | 7 |
| Insurance pages | 10 | 10 | 10 (new) | 0 | 10 |
| Insurance claims sub-pages | 12 | merged into above | merged into above | 0 | 12 |
| High-intent content | 4 | 4 | 4 (new) | 0 | 4 |
| Global pages | 8 | 0 | 0 | 8 (unchanged) | 0 |
| **TOTALS** | **~106** | **~66** | **~42 (21 new)** | **~9** | **~103** |
