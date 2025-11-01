# RLS Policy Issue - Quick Fix Guide

## The Problem

Your booking form is failing with this error:
```
"new row violates row-level security policy for table \"leads\""
```

## What's Happening

1. **We switched from service role key to anon key** ✅ (Good for security!)
2. **But RLS policies aren't configured for anonymous users** ❌ 
3. **Anonymous users can't insert leads** = Broken booking form

## Why This Happened

- **Service role key** = Bypasses all security (dangerous but works)
- **Anon key** = Respects RLS policies (secure but needs proper setup)
- **Your RLS policy exists but isn't properly configured for `anon` role**

## The Fix (2 minutes)

### Step 1: Go to Supabase SQL Editor
- Open: https://supabase.com/dashboard/project/ihbhwusdqdcdpvgucvsr/sql

### Step 2: Run This SQL
```sql
-- Fix RLS policy for anonymous booking submissions
DROP POLICY IF EXISTS "Anyone can create leads" ON leads;
CREATE POLICY "Public can create leads" ON leads
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- Grant permissions to anonymous role
GRANT INSERT ON leads TO anon;
GRANT INSERT ON lead_attributions TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
```

### Step 3: Click "Run"

## What This Does

- **Recreates the RLS policy** to explicitly allow public inserts
- **Grants INSERT permission** to the `anon` role (your website users)
- **Allows sequence access** so auto-generated IDs work
- **Maintains security** while enabling legitimate bookings

## Result

✅ **Booking form works again**  
✅ **Rate limiting protects against abuse**  
✅ **File validation prevents malicious uploads**  
✅ **No service role key exposure**  

## Test After Fix

Try submitting a booking at: http://localhost:3002/book

You should see: `{"ok": true, "id": "some-uuid"}` instead of the RLS error.

---

**This is a common security transition issue - you're doing the right thing by using proper authentication instead of the dangerous service role key!**