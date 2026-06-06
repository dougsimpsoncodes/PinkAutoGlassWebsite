import { SMSOptions, sendSMS } from './sms';
import { isOptedOut } from '@/lib/sms-opt-out';

/**
 * Send customer-facing SMS through RingCentral.
 *
 * This wrapper keeps customer compliance checks in one place while delegating
 * delivery, capture mode, and redirect mode to the shared RingCentral helper.
 */
export async function sendCustomerSMS(options: SMSOptions): Promise<boolean> {
  if (!options.bypassOptOutCheck && options.to) {
    try {
      if (await isOptedOut(options.to)) {
        console.log(`🚫 SMS blocked: ${options.to} is opted out`);
        return false;
      }
    } catch (err) {
      // Fail-closed: if we can't verify opt-out status, block the send (TCPA safety).
      console.error('Opt-out check failed, blocking send for safety:', err);
      return false;
    }
  }

  return sendSMS(options);
}
