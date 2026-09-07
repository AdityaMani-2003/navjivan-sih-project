import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import {
  useUser,
  FitnessGoal,
  FitnessLevel,
} from '../../context/UserContext';
import { updateProfile } from '../../services/api';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';

const FITNESS_GOALS: { id: FitnessGoal; title: string; desc: string; icon: string }[] = [
  {
    id: 'general_wellness',
    title: 'Daily Vitality & Padyatra',
    desc: 'Indian heritage virtual walks, daily steps, and healthy habits.',
    icon: 'walk',
  },
  {
    id: 'weight_loss',
    title: 'Fat Loss & Cardio',
    desc: 'Burn calories, boost stamina, and track nutritional deficits.',
    icon: 'flame',
  },
  {
    id: 'build_strength',
    title: 'Strength & Hypertrophy',
    desc: 'Build functional muscle with progressive overload routines.',
    icon: 'barbell',
  },
  {
    id: 'athlete',
    title: 'Sports Performance',
    desc: 'Cricket, agility, running, and sport-specific conditioning.',
    icon: 'trophy',
  },
];

const SPORTS_OPTIONS = [
  'Cricket 🏏',
  'Running 🏃',
  'Yoga & Pranayama 🧘',
  'Gym & Weights 🏋️',
  'Badminton 🏸',
  'Football ⚽',
  'Cycling 🚴',
  'Swimming 🏊',
];

const DIET_PREFERENCES = [
  'Vegetarian 🥬',
  'Eggetarian 🥚',
  'Non-Vegetarian 🍗',
  'Vegan 🌱',
  'Jain Vegetarian 🌾',
];

