-- Scheduled Messages table for drip sequences (auto-responder follow-ups)
-- Stores future SMS/email messages to be sent by the /api/cron/process-drip job

CREATE TABLE IF NOT EXISTS scheduled_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  channel VARCHAR(10) NOT NULL CHECK (channel IN ('sms', 'email')),
  template_key VARCHAR(50) NOT NULL,
  sequence_name VARCHAR(50) NOT NULL CHECK (sequence_name IN ('quick_quote_drip', 'booking_drip')),
  sequence_step INTEGER NOT NULL,
  context JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled', 'failed', 'skipped')),
  sent_at TIMESTAMPTZ,
  failure_reason TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  cancelled_at TIMESTAMPTZ,
  cancelled_reason VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for the cron job: find pending messages due for sending
CREATE INDEX idx_scheduled_messages_pending
  ON scheduled_messages (scheduled_for)
  WHERE status = 'pending';

-- Index for looking up all messages for a lead (cancel on status change, dedup)
CREATE INDEX idx_scheduled_messages_lead_id
  ON scheduled_messages (lead_id);

-- Index for dedup: find pending messages by phone number (stored in context->>'phone')
CREATE INDEX idx_scheduled_messages_phone_pending
  ON scheduled_messages (((context->>'phone')))
  WHERE status = 'pending';

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION fn_update_scheduled_messages_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, extensions;

CREATE TRIGGER trg_scheduled_messages_updated_at
  BEFORE UPDATE ON scheduled_messages
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_scheduled_messages_timestamp();

-- =============================================================================
-- TRIGGER: Cancel all pending drip messages when lead status changes from 'new'
-- =============================================================================
-- This fires regardless of HOW the status changes (admin dashboard, API, direct SQL)

CREATE OR REPLACE FUNCTION fn_cancel_drip_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only act when status changes FROM 'new' to something else
  IF OLD.status = 'new' AND NEW.status IS DISTINCT FROM 'new' THEN
    UPDATE scheduled_messages
    SET
      status = 'cancelled',
      cancelled_at = now(),
      cancelled_reason = 'lead_status_changed_to_' || NEW.status
    WHERE lead_id = NEW.id
      AND status = 'pending';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, extensions;

CREATE TRIGGER trg_cancel_drip_on_lead_status_change
  AFTER UPDATE OF status ON leads
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION fn_cancel_drip_on_status_change();

-- =============================================================================
-- RLS POLICIES
-- =============================================================================
ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;

-- Service role (used by cron job) can do everything
CREATE POLICY "Service role full access on scheduled_messages"
  ON scheduled_messages
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Anon role can insert (API routes use anon key to schedule after lead insert)
CREATE POLICY "Anon can insert scheduled_messages"
  ON scheduled_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anon can read own scheduled messages (needed for dedup query by phone)
CREATE POLICY "Anon can read scheduled_messages"
  ON scheduled_messages
  FOR SELECT
  TO anon
  USING (true);

-- Anon can update (needed for cancel-on-dedup from API routes)
CREATE POLICY "Anon can update scheduled_messages"
  ON scheduled_messages
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
