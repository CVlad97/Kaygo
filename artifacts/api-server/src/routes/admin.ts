import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { trips, shipments, matches, payments, adminActions } from "@workspace/db/schema";
import { sql } from "drizzle-orm";
import { requireAdmin, requireAuth, type AuthedRequest } from "../lib/auth";

const router: IRouter = Router();
router.use(requireAuth, requireAdmin);

router.get("/stats", async (req, res) => {
  try {
    const [totalTripsResult] = await db.select({ count: sql<number>`count(*)::int` }).from(trips);
    const [totalShipmentsResult] = await db.select({ count: sql<number>`count(*)::int` }).from(shipments);
    
    const allMatches = await db.select().from(matches);
    const validatedMatches = allMatches.filter(m => m.adminStatus === "approved").length;
    
    const allPayments = await db.select().from(payments);
    const platformRevenue = allPayments
      .filter(p => p.paymentStatus === "paid")
      .reduce((sum, p) => sum + p.amount * 0.15, 0);
    const travelerGains = allPayments
      .filter(p => p.payoutStatus === "paid")
      .reduce((sum, p) => sum + p.amount * 0.75, 0);
    
    const allShipments = await db.select().from(shipments);
    const collectionsToday = allShipments.filter(s => s.status === "collecting").length;
    const deliveriesToday = allShipments.filter(s => s.status === "delivering").length;
    const openDisputes = allShipments.filter(s => s.status === "dispute").length;
    const pendingValidations = allShipments.filter(s => s.status === "submitted" || s.status === "validating").length;
    
    const recentShipments = allShipments
      .slice(-5)
      .reverse()
      .map((shipment) => ({
        type: "shipment",
        message: `Colis #${shipment.id} - ${shipment.departureCity} → ${shipment.arrivalCity} - statut ${shipment.status}`,
        time: shipment.createdAt instanceof Date ? shipment.createdAt.toISOString() : String(shipment.createdAt),
      }));
    
    return res.json({
      totalTrips: totalTripsResult?.count ?? 0,
      totalShipments: totalShipmentsResult?.count ?? 0,
      validatedMatches,
      platformRevenue: Math.round(platformRevenue * 100) / 100,
      travelerGains: Math.round(travelerGains * 100) / 100,
      collectionsToday,
      deliveriesToday,
      openDisputes,
      pendingValidations,
      recentActivity: recentShipments,
    });
  } catch (err) {
    req.log.error({ err }, "Admin stats error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.post("/actions", async (req: AuthedRequest, res) => {
  try {
    const data = req.body;
    const [action] = await db.insert(adminActions).values({ ...data, adminId: req.currentUser!.id }).returning();
    return res.status(201).json({ action });
  } catch (err) {
    req.log.error({ err }, "Admin action error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;
