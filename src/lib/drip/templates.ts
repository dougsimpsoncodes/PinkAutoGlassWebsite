// =============================================================================
// DRIP SEQUENCE MESSAGE TEMPLATES
// =============================================================================
// Each template function receives a context object with lead personalization data.
// SMS templates must be concise (< 160 chars preferred, multi-segment OK for important messages).
// All SMS identify the sender and include the business phone number per TCPA.

interface DripTemplateContext {
  firstName: string;
  phone: string;
  email?: string | null;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  referenceNumber?: string | null;
  smsConsent: boolean;
  quotePrice?: number;
}

// =============================================================================
// QUICK QUOTE SMS TEMPLATES
// =============================================================================

/** Step 1: Instant reply */
export function getQuoteInstantSMS(ctx: DripTemplateContext): string {
  const vehicleRef = ctx.vehicleMake && ctx.vehicleMake !== 'Unknown'
    ? `your ${ctx.vehicleMake} ${ctx.vehicleModel}`
    : 'your windshield service';
  return `Hi ${ctx.firstName}, thanks for contacting Pink Auto Glass, where a portion of every job goes to breast cancer research. We just received your request for ${vehicleRef} and one of our team members will be in touch shortly.`;
}

/** Step 2: Next-day follow-up */
export function getQuoteFollowupNextDaySMS(ctx: DripTemplateContext): string {
  return `Hey ${ctx.firstName}, this is Dan at Pink Auto Glass. We have a few time slots available today if you still need your windshield service. Happy to help.`;
}

// =============================================================================
// QUICK QUOTE EMAIL TEMPLATES
// =============================================================================

/** Step 1: Instant reply email (same message as SMS, in branded HTML) */
export function getQuoteInstantEmail(ctx: DripTemplateContext): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ec4899 0%, #d946ef 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Thanks for Contacting Us!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">${ctx.vehicleMake && ctx.vehicleMake !== 'Unknown' ? `${ctx.vehicleYear} ${ctx.vehicleMake} ${ctx.vehicleModel}` : 'Windshield Service'}</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0;">Hi ${ctx.firstName},</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
        Thanks for contacting Pink Auto Glass, where a portion of every job goes to breast cancer research. We just received your request for ${ctx.vehicleMake && ctx.vehicleMake !== 'Unknown' ? `your ${ctx.vehicleYear} ${ctx.vehicleMake} ${ctx.vehicleModel}` : 'your windshield service'} and one of our team members will be in touch shortly.
      </p>

      <!-- CTA -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="tel:+17209187465" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #d946ef 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">Call Us: (720) 918-7465</a>
      </div>

      <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 20px 0 0 0;">
        Or reply to this email — we're here to help!
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
        Pink Auto Glass | Professional Windshield Repair &amp; Replacement
      </p>
      <p style="color: #9ca3af; font-size: 11px; margin: 0;">
        You're receiving this email because you requested a quote at pinkautoglass.com
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// =============================================================================
// REVIEW REQUEST TEMPLATES
// =============================================================================

const GOOGLE_REVIEW_URL = 'https://g.page/r/CZ2YTY_EELLQEAI/review';

/** Review request SMS — sent 2 hours after job marked complete */
export function getReviewRequestSMS(ctx: DripTemplateContext): string {
  const vehicle = ctx.vehicleMake && ctx.vehicleModel
    ? ` with your ${ctx.vehicleMake} ${ctx.vehicleModel}`
    : '';
  return `Hi ${ctx.firstName}, this is Dan at Pink Auto Glass. Thanks for trusting us${vehicle}! If you had a great experience, a quick Google review would really help us out: ${GOOGLE_REVIEW_URL}`;
}

/** Review reminder SMS — sent 3 days after job marked complete */
export function getReviewReminderSMS(ctx: DripTemplateContext): string {
  return `Hey ${ctx.firstName}, just a quick follow-up from Pink Auto Glass. If you have a moment, we'd really appreciate a Google review: ${GOOGLE_REVIEW_URL} — Thanks again for your business!`;
}

/** Review request email — sent 2 hours after job marked complete */
export function getReviewRequestEmail(ctx: DripTemplateContext): string {
  const vehicle = ctx.vehicleMake && ctx.vehicleModel
    ? `${ctx.vehicleYear} ${ctx.vehicleMake} ${ctx.vehicleModel}`
    : 'your vehicle';
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ec4899 0%, #d946ef 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Thank You!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Your ${vehicle} service is complete</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0;">Hi ${ctx.firstName},</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
        Thanks for choosing Pink Auto Glass! We hope you're happy with the work on your ${vehicle}.
      </p>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">
        If you had a great experience, a quick Google review would mean the world to our small team. It only takes 30 seconds and helps other Colorado drivers find us.
      </p>

      <!-- CTA -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${GOOGLE_REVIEW_URL}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #d946ef 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 700; font-size: 18px;">&#11088; Leave a Google Review</a>
      </div>

      <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 20px 0 0 0;">
        Have any concerns? Reply to this email or call us at (720) 918-7465 — we'll make it right.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
        Pink Auto Glass | A portion of every job supports breast cancer awareness
      </p>
      <p style="color: #9ca3af; font-size: 11px; margin: 0;">
        You're receiving this because we recently completed windshield service for you.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// =============================================================================
// TEMPLATE RESOLVER
// =============================================================================
// Maps template_key (stored in scheduled_messages) to the correct template function.

export function renderTemplate(templateKey: string, ctx: DripTemplateContext): { body: string; subject?: string } | null {
  switch (templateKey) {
    case 'quote_followup_nextday':
      return { body: getQuoteFollowupNextDaySMS(ctx) };
    case 'review_request':
      return { body: getReviewRequestSMS(ctx) };
    case 'review_request_email':
      return {
        body: getReviewRequestEmail(ctx),
        subject: 'How was your experience? — Pink Auto Glass',
      };
    case 'review_reminder':
      return { body: getReviewReminderSMS(ctx) };
    default:
      console.error(`❌ Unknown drip template key: ${templateKey}`);
      return null;
  }
}
