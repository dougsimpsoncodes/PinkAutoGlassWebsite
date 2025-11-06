-- Add CRM fields to leads table for revenue tracking and ROI calculation
-- Enables tracking from initial quote through to closed deal revenue

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS quote_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS close_date DATE,
ADD COLUMN IF NOT EXISTS revenue_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Rename estimated_cost to initial_estimate for clarity
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'estimated_cost'
  ) THEN
    ALTER TABLE leads RENAME COLUMN estimated_cost TO initial_estimate;
  END IF;
END $$;

-- Add indexes for filtering by revenue and dates
CREATE INDEX IF NOT EXISTS idx_leads_quote_amount ON leads(quote_amount) WHERE quote_amount IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_revenue_amount ON leads(revenue_amount) WHERE revenue_amount IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_close_date ON leads(close_date) WHERE close_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- Add check constraint for positive amounts
ALTER TABLE leads
ADD CONSTRAINT check_quote_amount_positive
CHECK (quote_amount IS NULL OR quote_amount >= 0);

ALTER TABLE leads
ADD CONSTRAINT check_revenue_amount_positive
CHECK (revenue_amount IS NULL OR revenue_amount >= 0);

-- Add check constraint for close_date logic (can't close before created)
ALTER TABLE leads
ADD CONSTRAINT check_close_date_after_created
CHECK (close_date IS NULL OR close_date >= created_at::DATE);

-- Comments for documentation
COMMENT ON COLUMN leads.quote_amount IS 'Quoted price given to customer (manual entry from sales team)';
COMMENT ON COLUMN leads.close_date IS 'Date deal was won or lost (NULL = still open)';
COMMENT ON COLUMN leads.revenue_amount IS 'Actual revenue from completed job (from Omega or manual entry)';
COMMENT ON COLUMN leads.initial_estimate IS 'Initial estimate from booking form (auto-populated)';
COMMENT ON COLUMN leads.notes IS 'General notes about the lead, customer preferences, special requirements';

-- Update status enum if needed (should already have these values from previous migration)
-- Values: new, contacted, quoted, scheduled, completed, lost
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'leads_status_check'
  ) THEN
    ALTER TABLE leads
    ADD CONSTRAINT leads_status_check
    CHECK (status IN ('new', 'contacted', 'quoted', 'scheduled', 'completed', 'lost'));
  END IF;
END $$;
