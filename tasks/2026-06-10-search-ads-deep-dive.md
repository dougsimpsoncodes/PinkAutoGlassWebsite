# 2026-06-10 — Search Ads Deep-Dive, Fixes, and Baseline Week

Seven-day review (Jun 3-9, the first week of the new plan) plus same-day fixes.
This file is the **before picture** — compare against the week of Jun 17.

## Day-by-day baseline (Jun 3-10)

| Day | Ad Spend | Clicks | Quotes | Priced | Contact | Booked | Calls | Leads | Booked Rev |
|---|---|---|---|---|---|---|---|---|---|
| Wed 3 | $243 | 17 | 6 | 2 | —* | 0 | 7 | 6 | $0 |
| Thu 4 | $281 | 23 | 9 | 5 | —* | 1 | 7 | 9 | $299 |
| Fri 5 | $423 | 31 | 7 | 5 | —* | 1 | 10 | 9 | $312 |
| Sat 6 | $344 | 29 | 10 | 10 | 2 | 2 | 4 | 7 | $622 |
| Sun 7 | $0 (ads dark) | 0 | 1 | 1 | 1 | 0 | 0 | 1 | $0 |
| Mon 8 | $351 | 33 | 4 | 4 | 4 | 1 | 14 | 9 | $427 |
| Tue 9 | $310 | 38 | 13 | 13 | 13 | 3 | 15 | 19 | $1,354 |
| Wed 10† | partial | — | 5 | 4 | 4 | 2 | — | 5 | $665 |
| **Total** | **$1,952** | 171 | **55** | 44 | 24 | **10** | 57 | 65 | **$3,679** |

\* `contact_submitted_at` column added 2026-06-06 — earlier zeros are a measurement artifact.
† Jun 10 ads spend syncs the next morning. Calls = inbound ≥30s. Revenue = booked install value (accepted price).

## Key findings

- **Quote requests +189% WoW** (19 → 55). Quote→book rate 16% — matches the 15% assumption behind the $20 quote-conversion value.
- **Cost per booking fell ~$280 → ~$103** across the week on flat spend; pricing-engine coverage went from ~33% to 100% of quotes priced.
- **Microsoft cost-per-quote-lead $34 vs Google $140** (8 vs 12 quote leads).
- Blended booked ROAS ~1.9x for the week; Jun 9-10 run-rate closer to 3-4x.
- Saturday converts via the quoter even when phones are quiet; Sunday-dark still produced an organic contact-quote.
- Sundays have no ad data by design (ad scheduling) — not a sync gap.
- Watch: calls jumped to 14-15/day Jun 8-9; phone capacity may become the bottleneck before budget does.

## Changes made today (all live)

1. Merged `wip/ads-quote-priced-conversion` — REQUEST_QUOTE observation conversion now firing on price-shown (secondary, $20, session-deduped, satellite-gated). The "Misconfigured" badge on the Request-quote goal is expected until the action is promoted to primary alongside a value-based-bidding move.
2. Microsoft daily budget $50 → $100 (campaign 523490791); Google held steady.
3. Denver (23241807298) QUALIFIED_LEAD goal made biddable (both origins) — Smart Bidding now sees offline answered-call imports.
4. Phrase negative `"$99"` added to Denver — the existing exact-match negative was leaking variants (~$67/wk).
5. Phoenix (23805458143) PAUSED until the auto-quoter is dialed in; relaunch AZ deliberately.
6. Fixed the sync-search-data cron's Microsoft search-terms leg (real report dates, upserts, errors propagate — was silently stale since Jun 2; backfilled).

## Scripts added (`scripts/`)

`conversions-by-action.js`, `ms-campaign-budget.js`, `set-campaign-goal-biddable.js`,
`manage-negative-keyword.js`, `set-campaign-status.js` — all auth via `.env.local`.

## Follow-up dates

- **~Jun 12**: PR2 export-candidate observation gate (`node scripts/compare-export-candidates.js`)
- **Jun 17**: re-run the day-by-day table — first week reflecting today's changes (discount rescue, booking links, quote conversions, MS $100/day, biddable call signal)
- **Jun 24**: Microsoft budget decision — if cost-per-quote-lead holds near $34 at $100/day, shift real budget from Google

## Addendum — 2026-06-10 evening: quoter-led RSA launched

New RSA (ad `812440528078`) added to Denver > Denver Keywords alongside the
phone-first control (`811492665732`, untouched). Lands on `/quote`. Top-3
quote-first headlines pinned to position 1 as a pool; "Carvana-plain" register
chosen by Doug. No insurance angle (cash-pay positioning); lifetime-warranty
headline included; charity moved to one description; phone number dropped from
headlines (policy) — account call asset (720) 918-7465 covers callers.
Consensus process: Claude draft → Codex + Gemini review → Doug sign-off.
Script: `scripts/create-quoter-rsa.js`. NOTE for Jun 17 comparison: creative
mix changed tonight — judge the week as ad+landing-page package, not copy-only.
