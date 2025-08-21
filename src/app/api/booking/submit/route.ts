import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { BookingSchema, parseRelativeDate, normalizePhoneE164 } from "../../../../lib/booking-schema";
import { supabase, checkRateLimit, validateFile, STORAGE_CONFIG } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    // Rate limiting - 5 submissions per minute per IP
    const h = headers();
    const ip_address = h.get("x-forwarded-for") || h.get("x-real-ip") || "unknown";
    
    const rateLimit = checkRateLimit(ip_address, 5, 60000); // 5 requests per minute
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          ok: false, 
          error: "Too many requests. Please wait before submitting again.",
          retryAfter: Math.ceil((rateLimit.resetTime! - Date.now()) / 1000)
        }, 
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime! - Date.now()) / 1000).toString()
          }
        }
      );
    }
    const raw = await req.json();
    const parsed = BookingSchema.parse(raw);

    const termsAccepted =
      parsed.terms_accepted ??
      parsed.termsAccepted ??
      parsed.privacy_acknowledgment ??
      parsed.privacyAcknowledgment ??
      false;

    const preferred_date = parseRelativeDate(parsed.preferred_date);
    const phone_e164 = normalizePhoneE164(parsed.phone);

    const c = cookies();
    const client_id = c.get("cid")?.value || null;
    const session_id = c.get("sid")?.value || null;
    const ft = c.get("ft")?.value ? JSON.parse(c.get("ft")!.value) : null;
    const lt = c.get("lt")?.value ? JSON.parse(c.get("lt")!.value) : null;

    const payload = {
      service_type: parsed.service_type,
      mobile_service: !!parsed.mobile_service,
      first_name: parsed.first_name,
      last_name: parsed.last_name,
      phone: parsed.phone,
      phone_e164,
      email: parsed.email,
      vehicle_year: parsed.vehicle_year,
      vehicle_make: parsed.vehicle_make,
      vehicle_model: parsed.vehicle_model,
      address: parsed.address,
      city: parsed.city,
      state: parsed.state?.toUpperCase(),
      zip: parsed.zip,
      preferred_date,
      time_preference: parsed.time_preference,
      notes: parsed.notes,
      sms_consent: !!parsed.sms_consent,

      terms_accepted: !!termsAccepted,
      privacy_acknowledgment: !!termsAccepted,

      source: parsed.source || lt?.utm?.source || ft?.utm?.source || "website",
      status: "new",
      ip_address,
      referral_code: parsed.referral_code || null,
      client_id,
      session_id,
      first_touch: ft,
      last_touch: lt
    };

    const { error } = await supabase
      .from("leads")
      .insert(payload);

    if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 400 });

    // Attribution handling is now done by database trigger

    // Note: Photo uploads and notifications would require additional setup
    // since we can no longer retrieve the lead ID from the insert.
    // This could be handled by:
    // 1. Using a database function that returns the ID
    // 2. Creating a separate endpoint for photo uploads
    // 3. Using client-side storage for photos temporarily

    return NextResponse.json({ ok: true, message: "Booking submitted successfully" });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e.message || "error" }, { status: 400 });
  }
}
