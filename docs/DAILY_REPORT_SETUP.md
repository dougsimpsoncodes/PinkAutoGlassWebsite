# Daily Report System

## Overview

Automated daily business report sent to admin team every morning at 9am Mountain Time with live metrics from:
- RingCentral (phone leads)
- Leads database (web leads)
- Google Ads API (impressions, clicks, spend)

## Schedule

**Trigger:** Every day at 9am Mountain Time (4pm UTC / 16:00 UTC)
**Recipients:** Admin team (configured in `ADMIN_EMAIL` environment variable)
**Delivery Method:** Email via Resend API

## Technical Implementation

### API Endpoint
`/api/cron/daily-report` - Generates and sends the daily report

### Cron Configuration
Located in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-report",
      "schedule": "0 16 * * *"
    }
  ]
}
```

**Schedule breakdown:**
- `0 16 * * *` = Every day at 16:00 UTC
- 16:00 UTC = 9:00am MST (Mountain Standard Time, winter)
- Note: During MDT (summer), this will be 10:00am MT

### Security

The endpoint requires a `CRON_SECRET` for authentication:
- Header: `Authorization: Bearer {CRON_SECRET}`
- Vercel Cron automatically includes this header
- Prevents unauthorized access to the endpoint

### Environment Variables Required

**Vercel Production:**
- `CRON_SECRET` - Security token for cron authentication
- `ADMIN_EMAIL` - Comma-separated list of admin emails
- `RESEND_API_KEY` - Email sending API key
- `FROM_EMAIL` - Sender email address
- `SUPABASE_SERVICE_ROLE_KEY` - Database access
- `NEXT_PUBLIC_SUPABASE_URL` - Database URL
- All Google Ads credentials (CLIENT_ID, CLIENT_SECRET, DEVELOPER_TOKEN, CUSTOMER_ID, REFRESH_TOKEN)

## Report Contents

### Key Metrics
- **Phone Leads:** Unique callers from RingCentral
- **Web Leads:** Form submissions from leads table
- **Ad Impressions:** Total Google Ads impressions
- **Ad Spend:** Total Google Ads spend
- **Ad Clicks:** Total Google Ads clicks

Each metric shows:
- Today's count
- Week-over-week trend (percentage change)
- Up/down indicator with color coding

### Today's Contacts
Lists up to 5 most recent contacts from today:
- Source (phone or web)
- Contact name
- Phone number
- Email address (if available)
- Vehicle information (if available)
- Time of contact

### Date Range
- Compares last 7 days (this week) vs previous 7 days (last week)
- 14 days of historical data analyzed

## Testing

### Local Testing
1. Ensure dev server is running: `npm run dev`
2. Test endpoint with cron secret:
```bash
curl -H "Authorization: Bearer {CRON_SECRET}" \
  http://localhost:3000/api/cron/daily-report
```

### Manual Generation
Run the preview script to generate HTML without sending:
```bash
node scripts/generate-daily-report-preview.js
```

## Monitoring

### Vercel Dashboard
- View cron execution logs in Vercel dashboard
- Check for failures or errors
- Monitor execution frequency

### Email Delivery
- Check admin inboxes for daily report
- Verify metrics match actual data
- Confirm all recipients receiving emails

## Troubleshooting

### Report Not Received
1. Check Vercel cron logs for execution errors
2. Verify `ADMIN_EMAIL` environment variable
3. Check Resend API key is valid
4. Confirm no email bounces/blocks

### Incorrect Data
1. Verify Google Ads API credentials
2. Check Supabase database connectivity
3. Review RingCentral call sync status
4. Check date range calculations

### Authentication Errors
1. Verify `CRON_SECRET` matches in production
2. Check Vercel cron is sending correct header
3. Review endpoint authentication logic

## Maintenance

### Updating Recipients
```bash
vercel env rm ADMIN_EMAIL production -y
vercel env add ADMIN_EMAIL production
# Enter comma-separated emails when prompted
```

### Changing Schedule
1. Edit `vercel.json` cron schedule
2. Commit and push changes
3. Redeploy to production
4. Verify new schedule in Vercel dashboard

### Refresh Token Rotation
Google Ads refresh tokens may expire. To generate a new one:
```bash
node scripts/generate-google-ads-refresh-token.js
# Update GOOGLE_ADS_REFRESH_TOKEN in Vercel
vercel env rm GOOGLE_ADS_REFRESH_TOKEN production -y
vercel env add GOOGLE_ADS_REFRESH_TOKEN production
```

## Files

### Core Implementation
- `src/app/api/cron/daily-report/route.ts` - Main endpoint
- `src/lib/notifications/email.ts` - Email sending functions
- `src/lib/googleAds.ts` - Google Ads API integration
- `vercel.json` - Cron configuration

### Scripts
- `scripts/generate-daily-report-preview.js` - Manual HTML generation
- `scripts/generate-google-ads-refresh-token.js` - OAuth token generation

### API Endpoints
- `/api/cron/daily-report` - Automated report generation
- `/api/google-ads/daily-stats` - Google Ads data aggregation
- `/api/test-google-ads` - Google Ads API connection testing
