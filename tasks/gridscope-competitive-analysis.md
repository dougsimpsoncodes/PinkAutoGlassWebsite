# GridScope Competitive Analysis
*Compiled: 2026-02-27 — Research from 5 specialized agents*

---

## Purpose

Pink Auto Glass is building **GridScope** — a custom local SEO and rank-tracking platform — as it expands from Phoenix and Denver to 50+ US markets. This report documents all major competing tools, their features, pricing, pros/cons, and market gaps, then provides a prioritized build recommendation for GridScope.

---

## Tools Analyzed

| # | Tool | Category |
|---|---|---|
| 1 | Local Falcon | Geo-grid rank tracking (specialist) |
| 2 | Local Viking | GBP management + geo-grid (all-in-one) |
| 3 | BrightLocal | All-in-one local SEO platform |
| 4 | Whitespark | Modular local SEO tools |
| 5 | Semrush Local | Enterprise SEO suite with local module |
| 6 | Moz Local | Listing management + basic rank tracking |
| 7 | GeoRanker | SERP data API + heatmaps |
| 8 | Yext | Enterprise listing syndication |
| 9 | Synup | Agency/franchise listing + geo-grid |

---

## 1. Local Falcon

**Positioning:** "Track + Optimize Local & AI Search Visibility" — industry-leading geo-grid tracker, now expanding into AI search visibility (GEO).

### Key Features
- **Geo-grid tracking:** 3x3 to 21x21 (largest max in the industry). GPS-spoofed scanning at each lat/lon coordinate.
- **AI search visibility (industry first):** Same heatmap visualization for ChatGPT, Google AI Overviews, Gemini, AI Mode, Grok. Proprietary **SAIV** (Share of AI Voice) metric.
- **Apple Maps tracking:** Full geo-grid support for Apple Business Connect.
- **Core metrics:** SoLV (Share of Local Voice), ARP, ATRP, SAIV.
- **Competitor overlay:** Every scan reveals all competitors across the grid with ARP, ATRP, SoLV, review score per competitor.
- **Falcon AI:** AI-powered scan analysis and recommendations (25 credits/report; free on annual/enterprise).
- **Falcon Agent:** Agentic AI for bulk GBP optimization.
- **Falcon Guard:** Daily GBP monitoring — alerts on any changes (pin moved, description edited, category changed). Does NOT auto-revert. $0.10/location/month add-on.
- **Sales prospecting tool:** Upload CSV of sales leads; auto-pulls rankings for each prospect's GBP (1 credit/lookup).
- **Campaigns:** Recurring scan automation. Campaign Reports aggregate across all locations and keywords.
- **Integrations:** Looker Studio, Zapier, full REST API + OAuth 2.1, **MCP Server** (connects to Claude, ChatGPT, etc.), npm package `@local-falcon/mcp`.
- **Export:** PNG, PDF, CSV, SVG. Shareable public report links. White-label on Premium+.

### Pricing (credit-based)
1 credit = 1 grid node. 5x5 = 25 credits; 9x9 = 81 credits; 21x21 = 441 credits. Monthly credits expire end of month.

| Plan | Monthly | Credits/mo |
|------|---------|------------|
| Starter | ~$24.99 | ~7,500 |
| Basic | ~$49.99 | ~15,000 |
| Mid | ~$99.99 | ~31,500 |
| Premium | ~$199.99 | ~63,000 |
| Enterprise | $499–$4,999 | 157k–1.57M |

White-label: Premium ($199/mo). Falcon Guard: $0.10/location/month. API: Basic+.

### Pros
- Largest grids in the industry (21x21)
- Only tool tracking AI search visibility (ChatGPT, Gemini, Grok, AI Mode, AI Overviews)
- Apple Maps tracking
- MCP integration — agentic AI connections
- Pay-as-you-go credits never expire
- Sales prospecting feature is unique
- Clean, fast UI with excellent visualization

