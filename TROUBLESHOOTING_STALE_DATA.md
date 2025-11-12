# Production API Returning Stale Data - Troubleshooting Request

## Problem Summary

The Next.js production API endpoint `/api/admin/calls` is returning stale database data (170 calls from Nov 8) while local queries to the SAME database return current data (194 calls from Nov 12). This is NOT an authentication issue or firewall issue - those have been resolved.

## Environment

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Table:** `ringcentral_calls` (stores call log data from RingCentral API)

## The Core Issue

### What We Observe:

1. **Local queries (using .env.local):**
   - Returns 194 calls
   - Most recent call: `2025-11-12T21:27:21` (today)
   - Query method: `createClient()` with same credentials

2. **Production API (https://pinkautoglass.com/api/admin/calls):**
   - Returns 170 calls
   - Most recent call: `2025-11-08T04:13:05` (4 days ago)
   - Uses EXACT same Supabase URL and service role key

3. **Direct database query (local script):**
   - Returns 194 calls
   - Confirms database HAS the current data

### Test Results:

```bash
# Local test script output:
Total calls in DB: 194
Last call: 11/12/2025, 2:27:21 PM
Most recent call ID: AL-Lv6p9Z2RS-Y1A

# Production API test:
curl https://pinkautoglass.com/api/admin/calls?limit=1000 -u admin:PASSWORD
{
  "total": 170,
  "calls": [...],
  "most_recent": "2025-11-08T04:13:05.316+00:00"
}
```

## Code Involved

### Production API Route
**File:** `/src/app/api/admin/calls/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const supabase = getSupabaseClient();

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = parseInt(searchParams.get('offset') || '0');

  // Fetch calls from database
  const { data: calls, error } = await supabase
    .from('ringcentral_calls')
    .select('*')
    .order('start_time', { ascending: false })
    .range(offset, offset + limit - 1);

  // Get total count
  const { count } = await supabase
    .from('ringcentral_calls')
    .select('*', { count: 'exact', head: true });

  return NextResponse.json({
    ok: true,
    calls: calls || [],
    total: count || 0,
    limit,
    offset,
  });
}
```

### Local Test Script
**File:** `/scripts/check-recent-calls.js`

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRecentCalls() {
  const { data: stats, error: statsError } = await supabase
    .from('ringcentral_calls')
    .select('start_time')
    .order('start_time', { ascending: false });

  console.log(`Total calls in DB: ${stats.length}`);
  console.log(`Last call: ${new Date(stats[0].start_time).toLocaleString()}`);
}
```

## Environment Variables Verification

**Verified that production and local use IDENTICAL credentials:**

```bash
# Local .env.local
NEXT_PUBLIC_SUPABASE_URL=https://fypzafbsfrrlrrufzkol.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs... (220 chars)

# Production (via vercel env pull)
NEXT_PUBLIC_SUPABASE_URL=https://fypzafbsfrrlrrufzkol.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs... (220 chars)

# Debug endpoint confirms production is using correct values:
curl https://pinkautoglass.com/api/admin/debug/env -u admin:PASSWORD
{
  "supabase_url": "https://fypzafbsfrrlrrufzkol.supabase.co",
  "supabase_key_length": 220
}
```

✅ **Credentials are identical**

## Database Configuration

### RLS Policy (from migration `20251030_google_ads_ringcentral_tracking.sql`):

```sql
ALTER TABLE public.ringcentral_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access ringcentral_calls"
    ON public.ringcentral_calls
    FOR ALL TO service_role USING (true) WITH CHECK (true);
```

✅ **Service role has full access** - RLS should not be filtering data

### Table Indexes:

```sql
CREATE INDEX idx_ringcentral_calls_start_time
    ON public.ringcentral_calls(start_time DESC);
```

## Troubleshooting Steps Attempted

### 1. ✅ Verified Credentials Match
- Pulled production env vars with `vercel env pull`
- Compared byte-by-byte: IDENTICAL
- Created debug endpoint to verify production sees correct env vars

### 2. ✅ Ruled Out Authentication Issues
- API returns 200 OK
- Not a 401/403 issue
- Basic Auth working correctly
- `credentials: 'include'` added to frontend

### 3. ✅ Ruled Out Firewall/WAF Blocking
- Created Vercel firewall bypass rules for `/api/admin/*`
- Confirmed with `x-vercel-cache: BYPASS` header
- No more 403 errors

### 4. ✅ Ruled Out Code Differences
- `export const dynamic = 'force-dynamic'` prevents static caching
- No date filtering in query
- Same Supabase client creation method
- Recent deployment (30 mins ago)

### 5. ✅ Ruled Out RLS Filtering
- Policy grants service_role full access with `USING (true)`
- Service role key bypasses RLS by design

### 6. ✅ Verified Database Has Current Data
- Direct local query shows 194 calls
- Most recent: Nov 12, 2025 at 2:27 PM
- Database is being updated correctly

### 7. ❌ Fresh Deployment Did NOT Fix Issue
- Pushed new code
- Cleared `.next` cache
- Production still returns stale data after deployment

## Response Headers Analysis

```
Status: 200 OK
cache-control: public, max-age=0, must-revalidate
x-vercel-cache: BYPASS
x-vercel-id: sfo1::iad1::8gpln-1762983977809-94b1d5964a12
```

- ✅ Not cached by Vercel
- ✅ `max-age=0` means no browser caching
- ✅ `BYPASS` confirms edge cache bypass

## Hypotheses Considered

### ❌ Supabase Connection Pooler Lag
- Tried both port 6543 (pooler) and 5432 (direct)
- Both returned current data locally
- Issue persists in production

### ❌ Supabase Read Replica Lag
- Service role key connects to primary write instance
- No read replicas configured in Supabase (free tier)

### ❌ Build-Time Static Generation
- `export const dynamic = 'force-dynamic'` prevents this
- `export const runtime = 'nodejs'` ensures server-side execution

### ❌ Next.js Data Cache
- No `cache: 'force-cache'` in fetch
- No `revalidate` settings
- Should not cache Supabase client queries

### 🤔 POSSIBLE: Supabase Client Instance Caching
- Maybe the Supabase client is being initialized once and cached?
- Could explain why it sees snapshot from 4 days ago

### 🤔 POSSIBLE: Vercel Edge Network Caching (despite BYPASS header)
- Maybe some intermediate cache we can't see?
- But headers show BYPASS...

## Questions for Troubleshooting

1. **Is there a way the Supabase JavaScript client could be caching query results between requests in a serverless function?**

2. **Could Vercel's serverless function container be reusing a Supabase client instance across requests with stale connection state?**

3. **Is there any difference in how `createClient()` behaves in Vercel's Node.js runtime vs local Node.js?**

4. **Could the issue be with the `getSupabaseClient()` function pattern? Should we create the client differently?**

5. **Is there a Supabase setting (like connection pooling mode) that could cause this 4-day lag?**

6. **Could this be a Supabase project setting (like point-in-time recovery) causing production to see an old snapshot?**

## What We Need Help With

**Primary Question:** Why is the production Vercel deployment seeing data from Nov 8 when the database has data from Nov 12, despite using identical credentials and no caching configuration?

**Specific Areas to Investigate:**
1. Supabase client initialization patterns in serverless environments
2. Vercel serverless function behavior with persistent connections
3. Any hidden caching layers between Vercel and Supabase
4. Potential Supabase connection pooling issues
5. Alternative ways to ensure fresh database queries in production

## Reproduction Steps

1. Deploy this API route to Vercel (Next.js 14 app router)
2. Set Supabase credentials in Vercel env vars
3. Query `/api/admin/calls?limit=1000`
4. Compare count/data with direct database query
5. Observe production returns 4-day-old data

## Expected Behavior

Production API should return same data as local queries (194 calls, most recent from Nov 12)

## Actual Behavior

Production API returns old data (170 calls, most recent from Nov 8)

## Additional Context

- This issue appeared suddenly (around Nov 7-8)
- Database continues to receive new data correctly
- Local development environment works perfectly
- Problem isolated to production Vercel deployment
- No recent changes to database schema or RLS policies
- Same issue persists across multiple fresh deployments

---

**Please help identify why the production Supabase client is seeing stale data and how to fix it.**
