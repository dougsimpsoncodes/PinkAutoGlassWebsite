# Discount Rescue Flow — Day-1 Impact Analysis (2026-06-11)

Scope: all production data since launch 2026-06-10 ~14:40 UTC, pulled live from
Supabase + RingCentral message store. ~22 hours of runtime at analysis time.

## Funnel observed (real customers, tests excluded)

| Stage | Count | Verified how |
|---|---|---|
| Quotes priced post-launch | 8 eligible | automated_quotes |
| Rescue offers sent | 7 | notification_events status='sent' |
| Correctly skipped (booked < 15m) | 1 (Erika) | last_error='booked_before_followup' |
| SMS carrier-delivered | 7 / 7 | RingCentral messageStatus='Delivered' |
| Email fallback used | 0 (all SMS-eligible) | customer_email_status='skipped' |
| Rescue page visits | **0** | page_views (table healthy, 200/day; test visit present) |
| Out-of-band calls after offer | 0 | ringcentral_calls join |
| Bookings from offers | 0 | bookings where discount_pct>0 (only the canceled TESTY test) |

All 7 offers fired 15–20 min after quote, between 9:45am–7:45pm Denver. Dedup,
skip logic, snapshot pricing all behaving as designed. **The pipeline is
mechanically healthy; the break is customer engagement with the SMS.**

## The key reframing finding

Historical baseline (May 15 – Jun 10, tests excluded):
- **All 9 bookings happened within 15 minutes of the quote.**
- **Of 41 quotes still unbooked at 15 minutes, ZERO ever booked.**

Implications:
1. The rescue flow targets a population with a **0% historical conversion
   rate**. Every rescue booking is pure incremental revenue; the 10% discount
   cannibalizes nothing (review's open question largely answered by data).
2. 0/7 after one day is fully consistent with that baseline — not a failure
   signal. At ~7 offers/day, even a 5% rescue rate ≈ 2–3 bookings by Jun 24.

## Cohort observations (small n, hold loosely)

- 5 of 7 offers were on **$299 quotes — the price floor**. These are the most
  price-sensitive shoppers; "10% off" (= $29.90) may be losing to competitor
  quotes or a $0-deductible insurance path. Emily's $691 ADAS-heavy quote is
  the same story at higher stakes.
- One SMS, one chance: email fallback never fires (everyone has phones), and
  there is no second touch before the 24h expiry.
- Two offers have market=null (Kristy, Brooke) — minor data-quality wrinkle.

## Recommendations (goal: max bookings, discount price accepted)

1. **Don't redesign yet — instrument and wait.** Volume (~50 offers/wk) gives a
   real read by the Jun 17 comparison week. Add offers-sent / page-visits /
   rescue-bookings to the daily report so this funnel is visible without
   ad-hoc SQL.
2. **Add a second touch before expiry** (~20h mark, "your 10% expires
   tonight"): infra already exists (scheduled_for); doubles the at-bats per
   offer at zero marginal cost. This completes the treatment rather than
   A/B-ing it.
3. **Add a call option to the SMS** ("or call us at … and mention the text").
   Glass customers are phone-first (site history shows it); these 7 didn't
   click but might have called.
4. **Copy candidates for later A/B** (once volume justifies): drop or soften
   the "one install spot left" scarcity line (reads as spam-pattern); lead
   with dollars off ("$30 off — $269 total") instead of "10%", esp. for the
   $299-floor cluster.
5. Watch the insurance path: for high quotes (ADAS), 10% off cash rarely beats
   a $0-deductible claim; rescue copy could eventually branch by quote size.

## Queries / scripts
- `scripts/analyze-discount-rescue.sh` — funnel queries (note: some column
  names corrected inline during analysis; see session)
- `scripts/check-rescue-sms-delivery.mjs` — RingCentral delivery check
