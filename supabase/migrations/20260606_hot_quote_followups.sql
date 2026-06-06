-- Durable state for auto-quoter notification events.
--
-- The auto-quoter has three customer-lifecycle notification events:
--   1. quote_ready: installed quote provided
--   2. quote_unbooked_5m: installed quote provided, no booking after 5 minutes
--   3. appointment_booked: appointment booked
--
-- Each event must send customer comms and team comms, and each event must be
-- idempotent so retries, browser refreshes, and overlapping cron invocations do
-- not duplicate SMS/email.

ALTER TABLE public.automated_quotes
  ADD COLUMN IF NOT EXISTS sms_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contact_submitted_at timestamptz;

CREATE TABLE IF NOT EXISTS public.automated_quote_notification_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES public.automated_quotes(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('quote_ready', 'quote_unbooked_5m', 'appointment_booked')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'sent', 'partial', 'failed', 'skipped')),
  customer_email_status text,
  customer_sms_status text,
  team_email_status text,
  team_sms_status text,
  attempt_count integer NOT NULL DEFAULT 0,
  first_error text,
  last_error text,
  claimed_at timestamptz,
  sent_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT automated_quote_notification_events_unique UNIQUE (quote_id, event_type)
);

CREATE INDEX IF NOT EXISTS idx_automated_quote_notification_events_type_status
  ON public.automated_quote_notification_events (event_type, status, sent_at);

CREATE INDEX IF NOT EXISTS idx_automated_quote_notification_events_pending_created
  ON public.automated_quote_notification_events (event_type, status, created_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_automated_quote_notification_events_quote
  ON public.automated_quote_notification_events (quote_id);

ALTER TABLE public.automated_quote_notification_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS deny_anon_automated_quote_notification_events
  ON public.automated_quote_notification_events;
CREATE POLICY deny_anon_automated_quote_notification_events
  ON public.automated_quote_notification_events
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.set_automated_quote_notification_events_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, extensions;

DROP TRIGGER IF EXISTS trg_automated_quote_notification_events_updated_at
  ON public.automated_quote_notification_events;
CREATE TRIGGER trg_automated_quote_notification_events_updated_at
BEFORE UPDATE ON public.automated_quote_notification_events
FOR EACH ROW
EXECUTE FUNCTION public.set_automated_quote_notification_events_updated_at();

COMMENT ON COLUMN public.automated_quotes.contact_submitted_at IS
  'Timestamp when a customer first submitted contact info for this auto quote.';

COMMENT ON TABLE public.automated_quote_notification_events IS
  'One row per auto-quoter notification event per quote. Unique quote_id/event_type prevents duplicate customer/team sends.';
