-- Fix function search_path security warnings
-- Setting explicit search_path prevents privilege escalation attacks

-- Fix fn_insert_lead
ALTER FUNCTION public.fn_insert_lead(uuid, jsonb) SET search_path = public;

-- Fix update_roi_daily_summary
ALTER FUNCTION public.update_roi_daily_summary() SET search_path = public;

-- Fix update_microsoft_ads_timestamp
ALTER FUNCTION public.update_microsoft_ads_timestamp() SET search_path = public;

-- Fix update_gsc_timestamp
ALTER FUNCTION public.update_gsc_timestamp() SET search_path = public;
