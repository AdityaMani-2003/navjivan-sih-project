import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, RADIUS, SHADOW, TYPOGRAPHY } from '../../constants/theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  testID,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics unavailable on web/unsupported device
    }
    onPress();
  };

  const getVariantStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          button: {
            backgroundColor: COLORS.secondary,
            ...SHADOW.secondaryGlow,
          },
          text: { color: '#FFFFFF' },
        };
      case 'ghost':
        return {
          button: {
            backgroundColor: 'transparent',
          },
          text: { color: COLORS.textSecondary },
        };
      case 'danger':
        return {
          button: {
            backgroundColor: COLORS.danger,
          },
          text: { color: '#FFFFFF' },
        };
      case 'outline':
        return {
          button: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: COLORS.borderStrong,
          },
          text: { color: COLORS.textPrimary },
        };
      case 'primary':
      default:
        return {
          button: {
            backgroundColor: COLORS.primary,
            ...SHADOW.primaryGlow,
          },
          text: { color: COLORS.textInverse },
        };
    }
  };

  const getSizeStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          button: {
            minHeight: 36,
            paddingHorizontal: 14,
            paddingVertical: 6,
          },
          text: {
            fontSize: 13,
            lineHeight: 18,
          },
        };
      case 'lg':
        return {
          button: {
            minHeight: 56,
            paddingHorizontal: 24,
            paddingVertical: 14,
          },
          text: {
            fontSize: 16,
            lineHeight: 22,
          },
        };
      case 'md':
      default:
        return {
          button: {
            minHeight: 48,
            paddingHorizontal: 20,
            paddingVertical: 12,
          },
          text: {
            fontSize: 15,
            lineHeight: 20,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const indicatorColor =
    variant === 'primary' ? COLORS.textInverse : '#FFFFFF';

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.baseButton,
        variantStyles.button,
        sizeStyles.button,
        fullWidth && { width: '100%' },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator size="small" color={indicatorColor} />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text
            style={[
              styles.baseText,
              variantStyles.text,
              sizeStyles.text,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  baseText: {
    ...TYPOGRAPHY.button,
    textAlign: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.45,
  },
});

export default Button;
