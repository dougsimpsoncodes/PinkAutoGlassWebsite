# Access Control Policy
## Pink Auto Glass Security Baseline

### Overview
This document defines comprehensive access control policies for Pink Auto Glass, establishing role-based permissions, service restrictions, and access management procedures across all integrated platforms.

### Supabase Access Control

#### Database Roles and Permissions

**Service Role (Backend Operations):**
```sql
-- Pink Auto Glass Service Role Permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA auth TO service_role;

-- Leads table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.leads_id_seq TO service_role;

-- Media table permissions  
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.media_id_seq TO service_role;

-- Vehicle reference data (read-only)
GRANT SELECT ON public.vehicles TO service_role;
GRANT SELECT ON public.services TO service_role;
GRANT SELECT ON public.locations TO service_role;

-- Audit and logging tables
GRANT INSERT, SELECT ON public.audit_log TO service_role;

-- Explicitly deny access to sensitive auth tables
REVOKE ALL ON auth.users FROM service_role;
REVOKE ALL ON auth.sessions FROM service_role;
```

**Anonymous Role (Public Access):**
```sql
-- Limited read-only access for public data
GRANT USAGE ON SCHEMA public TO anon;

-- Vehicle and service information (public lookup)
GRANT SELECT ON public.vehicles TO anon;
GRANT SELECT ON public.services TO anon;
GRANT SELECT ON public.locations TO anon;

-- Rate limiting for anonymous queries
CREATE POLICY "Rate limit anonymous queries" ON public.vehicles
  FOR SELECT TO anon
  USING (
    (SELECT COUNT(*) FROM public.rate_limit 
     WHERE ip_address = inet_client_addr() 
     AND created_at > NOW() - INTERVAL '1 minute') < 60
  );

-- Explicitly deny access to sensitive tables
REVOKE ALL ON public.leads FROM anon;
REVOKE ALL ON public.media FROM anon;
REVOKE ALL ON public.audit_log FROM anon;
```

#### Row Level Security (RLS) Policies

**Leads Table Security:**
```sql
-- Enable RLS on leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Service role can manage all leads
CREATE POLICY "Service role full access" ON public.leads
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Anonymous users have no access
CREATE POLICY "No anonymous access" ON public.leads
  FOR ALL TO anon
  USING (false);

-- Authenticated users can only view their own leads (future feature)
CREATE POLICY "Users can view own leads" ON public.leads
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
```

**Media Table Security:**
```sql
-- Enable RLS on media table
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Service role can manage all media
CREATE POLICY "Service role media access" ON public.media
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Public read access for approved media only
CREATE POLICY "Public approved media" ON public.media
  FOR SELECT TO anon
  USING (status = 'approved' AND visibility = 'public');
```

### Twilio Service Restrictions

#### Account Configuration
**Primary Account Settings:**
```json
{
  "account_sid": "AC********************************",
  "account_name": "Pink Auto Glass Production",
  "status": "active",
  "type": "full",
  "restrictions": {
    "sms_enabled": true,
    "voice_enabled": false,
    "mms_enabled": false,
    "international_sms": false
  }
}
```

#### Service-Level Restrictions
**SMS Service Configuration:**
```javascript
// Twilio service configuration
const twilioConfig = {
  // Geographic restrictions
  allowedCountries: ['US', 'CA'],
  
  // Rate limiting
  rateLimits: {
    messagesPerHour: 100,
    messagesPerDay: 500,
    uniqueRecipientsPerDay: 200
  },
  
  // Content filtering
  contentFilters: {
    enableSpamDetection: true,
    blockInternationalPremium: true,
    requireOptInConfirmation: true
  },
  
  // Webhook security
  webhookValidation: {
    enforceSignatureValidation: true,
    allowedDomains: ['pinkautoglass.com', 'api.pinkautoglass.com']
  }
};
```

