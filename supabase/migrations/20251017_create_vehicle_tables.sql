-- Create vehicle makes and models tables for the booking system
-- This allows the frontend to dynamically populate vehicle dropdowns

begin;

-- Vehicle makes table
create table if not exists public.vehicle_makes (
  id serial primary key,
  make text not null unique,
  created_at timestamptz not null default now()
);

-- Vehicle models table (linked to makes)
create table if not exists public.vehicle_models (
  id serial primary key,
  make_id integer not null references public.vehicle_makes(id) on delete cascade,
  model text not null,
  created_at timestamptz not null default now(),
  unique(make_id, model)
);

-- Create indexes for performance
create index if not exists idx_vehicle_models_make_id on public.vehicle_models(make_id);
create index if not exists idx_vehicle_makes_make on public.vehicle_makes(make);

-- Enable RLS
alter table public.vehicle_makes enable row level security;
alter table public.vehicle_models enable row level security;

-- Allow anonymous users to read vehicle data (needed for booking form)
create policy anon_vehicle_makes_select on public.vehicle_makes
  for select to anon using (true);

create policy anon_vehicle_models_select on public.vehicle_models
  for select to anon using (true);

-- Grant select permissions to anon
grant select on public.vehicle_makes to anon;
grant select on public.vehicle_models to anon;

-- Create a function to get models for a specific make
create or replace function public.fn_get_models_by_make(p_make text)
returns table(model text)
language sql
security definer
stable
as $$
  select m.model
  from public.vehicle_models m
  join public.vehicle_makes mk on mk.id = m.make_id
  where mk.make = p_make
  order by m.model;
$$;

grant execute on function public.fn_get_models_by_make(text) to anon;

-- Create a function to get all makes
create or replace function public.fn_get_all_makes()
returns table(make text)
language sql
security definer
stable
as $$
  select make
  from public.vehicle_makes
  order by make;
$$;

grant execute on function public.fn_get_all_makes() to anon;

commit;
