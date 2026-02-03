# Lead Auto-Responder & Drip Sequence System

## Task
Build an in-house auto-responder using existing Resend (email) + RingCentral (SMS) with instant auto-reply and timed drip sequences.

## Completed Items

- [x] Database migration: `scheduled_messages` table with indexes, RLS, and auto-cancel trigger
- [x] Time utilities: `isBusinessHours()`, `isTCPAQuietHours()`, `getNextSafeTime()` — all Mountain Time
- [x] Drip scheduler: `scheduleDripSequence()`, `cancelDripForPhone()` for dedup
- [x] Message templates: SMS templates for all quick-quote steps, SMS+email for booking steps
- [x] Message processor: `processScheduledMessages()` with batch processing, retry logic, status checks
- [x] Cron endpoint: `/api/cron/process-drip` with CRON_SECRET auth, runs every 5 minutes
- [x] Modified `/api/lead` route: instant customer SMS + drip scheduling after lead insert
- [x] Modified `/api/booking/submit` route: drip scheduling + phone dedup (cancels prior quote drip)
- [x] Updated `vercel.json`: added process-drip cron schedule
- [x] Build verified: zero type errors in new/modified files, full build succeeds

## Review

### Files Created
- `supabase/migrations/20260131_create_scheduled_messages.sql`
- `src/lib/drip/scheduler.ts`
- `src/lib/drip/templates.ts`
- `src/lib/drip/processor.ts`
- `src/app/api/cron/process-drip/route.ts`

### Files Modified
- `src/app/api/lead/route.ts` — added imports, instant SMS, drip scheduling (~35 lines)
- `src/app/api/booking/submit/route.ts` — added import, drip scheduling + dedup (~20 lines)
- `vercel.json` — added cron entry

### Key Decisions
- `sms_consent` is NOT persisted in the leads table. It's passed into `scheduleDripSequence()` and stored in `context` JSONB on each scheduled_message row.
- The auto-cancel trigger fires on ANY status change from 'new' (DB-level, works regardless of how status changes).
- TCPA compliance is "shift-left": SMS scheduled_for times are pre-adjusted at scheduling time; the cron just processes whatever is due.
- `lead_activities` logging is fire-and-forget since the table may not exist in production.

---

## Next-Day Follow-Up SMS (Jan 31 2026)

### Task
Add a next-day SMS follow-up to all quick quote leads regardless of lead status.

### Completed Items
- [x] Template: `getQuoteFollowupNextDaySMS(ctx)` in `templates.ts` — "Hey {name}, this is Dan at Pink Auto Glass..."
- [x] Template resolver: added `'quote_followup_nextday'` case to `renderTemplate()`
- [x] Scheduler: added step to `QUICK_QUOTE_STEPS` — 15h delay, SMS, sequenceStep 2
- [x] Processor: removed lead status != 'new' filter — sends to all leads regardless of status
- [x] Lead route: calls `scheduleDripSequence()` after instant auto-reply when smsConsent=true
- [x] Cron: changed from `0 14 * * *` to `0 17 * * *` (10 AM MT winter / 11 AM MDT summer)
- [x] Build verified: zero type errors in modified files

### Files Modified
- `src/lib/drip/templates.ts` — added template function + renderTemplate case
- `src/lib/drip/scheduler.ts` — added step to QUICK_QUOTE_STEPS
- `src/lib/drip/processor.ts` — removed status check, removed unused markCancelled
- `src/app/api/lead/route.ts` — added import + scheduleDripSequence call
- `vercel.json` — updated cron schedule

### Timing Logic
- 15h delay from lead submission pushes all business-hours leads into TCPA quiet hours
- `getNextSafeTime()` shifts to 9 AM MT next business day
- Cron at 10 AM MT (0 17 UTC) runs after scheduled messages are due

---

## Inbound SMS Receiving + Reply Capability (Jan 31 2026)

### Task
Enable receiving customer SMS replies via RingCentral webhook + admin reply from the lead detail modal.

### Completed Items
- [x] Export `getRingCentralClient` from `sms.ts` (was module-private)
- [x] Webhook receiver: `/api/webhook/ringcentral/sms` — validation handshake, inbound SMS storage, admin notification
- [x] Reply endpoint: `/api/admin/sms/send` — sends SMS via RC SDK, stores outbound in `ringcentral_sms`
- [x] Conversations endpoint: `/api/admin/sms/conversations` — per-phone thread or inbox view
- [x] Webhook management: `/api/admin/webhook/ringcentral` — POST/GET/DELETE for RC subscriptions
- [x] Lead modal UI: SMS conversation thread with chat bubbles + reply input
- [x] Daily cron webhook renewal: checks subscription expiry, renews if < 2 days remaining
- [x] Build verified: zero new type errors, full build succeeds

