import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Package, Plus, Search, Clock, MapPin } from "lucide-react";

const mockShipments = [
  { id: "KG8F3A2B1C", destination: "Fort-de-France", status: "in_transit", date: "2026-07-05", weight: "5 kg", price: "45 €" },
  { id: "KG7D4E5F6G", destination: "Cayenne", status: "delivered", date: "2026-07-01", weight: "3 kg", price: "38 €" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  approved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  in_transit: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Bonjour, {user?.name || "Utilisateur"} 👋</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gérez vos envois et suivez vos colis.</p>
        </div>
        <Link
          to="/estimation"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvel envoi
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Colis actifs", value: "1", icon: Package, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/40" },
          { label: "Livrés", value: "3", icon: Clock, color: "text-green-600 bg-green-100 dark:bg-green-900/40" },
          { label: "Total dépensé", value: "128 €", icon: Package, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/40" },
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

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold">Mes envois</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-9 pr-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-1 focus:ring-blue-500 w-48"
            />
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {mockShipments.map((s) => (
            <div key={s.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-sm">{s.id}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {s.destination} — {s.weight}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">{s.date}</span>
                <span className="text-sm font-medium">{s.price}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[s.status] || ""}`}>
                  {s.status === "in_transit" ? "En transit" : s.status === "delivered" ? "Livré" : s.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}