import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { KAYGO_COLORS } from "@/constants/colors";

const ALLOWED = [
  { icon: "check-circle" as const, label: "Vêtements et textiles", detail: "Neufs ou usagés propres" },
  { icon: "check-circle" as const, label: "Chaussures", detail: "Jusqu'à 2 paires par colis" },
  { icon: "check-circle" as const, label: "Documents officiels", detail: "Passeports, actes, diplômes" },
  { icon: "check-circle" as const, label: "Livres et magazines", detail: "Poids raisonnable" },
  { icon: "check-circle" as const, label: "Jouets non-électroniques", detail: "Dimension ≤ 30cm" },
  { icon: "check-circle" as const, label: "Cosmétiques secs", detail: "Crèmes, poudres, non-liquides" },
  { icon: "check-circle" as const, label: "Accessoires de mode", detail: "Sacs, ceintures, bijoux simples" },
  { icon: "check-circle" as const, label: "Matériel de bureau léger", detail: "Stylos, carnets, papeterie" },
];

const FORBIDDEN = [
  { icon: "x-circle" as const, label: "Médicaments", detail: "Tout type de médicament" },
  { icon: "x-circle" as const, label: "Bijoux de grande valeur", detail: "Or, diamants, montres de luxe" },
  { icon: "x-circle" as const, label: "Liquides > 100ml", detail: "Parfums, alcools, liquides" },
  { icon: "x-circle" as const, label: "Produits dangereux", detail: "Batteries lithium, spray, aérosols" },
  { icon: "x-circle" as const, label: "Denrées alimentaires", detail: "Aliments périssables ou emballés" },
  { icon: "x-circle" as const, label: "Objets contondants", detail: "Couteaux, outils, armes" },
  { icon: "x-circle" as const, label: "Marchandises illicites", detail: "Substances prohibées" },
  { icon: "x-circle" as const, label: "Animaux vivants", detail: "Tout animal" },
];

const CONDITIONAL = [
  { label: "Électronique légère", detail: "Téléphone, tablette — accord explicite du voyageur requis" },
  { label: "Produits de beauté liquides ≤ 100ml", detail: "Déclaré obligatoirement, emballage fermé" },
  { label: "Vêtements neufs étiquetés", detail: "Maximum 500€ de valeur déclarée" },
];

export default function AllowedItemsScreen() {
  const insets = useSafeAreaInsets();
  const [section, setSection] = useState<"all" | "forbidden" | "conditions">("all");

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={KAYGO_COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Objets autorisés</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Filter tabs */}
      <View style={styles.tabs}>
        {([["all", "Autorisés"], ["forbidden", "Interdits"], ["conditions", "Conditions"]] as const).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, section === key && styles.tabActive]}
            onPress={() => setSection(key)}
          >
            <Text style={[styles.tabText, section === key && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 40 }}>
        {(section === "all") && (
          <>
            <View style={styles.sectionBanner}>
              <Feather name="check-circle" size={18} color={KAYGO_COLORS.success} />
              <Text style={styles.sectionBannerText}>Ces objets peuvent être transportés via KAYGO</Text>
            </View>
            {ALLOWED.map((item, i) => (
              <View key={i} style={styles.itemCard}>
                <Feather name={item.icon} size={20} color={KAYGO_COLORS.success} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.itemDetail}>{item.detail}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {(section === "forbidden") && (
          <>
            <View style={[styles.sectionBanner, styles.sectionBannerDanger]}>
              <Feather name="alert-triangle" size={18} color={KAYGO_COLORS.danger} />
              <Text style={[styles.sectionBannerText, { color: KAYGO_COLORS.danger }]}>
                Ces objets sont strictement interdits. Tout contrevenant est immédiatement banni de la plateforme.
              </Text>
            </View>
            {FORBIDDEN.map((item, i) => (
              <View key={i} style={[styles.itemCard, styles.itemCardForbidden]}>
                <Feather name={item.icon} size={20} color={KAYGO_COLORS.danger} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemLabel, { color: KAYGO_COLORS.danger }]}>{item.label}</Text>
                  <Text style={styles.itemDetail}>{item.detail}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {(section === "conditions") && (
          <>
            <View style={[styles.sectionBanner, styles.sectionBannerWarning]}>
              <Feather name="alert-circle" size={18} color={KAYGO_COLORS.warning} />
              <Text style={[styles.sectionBannerText, { color: KAYGO_COLORS.warning }]}>
                Ces objets nécessitent un accord préalable et une déclaration explicite.
              </Text>
            </View>
            {CONDITIONAL.map((item, i) => (
              <View key={i} style={[styles.itemCard, styles.itemCardWarning]}>
                <Feather name="alert-circle" size={20} color={KAYGO_COLORS.warning} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.itemDetail}>{item.detail}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={styles.noteBox}>
          <Feather name="shield" size={16} color={KAYGO_COLORS.accent} />
          <Text style={styles.noteText}>
            KAYGO se conforme à la réglementation aérienne internationale et aux règles d'Air France / Air Caraïbes. En cas de doute, contactez-nous avant d'envoyer.
          </Text>
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
  tabs: { flexDirection: "row", backgroundColor: KAYGO_COLORS.white, borderBottomWidth: 1, borderBottomColor: KAYGO_COLORS.border, paddingHorizontal: 16, gap: 0 },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: KAYGO_COLORS.accent },
  tabText: { fontSize: 13, fontFamily: "Inter_500Medium", color: KAYGO_COLORS.textLight },
  tabTextActive: { color: KAYGO_COLORS.accent, fontFamily: "Inter_700Bold" },
  sectionBanner: { flexDirection: "row", gap: 10, backgroundColor: KAYGO_COLORS.successLight, borderRadius: 12, padding: 14, alignItems: "flex-start" },
  sectionBannerDanger: { backgroundColor: KAYGO_COLORS.dangerLight },
  sectionBannerWarning: { backgroundColor: KAYGO_COLORS.warningLight },
  sectionBannerText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.success, lineHeight: 20 },
  itemCard: { flexDirection: "row", alignItems: "flex-start", gap: 14, backgroundColor: KAYGO_COLORS.white, borderRadius: 12, padding: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  itemCardForbidden: { backgroundColor: "#FFF5F5", borderLeftWidth: 3, borderLeftColor: KAYGO_COLORS.danger },
  itemCardWarning: { backgroundColor: "#FFFBEB", borderLeftWidth: 3, borderLeftColor: KAYGO_COLORS.warning },
  itemLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: KAYGO_COLORS.textDark },
  itemDetail: { fontSize: 12, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textLight, marginTop: 2 },
  noteBox: { flexDirection: "row", gap: 10, backgroundColor: KAYGO_COLORS.accentLight, borderRadius: 12, padding: 14, alignItems: "flex-start" },
  noteText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textMid, lineHeight: 19 },
});
