import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { users, trips, shipments, matches, payments, adminActions } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

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
    
    const recentActivity = [
      { type: "match", message: "Nouveau match proposé: Paris → Fort-de-France", time: "Il y a 5 min" },
      { type: "payment", message: "Paiement reçu - Mission #42 (34€)", time: "Il y a 12 min" },
      { type: "user", message: "Nouveau voyageur inscrit: Marie D.", time: "Il y a 25 min" },
      { type: "delivery", message: "Livraison confirmée - Mission #38", time: "Il y a 1h" },
      { type: "shipment", message: "Nouveau colis soumis: 2kg - Vêtements", time: "Il y a 1h 30min" },
    ];
    
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
      recentActivity,
    });
  } catch (err) {
    req.log.error({ err }, "Admin stats error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.post("/actions", async (req, res) => {
  try {
    const data = req.body;
    const [action] = await db.insert(adminActions).values(data).returning();
    return res.status(201).json({ action });
  } catch (err) {
    req.log.error({ err }, "Admin action error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;
