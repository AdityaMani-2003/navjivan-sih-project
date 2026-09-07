import React, { useEffect, useState } from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';
import { TYPOGRAPHY } from '../../constants/theme';

export interface AnimatedNumberProps {
  value: number;
  duration?: number; // ms
  formatFn?: (val: number) => string;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 800,
  formatFn,
  style,
  testID,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const diff = value - startValue;

    if (diff === 0) return;

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // ease-out cubic interpolation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + diff * easeOut);
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  const formattedText = formatFn ? formatFn(displayValue) : displayValue.toString();

  return (
    <Text style={[styles.text, style]} testID={testID}>
      {formattedText}
    </Text>
  );
};

const styles = {
  text: {
    ...TYPOGRAPHY.display,
  },
};

export default AnimatedNumber;
