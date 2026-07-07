import { useAuth } from "@/context/AuthContext";
import { Users, Package, Plane, Euro, BarChart3, TrendingUp, Shield, Activity } from "lucide-react";

const adminStats = [
  { label: "Utilisateurs", value: "156", icon: Users, change: "+12 cette semaine", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/40" },
  { label: "Colis en transit", value: "23", icon: Package, change: "+5 aujourd'hui", color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/40" },
  { label: "Voyageurs actifs", value: "48", icon: Plane, change: "92% taux d'occupation", color: "text-purple-600 bg-purple-100 dark:bg-purple-900/40" },
  { label: "Revenus du mois", value: "3 240 €", icon: Euro, change: "+18% vs mois dernier", color: "text-green-600 bg-green-100 dark:bg-green-900/40" },
];

const recentActivity = [
  { action: "Nouvel utilisateur inscrit", user: "Marie D.", time: "Il y a 5 min" },
  { action: "Colis livré", user: "KG8F3A2B1C", time: "Il y a 12 min" },
  { action: "Voyageur vérifié", user: "Thomas L.", time: "Il y a 1h" },
  { action: "Nouveau trajet ajouté", user: "Sophie M.", time: "Il y a 2h" },
  { action: "Paiement reçu", user: "45 € - KG7D4E5F6G", time: "Il y a 3h" },
];

const pendingItems = [
  { type: "Voyageur", name: "Lucas R.", action: "Vérification document" },
  { type: "Colis", name: "KG9H0I1J2K", action: "Approbation nécessaire" },
  { type: "Litige", name: "Colis #KG2A3B4C5D", action: "Réclamation ouverte" },
];

export function Admin() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Administration Kaygo</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Bienvenue, {user?.name || "Admin"}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {adminStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">{stat.change}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Graphique placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Activité du mois
            </h2>
          </div>
          <div className="h-48 flex items-end gap-3">
            {[40, 65, 45, 80, 55, 70, 60, 90, 75, 85, 95, 70].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-blue-500 dark:bg-blue-600 rounded-t-lg hover:bg-blue-600 transition-all"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] text-gray-400">{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-blue-600" />
            Activité récente
          </h2>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-900 dark:text-gray-100">{item.action}</span>
                  <span className="text-gray-500 ml-1">— {item.user}</span>
                </div>
                <span className="text-xs text-gray-400">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Éléments en attente */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <Shield className="w-4 h-4 text-yellow-500" />
          <h2 className="font-semibold">Éléments en attente</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {pendingItems.map((item, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  item.type === "Voyageur" ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300" :
                  item.type === "Colis" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300" :
                  "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300"
                }`}>
                  {item.type === "Voyageur" ? "V" : item.type === "Colis" ? "C" : "L"}
                </div>
                <div>
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.action}</div>
                </div>
              </div>
              <button className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Traiter
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}