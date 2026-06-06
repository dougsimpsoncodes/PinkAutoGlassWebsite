-- Track lower-confidence RingCentral session fallback counts separately from
-- deterministic/direct attribution methods in attribution-health snapshots.

ALTER TABLE public.attribution_health_snapshots
ADD COLUMN IF NOT EXISTS session_fallback_count integer NOT NULL DEFAULT 0;
