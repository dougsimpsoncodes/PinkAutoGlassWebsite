import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/**
 * POST /api/lead/enrich
 *
 * Progressive capture: updates an existing lead with vehicle and insurance info.
 * Called from the thank-you page after initial quick capture submission.
 * Only updates non-null fields — won't overwrite data that's already there.
 *
 * Security: Rate-limited, UUID validated, only updates empty vehicle fields.
 * The leadId is a v4 UUID (122 bits of entropy) — brute-force infeasible.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 enrichment requests per IP per 60 seconds
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitResult = checkRateLimit(ip, 5, 60000);
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { leadId, vehicleYear, vehicleMake, vehicleModel, hasInsurance } = body;

    // Validate leadId is a proper UUID format
    if (!leadId || typeof leadId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(leadId)) {
      return NextResponse.json({ error: 'Invalid leadId' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Only update fields that were provided and are non-empty
    const updates: Record<string, any> = {};

    if (vehicleYear && typeof vehicleYear === 'number' && vehicleYear >= 1990) {
      updates.vehicle_year = vehicleYear;
    }
    if (vehicleMake && typeof vehicleMake === 'string' && vehicleMake.trim()) {
      updates.vehicle_make = vehicleMake.trim();
    }
    if (vehicleModel && typeof vehicleModel === 'string' && vehicleModel.trim()) {
      updates.vehicle_model = vehicleModel.trim();
    }
    // Fetch existing lead first — needed for notes append and vehicle guard
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, vehicle_make, notes')
      .eq('id', leadId)
      .maybeSingle();

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (hasInsurance && ['yes', 'no', 'unsure'].includes(hasInsurance)) {
      const insuranceNote = hasInsurance === 'yes' ? 'Has insurance' : hasInsurance === 'no' ? 'No insurance (out of pocket)' : 'Insurance status unknown';
      // Append to existing notes instead of overwriting
      updates.notes = existingLead.notes ? `${existingLead.notes}; ${insuranceNote}` : insuranceNote;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: true, message: 'No fields to update' });
    }

    updates.updated_at = new Date().toISOString();

    // Only enrich if vehicle data is currently empty
    if (existingLead.vehicle_make && existingLead.vehicle_make !== 'Unknown') {
      return NextResponse.json({ success: true, message: 'Vehicle data already present' });
    }

    const { error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', leadId);

    if (error) {
      console.error('Lead enrichment failed:', error.message);
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
    }

    console.log(`✅ Lead ${leadId} enriched with vehicle data: ${vehicleYear} ${vehicleMake} ${vehicleModel}`);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Lead enrichment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
