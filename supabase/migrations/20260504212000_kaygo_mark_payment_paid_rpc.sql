create or replace function public.kaygo_mark_payment_paid(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = kaygo, public
as $$
declare
  payment_id uuid;
  provider_event_id_value text;
  provider_payload jsonb;
  payment_row kaygo.payment_intents%rowtype;
  payout_row kaygo.payout_intents%rowtype;
  old_status text;
  paid_at_value timestamptz;
begin
  payment_id := nullif(coalesce(payload->>'payment_intent_id', payload->>'paymentIntentId'), '')::uuid;
  provider_event_id_value := nullif(coalesce(payload->>'provider_event_id', payload->>'providerEventId'), '');
  provider_payload := coalesce(payload->'provider_payload', payload->'providerPayload', '{}'::jsonb);
  paid_at_value := coalesce((payload->>'paid_at')::timestamptz, (payload->>'paidAt')::timestamptz, now());

  if payment_id is null then
    select id into payment_id
    from kaygo.payment_intents
    where public_ref = nullif(coalesce(payload->>'public_ref', payload->>'publicRef'), '')
       or provider_payment_id = nullif(coalesce(payload->>'provider_payment_id', payload->>'providerPaymentId'), '')
    order by created_at desc
    limit 1;
  end if;

  if payment_id is null then
    raise exception 'PAYMENT_INTENT_NOT_FOUND';
  end if;

  select * into payment_row
  from kaygo.payment_intents
  where id = payment_id
  for update;

  if not found then
    raise exception 'PAYMENT_INTENT_NOT_FOUND: %', payment_id;
  end if;

  old_status := payment_row.status::text;

  if payment_row.status in ('refunded','cancelled','disputed','released') then
    raise exception 'PAYMENT_STATUS_NOT_MARKABLE_AS_PAID: %', payment_row.status;
  end if;

  update kaygo.payment_intents
  set
    status = 'held',
    paid_at = coalesce(payment_row.paid_at, paid_at_value),
    held_at = coalesce(payment_row.held_at, now()),
    metadata = coalesce(payment_row.metadata, '{}'::jsonb) || jsonb_build_object(
      'marked_paid_by', coalesce(payload->>'created_by', payload->>'createdBy', 'system'),
      'marked_paid_at', now(),
      'provider_payload', provider_payload
    ),
    updated_at = now()
  where id = payment_id
  returning * into payment_row;

  insert into kaygo.payment_events (
    payment_intent_id,
    provider,
    event_type,
    old_status,
    new_status,
    provider_event_id,
    payload
  ) values (
    payment_row.id,
    payment_row.provider,
    'payment.marked_paid_and_held',
    old_status,
    payment_row.status::text,
    provider_event_id_value,
    jsonb_build_object(
      'provider_payload', provider_payload,
      'created_by', coalesce(payload->>'created_by', payload->>'createdBy', 'system')
    )
  )
  on conflict (provider, provider_event_id) do nothing;

  insert into kaygo.payout_intents (
    payment_intent_id,
    shipment_id,
    traveler_id,
    provider,
    currency,
    amount_eur,
    reserve_amount_eur,
    status,
    metadata
  ) values (
    payment_row.id,
    payment_row.shipment_id,
    payment_row.traveler_id,
    'stripe',
    payment_row.currency,
    payment_row.traveler_payout_eur,
    payment_row.reserve_amount_eur,
    'blocked',
    jsonb_build_object(
      'reason', 'Awaiting delivery proof, recipient confirmation and no open dispute.',
      'source_payment_provider', payment_row.provider,
      'source_payment_status', payment_row.status
    )
  ) returning * into payout_row;

  insert into kaygo.payout_eligibility_events (
    shipment_id,
    traveler_id,
    status,
    reason,
    metadata
  ) values (
    payment_row.shipment_id,
    payment_row.traveler_id,
    'pending_delivery_proof',
    'Payment is held. Payout remains blocked until pickup, travel/flight, delivery proof, recipient confirmation and no open dispute.',
    jsonb_build_object('payment_intent_id', payment_row.id, 'payout_intent_id', payout_row.id)
  );

  return jsonb_build_object(
    'ok', true,
    'payment_intent_id', payment_row.id,
    'public_ref', payment_row.public_ref,
    'payment_status', payment_row.status,
    'provider', payment_row.provider,
    'gross_amount_eur', payment_row.gross_amount_eur,
    'kaygo_fee_eur', payment_row.kaygo_fee_eur,
    'traveler_payout_eur', payment_row.traveler_payout_eur,
    'reserve_amount_eur', payment_row.reserve_amount_eur,
    'payout_intent_id', payout_row.id,
    'payout_status', payout_row.status,
    'message', 'Payment marked as held. Traveler payout is blocked until delivery proof and recipient confirmation.'
  );
end;
$$;

revoke all on function public.kaygo_mark_payment_paid(jsonb) from public, anon, authenticated;
grant execute on function public.kaygo_mark_payment_paid(jsonb) to service_role;
comment on function public.kaygo_mark_payment_paid(jsonb) is 'Marks a KayGo payment as paid/held and creates a blocked payout intent. Intended for Edge Functions/service_role only.';
