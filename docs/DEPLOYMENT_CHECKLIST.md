# Security Hardening Deployment Checklist

**Date:** 2025-11-14
**Version:** Security Hardening v2 - Defense-in-Depth

---

## Pre-Deployment Validation

### 1. Database Migration

**File:** `supabase/migrations/20251114_update_timewindow_enum.sql`

- [ ] **Connect to production database**
  ```bash
  export POSTGRES_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
  ```

- [ ] **Run migration**
  ```bash
  psql "$POSTGRES_URL" -f supabase/migrations/20251114_update_timewindow_enum.sql
  ```

- [ ] **Verify migration succeeded**
  ```bash
  psql "$POSTGRES_URL" -c "SELECT DISTINCT time_preference FROM leads;"
  ```
  Expected output: `morning`, `afternoon`, `anytime` (not `flexible`)

- [ ] **Verify data backfill**
  ```bash
  psql "$POSTGRES_URL" -c "SELECT COUNT(*) FROM leads WHERE time_preference = 'flexible';"
  ```
  Expected: `0` (all migrated to `anytime`)

---

### 2. Regenerate TypeScript Types

- [ ] **Set project ID**
  ```bash
  export SUPABASE_PROJECT_ID="fypzafbsfrrlrrufzkol"  # Your project ref
  ```

- [ ] **Run type generation**
  ```bash
  chmod +x scripts/regenerate-supabase-types.sh
  ./scripts/regenerate-supabase-types.sh
  ```

- [ ] **Verify types updated**
  ```bash
  grep -A 3 "time_preference" src/types/supabase.ts
  ```
  Should show: `"morning" | "afternoon" | "anytime"`

- [ ] **Commit updated types**
  ```bash
  git add src/types/supabase.ts
  git commit -m "Regenerate Supabase types after timeWindow enum migration"
  ```

---

### 3. Local Build Validation

- [ ] **Clean build**
  ```bash
  rm -rf .next
  npm run build
  ```
  Expected: Build succeeds with no errors

- [ ] **Verify security validations present**
  - Build logs show: "⏭️  Skipping API key validation during build phase"
  - No errors about missing credentials (dev mode)

- [ ] **Test middleware Edge compatibility**
  ```bash
  # Start dev server
  npm run dev

  # In another terminal, test Basic Auth
  curl -i http://localhost:3000/admin
  ```
  Expected: `401 Unauthorized` with `WWW-Authenticate: Basic` header

---

### 4. Authentication Layer Testing

#### Basic Auth (Layer 1)

- [ ] **Test /admin without credentials**
  ```bash
  curl -i http://localhost:3000/admin
  ```
  Expected: `401 Unauthorized`

- [ ] **Test /admin with wrong credentials**
  ```bash
  curl -i -u "wrong:credentials" http://localhost:3000/admin
  ```
  Expected: `401 Unauthorized`

- [ ] **Test /admin with valid credentials**
  ```bash
  curl -i -u "$ADMIN_USERNAME:$ADMIN_PASSWORD" http://localhost:3000/admin
  ```
  Expected: `200 OK`

#### API Key Auth (Layer 2)

