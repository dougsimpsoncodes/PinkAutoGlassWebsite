# Pink Auto Glass Security Implementation

## Overview

This document describes the invisible, conversion-first security architecture implemented for the Pink Auto Glass lead generation website. The approach prioritizes speed and legitimate conversions while protecting against automated abuse.

## Architecture Philosophy

### Conversion-First Principles

1. **No User Friction**: 99% of legitimate users never see CAPTCHA or delays
2. **Fast Response Times**: <150ms median, <400ms p95 for form submissions
3. **Invisible Controls**: All security measures operate transparently
4. **Progressive Escalation**: Challenges only triggered on detected abuse
5. **Zero External Dependencies**: Uses existing Supabase infrastructure

### Security Layers

```
┌─────────────────────────────────────────────┐
│  Layer 1: Input Validation (Zod)           │  <10ms
│  - Schema validation                        │
│  - Type coercion                            │
│  - Sanitization                             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Layer 2: Anti-Bot Heuristics              │  <5ms
│  - Honeypot field check                     │
│  - Timestamp validation (2s-30min window)   │
│  - Entropy analysis                         │
│  - URL counting                             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Layer 3: Form Integrity Token             │  <10ms
│  - HMAC signature verification              │
│  - Route binding                            │
│  - User-agent binding                       │
│  - Single-use jti enforcement               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Layer 4: Duplicate Detection              │  10-20ms
│  - Fingerprint-based tracking (Supabase)    │
│  - Configurable thresholds                  │
│  - 24h auto-cleanup                         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Layer 5: Progressive Challenge (Optional) │  User-triggered
│  - CAPTCHA only when abuse detected         │
│  - Preserves form data                      │
│  - Graceful fallback                        │
└─────────────────────────────────────────────┘
```

## Implementation Details

### 1. Form Integrity Tokens

**Purpose**: Prevent replay attacks and form tampering

**How It Works**:
- Server generates HMAC-signed token with bound claims:
  - `iat`: Issued-at timestamp (30 min TTL)
  - `route`: API endpoint (prevents cross-endpoint replay)
  - `ua`: User-agent (prevents cross-device replay)
  - `jti`: Single-use token ID
- Client includes token in form submission
- Server verifies signature, checks jti hasn't been used, marks as used

**Code Location**: `src/lib/formSecurity.ts`

**Functions**:
```typescript
generateFormToken({ route, userAgent }): { token, jti, issuedAt }
verifyFormToken(token, expectedRoute, userAgent, supabase): { valid, reason? }
```

**Database**: `form_token_jti` table (Supabase)

**Performance**: ~5-10ms (includes DB check)

### 2. Duplicate Detection

**Purpose**: Detect and throttle burst submissions from same source

**How It Works**:
- Generate fingerprint: `SHA256(salt:ip:ua:email/phone)` → 32 chars
- Store in `submission_counters` with atomic upsert
- Evaluate thresholds:
  - >5 submissions in 15 min → Challenge
  - >10 submissions in 60 min → Defer
- Auto-cleanup after 24 hours

**Code Location**: `src/lib/formSecurity.ts`

**Functions**:
```typescript
generateSubmissionFingerprint(ip, userAgent, identifier): string
evaluateSubmissionRate(counter): { action: 'allow' | 'defer' | 'challenge', reason? }
```

**Database**: `submission_counters` table (Supabase)

**Performance**: ~10-20ms (Supabase query)

### 3. Anti-Bot Heuristics

**Purpose**: Detect bot patterns without external calls

**Checks**:
1. **Honeypot**: Hidden `website` field must be empty
2. **Timestamp**: Form must take 2s-30min to submit
3. **Entropy**: Message text entropy >2.5 (detect templates)
4. **URL Count**: Max 2 URLs in message (spam indicator)
5. **Disposable Email**: Flag known disposable domains (monitor-only)

**Code Location**: `src/lib/formSecurity.ts`

