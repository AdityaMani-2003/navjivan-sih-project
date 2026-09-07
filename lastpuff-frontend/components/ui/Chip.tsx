import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  accent?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected,
  onPress,
  icon,
  accent = 'primary',
  style,
  testID,
}) => {
  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore on unsupported platforms
    }
    onPress();
  };

  const isSecondary = accent === 'secondary';
  const activeColor = isSecondary ? COLORS.secondary : COLORS.primary;
  const activeBg = isSecondary ? COLORS.secondaryDim : COLORS.primaryDim;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.chip,
        selected
          ? {
              backgroundColor: activeBg,
              borderColor: activeColor,
            }
          : {
              backgroundColor: COLORS.surface,
              borderColor: COLORS.border,
            },
        pressed && styles.pressed,
        style,
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      testID={testID}
    >
      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text
          style={[
            styles.label,
            {
              color: selected ? activeColor : COLORS.textSecondary,
              fontWeight: selected ? '600' : '400',
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    height: 36,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 6,
  },
  label: {
    ...TYPOGRAPHY.label,
  },
  pressed: {
    opacity: 0.85,
  },
});

export default Chip;
