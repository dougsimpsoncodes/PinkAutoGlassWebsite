import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRingCentralClient } from '@/lib/notifications/sms';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/admin/sms/send
 *
 * Send an SMS reply from the business number and store it in ringcentral_sms.
 * Protected by admin Basic Auth via middleware.
 *
 * Body: { to: string, message: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { to, message } = await req.json();

    if (!to || !message) {
      return NextResponse.json(
        { ok: false, error: 'Both "to" and "message" are required' },
        { status: 400 }
      );
    }

    const fromNumber = process.env.RINGCENTRAL_PHONE_NUMBER;
    if (!fromNumber) {
      return NextResponse.json(
        { ok: false, error: 'RINGCENTRAL_PHONE_NUMBER not configured' },
        { status: 500 }
      );
    }

    const client = await getRingCentralClient();
    if (!client) {
      return NextResponse.json(
        { ok: false, error: 'RingCentral client not available' },
        { status: 500 }
      );
    }

    // Send SMS via RingCentral API — we need the full response to store message details
    const platform = client.platform();
    const response = await platform.post('/restapi/v1.0/account/~/extension/~/sms', {
      from: { phoneNumber: fromNumber },
      to: [{ phoneNumber: to }],
      text: message,
    });

    const result = await response.json();

    // Store in ringcentral_sms table
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: dbError } = await supabase.from('ringcentral_sms').upsert(
      {
        message_id: String(result.id),
        conversation_id: result.conversationId
          ? String(result.conversationId)
          : result.conversation?.id
            ? String(result.conversation.id)
            : null,
        message_time: result.creationTime || new Date().toISOString(),
        direction: 'Outbound',
        from_number: fromNumber,
        from_name: result.from?.name || null,
        to_number: to,
        to_name: result.to?.[0]?.name || null,
        message_text: message,
        message_status: result.messageStatus || 'Sent',
        read_status: 'Read',
        raw_data: result,
      },
      { onConflict: 'message_id' }
    );

    if (dbError) {
      console.error('Failed to store outbound SMS:', dbError.message);
      // SMS was sent successfully even if DB write fails — don't return error
    }

    console.log(`Admin reply sent to ${to}: ${result.id}`);

    return NextResponse.json({ ok: true, messageId: result.id });
  } catch (err: any) {
    console.error('Admin SMS send error:', err.message || err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Failed to send SMS' },
      { status: 500 }
    );
  }
}
