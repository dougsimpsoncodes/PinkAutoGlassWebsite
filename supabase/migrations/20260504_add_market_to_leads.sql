-- Add market column to leads.
--
-- A lead's market is determined by classifyLeadMarket() in src/lib/market.ts:
-- precedence is state → zip prefix → utm_source against satellite source lists.
-- NULL when no signal classifies the lead (e.g., a phone-call lead where the
-- caller didn't provide a state and didn't come from a tagged satellite).
--
-- Populated at write time on the multiple lead-creation paths:
--   /api/lead/route.ts (form submit)
--   /api/booking/submit/route.ts
--   /api/admin/sync/ringcentral/route.ts (call → lead promotion)
--   /api/cron/sync-omega/route.ts (Omega invoice → lead linking)
--   /api/admin/review-blast/route.ts
--   /api/webhook/ringcentral/sms/route.ts
--   src/lib/callLeadSync.ts
--
-- Safe: pure additive change.

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS market TEXT NULL;

ALTER TABLE leads
DROP CONSTRAINT IF EXISTS check_leads_market;

ALTER TABLE leads
ADD CONSTRAINT check_leads_market
CHECK (market IS NULL OR market IN ('colorado', 'arizona'));

CREATE INDEX IF NOT EXISTS idx_leads_market
ON leads(market)
WHERE market IS NOT NULL;

COMMENT ON COLUMN leads.market IS
  'Denver/Phoenix market classification computed by classifyLeadMarket() at lead creation. Precedence: state → zip prefix → utm_source against COLORADO_SATELLITE_SOURCES / ARIZONA_SATELLITE_SOURCES. NULL when no signal classifies (filtered out of specific-market admin views).';
