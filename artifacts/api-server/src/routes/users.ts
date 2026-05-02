import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { users } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { canAccessUser, requireAdmin, requireAuth, type AuthedRequest } from "../lib/auth";

const router: IRouter = Router();

router.use(requireAuth);

router.get("/", requireAdmin, async (req: AuthedRequest, res) => {
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

router.get("/:id", async (req: AuthedRequest, res) => {
  try {
    const id = Number(req.params.id);
    if (!canAccessUser(req, id)) return res.status(403).json({ error: "FORBIDDEN" });
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

router.patch("/:id", async (req: AuthedRequest, res) => {
  try {
    const id = Number(req.params.id);
    if (!canAccessUser(req, id)) return res.status(403).json({ error: "FORBIDDEN" });
    const { role, verificationStatus, passwordHash, id: _id, createdAt, ...safeUpdates } = req.body;
    const updates = req.currentUser?.role === "admin"
      ? { ...safeUpdates, ...(typeof role === "string" ? { role } : {}), ...(typeof verificationStatus === "string" ? { verificationStatus } : {}) }
      : safeUpdates;
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    if (!user) return res.status(404).json({ error: "NOT_FOUND" });
    const { passwordHash: _, ...safeUser } = user;
    return res.json({ user: safeUser });
  } catch (err) {
    req.log.error({ err }, "Update user error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.post("/:id/verify", requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const id = Number(req.params.id);
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
