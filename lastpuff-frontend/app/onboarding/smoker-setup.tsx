import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { useUser, QuitStrategy } from '../../context/UserContext';
import { updateProfile } from '../../services/api';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';

const COMMON_TRIGGERS = [
  'Morning Chai ☕',
  'Work Stress 💻',
  'After Meals 🍽️',
  'Social Outings 🍻',
  'Boredom / Waiting ⏳',
  'Late Night 🌙',
  'Traffic / Driving 🚗',
  'Post-Workout 🏃',
];

export default function SmokerSetupScreen() {
  const router = useRouter();
  const { updateUser } = useAuth();
  const { setProfile } = useUser();

  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [cigsPerDay, setCigsPerDay] = useState(10);
  const [pricePerPack, setPricePerPack] = useState('200');
  const [yearsSmoking, setYearsSmoking] = useState(4);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([
    'Morning Chai ☕',
    'Work Stress 💻',
    'After Meals 🍽️',
  ]);
  const [strategy, setStrategy] = useState<QuitStrategy>('gradual');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const toggleTrigger = (trigger: string) => {
    try {
      Haptics.selectionAsync();
    } catch (_e) {}
    if (selectedTriggers.includes(trigger)) {
      setSelectedTriggers(selectedTriggers.filter((t) => t !== trigger));
    } else {
      setSelectedTriggers([...selectedTriggers, trigger]);
    }
  };

  const handleFinish = async () => {
    try {
      setSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const packPriceNum = parseInt(pricePerPack, 10) || 200;
      const pricePerCig = Math.round(packPriceNum / 20) || 10;
      const today = new Date().toISOString().split('T')[0];

      const profilePayload = {
        userType: 'smoker' as const,
        cigarettesPerDay: cigsPerDay,
        pricePerPack: packPriceNum,
        pricePerCigarette: pricePerCig,
        smokingYears: yearsSmoking,
        quitDate: today,
        plan: strategy === 'cold_turkey' ? 'aggressive' : 'gradual',
        smokerProfile: {
          cigarettesPerDay: cigsPerDay,
          yearsSmoking,
          triggers: selectedTriggers,
          quitStrategy: strategy,
          costPerPack: packPriceNum,
          quitDate: today,
          previousAttempts: 1,
        },
        emergencyContact: emergencyPhone
          ? {
              name: emergencyName || 'Guardian',
              phone: emergencyPhone,
              relationship: 'Emergency Support',
            }
          : undefined,
      };

      // 1. Sync with backend
      const res = await updateProfile(profilePayload);
      if (res?.data?.user) {
        await updateUser(res.data.user);
      }

      // 2. Sync with local user context
      await setProfile({
        userType: 'smoker',
        smokerProfile: profilePayload.smokerProfile,
        healthScore: 65,
        xp: 100, // Welcome XP
      });

      // 3. Mark complete
      await AsyncStorage.setItem('onboarding_complete', 'true');

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_e) {}

      Toast.show({
        type: 'success',
        text1: 'Detox Profile Configured! 🎉',
        text2: 'Welcome +100 XP unlocked. Let’s beat cravings together.',
      });

      router.replace('/(tabs)');
    } catch (err) {
      console.error('Smoker onboarding error:', err);
      // Fallback: still mark done so user is not blocked
      await AsyncStorage.setItem('onboarding_complete', 'true');
      router.replace('/(tabs)');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smoker Calibration</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Habits & Costs */}
        <Text style={styles.sectionTitle}>1. Smoking Habits & Economics</Text>
        <GlassCard style={styles.card}>
          <Text style={styles.label}>Daily Cigarettes Smoked</Text>
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => {
                setCigsPerDay(Math.max(1, cigsPerDay - 1));
                Haptics.selectionAsync();
              }}
            >
              <Ionicons name="remove" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View style={styles.stepValueBox}>
              <Text style={styles.stepValueText}>{cigsPerDay}</Text>
              <Text style={styles.stepValueSub}>cigs / day</Text>
            </View>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => {
                setCigsPerDay(Math.min(60, cigsPerDay + 1));
                Haptics.selectionAsync();
              }}
            >
              <Ionicons name="add" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Quick presets */}
          <View style={styles.presetRow}>
            {[5, 10, 15, 20, 30].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.presetChip,
                  cigsPerDay === num && styles.presetChipActive,
                ]}
                onPress={() => {
                  setCigsPerDay(num);
                  Haptics.selectionAsync();
                }}
              >
                <Text
                  style={[
                    styles.presetText,
                    cigsPerDay === num && styles.presetTextActive,
                  ]}
                >
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.inputRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Pack Price (₹)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={pricePerPack}
                onChangeText={setPricePerPack}
                placeholder="200"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Smoking Years</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={String(yearsSmoking)}
                onChangeText={(t) => setYearsSmoking(parseInt(t, 10) || 1)}
                placeholder="4"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>
        </GlassCard>

        {/* Section 2: Triggers */}
        <Text style={styles.sectionTitle}>2. Key Cravings Triggers</Text>
        <Text style={styles.sectionSubtitle}>
          Select situations that make you crave a smoke. Our AI will alert you beforehand.
        </Text>
        <View style={styles.triggerGrid}>
          {COMMON_TRIGGERS.map((trigger) => {
            const isSelected = selectedTriggers.includes(trigger);
            return (
              <TouchableOpacity
                key={trigger}
                activeOpacity={0.8}
                style={[
                  styles.triggerChip,
                  isSelected && styles.triggerChipActive,
                ]}
                onPress={() => toggleTrigger(trigger)}
              >
                <Text
                  style={[
                    styles.triggerText,
                    isSelected && styles.triggerTextActive,
                  ]}
                >
                  {trigger}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section 3: Quit Strategy */}
        <Text style={styles.sectionTitle}>3. Preferred Strategy</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.strategyCard,
            strategy === 'gradual' && styles.strategyCardActive,
          ]}
          onPress={() => {
            setStrategy('gradual');
            Haptics.selectionAsync();
          }}
        >
          <View style={styles.strategyHeader}>
            <MaterialCommunityIcons
              name="trending-down"
              size={24}
              color={strategy === 'gradual' ? COLORS.primary : COLORS.textSecondary}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.strategyTitle}>Gradual Reduction (Recommended)</Text>
              <Text style={styles.strategyDesc}>
                Structured 30-day tapering with daily micro-caps and habit substitutes.
              </Text>
            </View>
            {strategy === 'gradual' && (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.strategyCard,
            strategy === 'cold_turkey' && styles.strategyCardActive,
          ]}
          onPress={() => {
            setStrategy('cold_turkey');
            Haptics.selectionAsync();
          }}
        >
          <View style={styles.strategyHeader}>
            <Ionicons
              name="flame"
              size={24}
              color={strategy === 'cold_turkey' ? COLORS.primary : COLORS.textSecondary}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.strategyTitle}>Cold Turkey (Instant Detox)</Text>
              <Text style={styles.strategyDesc}>
                Zero cigarettes from Day 1. Supported with rapid 24/7 SOS distraction tools.
              </Text>
            </View>
            {strategy === 'cold_turkey' && (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            )}
          </View>
        </TouchableOpacity>

        {/* Section 4: Emergency Contact for SOS */}
        <Text style={styles.sectionTitle}>4. Emergency SOS Guardian (Optional)</Text>
        <GlassCard style={styles.card}>
          <Text style={styles.label}>Guardian Name</Text>
          <TextInput
            style={styles.input}
            value={emergencyName}
            onChangeText={setEmergencyName}
            placeholder="e.g. Best Friend, Partner, Sibling"
            placeholderTextColor={COLORS.textMuted}
          />
          <Text style={[styles.label, { marginTop: SPACING.sm }]}>
            Phone Number (for instant SOS SMS)
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            value={emergencyPhone}
            onChangeText={setEmergencyPhone}
            placeholder="+91 98765 43210"
            placeholderTextColor={COLORS.textMuted}
          />
        </GlassCard>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <GradientButton
          title={submitting ? 'Generating Recovery Plan...' : 'Activate Smoker Recovery Plan 🚀'}
          loading={submitting}
          colors={COLORS.gradientPrimary}
          onPress={handleFinish}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 60,
  },
  sectionTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  card: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  stepValueBox: {
    alignItems: 'center',
  },
  stepValueText: {
    ...TYPOGRAPHY.heading1,
    color: COLORS.primary,
    lineHeight: 36,
  },
  stepValueSub: {
    ...TYPOGRAPHY.label,
    color: COLORS.textMuted,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  presetChip: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.xs + 2,
    alignItems: 'center',
  },
  presetChipActive: {
    backgroundColor: COLORS.primaryGlow,
    borderColor: COLORS.primary,
  },
  presetText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  presetTextActive: {
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceBorder,
    marginVertical: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  triggerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs + 2,
    marginBottom: SPACING.md,
  },
  triggerChip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 4,
  },
  triggerChipActive: {
    backgroundColor: COLORS.primaryGlow,
    borderColor: COLORS.primary,
  },
  triggerText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  triggerTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  strategyCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  strategyCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 212, 170, 0.05)',
  },
  strategyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  strategyTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  strategyDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
    backgroundColor: COLORS.surface,
  },
});
