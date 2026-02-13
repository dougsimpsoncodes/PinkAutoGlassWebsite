# Google Ads Performance Max (PMax) — Junk Traffic Analysis

**Date:** February 10, 2026
**Author:** Doug Simpson (with Claude Code analysis)
**Status:** PMax campaign should be paused/killed

---

## Summary

The Google Ads Performance Max (PMax) campaign spent **$3,184** between October 2025 and February 2026 and generated **zero attributable revenue**. Analysis of Supabase session data reveals the traffic was overwhelmingly non-human or non-intentional (e.g., children tapping on mobile devices). All PMax data has been excluded from the Feb 11 business review deck to present accurate performance metrics.

---

## The Problem

Two Google Ads campaigns were running:
1. **"Pink Auto Glass - Keywords"** — traditional search ads targeting windshield repair/replacement keywords
2. **"Pink Auto Glass"** (Performance Max) — Google's automated campaign type that places ads across Search, Display, YouTube, Gmail, Discover, and Maps

PMax generated significantly more clicks (3,420) than Keywords (721), but the traffic quality was drastically different.

---

## Evidence: Supabase Session Analysis

Our website tracks every visitor session in Supabase (`user_sessions` table), including page view counts and traffic source (via `gclid` parameter for Google Ads).

### Google Ads Sessions Breakdown

| Metric | Keywords (estimated) | PMax (estimated) | Total |
|--------|---------------------|-------------------|-------|
| Total sessions | 555 | 1,426 | 1,981 |
| Sessions with 1+ page views | 555 | ~0 | 555 |
| Sessions with 0 page views | ~0 | 1,426 | 1,426 |
| **Bounce rate** | **Normal** | **~100%** | — |

**Key finding:** 1,426 of 1,981 Google Ads sessions (72%) had **zero page views** — the visitor landed and immediately left without viewing any content. These align with PMax's click volume (3,420 clicks but only ~1,426 tracked sessions, with the rest not even registering).

### Methodology

We couldn't directly match individual sessions to campaigns (gclid doesn't expose campaign ID). Instead, we used **page_views_count = 0** as a quality signal:

- **0 page views** = visitor bounced instantly (characteristic of accidental taps, bot traffic, or non-intentional clicks from Display/YouTube/Discover placements)
- **1+ page views** = visitor actually engaged with the site (characteristic of intentional search clicks)

This correlates well with the campaign click volumes:
- Keywords: 721 API clicks → ~555 Supabase sessions with engagement
- PMax: 3,420 API clicks → ~1,426 Supabase sessions with 0 engagement

---

## Google Ads API Data

### Monthly Breakdown by Campaign

| Month | Campaign | Impressions | Clicks | Cost | Conversions |
|-------|----------|-------------|--------|------|-------------|
| Oct 2025 | Keywords | 7,455 | 139 | $1,466 | 12 |
| Oct 2025 | PMax | 38,534 | 610 | $535 | 13 |
| Nov 2025 | Keywords | 10,975 | 189 | $2,375 | 24 |
| Nov 2025 | PMax | 41,316 | 740 | $856 | 17 |
| Dec 2025 | Keywords | 10,093 | 165 | $2,137 | 24 |
| Dec 2025 | PMax | 49,032 | 952 | $852 | 16 |
| Jan 2026 | Keywords | 9,741 | 155 | $1,857 | 26 |
| Jan 2026 | PMax | 44,455 | 816 | $687 | 26 |
| Feb 2026 | Keywords | 5,534 | 73 | $932 | 13 |
| Feb 2026 | PMax | 23,637 | 302 | $254 | 6 |

### Totals

| Campaign | Impressions | Clicks | Cost | Conversions | Conv. Rate |
|----------|-------------|--------|------|-------------|------------|
| **Keywords** | 43,798 | 721 | **$8,767** | 99 | 13.7% |
| **PMax** | 196,974 | 3,420 | **$3,184** | 78 | 2.3% |

PMax reported 78 "conversions" but these were likely accidental form interactions or misattributed events — **none resulted in actual customer contact or revenue**.

---

## Financial Impact

### Before PMax Cleanup (inflated numbers)
- Total Google Ads spend: $12,035 (Keywords + PMax)
- Total ad spend (all platforms): $18,423
- Overall ROAS: 2.87x
- Cost per acquisition: ~$124

### After PMax Cleanup (accurate numbers)
- Total Google Ads spend: $8,767 (Keywords only)
- Total ad spend (all platforms): $15,155
- Overall ROAS: **3.48x**
- Cost per acquisition: **~$102**
- Net profit per acquired customer: **~$135** (up from ~$113)

### Website Traffic Impact
- Original `user_sessions` count had a tracking gap (Dec 11-31 not recorded). Corrected using `page_views` table.
- **Level 1 scrub**: Page-view-based sessions naturally exclude PMax junk (sessions with 0 page views don't appear) → 9,922 sessions
- **Level 2 scrub**: Queried `user_sessions` for gclid sessions with exactly 1 page view (probable PMax fat-finger bounces). Found **412 sessions** (Oct: 0, Nov: 15, Dec: 9, Jan: 338, Feb: 50). Removed from totals.
- **Final scrubbed totals: 9,510 sessions, ~8,523 unique visitors, 11,954 page views**
- These numbers are used in the meeting deck

---

## Why PMax Failed for This Business

Performance Max works well for e-commerce and large brands but is problematic for local service businesses like auto glass because:

1. **Display/YouTube/Discover placements** — ads shown as banner ads on apps and mobile games, leading to accidental taps (especially by children)
2. **No negative keyword control** — can't exclude irrelevant searches
3. **Broad audience targeting** — Google optimizes for clicks, not quality leads
4. **Mobile app placements** — a significant source of accidental clicks
5. **Low-intent surfaces** — Gmail, Discover, and Maps ads reach people not actively searching for windshield repair

---

## Recommendations

1. **Kill the PMax campaign** — it has been burning ~$700-850/month with zero revenue
2. **Reallocate budget to Keywords** — Keywords at $114/lead (vs Microsoft $108/lead) with 99 Supabase-attributed leads has room to scale
3. **Consider Microsoft budget reallocation** — Microsoft at $108/lead but only 29 platform-tracked conversions (vs 59 Supabase leads) — tracking gap makes optimization difficult
4. **Monitor future campaigns** — if testing new Google campaign types, set up quality tracking from day one (session engagement metrics, not just click counts)

---

## Data Cleanup Applied

The Feb 11 meeting deck (`meeting-deck-feb11.html`) has been updated to exclude all PMax data from:
- Slide 2: Executive Summary (spend, ROAS)
- Slide 5: Google Ads Performance (fully rewritten for Keywords only)
- Slide 6: Microsoft Ads (head-to-head comparison updated)
- Slide 7: Website Traffic (sessions, visitors, source breakdown)
- Slide 9: Full Funnel (session numbers, impressions)
- Slide 10: ROI Analysis (all ROAS, CAC, unit economics)
- Slide 11: Opportunities (PMax kill noted as action item)

All "before" numbers are preserved in this document for reference.
