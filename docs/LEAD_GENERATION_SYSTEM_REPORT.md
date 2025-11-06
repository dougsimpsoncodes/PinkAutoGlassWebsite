# Pink Auto Glass - Lead Generation & Distribution System Analysis

**Report Date:** October 24, 2025  
**Status:** Comprehensive System Inventory Complete

---

## Executive Summary

The Pink Auto Glass website has a **functional but incomplete** lead generation system. The system successfully captures leads through multiple entry points and stores them in Supabase, but the notification and distribution infrastructure is **largely stubbed out and non-functional**. 

**Critical Findings:**
- Lead capture and storage: ✅ **FULLY IMPLEMENTED**
- Lead notification (email/SMS): ❌ **NOT IMPLEMENTED** 
- Notification infrastructure (Twilio/SendGrid/Resend): ❌ **NOT IMPLEMENTED**
- Lead distribution to staff: ⚠️ **INFRASTRUCTURE EXISTS, NOT CONNECTED**
- Activity tracking: ✅ **DATABASE SCHEMA READY**

---

## 1. Lead Generation Forms & Entry Points

### 1.1 Quick Quote Form (Homepage)
**Location:** `/src/components/QuoteForm.tsx`  
**Entry Point:** Homepage hero section and sidebar CTAs  
**Type:** Lightweight form for quick inquiries

**Fields Collected:**
```typescript
{
  name: string;           // User's full name
  phone: string;          // Phone number
  vehicle: string;        // "YYYY Make Model" format (e.g., "2024 Toyota Camry")
  zip: string;            // ZIP code (5 digits)
  hasInsurance: string;   // yes|no|unsure
  smsConsent: boolean;    // Optional SMS consent
  website: string;        // Honeypot (spam detection)
  formStartTime?: number; // Timestamp for anti-spam
  clientId?: string;      // Client identifier (UUID)
  sessionId?: string;     // Session identifier (UUID)
}
```

**Submission Endpoint:** `/api/lead` (POST)

**Features:**
- Form start tracking via analytics
- Session/client ID generation for conversion tracking
- SMS consent checkbox with TCPA-compliant language
- Optional form (no SMS consent required for quick quote)

---

### 1.2 Full Booking Form (Multi-step)
**Location:** `/src/app/book/page.tsx` and `/src/components/book/*`  
**Entry Point:** `/book` route with optional URL parameters

**Step-by-Step Flow:**

#### Step 1: Service Selection
**Fields:**
- `serviceType: 'repair' | 'replacement'` (REQUIRED)
- `mobileService: boolean` (optional service add-on)

#### Step 2: Vehicle Information
**Fields:**
- `vehicleYear: number | string` (REQUIRED, 1990-2026)
- `vehicleMake: string` (REQUIRED)
- `vehicleModel: string` (REQUIRED)

#### Step 3: Contact Information
**Fields:**
- `firstName: string` (REQUIRED, 2-50 chars)
- `lastName: string` (REQUIRED, 2-50 chars)
- `phone: string` (REQUIRED, normalized to E.164 format)
- `email: string` (REQUIRED, validated email)

#### Step 4: Location & Schedule
**Fields:**
- `streetAddress: string` (optional but recommended)
- `city: string` (REQUIRED, 2-100 chars)
- `state: string` (REQUIRED, 2-char state code)
- `zipCode: string` (REQUIRED, 5 or 5+4 format)
- `preferredDate: string` (optional, YYYY-MM-DD format)
- `timeWindow: 'morning' | 'afternoon' | 'flexible'` (optional)

#### Step 5: Review & Consent
**Fields:**
- `damageDescription: string` (optional, max 500 chars)
- `smsConsent: boolean` (REQUIRED = true)
- `privacyAcknowledgment: boolean` (REQUIRED = true)
- `termsAccepted: boolean` (REQUIRED = true)

**Submission Endpoint:** `/api/booking/submit` (POST)

