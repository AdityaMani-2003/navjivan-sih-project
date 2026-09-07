import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { ArrowLeft, Play, Pause, RotateCcw, CheckCircle2, Sparkles, Wind } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOW } from '../../constants/theme';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import api from '../../services/api';
import { useUser } from '../../context/UserContext';

const { width } = Dimensions.get('window');
const CIRCLE_CONTAINER_SIZE = width * 0.8;
const MIN_SCALE = 0.55; // 120px equivalent
const MAX_SCALE = 1.0; // 220px equivalent

type Phase = 'inhale' | 'hold' | 'exhale';

interface PhaseConfig {
  name: Phase;
  duration: number; // seconds
  title: string;
  instruction: string;
  color: string;
  glowColor: string;
}

const PHASES: PhaseConfig[] = [
  {
    name: 'inhale',
    duration: 4,
    title: 'Inhale',
    instruction: 'Inhale slowly and deeply through your nose',
    color: COLORS.primary,
    glowColor: 'rgba(16, 185, 129, 0.25)',
  },
  {
    name: 'hold',
    duration: 7,
    title: 'Hold',
    instruction: 'Hold your breath. Keep your shoulders relaxed.',
    color: COLORS.secondary,
    glowColor: 'rgba(139, 92, 246, 0.25)',
  },
  {
    name: 'exhale',
    duration: 8,
    title: 'Exhale',
    instruction: 'Exhale steadily and completely through your mouth',
    color: COLORS.accent,
    glowColor: 'rgba(245, 158, 11, 0.25)',
  },
];

const TOTAL_CYCLES = 3;

