import { Package } from "lucide-react";

const footerLinks = {
  Services: [
    { label: "Estimer un prix", to: "/estimation" },
    { label: "Suivre un colis", to: "/suivi" },
    { label: "Devenir voyageur", to: "/register" },
  ],
  Société: [
    { label: "À propos", to: "/faq" },
    { label: "Contact", to: "/contact" },
    { label: "FAQ", to: "/faq" },
  ],
  Légal: [
    { label: "CGV", to: "#" },
    { label: "Politique de confidentialité", to: "#" },
    { label: "Mentions légales", to: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">
              <Package className="w-6 h-6" />
              <span>Kaygo</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              La solution de transport de colis entre particuliers. France ⇄ Outre-mer.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.to}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-500">
          © {new Date().getFullYear()} Kaygo. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}