-- Captured outbound notifications for local/staging QA.
--
-- Used when NOTIFICATION_MODE=capture or redirect. The send helpers still log
-- captures if this table is not present, but the table gives QA a durable audit
-- record without sending external customer/team messages.

CREATE TABLE IF NOT EXISTS public.notification_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mode TEXT NOT NULL CHECK (mode IN ('capture', 'redirect', 'live')),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  original_to JSONB NOT NULL,
  redirected_to JSONB,
  subject TEXT,
  body TEXT NOT NULL,
  provider TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_notification_captures_created_at
  ON public.notification_captures (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_captures_channel
  ON public.notification_captures (channel);

ALTER TABLE public.notification_captures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS deny_anon_notification_captures
  ON public.notification_captures;

CREATE POLICY deny_anon_notification_captures
  ON public.notification_captures
  FOR ALL
  USING (false)
  WITH CHECK (false);

COMMENT ON TABLE public.notification_captures IS
  'Durable QA capture log for outbound email/SMS when NOTIFICATION_MODE is capture or redirect. Service role only.';
