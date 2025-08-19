# Pink Auto Glass Booking Flow Specification

## Complete Step-by-Step Flow

### Flow Overview
1. **Service Selection** → Choose repair, replacement, or mobile service
2. **Vehicle Information** → Year, make, model, photos (optional)
3. **Contact Information** → Name, phone, email, best time to call
4. **Location & Schedule** → Address and preferred appointment time
5. **Review & Submit** → SMS consent, damage description, final submission
6. **Confirmation** → Success message with reference number and next steps

---

## Step 1: Service Selection

### Fields & Components
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Service Type | Radio Group | Yes | Must select one option |

### Service Options
```json
{
  "services": [
    {
      "id": "windshield_repair",
      "name": "Windshield Repair",
      "description": "Fix chips & cracks",
      "price": "Starting at $89",
      "icon": "🔧"
    },
    {
      "id": "windshield_replacement", 
      "name": "Windshield Replacement",
      "description": "Complete replacement",
      "price": "From $299",
      "icon": "🚗"
    },
    {
      "id": "mobile_service",
      "name": "Mobile Service",
      "description": "We come to you",
      "price": "Add $25",
      "icon": "🏃",
      "addon": true
    }
  ]
}
```

### Validation Rules
- **Service Selection**: Required
  - **Error Copy**: "Please select a service to continue"
  - **When**: On continue button click with no selection

### Progress Indicator
- Current step: 1 of 5
- Visual: ●○○○○

### Continue Button State
- **Disabled**: No service selected
- **Enabled**: Service selected
- **Text**: "Continue"

---

## Step 2: Vehicle Information

### Fields & Components
| Field | Type | Required | Validation | Error Message |
|-------|------|----------|------------|---------------|
| Year | Select Dropdown | Yes | Must be 1990-2024 | "Please select your vehicle year" |
| Make | Select Dropdown | Yes | Must be valid make for year | "Please select your vehicle make" |
| Model | Select Dropdown | Yes | Must be valid model for make | "Please select your vehicle model" |
| Photos | File Upload | No | Max 5 files, <2MB each, JPG/PNG | "Please select valid image files" |

### Dropdown Data
```javascript
// Year options (current year to 1990)
const years = Array.from({length: 35}, (_, i) => 2024 - i);

// Popular makes (shown first, then alphabetical)
const popularMakes = ["Honda", "Toyota", "Ford", "Chevrolet", "Nissan", "BMW"];

// Models populated based on year/make selection via API call
```

### Photo Upload Specifications
- **File Types**: JPG, JPEG, PNG, HEIC
- **Max Size**: 2MB per file
- **Max Files**: 5 total
- **Compression**: Auto-compress to <1MB for upload
- **Preview**: 60x60px thumbnails with remove option

### Supabase Storage Integration
**Signed URL Configuration:**
```javascript
// Generate signed upload URL with 24-hour expiry
const generateSignedUploadUrl = async (fileName, fileType) => {
  const { data, error } = await supabase.storage
    .from('lead-media')
    .createSignedUploadUrl(`uploads/${leadId}/${fileName}`, {
      expiresIn: 86400, // 24 hours
      upsert: false
    });
    
  if (error) throw error;
  return data.signedUrl;
};

// RLS Policy for media access
const mediaAccessPolicy = `
  CREATE POLICY "Users can upload media for their leads" ON lead_media
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    lead_id IN (
      SELECT id FROM leads WHERE customer_id = auth.uid()
    )
  );
  
  CREATE POLICY "Staff can view all media" ON lead_media
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'staff' OR
    (auth.uid() IS NOT NULL AND lead_id IN (
      SELECT id FROM leads WHERE customer_id = auth.uid()
    ))
  );
`;
```

**ACL and Security Configuration:**
- **Upload URLs**: 24-hour expiry signed URLs
- **Access Control**: Row Level Security (RLS) enabled
- **Encryption**: Server-side encryption at rest
- **Data Retention**: 90 days for unscheduled leads, 18 months for scheduled services
- **Automatic Cleanup**: Daily purge job removes expired media files

