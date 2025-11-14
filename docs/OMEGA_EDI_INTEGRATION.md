# Omega EDI Integration Guide

**Purpose:** Track quotes and installs from Omega EDI to measure marketing ROI

**Created:** November 13, 2025

---

## Overview

This integration connects your Omega EDI shop management system with your website's lead tracking to answer:

- **How many leads convert to quotes?**
- **How many quotes convert to installs?**
- **What's the total revenue from each marketing channel?**
- **What's the ROI for each Google Ads campaign?**

## Architecture

```
Website Lead → Omega Quote → Omega Install → Revenue
     ↓              ↓              ↓              ↓
  Leads table → omega_quotes → omega_installs → Marketing Reports
```

**Matching Logic:**
- Automatic matching by phone number (exact match)
- Automatic matching by email (exact match)
- Manual matching available in admin dashboard

---

## Setup Instructions

### Step 1: Get Omega EDI API Key

1. Log into Omega EDI: https://app.omegaedi.com
2. Go to Settings → API / Integrations
3. Generate new API key
4. Copy the API key (starts with `ome_...` or similar)

### Step 2: Add API Key to Environment Variables

**Development (.env.local):**
```bash
OMEGA_EDI_API_KEY=your_api_key_here
```

**Production (Vercel):**
```bash
vercel env add OMEGA_EDI_API_KEY production
# Paste your API key when prompted
```

### Step 3: Run Database Migration

```bash
# Apply the Omega integration schema
psql "postgresql://..." -f supabase/migrations/20251113_omega_integration.sql

# Or use Supabase CLI
supabase db push
```

### Step 4: Test the Connection

```bash
curl -u admin:YOUR_ADMIN_PASSWORD \
  "https://pinkautoglass.com/api/admin/sync/omega"
```

**Expected response:**
```json
{
  "configured": true,
  "healthy": true,
  "message": "Omega EDI API connection successful",
  "counts": {
    "quotes": 0,
    "installs": 0,
    "matchedQuotes": 0,
    "matchedInstalls": 0
  }
}
```

### Step 5: Run Initial Sync

Sync last 30 days of data:

```bash
curl -X POST \
  -u admin:YOUR_ADMIN_PASSWORD \
  -H "Content-Type: application/json" \
  -d '{"type":"all","startDate":"2025-10-14","endDate":"2025-11-13"}' \
  "https://pinkautoglass.com/api/admin/sync/omega"
```

**Expected response:**
```json
{
  "success": true,
  "duration_ms": 5234,
  "quotes": {
    "fetched": 45,
    "created": 45,
    "matched": 12,
    "errors": []
  },
  "invoices": {
    "fetched": 38,
    "created": 38,
    "matched": 10,
    "errors": []
  },
  "total": {
    "fetched": 83,
    "created": 83,
    "matched": 22,
    "errors": 0
  }
}
```

---

## Usage

### Manual Sync

**Sync quotes only:**
```bash
curl -X POST \
  -u admin:YOUR_ADMIN_PASSWORD \
  -H "Content-Type: application/json" \
  -d '{"type":"quotes","startDate":"2025-11-01","endDate":"2025-11-13"}' \
  "https://pinkautoglass.com/api/admin/sync/omega"
```

**Sync invoices only:**
```bash
curl -X POST \
  -u admin:YOUR_ADMIN_PASSWORD \
  -H "Content-Type: application/json" \
  -d '{"type":"invoices","startDate":"2025-11-01","endDate":"2025-11-13"}' \
  "https://pinkautoglass.com/api/admin/sync/omega"
```

**Sync everything (quotes + invoices):**
```bash
curl -X POST \
  -u admin:YOUR_ADMIN_PASSWORD \
  -H "Content-Type: application/json" \
  -d '{"type":"all"}' \
  "https://pinkautoglass.com/api/admin/sync/omega"
```

### Automated Daily Sync (Cron Job)

Add to Vercel cron configuration (vercel.json):

```json
{
  "crons": [
    {
      "path": "/api/admin/sync/omega",
      "schedule": "0 6 * * *"
    }
  ]
}
```

This syncs Omega data daily at 6:00 AM UTC (11:00 PM Mountain Time).

---

## Database Tables

