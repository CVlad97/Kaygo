import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-bold text-blue-600 dark:text-blue-400 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Page introuvable</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}