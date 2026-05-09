-- Automated quote engine foundation
-- Cash windshield MVP: exact quotes only when part matching is confident.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'automated_quote_status') THEN
    CREATE TYPE automated_quote_status AS ENUM (
      'draft',
      'ready_exact',
      'ready_estimate',
      'needs_confirmation',
      'manual_review',
      'expired',
      'accepted',
      'declined'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS plate_vin_lookup_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lookup_key TEXT NOT NULL UNIQUE, -- sha256(normalized_plate || ':' || state)
  plate_last4 TEXT,
  plate_state CHAR(2) NOT NULL,
  source TEXT NOT NULL DEFAULT 'platetovin',
  vin TEXT NOT NULL,
  vehicle_year INTEGER,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_trim TEXT,
  vehicle_style TEXT,
  raw_response JSONB NOT NULL DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '90 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plate_vin_lookup_cache_expires_at
  ON plate_vin_lookup_cache (expires_at);
CREATE INDEX IF NOT EXISTS idx_plate_vin_lookup_cache_vin
  ON plate_vin_lookup_cache (vin);

CREATE TABLE IF NOT EXISTS automated_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

  status automated_quote_status NOT NULL DEFAULT 'draft',
  status_reason TEXT,
  pricing_version TEXT NOT NULL DEFAULT 'cash-windshield-v1',
  service_type TEXT NOT NULL DEFAULT 'windshield_replacement',

  -- Customer/session context. Lead is created only when contact info is submitted.
  first_name TEXT,
  last_name TEXT,
  phone_e164 TEXT,
  email TEXT,
  zip TEXT,
  state CHAR(2),
  market TEXT,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  client_id TEXT,

  -- Vehicle identification.
  plate_last4 TEXT,
  plate_state CHAR(2),
  vin TEXT,
  vehicle_year INTEGER,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_trim TEXT,
  vehicle_style TEXT,
  vehicle_engine TEXT,
  vehicle_drive_type TEXT,
  vehicle_transmission TEXT,

  -- Selected part snapshot.
  selected_nags_prefix TEXT,
  selected_nags_number TEXT,
  selected_nags_color TEXT,
  selected_nags_hardware_indicator TEXT,
  selected_nags_premium_indicator TEXT,
  selected_product_id TEXT,
  selected_brand TEXT,
  selected_part_description TEXT,
  selected_ship_from_branch_id TEXT,
  selected_ship_from_branch_name TEXT,
  selected_qty_available INTEGER,
  selected_estimated_delivery_date TEXT,
  selected_estimated_delivery_time TEXT,

  -- Price snapshot.
  supplier_cost_cents INTEGER,
  quote_total_cents INTEGER,
  quote_low_cents INTEGER,
  quote_high_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'USD',
  confidence_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Vendor request/response snapshots for debugging and audit.
  platetovin_request JSONB,
  platetovin_response JSONB,
  mygrant_request JSONB,
  mygrant_response JSONB,

  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_automated_quotes_service_type
    CHECK (service_type IN ('windshield_replacement')),
  CONSTRAINT chk_automated_quotes_quote_amounts
    CHECK (
      (quote_total_cents IS NULL OR quote_total_cents >= 0)
      AND (quote_low_cents IS NULL OR quote_low_cents >= 0)
      AND (quote_high_cents IS NULL OR quote_high_cents >= 0)
    )
);

CREATE INDEX IF NOT EXISTS idx_automated_quotes_lead_id
  ON automated_quotes (lead_id);
CREATE INDEX IF NOT EXISTS idx_automated_quotes_status
  ON automated_quotes (status);
CREATE INDEX IF NOT EXISTS idx_automated_quotes_created_at
  ON automated_quotes (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automated_quotes_vin
  ON automated_quotes (vin);
CREATE INDEX IF NOT EXISTS idx_automated_quotes_phone_e164
  ON automated_quotes (phone_e164);

CREATE TABLE IF NOT EXISTS automated_quote_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES automated_quotes(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  kind TEXT NOT NULL,
  description TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  taxable BOOLEAN NOT NULL DEFAULT false,
  vendor_part_number TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_automated_quote_line_items_amount
    CHECK (amount_cents >= 0)
);

CREATE INDEX IF NOT EXISTS idx_automated_quote_line_items_quote_id
  ON automated_quote_line_items (quote_id, sort_order);

ALTER TABLE plate_vin_lookup_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE automated_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE automated_quote_line_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS deny_anon_plate_vin_lookup_cache ON plate_vin_lookup_cache;
CREATE POLICY deny_anon_plate_vin_lookup_cache
  ON plate_vin_lookup_cache
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS deny_anon_automated_quotes ON automated_quotes;
CREATE POLICY deny_anon_automated_quotes
  ON automated_quotes
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS deny_anon_automated_quote_line_items ON automated_quote_line_items;
CREATE POLICY deny_anon_automated_quote_line_items
  ON automated_quote_line_items
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP TRIGGER IF EXISTS update_plate_vin_lookup_cache_updated_at ON plate_vin_lookup_cache;
CREATE TRIGGER update_plate_vin_lookup_cache_updated_at
  BEFORE UPDATE ON plate_vin_lookup_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_automated_quotes_updated_at ON automated_quotes;
CREATE TRIGGER update_automated_quotes_updated_at
  BEFORE UPDATE ON automated_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE automated_quotes IS 'Automated quote engine attempts and accepted quotes. Cash windshield MVP only. Stores plate last4 only.';
COMMENT ON TABLE plate_vin_lookup_cache IS 'Cost-control cache for plate/state to VIN lookups. Stores hashed lookup key and plate last4 only.';
