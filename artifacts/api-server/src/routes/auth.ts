import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { users } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, serializeUser } from "../lib/auth";

const router: IRouter = Router();

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return res.status(400).json({ error: "EMAIL_EXISTS", message: "Email already registered" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({
      firstName, lastName, email, phone, role: role ?? "sender",
      passwordHash,
      verificationStatus: "pending",
    }).returning();
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
    return res.status(201).json({ token, user: serializeUser(user) });
  } catch (err) {
    req.log.error({ err }, "Register error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS", message: "Invalid email or password" });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS", message: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
    return res.json({ token, user: serializeUser(user) });
  } catch (err) {
    req.log.error({ err }, "Login error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;
