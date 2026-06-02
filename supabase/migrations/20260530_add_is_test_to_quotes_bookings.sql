-- Add is_test flag to the quote/booking tables so test/dev traffic can be
-- excluded from reporting (matches the existing leads.is_test pattern).
-- Reversible label only — no data is deleted. Tagging of existing rows is a
-- prod-specific data step (those test rows only exist in prod) run separately.

ALTER TABLE automated_quotes
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

ALTER TABLE automated_quote_bookings
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

-- Partial indexes so "real-only" reporting queries stay fast.
CREATE INDEX IF NOT EXISTS idx_automated_quotes_not_test
  ON automated_quotes (created_at) WHERE is_test = false;

CREATE INDEX IF NOT EXISTS idx_automated_quote_bookings_not_test
  ON automated_quote_bookings (created_at) WHERE is_test = false;
