# IMMEDIATE SECURITY ACTIONS REQUIRED
**Status:** 🚨 DEPLOYMENT BLOCKED
**Priority:** CRITICAL
**Estimated Time:** 2-4 hours

---

## CRITICAL ACTIONS (Do These NOW)

### 1. Verify No Secrets in Git History (15 minutes)

```bash
# Check if .env files were ever committed
git log --all --full-history -- .env.local .env.production

# If this returns ANY commits, you MUST rotate ALL secrets immediately
```

**If secrets found in history:**
```bash
# 1. IMMEDIATELY rotate in Supabase dashboard:
#    - Go to Settings → API → Generate new service role key
#    - Go to Database → Settings → Reset password

# 2. Update Vercel environment variables with new secrets

# 3. Force redeploy
vercel --prod --force

# 4. Remove from git history (if repo is private)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local .env.production" \
  --prune-empty --tag-name-filter cat -- --all

# 5. Force push (ONLY if repo is private and you understand the implications)
git push origin --force --all
```

**If no secrets in history (expected result):**
```bash
# Should return nothing - this is good!
# Proceed to step 2
```

---

### 2. Install Gitleaks Pre-Commit Hook (30 minutes)

```bash
# Install gitleaks
brew install gitleaks  # macOS
# OR download binary from: https://github.com/gitleaks/gitleaks/releases

# Make pre-commit hook executable
chmod +x .git-hooks/pre-commit

# Verify it works
echo "test_password=secret123" > test.txt
git add test.txt
git commit -m "test"
# Should BLOCK the commit

# Clean up test
rm test.txt
git reset HEAD test.txt

# Verify hook configuration
git config core.hooksPath .git-hooks
```

**Test the hook:**
```bash
# This should pass (no secrets)
echo "const foo = 'bar';" > test.js
git add test.js
git commit -m "test: verify pre-commit hook"
# Should succeed

# Clean up
git reset HEAD~1
rm test.js
```

---

### 3. Verify Service Role Key Not in Client Bundle (15 minutes)

```bash
# Build production bundle
npm run build

# Search for service role key pattern
grep -r "service_role" .next/static/
grep -r "SUPABASE_SERVICE_ROLE_KEY" .next/static/

# Should return NOTHING
# If found, STOP and contact security officer
```

**Expected result:**
```
# No output = Good!
```

**If found in bundle:**
```bash
# DO NOT DEPLOY
# Contact: Security Officer immediately
# Issue: Service role key exposed to client
# Fix: Move supabaseAdmin to separate server-only file
```

---

### 4. Update .gitignore (5 minutes)

```bash
# Read the current .gitignore
cat .gitignore

# Verify .env* is already there (it should be on line 34)
# If not, add explicit entries:
cat >> .gitignore << 'EOF'

# Environment files - NEVER COMMIT
.env
.env.local
.env.development
.env.staging
.env.production
.env*.local
EOF

# Verify
cat .gitignore | grep "\.env"
```

---

### 5. Remove Local .env Files from Working Directory (5 minutes)

**IMPORTANT:** First ensure secrets are in Vercel dashboard!

```bash
# Verify Vercel has all required environment variables
vercel env ls

# Should show:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY (production)
# - POSTGRES_URL (production)
# - NEXT_PUBLIC_GA_MEASUREMENT_ID
# - NEXT_PUBLIC_STICKY_CALLBAR

# If missing any, add them:
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste the value from .env.production when prompted

# Once verified in Vercel, remove local files
rm .env.production
# Keep .env.local for local development, but ensure it's gitignored

# Verify not staged
git status | grep "\.env"
# Should show nothing (or "Untracked files" which is OK)
```

---

## HIGH-PRIORITY ACTIONS (Before Deployment)

### 6. Add Security Headers to next.config.js (30 minutes)

```bash
# Backup current config
cp next.config.js next.config.js.backup

# Edit next.config.js and add security headers
# See SECURITY_CHECKLIST.md for full headers configuration
```

**Required headers (copy this):**
```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self)'
  }
];

// Add to nextConfig
async headers() {
  return [
    {
      source: '/:path*',
      headers: securityHeaders,
    },
  ]
},
```