**Subaccount Structure:**
```json
{
  "production": {
    "sid": "AC********************************",
    "name": "Pink Auto Glass - Production",
    "restrictions": {
      "daily_sms_limit": 500,
      "allowed_numbers": "verified_only",
      "webhook_urls": ["https://pinkautoglass.com/api/twilio/webhook"]
    }
  },
  "development": {
    "sid": "AC********************************", 
    "name": "Pink Auto Glass - Development",
    "restrictions": {
      "daily_sms_limit": 50,
      "allowed_numbers": "test_numbers_only",
      "webhook_urls": ["https://dev.pinkautoglass.com/api/twilio/webhook"]
    }
  }
}
```

#### Phone Number Management
**Verified Caller IDs:**
```javascript
const verifiedNumbers = {
  production: {
    primary: "+1720555XXXX", // Primary business number
    backup: "+1303555XXXX",  // Backup business number
    restrictions: {
      outbound_only: true,
      business_hours_only: false,
      emergency_override: true
    }
  },
  development: {
    test: "+15005550006", // Twilio test number
    restrictions: {
      outbound_only: true,
      test_environment_only: true
    }
  }
};
```

### Stripe Key Restrictions

#### API Key Configuration
**Production Restricted Key:**
```json
{
  "key_id": "rk_live_****************************",
  "name": "Pink Auto Glass Production API",
  "restrictions": {
    "permissions": [
      "read_charges",
      "write_charges", 
      "read_payment_intents",
      "write_payment_intents",
      "read_customers",
      "write_customers",
      "read_payment_methods",
      "write_payment_methods"
    ],
    "request_origin": {
      "type": "url",
      "values": [
        "https://pinkautoglass.com",
        "https://www.pinkautoglass.com"
      ]
    },
    "ip_whitelist": [
      "76.76.19.61/32",  // Vercel production IPs
      "76.76.21.21/32"
    ]
  }
}
```

**Development Key Restrictions:**
```json
{
  "key_id": "rk_test_****************************",
  "name": "Pink Auto Glass Development API", 
  "restrictions": {
    "permissions": [
      "read_charges",
      "write_charges",
      "read_payment_intents", 
      "write_payment_intents"
    ],
    "request_origin": {
      "type": "url",
      "values": [
        "http://localhost:3000",
        "https://dev.pinkautoglass.com"
      ]
    },
    "amount_limit": {
      "max_amount": 10000, // $100.00 max for testing
      "currency": "usd"
    }
  }
}
```

#### Webhook Configuration
**Production Webhook Endpoint:**
```json
{
  "id": "we_****************************",
  "url": "https://pinkautoglass.com/api/stripe/webhook",
  "enabled_events": [
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "charge.dispute.created",
    "customer.created",
    "invoice.payment_succeeded"
  ],
  "api_version": "2023-08-16",
  "metadata": {
    "environment": "production",
    "service": "pink_auto_glass"
  }
}
```

### Vercel Project-Scoped Tokens

#### Token Management Strategy
**Production Deployment Token:**
```json
{
  "id": "prs_****************************",
  "name": "Pink Auto Glass - Production Deploy",
  "scope": "project",
  "project_id": "prj_****************************",
  "permissions": [
    "deployments:write",
    "env:read",
    "env:write",
    "projects:read"
  ],
  "restrictions": {
    "ip_whitelist": [
      "192.168.1.0/24", // Office network
      "10.0.0.0/8"       // VPN range
    ],
    "expiry": "2024-12-31T23:59:59Z"
  }
}
```

**CI/CD Token (GitHub Actions):**
```json
{
  "id": "ci_****************************",
  "name": "Pink Auto Glass - CI/CD",
  "scope": "project", 
  "project_id": "prj_****************************",
  "permissions": [
    "deployments:write",
    "env:read"
  ],
  "restrictions": {
    "usage_limit": {
      "requests_per_hour": 100,
      "deployments_per_day": 20
    }
  }
}
```

#### Environment Variable Access Control
**Production Environment:**
```bash
# Read-only access for CI/CD
VERCEL_TOKEN_CI=<ci_token>     # Can read env vars, deploy
VERCEL_TOKEN_ADMIN=<admin_token> # Can modify env vars

# Environment variable scoping
vercel env add SUPABASE_SERVICE_KEY production --sensitive
vercel env add STRIPE_SECRET_KEY production --sensitive  
vercel env add TWILIO_AUTH_TOKEN production --sensitive
```

