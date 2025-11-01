import { Resend } from 'resend';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Resend API key not configured');
      return false;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: options.from || `Pink Auto Glass <${process.env.FROM_EMAIL || 'bookings@pinkautoglass.com'}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('❌ Email send error:', error);
      return false;
    }

    const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;
    console.log(`✅ Email sent to ${recipients}: ${options.subject}`);
    return true;
  } catch (error: any) {
    console.error('❌ Email send error:', error.message || error);
    return false;
  }
}

/**
 * Send email to admin team (supports multiple comma-separated emails)
 * Sends one email to multiple recipients to avoid rate limits
 */
export async function sendAdminEmail(subject: string, html: string): Promise<boolean> {
  const adminEmailsStr = process.env.ADMIN_EMAIL || 'admin@pinkautoglass.com';
  const adminEmails = adminEmailsStr.split(',').map(email => email.trim());

  // Send one email to all admin addresses (avoids rate limiting)
  return sendEmail({ to: adminEmails, subject, html });
}
