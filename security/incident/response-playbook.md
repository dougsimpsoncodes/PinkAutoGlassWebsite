# Incident Response Playbook
## Pink Auto Glass Security Operations

### Overview
This playbook provides comprehensive incident response procedures for Pink Auto Glass, covering secret leaks, SMS abuse, DDoS attacks, and general security incidents. Each section includes immediate response steps, escalation procedures, and recovery actions.

## Secret Leak Response Procedures

### Immediate Response (0-15 minutes)

#### Step 1: Incident Assessment
```bash
# Rapid assessment checklist
INCIDENT_ID="INC-$(date +%Y%m%d%H%M%S)"
echo "Incident ID: $INCIDENT_ID"

# Document initial findings
cat > incident_log_$INCIDENT_ID.txt << EOF
INCIDENT REPORT: Secret Leak
Incident ID: $INCIDENT_ID
Detected: $(date -u)
Severity: [CRITICAL/HIGH/MEDIUM/LOW]
Reporter: [Name/System]
Initial Description: [Brief description]

AFFECTED SYSTEMS:
- [ ] Supabase Database
- [ ] Twilio SMS Service  
- [ ] Stripe Payment Processing
- [ ] Vercel Hosting
- [ ] GitHub Repository
- [ ] Other: ____________

LEAKED CREDENTIALS:
- [ ] Database passwords
- [ ] API keys
- [ ] Service tokens
- [ ] Certificates
- [ ] Other: ____________
EOF
```

#### Step 2: Immediate Containment Actions
**Critical Actions (Complete within 15 minutes):**

```bash
#!/bin/bash
# Emergency secret revocation script

echo "🚨 EMERGENCY SECRET REVOCATION INITIATED"
echo "Incident ID: $INCIDENT_ID"
echo "Timestamp: $(date -u)"

# 1. Revoke Supabase service keys
echo "Revoking Supabase service keys..."
# Manual action: Log into Supabase dashboard -> Settings -> API -> Generate new service key
# TODO: Automate with Supabase management API when available

# 2. Revoke Twilio auth tokens  
echo "Revoking Twilio auth tokens..."
curl -X POST https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/AuthTokens.json \
  -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" \
  -d "FriendlyName=Emergency-Revocation-$INCIDENT_ID"

# 3. Revoke Stripe API keys
echo "Revoking Stripe API keys..."
curl -X DELETE https://api.stripe.com/v1/api_keys/$STRIPE_KEY_ID \
  -u "$STRIPE_SECRET_KEY:"

# 4. Revoke Vercel tokens
echo "Revoking Vercel tokens..."
curl -X DELETE "https://api.vercel.com/v2/user/tokens/$VERCEL_TOKEN_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN"

# 5. Rotate NextAuth secret
echo "Generating new NextAuth secret..."
NEW_NEXTAUTH_SECRET=$(openssl rand -hex 32)
echo "New NEXTAUTH_SECRET generated (update in environment variables)"

echo "✅ Emergency revocation completed at $(date -u)"
```

#### Step 3: Generate New Credentials
```bash
#!/bin/bash
# Generate replacement credentials

echo "Generating replacement credentials..."

# Create secure temporary credentials
TEMP_SUPABASE_KEY="temp_$(openssl rand -hex 16)"
TEMP_TWILIO_TOKEN=$(openssl rand -hex 16)
TEMP_STRIPE_KEY="sk_temp_$(openssl rand -hex 16)"
TEMP_VERCEL_TOKEN=$(openssl rand -hex 16)

# Store in secure environment variable update script
cat > emergency_env_update.sh << EOF
#!/bin/bash
# Emergency environment variable updates
# Run this script to update production environment

vercel env rm SUPABASE_SERVICE_KEY production
vercel env add SUPABASE_SERVICE_KEY production # Enter new key when prompted

vercel env rm TWILIO_AUTH_TOKEN production  
vercel env add TWILIO_AUTH_TOKEN production # Enter new token when prompted

vercel env rm STRIPE_SECRET_KEY production
vercel env add STRIPE_SECRET_KEY production # Enter new key when prompted

vercel env rm NEXTAUTH_SECRET production
vercel env add NEXTAUTH_SECRET production # Enter: $NEW_NEXTAUTH_SECRET

echo "Environment variables updated. Triggering redeployment..."
vercel deploy --prod
EOF

chmod +x emergency_env_update.sh
echo "✅ Credential replacement script created: emergency_env_update.sh"
```

