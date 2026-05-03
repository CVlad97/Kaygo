import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { ShieldCheck } from "lucide-react";
import { apiJson, hasApiBaseUrl } from "@/lib/api";
import { setAuthSession, type StoredAuthUser } from "@/lib/session";

type LoginResponse = {
  token: string;
  user: StoredAuthUser;
};

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await apiJson<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (response.user.role !== "admin") {
        setStatus("error");
        setMessage("Compte connecté, mais rôle admin requis.");
        return;
      }

      setAuthSession(response.token, response.user);
      navigate("/admin");
    } catch {
      setStatus("error");
      setMessage("Connexion impossible. Vérifiez l’API, les identifiants et le rôle admin.");
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f8f8] px-4 py-10 text-[#10243f]">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] bg-[#07192d] p-8 text-white shadow-2xl shadow-cyan-950/15">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <ShieldCheck className="h-7 w-7 text-cyan-100" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100">Administration KayGo</p>
          <h1 className="mt-4 font-display text-4xl font-black leading-tight">Accès protégé pour la phase pilote.</h1>
          <p className="mt-5 text-sm leading-7 text-slate-300">
            Le tableau de bord utilise une API séparée. Sans `VITE_API_BASE_URL` et sans compte admin valide, aucune donnée opérationnelle ne doit être affichée.
          </p>
          <Link href="/" className="mt-6 inline-flex rounded-full border border-white/15 px-5 py-3 text-sm font-black text-white">
            Retour site public
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-xl shadow-slate-900/5">
          <h2 className="font-display text-3xl font-black">Connexion admin</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Saisissez vos identifiants dans cette interface uniquement. Aucun mot de passe n’est stocké dans le code.
          </p>

          {!hasApiBaseUrl() && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-800">
              `VITE_API_BASE_URL` n’est pas configurée. Le login restera bloqué tant que l’API KayGo séparée n’est pas reliée.
            </div>
          )}

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-black">
              Email admin
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="min-h-12 rounded-2xl border border-slate-200 px-4 font-semibold outline-none focus:border-[#04a7b5]"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-black">
              Mot de passe
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-h-12 rounded-2xl border border-slate-200 px-4 font-semibold outline-none focus:border-[#04a7b5]"
                required
              />
            </label>
          </div>

          {message && (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#10243f] px-5 py-3 text-sm font-black text-white disabled:opacity-70"
          >
            {status === "loading" ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
