import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as SMS from 'expo-sms';
import Toast from 'react-native-toast-message';
import ConfettiCannon from 'react-native-confetti-cannon';

import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import { logCraving, earnXPAction } from '../services/api';
import { useUser } from '../context/UserContext';

const { width } = Dimensions.get('window');

type BreathPhase = 'Inhale' | 'Hold' | 'Exhale';

export default function SOSScreen() {
  const router = useRouter();
  const { profile } = useUser();

  // 7-min live countdown (420 seconds)
  const [timeLeft, setTimeLeft] = useState(420);
  const [distressLevel, setDistressLevel] = useState(7);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('Inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loggingCraving, setLoggingCraving] = useState(false);

  // Breathing circle animation
  const circleScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);

  // Live countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Guided 4-7-8 Breathing Loop
  useEffect(() => {
    let current = 'Inhale';
    let count = 4;
    setBreathPhase('Inhale');
    setBreathSeconds(4);

    // Initial expand
    circleScale.value = withTiming(1.4, { duration: 4000, easing: Easing.inOut(Easing.ease) });
    glowOpacity.value = withTiming(0.8, { duration: 4000 });

    const breathInterval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setBreathSeconds(count);
      } else {
        if (current === 'Inhale') {
          current = 'Hold';
          count = 7;
          setBreathPhase('Hold');
          setBreathSeconds(7);
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch (_e) {}
        } else if (current === 'Hold') {
          current = 'Exhale';
          count = 8;
          setBreathPhase('Exhale');
          setBreathSeconds(8);
          circleScale.value = withTiming(0.9, { duration: 8000, easing: Easing.inOut(Easing.ease) });
          glowOpacity.value = withTiming(0.3, { duration: 8000 });
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch (_e) {}
        } else {
          current = 'Inhale';
          count = 4;
          setBreathPhase('Inhale');
          setBreathSeconds(4);
          circleScale.value = withTiming(1.4, { duration: 4000, easing: Easing.inOut(Easing.ease) });
          glowOpacity.value = withTiming(0.8, { duration: 4000 });
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch (_e) {}
        }
      }
    }, 1000);

    return () => clearInterval(breathInterval);
  }, []);

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleResisted = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowConfetti(true);
      await earnXPAction(50, 'sos_craving_resisted', { distressLevel });
      Toast.show({
        type: 'success',
        text1: 'Craving Conquered! 🏆',
        text2: '+50 XP awarded. You broke another nicotine reflex.',
      });
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (_e) {
      router.back();
    }
  };

  const handleCallQuitline = () => {
    Linking.openURL('tel:1800112356');
  };

  const handleSendGuardianSMS = async () => {
    const guardianPhone = (profile?.smokerProfile as any)?.guardianContact || '';
    if (!guardianPhone) {
      Toast.show({
        type: 'info',
        text1: 'No Guardian Configured',
        text2: 'Add a guardian phone number in Profile settings.',
      });
      return;
    }
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      await SMS.sendSMSAsync(
        [guardianPhone],
        "Navjivan SOS Alert: I'm facing a strong craving right now. Could you please give me a quick call or words of support? 💙"
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {showConfetti && (
        <ConfettiCannon
          count={80}
          origin={{ x: width / 2, y: 0 }}
          autoStart={true}
          fadeOut={true}
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.sosBadge}>
          <View style={styles.sosDot} />
          <Text style={styles.sosBadgeText}>24/7 CRAVING SHIELD ACTIVE</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Countdown Header */}
        <View style={styles.timerSection}>
          <Text style={styles.timerHeading}>PEAK CRAVING WINDOW</Text>
          <Text style={styles.timerDigits}>{formatTime(timeLeft)}</Text>
          <Text style={styles.timerSub}>
            Physiological urgency dissipates completely in under 7 minutes.
          </Text>
        </View>

        {/* 4-7-8 Interactive Breathing Circle */}
        <View style={styles.breathingContainer}>
          <Animated.View style={[styles.breathingGlow, animatedGlowStyle]} />
          <Animated.View style={[styles.breathingCircle, animatedCircleStyle]}>
            <Text style={styles.breathPhaseText}>{breathPhase.toUpperCase()}</Text>
            <Text style={styles.breathSecondsText}>{breathSeconds}s</Text>
          </Animated.View>
        </View>
        <Text style={styles.breathInstruction}>
          {breathPhase === 'Inhale'
            ? 'Inhale calmly through your nose for 4 seconds'
            : breathPhase === 'Hold'
            ? 'Hold full lungs gently for 7 seconds'
            : 'Exhale completely with pursed lips for 8 seconds'}
        </Text>

        {/* Distress Intensity Selector */}
        <GlassCard style={styles.distressCard}>
          <Text style={styles.distressTitle}>Craving Urge Intensity: {distressLevel}/10</Text>
          <View style={styles.distressRow}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.distressChip,
                  distressLevel === num && styles.distressChipActive,
                  distressLevel === num && {
                    backgroundColor: num >= 7 ? COLORS.danger : COLORS.accent,
                  },
                ]}
                onPress={() => {
                  setDistressLevel(num);
                  try {
                    Haptics.selectionAsync();
                  } catch (_e) {}
                }}
              >
                <Text
                  style={[
                    styles.distressChipText,
                    distressLevel === num && { color: '#FFF', fontWeight: '900' },
                  ]}
                >
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        {/* Panic Distraction Actions */}
        <Text style={styles.sectionHeading}>PANIC DISTRACTION TOOLS</Text>
        <View style={styles.distractionGrid}>
          <TouchableOpacity
            style={styles.distractionCard}
            onPress={() => router.push('/games/bubble-burst' as any)}
            activeOpacity={0.8}
          >
            <GlassCard style={styles.distractionInner}>
              <View style={[styles.distractionIcon, { backgroundColor: 'rgba(0, 245, 160, 0.18)' }]}>
                <Ionicons name="game-controller" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.distractionTitle}>Bubble Burst</Text>
              <Text style={styles.distractionSub}>60s Dopamine mini-game</Text>
            </GlassCard>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.distractionCard}
            onPress={() => router.push('/games/focus-flow' as any)}
            activeOpacity={0.8}
          >
            <GlassCard style={styles.distractionInner}>
              <View style={[styles.distractionIcon, { backgroundColor: 'rgba(139, 92, 246, 0.18)' }]}>
                <MaterialCommunityIcons name="brain" size={24} color={COLORS.secondary} />
              </View>
              <Text style={styles.distractionTitle}>Zen Memory</Text>
              <Text style={styles.distractionSub}>Mindfulness tile matcher</Text>
            </GlassCard>
          </TouchableOpacity>
        </View>

        {/* Emergency Helplines */}
        <View style={styles.helplineRow}>
          <TouchableOpacity
            style={[styles.helplineBtn, { borderColor: COLORS.danger }]}
            onPress={handleCallQuitline}
            activeOpacity={0.75}
          >
            <Ionicons name="call" size={16} color={COLORS.danger} />
            <Text style={[styles.helplineText, { color: COLORS.danger }]}>
              Quitline 1800-11-2356
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.helplineBtn, { borderColor: '#38BDF8' }]}
            onPress={handleSendGuardianSMS}
            activeOpacity={0.75}
          >
            <Ionicons name="chatbubble-ellipses" size={16} color="#38BDF8" />
            <Text style={[styles.helplineText, { color: '#38BDF8' }]}>Guardian SMS</Text>
          </TouchableOpacity>
        </View>

        {/* I Conquered This Craving Button */}
        <View style={{ marginTop: SPACING.lg }}>
          <GradientButton
            title="I Resisted This Craving! 🏆 (+50 XP)"
            colors={COLORS.gradientPrimary}
            onPress={handleResisted}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: '#0E0E17',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 56, 92, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 56, 92, 0.35)',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  sosDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.danger,
  },
  sosBadgeText: {
    color: COLORS.danger,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 60,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timerHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  timerDigits: {
    fontSize: 54,
    fontWeight: '900',
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  timerSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    marginTop: 4,
  },
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginVertical: SPACING.md,
  },
  breathingGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 245, 160, 0.15)',
  },
  breathingCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#0E0E17',
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  breathPhaseText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  breathSecondsText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  breathInstruction: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SPACING.lg,
  },
  distressCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  distressTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  distressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 3,
  },
  distressChip: {
    flex: 1,
    height: 34,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  distressChipActive: {
    transform: [{ scale: 1.05 }],
  },
  distressChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    marginBottom: SPACING.sm,
  },
  distractionGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  distractionCard: {
    flex: 1,
  },
  distractionInner: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  distractionIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  distractionTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 13,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  distractionSub: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  helplineRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  helplineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: 4,
    borderRadius: RADIUS.md,
    backgroundColor: '#0E0E17',
    borderWidth: 1,
  },
  helplineText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