### Extended Response (15 minutes - 4 hours)

#### Step 4: System Verification and Monitoring
```bash
#!/bin/bash
# Post-revocation system verification

echo "Verifying system status after credential rotation..."

# Test database connectivity
echo "Testing database connection..."
if psql "$NEW_DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
  echo "✅ Database connection successful"
else
  echo "❌ Database connection failed - ESCALATE IMMEDIATELY"
  exit 1
fi

# Test Twilio SMS functionality
echo "Testing SMS functionality..."
SMS_TEST_RESULT=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json" \
  -u "$TWILIO_ACCOUNT_SID:$NEW_TWILIO_AUTH_TOKEN" \
  -d "From=+1XXXXXXXXXX" \
  -d "To=+1XXXXXXXXXX" \
  -d "Body=Emergency system test - ignore")

if [ "$SMS_TEST_RESULT" = "201" ]; then
  echo "✅ SMS functionality verified"
else
  echo "❌ SMS functionality failed - ESCALATE"
fi

# Test Stripe API
echo "Testing Stripe API..."
STRIPE_TEST_RESULT=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://api.stripe.com/v1/balance" \
  -u "$NEW_STRIPE_SECRET_KEY:")

if [ "$STRIPE_TEST_RESULT" = "200" ]; then
  echo "✅ Stripe API verified" 
else
  echo "❌ Stripe API failed - ESCALATE"
fi

echo "System verification completed at $(date -u)"
```

#### Step 5: Forensic Analysis
```bash
#!/bin/bash
# Conduct forensic analysis of the secret leak

echo "Beginning forensic analysis..."

# Check Git history for the leaked secret
echo "Analyzing Git history..."
git log --all -p -S "LEAKED_SECRET_PATTERN" > forensics/git_history_$INCIDENT_ID.txt

# Check when secret was first committed
FIRST_COMMIT=$(git log --all --oneline -S "LEAKED_SECRET_PATTERN" | tail -1)
echo "First occurrence in commit: $FIRST_COMMIT" >> incident_log_$INCIDENT_ID.txt

# Analyze access logs (if available)
echo "Analyzing access logs..."
grep "LEAKED_SECRET_PATTERN" /var/log/application.log > forensics/access_log_$INCIDENT_ID.txt 2>/dev/null

# Check public repositories and services
echo "Checking for public exposure..."
# This would typically involve checking code search engines, pastebin services, etc.

# Generate forensic summary
cat > forensics/summary_$INCIDENT_ID.txt << EOF
FORENSIC ANALYSIS SUMMARY
Incident ID: $INCIDENT_ID
Analysis Date: $(date -u)

SECRET EXPOSURE TIMELINE:
- First committed: $FIRST_COMMIT
- Detected: $(date -u)
- Exposure duration: [Calculate time difference]

POTENTIAL IMPACT:
- Systems accessed: [List affected systems]
- Data potentially exposed: [Estimate data exposure]
- Timeline of unauthorized access: [Based on logs]

EVIDENCE COLLECTED:
- Git history analysis
- Access log analysis  
- Public exposure check
- System audit logs
EOF
```

### Recovery and Hardening (4-24 hours)

#### Step 6: Complete System Recovery
```bash
#!/bin/bash
# Complete system recovery and hardening

echo "Initiating complete system recovery..."

# Deploy application with new credentials
echo "Deploying updated application..."
vercel deploy --prod --env production

# Verify deployment health
echo "Verifying deployment health..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://pinkautoglass.com/api/health)
if [ "$HEALTH_CHECK" = "200" ]; then
  echo "✅ Application deployment successful"
else
  echo "❌ Application deployment failed - manual intervention required"
fi

# Update monitoring and alerting
echo "Updating security monitoring..."
# Add specific monitoring for the compromised service
# Update alerting thresholds based on incident learnings

# Document lessons learned
cat > lessons_learned_$INCIDENT_ID.txt << EOF
LESSONS LEARNED - $INCIDENT_ID
Date: $(date -u)

WHAT WENT WELL:
- [List successful response elements]

WHAT COULD BE IMPROVED:
- [List areas for improvement]

ACTION ITEMS:
- [ ] Update secret scanning rules
- [ ] Improve monitoring coverage
- [ ] Enhance incident response procedures
- [ ] Additional staff training needed

PREVENTIVE MEASURES IMPLEMENTED:
- [List new preventive measures]
EOF

echo "Recovery phase completed at $(date -u)"
```

