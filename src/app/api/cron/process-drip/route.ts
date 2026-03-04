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

    // Alert on any failures
    if (result.failed > 0 || result.errors.length > 0) {
      const summary = `Pink Auto Glass Alert: ${result.failed} customer message(s) failed to send today (${result.sent} sent successfully). Your review request system may not be working correctly.`;
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
