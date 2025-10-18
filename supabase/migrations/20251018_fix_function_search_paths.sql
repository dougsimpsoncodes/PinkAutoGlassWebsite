-- Fix function search_path security warnings
-- Adds SET search_path = public to all functions to prevent search_path hijacking

BEGIN;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix generate_reference_number function
CREATE OR REPLACE FUNCTION generate_reference_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Generate reference number if not provided
  IF NEW.reference_number IS NULL THEN
    NEW.reference_number = 'PAG-' || TO_CHAR(NOW(), 'YYMMDD') || '-' ||
                           LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Fix fn_get_models_by_make function
CREATE OR REPLACE FUNCTION public.fn_get_models_by_make(p_make text)
RETURNS TABLE(model text)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT m.model
  FROM public.vehicle_models m
  JOIN public.vehicle_makes mk ON mk.id = m.make_id
  WHERE mk.make = p_make
  ORDER BY m.model;
$$;

-- Fix fn_get_all_makes function
CREATE OR REPLACE FUNCTION public.fn_get_all_makes()
RETURNS TABLE(make text)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT make
  FROM public.vehicle_makes
  ORDER BY make;
$$;

COMMIT;
