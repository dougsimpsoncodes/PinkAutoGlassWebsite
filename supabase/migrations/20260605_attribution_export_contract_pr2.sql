-- PR 2: Export candidates table + health snapshot coverage columns
--
-- Creates export_candidates: one eligibility decision per (source × platform) pair.
-- Stores the builder's evidence reasoning so the comparison script can show exactly
-- why each call/lead would (or would not) be uploaded under the new contract.
--
-- Also extends attribution_health_snapshots with two new columns so the
-- check-attribution-health cron can surface upload coverage alongside
-- attribution rates. Values remain NULL until the first builder run.
--
-- OBSERVE-ONLY: zero upload-behavior changes in this migration.

CREATE TABLE IF NOT EXISTS export_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What event this decision covers
  source_type TEXT NOT NULL CHECK (source_type IN ('call', 'lead', 'quote_booking')),
  source_id   TEXT NOT NULL,              -- call_id / lead.id / booking.id

  -- Which ad platform this decision is for
  platform TEXT NOT NULL CHECK (platform IN ('google', 'microsoft')),

  -- The click ID the builder found (null when ineligible)
  click_id_type TEXT CHECK (click_id_type IN ('gclid', 'msclkid')),
  click_id TEXT,

  -- Conversion metadata (filled by uploader in PR 2b; null during observation)
  conversion_action TEXT,
  conversion_time   TIMESTAMPTZ NOT NULL,
  call_value        NUMERIC(10,2),

  -- Eligibility decision
  eligible   BOOLEAN     NOT NULL DEFAULT false,
  reason     TEXT        NOT NULL CHECK (reason IN (
               'skip_google_call_view', 'skip_realtime_tap', 'direct_attribution',
               'direct_phone_click', 'session_fallback', 'conflict', 'missing_click_id'
             )),
  confidence INTEGER     NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 100),

  -- Lifecycle
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_at  TIMESTAMPTZ,          -- set by PR 2b uploader; null during observation
  upload_error TEXT,

  -- One decision per source per platform per cron run
  UNIQUE(source_type, source_id, platform)
);

-- Fast lookups for the comparison script and health queries
CREATE INDEX IF NOT EXISTS idx_export_candidates_conversion_time
  ON export_candidates(conversion_time);

CREATE INDEX IF NOT EXISTS idx_export_candidates_eligible_platform
  ON export_candidates(platform, eligible, conversion_time)
  WHERE eligible = true;

CREATE INDEX IF NOT EXISTS idx_export_candidates_pending_upload
  ON export_candidates(platform, conversion_time)
  WHERE eligible = true AND uploaded_at IS NULL;

-- Add upload-coverage visibility to the health snapshot table
ALTER TABLE attribution_health_snapshots
  ADD COLUMN IF NOT EXISTS upload_coverage_rate         NUMERIC(6,5),
  ADD COLUMN IF NOT EXISTS session_proximity_eligible_count INTEGER;
