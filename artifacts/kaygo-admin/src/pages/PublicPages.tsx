import { Link } from "wouter";
import { FormEvent, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Ban,
  Calculator,
  CheckCircle2,
  Clock,
  FileQuestion,
  Handshake,
  HelpCircle,
  MapPin,
  MessageCircle,
  Package,
  Plane,
  Route,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { apiJson, hasApiBaseUrl } from "@/lib/api";

type PriceEstimateResponse = {
  transportFee: number;
  serviceFee: number;
  pickupFee: number;
  deliveryFee: number;
  totalPrice: number;
  serviceLevel: string;
  estimatedDays: number;
};

const DEFAULT_WHATSAPP_URL = "https://wa.me/596696653589";
const whatsappUrl = import.meta.env.VITE_WHATSAPP_URL?.trim() || DEFAULT_WHATSAPP_URL;

function publicLink(path: string) {
  return path;
}

function WhatsappButton({ label = "Contacter sur WhatsApp" }: { label?: string }) {
  if (!whatsappUrl) {
    return (
      <Link
        href="/contact"
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#04a7b5] px-5 py-3 text-sm font-black text-white shadow-xl shadow-cyan-900/15 transition hover:-translate-y-0.5"
      >
        <MessageCircle className="h-4 w-4" />
        Nous contacter
      </Link>
    );
  }

  return (
    <a
      href={whatsappUrl}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#04a7b5] px-5 py-3 text-sm font-black text-white shadow-xl shadow-cyan-900/15 transition hover:-translate-y-0.5"
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </a>
  );
}

function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f8f8] text-[#10243f]">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="KAYGO" className="h-11 w-11 rounded-2xl bg-[#10243f] object-contain p-1.5" />
            <div>
              <p className="font-display text-xl font-black tracking-wide text-[#10243f]">KAYGO</p>
              <p className="text-xs font-bold text-slate-500">France ⇄ Martinique</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-bold text-slate-600 md:flex">
            <Link href="/estimer">Estimer</Link>
            <Link href="/objets-autorises">Objets autorisés</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/legal/douane-martinique">Douane</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-[#10243f] sm:inline-flex">
              Admin
            </Link>
            <WhatsappButton label="WhatsApp" />
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="bg-[#07192d] px-4 py-10 text-white sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl font-black">KAYGO</p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Mise en relation structurée pour petits colis entre la France et la Martinique. API séparée, front statique compatible GitHub Pages.
            </p>
          </div>
          <div className="grid gap-2 text-sm text-slate-300">
            <Link href="/">Accueil</Link>
            <Link href="/estimer">Estimer un envoi</Link>
            <Link href="/objets-autorises">Objets autorisés</Link>
            <Link href="/faq">FAQ Martinique</Link>
            <Link href="/legal/cgu">CGU</Link>
            <Link href="/legal/confidentialite">Confidentialité</Link>
            <Link href="/legal/douane-martinique">Douane Martinique</Link>
          </div>
          <div className="grid gap-3">
            <WhatsappButton label="Contacter KAYGO" />
            <Link href="/admin" className="text-sm font-bold text-slate-300">Accès admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CTAGroup() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link href={publicLink("/contact")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#10243f] px-6 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/20">
        Tester un envoi <ArrowRight className="h-4 w-4" />
      </Link>
      <Link href={publicLink("/contact")} className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#10243f]/15 bg-white px-6 py-4 text-sm font-black text-[#10243f]">
        Je voyage bientôt
      </Link>
      <Link href={publicLink("/estimer")} className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#04a7b5]/25 bg-[#e6fbfd] px-6 py-4 text-sm font-black text-[#075e68]">
        Estimer mon colis
      </Link>
    </div>
  );
}

