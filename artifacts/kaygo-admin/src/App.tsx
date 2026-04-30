import { Switch, Route, Router as WouterRouter, Link } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Package, Plane, ShieldCheck, MessageCircle, ArrowRight } from "lucide-react";

import AdminLayout from "@/components/layout/AdminLayout";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/Users";
import Trips from "@/pages/Trips";
import Shipments from "@/pages/Shipments";
import Matches from "@/pages/Matches";
import Payments from "@/pages/Payments";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function PublicLanding() {
  const whatsappUrl = import.meta.env.VITE_WHATSAPP_URL || "https://wa.me/59600000000";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}images/logo.png`}
              alt="KAYGO Logo"
              className="h-10 w-10 rounded-xl bg-white/10 p-2 object-contain"
            />
            <div>
              <div className="text-lg font-bold tracking-wide">KAYGO</div>
              <div className="text-xs text-white/60">Le colis qui voyage malin</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <Link href="/admin" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/5">
              Accès admin
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
              France ⇄ Martinique
            </div>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl">
              Envoyez vos petits colis plus vite, plus malin, plus local.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/70">
              KAYGO met en relation expéditeurs et voyageurs vérifiés pour faire voyager les petits colis entre la France et la Martinique avec plus de souplesse, de visibilité et de confiance.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-4 font-semibold text-slate-950 hover:bg-cyan-300"
              >
                Demander un envoi
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/admin/trajets" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-6 py-4 font-semibold hover:bg-white/5">
                Publier un trajet
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-500/10">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
                <Package className="mb-3 h-8 w-8 text-cyan-300" />
                <h3 className="font-semibold">Petits colis prioritaires</h3>
                <p className="mt-2 text-sm text-white/65">Documents, vêtements, accessoires, petits objets du quotidien.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
                <Plane className="mb-3 h-8 w-8 text-cyan-300" />
                <h3 className="font-semibold">Voyageurs vérifiés</h3>
                <p className="mt-2 text-sm text-white/65">Validation des profils et des trajets avant mise en relation.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 md:col-span-2">
                <ShieldCheck className="mb-3 h-8 w-8 text-cyan-300" />
                <h3 className="font-semibold">Processus simple et rassurant</h3>
                <p className="mt-2 text-sm text-white/65">Demande, estimation, matching, validation et suivi dans une logique claire. L’API et l’exploitation restent séparées du site public.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/5">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-12 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <div className="mb-2 text-sm font-semibold text-cyan-300">1. Déposez votre besoin</div>
              <p className="text-sm text-white/65">Type de colis, trajet souhaité, délai et niveau de service.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <div className="mb-2 text-sm font-semibold text-cyan-300">2. KAYGO organise le matching</div>
              <p className="text-sm text-white/65">Mise en relation avec un voyageur compatible et validation du dossier.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <div className="mb-2 text-sm font-semibold text-cyan-300">3. Suivez l’avancement</div>
              <p className="text-sm text-white/65">Suivi, preuve et coordination jusqu’à la remise finale.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// Placeholder for unbuilt pages
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <h2 className="text-2xl font-bold text-muted-foreground">{title}</h2>
      <p className="mt-2 text-muted-foreground/70">Cette fonctionnalité est en cours de développement.</p>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={PublicLanding} />
      <Route path="/admin">
        <AdminLayout>
          <Dashboard />
        </AdminLayout>
      </Route>
      <Route path="/admin/utilisateurs">
        <AdminLayout>
          <Users />
        </AdminLayout>
      </Route>
      <Route path="/admin/trajets">
        <AdminLayout>
          <Trips />
        </AdminLayout>
      </Route>
      <Route path="/admin/colis">
        <AdminLayout>
          <Shipments />
        </AdminLayout>
      </Route>
      <Route path="/admin/matching">
        <AdminLayout>
          <Matches />
        </AdminLayout>
      </Route>
      <Route path="/admin/paiements">
        <AdminLayout>
          <Payments />
        </AdminLayout>
      </Route>
      <Route path="/admin/litiges">
        <AdminLayout>
          <ComingSoon title="Gestion des litiges" />
        </AdminLayout>
      </Route>
      <Route path="/admin/parametres">
        <AdminLayout>
          <ComingSoon title="Paramètres système" />
        </AdminLayout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
