create extension if not exists pgcrypto;

create table if not exists public.kaygo_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  role text not null default 'sender' check (role in ('sender', 'traveler', 'receiver', 'admin')),
  first_name text not null,
  last_name text not null,
  phone text,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'rejected', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kaygo_estimates (
  id uuid primary key default gen_random_uuid(),
  request jsonb not null default '{}'::jsonb,
  response jsonb not null default '{}'::jsonb,
  contact text,
  created_at timestamptz not null default now()
);

create table if not exists public.kaygo_trips (
  id uuid primary key default gen_random_uuid(),
  traveler_id uuid references public.kaygo_users(id) on delete set null,
  departure_city text not null,
  arrival_city text not null,
  departure_date date,
  arrival_date date,
  baggage_free_kg numeric not null default 0,
  status text not null default 'pending' check (status in ('draft', 'pending', 'validated', 'full', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kaygo_parcels (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.kaygo_users(id) on delete set null,
  title text,
  departure_city text not null default 'Paris',
  arrival_city text not null default 'Fort-de-France',
  weight_kg numeric not null,
  category text not null default 'general',
  description text,
  pickup_option boolean not null default false,
  delivery_option boolean not null default false,
  status text not null default 'submitted' check (status in ('draft', 'submitted', 'validating', 'validated', 'match_proposed', 'accepted', 'paid', 'in_transit', 'delivered', 'closed', 'dispute', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kaygo_matches (
  id uuid primary key default gen_random_uuid(),
  parcel_id uuid not null references public.kaygo_parcels(id) on delete cascade,
  trip_id uuid not null references public.kaygo_trips(id) on delete cascade,
  proposed_reward numeric not null default 0,
  platform_fee numeric not null default 0,
  total_price numeric not null default 0,
  admin_status text not null default 'pending' check (admin_status in ('pending', 'approved', 'rejected')),
  traveler_status text not null default 'pending' check (traveler_status in ('pending', 'accepted', 'rejected')),
  sender_status text not null default 'pending' check (sender_status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kaygo_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.kaygo_users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.kaygo_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists kaygo_users_touch_updated_at on public.kaygo_users;
create trigger kaygo_users_touch_updated_at before update on public.kaygo_users
for each row execute function public.kaygo_touch_updated_at();

drop trigger if exists kaygo_trips_touch_updated_at on public.kaygo_trips;
create trigger kaygo_trips_touch_updated_at before update on public.kaygo_trips
for each row execute function public.kaygo_touch_updated_at();

drop trigger if exists kaygo_parcels_touch_updated_at on public.kaygo_parcels;
create trigger kaygo_parcels_touch_updated_at before update on public.kaygo_parcels
for each row execute function public.kaygo_touch_updated_at();

drop trigger if exists kaygo_matches_touch_updated_at on public.kaygo_matches;
create trigger kaygo_matches_touch_updated_at before update on public.kaygo_matches
for each row execute function public.kaygo_touch_updated_at();

create index if not exists idx_kaygo_users_role on public.kaygo_users(role);
create index if not exists idx_kaygo_trips_status on public.kaygo_trips(status);
create index if not exists idx_kaygo_parcels_status on public.kaygo_parcels(status);
create index if not exists idx_kaygo_matches_admin_status on public.kaygo_matches(admin_status);
create index if not exists idx_kaygo_audit_logs_created_at on public.kaygo_audit_logs(created_at desc);

alter table public.kaygo_users enable row level security;
alter table public.kaygo_estimates enable row level security;
alter table public.kaygo_trips enable row level security;
alter table public.kaygo_parcels enable row level security;
alter table public.kaygo_matches enable row level security;
alter table public.kaygo_audit_logs enable row level security;

-- Access is intentionally server-side through the Edge Function service-role key.
drop policy if exists "deny direct kaygo_users access" on public.kaygo_users;
create policy "deny direct kaygo_users access" on public.kaygo_users for all using (false) with check (false);

drop policy if exists "deny direct kaygo_estimates access" on public.kaygo_estimates;
create policy "deny direct kaygo_estimates access" on public.kaygo_estimates for all using (false) with check (false);

drop policy if exists "deny direct kaygo_trips access" on public.kaygo_trips;
create policy "deny direct kaygo_trips access" on public.kaygo_trips for all using (false) with check (false);

drop policy if exists "deny direct kaygo_parcels access" on public.kaygo_parcels;
create policy "deny direct kaygo_parcels access" on public.kaygo_parcels for all using (false) with check (false);

drop policy if exists "deny direct kaygo_matches access" on public.kaygo_matches;
create policy "deny direct kaygo_matches access" on public.kaygo_matches for all using (false) with check (false);

drop policy if exists "deny direct kaygo_audit_logs access" on public.kaygo_audit_logs;
create policy "deny direct kaygo_audit_logs access" on public.kaygo_audit_logs for all using (false) with check (false);