### Validation Rules
- **Year**: Required, must be numeric, range 1990-2024
  - **Error Copy**: "Please select your vehicle year"
  - **When**: On field blur or form submit
  
- **Make**: Required, must be valid option from API
  - **Error Copy**: "Please select your vehicle make"
  - **When**: On field blur or form submit
  
- **Model**: Required, must be valid option from API  
  - **Error Copy**: "Please select your vehicle model"
  - **When**: On field blur or form submit

- **Photos**: Optional, but if uploaded must meet specs
  - **Error Copy**: "Please select valid image files (JPG/PNG, max 2MB each)"
  - **When**: On file selection

### Progress Indicator
- Current step: 2 of 5
- Visual: ●●○○○

### API Integrations
- **Vehicle Data**: `/api/vehicles/makes?year={year}` and `/api/vehicles/models?year={year}&make={make}`
- **Image Upload**: `/api/uploads/images` (returns CDN URLs)

---

## Step 3: Contact Information

### Fields & Components
| Field | Type | Required | Validation | Error Message |
|-------|------|----------|------------|---------------|
| First Name | Text Input | Yes | 2-50 chars, letters only | "Please enter your first name" |
| Last Name | Text Input | Yes | 2-50 chars, letters only | "Please enter your last name" |
| Phone | Tel Input | Yes | Valid US phone format | "Please enter a valid phone number" |
| Email | Email Input | Yes | Valid email format | "Please enter a valid email address" |
| Best Time | Radio Group | No | One selection | None |

### PII Minimization Compliance
**Required Fields (Core PII):**
- `first_name`: Required for service delivery and communication
- `last_name`: Required for service delivery and communication  
- `phone`: Required for appointment coordination and service delivery
- `email`: Required for confirmations and service updates
- `address`: Required for service location (collected in Step 4)

**Data Collection Justification:**
- All required fields have legitimate business interest for service delivery
- Optional fields (Best Time) enhance service quality but are not mandatory
- No prohibited fields (SSN, license numbers, etc.) are collected

### Input Specifications
```javascript
// Phone formatting
const formatPhone = (input) => {
  const cleaned = input.replace(/\D/g, '');
  if (cleaned.length >= 10) {
    return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6,10)}`;
  }
  return input;
};

// Best time options
const timeOptions = [
  { value: "morning", label: "Morning (8-12 PM)" },
  { value: "afternoon", label: "Afternoon (12-5 PM)" },  
  { value: "evening", label: "Evening (5-8 PM)" },
  { value: "anytime", label: "Anytime" }
];
```

### Validation Rules
- **First Name**: Required, 2-50 characters, letters and spaces only
  - **Error Copy**: "Please enter your first name"
  - **When**: On field blur and form submit

- **Last Name**: Required, 2-50 characters, letters and spaces only  
  - **Error Copy**: "Please enter your last name"
  - **When**: On field blur and form submit

- **Phone**: Required, must match US phone pattern
  - **Pattern**: `/^\(\d{3}\) \d{3}-\d{4}$/`
  - **Error Copy**: "Please enter a valid phone number"
  - **When**: On field blur and form submit

- **Email**: Required, must be valid email format
  - **Pattern**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  - **Error Copy**: "Please enter a valid email address" 
  - **When**: On field blur and form submit

### Progress Indicator  
- Current step: 3 of 5
- Visual: ●●●○○

---

## Step 4: Location & Schedule

### Fields & Components
| Field | Type | Required | Validation | Error Message |
|-------|------|----------|------------|---------------|
| Use Location | Button | No | Geolocation permission | "Location access denied" |
| Street Address | Text Input | Yes (if no geo) | Valid address format | "Please enter a street address" |
| City | Text Input | Yes (if no geo) | Valid city name | "Please enter a city" |
| State | Select | Yes (if no geo) | Valid US state | "Please select a state" |
| ZIP Code | Text Input | Yes (if no geo) | Valid US ZIP | "Please enter a valid ZIP code" |
| Preferred Date | Date Selector | Yes | Today or future date | "Please select a date" |
| Time Window | Radio Group | No | Available time slot | None |

### Location Handling
```javascript
// Geolocation success
const handleLocationSuccess = (position) => {
  const { latitude, longitude } = position.coords;
  // Reverse geocode to get address
  // Validate service area coverage
  // Pre-fill address fields
};

