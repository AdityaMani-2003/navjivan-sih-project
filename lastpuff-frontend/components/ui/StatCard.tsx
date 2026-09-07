import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { COLORS, RADIUS, SHADOW, TYPOGRAPHY } from '../../constants/theme';

export interface StatCardProps {
  value: string | number;
  label?: string;
  title?: string;
  subtitle?: string;
  unit?: string;
  delta?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  trend?: { value: number; isPositive: boolean };
  variant?: string;
  icon?: React.ReactNode;
  color?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  testID?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  title,
  subtitle,
  unit,
  delta,
  deltaType = 'positive',
  trend,
  variant,
  icon,
  color = COLORS.primary,
  style,
  onPress,
  testID,
}) => {
  const displayLabel = label || title || '';
  const displayDelta =
    delta ||
    (trend ? `${trend.isPositive ? '+' : '-'}${trend.value}%` : undefined);
  const resolvedDeltaType =
    trend ? (trend.isPositive ? 'positive' : 'negative') : deltaType;

  const deltaColor =
    resolvedDeltaType === 'positive'
      ? COLORS.success
      : resolvedDeltaType === 'negative'
      ? COLORS.danger
      : COLORS.textSecondary;

  const content = (
    <View style={[styles.card, style]} testID={testID}>
      <View style={styles.topRow}>
        {icon && (
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: `${color}1A` }, // ~10% opacity
            ]}
          >
            {icon}
          </View>
        )}
        {displayDelta && (
          <View
            style={[
              styles.deltaBadge,
              {
                backgroundColor:
                  resolvedDeltaType === 'positive'
                    ? COLORS.successDim
                    : resolvedDeltaType === 'negative'
                    ? COLORS.dangerDim
                    : 'transparent',
              },
            ]}
          >
            <Text style={[styles.deltaText, { color: deltaColor }]}>
              {displayDelta}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.valueRow}>
        <Text style={[styles.valueText, { color }]}>{value}</Text>
        {unit && <Text style={styles.unitText}>{unit}</Text>}
      </View>

      <Text style={styles.labelText} numberOfLines={1}>
        {displayLabel}
      </Text>
      {subtitle && (
        <Text style={[styles.labelText, { fontSize: 11, color: COLORS.textMuted, marginTop: 2 }]} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button">
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 140,
    ...SHADOW.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deltaBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  deltaText: {
    ...TYPOGRAPHY.label,
    fontSize: 11,
    fontWeight: '700',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  valueText: {
    ...TYPOGRAPHY.h1,
    fontWeight: '800',
  },
  unitText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  labelText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});

export default StatCard;
