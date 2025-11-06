import { NextRequest, NextResponse } from 'next/server';

/**
 * Vercel Cron Job: Sync Google Search Console Data
 *
 * Schedule: Daily at 2am UTC (0 2 * * *)
 *
 * Note: Search Console data has a 2-3 day delay, so we sync the last 7 days
 * to ensure we capture all finalized data.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('⚠️ Unauthorized cron request to sync-search-console');
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.log('⏰ Cron job started: sync-search-console');

    // Account for 3-day data delay
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 3);

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7);

    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/admin/sync/google-search-console`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: start, endDate: end }),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error('❌ Cron job failed: sync-search-console', result.error);
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }

    console.log('✅ Cron job completed: sync-search-console', result.summary);

    return NextResponse.json({
      ok: true,
      message: 'Search Console sync completed',
      summary: result.summary,
    });

  } catch (error: any) {
    console.error('❌ Cron job error: sync-search-console', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