**Test locally:**
```bash
npm run build
npm start

# In another terminal
curl -I http://localhost:3000 | grep -i "x-frame-options"
# Should show: X-Frame-Options: SAMEORIGIN
```

---

### 7. Implement Input Sanitization (2 hours)

```bash
# Install sanitization library
npm install dompurify isomorphic-dompurify validator
```

**Create `/src/lib/sanitize.ts`:**
```typescript
import createDOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

const DOMPurify = createDOMPurify();

export function sanitizeText(input: string | undefined | null): string {
  if (!input) return '';
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  }).trim();
}

export function sanitizeEmail(email: string | undefined | null): string | null {
  if (!email) return null;
  if (!validator.isEmail(email)) return null;
  return validator.normalizeEmail(email) || null;
}

export function sanitizePhone(phone: string | undefined | null): string {
  if (!phone) return '';
  return phone.replace(/[^\d+\-() ]/g, '');
}
```

**Update API routes** (do for ALL routes):
```typescript
// Example: /src/app/api/lead/route.ts
import { sanitizeText, sanitizeEmail, sanitizePhone } from '@/lib/sanitize';

// In POST handler:
const payload = {
  firstName: sanitizeText(body.firstName),
  lastName: sanitizeText(body.lastName),
  phoneE164: normalizePhone(sanitizePhone(body.phone)),
  notes: sanitizeText(body.notes),
  // ... rest of payload
};
```

---

### 8. Upgrade Rate Limiting to Production-Ready (2 hours)

**Option A: Upstash Redis (Recommended)**

```bash
# 1. Sign up at upstash.com (free tier available)
# 2. Create Redis database
# 3. Get REST API credentials

# Install client
npm install @upstash/redis

# Add to Vercel environment variables
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
```

**Create `/src/lib/rate-limit.ts`:**
```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function checkRateLimit(
  ip: string,
  endpoint: string,
  maxRequests: number = 5,
  windowSeconds: number = 60
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rate_limit:${endpoint}:${ip}`;

  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }

  const allowed = current <= maxRequests;
  const remaining = Math.max(0, maxRequests - current);

  return { allowed, remaining };
}
```

**Update API routes:**
```typescript
// Replace in-memory rate limiting with Redis
import { checkRateLimit } from '@/lib/rate-limit';

const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
const rateLimit = await checkRateLimit(ip, 'booking', 5, 60);

if (!rateLimit.allowed) {
  return NextResponse.json(
    { error: 'Rate limit exceeded. Please try again later.' },
    { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
  );
}
```

---

### 9. Add CAPTCHA to Booking Form (2 hours)

**Google reCAPTCHA v3 (Invisible):**

```bash
# 1. Get keys from: https://www.google.com/recaptcha/admin
# 2. Choose reCAPTCHA v3
# 3. Add domain: pinkautoglass.com

# Add to Vercel environment variables
vercel env add NEXT_PUBLIC_RECAPTCHA_SITE_KEY production
vercel env add RECAPTCHA_SECRET_KEY production
```

**Update `/src/app/book/page.tsx`:**
```typescript
// Add to handleSubmit:
const executeRecaptcha = async (): Promise<string> => {
  return new Promise((resolve) => {
    (window as any).grecaptcha.ready(() => {
      (window as any).grecaptcha
        .execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, { action: 'booking_submit' })
        .then(resolve);
    });
  });
};

// In handleSubmit function:
const recaptchaToken = await executeRecaptcha();

// Include in submission:
const submissionData = {
  // ... existing fields
  recaptchaToken,
};
```

**Update `/src/app/api/booking/submit/route.ts`:**
```typescript
// Verify reCAPTCHA token
async function verifyRecaptcha(token: string): Promise<boolean> {
  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    { method: 'POST' }
  );
  const data = await response.json();
  return data.success && data.score >= 0.5;
}

// In POST handler:
if (!await verifyRecaptcha(payload.recaptchaToken)) {
  return NextResponse.json(
    { error: 'CAPTCHA verification failed' },
    { status: 400 }
  );
}
```

**Add script to `/src/app/layout.tsx`:**
```typescript
<Script
  src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
  strategy="lazyOnload"
