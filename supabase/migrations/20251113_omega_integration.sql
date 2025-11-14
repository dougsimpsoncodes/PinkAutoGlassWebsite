-- Omega EDI Integration Tables
-- Purpose: Track quotes and installs from Omega EDI to measure marketing ROI

-- ============================================================================
-- OMEGA QUOTES TABLE
-- ============================================================================
-- Stores quote data from Omega EDI
CREATE TABLE IF NOT EXISTS omega_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Omega EDI fields
  omega_quote_id TEXT UNIQUE NOT NULL, -- Omega's quote ID
  omega_customer_id TEXT, -- Omega's customer ID

  -- Customer info (for matching with leads)
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,

  -- Quote details
  quote_date TIMESTAMPTZ NOT NULL,
  quote_number TEXT,

  -- Vehicle info
  vehicle_year INTEGER,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vin TEXT,

  -- Financial
  quoted_amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2),
  total_amount DECIMAL(10,2) NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, declined, converted

  -- Matching
  matched_lead_id UUID REFERENCES leads(id), -- Link to our leads table
  match_confidence TEXT, -- exact, likely, manual
  matched_at TIMESTAMPTZ,

  -- Metadata
  raw_data JSONB, -- Full Omega API response
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at TIMESTAMPTZ -- Last sync from Omega
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_omega_quotes_omega_id ON omega_quotes(omega_quote_id);
CREATE INDEX IF NOT EXISTS idx_omega_quotes_customer_phone ON omega_quotes(customer_phone);
CREATE INDEX IF NOT EXISTS idx_omega_quotes_customer_email ON omega_quotes(customer_email);
CREATE INDEX IF NOT EXISTS idx_omega_quotes_lead_id ON omega_quotes(matched_lead_id);
CREATE INDEX IF NOT EXISTS idx_omega_quotes_quote_date ON omega_quotes(quote_date DESC);
CREATE INDEX IF NOT EXISTS idx_omega_quotes_status ON omega_quotes(status);

-- ============================================================================
-- OMEGA INSTALLS TABLE
-- ============================================================================
-- Stores completed installation/job data from Omega EDI
CREATE TABLE IF NOT EXISTS omega_installs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Omega EDI fields
  omega_invoice_id TEXT UNIQUE NOT NULL, -- Omega's invoice/job ID
  omega_quote_id TEXT, -- Reference to quote if available
  omega_customer_id TEXT,

  -- Customer info
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,

  -- Job details
  install_date TIMESTAMPTZ NOT NULL,
  invoice_number TEXT,
  job_type TEXT, -- repair, replacement, etc.

  -- Vehicle info
  vehicle_year INTEGER,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vin TEXT,

  -- Financial
  parts_cost DECIMAL(10,2),
  labor_cost DECIMAL(10,2),
  tax_amount DECIMAL(10,2),
  total_revenue DECIMAL(10,2) NOT NULL,

  -- Payment
  payment_method TEXT, -- cash, credit, insurance
  payment_status TEXT, -- paid, pending, partial

  -- Status
  status TEXT NOT NULL DEFAULT 'completed', -- completed, cancelled, warranty

  -- Matching
  matched_lead_id UUID REFERENCES leads(id),
  matched_quote_id UUID REFERENCES omega_quotes(id),
  match_confidence TEXT,
  matched_at TIMESTAMPTZ,

  -- Metadata
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_omega_installs_omega_invoice_id ON omega_installs(omega_invoice_id);
CREATE INDEX IF NOT EXISTS idx_omega_installs_omega_quote_id ON omega_installs(omega_quote_id);
CREATE INDEX IF NOT EXISTS idx_omega_installs_customer_phone ON omega_installs(customer_phone);
CREATE INDEX IF NOT EXISTS idx_omega_installs_customer_email ON omega_installs(customer_email);
CREATE INDEX IF NOT EXISTS idx_omega_installs_lead_id ON omega_installs(matched_lead_id);
CREATE INDEX IF NOT EXISTS idx_omega_installs_quote_id ON omega_installs(matched_quote_id);
CREATE INDEX IF NOT EXISTS idx_omega_installs_install_date ON omega_installs(install_date DESC);
CREATE INDEX IF NOT EXISTS idx_omega_installs_status ON omega_installs(status);

-- ============================================================================
-- OMEGA SYNC LOG TABLE
-- ============================================================================
-- Track sync history with Omega API
CREATE TABLE IF NOT EXISTS omega_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  sync_type TEXT NOT NULL, -- quotes, installs, customers
  sync_status TEXT NOT NULL, -- success, partial, failed

  records_fetched INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_matched INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,

  error_message TEXT,

  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,

  metadata JSONB -- Additional sync details
);

