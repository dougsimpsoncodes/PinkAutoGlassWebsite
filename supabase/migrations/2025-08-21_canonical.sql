begin;

do $$
begin
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid=t.typnamespace where n.nspname='public' and t.typname='service_type') then
    create type public.service_type as enum ('repair','replacement');
  else
    if exists (select 1 from pg_type where typname='service_type') then
      if exists (select 1 from pg_enum e join pg_type t on t.oid=e.enumtypid where t.typname='service_type' and e.enumlabel not in ('repair','replacement')) then
        create type public.service_type_new as enum ('repair','replacement');
        alter table if exists public.leads alter column service_type type public.service_type_new using service_type::text::public.service_type_new;
        drop type public.service_type;
        alter type public.service_type_new rename to service_type;
      end if;
    end if;
  end if;
end $$;

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  client_generated_id uuid,
  first_name text,
  last_name text,
  email text,
  phone_e164 text,
  address text,
  city text,
  state text,
  zip text,
  vehicle_year int,
  vehicle_make text,
  vehicle_model text,
  service_type public.service_type,
  terms_accepted boolean default false,
  privacy_acknowledgment boolean default false,
  client_id text,
  session_id text,
  first_touch jsonb,
  last_touch jsonb,
  created_by uuid,
  constraint leads_phone_chk check (phone_e164 is null or phone_e164 ~ '^\+?[1-9]\d{1,14}$')
);

do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='leads' and column_name='street_address') then
    alter table public.leads rename column street_address to address;
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='leads' and column_name='zip_code') then
    alter table public.leads rename column zip_code to zip;
  end if;
end $$;

create table if not exists public.media (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  lead_id uuid references public.leads(id) on delete cascade,
  path text not null,
  mime_type text,
  size_bytes bigint
);

create or replace function public.set_row_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at before update on public.leads
for each row execute procedure public.set_row_updated_at();

create table if not exists public.request_context (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  ip inet,
  user_agent text
);

create or replace function public.fn_insert_lead(
  p_id uuid,
  p_payload jsonb
) returns uuid
language plpgsql
security definer
as $$
declare
  v_id uuid := coalesce(p_id, uuid_generate_v4());
begin
  insert into public.leads(
    id, client_generated_id, first_name, last_name, email, phone_e164, address, city, state, zip,
    vehicle_year, vehicle_make, vehicle_model, service_type, terms_accepted, privacy_acknowledgment,
    client_id, session_id, first_touch, last_touch, created_by
  )
  values(
    v_id,
    (p_payload->>'clientGeneratedId')::uuid,
    p_payload->>'firstName',
    p_payload->>'lastName',
    p_payload->>'email',
    p_payload->>'phoneE164',
    p_payload->>'address',
    p_payload->>'city',
    p_payload->>'state',
    p_payload->>'zip',
    nullif(p_payload->>'vehicleYear','')::int,
    p_payload->>'vehicleMake',
    p_payload->>'vehicleModel',
    nullif(p_payload->>'serviceType','')::public.service_type,
    coalesce((p_payload->>'termsAccepted')::boolean,false),
    coalesce((p_payload->>'privacyAcknowledgment')::boolean,false),
    p_payload->>'clientId',
    p_payload->>'sessionId',
    coalesce(p_payload->'firstTouch','{}'::jsonb),
    coalesce(p_payload->'lastTouch','{}'::jsonb),
    null
  );
  return v_id;
end $$;

revoke all on function public.fn_insert_lead(uuid,jsonb) from public;
grant execute on function public.fn_insert_lead(uuid,jsonb) to anon;

create or replace function public.fn_add_media(
  p_lead_id uuid,
  p_path text,
  p_mime text,
  p_size bigint
) returns uuid
language plpgsql
security definer
as $$
declare
  v_id uuid := uuid_generate_v4();
begin
  insert into public.media(id, lead_id, path, mime_type, size_bytes) values (v_id, p_lead_id, p_path, p_mime, p_size);
  return v_id;
end $$;

revoke all on function public.fn_add_media(uuid,text,text,bigint) from public;
grant execute on function public.fn_add_media(uuid,text,text,bigint) to anon;

alter table public.leads enable row level security;
alter table public.media enable row level security;

drop policy if exists anon_leads_read on public.leads;
drop policy if exists anon_leads_write on public.leads;
drop policy if exists anon_media_all on public.media;

create policy anon_leads_insert_via_fn on public.leads
  for insert
  to anon
  with check (true);

create policy anon_leads_select_none on public.leads
  for select to anon using (false);

create policy anon_media_insert_via_fn on public.media
  for insert to anon with check (true);

create policy anon_media_select_none on public.media
  for select to anon using (false);

commit;