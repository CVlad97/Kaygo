import type { SafeUser } from "../lib/auth";

declare module "express-serve-static-core" {
  interface Request {
    currentUser?: SafeUser;
  }
}
