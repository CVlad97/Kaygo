import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { KAYGO_COLORS } from "@/constants/colors";
import { useKaygo } from "@/context/KaygoContext";

const MENU_ITEMS = [
  { icon: "package" as const, label: "Mes expéditions", action: "track" },
  { icon: "navigation" as const, label: "Mes trajets", action: "history" },
  { icon: "trending-up" as const, label: "Mes gains", action: "history" },
  { icon: "bell" as const, label: "Notifications", action: null },
  { icon: "help-circle" as const, label: "FAQ & Aide", action: "faq" },
  { icon: "alert-triangle" as const, label: "Objets autorisés/interdits", action: "allowed-items" },
  { icon: "shield" as const, label: "Politique de confidentialité", action: null },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useKaygo();
  const webTop = Platform.OS === "web" ? 67 : 0;

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Se déconnecter", style: "destructive", onPress: async () => { await logout(); router.replace("/"); } },
    ]);
  };

  const handleAction = (action: string | null) => {
    if (!action) return;
    if (action === "faq") router.push("/faq");
    else if (action === "allowed-items") router.push("/allowed-items");
    else if (action === "track") router.push("/(tabs)/track");
    else if (action === "history") router.push("/(tabs)/history");
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon profil</Text>
        </View>
        <View style={styles.loginPrompt}>
          <View style={styles.avatarLarge}>
            <Feather name="user" size={36} color={KAYGO_COLORS.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Pas encore connecté</Text>
          <Text style={styles.emptyDesc}>Connectez-vous pour accéder à votre profil</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push("/auth")}>
            <Text style={styles.loginBtnText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  const roleLabel = user.role === "traveler" ? "Voyageur" : user.role === "sender" ? "Expéditeur" : user.role === "admin" ? "Admin" : "Utilisateur";
  const verifiedColor = user.verificationStatus === "verified" ? KAYGO_COLORS.success : user.verificationStatus === "rejected" ? KAYGO_COLORS.danger : KAYGO_COLORS.warning;
  const verifiedLabel = user.verificationStatus === "verified" ? "Vérifié" : user.verificationStatus === "rejected" ? "Refusé" : "En attente";

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon profil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 118 : 100 }}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.firstName} {user.lastName}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{roleLabel}</Text>
            </View>
            <View style={[styles.verifiedBadge, { backgroundColor: verifiedColor + "20" }]}>
              <Feather
                name={user.verificationStatus === "verified" ? "check-circle" : "clock"}
                size={12}
                color={verifiedColor}
              />
              <Text style={[styles.verifiedText, { color: verifiedColor }]}>{verifiedLabel}</Text>
            </View>
          </View>
        </View>

        {/* Contact info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Feather name="mail" size={16} color={KAYGO_COLORS.textLight} />
              <Text style={styles.infoText}>{user.email}</Text>
            </View>
            {user.phone && (
              <View style={styles.infoRow}>
                <Feather name="phone" size={16} color={KAYGO_COLORS.textLight} />
                <Text style={styles.infoText}>{user.phone}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Identity verification prompt */}
        {user.verificationStatus === "pending" && (
          <View style={styles.section}>
            <View style={styles.verifyBanner}>
              <Feather name="alert-circle" size={20} color={KAYGO_COLORS.warning} />
              <View style={{ flex: 1 }}>
                <Text style={styles.verifyBannerTitle}>Vérifiez votre identité</Text>
                <Text style={styles.verifyBannerDesc}>
                  Soumettez une pièce d'identité pour être validé par notre équipe
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={KAYGO_COLORS.textLight} />
            </View>
          </View>
        )}

        {/* Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Menu</Text>
          <View style={styles.menuCard}>
            {MENU_ITEMS.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, i < MENU_ITEMS.length - 1 && styles.menuItemBorder]}
                onPress={() => handleAction(item.action)}
                activeOpacity={0.7}
              >
                <View style={styles.menuIcon}>
                  <Feather name={item.icon} size={17} color={KAYGO_COLORS.accent} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Feather name="chevron-right" size={15} color={KAYGO_COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <View style={[styles.section, { paddingTop: 0 }]}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Feather name="log-out" size={17} color={KAYGO_COLORS.danger} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
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
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: KAYGO_COLORS.primary,
    padding: 24,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: KAYGO_COLORS.accent + "30",
    borderWidth: 2,
    borderColor: KAYGO_COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 22, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.white },
  profileInfo: { flex: 1, gap: 6 },
  profileName: { fontSize: 18, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.white },
  roleBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  roleText: { fontSize: 11, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.85)" },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  verifiedText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  section: { padding: 20, gap: 12 },
  sectionTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: KAYGO_COLORS.textLight, textTransform: "uppercase", letterSpacing: 0.5 },
  infoCard: {
    backgroundColor: KAYGO_COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: KAYGO_COLORS.border,
  },
  infoText: { fontSize: 14, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textDark, flex: 1 },
  verifyBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: KAYGO_COLORS.warningLight,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: KAYGO_COLORS.warning + "40",
  },
  verifyBannerTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: KAYGO_COLORS.textDark },
  verifyBannerDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textLight, marginTop: 2 },
  menuCard: {
    backgroundColor: KAYGO_COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: KAYGO_COLORS.border },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: KAYGO_COLORS.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", color: KAYGO_COLORS.textDark },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: KAYGO_COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: KAYGO_COLORS.danger + "30",
  },
  logoutText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: KAYGO_COLORS.danger },
  loginPrompt: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 32 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: KAYGO_COLORS.textDark },
  emptyDesc: { fontSize: 14, fontFamily: "Inter_400Regular", color: KAYGO_COLORS.textLight, textAlign: "center" },
  loginBtn: { backgroundColor: KAYGO_COLORS.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, marginTop: 8 },
  loginBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_700Bold" },
});
