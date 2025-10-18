# Security Checklist - Pink Auto Glass
Quick reference for developers before committing and deploying.

---

## Pre-Commit Checklist

Run this before EVERY commit:

```bash
# 1. Secret scanning (auto-runs via pre-commit hook)
gitleaks protect --staged --verbose --redact

# 2. Dependency check
npm audit --audit-level=high

# 3. TypeScript check
npm run build

# 4. Linting
npm run lint

# 5. Tests
npm test
```

### Manual Verification

- [ ] No `console.log()` statements with PII (phone, email, address)
- [ ] No hardcoded API keys or credentials
- [ ] No `.env.local` or `.env.production` files staged for commit
- [ ] All new API routes have rate limiting
- [ ] All user inputs are sanitized before storage
- [ ] All new database operations use RPC functions (not direct queries)
- [ ] Error messages don't leak sensitive information

---

## Pre-Deployment Checklist (Production)

### Critical Security Items

- [ ] Verify `.env.local` and `.env.production` are NOT in git:
  ```bash
  git log --all --full-history -- .env.local .env.production
  # Should return nothing
  ```

- [ ] Verify service role key is NOT in client bundle:
  ```bash
  npm run build
  grep -r "service_role" .next/static/
  # Should return nothing
  ```

- [ ] Verify all environment variables are set in Vercel dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only, no prefix)
  - `POSTGRES_URL` (if used)
  - `NEXT_PUBLIC_GA_MEASUREMENT_ID`
  - `RECAPTCHA_SECRET_KEY`
  - `UPSTASH_REDIS_REST_URL` (if implemented)
  - `UPSTASH_REDIS_REST_TOKEN` (if implemented)

- [ ] Security headers configured in `next.config.js`:
  - HSTS
  - X-Frame-Options
  - X-Content-Type-Options
  - CSP
  - Referrer-Policy

- [ ] CAPTCHA enabled on booking form

- [ ] Rate limiting upgraded to Redis/KV (not in-memory)

- [ ] RLS policies verified in Supabase dashboard:
  ```sql
  -- Run in Supabase SQL editor
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public';
  -- All should have rowsecurity = true
  ```

- [ ] Input sanitization applied to all API routes

- [ ] Privacy policy and terms pages reviewed and current

- [ ] All dependencies audited:
  ```bash
  npm audit --production
  # Fix any high/critical vulnerabilities
  ```

### Testing Items

