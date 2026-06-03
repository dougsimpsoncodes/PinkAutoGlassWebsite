# Pink Auto Glass — Satellite Opportunity Report
**Generated:** 2026-06-02  
**Window:** 2026-05-03 → 2026-05-30  
**Phase:** advisory-only

## What is verified
- `Google Search Console` data for all 24 satellites
- `GA4` hostname sessions/page views for the Pink Auto Glass GA4 property
- `Supabase leads` attributed by satellite `utm_source`
- Existing crawlability, indexing, and snippet-candidate audits already in this repo

## Executive take
- The satellite network is earning visibility, but not turning that visibility into clicks. Search Console shows `12,119 impressions` and only `14 clicks` across all 24 domains in the current 28-day window.
- Actual hostname traffic is concentrated in a small handful of sites. The clearest traffic leaders are `windshieldcostcalculator.com`, `windshieldpricecompare.com`, and `newwindshieldcost.com`.
- Verified downstream lead generation is extremely thin. Only `carglassprices.com` produced a recorded lead in this window.
- The dominant pattern is not a crawlability failure. Most top sites are live, indexable, and have sitemaps, but they still show `0 indexed web URLs` in the GSC sitemap summaries and extremely weak CTR.
- The fastest path is to focus phase 1 on a mixed set of `current traffic winners + high-impression under-clickers`, then reuse the winning fixes across the rest of the portfolio.

## Performance scoreboard

### Recommended phase-1 focus set

| Priority | Domain | Why it is in scope now | Leads | Sessions | Clicks | Impressions | CTR | Avg Pos |
|----------|--------|------------------------|-------|----------|--------|-------------|-----|---------|
| 1 | windshieldcostcalculator.com | Biggest verified traffic winner with real SEO demand and multiple snippet candidates | 0 | 142 | 3 | 1,246 | 0.24% | 39.5 |
| 2 | windshieldpricecompare.com | Highest impression site and second-highest sessions; severe CTR underperformance | 0 | 75 | 1 | 1,671 | 0.06% | 32.0 |
| 3 | newwindshieldcost.com | Strong session volume plus multiple near-page-1 content opportunities | 0 | 66 | 1 | 536 | 0.19% | 32.9 |
| 4 | windshieldchiprepairdenver.com | High local impression volume with clean crawl base but weak click-through | 0 | 15 | 3 | 1,279 | 0.23% | 42.7 |
| 5 | windshieldrepairprices.com | Large impression base, some real visits, and a verified snippet candidate at page-1/page-2 range | 0 | 22 | 0 | 765 | 0.00% | 67.4 |
| 6 | windshieldchiprepairtempe.com | Strong Phoenix impression growth and clicks, but almost no realized visit traffic | 0 | 4 | 3 | 880 | 0.34% | 61.7 |
| 7 | carglassprices.com | Only satellite with a verified lead in-window, so it deserves protection and funnel review | 1 | 27 | 0 | 146 | 0.00% | 77.3 |
| 8 | coloradospringswindshield.com | Smaller traffic base, but real click/session activity and strong impression growth in CO Springs | 0 | 18 | 1 | 355 | 0.28% | 55.1 |

### Watchlist

| Domain | Why it is close |
|--------|-----------------|
| windshieldcostphoenix.com | Decent session count for its size, but current search visibility is still too small to outrank the focus set |
| autoglasscoloradosprings.com | Strong impression volume, but zero clicks and weak visit realization make it a phase-2 SEO recovery candidate |
| mobilewindshieldcoloradosprings.com | Real sessions without meaningful search performance yet |

## Winner-pattern analysis

### What the better performers have in common
- `Cost / pricing / comparison intent` is the clearest winner. The strongest session sites are all built around price discovery:
  - `windshieldcostcalculator.com`
  - `windshieldpricecompare.com`
  - `newwindshieldcost.com`
- Informational article clusters are already close enough to matter. Existing snippet-candidate analysis shows near-page-1 or page-2 content on:
  - `windshieldcostcalculator.com/adas-calibration-costs`
  - `windshieldpricecompare.com/blog/windshield-price-trends-2026`
  - `windshieldpricecompare.com/blog/oem-vs-aftermarket-price-comparison`
  - `newwindshieldcost.com/insurance-cost`
  - `newwindshieldcost.com/blog/new-windshield-cost-factors-explained`
- Local chip-repair domains can attract impressions, but they are not yet turning those impressions into enough visits. The Denver and Tempe chip-repair sites prove there is search demand, but not yet strong SERP packaging.

