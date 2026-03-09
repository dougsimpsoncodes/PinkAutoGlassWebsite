-- Omega data quality flags
-- Written by cleanup lib after each sync/import.
-- Admin reviews and resolves via /api/admin/omega-flags

CREATE TABLE IF NOT EXISTS omega_data_flags (
  id             SERIAL PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  field_name     TEXT NOT NULL,
  raw_value      TEXT,
  flag_reason    TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  resolved_at    TIMESTAMPTZ,
  resolution     TEXT
);

CREATE INDEX IF NOT EXISTS omega_data_flags_unresolved
  ON omega_data_flags (invoice_number, field_name)
  WHERE resolved_at IS NULL;