### Files Created
- `src/app/api/webhook/ringcentral/sms/route.ts`
- `src/app/api/admin/sms/send/route.ts`
- `src/app/api/admin/sms/conversations/route.ts`
- `src/app/api/admin/webhook/ringcentral/route.ts`

### Files Modified
- `src/lib/notifications/sms.ts` — exported `getRingCentralClient`
- `src/app/admin/dashboard/leads/page.tsx` — added SMSConversation component + imports
- `src/app/api/cron/daily-report/route.ts` — added webhook renewal check

### Prerequisites (Manual)
- Add **SubscriptionWebhook** permission to the RingCentral app in Developer Console
- After deploy, POST to `/api/admin/webhook/ringcentral` to create the subscription

### Verification Steps
1. Deploy to Vercel
2. POST `/api/admin/webhook/ringcentral` to create subscription
3. Send SMS to Pink Auto Glass number from a test phone
4. Confirm: row in `ringcentral_sms`, admin gets forwarded SMS
5. Open lead in admin dashboard, verify conversation shows
6. Reply from the UI, verify customer receives it

---

# Universal Lead Counting: Cleanup & Alignment

## Review Summary

Removed dead lead-counting code from API routes (now computed client-side via `fetchUnifiedLeads()`), aligned daily email report with dashboard counting model, and documented intentional counting differences across pages.

### Phase 1: Dead Code Removal
- [x] **unified/route.ts** — Removed `getLeadMetrics()`, `getCallMetrics()` was replaced by just `getCallMetrics()` (kept for call analytics), removed conversion_events queries, allLeads query, session-based attribution for leads, otherEvents query. Route went from ~8 DB queries to ~2 DB queries + ad API calls.
- [x] **google-ads/route.ts** — Removed `getAttributedLeadMetrics()` call and `leads`/`costPerLead` from response.
- [x] **microsoft-ads/route.ts** — Same cleanup as google-ads.
- [x] **dashboardData.ts** — Removed `getLeadMetrics()` function and `LeadMetrics` interface (zero callers). Removed re-exports of `MIN_CALL_DURATION_SECONDS` and `ATTRIBUTION_WINDOW_MINUTES` (no longer imported from here).
- [x] **Dashboard + ad pages** — Updated TypeScript interfaces and placeholder data to match simplified API responses.

