import { NextRequest, NextResponse } from 'next/server';
import { processScheduledMessages } from '@/lib/drip/processor';

export async function GET(request: NextRequest) {
  // Verify cron secret (same pattern as daily-report)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processScheduledMessages();

    return NextResponse.json({
      ok: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Drip cron job failed:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { ok: false, error: 'Drip processing failed' },
      { status: 500 }
    );
  }
}