export default function FitnessSetupScreen() {
  const router = useRouter();
  const { updateUser } = useAuth();
  const { setProfile } = useUser();

  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedGoal, setSelectedGoal] = useState<FitnessGoal>('general_wellness');
  const [level, setLevel] = useState<FitnessLevel>('beginner');
  const [selectedSports, setSelectedSports] = useState<string[]>(['Cricket 🏏', 'Running 🏃']);
  const [workoutDaysCount, setWorkoutDaysCount] = useState(4);
  const [dietaryPref, setDietaryPref] = useState('Vegetarian 🥬');
  const [dailyStepGoal, setDailyStepGoal] = useState(8000);

  const toggleSport = (sport: string) => {
    try {
      Haptics.selectionAsync();
    } catch (_e) {}
    if (selectedSports.includes(sport)) {
      setSelectedSports(selectedSports.filter((s) => s !== sport));
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };

  const handleFinish = async () => {
    try {
      setSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const daysArray = ['Mon', 'Wed', 'Fri', 'Sat'].slice(0, workoutDaysCount);

      const fitnessProfileData = {
        goal: selectedGoal,
        level,
        sport: selectedSports[0] || 'General Fitness',
        workoutDays: daysArray,
        dietaryPref,
      };

      const profilePayload = {
        userType: 'non-smoker' as const,
        plan: 'fitness',
        fitnessProfile: fitnessProfileData,
      };

      // 1. Sync backend
      const res = await updateProfile(profilePayload);
      if (res?.data?.user) {
        await updateUser(res.data.user);
      }

      // 2. Sync local user context
      await setProfile({
        userType: 'non-smoker',
        fitnessProfile: fitnessProfileData,
        healthScore: 80,
        xp: 100, // Welcome XP
      });

      // 3. Mark complete
      await AsyncStorage.setItem('onboarding_complete', 'true');

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_e) {}

      Toast.show({
        type: 'success',
        text1: 'Wellness Profile Activated! ⚡',
        text2: 'Welcome +100 XP unlocked. Let’s start your training.',
      });

      router.replace('/(tabs)');
    } catch (err) {
      console.error('Fitness onboarding error:', err);
      await AsyncStorage.setItem('onboarding_complete', 'true');
      router.replace('/(tabs)');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fitness & Wellness Setup</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Primary Goal */}
        <Text style={styles.sectionTitle}>1. Primary Health Goal</Text>
        <View style={styles.goalsGrid}>
          {FITNESS_GOALS.map((goal) => {
            const isSelected = selectedGoal === goal.id;
            return (
              <TouchableOpacity
                key={goal.id}
                activeOpacity={0.85}
                style={[
                  styles.goalCard,
                  isSelected && styles.goalCardActive,
                ]}
                onPress={() => {
                  setSelectedGoal(goal.id);
                  Haptics.selectionAsync();
                }}
              >
                <View style={styles.goalHeader}>
                  <View
                    style={[
                      styles.goalIconBox,
                      {
                        backgroundColor: isSelected
                          ? COLORS.secondaryGlow
                          : COLORS.surfaceElevated,
                      },
                    ]}
                  >
                    <Ionicons
                      name={goal.icon as any}
                      size={24}
                      color={isSelected ? COLORS.secondary : COLORS.textSecondary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={styles.goalDesc}>{goal.desc}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={COLORS.secondary}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2. Fitness Experience Level */}
        <Text style={styles.sectionTitle}>2. Experience Level</Text>
        <View style={styles.levelRow}>
          {(['beginner', 'intermediate', 'advanced'] as FitnessLevel[]).map((lvl) => {
            const isSelected = level === lvl;
            return (
              <TouchableOpacity
                key={lvl}
                style={[
                  styles.levelChip,
                  isSelected && styles.levelChipActive,
                ]}
                onPress={() => {
                  setLevel(lvl);
                  Haptics.selectionAsync();
                }}
              >
                <Text
                  style={[
                    styles.levelText,
                    isSelected && styles.levelTextActive,
                  ]}
                >
                  {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 3. Favorite Sports & Activities */}
        <Text style={styles.sectionTitle}>3. Sports & Interests</Text>
        <View style={styles.sportsGrid}>
          {SPORTS_OPTIONS.map((sport) => {
            const isSelected = selectedSports.includes(sport);
            return (
              <TouchableOpacity
                key={sport}
                style={[
                  styles.sportChip,
                  isSelected && styles.sportChipActive,
                ]}
                onPress={() => toggleSport(sport)}
              >
                <Text
                  style={[
                    styles.sportText,
                    isSelected && styles.sportTextActive,
                  ]}
                >
                  {sport}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4. Workout Frequency & Step Target */}
        <Text style={styles.sectionTitle}>4. Weekly Training & Steps</Text>
        <GlassCard style={styles.card}>
          <Text style={styles.label}>Workout Days / Week: {workoutDaysCount} Days</Text>
          <View style={styles.daysRow}>
            {[3, 4, 5, 6].map((days) => (
              <TouchableOpacity
                key={days}
                style={[
                  styles.dayBtn,
                  workoutDaysCount === days && styles.dayBtnActive,
                ]}
                onPress={() => {
                  setWorkoutDaysCount(days);
                  Haptics.selectionAsync();
                }}
              >
                <Text
                  style={[
                    styles.dayBtnText,
                    workoutDaysCount === days && styles.dayBtnTextActive,
                  ]}
                >
                  {days}d
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.label}>Daily Step Goal</Text>
          <View style={styles.daysRow}>
            {[5000, 8000, 10000, 15000].map((steps) => (
              <TouchableOpacity
                key={steps}
                style={[
                  styles.dayBtn,
                  dailyStepGoal === steps && styles.dayBtnActive,
                ]}
                onPress={() => {
                  setDailyStepGoal(steps);
                  Haptics.selectionAsync();
                }}
              >
                <Text
                  style={[
                    styles.dayBtnText,
                    dailyStepGoal === steps && styles.dayBtnTextActive,
                  ]}
                >
                  {steps >= 1000 ? `${steps / 1000}k` : steps}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        {/* 5. Dietary Preference */}
        <Text style={styles.sectionTitle}>5. Dietary Lifestyle</Text>
        <View style={styles.sportsGrid}>
          {DIET_PREFERENCES.map((diet) => {
            const isSelected = dietaryPref === diet;
            return (
              <TouchableOpacity
                key={diet}
                style={[
                  styles.sportChip,
                  isSelected && styles.sportChipActive,
                ]}
                onPress={() => {
                  setDietaryPref(diet);
                  Haptics.selectionAsync();
                }}
              >
                <Text
                  style={[
                    styles.sportText,
                    isSelected && styles.sportTextActive,
                  ]}
                >
                  {diet}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <GradientButton
          title={submitting ? 'Calibrating AI Coach...' : 'Activate Navjivan Fitness Plan ⚡'}
          loading={submitting}
          colors={COLORS.gradientSecondary}
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
    fontSize: 17,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  goalsGrid: {
    gap: SPACING.xs + 4,
    marginBottom: SPACING.sm,
  },
  goalCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  goalCardActive: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  goalIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  goalDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  levelRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  levelChip: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  levelChipActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondaryGlow,
  },
  levelText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  levelTextActive: {
    color: COLORS.secondary,
    fontWeight: '700',
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs + 2,
    marginBottom: SPACING.sm,
  },
  sportChip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 4,
  },
  sportChipActive: {
    backgroundColor: COLORS.secondaryGlow,
    borderColor: COLORS.secondary,
  },
  sportText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  sportTextActive: {
    color: COLORS.secondary,
    fontWeight: '700',
  },
  card: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.xs + 2,
  },
  daysRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  dayBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  dayBtnActive: {
    backgroundColor: COLORS.secondaryGlow,
    borderColor: COLORS.secondary,
  },
  dayBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  dayBtnTextActive: {
    color: COLORS.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceBorder,
    marginVertical: SPACING.md,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
    backgroundColor: COLORS.surface,
  },
});