### Phase 2: Daily Email Alignment
- [x] **daily-report/route.ts** — Added `MIN_CALL_DURATION_SECONDS` filter to calls query (excludes hangups/robocalls). Changed `deduplicateCalls()` from session_id dedup to from_number dedup (matches dashboard's per-caller counting).

### Phase 3: Documentation
- [x] **customerDeduplication.ts** — Added comment explaining customer vs lead counting distinction (ROI/Funnel pages).
- [x] **calls/page.tsx** — Added comment explaining this is an operations page, not a lead-counting page.
- [x] **constants.ts** — Added comments explaining lead vs conversion event distinction and constant purposes.

### Verification
- `npm run build` passes with no errors
- All TypeScript types align between API routes and frontend pages

---

# Fix LCP Performance Issue (Core Web Vitals) — Feb 1 2026

## Problem
18 URLs shifted from "Good" to "Need improvement" on Jan 30 due to LCP > 2.5s on mobile. Lighthouse confirmed:
- **Homepage:** LCP 3.0s (score 78)
- **Location/service pages:** LCP 6.5-7.7s (scores 57-61)

Root cause: **6,700ms element render delay** — the H1 (LCP element) couldn't paint until all JS evaluated. Tracking scripts in `<head>` used raw `<script>` tags (not Next.js `<Script>`) so they loaded as render-blocking by default.

## Completed Items
- [x] Converted all tracking scripts from raw `<script>` in `<head>` to `<Script strategy="afterInteractive">` in `<body>`
- [x] Merged MS Consent Mode + UET into single `<Script>` block (guarantees consent loads before UET)
- [x] Merged GA4 config into Google Ads config block (eliminates `gtag()` ordering dependency)
- [x] Removed stale Google Fonts preconnect hints (`next/font/google` self-hosts at build time)
- [x] Security review: no issues (all inline scripts use hardcoded strings, no user input)
- [x] Code review: identified and fixed script ordering fragility by merging dependent script pairs
- [x] Build verified: passes with zero errors
- [x] Lighthouse verified (localhost, eliminates CDN variance):
  - Homepage: Score 93, LCP 2.9s, FCP 0.9s, CLS 0, render-blocking: CSS only
  - /locations/denver-co: Score 84, LCP 2.8s, FCP 1.0s, CLS 0, render-blocking: CSS only

## File Modified
- `src/app/layout.tsx` — script deferral, script merging, preconnect removal

## Commit
- `2495939` — `perf: defer tracking scripts to fix LCP regression (Core Web Vitals)`

## Key Decisions
- `afterInteractive` strategy chosen over `lazyOnload` because analytics events need to fire once users start interacting (form fills, calls). `lazyOnload` would delay tracking until browser is idle, risking missed conversions.
- Merged dependent script pairs into single blocks rather than relying on Next.js DOM-order execution (an implementation detail, not a documented guarantee).
- All analytics call sites in `src/lib/analytics.ts` already guard with `if (window.gtag)` / `if (window.uetq)` null checks, so deferred loading is safe — events before scripts load are simply skipped.

## Post-Deploy Verification (Manual)
- [ ] Monitor Google Ads conversions in real-time reports (24-48h after deploy)
- [ ] Monitor Bing UET in Microsoft Ads dashboard (24-48h after deploy)
- [ ] Check Core Web Vitals in Search Console (7-14 days for CrUX data to update)

---

# Fix: SMS Auto-Reply Broken for All Leads — Feb 2 2026

## Problem
Customer reported never receiving auto-response after submitting a lead form. Investigation revealed **all outbound SMS had been silently failing** — 18 inbound SMS received, 0 outbound ever sent.

## Root Causes (Two Issues)

### 1. Corrupted RingCentral Credentials (Primary)
`RINGCENTRAL_CLIENT_ID` and `RINGCENTRAL_CLIENT_SECRET` in Vercel had `\n"` appended to their values, causing every RingCentral API authentication to fail with `OAU-156: Basic authentication header is missing or malformed`. This meant `sendSMS()` silently returned `false` on every call.

### 2. Wrong FROM Phone Number
`RINGCENTRAL_PHONE_NUMBER` was set to `+17194575397` (Doug's direct Ext 103 line) instead of `+17209187465` (the main company number customers recognize). Per RingCentral docs, sending from the main company number requires:
- The **Fax / SMS recipient** in Auto-Receptionist settings must be set to the authenticated extension
- The JWT must authenticate as that same extension

## Completed Items
- [x] Diagnosed: 0 outbound SMS in `ringcentral_sms` table despite 18 inbound — confirmed global send failure
- [x] Diagnosed: `\n"` corruption on both `CLIENT_ID` and `CLIENT_SECRET` in Vercel env vars
- [x] Fixed: Cleaned `RINGCENTRAL_CLIENT_ID` in Vercel (removed trailing `\n"`)
- [x] Fixed: Cleaned `RINGCENTRAL_CLIENT_SECRET` in Vercel (removed trailing `\n"`)
- [x] Fixed: Changed `RINGCENTRAL_PHONE_NUMBER` from `+17194575397` to `+17209187465` (main company number)
- [x] Fixed: Changed **Fax / SMS recipient** in RingCentral Admin Portal (Auto-Receptionist > General Settings > Call Handling) from Dan Shikiar Ext 101 to Doug Simpson Ext 103
- [x] Verified: SMS sends successfully from main company number `(720) 918-7465`
- [x] Verified: Email auto-reply sends successfully via Resend
- [x] Verified: End-to-end test — lead form submission triggers both SMS and email auto-reply
- [x] Cleaned up: Removed all test leads and scheduled messages from database

## Impact
- **Every lead form SMS auto-reply** had been silently failing since the credentials were corrupted
- **Every inbound text auto-reply** (one-time greeting) had been silently failing
- **Admin SMS notifications** had been silently failing
- Email auto-replies via Resend were unaffected (separate service, clean credentials)

## Prevention
- The `\n"` corruption pattern is documented in `.claude/CLAUDE.md` — env var values must never have literal `\n` appended
- When setting Vercel env vars via CLI, use `printf` not `echo` to avoid trailing newlines

---

# Fix: Conversion Tracking Broken Since Jan 28 — Feb 2 2026

## Problem
Zero conversion events (phone_click, text_click, form_submit) recorded since Jan 28. Dashboard showed 0 leads from Google despite 42 Google Ads visitors with gclid in sessions and 2 callers with matching Google Ads sessions.

## Root Cause
Commit `0d29c23` (Jan 28) added `fbclid: getFbclid()` to the `conversion_events` insert in `src/lib/tracking.ts:482`, but the `conversion_events` table was never given a `fbclid` column. PostgREST rejects inserts with unknown columns, so every conversion event insert silently failed. The error was caught and logged to browser console only.

The `fbclid` column already existed in `user_sessions` and `page_views` (added in an earlier migration), but `conversion_events` was missed.

## Completed Items
- [x] Diagnosed: 0 conversion_events since Jan 28 despite active session and page_view tracking
- [x] Diagnosed: `fbclid` column missing from `conversion_events` (exists in `user_sessions` and `page_views`)
- [x] Diagnosed: `tracking.ts:482` inserts `fbclid` into `conversion_events` — fails silently on every call
- [x] Fixed: Applied migration `add_fbclid_to_conversion_events` — added `fbclid TEXT` column
- [x] Verified: Test insert into `conversion_events` with `fbclid` succeeds
- [x] Verified: Security advisors show no new issues from DDL change

## Analytics Investigation Summary (Feb 2)
- **336 unique visitors** (356 sessions) — accurate, session tracking was unaffected
- **42 Google Ads visitors** (gclid), **9 Microsoft Ads** (msclkid), **285 organic/direct**
- **7 inbound callers** (5 qualifying at 30s+), **1 form lead** (Dan Shikiar, direct visit)
- **3 of 5 qualifying callers** had ad sessions within 5 min: 2 Google, 1 Microsoft
- **1.8% conversion rate** (6 leads / 336 visitors) — within normal range for auto glass
- "0 leads from Google" was a tracking/attribution display issue, not a real zero

## Impact
- **5 days of lost conversion data** (Jan 29 – Feb 2): phone clicks, text clicks, form submissions
- **Call attribution via phone_click matching** broken (relies on conversion_events)
- **Google/Microsoft Ads offline conversion sync** affected (uses conversion_events)
- Session tracking, page views, and analytics events were unaffected

## Prevention
- When adding columns to the tracking insert in `tracking.ts`, verify ALL target tables have the column — not just `user_sessions` and `page_views`, but also `conversion_events`

---

# Fix: Recursive SMS Forwarding Loop — Feb 2 2026

## Problem
SMS webhook handler created an exponential message cascade — 14 messages at 5:00 PM and 15 at 4:28 PM. Database had 117 recursive junk records with nested "Inbound SMS from +17209187465:" prefixes, plus 2 auto-replies the company sent to its own number.

## Root Cause
`sendAdminSMS()` in the webhook handler sends FROM the business number (+17209187465) TO admin extension numbers (+17194575397, +17196531406). RingCentral delivers these internal messages as "Inbound" on the receiving extension, re-triggering the same webhook. Each trigger generates another `sendAdminSMS()` call, creating exponential growth. Additionally, when the webhook processed messages with `fromNumber = +17209187465`, it sent an auto-reply TO the business number (the company texting itself), creating a second recursive path.

## Completed Items
- [x] Diagnosed: 117 recursive "Inbound" records from +17209187465 with nested forwarding prefixes
- [x] Diagnosed: 2 auto-replies sent TO the business number (self-texting)
- [x] Fixed: Added early return guard — skip processing when `fromNumber === BUSINESS_PHONE_NUMBER`
- [x] Cleaned: Deleted 117 recursive inbound records + 2 self-reply records from `ringcentral_sms`
- [x] Build verified: passes with zero errors
- [x] Deployed to production

## File Modified
- `src/app/api/webhook/ringcentral/sms/route.ts` — added `BUSINESS_PHONE_NUMBER` import + guard at line 74

## Commit
- `4c3990b` — `fix: prevent recursive SMS forwarding loop in webhook handler`

## Prevention
- Any webhook that processes inbound messages AND sends outbound messages from the same number must guard against re-triggering itself
- The `sendAdminSMS()` function sends from `RINGCENTRAL_PHONE_NUMBER` which is the same number the webhook listens on — this is inherently recursive without a guard
