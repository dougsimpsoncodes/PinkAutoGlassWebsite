-- Add market column to page_views (denormalized from user_sessions.market).
--
-- Denormalized so that page-level reports (e.g., /admin/dashboard/pages)
-- can filter on market without joining to user_sessions. The denormalization
-- is safe because a page_view's market is fully determined by its parent
-- session — sessions don't change market mid-stream.
--
-- Populated at write time in src/lib/tracking.ts (set to the parent session's
-- market when a page_view is recorded).
--
-- Safe: pure additive change.

ALTER TABLE page_views
ADD COLUMN IF NOT EXISTS market TEXT NULL;

ALTER TABLE page_views
DROP CONSTRAINT IF EXISTS check_page_views_market;

ALTER TABLE page_views
ADD CONSTRAINT check_page_views_market
CHECK (market IS NULL OR market IN ('colorado', 'arizona'));

CREATE INDEX IF NOT EXISTS idx_page_views_market
ON page_views(market)
WHERE market IS NOT NULL;

COMMENT ON COLUMN page_views.market IS
  'Denormalized from user_sessions.market — the market of the session this page_view belongs to. Populated at write time in tracking.ts. NULL when the parent session has no usable market signal.';
