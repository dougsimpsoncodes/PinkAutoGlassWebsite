-- PR 1b: Add gclid, msclkid, utm_term to ringcentral_calls
--
-- callAttribution.ts (canonical resolver) now writes these when it finds a
-- matching phone_click event with click IDs. This enables:
--   - Keyword-level call reporting (utm_term → search-performance/route.ts)
--   - Answering-service lead export eligibility (gclid/msclkid passed to leads)
--   - Consistent attribution fields across ringcentral_calls and leads tables

ALTER TABLE ringcentral_calls
  ADD COLUMN IF NOT EXISTS gclid TEXT,
  ADD COLUMN IF NOT EXISTS msclkid TEXT,
  ADD COLUMN IF NOT EXISTS utm_term TEXT;

CREATE INDEX IF NOT EXISTS idx_ringcentral_calls_gclid
  ON ringcentral_calls(gclid) WHERE gclid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ringcentral_calls_msclkid
  ON ringcentral_calls(msclkid) WHERE msclkid IS NOT NULL;
