import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { bookingFormSchema, validateHoneypot, validateTimestamp } from "@/lib/validation";
import { sendEmail, sendAdminEmail } from "@/lib/notifications/email";
import { sendSMS, sendAdminSMS } from "@/lib/notifications/sms";
import {
  getCustomerConfirmationEmail,
  getAdminBookingNotificationEmail,
  getCustomerConfirmationSMS,
  getAdminBookingNotificationSMS
} from "@/lib/notifications/templates";

// Initialize Supabase client lazily to avoid build-time errors
let supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables not configured");
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

// File validation constants
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif'
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

// Helper to sanitize filename
function sanitizeFilename(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  return `${uuidv4()}.${extension.replace(/[^a-z0-9]/g, '')}`;
}

// Helper to validate file
function validateFile(file: { type: string; size: number; name: string }): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large: ${file.name}. Maximum size: 10MB` };
  }
  return { valid: true };
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let payload: any;
    let fileUploads: Array<{ data: ArrayBuffer; name: string; type: string; size: number }> = [];

    // Handle different content types
    if (contentType.includes('application/json')) {
      // JSON request with optional base64 files
      const body = await req.json();
      payload = body.data || body;

      // Handle optional files array in JSON
      if (body.files && Array.isArray(body.files)) {
        if (body.files.length > MAX_FILES) {
          return NextResponse.json(
            { ok: false, error: `Too many files. Maximum allowed: ${MAX_FILES}` },
            { status: 400 }
          );
        }

        for (const file of body.files) {
          const validation = validateFile(file);
          if (!validation.valid) {
            return NextResponse.json(
              { ok: false, error: validation.error },
              { status: 400 }
            );
          }

          // Convert base64 to ArrayBuffer if needed (Node-safe)
          const data = typeof file.data === 'string'
            ? Buffer.from(file.data, 'base64').buffer
            : file.data;

          fileUploads.push({
            data,
            name: file.name,
            type: file.type,
            size: file.size
          });
        }
      }
    } else if (contentType.includes('multipart/form-data')) {
      // Multipart form data
      const formData = await req.formData();

      // Get payload
      const payloadPart = formData.get('payload');
      if (!payloadPart) {
        return NextResponse.json(
          { ok: false, error: "Missing payload in multipart request" },
          { status: 400 }
        );
      }

      // Parse payload (can be File or string)
      if (payloadPart instanceof File) {
        payload = JSON.parse(await payloadPart.text());
      } else {
        payload = JSON.parse(payloadPart as string);
      }

      // Collect all file parts
      const files: File[] = [];
      for (const [key, value] of formData.entries()) {
        if (key === 'file' && value instanceof File) {
          files.push(value);
        }
      }

      if (files.length > MAX_FILES) {
        return NextResponse.json(
          { ok: false, error: `Too many files. Maximum allowed: ${MAX_FILES}` },
          { status: 400 }
        );
      }

      // Validate and prepare files
      for (const file of files) {
        const validation = validateFile(file);
        if (!validation.valid) {
          return NextResponse.json(
            { ok: false, error: validation.error },
            { status: 400 }
          );
        }

        fileUploads.push({
          data: await file.arrayBuffer(),
          name: file.name,
          type: file.type,
          size: file.size
        });
      }
    } else {
      return NextResponse.json(
        { ok: false, error: "Unsupported content type. Use application/json or multipart/form-data" },
        { status: 400 }
      );
    }

    // =============================================================================
    // SECURITY: Anti-Spam (Honeypot + Timestamp)
    // =============================================================================
    const honeypotResult = validateHoneypot(payload.website);
    if (!honeypotResult.valid) {
      console.warn('⚠️ Honeypot triggered - bot detected');
      // Return success to bot but don't process
      return NextResponse.json({
        ok: true,
        id: uuidv4(),
        referenceNumber: 'PENDING',
        files: []
      });
    }

    const timestampResult = validateTimestamp(payload.formStartTime);
    if (!timestampResult.valid) {
      return NextResponse.json(
        { ok: false, error: timestampResult.error },
        { status: 400 }
      );
    }

    // =============================================================================
    // SECURITY: Input Validation with Zod
    // =============================================================================
    const validationResult = bookingFormSchema.safeParse(payload);
    if (!validationResult.success) {
      const errors = validationResult.error.format();
      console.warn('⚠️ Validation failed:', errors);
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid input data',
          validationErrors: Object.entries(errors)
            .filter(([key]) => key !== '_errors')
            .reduce((acc, [key, value]: [string, any]) => {
              acc[key] = value._errors[0] || 'Invalid value';
              return acc;
            }, {} as Record<string, string>)
        },
        { status: 400 }
      );
    }

    // Use validated and sanitized data
    const validatedData = validationResult.data;

    // Generate lead ID
    const leadId = uuidv4();

    // Get Supabase client
    const client = getSupabaseClient();

    // Insert lead using RPC with validated data
    const { error: leadError } = await client.rpc("fn_insert_lead", {
      p_id: leadId,
      p_payload: validatedData
    });

    if (leadError) {
      console.error("Lead insert failed:", leadError.message, "Code:", leadError.code);
      return NextResponse.json(
        { ok: false, error: "Failed to submit booking" },
        { status: 500 }
      );
    }

    // Get reference number using RPC
    const { data: referenceNumber, error: refError } = await client.rpc(
      "fn_get_reference_number",
      { p_id: leadId }
    ) as { data: string | null; error: any };

    if (refError) {
      console.error("Reference number fetch failed:", refError.message);
      // Continue without reference number rather than failing entire request
    }

    // Upload files if any
    const uploadedFiles: Array<{ path: string; mimeType: string; size: number }> = [];

    for (const file of fileUploads) {
      const safeName = sanitizeFilename(file.name);
      const filePath = `uploads/leads/${leadId}/${safeName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await client.storage
        .from("uploads")
        .upload(filePath, file.data, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error("File upload failed:", uploadError.message, "Lead ID:", leadId);
        // Continue with other files rather than failing entire request
        continue;
      }

      // Register in media table if RPC exists
      try {
        await client.rpc("fn_add_media", {
          p_lead_id: leadId,
          p_path: filePath,
          p_mime_type: file.type,
          p_size_bytes: file.size
        });
      } catch (mediaError) {
        // Media registration is optional, continue if it fails
        console.error("Media registration failed:", mediaError);
      }

      uploadedFiles.push({
        path: filePath,
        mimeType: file.type,
        size: file.size
      });
    }

    // =============================================================================
    // SEND NOTIFICATIONS (Email + SMS)
    // =============================================================================
    const finalReferenceNumber = referenceNumber || leadId.slice(0, 8).toUpperCase();

    // Prepare booking data for templates
    const bookingData = {
      referenceNumber: finalReferenceNumber,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      phone: validatedData.phone,
      email: validatedData.email,
      vehicleYear: validatedData.vehicleYear,
      vehicleMake: validatedData.vehicleMake,
      vehicleModel: validatedData.vehicleModel,
      serviceType: validatedData.serviceType,
      mobileService: validatedData.mobileService,
      city: validatedData.city,
      state: validatedData.state,
      zipCode: validatedData.zipCode,
      streetAddress: validatedData.streetAddress,
      preferredDate: validatedData.preferredDate,
      timeWindow: validatedData.timeWindow,
      damageDescription: validatedData.damageDescription,
      fileCount: uploadedFiles.length,
    };

    // Send notifications asynchronously (don't block response)
    Promise.all([
      // Customer notifications
      sendEmail({
        to: validatedData.email,
        subject: `Booking Confirmed - ${finalReferenceNumber}`,
        html: getCustomerConfirmationEmail(bookingData),
      }).catch(err => console.error('Customer email failed:', err)),

      validatedData.smsConsent ? sendSMS({
        to: validatedData.phone,
        message: getCustomerConfirmationSMS(bookingData),
      }).catch(err => console.error('Customer SMS failed:', err)) : Promise.resolve(),

      // Admin notifications
      sendAdminEmail(
        `🚨 New Booking: ${validatedData.firstName} ${validatedData.lastName} - ${finalReferenceNumber}`,
        getAdminBookingNotificationEmail(bookingData)
      ).catch(err => console.error('Admin email failed:', err)),

      sendAdminSMS(
        getAdminBookingNotificationSMS(bookingData)
      ).catch(err => console.error('Admin SMS failed:', err)),
    ]).catch(err => console.error('Notification batch failed:', err));

    // Return success response
    return NextResponse.json({
      ok: true,
      id: leadId,
      referenceNumber: finalReferenceNumber,
      files: uploadedFiles
    });

  } catch (error: any) {
    console.error("Booking submission error:", error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { ok: false, error: "An error occurred processing your request" },
      { status: 500 }
    );
  }
}