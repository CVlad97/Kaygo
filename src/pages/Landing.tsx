import { ArrowRight, Package, Plane, Shield, Clock, Search, MapPin, Users, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { PricingCalculator } from "@/components/PricingCalculator";

const steps = [
  { icon: Search, title: "Recherchez", desc: "Trouvez un voyageur qui fait le trajet France ⇄ Outre-mer" },
  { icon: Package, title: "Confiez", desc: "Déposez votre colis ou faites-le récupérer à domicile" },
  { icon: Plane, title: "Suivez", desc: "Suivez votre colis en temps réel pendant le transport" },
  { icon: Shield, title: "Recevez", desc: "Récupérez votre colis à destination, livré en mains propres" },
];

const features = [
  { icon: Package, title: "Colis jusqu'à 30 kg", desc: "Petits et moyens colis acceptés" },
  { icon: CreditCard, title: "Prix imbattables", desc: "Jusqu'à 60% moins cher que les transporteurs traditionnels" },
  { icon: Clock, title: "Livraison rapide", desc: "Expédié dès le prochain voyage disponible" },
  { icon: Shield, title: "Voyageurs vérifiés", desc: "Chaque voyageur est identifié et approuvé" },
  { icon: MapPin, title: "Suivi GPS", desc: "Localisez votre colis à chaque étape" },
  { icon: Users, title: "Communauté de confiance", desc: "Basée sur les avis et recommandations" },
];

const testimonials = [
  { name: "Marie D.", role: "Expéditrice", text: "J'ai envoyé un colis de Paris à Fort-de-France en 3 jours. 40€ au lieu de 85€ chez le transporteur classique !", rating: 5 },
  { name: "Thomas L.", role: "Voyageur", text: "Je voyageais à vide, maintenant je rentabilise mes trajets en emportant des colis. Super expérience !", rating: 5 },
  { name: "Sophie M.", role: "Expéditrice", text: "Le suivi est génial, je savais exactement où était mon colis à chaque étape. Très rassurant.", rating: 5 },
];

const stats = [
  { value: "5 000+", label: "Colis livrés" },
  { value: "98%", label: "Satisfaction" },
  { value: "2 500+", label: "Voyageurs" },
  { value: "50+", label: "Villes desservies" },
];

export function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                Transport de colis <br />
                <span className="text-yellow-300">entre particuliers</span>
                <br />France ⇄ Outre-mer
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-lg">
                Kaygo connecte expéditeurs et voyageurs pour un transport de colis économique, rapide et de confiance.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/estimation"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-blue-900 font-semibold rounded-xl hover:bg-yellow-300 transition-all shadow-lg shadow-blue-900/20"
                >
                  Estimer un prix <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur text-white border border-white/20 rounded-xl hover:bg-white/20 transition-all"
                >
                  Devenir voyageur <Users className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <PricingCalculator compact />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-50 dark:bg-gray-900 border-y border-blue-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Comment ça marche ?</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Envoyez vos colis facilement grâce aux voyageurs qui font le trajet
        </p>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">0{i + 1}</div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Pourquoi Kaygo ?</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Une solution innovante pour tous vos envois
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold mb-2">{feat.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Ils nous font confiance</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Découvrez les avis de notre communauté
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 italic">"{t.text}"</p>
              <div>
                <div className="font-semibold text-sm">{t.name}</div>
                <div className="text-xs text-gray-500">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Prêt à expédier ?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Estimez votre tarif en quelques secondes. Rejoignez des milliers d'utilisateurs satisfaits.
          </p>
          <Link
            to="/estimation"
            className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 text-blue-900 font-semibold rounded-xl hover:bg-yellow-300 transition-all text-lg shadow-lg"
          >
            Estimer mon prix <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}