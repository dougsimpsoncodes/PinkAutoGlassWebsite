import { NextRequest, NextResponse } from 'next/server';
import { attributeAllCalls, saveAttributionResults, getAttributionBreakdown } from '@/lib/callAttribution';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

function getDateRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - Math.max(days - 1, 0));

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const days = Number(searchParams.get('days') || '7');
    const saveToDatabase = searchParams.get('saveToDatabase') !== 'false';
    const { startDate, endDate } = getDateRange(days);

    const { attributed, summary } = await attributeAllCalls(startDate, endDate);
    const breakdown = getAttributionBreakdown(attributed);
    const saved = saveToDatabase ? await saveAttributionResults(attributed) : null;

    return NextResponse.json({
      ok: true,
      startDate,
      endDate,
      summary,
      breakdown,
      saved,
    });
  } catch (error: any) {
    console.error('run-attribution cron failed:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
