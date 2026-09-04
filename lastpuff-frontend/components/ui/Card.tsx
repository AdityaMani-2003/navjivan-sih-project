import React from 'react';
import {
  StyleSheet,
  ViewStyle,
  StyleProp,
  Pressable,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glow';
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  onPress,
  interactive = !!onPress,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (interactive) {
      scale.value = withTiming(0.96, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (interactive) {
      scale.value = withTiming(1.0, { duration: 120 });
    }
  };

  const cardStyles = [
    styles.base,
    variant === 'glow' ? styles.glow : styles.default,
    style,
  ];

  if (interactive || onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[cardStyles, animatedStyle]}>
          {children}
        </Animated.View>
      </Pressable>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  default: {
    borderColor: '#222222',
  },
  glow: {
    borderColor: '#39FF14',
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
});

export default Card;
