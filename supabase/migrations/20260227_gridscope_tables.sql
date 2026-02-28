-- GridScope Phase 1: geo-grid rank tracking tables

CREATE TABLE IF NOT EXISTS public.gridscope_scans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city        TEXT NOT NULL,
  keyword     TEXT NOT NULL,
  grid_size   INTEGER NOT NULL DEFAULT 7,
  lat_center  NUMERIC NOT NULL,
  lng_center  NUMERIC NOT NULL,
  lat_step    NUMERIC NOT NULL,
  lng_step    NUMERIC NOT NULL,
  node_count  INTEGER,
  solv_pct    NUMERIC,
  avg_rank    NUMERIC,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gridscope_results (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id     UUID NOT NULL REFERENCES public.gridscope_scans(id) ON DELETE CASCADE,
  row_index   INTEGER NOT NULL,
  col_index   INTEGER NOT NULL,
  lat         NUMERIC NOT NULL,
  lng         NUMERIC NOT NULL,
  rank        INTEGER,
  competitors JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gridscope_results_scan_id
  ON public.gridscope_results(scan_id);

CREATE INDEX IF NOT EXISTS idx_gridscope_scans_city_keyword
  ON public.gridscope_scans(city, keyword, created_at DESC);
