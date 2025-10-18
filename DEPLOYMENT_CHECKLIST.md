# Production Deployment Checklist
**Pink Auto Glass Website - v2.0**

## 🎯 Quick Deploy Options

### Option 1: Automated Script (Recommended)
```bash
./scripts/deploy-production.sh
```

### Option 2: Manual Deploy
Follow checklist below.

---

## ✅ Pre-Deployment Go/No-Go Criteria

**🟢 GO if ALL criteria met:**

### 1. Service Role Key Security ✅
- [ ] `SUPABASE_SERVICE_ROLE_KEY` NOT used in client-side code
- [ ] `SUPABASE_SERVICE_ROLE_KEY` NOT used in Edge runtime routes
- [ ] Service role operations use SECURITY DEFINER RPC functions

**Current Status**: ✅ Service key only in `src/lib/supabase.ts` (server-side), not used in API routes (using RPC instead)

### 2. Security Headers Present ✅
- [ ] CSP (Content-Security-Policy) configured
- [ ] HSTS (Strict-Transport-Security) enabled
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy configured
- [ ] Permissions-Policy configured

**Verification**:
```bash
curl -I https://pinkautoglass.com | grep -E "Strict-Transport|Content-Security|X-Frame|X-Content-Type|Referrer|Permissions"
```

### 3. Runtime Configuration ✅
- [ ] All API routes use Node runtime (NOT Edge)
- [ ] Crypto operations supported

**Current Status**: ✅ No Edge runtime configured, all routes use Node by default

### 4. Monitor-Only Mode Active ✅
- [ ] `SECURITY_MONITOR_ONLY=true` set in production (initial deployment)
- [ ] Will log violations without blocking users
- [ ] Safe rollout strategy confirmed

### 5. No Secrets Exposed ✅
- [ ] No hardcoded API keys in source
- [ ] All secrets use `process.env`
- [ ] `.env` files gitignored
- [ ] No secrets in git history

**Current Status**: ✅ All checks passed (see PRE_PRODUCTION_SECURITY_AUDIT.md)

### 6. Environment Variables Ready
- [ ] `FORM_INTEGRITY_SECRET` generated (32-char hex)
- [ ] `FINGERPRINT_SALT` generated (32-char hex)
- [ ] `SALT_VERSION` = v1
- [ ] `SECURITY_MONITOR_ONLY` = true
- [ ] Supabase vars present (`NEXT_PUBLIC_SUPABASE_URL`, `ANON_KEY`, optional `SERVICE_ROLE_KEY`)

---

## 🚀 Deployment Steps

### Step 1: Generate Secrets (2 min)
```bash
# Generate FORM_INTEGRITY_SECRET
openssl rand -hex 32

# Generate FINGERPRINT_SALT
openssl rand -hex 32

# Save both to 1Password/secure vault
```

### Step 2: Set Vercel Environment Variables (3 min)

**Production Environment Only** (do NOT set in preview/development unless testing):

```bash
# Add new security variables
vercel env add FORM_INTEGRITY_SECRET production
vercel env add FINGERPRINT_SALT production
vercel env add SALT_VERSION production  # Enter: v1
vercel env add SECURITY_MONITOR_ONLY production  # Enter: true

# Verify all variables (if vercel env ls production doesn't work, use):
vercel env ls | grep production
```

**Important Notes**:
- Environment variables are strings. Code handles `"true"` as boolean.
- Service role key is optional if not used at runtime (currently not needed).
- If `vercel env ls production` errors, use `vercel env ls` and filter by env column.

### Step 3: Optional - Database Migrations

**Current Status**: Migrations are **optional** for this deployment. The security features are staged but not active.

**If you want to prepare for future activation** (recommended):

1. Confirm Supabase project is linked:
   ```bash
   npx supabase projects list
   npx supabase link --project-ref YOUR_PROJECT_REF
   ```

2. Push migrations:
   ```bash
   npx supabase db push
   ```

3. Verify tables created:
   - `submission_counters`
   - `form_token_jti`

**OR skip** and run later when activating security features.

### Step 4: Build Test (2 min)
```bash
npm run build
```

Must complete without errors.

### Step 5: Commit & Push (3 min)
```bash
# Add all changes
git add .

# Commit with detailed message
git commit -m "Security improvements and pre-production audit

- Add form integrity tokens with payload hash binding
- Add SECURITY DEFINER RPC functions for jti verification
- Add salt rotation strategy with versioning
- Update .env.example with new security variables
- Add comprehensive security documentation
- Complete pre-production security audit (PASSED)

Status: Production-ready"

# Push to trigger auto-deploy
git push origin main
```

### Step 6: Monitor Deployment (10 min)

Watch Vercel dashboard or:
```bash
vercel logs --prod --follow
```

Look for:
- ✅ Deployment succeeded
- ✅ No "missing environment variable" errors
- ✅ Build completed successfully

---

## 🔍 Post-Deployment Verification (15 min)

### Immediate Checks (5 min)

1. **Test Live Site**:
   ```bash
   open https://pinkautoglass.com
   ```

2. **Verify Security Headers**:
   ```bash
   # Check homepage headers
   curl -I https://pinkautoglass.com

   # Check API route headers
   curl -I https://pinkautoglass.com/api/vehicles
   ```

   **Must see**:
   - `strict-transport-security: max-age=31536000`
   - `content-security-policy: ...`
   - `x-frame-options: DENY`
   - `x-content-type-options: nosniff`
   - `referrer-policy: strict-origin-when-cross-origin`

