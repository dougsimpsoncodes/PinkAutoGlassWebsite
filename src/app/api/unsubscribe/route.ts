import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Email unsubscribe endpoint (RFC 8058 one-click unsubscribe).
 * Required by Yahoo/AOL/Gmail for inbox placement.
 *
 * POST /api/unsubscribe — one-click unsubscribe (from email client)
 * GET  /api/unsubscribe?email=...&lead_id=... — manual unsubscribe (link click)
 */

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function handleUnsubscribe(email: string | null, leadId: string | null): Promise<void> {
  if (!email && !leadId) return;

  const supabase = getSupabaseClient();

  // Log the unsubscribe request
  console.log(`📧 Unsubscribe request: email=${email}, leadId=${leadId}`);

  // Cancel any pending drip messages for this lead
  if (leadId) {
    try {
      await supabase
        .from('scheduled_messages')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancelled_reason: 'email_unsubscribe',
        })
        .eq('lead_id', leadId)
        .eq('status', 'pending');
    } catch (err) {
      console.error('Failed to cancel scheduled messages:', err);
    }
  }
}

// RFC 8058: One-click unsubscribe via POST
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let email: string | null = null;
    let leadId: string | null = null;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      email = formData.get('email') as string | null;
      leadId = formData.get('lead_id') as string | null;
    } else {
      const url = new URL(req.url);
      email = url.searchParams.get('email');
      leadId = url.searchParams.get('lead_id');
    }

    await handleUnsubscribe(email, leadId);

    return new NextResponse('Unsubscribed successfully.', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    console.error('Unsubscribe POST error:', error);
    return new NextResponse('Unsubscribed.', { status: 200 });
  }
}

// Manual unsubscribe via link click
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const email = url.searchParams.get('email');
  const leadId = url.searchParams.get('lead_id');

  await handleUnsubscribe(email, leadId);

  // Return a simple confirmation page
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Unsubscribed</title></head>
<body style="font-family: sans-serif; text-align: center; padding: 60px 20px;">
  <h1 style="color: #1f2937;">You've been unsubscribed</h1>
  <p style="color: #6b7280;">You will no longer receive marketing emails from Pink Auto Glass.</p>
  <p style="color: #6b7280; margin-top: 30px;">
    <a href="https://pinkautoglass.com" style="color: #ec4899;">Return to Pink Auto Glass</a>
  </p>
</body></html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
}
