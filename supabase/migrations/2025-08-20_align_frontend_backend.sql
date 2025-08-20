-- make schema changes idempotent and align with simplified model

-- ensure tracking-friendly base (will no-op if already present)
create extension if not exists pgcrypto;

-- add consent fields if missing
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='leads' and column_name='terms_accepted') then
    alter table public.leads add column terms_accepted boolean not null default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='leads' and column_name='privacy_acknowledgment') then
    alter table public.leads add column privacy_acknowledgment boolean not null default false;
  end if;
end $$;

-- relax location fields (progressive capture) for both naming schemes
do $$
begin
  if exists (select 1 from information_schema.columns where table_name='leads' and column_name='address' and is_nullable='NO') then
    alter table public.leads alter column address drop not null;
  end if;
  if exists (select 1 from information_schema.columns where table_name='leads' and column_name='city' and is_nullable='NO') then
    alter table public.leads alter column city drop not null;
  end if;
  if exists (select 1 from information_schema.columns where table_name='leads' and column_name='state' and is_nullable='NO') then
    alter table public.leads alter column state drop not null;
  end if;
  if exists (select 1 from information_schema.columns where table_name='leads' and column_name='zip' and is_nullable='NO') then
    alter table public.leads alter column zip drop not null;
  end if;

  if exists (select 1 from information_schema.columns where table_name='leads' and column_name='street_address') then
    alter table public.leads rename column street_address to address;
  end if;
  if exists (select 1 from information_schema.columns where table_name='leads' and column_name='zip_code') then
    alter table public.leads rename column zip_code to zip;
  end if;
end $$;

-- drop obsolete/legacy fields if they exist
do $$
begin
  if exists (select 1 from information_schema.columns where table_name='leads' and column_name='best_time_to_call') then
    alter table public.leads drop column best_time_to_call;
  end if;
  if exists (select 1 from information_schema.columns where table_name='leads' and column_name='vehicle_trim') then
    alter table public.leads drop column vehicle_trim;
  end if;
  if exists (select 1 from information_schema.columns where table_name='leads' and column_name like 'utm_%') then
    begin
      alter table public.leads drop column if exists utm_source;
      alter table public.leads drop column if exists utm_medium;
      alter table public.leads drop column if exists utm_campaign;
      alter table public.leads drop column if exists utm_term;
      alter table public.leads drop column if exists utm_content;
    exception when undefined_column then null;
    end;
  end if;
end $$;

-- normalize preferred_date to DATE
do $$
declare v_type text;
begin
  select data_type into v_type
  from information_schema.columns
  where table_name='leads' and column_name='preferred_date';
  if v_type is not null then
    execute $q$ alter table public.leads
      alter column preferred_date type date
      using nullif(preferred_date::text,'')::date $q$;
  end if;
end $$;

-- ensure mobile_service exists and is boolean default false
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='leads' and column_name='mobile_service') then
    alter table public.leads add column mobile_service boolean not null default false;
  else
    alter table public.leads alter column mobile_service set default false;
    update public.leads set mobile_service=false where mobile_service is null;
    alter table public.leads alter column mobile_service set not null;
  end if;
end $$;

-- align service_type values to 'repair' | 'replacement'
do $$
declare has_col bool;
begin
  select exists(select 1 from information_schema.columns where table_name='leads' and column_name='service_type') into has_col;
  if has_col then
    perform 1 from pg_type where typname='service_type';
    if not found then
      create type service_type as enum ('repair','replacement');
    end if;

    -- map existing values to the new enum via CASE cast
    begin
      execute $q$
        alter table public.leads
        alter column service_type type service_type
        using (
          case
            when service_type in ('repair','windshield_repair','chip_repair') then 'repair'::service_type
            when service_type in ('replacement','windshield_replacement','glass_replacement') then 'replacement'::service_type
            else 'repair'::service_type
          end
        )
      $q$;
    exception when invalid_text_representation or datatype_mismatch then
      -- fallback: cast to text then re-run
      execute $q$ alter table public.leads alter column service_type type text using service_type::text $q$;
      execute $q$
        alter table public.leads
        alter column service_type type service_type
        using (
          case
            when service_type in ('repair','windshield_repair','chip_repair') then 'repair'::service_type
            when service_type in ('replacement','windshield_replacement','glass_replacement') then 'replacement'::service_type
            else 'repair'::service_type
          end
        )
      $q$;
    end;
  end if;
end $$;

-- dedupe safeguard
create unique index if not exists leads_phone_day_uidx
on public.leads (lower(phone), preferred_date)
where phone is not null and preferred_date is not null;