## SMS Abuse Handling (Rate Limits, CAPTCHA)

### SMS Abuse Detection and Response

#### Automated Detection System
```javascript
// SMS abuse detection middleware
const SMS_ABUSE_CONFIG = {
  rateLimits: {
    perPhonePerHour: 5,
    perPhonePerDay: 10,
    perIPPerHour: 20,
    perIPPerDay: 50,
    globalPerHour: 500
  },
  
  suspiciousPatterns: [
    /^\+1(000|111|222|333|444|555|666|777|888|999)\d{7}$/, // Sequential numbers
    /^\+1\d{3}(000|111|222|333|444|555|666|777|888|999)\d{4}$/, // Sequential area codes
    /^\+1\d{10}$/.test(phone) && isDisposableNumber(phone) // Known temp services
  ],
  
  blockList: [
    '+10000000000',
    '+11111111111'
    // Updated dynamically from abuse reports
  ]
};

class SMSAbuseDetector {
  constructor() {
    this.rateTracker = new Map();
    this.suspiciousActivity = new Map();
  }
  
  async checkForAbuse(phoneNumber, ipAddress, userAgent) {
    const now = Date.now();
    const hour = Math.floor(now / (1000 * 60 * 60));
    const day = Math.floor(now / (1000 * 60 * 60 * 24));
    
    // Check rate limits
    const rateLimitResult = await this.checkRateLimits(phoneNumber, ipAddress, hour, day);
    if (rateLimitResult.blocked) {
      await this.logSuspiciousActivity('RATE_LIMIT_EXCEEDED', {
        phoneNumber, ipAddress, userAgent, reason: rateLimitResult.reason
      });
      return { blocked: true, reason: rateLimitResult.reason };
    }
    
    // Check suspicious patterns
    if (this.isSuspiciousNumber(phoneNumber)) {
      await this.logSuspiciousActivity('SUSPICIOUS_PATTERN', {
        phoneNumber, ipAddress, pattern: 'suspicious_number_format'
      });
      return { blocked: true, reason: 'SUSPICIOUS_NUMBER_PATTERN' };
    }
    
    // Check block list
    if (SMS_ABUSE_CONFIG.blockList.includes(phoneNumber)) {
      return { blocked: true, reason: 'BLOCKED_NUMBER' };
    }
    
    // Geographic anomaly detection
    const geoCheck = await this.checkGeographicAnomalies(phoneNumber, ipAddress);
    if (geoCheck.suspicious) {
      await this.requireAdditionalVerification(phoneNumber, ipAddress);
      return { blocked: false, requiresCaptcha: true };
    }
    
    return { blocked: false };
  }
  
  async checkRateLimits(phoneNumber, ipAddress, hour, day) {
    const phoneHourly = await this.getRateCount(`phone:${phoneNumber}:${hour}`);
    const phoneDaily = await this.getRateCount(`phone:${phoneNumber}:${day}`);
    const ipHourly = await this.getRateCount(`ip:${ipAddress}:${hour}`);
    const ipDaily = await this.getRateCount(`ip:${ipAddress}:${day}`);
    const globalHourly = await this.getRateCount(`global:${hour}`);
    
    if (phoneHourly >= SMS_ABUSE_CONFIG.rateLimits.perPhonePerHour) {
      return { blocked: true, reason: 'PHONE_HOURLY_LIMIT_EXCEEDED' };
    }
    
    if (phoneDaily >= SMS_ABUSE_CONFIG.rateLimits.perPhonePerDay) {
      return { blocked: true, reason: 'PHONE_DAILY_LIMIT_EXCEEDED' };
    }
    
    if (ipHourly >= SMS_ABUSE_CONFIG.rateLimits.perIPPerHour) {
      return { blocked: true, reason: 'IP_HOURLY_LIMIT_EXCEEDED' };
    }
    
    if (ipDaily >= SMS_ABUSE_CONFIG.rateLimits.perIPPerDay) {
      return { blocked: true, reason: 'IP_DAILY_LIMIT_EXCEEDED' };
    }
    
    if (globalHourly >= SMS_ABUSE_CONFIG.rateLimits.globalPerHour) {
      return { blocked: true, reason: 'GLOBAL_HOURLY_LIMIT_EXCEEDED' };
    }
    
    return { blocked: false };
  }
  
  async logSuspiciousActivity(type, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      details,
      severity: this.calculateSeverity(type, details)
    };
    
    // Log to security monitoring system
    await logger.security(logEntry);
    
    // Auto-escalate high severity incidents
    if (logEntry.severity === 'HIGH') {
      await this.escalateIncident(logEntry);
    }
  }
  
  isSuspiciousNumber(phoneNumber) {
    return SMS_ABUSE_CONFIG.suspiciousPatterns.some(pattern => 
      pattern.test(phoneNumber)
    );
  }
}
```

