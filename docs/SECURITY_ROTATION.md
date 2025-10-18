# Security Secrets Rotation Guide

This document provides step-by-step procedures for rotating security secrets in production without breaking existing functionality.

## Overview

The Pink Auto Glass security system uses three main secrets:

1. **FORM_INTEGRITY_SECRET**: HMAC key for form token signing
2. **FINGERPRINT_SALT**: Salt for submission fingerprint hashing
3. **SALT_VERSION**: Version identifier for fingerprint salt rotation

## Rotation Schedule

| Secret | Rotation Frequency | Impact Window | Downtime Required |
|--------|-------------------|---------------|-------------------|
| FORM_INTEGRITY_SECRET | Quarterly (every 3 months) | 30 minutes (TOKEN_TTL) | No |
| FINGERPRINT_SALT | Semi-annually (every 6 months) | 24 hours (retention period) | No |
| SALT_VERSION | Only when rotating FINGERPRINT_SALT | N/A | No |

## 1. Rotating FORM_INTEGRITY_SECRET

### Impact Analysis

- **What breaks**: Form tokens issued with old secret will fail verification
- **Duration**: 30 minutes (TOKEN_TTL)
- **User impact**: Users who loaded form >30min ago must refresh page
- **Risk**: Low (tokens expire naturally)

### Procedure

```bash
# Step 1: Generate new secret
NEW_SECRET=$(openssl rand -hex 32)
echo "New secret: $NEW_SECRET"

# Step 2: Update environment variable in Vercel
vercel env add FORM_INTEGRITY_SECRET production
# Paste $NEW_SECRET when prompted

# Step 3: Redeploy to apply new secret
vercel --prod

# Step 4: Wait 30 minutes for old tokens to expire

# Step 5: Verify no token verification errors in logs
vercel logs --prod | grep "Form token"

# Step 6: Document rotation in security log
echo "$(date): Rotated FORM_INTEGRITY_SECRET" >> security_rotation.log
```

### Rollback Procedure

```bash
# If new secret causes issues, revert to old secret
vercel env add FORM_INTEGRITY_SECRET production
# Paste old secret
vercel --prod
```

## 2. Rotating FINGERPRINT_SALT (With Versioning)

### Impact Analysis

- **What breaks**: Fingerprints generated with old salt won't match new fingerprints
- **Duration**: 24 hours (until old counters cleanup)
- **User impact**: None (duplicate detection may miss some during transition)
- **Risk**: Low (monitor-only mode available, auto-cleanup after 24h)

### Procedure

The salt versioning system allows gradual migration without breaking existing fingerprints.

```bash
# Step 1: Check current version
vercel env ls --prod | grep SALT_VERSION
# Assume current is "v1"

# Step 2: Generate new salt
NEW_SALT=$(openssl rand -hex 32)
echo "New salt: $NEW_SALT"

# Step 3: Update SALT_VERSION to next version
vercel env add SALT_VERSION production
# Enter: v2

# Step 4: Update FINGERPRINT_SALT
vercel env add FINGERPRINT_SALT production
# Paste $NEW_SALT

# Step 5: Redeploy
vercel --prod

# Step 6: Monitor for 24 hours
# - Check duplicate detection is working
# - Check no false positives
vercel logs --prod | grep "duplicate" | tail -100

# Step 7: After 24h, old fingerprints auto-cleanup
# Verify cleanup function ran successfully
# Query Supabase: SELECT COUNT(*) FROM submission_counters;
# Should be <10,000 rows

# Step 8: Document rotation
echo "$(date): Rotated FINGERPRINT_SALT from v1 to v2" >> security_rotation.log
```

### Dual-Version Support (Optional)

For zero-downtime rotation, you can check fingerprints against both old and new versions temporarily:

