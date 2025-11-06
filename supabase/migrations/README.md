# Database Migrations

## Running Migrations

### Option 1: Supabase Dashboard (Easiest)
1. Go to https://supabase.com/dashboard/project/fypzafbsfrrlrrufzkol/sql/new
2. Copy contents of each migration file (in date order)
3. Click "Run" to execute

### Option 2: Command Line
```bash
# Source environment variables
source .env.local

# Run each migration
psql "$POSTGRES_URL" -f supabase/migrations/20251106_add_call_attribution_fields.sql
psql "$POSTGRES_URL" -f supabase/migrations/20251106_create_microsoft_ads_tables.sql
psql "$POSTGRES_URL" -f supabase/migrations/20251106_create_google_search_console_tables.sql
psql "$POSTGRES_URL" -f supabase/migrations/20251106_restore_utm_fields_to_leads.sql
psql "$POSTGRES_URL" -f supabase/migrations/20251106_add_crm_fields_to_leads.sql
```

## Recent Migrations (2025-11-06)

### 1. add_call_attribution_fields.sql
Adds attribution tracking to RingCentral calls:
- `attribution_method` - How call was attributed (direct_match, time_correlation, unknown)
- `attribution_confidence` - Confidence score 0-100
- `ad_platform` - Platform that drove call (google, bing, organic, direct)

### 2. create_microsoft_ads_tables.sql
Creates Microsoft Advertising (Bing) performance tables:
- `microsoft_ads_daily_performance` - Campaign metrics by date
- `microsoft_ads_keyword_performance` - Keyword-level data
- `microsoft_ads_search_terms` - Search queries that triggered ads

### 3. create_google_search_console_tables.sql
Creates Google Search Console organic performance tables:
- `google_search_console_performance` - Page-level metrics
- `google_search_console_queries` - Search queries showing site
- `google_search_console_daily_totals` - Aggregated daily totals for funnel

### 4. restore_utm_fields_to_leads.sql
Restores marketing attribution fields to leads table:
- UTM parameters (source, medium, campaign, term, content)
- Click IDs (gclid for Google, msclkid for Bing)
- `website_session_id` for journey tracking
- `ad_platform` for quick filtering
- `first_contact_method` for deduplication (call vs form)

### 5. add_crm_fields_to_leads.sql
Adds revenue tracking fields for ROI calculation:
- `quote_amount` - Quoted price
- `close_date` - When deal closed
- `revenue_amount` - Actual revenue from completed job
- `notes` - General lead notes

## Purpose: Three-Metric Funnel

These migrations enable tracking:
**Impressions → Clicks → Unique Customers**

Across three channels:
- Google Ads (paid)
- Bing Ads (paid)
- Google Organic (SEO)

With unified customer deduplication (calls + forms by phone number).
