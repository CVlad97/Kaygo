export interface Shipment {
  id: string;
  tracking_number: string;
  sender_id: string;
  traveler_id?: string;
  departure_city: string;
  arrival_city: string;
  weight_kg: number;
  content_description: string;
  status: ShipmentStatus;
  price_eur: number;
  service_level: "eco" | "confort" | "premium";
  created_at: string;
  estimated_delivery: string;
}

export type ShipmentStatus =
  | "pending"
  | "approved"
  | "in_transit"
  | "delivered"
  | "cancelled";

export interface Trip {
  id: string;
  traveler_id: string;
  departure_city: string;
  arrival_city: string;
  departure_date: string;
  available_weight_kg: number;
  status: "pending" | "active" | "completed" | "cancelled";
}

export interface Estimate {
  departure_city: string;
  arrival_city: string;
  weight_kg: number;
  service_level: "eco" | "confort" | "premium";
  pickup_option: boolean;
  delivery_option: boolean;
}

export interface EstimateResult {
  base_price: number;
  weight_surcharge: number;
  service_fee: number;
  pickup_fee: number;
  delivery_fee: number;
  total_eur: number;
  breakdown: {
    base: number;
    per_kg: number;
    service: number;
    options: number;
  };
}

export type UserRole = "sender" | "traveler" | "admin";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  created_at: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}
