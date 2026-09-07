import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

interface ConcentricRingsProps {
  size?: number;
  ring1Progress: number; // 0 to 1 (Steps/Active)
  ring2Progress: number; // 0 to 1 (Workout/Cardio)
  ring3Progress: number; // 0 to 1 (Hydration/Mindset)
  ring1Label?: string;
  ring2Label?: string;
  ring3Label?: string;
  scoreText?: string;
  scoreSub?: string;
}

export default function ConcentricRings({
  size = 200,
  ring1Progress = 0.78,
  ring2Progress = 0.54,
  ring3Progress = 0.90,
  ring1Label = '7,800 Steps',
  ring2Label = '35m Active',
  ring3Label = '2.4L Water',
  scoreText = '84',
  scoreSub = 'HEALTH SCORE',
}: ConcentricRingsProps) {
  const strokeWidth = 10;
  const center = size / 2;

  // Radii
  const r1 = center - strokeWidth;
  const r2 = r1 - strokeWidth - 5;
  const r3 = r2 - strokeWidth - 5;

  // Circumferences
  const c1 = 2 * Math.PI * r1;
  const c2 = 2 * Math.PI * r2;
  const c3 = 2 * Math.PI * r3;

  // Clamped strokes
  const p1 = Math.min(1, Math.max(0, ring1Progress));
  const p2 = Math.min(1, Math.max(0, ring2Progress));
  const p3 = Math.min(1, Math.max(0, ring3Progress));

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* Background tracks */}
          <Circle
            cx={center}
            cy={center}
            r={r1}
            stroke="rgba(0, 245, 160, 0.12)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={center}
            cy={center}
            r={r2}
            stroke="rgba(139, 92, 246, 0.12)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={center}
            cy={center}
            r={r3}
            stroke="rgba(245, 158, 11, 0.12)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Active Rings */}
          <Circle
            cx={center}
            cy={center}
            r={r1}
            stroke={COLORS.primary}
            strokeWidth={strokeWidth}
            strokeDasharray={`${c1}`}
            strokeDashoffset={`${c1 * (1 - p1)}`}
            strokeLinecap="round"
            fill="transparent"
            rotation="-90"
            origin={`${center}, ${center}`}
          />
          <Circle
            cx={center}
            cy={center}
            r={r2}
            stroke={COLORS.secondary}
            strokeWidth={strokeWidth}
            strokeDasharray={`${c2}`}
            strokeDashoffset={`${c2 * (1 - p2)}`}
            strokeLinecap="round"
            fill="transparent"
            rotation="-90"
            origin={`${center}, ${center}`}
          />
          <Circle
            cx={center}
            cy={center}
            r={r3}
            stroke={COLORS.accent}
            strokeWidth={strokeWidth}
            strokeDasharray={`${c3}`}
            strokeDashoffset={`${c3 * (1 - p3)}`}
            strokeLinecap="round"
            fill="transparent"
            rotation="-90"
            origin={`${center}, ${center}`}
          />
        </Svg>

        {/* Center Score Label */}
        <View style={styles.centerScore}>
          <Text style={styles.scoreNumber}>{scoreText}</Text>
          <Text style={styles.scoreSubText}>{scoreSub}</Text>
        </View>
      </View>

      {/* Ring Legend Tags */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendText}>{ring1Label}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.secondary }]} />
          <Text style={styles.legendText}>{ring2Label}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.accent }]} />
          <Text style={styles.legendText}>{ring3Label}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  svg: {
    transform: [{ rotate: '0deg' }],
  },
  centerScore: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  scoreSubText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginTop: -2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    marginTop: SPACING.sm + 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});
