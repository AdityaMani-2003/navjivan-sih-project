import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { COLORS, RADIUS } from '../../constants/theme';

interface SkeletonLoaderProps {
  /** Width — number or string like '100%' */
  width?: number | string;
  /** Height in pixels */
  height?: number;
  /** Border radius */
  borderRadius?: number;
  /** Container style override */
  style?: ViewStyle;
}

export default function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = RADIUS.sm,
  style,
}: SkeletonLoaderProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.7]),
  }));

  return (
    <View
      style={[
        styles.container,
        {
          width: width as number,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          { borderRadius },
          animatedStyle,
        ]}
      />
    </View>
  );
}

/** Render multiple skeleton lines mimicking a text block */
export function SkeletonBlock({
  lines = 3,
  gap = 8,
  style,
}: {
  lines?: number;
  gap?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[{ gap }, style]}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLoader
          key={i}
          height={14}
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceElevated,
    overflow: 'hidden',
  },
  shimmer: {
    flex: 1,
    backgroundColor: COLORS.surfaceBorder,
  },
});
