# SEO Optimization — Session Log
**Date:** 2026-03-01
**Scope:** All 19 satellite sites + pinkautoglass.com main site

---

## What Was Done

### Satellite Sites (19 sites)

Applied a 5-part local SEO package to every satellite site:

| Change | Files Touched | Purpose |
|--------|--------------|---------|
| PostalAddress added to LocalBusiness schema | `src/app/layout.tsx` | City/zip anchor for Local Pack eligibility |
| areaServed expanded | `src/app/layout.tsx` | Aligns schema with actual service coverage |
| Footer ZIP line added | `src/components/Footer.tsx` | Visible on-page geo signal on every page |
| `/service-areas` page created | `src/app/service-areas/page.tsx` | New URL targeting "[city] windshield service areas" |
| `/replacement` page created | `src/app/replacement/page.tsx` | New URL targeting "[city] windshield replacement" |
| sitemap.ts updated | `src/app/sitemap.ts` | Both new pages added at priority 0.9 |

All 19 sites: built → committed → pushed → `vercel --prod --yes --scope dougsimpsoncodes-projects`

#### Sites Completed
| # | Workspace | Domain | Color Scheme | Market |
|---|-----------|--------|-------------|--------|
| 1 | windshield-chip-repair-boulder | windshieldchiprepairboulder.com | amber | Denver |
| 2 | windshield-denver | windshielddenver.com | — | Denver |
| 3 | mobile-windshield-denver | mobilewindshielddenver.com | — | Denver |
| 4 | aurora-windshield | aurorawindshield.com | — | Denver |
| 5 | windshield-chip-repair-phoenix | windshieldchiprepairphoenix.com | amber | Phoenix |
| 6 | windshield-chip-repair-mesa | windshieldchiprepairmesa.com | amber | Phoenix |
| 7 | windshield-chip-repair-scottsdale | windshieldchiprepairscottsdale.com | amber | Phoenix |
| 8 | windshield-chip-repair-tempe | windshieldchiprepairtempe.com | amber | Phoenix |
| 9 | windshield-cost-phoenix | windshieldcostphoenix.com | slate/sky | Phoenix |
| 10 | mobile-windshield-phoenix | mobilewindshieldphoenix.com | emerald | Phoenix |
| 11 | new-windshield-cost | newwindshieldcost.com | slate/emerald | Denver |
| 12 | new-windshield-near-me | newwindshieldnearme.com | amber | Denver |
| 13 | windshield-cost-calculator | windshieldcostcalculator.com | teal | Denver |
| 14 | windshield-price-compare | windshieldpricecompare.com | indigo | Denver |
| 15 | cheapest-windshield | cheapestwindshieldnearme.com | green | Denver |
| 16 | get-windshield-quote | getawindshieldquote.com | rose | Denver |
| 17 | windshield-repair-prices | windshieldrepairprices.com | rose | Phoenix+Denver |
| 18 | car-glass-prices | carglassprices.com | slate/indigo | Phoenix+Denver |
| 19 | car-windshield-prices | carwindshieldprices.com | slate/indigo | Phoenix+Denver |

#### Special Cases
- **mobile-windshield-phoenix** — `/service-areas` already existed; only `/replacement` was created
- **windshield-cost-calculator / windshield-price-compare** — footer had no phone at all; both `Phone` and `MapPin` were added
- **get-windshield-quote** — dark footer (bg-rose-950); ZIP text uses `text-rose-300` not gray for readability
- **Dual-city sites (17/18/19)** — both Phoenix and Denver phones shown in footer and on new pages; PostalAddress anchored to Phoenix (primary phone)
- **CO insurance framing** — Colorado does NOT mandate zero-deductible glass like Arizona; CO pages say "check your policy" rather than "$0"

---

### Main Site — pinkautoglass.com

Conservative approach — site already had 64 city pages, /services/windshield-replacement, and a comprehensive sitemap. Only additive changes:

| Change | Detail |
|--------|--------|
| `postalCode: "80202"` | Added to homepage PostalAddress in `src/app/page.tsx` |
| `areaServed` expanded | 5 → 15 Colorado cities in `src/app/page.tsx` |
| `sameAs` fixed | Corrected to `PinkAutoGlassDenver` / `pinkautoglassdenver`; LinkedIn added |
| Footer ZIP | "Denver, CO 80202–80290" in `src/components/footer.tsx` |
| Copyright | Fixed 2024 → 2026 in `src/components/footer.tsx` |

**Deliberately NOT done:** `/service-areas` and `/replacement` pages — would cannibalize `/locations` and `/services/windshield-replacement` which are already ranking.

---

## Verification Results

```
All 20 homepages:       200 ✓
All 38 new pages:       200 ✓ (/replacement + /service-areas × 19)
All 38 in sitemaps:     ✓
All 20 GSC submissions: 204 ✓ (submitted today, indexing pending 24-72h)
```

---

## GSC Sitemap Submission Command (for future use)

```bash
ACCESS=$(curl -s -X POST https://oauth2.googleapis.com/token \
  -d "client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&refresh_token=$GSC_REFRESH&grant_type=refresh_token" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('access_token',''))")

SITE_ENC=$(python3 -c "import urllib.parse; print(urllib.parse.quote('sc-domain:example.com', safe=''))")
SITEMAP_ENC=$(python3 -c "import urllib.parse; print(urllib.parse.quote('https://example.com/sitemap.xml', safe=''))")

curl -s -o /dev/null -w "%{http_code}" -X PUT \
  -H "Authorization: Bearer $ACCESS" \
  "https://searchconsole.googleapis.com/webmasters/v3/sites/${SITE_ENC}/sitemaps/${SITEMAP_ENC}"
# 204 = success
```

Credentials: `GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN` + `GOOGLE_ADS_CLIENT_ID` + `GOOGLE_ADS_CLIENT_SECRET` from `.env.local`
