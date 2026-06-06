import { createClient } from '@supabase/supabase-js';

export type NotificationMode = 'live' | 'redirect' | 'capture';
export type NotificationChannel = 'email' | 'sms';

interface CaptureInput {
  channel: NotificationChannel;
  originalTo: string | string[];
  redirectedTo?: string | string[] | null;
  subject?: string | null;
  body: string;
  provider?: string;
  metadata?: Record<string, unknown>;
}

interface EmailDeliveryInput {
  to: string | string[];
  subject: string;
  html: string;
  provider?: string;
  metadata?: Record<string, unknown>;
}

interface SmsDeliveryInput {
  to: string;
  message: string;
  provider?: string;
  metadata?: Record<string, unknown>;
}

export interface EmailDeliveryDecision {
  shouldSend: boolean;
  accepted: boolean;
  to: string | string[];
  subject: string;
  html: string;
}

export interface SmsDeliveryDecision {
  shouldSend: boolean;
  accepted: boolean;
  to: string;
  message: string;
}

export function getNotificationMode(): NotificationMode {
  const raw = (process.env.NOTIFICATION_MODE || 'live').trim().toLowerCase();
  if (raw === 'capture' || raw === 'redirect' || raw === 'live') return raw;
  console.warn(`Invalid NOTIFICATION_MODE=${raw}; using capture for safety.`);
  return 'capture';
}

export async function prepareEmailDelivery(input: EmailDeliveryInput): Promise<EmailDeliveryDecision> {
  const mode = getNotificationMode();
  if (mode === 'live') {
    return { shouldSend: true, accepted: true, to: input.to, subject: input.subject, html: input.html };
  }

  if (mode === 'capture') {
    await captureNotification({
      channel: 'email',
      originalTo: input.to,
      subject: input.subject,
      body: input.html,
      provider: input.provider,
      metadata: input.metadata,
    });
    return { shouldSend: false, accepted: true, to: input.to, subject: input.subject, html: input.html };
  }

  const redirectTo = splitList(process.env.NOTIFICATION_REDIRECT_EMAIL);
  if (redirectTo.length === 0) {
    await captureNotification({
      channel: 'email',
      originalTo: input.to,
      subject: input.subject,
      body: input.html,
      provider: input.provider,
      metadata: { ...input.metadata, redirect_missing: true },
    });
    return { shouldSend: false, accepted: true, to: input.to, subject: input.subject, html: input.html };
  }

  const original = formatRecipientList(input.to);
  const redirectedHtml = `
    <div style="border:2px solid #f59e0b;background:#fffbeb;color:#78350f;padding:12px;margin:0 0 16px 0;font-family:Arial,sans-serif;font-size:14px;">
      <strong>Notification redirect mode.</strong><br>
      Original recipient: ${escapeHtml(original)}
    </div>
    ${input.html}
  `;

  await captureNotification({
    channel: 'email',
    originalTo: input.to,
    redirectedTo: redirectTo,
    subject: input.subject,
    body: input.html,
    provider: input.provider,
    metadata: { ...input.metadata, redirected: true },
  });

  return {
    shouldSend: true,
    accepted: true,
    to: redirectTo,
    subject: `[Redirected] ${input.subject}`,
    html: redirectedHtml,
  };
}

export async function prepareSmsDelivery(input: SmsDeliveryInput): Promise<SmsDeliveryDecision> {
  const mode = getNotificationMode();
  if (mode === 'live') {
    return { shouldSend: true, accepted: true, to: input.to, message: input.message };
  }

  if (mode === 'capture') {
    await captureNotification({
      channel: 'sms',
      originalTo: input.to,
      body: input.message,
      provider: input.provider,
      metadata: input.metadata,
    });
    return { shouldSend: false, accepted: true, to: input.to, message: input.message };
  }

  const redirectTo = (process.env.NOTIFICATION_REDIRECT_PHONE || '').trim();
  if (!redirectTo) {
    await captureNotification({
      channel: 'sms',
      originalTo: input.to,
      body: input.message,
      provider: input.provider,
      metadata: { ...input.metadata, redirect_missing: true },
    });
    return { shouldSend: false, accepted: true, to: input.to, message: input.message };
  }

  await captureNotification({
    channel: 'sms',
    originalTo: input.to,
    redirectedTo: redirectTo,
    body: input.message,
    provider: input.provider,
    metadata: { ...input.metadata, redirected: true },
  });

  return {
    shouldSend: true,
    accepted: true,
    to: redirectTo,
    message: `REDIRECTED from ${input.to}: ${input.message}`,
  };
}

async function captureNotification(input: CaptureInput): Promise<void> {
  const row = {
    mode: getNotificationMode(),
    channel: input.channel,
    original_to: input.originalTo,
    redirected_to: input.redirectedTo ?? null,
    subject: input.subject ?? null,
    body: input.body,
    provider: input.provider ?? null,
    metadata: input.metadata ?? {},
  };

  console.log('[notification-capture]', JSON.stringify({
    mode: row.mode,
    channel: row.channel,
    original_to: row.original_to,
    redirected_to: row.redirected_to,
    subject: row.subject,
    provider: row.provider,
  }));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return;

  try {
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await admin.from('notification_captures').insert(row);
    if (error) {
      console.warn('[notification-capture] database insert skipped:', error.message);
    }
  } catch (error) {
    console.warn('[notification-capture] database insert failed:', error instanceof Error ? error.message : error);
  }
}

function splitList(value?: string): string[] {
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatRecipientList(value: string | string[]): string {
  return Array.isArray(value) ? value.join(', ') : value;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
