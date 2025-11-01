import { SDK } from '@ringcentral/sdk';

// Initialize RingCentral SDK
let rcClient: SDK | null = null;
let isAuthenticated = false;

async function getRingCentralClient() {
  if (!rcClient) {
    const clientId = process.env.RINGCENTRAL_CLIENT_ID;
    const clientSecret = process.env.RINGCENTRAL_CLIENT_SECRET;
    const jwtToken = process.env.RINGCENTRAL_JWT_TOKEN;
    const serverUrl = process.env.RINGCENTRAL_SERVER_URL || 'https://platform.ringcentral.com';

    if (!clientId || !clientSecret || !jwtToken) {
      console.error('RingCentral credentials not configured');
      return null;
    }

    rcClient = new SDK({
      server: serverUrl,
      clientId: clientId,
      clientSecret: clientSecret,
    });

    try {
      // Authenticate using JWT (using platform().login() as recommended)
      await rcClient.platform().login({ jwt: jwtToken });
      isAuthenticated = true;
      console.log('✅ RingCentral authenticated successfully');
    } catch (error: any) {
      console.error('❌ RingCentral authentication failed:', error.message);
      return null;
    }
  }

  if (!isAuthenticated && rcClient) {
    try {
      const jwtToken = process.env.RINGCENTRAL_JWT_TOKEN;
      await rcClient.platform().login({ jwt: jwtToken });
      isAuthenticated = true;
    } catch (error: any) {
      console.error('❌ RingCentral re-authentication failed:', error.message);
      return null;
    }
  }

  return rcClient;
}

export interface SMSOptions {
  to: string;
  message: string;
}

/**
 * Send an SMS using RingCentral
 */
export async function sendSMS(options: SMSOptions): Promise<boolean> {
  try {
    const client = await getRingCentralClient();

    if (!client) {
      console.error('RingCentral not configured');
      return false;
    }

    const fromNumber = process.env.RINGCENTRAL_PHONE_NUMBER;
    if (!fromNumber) {
      console.error('RingCentral phone number not configured');
      return false;
    }

    // Send SMS using RingCentral API
    const platform = client.platform();
    const response = await platform.post('/restapi/v1.0/account/~/extension/~/sms', {
      from: { phoneNumber: fromNumber },
      to: [{ phoneNumber: options.to }],
      text: options.message,
    });

    const result = await response.json();
    console.log(`✅ SMS sent to ${options.to} via RingCentral: ${result.id}`);
    return true;
  } catch (error: any) {
    console.error('❌ SMS send error:', error.message || error);
    if (error.response) {
      const errorBody = await error.response.json();
      console.error('❌ RingCentral API error:', errorBody);
    }
    return false;
  }
}

/**
 * Send SMS to admin team
 * Supports multiple comma-separated phone numbers
 */
export async function sendAdminSMS(message: string): Promise<boolean> {
  const adminPhonesStr = process.env.ADMIN_PHONE;

  if (!adminPhonesStr) {
    console.warn('Admin phone number not configured - skipping SMS');
    return false;
  }

  // Split multiple phone numbers and send to each
  const adminPhones = adminPhonesStr.split(',').map(phone => phone.trim());

  try {
    const results = await Promise.all(
      adminPhones.map(phone =>
        sendSMS({ to: phone, message }).catch(err => {
          console.error(`Failed to send SMS to ${phone}:`, err);
          return false;
        })
      )
    );

    const successCount = results.filter(r => r).length;
    console.log(`✅ Sent admin SMS to ${successCount}/${adminPhones.length} recipients`);

    return successCount > 0;
  } catch (error: any) {
    console.error('❌ Admin SMS batch error:', error.message);
    return false;
  }
}