// Address validation via Google Places API
const validateAddress = async (address) => {
  const response = await fetch('/api/location/validate', {
    method: 'POST',
    body: JSON.stringify(address)
  });
  return response.json();
};
```

### Date & Time Options
```javascript
// Date options
const dateOptions = [
  { value: "today", label: "Today", available: true },
  { value: "tomorrow", label: "Tomorrow", available: true },
  { value: "later", label: "Later", available: true },
  { value: "custom", label: "Select Date", available: true }
];

// Time windows (based on availability)
const timeWindows = [
  { value: "8-10", label: "8-10 AM", available: true },
  { value: "10-12", label: "10-12 PM", available: true },
  { value: "12-2", label: "12-2 PM", available: false },
  { value: "2-4", label: "2-4 PM", available: true },
  { value: "4-6", label: "4-6 PM", available: true },
  { value: "flexible", label: "Flexible", available: true }
];
```

### Validation Rules
- **Address Fields**: Required if geolocation not used
  - **Street Address**: "Please enter a street address"
  - **City**: "Please enter a city"  
  - **State**: "Please select a state"
  - **ZIP**: "Please enter a valid ZIP code"
  - **When**: On field blur and form submit

- **Service Area**: Address must be within coverage
  - **Error Copy**: "We don't service this area yet, but we're expanding soon!"
  - **When**: On address validation

- **Preferred Date**: Required, must be today or future
  - **Error Copy**: "Please select a date"
  - **When**: On form submit

### Progress Indicator
- Current step: 4 of 5  
- Visual: ●●●●○

### API Integrations
- **Address Validation**: `/api/location/validate`
- **Service Area Check**: `/api/location/service-area`
- **Availability**: `/api/scheduling/availability?date={date}&location={location}`

---

## Step 5: Review & Submit

### Fields & Components
| Field | Type | Required | Validation | Error Message |
|-------|------|----------|------------|---------------|
| Review Data | Display | N/A | N/A | N/A |
| Damage Description | Textarea | No | Max 500 characters | "Description too long (max 500 characters)" |
| SMS Consent | Checkbox | Yes | Must be checked | "SMS consent required to continue" |

### Review Section Display
```json
{
  "reviewData": {
    "service": "Windshield Repair + Mobile Service",
    "vehicle": "2019 Honda Civic",
    "customer": "John Smith, (555) 123-4567",
    "location": "123 Main St, Anytown, ST 12345", 
    "appointment": "Tomorrow, 10-12 PM",
    "photos": ["photo1_thumb.jpg", "photo2_thumb.jpg"]
  }
}
```

### SMS Consent Requirements
- **Legal Text**: "I consent to receive appointment updates and service notifications via SMS. Standard message rates may apply. Text STOP to opt-out anytime."
- **Default State**: Unchecked
- **Required**: Yes, cannot submit without consent
- **TCPA Compliant**: Express written consent obtained

### Privacy and Data Retention Disclosure
**Additional privacy notice displayed near consent checkbox:**
```html
<div class="privacy-disclosure">
  <p class="privacy-text">
    <strong>Privacy Notice:</strong> We will retain your contact information and service details for 18 months to provide ongoing support. 
    Photos you upload will be kept for 90 days, or 18 months if you schedule service with us. 
    You can request data deletion at any time by contacting us.
  </p>
  <p class="data-security">
    <strong>Data Security:</strong> Your information is encrypted and stored securely. We never sell or share your personal data.
  </p>
  <a href="/privacy-policy" class="privacy-link">View our Privacy Policy</a>
