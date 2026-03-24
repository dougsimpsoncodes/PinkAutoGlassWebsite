/**
 * Production-Grade Input Validation with Zod
 * Strict schemas for all API inputs with normalization and sanitization
 */

import { z } from 'zod';

// Common validators shortened for space - full implementation with:
// - Name, phone, email, city, state, zip validators
// - Vehicle year/make/model validators
// - Service type enum
// - Notes/message validator with HTML stripping

// Blocked temporary/disposable email domains
const BLOCKED_EMAIL_DOMAINS = [
  'temp.pin',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'sharklasers.com',
  'grr.la',
  'guerrillamail.de',
  'mailinator.com',
  '10minutemail.com',
  '10minutemail.net',
  'tempmail.com',
  'throwaway.email',
  'yopmail.com',
  'maildrop.cc',
  'getnada.com',
  'trashmail.com',
  'fakeinbox.com',
  'tempr.email',
  'mohmal.com',
  'emailondeck.com',
  'dispostable.com',
  'mintemail.com',
  'mytemp.email',
  'temp-mail.org',
  'temp-mail.io',
] as const;

const nameSchema = z.string().trim().min(2).max(50).regex(/^[a-zA-Z\s\-']+$/);
const phoneSchema = z.string().trim().regex(/^(\+?1)?[\s\-.]?\(?([0-9]{3})\)?[\s\-.]?([0-9]{3})[\s\-.]?([0-9]{4})$/).transform((phone) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 ? `+1${digits}` : digits.length === 11 && digits.startsWith('1') ? `+${digits}` : `+${digits}`;
});

// Email validator with temp/disposable email blocking
const emailSchema = z.string().trim().toLowerCase().email().max(254).refine(
  (email) => {
    const domain = email.split('@')[1];
    return !BLOCKED_EMAIL_DOMAINS.includes(domain as any);
  },
  {
    message: 'Temporary or disposable email addresses are not allowed. Please use a permanent email address.',
  }
);
const citySchema = z.string().trim().min(2).max(100).regex(/^[a-zA-Z\s\-.']+$/);
const stateSchema = z.string().trim().toUpperCase().length(2).regex(/^[A-Z]{2}$/);
const zipCodeSchema = z.string().trim().regex(/^\d{5}(-\d{4})?$/);
const addressSchema = z.string().trim().min(5).max(200).regex(/^[a-zA-Z0-9\s\-.,#]+$/);
const notesSchema = z.string().trim().max(500).optional().transform((notes) => notes ? notes.replace(/<[^>]*>/g, '') : undefined);

// Attribution field validators with length caps and pattern allowlists for security

// Session ID: must match session_{timestamp}_{random} format from tracking.ts
// Format: session_ + 10-16 digit timestamp + _ + 6+ char random alphanumeric
// Non-fatal: invalid format → treated as undefined (rely on cookie/lookup)
// FIX: Handle null (typeof null === 'object' in JS, not 'string')
const sessionIdSchema = z.preprocess(
  (val) => (val === null || val === undefined || (typeof val === 'string' && val.trim() === '') ? undefined : val),
  z.string().trim().max(100)
    .regex(/^session_[0-9]{10,16}_[a-z0-9]{6,}$/, 'Invalid session ID format')
    .optional()
);

// Click IDs: preprocess null/empty strings to undefined, then validate non-empty
// Alphanumeric with common separators (_, -, .) - no weird Unicode
// FIX: Must handle null (typeof null === 'object' in JS), not just empty string
const gclidSchema = z.preprocess(
  (val) => (val === null || val === undefined || (typeof val === 'string' && val.trim() === '') ? undefined : val),
  z.string().trim().max(200)
    .regex(/^[a-zA-Z0-9_\-\.]+$/, 'Invalid gclid format')
    .optional()
);

const msclkidSchema = z.preprocess(
  (val) => (val === null || val === undefined || (typeof val === 'string' && val.trim() === '') ? undefined : val),
  z.string().trim().max(200)
    .regex(/^[a-zA-Z0-9_\-\.]+$/, 'Invalid msclkid format')
    .optional()
);

// UTM source: normalize lowercase, accept any but only map known sources server-side
// FIX: Handle null values
export const KNOWN_UTM_SOURCES = ['google', 'bing', 'facebook', 'instagram', 'twitter', 'linkedin', 'email', 'direct', 'referral'] as const;
export type KnownUtmSource = typeof KNOWN_UTM_SOURCES[number];
// Accept any string but normalize; server-side checks KNOWN_UTM_SOURCES for platform derivation
const utmSourceSchema = z.preprocess(
  (val) => (val === null || val === undefined || (typeof val === 'string' && val.trim() === '') ? undefined : val),
  z.string().trim().max(100).transform(s => s.toLowerCase()).optional()
);
// Helper to check if a source is known (for server-side use)
export const isKnownUtmSource = (src: string | undefined): src is KnownUtmSource =>
  !!src && KNOWN_UTM_SOURCES.includes(src as KnownUtmSource);
const vehicleYearSchema = z.number().int().min(1990).max(new Date().getFullYear() + 2);
const vehicleMakeModelSchema = z.string().trim().min(2).max(50).regex(/^[a-zA-Z0-9\s\-]+$/);
const serviceTypeSchema = z.enum(['repair', 'replacement']);

export const leadFormSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  vehicleYear: vehicleYearSchema,
  vehicleMake: vehicleMakeModelSchema,
  vehicleModel: vehicleMakeModelSchema,
  serviceType: serviceTypeSchema,
  mobileService: z.boolean().default(false),
  city: citySchema.optional(),
  state: stateSchema.optional(),
  zipCode: zipCodeSchema.optional(),
  utmSource: utmSourceSchema, // Normalized lowercase
  utmMedium: z.string().trim().max(100).transform(val => val?.toLowerCase()).optional(),
  utmCampaign: z.string().trim().max(100).optional(),
  utmTerm: z.string().trim().max(255).optional(),
  utmContent: z.string().trim().max(255).optional(),
  referralCode: z.string().trim().max(50).optional(),
  sessionId: sessionIdSchema, // Accepts session_xxx format from tracking.ts
  gclid: gclidSchema, // Google Ads click ID
  msclkid: msclkidSchema, // Microsoft Ads click ID
  smsConsent: z.boolean().default(false), // Optional for quick quotes
  privacyAcknowledgment: z.boolean().default(false), // Optional for quick quotes
  website: z.string().max(0).optional().default(''), // Honeypot
  formStartTime: z.number().optional(), // Timestamp validation
  insuranceCarrier: z.string().trim().max(50).optional(), // Captured on insurance pages
});

export const bookingFormSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  vehicleYear: vehicleYearSchema,
  vehicleMake: vehicleMakeModelSchema,
  vehicleModel: vehicleMakeModelSchema,
  serviceType: serviceTypeSchema,
  mobileService: z.boolean().default(false),
  streetAddress: addressSchema.optional(),
  city: citySchema,
  state: stateSchema,
  zipCode: zipCodeSchema,
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  timeWindow: z.enum(['morning', 'afternoon', 'anytime']).optional().default('anytime'),
  damageDescription: notesSchema,
  utmSource: utmSourceSchema, // Normalized lowercase
  utmMedium: z.string().trim().max(100).transform(val => val?.toLowerCase()).optional(),
  utmCampaign: z.string().trim().max(100).optional(),
  referralCode: z.string().trim().max(50).optional(),
  clientId: z.string().uuid().optional(),
  sessionId: sessionIdSchema, // Accepts session_xxx format from tracking.ts
  gclid: gclidSchema, // Google Ads click ID
  msclkid: msclkidSchema, // Microsoft Ads click ID
  smsConsent: z.literal(true),
  privacyAcknowledgment: z.literal(true),
  termsAccepted: z.literal(true),
  website: z.string().max(0).optional().default(''), // Honeypot
  formStartTime: z.number().optional(), // Timestamp validation
});

export type LeadFormData = z.infer<typeof leadFormSchema>;
export type BookingFormData = z.infer<typeof bookingFormSchema>;

export function validateHoneypot(website?: string): { valid: boolean; error?: string } {
  if (website && website.trim() !== '') {
    console.warn('⚠️ Honeypot filled - bot detected');
    return { valid: false, error: 'Invalid submission' };
  }
  return { valid: true };
}

export function validateTimestamp(formStartTime?: number): { valid: boolean; error?: string } {
  if (!formStartTime) return { valid: true };
  const elapsed = Date.now() - formStartTime;
  if (elapsed < 2000) return { valid: false, error: 'Form submitted too quickly' };
  if (elapsed > 1800000) return { valid: false, error: 'Form session expired' };
  return { valid: true };
}
