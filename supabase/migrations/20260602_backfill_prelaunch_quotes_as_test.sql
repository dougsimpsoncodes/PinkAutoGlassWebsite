-- Tag all automated quotes before June 1 Mountain time as test/dev data.
-- 2026-06-01T06:00:00Z = midnight MDT (UTC-6).
-- Everything before this date is pre-launch test traffic; June 1 onward is real.
UPDATE public.automated_quotes
SET is_test = true
WHERE created_at < '2026-06-01T06:00:00Z'
  AND (is_test IS NULL OR is_test = false);
