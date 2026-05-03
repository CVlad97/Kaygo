import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import AdminLayout from "@/components/layout/AdminLayout";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/Users";
import Trips from "@/pages/Trips";
import Shipments from "@/pages/Shipments";
import Matches from "@/pages/Matches";
import Payments from "@/pages/Payments";
import NotFound from "@/pages/not-found";
import AdminLogin from "@/pages/AdminLogin";
import {
  AllowedItemsPage,
  ContactPage,
  EstimatePage,
  FaqPage,
  LegalCguPage,
  LegalCustomsPage,
  LegalPrivacyPage,
  LegalProhibitedItemsPage,
  PublicLandingPage,
} from "@/pages/PublicPages";

const queryClient = new QueryClient();

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
    <>
      <QueryRouteNormalizer />
      <Switch>
        <Route path="/" component={PublicLandingPage} />
        <Route path="/estimer" component={EstimatePage} />
        <Route path="/objets-autorises" component={AllowedItemsPage} />
        <Route path="/faq" component={FaqPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/legal/cgu" component={LegalCguPage} />
        <Route path="/legal/confidentialite" component={LegalPrivacyPage} />
        <Route path="/legal/objets-interdits" component={LegalProhibitedItemsPage} />
        <Route path="/legal/douane-martinique" component={LegalCustomsPage} />
        <Route path="/admin/login" component={AdminLogin} />
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
    </>
  );
}

function QueryRouteNormalizer() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const route = new URLSearchParams(window.location.search).get("route");
    if (route?.startsWith("/")) {
      setLocation(route, { replace: true });
    }
  }, [setLocation]);

  return null;
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
