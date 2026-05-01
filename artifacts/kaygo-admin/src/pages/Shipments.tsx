import { useState } from "react";
import { useListShipments } from "@workspace/api-client-react";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { Package, Search, Navigation } from "lucide-react";

export default function Shipments() {
  const [filter, setFilter] = useState("");
  const { data, isLoading } = useListShipments();

  const shipments = data?.shipments || [];
  const filteredShipments = shipments.filter((s: any) =>
    s.departureCity.toLowerCase().includes(filter.toLowerCase()) ||
    s.arrivalCity.toLowerCase().includes(filter.toLowerCase()) ||
    s.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Colis</h1>
          <p className="text-muted-foreground">Gérez les demandes d'expédition.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Rechercher colis..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 w-64 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-lg shadow-black/5 border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="px-6 py-4">Trajet</th>
                <th className="px-6 py-4">Détails Colis</th>
                <th className="px-6 py-4">Expéditeur</th>
                <th className="px-6 py-4">Options</th>
                <th className="px-6 py-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Chargement...</td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Aucun colis trouvé.</td>
                </tr>
              ) : (
                filteredShipments.map((shipment: any) => (
                  <tr key={shipment.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium">
                        <Navigation className="h-4 w-4 text-muted-foreground" />
                        <span>{shipment.departureCity}</span>
                        <span className="text-muted-foreground mx-1">→</span>
                        <span>{shipment.arrivalCity}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Créé le {formatDate(shipment.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{shipment.category.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">{shipment.weightKg} kg</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {shipment.senderName || `User #${shipment.senderId}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {shipment.pickupOption && (
                          <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium border border-amber-200">Collecte</span>
                        )}
                        {shipment.deliveryOption && (
                          <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium border border-purple-200">Livraison</span>
                        )}
                        {!shipment.pickupOption && !shipment.deliveryOption && (
                          <span className="text-xs text-muted-foreground">Standard</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={shipment.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
