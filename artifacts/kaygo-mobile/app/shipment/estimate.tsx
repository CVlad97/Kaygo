import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { KAYGO_COLORS } from "@/constants/colors";

export default function EstimateScreen() {
  const insets = useSafeAreaInsets();
  const [weight, setWeight] = useState("2");
  const [direction, setDirection] = useState<"fr-mq" | "mq-fr">("fr-mq");

  const pricing = useMemo(() => {
    const w = Math.max(0.1, Number(weight) || 1);
    const transport = Math.max(8, w * 4);
    const fee = transport * 0.15;
    const ecoTotal = Math.round(transport + fee);
    const confortTotal = Math.round(transport + fee + 11);
    const premiumTotal = Math.round(transport + fee + 8.5 + 11);
    return [
      { level: "Éco", desc: "Remise directe", total: ecoTotal, breakdown: [{ label: "Transport", value: Math.round(transport) }, { label: "Frais service (15%)", value: Math.round(fee) }], color: KAYGO_COLORS.success, icon: "zap" as const },
      { level: "Confort", desc: "Livraison à domicile", total: confortTotal, breakdown: [{ label: "Transport", value: Math.round(transport) }, { label: "Frais service (15%)", value: Math.round(fee) }, { label: "Livraison Martinique", value: 11 }], color: KAYGO_COLORS.accent, icon: "truck" as const },
      { level: "Premium", desc: "Collecte + livraison", total: premiumTotal, breakdown: [{ label: "Transport", value: Math.round(transport) }, { label: "Frais service (15%)", value: Math.round(fee) }, { label: "Collecte France", value: 9 }, { label: "Livraison Martinique", value: 11 }], color: KAYGO_COLORS.primary, icon: "star" as const },
    ];
  }, [weight, direction]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={22} color={KAYGO_COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Simulateur de prix</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}>
        {/* Inputs */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Paramètres</Text>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Sens du trajet</Text>
            <View style={styles.row}>
              {([["fr-mq", "France → Martinique"], ["mq-fr", "Martinique → France"]] as const).map(([val, label]) => (
                <TouchableOpacity key={val} style={[styles.dirBtn, direction === val && styles.dirBtnActive]} onPress={() => setDirection(val)}>
                  <Text style={[styles.dirBtnText, direction === val && styles.dirBtnTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Poids estimé (kg)</Text>
            <View style={styles.weightRow}>
              <TouchableOpacity style={styles.weightBtn} onPress={() => setWeight((w) => String(Math.max(0.5, Number(w) - 0.5)))}>
                <Feather name="minus" size={18} color={KAYGO_COLORS.primary} />
              </TouchableOpacity>
              <View style={styles.weightDisplay}>
                <TextInput
                  style={styles.weightInput}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  textAlign="center"
                />
                <Text style={styles.weightUnit}>kg</Text>
              </View>
              <TouchableOpacity style={styles.weightBtn} onPress={() => setWeight((w) => String(Number(w) + 0.5))}>
                <Feather name="plus" size={18} color={KAYGO_COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Price cards */}
        <Text style={styles.sectionTitle}>Comparatif des offres</Text>
        {pricing.map((p) => (
          <View key={p.level} style={[styles.priceCard, { borderLeftColor: p.color }]}>
            <View style={styles.priceCardTop}>
              <View style={[styles.priceIconWrap, { backgroundColor: p.color + "20" }]}>
                <Feather name={p.icon} size={22} color={p.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.priceLevel, { color: p.color }]}>{p.level}</Text>
                <Text style={styles.priceDesc}>{p.desc}</Text>
              </View>
              <Text style={styles.priceTotal}>{p.total}€</Text>
            </View>
            <View style={styles.divider} />
            {p.breakdown.map((b) => (
              <View key={b.label} style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{b.label}</Text>
                <Text style={styles.breakdownValue}>{b.value}€</Text>
              </View>
            ))}
            <TouchableOpacity style={[styles.chooseBtn, { backgroundColor: p.color }]} onPress={() => router.push("/shipment/create")}>
              <Text style={styles.chooseBtnText}>Choisir {p.level}</Text>
              <Feather name="arrow-right" size={16} color={p.color === KAYGO_COLORS.white || p.color === KAYGO_COLORS.success ? KAYGO_COLORS.white : "#FFF"} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Note */}
        <View style={styles.noteBox}>
          <Feather name="info" size={16} color={KAYGO_COLORS.accent} />
          <Text style={styles.noteText}>
            Prix indicatifs. Le tarif final est défini lors du match avec le voyageur. TVA non incluse.
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
  card: { backgroundColor: KAYGO_COLORS.white, borderRadius: 16, padding: 16, gap: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.textDark },
  fieldWrap: { gap: 8 },
  label: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: KAYGO_COLORS.textMid, textTransform: "uppercase", letterSpacing: 0.5 },
  row: { flexDirection: "row", gap: 10 },
  dirBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: KAYGO_COLORS.background, borderWidth: 1.5, borderColor: KAYGO_COLORS.border },
  dirBtnActive: { backgroundColor: KAYGO_COLORS.primary, borderColor: KAYGO_COLORS.primary },
  dirBtnText: { fontSize: 12, fontFamily: "Inter_500Medium", color: KAYGO_COLORS.textMid, textAlign: "center" },
  dirBtnTextActive: { color: KAYGO_COLORS.white },
  weightRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  weightBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: KAYGO_COLORS.accentLight, alignItems: "center", justifyContent: "center" },
  weightDisplay: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: KAYGO_COLORS.background, borderRadius: 12, borderWidth: 1.5, borderColor: KAYGO_COLORS.border, paddingVertical: 10 },
  weightInput: { fontSize: 22, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.primary, minWidth: 60 },
  weightUnit: { fontSize: 14, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textLight },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.textDark },
  priceCard: { backgroundColor: KAYGO_COLORS.white, borderRadius: 16, padding: 16, gap: 10, borderLeftWidth: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  priceCardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  priceIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  priceLevel: { fontSize: 17, fontFamily: "Inter_700Bold" },
  priceDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textLight },
  priceTotal: { fontSize: 24, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.textDark },
  divider: { height: 1, backgroundColor: KAYGO_COLORS.border },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between" },
  breakdownLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textLight },
  breakdownValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: KAYGO_COLORS.textDark },
  chooseBtn: { borderRadius: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 },
  chooseBtnText: { color: "#FFF", fontSize: 14, fontFamily: "Inter_700Bold" },
  noteBox: { flexDirection: "row", gap: 10, backgroundColor: KAYGO_COLORS.accentLight, borderRadius: 12, padding: 14, alignItems: "flex-start" },
  noteText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textMid, lineHeight: 19 },
});