</div>
```

**Data Collection Summary:**
- **Core PII Fields**: first_name, last_name, phone, email, address
- **Retention Period**: 18 months for all customer data
- **Media Retention**: 90 days default, 18 months if service scheduled
- **Security**: Encryption at rest and in transit, RLS access control

### Validation Rules
- **Damage Description**: Optional, max 500 characters
  - **Error Copy**: "Description too long (max 500 characters)"
  - **When**: On character count exceeded

- **SMS Consent**: Required checkbox
  - **Error Copy**: "SMS consent required to continue"  
  - **When**: On form submit without consent

### Progress Indicator
- Current step: 5 of 5
- Visual: ●●●●●

### Final Submit Button
- **Text**: "Get Free Quote"
- **Loading State**: "Getting your quote..."
- **Disabled State**: Gray background, no interaction

---

## Step 6: Success Confirmation

### Confirmation Elements
- **Success Icon**: Large green checkmark
- **Main Message**: "Request Sent!"
- **Sub Message**: "We'll call you within 15 minutes to confirm your appointment."
- **Reference Number**: Format `QT-YYYY-NNNN` (e.g., QT-2024-1234)
- **Email Confirmation**: "We've sent details to: [email]"

### Privacy and Data Retention Notice
**Displayed on confirmation page:**
```html
<div class="privacy-notice">
  <h4>Your Privacy Matters</h4>
  <p><strong>Data Retention:</strong> We retain your information for 18 months to provide service and support. Photos are kept for 90 days unless you schedule service with us (then 18 months).</p>
  <p><strong>Data Protection:</strong> Your information is encrypted and stored securely using industry-standard practices.</p>
  <p><strong>Your Rights:</strong> You can request data deletion, correction, or export at any time by contacting us.</p>
  <a href="/privacy-policy" class="privacy-link">View Complete Privacy Policy</a>
</div>
```

### Next Steps
```json
{
  "nextSteps": [
    {
      "action": "trackRequest", 
      "label": "Track Request",
      "type": "primary",
      "url": "/track?ref={referenceNumber}"
    },
    {
      "action": "backHome",
      "label": "Back to Home", 
      "type": "secondary",
      "url": "/"
    }
  ],
  "contactInfo": {
    "phone": "(555) 123-4567",
    "message": "Questions? Call us:"
  }
}
```

---

## Error Handling & Recovery

### Network Errors
```javascript
const errorMessages = {
  network: "Something went wrong. Please try again.",
  timeout: "Request timed out. Please check your connection and retry.", 
  server: "Our servers are busy. Please try again in a moment.",
  validation: "Please correct the errors above and try again."
};
```

### Recovery Flows
1. **Form Validation Errors**
   - Highlight invalid fields with red border
   - Show error message below field
   - Scroll to first error
   - Maintain form data

2. **Network/Server Errors**
   - Show error message at top of form
   - Reset submit button to normal state  
   - Preserve all form data
   - Allow retry

3. **Service Area Errors**
   - Show friendly message about expansion
   - Provide alternative contact methods
   - Don't allow form progression
   - Offer to be notified when available

### Data Persistence
- Save form data to `sessionStorage` after each step
- Restore data on page refresh or back navigation
- Clear data after successful submission
- Expire data after 24 hours

---

## Progress Indicators

### Visual Progress Steps
```css
.progress-indicator {
  /* Step 1: ●○○○○ */
  /* Step 2: ●●○○○ */
  /* Step 3: ●●●○○ */
  /* Step 4: ●●●●○ */
  /* Step 5: ●●●●● */
}
```

### Completion Tracking
- Track step completion rates
- Monitor abandonment points
- Measure time per step
- Identify optimization opportunities

---

## Success States & Confirmations

### Immediate Feedback
- Form submission success
- Email confirmation sent
- SMS opt-in confirmed
- Reference number generated

### Follow-up Communications
1. **Immediate (< 15 min)**: Phone call for appointment confirmation
2. **Within 1 hour**: Email with appointment details
3. **24 hours before**: SMS reminder (if consented)
4. **Day of service**: SMS with technician details

### Quote Generation Process
1. **Immediate**: Basic quote based on service type and vehicle
2. **After inspection**: Detailed quote with actual damage assessment  
3. **Final**: Insurance-adjusted quote with final pricing

---

## Deep-link & Prefill Strategy

### URL Parameter Handling
The booking flow intelligently handles URL parameters to prefill forms and track entry points:

#### Supported Parameters
```typescript
interface BookingURLParams {
  // UTM tracking
  utm_source?: string;      // e.g., "homepage", "google", "facebook"
  utm_medium?: string;      // e.g., "hero", "quote_card", "service_card"
  utm_campaign?: string;    // e.g., "hero_primary", "quick_quote"
  
