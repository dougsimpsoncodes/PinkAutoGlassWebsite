-- Google Ads Recommendations Tracking
-- Stores actionable recommendations and their implementation status

CREATE TABLE IF NOT EXISTS google_ads_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Recommendation details
  category TEXT NOT NULL, -- 'negative_keywords', 'increase_bids', 'improve_ad_copy', etc.
  priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Data
  search_term TEXT,
  current_metrics JSONB, -- { clicks, impressions, cost, conversions, etc }
  expected_impact TEXT,

  -- Action tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'archived')),
  assigned_to TEXT,
  completed_at TIMESTAMPTZ,
  completed_by TEXT,

  -- Results tracking
  implemented_action TEXT, -- What they actually did
  results_after JSONB, -- Metrics after implementation
  notes TEXT
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON google_ads_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_category ON google_ads_recommendations(category);
CREATE INDEX IF NOT EXISTS idx_recommendations_created ON google_ads_recommendations(created_at DESC);

-- Enable RLS
ALTER TABLE google_ads_recommendations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users (admin) to manage recommendations
CREATE POLICY "Allow authenticated access to recommendations"
  ON google_ads_recommendations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow anon access for service role (our API)
CREATE POLICY "Allow service role access to recommendations"
  ON google_ads_recommendations
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
