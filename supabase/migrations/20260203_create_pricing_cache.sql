-- Pricing Cache Table
-- Caches auto glass part pricing by vehicle year/make/model + service type.
-- Populated either from Omega EDI parts API or manually from the web portal.
-- 7-day TTL (auto glass prices change quarterly at most).

CREATE TABLE IF NOT EXISTS pricing_cache (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  vehicle_year    INT NOT NULL,
  vehicle_make    TEXT NOT NULL,
  vehicle_model   TEXT NOT NULL,
  service_type    TEXT NOT NULL DEFAULT 'windshield',
  nags_part_number TEXT,
  supplier_cost   NUMERIC(10,2) NOT NULL,
  list_price      NUMERIC(10,2),
  quoted_price    NUMERIC(10,2) NOT NULL,
  markup_percent  NUMERIC(5,2) NOT NULL DEFAULT 40,
  source          TEXT NOT NULL DEFAULT 'manual',  -- 'omega_api' or 'manual'
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_pricing_cache_vehicle
    UNIQUE (vehicle_year, vehicle_make, vehicle_model, service_type)
);

-- Index for fast lookups by the pricing module
-- (No partial index — NOW() isn't immutable; query filters on expires_at anyway)
CREATE INDEX IF NOT EXISTS idx_pricing_cache_lookup
  ON pricing_cache (vehicle_year, vehicle_make, vehicle_model, service_type);

-- RLS: admin-only access (service_role bypasses RLS)
ALTER TABLE pricing_cache ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE pricing_cache IS 'Auto glass part pricing cache. 7-day TTL. Populated from Omega EDI API or manually.';
