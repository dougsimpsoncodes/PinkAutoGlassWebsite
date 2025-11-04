# RingCentral Webhook Integration - Setup Guide

**Created:** November 5, 2025
**Purpose:** Real-time call data synchronization using webhooks instead of API polling

---

## What Changed

### Before (Manual Polling)
- Call data only updated when manually triggering sync
- Hit RingCentral API rate limits (10 requests/60 seconds)
- 15-30 second delay before calls appeared
- Risk of API suspension from excessive polling

### After (Real-Time Webhooks)
- RingCentral pushes call events instantly when they happen
- No API rate limit concerns
- Database always current
- Dashboard shows real-time data
- Users just click "Refresh" to reload from database

---

## How It Works

```
┌─────────────┐           ┌──────────────┐           ┌──────────────┐
│ RingCentral │  Webhook  │   Vercel     │  Updates  │   Supabase   │
│   (Calls)   │─────────>│   Endpoint   │─────────>│   Database   │
└─────────────┘           └──────────────┘           └──────────────┘
                                                             │
                                                             │ Reads
                                                             ▼
                                                      ┌──────────────┐
                                                      │   Dashboard  │
                                                      │   (Frontend) │
                                                      └──────────────┘
```

**Flow:**
1. Call happens in RingCentral (inbound/outbound)
2. RingCentral sends webhook event to: `https://pinkautoglass.com/api/webhooks/ringcentral`
3. Webhook endpoint processes event and updates Supabase
4. Dashboard reads fresh data from Supabase (no RingCentral API call needed)

---

## Setup Instructions

### Step 1: Run Database Migration

Apply the webhook subscriptions table migration:

```bash
# Using Supabase CLI (if installed)
supabase db push

# OR manually run the SQL in Supabase Dashboard SQL Editor
# File: supabase/migrations/20251105_create_webhook_subscriptions_table.sql
```

**What this does:** Creates `ringcentral_webhook_subscriptions` table to track active webhooks.

### Step 2: Set Environment Variable

Add this to your `.env.local` and Vercel environment variables:

```bash
NEXT_PUBLIC_SITE_URL=https://pinkautoglass.com
```

**Why needed:** Webhook URL must be publicly accessible. RingCentral will call this URL.

### Step 3: Deploy to Production

The webhook endpoint must be live before registering with RingCentral:

```bash
git add .
git commit -m "Add RingCentral webhook integration"
git push origin main
vercel --prod
```

**Important:** Webhooks won't work in local development unless you use a tunnel (ngrok). Production deployment is required.

### Step 4: Register Webhook with RingCentral

Once deployed, register the webhook subscription:

```bash
# Make a POST request to setup endpoint
curl -X POST https://pinkautoglass.com/api/admin/webhooks/setup
```

**Or use the browser:**
- Open: `https://pinkautoglass.com/api/admin/webhooks/setup` in Postman
- Method: `POST`
- Authentication: Use your admin session cookies

**Expected response:**
```json
{
  "ok": true,
  "message": "Webhook subscription created successfully",
  "subscription": {
    "id": "abc123...",
    "status": "Active",
    "webhookUrl": "https://pinkautoglass.com/api/webhooks/ringcentral",
    "eventFilters": ["/restapi/v1.0/account/~/telephony/sessions"],
    "expiresAt": "2030-11-05T..."
  }
}
```

**What this does:**
- Creates webhook subscription in RingCentral
- Validates webhook endpoint is accessible
- Stores subscription info in Supabase
- Subscription lasts ~5 years (auto-configured)

### Step 5: Verify Webhook is Active

Check subscription status:

```bash
curl https://pinkautoglass.com/api/admin/webhooks/setup
```

**Expected response:**
```json
{
  "ok": true,
  "subscriptions": [
    {
      "id": "abc123...",
      "status": "Active",
      "webhookUrl": "https://pinkautoglass.com/api/webhooks/ringcentral",
      "eventFilters": ["/restapi/v1.0/account/~/telephony/sessions"],
      "createdAt": "2025-11-05T...",
      "expiresAt": "2030-11-05T..."
    }
  ]
}
```

### Step 6: Test with Real Call

1. Make a test call from/to your RingCentral number
2. Within seconds, check Vercel logs for webhook event:
```
📞 Webhook event received: { timestamp: '...', event: '/telephony/sessions', uuid: '...' }
✓ Updated call abc-123 - Inbound Accepted
```

3. Refresh dashboard - new call should appear immediately

---

## Endpoint Reference

### 1. Webhook Receiver (Public)
**URL:** `POST /api/webhooks/ringcentral`
**Purpose:** Receives call events from RingCentral
**Authentication:** None (RingCentral validates via headers)

**Event Types Received:**
- Call start (Ringing)
- Call connected (Accepted)
- Call ended (Disconnected)
- All party state changes

### 2. Setup Webhook Subscription (Admin)
**URL:** `POST /api/admin/webhooks/setup`
**Purpose:** Register webhook with RingCentral
**Authentication:** Admin session required

**Response:**
- `subscription.id` - Store this for later reference
- `subscription.expiresAt` - Webhook expiration (5 years)

### 3. Check Subscription Status (Admin)
**URL:** `GET /api/admin/webhooks/setup`
**Purpose:** List all active webhooks
**Authentication:** Admin session required

### 4. Delete Webhook Subscription (Admin)
**URL:** `DELETE /api/admin/webhooks/setup?id=<subscription_id>`
**Purpose:** Remove webhook subscription
**Authentication:** Admin session required

---

## Troubleshooting

### Problem: Webhook validation failed

**Symptoms:**
```
Error: Webhook validation failed
```