function TrustCard({ icon: Icon, title, text }: { icon: typeof ShieldCheck; title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white p-5 shadow-xl shadow-slate-900/5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e6fbfd] text-[#048895]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display text-lg font-black text-[#10243f]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

export function PublicLandingPage() {
  return (
    <PublicShell>
      <section className="relative overflow-hidden px-4 py-12 sm:px-6 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#b8f3f6,transparent_34%),linear-gradient(135deg,#f7fbfb_0%,#f1f7ef_52%,#e9f7fb_100%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              <div className="inline-flex rounded-full border border-[#04a7b5]/20 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#08717b]">
                Petits colis France ⇄ Martinique
              </div>
              <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-amber-700">
                Phase pilote
              </div>
            </div>
            <h1 className="font-display text-4xl font-black leading-[0.98] text-[#10243f] sm:text-6xl lg:text-7xl">
              Envoyez un petit colis France ⇄ Martinique avec un voyageur vérifié.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-650 sm:text-lg">
              KAYGO facilite une mise en relation structurée pour les premiers tests réels : colis contrôlables, validation manuelle, objets interdits visibles et preuve de remise.
            </p>
            <div className="mt-8">
              <CTAGroup />
            </div>
          </div>
          <div className="rounded-[2.5rem] border border-white/70 bg-[#10243f] p-4 shadow-2xl shadow-cyan-950/20">
            <div className="rounded-[2rem] bg-[linear-gradient(145deg,#0e3154,#096a7a)] p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100">Trajet ciblé</p>
                  <h2 className="mt-2 font-display text-3xl font-black">Paris → Fort-de-France</h2>
                </div>
                <Plane className="h-10 w-10 text-cyan-100" />
              </div>
              <div className="mt-8 grid gap-3">
                {["Documents urgents", "Petites pièces", "Colis familial", "Objets du quotidien"].map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-2xl bg-white/10 p-4 backdrop-blur">
                    <span className="font-bold">{item}</span>
                    <CheckCircle2 className="h-5 w-5 text-cyan-100" />
                  </div>
                ))}
              </div>
              <p className="mt-6 rounded-2xl bg-white p-4 text-sm font-bold leading-6 text-[#10243f]">
                Processus : besoin colis → matching voyageur → validation → remise suivie.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <TrustCard icon={BadgeCheck} title="Voyageurs vérifiés" text="Validation manuelle avant mise en relation." />
            <TrustCard icon={Route} title="Processus structuré" text="Demande, matching, validation et remise suivie." />
            <TrustCard icon={Package} title="Petits colis" text="Priorité aux objets faciles à contrôler." />
            <TrustCard icon={MapPin} title="France ⇄ Martinique" text="Périmètre clair dès le lancement." />
            <TrustCard icon={Clock} title="Suivi humain" text="Aucune promesse automatique sans confirmation." />
            <TrustCard icon={Ban} title="Objets interdits" text="Règles visibles avant demande." />
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-900/5 md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#048895]">Comment ça marche</p>
          <div className="mt-6 grid gap-5 md:grid-cols-4">
            {["Déposez votre besoin", "Matching", "Validation", "Suivi / remise"].map((step, index) => (
              <div key={step} className="rounded-3xl bg-[#f4f8f8] p-5">
                <p className="text-sm font-black text-[#04a7b5]">0{index + 1}</p>
                <h3 className="mt-3 font-display text-xl font-black">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#048895]">Cas d’usage locaux</p>
            <h2 className="mt-3 font-display text-4xl font-black">Des besoins concrets, pas une marketplace dispersée.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Documents urgents", "Vêtements oubliés", "Petites pièces", "Colis familiaux", "Objets du quotidien", "Demande entreprise"].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 font-bold text-[#10243f]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-[#07192d] p-6 text-white md:p-10">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Estimation</p>
              <h2 className="mt-3 font-display text-4xl font-black text-white">Préparez un envoi en moins d’une minute.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                L’estimation reste indicative tant que l’API pricing n’est pas confirmée. Elle sert à cadrer poids, trajet et niveau de service.
              </p>
            </div>
            <Link href="/estimer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-4 font-black text-[#10243f]">
              Estimer un prix <Calculator className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

export function EstimatePage() {
  const [departureCity, setDepartureCity] = useState("Paris");
  const [arrivalCity, setArrivalCity] = useState("Fort-de-France");
  const [weightKg, setWeightKg] = useState("2");
  const [serviceLevel, setServiceLevel] = useState<"eco" | "confort" | "premium">("eco");
  const [pickupOption, setPickupOption] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState(true);
  const [urgencyLevel, setUrgencyLevel] = useState<"normal" | "urgent">("normal");
  const [estimate, setEstimate] = useState<PriceEstimateResponse | null>(null);
  const [estimateStatus, setEstimateStatus] = useState<"idle" | "loading" | "error">("idle");
  const [estimateMessage, setEstimateMessage] = useState("");

  async function handleEstimate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstimateStatus("loading");
    setEstimateMessage("");

    try {
      const result = await apiJson<PriceEstimateResponse>("/api/pricing/estimate", {
        method: "POST",
        body: JSON.stringify({
          weightKg: Number(weightKg),
          pickupOption,
          deliveryOption,
          urgencyLevel,
          serviceLevel,
        }),
      });
      setEstimate(result);
      setEstimateStatus("idle");
      setEstimateMessage("Estimation API calculée. Prix indicatif sous réserve de validation du colis et du trajet.");
    } catch {
      setEstimate(null);
      setEstimateStatus("error");
      setEstimateMessage("API pricing indisponible. L’estimation réelle nécessite VITE_API_BASE_URL et l’API KayGo en ligne.");
    }
  }

  return (
    <PublicShell>
      <PublicPageHero eyebrow="Estimation" title="Estimer un envoi France ⇄ Martinique" text="Simulation indicative sans paiement. Le prix final dépend de la validation du colis, du trajet disponible et du voyageur." icon={Calculator} />
      <section className="px-4 pb-16 sm:px-6">
        <form onSubmit={handleEstimate} className="mx-auto grid max-w-5xl gap-4 rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-900/5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-black text-[#10243f]">
            Ville départ
            <input value={departureCity} onChange={(event) => setDepartureCity(event.target.value)} className="min-h-12 rounded-2xl border border-slate-200 px-4 font-semibold outline-none focus:border-[#04a7b5]" />
          </label>
          <label className="grid gap-2 text-sm font-black text-[#10243f]">
            Ville arrivée
            <input value={arrivalCity} onChange={(event) => setArrivalCity(event.target.value)} className="min-h-12 rounded-2xl border border-slate-200 px-4 font-semibold outline-none focus:border-[#04a7b5]" />
          </label>
          <label className="grid gap-2 text-sm font-black text-[#10243f]">
            Poids estimé kg
            <input type="number" min="0.1" max="30" step="0.1" value={weightKg} onChange={(event) => setWeightKg(event.target.value)} className="min-h-12 rounded-2xl border border-slate-200 px-4 font-semibold outline-none focus:border-[#04a7b5]" />
          </label>
          <label className="grid gap-2 text-sm font-black text-[#10243f]">
            Niveau de service
            <select value={serviceLevel} onChange={(event) => setServiceLevel(event.target.value as "eco" | "confort" | "premium")} className="min-h-12 rounded-2xl border border-slate-200 px-4 font-semibold outline-none focus:border-[#04a7b5]">
              <option value="eco">Éco</option>
              <option value="confort">Confort</option>
              <option value="premium">Premium</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-black text-[#10243f]">
            Urgence
            <select value={urgencyLevel} onChange={(event) => setUrgencyLevel(event.target.value as "normal" | "urgent")} className="min-h-12 rounded-2xl border border-slate-200 px-4 font-semibold outline-none focus:border-[#04a7b5]">
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
          <div className="grid gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-black text-[#10243f]">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={pickupOption} onChange={(event) => setPickupOption(event.target.checked)} />
              Collecte en France
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={deliveryOption} onChange={(event) => setDeliveryOption(event.target.checked)} />
              Livraison en Martinique
            </label>
          </div>

          <div className="rounded-2xl bg-[#e6fbfd] p-4 text-sm font-bold leading-6 text-[#075e68] md:col-span-2">
            Prix indicatif sous réserve de validation du colis, du voyageur disponible, des règles douanières et des objets interdits. API configurée : {hasApiBaseUrl() ? "oui" : "non"}.
          </div>

          {estimateMessage && (
            <div className={`rounded-2xl p-4 text-sm font-bold leading-6 md:col-span-2 ${estimateStatus === "error" ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}>
              {estimateMessage}
            </div>
          )}

          {estimate && (
            <div className="grid gap-3 rounded-[1.5rem] border border-[#04a7b5]/20 bg-[#f4fbfc] p-5 md:col-span-2 md:grid-cols-5">
              <PriceItem label="Transport" value={estimate.transportFee} />
              <PriceItem label="Service" value={estimate.serviceFee} />
              <PriceItem label="Collecte" value={estimate.pickupFee} />
              <PriceItem label="Livraison" value={estimate.deliveryFee} />
              <PriceItem label="Total indicatif" value={estimate.totalPrice} strong />
              <p className="text-xs font-bold text-slate-600 md:col-span-5">
                Délai estimé : {estimate.estimatedDays} jour(s), à confirmer après validation.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row">
            <button type="submit" disabled={estimateStatus === "loading"} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#10243f] px-6 py-4 text-sm font-black text-white disabled:opacity-70">
              {estimateStatus === "loading" ? "Calcul..." : "Calculer l’estimation"}
            </button>
            <WhatsappButton label="Envoyer ma demande" />
          </div>
        </form>
      </section>
    </PublicShell>
  );
}

export function AllowedItemsPage() {
  return (
    <PublicShell>
      <PublicPageHero eyebrow="Sécurité" title="Objets autorisés et interdits" text="KAYGO doit rester simple à contrôler : petits colis, contenu clair, validation avant mise en relation." icon={ShieldCheck} />
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          <InfoList title="Autorisés" items={["Documents", "Vêtements", "Petites pièces non dangereuses", "Objets du quotidien", "Colis familiaux contrôlables"]} />
          <InfoList title="Interdits" items={["Produits dangereux", "Liquides inflammables", "Argent liquide", "Médicaments réglementés", "Objets illégaux ou non déclarés"]} />
          <InfoList title="À valider" items={["Objets fragiles", "Électronique", "Valeur élevée", "Produit alimentaire", "Volume atypique"]} />
        </div>
      </section>
    </PublicShell>
  );
}

export function FaqPage() {
  const questions = [
    ["Quels délais entre France et Martinique ?", "Les délais sont indicatifs et dépendent des trajets voyageurs validés."],
    ["Comment sont validés les voyageurs ?", "Le processus exact dépend de l’admin et doit rester vérifié avant lancement public complet."],
    ["Comment payer ?", "Le paiement réel doit rester lié à l’API ou à un parcours validé. Pas de promesse automatique ici."],
    ["Où se fait la remise ?", "Les points de remise sont confirmés pendant la validation."],
  ];

  return (
    <PublicShell>
      <PublicPageHero eyebrow="FAQ" title="Questions fréquentes Martinique" text="Réponses simples pour cadrer les premiers tests réels sans surpromettre." icon={FileQuestion} />
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto grid max-w-4xl gap-4">
          {questions.map(([question, answer]) => (
            <div key={question} className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-900/5">
              <h2 className="font-display text-xl font-black">{question}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{answer}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}

export function ContactPage() {
  return (
    <PublicShell>
      <PublicPageHero eyebrow="Contact" title="Démarrer un envoi ou publier un trajet" text="Utilisez WhatsApp si configuré, ou préparez votre demande avec départ, arrivée, poids et contrainte de délai." icon={Handshake} />
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
          <ContactCard title="Envoyer un colis" text="Décrivez l’objet, le poids, la ville de départ et la ville d’arrivée." />
          <ContactCard title="Publier un trajet" text="Indiquez vos dates, bagage disponible et ville d’arrivée." />
          <ContactCard title="Demande entreprise" text="Précisez volume, fréquence et contact opérationnel." />
        </div>
        <div className="mx-auto mt-8 max-w-5xl rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-900/5">
          <WhatsappButton label="Contacter KAYGO" />
          <p className="mt-4 text-sm font-bold text-slate-500">
            WhatsApp business pilote : +596 696 65 35 89.
          </p>
        </div>
      </section>
    </PublicShell>
  );
}

export function LegalCguPage() {
  return (
    <PublicShell>
      <PublicPageHero eyebrow="Conditions générales" title="CGU KayGo - phase pilote" text="Cadre minimal de mise en relation pour petits colis France ⇄ Martinique. À faire relire avant exploitation commerciale complète." icon={FileQuestion} />
      <LegalSection
        title="Rôle de KayGo"
        items={[
          "KayGo est une plateforme de mise en relation entre expéditeurs, voyageurs et destinataires.",
          "KayGo ne promet pas automatiquement qu’un colis sera accepté, transporté ou livré.",
          "Chaque demande reste soumise à validation manuelle, disponibilité voyageur et conformité du contenu.",
        ]}
      />
      <LegalSection
        title="Responsabilités utilisateur"
        items={[
          "L’expéditeur déclare le contenu réel du colis et fournit des informations exactes.",
          "Le voyageur ne doit accepter qu’un colis vérifié, contrôlable et compatible avec son trajet.",
          "KayGo peut refuser une demande si elle présente un risque opérationnel, légal ou de sécurité.",
        ]}
      />
    </PublicShell>
  );
}

export function LegalPrivacyPage() {
  return (
    <PublicShell>
      <PublicPageHero eyebrow="Confidentialité" title="Données personnelles et contact" text="Politique simple pour la phase pilote : collecter peu, protéger les données, permettre la suppression." icon={ShieldCheck} />
      <LegalSection
        title="Données collectées"
        items={[
          "Identité, contact, informations de trajet, demande colis et échanges nécessaires au suivi.",
          "Les données servent à qualifier les demandes, contacter les parties et gérer les preuves de remise.",
          "Les emails et téléphones ne doivent pas être affichés publiquement.",
        ]}
      />
      <LegalSection
        title="Droits et consentement"
        items={[
          "L’utilisateur peut demander export, correction ou suppression des données.",
          "Le contact WhatsApp/email doit rester lié à une demande ou un consentement explicite.",
          "Aucun secret, token ou mot de passe ne doit être stocké dans le dépôt ou affiché dans l’interface.",
        ]}
      />
    </PublicShell>
  );
}

export function LegalProhibitedItemsPage() {
  return (
    <PublicShell>
      <PublicPageHero eyebrow="Objets interdits" title="Objets refusés ou à validation renforcée" text="KayGo privilégie les petits colis simples à contrôler. Tout doute doit bloquer la mise en relation." icon={Ban} />
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          <InfoList title="Refusés" items={["Batteries seules ou power banks non validés", "E-cigarettes ou éléments réglementés", "Liquides inflammables", "Aérosols non validés", "Armes, argent liquide, produits illégaux"]} />
          <InfoList title="Réglementés" items={["Médicaments", "Produits alimentaires", "Électronique de valeur", "Cosmétiques / liquides", "Animaux, végétaux ou espèces protégées"]} />
          <InfoList title="Exigences" items={["Description claire", "Photo si utile", "Poids réel", "Valeur déclarée", "Refus possible sans justification détaillée en cas de risque"]} />
        </div>
      </section>
    </PublicShell>
  );
}

export function LegalCustomsPage() {
  return (
    <PublicShell>
      <PublicPageHero eyebrow="Douane Martinique" title="Rappel douane, TVA et octroi de mer" text="La Martinique est un DROM : certains biens peuvent nécessiter formalités, taxes ou refus. Cette page reste informative et doit être vérifiée avant lancement." icon={MapPin} />
      <LegalSection
        title="Points à retenir"
        items={[
          "L’utilisateur reste responsable de la déclaration réelle du contenu et de sa valeur.",
          "Certains biens peuvent être soumis à TVA, octroi de mer ou formalités douanières.",
          "KayGo peut suspendre une demande si le contenu, la valeur ou la destination posent un doute.",
        ]}
      />
      <LegalSection
        title="Avant validation"
        items={[
          "Confirmer la nature du bien, son poids, sa valeur, ses restrictions et son conditionnement.",
          "Refuser les objets dangereux, réglementés ou impossibles à contrôler.",
          "Conserver une trace de validation pour la phase pilote.",
        ]}
      />
    </PublicShell>
  );
}

function PublicPageHero({ eyebrow, title, text, icon: Icon }: { eyebrow: string; title: string; text: string; icon: typeof HelpCircle }) {
  return (
    <section className="px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-5xl rounded-[2rem] bg-[linear-gradient(135deg,#10243f,#076b78)] p-8 text-white shadow-2xl shadow-cyan-950/15 md:p-12">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
          <Icon className="h-7 w-7 text-cyan-100" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100">{eyebrow}</p>
        <h1 className="mt-4 font-display text-4xl font-black leading-tight text-white md:text-6xl">{title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200">{text}</p>
      </div>
    </section>
  );
}

function PriceItem({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className={`mt-2 font-display ${strong ? "text-2xl font-black text-[#10243f]" : "text-xl font-black text-[#075e68]"}`}>
        {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value)}
      </p>
    </div>
  );
}

function LegalSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="px-4 pb-8 sm:px-6">
      <div className="mx-auto max-w-5xl rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-900/5">
        <h2 className="font-display text-2xl font-black">{title}</h2>
        <div className="mt-5 grid gap-3">
          {items.map((item) => (
            <div key={item} className="flex gap-3 rounded-2xl bg-[#f4f8f8] p-4 text-sm font-bold leading-6 text-slate-700">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[#04a7b5]" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-900/5">
      <h2 className="font-display text-2xl font-black">{title}</h2>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <div key={item} className="flex gap-3 rounded-2xl bg-[#f4f8f8] p-3 text-sm font-bold">
            <Sparkles className="h-5 w-5 shrink-0 text-[#04a7b5]" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-900/5">
      <h2 className="font-display text-2xl font-black">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
    </div>
  );
}
