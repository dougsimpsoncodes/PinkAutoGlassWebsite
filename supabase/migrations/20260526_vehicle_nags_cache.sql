-- AutoBolt vehicle→NAGS cache
-- AutoBolt enforces per-account lookup quotas; cache resolved parts so a customer
-- re-quoting the same vehicle does not burn a lookup.
--
-- Two lookup keys are supported (one per row):
--   - sha256(uppercase 17-char VIN)
--   - sha256("PLATE:" || uppercase plate || ":" || uppercase state)
-- Both shapes carry the same NAGS payload so /api/quote/price can fall back to
-- whichever identifier the form provided.

CREATE TABLE IF NOT EXISTS vehicle_nags_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lookup_key TEXT NOT NULL UNIQUE, -- sha256 of vin OR "PLATE:plate:state"
  source TEXT NOT NULL DEFAULT 'autobolt',
  resolved_from TEXT NOT NULL,     -- 'vin' | 'plate'

  vin TEXT,
  plate_last4 TEXT,
  plate_state CHAR(2),

  vehicle_year INTEGER,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_body_style TEXT,

  -- Snapshot of the chosen part when AutoBolt confidence === 'single'.
  -- For inconclusive responses these stay NULL and confidence is recorded below.
  confidence TEXT NOT NULL,        -- 'single' | 'multi' | 'none'
  part_count INTEGER NOT NULL DEFAULT 0,
  nags_prefix TEXT,
  nags_number TEXT,
  am_number TEXT,
  oem_part_numbers JSONB NOT NULL DEFAULT '[]'::jsonb,
  interchangeables JSONB NOT NULL DEFAULT '[]'::jsonb,
  calibration_summary JSONB NOT NULL DEFAULT '[]'::jsonb,

  raw_response JSONB NOT NULL DEFAULT '{}'::jsonb,

  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '180 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_vehicle_nags_cache_confidence
    CHECK (confidence IN ('single', 'multi', 'none')),
  CONSTRAINT chk_vehicle_nags_cache_resolved_from
    CHECK (resolved_from IN ('vin', 'plate'))
);

CREATE INDEX IF NOT EXISTS idx_vehicle_nags_cache_expires_at
  ON vehicle_nags_cache (expires_at);
CREATE INDEX IF NOT EXISTS idx_vehicle_nags_cache_vin
  ON vehicle_nags_cache (vin);

-- The trigger that maintains updated_at across the schema is named
-- `update_updated_at_column()`, defined in 20260509_automated_quotes.sql
-- (and earlier migrations). Reuse it if present.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    EXECUTE 'CREATE TRIGGER trg_vehicle_nags_cache_updated_at
      BEFORE UPDATE ON vehicle_nags_cache
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Lock the cache to the service role. The route uses the SUPABASE_SERVICE_ROLE_KEY
-- when writing/reading; anon/authenticated clients have no business touching it.
ALTER TABLE vehicle_nags_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS deny_anon_vehicle_nags_cache ON vehicle_nags_cache;
CREATE POLICY deny_anon_vehicle_nags_cache
  ON vehicle_nags_cache
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