```typescript
// In API route during transition period
const fingerprintV1 = generateSubmissionFingerprint(ip, ua, email, 'v1');
const fingerprintV2 = generateSubmissionFingerprint(ip, ua, email, 'v2');

// Check both versions
const { data: counterV1 } = await supabase.rpc('check_and_increment_submission', {
  p_fingerprint: fingerprintV1,
  // ...
});

const { data: counterV2 } = await supabase.rpc('check_and_increment_submission', {
  p_fingerprint: fingerprintV2,
  // ...
});

// Use the higher count (more restrictive)
const maxCount = Math.max(counterV1.count, counterV2.count);
```

Remove dual-version check after 24 hours.

## 3. Emergency Rotation (Suspected Compromise)

If secrets are suspected to be compromised:

### Immediate Actions (< 1 hour)

```bash
# 1. Generate all new secrets
NEW_FORM_SECRET=$(openssl rand -hex 32)
NEW_FINGERPRINT_SALT=$(openssl rand -hex 32)
NEXT_VERSION="v$(date +%s)" # Timestamp-based version

# 2. Enable monitor-only mode (prevent blocking legitimate users)
vercel env add SECURITY_MONITOR_ONLY production
# Enter: true

# 3. Update all secrets simultaneously
vercel env add FORM_INTEGRITY_SECRET production  # Paste NEW_FORM_SECRET
vercel env add FINGERPRINT_SALT production       # Paste NEW_FINGERPRINT_SALT
vercel env add SALT_VERSION production           # Paste NEXT_VERSION

# 4. Deploy immediately
vercel --prod --yes

# 5. Monitor error rates closely
vercel logs --prod --follow | grep -E "(error|⚠️)"
```

### Post-Emergency Actions (24-48 hours)

```bash
# 1. Analyze logs for suspicious activity
# Look for patterns indicating attacker usage

# 2. Clear all security tables (if compromise confirmed)
# Via Supabase SQL Editor:
# TRUNCATE form_token_jti;
# TRUNCATE submission_counters;

# 3. Disable monitor-only mode after confirming no issues
vercel env rm SECURITY_MONITOR_ONLY production
# Or set to false

# 4. Document incident
cat >> security_incidents.log <<EOF
$(date): EMERGENCY ROTATION
Reason: Suspected secret compromise
Actions: Rotated all secrets, cleared security tables
Impact: ~30min of elevated false positives
Resolution: Monitored 48h, no further issues
EOF
```

## 4. Rotation Testing (Staging)

Always test rotation procedures in staging first:

```bash
# 1. Deploy staging with current secrets
vercel --env staging

# 2. Generate test secrets
TEST_SECRET=$(openssl rand -hex 16)  # Shorter for testing
TEST_SALT=$(openssl rand -hex 16)

# 3. Update staging environment
vercel env add FORM_INTEGRITY_SECRET staging
vercel env add FINGERPRINT_SALT staging
vercel env add SALT_VERSION staging  # e.g., "test-v2"

# 4. Deploy staging
vercel --env staging

# 5. Run end-to-end tests
npm run test:e2e -- --env staging

# 6. Manually test form submissions
# - Submit form before rotation
# - Wait for token expiry
# - Submit form after rotation
# - Verify both work correctly

# 7. Check for errors in staging logs
vercel logs --env staging | grep -E "(error|⚠️)"

# 8. If all tests pass, proceed with production rotation
```

## 5. Monitoring During Rotation

### Key Metrics to Watch

```bash
# Token verification failure rate (should stay <1%)
vercel logs --prod | grep "Form token" | grep "⚠️" | wc -l

# Duplicate detection rate (should stay consistent)
vercel logs --prod | grep "duplicate" | wc -l

# API error rate (should not spike)
vercel logs --prod | grep "error" | wc -l

# Submission success rate (should stay >99%)
vercel logs --prod | grep "Booking submitted successfully" | wc -l
```

### Alerts to Set

Create alerts for:
- Token verification failures >10/hour
- API error rate >5%
- Submission success rate <95%
- Database query latency >100ms

## 6. Secret Storage Best Practices

### Current Storage (Vercel Environment Variables)

