// Supabase Edge Function: calculate-price
// Deno runtime - deployed via supabase CLI

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

interface EstimateRequest {
  departure_city: string;
  arrival_city: string;
  weight_kg: number;
  service_level?: "eco" | "confort" | "premium";
  pickup_option?: boolean;
  delivery_option?: boolean;
}

const BASE_RATES: Record<string, { base: number; per_kg: number }> = {
  "Paris-Fort-de-France": { base: 15, per_kg: 8 },
  "Paris-Cayenne": { base: 18, per_kg: 10 },
  "Paris-Saint-Denis": { base: 20, per_kg: 11 },
  "Marseille-Fort-de-France": { base: 17, per_kg: 9 },
  "Lyon-Fort-de-France": { base: 18, per_kg: 9 },
};

const SERVICE_MULT: Record<string, number> = {
  eco: 1.0,
  confort: 1.35,
  premium: 1.75,
};

function calculatePrice(req: EstimateRequest) {
  const routeKey = `${req.departure_city}-${req.arrival_city}`;
  const rates = BASE_RATES[routeKey] || { base: 15, per_kg: 8 };
  const mult = SERVICE_MULT[req.service_level || "eco"] || 1.0;

  const subtotal = (rates.base + rates.per_kg * req.weight_kg) * mult;
  const pickupFee = req.pickup_option ? 5 : 0;
  const deliveryFee = req.delivery_option !== false ? 5 : 0;

  const total = Math.round((subtotal + pickupFee + deliveryFee) * 100) / 100;

  return {
    base_price: rates.base,
    weight_surcharge: rates.per_kg * req.weight_kg,
    service_fee: (rates.base + rates.per_kg * req.weight_kg) * (mult - 1),
    pickup_fee: pickupFee,
    delivery_fee: deliveryFee,
    total_eur: total,
    breakdown: {
      base: rates.base,
      per_kg: rates.per_kg * req.weight_kg,
      service: (rates.base + rates.per_kg * req.weight_kg) * (mult - 1),
      options: pickupFee + deliveryFee,
    },
    distance_km: routeKey === "Paris-Fort-de-France" ? 6800 :
                 routeKey === "Paris-Cayenne" ? 7100 :
                 routeKey === "Paris-Saint-Denis" ? 9700 : 6800,
  };
}

serve(async (req) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers, status: 204 });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  }

  try {
    const body: EstimateRequest = await req.json();

    if (!body.departure_city || !body.arrival_city || !body.weight_kg) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: departure_city, arrival_city, weight_kg" }),
        { status: 400, headers }
      );
    }

    if (body.weight_kg <= 0 || body.weight_kg > 30) {
      return new Response(
        JSON.stringify({ error: "weight_kg must be between 0 and 30" }),
        { status: 400, headers }
      );
    }

    const result = calculatePrice(body);

    // Log estimate in Supabase if service role key is available
    if (SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        await supabase.from("estimates").insert({
          departure_city: body.departure_city,
          arrival_city: body.arrival_city,
          weight_kg: body.weight_kg,
          service_level: body.service_level || "eco",
          pickup_option: body.pickup_option || false,
          delivery_option: body.delivery_option !== false,
          result: result,
          status: "estimated",
        });
      } catch {
        // Logging is best-effort
      }
    }

    return new Response(JSON.stringify(result), { status: 200, headers });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500, headers }
    );
  }
});