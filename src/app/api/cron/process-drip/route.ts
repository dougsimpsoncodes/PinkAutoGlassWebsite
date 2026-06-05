import { NextRequest, NextResponse } from 'next/server';
import { processScheduledMessages } from '@/lib/drip/processor';
import { sendSMS } from '@/lib/notifications/sms';

async function alertOwner(message: string) {
  const phone = process.env.OWNER_PHONE;
  if (!phone) return;
  await sendSMS({ to: phone, message }).catch(() => {});
}

export async function GET(request: NextRequest) {
  // Verify cron secret (same pattern as daily-report)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processScheduledMessages();

    // Only alert on permanent failures (max retries exceeded, unknown template,
    // or unhandled exception). result.errors is populated only for those cases.
    // Transient send failures that are still retrying do NOT trigger an alert —
    // they increment result.failed but do not push to result.errors.
    // Previously this fired on every retry attempt, causing repeated alerts for
    // a single failing message (up to 6 alerts per customer).
    if (result.errors.length > 0) {
      const summary = `Pink Auto Glass Alert: ${result.errors.length} review message(s) permanently failed (${result.sent} sent successfully today). Check Supabase scheduled_messages for details.`;
      await alertOwner(summary);
    }

    return NextResponse.json({
      ok: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Drip cron job failed:', msg);

    await alertOwner(`Pink Auto Glass Alert: The customer messaging system crashed and no messages were sent today.`);

    return NextResponse.json(
      { ok: false, error: 'Drip processing failed' },
      { status: 500 }
    );
  }
}
