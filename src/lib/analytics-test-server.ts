import type { SupabaseClient } from '@supabase/supabase-js';

export async function getAnalyticsSessionIsTest(
  supabase: SupabaseClient,
  sessionId?: string | null,
): Promise<boolean> {
  if (!sessionId) return false;

  const { data, error } = await supabase
    .from('user_sessions')
    .select('is_test')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (error) {
    console.error('[analytics-test] session lookup failed:', error.message);
    return false;
  }

  return Boolean((data as { is_test?: boolean } | null)?.is_test);
}

export async function markAnalyticsSessionTest(
  supabase: SupabaseClient,
  sessionId?: string | null,
): Promise<void> {
  if (!sessionId) return;

  const deletes = [
    supabase.from('analytics_events').delete().eq('session_id', sessionId),
    supabase.from('conversion_events').delete().eq('session_id', sessionId),
    supabase.from('page_views').delete().eq('session_id', sessionId),
    supabase.from('user_sessions').delete().eq('session_id', sessionId),
  ];

  const results = await Promise.all(deletes);
  for (const result of results) {
    if (result.error) {
      console.error('[analytics-test] session purge failed:', result.error.message);
    }
  }
}