### Cons
- **No GBP management** (no posts, no review management, no photo scheduling)
- **No listing protection** — Falcon Guard alerts only; cannot auto-revert unauthorized edits
- No citation building or NAP management
- No review solicitation
- No organic rank tracking (local pack only)
- Monthly credits expire — "credit anxiety" for agencies who don't use their full allotment
- Falcon AI costs 25 extra credits per report on monthly plans
- No mobile app
- No phone support

### Target Customer
Agencies and consultants tracking local rankings. Sales professionals prospecting clients. Data-heavy consultants who want visualization, not management.

---

## 2. Local Viking

**Positioning:** All-in-one GBP management platform for agencies and multi-location businesses.

### Key Features
- **GeoGrid tracking:** Up to 13x13 (smaller than Local Falcon). Timelapse GIFs showing rank progression. GeoGrid credits **roll over indefinitely** (major advantage).
- **GBP post scheduling:** Standard, Offer, Event posts. Bulk CSV upload. Spintax. Recurring posts. Post daisy chaining. Calendar view. Multi-location push.
- **EXIF metadata injection:** Injects keywords + GPS coordinates into photo EXIF data before uploading to GBP. Claimed ranking benefit.
- **Attribute Sentry:** Auto-detects AND auto-reverts unauthorized GBP edits. Stronger than Local Falcon's alert-only Falcon Guard.
- **Review management:** Centralized inbox for all locations. AI review reply suggestions with customizable tone.
- **Q&A management:** Bulk upload answers to GBP Q&A.
- **GBP Audit Reports:** Competitor analysis with AI commentary.
- **Call tracking (new):** Built-in.
- **GeoBooster (add-on):** Mobile app for technicians to create geo-tagged job-site "Moments" that syndicate to GBP posts + city pages. $99/location/month.
- **White-label:** Pro plan ($99/mo) and above.

### Pricing
| Plan | Monthly | GBP Locations | GeoGrid Credits | White Label |
|------|---------|---------------|-----------------|-------------|
| Single | $39 | 1 | 7,500 | No |
| Starter | $59 | 10 | 8,100 | No |
| Pro | $99 | 20 | 16,200 | Yes |
| Agency | $149 | 40 | 24,300 | Yes |
| Enterprise | $200 | 70 | 32,400 | Yes |

