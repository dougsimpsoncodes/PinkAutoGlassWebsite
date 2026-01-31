import { createClient } from '@supabase/supabase-js';

const TIMEZONE = 'America/Denver';
const BUSINESS_OPEN_HOUR = 7;   // 7 AM MT
const BUSINESS_CLOSE_HOUR = 19; // 7 PM MT
const TCPA_QUIET_START = 21;    // 9 PM MT
const TCPA_QUIET_END = 8;       // 8 AM MT
const DRIP_SAFE_SEND_HOUR = 9;  // Rescheduled messages land at 9 AM MT

// Business days: Mon(1) through Sat(6), closed Sunday(0)
const BUSINESS_DAYS = new Set([1, 2, 3, 4, 5, 6]);

export interface DripContext {
  firstName: string;
  phone: string;           // E.164 format
  email?: string;          // Only available for booking leads
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  referenceNumber?: string; // Only for booking leads
  smsConsent: boolean;
}

interface ScheduledStep {
  delayHours: number;
  channel: 'sms' | 'email';
  templateKey: string;
  sequenceStep: number;
}

// --- Quick Quote: instant SMS only (sent inline in API route, no scheduled follow-ups) ---
const QUICK_QUOTE_STEPS: ScheduledStep[] = [];

// --- Booking: no scheduled follow-ups (handled by call center) ---
const BOOKING_STEPS: ScheduledStep[] = [];

// =============================================================================
// TIME UTILITIES
// =============================================================================

/** Get current Mountain Time date parts */
function getMountainTime(date: Date = new Date()): { hour: number; day: number; date: Date } {
  const mtString = date.toLocaleString('en-US', { timeZone: TIMEZONE });
  const mt = new Date(mtString);
  return {
    hour: mt.getHours(),
    day: mt.getDay(), // 0=Sun, 1=Mon, ...6=Sat
    date: mt,
  };
}

/** Check if current time is within business hours (Mon-Sat 7AM-7PM MT) */
export function isBusinessHours(date: Date = new Date()): boolean {
  const mt = getMountainTime(date);
  return BUSINESS_DAYS.has(mt.day) && mt.hour >= BUSINESS_OPEN_HOUR && mt.hour < BUSINESS_CLOSE_HOUR;
}

/** Check if current time is in TCPA quiet hours (9PM-8AM MT) */
export function isTCPAQuietHours(date: Date = new Date()): boolean {
  const mt = getMountainTime(date);
  return mt.hour >= TCPA_QUIET_START || mt.hour < TCPA_QUIET_END;
}

/**
 * Get the next safe time to send an SMS.
 * If the given time is during TCPA quiet hours or on Sunday,
 * returns the next business day at 9 AM MT.
 */
export function getNextSafeTime(date: Date): Date {
  const mt = getMountainTime(date);

  // If within allowed hours on a business day, return as-is
  if (!isTCPAQuietHours(date) && BUSINESS_DAYS.has(mt.day)) {
    return date;
  }

  // Find next valid day at 9 AM MT
  const result = new Date(date);

  // Move to next day if past quiet start (9 PM+)
  if (mt.hour >= TCPA_QUIET_START) {
    result.setDate(result.getDate() + 1);
  }

  // Skip forward until we hit a business day
  let attempts = 0;
  while (!BUSINESS_DAYS.has(getMountainTime(result).day) && attempts < 7) {
    result.setDate(result.getDate() + 1);
    attempts++;
  }

  // Build 9 AM MT on the target date using Intl to handle DST correctly.
  // Get the YYYY-MM-DD in MT, then construct a Date at 9 AM in that timezone.
  const dateStr = result.toLocaleDateString('en-CA', { timeZone: TIMEZONE }); // YYYY-MM-DD

  // Use a reference point at noon MT to determine the UTC offset for that date
  // (noon avoids edge cases around DST transitions at 2 AM)
  const refNoon = new Date(`${dateStr}T12:00:00Z`);
  const mtNoonStr = refNoon.toLocaleString('en-US', { timeZone: TIMEZONE });
  const mtNoon = new Date(mtNoonStr);
  const offsetMs = refNoon.getTime() - mtNoon.getTime();

  // 9 AM MT = 9:00 local + offset to UTC
  const target = new Date(`${dateStr}T${String(DRIP_SAFE_SEND_HOUR).padStart(2, '0')}:00:00Z`);
  return new Date(target.getTime() + offsetMs);
}