CREATE INDEX IF NOT EXISTS idx_omega_sync_log_started_at ON omega_sync_log(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_omega_sync_log_sync_type ON omega_sync_log(sync_type);

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

-- Lead-to-Revenue Attribution View
CREATE OR REPLACE VIEW v_lead_to_revenue AS
SELECT
  l.id AS lead_id,
  l.reference_number,
  l.firstName,
  l.lastName,
  l.email,
  l.phone,
  l.created_at AS lead_date,

  -- Quote data
  oq.id AS quote_id,
  oq.omega_quote_id,
  oq.quote_date,
  oq.quoted_amount,
  oq.status AS quote_status,

  -- Install data
  oi.id AS install_id,
  oi.omega_invoice_id,
  oi.install_date,
  oi.total_revenue,
  oi.status AS install_status,

  -- Conversion metrics
  EXTRACT(EPOCH FROM (oq.quote_date - l.created_at))/3600 AS hours_to_quote,
  EXTRACT(EPOCH FROM (oi.install_date - l.created_at))/86400 AS days_to_install,
  EXTRACT(EPOCH FROM (oi.install_date - oq.quote_date))/86400 AS days_quote_to_install,

  -- Revenue metrics
  CASE
    WHEN oi.total_revenue IS NOT NULL THEN oi.total_revenue
    ELSE 0
  END AS revenue,

  CASE
    WHEN oi.id IS NOT NULL THEN 'converted'
    WHEN oq.id IS NOT NULL THEN 'quoted'
    ELSE 'lead_only'
  END AS conversion_stage

FROM leads l
LEFT JOIN omega_quotes oq ON l.id = oq.matched_lead_id
LEFT JOIN omega_installs oi ON l.id = oi.matched_lead_id;

-- Marketing ROI View (connects to Google Ads)
CREATE OR REPLACE VIEW v_marketing_roi AS
SELECT
  DATE(l.created_at) AS date,
  COUNT(DISTINCT l.id) AS total_leads,
  COUNT(DISTINCT oq.id) AS total_quotes,
  COUNT(DISTINCT oi.id) AS total_installs,

  -- Conversion rates
  ROUND(
    CAST(COUNT(DISTINCT oq.id) AS DECIMAL) / NULLIF(COUNT(DISTINCT l.id), 0) * 100,
    2
  ) AS lead_to_quote_rate,

  ROUND(
    CAST(COUNT(DISTINCT oi.id) AS DECIMAL) / NULLIF(COUNT(DISTINCT l.id), 0) * 100,
    2
  ) AS lead_to_install_rate,

  -- Revenue
  COALESCE(SUM(oi.total_revenue), 0) AS total_revenue,
  ROUND(
    COALESCE(SUM(oi.total_revenue), 0) / NULLIF(COUNT(DISTINCT l.id), 0),
    2
  ) AS revenue_per_lead,

  ROUND(
    COALESCE(SUM(oi.total_revenue), 0) / NULLIF(COUNT(DISTINCT oi.id), 0),
    2
  ) AS avg_job_value

FROM leads l
LEFT JOIN omega_quotes oq ON l.id = oq.matched_lead_id
LEFT JOIN omega_installs oi ON l.id = oi.matched_lead_id
GROUP BY DATE(l.created_at)
ORDER BY DATE(l.created_at) DESC;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to automatically match quotes/installs to leads
CREATE OR REPLACE FUNCTION match_omega_to_leads()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Match quotes to leads by exact phone match
  UPDATE omega_quotes oq
  SET
    matched_lead_id = l.id,
    match_confidence = 'exact',
    matched_at = NOW()
  FROM leads l
  WHERE oq.matched_lead_id IS NULL
    AND oq.customer_phone IS NOT NULL
    AND l.phone IS NOT NULL
    AND REGEXP_REPLACE(oq.customer_phone, '[^0-9]', '', 'g') = REGEXP_REPLACE(l.phone, '[^0-9]', '', 'g');

  -- Match quotes to leads by exact email match
  UPDATE omega_quotes oq
  SET
    matched_lead_id = l.id,
    match_confidence = 'exact',
    matched_at = NOW()
  FROM leads l
  WHERE oq.matched_lead_id IS NULL
    AND oq.customer_email IS NOT NULL
    AND l.email IS NOT NULL
    AND LOWER(oq.customer_email) = LOWER(l.email);

  -- Match installs to leads by exact phone match
  UPDATE omega_installs oi
  SET
    matched_lead_id = l.id,
    match_confidence = 'exact',
    matched_at = NOW()
  FROM leads l
  WHERE oi.matched_lead_id IS NULL
    AND oi.customer_phone IS NOT NULL
    AND l.phone IS NOT NULL
    AND REGEXP_REPLACE(oi.customer_phone, '[^0-9]', '', 'g') = REGEXP_REPLACE(l.phone, '[^0-9]', '', 'g');

  -- Match installs to leads by exact email match
  UPDATE omega_installs oi
  SET
    matched_lead_id = l.id,
    match_confidence = 'exact',
    matched_at = NOW()
  FROM leads l
  WHERE oi.matched_lead_id IS NULL
    AND oi.customer_email IS NOT NULL
    AND l.email IS NOT NULL
    AND LOWER(oi.customer_email) = LOWER(l.email);

  -- Match installs to quotes
  UPDATE omega_installs oi
  SET
    matched_quote_id = oq.id
  FROM omega_quotes oq
  WHERE oi.matched_quote_id IS NULL
    AND oi.omega_quote_id IS NOT NULL
    AND oq.omega_quote_id = oi.omega_quote_id;
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE omega_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE omega_installs ENABLE ROW LEVEL SECURITY;
ALTER TABLE omega_sync_log ENABLE ROW LEVEL SECURITY;

-- Admin users can see everything (using service role)
CREATE POLICY "Service role has full access to omega_quotes"
  ON omega_quotes FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to omega_installs"
  ON omega_installs FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to omega_sync_log"
  ON omega_sync_log FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE omega_quotes IS 'Quotes synced from Omega EDI for tracking lead-to-quote conversion';
COMMENT ON TABLE omega_installs IS 'Completed jobs/installs synced from Omega EDI for revenue tracking';
COMMENT ON TABLE omega_sync_log IS 'Log of all sync operations with Omega EDI API';
COMMENT ON VIEW v_lead_to_revenue IS 'Attribution view showing lead → quote → install → revenue journey';
COMMENT ON VIEW v_marketing_roi IS 'Daily marketing performance metrics with revenue attribution';
COMMENT ON FUNCTION match_omega_to_leads IS 'Auto-match Omega records to leads by phone/email';
