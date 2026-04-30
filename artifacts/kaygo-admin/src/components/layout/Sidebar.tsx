import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Plane, Package, GitMerge, CreditCard, AlertTriangle, Settings } from "lucide-react";

const navigation = [
  { name: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard },
  { name: "Utilisateurs", href: "/admin/utilisateurs", icon: Users },
  { name: "Trajets", href: "/admin/trajets", icon: Plane },
  { name: "Colis", href: "/admin/colis", icon: Package },
  { name: "Matching", href: "/admin/matching", icon: GitMerge },
  { name: "Paiements", href: "/admin/paiements", icon: CreditCard },
  { name: "Litiges", href: "/admin/litiges", icon: AlertTriangle },
  { name: "Paramètres", href: "/admin/parametres", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-20 items-center justify-center border-b border-sidebar-border px-6">
        <Link href="/admin" className="flex items-center gap-3 w-full group">
          <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-colors">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="KAYGO Logo" className="h-8 w-8 object-contain" />
          </div>
          <span className="font-display font-bold text-2xl text-white tracking-wide">KAYGO</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
        <div className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-4 px-2">
          Menu Principal
        </div>
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                isActive
                  ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20"
                  : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-200",
                  isActive ? "text-white" : "text-sidebar-foreground/50 group-hover:text-white",
                  isActive && "scale-110"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-white font-bold shadow-inner">AD</div>
          <div>
            <p className="text-sm font-medium text-white">Admin Portal</p>
            <p className="text-xs text-sidebar-foreground/50">v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
