import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 1400,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmer.value, [0, 1], [-120, 120]);
    return {
      transform: [{ translateX: `${translateX}%` }],
    };
  });

  return (
    <View
      style={[
        styles.skeletonContainer,
        { width, height, borderRadius },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmerWrapper, animatedStyle]}>
        <LinearGradient
          colors={['#1A1A1A', '#2A2A2A', '#1A1A1A']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    backgroundColor: '#1E1E1E',
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerWrapper: {
    width: '100%',
    height: '100%',
  },
});

export default SkeletonLoader;