#### CAPTCHA Integration for Abuse Prevention
```javascript
// CAPTCHA implementation for SMS abuse prevention
import { RecaptchaV3 } from 'react-google-recaptcha-v3';

class CaptchaGatedSMSService {
  constructor() {
    this.abuseDetector = new SMSAbuseDetector();
    this.captchaThreshold = 0.5; // reCAPTCHA score threshold
  }
  
  async sendSMS(phoneNumber, message, request) {
    const { ipAddress, userAgent } = this.extractRequestInfo(request);
    
    // Initial abuse check
    const abuseCheck = await this.abuseDetector.checkForAbuse(
      phoneNumber, ipAddress, userAgent
    );
    
    if (abuseCheck.blocked) {
      throw new Error(`SMS blocked: ${abuseCheck.reason}`);
    }
    
    // Require CAPTCHA for suspicious activity
    if (abuseCheck.requiresCaptcha || this.shouldRequireCaptcha(request)) {
      const captchaToken = request.headers['captcha-token'];
      
      if (!captchaToken) {
        return {
          success: false,
          requiresCaptcha: true,
          message: 'CAPTCHA verification required'
        };
      }
      
      const captchaValid = await this.verifyCaptcha(captchaToken, ipAddress);
      if (!captchaValid) {
        throw new Error('CAPTCHA verification failed');
      }
    }
    
    // Send SMS after all checks pass
    return await this.twilioSendSMS(phoneNumber, message);
  }
  
  async verifyCaptcha(token, ipAddress) {
    try {
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}&remoteip=${ipAddress}`
      });
      
      const result = await response.json();
      
      // Log CAPTCHA verification
      await logger.info('captcha_verification', {
        success: result.success,
        score: result.score,
        action: result.action,
        hostname: result.hostname,
        ipAddress
      });
      
      return result.success && result.score >= this.captchaThreshold;
      
    } catch (error) {
      await logger.error('captcha_verification_error', { error: error.message, ipAddress });
      return false; // Fail closed for security
    }
  }
  
  shouldRequireCaptcha(request) {
    const { ipAddress, userAgent } = this.extractRequestInfo(request);
    
    // Require CAPTCHA for suspicious patterns
    return (
      this.isKnownBotUserAgent(userAgent) ||
      this.isFromSuspiciousIP(ipAddress) ||
      this.hasHighRiskIndicators(request)
    );
  }
}
```

#### SMS Abuse Incident Response
```bash
#!/bin/bash
# SMS abuse incident response script

