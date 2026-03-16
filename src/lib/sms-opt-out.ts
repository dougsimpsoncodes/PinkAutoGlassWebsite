import { createClient } from '@supabase/supabase-js';

// CTIA-standard opt-out and opt-in keywords (case-insensitive, exact match after normalization)
const OPT_OUT_KEYWORDS = new Set(['stop', 'stopall', 'unsubscribe', 'cancel', 'end', 'quit']);
const OPT_IN_KEYWORDS = new Set(['start', 'unstop', 'subscribe']);
const HELP_KEYWORDS = new Set(['help', 'info']);

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Normalize and classify an inbound SMS message.
 * Strips whitespace and punctuation, then checks for exact keyword match.
 */
export function classifyMessage(text: string): 'opt_out' | 'opt_in' | 'help' | 'normal' {
  // Strip to alphanumeric only, lowercase
  const normalized = text.trim().replace(/[^a-zA-Z]/g, '').toLowerCase();
  if (OPT_OUT_KEYWORDS.has(normalized)) return 'opt_out';
  if (OPT_IN_KEYWORDS.has(normalized)) return 'opt_in';
  if (HELP_KEYWORDS.has(normalized)) return 'help';
  return 'normal';
}

/**
 * Check if a phone number is opted out of SMS.
 * Returns true if opted out, false otherwise.
 */
export async function isOptedOut(phoneE164: string): Promise<boolean> {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('sms_opt_outs')
    .select('is_opted_out')
    .eq('phone_e164', phoneE164)
    .maybeSingle();

  return data?.is_opted_out === true;
}

/**
 * Record an opt-out for a phone number.
 * Idempotent — upserts so repeated STOP messages are safe.
 * Also cancels all pending scheduled messages for this phone.
 */
export async function recordOptOut(phoneE164: string, source = 'sms'): Promise<boolean> {
  const supabase = getServiceClient();

  // Check current state to detect transition (for confirmation dedup)
  const wasOptedOut = await isOptedOut(phoneE164);

  // Upsert opt-out record
  const { error: upsertError } = await supabase
    .from('sms_opt_outs')
    .upsert(
      {
        phone_e164: phoneE164,
        is_opted_out: true,
        opted_out_at: new Date().toISOString(),
        source,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'phone_e164' }
    );

  if (upsertError) {
    console.error(`❌ Failed to record opt-out for ${phoneE164}:`, upsertError.message);
    throw new Error(`Opt-out recording failed: ${upsertError.message}`);
  }

  // Cancel all pending scheduled SMS for this phone
  const { data: pending } = await supabase
    .from('scheduled_messages')
    .select('id')
    .eq('status', 'pending')
    .eq('channel', 'sms')
    .filter('context->>phone', 'eq', phoneE164);

  if (pending && pending.length > 0) {
    const ids = pending.map((m: { id: string }) => m.id);
    await supabase
      .from('scheduled_messages')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_reason: 'sms_opt_out',
      })
      .in('id', ids);

    console.log(`🚫 Cancelled ${ids.length} pending SMS for opted-out phone ${phoneE164}`);
  }

  return !wasOptedOut; // true = state changed (was not opted out before)
}

/**
 * Record an opt-in for a phone number.
 * Idempotent — upserts so repeated START messages are safe.
 */
export async function recordOptIn(phoneE164: string): Promise<boolean> {
  const supabase = getServiceClient();

  // Check current state to detect transition (for confirmation dedup)
  const wasOptedOut = await isOptedOut(phoneE164);

  const { error: upsertError } = await supabase
    .from('sms_opt_outs')
    .upsert(
      {
        phone_e164: phoneE164,
        is_opted_out: false,
        opted_in_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'phone_e164' }
    );

  if (upsertError) {
    console.error(`❌ Failed to record opt-in for ${phoneE164}:`, upsertError.message);
    throw new Error(`Opt-in recording failed: ${upsertError.message}`);
  }

  return wasOptedOut; // true = state changed (was opted out, now opted in)
}

// Confirmation messages per CTIA best practices
export const OPT_OUT_CONFIRMATION =
  'PINK AUTO GLASS: You have been unsubscribed and will no longer receive text messages from us. Reply START to re-subscribe.';

export const OPT_IN_CONFIRMATION =
  'PINK AUTO GLASS: You have been re-subscribed to text messages. Reply STOP to unsubscribe at any time.';

export const HELP_RESPONSE =
  'PINK AUTO GLASS: For service, call (719) 299-0066 or visit pinkautoglass.com. Reply STOP to unsubscribe. Msg&data rates may apply.';
