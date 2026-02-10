# Beetexting SMS Integration

**Status:** Blocked — waiting on Dan's Beetexting login credentials
**Started:** Feb 9, 2026
**Priority:** High — affects customer SMS experience

---

## The Problem

When Pink Auto Glass sends automated SMS (drip follow-ups, auto-replies, review requests) via the **RingCentral API**, those messages don't appear in **Beetexting** — the app Dan uses daily to manage text conversations with customers.

This creates orphaned conversations: a customer gets an auto-text from our system, replies in Beetexting, and Dan sees the reply but has no context for the original message. He can't respond coherently because the conversation thread is broken.

**Root cause:** RingCentral's programmatic SMS API and Beetexting maintain separate message stores. Messages sent via the RC API bypass Beetexting's conversation management entirely.

**Fix:** Route all outbound SMS through Beetexting's API instead of RingCentral direct. This way every message — automated or manual — lives in one conversation thread that Dan can see and respond to.

---

## What's Already Done

### 1. OAuth Client Created in Beetexting
- **Grant type:** CODE (authorization_code) — CLIENT_CREDENTIALS doesn't work
- **Client ID:** `7bbakgbke16u46sof434h6a8ev`
- **Client Secret & API Key:** stored in `.env.local` and Vercel env vars
- **Redirect URI:** `https://pinkautoglass.com/api/beetexting/callback`
- **Scope:** `https://com.beetexting.scopes/SendMessage`

### 2. OAuth Callback Route Deployed
- **File:** `src/app/api/beetexting/callback/route.ts`
- **URL:** `https://pinkautoglass.com/api/beetexting/callback`
- Exchanges auth code for access + refresh tokens, displays them on screen
- **Temporary** — delete after getting the refresh token

### 3. Environment Variables Set (both .env.local and Vercel)
- `BEETEXTING_CLIENT_ID`
- `BEETEXTING_CLIENT_SECRET`
- `BEETEXTING_API_KEY`
- `BEETEXTING_TOKEN_URL`
- `BEETEXTING_REDIRECT_URI`

### 4. Auth URL Ready to Use
```
https://auth.beetexting.com/oauth2/authorize/?client_id=7bbakgbke16u46sof434h6a8ev&response_type=code&redirect_uri=https://pinkautoglass.com/api/beetexting/callback&scope=https://com.beetexting.scopes/SendMessage
```

---

## What's Blocking Us

The OAuth authorize page at `auth.beetexting.com` requires **Beetexting-native credentials** (email + password). Dan's account only uses "Login with RingCentral" SSO — he has no Beetexting password.

**Dan needs to:** Go to Beetexting, click "Forgot Password" or find account settings, and create a Beetexting-native password. Then give Doug the email + password.

---

## Pickup Steps (once we have Dan's Beetexting credentials)

### Step 1: Complete OAuth Authorization
1. Open a browser and log into Beetexting with Dan's credentials
2. Visit the auth URL above (paste it in the same browser)
3. Approve the authorization when prompted
4. The callback page will display the **access token** and **refresh token**
5. Copy the **refresh token**

### Step 2: Store the Refresh Token
```bash
# Add to .env.local
BEETEXTING_REFRESH_TOKEN=<the-refresh-token>

# Add to Vercel
vercel env add BEETEXTING_REFRESH_TOKEN production
```

### Step 3: Build Beetexting SMS Sender
Create `src/lib/notifications/beetexting.ts`:
- Function to refresh access token using refresh token
- Function to send SMS via Beetexting API (`prodapi.beetexting.com`)
- Token caching (access tokens expire, refresh token is long-lived)

API docs: https://docs.beetexting.com

### Step 4: Swap SMS Routing
Replace RingCentral `sendSMS()` calls with Beetexting in:
- `src/lib/notifications/sms.ts` — the central `sendSMS` function
- Keep RingCentral SDK for receiving inbound SMS (webhook still needed)
- The drip processor, lead API, and webhook auto-reply all call `sendSMS()`, so changing the one function swaps everything

### Step 5: Test
- Send a test SMS through the system
- Verify it appears in Dan's Beetexting conversation view
- Verify customer replies thread correctly

### Step 6: Cleanup
- Delete `src/app/api/beetexting/callback/route.ts`
- Remove the old CLIENT_CREDENTIALS client from Beetexting admin (if still there)
- Optionally remove `BEETEXTING_TOKEN_URL` and `BEETEXTING_REDIRECT_URI` env vars (only needed for OAuth flow)

---

## Architecture After Integration

```
OUTBOUND SMS (auto-reply, drip, review requests):
  sendSMS() → Beetexting API → customer phone
                    ↓
              Shows in Dan's Beetexting app

INBOUND SMS (customer replies):
  Customer → RingCentral → webhook → store in DB + notify admin
                    ↓
              Also shows in Dan's Beetexting app (via RC integration)
```

---

## Files Involved

| File | Role |
|------|------|
| `src/lib/notifications/sms.ts` | Central `sendSMS` — swap RC for Beetexting here |
| `src/lib/notifications/beetexting.ts` | New file — Beetexting API client (to create) |
| `src/lib/drip/processor.ts` | Calls `sendSMS` — no changes needed if sms.ts is swapped |
| `src/app/api/lead/route.ts` | Calls `sendSMS` for auto-reply — no changes needed |
| `src/app/api/webhook/ringcentral/sms/route.ts` | Inbound SMS — keep as-is (RC webhook) |
| `src/app/api/beetexting/callback/route.ts` | Temp OAuth callback — delete after setup |

---

## Related Work (Already Completed)

- **Team member exclusion**: Dan (+13034892228), Kody (+13036567671), Doug (+13104280616) excluded from all auto-responses via `EXCLUDED_DRIP_PHONES` env var
- **Test data cleanup**: All test leads removed from database