- [ ] Test booking form submission end-to-end
- [ ] Test rate limiting (submit >5 requests in 1 minute, should be blocked)
- [ ] Test CAPTCHA (try to submit without solving, should be blocked)
- [ ] Test XSS prevention (submit `<script>alert('XSS')</script>` in notes field)
- [ ] Test SQL injection prevention (submit `'; DROP TABLE leads; --` in any field)
- [ ] Verify HTTPS redirect (visit http://pinkautoglass.com, should redirect to https)
- [ ] Verify security headers:
  ```bash
  curl -I https://pinkautoglass.com | grep -i "x-frame-options\|strict-transport-security"
  ```

### Backup and Rollback

- [ ] Database backup created before deployment
- [ ] Rollback plan documented (revert to previous deployment in Vercel)
- [ ] Emergency contacts available (tech lead, security officer)

---

## Post-Deployment Verification

Within 30 minutes of deployment:

- [ ] Test production booking form submission
- [ ] Verify no errors in Vercel logs
- [ ] Test security headers: https://securityheaders.com/?q=pinkautoglass.com
- [ ] Verify SSL/TLS: https://www.ssllabs.com/ssltest/analyze.html?d=pinkautoglass.com
- [ ] Check for mixed content warnings (view-source, browser console)
- [ ] Monitor rate limit violations (Vercel analytics)
- [ ] Verify database RLS enforced (try to read leads table with anon key)

---

## Monthly Security Tasks

- [ ] Review Vercel team member access
- [ ] Review Supabase project members
- [ ] Run dependency audit: `npm audit`
- [ ] Review rate limit violation logs
- [ ] Review database access logs for anomalies
- [ ] Check for new security advisories (Next.js, React, Supabase)

---

## Quarterly Security Tasks

- [ ] Rotate Supabase service role key
- [ ] Rotate database password
- [ ] Review and update security policies
- [ ] Review third-party service keys (Twilio, Stripe)
- [ ] Audit RLS policies for effectiveness
- [ ] Review and purge old leads (retention policy)
- [ ] Security awareness training for team

---

## Emergency Procedures

### Secret Leaked in Code

1. **STOP** - Do not push to GitHub
2. Run: `git reset HEAD~1` (undo commit)
3. Remove secret from code
4. Rotate secret in service dashboard
5. Update Vercel environment variables
6. Commit clean code
7. Verify: `gitleaks detect`

### Secret Already Pushed to GitHub

1. **IMMEDIATELY** invalidate secret in service dashboard
2. Generate new secret
3. Update Vercel environment variables: `vercel env add SUPABASE_SERVICE_ROLE_KEY production`
4. Force redeploy: `vercel --prod --force`
5. Remove from git history:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.local" \
     --prune-empty --tag-name-filter cat -- --all
   git push origin --force --all
   ```
6. Notify security officer
7. File incident report

### DDoS/Spam Attack Detected

1. Identify attack pattern (IP, user agent, endpoint)
2. Lower rate limits temporarily (if Redis-based)
3. Enable additional CAPTCHA challenges
4. Block IP ranges at Vercel edge (if feasible)
5. Monitor costs (Supabase, Vercel)
6. Review and clean spam leads from database
7. Document attack for future prevention

### Production Outage

1. Check Vercel status page: https://www.vercel-status.com/
2. Check Supabase status page: https://status.supabase.com/
3. Review Vercel logs for errors
4. If deployment issue: Rollback to previous version
5. If database issue: Check Supabase dashboard for alerts
6. Notify customers if outage >15 minutes
7. Post-mortem within 48 hours

---

## Quick Commands Reference

```bash
# Install gitleaks (macOS)
brew install gitleaks

# Run secret scan on staged files
gitleaks protect --staged --verbose

# Run secret scan on entire repo
gitleaks detect --verbose --redact

# Check for secrets in git history
gitleaks detect --log-opts="--all" --verbose

# Audit dependencies
npm audit --audit-level=moderate

# Fix auto-fixable vulnerabilities
npm audit fix

# Build and check for errors
npm run build

# Run all tests
npm test

# Deploy to production
vercel --prod

# View production logs
vercel logs pinkautoglass.com --follow

# Add environment variable
vercel env add VARIABLE_NAME production

# Remove environment variable
vercel env rm VARIABLE_NAME production

# Rollback deployment (Vercel Dashboard)
# Dashboard → Deployments → Previous deployment → Promote to Production
```

---

## File-Specific Security Notes

### `/src/app/api/**/route.ts` (API Routes)

**Required for ALL API routes:**
- ✅ Rate limiting check at start of function
- ✅ Input validation and sanitization
- ✅ Use Supabase RPC functions (not direct queries)
- ✅ Error handling without leaking sensitive info
- ✅ Proper HTTP status codes (400, 429, 500)

**Example structure:**
```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!await checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // 2. Parse and validate input
    const body = await request.json();
    if (!body.requiredField) {
      return NextResponse.json({ error: 'Missing required field' }, { status: 400 });
    }

    // 3. Sanitize inputs
    const sanitizedInput = sanitizeText(body.userInput);

    // 4. Use RPC function (not direct query)
    const { error } = await supabase.rpc('fn_insert_lead', {
      p_payload: sanitizedInput
    });

    // 5. Handle errors without leaking info
    if (error) {
      console.error('DB error:', error.message); // Server logs only
      return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### `/src/lib/supabase.ts` (Database Client)

**Critical rules:**
- ❌ NEVER export `supabaseAdmin` to client components
- ❌ NEVER use service role key in client-side code
- ✅ Use anon key for all client-side operations
- ✅ Rely on RLS policies for security

### `.env.local` and `.env.production`

**Rules:**
- ❌ NEVER commit to git
- ❌ NEVER share via email/Slack
- ✅ Use `.env.example` template for documentation
- ✅ Store production secrets in Vercel dashboard ONLY
- ✅ Delete local copies after deployment

### `next.config.js`

**Required security headers:**
- HSTS (force HTTPS)
- X-Frame-Options (prevent clickjacking)
- X-Content-Type-Options (prevent MIME sniffing)
- CSP (prevent XSS)
- Referrer-Policy (privacy)

---

## Integration Security Checklists

### Supabase Integration

- [ ] RLS enabled on all tables
- [ ] Anon key used for client operations
- [ ] Service role key used only in API routes (server-side)
- [ ] RPC functions used instead of direct queries
- [ ] Storage buckets have proper access policies
- [ ] Database backups enabled
- [ ] SSL/TLS enforced for all connections

### Twilio Integration (When Implemented)

- [ ] Restricted API key (not master account key)
- [ ] Webhook signature verification enabled
- [ ] Separate keys for dev/staging/production
- [ ] IP allowlisting configured
- [ ] SMS opt-out handling implemented (STOP command)
- [ ] Carrier registration completed
- [ ] A2P 10DLC registration if required

### Stripe Integration (When Implemented)

- [ ] Restricted API keys with minimal permissions
- [ ] Separate test/live keys
- [ ] Webhook signature verification
- [ ] Never log full card numbers
- [ ] PCI compliance maintained (use Stripe.js, never handle raw card data)
- [ ] Refund permissions restricted to admin only

### Vercel Deployment

- [ ] Project-scoped tokens (not account-level)
- [ ] 2FA enabled for all team members
- [ ] Environment variables scoped per environment
- [ ] Preview deployments not indexed (robots.txt)
- [ ] Production deployment protection enabled
- [ ] Custom domain SSL configured

---

## Security Contact Information

**Report Security Vulnerabilities:**
- Email: security@pinkautoglass.com
- Response Time: Within 24 hours

**Emergency Contacts:**
- Security Officer: [To be assigned]
- Tech Lead: [To be assigned]

**Service Support:**
- Vercel: support@vercel.com
- Supabase: support@supabase.com
- Twilio: help.twilio.com
- Stripe: support@stripe.com

---

**Last Updated:** October 17, 2025
**Next Review:** Monthly (see security policies)
