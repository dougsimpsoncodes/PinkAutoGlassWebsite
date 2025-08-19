# Secrets Management Policy
## Pink Auto Glass Security Baseline

### Overview
This document establishes the comprehensive secrets management policy for Pink Auto Glass, covering environment variables, API keys, database credentials, and all sensitive configuration data.

### Environment Variable Strategy

#### Core Principles
1. **Never commit secrets to version control** - All sensitive data must be stored in environment variables or secure vaults
2. **Environment isolation** - Separate secrets for development, staging, and production environments
3. **Principle of least privilege** - Each service receives only the minimum required permissions
4. **Regular rotation** - All secrets follow mandatory rotation schedules

#### Environment Variable Naming Convention
```bash
# Format: SERVICE_ENVIRONMENT_PURPOSE_TYPE
SUPABASE_PROD_URL=https://your-project.supabase.co
SUPABASE_PROD_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SUPABASE_PROD_SERVICE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
TWILIO_PROD_ACCOUNT_SID=AC********************************
TWILIO_PROD_AUTH_TOKEN=********************************
STRIPE_PROD_PUBLIC_KEY=pk_live_****************************
STRIPE_PROD_SECRET_KEY=sk_live_****************************
NEXTAUTH_SECRET=************************************************
```

#### Environment-Specific Configurations
**Development Environment:**
```bash
# Local development - stored in .env.local (gitignored)
SUPABASE_DEV_URL=https://dev-project.supabase.co
SUPABASE_DEV_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
TWILIO_DEV_ACCOUNT_SID=AC********************************
STRIPE_DEV_PUBLIC_KEY=pk_test_**************************
NEXT_PUBLIC_ENVIRONMENT=development
```

**Production Environment:**
```bash
# Vercel production - stored in Vercel environment variables
SUPABASE_PROD_URL=https://prod-project.supabase.co
SUPABASE_PROD_SERVICE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
TWILIO_PROD_ACCOUNT_SID=AC********************************
STRIPE_PROD_SECRET_KEY=sk_live_****************************
NEXT_PUBLIC_ENVIRONMENT=production
```

### Secret Rotation Cadence and Procedures

#### Rotation Schedule
| Service | Rotation Frequency | Critical Rotation |
|---------|-------------------|------------------|
| Supabase Service Keys | 90 days | 24 hours |
| Twilio Auth Tokens | 180 days | 48 hours |
| Stripe API Keys | 365 days | 72 hours |
| NextAuth Secrets | 180 days | 24 hours |
| Database Passwords | 90 days | 12 hours |

#### Rotation Procedures

**Supabase Key Rotation:**
1. Generate new service key in Supabase dashboard
2. Update Vercel environment variables
3. Deploy and verify functionality
4. Revoke old key after 24-hour grace period
5. Update documentation and team notifications

**Twilio Token Rotation:**
1. Generate new auth token in Twilio console
2. Update environment variables in all environments
3. Test SMS functionality thoroughly
4. Revoke old token after verification
5. Monitor for any failed requests

**Stripe Key Rotation:**
1. Generate new restricted API key with minimal permissions
2. Update production environment variables
3. Verify payment processing functionality
4. Monitor webhook deliveries
5. Revoke old key after 72-hour verification period

### Least Privilege Access Principles

#### Service Account Permissions

**Supabase Service Role:**
```sql
-- Minimal permissions for Pink Auto Glass service
GRANT SELECT, INSERT, UPDATE ON leads TO service_role;
GRANT SELECT, INSERT, DELETE ON media TO service_role;
GRANT SELECT ON public.vehicles TO service_role;
-- Explicitly deny access to auth.users and sensitive tables
```

**Supabase Anonymous Role:**
```sql
-- Read-only access for public data
GRANT SELECT ON public.vehicles TO anon;
GRANT SELECT ON public.services TO anon;
-- No access to leads or media tables
```

**Twilio Service Restrictions:**
- SMS sending only to US phone numbers
- Rate limit: 100 messages per hour
- Webhook signature verification required
- No voice call permissions

**Stripe Restricted Keys:**
```javascript
// Production key with minimal scope
{
  "permissions": [
    "read_charges",
    "write_charges",
    "read_payment_intents",
    "write_payment_intents",
    "read_customers"
  ],
  "restricted_to": {
    "accounts": ["acct_PRODUCTION_ACCOUNT_ID"]
  }
}
```

### Key Management by Service

#### Supabase Security Configuration
**Service Key Management:**
- Use service key only for server-side operations
- Never expose service key to client-side code
- Implement row-level security (RLS) policies
- Regular audit of database permissions

