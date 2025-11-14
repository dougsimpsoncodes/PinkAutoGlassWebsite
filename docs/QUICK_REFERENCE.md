# Security Hardening - Quick Reference Card

**Status:** ✅ Ready for Deployment | **Date:** 2025-11-14

---

## 🚀 Quick Deploy (5 Steps)

```bash
# 1. Run migration
export POSTGRES_URL="[from Supabase Dashboard]"
psql "$POSTGRES_URL" -f supabase/migrations/20251114_update_timewindow_enum.sql

# 2. Regenerate types
export SUPABASE_PROJECT_ID="fypzafbsfrrlrrufzkol"
./scripts/regenerate-supabase-types.sh

# 3. Commit types
git add src/types/supabase.ts
git commit -m "Regenerate types after timeWindow migration"

# 4. Push to deploy
git push origin main

# 5. Verify
curl -i https://pinkautoglass.com/admin  # Should 401
```

---

## 🔐 Authentication Layers

| Route | Layer 1: Basic Auth | Layer 2: API Key | Result |
|-------|---------------------|------------------|--------|
| `/admin` | ✅ Required | ❌ Not needed | Browser login |
| `/api/admin/*` | ✅ Required | ✅ Required | 2-factor |
| `/api/booking/*` | ❌ Public | ❌ Public | Open |

**Test locally:**
```bash
# Layer 1: Basic Auth only
curl -u "$ADMIN_USERNAME:$ADMIN_PASSWORD" http://localhost:3000/admin
# → 200 OK

# Layer 2: Basic Auth + API key
curl -u "$ADMIN_USERNAME:$ADMIN_PASSWORD" \
     -H "x-api-key: $API_KEY_ADMIN" \
     http://localhost:3000/api/admin/leads?limit=1
# → 200 OK with data
```

---

## 📋 Required Environment Variables

**Production** (Vercel Dashboard):
```bash
# Authentication (REQUIRED)
ADMIN_USERNAME=[not 'admin']
ADMIN_PASSWORD=[not 'changeme']
NEXT_PUBLIC_API_KEY=[not 'pag_public_dev_*']
API_KEY_ADMIN=[not 'pag_admin_dev_*']
API_KEY_INTERNAL=[not 'pag_internal_dev_*']

# Database (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
POSTGRES_URL=postgresql://postgres...

# Integrations (REQUIRED)
RESEND_API_KEY=re_...
RINGCENTRAL_CLIENT_ID=...
RINGCENTRAL_CLIENT_SECRET=...
RINGCENTRAL_JWT_TOKEN=...
GOOGLE_ADS_CLIENT_ID=...
GOOGLE_ADS_CLIENT_SECRET=...
GOOGLE_ADS_REFRESH_TOKEN=...
```

**Generate secure keys:**
```bash
# Admin password
openssl rand -base64 32

# API keys
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🧪 Quick Tests

**Smoke test all layers:**
```bash
# Admin Basic Auth
curl -i https://pinkautoglass.com/admin
# Expected: 401 Unauthorized, WWW-Authenticate header

# Admin API without key
curl -i -u "$ADMIN_USERNAME:$ADMIN_PASSWORD" \
  https://pinkautoglass.com/api/admin/leads?limit=1
# Expected: 401, "INVALID_API_KEY"

# Admin API with public key (insufficient)
curl -i -u "$ADMIN_USERNAME:$ADMIN_PASSWORD" \
  -H "x-api-key: $NEXT_PUBLIC_API_KEY" \
  https://pinkautoglass.com/api/admin/leads?limit=1
# Expected: 403, "INSUFFICIENT_PERMISSIONS"

# Admin API with admin key (success)
curl -i -u "$ADMIN_USERNAME:$ADMIN_PASSWORD" \
  -H "x-api-key: $API_KEY_ADMIN" \
  https://pinkautoglass.com/api/admin/leads?limit=1
# Expected: 200 OK, JSON data

# Verify CORS restriction
curl -i -H "Origin: https://example.com" \
  -u "$ADMIN_USERNAME:$ADMIN_PASSWORD" \
  -H "x-api-key: $API_KEY_ADMIN" \
  https://pinkautoglass.com/api/admin/leads?limit=1
# Expected: NO Access-Control-Allow-Origin header

