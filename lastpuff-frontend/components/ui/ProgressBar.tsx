import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

export interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  height?: number;
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = COLORS.primary,
  height = 6,
  animated = true,
  style,
  testID,
}) => {
  const clampedProgress = Math.max(0, Math.min(1, progress || 0));
  const animatedWidth = useRef(new Animated.Value(clampedProgress)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: clampedProgress,
        duration: 600,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(clampedProgress);
    }
  }, [clampedProgress, animated, animatedWidth]);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={[styles.track, { height, borderRadius: RADIUS.full }, style]}
      testID={testID}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: color,
            width: widthInterpolation,
            height,
            borderRadius: RADIUS.full,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: COLORS.surfaceHigh,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
});

export default ProgressBar;