**RLS Policy Examples:**
```sql
-- Leads table security
CREATE POLICY "Service can manage leads" ON leads
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "No anonymous access to leads" ON leads
  FOR ALL TO anon
  USING (false);
```

#### Twilio Security Configuration
**Account Security:**
- Enable two-factor authentication on Twilio account
- Use subaccounts for environment isolation
- Configure IP allowlist for API access
- Monitor usage patterns for anomalies

**Webhook Security:**
```javascript
// Webhook signature verification
const validateTwilioSignature = (signature, url, params) => {
  const expectedSignature = crypto
    .createHmac('sha1', process.env.TWILIO_AUTH_TOKEN)
    .update(Buffer.from(url + params, 'utf-8'))
    .digest('base64');
  return signature === expectedSignature;
};
```

#### Stripe Security Configuration
**Key Restrictions:**
```json
{
  "name": "Pink Auto Glass Production",
  "restrictions": {
    "api_version": "2023-08-16",
    "permissions": ["read_charges", "write_charges", "read_customers"],
    "request_origin": {
      "type": "url",
      "values": ["https://pinkautoglass.com"]
    }
  }
}
```

**Webhook Endpoint Security:**
```javascript
// Stripe webhook signature verification
const verifyStripeSignature = (payload, signature) => {
  const elements = signature.split(',');
  const signatureElements = {};
  
  elements.forEach(element => {
    const [key, value] = element.split('=');
    signatureElements[key] = value;
  });
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET)
    .update(payload, 'utf8')
    .digest('hex');
    
  return signatureElements.v1 === expectedSignature;
};
```

#### Vercel Security Configuration
**Project-Scoped Tokens:**
- Create separate tokens for CI/CD and manual deployments
- Implement IP restrictions where possible
- Regular token rotation and audit
- Monitor deployment logs for unauthorized access

**Environment Variable Security:**
```bash
# Vercel CLI commands for secure environment management
vercel env add SUPABASE_PROD_SERVICE_KEY production
vercel env add TWILIO_PROD_AUTH_TOKEN production
vercel env add STRIPE_PROD_SECRET_KEY production

# Verify environment variables (without exposing values)
vercel env ls
```

### Security Monitoring and Alerts

#### Monitoring Requirements
1. **API Key Usage Monitoring:**
   - Track unusual request patterns
   - Monitor for geographic anomalies
   - Alert on failed authentication attempts

2. **Environment Variable Access:**
   - Log all environment variable updates
   - Track deployment-time secret access
   - Monitor for unauthorized configuration changes

3. **Service-Specific Monitoring:**
   - Supabase: Connection attempts, query patterns
   - Twilio: SMS sending patterns, rate limit hits
   - Stripe: Payment processing anomalies
   - Vercel: Deployment patterns, function invocations

#### Alert Thresholds
```yaml
alerts:
  api_failures:
    threshold: 5_failures_per_minute
    action: immediate_notification
  
  unusual_geography:
    threshold: requests_from_new_country
    action: security_team_review
  
  rate_limit_approach:
    threshold: 80_percent_of_limit
    action: scaling_notification
  
  secret_rotation_due:
    threshold: 7_days_before_expiry
    action: automated_rotation_start
```

### Compliance and Audit Requirements

#### Monthly Security Reviews
1. Review all active API keys and their permissions
2. Audit environment variable access logs
3. Verify rotation schedules are being followed
4. Test secret recovery procedures
5. Update security documentation

#### Quarterly Security Assessments
1. Comprehensive penetration testing of API endpoints
2. Review and update service permissions
3. Evaluate new security tools and practices
4. Conduct tabletop exercises for incident response
5. Update rotation procedures based on learnings

### Emergency Procedures

#### Immediate Secret Compromise Response
1. **Within 15 minutes:**
   - Revoke compromised credentials immediately
   - Generate new credentials
   - Update production environment

2. **Within 1 hour:**
   - Deploy updated application with new secrets
   - Verify all services are functioning
   - Document the incident

3. **Within 24 hours:**
   - Complete post-incident review
   - Update security procedures if needed
   - Notify relevant stakeholders

#### Secret Recovery Procedures
**Lost Access Scenario:**
1. Use backup authentication methods (2FA recovery codes)
2. Contact service provider support with verified identity
3. Generate new credentials through verified channels
4. Update all dependent systems
5. Document recovery process improvements

This secrets management policy ensures comprehensive protection of Pink Auto Glass's sensitive data while maintaining operational efficiency and compliance with security best practices.