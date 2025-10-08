import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    // Split name into first/last
    const nameParts = body.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Normalize phone to E.164 format
    const normalizePhone = (phone: string): string => {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return `+1${cleaned}`;
      } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        return `+${cleaned}`;
      }
      return `+${cleaned}`;
    };

    // Parse vehicle string (e.g., "2024 Toyota Camry")
    const vehicleParts = body.vehicle.trim().split(' ');
    const vehicleYear = parseInt(vehicleParts[0]) || null;
    const vehicleMake = vehicleParts[1] || '';
    const vehicleModel = vehicleParts.slice(2).join(' ') || '';

    // Save to Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert({
        service_type: 'quote_request', // Distinguish from full bookings
        first_name: firstName,
        last_name: lastName,
        phone_e164: normalizePhone(body.phone),
        vehicle_year: vehicleYear,
        vehicle_make: vehicleMake,
        vehicle_model: vehicleModel,
        zip: body.zip,
        notes: body.hasInsurance ? `Insurance: ${body.hasInsurance}` : null,
        source: body.source || 'homepage_quote_form',
        client_id: body.clientId,
        session_id: body.sessionId,
        first_touch: body.firstTouch || {},
        last_touch: body.lastTouch || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Lead saved to database:', data.id);

    return NextResponse.json(
      {
        success: true,
        message: 'Quote request received! We\'ll contact you within 5 minutes.',
        leadId: data.id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Lead API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please call us at (720) 918-7465' },
      { status: 500 }
    );
  }
}