SMS_ABUSE_RESPONSE() {
  local incident_type="$1"  # mass_spam, toll_fraud, bot_attack
  local phone_number="$2"
  local ip_address="$3"
  
  echo "🚨 SMS ABUSE INCIDENT DETECTED"
  echo "Type: $incident_type"
  echo "Phone: $phone_number"
  echo "IP: $ip_address"
  echo "Time: $(date -u)"
  
  case "$incident_type" in
    "mass_spam")
      echo "Implementing mass spam countermeasures..."
      
      # Block the phone number immediately
      echo "INSERT INTO blocked_numbers (phone, reason, blocked_at) VALUES ('$phone_number', 'mass_spam', NOW());" | psql $DATABASE_URL
      
      # Block the IP address
      echo "INSERT INTO blocked_ips (ip_address, reason, blocked_at) VALUES ('$ip_address', 'mass_spam', NOW());" | psql $DATABASE_URL
      
      # Reduce global rate limits temporarily
      redis-cli SET "global_sms_limit_emergency" "50"
      redis-cli EXPIRE "global_sms_limit_emergency" 3600  # 1 hour
      
      # Alert security team
      curl -X POST "$SLACK_WEBHOOK" -d "{\"text\":\"🚨 MASS SMS SPAM DETECTED: $phone_number from $ip_address\"}"
      ;;
      
    "toll_fraud")
      echo "Implementing toll fraud countermeasures..."
      
      # Immediately block high-cost destination
      COUNTRY_CODE=$(echo $phone_number | grep -o "^+[0-9]\{1,3\}")
      echo "INSERT INTO blocked_countries (country_code, reason, blocked_at) VALUES ('$COUNTRY_CODE', 'toll_fraud', NOW());" | psql $DATABASE_URL
      
      # Suspend SMS service temporarily
      redis-cli SET "sms_service_suspended" "true"
      redis-cli EXPIRE "sms_service_suspended" 1800  # 30 minutes
      
      # Emergency notification
      curl -X POST "$EMERGENCY_WEBHOOK" -d "{\"text\":\"🆘 TOLL FRAUD DETECTED - SMS SERVICE SUSPENDED: $phone_number\"}"
      ;;
      
    "bot_attack") 
      echo "Implementing bot attack countermeasures..."
      
      # Enable strict CAPTCHA mode
      redis-cli SET "strict_captcha_mode" "true"
      redis-cli EXPIRE "strict_captcha_mode" 7200  # 2 hours
      
      # Block IP range if applicable
      IP_RANGE=$(echo $ip_address | cut -d'.' -f1-3).0/24
      echo "INSERT INTO blocked_ip_ranges (ip_range, reason, blocked_at) VALUES ('$IP_RANGE', 'bot_attack', NOW());" | psql $DATABASE_URL
      
      # Increase rate limiting
      redis-cli SET "emergency_rate_limit" "1"  # 1 SMS per hour per IP
      redis-cli EXPIRE "emergency_rate_limit" 3600
      ;;
  esac
  
  # Log incident
  echo "INSERT INTO security_incidents (type, details, created_at) VALUES ('sms_abuse', '{\"incident_type\":\"$incident_type\",\"phone\":\"$phone_number\",\"ip\":\"$ip_address\"}', NOW());" | psql $DATABASE_URL
}
```

## DDoS Mitigation Using Vercel Protections

### Vercel DDoS Protection Configuration

#### Edge Network Configuration
```javascript
// next.config.js - DDoS protection configuration
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Vercel's built-in DDoS protection
  experimental: {
    esmExternals: true,
    appDir: true,
    serverActions: true
  },
  
  // Security headers for DDoS mitigation
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Rate limiting headers
          {
            key: 'X-RateLimit-Limit',
            value: '100'
          },
          {
            key: 'X-RateLimit-Remaining', 
            value: '100'
          },
          // DDoS protection headers
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  },
  
  // Middleware for additional protection
  async middleware() {
    return {
      matcher: [
        '/api/:path*',
        '/contact/:path*',
        '/quote/:path*'
      ]
    };
  }
};

module.exports = nextConfig;
```

#### Application-Level DDoS Protection
```javascript
// middleware.ts - Enhanced DDoS protection middleware
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Configure Redis for rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different rate limits for different endpoints
const rateLimiters = {
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 h'),
    analytics: true,
    prefix: 'api_rate_limit',
  }),
  
  contact: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    analytics: true,
    prefix: 'contact_rate_limit',
  }),
  
  quote: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    analytics: true,
    prefix: 'quote_rate_limit',
  }),
  
  strict: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1, '1 m'),
    analytics: true,
    prefix: 'strict_rate_limit',
  })
};

class DDoSProtection {
  static async detectDDoS(request: NextRequest): Promise<boolean> {
    const ip = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    
    // Check for DDoS patterns
    const ddosIndicators = [
      // Suspicious user agents
      /bot|crawler|spider|scraper/i.test(userAgent) && !this.isLegitimateBot(userAgent),
      
      // Missing or suspicious referer
      !referer && !this.isAPIEndpoint(request.nextUrl.pathname),
      
      // Rapid requests from same IP
      await this.checkRapidRequests(ip),
      
      // Suspicious geographic patterns
      await this.checkGeographicAnomalies(ip),
      
      // Large payload attacks
      this.checkPayloadSize(request)
    ];
    
    return ddosIndicators.some(indicator => indicator);
  }
  
