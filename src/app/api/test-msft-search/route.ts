/**
 * Diagnostic endpoint for Microsoft Ads search terms — DELETE after debugging
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchSearchTerms, validateMicrosoftAdsConfig } from '@/lib/microsoftAds';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const logs: string[] = [];

  try {
    const config = validateMicrosoftAdsConfig();
    logs.push('Config valid: ' + config.isValid);

    // Fetch data
    const results = await fetchSearchTerms('2026-02-03', '2026-02-10');
    logs.push('Fetched records: ' + results.length);

    if (results.length === 0) {
      return NextResponse.json({ success: false, message: 'No records fetched', logs });
    }

    // Delete existing
    const { error: delErr } = await supabase
      .from('microsoft_ads_search_terms')
      .delete()
      .gte('date', '2026-02-03')
      .lte('date', '2026-02-10');
    logs.push('Delete result: ' + (delErr ? 'ERROR: ' + delErr.message : 'OK'));

    // Build records exactly like cron does
    const dbRecords = results.map(record => ({
      date: '2026-02-03',
      search_term: record.search_term,
      campaign_name: record.campaign_name,
      campaign_id: '0',
      ad_group_name: record.ad_group_name || 'Unknown',
      ad_group_id: '0',
      keyword_text: record.keyword_text || null,
      match_type: record.match_type || null,
      impressions: record.impressions,
      clicks: record.clicks,
      cost_micros: record.cost_micros,
      conversions: record.conversions,
    }));

    logs.push('Sample record: ' + JSON.stringify(dbRecords[0]));

    // Insert in chunks of 100
    let inserted = 0;
    for (let i = 0; i < dbRecords.length; i += 100) {
      const chunk = dbRecords.slice(i, i + 100);
      const { error } = await supabase
        .from('microsoft_ads_search_terms')
        .insert(chunk);

      if (!error) {
        inserted += chunk.length;
        logs.push(`Chunk ${i}-${i + chunk.length}: OK`);
      } else {
        logs.push(`Chunk ${i}-${i + chunk.length}: ERROR: ${error.message} (${error.code})`);
      }
    }

    // Verify
    const { count } = await supabase
      .from('microsoft_ads_search_terms')
      .select('*', { count: 'exact', head: true });
    logs.push('Final table count: ' + count);

    return NextResponse.json({ success: true, inserted, tableCount: count, logs });
  } catch (err: any) {
    logs.push('EXCEPTION: ' + err.message);
    return NextResponse.json({ success: false, error: err.message, logs });
  }
}
