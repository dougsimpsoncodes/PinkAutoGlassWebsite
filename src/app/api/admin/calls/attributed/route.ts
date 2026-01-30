import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAttributedLeadMetrics } from '@/lib/dashboardData';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

/**
 * Returns phone numbers attributed to each ad platform via session-based matching.
 * Used by PlatformLeadsTable to correctly classify calls by platform.
 */
export async function GET(_req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  try {
    // Use a wide date range to cover all possible calls
    const startDate = new Date('2024-01-01');
    const endDate = new Date();

    const metrics = await getAttributedLeadMetrics(supabase, startDate, endDate);

    return NextResponse.json({
      google: metrics.google.callerPhones || [],
      microsoft: metrics.microsoft.callerPhones || [],
      direct: metrics.direct.callerPhones || [],
    });
  } catch (error) {
    console.error('Error fetching attributed calls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attributed calls' },
      { status: 500 }
    );
  }
}
