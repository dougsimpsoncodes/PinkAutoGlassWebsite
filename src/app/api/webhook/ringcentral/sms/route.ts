import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendCustomerSMS } from '@/lib/notifications/beetexting';
import { BUSINESS_PHONE_NUMBER, isCustomerSmsEnabled } from '@/lib/constants';
import {
  classifyMessage,
  recordOptOut,
  recordOptIn,
  isOptedOut,
  OPT_OUT_CONFIRMATION,
  OPT_IN_CONFIRMATION,
  HELP_RESPONSE,
} from '@/lib/sms-opt-out';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const AUTO_REPLY_MESSAGE =
  'Thanks for texting Pink Auto Glass where a portion of every sale goes to breast cancer research. Someone will get back to you quickly.';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/webhook/ringcentral/sms
 *
 * Receives inbound SMS events from RingCentral.
 * Authenticated via ?auth_token=<RINGCENTRAL_WEBHOOK_TOKEN> in the subscribed URL.
 * RC's per-event Validation-Token header is unreliable for SMS subscriptions (known RC issue),
 * so URL secret is used as the primary auth mechanism per RC's own sample URLs.
 *
 * Two modes:
 * 1. Validation handshake: RC sends Validation-Token header with empty body — echo it back.
 * 2. SMS event: verify URL secret, then store message and process.
 */