### `omega_quotes`
Stores quote data from Omega EDI

**Key Fields:**
- `omega_quote_id` - Omega's quote ID
- `customer_phone`, `customer_email` - For matching
- `quoted_amount`, `total_amount` - Quote value
- `matched_lead_id` - Link to leads table
- `quote_date` - When quote was created

### `omega_installs`
Stores completed job/install data

**Key Fields:**
- `omega_invoice_id` - Omega's invoice ID
- `customer_phone`, `customer_email` - For matching
- `total_revenue` - Job revenue
- `matched_lead_id` - Link to leads table
- `matched_quote_id` - Link to quote
- `install_date` - When job was completed

### `omega_sync_log`
Tracks all sync operations

**Key Fields:**
- `sync_type` - quotes, invoices, or all
- `records_fetched`, `records_created`, `records_matched`
- `started_at`, `completed_at`, `duration_ms`

---

## Reporting Views

### `v_lead_to_revenue`
Complete customer journey from lead to revenue

**Query Example:**
```sql
SELECT
  reference_number,
  firstName,
  lastName,
  phone,
  lead_date,
  quote_date,
  install_date,
  revenue,
  conversion_stage
FROM v_lead_to_revenue
WHERE lead_date >= '2025-11-01'
ORDER BY lead_date DESC;
```

**Output:**
```
| reference_number | firstName | lastName | phone          | lead_date  | quote_date | install_date | revenue  | conversion_stage |
|------------------|-----------|----------|----------------|------------|------------|--------------|----------|------------------|
| PAG-1234         | John      | Smith    | (720) 555-1234 | 2025-11-10 | 2025-11-11 | 2025-11-12   | $450.00  | converted        |
| PAG-1235         | Jane      | Doe      | (303) 555-5678 | 2025-11-11 | 2025-11-11 | NULL         | $0.00    | quoted           |
| PAG-1236         | Bob       | Johnson  | (720) 555-9999 | 2025-11-12 | NULL       | NULL         | $0.00    | lead_only        |
```

### `v_marketing_roi`
Daily marketing performance metrics

**Query Example:**
```sql
SELECT
  date,
  total_leads,
  total_quotes,
  total_installs,
  lead_to_quote_rate,
  lead_to_install_rate,
  total_revenue,
  revenue_per_lead,
  avg_job_value
FROM v_marketing_roi
WHERE date >= '2025-11-01'
ORDER BY date DESC;
```

**Output:**
```
| date       | total_leads | total_quotes | total_installs | lead_to_quote_rate | lead_to_install_rate | total_revenue | revenue_per_lead | avg_job_value |
|------------|-------------|--------------|----------------|--------------------|----------------------|---------------|------------------|---------------|
| 2025-11-12 | 8           | 5            | 3              | 62.50%             | 37.50%               | $1,350.00     | $168.75          | $450.00       |
| 2025-11-11 | 12          | 7            | 4              | 58.33%             | 33.33%               | $1,800.00     | $150.00          | $450.00       |
| 2025-11-10 | 10          | 6            | 5              | 60.00%             | 50.00%               | $2,250.00     | $225.00          | $450.00       |
```

---

## Marketing Attribution Examples

### Example 1: Google Ads ROI

**Scenario:** You spent $138.36 on Google Ads on Nov 12, got 8 leads

**Query:**
```sql
SELECT
  COUNT(l.id) AS leads,
  COUNT(oq.id) AS quotes,
  COUNT(oi.id) AS installs,
  COALESCE(SUM(oi.total_revenue), 0) AS revenue
FROM leads l
LEFT JOIN omega_quotes oq ON l.id = oq.matched_lead_id
LEFT JOIN omega_installs oi ON l.id = oi.matched_lead_id
WHERE DATE(l.created_at) = '2025-11-12';
```

**Result:**
- 8 leads
- 5 quotes (62.5% conversion)
- 3 installs (37.5% conversion)
- $1,350 revenue

**ROI Calculation:**
- Spend: $138.36
- Revenue: $1,350
- Profit: $1,211.64
- ROI: 876% (9.8x return)

### Example 2: Lead Source Performance