**Functions**:
```typescript
shouldTriggerChallenge(payload): { trigger: boolean, reason?: string }
calculateEntropy(text): number
```

**Performance**: <5ms (pure computation)

### 4. Input Validation

**Purpose**: Sanitize and normalize all inputs

**Implementation**: Zod schemas with transforms

**Features**:
- Name: 2-50 chars, letters/spaces/hyphens only
- Phone: Normalize to E.164 format (+1XXXXXXXXXX)
- Email: Lowercase, trim, max 254 chars
- City/State: Normalize case
- ZIP: 5 or 9 digit format
- Notes: Strip HTML tags, max 500 chars

**Code Location**: `src/lib/validation.ts`

**Schemas**: `leadFormSchema`, `bookingFormSchema`

**Performance**: <10ms

## Environment Variables

### Required

```bash
# Form Integrity Secrets (rotate quarterly)
FORM_INTEGRITY_SECRET="your-long-random-secret-here-min-32-chars"
FINGERPRINT_SALT="another-long-random-secret-here-min-32-chars"
```

**How to Generate**:
```bash
# On macOS/Linux
openssl rand -hex 32

# On any system with Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Optional (Feature Flags)

```bash
# Monitor-only mode (logs violations but doesn't block)
SECURITY_MONITOR_ONLY=true

# Disable specific layers for debugging
DISABLE_TOKEN_VERIFICATION=false
DISABLE_DUPLICATE_CHECK=false
DISABLE_HEURISTICS=false
```

## Database Setup

### 1. Run Migration

```bash
# Local development
npx supabase db push

# Production
# Upload and run migration via Supabase Dashboard
# File: supabase/migrations/20250119000000_submission_abuse_detection.sql
```

### 2. Verify Tables Created

```sql
-- Check tables exist
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('submission_counters', 'form_token_jti');

-- Check RLS policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('submission_counters', 'form_token_jti');
```

### 3. Set Up Cleanup Cron Jobs

**Option A: pg_cron (Supabase Pro+)**
```sql
-- Run cleanup every 6 hours
SELECT cron.schedule(
  'cleanup-submission-counters',
  '0 */6 * * *',
  'SELECT cleanup_old_submission_counters()'
);

SELECT cron.schedule(
  'cleanup-expired-jtis',
  '0 */6 * * *',
  'SELECT cleanup_expired_jtis()'
);
```

**Option B: Vercel Cron Job**
```typescript
// app/api/cron/cleanup-security/route.ts
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabase.rpc('cleanup_old_submission_counters');
  await supabase.rpc('cleanup_expired_jtis');

  return Response.json({ ok: true });
}
```

```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/cleanup-security",
    "schedule": "0 */6 * * *"
  }]
}
```

## API Integration

### Current Status

**Booking API** (`/api/booking/submit`):
- ✅ Input validation (Zod)
- ✅ Honeypot check
- ✅ Timestamp validation
- ⏳ Form token verification (ready to integrate)
- ⏳ Duplicate detection (ready to integrate)

**Lead API** (`/api/lead`):
- ✅ Input validation (Zod)
- ✅ Honeypot check
- ✅ Timestamp validation
- ✅ Legacy form transformation
- ⏳ Form token verification (ready to integrate)
- ⏳ Duplicate detection (ready to integrate)

### Integration Steps

1. **Create Token Issuance Endpoint**:
```typescript
// app/api/form-token/route.ts
import { generateFormToken } from '@/lib/formSecurity';

export async function POST(req: Request) {
  const { route } = await req.json();
  const userAgent = req.headers.get('user-agent') || 'unknown';

  const { token, jti, issuedAt } = generateFormToken({ route, userAgent });

  return Response.json({ token }, {
    headers: { 'Cache-Control': 'no-store' }
  });
}
```

2. **Update Forms to Fetch Token**:
```typescript
// In booking form
const [formToken, setFormToken] = useState<string | null>(null);