export async function POST(req: NextRequest) {
  // --- URL secret authentication (before any JSON parsing or DB writes) ---
  const webhookSecret = process.env.RINGCENTRAL_WEBHOOK_TOKEN;
  const incomingToken = req.headers.get('validation-token');

  if (!webhookSecret) {
    console.error('RC webhook: RINGCENTRAL_WEBHOOK_TOKEN not configured');
    return new NextResponse('Not found', { status: 404 });
  }

  // Validation handshake: RC sends Validation-Token header to verify the endpoint is live.
  // Echo it back — no URL secret check needed here as it happens before subscription is active.
  if (incomingToken) {
    console.log('RC webhook validation handshake received');
    return new NextResponse('', {
      status: 200,
      headers: { 'Validation-Token': incomingToken },
    });
  }

  // All real events must arrive at the URL containing our secret.
  const urlSecret = req.nextUrl.searchParams.get('auth_token');
  if (urlSecret !== webhookSecret) {
    console.warn('RC webhook: rejected — missing or invalid auth_token');
    return new NextResponse('Not found', { status: 404 });
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

    // Log all webhook events for debugging direction/routing issues
    console.log(`RC webhook: direction=${messageBody.direction} from=${fromNumber} to=${toNumber} id=${messageId}`);

    // Only process inbound SMS
    if (messageBody.direction !== 'Inbound') {
      return NextResponse.json({ ok: true });
    }

    // Skip messages from our own number — prevents recursive forwarding loops.
    // sendAdminSMS() sends FROM the business number to admin extensions, which
    // RingCentral delivers as "Inbound" on the receiving end, re-triggering this webhook.
    if (fromNumber === BUSINESS_PHONE_NUMBER) {
      return NextResponse.json({ ok: true });
    }

    // Only process messages sent TO our business number.
    // When team members send outbound SMS through RingCentral, the webhook can
    // fire with direction='Inbound' (account-level subscription). Checking the
    // destination ensures we only auto-reply to actual customer-to-business messages.
    if (toNumber && toNumber !== BUSINESS_PHONE_NUMBER) {
      console.log(`Skipping SMS not addressed to business number: to=${toNumber}`);
      return NextResponse.json({ ok: true });
    }

    // Skip messages from team members — prevents auto-reply to internal messages.
    // Team members can text from: personal phones (EXCLUDED_DRIP_PHONES), RC extensions
    // (TEAM_RC_NUMBERS), or the business number (caught above). The RC account-level
    // webhook fires for ALL extensions, so Dan texting from his extension (+17196531406)
    // appears as direction='Inbound' to the business number's message store.
    const teamNumbers = [
      ...(process.env.ADMIN_PHONE || '').split(','),
      ...(process.env.TEAM_RC_NUMBERS || '').split(','),
      ...(process.env.EXCLUDED_DRIP_PHONES || '').split(','),
    ].map(p => p.trim()).filter(Boolean);
    if (teamNumbers.includes(fromNumber)) {
      console.log(`Skipping SMS from team member: ${fromNumber}`);
      return NextResponse.json({ ok: true });
    }

    const supabase = getSupabase();

    // ── STOP/START keyword detection (before any other processing) ────
    const messageClass = classifyMessage(messageText);

    if (messageClass === 'help') {
      // CTIA requires responding to HELP with business info
      await sendCustomerSMS({
        to: fromNumber,
        message: HELP_RESPONSE,
        bypassOptOutCheck: true,
      });
      console.log(`ℹ️ HELP response sent to ${fromNumber}`);
      return NextResponse.json({ ok: true });
    }

    if (messageClass === 'opt_out' || messageClass === 'opt_in') {
      // Store the command message for audit trail (idempotent via message_id)
      await supabase.from('ringcentral_sms').upsert(
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

      if (messageClass === 'opt_out') {
        const stateChanged = await recordOptOut(fromNumber);
        // Only send confirmation on actual state transition (prevents replay duplication)
        if (stateChanged) {
          await sendCustomerSMS({
            to: fromNumber,
            message: OPT_OUT_CONFIRMATION,
            bypassOptOutCheck: true,
          });
        }
        console.log(`🛑 SMS opt-out processed for ${fromNumber} (transition=${stateChanged})`);
      } else {
        const stateChanged = await recordOptIn(fromNumber);
        if (stateChanged) {
          await sendCustomerSMS({
            to: fromNumber,
            message: OPT_IN_CONFIRMATION,
            bypassOptOutCheck: true,
          });
        }
        console.log(`✅ SMS opt-in processed for ${fromNumber} (transition=${stateChanged})`);
      }

      return NextResponse.json({ ok: true });
    }

    // ── Check if sender is opted out (non-command message) ────
    // Store message and create/update lead, but skip auto-reply
    let senderOptedOut = false;
    if (fromNumber) {
      try {
        senderOptedOut = await isOptedOut(fromNumber);
      } catch {
        // Non-fatal — default to not opted out
      }
    }

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

    // --- Create or update lead from inbound SMS ---
    if (fromNumber) {
      try {
        const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

        // Check for ANY existing lead from this phone in last 72h (web form, booking, or SMS)
        const { data: existingLead } = await supabase
          .from('leads')
          .select('id, notes')
          .eq('phone_e164', fromNumber)
          .gte('created_at', seventyTwoHoursAgo)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (existingLead) {
          // Append new message to existing lead's notes
          const updatedNotes = existingLead.notes
            ? `${existingLead.notes}\n---\n${messageText}`
            : messageText;
          await supabase
            .from('leads')
            .update({ notes: updatedNotes })
            .eq('id', existingLead.id);
          console.log(`Appended SMS to existing lead ${existingLead.id}`);
        } else {
          // Insert new lead
          const { error: leadError } = await supabase
            .from('leads')
            .insert({
              phone_e164: fromNumber,
              first_contact_method: 'sms',
              status: 'new',
              notes: messageText,
            });
          if (leadError) {
            console.error('Failed to create SMS lead:', leadError.message);
          } else {
            console.log(`Created new SMS lead for ${fromNumber}`);
          }
        }
      } catch (leadErr: any) {
        // Non-fatal — SMS is already stored, lead creation is best-effort
        console.error('Lead creation from SMS failed:', leadErr.message || leadErr);
      }
    }


    // Auto-reply: one greeting per phone number per calendar day (UTC).
    // Uses a deterministic message_id so the DB unique constraint prevents double-sends
    // even under concurrent webhook retries — insert succeeds only once per day.
    // Skip auto-reply for opted-out numbers.
    if (fromNumber && isCustomerSmsEnabled() && !senderOptedOut) {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
      const autoReplyMsgId = `auto-reply-${fromNumber}-${today}`;
      const fromNum = process.env.RINGCENTRAL_PHONE_NUMBER || '';

      // Attempt to reserve the slot — if already exists (23505), skip sending.
      const { error: reserveErr } = await supabase
        .from('ringcentral_sms')
        .insert({
          message_id: autoReplyMsgId,
          conversation_id: conversationId,
          message_time: new Date().toISOString(),
          direction: 'Outbound',
          from_number: fromNum,
          to_number: fromNumber,
          message_text: AUTO_REPLY_MESSAGE,
          message_status: 'Queued',
          read_status: 'Read',
        });

      if (!reserveErr) {
        // Slot reserved — send the auto-reply
        sendCustomerSMS({ to: fromNumber, message: AUTO_REPLY_MESSAGE })
          .then((sent) => {
            if (sent) {
              console.log(`Auto-reply sent to ${fromNumber}`);
              supabase
                .from('ringcentral_sms')
                .update({ message_status: 'Sent' })
                .eq('message_id', autoReplyMsgId)
                .then(({ error: updateErr }) => {
                  if (updateErr) console.error('Failed to update auto-reply status:', updateErr.message);
                });
            }
          })
          .catch((err) => console.error('Auto-reply failed:', err));
      } else if (reserveErr.code === '23505') {
        console.log(`Auto-reply already sent to ${fromNumber} today, skipping`);
      } else {
        console.error('Failed to reserve auto-reply slot:', reserveErr.message);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('RC webhook handler error:', err.message || err);
    // Always return 200 so RingCentral doesn't retry endlessly
    return NextResponse.json({ ok: true });
  }
}
