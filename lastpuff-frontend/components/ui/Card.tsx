import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { COLORS, RADIUS, SHADOW } from '../../constants/theme';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accent?: 'primary' | 'secondary' | 'danger';
  elevation?: 'low' | 'medium' | 'high';
  /**
   * Legacy prop — gradient borders are BANNED per design system.
   * Accepted here only for backward type compatibility and ignored.
   */
  gradientBorder?: boolean;
  borderColors?: readonly [string, string, ...string[]] | string[];
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  accent,
  testID,
}) => {
  const animatedOpacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(animatedOpacity, {
      toValue: 0.85,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(animatedOpacity, {
      toValue: 1,
      duration: 160,
      useNativeDriver: true,
    }).start();
  };

  const accentColor =
    accent === 'primary'
      ? COLORS.primary
      : accent === 'secondary'
      ? COLORS.secondary
      : accent === 'danger'
      ? COLORS.danger
      : undefined;

  const cardContent = (
    <View
      style={[
        styles.card,
        accentColor ? { borderLeftColor: accentColor, borderLeftWidth: 3 } : null,
        style,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
      >
        <Animated.View style={{ opacity: animatedOpacity }}>
          {cardContent}
        </Animated.View>
      </Pressable>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.md,
  },
});

export default Card;
