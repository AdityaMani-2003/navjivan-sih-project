import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Show a gradient border (primary gradient by default) */
  gradientBorder?: boolean;
  /** Custom gradient colors for the border */
  borderColors?: readonly [string, string, ...string[]];
  /** Padding inside the card */
  padding?: number;
  /** Border radius override */
  borderRadius?: number;
}

export default function GlassCard({
  children,
  style,
  gradientBorder = false,
  borderColors,
  padding = SPACING.md,
  borderRadius = RADIUS.lg,
}: GlassCardProps) {
  const innerStyle: ViewStyle = {
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius - (gradientBorder ? 1.5 : 0),
    padding,
  };

  if (!gradientBorder) {
    return (
      <View
        style={[
          styles.card,
          { borderRadius },
          SHADOWS.card,
          style,
        ]}
      >
        <View style={innerStyle}>{children}</View>
      </View>
    );
  }

  const colors: readonly [string, string, ...string[]] = borderColors ?? COLORS.gradientPrimary;

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.gradientWrapper,
        { borderRadius },
        SHADOWS.card,
        style,
      ]}
    >
      <View style={innerStyle}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    overflow: 'hidden',
  },
  gradientWrapper: {
    padding: 1.5,
    overflow: 'hidden',
  },
});