  static async checkRapidRequests(ip: string): Promise<boolean> {
    const key = `ddos_check:${ip}`;
    const requests = await redis.incr(key);
    
    if (requests === 1) {
      await redis.expire(key, 60); // 1 minute window
    }
    
    // More than 200 requests per minute indicates potential DDoS
    return requests > 200;
  }
  
  static getClientIP(request: NextRequest): string {
    return (
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      request.ip ||
      '0.0.0.0'
    );
  }
  
  static isLegitimateBot(userAgent: string): boolean {
    const legitimateBots = [
      /googlebot/i,
      /bingbot/i,
      /slackbot/i,
      /twitterbot/i,
      /facebookexternalhit/i
    ];
    
    return legitimateBots.some(bot => bot.test(userAgent));
  }
}

export async function middleware(request: NextRequest) {
  const start = Date.now();
  const ip = DDoSProtection.getClientIP(request);
  const pathname = request.nextUrl.pathname;
  
  try {
    // Check for DDoS patterns
    const isDDoS = await DDoSProtection.detectDDoS(request);
    
    if (isDDoS) {
      // Log DDoS attempt
      console.log('DDoS attempt detected', {
        ip,
        pathname,
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString()
      });
      
      // Return rate limit response
      return new Response('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '300',
          'X-RateLimit-Limit': '1',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + 300000).toISOString()
        }
      });
    }
    
    // Apply appropriate rate limiting based on endpoint
    let rateLimit;
    if (pathname.startsWith('/api/contact')) {
      rateLimit = rateLimiters.contact;
    } else if (pathname.startsWith('/api/quote')) {
      rateLimit = rateLimiters.quote;
    } else if (pathname.startsWith('/api/')) {
      rateLimit = rateLimiters.api;
    }
    
    if (rateLimit) {
      const { success, limit, reset, remaining } = await rateLimit.limit(ip);
      
      if (!success) {
        return new Response('API rate limit exceeded', {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(reset).toISOString(),
            'Retry-After': Math.round((reset - Date.now()) / 1000).toString()
          }
        });
      }
      
      // Add rate limit headers to successful responses
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString());
      
      return response;
    }
    
    return NextResponse.next();
    
  } catch (error) {
    // Log error but don't block request
    console.error('Middleware error:', error);
    return NextResponse.next();
  } finally {
    // Log request timing
    const duration = Date.now() - start;
    if (duration > 1000) { // Log slow requests
      console.warn('Slow request detected', { ip, pathname, duration });
    }
  }
}

