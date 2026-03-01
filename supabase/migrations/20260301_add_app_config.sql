-- Store app-level secrets/config that may rotate (service role only).
create table if not exists app_config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table app_config enable row level security;

-- No public policies. Service role bypasses RLS by default.
