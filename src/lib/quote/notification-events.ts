import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

export type AutoQuoteNotificationEventType = 'quote_ready' | 'quote_unbooked_5m' | 'appointment_booked';
export type AutoQuoteNotificationEventStatus = 'pending' | 'processing' | 'sent' | 'partial' | 'failed' | 'skipped';
export type ChannelStatus = 'sent' | 'skipped' | 'failed';

export interface NotificationEventClaim {
  claimed: boolean;
  eventId?: string;
  reason?: string;
  priorChannels?: NotificationEventChannelStatuses;
}

export interface NotificationEventChannelStatuses {
  customerEmail?: ChannelStatus;
  customerSms?: ChannelStatus;
  teamEmail?: ChannelStatus;
  teamSms?: ChannelStatus;
}

export function getQuoteNotificationAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function claimQuoteNotificationEvent(input: {
  quoteId: string;
  eventType: AutoQuoteNotificationEventType;
  metadata?: Record<string, unknown>;
  admin?: SupabaseClient | null;
  staleProcessingMs?: number;
}): Promise<NotificationEventClaim> {
  const admin = input.admin ?? getQuoteNotificationAdminClient();
  if (!admin) return { claimed: false, reason: 'supabase_not_configured' };

  const insertRow = {
    quote_id: input.quoteId,
    event_type: input.eventType,
    status: 'processing' as const,
    attempt_count: 1,
    claimed_at: new Date().toISOString(),
    metadata: input.metadata ?? {},
  };

  const { data: inserted, error: insertError } = await admin
    .from('automated_quote_notification_events')
    .insert(insertRow)
    .select('id')
    .single<{ id: string }>();

  if (!insertError && inserted?.id) {
    return { claimed: true, eventId: inserted.id };
  }

  if ((insertError as { code?: string } | null)?.code !== '23505') {
    return { claimed: false, reason: insertError?.message ?? 'insert_failed' };
  }

  const { data: existing, error: selectError } = await admin
    .from('automated_quote_notification_events')
    .select('id, status, attempt_count, customer_email_status, customer_sms_status, team_email_status, team_sms_status')
    .eq('quote_id', input.quoteId)
    .eq('event_type', input.eventType)
    .single<{
      id: string;
      status: AutoQuoteNotificationEventStatus;
      attempt_count: number | null;
      customer_email_status: ChannelStatus | null;
      customer_sms_status: ChannelStatus | null;
      team_email_status: ChannelStatus | null;
      team_sms_status: ChannelStatus | null;
    }>();

  if (selectError || !existing) {
    return { claimed: false, reason: selectError?.message ?? 'existing_event_lookup_failed' };
  }

  if (existing.status === 'sent' || existing.status === 'skipped') {
    return { claimed: false, reason: `already_${existing.status}` };
  }

  if (existing.status === 'processing') {
    const staleCutoff = new Date(Date.now() - (input.staleProcessingMs ?? 10 * 60 * 1000)).toISOString();
    const { data: reclaimed, error: reclaimError } = await admin
      .from('automated_quote_notification_events')
      .update({
        status: 'processing',
        claimed_at: new Date().toISOString(),
        attempt_count: (existing.attempt_count ?? 0) + 1,
        last_error: null,
        metadata: input.metadata ?? {},
      })
      .eq('id', existing.id)
      .eq('status', 'processing')
      .lt('claimed_at', staleCutoff)
      .select('id')
      .maybeSingle<{ id: string }>();

    if (reclaimError || !reclaimed?.id) {
      return { claimed: false, reason: reclaimError?.message ?? 'already_processing' };
    }

    return { claimed: true, eventId: reclaimed.id, priorChannels: rowToChannelStatuses(existing) };
  }

  const { data: updated, error: updateError } = await admin
    .from('automated_quote_notification_events')
    .update({
      status: 'processing',
      claimed_at: new Date().toISOString(),
      attempt_count: (existing.attempt_count ?? 0) + 1,
      last_error: null,
      metadata: input.metadata ?? {},
    })
    .eq('id', existing.id)
    .in('status', ['pending', 'failed', 'partial'])
    .select('id')
    .maybeSingle<{ id: string }>();

  if (updateError || !updated?.id) {
    return { claimed: false, reason: updateError?.message ?? 'claim_lost' };
  }

  return { claimed: true, eventId: updated.id, priorChannels: rowToChannelStatuses(existing) };
}

export async function scheduleQuoteNotificationEvent(input: {
  quoteId: string;
  eventType: AutoQuoteNotificationEventType;
  metadata?: Record<string, unknown>;
  admin?: SupabaseClient | null;
}): Promise<void> {
  const admin = input.admin ?? getQuoteNotificationAdminClient();
  if (!admin) return;

  const { error } = await admin
    .from('automated_quote_notification_events')
    .insert({
      quote_id: input.quoteId,
      event_type: input.eventType,
      status: 'pending',
      attempt_count: 0,
      metadata: input.metadata ?? {},
    });

  if (error && (error as { code?: string }).code !== '23505') {
    console.error('[quote-notification-event] schedule failed:', error.message);
  }
}

export async function completeQuoteNotificationEvent(input: {
  eventId: string;
  status: AutoQuoteNotificationEventStatus;
  channels?: NotificationEventChannelStatuses;
  error?: string | null;
  metadata?: Record<string, unknown>;
  admin?: SupabaseClient | null;
}): Promise<void> {
  const admin = input.admin ?? getQuoteNotificationAdminClient();
  if (!admin) return;

  const update = {
    status: input.status,
    customer_email_status: input.channels?.customerEmail ?? null,
    customer_sms_status: input.channels?.customerSms ?? null,
    team_email_status: input.channels?.teamEmail ?? null,
    team_sms_status: input.channels?.teamSms ?? null,
    first_error: input.error ? input.error.slice(0, 500) : null,
    last_error: input.error ? input.error.slice(0, 500) : null,
    sent_at: input.status === 'sent' || input.status === 'partial' ? new Date().toISOString() : null,
    ...(input.metadata ? { metadata: input.metadata } : {}),
  };

  const { error } = await admin
    .from('automated_quote_notification_events')
    .update(update)
    .eq('id', input.eventId);

  if (error) {
    console.error('[quote-notification-event] completion failed:', error.message);
  }
}

export function combineEventStatus(statuses: NotificationEventChannelStatuses): AutoQuoteNotificationEventStatus {
  const values = Object.values(statuses).filter(Boolean) as ChannelStatus[];
  if (values.length === 0) return 'skipped';
  if (values.some((value) => value === 'failed')) return 'failed';
  if (values.some((value) => value === 'sent')) return 'sent';
  return 'skipped';
}

export function boolToChannelStatus(ok: boolean): ChannelStatus {
  return ok ? 'sent' : 'failed';
}

export function shouldSendNotificationChannel(
  priorChannels: NotificationEventChannelStatuses | undefined,
  channel: keyof NotificationEventChannelStatuses
): boolean {
  return priorChannels?.[channel] !== 'sent';
}

function rowToChannelStatuses(row: {
  customer_email_status: ChannelStatus | null;
  customer_sms_status: ChannelStatus | null;
  team_email_status: ChannelStatus | null;
  team_sms_status: ChannelStatus | null;
}): NotificationEventChannelStatuses {
  return {
    customerEmail: row.customer_email_status ?? undefined,
    customerSms: row.customer_sms_status ?? undefined,
    teamEmail: row.team_email_status ?? undefined,
    teamSms: row.team_sms_status ?? undefined,
  };
}
