/**
 * Diagnostic endpoint for Microsoft Ads search terms
 * DELETE after debugging
 */
import { NextRequest, NextResponse } from 'next/server';
import { fetchSearchTerms, validateMicrosoftAdsConfig } from '@/lib/microsoftAds';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const logs: string[] = [];
  const origLog = console.log;
  const origWarn = console.warn;
  const origError = console.error;

  // Capture all console output
  console.log = (...args: any[]) => { logs.push('[LOG] ' + args.map(String).join(' ')); origLog(...args); };
  console.warn = (...args: any[]) => { logs.push('[WARN] ' + args.map(String).join(' ')); origWarn(...args); };
  console.error = (...args: any[]) => { logs.push('[ERROR] ' + args.map(String).join(' ')); origError(...args); };

  try {
    const config = validateMicrosoftAdsConfig();
    logs.push('[DIAG] Config valid: ' + config.isValid);
    if (!config.isValid) logs.push('[DIAG] Missing: ' + config.missingVars.join(', '));

    const results = await fetchSearchTerms('2026-02-03', '2026-02-10');
    logs.push('[DIAG] Results count: ' + results.length);
    if (results.length > 0) {
      logs.push('[DIAG] Sample: ' + JSON.stringify(results[0]));
    }

    return NextResponse.json({
      success: true,
      configValid: config.isValid,
      records: results.length,
      sample: results.slice(0, 3),
      logs,
    });
  } catch (err: any) {
    logs.push('[ERROR] ' + err.message);
    return NextResponse.json({
      success: false,
      error: err.message,
      logs,
    });
  } finally {
    console.log = origLog;
    console.warn = origWarn;
    console.error = origError;
  }
}
