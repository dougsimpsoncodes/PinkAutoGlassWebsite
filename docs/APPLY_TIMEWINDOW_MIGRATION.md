# Applying timeWindow Enum Migration

## Overview

This guide walks through applying the database migration that updates the `time_preference` enum from `'flexible'` to `'anytime'` to match the UI.

## Prerequisites

- Access to production Supabase project
- Supabase CLI installed (`brew install supabase/tap/supabase`)
- Database connection string (from Supabase Dashboard > Settings > Database)

## Step 1: Run the Migration

### Option A: Using Supabase Dashboard (Recommended)

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/migrations/20251114_update_timewindow_enum.sql`
3. Paste into SQL Editor and run
4. Verify: `SELECT DISTINCT time_preference FROM leads;`

### Option B: Using psql Command Line

```bash
# Set your connection string (from Supabase Dashboard)
export POSTGRES_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Run the migration
psql "$POSTGRES_URL" -f supabase/migrations/20251114_update_timewindow_enum.sql

# Verify
psql "$POSTGRES_URL" -c "SELECT DISTINCT time_preference FROM leads;"
```

Expected output:
```
 time_preference
-----------------
 morning
 afternoon
 anytime
```

## Step 2: Regenerate TypeScript Types

After the migration is applied, regenerate the Supabase types:

```bash
# Set your Supabase project ID (from Dashboard > Settings > General)
export SUPABASE_PROJECT_ID="fypzafbsfrrlrrufzkol"

# Run the regeneration script
chmod +x scripts/regenerate-supabase-types.sh
./scripts/regenerate-supabase-types.sh
```

Or manually:
```bash
supabase login
supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" --schema public > src/types/supabase.ts
```

## Step 3: Verify Changes

1. **Check generated types:**
   ```bash
   grep -A 5 "time_preference" src/types/supabase.ts
   ```

   Should show:
   ```typescript
   time_preference: "morning" | "afternoon" | "anytime"
   ```

2. **Verify code alignment:**
   ```bash
   # Schema validation
   grep "timeWindow:" src/lib/validation.ts
   # Should show: z.enum(['morning', 'afternoon', 'anytime'])

   # UI defaults
   grep "timeWindow.*anytime" src/app/book/page.tsx
   grep "timeWindow.*anytime" src/components/book/contact-location.tsx
   ```

3. **Test booking flow:**
   - Navigate to `/book`
   - Select "Anytime" for time window
   - Submit form
   - Verify in database: `SELECT time_preference FROM leads ORDER BY created_at DESC LIMIT 1;`

## Step 4: Deploy to Production

```bash
# Commit the type changes
git add src/types/supabase.ts
git commit -m "Regenerate Supabase types after timeWindow enum migration"

# Push to production
git push origin main
vercel deploy --prod
```

## Rollback (If Needed)

If issues occur, you can revert the UI to use 'flexible':

```bash
# Revert UI changes
git revert <commit-hash>

# Database remains unchanged (both 'flexible' and 'anytime' are valid in enum)
```

## Troubleshooting

### Error: "invalid_client" when generating types

**Cause:** Not logged into Supabase CLI

**Fix:**
```bash
supabase login
```

### Error: Migration fails with "type does not exist"

**Cause:** Running migration on wrong database or schema

**Fix:** Verify you're connected to the correct Supabase project:
```bash
psql "$POSTGRES_URL" -c "SELECT current_database();"
```

### Error: Types don't include 'anytime'

**Cause:** Migration not applied yet or wrong project ID

**Fix:**
1. Verify migration was applied: `SELECT DISTINCT time_preference FROM leads;`
2. Verify correct project ID: Check Supabase Dashboard
3. Re-run type generation with correct project ID

## Validation Checklist

- [ ] Migration applied to production database
- [ ] `SELECT DISTINCT time_preference FROM leads;` shows 'anytime'
- [ ] TypeScript types regenerated
- [ ] `src/types/supabase.ts` includes `"anytime"` in time_preference
- [ ] UI defaultsto 'anytime' in both booking flows
- [ ] Schema validation accepts 'anytime'
- [ ] Test booking submission successful
- [ ] Production deployment successful

## Notes

- The enum type in PostgreSQL will retain 'flexible' as a valid value (cannot be removed without recreating the enum)
- Existing 'flexible' values in database are automatically migrated to 'anytime'
- New submissions will only use ['morning', 'afternoon', 'anytime']
- This is a non-breaking change - old code continues to work
