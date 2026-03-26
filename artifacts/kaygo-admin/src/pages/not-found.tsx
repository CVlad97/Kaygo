import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
      <AlertCircle className="h-16 w-16 text-destructive mb-4 opacity-80" />
      <h1 className="text-4xl font-display font-bold text-foreground mb-2">Page introuvable</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link 
        href="/" 
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
      >
        Retour au tableau de bord
      </Link>
    </div>
  );
}