### What is holding the network back
- `CTR is the portfolio’s biggest bottleneck.` Many of the best-impression pages are already visible enough to earn impressions, but not compelling enough to win clicks.
- `Sitemap indexing summaries are bad across the board.` Many focus sites show `0 indexed web URLs` in their GSC sitemap reporting despite still generating impressions. That points to weak indexing efficiency and/or property reporting gaps that should be investigated before large-scale content rollout.
- `Template bleed is still visible on some clones.` The crawlability audit shows incorrect/about-page titling patterns on some satellites, especially in the Colorado Springs/national-style cluster. That weakens local trust and entity clarity.
- `GA4 conversions on the satellite hostnames are zero.` Either true on-site conversion behavior is minimal, or satellite-host event/conversion measurement is not telling the story we actually care about. Right now, the clearest business truth is still downstream main-site leads.

## Site-by-site action plan

### 1. windshieldcostcalculator.com
- Fix the verified `/cost` 404 first.
- Rewrite the homepage and `ADAS` snippet package before broader content work.
- Push the two known striking-distance themes harder:
  - `windshield replacement cost calculator`
  - `replacement windshield estimate`
- Treat this as the lead template for pricing-intent sites.

### 2. windshieldpricecompare.com
- Rewrite the homepage title/meta immediately. `1,671 impressions` with `0.06% CTR` is the clearest CTR emergency in the network.
- Refresh the top comparison articles first because they already have visible ranking positions.
- Tighten SERP promise language around `OEM vs aftermarket`, `fair pricing`, and `2026 comparison`.

### 3. newwindshieldcost.com
- Prioritize the `insurance-cost` page and the `cost factors` article from the snippet-candidate list.
- Investigate the `-34.1%` impression drop despite still-strong session volume.
- Use this site as the control for “insurance + pricing” messaging.

### 4. windshieldchiprepairdenver.com
- This is the best local chip-repair SEO opportunity in Colorado.
- Improve snippet language for the homepage, `/cost`, and the `does chip repair leave a mark` article.
- Add stronger Denver-specific trust cues and service framing in title/meta copy.

### 5. windshieldrepairprices.com
- This site has enough impressions to matter and a clear snippet candidate, but it is winning no clicks.
- Rewrite the homepage and the `chip repair vs full replacement` article before any broader restructuring.
- Audit whether the site is too generic/national in SERP copy for Phoenix-intent searchers.

### 6. windshieldchiprepairtempe.com
- Strong Phoenix impression growth makes this worth keeping in the top 8 even though realized sessions are still tiny.
- Improve Tempe-local relevance in title/meta/H1 language, especially around same-day repair and insurance.
- Compare its homepage and `/cost` copy directly against the Denver chip-repair winner pattern.

### 7. carglassprices.com
- Protect this one because it is the only site with a verified lead in-window.
- Reverse-engineer the conversion path:
  - which landing page attracted the lead
  - what CTA path sent the visitor to Pink Auto Glass
  - whether the national framing can be reused elsewhere
- SEO is weak, so this is more of a `funnel-learning` site than a pure SEO winner.

### 8. coloradospringswindshield.com
- Keep it in scope because it shows both search growth and some realized visits.
- Tighten Colorado Springs-specific SERP copy and check for template leftovers in secondary pages.
- Use this as the test case for whether the CO Springs cluster can be lifted with localized snippet and entity cleanup.

## Reusable rollout playbook

### Quick wins
- Rewrite titles/meta for pages already ranking in positions `5-25` with CTR under `1%`
- Fix any verified broken key pages such as `/cost` on `windshieldcostcalculator.com`
- Remove template bleed from about pages, blog indexes, and local titles
- Standardize stronger quote/insurance/value language across pricing-intent sites

### Medium-effort wins
- Refresh the top-performing informational articles with:
  - clearer answer-first intros
  - stronger local proof and service relevance
  - cleaner call-through paths to Pink Auto Glass
- Harmonize internal linking from high-impression articles into the best money pages
- Audit sitemap/index coverage inconsistencies per domain before mass content expansion

### Portfolio rules to reuse
- Price-intent sites should lead with `calculator`, `cost`, `compare`, `insurance`, and `ADAS` angles
- Local service sites should lead with `same-day`, `mobile`, `insurance`, and exact city framing
- Each site should have one primary money page, one supporting cost page, and a small article cluster built around visible queries already present in GSC
- Roll out fixes only after one or two lead/traffic winners improve, then replicate the pattern

## Recommended next move
1. Use the dashboard and this report to confirm the phase-1 focus set.
2. For the top 4 sites, extract exact title/meta/H1 rewrites page by page.
3. For `carglassprices.com`, inspect the lead path and preserve whatever produced the one verified lead.
4. After approval, package the first implementation batch as:
   - `CTR/snippet rewrites`
   - `broken-page / template cleanup`
   - `internal CTA / Pink Auto Glass handoff improvements`
