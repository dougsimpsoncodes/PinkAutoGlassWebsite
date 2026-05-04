-- Add market column to user_sessions for clean Denver/Phoenix separation in admin reports.
--
-- Background: The admin market toggle (CO/AZ/all) was silently broken on
-- /admin/dashboard/website-analytics — sessions had no market signal stored
-- on the row, so the API could not filter them. Phase 1 (commit da1fee7)
-- added a read-time classifier as a band-aid. This migration is the durable
-- fix: store the classified market on the row at write time, so reads
-- become a simple WHERE filter.
--
-- Column is nullable: not every session has a usable market signal
-- (paid ads without market-bearing campaign names, generic organic search,
-- ChatGPT, direct traffic, etc.). NULL is the documented "unknown" state
-- and is intentionally distinct from 'colorado' or 'arizona'.
--
-- Partial index targets the common query pattern: filter to a specific
-- market. Queries that scan all markets do not benefit from the index
-- (they're scans regardless), so a full index would be wasted bytes.
--
-- Safe: pure additive change, no existing data touched.

ALTER TABLE user_sessions
ADD COLUMN IF NOT EXISTS market TEXT NULL;

ALTER TABLE user_sessions
DROP CONSTRAINT IF EXISTS check_user_sessions_market;

ALTER TABLE user_sessions
ADD CONSTRAINT check_user_sessions_market
CHECK (market IS NULL OR market IN ('colorado', 'arizona'));

CREATE INDEX IF NOT EXISTS idx_user_sessions_market
ON user_sessions(market)
WHERE market IS NOT NULL;

COMMENT ON COLUMN user_sessions.market IS
  'Denver/Phoenix market classification computed by classifySessionMarket() at session start. NULL means no usable market signal was found (paid ads without market-bearing campaign, generic organic, direct traffic). Filtered out of specific-market admin views; counted under "All Markets" only.';
