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

const nameSchema = z.string().trim().min(2).max(50).regex(/^[a-zA-Z\s\-']+$/);
const phoneSchema = z.string().trim().regex(/^(\+?1)?[\s\-.]?\(?([0-9]{3})\)?[\s\-.]?([0-9]{3})[\s\-.]?([0-9]{4})$/).transform((phone) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 ? `+1${digits}` : digits.length === 11 && digits.startsWith('1') ? `+${digits}` : `+${digits}`;
});
const emailSchema = z.string().trim().toLowerCase().email().max(254);
const citySchema = z.string().trim().min(2).max(100).regex(/^[a-zA-Z\s\-.']+$/);
const stateSchema = z.string().trim().toUpperCase().length(2).regex(/^[A-Z]{2}$/);
const zipCodeSchema = z.string().trim().regex(/^\d{5}(-\d{4})?$/);
const addressSchema = z.string().trim().min(5).max(200).regex(/^[a-zA-Z0-9\s\-.,#]+$/);
const notesSchema = z.string().trim().max(500).optional().transform((notes) => notes ? notes.replace(/<[^>]*>/g, '') : undefined);
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
  utmSource: z.string().trim().max(100).optional(),
  utmMedium: z.string().trim().max(100).optional(),
  utmCampaign: z.string().trim().max(100).optional(),
  referralCode: z.string().trim().max(50).optional(),
  smsConsent: z.boolean().default(false), // Optional for quick quotes
  privacyAcknowledgment: z.boolean().default(false), // Optional for quick quotes
  website: z.string().max(0).optional().default(''), // Honeypot
  formStartTime: z.number().optional(), // Timestamp validation
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
  timeWindow: z.enum(['morning', 'afternoon', 'flexible']).optional().default('flexible'),
  damageDescription: notesSchema,
  utmSource: z.string().trim().max(100).optional(),
  utmMedium: z.string().trim().max(100).optional(),
  utmCampaign: z.string().trim().max(100).optional(),
  referralCode: z.string().trim().max(50).optional(),
  clientId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
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
