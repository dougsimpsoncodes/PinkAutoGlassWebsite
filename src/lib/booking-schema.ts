import { z } from "zod";

export const BookingSchema = z.object({
  clientGeneratedId: z.string().uuid().optional(),
  serviceType: z.enum(["repair","replacement"]),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phoneE164: z.string().min(7),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().length(2).optional().or(z.literal("")),
  zip: z.string().min(3).max(10).optional().or(z.literal("")),
  vehicleYear: z.number().int().optional(),
  vehicleMake: z.string().optional().or(z.literal("")),
  vehicleModel: z.string().optional().or(z.literal("")),
  termsAccepted: z.boolean().default(false),
  privacyAcknowledgment: z.boolean().default(false),
  clientId: z.string().optional().or(z.literal("")),
  sessionId: z.string().optional().or(z.literal("")),
  firstTouch: z.any().optional(),
  lastTouch: z.any().optional()
});

export type BookingFormData = z.infer<typeof BookingSchema>;

export function parseRelativeDate(date: string | undefined): string | undefined {
  if (!date) return undefined;
  
  const today = new Date();
  const parsed = new Date(date);
  
  if (parsed.toDateString() === today.toDateString()) {
    return 'today';
  }
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (parsed.toDateString() === tomorrow.toDateString()) {
    return 'tomorrow';
  }
  
  return date;
}

export function normalizePhoneE164(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // If it's a US number without country code, add it
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // If it already has country code
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // Return as-is for other formats
  return phone;
}