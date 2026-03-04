import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const GOOGLE_REVIEW_URL = 'https://g.page/r/CZ2YTY_EELLQEAI/review';

/**
 * GET /r/[leadId]
 *
 * Clean branded review link for SMS messages.
 * Logs the click to lead_activities, then redirects to Google review page.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { leadId: string } }
) {
  const { leadId } = params;

  if (leadId) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await supabase.from('lead_activities').insert({
        lead_id: leadId,
        activity_type: 'review_link_clicked',
        description: 'Review link clicked via sms',
        metadata: { source: 'sms' },
        created_by: 'system:review',
      });
    } catch (err) {
      console.error('review /r route: failed to log activity:', err);
    }
  }

  return NextResponse.redirect(GOOGLE_REVIEW_URL, { status: 302 });
}
