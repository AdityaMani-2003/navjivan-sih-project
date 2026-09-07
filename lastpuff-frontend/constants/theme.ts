import { Platform } from 'react-native';

const BASE_COLORS = {
  // === BACKGROUNDS (layered elevation, NO blur) ===
  bg: '#0D0D14',           // page background — deepest layer
  surface: '#14141F',      // default card background
  surfaceRaised: '#1C1C2A', // slightly elevated card
  surfaceHigh: '#242435',  // highest elevation card / modal
  border: '#2A2A3D',       // subtle border for dividers only
  borderStrong: '#3A3A52', // border that needs to stand out

  // === BRAND COLORS ===
  // Smoker journey — green (life, growth, recovery)
  primary: '#10B981',      // emerald — main smoker accent
  primaryLight: '#34D399',
  primaryDim: 'rgba(16,185,129,0.12)',  // for tinted backgrounds

  // Non-smoker journey — purple (strength, ambition)
  secondary: '#8B5CF6',    // violet — main fitness accent
  secondaryLight: '#A78BFA',
  secondaryDim: 'rgba(139,92,246,0.12)',

  // State colors
  danger: '#EF4444',
  dangerDim: 'rgba(239,68,68,0.12)',
  warning: '#F59E0B',
  warningDim: 'rgba(245,158,11,0.12)',
  success: '#22C55E',
  successDim: 'rgba(34,197,94,0.12)',
  info: '#3B82F6',
  infoDim: 'rgba(59,130,246,0.12)',

  // Gamification
  gold: '#F59E0B',
  silver: '#94A3B8',
  bronze: '#B45309',

  // === TEXT ===
  textPrimary: '#F9FAFB',      // headings, primary content
  textSecondary: '#9CA3AF',    // supporting text, labels
  textMuted: '#4B5563',        // disabled, placeholder
  textInverse: '#0D0D14',      // text on bright backgrounds

  // === TAB BAR ===
  tabBar: '#12121C',
  tabBarBorder: '#1E1E2E',
};

export const COLORS = {
  ...BASE_COLORS,
  borderSubtle: BASE_COLORS.border,
  borderFocused: BASE_COLORS.borderStrong,
  background: BASE_COLORS.bg,
  error: BASE_COLORS.danger,
  surfaceElevated: BASE_COLORS.surfaceRaised,
  surfaceBorder: BASE_COLORS.border,
  surfaceHighlight: 'rgba(255, 255, 255, 0.04)',
  accent: BASE_COLORS.gold,
  accentGlow: BASE_COLORS.warningDim,
  primaryGlow: BASE_COLORS.primaryDim,
  primaryMuted: BASE_COLORS.primaryDim,
  secondaryGlow: BASE_COLORS.secondaryDim,
  secondaryMuted: BASE_COLORS.secondaryDim,
  dangerGlow: BASE_COLORS.dangerDim,
  gradientPrimary: [BASE_COLORS.primary, BASE_COLORS.primaryLight] as readonly [string, string, ...string[]],
  gradientSecondary: [BASE_COLORS.secondary, BASE_COLORS.secondaryLight] as readonly [string, string, ...string[]],
  gradientDanger: [BASE_COLORS.danger, BASE_COLORS.warning] as readonly [string, string, ...string[]],
  gradientGold: [BASE_COLORS.gold, BASE_COLORS.danger] as readonly [string, string, ...string[]],
  gradientDark: [BASE_COLORS.surface, BASE_COLORS.bg] as readonly [string, string, ...string[]],
  gradientCard: [BASE_COLORS.surface, BASE_COLORS.surfaceRaised] as readonly [string, string, ...string[]],
};

export const TYPOGRAPHY = {
  bodyLarge: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    color: '#F9FAFB',
  },
  // Display — hero numbers, major stats
  display: {
    fontSize: 48,
    fontWeight: '800' as const,
    lineHeight: 56,
    letterSpacing: -1,
    color: COLORS.textPrimary,
  },
  // H1 — screen titles
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.5,
    color: COLORS.textPrimary,
  },
  // H2 — section headers
  h2: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 30,
    letterSpacing: -0.3,
    color: COLORS.textPrimary,
  },
  // H3 — card titles
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
    color: COLORS.textPrimary,
  },
  // Body — default readable text
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: COLORS.textPrimary,
  },
  // Body Medium — slightly emphasized body
  bodyMedium: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 24,
    color: COLORS.textPrimary,
  },
  // Caption — labels, timestamps, supporting info
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  // Label — chip text, tab labels, badge text
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.3,
    color: COLORS.textSecondary,
  },
  // Button — CTA text
  button: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20,
    color: COLORS.textPrimary,
  },
  // Backward compatibility keys
  heading1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36, letterSpacing: -0.5, color: COLORS.textPrimary },
  heading2: { fontSize: 22, fontWeight: '600' as const, lineHeight: 30, letterSpacing: -0.3, color: COLORS.textPrimary },
  heading3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26, color: COLORS.textPrimary },
};

// 8pt spacing grid — use ONLY these values for margin/padding
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// Consistent border radius — do NOT create one-off radius values
export const RADIUS = {
  sm: 8,    // chips, tags, small buttons
  md: 12,   // secondary cards, input fields
  lg: 16,   // primary cards
  xl: 20,   // bottom sheets, large cards
  full: 999, // pills, avatars, circular buttons
} as const;

// Card elevation through shadow — NOT blur
export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  // Accent glow — use sparingly on primary CTA only
  primaryGlow: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  secondaryGlow: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

// Backward-compatibility aliases
export const SHADOWS = {
  primary: SHADOW.primaryGlow,
  card: SHADOW.md,
} as const;

export const Colors = {
  light: {
    text: COLORS.textInverse,
    background: '#FFFFFF',
    tint: COLORS.primary,
    icon: COLORS.textSecondary,
    card: '#F4F4F5',
  },
  dark: {
    text: COLORS.textPrimary,
    background: COLORS.bg,
    tint: COLORS.primary,
    icon: COLORS.textSecondary,
    card: COLORS.surface,
  },
};

export const LPColors = {
  bg: COLORS.bg,
  card: COLORS.surface,
  neon: COLORS.primary,
  text: COLORS.textPrimary,
  gray: COLORS.textSecondary,
  border: COLORS.border,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
