import { NextRequest, NextResponse } from 'next/server';

/**
 * Vercel Cron Job: Sync Bing Ads (Microsoft Advertising) Data
 *
 * Schedule: Every 6 hours (0 */6 * * *)
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('⚠️ Unauthorized cron request to sync-bing-ads');
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.log('⏰ Cron job started: sync-bing-ads');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/admin/sync/microsoft-ads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: start, endDate: end }),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error('❌ Cron job failed: sync-bing-ads', result.error);
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }

    console.log('✅ Cron job completed: sync-bing-ads', result.summary);

    return NextResponse.json({
      ok: true,
      message: 'Bing Ads sync completed',
      summary: result.summary,
    });

  } catch (error: any) {
    console.error('❌ Cron job error: sync-bing-ads', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
