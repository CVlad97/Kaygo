import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { KAYGO_COLORS } from "@/constants/colors";
import { useKaygo } from "@/context/KaygoContext";

const CATEGORIES = ["Vêtements", "Documents", "Accessoires", "Objets quotidien", "Électronique légère", "Autre"];

export default function CreateTripScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useKaygo();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    departureCity: "Paris",
    arrivalCity: "Fort-de-France",
    departureDate: "",
    arrivalDate: "",
    flightNumber: "",
    baggageTotalKg: "23",
    baggageUsedKg: "15",
    baggageType: "soute",
    acceptsExtraBaggage: false,
    acceptedCategories: [] as string[],
    minReward: "15",
    notes: "",
  });

  const update = (key: keyof typeof form) => (val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  const toggleCategory = (cat: string) => {
    setForm((f) => ({
      ...f,
      acceptedCategories: f.acceptedCategories.includes(cat)
        ? f.acceptedCategories.filter((c) => c !== cat)
        : [...f.acceptedCategories, cat],
    }));
  };

  const freeKg = Math.max(0, Number(form.baggageTotalKg) - Number(form.baggageUsedKg));

  const handleSubmit = async () => {
    if (!form.departureDate || !form.arrivalDate) {
      Alert.alert("Champs manquants", "Veuillez renseigner les dates de départ et d'arrivée.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://${process.env.EXPO_PUBLIC_DOMAIN}/api/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          travelerId: user?.id ?? 1,
          ...form,
          baggageTotalKg: Number(form.baggageTotalKg),
          baggageUsedKg: Number(form.baggageUsedKg),
          baggageFreeKg: freeKg,
          minReward: Number(form.minReward),
        }),
      });
      if (res.ok) {
        Alert.alert("Trajet publié !", "Votre trajet est en cours de validation. Merci !", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        throw new Error("Failed");
      }
    } catch {
      Alert.alert("Erreur", "Impossible de publier le trajet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={22} color={KAYGO_COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Publier mon trajet</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {/* Route */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trajet</Text>
          <View style={styles.row}>
            <View style={[styles.fieldWrap, { flex: 1 }]}>
              <Text style={styles.label}>Départ</Text>
              <TextInput style={styles.input} value={form.departureCity} onChangeText={update("departureCity")} placeholder="Paris" />
            </View>
            <Feather name="arrow-right" size={20} color={KAYGO_COLORS.accent} style={{ marginTop: 28 }} />
            <View style={[styles.fieldWrap, { flex: 1 }]}>
              <Text style={styles.label}>Arrivée</Text>
              <TextInput style={styles.input} value={form.arrivalCity} onChangeText={update("arrivalCity")} placeholder="Fort-de-France" />
            </View>
          </View>
          <View style={styles.row}>
            <View style={[styles.fieldWrap, { flex: 1 }]}>
              <Text style={styles.label}>Date départ</Text>
              <TextInput style={styles.input} value={form.departureDate} onChangeText={update("departureDate")} placeholder="2026-04-20" />
            </View>
            <View style={[styles.fieldWrap, { flex: 1 }]}>
              <Text style={styles.label}>Date arrivée</Text>
              <TextInput style={styles.input} value={form.arrivalDate} onChangeText={update("arrivalDate")} placeholder="2026-04-21" />
            </View>
          </View>
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>N° de vol</Text>
            <TextInput style={styles.input} value={form.flightNumber} onChangeText={update("flightNumber")} placeholder="AF912 (optionnel)" />
          </View>
        </View>

        {/* Baggage */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Capacité bagage</Text>
          <View style={styles.row}>
            <View style={[styles.fieldWrap, { flex: 1 }]}>
              <Text style={styles.label}>Total autorisé (kg)</Text>
              <TextInput style={styles.input} value={form.baggageTotalKg} onChangeText={update("baggageTotalKg")} keyboardType="numeric" />
            </View>
            <View style={[styles.fieldWrap, { flex: 1 }]}>
              <Text style={styles.label}>Déjà utilisé (kg)</Text>
              <TextInput style={styles.input} value={form.baggageUsedKg} onChangeText={update("baggageUsedKg")} keyboardType="numeric" />
            </View>
          </View>
          <View style={styles.freeCapacity}>
            <Feather name="check-circle" size={16} color={KAYGO_COLORS.success} />
            <Text style={styles.freeCapacityText}>
              <Text style={{ fontFamily: "Inter_700Bold", color: KAYGO_COLORS.success }}>{freeKg} kg</Text> disponibles
            </Text>
          </View>

          {/* Type */}
          <Text style={styles.label}>Type de bagage</Text>
          <View style={styles.row}>
            {["cabine", "soute"].map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.toggleBtn, form.baggageType === t && styles.toggleBtnActive]}
                onPress={() => update("baggageType")(t)}
              >
                <Text style={[styles.toggleBtnText, form.baggageType === t && styles.toggleBtnTextActive]}>
                  {t === "cabine" ? "Cabine" : "Soute"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Accepts extra */}
          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => update("acceptsExtraBaggage")(!form.acceptsExtraBaggage)}
          >
            <View style={[styles.checkbox, form.acceptsExtraBaggage && styles.checkboxActive]}>
              {form.acceptsExtraBaggage && <Feather name="check" size={12} color="#FFF" />}
            </View>
            <Text style={styles.checkLabel}>J'accepte l'ajout de bagage</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Types de colis acceptés</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, form.acceptedCategories.includes(cat) && styles.catChipActive]}
                onPress={() => toggleCategory(cat)}
              >
                <Text style={[styles.catChipText, form.acceptedCategories.includes(cat) && styles.catChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reward */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rémunération</Text>
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Minimum souhaité (€)</Text>
            <TextInput
              style={styles.input}
              value={form.minReward}
              onChangeText={update("minReward")}
              keyboardType="numeric"
              placeholder="15"
            />
          </View>
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Notes (optionnel)</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: "top", paddingTop: 12 }]}
              value={form.notes}
              onChangeText={update("notes")}
              multiline
              placeholder="Informations supplémentaires..."
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Feather name="send" size={18} color={KAYGO_COLORS.white} />
          <Text style={styles.submitBtnText}>{loading ? "Publication..." : "Publier mon trajet"}</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: KAYGO_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: KAYGO_COLORS.border,
  },
  backBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: KAYGO_COLORS.background, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.textDark },
  card: { backgroundColor: KAYGO_COLORS.white, borderRadius: 16, padding: 16, gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.textDark },
  row: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  fieldWrap: { gap: 5 },
  label: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: KAYGO_COLORS.textMid, textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    backgroundColor: KAYGO_COLORS.background,
    borderWidth: 1.5,
    borderColor: KAYGO_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: KAYGO_COLORS.textDark,
  },
  freeCapacity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: KAYGO_COLORS.successLight,
    borderRadius: 10,
    padding: 10,
  },
  freeCapacityText: { fontSize: 13, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textMid },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: KAYGO_COLORS.background,
    borderWidth: 1.5,
    borderColor: KAYGO_COLORS.border,
  },
  toggleBtnActive: { backgroundColor: KAYGO_COLORS.primary, borderColor: KAYGO_COLORS.primary },
  toggleBtnText: { fontSize: 13, fontFamily: "Inter_500Medium", color: KAYGO_COLORS.textMid },
  toggleBtnTextActive: { color: KAYGO_COLORS.white },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: KAYGO_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: { backgroundColor: KAYGO_COLORS.primary, borderColor: KAYGO_COLORS.primary },
  checkLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textMid },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: KAYGO_COLORS.background,
    borderWidth: 1.5,
    borderColor: KAYGO_COLORS.border,
  },
  catChipActive: { backgroundColor: KAYGO_COLORS.accentLight, borderColor: KAYGO_COLORS.accent },
  catChipText: { fontSize: 12, fontFamily: "Inter_500Medium", color: KAYGO_COLORS.textMid },
  catChipTextActive: { color: KAYGO_COLORS.accentDark },
  submitBtn: {
    backgroundColor: KAYGO_COLORS.primary,
    borderRadius: 16,
    paddingVertical: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: KAYGO_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  submitBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
});
