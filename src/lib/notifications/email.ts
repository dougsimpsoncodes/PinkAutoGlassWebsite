import { Resend } from 'resend';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  leadId?: string;
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

    const fromEmail = process.env.FROM_EMAIL;
    if (!fromEmail) {
      console.error('FROM_EMAIL environment variable not configured');
      return false;
    }

    // Build unsubscribe URL for List-Unsubscribe header (required by Yahoo/AOL/Gmail)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pinkautoglass.com';
    const recipient = Array.isArray(options.to) ? options.to[0] : options.to;
    const unsubParams = new URLSearchParams({ email: recipient });
    if (options.leadId) unsubParams.set('lead_id', options.leadId);
    const unsubUrl = `${siteUrl}/api/unsubscribe?${unsubParams}`;

    const { data, error } = await resend.emails.send({
      from: options.from || `Pink Auto Glass <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      headers: {
        'List-Unsubscribe': `<${unsubUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
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
  const adminEmails = adminEmailsStr.split(',').map(email => email.trim().replace(/\\n/g, ''));

  console.log(`📧 Sending admin email to: ${adminEmails.join(', ')}`);
  console.log(`   Subject: ${subject}`);

  // Send one email to all admin addresses (avoids rate limiting)
  return sendEmail({ to: adminEmails, subject, html });
}
