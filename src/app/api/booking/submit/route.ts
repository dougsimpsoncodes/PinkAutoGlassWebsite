import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// Initialize Supabase client with anon key (no service role)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

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
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

// Helper to check rate limit (TEMPORARILY DISABLED FOR TESTING)
function checkRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
  // TEMP: Always allow for testing
  return { allowed: true };

  // const now = Date.now();
  // const key = `booking:${ip}`;
  // const current = rateLimitStore.get(key);

  // if (!current || now > current.resetTime) {
  //   rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
  //   return { allowed: true };
  // }

  // if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
  //   return { allowed: false, resetTime: current.resetTime };
  // }

  // current.count++;
  // rateLimitStore.set(key, current);
  // return { allowed: true };
}

// Helper to sanitize filename
function sanitizeFilename(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  return `${uuidv4()}-${extension.replace(/[^a-z0-9]/g, '')}`;
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
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
               req.headers.get('x-real-ip') ||
               'unknown';

    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime! - Date.now()) / 1000);
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { 'Retry-After': retryAfter.toString() }
        }
      );
    }

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

          // Convert base64 to ArrayBuffer if needed
          const data = typeof file.data === 'string'
            ? Uint8Array.from(atob(file.data), c => c.charCodeAt(0)).buffer
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

    // Validate required fields
    if (!payload.termsAccepted || !payload.privacyAcknowledgment) {
      return NextResponse.json(
        { ok: false, error: "Terms and privacy must be accepted" },
        { status: 400 }
      );
    }

    // Generate lead ID
    const leadId = uuidv4();

    // Insert lead using RPC
    const { error: leadError } = await supabase.rpc("fn_insert_lead", {
      p_id: leadId,
      p_payload: payload
    });

    if (leadError) {
      console.error("Lead insert failed:", leadError.message);
      return NextResponse.json(
        { ok: false, error: "Failed to submit booking" },
        { status: 500 }
      );
    }

    // Get reference number using RPC
    const { data: referenceNumber, error: refError } = await supabase.rpc(
      "fn_get_reference_number",
      { p_id: leadId }
    );

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
      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, file.data, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error("File upload failed:", uploadError.message);
        // Continue with other files rather than failing entire request
        continue;
      }

      // Register in media table if RPC exists
      try {
        await supabase.rpc("fn_add_media", {
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

    // Return success response
    return NextResponse.json({
      ok: true,
      id: leadId,
      referenceNumber: referenceNumber || leadId.slice(0, 8).toUpperCase(),
      files: uploadedFiles
    });

  } catch (error: any) {
    console.error("Booking submission error:", error.message);
    return NextResponse.json(
      { ok: false, error: "An error occurred processing your request" },
      { status: 500 }
    );
  }
}