- [ ] **Test /api/admin/* without API key**
  ```bash
  curl -i -u "$ADMIN_USERNAME:$ADMIN_PASSWORD" \
    http://localhost:3000/api/admin/leads?limit=1
  ```
  Expected: `401` with `"code": "INVALID_API_KEY"`

- [ ] **Test /api/admin/* with public API key (insufficient permissions)**
  ```bash
  curl -i -u "$ADMIN_USERNAME:$ADMIN_PASSWORD" \
    -H "x-api-key: $NEXT_PUBLIC_API_KEY" \
    http://localhost:3000/api/admin/leads?limit=1
  ```
  Expected: `403` with `"code": "INSUFFICIENT_PERMISSIONS"`

- [ ] **Test /api/admin/* with admin API key**
  ```bash
  curl -i -u "$ADMIN_USERNAME:$ADMIN_PASSWORD" \
    -H "x-api-key: $API_KEY_ADMIN" \
    http://localhost:3000/api/admin/leads?limit=1
  ```
  Expected: `200 OK` with lead data

#### CORS Restriction

- [ ] **Verify admin APIs don't have CORS headers**
  ```bash
  curl -i -H "Origin: https://example.com" \
    -u "$ADMIN_USERNAME:$ADMIN_PASSWORD" \
    -H "x-api-key: $API_KEY_ADMIN" \
    http://localhost:3000/api/admin/leads?limit=1
  ```
  Expected: Response does NOT include `Access-Control-Allow-Origin` header

- [ ] **Verify public APIs have CORS headers**
  ```bash
  curl -i -H "Origin: https://pinkautoglass.com" \
    http://localhost:3000/api/health/env
  ```
  Expected: Response includes `Access-Control-Allow-Origin: https://pinkautoglass.com`

---

### 5. Booking Flow Validation

- [ ] **Test timeWindow selection**
  - Visit `http://localhost:3000/book`
  - Fill out booking form
  - Select "Anytime" for time window
  - Submit form

- [ ] **Verify database entry**
  ```bash
  psql "$POSTGRES_URL" -c \
    "SELECT time_preference FROM leads ORDER BY created_at DESC LIMIT 1;"
  ```
  Expected: `anytime`

---

### 6. Playwright Test Suite

- [ ] **Run all tests**
  ```bash
  npm run test
  ```
  Expected: All tests pass, including `tests/middleware-auth.spec.js`

- [ ] **Verify middleware auth tests**
  ```bash
  npx playwright test tests/middleware-auth.spec.js --headed
  ```
  Expected:
  - ✅ Should block /admin without Basic Auth
  - ✅ Should block /admin with invalid Basic Auth
  - ✅ Should allow /admin with valid Basic Auth
  - ✅ Should block /api/admin/* without API key
  - ✅ Should block /api/admin/* with public key
  - ✅ Should allow /api/admin/* with admin key
  - ✅ Should handle Base64 decoding with atob (Edge-safe)

---

## Vercel Configuration

### 1. Environment Variables (Production)

Verify ALL required variables are set in Vercel Dashboard → Settings → Environment Variables:

**Authentication:**
- [ ] `ADMIN_USERNAME` (not "admin")
- [ ] `ADMIN_PASSWORD` (not "changeme")
- [ ] `NEXT_PUBLIC_API_KEY` (not "pag_public_dev_*")
- [ ] `API_KEY_ADMIN` (not "pag_admin_dev_*")
- [ ] `API_KEY_INTERNAL` (not "pag_internal_dev_*")

**Database:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `POSTGRES_URL`

**Integrations:**
- [ ] `RESEND_API_KEY`
- [ ] `RINGCENTRAL_CLIENT_ID`
- [ ] `RINGCENTRAL_CLIENT_SECRET`
- [ ] `RINGCENTRAL_JWT_TOKEN`
- [ ] `GOOGLE_ADS_CLIENT_ID`
- [ ] `GOOGLE_ADS_CLIENT_SECRET`
- [ ] `GOOGLE_ADS_REFRESH_TOKEN`
- [ ] `GOOGLE_ADS_DEVELOPER_TOKEN`
- [ ] `GOOGLE_ADS_CUSTOMER_ID`

### 2. Preview Environment (Optional)

For preview/staging builds, you can use test credentials:

- [ ] **Set VERCEL_ENV-specific variables** (if needed)
  - Preview builds will skip credential validation
  - Can use dev fallback keys for testing

---

## Deployment

### 1. Commit Changes

- [ ] **Review all changes**
  ```bash
  git status
  git diff
  ```

- [ ] **Commit security hardening**
  ```bash
  git add .
  git commit -m "Security hardening: defense-in-depth authentication, schema alignment, environment cleanup"
  ```

### 2. Push to Repository

- [ ] **Push to main branch**
  ```bash
  git push origin main
  ```

### 3. Monitor Vercel Build

- [ ] **Watch build logs**
  ```bash
  vercel logs --follow
  ```

- [ ] **Verify build guard triggers**
  - Build should show: "✅ Environment variable validation passed"
  - OR fail if placeholder keys detected (correct behavior!)

- [ ] **Verify deployment succeeds**
  - Check Vercel dashboard for green checkmark
  - Note deployment URL

---

## Post-Deployment Validation

### 1. Production Smoke Tests

Using production domain (https://pinkautoglass.com):

- [ ] **Test /admin Basic Auth**
  ```bash
  curl -i https://pinkautoglass.com/admin
  ```
  Expected: `401 Unauthorized`

- [ ] **Test /api/admin/* API key auth**
  ```bash
  curl -i https://pinkautoglass.com/api/admin/leads?limit=1
  ```
  Expected: `401` or `403` (no valid credentials)

- [ ] **Test public booking API**
  ```bash
  curl -i https://pinkautoglass.com/api/health/env
  ```
  Expected: `200 OK` with CORS headers

### 2. Browser Tests

- [ ] **Visit /admin**
  - Browser shows native HTTP Basic Auth dialog
  - Wrong credentials → 401
  - Correct credentials → 200, dashboard loads

- [ ] **Test booking flow**
  - Fill out booking form at /book
  - Select "Anytime" time window
  - Submit successfully
  - Verify email received

- [ ] **Check admin dashboard**
  - Login with credentials
  - Verify calls sync working
  - Verify leads display correctly
  - Check Google Ads stats loading

### 3. Database Verification

- [ ] **Check new leads use 'anytime'**
  ```bash
  psql "$POSTGRES_URL" -c \
    "SELECT time_preference, COUNT(*) FROM leads \
     WHERE created_at > NOW() - INTERVAL '1 hour' \
     GROUP BY time_preference;"
  ```

- [ ] **Verify no 'flexible' values remain**
  ```bash
  psql "$POSTGRES_URL" -c \
    "SELECT COUNT(*) FROM leads WHERE time_preference = 'flexible';"
  ```
  Expected: `0`

---

## Rollback Plan (If Needed)

### If Authentication Issues

1. **Check Vercel environment variables**
   - Verify all keys are set correctly
   - Check for copy/paste errors

2. **Temporarily disable API key validation** (emergency only)
   ```typescript
   // In src/lib/api-auth.ts
   export function validateAdminApiKey(request: NextRequest): NextResponse | null {
     return null; // TEMPORARY - bypass validation
   }
   ```

3. **Redeploy with fix**

### If timeWindow Issues

1. **Database supports both values** (`flexible` and `anytime`)
   - No immediate rollback needed
   - Can update UI to use `flexible` again if required

2. **Revert UI changes**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

---

## Success Criteria

All boxes checked means successful deployment:

- ✅ Database migration applied and verified
- ✅ TypeScript types regenerated
- ✅ Local build passes
- ✅ Authentication layers tested (Basic Auth + API key)
- ✅ CORS properly restricted
- ✅ Booking flow works with 'anytime'
- ✅ Playwright tests pass
- ✅ Vercel environment variables set
- ✅ Production build succeeds
- ✅ Production smoke tests pass
- ✅ Browser tests successful
- ✅ Database shows correct data

---

## Post-Deployment Monitoring

**First 24 Hours:**

- [ ] Monitor error rates in Vercel dashboard
- [ ] Check for 401/403 errors spike (could indicate auth issues)
- [ ] Verify booking submissions continue
- [ ] Monitor admin dashboard access logs

**First Week:**

- [ ] Review security logs for failed auth attempts
- [ ] Verify no placeholder keys leaked in logs
- [ ] Check that timeWindow data is consistent
- [ ] Gather user feedback on booking flow

---

## Optional Polish (Future Iterations)

These items improve security further but are not blocking:

- [ ] **Admin Supabase client gating**
  - Initialize service-role client only after key validation
  - Prevents early initialization cost/risk

- [ ] **CSP tightening**
  - Migrate to nonce-based scripts
  - Remove `'unsafe-inline'` and `'unsafe-eval'`

- [ ] **GitLeaks in CI**
  - Add `.gitleaks.toml` configuration
  - Fail PRs on secret pattern detection
  - Run in GitHub Actions

- [ ] **Centralized admin client**
  - Create wrapper: `getAuthenticatedSupabaseClient(req)`
  - Returns client only after auth check passes
  - Reduces duplicate code

- [ ] **Rate limiting upgrade**
  - Move from in-memory to Upstash Rate Limit
  - Works across serverless instances
  - More accurate protection

---

## Contact

**Issues?** Open a ticket with:
- Error messages
- Steps to reproduce
- Environment (dev/preview/production)
- Browser/tool used

**Emergency rollback?** Contact tech lead immediately.

---

## Sign-Off

- [ ] **Developer:** Changes tested locally and committed
- [ ] **Tech Lead:** Code reviewed and environment variables verified
- [ ] **DevOps:** Deployment monitored and smoke tests passed
- [ ] **Product:** User-facing booking flow validated

**Deployed by:** _______________
**Date:** _______________
**Deployment URL:** _______________
**Commit SHA:** _______________