  // Vehicle prefill
  year?: string;           // e.g., "2022"
  make?: string;           // e.g., "Honda"
  model?: string;          // e.g., "Civic"
  trim?: string;           // e.g., "EX-L"
  
  // Service prefill
  service?: string;        // e.g., "windshield-replacement"
  
  // Location prefill
  location?: string;       // e.g., "denver-co", "80202"
  
  // Referral tracking
  ref?: string;            // Referral partner code
}
```

#### URL Examples
```
# From hero primary CTA
/book?utm_source=homepage&utm_medium=hero&utm_campaign=hero_primary

# From quote card with vehicle
/book?utm_source=homepage&utm_medium=quote_card&utm_campaign=quick_quote&year=2022&make=Honda&model=Civic&trim=EX-L

# From service card
/book?utm_source=homepage&utm_medium=service_card&utm_campaign=service_selection&service=windshield-replacement

# From location page
/book?utm_source=location_page&utm_medium=cta&location=denver-co
```

### Prefill Logic

#### Vehicle Information (Step 2)
```javascript
// On component mount
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  
  if (params.get('year')) {
    setVehicleYear(params.get('year'));
    // Trigger make dropdown population
    fetchMakesForYear(params.get('year'));
  }
  
  if (params.get('make')) {
    setVehicleMake(params.get('make'));
    // Trigger model dropdown population
    fetchModelsForMakeYear(params.get('year'), params.get('make'));
  }
  
  if (params.get('model')) {
    setVehicleModel(params.get('model'));
  }
  
  if (params.get('trim')) {
    setVehicleTrim(params.get('trim'));
  }
}, []);
```

#### Service Selection (Step 1)
```javascript
// Service parameter mapping
const serviceMap = {
  'windshield-replacement': 'windshield_replacement',
  'windshield-repair': 'windshield_repair',
  'mobile-service': 'mobile_service',
  'rock-chip': 'windshield_repair',
  'adas-calibration': 'windshield_replacement'
};

if (params.get('service')) {
  const serviceId = serviceMap[params.get('service')];
  if (serviceId) {
    setSelectedService(serviceId);
    // Auto-advance to next step if service is prefilled
    if (!params.get('year')) {
      goToStep(2);
    }
  }
}
```

#### Location Prefill (Step 4)
```javascript
if (params.get('location')) {
  const location = params.get('location');
  
  if (location.match(/^\d{5}$/)) {
    // ZIP code
    setZipCode(location);
    fetchCityStateFromZip(location);
  } else {
    // City slug (e.g., "denver-co")
    const [city, state] = location.split('-');
    setCity(capitalize(city));
    setState(state.toUpperCase());
  }
}
```

### Data Persistence

#### Session Storage
Prefilled data persists across steps using sessionStorage:

```javascript
// Save prefilled data
const savePrefillData = (data) => {
  sessionStorage.setItem('booking_prefill', JSON.stringify({
    ...data,
    timestamp: Date.now(),
    source: params.get('utm_source') || 'direct'
  }));
};

// Restore on page refresh
const restorePrefillData = () => {
  const saved = sessionStorage.getItem('booking_prefill');
  if (saved) {
    const data = JSON.parse(saved);
    // Only restore if less than 30 minutes old
    if (Date.now() - data.timestamp < 30 * 60 * 1000) {
      return data;
    }
  }
  return null;
};
```

#### Summary Chip Display
When data is prefilled, show summary chips with edit capability:

```html
<!-- Vehicle summary chip -->
<div class="prefilled-summary">
  <div class="chip-row">
    <span class="chip">
      2022 Honda Civic EX-L
      <button aria-label="Edit vehicle" onclick="editVehicle()">✏️</button>
    </span>
    <span class="chip">
      Windshield Replacement
      <button aria-label="Edit service" onclick="editService()">✏️</button>
    </span>
  </div>
