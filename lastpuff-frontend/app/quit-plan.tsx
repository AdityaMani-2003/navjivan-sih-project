import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Calendar,
  Cigarette,
  Flame,
  CheckCircle2,
  Circle,
  Sparkles,
  Plus,
  Minus,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Clock,
  Layers,
} from "lucide-react-native";
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOW } from "../constants/theme";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ProgressBar from "../components/ui/ProgressBar";
import ProgressRing from "../components/ui/ProgressRing";
import { useUser } from "../context/UserContext";
import api from "../services/api";

const { width } = Dimensions.get("window");
const DAILY_TIP_CACHE_KEY = "@navjivan_daily_tip";

interface WeekTask {
  _id: string;
  title: string;
  description?: string;
  xpReward: number;
  isCompleted: boolean;
  dayNumber: number;
  category: string;
}

export default function QuitPlanScreen() {
  const router = useRouter();
  const { profile, addXP } = useUser();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Plan state
  const [plan, setPlan] = useState<any>(null);
  const [tasks, setTasks] = useState<WeekTask[]>([]);
  const [dailyTip, setDailyTip] = useState<string>("");
  const [currentDay, setCurrentDay] = useState(1);
  const [cigarettesSmokedToday, setCigarettesSmokedToday] = useState(0);

  const fetchPlanDetails = useCallback(async () => {
    try {
      const [planRes, tasksRes, tipRes, statsRes] = await Promise.all([
        api.get("/api/v1/plan/current").catch(() => null),
        api.get("/api/v1/tasks/week").catch(() => null),
        api.get("/api/v1/ai/daily-tip").catch(() => null),
        api.get("/api/v1/progress/stats").catch(() => null),
      ]);

      if (planRes?.data?.success && planRes.data.data) {
        setPlan(planRes.data.data);
      }

      if (tasksRes?.data?.success && Array.isArray(tasksRes.data.data)) {
        setTasks(tasksRes.data.data);
      }

      if (tipRes?.data?.success && tipRes.data.data?.tip) {
        setDailyTip(tipRes.data.data.tip);
        AsyncStorage.setItem(DAILY_TIP_CACHE_KEY, tipRes.data.data.tip);
      } else {
        const cached = await AsyncStorage.getItem(DAILY_TIP_CACHE_KEY);
        if (cached) setDailyTip(cached);
        else setDailyTip("When craving strikes, wait 3 minutes and drink cold water. The urge will pass!");
      }

      if (statsRes?.data?.success && statsRes.data.data) {
        setCurrentDay(statsRes.data.data.daysSmokeFree || 1);
        const todaySmoked = statsRes.data.data.recentDays?.[0]?.cigarettesSmoked || 0;
        setCigarettesSmokedToday(todaySmoked);
      }
    } catch (err) {
      console.warn("Failed to load quit plan:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPlanDetails();
  }, [fetchPlanDetails]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlanDetails();
  };

  const handleToggleTask = async (task: WeekTask) => {
    if (task.isCompleted) return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_e) {}

    // Optimistic completion
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, isCompleted: true } : t))
    );
    addXP(task.xpReward || 25);

    Toast.show({
      type: "success",
      text1: "Task Complete!",
      text2: `+${task.xpReward || 25} XP earned towards your streak!`,
    });

    try {
      await api.put(`/api/v1/tasks/${task._id}/complete`);
    } catch (err) {
      console.warn("Failed to update task:", err);
    }
  };

  const handleLogCigarette = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_e) {}

    setCigarettesSmokedToday((prev) => prev + 1);

    try {
      await api.post("/api/v1/progress/log-cigarettes", { count: 1 });
      Toast.show({
        type: "info",
        text1: "Cigarette Logged",
        text2: "Keep going. Each craving resisted brings your dopamine closer to balance.",
      });
    } catch (err) {
      console.warn("Failed to log cigarette:", err);
    }
  };

  const isColdTurkey = plan?.planType === "cold_turkey";
  const durationDays = plan?.durationDays || 30;
  const currentWeek = Math.min(4, Math.max(1, Math.ceil(currentDay / 7)));
  const progressFraction = Math.min(1, currentDay / durationDays);

  const allowedCigsToday = isColdTurkey
    ? 0
    : Math.max(0, Math.ceil(12 * (1 - (currentDay - 1) / durationDays)));

  const currentWeekTheme =
    plan?.weeklyStructure?.[currentWeek - 1]?.theme ||
    (currentWeek === 1
      ? "Week 1: Breaking Baseline Habits & Morning Triggers"
      : currentWeek === 2
      ? "Week 2: Impulse Delay & Hydration Protocols"
      : currentWeek === 3
      ? "Week 3: Stress Management & Social Mastery"
      : "Week 4: Permanent Smoke-Free Freedom");

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color={COLORS.textPrimary} />
        </Pressable>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Quit Strategy</Text>
          <Text style={styles.headerSubtitle}>Personalized Cessation Protocol</Text>
        </View>

        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Syncing quit protocol...</Text>
          </View>
        ) : (
          <>
            {/* Hero Plan Status Card */}
            <Card style={styles.heroCard} elevation="medium">
              <View style={styles.heroTopRow}>
                <View style={styles.heroTag}>
                  <Flame size={14} color={COLORS.primary} />
                  <Text style={styles.heroTagText}>
                    {isColdTurkey ? "COLD TURKEY SPRINT" : "GRADUAL REDUCTION"}
                  </Text>
                </View>
                <Text style={styles.dayBadge}>
                  Day {currentDay} of {durationDays}
                </Text>
              </View>

              <Text style={styles.heroTitle}>
                {plan?.planName || "30-Day Clinical Smoke-Free Sprint"}
              </Text>
              <Text style={styles.heroDesc}>
                {plan?.description ||
                  "Gradual biological dopamine recalibration targeting oral sensory triggers and stress habits."}
              </Text>

              <View style={styles.progressSection}>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressLabel}>Plan Progression</Text>
                  <Text style={styles.progressPercent}>
                    {Math.round(progressFraction * 100)}%
                  </Text>
                </View>
                <ProgressBar
                  progress={progressFraction}
                  color={COLORS.primary}
                  height={8}
                />
              </View>
            </Card>

            {/* Daily Cigarette Stepper (Gradual Reduction Only) */}
            {!isColdTurkey && (
              <Card style={styles.counterCard} elevation="medium">
                <View style={styles.counterHeader}>
                  <Cigarette size={22} color={COLORS.accent} />
                  <View style={styles.counterTitleBox}>
                    <Text style={styles.counterTitle}>Daily Cigarette Tracker</Text>
                    <Text style={styles.counterSubtitle}>
                      Allowed today: {allowedCigsToday} • Logged: {cigarettesSmokedToday}
                    </Text>
                  </View>
                </View>

                <View style={styles.stepperContainer}>
                  <View style={styles.counterStat}>
                    <Text style={styles.counterNum}>{cigarettesSmokedToday}</Text>
                    <Text style={styles.counterStatLabel}>Smoked Today</Text>
                  </View>

                  <View style={styles.stepperActions}>
                    <Button
                      title="Log Cigarette (+1)"
                      variant="outline"
                      size="md"
                      onPress={handleLogCigarette}
                      icon={<Plus size={16} color={COLORS.textPrimary} />}
                    />
                  </View>
                </View>

                {cigarettesSmokedToday >= allowedCigsToday && (
                  <View style={styles.warningBox}>
                    <Text style={styles.warningBoxText}>
                      ⚠️ Daily limit reached! Use 4-7-8 breathing or call the national quitline if
                      urges persist.
                    </Text>
                  </View>
                )}
              </Card>
            )}

            {/* This Week's Theme Card */}
            <Card style={styles.themeCard} elevation="low">
              <View style={styles.themeRow}>
                <View style={styles.themeIconBox}>
                  <Layers size={22} color={COLORS.secondary} />
                </View>
                <View style={styles.themeInfo}>
                  <Text style={styles.themeKicker}>CURRENT FOCUS • WEEK {currentWeek}</Text>
                  <Text style={styles.themeTitle}>{currentWeekTheme}</Text>
                </View>
              </View>
            </Card>

            {/* GenAI Tip of the Day */}
            <Card style={styles.tipCard} elevation="low">
              <View style={styles.tipHeader}>
                <Sparkles size={18} color={COLORS.primary} />
                <Text style={styles.tipKicker}>GENAI TIP OF THE DAY</Text>
              </View>
              <Text style={styles.tipText}>"{dailyTip}"</Text>
            </Card>

            {/* Weekly Tasks Section */}
            <View style={styles.tasksSection}>
              <View style={styles.sectionHeader}>
                <Calendar size={18} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Week {currentWeek} Action Tasks</Text>
              </View>

              {tasks.length === 0 ? (
                <Card style={styles.emptyTaskCard}>
                  <CheckCircle2 size={32} color={COLORS.primary} />
                  <Text style={styles.emptyTaskTitle}>All Week Tasks Finished!</Text>
                  <Text style={styles.emptyTaskDesc}>
                    Outstanding work. Maintain your smoke-free streak until next week unlocks.
                  </Text>
                </Card>
              ) : (
                <View style={styles.taskList}>
                  {tasks.map((t) => (
                    <Pressable
                      key={t._id}
                      onPress={() => handleToggleTask(t)}
                      style={[styles.taskItem, t.isCompleted && styles.taskItemCompleted]}
                      accessibilityRole="button"
                    >
                      <View style={styles.taskCheck}>
                        {t.isCompleted ? (
                          <CheckCircle2 size={22} color={COLORS.primary} />
                        ) : (
                          <Circle size={22} color={COLORS.textMuted} />
                        )}
                      </View>

                      <View style={styles.taskContent}>
                        <Text
                          style={[
                            styles.taskTitle,
                            t.isCompleted && styles.taskTitleCompleted,
                          ]}
                        >
                          {t.title}
                        </Text>
                        {t.description && (
                          <Text style={styles.taskDesc}>{t.description}</Text>
                        )}
                      </View>

                      <View style={styles.xpBadge}>
                        <Text style={styles.xpBadgeText}>+{t.xpReward || 25} XP</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    backgroundColor: COLORS.surface,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  headerTitleBox: {
    alignItems: "center",
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
  headerPlaceholder: {
    width: 44,
  },
  scrollContent: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  loadingBox: {
    paddingVertical: 80,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.md,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  heroCard: {
    padding: SPACING.lg,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  heroTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryDim,
  },
  heroTagText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "700",
  },
  dayBadge: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  heroTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  heroDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  progressSection: {
    gap: SPACING.xs,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  progressPercent: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: "700",
  },
  counterCard: {
    padding: SPACING.lg,
  },
  counterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  counterTitleBox: {
    flex: 1,
  },
  counterTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  counterSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  counterStat: {
    flexDirection: "column",
  },
  counterNum: {
    ...TYPOGRAPHY.display,
    color: COLORS.accent,
  },
  counterStatLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  stepperActions: {
    flexDirection: "row",
  },
  warningBox: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
  },
  warningBoxText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.warning,
    lineHeight: 18,
  },
  themeCard: {
    padding: SPACING.md,
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  themeIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.secondaryDim,
    alignItems: "center",
    justifyContent: "center",
  },
  themeInfo: {
    flex: 1,
  },
  themeKicker: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  themeTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  tipCard: {
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  tipKicker: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  tipText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontStyle: "italic",
    lineHeight: 22,
  },
  tasksSection: {
    gap: SPACING.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  emptyTaskCard: {
    padding: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
  },
  emptyTaskTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  emptyTaskDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  taskList: {
    gap: SPACING.sm,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  taskItemCompleted: {
    opacity: 0.6,
  },
  taskCheck: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: COLORS.textMuted,
  },
  taskDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  xpBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryDim,
  },
  xpBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 10,
  },
});
