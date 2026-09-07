/**
 * LastPuff × Navjivan — Premium Design System
 * Dark-gradient premium feel (Linear.app × health app)
 *
 * Primary: #00D4AA (teal-green — smoker quit journey, main CTAs)
 * Secondary: #7C3AED (violet — non-smoker fitness)
 */

import { Platform, TextStyle } from 'react-native';

// ─── COLOR TOKENS ───────────────────────────────────────────
export const COLORS = {
  // Pure OLED Obsidian Backgrounds
  bg: '#050508',
  surface: '#0E0E17',
  surfaceElevated: '#151522',
  surfaceBorder: 'rgba(255, 255, 255, 0.08)',
  surfaceHighlight: 'rgba(255, 255, 255, 0.04)',

  // Brand Accents
  primary: '#00F5A0',
  primaryDark: '#00BA7A',
  primaryGlow: 'rgba(0, 245, 160, 0.16)',
  primaryMuted: 'rgba(0, 245, 160, 0.08)',

  secondary: '#8B5CF6',
  secondaryDark: '#7C3AED',
  secondaryGlow: 'rgba(139, 92, 246, 0.16)',
  secondaryMuted: 'rgba(139, 92, 246, 0.08)',

  accent: '#F59E0B',
  accentGlow: 'rgba(245, 158, 11, 0.18)',
  
  danger: '#FF385C',
  dangerGlow: 'rgba(255, 56, 92, 0.22)',
  
  warning: '#FB923C',
  success: '#10B981',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  // Gradients (use with LinearGradient)
  gradientPrimary: ['#00F5A0', '#00D2FF'] as readonly [string, string, ...string[]],
  gradientSecondary: ['#8B5CF6', '#EC4899'] as readonly [string, string, ...string[]],
  gradientDanger: ['#FF385C', '#FF7A00'] as readonly [string, string, ...string[]],
  gradientGold: ['#F59E0B', '#FF385C'] as readonly [string, string, ...string[]],
  gradientDark: ['#0E0E17', '#050508'] as readonly [string, string, ...string[]],
  gradientCard: ['#12121E', '#09090F'] as readonly [string, string, ...string[]],
} as const;

// ─── TYPOGRAPHY ─────────────────────────────────────────────
export const TYPOGRAPHY: Record<string, TextStyle> = {
  heading1: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  heading2: { fontSize: 24, fontWeight: '700', letterSpacing: -0.3 },
  heading3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
};

// ─── SPACING ────────────────────────────────────────────────
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ─── BORDER RADII ───────────────────────────────────────────
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ─── SHADOWS ────────────────────────────────────────────────
export const SHADOWS = {
  primary: {
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

// ─── BACKWARD COMPAT (existing screens reference these) ─────
export const Colors = {
  light: {
    text: '#11181C',
    background: '#ffffff',
    tint: COLORS.primary,
    icon: '#687076',
    card: '#f4f4f4',
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
  border: COLORS.surfaceBorder,
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
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
