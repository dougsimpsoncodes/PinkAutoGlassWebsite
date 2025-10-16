import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

// Helper to check rate limit
function checkRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    return { allowed: true };
  }

  const now = Date.now();
  const key = `lead:${ip}`;
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, resetTime: current.resetTime };
  }

  current.count++;
  rateLimitStore.set(key, current);
  return { allowed: true };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime! - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': retryAfter.toString() }
        }
      );
    }

    // Create Supabase client with anon key (not service role)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

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
    const vehicleParts = (body.vehicle || '').trim().split(' ');
    const vehicleYear = parseInt(vehicleParts[0]) || null;
    const vehicleMake = vehicleParts[1] || '';
    const vehicleModel = vehicleParts.slice(2).join(' ') || '';

    // Generate UUID for lead
    const { randomUUID } = await import('crypto');
    const leadId = randomUUID();

    // Build camelCase payload for fn_insert_lead RPC
    // Note: Database enum only accepts 'repair' or 'replacement'
    // Quick quotes default to 'repair' and we mark them via source field
    const payload = {
      serviceType: 'repair', // Quick quotes default to repair (distinguished by source)
      firstName,
      lastName,
      phoneE164: normalizePhone(body.phone),
      vehicleYear,
      vehicleMake,
      vehicleModel,
      zip: body.zip || null,
      notes: body.hasInsurance ? `Insurance: ${body.hasInsurance}. Source: Quick Quote Form` : 'Source: Quick Quote Form',
      source: body.source || 'homepage_quote_form',
      clientId: body.clientId || null,
      sessionId: body.sessionId || null,
      firstTouch: body.firstTouch || {},
      lastTouch: body.lastTouch || {},
    };

    // Insert lead via RPC (enforces RLS and business logic)
    const { error: leadError } = await supabase.rpc('fn_insert_lead', {
      p_id: leadId,
      p_payload: payload
    });

    if (leadError) {
      console.error('Lead insert failed:', leadError.message);
      throw leadError;
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Quote request received! We\'ll contact you within 5 minutes.',
        leadId: leadId
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Lead API error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Something went wrong. Please call us at (720) 918-7465' },
      { status: 500 }
    );
  }
}
