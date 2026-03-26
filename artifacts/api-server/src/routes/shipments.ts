import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { shipments, users } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
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
    if (senderId) result = result.filter(s => s.senderId === parseInt(senderId as string));
    return res.json({ shipments: result, total: result.length });
  } catch (err) {
    req.log.error({ err }, "List shipments error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const [shipment] = await db.insert(shipments).values({ ...data, status: "submitted" }).returning();
    return res.status(201).json({ shipment });
  } catch (err) {
    req.log.error({ err }, "Create shipment error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db.select({
      shipment: shipments,
      sender: { firstName: users.firstName, lastName: users.lastName }
    }).from(shipments).leftJoin(users, eq(shipments.senderId, users.id)).where(eq(shipments.id, id));
    if (!row) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json({ shipment: { ...row.shipment, senderName: row.sender ? `${row.sender.firstName} ${row.sender.lastName}` : null } });
  } catch (err) {
    req.log.error({ err }, "Get shipment error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [shipment] = await db.update(shipments).set(req.body).where(eq(shipments.id, id)).returning();
    if (!shipment) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json({ shipment });
  } catch (err) {
    req.log.error({ err }, "Update shipment error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.get("/:id/sender/:senderId", async (req, res) => {
  try {
    const senderId = parseInt(req.params.senderId);
    const result = await db.select().from(shipments).where(eq(shipments.senderId, senderId));
    return res.json({ shipments: result, total: result.length });
  } catch (err) {
    req.log.error({ err }, "Get sender shipments error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;
