import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/admin/sms/conversations
 *
 * Two modes:
 * 1. ?phone=+17201234567 — All messages to/from that number, ordered by time (conversation view)
 * 2. No params — Recent inbound messages grouped by sender (inbox view)
 *
 * Protected by admin Basic Auth via middleware.
 */
export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get('phone');
    const supabase = getSupabase();

    if (phone) {
      // Conversation view: all messages involving this phone number
      const { data, error } = await supabase
        .from('ringcentral_sms')
        .select('id, message_id, conversation_id, message_time, direction, from_number, from_name, to_number, to_name, message_text, message_status, read_status')
        .or(`from_number.eq.${phone},to_number.eq.${phone}`)
        .order('message_time', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Conversation fetch error:', error.message);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true, messages: data || [] });
    }

    // Inbox view: recent inbound messages, latest per sender
    // Get recent inbound messages (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('ringcentral_sms')
      .select('id, message_id, conversation_id, message_time, direction, from_number, from_name, to_number, to_name, message_text, message_status, read_status')
      .eq('direction', 'Inbound')
      .gte('message_time', thirtyDaysAgo.toISOString())
      .order('message_time', { ascending: false })
      .limit(200);

    if (error) {
      console.error('Inbox fetch error:', error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Deduplicate to latest message per sender
    const latestByPhone = new Map<string, typeof data[0]>();
    for (const msg of data || []) {
      if (!latestByPhone.has(msg.from_number)) {
        latestByPhone.set(msg.from_number, msg);
      }
    }

    const inbox = Array.from(latestByPhone.values());

    return NextResponse.json({ ok: true, inbox });
  } catch (err: any) {
    console.error('Conversations endpoint error:', err.message || err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}
