import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all recommendations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('google_ads_recommendations')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching recommendations:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ recommendations: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}

// POST - Create new recommendation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      category,
      priority,
      title,
      description,
      search_term,
      current_metrics,
      expected_impact,
    } = body;

    const { data, error } = await supabase
      .from('google_ads_recommendations')
      .insert({
        category,
        priority,
        title,
        description,
        search_term,
        current_metrics,
        expected_impact,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating recommendation:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ recommendation: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to create recommendation' }, { status: 500 });
  }
}

// PATCH - Update recommendation status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes, implemented_action, results_after } = body;

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    if (notes) updateData.notes = notes;
    if (implemented_action) updateData.implemented_action = implemented_action;
    if (results_after) updateData.results_after = results_after;

    const { data, error } = await supabase
      .from('google_ads_recommendations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating recommendation:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ recommendation: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to update recommendation' }, { status: 500 });
  }
}
