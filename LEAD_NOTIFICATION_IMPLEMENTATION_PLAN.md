# Lead Notification & Distribution System - Implementation Plan

**Project:** Pink Auto Glass Website
**Document Version:** 1.0
**Date:** October 24, 2025
**Status:** Planning Phase - Seeking Feedback

---

## Executive Summary

This document outlines a comprehensive plan to implement automatic lead notification and distribution via SMS and email for the Pink Auto Glass website. The system will notify customers and staff immediately when booking requests are submitted through the website.

**Current State:** Lead capture works perfectly, but no notifications are sent.
**Goal:** Automated SMS + email notifications to customers and staff within 60 seconds of lead submission.

---

## Table of Contents

1. [Current State Assessment](#current-state-assessment)
2. [System Architecture](#system-architecture)
3. [Implementation Plan](#implementation-plan)
4. [Technical Decisions](#technical-decisions)
5. [Cost Analysis](#cost-analysis)
6. [Compliance Requirements](#compliance-requirements)
7. [Risk Mitigation](#risk-mitigation)
8. [Success Metrics](#success-metrics)
9. [Timeline & Roadmap](#timeline--roadmap)

---

## Current State Assessment

### ✅ What's Working (Fully Implemented)

**Lead Capture Infrastructure:**
- 2 functional forms: Quick Quote (lightweight) + Full Booking (multi-step)
- API endpoints: `/api/lead` and `/api/booking/submit`
- Database: Complete schema with `leads`, `media`, `lead_activities` tables
- File uploads: Supabase Storage integration (5 images max, 10MB total)
- Security: Anti-spam (honeypot + timestamp), Zod validation, RLS policies
- Reference numbers: Auto-generated for tracking

**Documentation:**
- Comprehensive SMS templates defined (`spec/booking/sms-templates.md` - 436 lines)
- Booking flow specification (`spec/booking/flow.md` - 813 lines)
- Environment variables configured for Twilio, SendGrid, Resend

### ❌ Critical Gaps (Not Implemented)

1. **Email Notifications:** Configuration exists, but no actual sending
2. **SMS Notifications:** Configuration exists, but no actual sending
3. **Notification Endpoints:** `src/app/api/booking/notify/route.ts` is stubbed (returns empty success)
4. **Lead Distribution:** No logic to assign/route leads to staff
5. **Activity Tracking:** Database table exists but no writes
6. **Job Queue:** No async task processing for reliability
7. **NPM Dependencies:** Missing `twilio`, `@sendgrid/mail`, `resend` packages

### 🔍 Key Files Referenced

```
src/app/api/booking/submit/route.ts:289  # Main booking endpoint
src/app/api/lead/route.ts:164            # Quick quote endpoint
src/app/api/booking/notify/route.ts:7    # Stub notification endpoint
spec/booking/sms-templates.md:436        # SMS template documentation
spec/booking/flow.md:813                 # Complete booking flow spec
.env.example:163                         # Environment configuration
```

---

## System Architecture

### High-Level Data Flow

```
┌─────────────────┐
│  Customer Form  │
│  (Quick Quote   │
│  or Full Book)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Endpoint   │
│  /api/booking/  │
│  submit         │
└────────┬────────┘
         │
         ├──────────────────────────────┐
         │                              │
         ▼                              ▼
┌─────────────────┐          ┌──────────────────┐
│  Supabase DB    │          │  Notification    │
│  (Lead Stored)  │          │  Queue (BullMQ)  │
└─────────────────┘          └────────┬─────────┘
                                      │
                     ┌────────────────┼────────────────┐
                     │                │                │
                     ▼                ▼                ▼
              ┌──────────┐   ┌──────────┐   ┌──────────┐
              │ Customer │   │  Staff   │   │ Activity │
              │  Email   │   │  Email   │   │  Logger  │
              └──────────┘   └──────────┘   └──────────┘
                     │                │                │
                     ▼                ▼                ▼
              ┌──────────┐   ┌──────────┐   ┌──────────┐
              │ Customer │   │  Staff   │   │  lead_   │
              │   SMS    │   │   SMS    │   │activities│
              └──────────┘   └──────────┘   └──────────┘
```

### Component Architecture

```
src/lib/notifications/
├── email.ts              # Email service abstraction (Resend/SendGrid)
├── sms.ts               # SMS service (Twilio wrapper)
├── templates.ts         # Template rendering engine
├── queue.ts             # BullMQ job queue management
├── distribution.ts      # Lead assignment logic
├── activity-logger.ts   # Write to lead_activities table
└── templates/
    ├── email/
    │   ├── customer-quote-confirmation.tsx
    │   ├── staff-new-lead-alert.tsx
    │   └── appointment-confirmed.tsx
    └── sms/
        ├── initial-confirmation.ts
        ├── appointment-confirmed.ts
        └── reminder-24h.ts
```

---

## Implementation Plan

### Phase 1: Foundation & Dependencies

**Duration:** Week 1
**Priority:** Critical

#### 1.1 Install NPM Packages

```bash
# SMS Provider
npm install twilio

# Email Provider (choose one)
npm install resend              # Recommended
# OR
npm install @sendgrid/mail      # Alternative

# Job Queue
npm install bullmq ioredis      # Redis-based queue

# Utilities
npm install @react-email/components react-email  # Email templates
npm install date-fns                             # Timezone handling
```

#### 1.2 Create Service Modules

**File:** `src/lib/notifications/email.ts`
```typescript
interface EmailService {
  send(params: EmailParams): Promise<EmailResult>;
  sendTemplate(template: string, data: any): Promise<EmailResult>;
}

// Provider abstraction supports both Resend and SendGrid
```

**File:** `src/lib/notifications/sms.ts`
```typescript
interface SMSService {
  send(params: SMSParams): Promise<SMSResult>;
  validatePhone(phone: string): boolean;
  handleOptOut(phone: string): Promise<void>;
}

// Twilio wrapper with retry logic
```

**File:** `src/lib/notifications/queue.ts`
```typescript
// BullMQ queue configuration
type JobType =
  | 'send-customer-email'
  | 'send-staff-email'
  | 'send-customer-sms'
  | 'send-staff-sms'
  | 'webhook-crm'
  | 'log-activity';

// Retry configuration: 3 attempts, exponential backoff
```

#### 1.3 Environment Validation

**File:** `src/lib/notifications/config.ts`
```typescript
// Runtime validation of required env vars
// Fallback to mock services in development
// Clear error messages if misconfigured
```

---

### Phase 2: Email Notification System

**Duration:** Week 1-2
**Priority:** Critical

#### 2.1 Email Types

**1. Customer Confirmation Email** (Immediate)
- **Trigger:** Lead submission successful
- **Template:** `customer-quote-confirmation.tsx`
- **Subject:** "We received your request - Ref #{referenceNumber}"
- **Content:**
  - Confirmation message
  - Service summary
  - Vehicle information
  - Reference number
  - Next steps (expect call within 15 minutes)
  - Phone number: (720) 918-7465
- **Priority:** High

**2. Staff/Admin Alert Email** (Immediate)
- **Trigger:** Lead submission successful
- **Template:** `staff-new-lead-alert.tsx`
- **Subject:** "🚨 New Lead: {year} {make} {model} - {serviceType}"
- **Recipient:** `ADMIN_EMAIL` environment variable
- **Content:**
  - Full lead details
  - Customer contact information
  - Service type and preferences
  - Uploaded photos (if any)
  - Link to admin panel (future)
  - Priority indicator
- **Priority:** High

**3. Appointment Confirmed Email** (Manual trigger)
- **Trigger:** After phone confirmation call
- **Template:** `appointment-confirmed.tsx`
- **Subject:** "Appointment Confirmed - {date} at {time}"
- **Content:**
  - Appointment details
  - Technician name
  - Service address
  - Preparation instructions
  - Calendar invite (ICS file)
  - Contact information

#### 2.2 Email Template Structure

Using React Email for type-safe, responsive templates:

```tsx
// src/lib/notifications/templates/email/customer-quote-confirmation.tsx
export function CustomerQuoteConfirmation({
  firstName,
  referenceNumber,
  vehicle,
  serviceType
}: EmailProps) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Heading>Thanks for choosing Pink Auto Glass!</Heading>
          <Text>Hi {firstName},</Text>
          <Text>
            We received your request for {serviceType} service
            for your {vehicle.year} {vehicle.make} {vehicle.model}.
          </Text>
          <Section>
            <Text><strong>Reference Number:</strong> {referenceNumber}</Text>
            <Text><strong>Next Steps:</strong></Text>
            <Text>We'll call you within 15 minutes to confirm your appointment.</Text>
          </Section>
          {/* Footer with contact info, address, unsubscribe */}
        </Container>
      </Body>
    </Html>
  );
}
```

#### 2.3 Email Service Implementation

**Provider Choice: Resend (Recommended)**

**Pros:**
- Modern, developer-friendly API
- React Email native support
- Built-in email verification
- Generous free tier (3,000 emails/month)
- Great documentation

**Implementation:**
```typescript
// src/lib/notifications/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendCustomerConfirmation(lead: Lead) {
  const template = await renderEmailTemplate('customer-quote-confirmation', {
    firstName: lead.first_name,
    referenceNumber: lead.reference_number,
    vehicle: {
      year: lead.vehicle_year,
      make: lead.vehicle_make,
      model: lead.vehicle_model
    },
    serviceType: lead.service_type
  });

  const result = await resend.emails.send({
    from: 'Pink Auto Glass <noreply@pinkautoglass.com>',
    to: lead.email,
    subject: `We received your request - Ref #${lead.reference_number}`,
    html: template.html,
    text: template.text
  });

  // Log activity
  await logActivity({
    lead_id: lead.id,
    activity_type: 'email_sent',
    description: 'Customer confirmation email sent',
    metadata: { messageId: result.id }
  });

  return result;
}
```

---

### Phase 3: SMS Notification System

**Duration:** Week 2
**Priority:** Critical

#### 3.1 SMS Types (Initial Implementation)

**1. Initial Quote Confirmation SMS** (Immediate)
- **Trigger:** Lead submission successful
- **Type:** Transactional (no consent required)
- **Template:** From `spec/booking/sms-templates.md:27-42`
- **Content:**
  ```
  Hi {firstName}! We received your windshield {serviceType} request
  for your {year} {make} {model} (Ref: {referenceNumber}).
  We'll call you within 15 minutes to confirm your appointment.
  Questions? Call (720) 918-7465

  Text STOP to opt-out
  ```
- **Character Count:** 157 (single SMS)

**2. Appointment Confirmed SMS**
- **Trigger:** After phone confirmation
- **Type:** Transactional (requires SMS consent)
- **Template:** From `spec/booking/sms-templates.md:45-64`
- **Content:**
  ```
  Your windshield {serviceType} is confirmed for {appointmentDate}
  between {timeWindow} at {address}. Your technician is {technicianName}.
  We'll text updates as we get closer!

  Reply STOP to opt-out
  ```

**3. 24-Hour Reminder SMS**
- **Trigger:** 24 hours before appointment
- **Type:** Transactional (requires SMS consent)
- **Template:** From `spec/booking/sms-templates.md:69-87`

#### 3.2 SMS Service Implementation

**Provider: Twilio**

```typescript
// src/lib/notifications/sms.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendCustomerSMS(lead: Lead, template: string) {
  // Check SMS consent
  if (!lead.sms_consent && template !== 'initial-confirmation') {
    console.log('SMS consent not given, skipping');
    return;
  }

  // Validate phone number
  const phoneE164 = lead.phone_e164;
  if (!phoneE164 || !phoneE164.startsWith('+1')) {
    throw new Error('Invalid phone number');
  }

  // Check send time window (8 AM - 8 PM local time)
  const sendTime = new Date();
  const localHour = getLocalHour(lead.state, sendTime);
  if (localHour < 8 || localHour >= 20) {
    console.log('Outside send window, queuing for later');
    // Schedule for 8 AM local time
    return scheduleForLater(lead, template);
  }

  // Render template
  const message = renderSMSTemplate(template, {
    firstName: lead.first_name,
    serviceType: lead.service_type,
    year: lead.vehicle_year,
    make: lead.vehicle_make,
    model: lead.vehicle_model,
    referenceNumber: lead.reference_number
  });

  // Send via Twilio
  const result = await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneE164,
    statusCallback: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/twilio`
  });

  // Log activity
  await logActivity({
    lead_id: lead.id,
    activity_type: 'sms_sent',
    description: 'Initial confirmation SMS sent',
    metadata: {
      messageId: result.sid,
      to: phoneE164,
      template: template
    }
  });

  return result;
}
```

#### 3.3 TCPA Compliance Features

**Requirements:**
- ✅ Express written consent obtained (smsConsent checkbox in form)
- ✅ Clear consent language displayed
- ✅ Opt-out mechanism (STOP keyword)
- ✅ Consent timestamp stored
- ✅ Send time windows enforced (8 AM - 8 PM local time)
- ✅ Opt-out footer on all messages

**Opt-out Handler:**
```typescript
// src/lib/notifications/sms.ts
export async function handleIncomingSMS(body: string, from: string) {
  const normalizedBody = body.trim().toUpperCase();

  if (['STOP', 'END', 'CANCEL', 'UNSUBSCRIBE', 'QUIT'].includes(normalizedBody)) {
    // Update database
    await supabase
      .from('leads')
      .update({ sms_consent: false })
      .eq('phone_e164', from);

    // Send confirmation
    await client.messages.create({
      body: "You've been unsubscribed from Pink Auto Glass SMS. You won't receive promotional messages but may still get appointment confirmations. Call (720) 918-7465 for service.",
      from: process.env.TWILIO_PHONE_NUMBER,
      to: from
    });

    // Log activity
    await logActivity({
      activity_type: 'sms_opt_out',
      description: 'Customer opted out of SMS',
      metadata: { phone: from }
    });
  }

  if (['START', 'BEGIN', 'YES'].includes(normalizedBody)) {
    // Re-enable SMS
    await supabase
      .from('leads')
      .update({ sms_consent: true })
      .eq('phone_e164', from);

    await client.messages.create({
      body: "Welcome back! You'll now receive SMS updates from Pink Auto Glass. Text STOP anytime to opt-out.",
      from: process.env.TWILIO_PHONE_NUMBER,
      to: from
    });
  }
}
```

---

### Phase 4: Lead Distribution Logic

**Duration:** Week 3
**Priority:** High

#### 4.1 Distribution Strategy

**Initial Implementation: Single Admin**
- All leads → `ADMIN_EMAIL` environment variable
- Manual distribution by admin
- Simple, reliable, no assignment logic needed

**Future Enhancement: Multi-staff Distribution**
- Round-robin or skill-based assignment
- Requires staff roster table
- Load balancing across team

#### 4.2 Priority Scoring

```typescript
// src/lib/notifications/distribution.ts
export function calculateLeadPriority(lead: Lead): 'high' | 'normal' {
  let score = 0;

  // Service type (replacement = higher value)
  if (lead.service_type === 'replacement') score += 3;
  else score += 1;

  // Has uploaded photos (more engaged customer)
  if (lead.media_count > 0) score += 2;

  // Urgent appointment (within 48 hours)
  const hoursUntil = getHoursUntil(lead.preferred_date);
  if (hoursUntil < 48) score += 2;

  // Mobile service add-on
  if (lead.mobile_service) score += 1;

  // High-value vehicle brands
  const premiumBrands = ['BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Tesla'];
  if (premiumBrands.includes(lead.vehicle_make)) score += 1;

  return score >= 5 ? 'high' : 'normal';
}
```

#### 4.3 Notification Recipients

```typescript
// src/lib/notifications/distribution.ts
export function getNotificationRecipients(lead: Lead) {
  const priority = calculateLeadPriority(lead);

  return {
    email: [
      process.env.ADMIN_EMAIL!,
      // Future: add staff emails based on assignment rules
    ],
    sms: priority === 'high'
      ? [process.env.STAFF_ON_CALL_PHONE]  // High priority = SMS alert
      : [],  // Normal priority = email only
    webhook: [
      process.env.WEBHOOK_CRM_URL,
      process.env.WEBHOOK_SLACK_URL
    ].filter(Boolean)
  };
}
```

---

### Phase 5: Job Queue System

**Duration:** Week 3
**Priority:** High

#### 5.1 Why a Job Queue?

**Problems Without Queue:**
1. Notification failures block API response
2. No retry mechanism for failed sends
3. Can't handle rate limiting gracefully
4. Difficult to monitor/debug
5. Poor separation of concerns

**Benefits With Queue:**
1. API responds immediately (lead saved first)
2. Automatic retries with exponential backoff
3. Rate limiting handled transparently
4. Monitoring and analytics built-in
5. Failed jobs isolated for investigation

#### 5.2 Queue Implementation (BullMQ + Redis)

**Infrastructure: Upstash Redis**
- Serverless Redis (no server management)
- Free tier: 10,000 commands/day (sufficient for initial volume)
- Pay-as-you-go pricing beyond free tier

**Queue Configuration:**
```typescript
// src/lib/notifications/queue.ts
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.UPSTASH_REDIS_URL!, {
  maxRetriesPerRequest: null
});

export const notificationQueue = new Queue('notifications', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000  // 2s, 4s, 8s
    },
    removeOnComplete: 100,  // Keep last 100 completed
    removeOnFail: false     // Keep failed for debugging
  }
});

// Job processor
const worker = new Worker(
  'notifications',
  async (job) => {
    const { type, leadId, data } = job.data;

    switch (type) {
      case 'send-customer-email':
        return await sendCustomerEmail(leadId, data);
      case 'send-staff-email':
        return await sendStaffEmail(leadId, data);
      case 'send-customer-sms':
        return await sendCustomerSMS(leadId, data);
      case 'send-staff-sms':
        return await sendStaffSMS(leadId, data);
      case 'webhook-crm':
        return await sendWebhook(leadId, data);
      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
  // Alert admin for repeated failures
});
```

#### 5.3 Queue Integration with Booking Endpoint

**Update:** `src/app/api/booking/submit/route.ts`

```typescript
// After successful lead insertion (line ~220)
if (!leadError) {
  // Get reference number
  const { data: referenceNumber } = await client.rpc(
    "fn_get_reference_number",
    { p_id: leadId }
  );

  // ========== NEW: Queue Notifications ==========
  try {
    // Customer notifications
    await notificationQueue.add('send-customer-email', {
      type: 'send-customer-email',
      leadId,
      data: { template: 'quote-confirmation' }
    });

    if (validatedData.smsConsent) {
      await notificationQueue.add('send-customer-sms', {
        type: 'send-customer-sms',
        leadId,
        data: { template: 'initial-confirmation' }
      });
    }

    // Staff notifications
    const priority = calculateLeadPriority(validatedData);
    await notificationQueue.add('send-staff-email', {
      type: 'send-staff-email',
      leadId,
      data: { priority }
    });

    // External integrations
    if (process.env.WEBHOOK_CRM_URL) {
      await notificationQueue.add('webhook-crm', {
        type: 'webhook-crm',
        leadId,
        data: { url: process.env.WEBHOOK_CRM_URL }
      });
    }
  } catch (queueError) {
    // Log but don't fail the request
    console.error('Failed to queue notifications:', queueError);
    // TODO: Alert admin via fallback method
  }
  // =============================================

  // Return success immediately (don't wait for notifications)
  return NextResponse.json({
    ok: true,
    id: leadId,
    referenceNumber: referenceNumber || leadId.slice(0, 8).toUpperCase(),
    files: uploadedFiles
  });
}
```

---

### Phase 6: Activity Tracking & Logging

**Duration:** Week 4
**Priority:** Medium

#### 6.1 Activity Logger Implementation

**Purpose:**
- Audit trail of all customer communications
- Delivery confirmation tracking
- Compliance record keeping (TCPA)
- Support issue investigation
- Analytics (open rates, delivery rates)

**File:** `src/lib/notifications/activity-logger.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

export type ActivityType =
  | 'email_sent'
  | 'email_delivered'
  | 'email_opened'
  | 'email_failed'
  | 'sms_sent'
  | 'sms_delivered'
  | 'sms_failed'
  | 'sms_opt_out'
  | 'call_made'
  | 'appointment_scheduled'
  | 'status_updated';

interface ActivityLogEntry {
  lead_id: string;
  activity_type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  created_by?: string;
}

export async function logActivity(entry: ActivityLogEntry) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from('lead_activities')
    .insert({
      lead_id: entry.lead_id,
      activity_type: entry.activity_type,
      description: entry.description,
      metadata: entry.metadata || {},
      created_by: entry.created_by || 'system',
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Failed to log activity:', error);
    // Don't throw - logging failure shouldn't break main flow
  }
}
```

#### 6.2 Integration Points

**Email Service:**
```typescript
// After sending email
await logActivity({
  lead_id: leadId,
  activity_type: 'email_sent',
  description: `Customer confirmation email sent to ${email}`,
  metadata: {
    template: 'customer-quote-confirmation',
    messageId: result.id,
    recipient: email,
    subject: result.subject
  }
});
```

**SMS Service:**
```typescript
// After sending SMS
await logActivity({
  lead_id: leadId,
  activity_type: 'sms_sent',
  description: `Confirmation SMS sent to ${phone}`,
  metadata: {
    template: 'initial-confirmation',
    messageId: result.sid,
    recipient: phone,
    status: result.status
  }
});
```

**Twilio Webhook (Delivery Confirmation):**
```typescript
// When Twilio confirms delivery
await logActivity({
  lead_id: leadId,
  activity_type: 'sms_delivered',
  description: 'SMS delivered successfully',
  metadata: {
    messageId: body.MessageSid,
    status: body.MessageStatus,
    deliveredAt: new Date().toISOString()
  }
});
```

---

### Phase 7: Webhook Endpoints

**Duration:** Week 4
**Priority:** Medium

#### 7.1 Twilio Delivery Status Webhook

**File:** `src/app/api/webhooks/twilio/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  try {
    // Verify Twilio signature for security
    const signature = req.headers.get('x-twilio-signature') || '';
    const url = `${process.env.NEXT_PUBLIC_SITE_URL}${req.nextUrl.pathname}`;
    const params = await req.formData();

    const isValid = twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN!,
      signature,
      url,
      Object.fromEntries(params)
    );

    if (!isValid) {
      console.error('Invalid Twilio signature');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse status update
    const messageSid = params.get('MessageSid');
    const status = params.get('MessageStatus');  // delivered, failed, undelivered
    const from = params.get('From');
    const body = params.get('Body');

    // Handle delivery status
    if (status === 'delivered') {
      await logActivity({
        activity_type: 'sms_delivered',
        description: 'SMS delivered successfully',
        metadata: { messageId: messageSid, phone: from }
      });
    } else if (status === 'failed' || status === 'undelivered') {
      await logActivity({
        activity_type: 'sms_failed',
        description: `SMS delivery failed: ${status}`,
        metadata: { messageId: messageSid, phone: from }
      });
    }

    // Handle customer reply (opt-out)
    if (body) {
      await handleIncomingSMS(body, from!);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Twilio webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

#### 7.2 CRM Webhook Integration

**File:** `src/lib/notifications/webhooks.ts`

```typescript
export async function sendCRMWebhook(lead: Lead) {
  if (!process.env.WEBHOOK_CRM_URL) {
    console.log('CRM webhook not configured, skipping');
    return;
  }

  const payload = {
    leadId: lead.id,
    referenceNumber: lead.reference_number,
    customer: {
      firstName: lead.first_name,
      lastName: lead.last_name,
      phone: lead.phone_e164,
      email: lead.email
    },
    vehicle: {
      year: lead.vehicle_year,
      make: lead.vehicle_make,
      model: lead.vehicle_model
    },
    service: {
      type: lead.service_type,
      mobileService: lead.mobile_service,
      preferredDate: lead.preferred_date
    },
    location: {
      city: lead.city,
      state: lead.state,
      zip: lead.zip
    },
    timestamp: new Date().toISOString()
  };

  const response = await fetch(process.env.WEBHOOK_CRM_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.WEBHOOK_CRM_TOKEN}`,
      'X-Webhook-Source': 'pinkautoglass-website'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`CRM webhook failed: ${response.status}`);
  }

  await logActivity({
    lead_id: lead.id,
    activity_type: 'webhook_sent',
    description: 'Lead sent to CRM system',
    metadata: {
      url: process.env.WEBHOOK_CRM_URL,
      status: response.status
    }
  });
}
```

---

### Phase 8: Error Handling & Monitoring

**Duration:** Week 5
**Priority:** High

#### 8.1 Error Handling Strategy

**Principle:** Notification failures should NEVER block lead capture

```typescript
// Wrap all notification calls with try-catch
try {
  await sendNotification(lead);
} catch (error) {
  // Log error
  console.error('Notification failed:', error);

  // Log to activity table
  await logActivity({
    lead_id: lead.id,
    activity_type: 'notification_failed',
    description: `Notification error: ${error.message}`,
    metadata: {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }
  });

  // Alert admin via fallback method (phone call, different email provider)
  await sendFallbackAlert({
    subject: 'Notification System Error',
    leadId: lead.id,
    error: error.message
  });

  // DON'T throw - lead is already saved successfully
}
```

#### 8.2 Monitoring Dashboard

**Metrics to Track:**
- Notification success rate (email/SMS)
- Average delivery time
- Queue depth (current jobs pending)
- Dead letter queue size
- Opt-out rate
- Webhook failure rate

**Alert Triggers:**
- ⚠️ Email success rate < 95%
- ⚠️ SMS success rate < 98%
- 🚨 Queue depth > 100 jobs
- 🚨 Dead letter queue has jobs
- 🚨 5+ consecutive failures for same provider

**Implementation:**
```typescript
// src/lib/notifications/monitoring.ts
export async function getNotificationMetrics() {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const { data: activities } = await supabase
    .from('lead_activities')
    .select('activity_type')
    .gte('created_at', last24h.toISOString());

  const emailSent = activities.filter(a => a.activity_type === 'email_sent').length;
  const emailFailed = activities.filter(a => a.activity_type === 'email_failed').length;
  const smsSent = activities.filter(a => a.activity_type === 'sms_sent').length;
  const smsFailed = activities.filter(a => a.activity_type === 'sms_failed').length;

  return {
    email: {
      sent: emailSent,
      failed: emailFailed,
      successRate: emailSent / (emailSent + emailFailed) * 100
    },
    sms: {
      sent: smsSent,
      failed: smsFailed,
      successRate: smsSent / (smsSent + smsFailed) * 100
    },
    queueDepth: await notificationQueue.count(),
    timestamp: new Date().toISOString()
  };
}
```

---

## Technical Decisions

### Decision 1: Email Provider

**Option A: SendGrid**
- ✅ Established, reliable service
- ✅ Detailed analytics and reporting
- ✅ Marketing features (campaigns, A/B testing)
- ❌ More complex API
- ❌ Higher cost at scale ($15-20/month for 40k emails)
- ❌ Legacy design

**Option B: Resend** ⭐ **RECOMMENDED**
- ✅ Modern, developer-friendly API
- ✅ React Email native support
- ✅ Built-in email verification
- ✅ Generous free tier (3,000 emails/month)
- ✅ Great documentation and DX
- ❌ Newer service (less proven)
- ❌ Fewer integrations

**Recommendation:** **Resend** for better developer experience and lower cost. Can switch to SendGrid later if needed.

---

### Decision 2: Job Queue Infrastructure

**Option A: Redis + BullMQ** ⭐ **RECOMMENDED**
- ✅ Most reliable for production
- ✅ Excellent monitoring and debugging
- ✅ Built-in retry logic
- ✅ Handles rate limiting
- ✅ Upstash serverless option (no server management)
- ❌ Requires Redis (external service)
- ❌ Slightly more complex setup

**Option B: Database Queue (Postgres)**
- ✅ No external service needed
- ✅ Simpler setup (use existing Supabase)
- ✅ ACID guarantees
- ❌ Less performant at scale
- ❌ No built-in monitoring
- ❌ Manual retry logic

**Recommendation:** **Redis + BullMQ with Upstash**. Free tier is sufficient, and reliability is critical.

---

### Decision 3: Staff Distribution Strategy

**Option A: Single Admin Email** ⭐ **RECOMMENDED FOR V1**
- ✅ Simple implementation
- ✅ No assignment logic needed
- ✅ Admin manually distributes
- ✅ Zero risk of missed leads
- ❌ Manual process

**Option B: Multi-Staff Round-Robin**
- ✅ Automatic distribution
- ✅ Load balancing
- ❌ Requires staff roster table
- ❌ More complex logic
- ❌ Risk of assignment bugs

**Recommendation:** **Start with Option A**, implement Option B in Phase 2 after validation.

---

### Decision 4: SMS Send Timing

**Option A: Immediate** ⭐ **RECOMMENDED**
- ✅ Better customer experience
- ✅ Matches customer expectation
- ✅ Honeypot already filters spam
- ❌ No human review before sending

**Option B: Delayed 5 Minutes**
- ✅ Staff can review lead first
- ✅ Can suppress spam before SMS
- ❌ Worse customer experience
- ❌ Adds complexity

**Recommendation:** **Immediate**. Anti-spam is already effective, and customers expect fast response.

---

## Cost Analysis

### Email Provider: Resend

| Volume | Cost | Notes |
|--------|------|-------|
| 0 - 3,000 emails/month | $0 (Free) | Sufficient for initial launch |
| 3,000 - 50,000 emails/month | $20/month | Pro plan |
| 50,000+ emails/month | Custom | Enterprise pricing |

**Expected Volume:**
- Customer confirmations: ~100-300/month
- Staff alerts: ~100-300/month
- Appointment confirmations: ~50-150/month
- **Total:** ~250-750/month ✅ **Free Tier**

---

### SMS Provider: Twilio

| Item | Cost | Notes |
|------|------|-------|
| SMS (US) | $0.0079 per message | ~0.8¢ per SMS |
| Phone number | $1.15/month | Toll-free number |
| Free trial credit | $15 | Good for ~1,900 messages |

**Expected Volume:**
- Initial confirmations: ~50-150/month
- Appointment confirmations: ~50-150/month
- Reminders: ~50-150/month
- **Total:** ~150-450 SMS/month
- **Monthly Cost:** ~$1.19 - $3.56

---

### Queue Infrastructure: Upstash Redis

| Tier | Commands/Day | Cost | Notes |
|------|--------------|------|-------|
| Free | 10,000 | $0 | ~300 commands/hour |
| Pay-as-you-go | 100,000 | $0.20 | Beyond free tier |

**Expected Volume:**
- ~5 queue operations per lead
- ~100-300 leads/month
- **Total:** ~500-1,500 commands/month ✅ **Free Tier**

---

### Total Monthly Cost

| Service | Cost | Notes |
|---------|------|-------|
| Resend (Email) | $0 | Free tier sufficient |
| Twilio (SMS) | $1.19 - $3.56 | Plus $1.15 phone rental |
| Upstash Redis | $0 | Free tier sufficient |
| **Total** | **< $5/month** | At initial volume (~100-300 leads/month) |

**Cost Scaling:**
- At 1,000 leads/month: ~$15-25/month
- At 5,000 leads/month: ~$75-100/month
- Primarily driven by SMS costs (~$0.016 per lead for 2 SMS)

---

## Compliance Requirements

### TCPA (Telephone Consumer Protection Act)

**SMS Compliance:**
- ✅ **Express Written Consent Required**
  - Checkbox in booking form: `smsConsent`
  - Clear language: "I consent to receive appointment updates and service notifications via SMS"

- ✅ **Opt-Out Mechanism**
  - STOP keyword handled automatically
  - Confirmation sent: "You've been unsubscribed..."
  - Database updated: `sms_consent = false`

- ✅ **Consent Records**
  - Timestamp stored in database
  - Method documented (web form checkbox)
  - Retrievable for audits

- ✅ **Send Time Windows**
  - 8 AM - 8 PM customer local time only
  - Timezone calculated from state/ZIP code
  - Urgent messages exempt (safety-related)

- ✅ **Message Content**
  - All messages include opt-out footer
  - Clear identification (Pink Auto Glass)
  - No misleading content

**Transactional vs. Promotional:**
- **Transactional** (no consent required):
  - Initial quote confirmation
  - Appointment confirmations
  - Service status updates

- **Promotional** (consent required):
  - Feedback requests
  - Future service reminders
  - Promotional offers

---

### CAN-SPAM Act

**Email Compliance:**
- ✅ **Accurate Header Information**
  - From: Pink Auto Glass <noreply@pinkautoglass.com>
  - Reply-to: service@pinkautoglass.com
  - No misleading subject lines

- ✅ **Physical Address in Footer**
  - Business address included
  - Visible in all emails

- ✅ **Unsubscribe Mechanism**
  - Clear unsubscribe link (promotional emails)
  - Processed within 10 business days
  - No login required to unsubscribe

- ✅ **Transactional Exemption**
  - Quote confirmations are transactional
  - No unsubscribe required
  - But included anyway for good practice

---

### GDPR / Privacy

**Data Protection:**
- ✅ **Lawful Basis:** Service delivery (contract fulfillment)
- ✅ **Transparency:** Privacy policy updated with notification practices
- ✅ **Data Minimization:** Only collect necessary data
- ✅ **Retention Period:** 18 months documented
- ✅ **Right to Deletion:** Customer can request removal
- ✅ **Security:** Encryption in transit (TLS) and at rest

**Data Processed:**
- Name, phone, email (necessary for service)
- Vehicle info (necessary for quote)
- Location (necessary for service delivery)
- Communication logs (necessary for compliance)

---

## Risk Mitigation

### Risk 1: Notification Failure Blocks Lead Capture

**Impact:** Critical - Lost leads
**Likelihood:** Medium

**Mitigation:**
- ✅ Queue all notifications asynchronously
- ✅ Never block API response on notification success
- ✅ Lead is saved FIRST, notifications are secondary
- ✅ Comprehensive try-catch around all notification code

**Code Pattern:**
```typescript
// Save lead first
const lead = await saveLead(data);

// Then notify (async, can fail)
try {
  await queueNotifications(lead);
} catch (error) {
  console.error('Notification queuing failed:', error);
  // Lead is still saved - this is acceptable
}

// Return success immediately
return { success: true, leadId: lead.id };
```

---

### Risk 2: Email/SMS Provider Downtime

**Impact:** High - Customers don't receive confirmations
**Likelihood:** Low

**Mitigation:**
- ✅ Retry logic (3 attempts, exponential backoff)
- ✅ Dead letter queue for failed jobs
- ✅ Monitor queue depth and alert if growing
- ✅ Fallback notification method (phone call, different provider)
- ✅ Status page monitoring for providers

**Monitoring:**
```typescript
// Alert if queue is backing up
if (await notificationQueue.count() > 50) {
  await sendAdminAlert('Notification queue backing up - investigate provider status');
}
```

---

### Risk 3: Spam Complaints / TCPA Violations

**Impact:** Critical - Legal liability, fines
**Likelihood:** Low (with proper controls)

**Mitigation:**
- ✅ Strict opt-in requirement for promotional SMS
- ✅ Clear consent language shown to user
- ✅ Immediate opt-out handling (STOP keyword)
- ✅ Send time window enforcement
- ✅ Audit trail of all communications
- ✅ Regular compliance reviews

**Audit Capability:**
```sql
-- Prove consent was obtained
SELECT
  phone_e164,
  sms_consent,
  created_at,
  updated_at
FROM leads
WHERE phone_e164 = '+11234567890';

-- Show all messages sent
SELECT *
FROM lead_activities
WHERE lead_id = 'uuid'
  AND activity_type IN ('sms_sent', 'sms_delivered');
```

---

### Risk 4: Cost Overruns (SMS)

**Impact:** Medium - Unexpected bills
**Likelihood:** Low

**Mitigation:**
- ✅ Rate limiting on SMS (max per customer per day)
- ✅ Daily spend caps configured in Twilio
- ✅ Monitoring alerts at threshold ($50/day)
- ✅ Separate test environment with test credentials
- ✅ No automated retry loops (fixed retry count)

**Cost Controls:**
```typescript
// Max 4 SMS per customer per day
const smsToday = await countSMSToday(phone);
if (smsToday >= 4) {
  console.log('SMS limit reached for today');
  return;
}

// Twilio daily spend cap: $100
// Alert at 80%: $80
```

---

### Risk 5: Queue Overflow / Worker Failure

**Impact:** Medium - Delayed notifications
**Likelihood:** Low

**Mitigation:**
- ✅ Queue depth monitoring (alert at 100 jobs)
- ✅ Multiple workers for redundancy
- ✅ Auto-scaling workers based on queue depth
- ✅ Stale job detection (alert if job > 1 hour old)
- ✅ Dead letter queue for permanently failed jobs

**Monitoring:**
```typescript
// Health check endpoint
export async function GET() {
  const queueDepth = await notificationQueue.count();
  const oldestJob = await notificationQueue.getJobs(['waiting'], 0, 1);

  const health = {
    status: queueDepth < 100 ? 'healthy' : 'degraded',
    queueDepth,
    oldestJobAge: oldestJob[0]
      ? Date.now() - oldestJob[0].timestamp
      : 0
  };

  return Response.json(health);
}
```

---

## Success Metrics

### Customer Experience Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Confirmation email delivery time | < 60 seconds | `lead_activities.created_at` timestamp |
| SMS delivery time | < 60 seconds | Twilio delivery webhook timestamp |
| Email open rate | > 40% | Email provider analytics |
| SMS opt-in rate | > 60% | `COUNT(sms_consent = true) / COUNT(*)` |
| SMS delivery rate | > 98% | `COUNT(sms_delivered) / COUNT(sms_sent)` |

---

### Operational Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Staff notification time | < 60 seconds | Activity log timestamps |
| Lead response time (manual) | < 15 minutes | First call activity vs. lead created |
| Zero missed leads | 100% | All leads have notification attempts |
| Activity log completeness | 100% | Every notification logged |

---

### Technical Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| API response time | < 500ms | Performance monitoring |
| Notification success rate | > 95% | `successful_jobs / total_jobs` |
| Queue processing time | < 30 seconds | Job completion timestamps |
| Dead letter queue size | 0 jobs | BullMQ monitoring |
| Worker uptime | > 99% | Health check monitoring |

---

### SQL Queries for Metrics

```sql
-- Email success rate (last 24 hours)
SELECT
  COUNT(*) FILTER (WHERE activity_type = 'email_sent') as sent,
  COUNT(*) FILTER (WHERE activity_type = 'email_failed') as failed,
  ROUND(
    COUNT(*) FILTER (WHERE activity_type = 'email_sent')::numeric /
    NULLIF(COUNT(*), 0) * 100,
    2
  ) as success_rate_pct
FROM lead_activities
WHERE activity_type IN ('email_sent', 'email_failed')
  AND created_at > NOW() - INTERVAL '24 hours';

-- SMS opt-in rate
SELECT
  COUNT(*) FILTER (WHERE sms_consent = true) as opted_in,
  COUNT(*) as total,
  ROUND(
    COUNT(*) FILTER (WHERE sms_consent = true)::numeric /
    COUNT(*) * 100,
    2
  ) as opt_in_rate_pct
FROM leads
WHERE created_at > NOW() - INTERVAL '30 days';

-- Average notification delivery time
SELECT
  AVG(
    EXTRACT(EPOCH FROM (la.created_at - l.created_at))
  ) as avg_seconds
FROM lead_activities la
JOIN leads l ON la.lead_id = l.id
WHERE la.activity_type IN ('email_sent', 'sms_sent')
  AND la.created_at > NOW() - INTERVAL '7 days';
```

---

## Timeline & Roadmap

### Week 1: Foundation (Nov 1-7)
- [ ] Install NPM packages (twilio, resend, bullmq, ioredis)
- [ ] Set up Upstash Redis account and get credentials
- [ ] Create service module structure (`src/lib/notifications/`)
- [ ] Implement email service (`email.ts`)
- [ ] Create customer confirmation email template
- [ ] Test email sending in development environment
- [ ] Document environment variables needed

**Deliverable:** Can send test emails from development

---

### Week 2: SMS + Templates (Nov 8-14)
- [ ] Implement SMS service (`sms.ts`)
- [ ] Create initial SMS confirmation template
- [ ] Implement opt-out handler (STOP keyword)
- [ ] Test SMS sending in development
- [ ] Implement activity logger (`activity-logger.ts`)
- [ ] Create staff notification email template
- [ ] Add notification calls to booking endpoint (without queue)

**Deliverable:** Can send test SMS and log activities

---

### Week 3: Queue + Distribution (Nov 15-21)
- [ ] Implement BullMQ job queue (`queue.ts`)
- [ ] Create queue worker processes
- [ ] Update booking endpoint to use queue
- [ ] Implement distribution logic (`distribution.ts`)
- [ ] Create staff notification templates (email + SMS)
- [ ] Test end-to-end flow in development
- [ ] Set up queue monitoring

**Deliverable:** Complete notification system working in development

---

### Week 4: Webhooks + Advanced Features (Nov 22-28)
- [ ] Implement Twilio webhook endpoint (`/api/webhooks/twilio`)
- [ ] Add delivery status tracking
- [ ] Implement CRM webhook integration
- [ ] Create appointment confirmation templates (email + SMS)
- [ ] Add 24-hour reminder SMS
- [ ] Test webhook integrations
- [ ] Create admin activity log viewer (basic)

**Deliverable:** Full feature set with external integrations

---

### Week 5: Production Prep (Nov 29 - Dec 5)
- [ ] Set up production environment variables (Vercel)
- [ ] Configure production email domain (DNS records)
- [ ] Set up production Twilio phone number
- [ ] Implement monitoring dashboard
- [ ] Set up error alerting (email/Slack)
- [ ] Load testing (simulate 100 concurrent leads)
- [ ] Security audit (credential rotation, webhook auth)
- [ ] Documentation for operations team

**Deliverable:** Production-ready system

---

### Week 6: Launch + Validation (Dec 6-12)
- [ ] Deploy to production (gradual rollout)
- [ ] Monitor queue depth and success rates
- [ ] Verify compliance (consent tracking, opt-out)
- [ ] Customer feedback collection
- [ ] Staff training on new notifications
- [ ] Performance tuning based on real traffic
- [ ] Bug fixes and improvements

**Deliverable:** Live system with validated performance

---

## Appendix A: Environment Variables

### Required Variables

```bash
# Email Provider (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=noreply@pinkautoglass.com
ADMIN_EMAIL=admin@pinkautoglass.com

# SMS Provider (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+18001234567

# Job Queue (Upstash Redis)
UPSTASH_REDIS_URL=rediss://:token@host.upstash.io:6379

# Existing (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=https://pinkautoglass.com
```

### Optional Variables

```bash
# Alternative email provider (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@pinkautoglass.com

# External integrations
WEBHOOK_CRM_URL=https://crm.example.com/webhook/leads
WEBHOOK_CRM_TOKEN=your_crm_token
WEBHOOK_SLACK_URL=https://hooks.slack.com/services/xxx/yyy/zzz

# Staff notifications
STAFF_ON_CALL_PHONE=+17205551234  # SMS for high-priority leads

# Development overrides
MOCK_EMAIL_SERVICE=true   # Use console.log instead of sending
MOCK_SMS_SERVICE=true     # Use console.log instead of sending
```

---

## Appendix B: Key Database Queries

### Get Lead with Activities
```sql
SELECT
  l.*,
  json_agg(
    json_build_object(
      'type', la.activity_type,
      'description', la.description,
      'created_at', la.created_at,
      'metadata', la.metadata
    ) ORDER BY la.created_at DESC
  ) as activities
FROM leads l
LEFT JOIN lead_activities la ON la.lead_id = l.id
WHERE l.id = 'lead-uuid-here'
GROUP BY l.id;
```

### Notification Performance Dashboard
```sql
WITH recent_leads AS (
  SELECT id, created_at
  FROM leads
  WHERE created_at > NOW() - INTERVAL '24 hours'
),
notification_times AS (
  SELECT
    rl.id as lead_id,
    la.activity_type,
    EXTRACT(EPOCH FROM (la.created_at - rl.created_at)) as seconds_to_notify
  FROM recent_leads rl
  JOIN lead_activities la ON la.lead_id = rl.id
  WHERE la.activity_type IN ('email_sent', 'sms_sent')
)
SELECT
  activity_type,
  COUNT(*) as total_notifications,
  ROUND(AVG(seconds_to_notify)::numeric, 2) as avg_seconds,
  ROUND(MIN(seconds_to_notify)::numeric, 2) as min_seconds,
  ROUND(MAX(seconds_to_notify)::numeric, 2) as max_seconds
FROM notification_times
GROUP BY activity_type;
```

### Compliance Audit Report
```sql
-- Show consent trail for specific customer
SELECT
  l.phone_e164,
  l.first_name,
  l.last_name,
  l.sms_consent,
  l.created_at as consent_date,
  COUNT(la.id) FILTER (WHERE la.activity_type = 'sms_sent') as sms_sent_count,
  COUNT(la.id) FILTER (WHERE la.activity_type = 'sms_opt_out') as opt_out_count
FROM leads l
LEFT JOIN lead_activities la ON la.lead_id = l.id
WHERE l.phone_e164 = '+11234567890'
GROUP BY l.id;
```

---

## Appendix C: Testing Checklist

### Pre-Launch Testing

**Unit Tests:**
- [ ] Email template rendering
- [ ] SMS template rendering
- [ ] Phone number validation
- [ ] Priority scoring logic
- [ ] Activity logger

**Integration Tests:**
- [ ] Email sending (test mode)
- [ ] SMS sending (test mode)
- [ ] Queue job processing
- [ ] Webhook signature verification
- [ ] Database activity logging

**End-to-End Tests:**
- [ ] Submit quick quote → receive email + SMS
- [ ] Submit full booking → receive confirmations
- [ ] Staff receives alert email
- [ ] Activity logged in database
- [ ] Opt-out STOP keyword works
- [ ] Queue retries failed jobs

**Load Tests:**
- [ ] 10 concurrent lead submissions
- [ ] 100 concurrent lead submissions
- [ ] Queue processes 100 jobs
- [ ] No memory leaks after 1000 jobs

**Compliance Tests:**
- [ ] SMS only sent with consent
- [ ] Opt-out immediately updates database
- [ ] Send time window enforced
- [ ] All messages include opt-out footer
- [ ] Consent timestamp stored

---

## Questions for Review

Please provide feedback on the following areas:

1. **Architecture Decisions:**
   - Is the queue-based approach appropriate?
   - Should we use Resend or SendGrid for email?
   - Is Redis + BullMQ overkill for initial volume?

2. **Risk Assessment:**
   - Are there critical risks we haven't addressed?
   - Is the error handling strategy sufficient?
   - What about edge cases (duplicate submissions, race conditions)?

3. **Implementation Approach:**
   - Is the phased rollout sensible?
   - Should we implement email OR sms first, then the other?
   - Any unnecessary complexity we can remove?

4. **Compliance:**
   - Have we covered all TCPA requirements?
   - Is the consent tracking sufficient?
   - Any gaps in audit capability?

5. **Cost Optimization:**
   - Are there cheaper alternatives we should consider?
   - Can we reduce SMS volume without hurting UX?
   - Should we batch notifications to reduce costs?

6. **Scalability:**
   - Will this handle 10x volume (1,000+ leads/month)?
   - What will break first at scale?
   - When should we add more workers/infrastructure?

---

**End of Document**
