import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Preload endpoint - triggers parallel fetch of all dashboard data
 * Called on dashboard login to warm the cache
 *
 * This endpoint fires off requests to populate the cache for all common
 * date periods, so subsequent page loads are instant.
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const periods = ['today', 'yesterday', '7days', '30days'];

  try {
    // Fetch unified dashboard data for all periods in parallel
    const preloadPromises = periods.map(async (period) => {
      try {
        const response = await fetch(`${baseUrl}/api/admin/dashboard/unified?period=${period}`, {
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (!response.ok) {
          console.error(`Preload failed for period ${period}:`, response.status);
          return { period, success: false, error: response.status };
        }

        const data = await response.json();
        return {
          period,
          success: true,
          cached: data._cached || false,
        };
      } catch (error) {
        console.error(`Preload error for period ${period}:`, error);
        return { period, success: false, error: String(error) };
      }
    });

    const results = await Promise.all(preloadPromises);

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      status: failed === 0 ? 'complete' : 'partial',
      preloaded: successful,
      failed,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Preload endpoint error:', error);
    return NextResponse.json(
      { error: 'Preload failed', details: String(error) },
      { status: 500 }
    );
  }
}