GeoGrid credits roll over (keyword credits don't). Annual: 2 months free.

### Pros
- GeoGrid credits roll over — no credit anxiety
- GBP management included (posts, reviews, photos, Q&A)
- Attribute Sentry auto-reverts edits (stronger than Falcon Guard)
- EXIF photo injection is unique
- White-label at $99/mo (cheaper than Local Falcon's $199/mo)
- Spintax and recurring posts save time for multi-location businesses
- Call tracking built in

### Cons
- **No AI search tracking** (no ChatGPT, Gemini, Grok, AI Overviews) — biggest gap
- **No Apple Maps tracking** — Google only
- **No Bing tracking** — Google only
- Grid capped at 13x13 (cannot match Local Falcon's 21x21 for large cities)
- No sales/prospecting tool
- No citation building
- No review solicitation (requires Rep.co integration at extra cost)
- No pay-as-you-go credit option
- GeoBooster is $99/location/month add-on — expensive
- Reliability complaints from users (scans sometimes need re-running)
- Steep learning curve
- Slow support response reported

### Target Customer
SEO agencies managing multiple client GBPs. Franchise brands with dozens+ locations. Not designed for non-technical single-location owners.

---

## 3. BrightLocal

**Positioning:** All-in-one local SEO platform for agencies and multi-location businesses.

### Key Features
- **Local Search Grid:** Geo-grid rank tracking up to 7x7. Competitor data included. Integrated with BrightLocal's broader platform.
- **GBP Audit:** 300+ point audit with scoring, benchmarks, and recommendations.
- **Citation Builder:** Managed citation building and cleanup service. 1,400+ directories.
- **Rank Tracker:** Local and organic rank tracking combined. Track maps, organic, and local pack together.
- **Review Management:** Monitor and respond to reviews across 80+ sites from one inbox.
- **Review Generation:** Native review request campaigns via email and SMS.
- **Reputation Manager:** Aggregate rating across all platforms.
- **Local Search Audit:** Comprehensive technical audit of local SEO health.
- **White-label:** Available on all plans. Export reports as PDFs. Custom branding.
- **BrightLocal Horizon:** Enterprise tier for large agencies with advanced multi-location management.
- **Agency tools:** Client portal, white-label dashboard, multi-location reporting.

### Pricing
| Plan | Monthly | Locations |
|------|---------|-----------|
| Single Business | $39 | 1 |
| Multi Business | $49 | 3 |
| SEO Pro | $59 | 6 |
| Enterprise (Horizon) | Custom | Unlimited |

Citation building charges separately per submission. Rank tracking is credit-based.

### Pros
- Best all-in-one: rank tracking + citations + reviews + audit in one platform
- White-label included on all plans (unique at this price)
- Native review solicitation (email + SMS) — only major tool with this built in
- 300+ point GBP audit is the most thorough in the industry
- 1,400+ directory citation management
- Organic + local pack tracking in one view
- Strong reporting and white-label client portal
- Very well-documented; trusted by 100,000+ agencies

### Cons
- **Geo-grid capped at 7x7** — too small for large metro areas
- **No AI search visibility tracking**
- **No Apple Maps tracking**
- **No GBP post scheduling** — rank tracking and citations only
- **No EXIF photo injection**
- No listing auto-revert (monitoring only)
- Citation building is a separate, à la carte cost
- Rank tracking uses credits that expire monthly
- UI can feel dated compared to newer tools
- Slow citation building process (weeks, not instant)

### Target Customer
Local SEO agencies managing client campaigns. Small-to-mid size businesses that want everything in one subscription. Marketing managers who need white-label reports for clients.

---

## 4. Whitespark

**Positioning:** Modular, best-in-class local SEO tools — buy only what you need.

### Key Features
- **Local Rank Tracker:** Tracks local pack, organic, and maps rankings. Up to a **225-point geo-grid** (most granular grid in the industry). Historical trending.
- **Local Citation Finder:** Finds citation opportunities by searching your competitors' citation sources. Identifies gaps.
- **Citation Building Service:** Managed, human-powered citation building (not automated). High quality, no fake directories.
- **Google Review Link Generator:** Free tool for getting customers to your review page.
- **Reputation Builder:** Review request campaigns via email.
- **Local SEO for Google Business Profile:** GBP monitoring and management.

### Pricing
À la carte model — you pay per tool, not a bundled suite.

| Tool | Monthly |
|------|---------|
| Local Rank Tracker | ~$17–$83/mo depending on locations tracked |
| Citation Finder | ~$17–$83/mo |
| Citation Building | Per submission / managed packages |
| Reputation Builder | ~$33/mo |

Bundles available. Annual discount.

### Pros
- **225-point geo-grid is the most granular available** (more data points than anyone else)
- À la carte pricing — only pay for tools you use
- Best citation building quality in the industry (human-reviewed, no junk directories)
- Industry-specific citation sources (auto glass, HVAC, etc.)
- Reputation Builder for review solicitation
- Highly respected in the local SEO community (created by Darren Shaw, top local SEO expert)
- All-in-one report available (combines rank + citations + reviews)

### Cons
- **No AI search visibility tracking**
- **No Apple Maps tracking**
- **No GBP post scheduling** or GBP management tools
- **No listing protection or monitoring**
- Citation building takes weeks (human-powered = slow)
- Modular pricing can add up if you need multiple tools
- UI is less polished than Local Falcon or Local Viking
- No white-label (agencies must cobble together reporting separately)
- Less automation — more manual work required

### Target Customer
SEO consultants and agencies that want best-in-class tools without a bundled suite. Citation-building specialists. Businesses doing their own SEO research.

---

## 5. Semrush Local

**Positioning:** Add local SEO features to Semrush's existing enterprise SEO suite.

### Key Features
- **Listing Management:** Distributes NAP data to 70+ directories automatically. Real-time sync.
- **Map Rank Tracker:** Geo-grid rank tracking. Credit-based.
- **Review Management:** Aggregate reviews, respond from one dashboard.
- **GBP AI Agent:** AI assistant for GBP optimization recommendations.
- **On-page SEO integration:** Ties local rank data to organic SEO campaigns in Semrush.
- **Semrush suite integration:** Combined local + organic reporting with Semrush's full toolset (keyword research, backlink analysis, competitor research, etc.)

### Pricing
- **Requires Semrush base plan:** $129.95/mo (Pro) or $249.95/mo (Guru) or $499.95/mo (Business)
- **Semrush Local add-on:** ~$20/mo (Basic) or ~$40/mo (Premium) on top of base plan
- Map Rank Tracker: credit-based, extra cost

Total minimum cost: ~$149.95/mo just to access local features.

### Pros
- Only tool combining local + organic SEO in one dashboard
- Semrush's keyword research is the best in the industry
- Listing distribution to 70+ directories included
- If you already use Semrush, local features are cheap to add
- GBP AI Agent is useful for non-technical users
- Strong competitor analysis capabilities across organic + local combined

### Cons
- **Requires expensive Semrush base plan** — $129.95/mo minimum before paying for local
- **Map Rank Tracker grids are smaller** and credit-based (expensive per scan)
- **No AI search visibility tracking**
- **No Apple Maps tracking**
- **No GBP post scheduling**
- **No auto-revert listing protection**
- **No citation building** (only listing distribution)
- 70 directories is much less than BrightLocal (1,400+) or Yext (200+ major publishers)
- Very expensive for businesses not already in the Semrush ecosystem
- Local features feel secondary to Semrush's core organic SEO product

### Target Customer
Businesses and agencies already paying for Semrush who want to add local tracking without switching tools. Enterprise teams managing local and organic SEO together.

---

## 6. Moz Local

**Positioning:** Simple, affordable listing management for small businesses.

### Key Features
- **Listing Sync:** Distributes NAP to 15 major data aggregators and directories. Real-time updates.
- **GeoRank:** Basic geo-based rank check (not a true geo-grid heatmap). Limited points.
- **Duplicate Suppression:** Finds and removes duplicate listings.
- **Review Monitoring:** Monitor reviews across major platforms. No response features.
- **Profile Completeness Score:** Shows how complete your GBP and directory profiles are.
- **Local SEO Score:** Overall health score.

### Pricing
| Plan | Monthly |
|------|---------|
| Lite | $16/mo |
| Preferred | $26/mo |
| Elite | $33/mo |

Works standalone (doesn't require a Moz Pro subscription).

### Pros
- Cheapest standalone local tool available ($16/mo)
- Very simple — good for non-technical business owners
- Listing sync to 15 core data aggregators is effective for NAP consistency
- Duplicate suppression is reliable
- No contracts

### Cons
- **No true geo-grid tracking** — GeoRank is primitive compared to Local Falcon
- **No AI search visibility**
- **No Apple Maps tracking**
- **No GBP post scheduling**
- **No citation building**
- **No review response or solicitation**
- **No competitor analysis**
- **No white-label**
- Only 15 directories (far fewer than BrightLocal or Yext)
- Has not kept pace with the market in feature development
- Feels outdated for agencies or multi-location businesses

### Target Customer
Individual small business owners who want basic listing consistency and a low monthly price. Not suited for agencies or scaling businesses.

---

## 7. GeoRanker

**Positioning:** Local SEO data and SERP API — for developers and data-heavy agencies.

### Key Features
- **Local Rank Checker:** Checks local rankings for multiple cities simultaneously.
- **Heatmap Visualization:** Visual representation of local rankings across a geographic area. Not a true geo-grid (different methodology than GPS-spoofed scanning).
- **SERP Data API:** Full programmatic access to local search results. Agencies use this to power their own dashboards.
- **Bulk city/keyword tracking:** Run hundreds of city/keyword combinations at once.
- **Citation Tracker:** Monitors NAP consistency across directories.

### Pricing
API/data plan — priced by query volume. Enterprise pricing only (starts ~$300–$500/mo for API access).

### Pros
- **Programmatic API access** — best option for developers building custom tools
- Bulk queries across many cities at once
- Heatmap visualization for quick visual overview
- Can be embedded into custom dashboards
- Powers some other tools' data behind the scenes

### Cons
- **Not a SaaS product** — too complex for non-developers
- **Heatmap is not true GPS-spoofed geo-grid scanning** — methodology is less accurate
- **No GBP management**
- **No listing management**
- **No reviews**
- **No AI search visibility**
- Expensive for what you get compared to Local Falcon (which offers more)
- Minimal UI/UX — data-first, not user-friendly
- Primarily useful as a data feed into other tools

### Target Customer
Developers building custom local SEO platforms. Large agencies with engineering teams. Data brokers.

---

## 8. Yext

**Positioning:** Enterprise listing syndication and Knowledge Graph management.

### Key Features
- **Knowledge Graph:** Central data layer for all business facts (name, address, hours, products, FAQs, menus). All listing syndication pulls from this single source of truth.
- **Listings Syndication:** Pushes data to 200+ publishers simultaneously (Google, Apple Maps, Facebook, Bing, Yelp, Siri, Alexa, etc.).
- **Real-time updates:** Changes reflect across all publishers within minutes.
- **Review Response:** Centralized review monitoring and response across platforms.
- **Analytics:** Clicks, impressions, searches, driving directions across all platforms.
- **Search (Yext Answers):** On-site search that answers questions using the Knowledge Graph.
- **Pages (Yext Pages):** Managed landing pages for each location, structured with Yext's schema.

### Pricing
- **Annual contracts only** (no monthly option)
- **~$199–$499/location/year** depending on plan and publisher count
- Enterprise pricing: custom
- 200+ publishers: requires higher-tier plan

### Pros
- **Most publishers covered** — 200+ including niche directories, voice assistants, mapping apps
- Real-time updates across all publishers simultaneously
- Knowledge Graph ensures perfect data consistency everywhere
- Strong enterprise features for 100+ location brands
- Apple Maps, Bing, Siri, Alexa — most tools ignore these

### Cons
- **Annual contracts required** — no monthly option; locked in
- **Very expensive** at $199–$499/location/year
- **Data lock-in risk** — if you cancel, data may be removed from some publishers
- **No geo-grid rank tracking**
- **No AI search visibility tracking**
- **No citation building** (syndication is different — it's direct push, not citation outreach)
- **No GBP post scheduling**
- **No review solicitation**
- Complexity and cost make it impractical for small/mid-size businesses
- Overkill for businesses under 20 locations

### Target Customer
Enterprise brands with 50+ locations. National chains. Businesses for whom data accuracy across voice assistants and emerging publishers is mission-critical.

---

## 9. Synup

**Positioning:** Agency and franchise local marketing platform combining listings + geo-grid + social.

### Key Features
- **Listing Management:** Syncs NAP to 60–80 directories including Google, Apple Maps, Facebook, Bing, Yelp.
- **Geo-Grid Rank Tracking:** Built-in geo-grid. Track rankings across a city grid.
- **Review Management:** Centralized inbox for all platforms. AI-powered review responses.
- **Review Solicitation:** Send review request campaigns via email and SMS.
- **GBP Post Scheduling:** Schedule Google, Facebook, and Instagram posts from one dashboard.
- **Social Media Management:** Cross-platform post scheduling (Google, Facebook, Instagram, Twitter/X).
- **Analytics:** Unified reporting across listings, social, and reviews.
- **White-label:** Reseller program for agencies to sell under their own brand.

### Pricing
Agency/franchise pricing. Custom quotes based on location count.
- Single location: ~$34.99/mo (Starter tier)
- Multi-location and agency: custom pricing
- White-label reseller program available

### Pros
- **Most features in one platform** — listings + geo-grid + reviews + review solicitation + social media
- **Social media scheduling** (Facebook, Instagram, Google) — unique among local SEO tools
- Review solicitation built in natively
- White-label reseller program is mature and well-documented
- Apple Maps and Bing tracking included
- Good for franchises that need one tool for everything

### Cons
- **Geo-grid is less capable than Local Falcon** (smaller grids, less accuracy)
- **No AI search visibility tracking**
- 60–80 directories is less than BrightLocal (1,400+) or Yext (200+ major publishers)
- UI can feel cluttered — too many features for businesses that just want rank tracking
- Custom pricing makes comparison difficult — hard to know if you're getting a fair deal
- Weaker rank tracking capability vs. specialists like Local Falcon
- Less known/trusted than Local Falcon or BrightLocal in the agency community

### Target Customer
Multi-location franchise brands. Marketing agencies that want one tool covering listings, reviews, and social media for all clients.

---

## Master Feature Comparison Matrix

| Feature | Local Falcon | Local Viking | BrightLocal | Whitespark | Semrush Local | Moz Local | GeoRanker | Yext | Synup |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Geo-grid tracking** | ✅ 21x21 | ✅ 13x13 | ✅ 7x7 | ✅ 225-pt | ✅ limited | ❌ | ✅ API | ❌ | ✅ limited |
| **AI search visibility** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Apple Maps tracking** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Bing tracking** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **GBP post scheduling** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **EXIF photo injection** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Listing auto-revert** | ❌ (alert) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Listing monitoring** | ✅ $0.10/loc | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Review management** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Review solicitation** | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Citation building** | ❌ | ❌ | ✅ 1400+ | ✅ (best) | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Listing syndication** | ❌ | ❌ | ✅ 1400+ | ❌ | ✅ 70+ | ✅ 15 | ❌ | ✅ 200+ | ✅ 60-80 |
| **Organic rank tracking** | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **GBP audit** | ❌ | ✅ | ✅ 300-pt | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Competitor overlay** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| **AI recommendations** | ✅ | ✅ basic | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **MCP/agentic AI** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Sales prospecting** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Social media scheduling** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Call tracking** | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Credits roll over** | ❌ | ✅ | ❌ | N/A | N/A | N/A | N/A | N/A | N/A |
| **Pay-as-you-go** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **White-label** | $199/mo | $99/mo | All plans | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Full API** | ✅ | Limited | Limited | ❌ | ✅ | ❌ | ✅ | ✅ | Limited |
| **Free tier / free trial** | ❌ | ❌ | 14-day | ❌ | ❌ | ❌ | ❌ | ❌ | Demo |
| **Mobile app** | ❌ | ✅ (add-on) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Annual contract required** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Minimum monthly cost** | $24.99 | $39 | $39 | ~$17 | $149.95 | $16 | $300+ | $199/loc/yr | $34.99 |

---

## Market Gaps (Opportunities for GridScope)

Based on the research across all 9 tools:

### Gap 1 — No Unified Tracking + GBP Management + AI Search in One Tool
Every business needs at minimum two subscriptions today:
- One for geo-grid rank tracking (Local Falcon or Whitespark)
- One for GBP management (Local Viking or BrightLocal)

No tool combines:
- Best-in-class geo-grid tracking
- GBP post scheduling and management
- AI search visibility (ChatGPT, Gemini, etc.)

**GridScope opportunity:** Own this combination.

### Gap 2 — No Bing/Microsoft Maps Tracking
Neither Local Falcon nor Local Viking track Bing. Only Yext (enterprise) and Synup cover it. As Microsoft Copilot integrates Bing Local into AI answers, this is a blind spot for most businesses.

### Gap 3 — No Auto-Revert + AI Visibility in One Tool
Local Viking auto-reverts unauthorized GBP edits (Attribute Sentry). But it has zero AI search visibility. Local Falcon tracks AI search but only alerts (doesn't auto-revert). Nobody does both.

### Gap 4 — Credit Anxiety
The credit-based billing model (Local Falcon, BrightLocal) causes agencies to ration scans. A flat-rate model with no per-scan credits would remove this pain entirely and be highly attractive.

### Gap 5 — No "Why Did My Ranking Change?" Automatic Analysis
Local Falcon charges 25 extra credits per AI analysis report. Local Viking provides raw data with no interpretation. No tool automatically explains rank changes after every scan as a baseline feature. This would be a huge time-saver for non-technical business owners.

### Gap 6 — No Market Expansion Scoring
No tool helps you decide *which city to expand into next*. The data exists (search volume, competition density, geo-grid scores of competitors in the target city) but nobody packages it as an actionable "go here next" feature.

### Gap 7 — No DataPins-Equivalent in a Rank Tracking Tool
DataPins (job-site check-in signals) is sold separately at ~$99/location/month. A built-in field tech check-in feature tied to geo-grid tracking would create a feedback loop: job completed in city → geo-tagged content published → track rank improvement over time.

### Gap 8 — No SAB-Specific "Donut Hole" Analysis
SABs consistently see strong rankings near their verified address but weak rankings in the outer parts of their service area. No tool specifically identifies and quantifies this "donut hole" pattern or recommends how to fix it.

### Gap 9 — No Real-Time Ranking Drop Alerts
All tools run batch/scheduled scans. No tool sends an instant alert when you fall out of the 3-Pack for a critical keyword. This is a major feature gap for high-urgency businesses like auto glass.

### Gap 10 — No Simple SMB Tier
All tools are built for agencies and are technically complex. A "simple view" for a non-technical single-location owner who just wants to see where they rank on a map and what they should do next is completely unserved.

---

## GridScope Build Recommendation

### Philosophy
Don't try to out-Local Falcon Local Falcon on day one. Build for Pink Auto Glass's specific needs first, then productize what works.

### Phase 1 — MVP (Build Now for Phoenix + Denver)
*Goal: Replace the need for Local Falcon for internal use.*

| Feature | Implementation | Why |
|---|---|---|
| **Geo-grid rank tracking** | Google Places API Text Search (5,000 free/mo) | Core feature. Phoenix 7x7 + Denver 7x7 + 3 keywords = ~150 scans/run, well within free tier |
| **Heatmap visualization** | Leaflet.js + OpenStreetMap | Free, open source, no API fees |
| **SoLV metric** | % of grid nodes in top 3 | Standard metric, easy to implement |
| **Competitor overlay** | Pull from same Places API scan | Already in the response data |
| **Scan history** | Store in Supabase | Trending over time from day 1 |
| **Multi-keyword, multi-city** | Tabbed interface | Phoenix and Denver at launch |
| **Admin dashboard integration** | New tab in existing Pink admin | No separate login needed |

**Keywords to track at launch:**
- `windshield replacement [city]`
- `auto glass repair [city]`
- `mobile windshield replacement [city]`
- `$0 deductible windshield [city]`

**Estimated Places API usage for MVP:**
- Phoenix 7x7 grid = 49 nodes × 4 keywords = 196 scans
- Denver 7x7 grid = 49 nodes × 4 keywords = 196 scans
- Total per run: ~392 scans — well within 5,000/month free tier
- Running weekly: 392 × 4 = 1,568 scans/month — still free

### Phase 2 — Expansion Features (Q2 2026)
*Goal: Cover 10 markets. Match Local Viking's capabilities.*

| Feature | Why |
|---|---|
| **GBP post scheduling** | Replace need for Local Viking |
| **Listing change monitoring** | Alert on unauthorized edits |
| **Review aggregation** | Centralized review inbox |
| **Market Expansion Scorer** | Score candidate cities: search volume + competition density + insurance friendliness |
| **SAB donut-hole analysis** | Flag radius where rankings drop off; recommend action |
| **Ranking change alerts** | Real-time Slack/SMS notification when rank drops from top-3 |

### Phase 3 — Differentiation (Q3–Q4 2026)
*Goal: Build features nobody else has.*

| Feature | Why This Is Unique |
|---|---|
| **AI search visibility tracking** | Track ChatGPT, Gemini, Perplexity mentions — same gap Local Falcon is filling but focused on our specific keywords |
| **Job-site check-in signals** | Field tech opens GridScope app, creates geo-tagged job pin → auto-publishes to city landing page and GBP post. Replaces DataPins ($99/loc/month) |
| **Flat-rate pricing (if productized)** | Unlimited scans, no credit system — biggest UX differentiator vs. all competitors |
| **"Why did my rank change?" AI analysis** | Auto-analysis after every scan comparing to last week — built into base product, not a credit add-on |
| **Competitor weak-spot analysis** | "This competitor has only 12 reviews and ranks #1 in Gilbert — you can displace them in 60 days" |
| **Market Expansion Report** | Combine geo-grid data for target cities with search volume + competition data into one "go / don't go" score |

---

## Recommended External Tool Stack (What to Buy vs. Build)

For what GridScope doesn't build internally, the recommended stack is:

| Need | Recommended Tool | Monthly Cost | Why |
|---|---|---|---|
| Citation building | Whitespark | ~$50–$83/mo | Best quality, industry-specific sources |
| Review solicitation | BrightLocal | ~$49/mo | Native SMS/email campaigns |
| Organic rank tracking | None yet / Semrush when needed | — | Not a priority until Phase 3 |
| Listing syndication | Moz Local | ~$26/mo | Cheap, effective for core aggregators |
| AI search tracking | Build in GridScope Phase 3 | — | Avoid paying Local Falcon $199/mo |

**Total external tool spend:** ~$125/mo vs. $600–$800+/mo if buying all tracking from Local Falcon + Local Viking + BrightLocal separately.

---

## Pros/Cons Summary for Doug

| Tool | Use It For | Don't Use It For |
|---|---|---|
| **Local Falcon** | AI search visibility (if we don't build Phase 3 fast enough) | Day-to-day geo-grid tracking (build this ourselves) |
| **Local Viking** | GBP post scheduling (Phase 2 might replace this) | Geo-grid tracking (we build better) |
| **BrightLocal** | Review solicitation, citation management | Geo-grid tracking (only 7x7) |
| **Whitespark** | Citation building (best quality) | Rank tracking (build ourselves) |
| **Semrush** | Keyword research for market expansion | Local rank tracking (expensive, weak) |
| **Moz Local** | Core listing consistency ($16/mo, set and forget) | Any serious tracking or management |
| **GeoRanker** | Nothing — we'll build our own data layer | — |
| **Yext** | Only if we hit 50+ locations and need 200+ publisher distribution | Too expensive until then |
| **Synup** | Nothing initially — covered by our own build + BrightLocal | — |

---

## Summary Recommendation

**Build GridScope MVP now.** The Google Places API free tier fully covers Phoenix + Denver for internal use at zero cost. No subscription to Local Falcon is needed for internal geo-grid tracking. The market gaps are real and significant — the combined tracking + GBP management + AI visibility + job-site signals use case is genuinely unserved.

**In parallel, subscribe to:**
- Whitespark ($50/mo) for citation building as we enter new markets
- BrightLocal ($49/mo) for review solicitation
- Moz Local ($26/mo) for core listing consistency

**Total external cost: ~$125/mo** to have best-in-class citations, reviews, and listing management while we build the tracking + GBP management in-house.

**Long-term:** If GridScope works well, it becomes a productizable tool for other auto glass companies — the competitive analysis shows nobody is building for this specific vertical at this price point.