// =============================================================================
// SCHEDULING
// =============================================================================

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Schedule the full drip sequence for a lead.
 * Inserts rows into scheduled_messages for all future follow-up steps.
 */
export async function scheduleDripSequence(
  leadId: string,
  context: DripContext,
  type: 'quick_quote' | 'booking'
): Promise<{ scheduled: number; skipped: number }> {
  // No SMS consent = no drip for quick quotes (they're SMS-only)
  if (type === 'quick_quote' && !context.smsConsent) {
    console.log(`⏭️ Skipping quick_quote drip for lead ${leadId}: no SMS consent`);
    return { scheduled: 0, skipped: 0 };
  }

  const steps = type === 'quick_quote' ? QUICK_QUOTE_STEPS : BOOKING_STEPS;
  const sequenceName = type === 'quick_quote' ? 'quick_quote_drip' : 'booking_drip';
  const now = new Date();

  const rows = [];
  let skipped = 0;

  for (const step of steps) {
    // Skip SMS steps if no consent
    if (step.channel === 'sms' && !context.smsConsent) {
      skipped++;
      continue;
    }

    // Calculate raw scheduled time
    const rawTime = new Date(now.getTime() + step.delayHours * 60 * 60 * 1000);

    // For SMS: ensure TCPA compliance (no SMS 9PM-8AM MT, no Sunday)
    const scheduledFor = step.channel === 'sms' ? getNextSafeTime(rawTime) : rawTime;

    rows.push({
      lead_id: leadId,
      scheduled_for: scheduledFor.toISOString(),
      channel: step.channel,
      template_key: step.templateKey,
      sequence_name: sequenceName,
      sequence_step: step.sequenceStep,
      context: {
        firstName: context.firstName,
        phone: context.phone,
        email: context.email || null,
        vehicleYear: context.vehicleYear,
        vehicleMake: context.vehicleMake,
        vehicleModel: context.vehicleModel,
        referenceNumber: context.referenceNumber || null,
        smsConsent: context.smsConsent,
      },
    });
  }

  if (rows.length === 0) {
    return { scheduled: 0, skipped };
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.from('scheduled_messages').insert(rows);

  if (error) {
    console.error(`❌ Failed to schedule drip for lead ${leadId}:`, error.message);
    return { scheduled: 0, skipped };
  }

  console.log(`📅 Scheduled ${rows.length} drip messages for lead ${leadId} (${sequenceName})`);
  return { scheduled: rows.length, skipped };
}

/**
 * Cancel all pending drip messages for a phone number.
 * Used for dedup when a quick-quote lead later submits a booking.
 * Optionally exclude a specific lead (the new booking lead).
 */
export async function cancelDripForPhone(
  phoneE164: string,
  excludeLeadId?: string
): Promise<number> {
  const supabase = getSupabaseClient();

  // Find all pending messages for this phone number
  let query = supabase
    .from('scheduled_messages')
    .select('id, lead_id')
    .eq('status', 'pending')
    .eq('context->>phone', phoneE164);

  if (excludeLeadId) {
    query = query.neq('lead_id', excludeLeadId);
  }

  const { data: messages, error: fetchError } = await query;

  if (fetchError || !messages || messages.length === 0) {
    return 0;
  }

  const ids = messages.map(m => m.id);

  const { error: updateError } = await supabase
    .from('scheduled_messages')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_reason: 'dedup_booking_superseded',
    })
    .in('id', ids);

  if (updateError) {
    console.error(`❌ Failed to cancel drip for phone ${phoneE164}:`, updateError.message);
    return 0;
  }

  console.log(`🚫 Cancelled ${ids.length} pending drip messages for phone ${phoneE164} (dedup)`);
  return ids.length;
}
