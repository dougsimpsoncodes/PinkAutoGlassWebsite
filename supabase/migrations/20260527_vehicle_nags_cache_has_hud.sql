-- Add has_hud column to vehicle_nags_cache.
-- Drives the +$75 HUD markup adder introduced with the markup-v1 pricing
-- engine. Derived at cache-write from AutoBolt's features[] array.
--
-- Existing rows default to false; the coincident NAGS_MAP_VERSION bump to
-- 'v3-with-hud-and-markup' invalidates them so they refresh on next decode
-- with a real has_hud value.

ALTER TABLE public.vehicle_nags_cache
  ADD COLUMN IF NOT EXISTS has_hud boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.vehicle_nags_cache.has_hud IS
  'Vehicle has a heads-up display windshield. Derived from AutoBolt features[] at cache-write time. Drives the +$75 HUD markup adder in the markup-v1 pricing engine.';
