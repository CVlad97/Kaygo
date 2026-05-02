import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { payments } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, requireAuth } from "../lib/auth";

const router: IRouter = Router();
router.use(requireAuth, requireAdmin);

router.get("/", async (req, res) => {
  try {
    const all = await db.select().from(payments).orderBy(payments.createdAt);
    return res.json({ payments: all, total: all.length });
  } catch (err) {
    req.log.error({ err }, "List payments error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    if (!payment) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json({ payment });
  } catch (err) {
    req.log.error({ err }, "Get payment error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;
