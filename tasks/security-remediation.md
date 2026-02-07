# Security Remediation Plan — Feb 7 2026

## What I Found

All security headers, CORS, and auth live in `src/middleware.ts`. `vercel.json` has secondary headers.
No rate limiting exists. `/api/lead/route.ts` has honeypot + timestamp anti-spam but no IP-based throttling.

---

## Code Changes (I'll make these)

### 1. Remove `unsafe-eval` from CSP (HIGH)
- **File:** `src/middleware.ts:96`
- **Change:** Remove `'unsafe-eval'` from `script-src` directive
- **Risk:** GTM or analytics might break — test after deploy

### 2. Restrict CORS methods (HIGH)
- **File:** `src/middleware.ts:157`
- **Change:** `'GET, POST, PUT, DELETE, OPTIONS'` → `'GET, POST, OPTIONS'`
- No public API route uses PUT or DELETE. Admin APIs already excluded from CORS.

### 3. Fix X-Frame-Options conflict (LOW)
- **File:** `src/middleware.ts:113`
- **Change:** `'SAMEORIGIN'` → `'DENY'`
- Middleware overrides vercel.json's `DENY`. CSP already has `frame-ancestors 'none'`, so DENY is correct.

### 4. Add rate limiting to /api/lead (MEDIUM)
- **New file:** `src/lib/rate-limit.ts` — in-memory IP rate limiter (5 req/60s)
- **Edit:** `src/app/api/lead/route.ts` — add rate limit check at top of POST handler

---

## Manual Actions (You do these in Supabase Dashboard)

### 5. Enable RLS on all tables (CRITICAL)
- I'll generate the full SQL to `tasks/rls-remediation.sql`
- You run it in **Supabase Dashboard → SQL Editor**

### 6. Rotate admin passwords (CRITICAL)
- After RLS is enabled, change all admin passwords (hashes were exposed)

### 7. Disable public signup (MEDIUM)
- Supabase Dashboard → Authentication → Settings → Toggle "Enable sign ups" OFF

---

## Files Modified
- `src/middleware.ts` — CSP, CORS, X-Frame-Options (3 line changes)
- `src/lib/rate-limit.ts` — NEW rate limiter utility
- `src/app/api/lead/route.ts` — add rate limit import + check (4 lines added)
- `tasks/rls-remediation.sql` — NEW SQL script for Supabase
