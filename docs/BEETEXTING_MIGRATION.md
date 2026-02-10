# Beetexting SMS Migration

**Status:** Phase 1 complete (customer SMS disabled). Phase 2 pending (Beetexting integration).
**Date:** Feb 10, 2026

---

## Why Customer SMS Is Disabled

RingCentral programmatic SMS (our auto-replies) don't appear in Beetexting, Dan's SMS management tool. This caused:

- Customers receive auto-reply texts Dan can't see
- Customer replies land in Beetexting with no thread context
- Dan may re-quote at a different price or ask questions already answered
- Drip follow-ups can conflict with Dan's manual texts

**Decision:** Disable all customer-facing SMS until we route through Beetexting API.

---

## What's Currently Disabled

All customer-facing SMS is gated by `ENABLE_CUSTOMER_SMS=false`:

| Message | File | What happens now |
|---------|------|-----------------|
| Instant SMS (quote form) | `src/app/api/lead/route.ts` | Skipped, logged |
| Drip follow-up SMS | `src/lib/drip/processor.ts` | Marked `skipped` reason: `customer_sms_disabled` |
| Inbound SMS auto-reply | `src/app/api/webhook/ringcentral/sms/route.ts` | Skipped (lead creation + admin forward still work) |
| Review request SMS | `src/lib/drip/scheduler.ts` | SMS rows not inserted (email rows still created) |

## What Still Works

| Message | Channel |
|---------|---------|
| Instant email auto-reply (quote form) | Email (Resend) |
| Review request email (job complete) | Email (Resend) |
| Admin SMS notifications (lead alerts to Dan) | SMS (RingCentral) |
| Admin email notifications | Email (Resend) |
| Lead creation in database | Supabase |
| Inbound SMS storage + admin forwarding | Supabase + RingCentral |

---

## How to Re-Enable Customer SMS

### Quick re-enable (same RingCentral path)
If you need SMS back immediately without Beetexting:

1. Set `ENABLE_CUSTOMER_SMS=true` in Vercel env vars (Settings > Environment Variables)
2. Redeploy: `vercel --prod` or push to main
3. Done. No code changes needed.

**Warning:** This re-enables the ghost message problem. Only do this if Beetexting is no longer in use.

### Proper re-enable (via Beetexting)
See "Phase 2" below.

---

## Phase 2: Beetexting Integration

### What Dan Needs To Do

1. **Get a Beetexting-native password**
   - Dan currently logs into Beetexting via RingCentral SSO
   - He needs a username/password login for the OAuth flow
   - Options: Contact Beetexting support, or use "Forgot Password" on the Beetexting login page
   - The email address associated with his Beetexting account should receive the reset link

2. **Complete the OAuth authorization**
   - Log into Beetexting in a browser using the native credentials
   - In the **same browser session**, visit:
     ```
     https://auth.beetexting.com/oauth2/authorize/?client_id=7bbakgbke16u46sof434h6a8ev&response_type=code&redirect_uri=https://pinkautoglass.com/api/beetexting/callback&scope=https://com.beetexting.scopes/SendMessage
     ```
   - Click "Authorize" when prompted
   - A page will display the **refresh token** — copy it and send it to Doug/dev team

3. **That's it from Dan's side.** The dev team handles everything else.

### What The Dev Team Builds

After receiving the refresh token:

1. **Store refresh token:** Add `BEETEXTING_REFRESH_TOKEN` to Vercel env vars
2. **Build Beetexting SMS client:** `src/lib/notifications/beetexting.ts`
   - Token refresh logic (access tokens expire, refresh token is long-lived)
   - `sendSMS()` function matching current `SMSOptions` interface
   - API base: `https://prodapi.beetexting.com`
3. **Swap SMS provider:** Update `src/lib/notifications/sms.ts` to route through Beetexting
4. **Set `ENABLE_CUSTOMER_SMS=true`** in Vercel env vars
5. **Test end-to-end:** Submit test lead, verify SMS appears in Dan's Beetexting thread
6. **Delete callback route:** Remove `src/app/api/beetexting/callback/route.ts` (one-time use)

### Already Completed

- [x] OAuth callback route deployed at `/api/beetexting/callback`
- [x] Beetexting env vars configured: `BEETEXTING_CLIENT_ID`, `BEETEXTING_CLIENT_SECRET`, `BEETEXTING_API_KEY`, `BEETEXTING_TOKEN_URL`, `BEETEXTING_REDIRECT_URI`
- [x] API research: endpoint, auth flow, send scope documented
- [x] Customer SMS kill switch implemented (`ENABLE_CUSTOMER_SMS`)

### Env Vars Reference

| Var | Value | Set? |
|-----|-------|------|
| `BEETEXTING_CLIENT_ID` | `7bbakgbke16u46sof434h6a8ev` | Yes |
| `BEETEXTING_CLIENT_SECRET` | [configured in Vercel] | Yes |
| `BEETEXTING_API_KEY` | [configured in Vercel] | Yes |
| `BEETEXTING_TOKEN_URL` | `https://auth.beetexting.com/oauth2/token/` | Yes |
| `BEETEXTING_REDIRECT_URI` | `https://pinkautoglass.com/api/beetexting/callback` | Yes |
| `BEETEXTING_REFRESH_TOKEN` | Pending Dan's OAuth authorization | **No** |
| `ENABLE_CUSTOMER_SMS` | `false` | Yes |

---

## Code Locations

The `ENABLE_CUSTOMER_SMS` flag is checked in these files:

| File | Function | What it gates |
|------|----------|--------------|
| `src/lib/constants.ts` | `isCustomerSmsEnabled()` | Flag definition |
| `src/app/api/lead/route.ts` | POST handler | Instant SMS auto-reply |
| `src/lib/drip/processor.ts` | `processScheduledMessages()` | Drip SMS sending |
| `src/lib/drip/scheduler.ts` | `scheduleDripSequence()` | Drip SMS row creation |
| `src/lib/drip/scheduler.ts` | `scheduleReviewRequest()` | Review SMS row creation |
| `src/app/api/webhook/ringcentral/sms/route.ts` | POST handler | Inbound SMS auto-reply |