useEffect(() => {
  fetch('/api/form-token', {
    method: 'POST',
    body: JSON.stringify({ route: '/api/booking/submit' })
  })
    .then(r => r.json())
    .then(d => setFormToken(d.token));
}, []);

// Include in submission
const submissionData = {
  ...formData,
  formToken,
  website: '', // honeypot
  formStartTime: Date.now()
};
```

3. **Integrate Verification in API**:
```typescript
// In /api/booking/submit
import { verifyFormToken, generateSubmissionFingerprint, evaluateSubmissionRate } from '@/lib/formSecurity';

// After input validation
const tokenVerification = await verifyFormToken(
  payload.formToken,
  '/api/booking/submit',
  req.headers.get('user-agent') || 'unknown',
  supabase
);

if (!tokenVerification.valid) {
  return Response.json(
    { error: 'Invalid form token', reason: tokenVerification.reason },
    { status: 400 }
  );
}

// Check duplicate
const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
const fingerprint = generateSubmissionFingerprint(ip, userAgent, payload.email);

const { data: counter } = await supabase.rpc('increment_submission_counter', {
  p_fingerprint: fingerprint,
  p_ip_hash: createHash('sha256').update(ip).digest('hex').substring(0, 32)
});

const rateEvaluation = evaluateSubmissionRate(counter);

