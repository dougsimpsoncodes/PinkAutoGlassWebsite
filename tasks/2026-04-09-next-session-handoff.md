# Next Session Handoff — Pink Auto Glass
## Created: April 9, 2026

Start by reading this file. It has everything you need.

---

## Two Tasks for Next Session

### Task 1: Quick Wins (do first)

**A. Deepen 20 AZ location pages with unique content**
- Same process used for 44 CO pages (commit 7d28b76)
- Use Gemini to generate city-specific content (hero paragraph, damage bullets, unique FAQ, nearby cities)
- Apply with script (see /tmp/apply-city-content.js pattern from CO batch)
- AZ cities: Ahwatukee, Apache Junction, Avondale, Buckeye, Cave Creek, Chandler, El Mirage, Fountain Hills, Gilbert, Glendale, Goodyear, Litchfield Park, Maricopa, Mesa, Peoria, Phoenix, Queen Creek, Scottsdale, Surprise, Tempe
- AZ pages use ArizonaCityPage component with data from src/data/arizonaCities.ts — content may need to go in the data file rather than individual page files

**B. Add contextual links to ~10 blog posts**
- Blog posts have CTA buttons but no in-body links to service or location pages
- Read each blog post, add 2-3 relevant contextual links (e.g., "windshield replacement" links to /services/windshield-replacement)
- Blog posts are at src/app/blog/[slug]/page.tsx with data in src/data/blog.ts

**C. Core Web Vitals audit**
- Run Lighthouse or PageSpeed Insights on homepage, a location page, and a service page
- Check for large images, render-blocking resources, CLS issues
- Gemini flagged this as an SEO priority

### Task 2: Franchise URL Restructure (main project)

**Architecture (validated by Claude + Codex + Gemini):**
```
pinkautoglass.com/                    → National brand homepage (NEW)
pinkautoglass.com/colorado/           → CO state hub (NEW)
pinkautoglass.com/colorado/denver/    → City page (moved from /locations/denver-co)
pinkautoglass.com/colorado/services/  → CO services (moved from /services/)
pinkautoglass.com/colorado/insurance/ → CO insurance (moved from /insurance/)
pinkautoglass.com/arizona/            → AZ state hub (moved from /phoenix)
pinkautoglass.com/arizona/phoenix/    → City page (moved from /locations/phoenix-az)
pinkautoglass.com/arizona/services/   → AZ services (NEW)
pinkautoglass.com/arizona/insurance/  → AZ insurance (NEW)
pinkautoglass.com/blog/               → Global (unchanged)
pinkautoglass.com/vehicles/           → Global (unchanged)
pinkautoglass.com/about/              → Global (unchanged)
pinkautoglass.com/book/               → Global (add ?market=co|az parameter)
```

**Full redirect map:** data/url-restructure-redirect-map.md (103+ redirects, every URL mapped)

**Key decisions (all validated by 3 LLMs):**
- Subfolder model (not separate domains) — matches Safelite, McDonald's, Chick-fil-A
- Root (/) becomes national brand homepage with state selector
- Keep slugs on high-intent pages (don't rename)
- /phoenix → /arizona/phoenix/ (not /arizona/ — city-specific redirect)
- Flatten all redirect chains to single-hop
- /book gets ?market=co|az parameter
- ServiceAreaLinks component already has market prop (done this session)
- GBP links point to state hubs with UTM params

**Phased rollout:**
- Phase 1: Build new route structure and pages (both old and new coexist)
- Phase 2: Update all internal links to point to new URLs
- Phase 3: Activate 301 redirects and cut over
- Phase 4: Update GBP, Google Ads, external references, sitemap

**Critical items from Codex + Gemini review:**
- Flatten 3 redirect chains (insurance claims, rock-chip, pricing)
- Update all JSON-LD structured data URLs
- Enforce trailing slash consistency
- Update Google Ads final URLs before launch
- Monitor GSC for crawl errors daily for 2 weeks post-launch
- Expect 2-8 week ranking dip (normal, recoverable)

---

## Context from Today's Session

### What was shipped today (all deployed):
- Conversion tracking: double-counting fixed, data-driven values ($55/$91/$47), dedup windows (3min/60min)
- Ad campaigns: 83 Microsoft Ads negatives, match types tightened, conversion counting fixed
- CRO: AboveFoldCTA + StickyCallbackBar tracking bug fixed, ContactCards component
- SEO: 84 pages title/desc rewrite, rock-chip consolidated, 3 new content pages, 44 CO locations deepened, internal linking components
- GBP: UTM tracking on both profiles, API quota requested
- CO/AZ: AZ insurance page phone fixed, homepage schema includes AZ, ServiceAreaLinks market-aware

### Working model with Codex + Gemini:
- Same prompt to both for strategy/creative decisions
- Claude (me) pulls data and executes code
- User decides when reviewers disagree
- Always verify with actual data before making assumptions

### Key memory files:
- ~/.claude/projects/-Users-dougsimpson/memory/project_pink_auto_glass_service_area.md — full service area (65+ cities)
- ~/.claude/projects/-Users-dougsimpson/memory/feedback_data_before_assumptions.md — always query actual data first
- ~/.claude/projects/-Users-dougsimpson/memory/feedback_check_service_area_before_blocking.md — check location pages before blocking cities
- ~/.claude/projects/-Users-dougsimpson/memory/feedback_trace_full_flow_before_changes.md — trace system flow before changes

### Neville handoff:
- ~/.openclaw/workspace/handoff-log.md — updated
- ~/.openclaw/workspace/website-factory/PinkAutoGlassWebsite/PROJECT-STATE.md — updated
