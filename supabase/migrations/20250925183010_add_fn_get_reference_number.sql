-- Add fn_get_reference_number RPC function
-- This function retrieves the reference_number for a given lead ID
-- Uses SECURITY DEFINER to bypass RLS and access the leads table
-- Only grants execute permission to anon role

-- Drop function if it already exists
drop function if exists public.fn_get_reference_number(uuid);

-- Create the function
create or replace function public.fn_get_reference_number(p_id uuid)
returns text
language sql
security definer
stable
as $$
  select reference_number
  from public.leads
  where id = p_id
$$;

-- Revoke all permissions by default
revoke all on function public.fn_get_reference_number(uuid) from public;

-- Grant execute permission only to anon role
grant execute on function public.fn_get_reference_number(uuid) to anon;

-- Add comment for documentation
comment on function public.fn_get_reference_number(uuid) is
  'Retrieves the reference number for a lead by ID. Returns NULL if lead not found.';