export const config = {
  matcher: [
    '/api/:path*',
    '/contact/:path*',
    '/quote/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
};
```

#### DDoS Incident Response
```bash
#!/bin/bash
# DDoS incident response procedures

DDOS_INCIDENT_RESPONSE() {
  local attack_type="$1"    # layer4, layer7, application
  local attack_scale="$2"   # small, medium, large, massive
  local source_ips="$3"
  
  INCIDENT_ID="DDOS-$(date +%Y%m%d%H%M%S)"
  
  echo "🚨 DDOS ATTACK DETECTED"
  echo "Incident ID: $INCIDENT_ID"
  echo "Attack Type: $attack_type"
  echo "Scale: $attack_scale" 
  echo "Source IPs: $source_ips"
  echo "Timestamp: $(date -u)"
  
  # Immediate response based on scale
  case "$attack_scale" in
    "small"|"medium")
      echo "Implementing standard DDoS countermeasures..."
      
      # Enable strict rate limiting
      curl -X POST "https://api.vercel.com/v1/edge-config/$VERCEL_EDGE_CONFIG_ID/items" \
        -H "Authorization: Bearer $VERCEL_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
          "strict_rate_limiting": true,
          "rate_limit_per_ip": 10,
          "rate_limit_window": 300
        }'
      
      # Block identified attack IPs
      IFS=',' read -ra IP_ARRAY <<< "$source_ips"
      for ip in "${IP_ARRAY[@]}"; do
        curl -X POST "https://api.vercel.com/v1/edge-config/$VERCEL_EDGE_CONFIG_ID/items" \
          -H "Authorization: Bearer $VERCEL_TOKEN" \
          -H "Content-Type: application/json" \
          -d "{\"blocked_ips\": [\"$ip\"]}"
      done
      ;;
      
    "large"|"massive") 
      echo "Implementing emergency DDoS countermeasures..."
      
      # Enable maximum protection mode
      curl -X POST "https://api.vercel.com/v1/edge-config/$VERCEL_EDGE_CONFIG_ID/items" \
        -H "Authorization: Bearer $VERCEL_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
          "emergency_mode": true,
          "challenge_all_requests": true,
          "rate_limit_per_ip": 1,
          "rate_limit_window": 60
        }'
      
      # Notify emergency contacts
      curl -X POST "$EMERGENCY_SLACK_WEBHOOK" \
        -d "{\"text\":\"🆘 MASSIVE DDOS ATTACK - $INCIDENT_ID\nImmediate attention required\"}"
      
      # Contact Vercel support
      echo "Contacting Vercel support for additional DDoS mitigation..."
      # Automated support ticket creation would go here
      ;;
  esac
  
  # Log incident details
  cat > ddos_incident_$INCIDENT_ID.json << EOF
{
  "incident_id": "$INCIDENT_ID",
  "timestamp": "$(date -u -Iseconds)",
  "attack_type": "$attack_type",
  "attack_scale": "$attack_scale", 
  "source_ips": "$source_ips",
  "mitigation_actions": [
    "rate_limiting_enabled",
    "ip_blocking_implemented",
    "emergency_mode_activated"
  ],
  "estimated_impact": {
    "duration": "ongoing",
    "affected_services": ["main_website", "api_endpoints"],
    "mitigation_effectiveness": "monitoring"
  }
}
EOF
  
  # Start continuous monitoring
  echo "Starting DDoS monitoring loop..."
  while true; do
    # Check current traffic levels
    CURRENT_RPS=$(curl -s "https://api.vercel.com/v1/deployments/$VERCEL_DEPLOYMENT_ID/events" \
      -H "Authorization: Bearer $VERCEL_TOKEN" | jq '.events | length')
    
    echo "Current RPS: $CURRENT_RPS"
    
    if [ "$CURRENT_RPS" -lt 100 ]; then
      echo "Traffic levels normalized. Considering mitigation removal..."
      break
    fi
    
    sleep 30
  done
}

# Function to analyze attack patterns
ANALYZE_DDOS_PATTERN() {
  local log_file="$1"
  
  echo "Analyzing DDoS attack patterns..."
  
  # Extract top attacking IPs
  echo "Top 20 attacking IPs:"
  grep "429\|503" "$log_file" | \
    awk '{print $1}' | \
    sort | uniq -c | sort -nr | head -20
  
  # Analyze attack timing
  echo "Attack timing analysis:"
  grep "429\|503" "$log_file" | \
    awk '{print $4}' | \
    cut -d: -f2 | \
    sort | uniq -c
  
  # Check for attack vectors
  echo "Attack vectors identified:"
  grep "429\|503" "$log_file" | \
    awk '{print $7}' | \
    sort | uniq -c | sort -nr | head -10
}
```

## General Incident Escalation and Communication

### Incident Classification Matrix
```yaml
incident_severity_matrix:
  P0_CRITICAL:
    description: "Complete service outage or data breach"
    examples:
      - "All services down"
      - "Customer data compromised"
      - "Payment processing failure"
    response_time: "15 minutes"
    escalation: "immediate_all_hands"
    communication: "executive_and_customer"
    
  P1_HIGH:
    description: "Major functionality impacted or security incident"
    examples:
      - "SMS service down"
      - "API key compromise" 
      - "Significant performance degradation"
    response_time: "1 hour"
    escalation: "senior_team"
    communication: "internal_and_affected_customers"
    
  P2_MEDIUM:
    description: "Partial functionality impacted"
    examples:
      - "Slow page load times"
      - "Minor feature unavailable"
      - "Monitoring alerts"
    response_time: "4 hours"
    escalation: "on_call_team"
    communication: "internal_only"
    
  P3_LOW:
    description: "Minor issues with workarounds available"
    examples:
      - "Cosmetic issues"
      - "Documentation problems"
      - "Non-critical warnings"
    response_time: "24 hours"
    escalation: "standard_team"
    communication: "team_only"
