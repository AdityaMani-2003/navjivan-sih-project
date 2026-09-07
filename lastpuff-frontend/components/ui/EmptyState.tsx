import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';

interface EmptyStateProps {
  /** Ionicons icon name */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Emoji to display instead of icon */
  emoji?: string;
  title: string;
  message: string;
  /** Optional action element (e.g. a button) */
  action?: React.ReactNode;
  style?: ViewStyle;
}

export default function EmptyState({
  icon,
  emoji,
  title,
  message,
  action,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {emoji ? (
        <Text style={styles.emoji}>{emoji}</Text>
      ) : icon ? (
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={36} color={COLORS.primary} />
        </View>
      ) : null}

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  message: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  actionContainer: {
    marginTop: SPACING.lg,
  },
});
