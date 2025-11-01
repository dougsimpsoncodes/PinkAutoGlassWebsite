# Incident Response Playbook
**Pink Auto Glass**
**Version:** 1.0
**Last Updated:** October 29, 2025

---

## Quick Reference

| Incident Type | Severity | Response Time | Primary Contact |
|---------------|----------|---------------|-----------------|
| Secret Leak (Production) | P0 | Immediate | Security Officer |
| Data Breach (>100 records) | P0 | Immediate | Security Officer + Legal |
| Service Outage | P0 | Immediate | Tech Lead |
| DDoS/Rate Limit Abuse | P1 | 1 hour | DevOps Lead |
| Secret Leak (Development) | P1 | 1 hour | Tech Lead |
| SMS/Email Abuse | P2 | 4 hours | Operations |
| Dependency Vulnerability | P3 | 24 hours | Tech Lead |

---

## Table of Contents

1. [Secret Leak Response](#1-secret-leak-response-p0-critical)
2. [Data Breach Response](#2-data-breach-response-p0-critical)
3. [DDoS/Rate Limit Abuse](#3-ddosrate-limit-abuse-p1-high)
4. [SMS/Email Service Abuse](#4-smsemail-service-abuse-p2-medium)
5. [Database Compromise](#5-database-compromise-p0-critical)
6. [Dependency Vulnerability](#6-dependency-vulnerability-p3-low)
7. [General Incident Workflow](#7-general-incident-workflow)

---

## 1. Secret Leak Response (P0 - CRITICAL)

### Scenario
Production API key, database credential, or service role key exposed in Git, logs, or publicly accessible location.

### Detection Methods
- Pre-commit hook blocked commit (gitleaks)
- CI/CD pipeline failure
- GitHub Security Alert
- Manual code review discovery
- Third-party security researcher report
- Unusual service activity detected

### Response Timeline

#### 0-15 Minutes: IMMEDIATE CONTAINMENT

**1. STOP ALL WORK**
- Do NOT push additional commits
- Do NOT attempt to "fix" by deleting file
- Do NOT force push to rewrite history (yet)

**2. Identify Exposure Scope**
```bash
# Check if secret is in Git history
cd /Users/dougsimpson/Projects/pinkautoglasswebsite
git log --all --full-history -- .env.local
git log --all --full-history -- .env.production
git log --all --full-history -S "EXPOSED_SECRET_VALUE"

# Check if pushed to remote
git log origin/main --since="1 week ago"
```

**3. Alert Response Team**
```
TO: security@pinkautoglass.com, techLead@pinkautoglass.com
SUBJECT: P0 SECURITY INCIDENT - Secret Leak Detected

WHAT: [Secret type: Supabase Service Role Key / Database Password / etc.]
WHERE: [.env.local / Git commit abc123 / Production logs / etc.]
WHEN: Detected at [timestamp]
REMOTE: [YES - Pushed to GitHub / NO - Local only]
PRODUCTION: [YES - Currently in use / NO - Development only]

IMMEDIATE ACTION REQUIRED - Do not reply, join incident call
Slack: #incident-response
Zoom: [link]
```

**4. IMMEDIATELY Invalidate Secret**

**Supabase Service Role Key:**
```bash
# Dashboard → Settings → API → "Reset service_role secret"
# Click "Generate new secret"
# IMMEDIATELY click "Revoke old secret"
```

**Database Password:**
```bash
# Supabase Dashboard → Settings → Database
# Click "Reset database password"
# Copy new connection string
```

**Twilio Auth Token:**
```bash
# Twilio Console → Account → API Credentials
# Click "Reset Auth Token"
# Confirm: "Yes, reset my Auth Token"
```

**RingCentral JWT:**
```bash
# RingCentral Admin → Apps → [Your App]
# Settings → Security → "Regenerate JWT Token"
```

**Resend API Key:**
```bash
# Resend Dashboard → Settings → API Keys
# Create new key
# Delete old key immediately
```

⏰ **Target: 15 minutes from detection**

#### 15-60 Minutes: RAPID RECOVERY

**5. Deploy New Secret to Production**
```bash
# Update Vercel environment variables
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste NEW secret when prompted

# Force production redeploy (no code changes needed)
vercel --prod --force

# Monitor deployment logs
vercel logs pinkautoglass.com --follow
```

**6. Verify Service Functionality**
```bash
# Test critical endpoints
curl -X POST https://pinkautoglass.com/api/lead \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","phone":"5555555555","email":"test@test.com","vehicleYear":2020,"vehicleMake":"Toyota","vehicleModel":"Camry","serviceType":"repair","mobileService":false}'

# Expected: 200 OK with success message
```

**7. Audit Service Logs for Unauthorized Access**

**Supabase (Database Access):**
```bash
# Dashboard → Logs → Database
# Filter: Last 30 days
# Look for:
#   - Unusual SELECT * queries
#   - DELETE/UPDATE operations
#   - Queries from unknown IP addresses
#   - Off-hours access (2am-6am)
```

**Twilio (SMS Usage):**
```bash
# Console → Monitor → Logs → Messages
# Filter: Last 30 days
# Look for:
#   - Messages to unknown numbers
#   - High volume sends (>50/hour)
#   - Messages outside business hours
```

**RingCentral (SMS Usage):**
```bash
# Admin Portal → Reports → Message Reports
# Look for unusual send patterns
```

**Resend (Email Usage):**
```bash
# Dashboard → Logs
# Filter: Last 30 days
# Look for:
#   - Emails to external domains
#   - High volume sends
#   - Unusual subject lines
```

⏰ **Target: 1 hour from detection**

#### 1-4 Hours: INVESTIGATION

**8. Determine Root Cause**
```bash
# If in Git history, find when it was added
git log --all --diff-filter=A -- .env.local
git blame .env.local

# Review commits that touched the file
git log -p -- .env.local

# Check who committed
git log --format='%an <%ae>' -- .env.local | sort -u
```

**9. Assess Impact**
- [ ] Was secret used by unauthorized parties? (Check logs)
- [ ] Was customer data accessed? (Database logs)
- [ ] Were unauthorized SMS/emails sent? (Service logs)
- [ ] What is the time window of exposure?
- [ ] How many people/systems had access?

**10. Document Findings**
```markdown
# Incident Report: Secret Leak

**Incident ID:** INC-2025-001
**Date/Time:** 2025-10-29 14:30:00 UTC
**Severity:** P0 - Critical
**Status:** Contained

## Summary
Production Supabase service role key exposed in .env.local file.

## Timeline
- 14:30 - Secret leaked in commit abc123
- 14:35 - Detected by developer during code review
- 14:37 - Security officer alerted
- 14:40 - Secret invalidated in Supabase Dashboard
- 14:45 - New secret deployed to Vercel
- 14:50 - Production service verified operational
- 15:00 - Database logs audited (no unauthorized access found)

## Root Cause
Developer accidentally used production credentials in local development.

## Impact
- No customer data accessed
- No unauthorized database queries detected
- Exposure window: 5 minutes (local only, not pushed to GitHub)
- Risk level: Low (caught before remote push)

## Actions Taken
- [x] Secret invalidated immediately
- [x] New secret generated and deployed
- [x] Database logs audited
- [x] Team notified of proper procedures

## Lessons Learned
- Need stronger warning in .env.example
- Consider separate Supabase projects for dev/prod
- Add pre-commit hook check for production URLs

## Follow-Up Actions
- [ ] Update .env.example with warnings (Due: Tomorrow)
- [ ] Team training on secret management (Due: This week)
- [ ] Create separate dev Supabase project (Due: Next week)
```

⏰ **Target: 4 hours from detection**

#### 4-24 Hours: REMEDIATION

**11. Clean Git History (If Pushed to Remote)**

⚠️ **WARNING: This rewrites history. Coordinate with entire team.**

```bash
# Backup current state
git branch backup-before-rewrite

# Remove file from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Force push to all remotes
git push origin --force --all
git push origin --force --tags

# Team notification: Everyone must re-clone
```

**Team Communication:**
```
URGENT: Git History Rewrite Completed

A production secret was accidentally committed. We have rewritten Git history to remove it.

ACTION REQUIRED BY ALL DEVELOPERS:
1. Commit and push any local work (if possible)
2. Delete your local repository
3. Re-clone from GitHub: git clone [url]
4. Re-apply any uncommitted changes

DO NOT:
- Pull/merge (will fail)
- Force push from old clone
- Work from old local copy

Questions? DM Tech Lead immediately.
```

**12. Enhance Detection Mechanisms**
```bash
# Ensure pre-commit hook is working
gitleaks protect --staged --verbose

# Test with a fake secret
echo "SUPABASE_SERVICE_ROLE_KEY=abc123" > test-secret.env
git add test-secret.env
git commit -m "test"
# Should be BLOCKED by pre-commit hook
git reset HEAD~1
rm test-secret.env
```

**13. Update Documentation**
- [ ] Update SECRETS_MANAGEMENT_POLICY.md with new procedures
- [ ] Add this incident to lessons learned
- [ ] Update .env.example with clearer warnings
- [ ] Create "Secret Leak Response" quick reference card

⏰ **Target: 24 hours from detection**

#### 5 Days: POST-MORTEM

**14. Conduct Post-Mortem Meeting**

**Agenda:**
1. Incident timeline walkthrough
2. What went well?
3. What went poorly?
4. Root cause analysis (5 Whys)
5. Corrective actions (specific, assigned, due dates)

**5 Whys Example:**
```
Why was production secret in .env.local?
→ Developer was testing SMS feature locally

Why were production credentials used for testing?
→ Development Supabase project doesn't have SMS configured

Why doesn't dev project have SMS?
→ We don't have separate RingCentral dev account

Why don't we have separate dev account?
→ Not prioritized during initial setup

Why wasn't it prioritized?
→ No clear policy on environment separation

ROOT CAUSE: Lack of environment separation policy
```

**15. Implement Corrective Actions**
- [ ] Create separate Supabase projects (dev/staging/prod)
- [ ] Set up mock SMS service for development
- [ ] Add environment separation to onboarding checklist
- [ ] Schedule quarterly secret management training

---

## 2. Data Breach Response (P0 - CRITICAL)

### Scenario
Unauthorized access to customer PII (names, phone numbers, emails, addresses, payment info).

### Detection Methods
- Unusual database query patterns
- Security researcher report
- Customer complaint
- Service log anomalies
- Third-party breach notification

### Response Timeline

#### 0-1 Hour: IMMEDIATE CONTAINMENT

**1. Confirm Breach Occurred**
```sql
-- Run in Supabase SQL Editor
-- Check for unusual queries (if logging enabled)
SELECT
  timestamp,
  user_id,
  query,
  ip_address
FROM pg_stat_statements
WHERE query LIKE '%leads%'
  AND timestamp > NOW() - INTERVAL '30 days'
ORDER BY timestamp DESC;
```

**2. Stop the Leak**
- Revoke compromised credentials (see Secret Leak Response)
- Close vulnerability (SQL injection, RLS bypass, etc.)
- Isolate affected systems if necessary

**3. Alert Leadership IMMEDIATELY**
```
TO: CEO, CTO, Legal Counsel, Security Officer
SUBJECT: P0 DATA BREACH - Immediate Action Required

CONFIRMED: Unauthorized access to customer data

SCOPE:
- Records affected: [Estimated number]
- Data types: [Name, phone, email, address, etc.]
- Time window: [When breach occurred]
- Attack vector: [How access was gained]

CONTAINMENT STATUS:
- [x] Vulnerability closed
- [x] Compromised credentials revoked
- [ ] Forensics underway
- [ ] Customer notification pending

Legal counsel and security officer must join incident call immediately.
Zoom: [link]
```

#### 1-4 Hours: INVESTIGATION

**4. Preserve Evidence**
```bash
# Export database logs
# DO NOT delete or modify any logs

# Supabase Dashboard → Logs → Database → Export CSV

# Export access logs
# Vercel Dashboard → Logs → Download

# Document everything
# Screenshots, timestamps, IP addresses
```

**5. Determine Breach Scope**
```sql
-- Identify accessed records
-- (Example query - adjust based on attack vector)
SELECT
  id,
  created_at,
  first_name,
  last_name,
  phone,
  email
FROM leads
WHERE created_at BETWEEN 'breach_start' AND 'breach_end'
ORDER BY created_at;

-- Export list of affected customers
\copy (SELECT email FROM leads WHERE ...) TO 'affected_customers.csv' CSV HEADER
```

**6. Assess Legal Requirements**

**CCPA (California):**
- Notify affected California residents within 30 days (if PII + sensitive data)
- Email notification required if >500 residents affected

**Other States:**
- Check state-specific breach notification laws
- Timeline: Typically 30-90 days

**Federal (FTC):**
- No federal requirement (yet) but FTC can investigate
- Document all breach response activities

#### 4-72 Hours: NOTIFICATION

**7. Prepare Customer Notification**

**Required Elements:**
- What happened (brief, non-technical)
- What information was involved
- When breach occurred
- What company is doing
- What customer should do
- Contact information for questions

**Template:**
```
Subject: Important Security Notice from Pink Auto Glass

Dear [Customer Name],

We are writing to inform you of a security incident that may have affected your personal information.

WHAT HAPPENED:
On [date], we discovered that an unauthorized party gained access to our customer database. We immediately secured our systems and launched an investigation.

WHAT INFORMATION WAS INVOLVED:
Your name, phone number, email address, and vehicle information (year, make, model) may have been accessed.

[If payment data] Your payment card information WAS NOT affected as we do not store credit card numbers in our database.

WHAT WE'RE DOING:
- We have closed the security vulnerability
- We are working with cybersecurity experts to investigate
- We have implemented additional security measures
- We have notified law enforcement

WHAT YOU SHOULD DO:
- Be cautious of phishing emails or calls pretending to be Pink Auto Glass
- We will NEVER call and ask for your credit card or password
- Monitor your accounts for any suspicious activity
- If you receive a suspicious call or email, verify it by calling us at (720) 918-7465

We sincerely apologize for this incident and any concern it may cause. We take your privacy and security very seriously.

For questions or concerns, please contact:
Email: security@pinkautoglass.com
Phone: (720) 918-7465

Sincerely,
[Name]
Owner, Pink Auto Glass
```

**8. File Required Reports**

**California Attorney General (if >500 CA residents):**
- Online form: https://oag.ca.gov/privacy/databreach/reporting
- Deadline: Without unreasonable delay

**Credit Bureaus (if SSN/financial data - not applicable to Pink Auto Glass):**
- Equifax, Experian, TransUnion

**FTC (Recommended):**
- Report at: https://www.ftccomplaintassistant.gov/

**9. Public Disclosure (If Required)**
- Blog post or press release if widespread
- Status page update
- FAQ document for customer service team

#### 72 Hours - 30 Days: REMEDIATION

**10. Third-Party Security Audit**
- Hire external firm (e.g., TrustedSec, Bishop Fox)
- Penetration testing
- Code review
- Infrastructure review

**11. Implement Security Enhancements**
- Patch vulnerability
- Add monitoring/alerting
- Enhance access controls
- Implement data encryption (if not already)
- Review and strengthen RLS policies

**12. Team Training**
- Security awareness training
- Secure coding practices
- Incident response drills

**13. Customer Support**
- Dedicated hotline or email
- FAQ document
- Offer credit monitoring if appropriate (depends on data type)

#### 30+ Days: LONG-TERM

**14. Post-Mortem and Policy Updates**
- Comprehensive post-mortem document
- Update security policies
- Update incident response procedures
- Schedule quarterly breach drills

**15. Ongoing Monitoring**
- Enhanced security monitoring
- Regular vulnerability assessments
- Bug bounty program (consider)

---

## 3. DDoS/Rate Limit Abuse (P1 - HIGH)

### Scenario
High volume of requests overwhelming API endpoints, causing performance degradation or service outage.

### Detection
- Vercel Analytics showing traffic spike
- Elevated error rates (429, 500)
- Rate limit triggers in logs
- Customer reports of slow site

### Response

#### 0-15 Minutes: DETECTION

**1. Confirm Attack Pattern**
```bash
# Check Vercel logs for patterns
vercel logs pinkautoglass.com | grep "429\|500"

# Look for:
# - Same IP making many requests
# - Same User-Agent pattern
# - Requests to specific endpoint
# - Geographic origin (unusual location)
```

**2. Identify Attack Vector**
```bash
# Most common targets:
# /api/lead (lead submission)
# /api/booking/submit (booking form)
# /api/vehicles/* (vehicle data)

# Check which endpoint is being hit
vercel logs pinkautoglass.com | grep "POST /api" | sort | uniq -c | sort -rn
```

#### 15-60 Minutes: MITIGATION

**3. Enable Additional Protection**

**Option A: Lower Rate Limits (Temporary)**
```typescript
// src/lib/supabase.ts (if using in-memory rate limiting)
// Change from 10 requests/minute to 5 requests/minute
export function checkRateLimit(
  ipAddress: string,
  maxRequests: number = 5, // Lowered from 10
  windowMs: number = 60000
) { ... }
```

**Option B: Enable CAPTCHA (If Not Already)**
```typescript
// Add to booking form if attack continues
<ReCAPTCHA
  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
  onChange={setCaptchaToken}
/>
```

**Option C: Block IP Ranges (Vercel)**
```json
// vercel.json
{
  "headers": [{
    "source": "/api/:path*",
    "headers": [{
      "key": "X-Robots-Tag",
      "value": "noindex"
    }]
  }]
}
```

**Option D: Use Vercel Firewall (Enterprise)**
- Dashboard → Settings → Firewall
- Block specific IP ranges or countries

**4. Monitor Resource Usage**
```bash
# Check Supabase Database
# Dashboard → Database → Usage
# Look for: High connection count, CPU usage

# Check Storage
# Dashboard → Storage → Usage
# Prevent quota exhaustion

# Check Vercel Usage
# Dashboard → Usage
# Monitor bandwidth costs
```

**5. Clean Spam Submissions**
```sql
-- Identify spam leads (if many created)
SELECT * FROM leads
WHERE created_at > NOW() - INTERVAL '1 hour'
  AND (
    email LIKE '%test%' OR
    first_name = last_name OR
    phone = '5555555555'
  );

-- Soft delete spam (don't hard delete - forensics)
UPDATE leads
SET status = 'spam', updated_at = NOW()
WHERE id IN (...);
```

#### 1-4 Hours: RECOVERY

**6. Restore Normal Operations**
```bash
# Once attack subsides:
# - Restore normal rate limits
# - Remove emergency IP blocks
# - Monitor for resumed attack

# Deploy rate limit restoration
vercel --prod --force
```

**7. Document Attack Pattern**
```markdown
# DDoS Attack Report

**Date:** 2025-10-29
**Duration:** 14:00 - 15:30 UTC (90 minutes)
**Target:** /api/lead endpoint
**Volume:** ~10,000 requests/minute (vs normal 5/minute)

## Attack Pattern
- User-Agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
- IP Range: 123.45.67.0/24 (Likely botnet)
- Payload: Valid-looking lead data (automated)
- Rate: Steady 10,000 req/min

## Mitigation
- 14:15 - Lowered rate limits (10 → 5 req/min)
- 14:30 - Enabled stricter honeypot validation
- 14:45 - Attack traffic dropped by 90%
- 15:30 - Attack ended

## Impact
- 90 minutes of elevated error rates (429)
- No service outage
- ~10 spam leads created (cleaned)
- Bandwidth overage: $12 (acceptable)

## Prevention
- [ ] Implement Cloudflare in front of Vercel
- [ ] Add progressive CAPTCHA challenge
- [ ] Consider IP reputation service
```

---

## 4. SMS/Email Service Abuse (P2 - MEDIUM)

### Scenario
Unauthorized or excessive SMS/email sending from your accounts.

### Detection
- High volume of sent messages in service dashboard
- Customer complaints about spam
- Service usage alerts triggered
- Unexpected billing charges

### Response

#### 0-30 Minutes: CONTAINMENT

**1. Suspend Sending (Temporarily)**

**Twilio:**
```bash
# Twilio Console → Phone Numbers → [Your Number]
# Set to: "Incoming calls and messages only"
# Temporarily disable outbound
```

**RingCentral:**
```bash
# Admin Portal → Phone System → Phones & Numbers
# Suspend number or disable SMS feature
```

**Resend:**
```bash
# Dashboard → API Keys
# Delete active key (breaks sending)
# Investigate before re-enabling
```

**2. Review Recent Messages**

**Twilio:**
```bash
# Console → Monitor → Logs → Messages
# Filter: Last 24 hours, Status: Sent
# Export CSV for analysis
```

**Look for:**
- Messages to unknown recipients
- Unusual message content
- High volume sends
- Off-hours activity (2am-6am)

**3. Identify Abuse Source**

**Possible Causes:**
- Compromised API key (check secret management)
- Vulnerability in notification code
- Legitimate spike (viral post, PR mention)

#### 30 Minutes - 2 Hours: INVESTIGATION

**4. Audit Code Paths**
```typescript
// Check who can trigger SMS/email:

// src/lib/notifications/sms.ts
// Look for: Unvalidated inputs, missing rate limits

// src/lib/notifications/email.ts
// Look for: Open relay potential, injection

// src/app/api/lead/route.ts
// Verify: Rate limiting, input validation
```

**5. Check Application Logs**
```bash
# Vercel logs for notification triggers
vercel logs pinkautoglass.com | grep "SMS sent\|Email sent"

# Look for:
# - IP addresses (are they normal?)
# - Request frequency (burst patterns?)
# - Form submissions (legitimate or spam?)
```

**6. Assess Damage**

**Customer Impact:**
- How many recipients affected?
- Message content (spam, phishing, legitimate?)
- Reputation damage potential

**Financial Impact:**
```
Twilio: $0.0075/SMS × 10,000 messages = $75
RingCentral: Included in plan or per-message charge
Resend: $0.50/1,000 emails × 10,000 = $5
```

#### 2-8 Hours: REMEDIATION

**7. Rotate Credentials**
```bash
# Follow Secret Leak Response procedure
# Rotate ALL messaging service credentials
```

**8. Implement Additional Controls**

**Add Rate Limiting:**
```typescript
// src/lib/notifications/email.ts
import { checkRateLimit } from '@/lib/supabase';

export async function sendAdminEmail(subject: string, html: string) {
  // Add rate limit: max 10 emails per hour
  const rateLimit = checkRateLimit('admin-email', 10, 3600000);
  if (!rateLimit.allowed) {
    console.warn('Admin email rate limit exceeded');
    return false;
  }

  // Send email...
}
```

**Add CAPTCHA:**
```typescript
// On lead form if not already present
// Prevents automated abuse
```

**Add Honeypot:**
```typescript
// Already implemented in leadFormSchema
// Ensure it's active and working
```

**9. Apologize to Recipients (If Spam Sent)**
```
Subject: Apology from Pink Auto Glass

Dear Customer,

You may have received an unexpected message from Pink Auto Glass today. We experienced a security issue that resulted in unauthorized messages being sent.

We have resolved the issue and implemented additional safeguards to prevent this from happening again.

We sincerely apologize for any inconvenience.

If you have any questions or concerns, please contact us at (720) 918-7465 or security@pinkautoglass.com.

Sincerely,
Pink Auto Glass Team
```

**10. Resume Normal Operations**
```bash
# Re-enable sending after:
# - Credentials rotated
# - Code vulnerabilities fixed
# - Additional controls implemented
# - Monitoring enhanced

# Test with limited sending first
# Monitor closely for 24 hours
```

---

## 5. Database Compromise (P0 - CRITICAL)

### Scenario
Direct database access by unauthorized party (SQL injection, credential theft, misconfigured RLS).

### Response

Follow **Secret Leak Response** AND **Data Breach Response** procedures.

**Additional Database-Specific Steps:**

1. **Immediate Database Lockdown**
```sql
-- Revoke public access (if misconfigured)
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;

-- Check current sessions
SELECT * FROM pg_stat_activity WHERE datname = 'postgres';

-- Terminate suspicious sessions
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'postgres'
  AND pid <> pg_backend_pid()
  AND query LIKE '%DROP%' OR query LIKE '%DELETE FROM leads%';
```

2. **Backup Current State**
```bash
# Supabase Dashboard → Database → Backups
# Create manual backup before changes
```

3. **Audit RLS Policies**
```sql
-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Verify policies exist
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

4. **Review Query Logs**
```sql
-- Check for malicious queries (if logging enabled)
SELECT *
FROM pg_stat_statements
WHERE query LIKE '%DROP%'
   OR query LIKE '%DELETE FROM%'
   OR query LIKE '%UPDATE%'
ORDER BY calls DESC;
```

5. **Restore from Backup (If Data Corrupted)**
```bash
# Supabase Dashboard → Database → Backups
# Select backup before attack
# Click "Restore"
# Confirm (THIS WILL OVERWRITE CURRENT DATA)
```

---

## 6. Dependency Vulnerability (P3 - LOW)

### Scenario
`npm audit` reports vulnerability in dependency.

### Response

#### 0-4 Hours: ASSESSMENT

**1. Run Audit**
```bash
npm audit

# Output example:
# found 3 vulnerabilities (1 low, 2 moderate)
```

**2. Check Severity**
```bash
npm audit --audit-level=moderate

# Critical/High: Immediate action
# Moderate: Fix within 24 hours
# Low: Fix within 1 week
```

**3. Determine If Exploitable**
```bash
# Check if vulnerable code path is used
npm audit --json | jq '.vulnerabilities'

# Research CVE details
# Is this dependency used in production?
# Can it be reached by attackers?
```

#### 4-24 Hours: REMEDIATION

**4. Update Dependencies**
```bash
# Auto-fix (safe updates)
npm audit fix

# Manual update if needed
npm install package-name@latest

# Test application
npm run build
npm test
```

**5. If No Fix Available**

**Option A: Pin to Safe Version**
```json
// package.json
{
  "dependencies": {
    "vulnerable-package": "1.2.3"
  },
  "overrides": {
    "vulnerable-package": "1.2.3"
  }
}
```

**Option B: Replace Package**
```bash
npm uninstall vulnerable-package
npm install alternative-package
# Update code to use new package
```

**Option C: Accept Risk (Documented)**
```bash
# If:
# - Vulnerability not exploitable in our use case
# - No fix available
# - No alternative package

# Document:
# - Why accepting risk
# - Mitigation measures
# - Review date
```

**6. Verify Fix**
```bash
npm audit
# Should show 0 vulnerabilities (or reduced count)

npm run build
npm test
# Verify application still works
```

**7. Deploy**
```bash
# Update lockfile
npm install

# Commit
git add package.json package-lock.json
git commit -m "fix: update dependencies to address vulnerabilities"

# Deploy
vercel --prod
```

---

## 7. General Incident Workflow

### Incident Lifecycle

```
DETECT → ALERT → ASSESS → CONTAIN → INVESTIGATE → REMEDIATE → DOCUMENT
```

### Severity Definitions

**P0 - CRITICAL:**
- Production database compromised
- Service role key exposed publicly
- Mass data breach (>100 records)
- Complete service outage
- **Response Time:** Immediate (drop everything)
- **Escalation:** CEO, Legal, Security Officer

**P1 - HIGH:**
- API key leaked
- Individual data breach (<100 records)
- Partial service degradation
- Active attack in progress
- **Response Time:** 1 hour
- **Escalation:** CTO, Tech Lead, Security Officer

**P2 - MEDIUM:**
- Rate limit abuse
- Spam submissions
- Non-sensitive data exposure
- Development secret leaked
- **Response Time:** 4 hours
- **Escalation:** Tech Lead, Operations

**P3 - LOW:**
- Dependency vulnerability (no active exploit)
- Minor configuration issues
- Logging/monitoring failures
- **Response Time:** 24 hours
- **Escalation:** Assigned engineer

### Communication Protocols

**Internal (Team):**
```
Slack Channel: #incident-response
Email: security@pinkautoglass.com
Zoom: [standing incident response room]

Update Frequency:
- P0: Every 30 minutes
- P1: Every 2 hours
- P2: Every 4 hours
- P3: Daily
```

**External (Customers):**
```
Email: service@pinkautoglass.com
Phone: (720) 918-7465
Status Page: https://status.pinkautoglass.com (future)

Notification Required:
- P0: Always (within 72 hours)
- P1: If customer data affected
- P2/P3: Generally not required
```

### Post-Incident Checklist

After EVERY P0/P1 incident:

- [ ] Incident timeline documented
- [ ] Post-mortem meeting scheduled (within 5 days)
- [ ] Root cause analysis completed (5 Whys)
- [ ] Corrective actions identified (specific, assigned, due dates)
- [ ] Team communication (lessons learned)
- [ ] Policies updated (if needed)
- [ ] Monitoring/alerting enhanced
- [ ] Follow-up review scheduled (30 days)

---

## Emergency Contacts

**Internal:**
- Security Officer: [To be assigned]
- Tech Lead: [To be assigned]
- CEO: [To be assigned]
- Legal Counsel: [To be assigned]

**External Services:**
- Vercel Support: support@vercel.com
- Supabase Support: support@supabase.com
- Twilio Support: help.twilio.com
- RingCentral Support: support.ringcentral.com
- Resend Support: support@resend.com

**Law Enforcement:**
- FBI Cyber Division: https://www.ic3.gov/
- Local Police (Non-Emergency): [Local number]

---

## Training & Drills

**Monthly:**
- Review this playbook with team
- Update contact information
- Test alert mechanisms

**Quarterly:**
- Conduct table-top exercise (simulate breach)
- Test emergency procedures
- Update playbook based on learnings

**Annually:**
- Full incident response drill
- External security assessment
- Team security training

---

**Playbook Version:** 1.0
**Last Updated:** October 29, 2025
**Next Review:** January 29, 2026
**Owner:** Security & Compliance Officer
