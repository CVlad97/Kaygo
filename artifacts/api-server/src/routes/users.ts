import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { users, adminActions } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const { role, verificationStatus } = req.query;
    let query = db.select({
      id: users.id,
      role: users.role,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      phone: users.phone,
      avatarUrl: users.avatarUrl,
      verificationStatus: users.verificationStatus,
      createdAt: users.createdAt,
    }).from(users);
    const allUsers = await query;
    let filtered = allUsers;
    if (role) filtered = filtered.filter(u => u.role === role);
    if (verificationStatus) filtered = filtered.filter(u => u.verificationStatus === verificationStatus);
    return res.json({ users: filtered, total: filtered.length });
  } catch (err) {
    req.log.error({ err }, "List users error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [user] = await db.select({
      id: users.id, role: users.role, firstName: users.firstName, lastName: users.lastName,
      email: users.email, phone: users.phone, avatarUrl: users.avatarUrl,
      verificationStatus: users.verificationStatus, createdAt: users.createdAt,
    }).from(users).where(eq(users.id, id));
    if (!user) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json({ user });
  } catch (err) {
    req.log.error({ err }, "Get user error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    if (!user) return res.status(404).json({ error: "NOT_FOUND" });
    const { passwordHash: _, ...safeUser } = user;
    return res.json({ user: safeUser });
  } catch (err) {
    req.log.error({ err }, "Update user error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.post("/:id/verify", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const [user] = await db.update(users).set({ verificationStatus: status }).where(eq(users.id, id)).returning();
    if (!user) return res.status(404).json({ error: "NOT_FOUND" });
    const { passwordHash: _, ...safeUser } = user;
    return res.json({ user: safeUser });
  } catch (err) {
    req.log.error({ err }, "Verify user error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;