if (rateEvaluation.action === 'defer') {
  return Response.json(
    { error: 'Too many submissions', reason: rateEvaluation.reason },
    { status: 429 }
  );
} else if (rateEvaluation.action === 'challenge') {
  // Trigger progressive challenge (future implementation)
  console.warn('⚠️ Progressive challenge triggered', { fingerprint, reason: rateEvaluation.reason });
}
```

## Monitoring & Alerts

### Key Metrics

Track in your analytics or logging platform:

1. **Conversion Metrics**:
   - Form submissions per hour
   - Conversion rate (submissions/pageviews)
   - Median/p95 submission latency
   - Error rate by type

2. **Security Metrics**:
   - Honeypot violations per hour
   - Token verification failures by reason
   - Duplicate fingerprint rate
   - Challenge trigger rate
   - Disposable email rate (monitor-only)

3. **Performance Metrics**:
   - API response time breakdown:
     - Input validation time
     - Token verification time
     - Duplicate check time
     - Database insert time
   - Database table sizes (submission_counters, form_token_jti)

### Alert Thresholds

**Critical (Page immediately)**:
- Submission latency p95 >500ms for 5 min
- Error rate >10% for 5 min
- Conversion rate drops >50% hour-over-hour

**Warning (Email/Slack)**:
- Honeypot violations >100/hour
- Token verification failures >50/hour
- Duplicate rate >20% of submissions
- Database cleanup job failures

### Weekly Review Checklist

- [ ] Review false positive rate (legitimate users blocked)
- [ ] Review spam that got through (false negatives)
- [ ] Tune thresholds if needed (submission_counters rules)
- [ ] Check disposable email monitor-only logs
- [ ] Verify database cleanup running successfully
- [ ] Rotate form secrets if scheduled

## Deployment Checklist

### Pre-Deployment

- [ ] Generate and set `FORM_INTEGRITY_SECRET` and `FINGERPRINT_SALT`
- [ ] Run database migration (create tables)
- [ ] Verify RLS policies restrict to service_role
- [ ] Set up database cleanup cron jobs
- [ ] Enable `SECURITY_MONITOR_ONLY=true` initially

### Deployment

- [ ] Deploy code to staging
- [ ] Test form submission end-to-end
- [ ] Verify token generation/verification works
- [ ] Verify duplicate detection works
- [ ] Load test: verify p95 latency <400ms
- [ ] Deploy to production

### Post-Deployment (First 24 Hours)

- [ ] Monitor submission latency (target: <150ms median)
- [ ] Monitor error rates (target: <1%)
- [ ] Monitor security metrics (establish baseline)
- [ ] Review logs for unexpected violations
- [ ] A/A test: confirm no conversion impact

### Post-Deployment (First Week)

- [ ] Review false positive rate
- [ ] Tune thresholds if needed
- [ ] Disable `SECURITY_MONITOR_ONLY` for disposable emails
- [ ] Document baseline metrics for future comparison

## Performance Targets

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Median Submission Latency | <150ms | >250ms |
| P95 Submission Latency | <400ms | >500ms |
| Error Rate | <1% | >5% |
| False Positive Rate | <0.1% | >1% |
| Database Query Time (duplicate) | <20ms | >50ms |
| Form Token Verification Time | <10ms | >25ms |

## Security Maintenance

### Secret Rotation Schedule

**Quarterly (every 3 months)**:
1. Generate new `FORM_INTEGRITY_SECRET`
2. Update environment variable
3. Deploy (old tokens expire in 30 min)

**Semi-Annual (every 6 months)**:
1. Generate new `FINGERPRINT_SALT`
2. Update environment variable
3. Deploy
4. Note: Old fingerprints auto-cleanup in 24h

### Database Maintenance

**Weekly**:
- Verify cleanup jobs running
- Check table sizes (should be <10,000 rows each)

**Monthly**:
- Review slow query logs
- Consider adding indexes if queries slow

**Annually**:
- Archive old security logs
- Review and update heuristic thresholds

## Troubleshooting

### Issue: High False Positive Rate

**Symptoms**: Legitimate users reporting form errors

**Debug**:
1. Check logs for `reason` in token/duplicate failures
2. Review UA mismatch rate (mobile browsers vary)
3. Check timestamp validation window (2s-30min)

**Fixes**:
- Increase submission count thresholds
- Widen timestamp validation window
- Remove UA binding if too strict

### Issue: High Latency

**Symptoms**: Submission latency >400ms p95

**Debug**:
1. Check database query performance
2. Review Supabase connection pooling
3. Check if cleanup job overdue (large tables)

**Fixes**:
- Optimize database indexes
- Increase cleanup frequency
- Consider caching fingerprint lookups

### Issue: Spam Getting Through

**Symptoms**: Low-quality leads in CRM

**Debug**:
1. Review heuristic trigger logs
2. Check disposable email patterns
3. Analyze message entropy of spam

**Fixes**:
- Lower entropy threshold (<2.5)
- Add more disposable domains to list
- Reduce submission count thresholds
- Enable progressive challenge

## Future Enhancements

### Phase 2 (When Needed)

1. **Progressive Challenge UI**:
   - Implement Cloudflare Turnstile on trigger
   - Preserve form data across challenge
   - Track challenge pass/fail rates

2. **IP Reputation**:
   - Integrate with IP reputation services
   - Block known VPN/proxy ranges
   - Flag datacenter IPs

3. **Behavioral Analytics**:
   - Track mouse movement patterns
   - Track keystroke timing
   - Flag robotic patterns

4. **ML-Based Scoring**:
   - Train model on historical spam
   - Score submissions 0-100
   - Auto-tune thresholds

### Monitoring Dashboard (Recommended)

Build internal dashboard showing:
- Real-time submission rate
- Security violation breakdown
- Top blocked fingerprints
- Average submission latency
- Conversion funnel (pageview → submit → success)

## References

- Form Security: `src/lib/formSecurity.ts`
- Input Validation: `src/lib/validation.ts`
- Database Migration: `supabase/migrations/20250119000000_submission_abuse_detection.sql`
- Booking API: `src/app/api/booking/submit/route.ts`
- Lead API: `src/app/api/lead/route.ts`
- Middleware (Security Headers): `src/middleware.ts`

## Support

For questions or issues:
1. Check this documentation
2. Review code comments in security files
3. Check Supabase logs for specific errors
4. Review monitoring dashboards

---

**Last Updated**: 2025-01-19
**Version**: 1.0.0
**Status**: Ready for Integration (Token/Duplicate features staged, not yet integrated into APIs)
