-- Kaygo Complete Schema
-- Tables for parcel transport platform between travelers and senders
-- France ↔ Outre-mer (Martinique, Guadeloupe, Guyane, La Réunion, Mayotte)

-- Extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
do $$ begin
  create type kaygo.user_role as enum ('sender', 'traveler', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type kaygo.shipment_status as enum ('pending', 'approved', 'matched', 'in_transit', 'delivered', 'cancelled', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type kaygo.trip_status as enum ('pending', 'active', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type kaygo.service_level as enum ('eco', 'confort', 'premium');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type kaygo.payment_status as enum ('pending', 'held', 'released', 'refunded', 'failed');
exception when duplicate_object then null;
end $$;

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  role kaygo.user_role not null default 'sender',
  phone text,
  avatar_url text,
  is_verified boolean not null default false,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trips (traveler journeys)
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  traveler_id uuid not null references public.profiles(id) on delete cascade,
  departure_city text not null,
  arrival_city text not null,
  departure_date date not null,
  arrival_date date,
  available_weight_kg numeric(8,2) not null check (available_weight_kg > 0 and available_weight_kg <= 30),
  price_per_kg numeric(8,2),
  status kaygo.trip_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Shipments (parcels)
create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  tracking_number text not null unique default upper(substr(md5(random()::text), 1, 10)),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  traveler_id uuid references public.profiles(id) on delete set null,
  trip_id uuid references public.trips(id) on delete set null,
  departure_city text not null,
  arrival_city text not null,
  weight_kg numeric(8,2) not null check (weight_kg > 0 and weight_kg <= 30),
  content_description text not null,
  declared_value_eur numeric(10,2) check (declared_value_eur >= 0),
  service_level kaygo.service_level not null default 'eco',
  price_eur numeric(10,2) not null check (price_eur >= 0),
  status kaygo.shipment_status not null default 'pending',
  pickup_option boolean not null default false,
  delivery_option boolean not null default true,
  pickup_address text,
  delivery_address text,
  estimated_delivery date,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tracking events
create table if not exists public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  event_code text not null,
  label text not null,
  location text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  traveler_id uuid references public.profiles(id) on delete set null,
  amount_eur numeric(10,2) not null check (amount_eur >= 0),
  kaygo_fee_eur numeric(10,2) not null default 0,
  traveler_payout_eur numeric(10,2) not null default 0,
  status kaygo.payment_status not null default 'pending',
  provider text default 'stripe',
  provider_payment_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Estimates log
create table if not exists public.estimates (
  id uuid primary key default gen_random_uuid(),
  departure_city text not null,
  arrival_city text not null,
  weight_kg numeric(8,2) not null,
  service_level kaygo.service_level not null default 'eco',
  pickup_option boolean not null default false,
  delivery_option boolean not null default true,
  result jsonb not null default '{}'::jsonb,
  contact text,
  status text not null default 'estimated',
  created_at timestamptz not null default now()
);

-- Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewed_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  constraint unique_review_per_shipment unique (shipment_id, reviewer_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_trips_traveler on public.trips(traveler_id);
create index if not exists idx_trips_status on public.trips(status);
create index if not exists idx_trips_route on public.trips(departure_city, arrival_city);
create index if not exists idx_shipments_sender on public.shipments(sender_id);
create index if not exists idx_shipments_traveler on public.shipments(traveler_id);
create index if not exists idx_shipments_status on public.shipments(status);
create index if not exists idx_shipments_tracking on public.shipments(tracking_number);
create index if not exists idx_tracking_events_shipment on public.tracking_events(shipment_id, created_at desc);
create index if not exists idx_payments_shipment on public.payments(shipment_id);
create index if not exists idx_estimates_created on public.estimates(created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.shipments enable row level security;
alter table public.tracking_events enable row level security;
alter table public.payments enable row level security;
alter table public.estimates enable row level security;
alter table public.reviews enable row level security;

-- Profiles: users can read their own profile, admins can read all
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trips: travelers can manage their own, everyone can view active
create policy "Anyone can view active trips"
  on public.trips for select
  using (status = 'active' or auth.uid() = traveler_id);

create policy "Travelers can create trips"
  on public.trips for insert
  with check (auth.uid() = traveler_id);

create policy "Travelers can update own trips"
  on public.trips for update
  using (auth.uid() = traveler_id);

-- Shipments: senders see own, travelers see assigned, admins see all
create policy "Senders can view own shipments"
  on public.shipments for select
  using (auth.uid() = sender_id);

create policy "Travelers can view assigned shipments"
  on public.shipments for select
  using (auth.uid() = traveler_id);

create policy "Senders can create shipments"
  on public.shipments for insert
  with check (auth.uid() = sender_id);

create policy "Senders can update own shipments"
  on public.shipments for update
  using (auth.uid() = sender_id);

-- Payments: participants can view
create policy "Participants can view payments"
  on public.payments for select
  using (auth.uid() = sender_id or auth.uid() = traveler_id);

-- Tracking events: participants can view
create policy "Participants can view tracking"
  on public.tracking_events for select
  using (
    exists (select 1 from public.shipments s
      where s.id = tracking_events.shipment_id
      and (s.sender_id = auth.uid() or s.traveler_id = auth.uid()))
  );

-- Estimates: insert for anyone, view own
create policy "Anyone can create estimates"
  on public.estimates for insert
  with check (true);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Create a new shipment with auto-generated tracking number
create or replace function public.create_shipment(
  p_departure_city text,
  p_arrival_city text,
  p_weight_kg numeric,
  p_content_description text,
  p_service_level kaygo.service_level default 'eco',
  p_pickup_option boolean default false,
  p_delivery_option boolean default true,
  p_declared_value_eur numeric default null
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_shipment public.shipments;
  v_price numeric;
begin
  -- Calculate base price (same logic as frontend)
  v_price := 15 + (8 * p_weight_kg);
  if p_service_level = 'confort' then v_price := v_price * 1.35;
  elsif p_service_level = 'premium' then v_price := v_price * 1.75;
  end if;
  if p_pickup_option then v_price := v_price + 5; end if;
  if p_delivery_option then v_price := v_price + 5; end if;

  insert into public.shipments (
    sender_id, departure_city, arrival_city, weight_kg,
    content_description, service_level, price_eur,
    pickup_option, delivery_option, declared_value_eur,
    estimated_delivery
  ) values (
    auth.uid(), p_departure_city, p_arrival_city, p_weight_kg,
    p_content_description, p_service_level, v_price,
    p_pickup_option, p_delivery_option, p_declared_value_eur,
    now()::date + interval '7 days'
  ) returning * into v_shipment;

  -- Create initial tracking event
  insert into public.tracking_events (shipment_id, event_code, label)
  values (v_shipment.id, 'created', 'Colis créé - En attente d\'approbation');

  return row_to_jsonb(v_shipment);
end;
$$;

-- Calculate price estimate (idempotent, no auth required)
create or replace function public.calculate_estimate(
  p_departure text,
  p_arrival text,
  p_weight numeric,
  p_service text default 'eco',
  p_pickup boolean default false,
  p_delivery boolean default true
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_base numeric := 15;
  v_per_kg numeric := 8;
  v_mult numeric := 1.0;
  v_total numeric;
begin
  if p_service = 'confort' then v_mult := 1.35;
  elsif p_service = 'premium' then v_mult := 1.75;
  end if;

  v_total := (v_base + (v_per_kg * p_weight)) * v_mult;
  if p_pickup then v_total := v_total + 5; end if;
  if p_delivery then v_total := v_total + 5; end if;

  return jsonb_build_object(
    'total_eur', round(v_total::numeric, 2),
    'breakdown', jsonb_build_object(
      'base', v_base,
      'per_kg', v_per_kg * p_weight,
      'service_fee', ((v_base + (v_per_kg * p_weight)) * (v_mult - 1)),
      'options', case when p_pickup or p_delivery then 5 + case when p_delivery then 5 else 0 end else 0 end
    )
  );
end;
$$;

grant execute on function public.create_shipment(text, text, numeric, text, kaygo.service_level, boolean, boolean, numeric) to authenticated;
grant execute on function public.calculate_estimate(text, text, numeric, text, boolean, boolean) to anon, authenticated, service_role;

-- ============================================================
-- TRIGGERS
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'sender')::kaygo.user_role
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();