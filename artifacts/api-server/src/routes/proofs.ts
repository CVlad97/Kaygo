import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { proofs } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const [proof] = await db.insert(proofs).values(data).returning();
    return res.status(201).json({ proof });
  } catch (err) {
    req.log.error({ err }, "Create proof error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.get("/shipment/:shipmentId", async (req, res) => {
  try {
    const shipmentId = parseInt(req.params.shipmentId);
    const result = await db.select().from(proofs).where(eq(proofs.shipmentId, shipmentId));
    return res.json({ proofs: result });
  } catch (err) {
    req.log.error({ err }, "Get proofs error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;
