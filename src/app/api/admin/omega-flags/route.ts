import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/admin/omega-flags — list unresolved flags
export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('omega_data_flags')
    .select('*')
    .is('resolved_at', null)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, flags: data, count: data.length });
}

// POST /api/admin/omega-flags — resolve a flag
// body: { id, resolution }
export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const { id, resolution } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { error } = await supabase
    .from('omega_data_flags')
    .update({ resolved_at: new Date().toISOString(), resolution: resolution || 'resolved' })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
