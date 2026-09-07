import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { COLORS } from '../../constants/theme';

interface ProgressRingProps {
  /** Progress from 0 to 1 */
  progress: number;
  /** Ring size (width & height) */
  size?: number;
  /** Stroke thickness */
  strokeWidth?: number;
  /** Progress color */
  color?: string;
  /** Track (background) color */
  trackColor?: string;
  /** Content to render inside the ring */
  children?: React.ReactNode;
  style?: ViewStyle;
}

export default function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 6,
  color = COLORS.primary,
  trackColor = COLORS.surfaceBorder,
  children,
  style,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const strokeDashoffset = circumference * (1 - clampedProgress);

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {children && (
        <View style={styles.childrenContainer}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  childrenContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
