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
}

// =============================================================================
// QUICK QUOTE SMS TEMPLATES
// =============================================================================

/** Step 1: Instant reply */
export function getQuoteInstantSMS(ctx: DripTemplateContext): string {
  return `Hi ${ctx.firstName}, thanks for contacting Pink Auto Glass, where a portion of every job goes to breast cancer awareness! We install windshields for the ${ctx.vehicleMake} ${ctx.vehicleModel} starting at $299. Give us a few minutes to look up your exact price and get back to you.`;
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
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">${ctx.vehicleYear} ${ctx.vehicleMake} ${ctx.vehicleModel}</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0;">Hi ${ctx.firstName},</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
        Thanks for contacting Pink Auto Glass, where a portion of every job goes to breast cancer awareness! We install windshields for the ${ctx.vehicleMake} ${ctx.vehicleModel} starting at <strong style="color: #ec4899;">$299</strong>.
      </p>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">
        Give us a few minutes to look up your exact price and get back to you.
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
// TEMPLATE RESOLVER
// =============================================================================
// Maps template_key (stored in scheduled_messages) to the correct template function.

export function renderTemplate(templateKey: string, ctx: DripTemplateContext): { body: string; subject?: string } | null {
  switch (templateKey) {
    default:
      console.error(`❌ Unknown drip template key: ${templateKey}`);
      return null;
  }
}
