import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateAdminApiKey } from '@/lib/api-auth';

// Force dynamic rendering - prevents static analysis during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/leads
 *
 * List all leads with filtering and sorting
 *
 * Query params:
 * - status: 'new' | 'contacted' | 'quoted' | 'scheduled' | 'completed' | 'lost'
 * - startDate: YYYY-MM-DD
 * - endDate: YYYY-MM-DD
 * - limit: number (default 100)
 * - offset: number (default 0)
 */
export async function GET(req: NextRequest) {
  // Defense-in-depth: API key validation (in addition to Basic Auth in middleware)
  const authError = validateAdminApiKey(req);
  if (authError) return authError;
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const client = createClient(supabaseUrl, supabaseKey);

    let query = client
      .from('leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: leads, error, count } = await query;

    if (error) {
      console.error('Error fetching leads:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      leads: leads || [],
      count: count || 0,
      limit,
      offset,
    });

  } catch (error: any) {
    console.error('Leads fetch error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/leads
 *
 * Update a lead's status, revenue, or other CRM fields
 *
 * Body:
 * {
 *   "id": "uuid",
 *   "status": "quoted",
 *   "quote_amount": 450.00,
 *   "revenue_amount": 450.00,
 *   "close_date": "2025-11-15",
 *   "notes": "Customer notes..."
 * }
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const client = createClient(supabaseUrl, supabaseKey);

    // Only allow updating specific CRM fields
    const allowedFields = [
      'status',
      'quote_amount',
      'revenue_amount',
      'close_date',
      'notes',
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (field in updates) {
        updateData[field] = updates[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const { data, error } = await client
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      lead: data,
    });

  } catch (error: any) {
    console.error('Lead update error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
