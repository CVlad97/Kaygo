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
const SERVICE_LEVELS = [
  { id: "eco", label: "Éco", desc: "Remise simple (ni collecte, ni livraison)", icon: "zap" as const, color: KAYGO_COLORS.success },
  { id: "confort", label: "Confort", desc: "Livraison à domicile en Martinique", icon: "truck" as const, color: KAYGO_COLORS.accent },
  { id: "premium", label: "Premium", desc: "Collecte + livraison à domicile", icon: "star" as const, color: KAYGO_COLORS.primary },
];

export default function CreateShipmentScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useKaygo();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    weightKg: "",
    dimensions: "",
    valueEur: "",
    isFragile: false,
    pickupAddress: "",
    deliveryAddress: "",
    serviceLevel: "eco",
    notes: "",
  });

  const update = (key: keyof typeof form) => (val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  const estimatePrice = () => {
    const w = Number(form.weightKg) || 1;
    const transport = Math.max(8, w * 4);
    const fee = transport * 0.15;
    const pickup = form.serviceLevel === "premium" ? 8.5 : 0;
    const delivery = form.serviceLevel !== "eco" ? 11 : 0;
    return Math.round(transport + fee + pickup + delivery);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.weightKg || !form.category) {
      Alert.alert("Champs manquants", "Titre, poids et catégorie sont requis.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://${process.env.EXPO_PUBLIC_DOMAIN}/api/shipments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: user?.id ?? 1,
          ...form,
          weightKg: Number(form.weightKg),
          valueEur: form.valueEur ? Number(form.valueEur) : null,
        }),
      });
      if (res.ok) {
        Alert.alert("Colis créé !", "Votre demande a été soumise. Nous recherchons un voyageur.", [
          { text: "Suivre", onPress: () => { router.back(); router.push("/(tabs)/track"); } },
          { text: "Fermer", onPress: () => router.back() },
        ]);
      } else throw new Error("Failed");
    } catch {
      Alert.alert("Erreur", "Impossible de créer la demande.");
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
        <Text style={styles.headerTitle}>Envoyer un colis</Text>
        <TouchableOpacity onPress={() => router.push("/shipment/estimate")} style={styles.estimateBtn}>
          <Feather name="hash" size={16} color={KAYGO_COLORS.accent} />
          <Text style={styles.estimateBtnText}>Estimer</Text>
        </TouchableOpacity>
      </View>

      {/* Steps */}
      <View style={styles.stepsBar}>
        {[1, 2, 3].map((s) => (
          <View key={s} style={styles.stepWrap}>
            <View style={[styles.stepDot, step >= s && styles.stepDotActive]}>
              {step > s ? (
                <Feather name="check" size={12} color="#FFF" />
              ) : (
                <Text style={[styles.stepNum, step >= s && styles.stepNumActive]}>{s}</Text>
              )}
            </View>
            <Text style={[styles.stepLabel, step >= s && styles.stepLabelActive]}>
              {s === 1 ? "Colis" : s === 2 ? "Service" : "Adresses"}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {step === 1 && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Décrivez votre colis</Text>
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Nom du colis *</Text>
                <TextInput style={styles.input} value={form.title} onChangeText={update("title")} placeholder="ex: Vêtements pour mamie" />
              </View>
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Description</Text>
                <TextInput style={[styles.input, { height: 70, textAlignVertical: "top", paddingTop: 12 }]} value={form.description} onChangeText={update("description")} multiline placeholder="Décrivez le contenu..." />
              </View>
              <Text style={styles.label}>Catégorie *</Text>
              <View style={styles.catGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity key={cat} style={[styles.catChip, form.category === cat && styles.catChipActive]} onPress={() => update("category")(cat)}>
                    <Text style={[styles.catChipText, form.category === cat && styles.catChipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Poids & dimensions</Text>
              <View style={styles.row}>
                <View style={[styles.fieldWrap, { flex: 1 }]}>
                  <Text style={styles.label}>Poids (kg) *</Text>
                  <TextInput style={styles.input} value={form.weightKg} onChangeText={update("weightKg")} keyboardType="numeric" placeholder="2.5" />
                </View>
                <View style={[styles.fieldWrap, { flex: 1 }]}>
                  <Text style={styles.label}>Dimensions (cm)</Text>
                  <TextInput style={styles.input} value={form.dimensions} onChangeText={update("dimensions")} placeholder="30x20x15" />
                </View>
              </View>
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Valeur estimée (€)</Text>
                <TextInput style={styles.input} value={form.valueEur} onChangeText={update("valueEur")} keyboardType="numeric" placeholder="50" />
              </View>
              <TouchableOpacity style={styles.checkRow} onPress={() => update("isFragile")(!form.isFragile)}>
                <View style={[styles.checkbox, form.isFragile && styles.checkboxActive]}>
                  {form.isFragile && <Feather name="check" size={12} color="#FFF" />}
                </View>
                <Text style={styles.checkLabel}>Colis fragile</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Niveau de service</Text>
            {SERVICE_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[styles.serviceCard, form.serviceLevel === level.id && { borderColor: level.color, backgroundColor: level.color + "08" }]}
                onPress={() => update("serviceLevel")(level.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.serviceIcon, { backgroundColor: level.color + "20" }]}>
                  <Feather name={level.icon} size={20} color={level.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceLabel}>{level.label}</Text>
                  <Text style={styles.serviceDesc}>{level.desc}</Text>
                </View>
                {form.serviceLevel === level.id && (
                  <Feather name="check-circle" size={20} color={level.color} />
                )}
              </TouchableOpacity>
            ))}
            <View style={styles.pricingPreview}>
              <Text style={styles.pricingLabel}>Estimation</Text>
              <Text style={styles.pricingValue}>~{estimatePrice()}€</Text>
              <Text style={styles.pricingNote}>pour {form.weightKg || "1"} kg</Text>
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Adresses</Text>
            {(form.serviceLevel === "premium") && (
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Adresse de collecte (France)</Text>
                <TextInput style={styles.input} value={form.pickupAddress} onChangeText={update("pickupAddress")} placeholder="123 Rue de Paris, 75001 Paris" />
              </View>
            )}
            {(form.serviceLevel === "confort" || form.serviceLevel === "premium") && (
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Adresse de livraison (Martinique)</Text>
                <TextInput style={styles.input} value={form.deliveryAddress} onChangeText={update("deliveryAddress")} placeholder="12 Rue des Flamboyants, 97200 Fort-de-France" />
              </View>
            )}
            {form.serviceLevel === "eco" && (
              <View style={styles.infoBox}>
                <Feather name="info" size={16} color={KAYGO_COLORS.accent} />
                <Text style={styles.infoBoxText}>Mode Éco : vous venez remettre le colis au voyageur et récupérez en Martinique.</Text>
              </View>
            )}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Notes pour le voyageur</Text>
              <TextInput style={[styles.input, { height: 70, textAlignVertical: "top", paddingTop: 12 }]} value={form.notes} onChangeText={update("notes")} multiline placeholder="Instructions particulières..." />
            </View>
          </View>
        )}

        {/* Navigation */}
        <View style={styles.navRow}>
          {step > 1 && (
            <TouchableOpacity style={styles.prevBtn} onPress={() => setStep((s) => s - 1)}>
              <Feather name="arrow-left" size={18} color={KAYGO_COLORS.textMid} />
              <Text style={styles.prevBtnText}>Retour</Text>
            </TouchableOpacity>
          )}
          {step < 3 ? (
            <TouchableOpacity style={styles.nextStepBtn} onPress={() => setStep((s) => s + 1)}>
              <Text style={styles.nextStepBtnText}>Continuer</Text>
              <Feather name="arrow-right" size={18} color="#FFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.nextStepBtn, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading}>
              <Feather name="send" size={18} color="#FFF" />
              <Text style={styles.nextStepBtnText}>{loading ? "Envoi..." : "Envoyer la demande"}</Text>
            </TouchableOpacity>
          )}
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
  estimateBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: KAYGO_COLORS.accentLight },
  estimateBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: KAYGO_COLORS.accent },
  stepsBar: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 0, paddingVertical: 16, backgroundColor: KAYGO_COLORS.white, borderBottomWidth: 1, borderBottomColor: KAYGO_COLORS.border },
  stepWrap: { alignItems: "center", gap: 4, width: 90 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: KAYGO_COLORS.border, alignItems: "center", justifyContent: "center" },
  stepDotActive: { backgroundColor: KAYGO_COLORS.accent },
  stepNum: { fontSize: 12, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.textLight },
  stepNumActive: { color: KAYGO_COLORS.white },
  stepLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textMuted },
  stepLabelActive: { color: KAYGO_COLORS.accent, fontFamily: "Inter_500Medium" },
  card: { backgroundColor: KAYGO_COLORS.white, borderRadius: 16, padding: 16, gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.textDark },
  row: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  fieldWrap: { gap: 5 },
  label: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: KAYGO_COLORS.textMid, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { backgroundColor: KAYGO_COLORS.background, borderWidth: 1.5, borderColor: KAYGO_COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textDark },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: KAYGO_COLORS.background, borderWidth: 1.5, borderColor: KAYGO_COLORS.border },
  catChipActive: { backgroundColor: KAYGO_COLORS.accentLight, borderColor: KAYGO_COLORS.accent },
  catChipText: { fontSize: 12, fontFamily: "Inter_500Medium", color: KAYGO_COLORS.textMid },
  catChipTextActive: { color: KAYGO_COLORS.accentDark },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: KAYGO_COLORS.border, alignItems: "center", justifyContent: "center" },
  checkboxActive: { backgroundColor: KAYGO_COLORS.primary, borderColor: KAYGO_COLORS.primary },
  checkLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textMid },
  serviceCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 14, borderWidth: 2, borderColor: KAYGO_COLORS.border, backgroundColor: KAYGO_COLORS.background },
  serviceIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  serviceLabel: { fontSize: 15, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.textDark },
  serviceDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textLight },
  pricingPreview: { flexDirection: "row", alignItems: "center", backgroundColor: KAYGO_COLORS.background, borderRadius: 12, padding: 14, gap: 10 },
  pricingLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: KAYGO_COLORS.textLight, flex: 1 },
  pricingValue: { fontSize: 22, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.primary },
  pricingNote: { fontSize: 11, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textLight },
  infoBox: { flexDirection: "row", gap: 10, backgroundColor: KAYGO_COLORS.accentLight, borderRadius: 12, padding: 12, alignItems: "flex-start" },
  infoBoxText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textMid, lineHeight: 20 },
  navRow: { flexDirection: "row", gap: 12 },
  prevBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 18, paddingVertical: 15, borderRadius: 14, borderWidth: 1.5, borderColor: KAYGO_COLORS.border },
  prevBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: KAYGO_COLORS.textMid },
  nextStepBtn: { flex: 1, backgroundColor: KAYGO_COLORS.primary, borderRadius: 14, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  nextStepBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_700Bold" },
});
