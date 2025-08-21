import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Email configuration
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@pinkautoglass.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@pinkautoglass.com";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

interface EmailData {
  leadId: string;
  customerName: string;
  phone: string;
  email: string;
  serviceType: string;
  vehicleInfo: string;
  preferredDate: string;
  timePreference: string;
  address: string;
  notes?: string;
  photoCount: number;
}

async function sendEmailViaResend(data: EmailData) {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email notification");
    return { success: false, error: "Email service not configured" };
  }

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FF1493;">🚗 New Booking Request</h2>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e3a8a; margin-top: 0;">Customer Information</h3>
        <p><strong>Name:</strong> ${data.customerName}</p>
        <p><strong>Phone:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>
        <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
      </div>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e3a8a; margin-top: 0;">Service Details</h3>
        <p><strong>Service:</strong> ${data.serviceType === 'repair' ? 'Windshield Repair' : 'Windshield Replacement'}</p>
        <p><strong>Vehicle:</strong> ${data.vehicleInfo}</p>
        <p><strong>Preferred Date:</strong> ${data.preferredDate}</p>
        <p><strong>Time Preference:</strong> ${data.timePreference}</p>
        <p><strong>Location:</strong> ${data.address}</p>
        ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
        ${data.photoCount > 0 ? `<p><strong>Photos Uploaded:</strong> ${data.photoCount}</p>` : ''}
      </div>

      <div style="background: #FFE4E1; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e3a8a; margin-top: 0;">⚡ Action Required</h3>
        <p>Please contact the customer within 15 minutes to confirm their appointment.</p>
        <a href="tel:${data.phone}" style="display: inline-block; background: #FF1493; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin-top: 10px;">
          Call Customer Now
        </a>
      </div>

      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        Lead ID: ${data.leadId}<br>
        Received: ${new Date().toLocaleString()}
      </p>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `🚨 New Booking: ${data.customerName} - ${data.serviceType === 'repair' ? 'Repair' : 'Replacement'}`,
        html: emailHtml,
        reply_to: data.email,
      }),
    });

    const result = await response.json();
    return { success: response.ok, data: result };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: String(error) };
  }
}

export async function POST(req: Request) {
  try {
    const { leadId } = await req.json();

    // Fetch lead details with media count
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*, media(id)")
      .eq("id", leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        { ok: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // Prepare email data
    const emailData: EmailData = {
      leadId: lead.id,
      customerName: `${lead.first_name} ${lead.last_name}`,
      phone: lead.phone,
      email: lead.email,
      serviceType: lead.service_type,
      vehicleInfo: `${lead.vehicle_year} ${lead.vehicle_make} ${lead.vehicle_model}`,
      preferredDate: new Date(lead.preferred_date).toLocaleDateString(),
      timePreference: lead.time_preference,
      address: `${lead.address}, ${lead.city}, ${lead.state} ${lead.zip}`,
      notes: lead.notes,
      photoCount: lead.media?.length || 0,
    };

    // Send email notification
    const emailResult = await sendEmailViaResend(emailData);

    // Log communication attempt
    await supabase.from("lead_activities").insert({
      lead_id: leadId,
      activity_type: "email_notification",
      description: emailResult.success 
        ? "Admin notification email sent successfully" 
        : `Failed to send admin notification: ${emailResult.error}`,
    });

    return NextResponse.json({
      ok: true,
      emailSent: emailResult.success,
      message: emailResult.success 
        ? "Notification sent successfully" 
        : "Booking saved but email notification failed",
    });
  } catch (error: any) {
    console.error("Notification error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Notification failed" },
      { status: 500 }
    );
  }
}