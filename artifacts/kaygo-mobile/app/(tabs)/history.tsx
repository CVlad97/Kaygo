import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { KAYGO_COLORS } from "@/constants/colors";
import { useKaygo } from "@/context/KaygoContext";
import { router } from "expo-router";

type Tab = "colis" | "trajets" | "gains";

const DEMO_SHIPMENTS = [
  { id: 1, title: "Vêtements (2.5 kg)", route: "Paris → Fort-de-France", date: "12 Mar 2026", amount: 22, status: "Livré" },
  { id: 2, title: "Documents (0.3 kg)", route: "Lyon → Le Lamentin", date: "28 Fév 2026", amount: 14, status: "Livré" },
];

const DEMO_TRIPS = [
  { id: 1, route: "Paris → Fort-de-France", date: "15 Mar 2026", capacity: "8 kg disponibles", earnings: 45, status: "Complété" },
  { id: 2, route: "Fort-de-France → Paris", date: "22 Fév 2026", capacity: "4 kg disponibles", earnings: 28, status: "Complété" },
];

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useKaygo();
  const [activeTab, setActiveTab] = useState<Tab>("colis");
  const webTop = Platform.OS === "web" ? 67 : 0;

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Historique</Text>
        </View>
        <View style={styles.emptyState}>
          <Feather name="clock" size={52} color={KAYGO_COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Connectez-vous</Text>
          <Text style={styles.emptyDesc}>Pour voir votre historique</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push("/auth")}>
            <Text style={styles.loginBtnText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const totalEarnings = DEMO_TRIPS.reduce((s, t) => s + t.earnings, 0);
  const totalSpent = DEMO_SHIPMENTS.reduce((s, sh) => s + sh.amount, 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historique</Text>
      </View>

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: KAYGO_COLORS.primary }]}>
          <Feather name="trending-up" size={18} color={KAYGO_COLORS.accent} />
          <Text style={styles.summaryAmount}>{totalEarnings}€</Text>
          <Text style={styles.summaryLabel}>Gains voyageur</Text>
        </View>
        <View style={styles.summaryCard}>
          <Feather name="package" size={18} color={KAYGO_COLORS.accent} />
          <Text style={[styles.summaryAmount, { color: KAYGO_COLORS.textDark }]}>{totalSpent}€</Text>
          <Text style={[styles.summaryLabel, { color: KAYGO_COLORS.textLight }]}>Dépensé</Text>
        </View>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabRow}>
        {(["colis", "trajets", "gains"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}
            onPress={() => setActiveTab(t)}
          >
            <Text style={[styles.tabBtnText, activeTab === t && styles.tabBtnTextActive]}>
              {t === "colis" ? "Mes colis" : t === "trajets" ? "Mes trajets" : "Mes gains"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: Platform.OS === "web" ? 118 : 100 }}
      >
        {activeTab === "colis" &&
          DEMO_SHIPMENTS.map((s) => (
            <View key={s.id} style={styles.historyCard}>
              <View style={styles.historyCardLeft}>
                <View style={styles.historyIcon}>
                  <Feather name="package" size={18} color={KAYGO_COLORS.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyTitle}>{s.title}</Text>
                  <Text style={styles.historyRoute}>{s.route}</Text>
                  <Text style={styles.historyDate}>{s.date}</Text>
                </View>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyAmount}>-{s.amount}€</Text>
                <View style={[styles.statusPill, { backgroundColor: KAYGO_COLORS.successLight }]}>
                  <Text style={[styles.statusPillText, { color: KAYGO_COLORS.success }]}>{s.status}</Text>
                </View>
              </View>
            </View>
          ))}

        {activeTab === "trajets" &&
          DEMO_TRIPS.map((t) => (
            <View key={t.id} style={styles.historyCard}>
              <View style={styles.historyCardLeft}>
                <View style={[styles.historyIcon, { backgroundColor: KAYGO_COLORS.primaryLight + "20" }]}>
                  <Feather name="navigation" size={18} color={KAYGO_COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyTitle}>{t.route}</Text>
                  <Text style={styles.historyRoute}>{t.capacity}</Text>
                  <Text style={styles.historyDate}>{t.date}</Text>
                </View>
              </View>
              <View style={styles.historyRight}>
                <Text style={[styles.historyAmount, { color: KAYGO_COLORS.success }]}>+{t.earnings}€</Text>
                <View style={[styles.statusPill, { backgroundColor: KAYGO_COLORS.successLight }]}>
                  <Text style={[styles.statusPillText, { color: KAYGO_COLORS.success }]}>{t.status}</Text>
                </View>
              </View>
            </View>
          ))}

        {activeTab === "gains" && (
          <View style={styles.gainsCard}>
            <Text style={styles.sectionTitle}>Bilan voyageur</Text>
            <View style={styles.gainsRow}>
              <View style={styles.gainItem}>
                <Text style={styles.gainValue}>{DEMO_TRIPS.length}</Text>
                <Text style={styles.gainLabel}>Missions réalisées</Text>
              </View>
              <View style={styles.gainItem}>
                <Text style={[styles.gainValue, { color: KAYGO_COLORS.success }]}>{totalEarnings}€</Text>
                <Text style={styles.gainLabel}>Gains validés</Text>
              </View>
              <View style={styles.gainItem}>
                <Text style={[styles.gainValue, { color: KAYGO_COLORS.warning }]}>0€</Text>
                <Text style={styles.gainLabel}>En attente</Text>
              </View>
            </View>
            <View style={styles.divider} />
            {DEMO_TRIPS.map((t) => (
              <View key={t.id} style={styles.gainRow}>
                <View>
                  <Text style={styles.gainRowTitle}>{t.route}</Text>
                  <Text style={styles.gainRowDate}>{t.date}</Text>
                </View>
                <Text style={[styles.gainRowAmount, { color: KAYGO_COLORS.success }]}>+{t.earnings}€</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: KAYGO_COLORS.background },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: KAYGO_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: KAYGO_COLORS.border,
  },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.textDark },
  summaryRow: { flexDirection: "row", gap: 12, padding: 20, paddingBottom: 0 },
  summaryCard: {
    flex: 1,
    backgroundColor: KAYGO_COLORS.white,
    borderRadius: 16,
    padding: 16,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryAmount: { fontSize: 24, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.white },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  tabRow: {
    flexDirection: "row",
    padding: 20,
    paddingBottom: 0,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: KAYGO_COLORS.white,
    borderWidth: 1,
    borderColor: KAYGO_COLORS.border,
  },
  tabBtnActive: { backgroundColor: KAYGO_COLORS.primary, borderColor: KAYGO_COLORS.primary },
  tabBtnText: { fontSize: 11, fontFamily: "Inter_500Medium", color: KAYGO_COLORS.textLight },
  tabBtnTextActive: { color: KAYGO_COLORS.white },
  historyCard: {
    backgroundColor: KAYGO_COLORS.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  historyCardLeft: { flexDirection: "row", alignItems: "flex-start", gap: 12, flex: 1 },
  historyIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: KAYGO_COLORS.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  historyTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: KAYGO_COLORS.textDark },
  historyRoute: { fontSize: 12, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textLight },
  historyDate: { fontSize: 11, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textMuted, marginTop: 2 },
  historyRight: { alignItems: "flex-end", gap: 6 },
  historyAmount: { fontSize: 15, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.danger },
  statusPill: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  statusPillText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  gainsCard: {
    backgroundColor: KAYGO_COLORS.white,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.textDark },
  gainsRow: { flexDirection: "row", justifyContent: "space-around" },
  gainItem: { alignItems: "center", gap: 4 },
  gainValue: { fontSize: 24, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.textDark },
  gainLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textLight, textAlign: "center" },
  divider: { height: 1, backgroundColor: KAYGO_COLORS.border },
  gainRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  gainRowTitle: { fontSize: 13, fontFamily: "Inter_500Medium", color: KAYGO_COLORS.textDark },
  gainRowDate: { fontSize: 11, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textLight },
  gainRowAmount: { fontSize: 15, fontFamily: "Inter_700Bold" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 32 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.textDark },
  emptyDesc: { fontSize: 14, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textLight, textAlign: "center" },
  loginBtn: { backgroundColor: KAYGO_COLORS.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, marginTop: 8 },
  loginBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_700Bold" },
});