**Features:**
- Multi-step form with progress tracking
- Session storage for form persistence
- URL parameter prefilling (UTM tracking, vehicle, service, location)
- Form timing validation (min 2 seconds, max 30 minutes)
- Honeypot spam detection
- File upload support (up to 5 images, 10MB total)

---

### 1.3 Contact Page
**Location:** `/src/app/contact/page.tsx`

**Type:** Information page with contact methods  
**Features:**
- Phone number CTA: (720) 918-7465
- Email: service@pinkautoglass.com
- SMS: Text to (720) 918-7465
- No form submission (directs to booking or contact methods)

---

### Summary: Lead Entry Points
| Form | Type | Required Fields | Endpoint | Conversion |
|------|------|-----------------|----------|-----------|
| Quick Quote | Lightweight | 4 (name, phone, vehicle, zip) | `/api/lead` | SMS optional |
| Full Booking | Multi-step | 12+ (all contact, location, consent) | `/api/booking/submit` | SMS required |
| Contact Page | N/A | N/A | Direct call/email | N/A |

---

## 2. Lead Capture API Endpoints

### 2.1 Lead API Endpoint
**Path:** `/src/app/api/lead/route.ts`  
**Method:** POST  
**Authentication:** None (public)

**Request Format:**
```typescript
{
  // From QuoteForm
  name: string;
  phone: string;
  vehicle: string;
  zip: string;
  hasInsurance?: string;
  
  // From booking flow
  firstName?: string;
  lastName?: string;
  email?: string;
  vehicleYear?: number;
  vehicleMake?: string;
  vehicleModel?: string;
  serviceType?: 'repair' | 'replacement';
  mobileService?: boolean;
  
  // Session tracking
  clientId?: string;
  sessionId?: string;
  source?: string;
  timestamp?: string;
  
  // Touch data
  firstTouch?: object;
  lastTouch?: object;
  
  // Anti-spam
  website?: string;
  formStartTime?: number;
}
```

**Processing Flow:**
1. ✅ Honeypot validation (spam detection)
2. ✅ Timestamp validation (2s min, 30m max)
3. ✅ Input validation (Zod schema: `leadFormSchema`)
4. ✅ Data transformation (legacy format compatibility)
5. ✅ RPC call to database: `fn_insert_lead()`
6. ✅ Returns: `{ success: true, leadId: uuid }`

**Response:**
```typescript
{
  success: boolean;
  message: string;
  leadId: string;  // UUID of created lead
}
```

**Status Codes:**
- `200 OK` - Lead created successfully
- `400 Bad Request` - Validation error
- `500 Internal Server Error` - Database error

---

### 2.2 Booking Submit Endpoint
**Path:** `/src/app/api/booking/submit/route.ts`  
**Method:** POST  
**Authentication:** None (public)

**Request Format:**
```typescript
{
  // Contact information
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  
  // Vehicle information
  vehicleYear: number | string;
  vehicleMake: string;
  vehicleModel: string;
  
  // Service details
  serviceType: 'repair' | 'replacement';
  mobileService: boolean;
  
  // Location
  streetAddress?: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Schedule
  preferredDate?: string;
  timeWindow?: 'morning' | 'afternoon' | 'flexible';
  
  // Additional info
  damageDescription?: string;
  
  // Consent & tracking
  smsConsent: true;
  privacyAcknowledgment: true;
  termsAccepted: true;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referralCode?: string;
  clientId?: string;
  sessionId?: string;
  
  // Anti-spam
  website?: string;
  formStartTime?: number;
  
  // File uploads (optional)
  files?: Array<{
    data: string | ArrayBuffer;  // base64 or binary
    name: string;
    type: string;  // MIME type
    size: number;  // bytes
  }>;
}
```

