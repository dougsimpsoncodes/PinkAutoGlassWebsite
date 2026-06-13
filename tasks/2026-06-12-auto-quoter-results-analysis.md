# Auto-Quoter Results Analysis — Week 1 (2026-06-12)

Scope: production `automated_quotes` + `automated_quote_bookings`, tests excluded,
Denver-tz day boundaries. Reusable pull: `scripts/analyze-quoter-funnel.sh`.

## Headline

The **contact gate went live 2026-06-06 ~7pm Denver** (`automated_quotes.contact_submitted_at`
first non-null). It is the pivotal change of the week.

| Metric | Jun 1–7 | Jun 8–12 (Mon–Fri) | Change |
|---|---|---|---|
| Quotes priced | 52 | 46 | ~flat |
| Contact captured | 3 (6%) | 44 (**96%**) | **16× capture** |
| Bookings (quote_id-joined) | 5 | 12 | +140% |
| **Quote → book rate** | **9.6%** | **26.1%** | **2.7×** |

Quote volume is flat (~10/day). The share converting to a booked job nearly tripled —
same traffic, far better conversion.

## Why it moved

Before the gate, a priced quote left no contact info → no follow-up possible. Now 96%
leave name + phone, which unlocked:

1. **Fast in-session closes.** 9 of 12 bookings this week happened ≤11 min after the quote.
2. **Discount-rescue conversions started.** 3 bookings Jun 11–12, all 10% off, paid
   $304.29 / $279.32 / $374.04 (~$958). Per the 2026-06-11 rescue analysis, this cohort
   (unbooked at 15 min) historically converted at **0%** — so these are pure incremental
   revenue; the discount cannibalizes nothing. Beats the doc's "2–3 by Jun 24" projection
   12 days early.

## Revenue (where tracked)

`accepted_total_cents` capture turned on ~Jun 10, so clean revenue is the last 3 days only:
**7 bookings, $2,335, ~$334 avg ticket.** Week-over-week revenue isn't comparable yet.

## Caveats (hold loosely)

- Small n (12 bookings this week) — directional, not significant.
- This is the **whole quoter system** (organic + paid + satellite), not the paid quoter ad
  in isolation — that read is the **Jun 17** RSA comparison week.
- Jun 1–7 includes a weekend; Jun 8–12 doesn't. The *rate* (26% vs 10%) is volume-independent
  so the comparison holds; raw counts are not apples-to-apples.
- Revenue tracking started mid-window (Jun 10).

## Bottom line

The contact gate moved quote→book from ~10% to ~26%, and the rescue flow is now pulling
revenue from a cohort that used to convert at zero. The quoter-first bet is showing in the
numbers one week in.

**User impact:** a Denver driver with a cracked windshield now sees a real price, leaves their
number in one step, and either books in the same minute or gets a follow-up text with a small
discount — instead of pricing a quote and vanishing with no way for the shop to reach them.
