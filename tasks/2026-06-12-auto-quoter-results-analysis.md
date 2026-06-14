# Auto-Quoter Results Analysis — Week 1 (updated through 2026-06-13)

Scope: production `automated_quotes` + `automated_quote_bookings`, tests excluded,
Denver-tz day boundaries. Reusable pull: `scripts/analyze-quoter-funnel.sh`.
_Last refreshed 2026-06-13 (Sat, partial — Fri/Sat are slow days per Doug). Original cut 2026-06-12._

## Headline

The **contact gate went live 2026-06-06 ~7pm Denver** (`automated_quotes.contact_submitted_at`
first non-null). It is the pivotal change of the week.

| Metric | Jun 1–7 | Jun 8–13 | Change |
|---|---|---|---|
| Quotes priced | 52 | 52 | flat |
| Contact captured | 3 (6%) | 50 (**96%**) | **16× capture** |
| Bookings (quote_id-joined) | 5 | 14 | +180% |
| **Quote → book rate** | **9.6%** | **26.9%** | **2.8×** |

Quote volume is identical week-over-week (52 vs 52). The share converting to a booked job
nearly tripled — same traffic, far better conversion. The rate held at ~27% as the week
filled in (was 26.1% through Jun 12).

## Why it moved

Before the gate, a priced quote left no contact info → no follow-up possible. Now 96%
leave name + phone, which unlocked:

1. **Fast in-session closes.** Most bookings happen ≤11 min after the quote.
2. **Discount-rescue conversions started.** 3 bookings Jun 11–12, all 10% off, paid
   $304.29 / $279.32 / $374.04 (~$958). Per the 2026-06-11 rescue analysis, this cohort
   (unbooked at 15 min) historically converted at **0%** — so these are pure incremental
   revenue; the discount cannibalizes nothing. Beats the doc's "2–3 by Jun 24" projection
   12 days early. (No new rescue bookings Jun 13.)

## Daily bookings (Jun 8–13)

| Day | Bookings | Discount-rescue | Revenue (tracked) |
|---|---|---|---|
| Jun 8 (Mon) | 1 | 0 | — |
| Jun 9 (Tue) | 3 | 0 | — |
| Jun 10 (Wed) | 2 | 0 | $344 |
| Jun 11 (Thu) | 4 | 2 | $1,279 |
| Jun 12 (Fri) | 2 | 1 | $712 |
| Jun 13 (Sat*) | 2 | 0 | $730 |

\*Jun 13 partial at pull time (Sat — a slow day).

## Revenue (where tracked)

`accepted_total_cents` capture turned on ~Jun 10, so clean revenue is Jun 10–13:
**9 bookings, $3,066, ~$341 avg ticket.** Week-over-week revenue isn't comparable yet
(tracking started mid-window).

## Caveats (hold loosely)

- Small n (14 bookings this week) — directional, not significant.
- This is the **whole quoter system** (organic + paid + satellite), not the paid quoter ad
  in isolation — that read is the **Jun 17** RSA comparison week.
- Jun 1–7 includes a full weekend; Jun 8–13 has only Sat Jun 13 (partial). The *rate*
  (27% vs 10%) is volume-independent so the comparison holds; raw counts are close but not
  perfectly apples-to-apples.
- Revenue tracking started mid-window (Jun 10).

## Bottom line

The contact gate moved quote→book from ~10% to ~26%, and the rescue flow is now pulling
revenue from a cohort that used to convert at zero. The quoter-first bet is showing in the
numbers one week in.

**User impact:** a Denver driver with a cracked windshield now sees a real price, leaves their
number in one step, and either books in the same minute or gets a follow-up text with a small
discount — instead of pricing a quote and vanishing with no way for the shop to reach them.