3. **Test Form Submission**:
   - Navigate to https://pinkautoglass.com/book
   - Fill out booking form
   - Submit and verify confirmation page
   - Check email received (if configured)

### Performance Baseline (10 min)

1. **Measure Submit Latency**:
   ```bash
   # Use browser DevTools Network tab
   # Submit form and check timing:
   # - Median (p50): <150ms ✅
   # - 95th percentile (p95): <400ms ✅
   ```

2. **Check Core Web Vitals**:
   - LCP (Largest Contentful Paint): <2.5s
   - FID (First Input Delay): <100ms
   - CLS (Cumulative Layout Shift): <0.1

3. **Monitor Vercel Analytics**:
   - Check request count stable
   - No error rate spike
   - Response times normal

### 48-Hour Monitoring Period

**Check Daily**:

1. **Logs Review**:
   ```bash
   vercel logs --prod | grep -E "(error|⚠️|SECURITY)"
   ```

   **Expected**:
   - ✅ "SECURITY_MONITOR_ONLY" messages (if security triggers)
   - ✅ Normal form submissions
   - ❌ NO missing environment variable errors
   - ❌ NO runtime crashes

2. **Conversion Tracking**:
   - Form submission count unchanged or increased
   - No user-reported issues
   - Completion rate stable

3. **Security Monitoring**:
   - Note any "monitor-only" violation logs
   - Count duplicate detection triggers
   - Track honeypot violations

**After 48 Hours - Optional Activation**:

If all metrics look good, consider disabling monitor-only mode:
```bash
vercel env rm SECURITY_MONITOR_ONLY production
# OR set to false
echo "false" | vercel env add SECURITY_MONITOR_ONLY production --force
vercel --prod  # Redeploy
```

---

## 🛡️ Security Verification Commands

### Check for Secrets in Code
```bash
grep -r -E "['\"](sk-|pk_|AKIA|ya29\.|ghp_|AIza)['\"]" src/
# Expected: No matches
```

### Check .gitignore
```bash
grep "\.env" .gitignore && git ls-files | grep "\.env"
# Expected: Only .env.example tracked
```

### Check Service Role Usage
```bash
grep -r "supabaseAdmin\|SUPABASE_SERVICE_ROLE_KEY" src/app/api/
# Expected: 0 matches (using RPC functions instead)
```

### Check Runtime Configuration
```bash
grep -r "export const runtime.*edge" src/app/api/
# Expected: No matches (using Node runtime)
```

### Verify SQL Injection Protection
```bash
grep -r -E "(\.from\(['\"].*\$\{|\.query\(['\"].*\$\{)" src/
# Expected: No matches (all parameterized)
```

---

## 🎯 Success Criteria

**Deployment is successful if:**

- ✅ Site loads at https://pinkautoglass.com
- ✅ All security headers present
- ✅ Forms submit successfully
- ✅ No environment variable errors in logs
- ✅ Median submit latency <150ms
- ✅ P95 submit latency <400ms
- ✅ No conversion rate drop
- ✅ Core Web Vitals maintained or improved
- ✅ Security monitor-only logs flowing (if configured)

**Rollback if:**

- ❌ Site returns 500 errors
- ❌ Forms fail to submit
- ❌ Missing environment variable errors
- ❌ Latency >500ms consistently
- ❌ Conversion rate drops >10%
- ❌ User-reported critical issues

**Rollback procedure**:
```bash
# Via Vercel dashboard: Deployments → Previous deployment → Promote to Production
# OR via CLI:
vercel rollback [DEPLOYMENT_URL]
```

---

## 📋 Additional Recommendations

### Google Search Console (Optional)

If `NEXT_PUBLIC_GSC_VERIFICATION` not set:
```bash
vercel env add NEXT_PUBLIC_GSC_VERIFICATION production
# Enter verification code from Google Search Console
```

Then submit sitemap:
```
https://pinkautoglass.com/sitemap.xml
```

### Privacy Policy Update (Recommended)

Add section about 24h data retention and hash-only storage. See template in:
`docs/SECURITY_IMPLEMENTATION_NOTES.md` (section 7)

### Quarterly Maintenance (Scheduled)

- **Every 3 months**: Rotate `FORM_INTEGRITY_SECRET`
- **Every 6 months**: Rotate `FINGERPRINT_SALT` with version bump
- **Monthly**: Review `npm audit` and update dependencies
- **Weekly** (first month): Review security logs and tune thresholds

See: `docs/SECURITY_ROTATION.md` for procedures

---

## 📞 Support

**Documentation**:
- Security Overview: `SECURITY.md`
- Implementation Guide: `docs/SECURITY_IMPLEMENTATION_NOTES.md`
- Rotation Procedures: `docs/SECURITY_ROTATION.md`
- Security Audit: `PRE_PRODUCTION_SECURITY_AUDIT.md`

**Common Issues**:
- Environment variables not loading → Check Vercel dashboard, verify scope
- Forms failing → Check browser console for errors, review Vercel logs
- Slow performance → Check Vercel Analytics, review Core Web Vitals
- Security errors → Check monitor-only logs, review fingerprint thresholds

---

**Last Updated**: 2025-01-19
**Version**: 2.0.0
**Status**: Production-Ready ✅
