create or replace function public.kaygo_create_estimate(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = kaygo, public
as $$
declare
  new_id uuid;
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
    coalesce(payload->>'departure_city', 'France'),
    coalesce(payload->>'arrival_city', 'Martinique'),
    (payload->>'weight_kg')::numeric,
    coalesce(payload->>'service_level', 'eco'),
    coalesce(payload->>'urgency_level', 'normal'),
    coalesce((payload->>'pickup_option')::boolean, false),
    coalesce((payload->>'delivery_option')::boolean, true),
    nullif(payload->>'contact', ''),
    coalesce(payload->'result', '{}'::jsonb),
    coalesce(payload->>'status', 'estimated')
  )
  returning id into new_id;

  return new_id;
end;
$$;

grant execute on function public.kaygo_create_estimate(jsonb) to anon, authenticated, service_role;
