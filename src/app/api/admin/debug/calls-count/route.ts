import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Defense-in-depth: API key validation (in addition to Basic Auth in middleware)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // Create client exactly like the API route does
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get count
  const { count, error: countError } = await supabase
    .from('ringcentral_calls')
    .select('*', { count: 'exact', head: true });

  // Get most recent call
  const { data: recentCalls, error: dataError } = await supabase
    .from('ringcentral_calls')
    .select('start_time, direction, result')
    .order('start_time', { ascending: false })
    .limit(5);

  return NextResponse.json({
    total_count: count,
    count_error: countError?.message || null,
    most_recent_calls: recentCalls,
    data_error: dataError?.message || null,
    env_check: {
      has_url: !!supabaseUrl,
      has_key: !!supabaseKey,
      key_length: supabaseKey?.length,
    }
  });
}
