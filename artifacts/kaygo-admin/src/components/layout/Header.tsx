import { Bell, Search } from "lucide-react";

export function Header() {
  return (
    <header className="h-20 bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-30 flex items-center justify-between px-8">
      <div className="flex-1 max-w-lg">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher un utilisateur, trajet ou colis..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-sm shadow-black/5"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-black/5 rounded-full">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border-2 border-background"></span>
        </button>
      </div>
    </header>
  );
}
