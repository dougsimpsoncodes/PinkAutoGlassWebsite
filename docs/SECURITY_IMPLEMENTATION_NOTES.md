# Security Implementation Notes

## Response to Security Review Feedback

This document addresses all gaps and adjustments identified in the security review of Pink Auto Glass's invisible form security implementation.

---

## ✅ Implemented Fixes

### 1. Service Role Exposure Prevention

**Issue**: Direct database access to `form_token_jti` required service_role key, risking exposure in edge/runtime bundles.

**Solution Implemented**:
- Created SECURITY DEFINER RPC functions:
  - `check_and_mark_jti()`: Atomic jti check-and-mark operation
  - `check_and_increment_submission()`: Atomic submission counter with evaluation
- Both functions granted to anon role but control all access internally
- No service key needed in client or API code
- Uses native PostgreSQL exception handling for unique constraint violations

**Code Location**:
- Migration: `supabase/migrations/20250119000000_submission_abuse_detection.sql:145-241`
- Usage: `src/lib/formSecurity.ts:135` (calls `check_and_mark_jti`)

**Verification**:
```sql
-- Verify functions are SECURITY DEFINER
SELECT proname, prosecdef FROM pg_proc
WHERE proname IN ('check_and_mark_jti', 'check_and_increment_submission');

-- Verify anon can execute
SELECT grantee, privilege_type FROM information_schema.routine_privileges
WHERE routine_name IN ('check_and_mark_jti', 'check_and_increment_submission');
```

---

### 2. JTI Unique Index for Single-Use Enforcement

**Issue**: Need database-level guarantee of single-use to prevent race conditions.

**Solution Implemented**:
- Added `UNIQUE INDEX idx_form_token_jti_unique ON form_token_jti(jti)`
- Primary key already ensures uniqueness, but explicit index documents intent
- RPC function uses `unique_violation` exception to detect replay attempts
- Atomic insert guarantees thread-safety across multiple API instances

**Code Location**: `supabase/migrations/20250119000000_submission_abuse_detection.sql:102`

**Race Condition Protection**:
```sql
-- Two concurrent requests with same jti:
-- Request A: INSERT jti='abc123' → Success
-- Request B: INSERT jti='abc123' → unique_violation exception → Returns { valid: false, reason: 'replay_attempt' }
```

---

### 3. Salt Rotation Strategy with Versioning

**Issue**: Rotating FINGERPRINT_SALT would break all existing fingerprints and counters.

**Solution Implemented**:
- Added `SALT_VERSION` environment variable (default: 'v1')
- Salt version included in fingerprint hash: `hash(version:salt:ip:ua:email)`
- Function accepts optional `saltVersion` parameter for dual-version support during transition
- Old fingerprints expire naturally after 24h (auto-cleanup)

**Code Location**:
- `src/lib/formSecurity.ts:13` (SALT_VERSION constant)
- `src/lib/formSecurity.ts:164-175` (generateSubmissionFingerprint with version support)

**Rotation Procedure**:
```bash
# Current: SALT_VERSION=v1, FINGERPRINT_SALT=<old>
# Step 1: Update version and salt
SALT_VERSION=v2
FINGERPRINT_SALT=<new>
# Step 2: Deploy
# Step 3: Wait 24h for old fingerprints to expire
# Result: All new fingerprints use v2, old v1 fingerprints cleanup naturally
```

**Optional Dual-Version Support**:
```typescript
// During 24h transition, check both versions
const fpV1 = generateSubmissionFingerprint(ip, ua, email, 'v1');
const fpV2 = generateSubmissionFingerprint(ip, ua, email, 'v2');
// Use max count from both versions (more restrictive)
```

See: `docs/SECURITY_ROTATION.md` for complete rotation procedures

---

### 4. Token Binding with Payload Hash

**Issue**: Tokens bound only to route/UA, allowing cross-endpoint replay or payload mutation.

