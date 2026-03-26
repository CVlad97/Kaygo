import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { KAYGO_COLORS } from "@/constants/colors";

const FAQ = [
  {
    q: "Comment fonctionne KAYGO ?",
    a: "KAYGO met en relation des expéditeurs (personnes souhaitant envoyer un colis) avec des voyageurs disposant d'espace bagage disponible sur des trajets France ↔ Martinique. Les voyageurs sont vérifiés par notre équipe."
  },
  {
    q: "Comment sont vérifiés les voyageurs ?",
    a: "Chaque voyageur soumet une pièce d'identité et un justificatif de voyage (billet d'avion). Notre équipe valide manuellement chaque profil avant activation. Un badge 'Vérifié' est attribué."
  },
  {
    q: "Que se passe-t-il si mon colis est endommagé ou perdu ?",
    a: "KAYGO couvre les colis jusqu'à 150€ sur signalement sous 48h. Les photos prises à chaque étape (collecte, embarquement, réception) servent de preuve. Ouvrez un litige directement depuis l'application."
  },
  {
    q: "Quels objets sont autorisés ?",
    a: "Vêtements, documents, petits objets du quotidien, accessoires non-électroniques. Sont interdits : médicaments, bijoux de valeur, liquides, produits dangereux ou illicites. Consultez la liste complète depuis le menu."
  },
  {
    q: "Comment est calculé le prix ?",
    a: "Le tarif est basé sur le poids (min 8€ + 4€/kg) + 15% de frais de service. Le service Confort ajoute ~11€ pour la livraison en Martinique. Le service Premium ajoute ~8.5€ pour la collecte en France."
  },
  {
    q: "Quand suis-je débité ?",
    a: "Le paiement est capturé au moment de l'acceptation du match par le voyageur. Les fonds sont libérés au voyageur seulement après confirmation de réception par le destinataire."
  },
  {
    q: "Puis-je annuler une demande ?",
    a: "Oui, tant que le match n'a pas été accepté. Une fois le voyageur engagé, l'annulation peut entraîner des frais selon les conditions générales."
  },
  {
    q: "Comment contacter le voyageur ou le support ?",
    a: "Une fois un match proposé, une messagerie sécurisée s'ouvre dans l'application. Pour le support KAYGO, écrivez à support@kaygo.fr ou via le formulaire dans l'application."
  },
];

export default function FaqScreen() {
  const insets = useSafeAreaInsets();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={KAYGO_COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Questions fréquentes</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: 40 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <Feather name="help-circle" size={32} color={KAYGO_COLORS.accent} />
          <Text style={styles.heroTitle}>Besoin d'aide ?</Text>
          <Text style={styles.heroDesc}>Retrouvez les réponses aux questions les plus fréquentes.</Text>
        </View>

        {FAQ.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.faqCard, openIndex === i && styles.faqCardOpen]}
            onPress={() => setOpenIndex(openIndex === i ? null : i)}
            activeOpacity={0.8}
          >
            <View style={styles.faqTop}>
              <Text style={styles.faqQ}>{item.q}</Text>
              <Feather
                name={openIndex === i ? "chevron-up" : "chevron-down"}
                size={18}
                color={KAYGO_COLORS.textLight}
              />
            </View>
            {openIndex === i && (
              <Text style={styles.faqA}>{item.a}</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Contact */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Vous avez d'autres questions ?</Text>
          <Text style={styles.contactDesc}>Notre équipe répond sous 24h</Text>
          <View style={styles.contactMethods}>
            <View style={styles.contactMethod}>
              <Feather name="mail" size={16} color={KAYGO_COLORS.accent} />
              <Text style={styles.contactMethodText}>support@kaygo.fr</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: KAYGO_COLORS.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: KAYGO_COLORS.white, borderBottomWidth: 1, borderBottomColor: KAYGO_COLORS.border },
  backBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: KAYGO_COLORS.background, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.textDark },
  hero: { alignItems: "center", gap: 8, paddingVertical: 20, paddingHorizontal: 20 },
  heroTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.textDark },
  heroDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textLight, textAlign: "center" },
  faqCard: { backgroundColor: KAYGO_COLORS.white, borderRadius: 14, padding: 16, gap: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  faqCardOpen: { borderLeftWidth: 3, borderLeftColor: KAYGO_COLORS.accent },
  faqTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  faqQ: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", color: KAYGO_COLORS.textDark, lineHeight: 21 },
  faqA: { fontSize: 13, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textMid, lineHeight: 21 },
  contactCard: { backgroundColor: KAYGO_COLORS.primary, borderRadius: 16, padding: 20, gap: 8, marginTop: 8 },
  contactTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.white },
  contactDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)" },
  contactMethods: { marginTop: 8, gap: 8 },
  contactMethod: { flexDirection: "row", alignItems: "center", gap: 10 },
  contactMethodText: { fontSize: 13, fontFamily: "Inter_500Medium", color: KAYGO_COLORS.accent },
});
