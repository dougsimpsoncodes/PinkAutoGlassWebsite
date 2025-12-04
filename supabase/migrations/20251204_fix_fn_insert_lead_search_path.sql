-- Fix fn_insert_lead search_path to include extensions schema
-- The uuid_generate_v4() function lives in the extensions schema (Supabase default)
-- Previous migration set search_path = public which broke UUID generation

ALTER FUNCTION public.fn_insert_lead(uuid, jsonb) SET search_path = public, extensions;