/>
```

---

### 10. Verify RLS Policies (30 minutes)

```sql
-- Run in Supabase SQL Editor

-- 1. Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
-- All should show rowsecurity = true

-- 2. View existing policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- 3. Test anon key cannot read leads (should fail)
-- Run this as anon key (use anon client in browser console):
-- const { data, error } = await supabase.from('leads').select('*');
-- Expected: error due to RLS
```

**Document findings in `/supabase/RLS_POLICIES.md`:**
```markdown
# RLS Policies - Pink Auto Glass

## Leads Table

**Enabled:** Yes

**Policies:**
1. anon_insert_leads - Allows anon key to INSERT new leads
2. anon_no_select - Prevents anon key from SELECT
3. Service role bypasses all policies (admin access)

**Tested:** [Date]
**Verified by:** [Name]
```

---

## VERIFICATION CHECKLIST

Before deploying, verify ALL of these:

```bash
# 1. No secrets in git history
[ ] git log --all --full-history -- .env* returns nothing

# 2. Pre-commit hook working
[ ] Test commit with secret is BLOCKED

# 3. Service role key not in bundle
[ ] grep -r "service_role" .next/static/ returns nothing

# 4. Security headers configured
[ ] next.config.js includes all headers from step 6

# 5. Input sanitization implemented
[ ] All API routes use sanitizeText, sanitizeEmail, sanitizePhone

# 6. Rate limiting upgraded
[ ] Redis/KV-based rate limiting implemented

# 7. CAPTCHA enabled
[ ] Booking form includes reCAPTCHA verification

# 8. RLS verified
[ ] Supabase RLS policies documented and tested

# 9. Dependencies audited
[ ] npm audit shows no high/critical vulnerabilities

# 10. Build succeeds
[ ] npm run build completes without errors
```

---

## DEPLOY TO PRODUCTION

Once ALL checks above are complete:

```bash
# 1. Final verification
npm run build
npm test

# 2. Commit changes
git add .
git commit -m "security: implement critical security fixes"

# 3. Push to main
git push origin main

# 4. Deploy to production
vercel --prod

# 5. Post-deployment verification
# Wait 2 minutes for deployment to complete, then:

# Test booking form
open https://pinkautoglass.com/book

# Test security headers
curl -I https://pinkautoglass.com | grep -i "x-frame-options"

# Test rate limiting (submit form 6 times rapidly, should be blocked on 6th)

# Test CAPTCHA (check browser console for reCAPTCHA script load)

# Check Vercel logs
vercel logs pinkautoglass.com --follow
```

---

## MONITORING (First 24 Hours)

```bash
# Check every 4 hours for first 24 hours:

# 1. Error rates
vercel logs pinkautoglass.com | grep ERROR

# 2. Rate limit violations
# Check Vercel analytics dashboard

# 3. Failed bookings
# Check Supabase dashboard → Table Editor → leads
# Filter by created_at in last 24 hours

# 4. Security headers
curl -I https://pinkautoglass.com
```

---

## ROLLBACK PLAN

If issues discovered after deployment:

```bash
# Immediate rollback
# 1. Go to Vercel dashboard
# 2. Deployments → Find previous working deployment
# 3. Click "..." → "Promote to Production"

# OR via CLI
vercel rollback pinkautoglass.com
```

---

## GETTING HELP

**If stuck on any step:**
1. Read detailed documentation in SECURITY_CHECKLIST.md
2. Review code examples in SECURITY_POLICIES.md
3. Check Vercel/Supabase documentation
4. Contact security officer or tech lead

**Emergency contact:**
- Security Officer: [Assign before deploying]
- Tech Lead: [Assign before deploying]

---

**Time Required Summary:**
- Critical actions (1-6): 1-2 hours
- High-priority actions (7-10): 6-8 hours
- Testing and verification: 1 hour
- **Total: 8-11 hours (1-2 business days)**

**Status:** 🚨 START THESE IMMEDIATELY
**Next Review:** After all actions complete
