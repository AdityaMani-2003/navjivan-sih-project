import React, { useEffect } from 'react';
import { Text, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface AnimatedCounterProps {
  /** Target value to animate to */
  value: number;
  /** Duration of the count-up animation in ms */
  duration?: number;
  /** Prefix string (e.g. "₹") */
  prefix?: string;
  /** Suffix string (e.g. "%") */
  suffix?: string;
  /** Number of decimal places */
  decimals?: number;
  /** Text style */
  style?: TextStyle;
}

export default function AnimatedCounter({
  value,
  duration = 1200,
  prefix = '',
  suffix = '',
  decimals = 0,
  style,
}: AnimatedCounterProps) {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, duration, animatedValue]);

  const displayText = useDerivedValue(() => {
    const num = animatedValue.value;
    const formatted = decimals > 0 ? num.toFixed(decimals) : Math.round(num).toString();
    return `${prefix}${formatted}${suffix}`;
  });

  // Since we can't directly use useDerivedValue with Text content in all RN versions,
  // use a simpler approach with animated props
  const animatedProps = useAnimatedProps(() => {
    const num = animatedValue.value;
    const formatted =
      decimals > 0 ? num.toFixed(decimals) : Math.round(num).toLocaleString();
    return {
      text: `${prefix}${formatted}${suffix}`,
    } as Record<string, string>;
  });

  // Fallback: use a state-based approach for maximum compatibility
  const [displayValue, setDisplayValue] = React.useState(
    `${prefix}${decimals > 0 ? (0).toFixed(decimals) : '0'}${suffix}`
  );

  useEffect(() => {
    // Simple JS-based counter animation for reliability
    const startTime = Date.now();
    const startVal = 0;
    const endVal = value;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * eased;
      const formatted =
        decimals > 0
          ? current.toFixed(decimals)
          : Math.round(current).toLocaleString();
      setDisplayValue(`${prefix}${formatted}${suffix}`);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, prefix, suffix, decimals]);

  return (
    <Text
      style={[
        {
          color: COLORS.textPrimary,
          fontSize: 32,
          fontWeight: '800',
          fontVariant: ['tabular-nums'],
        },
        style,
      ]}
    >
      {displayValue}
    </Text>
  );
}
