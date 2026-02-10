import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { sendSMS } from '@/lib/notifications/sms';
import { sendEmail } from '@/lib/notifications/email';
import { renderTemplate } from './templates';
import { isTCPAQuietHours, getNextSafeTime } from './scheduler';
import { isExcludedPhone } from '@/lib/constants';

const BATCH_SIZE = 50;
const RETRY_BACKOFF_MINUTES = 15;

interface ScheduledMessage {
  id: string;
  lead_id: string;
  scheduled_for: string;
  channel: 'sms' | 'email';
  template_key: string;
  sequence_name: string;
  sequence_step: number;
  context: {
    firstName: string;
    phone: string;
    email?: string | null;
    vehicleYear: number;
    vehicleMake: string;
    vehicleModel: string;
    referenceNumber?: string | null;
    smsConsent: boolean;
  };
  status: string;
  retry_count: number;
  max_retries: number;
}

export interface ProcessingResult {
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
  rescheduled: number;
  errors: string[];
}

function getServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Process all pending scheduled messages that are due.
 * Called by the /api/cron/process-drip endpoint every 5 minutes.
 */
export async function processScheduledMessages(): Promise<ProcessingResult> {
  const supabase = getServiceClient();
  const result: ProcessingResult = {
    processed: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    rescheduled: 0,
    errors: [],
  };

  // Fetch pending messages where scheduled_for <= now
  const { data: messages, error: fetchError } = await supabase
    .from('scheduled_messages')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .order('scheduled_for', { ascending: true })
    .limit(BATCH_SIZE);

  if (fetchError) {
    result.errors.push(`Fetch error: ${fetchError.message}`);
    return result;
  }

  if (!messages || messages.length === 0) {
    return result;
  }

  console.log(`📬 Processing ${messages.length} scheduled drip messages`);

  for (const msg of messages as ScheduledMessage[]) {
    result.processed++;

    try {
      // Verify lead still exists (but don't filter by status — send to all leads)
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('id')
        .eq('id', msg.lead_id)
        .single();

      if (leadError || !lead) {
        await markSkipped(supabase, msg.id, 'lead_not_found');
        result.skipped++;
        continue;
      }

      // Skip messages to team members (defense-in-depth)
      if (isExcludedPhone(msg.context.phone)) {
        await markSkipped(supabase, msg.id, 'excluded_team_member');
        result.skipped++;
        continue;
      }

      // Re-check SMS consent for SMS channel
      if (msg.channel === 'sms' && !msg.context.smsConsent) {
        await markSkipped(supabase, msg.id, 'no_sms_consent');
        result.skipped++;
        continue;
      }

      // TCPA check: if SMS is somehow due during quiet hours, reschedule
      if (msg.channel === 'sms' && isTCPAQuietHours()) {
        const nextSafe = getNextSafeTime(new Date());
        await reschedule(supabase, msg.id, nextSafe);
        result.rescheduled++;
        continue;
      }

      // Render the template
      const rendered = renderTemplate(msg.template_key, msg.context);
      if (!rendered) {
        await markFailed(supabase, msg.id, `Unknown template: ${msg.template_key}`);
        result.failed++;
        result.errors.push(`Unknown template: ${msg.template_key} for message ${msg.id}`);
        continue;
      }

      // Send the message
      let success = false;
      if (msg.channel === 'sms') {
        success = await sendSMS({ to: msg.context.phone, message: rendered.body });
      } else if (msg.channel === 'email') {
        if (!msg.context.email) {
          await markSkipped(supabase, msg.id, 'no_email_address');
          result.skipped++;
          continue;
        }
        success = await sendEmail({
          to: msg.context.email,
          subject: rendered.subject || 'Pink Auto Glass',
          html: rendered.body,
        });
      }

      if (success) {
        await markSent(supabase, msg.id);
        await logActivity(supabase, msg);
        result.sent++;
        console.log(`✅ Drip ${msg.channel} sent: ${msg.template_key} for lead ${msg.lead_id}`);
      } else {
        // Handle retry logic
        if (msg.retry_count < msg.max_retries) {
          const retryAt = new Date(Date.now() + RETRY_BACKOFF_MINUTES * 60 * 1000 * (msg.retry_count + 1));
          await retryLater(supabase, msg.id, msg.retry_count + 1, retryAt);
          result.failed++;
          console.warn(`⚠️ Drip ${msg.channel} failed, retry ${msg.retry_count + 1}/${msg.max_retries}: ${msg.template_key}`);
        } else {
          await markFailed(supabase, msg.id, `Max retries (${msg.max_retries}) exceeded`);
          result.failed++;
          result.errors.push(`Max retries exceeded for message ${msg.id} (${msg.template_key})`);
        }
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      await markFailed(supabase, msg.id, errMsg);
      result.failed++;
      result.errors.push(`Exception processing ${msg.id}: ${errMsg}`);
    }
  }

  console.log(`📊 Drip processing complete: ${result.sent} sent, ${result.failed} failed, ${result.skipped} skipped, ${result.rescheduled} rescheduled`);
  return result;
}

// =============================================================================
// STATUS UPDATE HELPERS
// =============================================================================

async function markSent(supabase: SupabaseClient, id: string) {
  await supabase
    .from('scheduled_messages')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', id);
}

async function markSkipped(supabase: SupabaseClient, id: string, reason: string) {
  await supabase
    .from('scheduled_messages')
    .update({ status: 'skipped', failure_reason: reason })
    .eq('id', id);
}

async function markFailed(supabase: SupabaseClient, id: string, reason: string) {
  await supabase
    .from('scheduled_messages')
    .update({ status: 'failed', failure_reason: reason })
    .eq('id', id);
}

async function retryLater(supabase: SupabaseClient, id: string, retryCount: number, retryAt: Date) {
  await supabase
    .from('scheduled_messages')
    .update({ retry_count: retryCount, scheduled_for: retryAt.toISOString() })
    .eq('id', id);
}

async function reschedule(supabase: SupabaseClient, id: string, newTime: Date) {
  await supabase
    .from('scheduled_messages')
    .update({ scheduled_for: newTime.toISOString() })
    .eq('id', id);
}

/**
 * Log the sent message to lead_activities (if the table exists).
 * Fire-and-forget — never blocks the main processing loop.
 */
async function logActivity(supabase: SupabaseClient, msg: ScheduledMessage) {
  try {
    await supabase.from('lead_activities').insert({
      lead_id: msg.lead_id,
      activity_type: `${msg.channel}_sent`,
      description: `Drip ${msg.sequence_name} step ${msg.sequence_step} (${msg.template_key})`,
      metadata: {
        channel: msg.channel,
        template_key: msg.template_key,
        sequence_name: msg.sequence_name,
        sequence_step: msg.sequence_step,
        scheduled_message_id: msg.id,
      },
      created_by: 'system:drip',
    });
  } catch {
    // lead_activities table may not exist — that's OK
  }
}
