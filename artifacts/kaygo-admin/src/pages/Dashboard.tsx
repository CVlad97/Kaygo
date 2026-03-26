import { useGetAdminStats } from "@workspace/api-client-react";
import { Plane, Package, GitMerge, DollarSign, Wallet, MapPin, AlertCircle, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetAdminStats();

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  const kpis = [
    { label: "Trajets Publiés", value: stats?.totalTrips || 0, icon: Plane, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Colis Publiés", value: stats?.totalShipments || 0, icon: Package, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Matchs Validés", value: stats?.validatedMatches || 0, icon: GitMerge, color: "text-teal-500", bg: "bg-teal-500/10" },
    { label: "Revenus Plateforme", value: formatCurrency(stats?.platformRevenue || 0), icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Gains Voyageurs", value: formatCurrency(stats?.travelerGains || 0), icon: Wallet, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Collectes du Jour", value: stats?.collectionsToday || 0, icon: MapPin, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Validations en Attente", value: stats?.pendingValidations || 0, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Litiges Ouverts", value: stats?.openDisputes || 0, icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-display font-bold text-primary">Vue d'ensemble</h1>
        <p className="text-muted-foreground mt-1">Gérez votre plateforme logistique KAYGO.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-card rounded-2xl p-6 border border-border/50 shadow-lg shadow-black/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                <h3 className="text-2xl font-bold text-foreground mt-2">{kpi.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-card rounded-2xl border border-border/50 shadow-lg shadow-black/5 p-6">
          <h3 className="text-lg font-bold mb-4 font-display">Activité Récente</h3>
          <div className="space-y-4">
            {stats?.recentActivity?.map((activity, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-border/50 last:border-0">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
            {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Aucune activité récente
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 shadow-lg shadow-black/5 p-6 flex flex-col justify-center items-center text-center">
          {/* landing page hero scenic mountain landscape */}
          <img 
            src="https://pixabay.com/get/g4d9a3b7f1b73e91d4ced2c7cdcf5af39486f08ee15256e8912f1dae6ab5d23cd97770f064cb607004d64a470a63f6066936ca10e9b3f03472a6c019636667406_1280.jpg" 
            alt="Martinique" 
            className="w-full h-48 object-cover rounded-xl mb-6 shadow-md"
          />
          <h3 className="text-xl font-bold font-display text-primary">Connexion France - Martinique</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            La plateforme KAYGO facilite l'envoi de petits colis rapides, sécurisés et économiques.
          </p>
        </div>
      </div>
    </div>
  );
}
