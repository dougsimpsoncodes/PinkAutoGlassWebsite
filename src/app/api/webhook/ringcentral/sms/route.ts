import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAdminSMS } from '@/lib/notifications/sms';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/webhook/ringcentral/sms
 *
 * Public endpoint (no admin auth) — receives inbound SMS events from RingCentral.
 *
 * Two modes:
 * 1. Validation handshake: RC sends Validation-Token header, we echo it back.
 * 2. SMS event: RC posts message data, we store it and notify admin.
 */
export async function POST(req: NextRequest) {
  // --- Validation handshake ---
  const validationToken = req.headers.get('validation-token');
  if (validationToken) {
    console.log('RC webhook validation handshake received');
    return new NextResponse('', {
      status: 200,
      headers: { 'Validation-Token': validationToken },
    });
  }

  // --- Inbound SMS event ---
  try {
    const payload = await req.json();

    // RC webhook body structure: { uuid, event, timestamp, body: { ... } }
    const messageBody = payload.body;
    if (!messageBody) {
      console.warn('RC webhook: no body in payload');
      return NextResponse.json({ ok: true });
    }

    // Only process inbound SMS
    if (messageBody.direction !== 'Inbound') {
      return NextResponse.json({ ok: true });
    }

    const messageId = String(messageBody.id);
    const conversationId = messageBody.conversationId
      ? String(messageBody.conversationId)
      : messageBody.conversation?.id
        ? String(messageBody.conversation.id)
        : null;

    const fromNumber = messageBody.from?.phoneNumber || messageBody.from?.extensionNumber || '';
    const fromName = messageBody.from?.name || null;
    const toNumber = messageBody.to?.[0]?.phoneNumber || '';
    const toName = messageBody.to?.[0]?.name || null;
    const messageText = messageBody.subject || '';
    const messageTime = messageBody.creationTime || messageBody.lastModifiedTime || new Date().toISOString();
    const messageStatus = messageBody.messageStatus || 'Received';
    const readStatus = messageBody.readStatus || 'Unread';

    const supabase = getSupabase();

    // Upsert — idempotent via message_id unique constraint
    const { error } = await supabase
      .from('ringcentral_sms')
      .upsert(
        {
          message_id: messageId,
          conversation_id: conversationId,
          message_time: messageTime,
          direction: 'Inbound',
          from_number: fromNumber,
          from_name: fromName,
          to_number: toNumber,
          to_name: toName,
          message_text: messageText,
          message_status: messageStatus,
          read_status: readStatus,
          raw_data: payload,
        },
        { onConflict: 'message_id' }
      );

    if (error) {
      console.error('Failed to store inbound SMS:', error.message);
    } else {
      console.log(`Stored inbound SMS ${messageId} from ${fromNumber}`);
    }

    // Forward to admin as an SMS notification
    const preview = messageText.length > 100 ? messageText.slice(0, 100) + '...' : messageText;
    const adminMsg = `Inbound SMS from ${fromNumber}: ${preview}`;
    sendAdminSMS(adminMsg).catch((err) =>
      console.error('Failed to forward inbound SMS to admin:', err)
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('RC webhook handler error:', err.message || err);
    // Always return 200 so RingCentral doesn't retry endlessly
    return NextResponse.json({ ok: true });
  }
}
