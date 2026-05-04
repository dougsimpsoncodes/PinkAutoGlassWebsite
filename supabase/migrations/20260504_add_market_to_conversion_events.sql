-- Add market column to conversion_events (denormalized from user_sessions.market).
--
-- Same reasoning as page_views — denormalized so per-page conversion-rate
-- reports can filter on market without join. A conversion_event inherits
-- its parent session's market.
--
-- Populated at write time in src/lib/tracking.ts.
--
-- Safe: pure additive change.

ALTER TABLE conversion_events
ADD COLUMN IF NOT EXISTS market TEXT NULL;

ALTER TABLE conversion_events
DROP CONSTRAINT IF EXISTS check_conversion_events_market;

ALTER TABLE conversion_events
ADD CONSTRAINT check_conversion_events_market
CHECK (market IS NULL OR market IN ('colorado', 'arizona'));

CREATE INDEX IF NOT EXISTS idx_conversion_events_market
ON conversion_events(market)
WHERE market IS NOT NULL;

COMMENT ON COLUMN conversion_events.market IS
  'Denormalized from user_sessions.market — the market of the session this conversion belongs to. Populated at write time in tracking.ts.';
