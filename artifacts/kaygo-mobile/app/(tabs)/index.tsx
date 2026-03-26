import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { KAYGO_COLORS } from "@/constants/colors";
import { useKaygo } from "@/context/KaygoContext";

const HOW_IT_WORKS = [
  { step: "1", icon: "navigation" as const, label: "Un voyageur publie son trajet" },
  { step: "2", icon: "package" as const, label: "Vous soumettez votre colis" },
  { step: "3", icon: "check-circle" as const, label: "KAYGO valide et propose un match" },
  { step: "4", icon: "map-pin" as const, label: "Remise sécurisée à destination" },
];

const ALLOWED_ITEMS = [
  { icon: "shirt" as const, label: "Vêtements", allowed: true },
  { icon: "file-text" as const, label: "Documents", allowed: true },
  { icon: "gift" as const, label: "Petits objets", allowed: true },
  { icon: "alert-triangle" as const, label: "Médicaments", allowed: false },
  { icon: "alert-triangle" as const, label: "Bijoux de valeur", allowed: false },
  { icon: "alert-triangle" as const, label: "Liquides dangereux", allowed: false },
];

const TRUST_BADGES = [
  { icon: "shield" as const, title: "Voyageurs vérifiés", desc: "Identité confirmée" },
  { icon: "camera" as const, title: "Preuve photo", desc: "À chaque étape" },
  { icon: "lock" as const, title: "Paiement sécurisé", desc: "Après confirmation" },
  { icon: "star" as const, title: "Noté et évalué", desc: "Communauté de confiance" },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useKaygo();

  const webTop = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: KAYGO_COLORS.background }}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 118 : 100 }}
      >
        {/* Hero Header */}
        <View style={[styles.hero, { paddingTop: insets.top + webTop + 16 }]}>
          {/* Logo row */}
          <View style={styles.heroTopRow}>
            <View style={styles.logoRow}>
              <Feather name="package" size={22} color={KAYGO_COLORS.accent} />
              <Text style={styles.logoText}>KAYGO</Text>
            </View>
            {user && (
              <View style={styles.greetingBadge}>
                <Text style={styles.greetingText}>Bonjour {user.firstName}</Text>
              </View>
            )}
          </View>

          <Text style={styles.heroTitle}>Envoyez malin{"\n"}France ↔ Martinique</Text>
          <Text style={styles.heroDesc}>
            Colis transportés par des voyageurs vérifiés avec espace bagage disponible
          </Text>

          {/* 3 CTA Buttons */}
          <View style={styles.ctaGrid}>
            <TouchableOpacity
              style={[styles.ctaCard, styles.ctaCardPrimary]}
              onPress={() => user ? router.push("/trip/create") : router.push("/auth")}
              activeOpacity={0.85}
            >
              <View style={styles.ctaIconWrap}>
                <Feather name="navigation" size={24} color={KAYGO_COLORS.primary} />
              </View>
              <Text style={styles.ctaLabel}>Je voyage</Text>
              <Text style={styles.ctaDesc}>Publier un trajet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.ctaCard, styles.ctaCardAccent]}
              onPress={() => user ? router.push("/shipment/create") : router.push("/auth")}
              activeOpacity={0.85}
            >
              <View style={styles.ctaIconWrapAccent}>
                <Feather name="package" size={24} color={KAYGO_COLORS.white} />
              </View>
              <Text style={[styles.ctaLabel, { color: KAYGO_COLORS.white }]}>J'envoie</Text>
              <Text style={[styles.ctaDesc, { color: "rgba(255,255,255,0.75)" }]}>un colis</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.ctaCard, styles.ctaCardOutline]}
              onPress={() => router.push("/(tabs)/track")}
              activeOpacity={0.85}
            >
              <View style={styles.ctaIconWrapOutline}>
                <Feather name="map-pin" size={24} color={KAYGO_COLORS.primary} />
              </View>
              <Text style={styles.ctaLabel}>Suivre</Text>
              <Text style={styles.ctaDesc}>mon colis</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* How it works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment ça marche</Text>
          {HOW_IT_WORKS.map((item) => (
            <View key={item.step} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{item.step}</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepIcon}>
                <Feather name={item.icon} size={18} color={KAYGO_COLORS.accent} />
              </View>
              <Text style={styles.stepLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Pricing preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tarifs indicatifs</Text>
          <View style={styles.pricingRow}>
            {[
              { label: "Éco", sub: "Remise simple", price: "À partir de 10€", color: KAYGO_COLORS.success },
              { label: "Confort", sub: "Livraison incluse", price: "À partir de 20€", color: KAYGO_COLORS.accent },
              { label: "Premium", sub: "Collecte + livraison", price: "À partir de 35€", color: KAYGO_COLORS.primary },
            ].map((p) => (
              <View key={p.label} style={[styles.priceCard, { borderTopColor: p.color }]}>
                <Text style={[styles.priceLabel, { color: p.color }]}>{p.label}</Text>
                <Text style={styles.priceSub}>{p.sub}</Text>
                <Text style={styles.priceAmount}>{p.price}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Allowed items */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Objets autorisés</Text>
            <TouchableOpacity onPress={() => router.push("/allowed-items")}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.itemsGrid}>
            {ALLOWED_ITEMS.map((item) => (
              <View key={item.label} style={[styles.itemBadge, !item.allowed && styles.itemBadgeForbidden]}>
                <Feather
                  name={item.icon}
                  size={14}
                  color={item.allowed ? KAYGO_COLORS.success : KAYGO_COLORS.danger}
                />
                <Text style={[styles.itemLabel, !item.allowed && styles.itemLabelForbidden]}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Trust */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pourquoi nous faire confiance</Text>
          <View style={styles.trustGrid}>
            {TRUST_BADGES.map((b) => (
              <View key={b.title} style={styles.trustCard}>
                <View style={styles.trustIcon}>
                  <Feather name={b.icon} size={20} color={KAYGO_COLORS.accent} />
                </View>
                <Text style={styles.trustTitle}>{b.title}</Text>
                <Text style={styles.trustDesc}>{b.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* FAQ link */}
        <View style={[styles.section, { marginBottom: 0 }]}>
          <TouchableOpacity style={styles.faqBtn} onPress={() => router.push("/faq")}>
            <Feather name="help-circle" size={18} color={KAYGO_COLORS.accent} />
            <Text style={styles.faqBtnText}>Questions fréquentes</Text>
            <Feather name="chevron-right" size={16} color={KAYGO_COLORS.textLight} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: KAYGO_COLORS.primary,
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 16,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoText: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFF", letterSpacing: 3 },
  greetingBadge: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  greetingText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.85)" },
  heroTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    lineHeight: 34,
  },
  heroDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)",
    lineHeight: 20,
  },
  ctaGrid: { flexDirection: "row", gap: 10 },
  ctaCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    gap: 6,
    backgroundColor: KAYGO_COLORS.white,
  },
  ctaCardPrimary: { backgroundColor: KAYGO_COLORS.white },
  ctaCardAccent: { backgroundColor: KAYGO_COLORS.accent },
  ctaCardOutline: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  ctaIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: KAYGO_COLORS.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaIconWrapAccent: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaIconWrapOutline: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaLabel: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: KAYGO_COLORS.textDark,
  },
  ctaDesc: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: KAYGO_COLORS.textLight,
  },
  section: { padding: 20, gap: 14 },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: KAYGO_COLORS.textDark,
  },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium", color: KAYGO_COLORS.accent },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: KAYGO_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: { fontSize: 13, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.white },
  stepLine: { display: "none" },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: KAYGO_COLORS.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textMid },
  pricingRow: { flexDirection: "row", gap: 10 },
  priceCard: {
    flex: 1,
    backgroundColor: KAYGO_COLORS.white,
    borderRadius: 14,
    padding: 14,
    gap: 4,
    borderTopWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  priceLabel: { fontSize: 13, fontFamily: "Inter_700Bold" },
  priceSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textLight },
  priceAmount: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: KAYGO_COLORS.textDark },
  itemsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  itemBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: KAYGO_COLORS.successLight,
    borderRadius: 20,
  },
  itemBadgeForbidden: { backgroundColor: KAYGO_COLORS.dangerLight },
  itemLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: KAYGO_COLORS.success },
  itemLabelForbidden: { color: KAYGO_COLORS.danger },
  trustGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  trustCard: {
    width: "47%",
    backgroundColor: KAYGO_COLORS.white,
    borderRadius: 14,
    padding: 14,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  trustIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: KAYGO_COLORS.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  trustTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: KAYGO_COLORS.textDark },
  trustDesc: { fontSize: 11, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textLight },
  faqBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: KAYGO_COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: KAYGO_COLORS.border,
  },
  faqBtnText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: KAYGO_COLORS.textDark,
  },
});
