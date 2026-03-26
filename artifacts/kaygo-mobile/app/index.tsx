import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { useKaygo } from "@/context/KaygoContext";
import { KAYGO_COLORS } from "@/constants/colors";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useKaygo();

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.7);
  const sloganOpacity = useSharedValue(0);
  const btnOpacity = useSharedValue(0);
  const btnTranslate = useSharedValue(30);

  useEffect(() => {
    if (isLoading) return;
    logoOpacity.value = withTiming(1, { duration: 700 });
    logoScale.value = withSpring(1, { damping: 12 });
    sloganOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    btnOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
    btnTranslate.value = withDelay(800, withSpring(0, { damping: 14 }));

    if (user) {
      setTimeout(() => router.replace("/(tabs)"), 1500);
    }
  }, [isLoading]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const sloganStyle = useAnimatedStyle(() => ({
    opacity: sloganOpacity.value,
  }));

  const btnStyle = useAnimatedStyle(() => ({
    opacity: btnOpacity.value,
    transform: [{ translateY: btnTranslate.value }],
  }));

  if (isLoading) return null;

  return (
    <LinearGradient
      colors={[KAYGO_COLORS.primary, "#0A3A6B", "#0C5173"]}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <StatusBar barStyle="light-content" />

      {/* Background decoration */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <View style={styles.logoIcon}>
          <Feather name="package" size={36} color={KAYGO_COLORS.accent} />
        </View>
        <Text style={styles.logoText}>KAYGO</Text>
      </Animated.View>

      {/* Slogan */}
      <Animated.View style={[styles.sloganContainer, sloganStyle]}>
        <Text style={styles.sloganText}>Le colis qui voyage malin</Text>
        <Text style={styles.descText}>
          France ↔ Martinique via des voyageurs vérifiés
        </Text>
      </Animated.View>

      {/* Buttons */}
      {!user && (
        <Animated.View style={[styles.btnContainer, btnStyle]}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push("/onboarding")}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Commencer</Text>
            <Feather name="arrow-right" size={18} color={KAYGO_COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push("/auth")}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnText}>J'ai déjà un compte</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Trust badges */}
      <Animated.View style={[styles.badges, sloganStyle]}>
        <View style={styles.badge}>
          <Feather name="shield" size={14} color={KAYGO_COLORS.accent} />
          <Text style={styles.badgeText}>Voyageurs vérifiés</Text>
        </View>
        <View style={styles.badgeDot} />
        <View style={styles.badge}>
          <Feather name="map-pin" size={14} color={KAYGO_COLORS.accent} />
          <Text style={styles.badgeText}>Suivi en temps réel</Text>
        </View>
        <View style={styles.badgeDot} />
        <View style={styles.badge}>
          <Feather name="check-circle" size={14} color={KAYGO_COLORS.accent} />
          <Text style={styles.badgeText}>Remise sécurisée</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  },
  bgCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(0, 196, 204, 0.06)",
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(0, 196, 204, 0.04)",
    bottom: 60,
    left: -60,
  },
  logoContainer: {
    alignItems: "center",
    gap: 12,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "rgba(0, 196, 204, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(0, 196, 204, 0.3)",
  },
  logoText: {
    fontSize: 42,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 6,
  },
  sloganContainer: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 32,
  },
  sloganText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: KAYGO_COLORS.accent,
    letterSpacing: 0.5,
  },
  descText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },
  btnContainer: {
    width: "100%",
    paddingHorizontal: 28,
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: KAYGO_COLORS.accent,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: KAYGO_COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryBtnText: {
    color: KAYGO_COLORS.primary,
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  secondaryBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  secondaryBtnText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  badges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  badgeText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  badgeDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
});
