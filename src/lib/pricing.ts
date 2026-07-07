import type { Estimate, EstimateResult } from "@/types";

const BASE_RATES: Record<string, { base: number; per_kg: number }> = {
  "Paris-Fort-de-France": { base: 15, per_kg: 8 },
  "Paris-Cayenne": { base: 18, per_kg: 10 },
  "Paris-Saint-Denis": { base: 20, per_kg: 11 },
  "Marseille-Fort-de-France": { base: 17, per_kg: 9 },
  "Lyon-Fort-de-France": { base: 18, per_kg: 9 },
  "default": { base: 15, per_kg: 8 },
};

const SERVICE_MULTIPLIERS: Record<string, number> = {
  eco: 1.0,
  confort: 1.35,
  premium: 1.75,
};

const PICKUP_FEE = 5;
const DELIVERY_FEE = 5;

const DISTANCES: Record<string, number> = {
  "Paris-Fort-de-France": 6800,
  "Paris-Cayenne": 7100,
  "Paris-Saint-Denis": 9700,
  "Marseille-Fort-de-France": 7200,
  "Lyon-Fort-de-France": 7100,
};

function getRouteKey(departure: string, arrival: string): string {
  return `${departure}-${arrival}`;
}

export function calculatePrice(estimate: Estimate): EstimateResult {
  const routeKey = getRouteKey(estimate.departure_city, estimate.arrival_city);
  const rates = BASE_RATES[routeKey] || BASE_RATES["default"];

  const base_price = rates.base;
  const weight_surcharge = rates.per_kg * estimate.weight_kg;
  const service_mult = SERVICE_MULTIPLIERS[estimate.service_level] || 1.0;

  const subtotal = (base_price + weight_surcharge) * service_mult;
  const pickup_fee = estimate.pickup_option ? PICKUP_FEE : 0;
  const delivery_fee = estimate.delivery_option ? DELIVERY_FEE : 0;
  const total_eur = Math.round((subtotal + pickup_fee + delivery_fee) * 100) / 100;

  return {
    base_price,
    weight_surcharge,
    service_fee: (base_price + weight_surcharge) * (service_mult - 1),
    pickup_fee,
    delivery_fee,
    total_eur,
    breakdown: {
      base: base_price,
      per_kg: weight_surcharge,
      service: (base_price + weight_surcharge) * (service_mult - 1),
      options: pickup_fee + delivery_fee,
    },
  };
}

export function getDistance(departure: string, arrival: string): number {
  const routeKey = getRouteKey(departure, arrival);
  return DISTANCES[routeKey] || 6800;
}

export const CITIES = [
  "Paris",
  "Marseille",
  "Lyon",
  "Toulouse",
  "Bordeaux",
  "Lille",
  "Fort-de-France",
  "Cayenne",
  "Saint-Denis",
  "Pointe-à-Pitre",
  "Basse-Terre",
  "Saint-Pierre",
];

export const SERVICE_LEVELS = [
  { id: "eco" as const, label: "Éco", desc: "Livraison standard sous 7-10 jours", price: "x1" },
  { id: "confort" as const, label: "Confort", desc: "Livraison suivie sous 5-7 jours", price: "x1.35" },
  { id: "premium" as const, label: "Premium", desc: "Livraison express sous 3-5 jours", price: "x1.75" },
];