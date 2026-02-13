# Admin Dashboard Redesign

**Date:** February 10, 2026
**Status:** Planning — mockups created, implementation not started
**Mockups:** `mockups/daily-briefing.html`, `mockups/period-scorecard.html`

---

## Goals

1. **Daily recap** — one screen that answers "what happened today and why?" (spend, leads, calls, revenue, lead handling)
2. **Period reporting** — easy way to look at activity over custom time ranges with prior-period comparison

---

## Current State Problems

- **12 separate pages** — have to click through 5-6 to understand a single day
- **Preset date filters only** — today/7d/30d/all, no custom date range
- **No period comparison** — can't see "this week vs last week"
- **No activity timeline** — only aggregate numbers, no chronological story of the day
- **No alerts** — missed calls, stale leads, spend anomalies aren't surfaced
- **No sparklines/trends** — metric cards show a number but no direction

---

## Proposed Changes

### 1. Daily Briefing (replaces main dashboard)

**URL:** `/admin/dashboard` (default landing page)

**Top row — comparison cards:**
| Metric | Today | Yesterday | 7-Day Avg |
|--------|-------|-----------|-----------|
| Ad Spend | $XX | $XX | $XX |
| New Leads | X | X | X.X |
| Calls (answered/missed) | X/X | X/X | X/X |
| Revenue Booked | $XX | $XX | $XX |

**Left column — activity timeline:**
- Chronological feed of every event: inbound calls, form leads, SMS sent/received, status changes, jobs completed
- Each event tagged with source (Google/Microsoft/Organic/Direct)
- Call events show duration, answered/missed, new vs returning caller
- Form events show vehicle, service type, city
- Revenue events show job value and customer name
- Date navigation (arrow keys or buttons) to review any past day

**Right column — alerts + context:**
- "Needs Attention" panel: missed calls not returned, leads stuck in "new" status, spend anomalies
- Ad spend breakdown: per-platform spend, leads, and cost/lead for the day
- Pipeline status bar: visual breakdown of all open leads by status (new/contacted/quoted/scheduled)

### 2. Period Scorecard (replaces funnel, ROI, traffic, calls, conversions pages)

**URL:** `/admin/dashboard/reports`

**Date controls:**
- Preset buttons: 7D, 30D, 90D, All
- Custom date range picker (two date inputs)
- Automatic "vs prior period" comparison (pick Jan 1-31, it compares to Dec 1-31)

**Hero metrics row (5 cards with sparklines):**
- Revenue, Ad Spend, Leads, Blended ROAS, Cost/Lead
- Each shows value, % change vs prior period, and weekly sparkline

**Sections (all on one scrollable page):**
- **Ad Platform Comparison** — table: platform, spend, leads, cost/lead, clicks, CTR
- **Revenue & Jobs** — weekly breakdown: jobs, revenue, avg job value
- **Lead Sources** — horizontal bar chart by source + lead type breakdown (calls/forms/texts)
- **Funnel** — sessions → CTA clicks → leads → jobs → revenue with conversion rates
- **Call Performance** — inbound, answered, missed, answer rate + prior period comparison
- **Lead Pipeline Status** — table: status, count, % of total, estimated value
- **Website Traffic** — sessions, visitors, page views, pages/session, mobile %

### 3. Simplified Navigation

**Current (12 items):**
Dashboard, Leads, Call Analytics, Funnel, ROI, Google Ads, Microsoft Ads, Website Analytics, Traffic Sources, Page Performance, Conversions, Search Performance

**Proposed (4 items):**
1. **Today** — Daily Briefing
2. **Reports** — Period Scorecard
3. **Leads** — CRM table (keep as-is)
4. **Search Terms** — keep for ad optimization

Everything else gets folded into Reports as sections.

---

## Data Sources (all already available)

| Data | Source | API Endpoint |
|------|--------|-------------|
| Ad spend/clicks/impressions | Google Ads API, Microsoft Ads API | `/api/admin/dashboard/unified` |
| Leads (forms) | Supabase `leads` table | `/api/admin/leads` |
| Calls | RingCentral via API | `/api/admin/calls` |
| Call attribution | Supabase + RC matching | `/api/admin/calls/attributed` |
| Website sessions | Supabase `page_views` / GA4 | `/api/admin/analytics` |
| Conversion events | Supabase `conversion_events` | `/api/admin/analytics?metric=conversions` |
| Search terms | Google Ads + GSC | `/api/admin/dashboard/search-performance` |
| Revenue | Supabase `leads.revenue_amount` | `/api/admin/leads` (PATCH updates) |

**New API needed:** A unified "daily activity" endpoint that returns a chronological event feed combining calls, leads, SMS, status changes, and job completions for a given date.

---

## Implementation Approach

### Phase 1: Daily Briefing
1. Build `/api/admin/dashboard/daily-activity` endpoint — merges calls, leads, SMS, status changes into chronological feed
2. Build Daily Briefing page component with comparison cards, timeline, alerts panel
3. Replace current main dashboard

### Phase 2: Period Scorecard
1. Add custom date range picker component (reusable)
2. Add "vs prior period" calculation to existing API endpoints
3. Build single-page scorecard consolidating all metrics
4. Add sparklines to hero metric cards

### Phase 3: Navigation Cleanup
1. Reduce sidebar to 4 items
2. Remove or redirect old page URLs
3. Update any bookmarks or links

---

## Open Questions

- Should the daily briefing also be emailable as a digest? (morning recap of yesterday)
- What revenue source should we use long-term? Currently Supabase `leads.revenue_amount` (manually entered). Omega integration would be more accurate but requires API access.
- Should the timeline include outbound calls/SMS or just inbound activity?
