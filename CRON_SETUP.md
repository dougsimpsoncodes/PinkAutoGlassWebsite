# Automated Data Sync - Cron Jobs Setup

## Overview

This application uses Vercel Cron Jobs to automatically sync data from:
- **Google Ads** (every 6 hours)
- **Bing Ads** (every 6 hours)
- **Google Search Console** (daily at 2am UTC)
- **RingCentral** (every hour)
- **Attribution Matching** (daily at 3am UTC)

## Cron Job Schedule

| Job | Endpoint | Schedule | Description |
|-----|----------|----------|-------------|
| Google Ads Sync | `/api/cron/sync-google-ads` | `0 */6 * * *` | Syncs last 7 days of Google Ads performance data |
| Bing Ads Sync | `/api/cron/sync-bing-ads` | `0 */6 * * *` | Syncs last 7 days of Microsoft Advertising data |
| Search Console Sync | `/api/cron/sync-search-console` | `0 2 * * *` | Syncs organic search data (accounts for 3-day delay) |
| RingCentral Sync | `/api/cron/sync-ringcentral` | `0 * * * *` | Syncs recent call records hourly |
| Attribution Matching | `/api/cron/run-attribution` | `0 3 * * *` | Runs attribution algorithm for last 30 days |

## Setup Instructions

### 1. Set CRON_SECRET Environment Variable

The cron endpoints are protected by a secret token to prevent unauthorized access.

**In Vercel Dashboard:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add a new variable:
   - **Name:** `CRON_SECRET`
   - **Value:** Generate a random secret (use `openssl rand -base64 32` or similar)
   - **Environment:** Production, Preview, Development (select all)

**Example:**
```bash
# Generate a secure random secret
openssl rand -base64 32
```

Save this value as `CRON_SECRET` in Vercel.

### 2. Set NEXT_PUBLIC_SITE_URL

Cron jobs need to know your site URL to call the sync endpoints.

**In Vercel Dashboard:**
1. Add environment variable:
   - **Name:** `NEXT_PUBLIC_SITE_URL`
   - **Value:** `https://your-domain.com` (your production domain)
   - **Environment:** Production

### 3. Deploy to Vercel

The cron jobs are configured in `vercel.json` and will be automatically registered when you deploy.

```bash
# Deploy to Vercel
vercel --prod
```

### 4. Verify Cron Jobs

After deployment:

1. Go to Vercel Dashboard → Your Project → Cron
2. You should see all 5 cron jobs listed:
   - sync-google-ads
   - sync-bing-ads
   - sync-search-console
   - sync-ringcentral
   - run-attribution

### 5. Monitor Cron Execution

**View Logs:**
1. Vercel Dashboard → Your Project → Logs
2. Filter by "cron" to see cron job executions
3. Look for these log messages:
   - `⏰ Cron job started: sync-google-ads`
   - `✅ Cron job completed: sync-google-ads`
   - `❌ Cron job failed:` (if errors occur)

**Manual Testing:**

You can manually trigger a cron job for testing:

```bash
curl -X GET https://your-domain.com/api/cron/sync-google-ads \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Troubleshooting

### Cron Job Returns 401 Unauthorized

**Problem:** CRON_SECRET is missing or incorrect.

**Solution:**
1. Check that `CRON_SECRET` is set in Vercel environment variables
2. Ensure it's deployed to the correct environment (Production)
3. Redeploy after adding the secret

### Cron Job Returns 500 Error

**Problem:** API sync endpoint failed (credentials, API limits, etc.)

**Solution:**
1. Check Vercel logs for detailed error messages
2. Verify API credentials are set (Google Ads, Bing Ads, RingCentral)
3. Check API quotas and rate limits
4. Run manual sync via admin dashboard to test

### Cron Jobs Not Running

**Problem:** Cron jobs not registered in Vercel.

**Solution:**
1. Ensure `vercel.json` includes the `crons` configuration
2. Redeploy the project
3. Check Vercel Dashboard → Cron to see if jobs are registered

### Data Not Syncing

**Problem:** Cron runs but data doesn't appear in database.

**Solution:**
1. Check database migrations are run (see `MIGRATION_INSTRUCTIONS.md`)
2. Verify Supabase credentials are correct
3. Test manual sync via admin dashboard
4. Check for errors in Vercel logs

## API Credentials Required

For cron jobs to work, you need these credentials set in Vercel:

### Google Ads
- `GOOGLE_ADS_DEVELOPER_TOKEN`
- `GOOGLE_ADS_CLIENT_ID`
- `GOOGLE_ADS_CLIENT_SECRET`
- `GOOGLE_ADS_REFRESH_TOKEN`
- `GOOGLE_ADS_CUSTOMER_ID`

### Bing Ads (Microsoft Advertising)
- `MICROSOFT_ADS_CLIENT_ID`
- `MICROSOFT_ADS_CLIENT_SECRET`
- `MICROSOFT_ADS_REFRESH_TOKEN`
- `MICROSOFT_ADS_DEVELOPER_TOKEN`
- `MICROSOFT_ADS_CUSTOMER_ID`

### Google Search Console
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_SEARCH_CONSOLE_SITE_URL`

### RingCentral
- `RINGCENTRAL_CLIENT_ID`
- `RINGCENTRAL_CLIENT_SECRET`
- `RINGCENTRAL_JWT_TOKEN`
- `RINGCENTRAL_SERVER_URL`

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Cron Schedule Explanation

**Google Ads & Bing Ads (Every 6 hours):**
- Runs at: 12am, 6am, 12pm, 6pm UTC
- Syncs last 7 days to catch any data updates
- Ensures dashboards have fresh data throughout the day

**Search Console (Daily at 2am UTC):**
- Accounts for 2-3 day data delay from Google
- Syncs last 7 days to ensure complete data
- Low-traffic time to minimize resource usage

**RingCentral (Every hour):**
- Real-time call tracking
- Critical for call attribution
- Hourly sync ensures minimal delay

**Attribution Matching (Daily at 3am UTC):**
- Runs after data syncs complete
- Matches calls to campaigns using latest data
- Processes last 30 days to update attribution confidence

## Cost Considerations

**Vercel Cron Jobs:**
- Hobby Plan: 1 cron job
- Pro Plan: Unlimited cron jobs
- You need **Pro Plan** for all 5 cron jobs

**Alternative:** If on Hobby plan, combine jobs:
- Create a single cron endpoint that runs all syncs sequentially
- Schedule once daily

## Next Steps

After cron jobs are running:

1. ✅ Monitor first few executions in Vercel logs
2. ✅ Check dashboards to confirm data is syncing
3. ✅ Set up alerts for failed cron jobs (optional)
4. ✅ Adjust schedules if needed based on your data refresh needs

---

**Questions?** Check the logs first, then review API credentials and database migrations.
