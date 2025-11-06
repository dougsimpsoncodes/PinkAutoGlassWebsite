import { NextRequest, NextResponse } from 'next/server';

/**
 * Vercel Cron Job: Sync RingCentral Call Data
 *
 * Schedule: Every hour (0 * * * *)
 *
 * Syncs recent call records to ensure real-time call tracking.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('⚠️ Unauthorized cron request to sync-ringcentral');
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.log('⏰ Cron job started: sync-ringcentral');

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/admin/sync/ringcentral`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();

    if (!result.ok) {
      console.error('❌ Cron job failed: sync-ringcentral', result.error);
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }

    console.log('✅ Cron job completed: sync-ringcentral', result.summary);

    return NextResponse.json({
      ok: true,
      message: 'RingCentral sync completed',
      summary: result.summary,
    });

  } catch (error: any) {
    console.error('❌ Cron job error: sync-ringcentral', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
