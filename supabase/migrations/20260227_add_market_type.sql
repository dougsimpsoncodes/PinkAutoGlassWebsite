-- Add market_type column to leads table
-- Values: 'in_market' | 'out_of_market' | NULL (existing leads)
-- in_market  = Phoenix metro (850xx-855xx) or Denver metro (800xx-806xx)
-- out_of_market = all other zip codes
-- NULL = lead submitted before this feature, or no zip provided

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS market_type varchar(20) DEFAULT NULL;

-- Index for admin External Leads queries
CREATE INDEX IF NOT EXISTS idx_leads_market_type ON leads(market_type);

COMMENT ON COLUMN leads.market_type IS 'in_market | out_of_market | NULL. Set at insert time based on zip prefix.';
