/**
 * GET /api/admin/invoices
 *
 * Returns paginated omega_installs records for the invoice audit page.
 * Supports server-side pagination, sorting, search, and date range filtering.
 * raw_data excluded from list payload — fetched on-demand per row.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PAGE_SIZE = 50;
const LIST_COLUMNS = 'id, omega_invoice_id, invoice_number, install_date, customer_name, customer_phone, customer_email, vehicle_year, vehicle_make, vehicle_model, vin, job_type, parts_cost, labor_cost, tax_amount, total_revenue, payment_method, payment_status, status, matched_lead_id, match_confidence, matched_at, created_at, updated_at';

const SORTABLE_COLUMNS = new Set([
  'invoice_number', 'install_date', 'customer_name', 'customer_phone',
  'vehicle_make', 'job_type', 'parts_cost', 'labor_cost', 'total_revenue',
  'payment_status', 'match_confidence', 'created_at',
]);

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const search = searchParams.get('search')?.trim() || '';
    const sortBy = searchParams.get('sort') || 'created_at';
    const sortDir = searchParams.get('dir') === 'asc' ? true : false;

    const sortColumn = SORTABLE_COLUMNS.has(sortBy) ? sortBy : 'created_at';
    const rangeStart = (page - 1) * PAGE_SIZE;
    const rangeEnd = rangeStart + PAGE_SIZE - 1;

    let query = supabase
      .from('omega_installs')
      .select(LIST_COLUMNS, { count: 'exact' })
      .order(sortColumn, { ascending: sortDir })
      .range(rangeStart, rangeEnd);

    if (from) {
      query = query.gte('created_at', `${from}T00:00:00`);
    }
    if (to) {
      query = query.lte('created_at', `${to}T23:59:59`);
    }
    if (search) {
      // Search across name, phone, invoice number, VIN
      query = query.or(
        `customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%,invoice_number.ilike.%${search}%,vin.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('invoices fetch error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      invoices: data || [],
      total: count || 0,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil((count || 0) / PAGE_SIZE),
    });
  } catch (error: any) {
    console.error('invoices route error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
