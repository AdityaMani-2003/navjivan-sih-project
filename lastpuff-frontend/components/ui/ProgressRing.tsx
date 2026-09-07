import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { COLORS } from '../../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ProgressRingProps {
  size: number;
  progress: number; // 0 to 1
  color?: string;
  strokeWidth?: number;
  trackColor?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
  testID?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  size,
  progress,
  color = COLORS.primary,
  strokeWidth = 8,
  trackColor,
  backgroundColor,
  children,
  testID,
}) => {
  const resolvedTrackColor = trackColor || backgroundColor || COLORS.surfaceHigh;
  const clampedProgress = Math.max(0, Math.min(1, progress || 0));
  const animatedValue = useRef(new Animated.Value(clampedProgress)).current;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: clampedProgress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [clampedProgress, animatedValue]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]} testID={testID}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background track circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={resolvedTrackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Foreground animated progress circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      </Svg>
      {children && <View style={styles.childContainer}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  childContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProgressRing;
