import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import tripsRouter from "./trips";
import shipmentsRouter from "./shipments";
import matchesRouter from "./matches";
import paymentsRouter from "./payments";
import proofsRouter from "./proofs";
import notificationsRouter from "./notifications";
import adminRouter from "./admin";
import pricingRouter from "./pricing";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/trips", tripsRouter);
router.use("/shipments", shipmentsRouter);
router.use("/matches", matchesRouter);
router.use("/payments", paymentsRouter);
router.use("/proofs", proofsRouter);
router.use("/notifications", notificationsRouter);
router.use("/admin", adminRouter);
router.use("/pricing", pricingRouter);

export default router;
