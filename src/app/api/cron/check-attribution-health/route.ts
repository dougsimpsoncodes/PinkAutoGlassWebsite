import { NextRequest, NextResponse } from 'next/server';
import {
  buildAttributionHealthSnapshot,
  evaluateAttributionHealth,
  getSupabaseServiceClient,
  loadRecentAttributionHealthSnapshots,
  saveAttributionHealthSnapshot,
  sendAttributionHealthAlertEmail,
} from '@/lib/attributionHealth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

function getSnapshotDate(input: string | null): string {
  if (input) return input;
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const startMs = Date.now();
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const snapshotDate = getSnapshotDate(searchParams.get('snapshotDate'));
    const notify = searchParams.get('notify') !== 'false';

    const supabase = getSupabaseServiceClient();
    const runtimeSeconds = (Date.now() - startMs) / 1000;

    const snapshot = await buildAttributionHealthSnapshot(
      supabase,
      snapshotDate,
      runtimeSeconds,
      'check-attribution-health'
    );

    await saveAttributionHealthSnapshot(supabase, snapshot);
    const history = await loadRecentAttributionHealthSnapshots(supabase, snapshotDate, 7);
    const alerts = evaluateAttributionHealth(snapshot, history);

    let emailSent = false;
    if (notify && alerts.length > 0) {
      emailSent = await sendAttributionHealthAlertEmail(snapshot, alerts);
    }

    return NextResponse.json({
      ok: true,
      snapshotDate,
      snapshot,
      historyPoints: history.length,
      alerts,
      emailSent,
    });
  } catch (error: any) {
    console.error('check-attribution-health failed:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
