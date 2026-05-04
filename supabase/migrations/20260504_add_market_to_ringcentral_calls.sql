-- Add market column to ringcentral_calls.
--
-- A call's market is fully determined by the dialed phone number:
--   +17209187465 → 'colorado' (Denver)
--   +14807127465 → 'arizona' (Phoenix)
-- Anything else → NULL.
--
-- This is the strongest classifier in the system because the dialed number
-- is unambiguous and present on every call record. classifyCallMarket() in
-- src/lib/market.ts already implements the rule.
--
-- Populated at write time in:
--   /api/admin/sync/ringcentral/route.ts (RingCentral sync)
--   /api/cron/sync-search-data/route.ts
--   src/lib/callLeadSync.ts
--
-- Safe: pure additive change.

ALTER TABLE ringcentral_calls
ADD COLUMN IF NOT EXISTS market TEXT NULL;

ALTER TABLE ringcentral_calls
DROP CONSTRAINT IF EXISTS check_ringcentral_calls_market;

ALTER TABLE ringcentral_calls
ADD CONSTRAINT check_ringcentral_calls_market
CHECK (market IS NULL OR market IN ('colorado', 'arizona'));

CREATE INDEX IF NOT EXISTS idx_ringcentral_calls_market
ON ringcentral_calls(market)
WHERE market IS NOT NULL;

COMMENT ON COLUMN ringcentral_calls.market IS
  'Denver/Phoenix market classification from the dialed phone number via classifyCallMarket(). +17209187465 → colorado, +14807127465 → arizona, else NULL.';
