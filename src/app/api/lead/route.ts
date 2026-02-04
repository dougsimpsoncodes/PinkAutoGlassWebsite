import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { leadFormSchema, validateHoneypot, validateTimestamp } from '@/lib/validation';
import { buildAttribution } from '@/lib/attribution';
import { sendEmail, sendAdminEmail } from '@/lib/notifications/email';
import { sendAdminSMS, sendSMS } from '@/lib/notifications/sms';
import { getAdminQuickQuoteEmail, getAdminQuickQuoteSMS } from '@/lib/notifications/templates';
import { getQuoteInstantSMS, getQuoteInstantEmail } from '@/lib/drip/templates';
import { scheduleDripSequence } from '@/lib/drip/scheduler';
import { getQuotePrice } from '@/lib/pricing';

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
        transformedBody.vehicleMake = vehicleParts[1] || 'Unknown';
        // Default empty model to make name or 'Unknown' to pass validation
        transformedBody.vehicleModel = vehicleParts.slice(2).join(' ') || vehicleParts[1] || 'Unknown';
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

    // =============================================================================
    // ATTRIBUTION: Build immutable attribution using centralized helper
    // =============================================================================
    // For /api/lead, we don't have session lookup - only body values
    // (QuoteForm is a simple form without session context)
    const attribution = buildAttribution({
      bodyGclid: validatedData.gclid,
      bodyMsclkid: validatedData.msclkid,
      utmSource: validatedData.utmSource,
      utmMedium: validatedData.utmMedium,
      utmCampaign: validatedData.utmCampaign,
    });

    // Build payload for fn_insert_lead RPC using validated data
    // IMPORTANT: Field names must match what fn_insert_lead expects in the SQL function
    const payload = {
      serviceType: validatedData.serviceType,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      phoneE164: validatedData.phone, // Already normalized to E.164 by zod
      email: validatedData.email,
      vehicleYear: validatedData.vehicleYear,
      vehicleMake: validatedData.vehicleMake,
      vehicleModel: validatedData.vehicleModel,
      mobileService: validatedData.mobileService,
      city: validatedData.city || null,
      state: validatedData.state || null,
      zip: validatedData.zipCode || null,
      referralCode: validatedData.referralCode || null,
      clientId: body.clientId || null,
      sessionId: body.sessionId || null,
      // Spread immutable attribution (gclid, msclkid, ad_platform, utm_*)
      ...attribution,
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
    // PRICING: Look up dynamic quote price (non-blocking, fallback on failure)
    // =============================================================================
    let quotePrice: number | undefined;
    try {
      const priceResult = await getQuotePrice(
        validatedData.vehicleYear,
        validatedData.vehicleMake,
        validatedData.vehicleModel,
        validatedData.serviceType
      );
      quotePrice = priceResult.price;

      // Write quote_amount to lead (fire-and-forget, don't block response)
      supabase
        .from('leads')
        .update({ quote_amount: quotePrice })
        .eq('id', leadId)
        .then(({ error }) => {
          if (error) console.error('Failed to update lead quote_amount:', error.message);
        });
    } catch (err) {
      console.error('Pricing lookup failed, using template default:', err);
    }

    // =============================================================================
    // CUSTOMER AUTO-REPLY: Instant SMS + Email
    // =============================================================================
    const smsConsent = validatedData.smsConsent === true;
    const hasRealEmail = validatedData.email && !validatedData.email.includes('@temp.pinkautoglass.com');
    const dripCtx = {
      firstName: validatedData.firstName,
      phone: validatedData.phone,
      vehicleYear: validatedData.vehicleYear,
      vehicleMake: validatedData.vehicleMake,
      vehicleModel: validatedData.vehicleModel,
      smsConsent,
      quotePrice,
    };

    try {
      const autoReplyPromises: Promise<boolean>[] = [];

      if (smsConsent) {
        autoReplyPromises.push(
          sendSMS({ to: validatedData.phone, message: getQuoteInstantSMS(dripCtx) })
            .then(ok => { console.log(`${ok ? '✅' : '❌'} Customer instant SMS for lead ${leadId}`); return ok; })
            .catch(err => { console.error('❌ Customer instant SMS exception:', leadId, err); return false; })
        );
      }

      if (hasRealEmail) {
        autoReplyPromises.push(
          sendEmail({
            to: validatedData.email,
            subject: `Your ${validatedData.vehicleMake} ${validatedData.vehicleModel} Quote - Pink Auto Glass`,
            html: getQuoteInstantEmail(dripCtx),
            leadId,
          })
            .then(ok => { console.log(`${ok ? '✅' : '❌'} Customer instant email for lead ${leadId}`); return ok; })
            .catch(err => { console.error('❌ Customer instant email exception:', leadId, err); return false; })
        );
      }

      if (autoReplyPromises.length > 0) {
        await Promise.all(autoReplyPromises);
      }
    } catch (err) {
      console.error('❌ Customer auto-reply failed for lead:', leadId, err);
    }

    // =============================================================================
    // DRIP SEQUENCE: Schedule next-day follow-up SMS
    // =============================================================================
    if (smsConsent) {
      try {
        const dripResult = await scheduleDripSequence(leadId, dripCtx, 'quick_quote');
        console.log(`📅 Drip scheduled for lead ${leadId}: ${dripResult.scheduled} messages`);
      } catch (err) {
        console.error('❌ Drip scheduling failed for lead:', leadId, err);
      }
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

    // Send admin notifications (MUST await to prevent Vercel from killing the async operation)
    console.log('📧 Attempting to send admin notifications for lead:', leadId);
    try {
      const results = await Promise.all([
        sendAdminEmail(
          `💬 Quick Quote: ${validatedData.firstName} ${validatedData.lastName}`,
          getAdminQuickQuoteEmail(quoteData)
        ).then(success => {
          if (success) {
            console.log('✅ Admin email sent successfully for lead:', leadId);
          } else {
            console.error('❌ Admin email failed to send for lead:', leadId);
          }
          return success;
        }).catch(err => {
          console.error('❌ Admin quote email exception for lead:', leadId, err);
          return false;
        }),

        sendAdminSMS(
          getAdminQuickQuoteSMS(quoteData)
        ).then(success => {
          if (success) {
            console.log('✅ Admin SMS sent successfully for lead:', leadId);
          } else {
            console.error('❌ Admin SMS failed to send for lead:', leadId);
          }
          return success;
        }).catch(err => {
          console.error('❌ Admin quote SMS exception for lead:', leadId, err);
          return false;
        }),
      ]);

      console.log(`📊 Notification results for lead ${leadId}: Email=${results[0]}, SMS=${results[1]}`);
    } catch (err) {
      console.error('❌ Quote notification batch failed for lead:', leadId, err);
    }

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
