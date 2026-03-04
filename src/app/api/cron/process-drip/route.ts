import { NextRequest, NextResponse } from 'next/server';
import { processScheduledMessages } from '@/lib/drip/processor';
import { sendAdminSMS } from '@/lib/notifications/sms';

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
      const summary = [
        `⚠️ Pink Auto Glass — drip cron errors:`,
        `${result.failed} failed, ${result.sent} sent`,
        result.errors.slice(0, 2).join(' | '),
      ].filter(Boolean).join('\n');

      await sendAdminSMS(summary).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Drip cron job failed:', msg);

    await sendAdminSMS(`⚠️ Pink Auto Glass — process-drip cron crashed: ${msg}`).catch(() => {});

    return NextResponse.json(
      { ok: false, error: 'Drip processing failed' },
      { status: 500 }
    );
  }
}