**Query:**
```sql
SELECT
  l.source,
  COUNT(DISTINCT l.id) AS leads,
  COUNT(DISTINCT oi.id) AS installs,
  ROUND(
    CAST(COUNT(DISTINCT oi.id) AS DECIMAL) / NULLIF(COUNT(DISTINCT l.id), 0) * 100,
    2
  ) AS conversion_rate,
  COALESCE(SUM(oi.total_revenue), 0) AS total_revenue
FROM leads l
LEFT JOIN omega_installs oi ON l.id = oi.matched_lead_id
WHERE l.created_at >= '2025-11-01'
GROUP BY l.source
ORDER BY total_revenue DESC;
```

**Result:**
```
| source          | leads | installs | conversion_rate | total_revenue |
|-----------------|-------|----------|-----------------|---------------|
| Google Ads      | 50    | 18       | 36.00%          | $8,100        |
| Organic Search  | 30    | 12       | 40.00%          | $5,400        |
| Direct          | 20    | 8        | 40.00%          | $3,600        |
| Referral        | 10    | 3        | 30.00%          | $1,350        |
```

---

## Troubleshooting

### "Omega EDI not configured"

**Solution:** Add `OMEGA_EDI_API_KEY` to environment variables

```bash
vercel env add OMEGA_EDI_API_KEY production
vercel deploy --prod
```

### "Tenant or user not found" (Database)

**Solution:** Check database connection string in `.env.local`

```bash
# Verify NEXT_PUBLIC_SUPABASE_URL matches your Supabase project
grep SUPABASE .env.local
```

### No quotes/installs being matched

**Solution:** Run matching function manually

```sql
SELECT match_omega_to_leads();

-- Check results
SELECT
  COUNT(*) FILTER (WHERE matched_lead_id IS NOT NULL) AS matched,
  COUNT(*) AS total
FROM omega_quotes;
```

### Sync taking too long

**Solution:** Sync smaller date ranges

```bash
# Instead of syncing 30 days at once, sync 7 days at a time
curl -X POST \
  -u admin:YOUR_ADMIN_PASSWORD \
  -H "Content-Type: application/json" \
  -d '{"type":"all","startDate":"2025-11-06","endDate":"2025-11-13"}' \
  "https://pinkautoglass.com/api/admin/sync/omega"
```

---

## Next Steps

1. ✅ Set up Omega API key
2. ✅ Run database migration
3. ✅ Test connection
4. ✅ Run initial sync
5. ⏭️ Set up automated daily sync (cron)
6. ⏭️ Add revenue metrics to admin dashboard
7. ⏭️ Connect to Google Ads reporting

---

## Files Created

- `supabase/migrations/20251113_omega_integration.sql` - Database schema
- `src/lib/omegaEDI.ts` - API client library
- `src/app/api/admin/sync/omega/route.ts` - Sync endpoint
- `docs/OMEGA_EDI_INTEGRATION.md` - This guide

---

## API Reference

### GET /api/admin/sync/omega

Check Omega integration status

**Auth:** Basic auth with admin password

**Response:**
```json
{
  "configured": true,
  "healthy": true,
  "message": "Omega EDI API connection successful",
  "lastSync": {
    "sync_type": "all",
    "started_at": "2025-11-13T14:30:00Z",
    "completed_at": "2025-11-13T14:30:05Z",
    "records_fetched": 83,
    "records_matched": 22
  },
  "counts": {
    "quotes": 145,
    "installs": 98,
    "matchedQuotes": 42,
    "matchedInstalls": 35
  }
}
```

### POST /api/admin/sync/omega

Sync data from Omega EDI

**Auth:** Basic auth with admin password

**Request Body:**
```json
{
  "type": "all",
  "startDate": "2025-11-01",
  "endDate": "2025-11-13"
}
```

**Parameters:**
- `type` - "quotes", "invoices", or "all" (default: "all")
- `startDate` - Optional start date (YYYY-MM-DD)
- `endDate` - Optional end date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "duration_ms": 5234,
  "quotes": {
    "fetched": 45,
    "created": 45,
    "matched": 12,
    "errors": []
  },
  "invoices": {
    "fetched": 38,
    "created": 38,
    "matched": 10,
    "errors": []
  },
  "total": {
    "fetched": 83,
    "created": 83,
    "matched": 22,
    "errors": 0
  }
}
```
