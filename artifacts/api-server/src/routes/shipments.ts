import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { shipments, users } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthedRequest } from "../lib/auth";

const router: IRouter = Router();

router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { status, senderId } = req.query;
    const all = await db.select({
      shipment: shipments,
      sender: { firstName: users.firstName, lastName: users.lastName }
    }).from(shipments).leftJoin(users, eq(shipments.senderId, users.id));

    let result = all.map(r => ({
      ...r.shipment,
      senderName: r.sender ? `${r.sender.firstName} ${r.sender.lastName}` : null,
    }));
    if (status) result = result.filter(s => s.status === status);
    if (req.currentUser?.role !== "admin") {
      result = result.filter(s => s.senderId === req.currentUser?.id);
    } else if (senderId) {
      result = result.filter(s => s.senderId === parseInt(senderId as string));
    }
    return res.json({ shipments: result, total: result.length });
  } catch (err) {
    req.log.error({ err }, "List shipments error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const data = req.body;
    const [shipment] = await db.insert(shipments).values({ ...data, senderId: req.currentUser!.id, status: "submitted" }).returning();
    return res.status(201).json({ shipment });
  } catch (err) {
    req.log.error({ err }, "Create shipment error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.get("/:id", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db.select({
      shipment: shipments,
      sender: { firstName: users.firstName, lastName: users.lastName }
    }).from(shipments).leftJoin(users, eq(shipments.senderId, users.id)).where(eq(shipments.id, id));
    if (!row) return res.status(404).json({ error: "NOT_FOUND" });
    if (req.currentUser?.role !== "admin" && row.shipment.senderId !== req.currentUser?.id) {
      return res.status(403).json({ error: "FORBIDDEN" });
    }
    return res.json({ shipment: { ...row.shipment, senderName: row.sender ? `${row.sender.firstName} ${row.sender.lastName}` : null } });
  } catch (err) {
    req.log.error({ err }, "Get shipment error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.patch("/:id", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await db.select().from(shipments).where(eq(shipments.id, id));
    if (!existing) return res.status(404).json({ error: "NOT_FOUND" });
    if (req.currentUser?.role !== "admin" && existing.senderId !== req.currentUser?.id) {
      return res.status(403).json({ error: "FORBIDDEN" });
    }
    const { senderId, id: _id, createdAt, status, ...safeUpdates } = req.body;
    const updates = req.currentUser?.role === "admin" && typeof status === "string" ? { ...safeUpdates, status } : safeUpdates;
    const [shipment] = await db.update(shipments).set(updates).where(eq(shipments.id, id)).returning();
    return res.json({ shipment });
  } catch (err) {
    req.log.error({ err }, "Update shipment error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.get("/:id/sender/:senderId", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const senderId = Number(req.params.senderId);
    if (req.currentUser?.role !== "admin" && senderId !== req.currentUser?.id) {
      return res.status(403).json({ error: "FORBIDDEN" });
    }
    const result = await db.select().from(shipments).where(eq(shipments.senderId, senderId));
    return res.json({ shipments: result, total: result.length });
  } catch (err) {
    req.log.error({ err }, "Get sender shipments error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;
