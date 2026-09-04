/**
 * Global Theme System (Light + Dark)
 * + LastPuff Custom Theme Colors
 */

import { Platform, Appearance } from "react-native";

const tintColorLight = "#39FF14";
const tintColorDark = "#39FF14";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#ffffff",
    tint: tintColorLight,
    icon: "#687076",
    card: "#f4f4f4",
  },
  dark: {
    text: "#ECEDEE",
    background: "#000000",
    tint: tintColorDark,
    icon: "#9BA1A6",
    card: "#111111",
  },
};

/**
 * LASTPUFF GLOBAL COLOR PALETTE
 * Always available — ignores system theme.
 */
export const LPColors = {
  bg: "#000000",
  card: "#111111",
  neon: "#39FF14",
  text: "#FFFFFF",
  gray: "#8B8B8B",
  border: "#1A1A1A",
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono:
      "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
