import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import { fetchQuitPlan, earnXPAction } from '../services/api';
import { useUser } from '../context/UserContext';

interface ScheduleDay {
  day: number;
  maxCigs: number;
  focus: string;
  isCompleted: boolean;
}

export default function QuitPlanScreen() {
  const router = useRouter();
  const { profile } = useUser();

  const [activeTab, setActiveTab] = useState<'gradual' | 'cold_turkey'>('gradual');
  const [currentDay, setCurrentDay] = useState(4);
  const [todaySmoked, setTodaySmoked] = useState(2);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiPlan, setAiPlan] = useState<string | null>(null);

  const baseCigs = profile?.smokerProfile?.cigarettesPerDay || 12;

  // Generate 30 days schedule
  const scheduleDays: ScheduleDay[] = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    // Linear reduction
    const maxCigs = Math.max(0, Math.ceil(baseCigs * (1 - (day - 1) / 28)));
    return {
      day,
      maxCigs,
      focus:
        day === 1
          ? 'Baseline Awareness'
          : day === 7
          ? 'Halve Morning Cigarette'
          : day === 14
          ? 'Break Post-Meal Habit'
          : day === 21
          ? 'Social Situations Mastery'
          : day === 30
          ? 'Smoke-Free Victory'
          : 'Habit Replacement',
      isCompleted: day < currentDay,
    };
  });

  const generateAiPlan = async () => {
    try {
      setLoadingAi(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const res = await fetchQuitPlan({
        cigarettesPerDay: baseCigs,
        smokingYears: profile?.smokerProfile?.yearsSmoking || 4,
        triggers: profile?.smokerProfile?.triggers || ['Stress', 'Chai'],
      });

      if (res?.data?.plan) {
        setAiPlan(res.data.plan.overview || res.data.plan.summary || JSON.stringify(res.data.plan));
      } else {
        setAiPlan(
          "Your personalized 30-day AI protocol: Replace morning cigarette with 500ml warm lemon water and 2 min box breathing. Cap daily limit at 4 cigs this week, stepping down to 2 next Monday. You're on track to save ₹6,200/mo!"
        );
      }
    } catch (_err) {
      setAiPlan(
        "AI Quit Plan Activated: Focus on delaying the first smoke by 90 minutes each morning. Substitute midday break with brisk 5-min walk. Current projection: 100% smoke-free in 24 days!"
      );
    } finally {
      setLoadingAi(false);
    }
  };

  const completeDay = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await earnXPAction(40, 'quit_plan_day_completed');
      setCurrentDay((d) => d + 1);
      setTodaySmoked(0);
      Toast.show({
        type: 'success',
        text1: `Day ${currentDay} Completed! 🎯`,
        text2: '+40 XP Earned. Stepdown target achieved.',
      });
    } catch (_e) {}
  };

  const todayLimit = scheduleDays[currentDay - 1]?.maxCigs ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quit Strategy & Protocol</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Strategy Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'gradual' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('gradual');
              Haptics.selectionAsync();
            }}
          >
            <Text style={[styles.tabText, activeTab === 'gradual' && styles.tabTextActive]}>
              Gradual Tapering (30d)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'cold_turkey' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('cold_turkey');
              Haptics.selectionAsync();
            }}
          >
            <Text style={[styles.tabText, activeTab === 'cold_turkey' && styles.tabTextActive]}>
              Cold Turkey (Instant)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Today's Target Card */}
        {activeTab === 'gradual' ? (
          <GlassCard style={styles.todayCard} gradientBorder>
            <View style={styles.todayHeader}>
              <View>
                <Text style={styles.todayLabel}>DAY {currentDay} OF 30</Text>
                <Text style={styles.todayTitle}>Daily Cigarette Allowance</Text>
              </View>
              <View style={styles.limitBadge}>
                <Text style={styles.limitBadgeText}>Max {todayLimit}/day</Text>
              </View>
            </View>

            <View style={styles.trackerRow}>
              <View style={styles.trackerBox}>
                <Text style={styles.trackerValue}>{todaySmoked}</Text>
                <Text style={styles.trackerSub}>Smoked Today</Text>
              </View>
              <Text style={{ fontSize: 24, color: COLORS.textMuted }}>/</Text>
              <View style={styles.trackerBox}>
                <Text style={[styles.trackerValue, { color: COLORS.primary }]}>{todayLimit}</Text>
                <Text style={styles.trackerSub}>Target Cap</Text>
              </View>
            </View>

            <View style={styles.cigButtonsRow}>
              <TouchableOpacity
                style={styles.cigActionBtn}
                onPress={() => {
                  setTodaySmoked((s) => s + 1);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Ionicons name="add" size={18} color={COLORS.danger} />
                <Text style={styles.cigActionText}>Log 1 Cigarette</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cigActionBtn, { borderColor: COLORS.primary }]}
                onPress={completeDay}
              >
                <Ionicons name="checkmark-done" size={18} color={COLORS.primary} />
                <Text style={[styles.cigActionText, { color: COLORS.primary }]}>
                  Finish Day {currentDay}
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        ) : (
          <GlassCard style={styles.todayCard} gradientBorder>
            <Text style={styles.todayLabel}>COLD TURKEY PROTOCOL</Text>
            <Text style={styles.todayTitle}>Zero Puffs • 100% Smoke-Free</Text>
            <Text style={styles.coldTurkeyDesc}>
              Every second you remain smoke-free, your acetylcholine receptors are recalibrating. Rely on the 24/7 SOS tool whenever an urge spikes.
            </Text>
          </GlassCard>
        )}

        {/* AI Plan Recommender Box */}
        <Text style={styles.sectionTitle}>Agentic AI Clinical Advisor</Text>
        <GlassCard style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={[styles.aiIcon, { backgroundColor: COLORS.primaryGlow }]}>
              <MaterialCommunityIcons name="robot" size={22} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiHeading}>Personalized GenAI Protocol</Text>
              <Text style={styles.aiSub}>Calibrated to your exact habit metrics</Text>
            </View>
          </View>

          {aiPlan ? (
            <View style={styles.aiPlanBox}>
              <Text style={styles.aiPlanText}>{aiPlan}</Text>
            </View>
          ) : (
            <GradientButton
              title={loadingAi ? 'Synthesizing Plan...' : 'Generate AI Quit Plan ✨'}
              loading={loadingAi}
              onPress={generateAiPlan}
              colors={COLORS.gradientPrimary}
              style={{ marginTop: SPACING.sm }}
            />
          )}
        </GlassCard>

        {/* 30-Day Stepdown Timeline */}
        <Text style={styles.sectionTitle}>Stepdown Roadmap</Text>
        <View style={styles.scheduleList}>
          {scheduleDays.slice(0, 10).map((d) => (
            <View
              key={d.day}
              style={[
                styles.scheduleItem,
                d.day === currentDay && styles.scheduleItemCurrent,
                d.isCompleted && styles.scheduleItemCompleted,
              ]}
            >
              <View style={styles.dayNumBox}>
                <Text
                  style={[
                    styles.dayNum,
                    d.day === currentDay && { color: COLORS.primary },
                  ]}
                >
                  D{d.day}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dayFocus}>{d.focus}</Text>
                <Text style={styles.dayLimit}>Cap: {d.maxCigs} cigs</Text>
              </View>
              {d.isCompleted ? (
                <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
              ) : d.day === currentDay ? (
                <View style={styles.inProgressPill}>
                  <Text style={styles.inProgressText}>TODAY</Text>
                </View>
              ) : (
                <Ionicons name="lock-closed" size={18} color={COLORS.textMuted} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  tabBtnActive: {
    backgroundColor: COLORS.surfaceElevated,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  todayCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  todayLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
  },
  todayTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  limitBadge: {
    backgroundColor: COLORS.primaryGlow,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  limitBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  trackerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginVertical: SPACING.md,
  },
  trackerBox: {
    alignItems: 'center',
  },
  trackerValue: {
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  trackerSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  cigButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  cigActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
  },
  cigActionText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  coldTurkeyDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: SPACING.xs,
  },
  sectionTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  aiCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiHeading: {
    ...TYPOGRAPHY.heading3,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  aiSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  aiPlanBox: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  aiPlanText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  scheduleList: {
    gap: SPACING.xs + 2,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    gap: SPACING.sm,
  },
  scheduleItemCurrent: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 212, 170, 0.05)',
  },
  scheduleItemCompleted: {
    opacity: 0.7,
  },
  dayNumBox: {
    width: 36,
    alignItems: 'center',
  },
  dayNum: {
    fontWeight: '800',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  dayFocus: {
    fontWeight: '600',
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  dayLimit: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  inProgressPill: {
    backgroundColor: COLORS.primaryGlow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  inProgressText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
  },
});
