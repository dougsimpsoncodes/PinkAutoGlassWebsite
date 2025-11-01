# Secrets Management Policy
**Pink Auto Glass**
**Version:** 1.0
**Effective Date:** October 29, 2025

---

## Table of Contents
1. [Policy Statement](#policy-statement)
2. [Secret Classification](#secret-classification)
3. [Storage Requirements](#storage-requirements)
4. [Rotation Schedule](#rotation-schedule)
5. [Access Control](#access-control)
6. [Incident Response](#incident-response)
7. [Compliance & Auditing](#compliance--auditing)

---

## Policy Statement

All secrets (API keys, database credentials, encryption keys, tokens) used by Pink Auto Glass applications SHALL be managed according to this policy to prevent unauthorized access, data breaches, and service disruption.

**Scope:** This policy applies to all team members, contractors, and systems that interact with application secrets.

**Enforcement:** Violations of this policy may result in immediate access revocation and disciplinary action.

---

## Secret Classification

### CRITICAL Secrets (Server-Side Only)
**Definition:** Secrets that grant administrative access or bypass security controls.

**Examples:**
- `SUPABASE_SERVICE_ROLE_KEY` - Bypasses Row Level Security
- `POSTGRES_URL` with password - Direct database access
- `TWILIO_AUTH_TOKEN` - Account management access
- `STRIPE_SECRET_KEY` - Payment processing (when implemented)
- `RINGCENTRAL_CLIENT_SECRET` - SMS service access
- `RESEND_API_KEY` - Email sending access

**Storage Rules:**
- ❌ NEVER commit to Git (any branch)
- ❌ NEVER store in client-accessible files
- ❌ NEVER share via email/Slack/messaging
- ❌ NEVER log or display in UI/console
- ❌ NEVER use in development environments
- ✅ ONLY in Vercel Environment Variables (Production environment)
- ✅ Separate secrets for dev/staging/production
- ✅ Encrypted at rest and in transit

### PUBLIC Secrets (Client-Safe)
**Definition:** Secrets that are safe to expose in client-side code.

**Examples:**
- `NEXT_PUBLIC_SUPABASE_URL` - Protected by RLS
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Protected by RLS
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Analytics tracking ID
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - CAPTCHA site key

**Requirements:**
- ✅ Must have `NEXT_PUBLIC_` prefix
- ✅ Protected by Row Level Security (database)
- ✅ Rate limited (API endpoints)
- ✅ Monitored for abuse
- ⚠️ Still should not be in `.env.local` for production values

### INTERNAL Secrets (Development Only)
**Definition:** Non-production secrets for local development and testing.

**Examples:**
- Mock API keys (e.g., `test-key-12345`)
- Development database credentials
- Staging environment tokens

**Requirements:**
- ✅ Clearly labeled as development/mock
- ✅ No access to production data
- ✅ Can be in `.env.local` (gitignored)
- ⚠️ Never use production secrets for development

---

## Storage Requirements

### Production Secrets

**WHERE TO STORE:**
```
✅ Vercel Environment Variables Dashboard ONLY
   - Project Settings → Environment Variables
   - Scope: Production only
   - No plaintext copies elsewhere

✅ (Future) HashiCorp Vault or AWS Secrets Manager
   - Centralized secret management
   - Automatic rotation
   - Audit logging
```

**WHERE NOT TO STORE:**
```
❌ Git repository (any branch, any file)
❌ .env.local file (development machine)
❌ Documentation or README files
❌ Code comments
❌ Screenshots or screen recordings
❌ Slack/email/messaging apps
❌ Personal devices or cloud storage (Dropbox, Google Drive)
❌ Project management tools (Notion, Asana, Trello)
❌ Wiki pages or Confluence
```

### Development Secrets

**WHERE TO STORE:**
```
✅ .env.local (gitignored) - Mock/dev credentials ONLY
✅ .env.example (Git) - Template with placeholder values
✅ Development Supabase project (separate from production)
```

**Example `.env.local` (Development):**
```bash
# Development Supabase (separate project)
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...dev-service-role-key

# Mock Email Service (logs to console)
RESEND_API_KEY=re_mock_development_key_not_real
MOCK_EMAIL_SERVICE=true

# Mock SMS Service (logs to console)
TWILIO_ACCOUNT_SID=ACtest
TWILIO_AUTH_TOKEN=test_auth_token
MOCK_SMS_SERVICE=true
```

### .env.example Template

**Purpose:** Provide developers with required environment variable names WITHOUT real secrets.

**Rules:**
- ✅ Include ALL required variable names
- ✅ Use placeholder values (e.g., `your-api-key`, `xxxxxxxxxx`)
- ✅ Include comments explaining what each variable does
- ❌ NEVER include real secrets
- ✅ Safe to commit to Git

**Example:**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-role-key

# Resend Email Service
RESEND_API_KEY=re_YourResendApiKey
FROM_EMAIL=noreply@pinkautoglass.com

# Admin Notifications
ADMIN_EMAIL=admin@pinkautoglass.com
```

---

## Rotation Schedule

### Mandatory Rotation Frequencies

| Secret Type | Frequency | Owner | Next Due |
|-------------|-----------|-------|----------|
| Database passwords | 90 days | Tech Lead | 2026-01-27 |
| Supabase service role key | 90 days | Tech Lead | 2026-01-27 |
| Twilio auth token | 180 days | Operations | 2026-04-27 |
| RingCentral credentials | 180 days | Operations | 2026-04-27 |
| Resend API key | 180 days | Operations | 2026-04-27 |
| Supabase anon key | 180 days | Tech Lead | 2026-04-27 |
| Form integrity secrets | 90 days | Security Officer | 2026-01-27 |

### Emergency Rotation

**Rotate IMMEDIATELY if:**
- Secret leaked in Git commit
- Secret exposed in logs or error messages
- Secret shared via insecure channel (email, Slack)
- Suspicious activity detected in service logs
- Team member with access leaves company
- Third-party service breach reported
- Regulatory requirement or audit finding

### Rotation Procedure

**Standard Rotation (Scheduled):**

1. **Generate New Secret:**
   ```bash
   # Example: Supabase Service Role Key
   # In Supabase Dashboard:
   # Settings → API → Generate New Service Role Key
   # Copy new key to clipboard
   ```

2. **Add New Secret to Vercel (with suffix):**
   ```bash
   vercel env add SUPABASE_SERVICE_ROLE_KEY_NEW production
   # Paste new key when prompted
   ```

3. **Update Application Code (Fallback Support):**
   ```typescript
   // src/lib/supabase.ts
   const serviceRoleKey =
     process.env.SUPABASE_SERVICE_ROLE_KEY_NEW ||
     process.env.SUPABASE_SERVICE_ROLE_KEY;
   ```

4. **Deploy and Verify:**
   ```bash
   vercel --prod --force
   # Test application functionality
   # Monitor logs for errors
   ```

5. **Remove Old Secret:**
   ```bash
   # Wait 24 hours to ensure stability
   vercel env rm SUPABASE_SERVICE_ROLE_KEY production
   vercel env add SUPABASE_SERVICE_ROLE_KEY production
   # Paste new key (remove _NEW suffix)
   ```

6. **Update Code (Remove Fallback):**
   ```typescript
   // src/lib/supabase.ts
   const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
   ```

7. **Deploy Final Version:**
   ```bash
   vercel --prod --force
   ```

8. **Document Rotation:**
   - Update rotation log (date, who, what)
   - Set calendar reminder for next rotation
   - Invalidate old secret in service dashboard

**Emergency Rotation (Breach):**

1. **IMMEDIATE Invalidation (within 15 minutes):**
   - Revoke compromised secret in service dashboard
   - Do NOT wait for new secret to be configured

2. **Generate and Deploy New Secret (within 1 hour):**
   ```bash
   # Generate new secret
   # Update Vercel immediately
   vercel env add SECRET_NAME production
   # Force redeploy
   vercel --prod --force
   ```

3. **Audit Access Logs:**
   - Review last 30 days of service logs
   - Identify unauthorized usage
   - Document findings

4. **File Incident Report:**
   - Use template in SECURITY_POLICIES.md
   - Notify security officer and management
   - Post-mortem within 5 days

---

## Access Control

### Who Can Access Secrets?

**Production Secrets:**
- ✅ Tech Lead (full access)
- ✅ DevOps Engineer (read-only, emergency rotation)
- ✅ Security Officer (audit, rotation)
- ❌ Developers (no direct access - use development secrets)
- ❌ Contractors (no access without NDA and approval)

**Development Secrets:**
- ✅ All developers (for local development)
- ✅ CI/CD systems (scoped to non-production)
- ⚠️ Must use separate development Supabase project

### Access Review Schedule

**Monthly:**
- Review Vercel team member access
- Review Supabase project members
- Audit environment variable access logs

**Quarterly:**
- Review third-party service access keys
- Audit database connection logs
- Review contractor access (if any)

**Annually:**
- Full access audit across all services
- Review and update access control policies
- Team security awareness training

### Principle of Least Privilege

**Apply to ALL secrets:**
1. Use restricted API keys (not master account keys)
2. Scope keys to specific services/actions only
3. Enable IP allowlisting where possible
4. Use short-lived tokens when available
5. Separate keys for dev/staging/production
6. Monitor usage and set alerts

**Examples:**

**Twilio (GOOD):**
```bash
# Restricted key - can only send SMS, no account management
TWILIO_API_KEY=SK1234... (restricted)
TWILIO_API_SECRET=abc123... (restricted)
```

**Twilio (BAD):**
```bash
# Master credentials - full account access
TWILIO_ACCOUNT_SID=AC1234...
TWILIO_AUTH_TOKEN=abc123... (master)
```

**Stripe (GOOD - When Implemented):**
```bash
# Restricted key - can only create charges
STRIPE_RESTRICTED_KEY=rk_live_... (write:charges only)
```

**Stripe (BAD):**
```bash
# Secret key - full access including refunds
STRIPE_SECRET_KEY=sk_live_... (full access)
```

---

## Incident Response

### Secret Leak Detection

**Automated Detection:**
- Pre-commit hook (gitleaks) - blocks commits with secrets
- CI/CD pipeline scan - blocks PRs with secrets
- Weekly full repository scan - catches missed secrets

**Manual Detection:**
- Code review checklist includes secret scan
- Quarterly security audit
- Bug bounty program (future)

### Incident Severity Levels

**P0 - CRITICAL (Immediate Action Required):**
- Production database credentials exposed
- Service role key exposed publicly
- Mass breach (>100 customer records at risk)
- Complete service outage due to compromised secrets

**P1 - HIGH (Action Required Within 1 Hour):**
- API key leaked in Git commit
- Individual secret exposed in logs
- Suspicious activity detected in service logs
- Partial service degradation

**P2 - MEDIUM (Action Required Within 4 Hours):**
- Development secret accidentally used in production
- Old secret not properly revoked
- Access control violation (wrong person has access)

**P3 - LOW (Action Required Within 24 Hours):**
- Secret rotation overdue
- Documentation out of date
- Non-sensitive credential exposure

### Response Playbook

**Step 1: Confirm and Classify (5 minutes)**
- Identify which secret was exposed
- Determine if it's in production use
- Classify severity (P0-P3)
- Alert appropriate personnel

**Step 2: Contain (15-60 minutes)**
- **P0/P1:** IMMEDIATELY invalidate secret
- **P2/P3:** Schedule invalidation within policy timeframe
- Generate replacement secret
- Update Vercel environment variables
- Force redeploy

**Step 3: Investigate (1-4 hours)**
- Review service access logs
- Identify unauthorized usage
- Determine exposure scope
- Collect evidence for post-mortem

**Step 4: Remediate (4-24 hours)**
- Complete secret rotation
- Enhance detection mechanisms
- Update documentation
- Team communication

**Step 5: Document (Within 5 days)**
- File incident report
- Post-mortem meeting
- Lessons learned document
- Update runbooks

### Communication Templates

**Internal Alert (Slack/Email):**
```
🚨 SECURITY INCIDENT - P[0-3]: [Secret Type] Exposed

WHAT: [Secret name] was exposed in [location]
WHEN: Detected at [timestamp]
WHO: Discovered by [name]
STATUS: [Contained/Investigating/Remediated]

IMMEDIATE ACTIONS TAKEN:
- [ ] Secret invalidated in service dashboard
- [ ] Replacement secret generated
- [ ] Vercel environment variables updated
- [ ] Production redeployed

NEXT STEPS:
- Access log audit (Owner: [name], Due: [time])
- Post-mortem meeting (Scheduled: [time])
- Policy updates (if needed)

DO NOT REPLY ALL - Respond in thread or DM security officer
```

**Customer Notification (If PII at Risk):**
```
Subject: Important Security Notice - Pink Auto Glass

Dear [Customer Name],

We are writing to inform you of a security incident that may have affected your personal information.

WHAT HAPPENED:
On [date], we discovered that [brief description]. We immediately took action to secure our systems and prevent further unauthorized access.

WHAT INFORMATION WAS INVOLVED:
[List specific data types: name, phone, email, etc.]

WHAT WE'RE DOING:
- Invalidated compromised credentials
- Enhanced security monitoring
- Conducting thorough investigation
- Implementing additional safeguards

WHAT YOU SHOULD DO:
- Monitor your accounts for suspicious activity
- [Additional steps if applicable]

We take your privacy and security seriously. We have notified appropriate authorities and are taking all necessary steps to prevent this from happening again.

For questions or concerns, please contact:
Email: security@pinkautoglass.com
Phone: (720) 918-7465

Sincerely,
Pink Auto Glass Security Team
```

---

## Compliance & Auditing

### Documentation Requirements

**Maintain Records Of:**
- Secret rotation log (date, who, what)
- Access grant/revocation log
- Incident reports (all P0-P3 incidents)
- Audit findings and remediation
- Policy acknowledgments (team signatures)

**Secret Rotation Log Format:**
```
Date: 2025-10-29
Secret: SUPABASE_SERVICE_ROLE_KEY
Action: Rotated (Scheduled)
Performed By: Tech Lead
Old Key Revoked: Yes
Reason: Quarterly rotation
Verification: Tested production deployment - SUCCESS
Next Rotation Due: 2026-01-27
```

**Access Log Format:**
```
Date: 2025-10-29
Action: GRANTED
User: john.doe@pinkautoglass.com
Secrets: RESEND_API_KEY (read-only)
Granted By: Tech Lead
Justification: Email notification feature development
Review Date: 2025-11-29
```

### Audit Schedule

**Weekly (Automated):**
- Gitleaks full repository scan
- Dependency vulnerability scan (npm audit)
- Dead secret detection (unused variables)

**Monthly (Manual):**
- Review Vercel environment variable access
- Review Supabase project member access
- Review secret rotation log for overdue items
- Review incident reports

**Quarterly (Manual):**
- Third-party service access audit
- RLS policy effectiveness review
- Access control policy review
- Secret scope review (least privilege)

**Annually (Manual):**
- Full security audit (internal or third-party)
- Policy document review and update
- Team security training and testing
- Penetration testing (recommended)

### Compliance Checklist

**Before Every Production Deployment:**
- [ ] No secrets in Git history: `git log --all -- .env*`
- [ ] No secrets in code: `grep -r "sk_live\|pk_live\|API_KEY.*=" src/`
- [ ] All environment variables documented in `.env.example`
- [ ] Pre-commit hook functioning: `gitleaks protect --staged`
- [ ] Service role key NOT used in client code
- [ ] All secrets in Vercel environment variables (not `.env.local`)

**Monthly Audit Tasks:**
- [ ] Review Vercel team access (remove inactive members)
- [ ] Review Supabase project access (remove inactive members)
- [ ] Check secret rotation schedule (flag overdue)
- [ ] Review service usage logs for anomalies
- [ ] Update this document if policies changed

**Quarterly Audit Tasks:**
- [ ] Rotate all secrets per schedule
- [ ] Review and update `.env.example` template
- [ ] Test emergency rotation procedure (drill)
- [ ] Review incident reports (lessons learned)
- [ ] Update team training materials

---

## Policy Acknowledgment

All team members must read and acknowledge this policy.

**I acknowledge that I have read and understand the Secrets Management Policy and agree to comply with all requirements.**

**Name:** ______________________________

**Signature:** ______________________________

**Date:** ______________________________

**Role:** ______________________________

---

## Appendix: Secret Generation

### How to Generate Secure Secrets

**Random Hex (32 bytes):**
```bash
# macOS/Linux
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output: 64 character hex string
# Example: 5f8d3c9e2a1b4f7c6e8d9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d
```

**Random Base64 (32 bytes):**
```bash
# macOS/Linux
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Output: 44 character base64 string
# Example: X38d2K1b4F7C6e8D9a0B1c2D3e4F5a6B7c8D9e0F1a2B3c4D5e6F7a8B9c0D=
```

**UUID (for unique identifiers):**
```bash
# macOS/Linux
uuidgen

# Node.js
node -e "console.log(require('crypto').randomUUID())"

# Output: UUID v4
# Example: 550e8400-e29b-41d4-a716-446655440000
```

---

**Policy Version:** 1.0
**Last Updated:** October 29, 2025
**Next Review:** January 29, 2026
**Owner:** Security & Compliance Officer
