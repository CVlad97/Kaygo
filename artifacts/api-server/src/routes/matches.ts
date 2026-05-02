import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { matches, shipments, trips, users } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, requireAuth } from "../lib/auth";

const router: IRouter = Router();
router.use(requireAuth, requireAdmin);

function normalizedCity(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

router.get("/", async (req, res) => {
  try {
    const { adminStatus } = req.query;
    const all = await db.select().from(matches);
    let result = all;
    if (adminStatus) result = result.filter(m => m.adminStatus === adminStatus);
    
    // Enrich with shipment and trip data
    const enriched = await Promise.all(result.map(async (match) => {
      const [shipment] = await db.select().from(shipments).where(eq(shipments.id, match.shipmentId));
      const [trip] = await db.select().from(trips).where(eq(trips.id, match.tripId));
      return { ...match, shipment: shipment ?? null, trip: trip ?? null };
    }));

    return res.json({ matches: enriched, total: enriched.length });
  } catch (err) {
    req.log.error({ err }, "List matches error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const [shipment] = await db.select().from(shipments).where(eq(shipments.id, data.shipmentId));
    const [trip] = await db.select().from(trips).where(eq(trips.id, data.tripId));

    if (!shipment || !trip) return res.status(400).json({ error: "INVALID_MATCH_INPUT" });
    if (shipment.status !== "validated") return res.status(409).json({ error: "SHIPMENT_NOT_VALIDATED" });
    if (trip.status !== "validated") return res.status(409).json({ error: "TRIP_NOT_VALIDATED" });
    if ((shipment.weightKg ?? 0) > (trip.baggageFreeKg ?? 0)) return res.status(409).json({ error: "INSUFFICIENT_BAGGAGE" });
    if (normalizedCity(shipment.departureCity) !== normalizedCity(trip.departureCity) || normalizedCity(shipment.arrivalCity) !== normalizedCity(trip.arrivalCity)) {
      return res.status(409).json({ error: "CITY_MISMATCH" });
    }

    const [traveler] = await db.select().from(users).where(eq(users.id, trip.travelerId));
    if (!traveler || traveler.verificationStatus !== "verified") {
      return res.status(409).json({ error: "TRAVELER_NOT_VERIFIED" });
    }

    const [match] = await db.insert(matches).values({
      ...data,
      adminStatus: "pending",
      travelerStatus: "pending",
      senderStatus: "pending",
    }).returning();
    
    // Update shipment status to match_proposed
    await db.update(shipments).set({ status: "match_proposed" }).where(eq(shipments.id, data.shipmentId));
    
    return res.status(201).json({ match });
  } catch (err) {
    req.log.error({ err }, "Create match error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    if (!match) return res.status(404).json({ error: "NOT_FOUND" });
    
    const [shipment] = await db.select().from(shipments).where(eq(shipments.id, match.shipmentId));
    const [trip] = await db.select().from(trips).where(eq(trips.id, match.tripId));
    
    return res.json({ match: { ...match, shipment: shipment ?? null, trip: trip ?? null } });
  } catch (err) {
    req.log.error({ err }, "Get match error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [match] = await db.update(matches).set(req.body).where(eq(matches.id, id)).returning();
    if (!match) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json({ match });
  } catch (err) {
    req.log.error({ err }, "Update match error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.post("/:id/approve", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [match] = await db.update(matches).set({ adminStatus: "approved" }).where(eq(matches.id, id)).returning();
    if (!match) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json({ match });
  } catch (err) {
    req.log.error({ err }, "Approve match error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.post("/:id/reject", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [match] = await db.update(matches).set({ adminStatus: "rejected" }).where(eq(matches.id, id)).returning();
    if (!match) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json({ match });
  } catch (err) {
    req.log.error({ err }, "Reject match error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;
