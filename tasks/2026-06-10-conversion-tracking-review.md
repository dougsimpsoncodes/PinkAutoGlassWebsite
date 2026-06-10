# 2026-06-10 — Conversion Tracking Audit (Google + Microsoft + Site + Admin)

Full-stack audit: code architecture → both platform APIs → live-site tags → synced
tables → admin center. Every number below was pulled live from the APIs or prod DB
on 2026-06-10 evening; nothing is assumed from docs.

## Verdict

The pipeline is fundamentally sound. Spend/click/conversion data in the admin
center matches both platform APIs exactly. Click IDs are captured, offline
uploads are deduplicated correctly (zero double-uploads), and the live site
loads all three tags. Found: 2 value-parity bugs on the Microsoft side, one
landing-page mismatch (fixed during the audit), several structural asymmetries
that are intentional and documented, and minor cleanup items.

## What was verified clean ✅

1. **Synced tables match platform APIs exactly (Jun 3–9, day by day).**
   - `google_ads_daily_performance` vs GAQL: cost to the penny ($225.24/$244.03/$366.48/$321.84/$291.49/$244.08), clicks and conversions identical all 6 active days.
   - `microsoft_ads_daily_performance` vs Reporting API: identical on all days ($31.43/$36.66/$56.41/$21.83/$60.89/$67.90).
   - Admin ROI/funnel pages read these tables → admin center spend/conversion data is accurate.
2. **Live-site tagging (verified via Playwright on pinkautoglass.com):**
   - Google Ads `AW-17667607828`, GA4 `G-F7WMMDK4H4`, UET `343218744` all load and fire page-level requests (doubleclick viewthroughconversion, GA4 collect, bat.bing pageLoad all 200/204).
   - `gclid` capture verified live: landing with a gclid stores it in localStorage with timestamp + landing page.
   - UET tag status per MS API: **Active**, recording conversions.
3. **Offline conversion dedup works.** 114 calls Jun 3–10: 16 uploaded to Google, 8 to Microsoft, **0 uploaded to both** — the one-platform-wins conflict resolution is doing its job.
4. **Client event pipeline healthy** (`conversion_events`, Jun 3–10 real traffic): quote_priced 47, form_submit 42, quote_generated 42, phone_click 32, text_click 16 — with sane gclid/msclkid capture rates on each.
5. **No GA4-import double counting.** The four "Pink Auto Glass Website (web)" GA4-imported actions are HIDDEN status and excluded from the conversions metric.
6. **Counting parity:** every enabled Google action is ONE_PER_CLICK; every MS goal is CountType=Unique. Equivalent.
7. **Test hygiene:** the audit's synthetic gclid produced zero non-test rows.

## Findings (ranked)

### F1 — MS records bookings at $91 instead of $150 (and texts at $47 instead of $55)
Microsoft goals "Quick quote" and "Text_click" use **Revenue Type = FixedValue**
($91 / $47), so the values the UET tag sends ($150 for bookings, $55 for texts)
are overridden. Confirmed in data: Jun 9 Quick quote = 3 conv, $273 = exactly
3×$91, even though one was a booking pushed at $150. Google's equivalent
actions take the pushed value (Submit lead form `alwaysDefault=false` → $150
bookings flow through; Text default $55).
**Impact:** Microsoft undervalues bookings 39% and texts 15% relative to
Google. Harmless under MaxConversions bidding (count-based), but it corrupts
any revenue/ROAS comparison between platforms and will mistrain value-based
bidding if MS ever moves to MaxConversionValue.
**Fix:** change both goals' revenue type to VariableValue (default $91/$55) in
MS Ads UI or via ConversionGoals update API. 5 minutes.

### F2 — Quote signal exists on Google but not Microsoft (intentional, expiring rationale)
Google has "Quote priced (web)" ($20, secondary/observation). The UET tag
pushes the same `quote_generated` event, but **no MS goal catches it** —
deliberate (analytics.ts:398: a new biddable goal would distort MS's
count-based MaxConversions bidding, where a quote would count == a booking).
Correct call today; revisit if MS moves to value-based bidding, since MS Smart
Bidding currently sees nothing about quote behavior.

### F3 — Attribution models differ by platform (platform constraint, not a bug)
Google: all enabled actions use **data-driven attribution** (model 106).
Microsoft: standard goals are **last-click** (MS offers no DDA for this account
type). Lookbacks also differ: Google 90-day click-through (30 for Calls-from-ads
and Quote priced), MS 30-day across all goals. Perfect parity is impossible;
the practical implication is Google will credit more assisted conversions than
MS for the same journey. Document, don't fight.

### F4 — New quoter RSA pointed at a 308 redirect (FIXED during audit)
`/quote` has 301/308-redirected to `/` since the 2026-05-28 homepage-quoter
migration (next.config.js:204). Last night's RSA landed on /quote → every ad
click would have bounced through a redirect (slower, and Google flags it).
**Fixed live:** created replacement ad `812443058767` with final URL
`https://pinkautoglass.com/`, removed `812440528078`. Same copy/pins otherwise.
Memory + measurement docs reference the OLD ad id — superseded by this file.

### F5 — Vercel insights 404 on every page view
`/_vercel/insights/script.js` 404s + MIME-blocks in the console on every page
load (Web Analytics not enabled for the project, but `<Analytics />` is
mounted). Doesn't affect ads tracking. Either enable Web Analytics in Vercel or
remove the component.

### F6 — Dead MS goal "Lead submitted page" (Paused)
URL goal matching `pinkautoglass.com/thank-you*`, paused, NoRecentConversions.
The thank-you page flow no longer exists. Delete to reduce clutter.

### F7 — Phone-call triple-path on Google (working as designed, watch it)
Three primary phone actions: "Phone number clicks" (site click), "Calls from
ads" (call extension), "Offline Phone Call (Click Import)" (RingCentral). Code
prevents click+offline double-counting per call (phone_click match skips the
offline upload), and extension calls never touch the site. Residual risk:
extension call + later site click from the same person counts twice — rare,
accepted.

## Cross-platform event map (as verified)

| Signal | Google action (value) | MS goal (value) | Parity |
|---|---|---|---|
| Phone click on site | Phone number clicks ($55 fixed) | Phone call website click ($55) | ✅ |
| Text click | Text ($55) | Text_click (**$47 fixed** ← F1) | ⚠️ |
| Form/booking | Submit lead form ($91 / $150 variable) | Quick quote (**$91 fixed** ← F1) | ⚠️ |
| Quote priced | Quote priced (web) ($20, secondary) | — (intentional ← F2) | ⚠️ |
| Offline call | Offline Phone Call ($55) | Phone Call (Ring Central) ($55) | ✅ |
| Ad-call extension | Calls from ads ($55) | — (no MS call extensions) | — |

## Recommended actions
1. ~~F1~~ — **DONE 2026-06-10 (panel-approved, Codex+Gemini unanimous):** "Quick quote" and "Text_click" flipped to VariableValue (defaults $91/$55), verified via readback. Reporting-only under MaxConversions; applies going forward — pre-change per-goal numbers snapshotted above. "Phone call website click" left FixedValue $55 deliberately (tag pushes exactly $55, no variance to lose).
2. **F6 deferred to after Jun 24** per Codex's conservative option — deleting the dead paused goal is harmless but there's no upside before the budget decision; do it during the Jun 24 session.
3. **Whenever:** F5 — enable or remove Vercel Web Analytics.
4. **Jun 17 measurement week:** remember reporting uses ad `812443058767` (not the id in older notes).
5. **If MS ever goes value-based bidding:** revisit F2 (create the MS quote goal) and recheck F1 first.
