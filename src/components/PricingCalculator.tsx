import { useState, useCallback } from "react";
import { calculatePrice, CITIES, SERVICE_LEVELS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import type { Estimate, EstimateResult } from "@/types";
import { Package, MapPin, Weight, ArrowRight } from "lucide-react";

export function PricingCalculator({ compact }: { compact?: boolean }) {
  const [estimate, setEstimate] = useState<Estimate>({
    departure_city: "Paris",
    arrival_city: "Fort-de-France",
    weight_kg: 5,
    service_level: "eco",
    pickup_option: false,
    delivery_option: true,
  });
  const [result, setResult] = useState<EstimateResult | null>(null);

  const handleCalculate = useCallback(() => {
    try {
      const r = calculatePrice(estimate);
      setResult(r);
    } catch {
      // silent
    }
  }, [estimate]);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 ${compact ? "p-6" : "p-8"}`}>
      <h3 className={`font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2 ${compact ? "text-lg" : "text-2xl"}`}>
        <Package className="w-5 h-5 text-blue-600" />
        Estimateur de prix
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Départ</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={estimate.departure_city}
                onChange={(e) => { setResult(null); setEstimate({ ...estimate, departure_city: e.target.value }); }}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Arrivée</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={estimate.arrival_city}
                onChange={(e) => { setResult(null); setEstimate({ ...estimate, arrival_city: e.target.value }); }}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {CITIES.filter((c) => c !== estimate.departure_city).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Poids (kg)</label>
          <div className="relative">
            <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="range"
              min={0.5}
              max={30}
              step={0.5}
              value={estimate.weight_kg}
              onChange={(e) => { setResult(null); setEstimate({ ...estimate, weight_kg: parseFloat(e.target.value) }); }}
              className="w-full"
            />
          </div>
          <div className="text-right text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">{estimate.weight_kg} kg</div>
        </div>

        {!compact && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Niveau de service</label>
              <div className="grid grid-cols-3 gap-2">
                {SERVICE_LEVELS.map((sl) => (
                  <button
                    key={sl.id}
                    onClick={() => { setResult(null); setEstimate({ ...estimate, service_level: sl.id }); }}
                    className={`px-3 py-2.5 text-xs font-medium rounded-xl border transition-all ${
                      estimate.service_level === sl.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400"
                    }`}
                  >
                    <div className="font-semibold">{sl.label}</div>
                    <div className="text-[10px] opacity-75">{sl.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={estimate.pickup_option}
                  onChange={(e) => { setResult(null); setEstimate({ ...estimate, pickup_option: e.target.checked }); }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                +5€ Retrait à domicile
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={estimate.delivery_option}
                  onChange={(e) => { setResult(null); setEstimate({ ...estimate, delivery_option: e.target.checked }); }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                +5€ Livraison à domicile
              </label>
            </div>
          </>
        )}

        <button
          onClick={handleCalculate}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Calculer le prix <ArrowRight className="w-4 h-4" />
        </button>

        {result && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Prix estimé</div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{formatPrice(result.total_eur)}</div>
              <div className="text-xs text-gray-500 mt-2">
                Base: {formatPrice(result.breakdown.base)} + Poids: {formatPrice(result.breakdown.per_kg)}
                {result.breakdown.service > 0 && ` + Service: ${formatPrice(result.breakdown.service)}`}
                {result.breakdown.options > 0 && ` + Options: ${formatPrice(result.breakdown.options)}`}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}