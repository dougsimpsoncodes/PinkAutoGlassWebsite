import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRingCentralClient } from '@/lib/notifications/sms';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const SMS_EVENT_FILTER = '/restapi/v1.0/account/~/extension/~/message-store/instant?type=SMS';

/**
 * POST /api/admin/webhook/ringcentral
 *
 * Create a new webhook subscription for inbound SMS events.
 * Protected by admin Basic Auth via middleware.
 */
export async function POST() {
  try {
    const client = await getRingCentralClient();
    if (!client) {
      return NextResponse.json(
        { ok: false, error: 'RingCentral client not available' },
        { status: 500 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pinkautoglass.com';
    const webhookUrl = `${siteUrl}/api/webhook/ringcentral/sms`;

    const platform = client.platform();
    const response = await platform.post('/restapi/v1.0/subscription', {
      eventFilters: [SMS_EVENT_FILTER],
      deliveryMode: {
        transportType: 'WebHook',
        address: webhookUrl,
      },
      expiresIn: 630720000, // 20 years (max allowed by RC API)
    });

    const result = await response.json();

    // Store subscription in DB
    const supabase = getSupabase();
    const { error: dbError } = await supabase
      .from('ringcentral_webhook_subscriptions')
      .upsert(
        {
          subscription_id: result.id,
          webhook_url: webhookUrl,
          event_filters: result.eventFilters || [SMS_EVENT_FILTER],
          status: result.status || 'Active',
          created_at: result.creationTime || new Date().toISOString(),
          expiration_time: result.expirationTime || null,
        },
        { onConflict: 'subscription_id' }
      );

    if (dbError) {
      console.error('Failed to store webhook subscription:', dbError.message);
    }

    console.log(`Webhook subscription created: ${result.id}, expires ${result.expirationTime}`);

    return NextResponse.json({
      ok: true,
      subscription: {
        id: result.id,
        status: result.status,
        webhookUrl,
        expirationTime: result.expirationTime,
        eventFilters: result.eventFilters,
      },
    });
  } catch (err: any) {
    console.error('Webhook subscription creation error:', err.message || err);
    const errorBody = err.response ? await err.response.json().catch(() => null) : null;
    return NextResponse.json(
      { ok: false, error: err.message || 'Failed to create subscription', details: errorBody },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/webhook/ringcentral
 *
 * Check current webhook subscription status.
 */
export async function GET() {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('ringcentral_webhook_subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, subscriptions: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/webhook/ringcentral
 *
 * Remove a webhook subscription.
 * Query param: ?id=subscription_id
 */
export async function DELETE(req: NextRequest) {
  try {
    const subscriptionId = req.nextUrl.searchParams.get('id');
    if (!subscriptionId) {
      return NextResponse.json(
        { ok: false, error: 'Subscription ID is required (?id=...)' },
        { status: 400 }
      );
    }

    const client = await getRingCentralClient();
    if (!client) {
      return NextResponse.json(
        { ok: false, error: 'RingCentral client not available' },
        { status: 500 }
      );
    }

    // Delete from RingCentral
    const platform = client.platform();
    try {
      await platform.delete(`/restapi/v1.0/subscription/${subscriptionId}`);
    } catch (rcErr: any) {
      console.warn('RC subscription delete failed (may already be expired):', rcErr.message);
    }

    // Update DB record
    const supabase = getSupabase();
    await supabase
      .from('ringcentral_webhook_subscriptions')
      .update({ status: 'Deleted', last_updated: new Date().toISOString() })
      .eq('subscription_id', subscriptionId);

    console.log(`Webhook subscription deleted: ${subscriptionId}`);

    return NextResponse.json({ ok: true, deleted: subscriptionId });
  } catch (err: any) {
    console.error('Webhook subscription delete error:', err.message || err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}
