import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { matches, shipments, trips, users } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

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
    const [match] = await db.insert(matches).values({ ...data, adminStatus: "approved" }).returning();
    
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
    const id = parseInt(req.params.id);
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
    const id = parseInt(req.params.id);
    const [match] = await db.update(matches).set(req.body).where(eq(matches.id, id)).returning();
    if (!match) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json({ match });
  } catch (err) {
    req.log.error({ err }, "Update match error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;
