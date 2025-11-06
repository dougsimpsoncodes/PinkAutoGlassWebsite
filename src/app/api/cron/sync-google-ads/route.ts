import { NextRequest, NextResponse } from 'next/server';

/**
 * Vercel Cron Job: Sync Google Ads Data
 *
 * Schedule: Every 6 hours (0 */6 * * *)
 *
 * This endpoint is called by Vercel's cron scheduler to automatically
 * sync Google Ads performance data into the database.
 */
export async function GET(req: NextRequest) {
  try {
    // Verify this is actually a cron request from Vercel
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('⚠️ Unauthorized cron request to sync-google-ads');
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('⏰ Cron job started: sync-google-ads');

    // Calculate date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    // Call the existing sync endpoint
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/admin/sync/google-ads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: start,
        endDate: end,
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error('❌ Cron job failed: sync-google-ads', result.error);
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 500 }
      );
    }

    console.log('✅ Cron job completed: sync-google-ads', result.summary);

    return NextResponse.json({
      ok: true,
      message: 'Google Ads sync completed',
      summary: result.summary,
    });

  } catch (error: any) {
    console.error('❌ Cron job error: sync-google-ads', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
