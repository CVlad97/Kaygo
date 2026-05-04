create extension if not exists pgcrypto;

create schema if not exists kaygo;
comment on schema kaygo is 'KayGo pilot isolated schema for France-Martinique parcel matching.';

create table if not exists kaygo.estimates (
  id uuid primary key default gen_random_uuid(),
  departure_city text not null default 'Paris',
  arrival_city text not null default 'Fort-de-France',
  weight_kg numeric(8,2) not null check (weight_kg > 0 and weight_kg <= 30),
  service_level text not null default 'eco' check (service_level in ('eco', 'confort', 'premium')),
  urgency_level text not null default 'normal' check (urgency_level in ('normal', 'urgent')),
  pickup_option boolean not null default false,
  delivery_option boolean not null default true,
  contact text,
  result jsonb not null default '{}'::jsonb,
  status text not null default 'estimated' check (status in ('estimated', 'contacted', 'validated', 'rejected', 'converted')),
  created_at timestamptz not null default now()
);

create table if not exists kaygo.trips (
  id uuid primary key default gen_random_uuid(),
  traveler_name text,
  traveler_contact text,
  departure_city text not null,
  arrival_city text not null,
  departure_date date,
  available_weight_kg numeric(8,2) check (available_weight_kg >= 0),
  status text not null default 'pending' check (status in ('pending', 'verified', 'active', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists kaygo.parcels (
  id uuid primary key default gen_random_uuid(),
  sender_name text,
  sender_contact text,
  recipient_name text,
  recipient_contact text,
  departure_city text not null,
  arrival_city text not null,
  weight_kg numeric(8,2) check (weight_kg > 0 and weight_kg <= 30),
  declared_value_eur numeric(10,2) check (declared_value_eur >= 0),
  content_description text not null,
  risk_level text not null default 'review' check (risk_level in ('low', 'review', 'blocked')),
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'approved', 'matched', 'in_transit', 'delivered', 'rejected', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists kaygo.matches (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references kaygo.trips(id) on delete set null,
  parcel_id uuid references kaygo.parcels(id) on delete set null,
  status text not null default 'proposed' check (status in ('proposed', 'accepted', 'rejected', 'completed', 'cancelled')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists kaygo.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor text,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists estimates_created_at_idx on kaygo.estimates(created_at desc);
create index if not exists trips_status_idx on kaygo.trips(status);
create index if not exists parcels_status_idx on kaygo.parcels(status);
create index if not exists matches_status_idx on kaygo.matches(status);
create index if not exists audit_logs_created_at_idx on kaygo.audit_logs(created_at desc);

alter table kaygo.estimates enable row level security;
alter table kaygo.trips enable row level security;
alter table kaygo.parcels enable row level security;
alter table kaygo.matches enable row level security;
alter table kaygo.audit_logs enable row level security;

revoke all on schema kaygo from public;
revoke all on all tables in schema kaygo from anon, authenticated;
revoke all on all sequences in schema kaygo from anon, authenticated;

create or replace function public.kaygo_create_estimate(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = kaygo, public
as $$
declare
  estimate_id uuid;
begin
  insert into kaygo.estimates (
    departure_city,
    arrival_city,
    weight_kg,
    service_level,
    urgency_level,
    pickup_option,
    delivery_option,
    contact,
    result,
    status
  ) values (
    coalesce(payload->>'departure_city', 'Paris'),
    coalesce(payload->>'arrival_city', 'Fort-de-France'),
    coalesce((payload->>'weight_kg')::numeric, 1),
    coalesce(payload->>'service_level', 'eco'),
    coalesce(payload->>'urgency_level', 'normal'),
    coalesce((payload->>'pickup_option')::boolean, false),
    coalesce((payload->>'delivery_option')::boolean, true),
    payload->>'contact',
    coalesce(payload->'result', '{}'::jsonb),
    coalesce(payload->>'status', 'estimated')
  ) returning id into estimate_id;

  return estimate_id;
end;
$$;

revoke all on function public.kaygo_create_estimate(jsonb) from public, anon, authenticated;

grant execute on function public.kaygo_create_estimate(jsonb) to service_role;

comment on table kaygo.estimates is 'KayGo pilot estimates accessed through kaygo-api Edge Function only.';
comment on table kaygo.trips is 'KayGo pilot traveler trips accessed through kaygo-api Edge Function only.';
comment on table kaygo.parcels is 'KayGo pilot parcel requests accessed through kaygo-api Edge Function only.';
comment on table kaygo.matches is 'KayGo pilot matching proposals accessed through kaygo-api Edge Function only.';
comment on table kaygo.audit_logs is 'KayGo pilot audit logs accessed through kaygo-api Edge Function only.';
comment on function public.kaygo_create_estimate(jsonb) is 'Server-side helper used by kaygo-api to persist pricing estimates in the isolated kaygo schema.';