**Solution Implemented**:
- Added optional `payloadFields` parameter to `generateFormToken()`
- Generates SHA256 hash of sorted key-value pairs
- Hash included in token claims: `iat:route:ua:payloadhash:jti`
- Verification checks payload hash matches actual submission data

**Code Location**:
- Generation: `src/lib/formSecurity.ts:22-62`
- Verification: `src/lib/formSecurity.ts:119-132`

**Example Usage**:
```typescript
// Token issuance (server-side)
const token = generateFormToken({
  route: '/api/booking/submit',
  userAgent: req.headers.get('user-agent'),
  payloadFields: {
    email: 'user@example.com',
    vehicleYear: 2020,
    serviceType: 'repair'
  }
});

// Token verification (API-side)
const result = await verifyFormToken(
  payload.formToken,
  '/api/booking/submit',
  userAgent,
  supabase,
  {
    email: payload.email,
    vehicleYear: payload.vehicleYear,
    serviceType: payload.serviceType
  }
);
// If payload was mutated, hash won't match → { valid: false, reason: 'payload_mismatch' }
```

**Attack Prevention**:
- ❌ Can't replay token from `/api/lead` on `/api/booking/submit` (route mismatch)
- ❌ Can't change email from `user@example.com` to `attacker@evil.com` (payload hash mismatch)
- ❌ Can't replay token twice (jti already used)
- ❌ Can't use expired token (TTL check)

---

### 5. Token Issuance Rate Limiting

**Status**: **Documented, Not Yet Implemented**

**Recommendation**:
Create token issuance endpoint with rate limiting to prevent mass token harvesting:

```typescript
// app/api/form-token/route.ts
import { generateFormToken } from '@/lib/formSecurity';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  // Rate limit: Max 10 tokens per IP per minute
  const rateLimitKey = `token_issuance:${ip}`;
  const requestCount = await incrementRateLimit(rateLimitKey, 60); // 60 second window

  if (requestCount > 10) {
    console.warn('⚠️ Token issuance rate limit exceeded', { ip });
    return Response.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  const { route, payloadFields } = await req.json();

  // Validate route is expected
  const allowedRoutes = ['/api/booking/submit', '/api/lead'];
  if (!allowedRoutes.includes(route)) {
    return Response.json({ error: 'Invalid route' }, { status: 400 });
  }

  const { token } = generateFormToken({
    route,
    userAgent,
    payloadFields
  });

  return Response.json(
    { token },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }
  );
}

// Simple in-memory rate limiting (for MVP)
const tokenIssuanceCounter = new Map<string, { count: number; resetAt: number }>();

function incrementRateLimit(key: string, windowSeconds: number): number {
  const now = Date.now();
  const entry = tokenIssuanceCounter.get(key);

  if (!entry || now > entry.resetAt) {
    tokenIssuanceCounter.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return 1;
  }

  entry.count++;
  return entry.count;
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of tokenIssuanceCounter.entries()) {
    if (now > entry.resetAt) {
      tokenIssuanceCounter.delete(key);
    }
  }
}, 5 * 60 * 1000);
```

**Why Important**: Prevents attackers from harvesting thousands of valid tokens before rate limits kick in on submission.

---

### 6. Dynamic CSP for Challenge Domains

**Status**: **Documented, Not Yet Implemented**

**Recommendation**:
Only add Cloudflare Turnstile (or other challenge provider) domains to CSP when actually showing a challenge:

```typescript
// Current: Strict CSP in middleware.ts (no challenge domains)

// Future: When challenge triggered
export function addChallengeToResponse(response: NextResponse): NextResponse {
  const currentCSP = response.headers.get('Content-Security-Policy') || '';

  // Add Turnstile domains only when needed
  const challengeCSP = currentCSP
    .replace(
      "script-src 'self'",
      "script-src 'self' https://challenges.cloudflare.com"
    )
    .replace(
      "frame-src 'none'",
      "frame-src https://challenges.cloudflare.com"
    );

  response.headers.set('Content-Security-Policy', challengeCSP);
  return response;
}

// Usage in API route when challenge triggered
if (rateEvaluation.action === 'challenge') {
  return Response.json(
    {
      error: 'Challenge required',
      challengeType: 'turnstile',
      challengeSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    },
    {
      status: 403,
      headers: {
        'X-Challenge-Required': 'true'
      }
    }
  );
}

// Frontend handles challenge and resubmits with challenge token
```

