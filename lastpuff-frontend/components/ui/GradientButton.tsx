import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING, SHADOWS } from '../../constants/theme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  /** Gradient colors (defaults to primary gradient) */
  colors?: readonly [string, string, ...string[]];
  /** Show loading spinner */
  loading?: boolean;
  disabled?: boolean;
  /** Icon element to show before title */
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  /** Full width (default true) */
  fullWidth?: boolean;
}

export default function GradientButton({
  title,
  onPress,
  colors,
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = true,
}: GradientButtonProps) {
  const gradientColors: readonly [string, string, ...string[]] = colors ?? COLORS.gradientPrimary;

  const handlePress = () => {
    if (disabled || loading) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_e) {
      // Haptics not available (web/simulator)
    }
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      disabled={disabled || loading}
      style={[fullWidth && styles.fullWidth, style]}
    >
      <LinearGradient
        colors={
          disabled
            ? [COLORS.surfaceElevated, COLORS.surfaceBorder]
            : gradientColors
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, disabled && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.bg} size="small" />
        ) : (
          <>
            {icon}
            <Text
              style={[
                styles.text,
                disabled && styles.disabledText,
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    ...SHADOWS.primary,
  },
  text: {
    color: COLORS.bg,
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    color: COLORS.textMuted,
  },
});
