create extension if not exists pgcrypto;

create schema if not exists kaygo;

-- ============================================================
-- KayGo payments + flight/tracking V1
-- Multi-provider payment orchestration: Stripe, PayPal, links,
-- bank transfer, manual and controlled crypto.
-- Flight/tracking events drive payout eligibility.
-- ============================================================

do $$ begin create type kaygo.payment_provider as enum ('stripe','paypal','crypto','bank_transfer','manual'); exception when duplicate_object then null; end $$;
do $$ begin create type kaygo.payment_status as enum ('pending','requires_action','payment_link_sent','paid','held','release_pending','released','partially_refunded','refunded','failed','cancelled','disputed','expired'); exception when duplicate_object then null; end $$;
do $$ begin create type kaygo.payment_link_status as enum ('active','paid','expired','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type kaygo.crypto_payment_status as enum ('pending','underpaid','confirmed','expired','failed','refunded_manual'); exception when duplicate_object then null; end $$;
do $$ begin create type kaygo.payout_status as enum ('blocked','eligible','scheduled','paid','failed','cancelled','disputed'); exception when duplicate_object then null; end $$;
do $$ begin create type kaygo.flight_status as enum ('unknown','scheduled','check_in_open','boarding','departed','in_air','delayed','diverted','landed','cancelled','baggage_claim','completed'); exception when duplicate_object then null; end $$;
do $$ begin create type kaygo.tracking_visibility as enum ('public','participants','admin_only'); exception when duplicate_object then null; end $$;

create table if not exists kaygo.payment_methods (
  id uuid primary key default gen_random_uuid(),
  provider kaygo.payment_provider not null,
  code text not null unique,
  label text not null,
  enabled boolean not null default false,
  supports_refund boolean not null default false,
  supports_payout boolean not null default false,
  supports_dispute boolean not null default false,
  supports_manual_review boolean not null default true,
  min_amount_eur numeric(10,2) not null default 1 check (min_amount_eur >= 0),
  max_amount_eur numeric(10,2) check (max_amount_eur is null or max_amount_eur >= min_amount_eur),
  risk_level text not null default 'medium' check (risk_level in ('low','medium','high','blocked')),
  settlement_delay_days integer not null default 0 check (settlement_delay_days >= 0 and settlement_delay_days <= 90),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists kaygo.payment_intents (
  id uuid primary key default gen_random_uuid(),
  public_ref text not null unique default kaygo.generate_public_ref('PAY'),
  shipment_id uuid references kaygo.shipments(id) on delete set null,
  booking_id uuid references kaygo.bookings(id) on delete set null,
  sender_id uuid references kaygo.profiles(id) on delete set null,
  traveler_id uuid references kaygo.profiles(id) on delete set null,
  provider kaygo.payment_provider not null,
  provider_payment_id text,
  provider_checkout_url text,
  provider_customer_id text,
  currency text not null default 'EUR',
  gross_amount_eur numeric(10,2) not null check (gross_amount_eur >= 0),
  kaygo_fee_eur numeric(10,2) not null default 0 check (kaygo_fee_eur >= 0),
  provider_fee_eur numeric(10,2) not null default 0 check (provider_fee_eur >= 0),
  traveler_payout_eur numeric(10,2) not null default 0 check (traveler_payout_eur >= 0),
  reserve_amount_eur numeric(10,2) not null default 0 check (reserve_amount_eur >= 0),
  status kaygo.payment_status not null default 'pending',
  paid_at timestamptz,
  held_at timestamptz,
  released_at timestamptz,
  refunded_at timestamptz,
  disputed_at timestamptz,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_intents_provider_payment_unique unique (provider, provider_payment_id)
);

create table if not exists kaygo.payment_links (
  id uuid primary key default gen_random_uuid(),
  payment_intent_id uuid not null references kaygo.payment_intents(id) on delete cascade,
  provider kaygo.payment_provider not null,
  url text not null,
  status kaygo.payment_link_status not null default 'active',
  sent_to text,
  sent_channel text not null default 'whatsapp',
  expires_at timestamptz,
  created_by uuid references kaygo.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists kaygo.crypto_payments (
  id uuid primary key default gen_random_uuid(),
  payment_intent_id uuid not null references kaygo.payment_intents(id) on delete cascade,
  network text not null,
  asset text not null default 'USDC',
  expected_amount numeric(24,8) not null check (expected_amount > 0),
  received_amount numeric(24,8),
  wallet_address text,
  transaction_hash text,
  confirmation_count integer not null default 0 check (confirmation_count >= 0),
  required_confirmations integer not null default 3 check (required_confirmations >= 1),
  status kaygo.crypto_payment_status not null default 'pending',
  rate_reference text,
  rate_expires_at timestamptz,
  expires_at timestamptz,
  confirmed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crypto_payments_tx_unique unique (network, transaction_hash)
);

create table if not exists kaygo.payout_intents (
  id uuid primary key default gen_random_uuid(),
  public_ref text not null unique default kaygo.generate_public_ref('POUT'),
  payment_intent_id uuid references kaygo.payment_intents(id) on delete set null,
  shipment_id uuid references kaygo.shipments(id) on delete set null,
  traveler_id uuid references kaygo.profiles(id) on delete set null,
  provider kaygo.payment_provider not null default 'stripe',
  provider_transfer_id text,
  currency text not null default 'EUR',
  amount_eur numeric(10,2) not null check (amount_eur >= 0),
  reserve_amount_eur numeric(10,2) not null default 0 check (reserve_amount_eur >= 0),
  status kaygo.payout_status not null default 'blocked',
  eligible_at timestamptz,
  scheduled_at timestamptz,
  paid_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists kaygo.payment_events (
  id uuid primary key default gen_random_uuid(),
  payment_intent_id uuid references kaygo.payment_intents(id) on delete cascade,
  payout_intent_id uuid references kaygo.payout_intents(id) on delete cascade,
  provider kaygo.payment_provider,
  event_type text not null,
  old_status text,
  new_status text,
  provider_event_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint payment_events_provider_event_unique unique (provider, provider_event_id)
);

create table if not exists kaygo.refund_requests (
  id uuid primary key default gen_random_uuid(),
  payment_intent_id uuid not null references kaygo.payment_intents(id) on delete cascade,
  requested_by uuid references kaygo.profiles(id) on delete set null,
  provider_refund_id text,
  amount_eur numeric(10,2) not null check (amount_eur > 0),
  reason text not null,
  status text not null default 'requested' check (status in ('requested','approved','rejected','processing','refunded','failed')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists kaygo.provider_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider kaygo.payment_provider not null,
  provider_event_id text not null,
  event_type text not null,
  signature_valid boolean not null default false,
  processed_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint provider_webhook_events_unique unique (provider, provider_event_id)
);

create table if not exists kaygo.flights (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references kaygo.trips(id) on delete cascade,
  traveler_id uuid references kaygo.profiles(id) on delete set null,
  airline_code text,
  airline_name text,
  flight_number text not null,
  departure_airport_code text not null,
  arrival_airport_code text not null,
  scheduled_departure_at timestamptz not null,
  scheduled_arrival_at timestamptz,
  estimated_departure_at timestamptz,
  estimated_arrival_at timestamptz,
  actual_departure_at timestamptz,
  actual_arrival_at timestamptz,
  status kaygo.flight_status not null default 'unknown',
  delay_minutes integer not null default 0 check (delay_minutes >= 0),
  terminal_departure text,
  terminal_arrival text,
  gate_departure text,
  gate_arrival text,
  baggage_claim text,
  external_provider text,
  external_flight_id text,
  raw_payload jsonb not null default '{}'::jsonb,
  last_checked_at timestamptz,
  next_check_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint flights_unique_trip_flight unique (trip_id, flight_number, scheduled_departure_at)
);

create table if not exists kaygo.flight_status_events (
  id uuid primary key default gen_random_uuid(),
  flight_id uuid not null references kaygo.flights(id) on delete cascade,
  old_status text,
  new_status text not null,
  old_estimated_departure_at timestamptz,
  new_estimated_departure_at timestamptz,
  old_estimated_arrival_at timestamptz,
  new_estimated_arrival_at timestamptz,
  delay_minutes integer not null default 0,
  source text not null default 'system',
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists kaygo.shipment_tracking_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references kaygo.shipments(id) on delete cascade,
  parcel_id uuid references kaygo.parcels(id) on delete set null,
  trip_id uuid references kaygo.trips(id) on delete set null,
  flight_id uuid references kaygo.flights(id) on delete set null,
  actor_id uuid references kaygo.profiles(id) on delete set null,
  event_code text not null,
  public_label text not null,
  internal_note text,
  location_country text,
  location_city text,
  location_airport_code text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  visibility kaygo.tracking_visibility not null default 'participants',
  visible_to_sender boolean not null default true,
  visible_to_traveler boolean not null default true,
  visible_to_recipient boolean not null default true,
  visible_to_admin_only boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists kaygo.payout_eligibility_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references kaygo.shipments(id) on delete cascade,
  traveler_id uuid references kaygo.profiles(id) on delete set null,
  status text not null default 'not_eligible' check (status in ('not_eligible','pending_pickup','pending_flight_departure','pending_arrival','pending_delivery_proof','pending_recipient_confirmation','eligible_for_payout','payout_scheduled','payout_paid','payout_blocked','disputed')),
  reason text,
  eligible_at timestamptz,
  payout_scheduled_at timestamptz,
  payout_paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_methods_provider_idx on kaygo.payment_methods(provider, enabled);
create index if not exists payment_intents_shipment_idx on kaygo.payment_intents(shipment_id, status);
create index if not exists payment_intents_sender_idx on kaygo.payment_intents(sender_id, created_at desc);
create index if not exists payment_links_intent_idx on kaygo.payment_links(payment_intent_id, status);
create index if not exists crypto_payments_intent_idx on kaygo.crypto_payments(payment_intent_id, status);
create index if not exists payout_intents_shipment_idx on kaygo.payout_intents(shipment_id, status);
create index if not exists payment_events_intent_idx on kaygo.payment_events(payment_intent_id, created_at desc);
create index if not exists provider_webhook_events_provider_idx on kaygo.provider_webhook_events(provider, event_type, created_at desc);
create index if not exists flights_trip_idx on kaygo.flights(trip_id);
create index if not exists flights_status_next_check_idx on kaygo.flights(status, next_check_at);
create index if not exists flight_status_events_flight_idx on kaygo.flight_status_events(flight_id, created_at desc);
create index if not exists shipment_tracking_events_shipment_idx on kaygo.shipment_tracking_events(shipment_id, created_at desc);
create index if not exists payout_eligibility_events_shipment_idx on kaygo.payout_eligibility_events(shipment_id, created_at desc);

alter table kaygo.payment_methods enable row level security;
alter table kaygo.payment_intents enable row level security;
alter table kaygo.payment_links enable row level security;
alter table kaygo.crypto_payments enable row level security;
alter table kaygo.payout_intents enable row level security;
alter table kaygo.payment_events enable row level security;
alter table kaygo.refund_requests enable row level security;
alter table kaygo.provider_webhook_events enable row level security;
alter table kaygo.flights enable row level security;
alter table kaygo.flight_status_events enable row level security;
alter table kaygo.shipment_tracking_events enable row level security;
alter table kaygo.payout_eligibility_events enable row level security;

grant select, insert, update, delete on all tables in schema kaygo to authenticated;
grant all on all tables in schema kaygo to service_role;
grant all on all sequences in schema kaygo to service_role;

insert into kaygo.payment_methods (provider, code, label, enabled, supports_refund, supports_payout, supports_dispute, supports_manual_review, min_amount_eur, max_amount_eur, risk_level, settlement_delay_days)
values
  ('stripe','stripe_card','Carte bancaire / Apple Pay / Google Pay via Stripe',true,true,false,true,false,1,null,'low',0),
  ('stripe','stripe_payment_link','Lien de paiement Stripe',true,true,false,true,true,1,null,'low',0),
  ('paypal','paypal','PayPal',false,true,false,true,true,1,null,'medium',1),
  ('bank_transfer','bank_transfer','Virement bancaire',false,false,false,false,true,10,null,'medium',2),
  ('crypto','crypto_usdc','Crypto stablecoin USDC contrôlée',false,false,false,false,true,5,100,'high',0),
  ('manual','manual','Paiement manuel validé admin',true,false,false,false,true,1,null,'high',0)
on conflict (code) do update set
  label = excluded.label,
  enabled = excluded.enabled,
  supports_refund = excluded.supports_refund,
  supports_payout = excluded.supports_payout,
  supports_dispute = excluded.supports_dispute,
  supports_manual_review = excluded.supports_manual_review,
  min_amount_eur = excluded.min_amount_eur,
  max_amount_eur = excluded.max_amount_eur,
  risk_level = excluded.risk_level,
  settlement_delay_days = excluded.settlement_delay_days,
  updated_at = now();

comment on table kaygo.payment_methods is 'KayGo allowed payment methods and risk controls.';
comment on table kaygo.payment_intents is 'Provider-agnostic payment intent controlled by KayGo, independent of Stripe/PayPal/crypto implementation.';
comment on table kaygo.payment_links is 'Payment links sent through WhatsApp, email or admin during pilot operations.';
comment on table kaygo.crypto_payments is 'Controlled crypto payments, USDC/stablecoin first, manual review required.';
comment on table kaygo.payout_intents is 'Traveler payouts released only after delivery proof, recipient confirmation and no open dispute.';
comment on table kaygo.flights is 'Flight information used to predict ETA and control payout eligibility.';
comment on table kaygo.shipment_tracking_events is 'Shipment timeline events visible to sender, traveler, recipient and admin depending on visibility.';
comment on table kaygo.payout_eligibility_events is 'Audit trail explaining why a payout is blocked, eligible, scheduled or paid.';
