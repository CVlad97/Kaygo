import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { KAYGO_COLORS } from "@/constants/colors";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    icon: "package" as const,
    title: "Envoyez rapidement",
    subtitle: "Entre France et Martinique",
    desc: "Vos colis arrivent en quelques jours grâce à des voyageurs disposant d'espace bagage réel.",
    color: KAYGO_COLORS.accent,
  },
  {
    id: "2",
    icon: "shield" as const,
    title: "Voyageurs vérifiés",
    subtitle: "Identité et trajet confirmés",
    desc: "Chaque voyageur est validé par notre équipe. Votre colis voyage en toute confiance.",
    color: "#22C55E",
  },
  {
    id: "3",
    icon: "truck" as const,
    title: "Collecte & livraison",
    subtitle: "Options disponibles en Martinique",
    desc: "Choisissez la collecte chez vous en France et/ou la livraison à domicile en Martinique.",
    color: "#F59E0B",
  },
];

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const goNext = () => {
    if (currentIndex < slides.length - 1) {
      listRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push("/auth");
    }
  };

  return (
    <LinearGradient
      colors={[KAYGO_COLORS.primary, "#0A3A6B"]}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}
    >
      <StatusBar barStyle="light-content" />

      {/* Skip */}
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={() => router.push("/auth")}
      >
        <Text style={styles.skipText}>Passer</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconWrap, { borderColor: item.color + "40", backgroundColor: item.color + "20" }]}>
              <Feather name={item.icon} size={48} color={item.color} />
            </View>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={[styles.slideSubtitle, { color: item.color }]}>{item.subtitle}</Text>
            <Text style={styles.slideDesc}>{item.desc}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.dotActive]}
          />
        ))}
      </View>

      {/* CTA */}
      <View style={styles.bottom}>
        <TouchableOpacity style={styles.nextBtn} onPress={goNext} activeOpacity={0.85}>
          <Text style={styles.nextBtnText}>
            {currentIndex === slides.length - 1 ? "Commencer" : "Suivant"}
          </Text>
          <Feather name="arrow-right" size={18} color={KAYGO_COLORS.primary} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  skipText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    gap: 16,
    flex: 1,
  },
  iconWrap: {
    width: 110,
    height: 110,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    marginBottom: 8,
  },
  slideTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  slideSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  slideDesc: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 23,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  dotActive: {
    width: 22,
    backgroundColor: KAYGO_COLORS.accent,
  },
  bottom: {
    paddingHorizontal: 28,
    paddingBottom: 8,
  },
  nextBtn: {
    backgroundColor: KAYGO_COLORS.accent,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  nextBtnText: {
    color: KAYGO_COLORS.primary,
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
});