# Test booking flow
curl -i https://pinkautoglass.com/book
# Expected: 200 OK, "Anytime" option visible
```

---

## 🛠️ Common Issues & Fixes

### Issue: 401 on all admin routes

**Cause:** Missing or wrong credentials in Vercel

**Fix:**
1. Check Vercel Dashboard → Settings → Environment Variables
2. Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set
3. Check for typos (copy/paste from `.env.local`)
4. Redeploy (automatic on env change)

---

### Issue: 403 "INSUFFICIENT_PERMISSIONS"

**Cause:** Using wrong API key tier (public instead of admin)

**Fix:**
- Verify `x-api-key` header contains `$API_KEY_ADMIN`
- Not `$NEXT_PUBLIC_API_KEY` (public key)
- Check Vercel env vars match `.env.local`

---

### Issue: Build fails with "Missing required API keys"

**Cause:** Build guard detected placeholder keys

**Fix:**
1. This is CORRECT behavior (prevented bad deploy!)
2. Set proper keys in Vercel Dashboard
3. Ensure no dev keys (`pag_*_dev_*`) in production
4. Redeploy with real credentials

---

### Issue: timeWindow validation error

**Cause:** Database migration not applied yet

**Fix:**
```bash
# Run migration
psql "$POSTGRES_URL" -f supabase/migrations/20251114_update_timewindow_enum.sql

# Verify
psql "$POSTGRES_URL" -c "SELECT DISTINCT time_preference FROM leads;"
# Should show: morning, afternoon, anytime
```

---

## 📊 What Changed

**Security:**
- ✅ 22/22 admin routes require API key (was 3/22)
- ✅ Build guard blocks placeholder credentials
- ✅ Fail-closed auth (no weak defaults in prod)
- ✅ CORS restricted to public APIs only
- ✅ Edge-safe middleware (globalThis.atob)

**Schema:**
- ✅ `timeWindow` aligned: schema ↔ UI ↔ DB
- ✅ Migration: `flexible` → `anytime`
- ✅ Type regeneration tooling

**Environment:**
- ✅ 9 `.env` files → 2 files
- ✅ Clear documentation
- ✅ Single source of truth

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `DEPLOYMENT_CHECKLIST.md` | Step-by-step deploy guide |
| `SECURITY_HARDENING_SUMMARY.md` | Complete technical details |
| `APPLY_TIMEWINDOW_MIGRATION.md` | Database migration guide |
| `QUICK_REFERENCE.md` | This file (quick lookups) |
| `README.md` | Environment setup |

---

## 🚨 Emergency Rollback

**If auth completely broken:**

1. **Option A:** Fix env vars in Vercel (fastest)
   - Check for typos
   - Ensure all required vars set
   - Redeploy automatically

2. **Option B:** Temporary bypass (last resort)
   ```typescript
   // src/lib/api-auth.ts (line 239)
   export function validateAdminApiKey(request: NextRequest): NextResponse | null {
     return null; // BYPASS - FIX IMMEDIATELY
   }
   ```
   - Commit, push, monitor
   - Fix credentials ASAP
   - Revert bypass

**If timeWindow broken:**
- Database supports both `flexible` and `anytime`
- Can revert UI without data loss
- No urgency

---

## ✅ Success Checklist

**Pre-Deploy:**
- [ ] Migration applied (`psql < migration.sql`)
- [ ] Types regenerated (`./scripts/regenerate-supabase-types.sh`)
- [ ] Local build passes (`npm run build`)
- [ ] Tests pass (`npm test`)
- [ ] All env vars set in Vercel

**Post-Deploy:**
- [ ] `/admin` returns 401 without credentials
- [ ] `/api/admin/*` requires API key
- [ ] Booking form shows "Anytime" option
- [ ] No error spike in Vercel dashboard
- [ ] Database shows `anytime` for new leads

---

## 🔗 Quick Links

- **Vercel Dashboard:** https://vercel.com/your-team/pink-auto-glass
- **Supabase Dashboard:** https://supabase.com/dashboard/project/fypzafbsfrrlrrufzkol
- **Production Site:** https://pinkautoglass.com
- **Admin Panel:** https://pinkautoglass.com/admin
- **GitHub Repo:** [your-repo-url]

---

## 📞 Support

**Questions?** Check `docs/DEPLOYMENT_CHECKLIST.md`

**Emergency?** Rollback procedures above

**Bug?** Include:
- Error message
- Steps to reproduce
- Environment (dev/preview/prod)
- Browser/tool used

---

**Last Updated:** 2025-11-14
**Status:** ✅ Ready for Production
