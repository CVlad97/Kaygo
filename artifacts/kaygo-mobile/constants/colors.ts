const primary = "#0F2044"; // Deep navy
const accent = "#00C4CC"; // Turquoise
const accentLight = "#E0F8FA";
const success = "#22C55E";
const warning = "#F59E0B";
const danger = "#EF4444";

export const KAYGO_COLORS = {
  primary,
  primaryLight: "#1A3366",
  accent,
  accentLight,
  accentDark: "#008B93",
  success,
  successLight: "#DCFCE7",
  warning,
  warningLight: "#FEF3C7",
  danger,
  dangerLight: "#FEE2E2",

  // Neutrals
  white: "#FFFFFF",
  background: "#F4F7FB",
  card: "#FFFFFF",
  border: "#E5EAF2",
  borderLight: "#F0F4FA",
  
  // Text
  textDark: "#0F2044",
  textMid: "#3D5180",
  textLight: "#7A8DB5",
  textMuted: "#B0BDD6",
  
  // Tab bar
  tabActive: accent,
  tabInactive: "#7A8DB5",
};

const tintColorLight = accent;

export default {
  light: {
    text: primary,
    background: "#F4F7FB",
    tint: tintColorLight,
    tabIconDefault: "#7A8DB5",
    tabIconSelected: tintColorLight,
  },
};
