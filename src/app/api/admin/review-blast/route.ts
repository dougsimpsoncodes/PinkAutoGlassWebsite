import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isTCPAQuietHours, getNextSafeTime } from '@/lib/drip/scheduler';
import { isExcludedPhone } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/admin/review-blast
 *
 * Queues Google review requests for completed leads who haven't been contacted yet.
 * Protected by admin Basic Auth (middleware).
 *
 * Body:
 *   { lead_id?: string }   — omit for full blast, provide to scope to one lead (test mode)
 *
 * Schedule:
 *   Step 1 (SMS)           — now (respects TCPA quiet hours)
 *   Step 2 (email)         — +2 hrs
 *   Step 3 (SMS reminder)  — +72 hrs
 */
export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const body = await req.json().catch(() => ({}));
  const testLeadId: string | undefined = body.lead_id;
  const limit: number | undefined = body.limit;

  // ── Fetch eligible leads ────────────────────────────────────────────────────
  let query = supabase
    .from('leads')
    .select('id, first_name, phone_e164, email, vehicle_year, vehicle_make, vehicle_model')
    .eq('status', 'completed')
    .not('phone_e164', 'is', null);

  if (testLeadId) {
    query = query.eq('id', testLeadId);
  } else if (limit) {
    query = query.limit(limit);
  }

  const { data: leads, error: leadsError } = await query;

  if (leadsError) {
    return NextResponse.json({ ok: false, error: leadsError.message }, { status: 500 });
  }

  if (!leads || leads.length === 0) {
    return NextResponse.json({ ok: false, error: 'No matching leads found' }, { status: 404 });
  }

  // ── Filter out leads already contacted ────────────────────────────────────
  const leadIds = leads.map(l => l.id);
  const { data: alreadyQueued } = await supabase
    .from('scheduled_messages')
    .select('lead_id')
    .in('lead_id', leadIds)
    .eq('sequence_name', 'review_request')
    .in('status', ['pending', 'sent']);

  const alreadyQueuedIds = new Set((alreadyQueued || []).map(r => r.lead_id));
  const eligible = leads.filter(l => !alreadyQueuedIds.has(l.id));

  if (eligible.length === 0) {
    return NextResponse.json({
      ok: true,
      queued: 0,
      skipped: leads.length,
      message: 'All leads already contacted',
    });
  }

  // ── Schedule messages ─────────────────────────────────────────────────────
  const now = new Date();
  const rows: object[] = [];
  let skipped = 0;

  for (const lead of eligible) {
    if (isExcludedPhone(lead.phone_e164)) {
      skipped++;
      continue;
    }

    const steps = [
      { delayHours: 0,  channel: 'sms',   templateKey: 'review_request',       sequenceStep: 1 },
      { delayHours: 2,  channel: 'email',  templateKey: 'review_request_email', sequenceStep: 2 },
      { delayHours: 72, channel: 'sms',   templateKey: 'review_reminder',       sequenceStep: 3 },
    ];

    for (const step of steps) {
      // sms_consent defaults to true (column may not exist on all leads)
      if (step.channel === 'email' && !lead.email) continue;

      const rawTime = new Date(now.getTime() + step.delayHours * 60 * 60 * 1000);
      const scheduledFor = step.channel === 'sms' ? getNextSafeTime(rawTime) : rawTime;

      rows.push({
        lead_id: lead.id,
        scheduled_for: scheduledFor.toISOString(),
        channel: step.channel,
        template_key: step.templateKey,
        sequence_name: 'review_request',
        sequence_step: step.sequenceStep,
        context: {
          firstName: lead.first_name || 'there',
          phone: lead.phone_e164,
          email: lead.email || null,
          vehicleYear: lead.vehicle_year || 0,
          vehicleMake: lead.vehicle_make || '',
          vehicleModel: lead.vehicle_model || '',
          smsConsent: true,
        },
      });
    }
  }

  if (rows.length === 0) {
    return NextResponse.json({ ok: true, queued: 0, skipped, message: 'No messages to queue' });
  }

  const { error: insertError } = await supabase.from('scheduled_messages').insert(rows);

  if (insertError) {
    return NextResponse.json({ ok: false, error: insertError.message }, { status: 500 });
  }

  console.log(`review-blast: queued ${rows.length} messages for ${eligible.length} leads`);

  return NextResponse.json({
    ok: true,
    leads_eligible: eligible.length,
    leads_skipped: skipped + alreadyQueuedIds.size,
    messages_queued: rows.length,
    test_mode: !!testLeadId,
  });
}
