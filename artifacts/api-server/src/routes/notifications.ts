import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { notifications } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const result = await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(notifications.createdAt);
    return res.json({ notifications: result });
  } catch (err) {
    req.log.error({ err }, "Get notifications error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;
