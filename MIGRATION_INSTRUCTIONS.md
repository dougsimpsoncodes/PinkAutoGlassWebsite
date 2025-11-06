# Running Database Migrations

## Issue with CLI
The Supabase CLI `db push` command requires authentication that's failing with the pooler connection. The **recommended approach** for production databases is to use the Supabase Dashboard SQL Editor.

## ✅ Recommended: Dashboard SQL Editor

### Step-by-Step:

1. **Open Supabase SQL Editor:**
   https://supabase.com/dashboard/project/fypzafbsfrrlrrufzkol/sql/new

2. **Run each migration in order** (copy/paste and click "Run"):

   **Migration 1:** Attribution fields for calls
   ```bash
   # Copy from: supabase/migrations/20251106_add_call_attribution_fields.sql
   ```

   **Migration 2:** Microsoft Ads tables
   ```bash
   # Copy from: supabase/migrations/20251106_create_microsoft_ads_tables.sql
   ```

   **Migration 3:** Google Search Console tables
   ```bash
   # Copy from: supabase/migrations/20251106_create_google_search_console_tables.sql
   ```

   **Migration 4:** Restore UTM fields to leads
   ```bash
   # Copy from: supabase/migrations/20251106_restore_utm_fields_to_leads.sql
   ```

   **Migration 5:** Add CRM fields
   ```bash
   # Copy from: supabase/migrations/20251106_add_crm_fields_to_leads.sql
   ```

3. **Verify migrations ran successfully:**
   - Check for green success messages
   - Ignore "already exists" warnings (these are safe)

## Alternative: CLI (If You Have Credentials)

If you want to use the CLI, you need to:

```bash
# 1. Login to Supabase
supabase login

# 2. Link to project (will prompt for database password)
supabase link --project-ref fypzafbsfrrlrrufzkol

# 3. Push migrations
supabase db push
```

**Note:** The database password is NOT the service role key. It's a separate password you set when creating the project. You can reset it from:
https://supabase.com/dashboard/project/fypzafbsfrrlrrufzkol/settings/database

## Why Dashboard is Better

- No authentication issues
- Can see results immediately
- Can rollback easily if needed
- Official Supabase recommendation for production
- Works with pooler connections

## After Migrations

Once complete, the following will be ready:
- ✅ Call attribution tracking
- ✅ Microsoft Ads integration tables
- ✅ Google Search Console tables
- ✅ UTM parameter tracking on leads
- ✅ Revenue tracking fields

Then we can continue with:
- Attribution matching algorithm
- Form handler updates
- Funnel dashboard
