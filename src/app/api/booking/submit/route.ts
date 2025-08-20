import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";
import { BookingSchema, parseRelativeDate, normalizePhoneE164 } from "../../../../lib/booking-schema";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  try {
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
    const h = headers();
    const client_id = c.get("cid")?.value || null;
    const session_id = c.get("sid")?.value || null;
    const ft = c.get("ft")?.value ? JSON.parse(c.get("ft")!.value) : null;
    const lt = c.get("lt")?.value ? JSON.parse(c.get("lt")!.value) : null;
    const ip_address = h.get("x-forwarded-for") || null;

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

    const { data: lead, error } = await supabase
      .from("leads")
      .insert(payload)
      .select("id, session_id")
      .single();

    if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 400 });

    const inserts: any[] = [];
    if (ft) inserts.push({
      lead_id: lead.id,
      session_id: lead.session_id,
      touch_type: "first",
      utm: ft.utm || {},
      click_ids: ft.click_ids || {},
      channel: null,
      referrer: ft.referrer || null,
      landing_page: ft.landing_page || null
    });
    if (lt) inserts.push({
      lead_id: lead.id,
      session_id: lead.session_id,
      touch_type: "last",
      utm: lt.utm || {},
      click_ids: lt.click_ids || {},
      channel: null,
      referrer: lt.referrer || null,
      landing_page: lt.landing_page || null
    });
    if (inserts.length) await supabase.from("lead_attributions").insert(inserts);

    return NextResponse.json({ ok:true, id: lead.id });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e.message || "error" }, { status: 400 });
  }
}
