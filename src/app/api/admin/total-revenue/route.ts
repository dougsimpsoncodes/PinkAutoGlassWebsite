import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/total-revenue
 *
 * Returns gross revenue from all uploaded invoices (omega_installs)
 * alongside attributed revenue (leads matched to invoices).
 *
 * Response:
 * {
 *   grossRevenue: 61669.60,       // SUM(omega_installs.total_revenue) — all invoices
 *   attributedRevenue: 12400.00,  // SUM(leads.revenue_amount) — attributed to a lead
 *   invoiceCount: 48,             // total omega_installs records
 *   attributedLeadCount: 9,       // leads with revenue_amount set
 *   attributionRate: 14.6         // % of invoices matched to a lead (by revenue $)
 * }
 */

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) throw new Error('Supabase env vars not configured');
  return createClient(supabaseUrl, supabaseKey);
}

export async function GET() {
  try {
    const client = getSupabaseClient();

    const [grossResult, attributedResult] = await Promise.all([
      // All invoices, regardless of attribution
      client
        .from('omega_installs')
        .select('total_revenue'),

      // Leads that have been matched to invoices
      client
        .from('leads')
        .select('revenue_amount')
        .not('revenue_amount', 'is', null),
    ]);

    const grossRevenue = (grossResult.data || []).reduce(
      (sum: number, row: any) => sum + (row.total_revenue || 0),
      0
    );
    const invoiceCount = (grossResult.data || []).length;

    const attributedRevenue = (attributedResult.data || []).reduce(
      (sum: number, row: any) => sum + (row.revenue_amount || 0),
      0
    );
    const attributedLeadCount = (attributedResult.data || []).length;

    const attributionRate =
      grossRevenue > 0
        ? parseFloat(((attributedRevenue / grossRevenue) * 100).toFixed(1))
        : 0;

    return NextResponse.json({
      grossRevenue: parseFloat(grossRevenue.toFixed(2)),
      attributedRevenue: parseFloat(attributedRevenue.toFixed(2)),
      invoiceCount,
      attributedLeadCount,
      attributionRate,
    });
  } catch (error: any) {
    console.error('Total revenue error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
