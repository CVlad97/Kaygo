import { Switch, Route, Router as WouterRouter } from "wouter";
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
    <AdminLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/utilisateurs" component={Users} />
        <Route path="/trajets" component={Trips} />
        <Route path="/colis" component={Shipments} />
        <Route path="/matching" component={Matches} />
        <Route path="/paiements" component={Payments} />
        <Route path="/litiges"><ComingSoon title="Gestion des litiges" /></Route>
        <Route path="/parametres"><ComingSoon title="Paramètres système" /></Route>
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
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
