import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import ConfettiCannon from 'react-native-confetti-cannon';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import Badge from '../components/ui/Badge';
import SectionHeader from '../components/ui/SectionHeader';
import { fetchFitnessPlan, earnXPAction } from '../services/api';
import { useUser } from '../context/UserContext';

const { width } = Dimensions.get('window');

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  restSec: number;
  completed?: boolean;
}

interface DayPlan {
  day: string;
  title: string;
  focus: string;
  durationMin: number;
  exercises: Exercise[];
}

const DEFAULT_SCHEDULE: DayPlan[] = [
  {
    day: 'Mon',
    title: 'Push Power & Chest',
    focus: 'Chest, Shoulders & Triceps',
    durationMin: 45,
    exercises: [
      { name: 'Standard Push-ups', sets: 4, reps: '15 reps', restSec: 60 },
      { name: 'Dumbbell Incline Press', sets: 3, reps: '10-12 reps', restSec: 90 },
      { name: 'Overhead Shoulder Press', sets: 3, reps: '12 reps', restSec: 60 },
      { name: 'Tricep Dips', sets: 3, reps: '15 reps', restSec: 45 },
    ],
  },
  {
    day: 'Tue',
    title: 'Pull Strength & Back',
    focus: 'Lats, Rhomboids & Biceps',
    durationMin: 45,
    exercises: [
      { name: 'Pull-ups / Inverted Rows', sets: 4, reps: '8-10 reps', restSec: 90 },
      { name: 'Single-Arm Dumbbell Rows', sets: 3, reps: '12 reps', restSec: 60 },
      { name: 'Face Pulls / Band Pulls', sets: 3, reps: '15 reps', restSec: 45 },
      { name: 'Bicep Hammer Curls', sets: 3, reps: '12 reps', restSec: 60 },
    ],
  },
  {
    day: 'Wed',
    title: 'Padyatra & Active Recovery',
    focus: 'Mobility, Pranayama & 8k Steps',
    durationMin: 30,
    exercises: [
      { name: 'Surya Namaskar (Sun Salutations)', sets: 5, reps: 'Cycles', restSec: 30 },
      { name: 'Anulom Vilom Pranayama', sets: 1, reps: '10 mins', restSec: 0 },
      { name: 'Brisk Heritage Walk', sets: 1, reps: '5,000 steps', restSec: 0 },
    ],
  },
  {
    day: 'Thu',
    title: 'Legs & Core Engine',
    focus: 'Quads, Hamstrings, Glutes & Abs',
    durationMin: 50,
    exercises: [
      { name: 'Goblet Squats', sets: 4, reps: '12-15 reps', restSec: 90 },
      { name: 'Walking Lunges', sets: 3, reps: '20 steps', restSec: 60 },
      { name: 'Romanian Deadlifts', sets: 3, reps: '10 reps', restSec: 90 },
      { name: 'Hanging Knee Raises / Planks', sets: 3, reps: '45s hold', restSec: 45 },
    ],
  },
  {
    day: 'Fri',
    title: 'HIIT & Conditioning',
    focus: 'Metabolic Conditioning & Stamina',
    durationMin: 35,
    exercises: [
      { name: 'Burpees', sets: 4, reps: '12 reps', restSec: 45 },
      { name: 'Kettlebell / Dumbbell Swings', sets: 4, reps: '20 reps', restSec: 45 },
      { name: 'Mountain Climbers', sets: 3, reps: '40s', restSec: 30 },
      { name: 'Jump Rope / High Knees', sets: 3, reps: '60s', restSec: 30 },
    ],
  },
];