**Why Important**: Maintains strict CSP for 99% of users, only relaxes for the <1% who trigger challenges.

---

### 7. Privacy Policy Update

**Status**: **Documented, Not Yet Implemented**

**Recommendation**:
Add section to privacy policy documenting abuse detection data handling:

```markdown
## Abuse Detection & Form Security

To protect our services from automated abuse, we collect and temporarily store the following data:

### Data Collected:
- **IP Address**: Hashed using cryptographic salt (SHA-256), never stored in plain text
- **Browser Information**: User-agent string, hashed with IP and email
- **Form Submission Fingerprints**: Composite hash of IP + browser + email/phone
- **Form Token IDs**: Single-use identifiers for preventing replay attacks

### Data Retention:
- **Submission Counters**: Automatically deleted after 24 hours
- **Form Token IDs**: Automatically deleted upon expiration (30 minutes)
- **No Personal Information**: Only cryptographic hashes are stored; original data is never retained

### Purpose:
This data is used solely to detect and prevent automated form abuse, duplicate submissions, and bot activity. It helps ensure our services remain available for legitimate customers.

### Your Rights:
As this data consists only of temporary hashes with no linkage to personal information, it falls outside the scope of data subject access requests. All data expires automatically within 24 hours.
```

**Location to Add**: `src/app/privacy/page.tsx` (existing privacy policy page)

---

### 8. Node Runtime Configuration

**Status**: **Verified**

**Current Configuration**:
- Next.js API routes default to **Node.js runtime** (not Edge runtime)
- Crypto operations (`createHash`, `createHmac`, `randomBytes`) require Node runtime
- No `export const runtime = 'edge'` directives in security-related files

**Verification**:
```bash
# Check for Edge runtime exports in security files
grep -r "export const runtime = 'edge'" src/lib/formSecurity.ts src/app/api/
# Result: No matches (good - using Node runtime)

# Verify crypto imports work (Node-only module)
node -e "const crypto = require('crypto'); console.log(crypto.randomBytes(16).toString('hex'))"
# Result: Outputs random hex (crypto module available)
```

**Files Confirmed Using Node Runtime**:
- ✅ `src/lib/formSecurity.ts` (requires crypto module)
- ✅ `src/lib/validation.ts` (may use crypto for future features)
- ✅ `src/app/api/booking/submit/route.ts` (will use formSecurity)
- ✅ `src/app/api/lead/route.ts` (will use formSecurity)

**Important**: If you ever need to add `export const runtime = 'edge'` to any API route that uses `formSecurity`, you must:
1. Move crypto operations to server-only API route
2. Use Web Crypto API instead of Node crypto module
3. Or use a different runtime strategy

---

## 🔄 Integration Checklist (When Ready to Enable)

### Phase 1: Database Setup

- [ ] Run migration: `npx supabase db push`
- [ ] Verify tables created: `form_token_jti`, `submission_counters`
- [ ] Verify SECURITY DEFINER functions exist
- [ ] Verify RLS policies restrict anon access to tables (but allow RPC execution)
- [ ] Test RPC functions manually:
  ```sql
  SELECT check_and_mark_jti('test123', '/api/test', NOW() + INTERVAL '30 minutes');
  SELECT check_and_mark_jti('test123', '/api/test', NOW() + INTERVAL '30 minutes'); -- Should return replay error
  ```

### Phase 2: Environment Configuration

