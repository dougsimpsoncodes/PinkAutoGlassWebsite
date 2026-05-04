-- Backfill `market` on page_views and conversion_events from parent user_sessions.
--
-- Run AFTER backfill-market-user-sessions.ts has populated user_sessions.market.
-- These two tables denormalize from user_sessions, so they can be backfilled
-- with a single SQL UPDATE per table — no classifier round-trip needed.
--
-- Idempotent: only touches rows where market IS NULL. Re-running has no effect
-- on already-tagged rows.
--
-- Safe: pure UPDATE; no schema change.

UPDATE page_views pv
SET market = us.market
FROM user_sessions us
WHERE pv.session_id = us.session_id
  AND pv.market IS NULL
  AND us.market IS NOT NULL;

UPDATE conversion_events ce
SET market = us.market
FROM user_sessions us
WHERE ce.session_id = us.session_id
  AND ce.market IS NULL
  AND us.market IS NOT NULL;
