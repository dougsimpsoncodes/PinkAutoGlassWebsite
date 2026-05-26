-- Attribution health monitoring snapshots
-- Stores daily measurement-quality metrics for call attribution alerting.

CREATE TABLE IF NOT EXISTS public.attribution_health_snapshots (
  snapshot_date date PRIMARY KEY,
  window_start_date date NOT NULL,
  window_end_date date NOT NULL,
  raw_inbound_calls integer NOT NULL DEFAULT 0,
  qualifying_calls integer NOT NULL DEFAULT 0,
  attributed_calls integer NOT NULL DEFAULT 0,
  google_call_view_count integer NOT NULL DEFAULT 0,
  microsoft_uploaded_call_count integer NOT NULL DEFAULT 0,
  direct_match_count integer NOT NULL DEFAULT 0,
  direct_match_conflict_count integer NOT NULL DEFAULT 0,
  unknown_count integer NOT NULL DEFAULT 0,
  unknown_rate numeric(8,5) NOT NULL DEFAULT 0,
  conflict_rate numeric(8,5) NOT NULL DEFAULT 0,
  google_rate numeric(8,5) NOT NULL DEFAULT 0,
  microsoft_rate numeric(8,5) NOT NULL DEFAULT 0,
  direct_rate numeric(8,5) NOT NULL DEFAULT 0,
  avg_confidence numeric(8,2) NOT NULL DEFAULT 0,
  data_freshness_lag_hours numeric(8,2),
  latest_ringcentral_sync_at timestamptz,
  latest_qualifying_call_at timestamptz,
  job_runtime_seconds numeric(8,2),
  source text NOT NULL DEFAULT 'check-attribution-health',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attribution_health_snapshots_window_end
  ON public.attribution_health_snapshots (window_end_date DESC);

CREATE OR REPLACE FUNCTION public.set_attribution_health_snapshots_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_attribution_health_snapshots_updated_at
  ON public.attribution_health_snapshots;

CREATE TRIGGER trg_attribution_health_snapshots_updated_at
BEFORE UPDATE ON public.attribution_health_snapshots
FOR EACH ROW
EXECUTE FUNCTION public.set_attribution_health_snapshots_updated_at();
