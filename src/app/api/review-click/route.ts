import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const GOOGLE_REVIEW_URL = 'https://g.page/r/CZ2YTY_EELLQEAI/review';

/**
 * GET /api/review-click?lead=<lead_id>&src=<sms1|email|sms2>
 *
 * Tracks review link clicks from drip messages, then redirects to Google review page.
 * Public endpoint — no auth required (customers click this from SMS/email).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get('lead');
  const src = searchParams.get('src') || 'unknown';

  if (leadId) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await supabase.from('lead_activities').insert({
        lead_id: leadId,
        activity_type: 'review_link_clicked',
        description: `Review link clicked via ${src}`,
        metadata: { source: src },
        created_by: 'system:review',
      });
    } catch (err) {
      // Never block the redirect — tracking is best-effort
      console.error('review-click: failed to log activity:', err);
    }
  }

  return NextResponse.redirect(GOOGLE_REVIEW_URL, { status: 302 });
}
