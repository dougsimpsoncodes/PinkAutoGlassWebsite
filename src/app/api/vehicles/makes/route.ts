import { Pool } from 'pg';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

/**
 * GET /api/vehicles/makes
 * Returns all vehicle makes for the booking form dropdown
 */
export async function GET() {
  try {
    // Query Postgres directly, bypassing Supabase PostgREST
    const { rows } = await pool.query(
      'SELECT make FROM vehicle_makes ORDER BY make ASC'
    );

    const makes = rows.map((row: { make: string }) => row.make);

    return NextResponse.json({ makes });
  } catch (error) {
    console.error('Error fetching vehicle makes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle makes' },
      { status: 500 }
    );
  }
}
