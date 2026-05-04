-- KayGo pilot launch security lockdown
-- Direct KayGo table access is revoked for anon/authenticated.
-- Public flows must go through audited Edge Functions/RPC service_role during pilot.

revoke all on all tables in schema kaygo from anon;
revoke all on all tables in schema kaygo from authenticated;
revoke all on all sequences in schema kaygo from anon;
revoke all on all sequences in schema kaygo from authenticated;

revoke all on all tables in schema kaygo_private from anon;
revoke all on all tables in schema kaygo_private from authenticated;
revoke all on all sequences in schema kaygo_private from anon;
revoke all on all sequences in schema kaygo_private from authenticated;

grant usage on schema kaygo to service_role;
grant usage on schema kaygo_private to service_role;
grant all on all tables in schema kaygo to service_role;
grant all on all sequences in schema kaygo to service_role;
grant all on all tables in schema kaygo_private to service_role;
grant all on all sequences in schema kaygo_private to service_role;

revoke all on function public.kaygo_register_payment_link(jsonb) from public, anon, authenticated;
revoke all on function public.kaygo_mark_payment_paid(jsonb) from public, anon, authenticated;
grant execute on function public.kaygo_register_payment_link(jsonb) to service_role;
grant execute on function public.kaygo_mark_payment_paid(jsonb) to service_role;

create or replace function kaygo.generate_public_ref(prefix text)
returns text
language sql
volatile
set search_path = kaygo, extensions, public
as $$
  select upper(prefix || '-' || encode(extensions.gen_random_bytes(4), 'hex'));
$$;

create or replace function kaygo.set_updated_at()
returns trigger
language plpgsql
set search_path = kaygo, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on schema kaygo is 'KayGo pilot schema. Direct table access is locked down for anon/authenticated; public access must go through audited Edge Functions/RPC service_role.';
