import { z } from "zod";

export const BookingSchema = z.object({
  service_type: z.enum(["repair","replacement"]),
  mobile_service: z.boolean().optional().default(false),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().min(7),
  email: z.string().email().optional().or(z.literal("").transform(() => undefined)),
  vehicle_year: z.coerce.number().int().min(1990).max(new Date().getFullYear()+2),
  vehicle_make: z.string().min(1),
  vehicle_model: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2).optional(),
  zip: z.string().optional(),
  preferred_date: z.string().optional(),
  time_preference: z.enum(["morning","afternoon","flexible"]).default("flexible"),
  notes: z.string().optional(),
  sms_consent: z.coerce.boolean().optional().default(false),

  termsAccepted: z.coerce.boolean().optional(),
  privacyAcknowledgment: z.coerce.boolean().optional(),
  terms_accepted: z.coerce.boolean().optional(),
  privacy_acknowledgment: z.coerce.boolean().optional(),

  source: z.string().optional(),
  referral_code: z.string().optional()
});

export type BookingInput = z.infer<typeof BookingSchema>;

export const normalizePhoneE164 = (raw?: string) => {
  if (!raw) return undefined;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return undefined;
};

export const parseRelativeDate = (v?: string) => {
  if (!v) return undefined;
  const s = v.trim().toLowerCase();
  const d = new Date(); d.setHours(0,0,0,0);
  if (s === "today") return d.toISOString().slice(0,10);
  if (s === "tomorrow") { const t = new Date(d); t.setDate(t.getDate()+1); return t.toISOString().slice(0,10); }
  if (s === "next_week") { const nw = new Date(d); const add = ((1 - nw.getDay() + 7) % 7) + 7; nw.setDate(nw.getDate()+add); return nw.toISOString().slice(0,10); }
  const direct = new Date(v);
  if (!isNaN(direct.getTime())) return direct.toISOString().slice(0,10);
  return undefined;
};