**Processing Flow:**
1. ✅ Content-type handling (JSON or multipart/form-data)
2. ✅ File validation (type, size, count)
3. ✅ Honeypot & timestamp validation
4. ✅ Zod schema validation (`bookingFormSchema`)
5. ✅ RPC call: `fn_insert_lead()`
6. ✅ RPC call: `fn_get_reference_number()` 
7. ✅ File upload to Supabase Storage: `uploads/leads/{leadId}/{filename}`
8. ✅ Media registration: `fn_add_media()` RPC
9. ✅ Returns reference number

**Response:**
```typescript
{
  ok: boolean;
  id: string;              // Lead UUID
  referenceNumber: string; // Format: "XXXXXXXX" (first 8 chars of UUID)
  files: Array<{
    path: string;
    mimeType: string;
    size: number;
  }>;
}
```

**File Upload Constraints:**
- **Allowed MIME types:** image/jpeg, image/jpg, image/png, image/webp, image/heic, image/heif
- **Max file size:** 10MB per file
- **Max files:** 5 total
- **Storage bucket:** `uploads` (Supabase)
- **Path format:** `uploads/leads/{leadId}/{sanitized-filename}`

---

### 2.3 Stub Endpoints (Not Implemented)

#### Notification Endpoint
**Path:** `/src/app/api/booking/notify/route.ts`  
**Status:** ❌ STUB ONLY

```typescript
export async function POST() { 
  return NextResponse.json({ ok: true }); 
}
```

**Intended Purpose:** Send notifications after booking submission  
**Currently:** Returns success without doing anything

---

#### SMS Confirmation Endpoint
**Path:** `/src/app/api/sms/confirmation/route.ts`  
**Status:** ❌ STUB ONLY

```typescript
export async function POST() { 
  return NextResponse.json({ ok: true }); 
}
```

**Intended Purpose:** Send SMS confirmation to customers  
**Currently:** Returns success without doing anything

---

### 2.4 Supplementary API Endpoints

#### Vehicle Makes
**Path:** `/src/app/api/vehicles/makes/route.ts`  
**Method:** GET  
**Query Params:** `?year={year}`

**Purpose:** Get vehicle makes for a given year  
**Data Source:** Supabase `vehicle_makes` table (populated from migrations)

---

#### Vehicle Models
**Path:** `/src/app/api/vehicles/models/route.ts`  
**Method:** GET  
**Query Params:** `?year={year}&make={make}`

**Purpose:** Get vehicle models for a given year/make combination  
**Data Source:** Supabase `vehicle_models` table

---

## 3. Database Schema for Leads/Bookings

### 3.1 Main Tables

#### `leads` Table
**Purpose:** Store all lead information  
**Migration:** `/supabase/migrations/2025-08-20_align_leads_schema.sql`

```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Contact Information
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(100),
  phone_e164 VARCHAR(20),
  
  -- Location
  address VARCHAR(200),
  city VARCHAR(50),
  state CHAR(2),
  zip VARCHAR(10),
  
  -- Vehicle Information
  vehicle_year INT,
  vehicle_make VARCHAR(50),
  vehicle_model VARCHAR(50),
  
  -- Service Information
  service_type service_type ENUM ('repair', 'replacement'),
  mobile_service BOOLEAN DEFAULT false,
  
  -- Preferences
  preferred_date DATE,
  time_preference time_preference ENUM ('morning', 'afternoon', 'flexible'),
  
  -- Notes & Description
  notes TEXT,
  
  -- Consent & Compliance
  sms_consent BOOLEAN DEFAULT false,
  terms_accepted BOOLEAN DEFAULT false,
  privacy_acknowledgment BOOLEAN DEFAULT false,
  
  -- Tracking
  source VARCHAR(50),
  referral_code VARCHAR(32),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  gclid TEXT,
  fbclid TEXT,
  
  -- Session Information
  client_id UUID,
  session_id UUID,
  
  -- Touch Attribution
  first_touch JSONB,
  last_touch JSONB,
  acquisition_channel TEXT,
  
  -- Lead Status
  status lead_status ENUM ('new', 'contacted', 'scheduled', 'completed', 'cancelled'),
  
  -- Reference Number
  reference_number VARCHAR(20) UNIQUE,
  
  -- Security
  ip_address VARCHAR(45)
);
```

