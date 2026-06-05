# 2026-06-04 — Ads Tracking Audit + Quote-Priced Observation Signal

Session goal: verify the post-2026-05-30 attribution rebuild via APIs, then act on the
gaps. Three action items came out of the audit; this log records what shipped.

## Account IDs (reference)
- GA4 property 507414450 · measurement ID `G-F7WMMDK4H4`
- Google Ads `9961188891` (`AW-17667607828`)
- Microsoft UET tag `343218744` · MS account/customer in `.env.local`
- Google campaigns: Denver `23241807298`, Phoenix `23805458143` — both `MAXIMIZE_CONVERSIONS`
- MS campaigns: `PinkAutoGlass` Search (Active, MaxConversions), `Performance-Max-31` (Paused)

## Action Item 1 — Bookings/texts weren't feeding Smart Bidding (DONE)
Root cause: before today only `PHONE_CALL_LEAD / CALL_FROM_ADS` was biddable on the
campaigns. The **$150 booking** (`SUBMIT_LEAD_FORM/WEBSITE`) and text clicks
(`CONTACT/WEBSITE`) were tracked but `biddable=undefined` → invisible to bidding.

Fix (Google Ads API, `campaignConversionGoals.update`): set `biddable=true` for
`SUBMIT_LEAD_FORM~WEBSITE` and `CONTACT~WEBSITE` on both campaigns. Verified post-mutation:
both campaigns now bid on calls + bookings + texts.

> Impact note: this alone substantially meets "optimize toward bookings." The campaigns
> can now learn from the high-intent contact events, not just phone calls.

## Action Item 3 — Remove legacy duplicate "Calls from ads (1)" (PENDING final go)
`Calls from ads (1)` [7513990530] — PHONE_CALL_LEAD, **$10**, primary_for_goal=false,
ENABLED. Fires on the same calls as the real `Calls from ads` [7351179314] ($55),
diluting the phone-call value signal. Google blocks HIDDEN for phone-call actions; only
ENABLED / REMOVED (permanent) are available.

Council (Claude + Codex + Gemini): **unanimous REMOVE**. Awaiting Doug's final go on the
irreversible delete (auto-mode classifier correctly blocked the escalation from the
authorized "pause" to REMOVED without explicit approval).

## Action Item 2 — GA4 funnel explorations (NOT STARTED)
Build two Explorations: (1) quote_generated → purchase, (2) quote_generated → click_to_call.
Requires GA4 Admin API or manual Explore UI build.

## NEW — Quote-priced observation conversion (action live, code wired, NOT deployed)
Premise: lots of quotes, few convert to bookings. A per-quote signal could enrich bidding
data IF the campaigns ever move to value-based bidding.

### Structural finding (the crux for the promote decision)
Both Google campaigns are `MAXIMIZE_CONVERSIONS` = count-based. A $20 quote and a $150
booking each count as **1 conversion**; the value is ignored. So promoting quote_generated
to biddable under MaxConversions would make Smart Bidding chase quotes (≈6–7× more frequent)
equally with bookings. The micro-value approach only works under **Maximize Conversion
Value / tROAS**. MS `PinkAutoGlass` is also MaxConversions — same constraint.

### What shipped today (observation-only, zero bidding impact)
- **Google Ads action** `Quote priced (web)` [7636293598] — category `REQUEST_QUOTE` (15,
  isolated from the biddable booking/contact goals), type WEBPAGE, **$20**
  (always_use_default_value), `primary_for_goal=false`. Label `RRJECN6vorkcEJSayehB`.
  Verified observation-only two ways: (a) secondary action never bids; (b) REQUEST_QUOTE is
  `biddable=undefined` at campaign level on both Denver + Phoenix.
- **Code**: `src/lib/analytics.ts` — `GOOGLE_ADS_QUOTE_LABEL`, `QUOTE_CONVERSION_VALUE_USD=20`,
  `trackQuoteConversion()`, `trackMicrosoftAdsQuoteGenerated()`. `src/lib/tracking.ts` —
  `trackQuoteGeneratedConversion()` now fires the Google + UET observation conversions,
  **gated to the main site** (skipped when `metadata.siteKey` is present, i.e. satellite
  embeds, which run on third-party domains without Pink's gtag/UET). Session-keyed dedup
  `quote_{sessionId}`. NOT yet deployed — code change takes effect on next prod deploy.
- **Microsoft goal: deliberately NOT created.** MS Search campaign is MaxConversions, so a
  new biddable Event goal would distort count-based bidding. The UET push is wired (harmless
  no-op until a goal exists). Create the MS `quote_generated` Event goal only at the
  value-based-bidding switch.

### Scripts
- `scripts/create-google-ads-quote-conversion.js` — creates the REQUEST_QUOTE action (guarded
  against double-create; prints the send_to label). Record of the mutation.

## July 5 decision (scheduled) — NOT "flip biddable"
Re-frame: AI#1 already made bookings/calls/texts biddable, so the stated goal is largely met.
The real either/or:
- (a) Switch both Google campaigns (and MS) to **Maximize Conversion Value / tROAS** AND
  promote quote_generated to biddable — value-weighting makes $20-vs-$150 work. Cost: a
  bidding-strategy change = learning reset on campaigns at ~56 conv/mo.
- (b) Keep quote_generated **observation-only permanently** — RLSA "quoted, didn't book"
  audiences + funnel reporting; never biddable. Plausibly the right long-term answer since
  bookings/calls/texts already bid.
Pull per-market quote→book rates (need ≥30 days of quoter data; quoter went live 2026-06-02)
before deciding. Promote toggle, if chosen: action `primary_for_goal=true` + campaign
`REQUEST_QUOTE biddable=true` on both campaigns + create the MS Event goal.
