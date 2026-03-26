import { useState } from "react";
import { useListTrips } from "@workspace/api-client-react";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { PlaneTakeoff, PlaneLanding, Search, Filter } from "lucide-react";

export default function Trips() {
  const [filter, setFilter] = useState("");
  const { data, isLoading } = useListTrips();

  const trips = data?.trips || [];
  const filteredTrips = trips.filter(t => 
    t.departureCity.toLowerCase().includes(filter.toLowerCase()) || 
    t.arrivalCity.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Trajets</h1>
          <p className="text-muted-foreground">Consultez les trajets publiés par les voyageurs.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Chercher une ville..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 w-64 shadow-sm"
            />
          </div>
          <button className="p-2 border border-border rounded-xl bg-card hover:bg-muted text-muted-foreground transition-colors shadow-sm">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-lg shadow-black/5 border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="px-6 py-4">Itinéraire</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Voyageur</th>
                <th className="px-6 py-4">Capacité</th>
                <th className="px-6 py-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Chargement...</td>
                </tr>
              ) : filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Aucun trajet trouvé.</td>
                </tr>
              ) : (
                filteredTrips.map((trip) => {
                  const percentUsed = (trip.baggageUsedKg / trip.baggageTotalKg) * 100;
                  
                  return (
                    <tr key={trip.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-medium">
                          <PlaneTakeoff className="h-4 w-4 text-accent" />
                          <span>{trip.departureCity}</span>
                          <span className="text-muted-foreground mx-1">→</span>
                          <PlaneLanding className="h-4 w-4 text-accent" />
                          <span>{trip.arrivalCity}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">{formatDate(trip.departureDate)}</p>
                        <p className="text-xs text-muted-foreground">Retour: {formatDate(trip.arrivalDate)}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-primary">
                        {trip.travelerName || `User #${trip.travelerId}`}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full max-w-[150px]">
                          <div className="flex justify-between text-xs mb-1 font-medium">
                            <span>{trip.baggageUsedKg}kg</span>
                            <span className="text-muted-foreground">{trip.baggageTotalKg}kg</span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${percentUsed > 80 ? 'bg-red-500' : percentUsed > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${percentUsed}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 text-right">{trip.baggageFreeKg}kg dispo</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={trip.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
