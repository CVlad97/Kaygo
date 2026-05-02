import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { proofs, shipments } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthedRequest } from "../lib/auth";

const router: IRouter = Router();
router.use(requireAuth);

router.post("/", async (req: AuthedRequest, res) => {
  try {
    const data = req.body;
    const [shipment] = await db.select().from(shipments).where(eq(shipments.id, data.shipmentId));
    if (!shipment) return res.status(404).json({ error: "SHIPMENT_NOT_FOUND" });
    if (req.currentUser?.role !== "admin" && shipment.senderId !== req.currentUser?.id) {
      return res.status(403).json({ error: "FORBIDDEN" });
    }
    const [proof] = await db.insert(proofs).values({ ...data, uploadedBy: req.currentUser!.id }).returning();
    return res.status(201).json({ proof });
  } catch (err) {
    req.log.error({ err }, "Create proof error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.get("/shipment/:shipmentId", async (req: AuthedRequest, res) => {
  try {
    const shipmentId = Number(req.params.shipmentId);
    const [shipment] = await db.select().from(shipments).where(eq(shipments.id, shipmentId));
    if (!shipment) return res.status(404).json({ error: "SHIPMENT_NOT_FOUND" });
    if (req.currentUser?.role !== "admin" && shipment.senderId !== req.currentUser?.id) {
      return res.status(403).json({ error: "FORBIDDEN" });
    }
    const result = await db.select().from(proofs).where(eq(proofs.shipmentId, shipmentId));
    return res.json({ proofs: result });
  } catch (err) {
    req.log.error({ err }, "Get proofs error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;