- [ ] Generate FORM_INTEGRITY_SECRET: `openssl rand -hex 32`
- [ ] Generate FINGERPRINT_SALT: `openssl rand -hex 32`
- [ ] Set SALT_VERSION=v1
- [ ] Set SECURITY_MONITOR_ONLY=true (initially)
- [ ] Add secrets to Vercel production environment
- [ ] Document secrets in secure vault (1Password, etc.)

### Phase 3: Token Issuance Endpoint

- [ ] Create `/app/api/form-token/route.ts`
- [ ] Add in-memory rate limiting (10 tokens/IP/minute)
- [ ] Set Cache-Control: no-store headers
- [ ] Validate route parameter against allowlist
- [ ] Test token generation returns valid tokens
- [ ] Test rate limiting blocks after threshold

### Phase 4: Frontend Integration

- [ ] Update `src/app/book/page.tsx`:
  ```typescript
  const [formToken, setFormToken] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/form-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        route: '/api/booking/submit',
        payloadFields: {
          email: formData.email,
          serviceType: formData.serviceType,
          vehicleYear: formData.vehicleYear
        }
      })
    })
      .then(r => r.json())
      .then(d => setFormToken(d.token))
      .catch(err => console.error('Token fetch failed:', err));
  }, [formData.email, formData.serviceType, formData.vehicleYear]);

  // Include in submission
  const submissionData = {
    ...formData,
    formToken,
    // ...
  };
  ```
- [ ] Add graceful fallback if token fetch fails (log error, submit anyway in monitor-only mode)
- [ ] Test form submission with valid token
- [ ] Test form submission with invalid token (should fail)

### Phase 5: API Integration

- [ ] Update `/api/booking/submit/route.ts`:
  ```typescript
  import { verifyFormToken, generateSubmissionFingerprint } from '@/lib/formSecurity';

  // After input validation, before database insert
  const tokenVerification = await verifyFormToken(
    payload.formToken,
    '/api/booking/submit',
    req.headers.get('user-agent') || 'unknown',
    supabase,
    {
      email: payload.email,
      serviceType: payload.serviceType,
      vehicleYear: payload.vehicleYear
    }
  );

  if (!tokenVerification.valid) {
    if (MONITOR_ONLY_MODE) {
      console.warn('⚠️ Token verification failed (monitor-only)', tokenVerification.reason);
    } else {
      return Response.json(
        { error: 'Invalid form token', reason: tokenVerification.reason },
        { status: 400 }
      );
    }
  }

  // Check duplicate
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const fingerprint = generateSubmissionFingerprint(ip, userAgent, payload.email);

  const { data: evaluation } = await supabase.rpc('check_and_increment_submission', {
    p_fingerprint: fingerprint,
    p_ip_hash: createHash('sha256').update(ip).digest('hex').substring(0, 32)
  });

  if (evaluation.action === 'defer') {
    if (MONITOR_ONLY_MODE) {
      console.warn('⚠️ Rate limit exceeded (monitor-only)', evaluation);
    } else {
      return Response.json(
        { error: 'Too many submissions', reason: evaluation.reason },
        { status: 429, headers: { 'Retry-After': '900' } } // 15 minutes
      );
    }
  } else if (evaluation.action === 'challenge') {
    console.warn('⚠️ Progressive challenge triggered', evaluation);
    // Future: Return challenge requirement
  }

  // Continue with lead insertion...
  ```
- [ ] Repeat for `/api/lead/route.ts`
- [ ] Test all validation layers pass for legitimate submissions
- [ ] Test token replay is blocked
- [ ] Test payload mutation is blocked
- [ ] Test rate limiting triggers at threshold

### Phase 6: Monitoring Setup

- [ ] Set up Vercel log queries for key metrics:
  ```bash
  vercel logs --prod | grep "Form token" | grep "⚠️"
  vercel logs --prod | grep "duplicate"
  vercel logs --prod | grep "challenge triggered"
  ```