export default function BreathingGameScreen() {
  const router = useRouter();
  const { addXP } = useUser();

  const [isRunning, setIsRunning] = useState(true);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(PHASES[0].duration);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);

  const scale = useSharedValue(MIN_SCALE);
  const currentPhase = PHASES[phaseIndex];

  // Animated circle style
  const circleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Trigger phase animations
  const startPhaseAnimation = (phase: Phase) => {
    cancelAnimation(scale);
    if (phase === 'inhale') {
      scale.value = withTiming(MAX_SCALE, {
        duration: 4000,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
    } else if (phase === 'hold') {
      // Gentle pulse while holding
      scale.value = withTiming(MAX_SCALE, { duration: 7000 });
    } else if (phase === 'exhale') {
      scale.value = withTiming(MIN_SCALE, {
        duration: 8000,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
    }
  };

  // Run timer loop
  useEffect(() => {
    if (!isRunning || isCompleted) return;

    startPhaseAnimation(currentPhase.name);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_e) {}

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Advance phase
          advancePhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, phaseIndex, currentCycle, isCompleted]);

  const advancePhase = () => {
    if (phaseIndex < PHASES.length - 1) {
      const nextPhase = phaseIndex + 1;
      setPhaseIndex(nextPhase);
      setSecondsRemaining(PHASES[nextPhase].duration);
    } else {
      // Completed a full cycle
      if (currentCycle < TOTAL_CYCLES) {
        setCurrentCycle((c) => c + 1);
        setPhaseIndex(0);
        setSecondsRemaining(PHASES[0].duration);
      } else {
        // All cycles completed!
        handleCompletion();
      }
    }
  };

  const handleCompletion = async () => {
    setIsCompleted(true);
    setIsRunning(false);
    setShowConfetti(true);

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_e) {}

    if (!xpAwarded) {
      setXpAwarded(true);
      try {
        await api.post('/api/v1/gamification/xp', {
          amount: 20,
          reason: '4-7-8 Breathing exercise completed',
        });
        addXP(20);
      } catch (err) {
        console.warn('XP award error:', err);
        addXP(20);
      }
    }
  };

  const togglePlayPause = () => {
    try {
      Haptics.selectionAsync();
    } catch (_e) {}
    setIsRunning((prev) => !prev);
  };

  const resetExercise = () => {
    try {
      Haptics.selectionAsync();
    } catch (_e) {}
    cancelAnimation(scale);
    scale.value = MIN_SCALE;
    setCurrentCycle(1);
    setPhaseIndex(0);
    setSecondsRemaining(PHASES[0].duration);
    setIsCompleted(false);
    setShowConfetti(false);
    setIsRunning(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color={COLORS.textPrimary} />
        </Pressable>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>4-7-8 Breathing</Text>
          <Text style={styles.headerSubtitle}>Craving Relief & Vagal Nerve Reset</Text>
        </View>
        <Pressable
          onPress={resetExercise}
          style={styles.resetButton}
          accessibilityRole="button"
          accessibilityLabel="Reset exercise"
        >
          <RotateCcw size={20} color={COLORS.textSecondary} />
        </Pressable>
      </View>

      {isCompleted ? (
        <View style={styles.completionContainer}>
          {showConfetti && (
            <ConfettiCannon
              count={60}
              origin={{ x: width / 2, y: -20 }}
              fadeOut={true}
              fallSpeed={3000}
            />
          )}

          <View style={styles.successIconWrapper}>
            <View style={[styles.successIconBox, { backgroundColor: COLORS.primaryDim }]}>
              <CheckCircle2 size={56} color={COLORS.primary} />
            </View>
          </View>

          <Text style={styles.completionTitle}>Craving Subsided</Text>
          <Text style={styles.completionDesc}>
            Great job! You completed 3 cycles of deep 4-7-8 breathing. Your heart rate is reduced
            and dopamine receptors are reset.
          </Text>

          <Card style={styles.rewardCard}>
            <View style={styles.rewardRow}>
              <Sparkles size={24} color={COLORS.primary} />
              <View style={styles.rewardText}>
                <Text style={styles.rewardTitle}>+20 XP Awarded</Text>
                <Text style={styles.rewardSubtitle}>Mindfulness Mastery progress updated</Text>
              </View>
            </View>
          </Card>

          <View style={styles.completionActions}>
            <Button
              title="Back to Home"
              variant="primary"
              size="lg"
              fullWidth
              onPress={() => router.replace('/(tabs)' as any)}
              style={{ marginBottom: SPACING.md }}
            />
            <Button
              title="Repeat Breathing"
              variant="outline"
              size="lg"
              fullWidth
              onPress={resetExercise}
            />
          </View>
        </View>
      ) : (
        <View style={styles.mainContent}>
          {/* Cycle & Phase Status */}
          <View style={styles.cycleBadge}>
            <Wind size={16} color={currentPhase.color} />
            <Text style={[styles.cycleText, { color: currentPhase.color }]}>
              Cycle {currentCycle} of {TOTAL_CYCLES}
            </Text>
          </View>

          {/* Center Breathing Visualizer */}
          <View style={styles.visualizerContainer}>
            {/* Outer Glow Ring */}
            <View
              style={[
                styles.glowRing,
                {
                  borderColor: currentPhase.glowColor,
                  shadowColor: currentPhase.color,
                },
              ]}
            />

            {/* Animated Breathing Circle */}
            <Animated.View style={[styles.animatedCircleWrapper, circleAnimatedStyle]}>
              <Svg width={CIRCLE_CONTAINER_SIZE} height={CIRCLE_CONTAINER_SIZE} viewBox="0 0 200 200">
                <Defs>
                  <RadialGradient id="breathGrad" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor={currentPhase.color} stopOpacity="0.4" />
                    <Stop offset="70%" stopColor={currentPhase.color} stopOpacity="0.15" />
                    <Stop offset="100%" stopColor={currentPhase.color} stopOpacity="0.02" />
                  </RadialGradient>
                </Defs>
                <Circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="url(#breathGrad)"
                  stroke={currentPhase.color}
                  strokeWidth="3"
                />
              </Svg>

              <View style={styles.innerContentOverlay}>
                <Text style={[styles.phaseTitleText, { color: currentPhase.color }]}>
                  {currentPhase.title}
                </Text>
                <Text style={styles.phaseCountdownText}>{secondsRemaining}s</Text>
              </View>
            </Animated.View>
          </View>

          {/* Instructions */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>{currentPhase.instruction}</Text>
          </View>

          {/* Phase Progress Bar */}
          <View style={styles.phasesTrack}>
            {PHASES.map((p, idx) => {
              const isActive = idx === phaseIndex;
              const isPast = idx < phaseIndex;
              return (
                <View
                  key={p.name}
                  style={[
                    styles.phaseSegment,
                    isActive && { backgroundColor: p.color, flex: 2 },
                    isPast && { backgroundColor: COLORS.borderFocused, flex: 1 },
                    !isActive && !isPast && { backgroundColor: COLORS.surfaceBorder, flex: 1 },
                  ]}
                >
                  <Text
                    style={[
                      styles.phaseSegmentText,
                      isActive ? { color: COLORS.background } : { color: COLORS.textMuted },
                    ]}
                  >
                    {p.title}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Bottom Controls */}
          <View style={styles.controlsRow}>
            <Pressable
              onPress={togglePlayPause}
              style={[
                styles.playPauseBtn,
                { backgroundColor: isRunning ? COLORS.surfaceElevated : COLORS.primary },
              ]}
              accessibilityRole="button"
              accessibilityLabel={isRunning ? 'Pause breathing' : 'Resume breathing'}
            >
              {isRunning ? (
                <Pause size={24} color={COLORS.textPrimary} />
              ) : (
                <Play size={24} color={COLORS.textInverse} fill={COLORS.textInverse} />
              )}
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  headerTitleBox: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  resetButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  cycleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  cycleText: {
    ...TYPOGRAPHY.label,
  },
  visualizerContainer: {
    width: CIRCLE_CONTAINER_SIZE,
    height: CIRCLE_CONTAINER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    width: CIRCLE_CONTAINER_SIZE,
    height: CIRCLE_CONTAINER_SIZE,
    borderRadius: CIRCLE_CONTAINER_SIZE / 2,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 6,
  },
  animatedCircleWrapper: {
    width: CIRCLE_CONTAINER_SIZE,
    height: CIRCLE_CONTAINER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContentOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseTitleText: {
    ...TYPOGRAPHY.h2,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  phaseCountdownText: {
    ...TYPOGRAPHY.display,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  instructionContainer: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  instructionText: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  phasesTrack: {
    flexDirection: 'row',
    gap: SPACING.xs,
    width: '100%',
    height: 32,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  phaseSegment: {
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseSegmentText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  controlsRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  playPauseBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.md,
  },
  completionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  successIconWrapper: {
    marginBottom: SPACING.lg,
  },
  successIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  completionDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  rewardCard: {
    width: '100%',
    marginBottom: SPACING.xxl,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  rewardText: {
    flex: 1,
  },
  rewardTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  rewardSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  completionActions: {
    width: '100%',
  },
});