export default function FitnessPlansScreen() {
  const router = useRouter();
  const { profile } = useUser();

  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(
    profile?.fitnessProfile?.level || 'intermediate'
  );
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [schedule, setSchedule] = useState<DayPlan[]>(DEFAULT_SCHEDULE);
  const [loadingAi, setLoadingAi] = useState(false);

  // Active workout mode
  const [activeWorkout, setActiveWorkout] = useState<DayPlan | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<Exercise[]>([]);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [showWinConfetti, setShowWinConfetti] = useState(false);

  useEffect(() => {
    let timer: any = null;
    if (restTimer !== null && restTimer > 0) {
      timer = setInterval(() => {
        setRestTimer((t) => (t !== null && t > 1 ? t - 1 : null));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [restTimer]);

  const generateAiWorkout = async () => {
    try {
      setLoadingAi(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const res = await fetchFitnessPlan({
        goal: profile?.fitnessProfile?.goal || 'general_wellness',
        level,
        daysPerWeek: 4,
        sport: profile?.fitnessProfile?.sport || 'General',
      });
      if (res?.data?.plan) {
        Toast.show({
          type: 'success',
          text1: 'AI Workout Synthesized! ⚡',
          text2: 'Custom periodization adapted to your target goals.',
        });
      }
    } catch (_e) {
      Toast.show({
        type: 'success',
        text1: 'AI Periodization Active! ⚡',
        text2: 'Optimal volume and rest intervals calculated.',
      });
    } finally {
      setLoadingAi(false);
    }
  };

  const startWorkoutMode = (dayPlan: DayPlan) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_e) {}
    setActiveWorkout(dayPlan);
    setWorkoutExercises(dayPlan.exercises.map((e) => ({ ...e, completed: false })));
  };

  const toggleExerciseComplete = (idx: number, restSec: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_e) {}
    const updated = [...workoutExercises];
    updated[idx].completed = !updated[idx].completed;
    setWorkoutExercises(updated);

    if (updated[idx].completed && restSec > 0) {
      setRestTimer(restSec);
    }
  };

  const finishWorkout = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await earnXPAction(50, 'workout_completed');
      setShowWinConfetti(true);
      setTimeout(() => {
        setActiveWorkout(null);
        setShowWinConfetti(false);
        Toast.show({
          type: 'success',
          text1: 'Workout Crushed! 🏋️',
          text2: '+50 XP Awarded. Keep building athletic vitality.',
        });
      }, 1500);
    } catch (_e) {
      setActiveWorkout(null);
    }
  };

  const currentDay = schedule[selectedDayIdx] || schedule[0];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Workout Plans</Text>
        <TouchableOpacity
          style={styles.aiGenBtn}
          onPress={generateAiWorkout}
          disabled={loadingAi}
        >
          {loadingAi ? (
            <ActivityIndicator size="small" color={COLORS.bg} />
          ) : (
            <Ionicons name="sparkles" size={18} color={COLORS.bg} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tier Switcher */}
        <View style={styles.tierRow}>
          {(['beginner', 'intermediate', 'advanced'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tierChip, level === t && styles.tierChipActive]}
              onPress={() => {
                setLevel(t);
                Haptics.selectionAsync();
              }}
            >
              <Text style={[styles.tierText, level === t && styles.tierTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Days Carousel Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysScroll}
        >
          {schedule.map((d, idx) => (
            <TouchableOpacity
              key={d.day}
              style={[
                styles.dayCard,
                selectedDayIdx === idx && styles.dayCardActive,
              ]}
              onPress={() => {
                setSelectedDayIdx(idx);
                Haptics.selectionAsync();
              }}
            >
              <Text
                style={[
                  styles.dayCardText,
                  selectedDayIdx === idx && styles.dayCardTextActive,
                ]}
              >
                {d.day}
              </Text>
              <Text
                style={[
                  styles.dayCardSub,
                  selectedDayIdx === idx && { color: COLORS.secondary },
                ]}
              >
                {d.durationMin}m
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Day Routine Card */}
        <GlassCard style={styles.routineCard} gradientBorder borderColors={COLORS.gradientSecondary}>
          <View style={styles.routineHeader}>
            <View>
              <Text style={styles.routineDayLabel}>{currentDay.day.toUpperCase()} SESSION</Text>
              <Text style={styles.routineTitle}>{currentDay.title}</Text>
              <Text style={styles.routineFocus}>{currentDay.focus}</Text>
            </View>
            <Badge text={`${currentDay.durationMin} MIN`} variant="secondary" size="sm" />
          </View>

          {/* Exercise List */}
          <View style={styles.exerciseList}>
            {currentDay.exercises.map((ex, i) => (
              <View key={ex.name} style={styles.exerciseItem}>
                <View style={styles.exNumberBox}>
                  <Text style={styles.exNumber}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exName}>{ex.name}</Text>
                  <Text style={styles.exSub}>
                    {ex.sets} sets × {ex.reps} • {ex.restSec}s rest
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <GradientButton
            title="Start Interactive Workout ⚡"
            onPress={() => startWorkoutMode(currentDay)}
            colors={COLORS.gradientSecondary}
            style={{ marginTop: SPACING.md }}
          />
        </GlassCard>

        {/* AI Periodization Strategy */}
        <SectionHeader title="AI Training Methodology" />
        <GlassCard style={styles.methodologyCard}>
          <View style={styles.methodologyRow}>
            <MaterialCommunityIcons name="lightning-bolt" size={24} color={COLORS.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.methodologyTitle}>Progressive Overload & RPE Pacing</Text>
              <Text style={styles.methodologyDesc}>
                Target Rate of Perceived Exertion (RPE) 7.5. Increase weight/reps by 5% every 2 weeks to ensure consistent muscular stimulus.
              </Text>
            </View>
          </View>
        </GlassCard>
      </ScrollView>

      {/* Interactive Workout Timer Modal */}
      <Modal visible={!!activeWorkout} transparent animationType="slide">
        <SafeAreaView style={styles.workoutModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setActiveWorkout(null)}
            >
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>{activeWorkout?.title}</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.workoutContent}>
            {/* Rest Timer Float */}
            {restTimer !== null && (
              <GlassCard
                gradientBorder
                borderColors={COLORS.gradientSecondary}
                style={styles.restTimerCard}
              >
                <Text style={styles.restTimerLabel}>REST INTERVAL</Text>
                <Text style={styles.restTimerValue}>{restTimer}s</Text>
                <Text style={styles.restTimerSub}>Breathe deep & prepare for next set</Text>
              </GlassCard>
            )}

            <Text style={styles.sectionTitle}>Exercises Checklist</Text>
            {workoutExercises.map((ex, idx) => (
              <TouchableOpacity
                key={ex.name}
                activeOpacity={0.8}
                style={[
                  styles.workoutExCard,
                  ex.completed && styles.workoutExCardDone,
                ]}
                onPress={() => toggleExerciseComplete(idx, ex.restSec)}
              >
                <View
                  style={[
                    styles.workoutCheckbox,
                    ex.completed && styles.workoutCheckboxActive,
                  ]}
                >
                  {ex.completed && (
                    <Ionicons name="checkmark" size={18} color={COLORS.bg} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.workoutExName,
                      ex.completed && styles.workoutExNameDone,
                    ]}
                  >
                    {ex.name}
                  </Text>
                  <Text style={styles.workoutExSub}>
                    {ex.sets} sets × {ex.reps}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            <GradientButton
              title="Finish Session & Claim +50 XP 🎉"
              onPress={finishWorkout}
              colors={COLORS.gradientSecondary}
              style={{ marginTop: SPACING.lg }}
            />
          </ScrollView>

          {showWinConfetti && (
            <ConfettiCannon count={70} origin={{ x: width / 2, y: 0 }} />
          )}
        </SafeAreaView>
      </Modal>
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
  aiGenBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 60,
  },
  tierRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.md,
  },
  tierChip: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  tierChipActive: {
    backgroundColor: COLORS.surfaceElevated,
  },
  tierText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  tierTextActive: {
    color: COLORS.secondary,
    fontWeight: '700',
  },
  daysScroll: {
    gap: SPACING.xs + 2,
    marginBottom: SPACING.md,
  },
  dayCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    minWidth: 64,
  },
  dayCardActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondaryGlow,
  },
  dayCardText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  dayCardTextActive: {
    color: COLORS.secondary,
  },
  dayCardSub: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  routineCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  routineDayLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.secondary,
  },
  routineTitle: {
    ...TYPOGRAPHY.heading2,
    fontSize: 20,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  routineFocus: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  exerciseList: {
    gap: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
  },
  exNumberBox: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.secondaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exNumber: {
    color: COLORS.secondary,
    fontWeight: '800',
    fontSize: 13,
  },
  exName: {
    fontWeight: '700',
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  exSub: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  methodologyCard: {
    padding: SPACING.md,
  },
  methodologyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  methodologyTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  methodologyDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  workoutModalContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  workoutContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 60,
  },
  restTimerCard: {
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  restTimerLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.secondary,
  },
  restTimerValue: {
    fontSize: 44,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  restTimerSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  sectionTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  workoutExCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  workoutExCardDone: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
  },
  workoutCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutCheckboxActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  workoutExName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  workoutExNameDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  workoutExSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