- [ ] Create dashboard with:
  - Submissions per hour
  - Token verification failure rate
  - Duplicate detection rate
  - Challenge trigger rate
  - API latency (p50, p95, p99)
- [ ] Set up alerts:
  - Token failures >10/hour
  - API errors >5%
  - p95 latency >500ms

### Phase 7: Production Rollout

- [ ] Deploy with SECURITY_MONITOR_ONLY=true
- [ ] Monitor logs for 48 hours
- [ ] Verify no false positives (legitimate users blocked)
- [ ] Tune thresholds if needed (submission counter limits)
- [ ] A/A test: confirm no conversion rate impact
- [ ] Disable monitor-only mode: `SECURITY_MONITOR_ONLY=false`
- [ ] Monitor for another 48 hours
- [ ] Document baseline metrics for future comparison

### Phase 8: Cleanup & Cron

- [ ] Set up database cleanup cron (every 6 hours):
  - Option A: Supabase pg_cron
  - Option B: Vercel Cron + API endpoint
- [ ] Verify cleanup runs successfully
- [ ] Monitor table sizes stay <10,000 rows

---

## 📊 Success Criteria (Go-Live)

| Metric | Target | Measurement Period |
|--------|--------|-------------------|
| Median Submission Latency | <150ms | 24 hours |
| P95 Submission Latency | <400ms | 24 hours |
| Token Verification Failure Rate | <1% | 7 days |
| Duplicate Detection Rate | 2-5% | 7 days |
| Challenge Trigger Rate | <1% | 7 days |
| False Positive Rate | <0.1% | 7 days |
| Conversion Rate Impact | 0% (no decrease) | 14 days (A/A test) |
| API Error Rate | <1% | 7 days |

---

## 🔐 Security Posture Summary

### Attack Vectors Mitigated:

✅ **Replay Attacks**: Single-use jti with unique constraint
✅ **Cross-Endpoint Replay**: Route binding in token
✅ **Payload Mutation**: Payload hash verification
✅ **Token Expiration**: 30-minute TTL
✅ **Burst Submissions**: Fingerprint-based rate limiting
✅ **Bot Detection**: Honeypot + timestamp + entropy checks
✅ **Duplicate Submissions**: Fingerprint tracking with 24h retention
✅ **Race Conditions**: Atomic database operations with SECURITY DEFINER
✅ **Service Key Exposure**: RPC functions eliminate need for client-side service key

### Remaining Risks (Acceptable):

⚠️ **Token Harvesting**: Mitigated by issuance rate limiting (not yet implemented)
⚠️ **IP Rotation**: Attacker can rotate IPs to bypass fingerprinting (expensive, rate limited per IP)
⚠️ **Browser Fingerprinting Evasion**: UA spoofing possible (mitigated by payload hash + jti)
⚠️ **Distributed Attacks**: Many IPs submitting slowly (mitigated by heuristics + challenge)

### Defense in Depth:

| Layer | Control | User Impact | Attack Prevention |
|-------|---------|-------------|-------------------|
| 1 | Input Validation (Zod) | None | Injection, XSS |
| 2 | Honeypot + Timestamp | None | Simple bots |
| 3 | Form Token | None | Replay, mutation |
| 4 | Fingerprint + Rate Limit | None (unless burst) | Duplicate, burst |
| 5 | Progressive Challenge | 1% of users | Persistent automation |

---

## 📝 Next Steps

1. **Immediate**: Review this document and confirm all gaps are addressed
2. **Week 1**: Implement token issuance endpoint with rate limiting
3. **Week 2**: Integrate token verification into booking and lead APIs
4. **Week 3**: Deploy to staging, run full test suite
5. **Week 4**: Production rollout with monitor-only mode
6. **Week 5**: Disable monitor-only, monitor metrics
7. **Week 6**: Document final baseline and success criteria met

---

**Last Updated**: 2025-01-19
**Version**: 2.0.0
**Status**: Core Implementation Complete, Integration Pending
**Review Required**: Yes (Security team approval before production rollout)