**Solution:**
1. Ensure site is deployed to production (not localhost)
2. Verify `NEXT_PUBLIC_SITE_URL` is set correctly
3. Check SSL certificate is valid (webhooks require HTTPS)
4. Ensure endpoint responds within 3 seconds

### Problem: No events being received

**Symptoms:** Calls happening but database not updating

**Solution:**
1. Check webhook subscription is `Active`:
```bash
curl https://pinkautoglass.com/api/admin/webhooks/setup
```

2. Check Vercel logs for webhook events:
```bash
vercel logs --prod
```

3. Verify RingCentral credentials are valid in `.env`

4. Test webhook endpoint directly:
```bash
curl https://pinkautoglass.com/api/webhooks/ringcentral
```

Expected response:
```json
{"ok": true, "message": "RingCentral Webhook Endpoint"}
```

### Problem: Webhook expired

**Symptoms:**
```
subscription.status: "Expired"
```

**Solution:**
Re-register webhook:
```bash
curl -X POST https://pinkautoglass.com/api/admin/webhooks/setup
```

Webhooks last ~5 years by default, but can be renewed anytime.

### Problem: Multiple active subscriptions

**Symptoms:** Getting duplicate webhook events

**Solution:**
1. List all subscriptions:
```bash
curl https://pinkautoglass.com/api/admin/webhooks/setup
```

2. Delete old subscriptions:
```bash
curl -X DELETE "https://pinkautoglass.com/api/admin/webhooks/setup?id=OLD_ID"
```

3. Keep only one active subscription

---

## Maintenance

### Renewing Webhook Subscriptions

Webhooks are set to expire in ~5 years. To renew before expiration:

```bash
# Delete old subscription
curl -X DELETE "https://pinkautoglass.com/api/admin/webhooks/setup?id=OLD_ID"

# Create new subscription
curl -X POST https://pinkautoglass.com/api/admin/webhooks/setup
```

### Monitoring Webhook Health

**Check last sync time:**
- Open Call Analytics dashboard
- Look at "Most Recent Call" timestamp
- Should be current if webhooks are working

**Check Supabase:**
```sql
-- Get most recent calls
SELECT start_time, direction, result, sync_timestamp
FROM ringcentral_calls
ORDER BY start_time DESC
LIMIT 10;

-- Check webhook subscriptions
SELECT subscription_id, status, expiration_time
FROM ringcentral_webhook_subscriptions;
```

**Check Vercel Logs:**
```bash
# See recent webhook events
vercel logs --prod | grep "Webhook event received"
```

---

## Security Notes

### Webhook Endpoint Security

The webhook endpoint (`/api/webhooks/ringcentral`) is public but secured by:

1. **Validation Token:** RingCentral sends validation token during registration
2. **HTTPS Required:** Webhooks only work over secure connections
3. **Event Verification:** Webhook signature can be validated (optional)
4. **Database RLS:** Supabase row-level security protects data

### Permissions Required

**RingCentral App Permissions:**
- CallControl - Required for telephony session notifications
- ReadCallLog - Required for call details
- ReadAccounts - Required for account-level events

**Supabase Permissions:**
- Service role key required for webhook endpoint (can write to database)

---

## Files Created/Modified

### New Files

1. **`src/app/api/webhooks/ringcentral/route.ts`**
   - Public webhook receiver endpoint
   - Processes telephony session events
   - Updates Supabase in real-time

2. **`src/app/api/admin/webhooks/setup/route.ts`**
   - Admin endpoint to manage webhooks
   - Create, check, delete subscriptions
   - Stores subscription metadata

3. **`supabase/migrations/20251105_create_webhook_subscriptions_table.sql`**
   - Database table for webhook metadata
   - Tracks active subscriptions
   - Expiration monitoring

4. **`RINGCENTRAL-WEBHOOK-SETUP.md`** (this file)
   - Complete setup guide
   - Troubleshooting reference
   - Maintenance procedures

### Modified Files

1. **`src/app/admin/dashboard/calls/page.tsx`**
   - Added "Refresh" button (refreshes from database only)
   - Changed "Last Updated" to "Most Recent Call"
   - Added "Updates automatically via webhooks" note
   - Removed manual sync logic (no longer needed)

---

## Migration Path

### Old Manual Sync (Being Replaced)

```
User opens dashboard
  → Frontend calls POST /api/admin/sync/ringcentral
    → Backend calls RingCentral API
      → Fetches last 30 days of calls
        → Stores in Supabase
  → Frontend reads from Supabase
  → Shows data
```

**Problems:**
- Rate limits (10 requests/60 seconds)
- Slow (full 30-day fetch every time)
- Multiple users = API suspension
- 15-30 second data lag

### New Webhook System (Now Active)

```
Call happens in RingCentral
  → RingCentral sends webhook immediately
    → Backend processes event
      → Updates single call in Supabase

User opens dashboard
  → Frontend reads from Supabase
  → Shows real-time data
```

**Benefits:**
- No rate limits (RingCentral pushes to us)
- Instant updates (no 30-day fetch)
- Scales to unlimited users
- Real-time data (< 1 second lag)

---

## Next Steps

After completing setup:

1. ✅ Database migration applied
2. ✅ Environment variables set
3. ✅ Deployed to production
4. ✅ Webhook registered with RingCentral
5. ✅ Test call verified

**Optional Enhancements:**

- Add webhook retry logic for failed events
- Implement webhook signature verification
- Create admin UI for webhook management
- Add Slack notifications for missed calls
- Set up monitoring/alerting for webhook failures

---

**Need Help?**

Check Vercel logs: `vercel logs --prod`
Check Supabase logs: Supabase Dashboard → Logs
Test webhook: `curl https://pinkautoglass.com/api/webhooks/ringcentral`
