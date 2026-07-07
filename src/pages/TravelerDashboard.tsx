import { useAuth } from "@/context/AuthContext";
import { Plane, Package, MapPin, Calendar, Euro } from "lucide-react";

const mockTrips = [
  { id: 1, from: "Paris", to: "Fort-de-France", date: "2026-07-15", weight: 15, status: "active", earnings: "0 €" },
  { id: 2, from: "Marseille", to: "Cayenne", date: "2026-07-22", weight: 20, status: "pending", earnings: "0 €" },
];

const mockHistory = [
  { id: "KG8F3A2B1C", from: "Paris", to: "Fort-de-France", weight: "5 kg", earning: "35 €", status: "delivered" },
];

export function TravelerDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Espace Voyageur ✈️</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Bonjour, {user?.name || "Voyageur"}</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
          <Plane className="w-4 h-4" />
          Ajouter un trajet
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Trajets actifs", value: "1", icon: Plane, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/40" },
          { label: "Colis transportés", value: "2", icon: Package, color: "text-green-600 bg-green-100 dark:bg-green-900/40" },
          { label: "Gains totaux", value: "70 €", icon: Euro, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/40" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold">Mes trajets à venir</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {mockTrips.map((trip) => (
            <div key={trip.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <Plane className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> {trip.from}
                    <span className="text-gray-400">→</span>
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> {trip.to}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3 h-3" /> {trip.date}
                    <span>|</span>
                    <Package className="w-3 h-3" /> {trip.weight} kg disponibles
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  trip.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                }`}>
                  {trip.status === "active" ? "Actif" : "En attente"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold">Historique des livraisons</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {mockHistory.map((h) => (
            <div key={h.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-medium text-sm">{h.id}</div>
                  <div className="text-xs text-gray-500">{h.from} → {h.to} · {h.weight}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-green-600">{h.earning}</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Livré</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}