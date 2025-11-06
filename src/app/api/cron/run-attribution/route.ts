import { NextRequest, NextResponse } from 'next/server';

/**
 * Vercel Cron Job: Run Call Attribution Matching
 *
 * Schedule: Daily at 3am UTC (0 3 * * *)
 *
 * Runs the attribution algorithm to match phone calls to marketing campaigns.
 * This includes both direct matches (phone_click events) and time-based
 * correlation for calls that bypassed the website.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('⚠️ Unauthorized cron request to run-attribution');
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.log('⏰ Cron job started: run-attribution');

    // Run attribution for last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/admin/attribution/match-calls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: start,
        endDate: end,
        saveToDatabase: true,
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error('❌ Cron job failed: run-attribution', result.error);
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }

    console.log('✅ Cron job completed: run-attribution', result.summary);

    return NextResponse.json({
      ok: true,
      message: 'Attribution matching completed',
      summary: result.summary,
      breakdown: result.breakdown,
    });

  } catch (error: any) {
    console.error('❌ Cron job error: run-attribution', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
