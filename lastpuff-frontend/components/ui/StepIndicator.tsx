import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

export interface StepIndicatorProps {
  currentStep: number; // 1-indexed
  totalSteps: number;
  label?: string;
  accent?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  label,
  accent = 'primary',
  style,
  testID,
}) => {
  const activeColor = accent === 'secondary' ? COLORS.secondary : COLORS.primary;

  const dots = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.dotsRow}>
        {dots.map((step) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <View
              key={step}
              style={[
                styles.dot,
                isCompleted && {
                  backgroundColor: activeColor,
                  borderColor: activeColor,
                },
                isCurrent && {
                  backgroundColor: 'transparent',
                  borderColor: '#FFFFFF',
                  borderWidth: 2,
                  transform: [{ scale: 1.25 }],
                },
                !isCompleted &&
                  !isCurrent && {
                    backgroundColor: 'transparent',
                    borderColor: COLORS.borderStrong,
                    borderWidth: 1.5,
                  },
              ]}
            />
          );
        })}
      </View>
      <Text style={styles.label}>
        {label || `Step ${currentStep} of ${totalSteps}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
});

export default StepIndicator;