```bash
# View current secrets (values hidden)
vercel env ls --prod

# Add new secret
vercel env add SECRET_NAME production

# Remove old secret
vercel env rm SECRET_NAME production
```

### Backup Strategy

```bash
# Backup current secrets before rotation (encrypted)
# Store in 1Password, AWS Secrets Manager, or similar

# Example: Export to encrypted file
vercel env ls --prod > secrets_backup_$(date +%Y%m%d).txt
gpg --encrypt --recipient admin@pinkautoglass.com secrets_backup_*.txt
rm secrets_backup_*.txt  # Remove unencrypted
```

### Access Control

- Limit who can view production secrets (use Vercel team permissions)
- Use MFA for all accounts with secret access
- Audit secret access logs monthly
- Rotate immediately if team member with access leaves

## 7. Rotation Verification Checklist

After each rotation, verify:

- [ ] New secret deployed successfully
- [ ] Application restarted with new secret
- [ ] No spike in error rates
- [ ] Form submissions working normally
- [ ] Token verification succeeding
- [ ] Duplicate detection functioning
- [ ] Database queries completing <100ms
- [ ] No user-reported issues
- [ ] Logs show expected behavior
- [ ] Old tokens/fingerprints expired naturally
- [ ] Rotation documented in security log
- [ ] Team notified of rotation completion

## 8. Troubleshooting

### Issue: High Token Verification Failures After Rotation

**Symptoms**: Logs show many "invalid_signature" errors

**Cause**: Old secret still cached somewhere

**Fix**:
```bash
# Force redeploy to clear caches
vercel --prod --force

# Verify new secret is active
vercel env get FORM_INTEGRITY_SECRET --prod
# Should show recent update timestamp
```

### Issue: Duplicate Detection Not Working After Rotation

**Symptoms**: No duplicate warnings, all submissions pass

**Cause**: Fingerprint salt version mismatch

**Fix**:
```bash
# Check SALT_VERSION is updated
vercel env get SALT_VERSION --prod

# Check fingerprint generation in logs
vercel logs --prod | grep "fingerprint"

# Verify database function is using new salt
# Query Supabase: SELECT * FROM submission_counters ORDER BY last_seen DESC LIMIT 10;
```

### Issue: All Submissions Blocked After Rotation

**Symptoms**: 429 errors, no submissions succeeding

**Cause**: Database cleanup function not running, table too large

**Fix**:
```bash
# Manually run cleanup via Supabase SQL Editor
SELECT cleanup_old_submission_counters();
SELECT cleanup_expired_jtis();

# Verify table sizes reduced
SELECT COUNT(*) FROM submission_counters;
SELECT COUNT(*) FROM form_token_jti;

# Enable monitor-only mode temporarily
vercel env add SECURITY_MONITOR_ONLY production  # Set to: true
vercel --prod
```

## 9. Automation (Future Enhancement)

Consider automating rotation with cron jobs:

```typescript
// app/api/cron/rotate-secrets/route.ts
export async function POST(req: Request) {
  // Only allow from Vercel Cron or with secret token
  const authToken = req.headers.get('authorization');
  if (authToken !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if rotation is due (every 90 days)
  const lastRotation = await getLastRotationDate();
  const daysSince = (Date.now() - lastRotation) / (1000 * 60 * 60 * 24);

  if (daysSince < 90) {
    return Response.json({ message: 'Rotation not due yet', daysSince });
  }

  // Generate new secrets
  const newSecret = randomBytes(32).toString('hex');

  // Update via Vercel API
  await fetch(`https://api.vercel.com/v9/projects/${PROJECT_ID}/env`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      key: 'FORM_INTEGRITY_SECRET',
      value: newSecret,
      type: 'encrypted',
      target: ['production']
    })
  });

  // Trigger deployment
  await triggerDeployment();

  // Log rotation
  await logRotation('FORM_INTEGRITY_SECRET');

  return Response.json({ success: true, rotatedAt: new Date().toISOString() });
}
```

---

**Last Updated**: 2025-01-19
**Version**: 1.0.0
**Owner**: Security Team
