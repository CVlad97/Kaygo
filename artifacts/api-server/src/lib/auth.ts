import type { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { users } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required.");
  }
  return secret;
}

const JWT_SECRET = getJwtSecret();

type JwtPayload = {
  userId: number;
  role: string;
};

export type SafeUser = {
  id: number;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  verificationStatus: string;
  createdAt: Date;
};

export { JWT_SECRET };
export type AuthedRequest = Request & { currentUser?: SafeUser };

export function serializeUser(user: typeof users.$inferSelect): SafeUser {
  return {
    id: user.id,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone ?? null,
    avatarUrl: user.avatarUrl ?? null,
    verificationStatus: user.verificationStatus,
    createdAt: user.createdAt,
  };
}

export const requireAuth: RequestHandler = async (req, res, next) => {
  const authedReq = req as AuthedRequest;
  try {
    const header = req.header("authorization");
    const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : "";

    if (!token) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const [user] = await db.select().from(users).where(eq(users.id, decoded.userId));

    if (!user) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    authedReq.currentUser = serializeUser(user);
    return next();
  } catch {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  const authedReq = req as AuthedRequest;
  if (authedReq.currentUser?.role !== "admin") {
    return res.status(403).json({ error: "FORBIDDEN" });
  }

  return next();
};

export function canAccessUser(req: AuthedRequest, targetUserId: number): boolean {
  return req.currentUser?.role === "admin" || req.currentUser?.id === targetUserId;
}