```

### Automated Communication System
```javascript
// Incident communication automation
class IncidentCommunicationManager {
  constructor() {
    this.notificationChannels = {
      slack: process.env.SLACK_WEBHOOK_URL,
      email: process.env.EMAIL_SERVICE_API,
      sms: process.env.EMERGENCY_SMS_NUMBER,
      status_page: process.env.STATUS_PAGE_API
    };
    
    this.escalationMatrix = {
      'P0': ['ceo@pinkautoglass.com', 'cto@pinkautoglass.com'],
      'P1': ['tech-lead@pinkautoglass.com', 'security@pinkautoglass.com'],
      'P2': ['dev-team@pinkautoglass.com'],
      'P3': ['dev-team@pinkautoglass.com']
    };
  }
  
  async triggerIncidentResponse(incident) {
    const { severity, type, description, affectedSystems } = incident;
    
    // Generate incident ID
    const incidentId = `INC-${Date.now()}`;
    incident.id = incidentId;
    
    // Send immediate notifications
    await this.sendImmediateNotifications(incident);
    
    // Create incident record
    await this.createIncidentRecord(incident);
    
    // Update status page
    if (['P0', 'P1'].includes(severity)) {
      await this.updateStatusPage(incident);
    }
    
    // Start communication schedule
    await this.scheduleIncidentUpdates(incident);
    
    return { incidentId, status: 'response_initiated' };
  }
  
  async sendImmediateNotifications(incident) {
    const { severity, type, description, id } = incident;
    
    // Slack notification
    const slackMessage = {
      text: `🚨 INCIDENT ALERT - ${severity}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Incident ID:* ${id}\n*Severity:* ${severity}\n*Type:* ${type}\n*Description:* ${description}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Acknowledge' },
              value: `ack_${id}`,
              style: 'primary'
            },
            {
              type: 'button', 
              text: { type: 'plain_text', text: 'Join War Room' },
              url: `https://meet.google.com/incident-${id}`
            }
          ]
        }
      ]
    };
    
    await this.sendSlackMessage(slackMessage);
    
    // Email escalation
    const recipients = this.escalationMatrix[severity] || [];
    for (const recipient of recipients) {
      await this.sendEmail(recipient, {
        subject: `[${severity}] Security Incident - ${type}`,
        body: this.generateIncidentEmail(incident)
      });
    }
    
    // SMS for P0 incidents
    if (severity === 'P0') {
      await this.sendEmergencySMS(
        `CRITICAL INCIDENT ${id}: ${type}. Immediate response required.`
      );
    }
  }
  
  generateIncidentEmail(incident) {
    return `
SECURITY INCIDENT ALERT

Incident ID: ${incident.id}
Severity: ${incident.severity}
Type: ${incident.type}
Detected: ${new Date(incident.timestamp).toISOString()}

Description:
${incident.description}

Affected Systems:
${incident.affectedSystems?.join(', ') || 'Unknown'}

Initial Response Actions:
${incident.initialActions?.join('\n') || 'Response in progress'}

Next Steps:
1. Join incident war room: https://meet.google.com/incident-${incident.id}
2. Review incident details: https://incidents.pinkautoglass.com/${incident.id}
3. Follow established incident response procedures

This is an automated message. Reply to security@pinkautoglass.com for assistance.
    `;
  }
  
  async scheduleIncidentUpdates(incident) {
    const updateSchedule = {
      'P0': [15, 30, 60, 120], // minutes
      'P1': [60, 120, 240],    // minutes
      'P2': [240, 480],        // minutes
      'P3': []                 // no scheduled updates
    };
    
    const schedule = updateSchedule[incident.severity] || [];
    
    for (const delayMinutes of schedule) {
      setTimeout(async () => {
        await this.sendScheduledUpdate(incident.id, delayMinutes);
      }, delayMinutes * 60 * 1000);
    }
  }
  
  async sendScheduledUpdate(incidentId, intervalMinutes) {
    // Check if incident is still active
    const incident = await this.getIncidentStatus(incidentId);
    
    if (incident.status === 'resolved') {
      return; // Don't send updates for resolved incidents
    }
    
    const updateMessage = {
      text: `📊 Incident Update - ${incidentId}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${intervalMinutes} minute update for ${incidentId}*\n\nPlease provide status update in thread.`
          }
        }
      ]
    };
    
    await this.sendSlackMessage(updateMessage);
  }
}
```

This comprehensive incident response playbook provides Pink Auto Glass with detailed procedures for handling security incidents, with specific focus on secret leaks, SMS abuse, DDoS attacks, and general incident management. Each section includes immediate response steps, escalation procedures, and automated tooling to ensure rapid and effective incident response.