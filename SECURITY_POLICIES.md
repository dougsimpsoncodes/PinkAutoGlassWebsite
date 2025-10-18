# Pink Auto Glass - Security Policies
**Version:** 1.0
**Effective Date:** October 17, 2025
**Last Updated:** October 17, 2025

---

## Table of Contents

1. [Secrets Management Policy](#secrets-management-policy)
2. [Access Control Policy](#access-control-policy)
3. [Data Protection Policy](#data-protection-policy)
4. [Incident Response Policy](#incident-response-policy)
5. [Deployment Security Policy](#deployment-security-policy)

---

## Secrets Management Policy

### 1.1 Scope

This policy covers all API keys, database credentials, encryption keys, and other sensitive authentication tokens used in the Pink Auto Glass application.

### 1.2 Secret Classification

**CRITICAL Secrets** (Never expose, server-side only):
- Supabase Service Role Key
- Database connection strings with passwords
- Twilio Auth Token (when implemented)
- Stripe Secret Key (when implemented)
- reCAPTCHA Secret Key
- Redis/KV access tokens

**PUBLIC Secrets** (Client-safe with proper prefix):
- Supabase URL (`NEXT_PUBLIC_SUPABASE_URL`)
- Supabase Anon Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Google Analytics ID (`NEXT_PUBLIC_GA_MEASUREMENT_ID`)
- reCAPTCHA Site Key (`NEXT_PUBLIC_RECAPTCHA_SITE_KEY`)

### 1.3 Storage Requirements

**NEVER:**
- ❌ Commit secrets to Git (any branch, including feature branches)
- ❌ Store secrets in code comments
- ❌ Share secrets via email, Slack, or other messaging
- ❌ Store secrets in client-accessible files or bundles
- ❌ Use production secrets in development environments
- ❌ Store secrets in screenshots or documentation

**ALWAYS:**
- ✅ Use environment variables for all secrets
- ✅ Store production secrets in Vercel Environment Variables dashboard
- ✅ Use `.env.local` for local development (gitignored)
- ✅ Prefix client-safe variables with `NEXT_PUBLIC_`
- ✅ Keep separate secrets for dev/staging/production
- ✅ Use `.env.example` template without real values

### 1.4 Secret Rotation Schedule

| Secret Type | Rotation Frequency | Owner |
|-------------|-------------------|-------|
| Supabase Service Role Key | Every 90 days | Tech Lead |
| Database Passwords | Every 90 days | Tech Lead |
| API Tokens (Twilio, Stripe) | Every 180 days | Operations |
| Supabase Anon Key | Every 180 days | Tech Lead |
| Emergency Rotation | Immediately on breach | Security Officer |

### 1.5 Rotation Procedure

**Scheduled Rotation:**
1. Generate new secret in service dashboard (e.g., Supabase)
2. Add new secret to Vercel environment variables with temporary suffix (`_NEW`)
3. Update application code to try new secret, fallback to old
4. Deploy and verify functionality
5. Remove old secret from Vercel
6. Update documentation with rotation date

**Emergency Rotation (Breach):**
1. **IMMEDIATELY** invalidate compromised secret in service dashboard
2. Generate replacement secret
3. Update Vercel environment variables
4. Force redeploy: `vercel --prod --force`
5. Verify application functionality
6. Audit access logs for unauthorized usage
7. File incident report

### 1.6 Developer Handoff

When transferring project ownership:
1. Rotate ALL secrets before transfer
2. Provide new owner with access to Vercel dashboard
3. Document location of all secrets
4. Revoke previous owner's access to all services
5. Update emergency contact information

### 1.7 Secret Scanning Enforcement

**Pre-Commit Hook (Mandatory):**
- Gitleaks must run on all commits
- Commits blocked if secrets detected
- No exceptions without security officer approval

**CI/CD Pipeline:**
- GitHub Actions must include secret scanning step
- PRs blocked on secret detection (medium/high severity)
- Automated alerts to security officer

**Audit Schedule:**
- Weekly: Automated secret scan of entire codebase
- Monthly: Manual review of environment variable access logs
- Quarterly: Full secret inventory and rotation review

---

## Access Control Policy

### 2.1 Principle of Least Privilege

Every service, API key, and database connection should have the **minimum permissions** required to function.

### 2.2 Supabase Access Control

**Anon Key Usage (Client-Side):**
- ✅ Use for: Public API routes, booking submissions, lead creation
- ✅ Protected by: Row-Level Security (RLS) policies
- ❌ Cannot: Read other leads, update leads, delete data
- ❌ Cannot: Access admin functions or sensitive data

**Service Role Key Usage (Server-Side Only):**
- ✅ Use for: Admin operations, automated processing, background jobs
- ✅ Bypasses: All RLS policies (use with extreme caution)
- ❌ Never use for: Direct client calls, front-end code
- ❌ Never expose: In client bundles, logs, or error messages

**Database Direct Access:**
- ✅ Use for: Emergency maintenance, migrations, backups
- ❌ Never use for: Application runtime, API routes
- 🔒 Restrict to: DevOps team, database administrators
- 📝 Audit: All direct database access logged and reviewed monthly

### 2.3 Third-Party Service Access Levels

**Twilio (SMS Provider) - When Implemented:**
- Use restricted API keys scoped to specific messaging services
- Separate keys for dev/staging/production
- Enable IP allowlisting in Twilio dashboard
- Restrict to: Send SMS only (no account management)

**Stripe (Payments) - When Implemented:**
- Use restricted keys with minimal permissions
- Separate keys for test/live environments
- Enable webhook signature verification
- Restrict to: Create charges, retrieve customers (no refunds from API)

**Vercel (Hosting):**
- Use project-scoped tokens (not account-level)
- Enable 2FA for all team members
- Audit team member access quarterly
- Use deployment protection for production

### 2.4 Row-Level Security (RLS) Requirements

**All Database Tables Must:**
- ✅ Have RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- ✅ Have explicit policies for INSERT, SELECT, UPDATE, DELETE
- ✅ Default deny (no policy = no access)
- ✅ Be tested with anon key to verify restrictions

**Leads Table Policies:**
```sql
-- Anon key can INSERT new leads (booking submissions)
CREATE POLICY "anon_insert_leads" ON leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anon key CANNOT read leads (prevents data leakage)
CREATE POLICY "anon_no_select_leads" ON leads
  FOR SELECT
  TO anon
  USING (false);

-- Service role has full access (admin operations)
-- (Implicit - service role bypasses RLS)
```

**Uploads Bucket Policies:**
- Anonymous users: Cannot list files, cannot download without signed URL
- Authenticated users: None (no user auth in MVP)
- Service role: Full access for admin review

### 2.5 Access Review Schedule

| Review Type | Frequency | Owner |
|-------------|-----------|-------|
| Vercel team member access | Monthly | Tech Lead |
| Supabase project members | Monthly | Tech Lead |
| Third-party service keys | Quarterly | Security Officer |
| RLS policy effectiveness | After each schema change | Database Admin |
| Database role permissions | Quarterly | Database Admin |

### 2.6 Account Security Requirements

**All Team Members Must:**
- ✅ Enable 2FA on all accounts (Vercel, Supabase, GitHub)
- ✅ Use unique passwords (password manager required)
- ✅ Use work email addresses (not personal)
- ❌ Never share accounts or credentials
- ❌ Never use personal devices for production access

**Offboarding Procedure:**
1. Remove from all service accounts (Vercel, Supabase, GitHub)
2. Rotate all secrets they had access to
3. Review access logs for last 30 days
4. Disable 2FA backup codes
5. Document in access audit log

---

## Data Protection Policy

### 3.1 Personal Identifiable Information (PII)

**PII Collected:**
- Name (first, last)
- Phone number (E.164 normalized)
- Email address
- Street address, city, state, ZIP
- Vehicle information (year, make, model)
- Damage descriptions (user-submitted text)
- Photos (when feature enabled)

### 3.2 PII Handling Requirements

**In Transit:**
- ✅ HTTPS only (enforced by Vercel)
- ✅ TLS 1.2+ for all connections
- ✅ HSTS header enabled
- ❌ No unencrypted transmission

**At Rest:**
- ✅ Encrypted in Supabase (AES-256)
- ✅ Encrypted backups
- ✅ No PII in application logs
- ❌ No PII in error messages shown to users

**In Processing:**
- ✅ Sanitize all inputs before storage
- ✅ Redact PII in server logs (phone numbers, emails)
- ✅ Use parameterized queries/RPCs only
- ❌ No PII in analytics events (except hashed IDs)

### 3.3 Data Minimization

**Collect Only What's Needed:**
- ✅ Required fields: Name, phone, vehicle info, service type
- ❌ Don't collect: SSN, credit card numbers (use Stripe), driver's license

**Retention Policy:**
- Active leads: Indefinite (business records)
- Completed jobs: 7 years (warranty, legal compliance)
- Abandoned bookings: 90 days, then purge
- Marketing consent: Until user opts out
- Access logs: 1 year

**Purge Procedure:**
```sql
-- Soft delete abandoned leads after 90 days
UPDATE leads
SET status = 'purged', payload = NULL
WHERE status = 'new'
  AND created_at < NOW() - INTERVAL '90 days';

-- Hard delete purged records after 7 years
DELETE FROM leads
WHERE status = 'purged'
  AND created_at < NOW() - INTERVAL '7 years';
```

### 3.4 Logging and Redaction

**Server Logs (Vercel):**
- ✅ Log: Request method, path, status code, IP (hashed), timestamp
- ✅ Log: Error types, validation failures (without user input)
- ❌ Never log: Full request bodies, phone numbers, emails, addresses

**Application Logs:**
```typescript
// ❌ BAD - Logs PII
console.log('Lead submitted:', { phone: '+17209187465', email: 'user@example.com' });

// ✅ GOOD - Logs without PII
console.log('Lead submitted:', { leadId: 'abc-123', service: 'repair' });
```

**Database Query Logs:**
- Enabled for audit trail
- Review monthly for anomalies
- Redact before sharing with third parties

### 3.5 Third-Party Data Sharing

**Never Share PII With:**
- ❌ Marketing platforms (except hashed IDs)
- ❌ Analytics providers (except Google Analytics with IP anonymization)
- ❌ Unauthorized employees or contractors

**Allowed Sharing:**
- ✅ Insurance companies (with customer authorization)
- ✅ Payment processors (Stripe) - minimal required data
- ✅ SMS providers (Twilio) - phone numbers only for service messages
- ✅ Legal/compliance requirements (court orders)

**Data Processing Agreements:**
- All third-party vendors must sign DPA
- Annual review of vendor compliance
- Documented data flows

### 3.6 User Rights (CCPA/GDPR Compliance)

**Users Have the Right To:**
1. **Access:** Request copy of their data
   - Response time: 30 days
   - Format: JSON or PDF
   - Delivery: Email (encrypted)

2. **Rectification:** Correct inaccurate data
   - Process: Call or email support
   - Update within 5 business days

3. **Deletion:** "Right to be forgotten"
   - Process: Email request to privacy@pinkautoglass.com
   - Exceptions: Legal hold, warranty records (7 years)
   - Anonymize instead of delete if legal requirement

4. **Opt-Out:** Marketing communications
   - SMS: Reply STOP
   - Email: Unsubscribe link
   - Effect: Immediate (within 24 hours)

**Data Subject Request Log:**
- Track all requests in dedicated table
- Review monthly for patterns
- Annual report to management

---

## Incident Response Policy

### 4.1 Incident Types

**Security Incidents:**
- Unauthorized access to systems or data
- Secret leaked in code or logs
- DDoS or abuse of API endpoints
- Vulnerability discovered in application
- Third-party service breach affecting our data

**Data Breach:**
- Unauthorized access to customer PII
- Accidental exposure of customer data
- Insider threat (malicious employee)

**Service Disruption:**
- API rate limit abuse
- Spam form submissions
- Storage quota exceeded
- Database performance degradation

### 4.2 Severity Levels

**CRITICAL (P0):**
- Production database compromised
- Service role key exposed publicly
- Mass PII data breach (>100 records)
- Complete service outage

**HIGH (P1):**
- API key leaked in code
- Anon key abuse detected
- Individual PII breach (<100 records)
- Partial service degradation

**MEDIUM (P2):**
- Rate limit abuse
- Spam submissions
- Non-sensitive data exposure
- Performance issues

**LOW (P3):**
- Dependency vulnerability (no active exploit)
- Minor configuration issues
- Logging/monitoring failures

### 4.3 Incident Response Procedures

#### Secret Leak Response (P0 - CRITICAL)

**Discovery → 15 minutes:**
1. Confirm secret type and exposure scope
2. Alert security officer and tech lead
3. Determine if secret is currently in production

**Containment → 30 minutes:**
1. **IMMEDIATELY** invalidate compromised secret:
   - Supabase: Dashboard → Settings → API → Reset key
   - Database: `ALTER USER postgres WITH PASSWORD 'new_password';`
2. Generate new secret
3. Update Vercel environment variables
4. Deploy: `vercel --prod --force`

**Investigation → 2 hours:**
1. Search git history for exposure:
   ```bash
   git log --all --full-history -- .env* | grep -A5 -B5 "LEAKED_SECRET"
   ```
2. Check if secret was pushed to GitHub (public exposure?)
3. Review access logs for unauthorized usage
4. Identify all systems using compromised secret

**Remediation → 24 hours:**
1. If in git history: Rewrite history, force push
2. Rotate related secrets (defense in depth)
3. Review and enhance secret scanning
4. Post-mortem meeting with team

**Documentation:**
- Incident report template (who, what, when, how)
- Lessons learned document
- Updated runbooks

#### DDoS/Rate Limit Abuse Response (P2 - MEDIUM)

**Detection:**
- Rate limit violations spike
- Unusual traffic patterns in Vercel analytics
- Increased database query load

**Immediate Actions (15 minutes):**
1. Identify attack pattern (IP range, user agent, endpoint)
2. Enable CAPTCHA if not already active
3. Lower rate limits temporarily (if Redis-based)

**Containment (1 hour):**
1. Block attacking IPs at Vercel edge:
   ```javascript
   // vercel.json
   {
     "headers": [{
       "source": "/:path*",
       "headers": [{"key": "X-Robots-Tag", "value": "noindex, nofollow"}]
     }]
   }
   ```
2. Review and clean spam leads from database
3. Monitor costs (Vercel, Supabase) for overages

**Recovery:**
1. Restore normal rate limits after attack subsides
2. Implement additional protections (honeypot fields, timing analysis)
3. Document attack patterns for future prevention

#### Data Breach Response (P0/P1 - CRITICAL/HIGH)

**Discovery → Immediate:**
1. Confirm breach occurred (evidence collection)
2. Determine scope: How many records? What data?
3. Alert security officer, legal counsel, management
4. Preserve logs and evidence (do not delete)

**Containment → 1 hour:**
1. Stop the leak (revoke access, close vulnerability)
2. Isolate affected systems if necessary
3. Secure backups of current state

**Notification → 72 hours (legal requirement):**
1. Notify affected customers (if PII compromised)
2. Provide: What happened, what data, what we're doing, what they should do
3. File required breach reports (state AG, FTC if applicable)
4. Notify insurance company

**Remediation → 30 days:**
1. Implement fixes to prevent recurrence
2. Third-party security audit
3. Enhanced monitoring and detection
4. Team security training

**Long-term:**
- Offer credit monitoring if appropriate
- Review and update security policies
- Quarterly breach drills

### 4.4 Communication Protocols

**Internal:**
- Security incidents: Email + Slack alert to security officer
- Critical incidents: Phone call to tech lead and CEO
- Status updates: Every 4 hours until resolved

**External:**
- Customers: Email to affected users within 72 hours (legal requirement)
- Public: Blog post or status page if widespread
- Regulators: As required by law (CCPA, HIPAA if applicable)

**Templates:**
- Customer breach notification email
- Public statement template
- Internal incident report template

### 4.5 Post-Incident Review

**Required for All P0/P1 Incidents:**
- Post-mortem meeting within 5 days
- Document: Timeline, root cause, impact, lessons learned
- Action items: Who, what, when
- Follow-up review after 30 days

**Post-Mortem Questions:**
1. What happened? (timeline)
2. Why did it happen? (root cause)
3. How did we detect it?
4. How did we respond?
5. What went well?
6. What went poorly?
7. How do we prevent this in the future?

---

## Deployment Security Policy

### 5.1 Environment Separation

**Environments:**
1. **Development** (`localhost:3000`)
   - Local machine only
   - Mock/test API keys
   - Separate Supabase project (`dev`)
   - No production data

2. **Staging/Preview** (Vercel preview deployments)
   - Branch-based deployments
   - Separate Supabase project (`staging`)
   - Anonymized production data (if needed)
   - Preview URLs not indexed by search engines

3. **Production** (pinkautoglass.com)
   - Main branch only
   - Production Supabase project
   - Real customer data
   - Monitoring and alerting enabled

**Environment Variables:**
- Each environment has separate secrets
- Never share secrets between environments
- Document which environment each secret belongs to

### 5.2 Deployment Checklist

**Before Every Production Deployment:**
- [ ] All tests pass (`npm test`)
- [ ] No console.log with sensitive data
- [ ] No hardcoded secrets in code
- [ ] Dependencies up to date (`npm audit`)
- [ ] Security headers configured
- [ ] RLS policies verified
- [ ] Rate limiting functional
- [ ] CAPTCHA tested
- [ ] Privacy policy up to date
- [ ] Backup of production database

### 5.3 CI/CD Security

**GitHub Actions (When Implemented):**
```yaml
# .github/workflows/security.yml
name: Security Checks

on: [pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Secret Scanning
        run: |
          docker run -v $(pwd):/repo zricethezav/gitleaks:latest \
            detect --source=/repo --verbose --redact

      - name: Dependency Audit
        run: npm audit --audit-level=moderate

      - name: License Compliance
        run: npx license-checker --summary
```

**Required Checks:**
- ✅ Secret scanning (gitleaks)
- ✅ Dependency audit (npm audit)
- ✅ TypeScript compilation
- ✅ ESLint (security rules)
- ✅ Unit tests
- ✅ E2E tests (Playwright)

**Branch Protection Rules:**
- Require PR review (minimum 1 approver)
- Require CI checks to pass
- No direct commits to main
- Require up-to-date branches

### 5.4 Rollback Procedures

**If Deployment Introduces Security Issue:**
1. Immediate rollback: Revert to previous deployment in Vercel dashboard
2. Investigate issue in staging environment
3. Implement fix and verify
4. Re-deploy with fix

**Rollback Triggers:**
- Security vulnerability discovered
- Secrets exposed in client bundle
- RLS policy bypass detected
- Critical bug affecting data integrity

### 5.5 Production Monitoring

**Security Monitoring:**
- Failed authentication attempts (when user auth added)
- Rate limit violations
- Unusual traffic spikes
- Error rate increases
- Database query anomalies

**Alerts:**
- Slack/email for P0/P1 incidents
- Dashboard for ongoing metrics
- Weekly security report to management

**Metrics to Track:**
- API response times
- Error rates by endpoint
- Rate limit hit rate
- Database connection pool usage
- Storage usage (prevent quota abuse)

---

## Policy Compliance

### Audit Schedule

| Policy | Audit Frequency | Owner | Next Review |
|--------|----------------|-------|-------------|
| Secrets Management | Monthly | Security Officer | 2025-11-17 |
| Access Control | Quarterly | Tech Lead | 2026-01-17 |
| Data Protection | Quarterly | Compliance Officer | 2026-01-17 |
| Incident Response | After each incident + Annually | Security Officer | 2026-10-17 |
| Deployment Security | Monthly | DevOps Lead | 2025-11-17 |

### Policy Updates

- Reviewed annually or after major incidents
- Version controlled in Git (this file)
- Team training on updates within 30 days
- Sign-off required from all team members

### Non-Compliance Consequences

**Minor Violations:**
- Warning and re-training
- Documented in personnel file

**Major Violations:**
- Immediate access revocation
- Investigation
- Potential termination (if malicious)

**Examples:**
- Committing secrets: Major violation
- Missing 2FA: Minor violation (grace period to enable)
- Sharing account credentials: Major violation
- Using production data in dev: Major violation

---

## Appendix: Security Tools and Resources

### Required Tools

1. **Gitleaks** - Secret scanning
   - Install: `brew install gitleaks`
   - Docs: https://github.com/gitleaks/gitleaks

2. **npm audit** - Dependency vulnerabilities
   - Built into npm
   - Run: `npm audit`

3. **OWASP ZAP** - Vulnerability scanning (optional)
   - Download: https://www.zaproxy.org/

4. **securityheaders.com** - Header testing
   - URL: https://securityheaders.com/

### Learning Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Next.js Security: https://nextjs.org/docs/advanced-features/security-headers
- Supabase Security: https://supabase.com/docs/guides/auth/row-level-security
- NIST Cybersecurity Framework: https://www.nist.gov/cyberframework

### Emergency Contacts

- **Security Officer:** [To be assigned]
- **Tech Lead:** [To be assigned]
- **Legal Counsel:** [To be assigned]
- **Vercel Support:** support@vercel.com
- **Supabase Support:** support@supabase.com

---

**Document Owner:** Security & Compliance Officer
**Approved By:** [Signature required]
**Next Review Date:** October 17, 2026
