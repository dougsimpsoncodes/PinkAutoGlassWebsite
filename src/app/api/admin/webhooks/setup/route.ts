import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SDK } from '@ringcentral/sdk';

// Create Supabase client
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// RingCentral configuration
const RC_SERVER_URL = process.env.RINGCENTRAL_SERVER_URL || 'https://platform.ringcentral.com';
const RC_JWT_TOKEN = process.env.RINGCENTRAL_JWT_TOKEN;
const RC_CLIENT_ID = process.env.RINGCENTRAL_CLIENT_ID;
const RC_CLIENT_SECRET = process.env.RINGCENTRAL_CLIENT_SECRET;

// Webhook URL - must be publicly accessible
const WEBHOOK_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/ringcentral`
  : 'https://pinkautoglass.com/api/webhooks/ringcentral';

/**
 * Setup RingCentral Webhook Subscription
 *
 * This endpoint creates a webhook subscription with RingCentral to receive
 * real-time call events instead of polling the API.
 *
 * POST /api/admin/webhooks/setup - Create/renew webhook subscription
 * GET /api/admin/webhooks/setup - Check current subscription status
 * DELETE /api/admin/webhooks/setup - Remove webhook subscription
 */

function createRingCentralSDK() {
  if (!RC_JWT_TOKEN || !RC_CLIENT_ID || !RC_CLIENT_SECRET) {
    throw new Error('RingCentral credentials not configured');
  }

  const rcsdk = new SDK({
    server: RC_SERVER_URL,
    clientId: RC_CLIENT_ID.trim(),
    clientSecret: RC_CLIENT_SECRET.trim(),
  });

  return rcsdk.platform();
}

// Create or renew webhook subscription
export async function POST(req: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    console.log('🔧 Setting up RingCentral webhook subscription...');
    console.log(`📍 Webhook URL: ${WEBHOOK_URL}`);

    const platform = createRingCentralSDK();

    // Authenticate
    await platform.login({ jwt: RC_JWT_TOKEN!.trim() });
    console.log('✓ Authenticated with RingCentral');

    // Create webhook subscription
    const subscriptionData = {
      eventFilters: [
        '/restapi/v1.0/account/~/telephony/sessions', // All call events
      ],
      deliveryMode: {
        transportType: 'WebHook',
        address: WEBHOOK_URL,
      },
      expiresIn: 157680000, // ~5 years (max allowed)
    };

    console.log('📤 Creating subscription with event filters:', subscriptionData.eventFilters);

    const response = await platform.post('/restapi/v1.0/subscription', subscriptionData);
    const subscription = await response.json();

    console.log('✓ Webhook subscription created:', {
      id: subscription.id,
      status: subscription.status,
      expirationTime: subscription.expirationTime,
    });

    // Store subscription info in database
    const { error: dbError } = await supabase
      .from('ringcentral_webhook_subscriptions')
      .upsert({
        subscription_id: subscription.id,
        webhook_url: WEBHOOK_URL,
        event_filters: subscriptionData.eventFilters,
        status: subscription.status,
        created_at: subscription.creationTime,
        expiration_time: subscription.expirationTime,
        last_updated: new Date().toISOString(),
      }, {
        onConflict: 'subscription_id'
      });

    if (dbError) {
      console.error('⚠️  Failed to store subscription in database:', dbError.message);
    }

    return NextResponse.json({
      ok: true,
      message: 'Webhook subscription created successfully',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        webhookUrl: WEBHOOK_URL,
        eventFilters: subscriptionData.eventFilters,
        expiresAt: subscription.expirationTime,
      },
    });

  } catch (error: any) {
    console.error('❌ Webhook setup error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        details: error.stack,
      },
      { status: 500 }
    );
  }
}

// Check current subscription status
export async function GET(req: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    const platform = createRingCentralSDK();
    await platform.login({ jwt: RC_JWT_TOKEN!.trim() });

    // Get all active subscriptions
    const response = await platform.get('/restapi/v1.0/subscription');
    const data = await response.json();

    const subscriptions = data.records || [];
    const webhookSubscriptions = subscriptions.filter(
      (sub: any) => sub.deliveryMode?.transportType === 'WebHook'
    );

    console.log(`📊 Found ${webhookSubscriptions.length} webhook subscriptions`);

    return NextResponse.json({
      ok: true,
      subscriptions: webhookSubscriptions.map((sub: any) => ({
        id: sub.id,
        status: sub.status,
        webhookUrl: sub.deliveryMode?.address,
        eventFilters: sub.eventFilters,
        createdAt: sub.creationTime,
        expiresAt: sub.expirationTime,
      })),
    });

  } catch (error: any) {
    console.error('❌ Failed to get subscription status:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Delete webhook subscription
export async function DELETE(req: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    const { searchParams } = new URL(req.url);
    const subscriptionId = searchParams.get('id');

    if (!subscriptionId) {
      return NextResponse.json(
        { ok: false, error: 'subscription_id parameter required' },
        { status: 400 }
      );
    }

    const platform = createRingCentralSDK();
    await platform.login({ jwt: RC_JWT_TOKEN!.trim() });

    // Delete subscription from RingCentral
    await platform.delete(`/restapi/v1.0/subscription/${subscriptionId}`);

    console.log(`✓ Deleted subscription ${subscriptionId}`);

    // Remove from database
    await supabase
      .from('ringcentral_webhook_subscriptions')
      .delete()
      .eq('subscription_id', subscriptionId);

    return NextResponse.json({
      ok: true,
      message: 'Webhook subscription deleted successfully',
    });

  } catch (error: any) {
    console.error('❌ Failed to delete subscription:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
