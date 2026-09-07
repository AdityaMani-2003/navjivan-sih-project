import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'danger' | 'success' | 'warning' | 'muted';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  /** Small size (default) or large */
  size?: 'sm' | 'lg';
  /** Optional icon/emoji before text */
  icon?: string;
  style?: ViewStyle;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  primary: {
    bg: COLORS.primaryGlow,
    text: COLORS.primary,
    border: COLORS.primary,
  },
  secondary: {
    bg: COLORS.secondaryGlow,
    text: COLORS.secondary,
    border: COLORS.secondary,
  },
  accent: {
    bg: 'rgba(245, 158, 11, 0.15)',
    text: COLORS.accent,
    border: COLORS.accent,
  },
  danger: {
    bg: 'rgba(239, 68, 68, 0.15)',
    text: COLORS.danger,
    border: COLORS.danger,
  },
  success: {
    bg: 'rgba(34, 197, 94, 0.15)',
    text: COLORS.success,
    border: COLORS.success,
  },
  warning: {
    bg: 'rgba(249, 115, 22, 0.15)',
    text: COLORS.warning,
    border: COLORS.warning,
  },
  muted: {
    bg: COLORS.surfaceElevated,
    text: COLORS.textSecondary,
    border: COLORS.surfaceBorder,
  },
};

export default function Badge({
  text,
  variant = 'primary',
  size = 'sm',
  icon,
  style,
}: BadgeProps) {
  const v = variantStyles[variant];
  const isLarge = size === 'lg';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          paddingVertical: isLarge ? 6 : 3,
          paddingHorizontal: isLarge ? 12 : 8,
        },
        style,
      ]}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text
        style={[
          styles.text,
          { color: v.text, fontSize: isLarge ? 13 : 11 },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 4,
    alignSelf: 'flex-start',
  },
  icon: {
    fontSize: 12,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
