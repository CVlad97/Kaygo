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
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { KAYGO_COLORS } from "@/constants/colors";
import { useKaygo } from "@/context/KaygoContext";

const DEMO_SHIPMENTS = [
  {
    id: 1,
    title: "Vêtements (2.5 kg)",
    from: "Paris",
    to: "Fort-de-France",
    status: "in_transit",
    statusLabel: "En transit",
    date: "15 Avr 2026",
    traveler: "Marie D.",
    code: "KY-4291",
    timeline: [
      { key: "submitted", label: "Demande créée", done: true },
      { key: "validated", label: "Validée", done: true },
      { key: "assigned", label: "Voyageur assigné", done: true },
      { key: "collected", label: "Colis récupéré", done: true },
      { key: "in_transit", label: "En transit", done: true },
      { key: "arrived", label: "Arrivé en Martinique", done: false },
      { key: "delivering", label: "En livraison", done: false },
      { key: "delivered", label: "Livré", done: false },
    ],
  },
  {
    id: 2,
    title: "Documents (0.3 kg)",
    from: "Lyon",
    to: "Le Lamentin",
    status: "validated",
    statusLabel: "Validé",
    date: "18 Avr 2026",
    traveler: null,
    code: "KY-4312",
    timeline: [
      { key: "submitted", label: "Demande créée", done: true },
      { key: "validated", label: "Validée", done: true },
      { key: "assigned", label: "Voyageur assigné", done: false },
      { key: "collected", label: "Colis récupéré", done: false },
      { key: "in_transit", label: "En transit", done: false },
      { key: "arrived", label: "Arrivé en Martinique", done: false },
      { key: "delivering", label: "En livraison", done: false },
      { key: "delivered", label: "Livré", done: false },
    ],
  },
];

const STATUS_COLORS: Record<string, string> = {
  draft: KAYGO_COLORS.textMuted,
  submitted: KAYGO_COLORS.warning,
  validating: KAYGO_COLORS.warning,
  validated: KAYGO_COLORS.accent,
  accepted: KAYGO_COLORS.accent,
  paid: KAYGO_COLORS.success,
  collecting: KAYGO_COLORS.accent,
  in_transit: "#8B5CF6",
  arrived: KAYGO_COLORS.accent,
  delivering: KAYGO_COLORS.accent,
  delivered: KAYGO_COLORS.success,
  dispute: KAYGO_COLORS.danger,
  match_proposed: KAYGO_COLORS.accent,
};

export default function TrackScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useKaygo();
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const webTop = Platform.OS === "web" ? 67 : 0;

  const selected = DEMO_SHIPMENTS.find((s) => s.id === selectedId);

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Suivi des colis</Text>
        </View>
        <View style={styles.emptyState}>
          <Feather name="package" size={52} color={KAYGO_COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Pas encore connecté</Text>
          <Text style={styles.emptyDesc}>Connectez-vous pour suivre vos colis</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push("/auth")}>
            <Text style={styles.loginBtnText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes colis</Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push("/shipment/create")}
        >
          <Feather name="plus" size={18} color={KAYGO_COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 118 : 100 }}>
        {/* Shipment list */}
        <View style={styles.section}>
          {DEMO_SHIPMENTS.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.shipmentCard, selectedId === s.id && styles.shipmentCardSelected]}
              onPress={() => setSelectedId(s.id === selectedId ? null : s.id)}
              activeOpacity={0.8}
            >
              <View style={styles.shipmentCardTop}>
                <View style={styles.shipmentInfo}>
                  <Text style={styles.shipmentTitle}>{s.title}</Text>
                  <Text style={styles.shipmentRoute}>
                    {s.from} → {s.to}
                  </Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: STATUS_COLORS[s.status] + "20" }]}>
                  <Text style={[styles.statusPillText, { color: STATUS_COLORS[s.status] }]}>
                    {s.statusLabel}
                  </Text>
                </View>
              </View>
              <View style={styles.shipmentMeta}>
                <Text style={styles.metaText}>
                  <Feather name="calendar" size={11} /> {s.date}
                </Text>
                <Text style={styles.metaText}>Réf: {s.code}</Text>
                {s.traveler && (
                  <Text style={styles.metaText}>
                    <Feather name="user" size={11} /> {s.traveler}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Timeline */}
        {selected && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suivi de la mission</Text>
            <View style={styles.timelineCard}>
              {selected.timeline.map((step, i) => {
                const isLast = i === selected.timeline.length - 1;
                const isCurrent =
                  step.done && !selected.timeline[i + 1]?.done;
                return (
                  <View key={step.key} style={styles.timelineRow}>
                    <View style={styles.timelineLeft}>
                      <View
                        style={[
                          styles.timelineDot,
                          step.done && styles.timelineDotDone,
                          isCurrent && styles.timelineDotCurrent,
                        ]}
                      >
                        {step.done && (
                          <Feather
                            name={isCurrent ? "circle" : "check"}
                            size={10}
                            color={KAYGO_COLORS.white}
                          />
                        )}
                      </View>
                      {!isLast && (
                        <View style={[styles.timelineLine, step.done && styles.timelineLineDone]} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.timelineLabel,
                        step.done && styles.timelineLabelDone,
                        isCurrent && styles.timelineLabelCurrent,
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Delivery code */}
            {selected.status === "arrived" && (
              <View style={styles.codeCard}>
                <Feather name="key" size={20} color={KAYGO_COLORS.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.codeLabel}>Code de remise</Text>
                  <Text style={styles.codeValue}>{selected.code}</Text>
                </View>
                <Feather name="copy" size={18} color={KAYGO_COLORS.textLight} />
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: KAYGO_COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: KAYGO_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: KAYGO_COLORS.border,
  },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.textDark },
  newBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: KAYGO_COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  section: { padding: 20, gap: 12 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.textDark },
  shipmentCard: {
    backgroundColor: KAYGO_COLORS.white,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  shipmentCardSelected: { borderColor: KAYGO_COLORS.accent },
  shipmentCardTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  shipmentInfo: { flex: 1, gap: 3 },
  shipmentTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: KAYGO_COLORS.textDark },
  shipmentRoute: { fontSize: 13, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textLight },
  statusPill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusPillText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  shipmentMeta: { flexDirection: "row", gap: 14, flexWrap: "wrap" },
  metaText: { fontSize: 11, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textLight },
  timelineCard: {
    backgroundColor: KAYGO_COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, minHeight: 40 },
  timelineLeft: { alignItems: "center", width: 20 },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: KAYGO_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineDotDone: { backgroundColor: KAYGO_COLORS.success },
  timelineDotCurrent: { backgroundColor: KAYGO_COLORS.accent },
  timelineLine: { width: 2, flex: 1, backgroundColor: KAYGO_COLORS.border, marginTop: 2 },
  timelineLineDone: { backgroundColor: KAYGO_COLORS.success },
  timelineLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: KAYGO_COLORS.textMuted,
    paddingTop: 2,
    flex: 1,
  },
  timelineLabelDone: { color: KAYGO_COLORS.textMid, fontFamily: "Inter_500Medium" },
  timelineLabelCurrent: { color: KAYGO_COLORS.accent, fontFamily: "Inter_600SemiBold" },
  codeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: KAYGO_COLORS.accentLight,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: KAYGO_COLORS.accent + "40",
  },
  codeLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: KAYGO_COLORS.textLight },
  codeValue: { fontSize: 22, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.primary, letterSpacing: 2 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 32 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.textDark },
  emptyDesc: { fontSize: 14, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textLight, textAlign: "center" },
  loginBtn: {
    backgroundColor: KAYGO_COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  loginBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_700Bold" },
});
