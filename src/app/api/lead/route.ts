import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { leadFormSchema, validateHoneypot, validateTimestamp } from '@/lib/validation';
import { sendAdminEmail } from '@/lib/notifications/email';
import { sendAdminSMS } from '@/lib/notifications/sms';
import { getAdminQuickQuoteEmail, getAdminQuickQuoteSMS } from '@/lib/notifications/templates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Transform legacy QuoteForm format to leadFormSchema format
    const transformedBody: any = { ...body };

    // Handle single 'name' field -> firstName/lastName
    if (body.name && !body.firstName) {
      const nameParts = body.name.trim().split(' ');
      transformedBody.firstName = nameParts[0] || '';
      transformedBody.lastName = nameParts.slice(1).join(' ') || nameParts[0]; // Use first name as last if only one name
    }

    // Handle 'vehicle' string -> vehicleYear/Make/Model (e.g., "2024 Toyota Camry")
    if (body.vehicle && !body.vehicleYear) {
      const vehicleParts = body.vehicle.trim().split(' ');
      const year = parseInt(vehicleParts[0]);
      if (!isNaN(year)) {
        transformedBody.vehicleYear = year;
        transformedBody.vehicleMake = vehicleParts[1] || '';
        transformedBody.vehicleModel = vehicleParts.slice(2).join(' ') || '';
      }
    }

    // Handle 'zip' -> 'zipCode'
    if (body.zip && !body.zipCode) {
      transformedBody.zipCode = body.zip;
    }

    // Default email to optional placeholder if not provided (QuoteForm doesn't collect email)
    if (!transformedBody.email) {
      transformedBody.email = `quote-${Date.now()}@temp.pinkautoglass.com`;
    }

    // Default serviceType for quick quotes
    if (!transformedBody.serviceType) {
      transformedBody.serviceType = 'repair';
    }

    // Default consents to true if smsConsent checkbox was checked (legacy behavior)
    if (body.smsConsent === true && !transformedBody.privacyAcknowledgment) {
      transformedBody.smsConsent = true;
      transformedBody.privacyAcknowledgment = true;
    } else if (!transformedBody.smsConsent) {
      // If SMS consent wasn't provided, default to false (quote-only, no SMS)
      transformedBody.smsConsent = false;
      transformedBody.privacyAcknowledgment = false;
    }

    // =============================================================================
    // SECURITY: Anti-Spam (Honeypot + Timestamp)
    // =============================================================================
    const honeypotResult = validateHoneypot(transformedBody.website);
    if (!honeypotResult.valid) {
      console.warn('⚠️ Honeypot triggered - bot detected');
      // Return success to bot but don't process
      return NextResponse.json({
        success: true,
        message: 'Quote request received! We\'ll contact you within 5 minutes.',
        leadId: uuidv4()
      });
    }

    const timestampResult = validateTimestamp(transformedBody.formStartTime);
    if (!timestampResult.valid) {
      return NextResponse.json(
        { error: timestampResult.error },
        { status: 400 }
      );
    }

    // =============================================================================
    // SECURITY: Input Validation with Zod
    // =============================================================================
    const validationResult = leadFormSchema.safeParse(transformedBody);
    if (!validationResult.success) {
      const errors = validationResult.error.format();
      console.warn('⚠️ Validation failed:', errors);
      return NextResponse.json(
        {
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

    // Create Supabase client with anon key (not service role)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Build payload for fn_insert_lead RPC using validated data
    const payload = {
      serviceType: validatedData.serviceType,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      phone: validatedData.phone, // Already normalized to E.164 by zod
      email: validatedData.email,
      vehicleYear: validatedData.vehicleYear,
      vehicleMake: validatedData.vehicleMake,
      vehicleModel: validatedData.vehicleModel,
      mobileService: validatedData.mobileService,
      city: validatedData.city || null,
      state: validatedData.state || null,
      zipCode: validatedData.zipCode || null,
      utmSource: validatedData.utmSource || null,
      utmMedium: validatedData.utmMedium || null,
      utmCampaign: validatedData.utmCampaign || null,
      referralCode: validatedData.referralCode || null,
      clientId: body.clientId || null,
      sessionId: body.sessionId || null,
    };

    // Insert lead via RPC (enforces RLS and business logic)
    const { error: leadError } = await supabase.rpc('fn_insert_lead', {
      p_id: leadId,
      p_payload: payload
    });

    if (leadError) {
      console.error('Lead insert failed:', leadError.message);
      return NextResponse.json(
        { error: 'Failed to submit quote request' },
        { status: 500 }
      );
    }

    // =============================================================================
    // SEND ADMIN NOTIFICATIONS (Email + SMS)
    // =============================================================================
    const quoteData = {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      phone: validatedData.phone,
      email: validatedData.email,
      vehicleYear: validatedData.vehicleYear,
      vehicleMake: validatedData.vehicleMake,
      vehicleModel: validatedData.vehicleModel,
      serviceType: validatedData.serviceType,
    };

    // Send admin notifications asynchronously (don't block response)
    Promise.all([
      sendAdminEmail(
        `💬 Quick Quote: ${validatedData.firstName} ${validatedData.lastName}`,
        getAdminQuickQuoteEmail(quoteData)
      ).catch(err => console.error('Admin quote email failed:', err)),

      sendAdminSMS(
        getAdminQuickQuoteSMS(quoteData)
      ).catch(err => console.error('Admin quote SMS failed:', err)),
    ]).catch(err => console.error('Quote notification batch failed:', err));

    return NextResponse.json(
      {
        success: true,
        message: 'Quote request received! We\'ll contact you within 5 minutes.',
        leadId: leadId
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Lead API error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Something went wrong. Please call us at (720) 918-7465' },
      { status: 500 }
    );
  }
}
