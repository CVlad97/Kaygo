import { NavLink } from "react-router-dom";
import { Package, Sun, Moon, Menu, X, LogIn, UserPlus, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { useState } from "react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/", label: "Accueil" },
    { to: "/estimation", label: "Estimer" },
    { to: "/suivi", label: "Suivre" },
    { to: "/faq", label: "FAQ" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600 dark:text-blue-400">
            <Package className="w-6 h-6" />
            <span>Kaygo</span>
          </NavLink>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {user ? (
              <>
                <NavLink
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </NavLink>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Connexion
                </NavLink>
                <NavLink
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Inscription
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-gray-600 dark:text-gray-300"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="px-4 py-4 space-y-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <hr className="border-gray-200 dark:border-gray-800" />
            <button onClick={toggleTheme} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 w-full">
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {theme === "light" ? "Mode sombre" : "Mode clair"}
            </button>
            {user ? (
              <button onClick={signOut} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 w-full">
                <LogOut className="w-4 h-4" /> Déconnexion
              </button>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                  <LogIn className="w-4 h-4" /> Connexion
                </NavLink>
                <NavLink to="/register" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 font-medium">
                  <UserPlus className="w-4 h-4" /> Inscription
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}