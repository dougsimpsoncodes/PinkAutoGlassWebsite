-- Create table for RingCentral webhook subscriptions
-- This tracks active webhook subscriptions for real-time call notifications

CREATE TABLE IF NOT EXISTS public.ringcentral_webhook_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id TEXT UNIQUE NOT NULL,
  webhook_url TEXT NOT NULL,
  event_filters TEXT[] NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  expiration_time TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT ringcentral_webhook_subscriptions_subscription_id_key UNIQUE (subscription_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_status
  ON public.ringcentral_webhook_subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_expiration
  ON public.ringcentral_webhook_subscriptions(expiration_time);

-- Add RLS policies
ALTER TABLE public.ringcentral_webhook_subscriptions ENABLE ROW LEVEL SECURITY;

-- Only service role can access webhook subscriptions (admin endpoint only)
CREATE POLICY "Service role can manage webhook subscriptions"
  ON public.ringcentral_webhook_subscriptions
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Add comment
COMMENT ON TABLE public.ringcentral_webhook_subscriptions IS
  'Stores active RingCentral webhook subscriptions for real-time call event notifications';
