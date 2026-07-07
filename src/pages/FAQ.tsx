import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FAQItem } from "@/types";

const faqs: FAQItem[] = [
  { question: "Comment fonctionne Kaygo ?", answer: "Kaygo met en relation des expéditeurs de colis avec des voyageurs qui effectuent le trajet France ⇄ Outre-mer. Le voyageur emporte le colis dans ses bagages et le remet en mains propres à destination." },
  { question: "Quels sont les poids acceptés ?", answer: "Nous acceptons les colis jusqu'à 30 kg. Au-delà, contactez-nous pour une solution personnalisée." },
  { question: "Comment sont vérifiés les voyageurs ?", answer: "Chaque voyageur est identifié via une pièce d'identité valide et son compte est approuvé manuellement par notre équipe. Nous vérifions également les avis des expéditeurs précédents." },
  { question: "Quels sont les délais de livraison ?", answer: "Les délais dépendent du service choisi : Éco (7-10 jours), Confort (5-7 jours), Premium (3-5 jours). Le voyageur réserve son trajet et vous êtes informé des dates exactes." },
  { question: "Puis-je suivre mon colis en temps réel ?", answer: "Oui ! Chaque colis est associé à un numéro de suivi unique. Vous pouvez suivre son parcours étape par étape, du dépôt à la livraison." },
  { question: "Que se passe-t-il en cas de perte ou dommage ?", answer: "Tous les colis sont couverts par une assurance transport jusqu'à 200€. Pour les valeurs supérieures, une assurance complémentaire est disponible." },
  { question: "Comment payer ?", answer: "Le paiement est sécurisé via notre plateforme. Les fonds sont séquestrés jusqu'à la confirmation de livraison, garantissant la sécurité des deux parties." },
  { question: "Puis-je devenir voyageur ?", answer: "Oui ! Si vous voyagez régulièrement entre la France et l'Outre-mer, inscrivez-vous comme voyageur. Vous rentabilisez vos trajets en transportant des colis." },
  { question: "Quels documents dois-je fournir pour expédier ?", answer: "Pour les colis standards, aucun document spécial n'est nécessaire. Pour les colis professionnels ou de valeur, une facture ou déclaration de valeur peut être demandée." },
  { question: "Kaygo est-il disponible partout ?", answer: "Nous couvrons actuellement les principales villes de France métropolitaine et les DROM-COM (Martinique, Guadeloupe, Guyane, La Réunion, Mayotte). Nous étendons régulièrement notre réseau." },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Foire aux questions</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Tout ce que vous devez savoir sur Kaygo
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">{faq.question}</span>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
              />
            </button>
            {openIndex === i && (
              <div className="px-6 pb-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}