**Indexes:**
```sql
CREATE UNIQUE INDEX leads_phone_date_unique 
  ON leads (lower(phone_e164), preferred_date) 
  WHERE phone_e164 IS NOT NULL AND preferred_date IS NOT NULL;

CREATE INDEX leads_status_idx ON leads (status);
CREATE INDEX leads_created_at_desc_idx ON leads (created_at DESC);
```

**Row Level Security (RLS):** ✅ ENABLED

---

#### `media` Table
**Purpose:** Track uploaded files/photos  
**Migration:** `/supabase/migrations/2025-08-21_create_media_table.sql`

```sql
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  
  storage_path TEXT,  -- Path in Supabase Storage
  public_url TEXT,    -- Public URL if needed
  
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Indexes:**
```sql
CREATE INDEX idx_media_lead_id ON media(lead_id);
```

---

#### `lead_activities` Table
**Purpose:** Audit trail of all lead interactions  
**Migration:** `/supabase/migrations/2025-08-21_create_lead_activities_table.sql`

```sql
CREATE TABLE lead_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  
  activity_type TEXT NOT NULL,  -- 'email_sent', 'sms_sent', 'call_made', etc.
  description TEXT,
  metadata JSONB,  -- Additional context
  
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT  -- Email or system identifier
);
```

**Indexes:**
```sql
CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_created_at ON lead_activities(created_at DESC);
```

---

### 3.2 RPC Functions (Stored Procedures)

#### `fn_insert_lead()`
**Purpose:** Insert lead with validated data  
**Migration:** `/supabase/migrations/2025-08-21_canonical.sql`

```sql
CREATE OR REPLACE FUNCTION fn_insert_lead(
  p_id uuid,
  p_payload jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid := coalesce(p_id, uuid_generate_v4());
BEGIN
  INSERT INTO leads(
    id, client_generated_id, first_name, last_name, email, 
    phone_e164, address, city, state, zip,
    vehicle_year, vehicle_make, vehicle_model, service_type,
    terms_accepted, privacy_acknowledgment,
    client_id, session_id, first_touch, last_touch, created_by
  ) VALUES (
    v_id,
    (p_payload->>'clientGeneratedId')::uuid,
    p_payload->>'firstName',
    p_payload->>'lastName',
    p_payload->>'email',
    p_payload->>'phoneE164',
    p_payload->>'address',
    p_payload->>'city',
    p_payload->>'state',
    p_payload->>'zip',
    nullif(p_payload->>'vehicleYear','')::int,
    p_payload->>'vehicleMake',
    p_payload->>'vehicleModel',
    nullif(p_payload->>'serviceType','')::public.service_type,
    coalesce((p_payload->>'termsAccepted')::boolean,false),
    coalesce((p_payload->>'privacyAcknowledgment')::boolean,false),
    p_payload->>'clientId',
    p_payload->>'sessionId',
    coalesce(p_payload->'firstTouch','{}'::jsonb),
    coalesce(p_payload->'lastTouch','{}'::jsonb),
    null
  );
  RETURN v_id;
END $$;
```

**Security:** DEFINER (runs with elevated privileges), execute granted to `anon` role

---

#### `fn_get_reference_number()`
**Purpose:** Retrieve reference number for a lead  
**Migration:** `/supabase/migrations/20250925183010_add_fn_get_reference_number.sql`

```sql
CREATE OR REPLACE FUNCTION fn_get_reference_number(p_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT reference_number
  FROM public.leads
  WHERE id = p_id
$$;
```

**Security:** DEFINER, execute granted to `anon` role

---

#### `fn_add_media()`
**Purpose:** Register uploaded media files  
**Migration:** `/supabase/migrations/2025-08-21_canonical.sql`

```sql
CREATE OR REPLACE FUNCTION fn_add_media(
  p_lead_id uuid,
  p_path text,
  p_mime_type text,
  p_size_bytes bigint
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid := uuid_generate_v4();
BEGIN
  INSERT INTO public.media(id, lead_id, path, mime_type, size_bytes) 
  VALUES (v_id, p_lead_id, p_path, p_mime_type, p_size_bytes);
  RETURN v_id;
END $$;
```

---

### 3.3 Data Retention Policies

**Policy:** `/security/baseline/data-retention.md`

| Data Category | Retention Period | Rationale |
|---|---|---|
| PII (name, email, phone, address) | 18 months | Service delivery & support |
| Vehicle information | 18 months | Service history |
| Photos/Media (unscheduled) | 90 days | GDPR compliance |
| Photos/Media (scheduled service) | 18 months | Service record |
| Activity logs | 12 months | Audit trail |
| Session/tracking data | 30 days | Analytics only |

---

## 4. Notification & Communication Infrastructure

### 4.1 Current Status: **❌ NOT IMPLEMENTED**

The notification infrastructure is **completely stubbed out**. While the database schema supports activity tracking and the environment variables are defined for SMS/email services, no actual integration exists.

---

### 4.2 Configured Providers (Environment Variables)

#### Twilio (SMS)
**File:** `.env.example` (lines 77-80)

```
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

**Status:** ❌ Configuration exists, but NOT integrated  
**Purpose:** Send SMS confirmations and reminders  
**Documentation:** `/spec/booking/sms-templates.md` (comprehensive templates defined)

---

#### SendGrid (Email)
**File:** `.env.example` (lines 82-85)

```
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@pinkautoglass.com
SENDGRID_FROM_NAME=Pink Auto Glass
```

**Status:** ❌ Configuration exists, but NOT integrated  
**Purpose:** Send transactional and promotional emails  

---

#### Resend (Email - Alternative)
**File:** `.env.example` (lines 87-90)

```
RESEND_API_KEY=your-resend-api-key
ADMIN_EMAIL=admin@pinkautoglass.com
FROM_EMAIL=noreply@pinkautoglass.com
```

**Status:** ❌ Configuration exists, but NOT integrated  
**Purpose:** Alternative to SendGrid for email delivery  

---

### 4.3 Stub Endpoints (Do Nothing Currently)

#### POST `/api/booking/notify`
**File:** `/src/app/api/booking/notify/route.ts`

**Current Implementation:**
```typescript
import { NextResponse } from "next/server";
export async function POST() { 
  return NextResponse.json({ ok: true }); 
}
```

**Intended Purpose:** Trigger notifications after lead submission  
**Missing:**
- Email notification to customer
- Email notification to admin/staff
- SMS confirmation (if SMS consent given)
- Lead activity log entry

---

#### POST `/api/sms/confirmation`
**File:** `/src/app/api/sms/confirmation/route.ts`

**Current Implementation:**
```typescript
import { NextResponse } from "next/server";
export async function POST() { 
  return NextResponse.json({ ok: true }); 
}
```

**Intended Purpose:** Send SMS confirmation  
**Missing:**
- Twilio integration
- Phone number validation
- SMS template rendering
- Delivery tracking

---

### 4.4 Planned SMS Templates
**File:** `/spec/booking/sms-templates.md` (436 lines)

Comprehensive documentation exists for all SMS communications:

| Template | Trigger | Type | Status |
|----------|---------|------|--------|
| Initial Quote Confirmation | Form submission | Transactional | ❌ Not implemented |
| Appointment Confirmed | After phone call | Transactional | ❌ Not implemented |
| 24-Hour Reminder | 24h before | Transactional | ❌ Not implemented |
| Arrival Notification | 30min before | Transactional | ❌ Not implemented |
| Work In Progress | During service | Transactional | ❌ Not implemented |
| Work Completed | Service done | Transactional | ❌ Not implemented |
| Service Feedback | 2h after completion | Promotional | ❌ Not implemented |
| Future Service Reminder | 6 months later | Promotional | ❌ Not implemented |

**Features Defined:**
- Character counts (all fit in single SMS)
- TCPA compliance requirements
- Opt-out handling (STOP keyword)
- Timezone-aware send windows
- Personalization tokens
- A/B testing framework

---

## 5. Notification Dependencies in package.json

**Current Dependencies:** ❌ **NO NOTIFICATION LIBRARIES INSTALLED**

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.55.0",
    "next": "^14.2.32",
    "pg": "^8.16.3",
    "zod": "^4.1.12",
    "uuid": "^13.0.0"
  }
}
```

**Missing Libraries:**
- ❌ `twilio` - For SMS sending
- ❌ `@sendgrid/mail` - For email via SendGrid
- ❌ `resend` - For email via Resend
- ❌ `nodemailer` - For email via SMTP
- ❌ `bull` or `bullmq` - For job queuing (recommended for notifications)

---

## 6. Third-Party Integrations

### 6.1 Implemented Integrations

#### Supabase (Database & Storage)
**Purpose:** PostgreSQL database, file storage, authentication  
**Status:** ✅ FULLY INTEGRATED

**Usage:**
- Lead data storage (table: `leads`)
- Media file uploads (table: `media`)
- Activity tracking (table: `lead_activities`)
- File storage (bucket: `uploads`)

---

### 6.2 Not Implemented

| Service | Purpose | Status |
|---------|---------|--------|
| Twilio SMS | SMS notifications | ❌ Config only |
| SendGrid | Email delivery | ❌ Config only |
| Resend | Email delivery (alt) | ❌ Config only |
| Slack | Admin notifications | ❌ Not configured |
| CRM Webhook | Lead distribution | ❌ Not configured |

---

## 7. Lead Distribution Infrastructure

### 7.1 What Exists

#### Database Support
- ✅ `lead_activities` table for tracking
- ✅ Lead status enum: `'new', 'contacted', 'scheduled', 'completed', 'cancelled'`
- ✅ `created_by` field on activities for staff attribution

#### Webhook Configuration
- ✅ Environment variables defined: `WEBHOOK_CRM_URL`, `WEBHOOK_CRM_TOKEN`

---

### 7.2 What's Missing

❌ **No actual lead distribution mechanism**

**Missing Components:**
1. Assignment Logic - No rule engine for assigning leads to staff
2. Notification Trigger - `/api/booking/notify` is stubbed
3. Activity Logging - No code calling `lead_activities` table
4. CRM Integration - Webhook not implemented
5. Staff Notification - No email/SMS to team
6. Lead Queue - No job queue system
7. Distribution Rules - No load balancing

---

## 8. Implementation Checklist

**Before going live with notifications:**

- [ ] Choose email provider (SendGrid or Resend)
- [ ] Choose SMS provider (Twilio)
- [ ] Install npm packages
- [ ] Implement email templates (transactional)
- [ ] Implement SMS templates (from spec)
- [ ] Set up job queue (Bull/BullMQ) for reliability
- [ ] Implement retry logic
- [ ] Add activity logging
- [ ] Set up admin notification email address
- [ ] Test email/SMS delivery
- [ ] Implement unsubscribe handling
- [ ] Add GDPR compliance logs
- [ ] Monitor delivery rates
- [ ] Implement webhook authentication
- [ ] Test CRM/Slack integration
- [ ] Set up error alerting

---

## Conclusion

The Pink Auto Glass lead generation system successfully **captures and stores leads** but lacks the **notification and distribution components**. The infrastructure is architecturally sound with proper database design and validation, but the communication layer is entirely stubbed out.

**Recommendation:** Implement notification endpoints and integration with at least one email provider (SendGrid/Resend) and Twilio for SMS before scaling.

---

**Report Prepared By:** Claude Code Analysis System  
**Codebase:** /Users/dougsimpson/Projects/pinkautoglasswebsite  
**Files Analyzed:** 80+ source files, 13 migrations, 436 documentation lines
