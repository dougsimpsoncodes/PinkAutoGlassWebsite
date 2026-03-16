-- SMS opt-out tracking table for TCPA/CTIA compliance.
-- Tracks phone-level opt-outs (not per-lead) so STOP applies across all leads for a number.

CREATE TABLE IF NOT EXISTS sms_opt_outs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_e164 TEXT NOT NULL UNIQUE,
  is_opted_out BOOLEAN NOT NULL DEFAULT true,
  opted_out_at TIMESTAMPTZ,
  opted_in_at TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'sms',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sms_opt_outs_phone ON sms_opt_outs(phone_e164);

ALTER TABLE sms_opt_outs ENABLE ROW LEVEL SECURITY;

-- Service role only — no anon/authenticated access
CREATE POLICY "Service role full access on sms_opt_outs"
  ON sms_opt_outs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- No backfill needed — sms_consent column does not exist in leads table.
-- All opt-outs will be tracked going forward via STOP keyword detection.
