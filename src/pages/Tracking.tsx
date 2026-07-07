import { useState } from "react";
import { Search, Package, MapPin, Clock, CheckCircle, Loader2 } from "lucide-react";

const mockShipments = [
  { id: "KG8F3A2B1C", departure: "Paris", arrival: "Fort-de-France", status: "in_transit", date: "2026-07-05", eta: "2026-07-08" },
  { id: "KG7D4E5F6G", departure: "Marseille", arrival: "Cayenne", status: "delivered", date: "2026-07-01", eta: "2026-07-04" },
  { id: "KG1H2I3J4K", departure: "Lyon", arrival: "Saint-Denis", status: "pending", date: "2026-07-10", eta: "2026-07-15" },
];

const statusConfig = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", icon: Clock },
  approved: { label: "Approuvé", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: CheckCircle },
  in_transit: { label: "En transit", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300", icon: Package },
  delivered: { label: "Livré", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle },
  cancelled: { label: "Annulé", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: Package },
};

export function Tracking() {
  const [trackingId, setTrackingId] = useState("");
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState<typeof mockShipments[0] | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = () => {
    setSearching(true);
    setNotFound(false);
    setFound(null);
    setTimeout(() => {
      const s = mockShipments.find((s) => s.id === trackingId.toUpperCase());
      if (s) {
        setFound(s);
      } else {
        setNotFound(true);
      }
      setSearching(false);
    }, 800);
  };

  const timeline = [
    { label: "Colis déposé", date: "2026-07-05", done: true },
    { label: "Contrôle qualité", date: "2026-07-05", done: true },
    { label: "Confié au voyageur", date: "2026-07-06", done: found?.status !== "pending" },
    { label: "En transit", date: "2026-07-06", done: found?.status === "in_transit" || found?.status === "delivered" },
    { label: "Arrivé à destination", date: "2026-07-08", done: found?.status === "delivered" },
    { label: "Livré", date: "2026-07-08", done: found?.status === "delivered" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Suivre un colis</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Entrez votre numéro de suivi pour connaître l'état de votre colis
        </p>
      </div>

      <div className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="KG8F3A2B1C"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={searching || !trackingId.trim()}
          className="px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          Suivre
        </button>
      </div>

      {notFound && (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">Aucun colis trouvé avec ce numéro de suivi.</p>
          <p className="text-sm text-red-500 mt-1">Vérifiez le numéro et réessayez.</p>
        </div>
      )}

      {found && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Colis {found.id}</h2>
                <p className="text-sm text-gray-500">Expédié le {found.date}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[found.status as keyof typeof statusConfig]?.color || ""}`}>
                {statusConfig[found.status as keyof typeof statusConfig]?.label}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {found.departure}</div>
              <span>→</span>
              <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {found.arrival}</div>
              <div className="flex items-center gap-1 ml-auto"><Clock className="w-4 h-4" /> ETA: {found.eta}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-4">Chronologie</h3>
            <div className="space-y-0">
              {timeline.map((step, i) => (
                <div key={step.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${step.done ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`} />
                    {i < timeline.length - 1 && <div className={`w-0.5 h-10 ${step.done ? "bg-green-300" : "bg-gray-200 dark:bg-gray-700"}`} />}
                  </div>
                  <div className={`pb-6 ${step.done ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}`}>
                    <div className="text-sm font-medium">{step.label}</div>
                    <div className="text-xs">{step.done ? step.date : "—"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm text-gray-500 dark:text-gray-400">
        <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Exemples de suivi :</p>
        {mockShipments.map((s) => (
          <button
            key={s.id}
            onClick={() => { setTrackingId(s.id); }}
            className="text-blue-600 dark:text-blue-400 hover:underline mr-4"
          >
            {s.id}
          </button>
        ))}
      </div>
    </div>
  );
}