import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // First, get the make_id for the given make
    const { data: makeData, error: makeError } = await supabase
      .from('vehicle_makes')
      .select('id')
      .eq('make', make)
      .single();

    if (makeError || !makeData) {
      return NextResponse.json(
        { error: 'Make not found' },
        { status: 404 }
      );
    }

    // Then get all models for that make_id
    const { data: modelsData, error: modelsError } = await supabase
      .from('vehicle_models')
      .select('model')
      .eq('make_id', makeData.id)
      .order('model', { ascending: true });

    if (modelsError) {
      console.error('Supabase error fetching vehicle models:', modelsError);
      return NextResponse.json(
        { error: 'Failed to fetch vehicle models' },
        { status: 500 }
      );
    }

    if (!modelsData || modelsData.length === 0) {
      return NextResponse.json(
        { error: 'No models found for this make' },
        { status: 404 }
      );
    }

    const models = modelsData.map((row: { model: string }) => row.model);

    return NextResponse.json({ models });
  } catch (error) {
    console.error('Error fetching vehicle models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle models' },
      { status: 500 }
    );
  }
}