### Access Documentation and Audit Trail

#### Personnel Access Matrix
| Person | Role | Supabase | Twilio | Stripe | Vercel | Access Level |
|--------|------|----------|--------|---------|--------|--------------|
| Doug Simpson | Owner | Admin | Admin | Admin | Owner | Full Access |
| Development Team | Developer | Service Key | Subaccount | Test Keys | Project | Limited |
| Support Team | Support | Read Only | View Only | Dashboard | View Only | Read Only |
| External Contractor | Contractor | None | None | None | None | No Access |

#### Service Account Documentation
**Supabase Service Accounts:**
```yaml
service_accounts:
  production:
    name: "pink-auto-glass-prod"
    permissions: ["leads:write", "media:write", "vehicles:read"]
    created: "2024-01-15"
    last_rotated: "2024-07-15"
    next_rotation: "2024-10-15"
    
  development:
    name: "pink-auto-glass-dev" 
    permissions: ["leads:write", "media:write", "vehicles:read"]
    created: "2024-01-15"
    last_rotated: "2024-07-15"
    next_rotation: "2024-10-15"
```

**Twilio Subaccount Access:**
```yaml
twilio_access:
  production_subaccount:
    account_sid: "AC********************************"
    authorized_users: ["doug@pinkautoglass.com"]
    permissions: ["sms:send", "numbers:read", "usage:read"]
    restrictions: ["voice:disabled", "international:disabled"]
    
  development_subaccount:
    account_sid: "AC********************************"
    authorized_users: ["dev-team@pinkautoglass.com"]
    permissions: ["sms:send", "numbers:read"]
    restrictions: ["voice:disabled", "production:disabled"]
```

#### Access Review Procedures

**Monthly Access Review:**
1. **Service Account Audit:**
   - Review all active service accounts
   - Verify permissions align with current needs
   - Check for unused or orphaned accounts
   - Validate rotation schedules

2. **User Access Verification:**
   - Confirm all users still require their current access level
   - Review new access requests and approvals
   - Verify multi-factor authentication is enabled
   - Check for shared or generic accounts

3. **API Key and Token Review:**
   - Audit all active API keys and tokens
   - Verify expiration dates and rotation schedules
   - Check usage patterns for anomalies
   - Review permission scopes for least privilege

**Quarterly Access Certification:**
```yaml
certification_process:
  frequency: quarterly
  participants: [owner, security_lead, development_lead]
  
  checklist:
    - verify_all_human_access
    - audit_service_accounts  
    - review_api_permissions
    - check_integration_access
    - validate_emergency_procedures
    - update_documentation
    
  approval_required: true
  documentation: required
  next_review: "2024-10-01"
```

### Emergency Access Procedures

#### Break-Glass Access
**Emergency Admin Account:**
```yaml
emergency_access:
  account: "emergency-admin@pinkautoglass.com"
  purpose: "Critical system recovery only"
  permissions: "temporary_elevated_access"
  
  activation_procedure:
    1. "Document emergency situation"
    2. "Get approval from two executives" 
    3. "Enable account with time-limited access"
    4. "Monitor all actions taken"
    5. "Disable account after emergency"
    6. "Complete post-incident review"
    
  automatic_expiry: "4_hours"
  audit_logging: "comprehensive"
```

#### Access Revocation Procedures
**Immediate Revocation (Termination/Security Incident):**
1. **Within 15 minutes:**
   - Disable all user accounts across all services
   - Revoke API keys and tokens
   - Remove from shared services and repositories

2. **Within 1 hour:**
   - Rotate any shared credentials
   - Review access logs for suspicious activity
   - Update security groups and permissions

3. **Within 24 hours:**
   - Complete forensic review of user activity
   - Update access documentation
   - Notify relevant stakeholders

**Standard Revocation (Role Change):**
1. Remove unnecessary permissions
2. Update access documentation
3. Verify changes are effective
4. Schedule follow-up review

This access control policy ensures Pink Auto Glass maintains strict security while enabling necessary business operations through properly scoped and monitored access controls.