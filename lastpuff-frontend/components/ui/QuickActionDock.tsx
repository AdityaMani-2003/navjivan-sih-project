import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

interface QuickActionDockProps {
  onAddWater?: () => void;
  onAddSteps?: () => void;
  onResistCraving?: () => void;
  isSmoker?: boolean;
}

export default function QuickActionDock({
  onAddWater,
  onAddSteps,
  onResistCraving,
  isSmoker = true,
}: QuickActionDockProps) {
  const router = useRouter();

  const handleWater = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_e) {}
    if (onAddWater) onAddWater();
    Toast.show({
      type: 'success',
      text1: '+250ml Hydration Logged 💧',
      text2: 'Keep your cells flushed and oxygenated.',
    });
  };

  const handleSteps = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_e) {}
    if (onAddSteps) onAddSteps();
    Toast.show({
      type: 'success',
      text1: '+500 Padyatra Steps 👣',
      text2: 'Progressing towards your next heritage milestone!',
    });
  };

  const handleCraving = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_e) {}
    if (onResistCraving) onResistCraving();
    Toast.show({
      type: 'success',
      text1: 'Craving Conquered! 🛡️',
      text2: '+50 XP awarded to your recovery level.',
    });
  };

  return (
    <View style={styles.dockWrapper}>
      <View style={styles.dockBar}>
        {/* Action 1: Water */}
        <TouchableOpacity style={styles.dockBtn} onPress={handleWater} activeOpacity={0.75}>
          <View style={[styles.dockIconCircle, { backgroundColor: 'rgba(14, 165, 233, 0.18)' }]}>
            <Ionicons name="water" size={18} color="#38BDF8" />
          </View>
          <Text style={styles.dockLabel}>+250ml</Text>
        </TouchableOpacity>

        {/* Action 2: Steps */}
        <TouchableOpacity style={styles.dockBtn} onPress={handleSteps} activeOpacity={0.75}>
          <View style={[styles.dockIconCircle, { backgroundColor: 'rgba(139, 92, 246, 0.18)' }]}>
            <Ionicons name="footsteps" size={18} color={COLORS.secondary} />
          </View>
          <Text style={styles.dockLabel}>+500 Steps</Text>
        </TouchableOpacity>

        {/* Action 3: Craving or Workout */}
        {isSmoker ? (
          <TouchableOpacity style={styles.dockBtn} onPress={handleCraving} activeOpacity={0.75}>
            <View style={[styles.dockIconCircle, { backgroundColor: 'rgba(0, 245, 160, 0.18)' }]}>
              <MaterialCommunityIcons name="shield-check" size={20} color={COLORS.primary} />
            </View>
            <Text style={[styles.dockLabel, { color: COLORS.primary }]}>Resisted ⚡</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.dockBtn}
            onPress={() => router.push('/fitness-plans' as any)}
            activeOpacity={0.75}
          >
            <View style={[styles.dockIconCircle, { backgroundColor: 'rgba(0, 245, 160, 0.18)' }]}>
              <Ionicons name="barbell" size={18} color={COLORS.primary} />
            </View>
            <Text style={[styles.dockLabel, { color: COLORS.primary }]}>Workout</Text>
          </TouchableOpacity>
        )}

        {/* Action 4: AI Copilot */}
        <TouchableOpacity
          style={styles.dockBtn}
          onPress={() => router.push('/chatbot' as any)}
          activeOpacity={0.75}
        >
          <View style={[styles.dockIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.18)' }]}>
            <MaterialCommunityIcons name="robot" size={18} color={COLORS.accent} />
          </View>
          <Text style={styles.dockLabel}>AI Coach</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dockWrapper: {
    marginVertical: SPACING.md,
  },
  dockBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#0E0E17',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  dockBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
  },
  dockIconCircle: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dockLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});
