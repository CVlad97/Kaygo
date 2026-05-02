import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { trips, users } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthedRequest } from "../lib/auth";

const router: IRouter = Router();

router.get("/", async (req: AuthedRequest, res) => {
  try {
    const { status, departureCity, arrivalCity } = req.query;
    const all = await db.select({
      trip: trips,
      traveler: { firstName: users.firstName, lastName: users.lastName }
    }).from(trips).leftJoin(users, eq(trips.travelerId, users.id));
    
    let result = all.map(r => ({
      ...r.trip,
      travelerName: r.traveler ? `${r.traveler.firstName} ${r.traveler.lastName}` : null,
    }));
    if (status) result = result.filter(t => t.status === status);
    if (departureCity) result = result.filter(t => t.departureCity.toLowerCase().includes((departureCity as string).toLowerCase()));
    if (arrivalCity) result = result.filter(t => t.arrivalCity.toLowerCase().includes((arrivalCity as string).toLowerCase()));
    
    return res.json({ trips: result, total: result.length });
  } catch (err) {
    req.log.error({ err }, "List trips error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.get("/traveler/:travelerId", async (req: AuthedRequest, res) => {
  try {
    const travelerId = Number(req.params.travelerId);
    const result = await db.select().from(trips).where(eq(trips.travelerId, travelerId));
    return res.json({ trips: result, total: result.length });
  } catch (err) {
    req.log.error({ err }, "Get traveler trips error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const data = req.body;
    const [trip] = await db.insert(trips).values({ ...data, travelerId: req.currentUser!.id, status: "pending" }).returning();
    return res.status(201).json({ trip });
  } catch (err) {
    req.log.error({ err }, "Create trip error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.get("/:id", async (req: AuthedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db.select({
      trip: trips,
      traveler: { firstName: users.firstName, lastName: users.lastName }
    }).from(trips).leftJoin(users, eq(trips.travelerId, users.id)).where(eq(trips.id, id));
    if (!row) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json({ trip: { ...row.trip, travelerName: row.traveler ? `${row.traveler.firstName} ${row.traveler.lastName}` : null } });
  } catch (err) {
    req.log.error({ err }, "Get trip error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.patch("/:id", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await db.select().from(trips).where(eq(trips.id, id));
    if (!existing) return res.status(404).json({ error: "NOT_FOUND" });
    if (req.currentUser?.role !== "admin" && existing.travelerId !== req.currentUser?.id) {
      return res.status(403).json({ error: "FORBIDDEN" });
    }
    const { travelerId, id: _id, createdAt, ...safeUpdates } = req.body;
    const [trip] = await db.update(trips).set(safeUpdates).where(eq(trips.id, id)).returning();
    if (!trip) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json({ trip });
  } catch (err) {
    req.log.error({ err }, "Update trip error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;
