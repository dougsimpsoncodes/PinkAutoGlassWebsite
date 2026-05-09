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

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

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

CREATE OR REPLACE FUNCTION public.fn_create_automated_quote(payload JSONB)
RETURNS TABLE(id UUID, quote_token UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_quote_id UUID;
  v_quote_token UUID;
  v_status automated_quote_status;
  v_line_items JSONB;
  v_line_item_count INTEGER;
BEGIN
  IF payload IS NULL OR jsonb_typeof(payload) <> 'object' THEN
    RAISE EXCEPTION 'payload must be a JSON object';
  END IF;

  v_status := CASE payload->>'status'
    WHEN 'ready_exact' THEN 'ready_exact'::automated_quote_status
    WHEN 'ready_estimate' THEN 'ready_estimate'::automated_quote_status
    WHEN 'needs_confirmation' THEN 'needs_confirmation'::automated_quote_status
    WHEN 'manual_review' THEN 'manual_review'::automated_quote_status
    ELSE 'manual_review'::automated_quote_status
  END;

  INSERT INTO automated_quotes (
    status,
    status_reason,
    pricing_version,
    zip,
    state,
    ip_address,
    user_agent,
    session_id,
    client_id,
    plate_last4,
    plate_state,
    vin,
    vehicle_year,
    vehicle_make,
    vehicle_model,
    vehicle_trim,
    vehicle_style,
    vehicle_engine,
    vehicle_drive_type,
    vehicle_transmission,
    selected_nags_prefix,
    selected_nags_number,
    selected_nags_color,
    selected_nags_hardware_indicator,
    selected_nags_premium_indicator,
    selected_product_id,
    selected_brand,
    selected_part_description,
    selected_ship_from_branch_id,
    selected_ship_from_branch_name,
    selected_qty_available,
    selected_estimated_delivery_date,
    selected_estimated_delivery_time,
    supplier_cost_cents,
    quote_total_cents,
    quote_low_cents,
    quote_high_cents,
    currency,
    confidence_reasons,
    platetovin_request,
    platetovin_response,
    mygrant_request,
    mygrant_response
  )
  VALUES (
    v_status,
    NULLIF(payload->>'status_reason', ''),
    COALESCE(NULLIF(payload->>'pricing_version', ''), 'cash-windshield-v1'),
    NULLIF(payload->>'zip', ''),
    NULLIF(payload->>'state', ''),
    NULLIF(payload->>'ip_address', '')::INET,
    NULLIF(payload->>'user_agent', ''),
    NULLIF(payload->>'session_id', ''),
    NULLIF(payload->>'client_id', ''),
    NULLIF(payload->>'plate_last4', ''),
    NULLIF(payload->>'plate_state', ''),
    NULLIF(payload->>'vin', ''),
    NULLIF(payload->>'vehicle_year', '')::INTEGER,
    NULLIF(payload->>'vehicle_make', ''),
    NULLIF(payload->>'vehicle_model', ''),
    NULLIF(payload->>'vehicle_trim', ''),
    NULLIF(payload->>'vehicle_style', ''),
    NULLIF(payload->>'vehicle_engine', ''),
    NULLIF(payload->>'vehicle_drive_type', ''),
    NULLIF(payload->>'vehicle_transmission', ''),
    NULLIF(payload->>'selected_nags_prefix', ''),
    NULLIF(payload->>'selected_nags_number', ''),
    NULLIF(payload->>'selected_nags_color', ''),
    NULLIF(payload->>'selected_nags_hardware_indicator', ''),
    NULLIF(payload->>'selected_nags_premium_indicator', ''),
    NULLIF(payload->>'selected_product_id', ''),
    NULLIF(payload->>'selected_brand', ''),
    NULLIF(payload->>'selected_part_description', ''),
    NULLIF(payload->>'selected_ship_from_branch_id', ''),
    NULLIF(payload->>'selected_ship_from_branch_name', ''),
    NULLIF(payload->>'selected_qty_available', '')::INTEGER,
    NULLIF(payload->>'selected_estimated_delivery_date', ''),
    NULLIF(payload->>'selected_estimated_delivery_time', ''),
    NULLIF(payload->>'supplier_cost_cents', '')::INTEGER,
    NULLIF(payload->>'quote_total_cents', '')::INTEGER,
    NULLIF(payload->>'quote_low_cents', '')::INTEGER,
    NULLIF(payload->>'quote_high_cents', '')::INTEGER,
    COALESCE(NULLIF(payload->>'currency', ''), 'USD'),
    COALESCE(payload->'confidence_reasons', '[]'::jsonb),
    payload->'platetovin_request',
    payload->'platetovin_response',
    payload->'mygrant_request',
    payload->'mygrant_response'
  )
  RETURNING automated_quotes.id, automated_quotes.quote_token
  INTO v_quote_id, v_quote_token;

  v_line_items := CASE
    WHEN jsonb_typeof(payload->'line_items') = 'array' THEN payload->'line_items'
    ELSE '[]'::jsonb
  END;
  v_line_item_count := jsonb_array_length(v_line_items);

  IF v_line_item_count > 20 THEN
    RAISE EXCEPTION 'line_items exceeds the maximum allowed count';
  END IF;

  INSERT INTO automated_quote_line_items (
    quote_id,
    sort_order,
    kind,
    description,
    amount_cents,
    taxable,
    vendor_part_number,
    metadata
  )
  SELECT
    v_quote_id,
    COALESCE(NULLIF(item.value->>'sort_order', '')::INTEGER, item.ordinality::INTEGER),
    COALESCE(NULLIF(item.value->>'kind', ''), 'margin_adjustment'),
    COALESCE(NULLIF(item.value->>'description', ''), 'Quote line item'),
    GREATEST(COALESCE(NULLIF(item.value->>'amount_cents', '')::INTEGER, 0), 0),
    COALESCE(NULLIF(item.value->>'taxable', '')::BOOLEAN, false),
    NULLIF(item.value->>'vendor_part_number', ''),
    COALESCE(item.value->'metadata', '{}'::jsonb)
  FROM jsonb_array_elements(v_line_items) WITH ORDINALITY AS item(value, ordinality);

  RETURN QUERY SELECT v_quote_id, v_quote_token;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_create_automated_quote(JSONB) FROM public;
GRANT EXECUTE ON FUNCTION public.fn_create_automated_quote(JSONB) TO anon, authenticated;

COMMENT ON TABLE automated_quotes IS 'Automated quote engine attempts and accepted quotes. Cash windshield MVP only. Stores plate last4 only.';
COMMENT ON TABLE plate_vin_lookup_cache IS 'Cost-control cache for plate/state to VIN lookups. Stores hashed lookup key and plate last4 only.';
COMMENT ON FUNCTION public.fn_create_automated_quote(JSONB) IS 'Atomically creates an automated quote and line items while RLS denies direct table access.';
