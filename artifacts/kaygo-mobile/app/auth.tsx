import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { KAYGO_COLORS } from "@/constants/colors";
import { useKaygo } from "@/context/KaygoContext";

type Mode = "login" | "register";
type Role = "sender" | "traveler";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useKaygo();
  const [mode, setMode] = useState<Mode>("login");
  const [role, setRole] = useState<Role>("sender");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const update = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { ...form, role };

      const res = await fetch(`https://${process.env.EXPO_PUBLIC_DOMAIN}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Erreur", data.message ?? "Une erreur est survenue.");
        return;
      }
      await login(data.user, data.token);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Erreur", "Impossible de se connecter. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={22} color={KAYGO_COLORS.textDark} />
            </TouchableOpacity>
            <View style={styles.logoMini}>
              <Feather name="package" size={20} color={KAYGO_COLORS.accent} />
              <Text style={styles.logoMiniText}>KAYGO</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {mode === "login" ? "Bienvenue" : "Créer un compte"}
          </Text>
          <Text style={styles.subtitle}>
            {mode === "login"
              ? "Connectez-vous à votre espace KAYGO"
              : "Rejoignez la communauté KAYGO"}
          </Text>

          {/* Mode toggle */}
          <View style={styles.modeToggle}>
            {(["login", "register"] as Mode[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
                onPress={() => setMode(m)}
              >
                <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
                  {m === "login" ? "Connexion" : "Inscription"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Role selector (register only) */}
          {mode === "register" && (
            <View>
              <Text style={styles.label}>Je suis...</Text>
              <View style={styles.roleRow}>
                {(["sender", "traveler"] as Role[]).map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleBtn, role === r && styles.roleBtnActive]}
                    onPress={() => setRole(r)}
                  >
                    <Feather
                      name={r === "sender" ? "package" : "navigation"}
                      size={20}
                      color={role === r ? KAYGO_COLORS.white : KAYGO_COLORS.textMid}
                    />
                    <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>
                      {r === "sender" ? "J'envoie" : "Je voyage"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Form fields */}
          {mode === "register" && (
            <View style={styles.row}>
              <View style={[styles.inputWrap, { flex: 1 }]}>
                <Text style={styles.label}>Prénom</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Jean"
                  value={form.firstName}
                  onChangeText={update("firstName")}
                  autoCapitalize="words"
                />
              </View>
              <View style={[styles.inputWrap, { flex: 1 }]}>
                <Text style={styles.label}>Nom</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Dupont"
                  value={form.lastName}
                  onChangeText={update("lastName")}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="email@exemple.com"
              value={form.email}
              onChangeText={update("email")}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {mode === "register" && (
            <View style={styles.inputWrap}>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                placeholder="+33 6 12 34 56 78"
                value={form.phone}
                onChangeText={update("phone")}
                keyboardType="phone-pad"
              />
            </View>
          )}

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.passWrap}>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0, paddingRight: 0 }]}
                placeholder="••••••••"
                value={form.password}
                onChangeText={update("password")}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Feather name={showPass ? "eye-off" : "eye"} size={18} color={KAYGO_COLORS.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>
              {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
            </Text>
          </TouchableOpacity>

          {/* Demo login shortcut */}
          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() => {
              setForm({ firstName: "Admin", lastName: "KAYGO", email: "admin@kaygo.fr", phone: "", password: "kaygo123" });
              setMode("login");
            }}
          >
            <Text style={styles.demoBtnText}>Connexion démo</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: KAYGO_COLORS.background },
  content: { padding: 24, gap: 16, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  logoMini: { flexDirection: "row", alignItems: "center", gap: 6 },
  logoMiniText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: KAYGO_COLORS.primary,
    letterSpacing: 2,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: KAYGO_COLORS.textDark,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: KAYGO_COLORS.textLight,
    marginTop: -8,
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: KAYGO_COLORS.border,
    borderRadius: 12,
    padding: 3,
  },
  modeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  modeBtnActive: { backgroundColor: KAYGO_COLORS.white },
  modeBtnText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: KAYGO_COLORS.textLight,
  },
  modeBtnTextActive: { color: KAYGO_COLORS.textDark, fontFamily: "Inter_600SemiBold" },
  roleRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  roleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: KAYGO_COLORS.border,
    backgroundColor: KAYGO_COLORS.white,
  },
  roleBtnActive: { backgroundColor: KAYGO_COLORS.primary, borderColor: KAYGO_COLORS.primary },
  roleBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: KAYGO_COLORS.textMid },
  roleBtnTextActive: { color: KAYGO_COLORS.white },
  row: { flexDirection: "row", gap: 12 },
  inputWrap: { gap: 6 },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: KAYGO_COLORS.textMid,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: KAYGO_COLORS.white,
    borderWidth: 1.5,
    borderColor: KAYGO_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: KAYGO_COLORS.textDark,
  },
  passWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: KAYGO_COLORS.white,
    borderWidth: 1.5,
    borderColor: KAYGO_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  eyeBtn: { padding: 8 },
  submitBtn: {
    backgroundColor: KAYGO_COLORS.primary,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
    marginTop: 8,
    shadowColor: KAYGO_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  demoBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  demoBtnText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: KAYGO_COLORS.textMuted,
    textDecorationLine: "underline",
  },
});
