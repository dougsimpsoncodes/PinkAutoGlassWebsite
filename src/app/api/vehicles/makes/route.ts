import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/vehicles/makes
 * Returns all vehicle makes for the booking form dropdown
 */
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('vehicle_makes')
      .select('make')
      .order('make', { ascending: true });

    if (error) {
      console.error('Supabase error fetching vehicle makes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vehicle makes' },
        { status: 500 }
      );
    }

    const makes = data.map((row: { make: string }) => row.make);

    return NextResponse.json({ makes });
  } catch (error) {
    console.error('Error fetching vehicle makes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle makes' },
      { status: 500 }
    );
  }
}
