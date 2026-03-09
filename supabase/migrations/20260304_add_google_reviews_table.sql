-- Google Reviews cache table
-- Populated by /api/admin/sync/gbp-reviews on each sync

CREATE TABLE IF NOT EXISTS google_reviews (
  review_id       TEXT PRIMARY KEY,
  reviewer_name   TEXT NOT NULL,
  rating          INTEGER NOT NULL,
  comment         TEXT,
  published_at    DATE,
  synced_at       TIMESTAMPTZ DEFAULT NOW(),
  source          TEXT DEFAULT 'google_places_api'
);

-- Track aggregate stats separately (total count comes from Places API, not just verbatims)
CREATE TABLE IF NOT EXISTS google_reviews_meta (
  id              SERIAL PRIMARY KEY,
  user_rating_count INTEGER,
  average_rating  NUMERIC(3,2),
  place_id        TEXT,
  synced_at       TIMESTAMPTZ DEFAULT NOW()
);