</div>
```

### Analytics Integration

#### Entry Point Tracking
```javascript
// Track entry point and prefill success
gtag('event', 'booking_start', {
  'entry_point': params.get('utm_medium') || 'direct',
  'utm_source': params.get('utm_source') || 'direct',
  'utm_campaign': params.get('utm_campaign') || 'none',
  'prefilled_vehicle': !!(params.get('year') && params.get('make')),
  'prefilled_service': !!params.get('service'),
  'prefilled_location': !!params.get('location'),
  'referral_code': params.get('ref') || 'none'
});
```

#### Conversion Attribution
```javascript
// On successful submission
gtag('event', 'booking_complete', {
  'entry_point': originalUtmMedium,
  'utm_source': originalUtmSource,
  'utm_campaign': originalUtmCampaign,
  'time_to_complete': Date.now() - startTime,
  'prefilled_fields_used': prefillFieldsUsedCount,
  'steps_completed': 5
});
```

### Error Handling

#### Invalid Parameters
```javascript
// Validate prefilled data
const validatePrefill = (params) => {
  const errors = [];
  
  if (params.get('year')) {
    const year = parseInt(params.get('year'));
    if (year < 1990 || year > new Date().getFullYear() + 1) {
      errors.push('Invalid vehicle year');
      // Don't prefill invalid data
      params.delete('year');
    }
  }
  
  if (params.get('service')) {
    if (!serviceMap[params.get('service')]) {
      errors.push('Unknown service type');
      params.delete('service');
    }
  }
  
  // Log validation errors for monitoring
  if (errors.length > 0) {
    console.warn('Prefill validation errors:', errors);
    gtag('event', 'prefill_validation_error', {
      'errors': errors.join(', ')
    });
  }
};
```

### Mobile Considerations

#### Shortened URLs for SMS
Generate short links for mobile sharing:
```
# Full URL
https://pinkautoglass.com/book?utm_source=sms&utm_medium=share&year=2022&make=Honda&model=Civic

# Shortened for SMS (using bit.ly or similar)
https://pink.ag/q/abc123
```

#### App Deep Links (Future)
Reserve URL scheme for future mobile app:
```
pinkautoglass://book?year=2022&make=Honda&model=Civic
```

---

## Field Validation Summary

### Required Fields by Step (PII Minimization Compliant)
```json
{
  "step1": ["service_type"],
  "step2": ["year", "make", "model"], 
  "step3": ["first_name", "last_name", "phone", "email"],
  "step4": ["address_fields", "preferred_date"],
  "step5": ["sms_consent", "privacy_acknowledgment"]
}
```

### Data Retention and Security Compliance
**Field-Level Retention Policies:**
```json
{
  "pii_fields": {
    "first_name": { "retention": "18_months", "required": true, "basis": "service_delivery" },
    "last_name": { "retention": "18_months", "required": true, "basis": "service_delivery" },
    "phone": { "retention": "18_months", "required": true, "basis": "appointment_coordination" },
    "email": { "retention": "18_months", "required": true, "basis": "service_communications" },
    "address": { "retention": "18_months", "required": true, "basis": "service_location" }
  },
  "media_files": {
    "photos": { 
      "retention": "90_days_default", 
      "retention_scheduled": "18_months",
      "required": false,
      "storage": "supabase_encrypted",
      "access": "rls_controlled"
    }
  },
  "service_data": {
    "vehicle_info": { "retention": "18_months", "required": true, "basis": "service_delivery" },
    "service_type": { "retention": "18_months", "required": true, "basis": "service_delivery" },
    "appointment_details": { "retention": "18_months", "required": true, "basis": "service_scheduling" }
  }
}
```

### Validation Timing
- **Real-time**: Phone formatting, character limits
- **On Blur**: Individual field validation
- **On Submit**: Complete form validation before progression

### Error Message Standards
- Clear, actionable language
- No technical jargon
- Consistent tone with brand voice
- Specific to the validation failure
- Include recovery instructions when helpful