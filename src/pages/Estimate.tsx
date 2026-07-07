import { PricingCalculator } from "@/components/PricingCalculator";

export function Estimate() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Estimer le prix de votre envoi</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          Utilisez notre simulateur pour obtenir une estimation instantanée du coût de transport de votre colis.
        </p>
      </div>
      <div className="max-w-lg mx-auto">
        <PricingCalculator />
      </div>
    </div>
  );
}