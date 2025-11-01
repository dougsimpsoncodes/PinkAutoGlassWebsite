import { BookingFormData, LeadFormData } from '@/lib/validation';

// =============================================================================
// EMAIL TEMPLATES
// =============================================================================

interface BookingData {
  referenceNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  serviceType: string;
  mobileService: boolean;
  city?: string;
  state?: string;
  zipCode?: string;
  streetAddress?: string;
  preferredDate?: string;
  timeWindow?: string;
  damageDescription?: string;
  fileCount?: number;
}

/**
 * Customer booking confirmation email
 */
export function getCustomerConfirmationEmail(data: BookingData): string {
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
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Booking Confirmed!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your auto glass service is scheduled</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <!-- Reference Number -->
      <div style="background-color: #fdf2f8; border-left: 4px solid #ec4899; padding: 20px; margin-bottom: 30px;">
        <p style="margin: 0; color: #831843; font-size: 14px; font-weight: 600;">Reference Number</p>
        <p style="margin: 5px 0 0 0; color: #be185d; font-size: 24px; font-weight: 700; letter-spacing: 1px;">${data.referenceNumber}</p>
      </div>

      <!-- Greeting -->
      <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0;">Hi ${data.firstName},</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
        Thank you for choosing Pink Auto Glass! We've received your booking request and our team will contact you shortly to confirm your appointment details.
      </p>

      <!-- Service Details -->
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #ec4899;">Service Details</h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Vehicle:</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Service Type:</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${data.serviceType === 'repair' ? 'Windshield Repair' : 'Windshield Replacement'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Service Location:</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${data.mobileService ? 'Mobile Service' : 'Shop Service'}</td>
          </tr>
          ${data.preferredDate ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Preferred Date:</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${new Date(data.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
          ` : ''}
          ${data.timeWindow && data.timeWindow !== 'flexible' ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Time Window:</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${data.timeWindow === 'morning' ? 'Morning (8am-12pm)' : 'Afternoon (12pm-5pm)'}</td>
          </tr>
          ` : ''}
          ${data.mobileService && data.streetAddress ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Service Address:</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${data.streetAddress}, ${data.city}, ${data.state} ${data.zipCode}</td>
          </tr>
          ` : ''}
        </table>
      </div>

      <!-- What's Next -->
      <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <h3 style="color: #92400e; font-size: 16px; margin: 0 0 10px 0;">📋 What Happens Next?</h3>
        <ol style="color: #78350f; line-height: 1.8; margin: 0; padding-left: 20px; font-size: 14px;">
          <li>Our team will review your request and photos</li>
          <li>We'll call you to confirm appointment details</li>
          <li>You'll receive a confirmation text with appointment time</li>
          <li>We'll send a reminder the day before your appointment</li>
        </ol>
      </div>

      <!-- Contact Info -->
      <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">Questions about your booking?</p>
        <p style="margin: 0;">
          <a href="tel:+17209187465" style="color: #ec4899; text-decoration: none; font-weight: 600;">Call us: (720) 918-7465</a>
        </p>
        <p style="margin: 10px 0 0 0;">
          <a href="mailto:doug@pinkautoglass.com" style="color: #ec4899; text-decoration: none; font-weight: 600;">doug@pinkautoglass.com</a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
        Pink Auto Glass | Professional Windshield Repair & Replacement
      </p>
      <p style="color: #9ca3af; font-size: 11px; margin: 0;">
        You're receiving this email because you requested service at pinkautoglass.com
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Admin booking notification email
 */
export function getAdminBookingNotificationEmail(data: BookingData): string {
  const adminDashboardUrl = process.env.NEXT_PUBLIC_BASE_URL
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard/leads`
    : 'https://pinkautoglass.com/admin/dashboard/leads';

  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/Denver',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

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
    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">🚨 New Booking Request</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Reference: ${data.referenceNumber}</p>
      <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 12px;">⏰ ${timestamp} MT</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <!-- Customer Info -->
      <div style="border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">Customer Information</h2>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Name:</td>
            <td style="padding: 6px 0; color: #1f2937; font-weight: 600;">${data.firstName} ${data.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Phone:</td>
            <td style="padding: 6px 0;"><a href="tel:${data.phone}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">${data.phone}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Email:</td>
            <td style="padding: 6px 0;"><a href="mailto:${data.email}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Location:</td>
            <td style="padding: 6px 0; color: #1f2937; font-weight: 600;">${data.city}, ${data.state} ${data.zipCode}</td>
          </tr>
        </table>
      </div>

      <!-- Service Info -->
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 15px 0;">Service Details</h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Vehicle:</td>
            <td style="padding: 6px 0; color: #1f2937; font-weight: 600;">${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Service Type:</td>
            <td style="padding: 6px 0; color: #1f2937; font-weight: 600;">${data.serviceType === 'repair' ? '🔧 Repair' : '🔄 Replacement'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Service Location:</td>
            <td style="padding: 6px 0; color: #1f2937; font-weight: 600;">${data.mobileService ? '🚗 Mobile Service' : '🏪 Shop Service'}</td>
          </tr>
          ${data.preferredDate ? `
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Preferred Date:</td>
            <td style="padding: 6px 0; color: #1f2937; font-weight: 600;">${new Date(data.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
          ` : ''}
          ${data.timeWindow && data.timeWindow !== 'flexible' ? `
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Time Window:</td>
            <td style="padding: 6px 0; color: #1f2937; font-weight: 600;">${data.timeWindow === 'morning' ? '🌅 Morning (8am-12pm)' : '🌆 Afternoon (12pm-5pm)'}</td>
          </tr>
          ` : ''}
          ${data.streetAddress ? `
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Address:</td>
            <td style="padding: 6px 0; color: #1f2937; font-weight: 600;">${data.streetAddress}</td>
          </tr>
          ` : ''}
          ${data.damageDescription ? `
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-size: 14px; vertical-align: top;">Damage:</td>
            <td style="padding: 6px 0; color: #1f2937;">${data.damageDescription}</td>
          </tr>
          ` : ''}
          ${data.fileCount && data.fileCount > 0 ? `
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Photos:</td>
            <td style="padding: 6px 0; color: #1f2937; font-weight: 600;">📸 ${data.fileCount} photo${data.fileCount > 1 ? 's' : ''} uploaded</td>
          </tr>
          ` : ''}
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${adminDashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">View in Dashboard</a>
      </div>

      <!-- Next Steps -->
      <div style="background-color: #fef3c7; border-radius: 8px; padding: 15px; margin-top: 20px;">
        <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 600;">⏰ Next Steps:</p>
        <p style="color: #78350f; margin: 10px 0 0 0; font-size: 13px; line-height: 1.6;">
          1. Review the booking details and photos<br>
          2. Call the customer to confirm appointment<br>
          3. Send confirmation text with final details
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        Pink Auto Glass Admin Dashboard
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Admin quick quote notification email
 */
export function getAdminQuickQuoteEmail(data: Partial<BookingData>): string {
  const adminDashboardUrl = process.env.NEXT_PUBLIC_BASE_URL
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard/leads`
    : 'https://pinkautoglass.com/admin/dashboard/leads';

  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/Denver',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px;">💬 New Quick Quote Request</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 12px;">⏰ ${timestamp} MT</p>
    </div>

    <div style="padding: 20px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Name:</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${data.firstName} ${data.lastName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Phone:</td>
          <td style="padding: 8px 0;"><a href="tel:${data.phone}" style="color: #10b981; text-decoration: none; font-weight: 600;">${data.phone}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Vehicle:</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Service:</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${data.serviceType === 'repair' ? 'Repair' : 'Replacement'}</td>
        </tr>
      </table>

      <div style="text-align: center; margin: 20px 0;">
        <a href="${adminDashboardUrl}" style="display: inline-block; background: #10b981; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">View Lead</a>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// =============================================================================
// SMS TEMPLATES
// =============================================================================

/**
 * Customer booking confirmation SMS
 */
export function getCustomerConfirmationSMS(data: BookingData): string {
  return `Thanks for choosing Pink Auto Glass! Your booking (Ref: ${data.referenceNumber}) is confirmed. We'll call you shortly to finalize your appointment for your ${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}. Questions? Call us at (720) 918-7465`;
}

/**
 * Admin booking notification SMS
 */
export function getAdminBookingNotificationSMS(data: BookingData): string {
  return `🚨 NEW BOOKING: ${data.firstName} ${data.lastName} | ${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel} | ${data.serviceType === 'repair' ? 'Repair' : 'Replacement'} | ${data.mobileService ? 'Mobile' : 'Shop'} | ${data.phone} | Ref: ${data.referenceNumber}`;
}

/**
 * Admin quick quote notification SMS
 */
export function getAdminQuickQuoteSMS(data: Partial<BookingData>): string {
  return `💬 QUICK QUOTE: ${data.firstName} ${data.lastName} | ${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel} | ${data.phone}`;
}
