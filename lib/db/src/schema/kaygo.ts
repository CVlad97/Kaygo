import {
  pgTable,
  text,
  serial,
  integer,
  real,
  boolean,
  timestamp,
  json,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── USERS ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  role: text("role").notNull().default("sender"), // traveler | sender | receiver | admin
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  verificationStatus: text("verification_status").notNull().default("pending"), // pending | verified | rejected
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ─── TRAVELER PROFILES ────────────────────────────────────────────────────────

export const travelerProfiles = pgTable("traveler_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  idDocumentUrl: text("id_document_url"),
  travelerStatus: text("traveler_status").notNull().default("pending"), // pending | verified | suspended
  rating: real("rating").default(0),
  payoutMethod: text("payout_method"),
  minReward: real("min_reward").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTravelerProfileSchema = createInsertSchema(travelerProfiles).omit({ id: true, createdAt: true });
export type InsertTravelerProfile = z.infer<typeof insertTravelerProfileSchema>;
export type TravelerProfile = typeof travelerProfiles.$inferSelect;

// ─── TRIPS ────────────────────────────────────────────────────────────────────

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  travelerId: integer("traveler_id").notNull().references(() => users.id),
  departureCity: text("departure_city").notNull(),
  arrivalCity: text("arrival_city").notNull(),
  departureDate: text("departure_date").notNull(),
  arrivalDate: text("arrival_date").notNull(),
  flightNumber: text("flight_number"),
  transportType: text("transport_type").default("air"), // air | sea
  baggageTotalKg: real("baggage_total_kg").notNull(),
  baggageUsedKg: real("baggage_used_kg").notNull().default(0),
  baggageFreeKg: real("baggage_free_kg").notNull(),
  baggageType: text("baggage_type").default("soute"), // cabine | soute
  acceptsExtraBaggage: boolean("accepts_extra_baggage").default(false),
  acceptedCategories: json("accepted_categories").$type<string[]>().default([]),
  minReward: real("min_reward").notNull().default(10),
  notes: text("notes"),
  status: text("status").notNull().default("draft"), // draft | pending | validated | full | completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTripSchema = createInsertSchema(trips).omit({ id: true, createdAt: true });
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;

// ─── SHIPMENTS ────────────────────────────────────────────────────────────────

export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  // Shipment details
  title: text("title"),
  receiverName: text("receiver_name"),
  receiverPhone: text("receiver_phone"),
  departureCity: text("departure_city").notNull().default("Paris"),
  arrivalCity: text("arrival_city").notNull().default("Fort-de-France"),
  weightKg: real("weight_kg").notNull(),
  dimensions: text("dimensions"),
  category: text("category").notNull(),
  description: text("description"),
  valueEur: real("value_eur"),
  declaredValue: real("declared_value"),
  isFragile: boolean("is_fragile").default(false),
  photoUrls: json("photo_urls").$type<string[]>().default([]),
  urgencyLevel: text("urgency_level").default("normal"), // normal | urgent
  // Service level
  serviceLevel: text("service_level").default("eco"), // eco | confort | premium
  pickupOption: boolean("pickup_option").default(false),
  deliveryOption: boolean("delivery_option").default(false),
  pickupAddress: text("pickup_address"),
  deliveryAddress: text("delivery_address"),
  notes: text("notes"),
  status: text("status").notNull().default("draft"),
  // draft | submitted | validating | validated | match_proposed | accepted | paid
  // collecting | in_transit | arrived | delivering | delivered | closed | dispute
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertShipmentSchema = createInsertSchema(shipments).omit({ id: true, createdAt: true });
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Shipment = typeof shipments.$inferSelect;

// ─── MATCHES ─────────────────────────────────────────────────────────────────

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").notNull().references(() => shipments.id),
  tripId: integer("trip_id").notNull().references(() => trips.id),
  proposedReward: real("proposed_reward").notNull(),
  platformFee: real("platform_fee").notNull(),
  serviceFee: real("service_fee").notNull().default(0),
  pickupFee: real("pickup_fee").notNull().default(0),
  deliveryFee: real("delivery_fee").notNull().default(0),
  totalPrice: real("total_price").notNull(),
  adminStatus: text("admin_status").notNull().default("pending"), // pending | approved | rejected
  travelerStatus: text("traveler_status").notNull().default("pending"), // pending | accepted | rejected
  senderStatus: text("sender_status").notNull().default("pending"), // pending | accepted | rejected
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMatchSchema = createInsertSchema(matches).omit({ id: true, createdAt: true });
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").notNull().references(() => shipments.id),
  payerId: integer("payer_id").notNull().references(() => users.id),
  amount: real("amount").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending | paid | refunded | failed
  payoutStatus: text("payout_status").notNull().default("pending"), // pending | paid | failed
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// ─── DELIVERY PROOFS ─────────────────────────────────────────────────────────

export const proofs = pgTable("proofs", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").notNull().references(() => shipments.id),
  uploadedBy: integer("uploaded_by").notNull().references(() => users.id),
  proofType: text("proof_type").notNull(), // pickup | handoff | delivery
  photoUrl: text("photo_url").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProofSchema = createInsertSchema(proofs).omit({ id: true, createdAt: true });
export type InsertProof = z.infer<typeof insertProofSchema>;
export type Proof = typeof proofs.$inferSelect;

// ─── ADMIN ACTIONS ────────────────────────────────────────────────────────────

export const adminActions = pgTable("admin_actions", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => users.id),
  entityType: text("entity_type").notNull(), // user | trip | shipment | match
  entityId: integer("entity_id").notNull(),
  action: text("action").notNull(), // verify | reject | suspend | approve | etc.
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAdminActionSchema = createInsertSchema(adminActions).omit({ id: true, createdAt: true });
export type InsertAdminAction = z.infer<typeof insertAdminActionSchema>;
export type AdminAction = typeof adminActions.$inferSelect;

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // match_proposed | status_change | payment | etc.
  title: text("title").notNull(),
  body: text("body").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  relatedEntityType: text("related_entity_type"),
  relatedEntityId: integer("related_entity_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
