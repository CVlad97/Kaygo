import { useState } from "react";
import { useListShipments, useListTrips, useCreateMatch } from "@workspace/api-client-react";
import { getListMatchesQueryKey, getListShipmentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate, formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { Package, Plane, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Matches() {
  const queryClient = useQueryClient();
  const [selectedShipment, setSelectedShipment] = useState<number | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<number | null>(null);

  // Fetch data
  const { data: shipmentsData, isLoading: isLoadingShipments } = useListShipments({ status: 'validated' });
  const { data: tripsData, isLoading: isLoadingTrips } = useListTrips({ status: 'validated' });
  
  const shipments = shipmentsData?.shipments || [];
  const trips = tripsData?.trips || [];

  const createMatchMutation = useCreateMatch({
    mutation: {
      onSuccess: () => {
        setSelectedShipment(null);
        setSelectedTrip(null);
        queryClient.invalidateQueries({ queryKey: getListShipmentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListMatchesQueryKey() });
        alert("Match créé avec succès !");
      }
    }
  });

  const handleCreateMatch = () => {
    if (!selectedShipment || !selectedTrip) return;
    
    // In a real app, you'd open a modal here to calculate exact fees.
    // For this admin panel, we'll auto-calculate basic demo values.
    const shipment = shipments.find(s => s.id === selectedShipment);
    
    let baseReward = 15;
    let basePlatformFee = 5;
    if (shipment && shipment.weightKg > 2) {
      baseReward = 25;
      basePlatformFee = 8;
    }

    const payload = {
      shipmentId: selectedShipment,
      tripId: selectedTrip,
      proposedReward: baseReward,
      platformFee: basePlatformFee,
      serviceFee: 2,
      pickupFee: shipment?.pickupOption ? 10 : 0,
      deliveryFee: shipment?.deliveryOption ? 15 : 0,
      totalPrice: baseReward + basePlatformFee + 2 + (shipment?.pickupOption ? 10 : 0) + (shipment?.deliveryOption ? 15 : 0)
    };

    createMatchMutation.mutate({ data: payload });
  };

  return (
    <div className="space-y-6 pb-24 relative">
      <div>
        <h1 className="text-3xl font-display font-bold text-primary">Matching manuel</h1>
        <p className="text-muted-foreground">Associez les colis en attente avec les trajets disponibles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colonne Colis */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-bold text-primary bg-white p-4 rounded-t-2xl border-b border-border">
            <Package className="h-5 w-5 text-indigo-500" />
            <h3>Colis à expédier</h3>
            <span className="ml-auto bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">{shipments.length}</span>
          </div>
          
          <div className="space-y-3 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoadingShipments ? (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                Chargement...
              </div>
            ) : shipments.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-border/50">
                Aucun colis en attente de match.
              </div>
            ) : (
              shipments.map(s => (
                <div 
                  key={s.id}
                  onClick={() => setSelectedShipment(s.id)}
                  className={`bg-card p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedShipment === s.id 
                      ? 'border-indigo-500 shadow-md shadow-indigo-500/20 bg-indigo-50/30' 
                      : 'border-border/50 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <span>{s.departureCity}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span>{s.arrivalCity}</span>
                    </div>
                    <span className="font-mono text-sm font-semibold text-primary">{s.weightKg}kg</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground capitalize">{s.category.replace('_', ' ')}</span>
                    {s.pickupOption && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-200">Collecte</span>}
                    {s.deliveryOption && <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-200">Livraison</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Colonne Trajets */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-bold text-primary bg-white p-4 rounded-t-2xl border-b border-border">
            <Plane className="h-5 w-5 text-accent" />
            <h3>Trajets disponibles</h3>
            <span className="ml-auto bg-accent/10 text-accent text-xs px-2 py-1 rounded-full">{trips.length}</span>
          </div>
          
          <div className="space-y-3 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoadingTrips ? (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                Chargement...
              </div>
            ) : trips.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-border/50">
                Aucun trajet disponible.
              </div>
            ) : (
              trips.map(t => (
                <div 
                  key={t.id}
                  onClick={() => setSelectedTrip(t.id)}
                  className={`bg-card p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedTrip === t.id 
                      ? 'border-accent shadow-md shadow-accent/20 bg-accent/5' 
                      : 'border-border/50 hover:border-accent/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <span>{t.departureCity}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span>{t.arrivalCity}</span>
                    </div>
                    <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      {t.baggageFreeKg}kg dispo
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                    <span className="font-medium text-primary">{formatDate(t.departureDate)}</span>
                    <span className="mx-1">•</span>
                    <span>Min {formatCurrency(t.minReward)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <AnimatePresence>
        {selectedShipment && selectedTrip && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground p-4 rounded-2xl shadow-2xl shadow-primary/30 flex items-center gap-6 border border-primary-foreground/10"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-accent" />
              <div>
                <p className="font-bold">Prêt à matcher !</p>
                <p className="text-xs text-primary-foreground/70">Colis #{selectedShipment} avec Trajet #{selectedTrip}</p>
              </div>
            </div>
            <button 
              onClick={handleCreateMatch}
              disabled={createMatchMutation.isPending}
              className="bg-accent hover:bg-accent/90 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {createMatchMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Créer le Match"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
