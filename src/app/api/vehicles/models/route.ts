import { Pool } from 'pg';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

/**
 * GET /api/vehicles/models?make=Toyota
 * Returns all models for a specific make
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const make = searchParams.get('make');

    if (!make) {
      return NextResponse.json(
        { error: 'Make parameter is required' },
        { status: 400 }
      );
    }

    // Query Postgres directly, bypassing Supabase PostgREST
    const { rows } = await pool.query(
      `SELECT vm.model
       FROM vehicle_models vm
       JOIN vehicle_makes vma ON vm.make_id = vma.id
       WHERE vma.make = $1
       ORDER BY vm.model ASC`,
      [make]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Make not found' },
        { status: 404 }
      );
    }

    const models = rows.map((row: { model: string }) => row.model);

    return NextResponse.json({ models });
  } catch (error) {
    console.error('Error fetching vehicle models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle models' },
      { status: 500 }
    );
  }
}
