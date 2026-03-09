import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { leadFormSchema, validateHoneypot, validateTimestamp } from '@/lib/validation';
import { buildAttribution } from '@/lib/attribution';
import { sendEmail, sendAdminEmail } from '@/lib/notifications/email';
import { sendAdminSMS } from '@/lib/notifications/sms';
import { sendCustomerSMS } from '@/lib/notifications/beetexting';
import { getAdminQuickQuoteEmail, getAdminQuickQuoteSMS } from '@/lib/notifications/templates';
import { getQuoteInstantSMS, getQuoteInstantEmail } from '@/lib/drip/templates';
import { scheduleDripSequence } from '@/lib/drip/scheduler';
import { getQuotePrice } from '@/lib/pricing';
import { checkRateLimit } from '@/lib/rate-limit';
import { isExcludedPhone, isCustomerSmsEnabled, isTestPhone } from '@/lib/constants';

// ─── Market classification ────────────────────────────────────────────────────
// Phoenix metro: 850xx–855xx (Maricopa County)
// Denver metro:  800xx–806xx
const PHOENIX_PREFIXES = ['850', '851', '852', '853', '854', '855'];
const DENVER_PREFIXES  = ['800', '801', '802', '803', '804', '805', '806'];

function classifyMarket(zip: string | null | undefined): 'in_market' | 'out_of_market' | null {
  if (!zip || zip.length < 3) return null;
  const prefix = zip.replace(/\D/g, '').slice(0, 3);
  if (PHOENIX_PREFIXES.includes(prefix) || DENVER_PREFIXES.includes(prefix)) return 'in_market';
  return 'out_of_market';
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 submissions per IP per 60 seconds
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateCheck = checkRateLimit(ip, 5, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000)) } }
      );
    }

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

    // Default vehicle fields for insurance-only forms (carrier + phone, no vehicle collected)
    if (!transformedBody.vehicleYear) {
      transformedBody.vehicleYear = 2000;
      transformedBody.vehicleMake = 'Unknown';
      transformedBody.vehicleModel = 'Unknown';
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
    let leadId = uuidv4();
    let isDuplicate = false;

    // Create Supabase client with anon key (not service role)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Service role client for session lookup (bypasses RLS)
    const sessionClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // =============================================================================
    // ATTRIBUTION: Capture session context (fallback) + build immutable attribution
    // =============================================================================
    let sessionId: string | null = validatedData.sessionId || body.sessionId || request.cookies.get('session_id')?.value || null;
    let utmParams: any = {};

    try {
      if (sessionId) {
        const { data: sessionData, error: sessionError } = await sessionClient
          .from('user_sessions')
          .select('utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, msclkid')
          .eq('session_id', sessionId)
          .single();

        if (!sessionError && sessionData) {
          utmParams = {
            utm_source: sessionData.utm_source,
            utm_medium: sessionData.utm_medium,
            utm_campaign: sessionData.utm_campaign,
            utm_term: sessionData.utm_term,
            utm_content: sessionData.utm_content,
            gclid: sessionData.gclid,
            msclkid: sessionData.msclkid,
          };
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to capture session attribution (non-fatal):', error);
    }

    const attribution = buildAttribution({
      lookupGclid: utmParams.gclid,
      lookupMsclkid: utmParams.msclkid,
      bodyGclid: validatedData.gclid,
      bodyMsclkid: validatedData.msclkid,
      utmSource: utmParams.utm_source ?? validatedData.utmSource,
      utmMedium: utmParams.utm_medium ?? validatedData.utmMedium,
      utmCampaign: utmParams.utm_campaign ?? validatedData.utmCampaign,
      utmTerm: utmParams.utm_term ?? (validatedData as any).utmTerm,
      utmContent: utmParams.utm_content ?? (validatedData as any).utmContent,
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
      sessionId: sessionId || null,
      insuranceCarrier: validatedData.insuranceCarrier || null,
      // Mark as test if phone is in EXCLUDED_DRIP_PHONES or TEST_PHONES
      isTest: isExcludedPhone(validatedData.phone) || isTestPhone(validatedData.phone),
      // Spread immutable attribution (gclid, msclkid, ad_platform, utm_*)
      ...attribution,
    };

    // =============================================================================
    // DEDUP: One lead per phone number per 7 days (skip completed/lost leads)
    // =============================================================================
    const dedupClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: existingLead } = await dedupClient
      .from('leads')
      .select('id')
      .eq('phone_e164', validatedData.phone)
      .in('status', ['new', 'contacted', 'quoted', 'scheduled'])
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingLead) {
      // Same customer within 7 days — update existing lead instead of creating duplicate
      leadId = existingLead.id;
      isDuplicate = true;
      await dedupClient
        .from('leads')
        .update({
          vehicle_year: validatedData.vehicleYear,
          vehicle_make: validatedData.vehicleMake,
          vehicle_model: validatedData.vehicleModel,
          service_type: validatedData.serviceType,
        })
        .eq('id', existingLead.id);
      console.log(`📋 Dedup: Updated existing lead ${existingLead.id} (same phone within 7 days)`);
    } else {
      // Insert new lead via RPC (enforces RLS and business logic)
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
    }

    // =============================================================================
    // MARKET TYPE: Tag lead as in_market or out_of_market based on zip
    // =============================================================================
    const zip = validatedData.zipCode || body.zip || null;
    let marketType = classifyMarket(zip);

    // National satellite sites — if zip is null/unrecognized, treat as out_of_market.
    // Exception: Denver (800-806xx) or Phoenix (850-855xx) zips are already classified
    // as in_market by classifyMarket() above, so this block only fires when marketType===null.
    const NATIONAL_SOURCES = [
      // Original national sites
      'carwindshieldprices', 'windshieldrepairprices', 'carglassprices',
      // New national sites (added geo routing 2026-03-08)
      'windshieldcostcalculator', 'cheapestwindshield', 'newwindshieldcost',
      'getawindshieldquote', 'newwindshieldnearme', 'windshieldpricecompare',
      // Colorado Springs / Fort Collins (out of Denver/Phoenix service area)
      'coloradospringswindshield', 'autoglasscoloradosprings',
      'mobilewindshieldcoloradosprings', 'windshieldreplacementfortcollins',
    ];
    if (marketType === null && NATIONAL_SOURCES.includes(validatedData.utmSource ?? '')) {
      marketType = 'out_of_market';
    }

    // Store market_type if column exists (migration may not be applied yet — fire-and-forget)
    if (marketType) {
      dedupClient
        .from('leads')
        .update({ market_type: marketType })
        .eq('id', leadId)
        .then(({ error }) => {
          if (error && error.code !== '42703') console.error('Failed to set market_type:', error.message);
        });
    }

    // Out-of-market leads: saved to DB but no SMS, drip, or admin alerts
    if (marketType === 'out_of_market') {
      console.log(`🌐 Out-of-market lead ${leadId} from zip ${zip} — saved, skipping notifications`);
      return NextResponse.json(
        { success: true, message: 'Quote request received! We\'ll text you within minutes.', leadId },
        { status: 200 }
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

    // Team member flag — suppresses internal notifications only, not customer comms
    const isTeamMember = isExcludedPhone(validatedData.phone);

    try {
      const autoReplyPromises: Promise<boolean>[] = [];

      if (smsConsent && isCustomerSmsEnabled()) {
        autoReplyPromises.push(
          sendCustomerSMS({ to: validatedData.phone, message: getQuoteInstantSMS(dripCtx) })
            .then(ok => { console.log(`${ok ? '✅' : '❌'} Customer instant SMS for lead ${leadId}`); return ok; })
            .catch(err => { console.error('❌ Customer instant SMS exception:', leadId, err); return false; })
        );
      } else if (smsConsent) {
        console.log(`⏸️ Customer SMS disabled — skipping instant SMS for lead ${leadId}`);
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
    if (smsConsent && !isDuplicate) {
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
    // Skip for team member phones — test submissions should not trigger internal alerts
    if (isTeamMember) {
      console.log(`⏭️ Skipping admin notifications for team member phone ${validatedData.phone} (lead ${leadId})`);
    } else {
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
    } // end !isTeamMember admin notifications

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
