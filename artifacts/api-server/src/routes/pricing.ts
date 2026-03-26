import { Router, type IRouter } from "express";

const router: IRouter = Router();

interface PriceEstimateRequest {
  weightKg: number;
  pickupOption?: boolean;
  deliveryOption?: boolean;
  urgencyLevel?: string;
  serviceLevel: "eco" | "confort" | "premium";
}

function calculatePrice(params: PriceEstimateRequest) {
  const { weightKg, pickupOption, deliveryOption, urgencyLevel, serviceLevel } = params;
  
  // Base transport fee: 4€/kg, min 8€
  let transportFee = Math.max(8, weightKg * 4);
  
  // Service level multiplier
  if (serviceLevel === "confort") transportFee *= 1.2;
  if (serviceLevel === "premium") transportFee *= 1.5;
  
  // Urgency surcharge
  if (urgencyLevel === "urgent") transportFee *= 1.3;
  
  // Service platform fee (15% of transport, min 2€)
  const serviceFee = Math.max(2, transportFee * 0.15);
  
  // Pickup fee (collecte en France)
  const pickupFee = pickupOption ? (weightKg <= 3 ? 7 : 10) : 0;
  
  // Delivery fee (livraison en Martinique)
  const deliveryFee = deliveryOption ? (weightKg <= 3 ? 9 : 13) : 0;
  
  const totalPrice = transportFee + serviceFee + pickupFee + deliveryFee;
  
  // Estimated days
  const estimatedDays = urgencyLevel === "urgent" ? 3 : serviceLevel === "eco" ? 7 : 5;
  
  return {
    transportFee: Math.round(transportFee * 100) / 100,
    serviceFee: Math.round(serviceFee * 100) / 100,
    pickupFee: Math.round(pickupFee * 100) / 100,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100,
    serviceLevel,
    estimatedDays,
    breakdown: {
      "Transport voyageur": Math.round(transportFee * 100) / 100,
      "Frais de service KAYGO": Math.round(serviceFee * 100) / 100,
      ...(pickupFee > 0 ? { "Collecte (France)": pickupFee } : {}),
      ...(deliveryFee > 0 ? { "Livraison (Martinique)": deliveryFee } : {}),
    }
  };
}

router.post("/estimate", (req, res) => {
  try {
    const result = calculatePrice(req.body as PriceEstimateRequest);
    return res.json(result);
  } catch (err) {
    req.log.error({ err }, "Pricing estimate error");
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;
