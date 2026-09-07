import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import {
  AlertCircle,
  Bell,
  Check,
  Cigarette,
  Dumbbell,
  Flame,
  Footprints,
  Heart,
  MessageCircle,
  Phone,
  Sparkles,
  Wind,
  Zap,
} from "lucide-react-native";

import API from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { UserContext } from "../../context/UserContext";
import { COLORS, RADIUS, SHADOW, SPACING, TYPOGRAPHY } from "../../constants/theme";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import ProgressBar from "../../components/ui/ProgressBar";
import ProgressRing from "../../components/ui/ProgressRing";
import StatCard from "../../components/ui/StatCard";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";

const { width } = Dimensions.get("window");

const HEALTH_MILESTONES = [
  { time: "20 min", title: "Heart Rate", desc: "Pulse normalizes", doneDays: 0 },
  { time: "8 hr", title: "Carbon Monoxide", desc: "Blood levels halved", doneDays: 0 },
  { time: "24 hr", title: "Heart Attack Risk", desc: "Risk begins declining", doneDays: 1 },
  { time: "48 hr", title: "Nerve Endings", desc: "Taste & smell sharpen", doneDays: 2 },
  { time: "72 hr", title: "Lungs Relax", desc: "Bronchial cilia revive", doneDays: 3 },
  { time: "2 wks", title: "Circulation", desc: "Walking becomes effortless", doneDays: 14 },
  { time: "1 mo", title: "Vigor Peak", desc: "Sinus congestion clears", doneDays: 30 },
];

export default function HomeScreen() {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const userCtx = useContext(UserContext);

  const isSmoker = auth.userType !== "non-smoker";
  const userName = auth.user?.name || userCtx.profile?.name || "Friend";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    daysSmokeFree: 1,
    moneySaved: 180,
    cigsAvoided: 12,
    hoursLifeGained: 2,
    streak: 1,
    planDurationDays: 30,
    planName: "Navjivan Protocol",
  });
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [tasksRes, statsRes, communityRes] = await Promise.all([
        API.get("/api/v1/tasks/today").catch(() => ({ data: { data: [] } })),
        API.get("/api/v1/progress/stats").catch(() => ({ data: { data: {} } })),
        API.get("/api/v1/community/posts?limit=2").catch(() => ({ data: { posts: [] } })),
      ]);

      if (tasksRes.data?.data) {
        setTasks(tasksRes.data.data);
      }
      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      }
      if (communityRes.data?.posts) {
        setCommunityPosts(communityRes.data.posts.slice(0, 2));
      }
    } catch (err) {
      console.warn("Dashboard load warning:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleTaskToggle = async (taskId: string, currentStatus: string) => {
    if (currentStatus === "completed") return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: "completed" } : t))
    );

    try {
      const res = await API.put(`/api/v1/tasks/${taskId}/complete`);
      const xpAwarded = res.data?.data?.xpAwarded || 25;
      userCtx.addXP(xpAwarded);

      Toast.show({
        type: "success",
        text1: "🌟 Task Completed!",
        text2: `+${xpAwarded} XP earned for your dedication.`,
      });
    } catch (err) {
      console.error("Task completion failed:", err);
    }
  };

  const daysSmokeFree = stats?.daysSmokeFree || 1;
  const progressRatio = Math.min(1, daysSmokeFree / (stats?.planDurationDays || 30));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* 1. HEADER ROW */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetingTitle}>
              Good {new Date().getHours() < 12 ? "morning" : "afternoon"}, {userName.split(" ")[0]} 👋
            </Text>
            <Text style={styles.greetingSubtitle}>
              {isSmoker
                ? stats.planName || "30-Day Cessation Journey"
                : "Daily Wellness & Fitness Lab"}
            </Text>
          </View>

          <View style={styles.headerIcons}>
            <Pressable
              onPress={() => router.push("/chatbot" as any)}
              style={styles.chatBotIconBtn}
              accessibilityRole="button"
            >
              <Sparkles size={20} color={COLORS.primary} />
            </Pressable>
            <Pressable
              onPress={() => router.push("/(tabs)/profile" as any)}
              style={styles.avatarCircle}
              accessibilityRole="button"
            >
              <Text style={styles.avatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </Pressable>
          </View>
        </View>

        {loading && !refreshing ? (
          <View style={styles.skeletonWrapper}>
            <Skeleton height={140} borderRadius={RADIUS.lg} style={{ marginBottom: 20 }} />
            <Skeleton height={200} borderRadius={RADIUS.lg} />
          </View>
        ) : (
          <>
            {/* 2. HERO CARD */}
            {isSmoker ? (
              <Card accent="primary" style={styles.heroCard}>
                <View style={styles.heroRow}>
                  {/* Left Column: Days display */}
                  <View style={styles.heroLeftCol}>
                    <Text style={styles.heroDayNumber}>{daysSmokeFree}</Text>
                    <Text style={styles.heroDayLabel}>Days Smoke-Free</Text>
                  </View>

                  {/* Right Column: 3 Mini Stats */}
                  <View style={styles.heroRightCol}>
                    <View style={styles.miniStatItem}>
                      <Text style={[styles.miniStatValue, { color: COLORS.gold }]}>
                        ₹{stats.moneySaved || 180}
                      </Text>
                      <Text style={styles.miniStatLabel}>saved</Text>
                    </View>
                    <View style={styles.miniStatItem}>
                      <Text style={[styles.miniStatValue, { color: COLORS.primary }]}>
                        {stats.cigsAvoided || 12} cigs
                      </Text>
                      <Text style={styles.miniStatLabel}>avoided</Text>
                    </View>
                    <View style={styles.miniStatItem}>
                      <Text style={[styles.miniStatValue, { color: COLORS.success }]}>
                        +{stats.hoursLifeGained || 2}h
                      </Text>
                      <Text style={styles.miniStatLabel}>life gained</Text>
                    </View>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.heroProgressSection}>
                  <ProgressBar progress={progressRatio} height={6} />
                  <Text style={styles.heroProgressCaption}>
                    {daysSmokeFree} of {stats.planDurationDays || 30} days → Next milestone:{" "}
                    {daysSmokeFree < 7 ? "Week 1 Freedom" : "Monthly Legend"}
                  </Text>
                </View>
              </Card>
            ) : (
              <Card accent="secondary" style={styles.heroCard}>
                <View style={styles.fitnessHeroRow}>
                  <View style={styles.fitnessHeroLeft}>
                    <Text style={styles.fitnessWeekKicker}>WEEK 1 ACTIVE</Text>
                    <Text style={styles.fitnessActiveMins}>45 Mins</Text>
                    <Text style={styles.fitnessMinsLabel}>Weekly Training Volume</Text>
                    <Button
                      title="Today's Workout"
                      onPress={() => router.push("/fitness-plans" as any)}
                      variant="secondary"
                      size="sm"
                      style={{ marginTop: 12 }}
                    />
                  </View>
                  <View style={styles.fitnessHeroRight}>
                    <ProgressRing size={84} progress={0.65} color={COLORS.secondary}>
                      <Text style={styles.ringPercentText}>65%</Text>
                    </ProgressRing>
                  </View>
                </View>
              </Card>
            )}

            {/* 3. TODAY'S TASKS SECTION */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Today's Tasks</Text>
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>
                    {tasks.filter((t) => t.status === "completed").length}/{tasks.length} Done
                  </Text>
                </View>
              </View>

              {tasks.length === 0 || tasks.every((t) => t.status === "completed") ? (
                <EmptyState
                  icon={<Sparkles size={36} color={COLORS.primary} />}
                  title="All Done For Today!"
                  description="Outstanding dedication. Your daily neurological and physical recovery is well underway."
                />
              ) : (
                <View style={styles.taskList}>
                  {tasks.map((task) => {
                    const isDone = task.status === "completed";
                    return (
                      <Pressable
                        key={task._id}
                        onPress={() => handleTaskToggle(task._id, task.status)}
                        style={[styles.taskCard, isDone && styles.taskCardDone]}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: isDone }}
                      >
                        <View style={styles.taskIconCircle}>
                          {task.category === "fitness" ? (
                            <Dumbbell size={20} color={COLORS.secondary} />
                          ) : task.category === "mindfulness" ? (
                            <Wind size={20} color={COLORS.info} />
                          ) : (
                            <Flame size={20} color={COLORS.primary} />
                          )}
                        </View>

                        <View style={styles.taskTextContainer}>
                          <Text
                            style={[
                              styles.taskTitle,
                              isDone && styles.taskTitleDone,
                            ]}
                            numberOfLines={1}
                          >
                            {task.title}
                          </Text>
                          <Text style={styles.taskDuration}>
                            {task.duration || 5} mins • +{task.xpReward || 20} XP
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.checkboxCircle,
                            isDone && styles.checkboxCircleDone,
                          ]}
                        >
                          {isDone && <Check size={14} color={COLORS.textInverse} />}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {/* 4. QUICK ACTIONS ROW */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickActionsScroll}
              >
                {/* SOS */}
                <Pressable
                  onPress={() => router.push("/sos" as any)}
                  style={[styles.quickActionCard, { backgroundColor: COLORS.dangerDim }]}
                  accessibilityRole="button"
                >
                  <AlertCircle size={24} color={COLORS.danger} />
                  <Text style={[styles.quickActionLabel, { color: COLORS.danger }]}>
                    SOS 🆘
                  </Text>
                </Pressable>

                {/* Log Craving */}
                <Pressable
                  onPress={() => router.push("/sos" as any)}
                  style={styles.quickActionCard}
                  accessibilityRole="button"
                >
                  <Flame size={24} color={COLORS.warning} />
                  <Text style={styles.quickActionLabel}>Log Craving</Text>
                </Pressable>

                {/* Breathing */}
                <Pressable
                  onPress={() => router.push("/games/breathing" as any)}
                  style={styles.quickActionCard}
                  accessibilityRole="button"
                >
                  <Wind size={24} color={COLORS.info} />
                  <Text style={styles.quickActionLabel}>Breathing</Text>
                </Pressable>

                {/* Quitline */}
                <Pressable
                  onPress={() => Linking.openURL("tel:1800112356")}
                  style={styles.quickActionCard}
                  accessibilityRole="button"
                >
                  <Phone size={24} color={COLORS.success} />
                  <Text style={styles.quickActionLabel}>Quitline</Text>
                </Pressable>
              </ScrollView>
            </View>

            {/* 5. HEALTH TIMELINE */}
            {isSmoker && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recovery Timeline</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.timelineScroll}
                >
                  {HEALTH_MILESTONES.map((m, idx) => {
                    const isReached = daysSmokeFree >= m.doneDays;
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.timelineCard,
                          isReached && styles.timelineCardReached,
                        ]}
                      >
                        <Text
                          style={[
                            styles.timelineTime,
                            { color: isReached ? COLORS.primary : COLORS.textMuted },
                          ]}
                        >
                          {m.time} {isReached ? "✓" : "○"}
                        </Text>
                        <Text style={styles.timelineTitle} numberOfLines={1}>
                          {m.title}
                        </Text>
                        <Text style={styles.timelineDesc} numberOfLines={2}>
                          {m.desc}
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* 6. COMMUNITY PEEK */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Community Voices</Text>
                <Pressable onPress={() => router.push("/(tabs)/explore" as any)}>
                  <Text style={styles.seeAllText}>See All →</Text>
                </Pressable>
              </View>

              {communityPosts.length > 0 ? (
                <View style={styles.postsPeekList}>
                  {communityPosts.map((post) => (
                    <Card key={post._id} style={styles.postPeekCard}>
                      <View style={styles.postPeekHeader}>
                        <View style={styles.postAuthorCircle}>
                          <Text style={styles.postAuthorInitial}>
                            {(post.author?.name || "U").charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.postAuthorDetails}>
                          <Text style={styles.postAuthorName}>
                            {post.author?.name || "Pioneer"}
                          </Text>
                          <Text style={styles.postUserBadge}>
                            {post.author?.userType || "Member"}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.postPeekText} numberOfLines={2}>
                        {post.content || "Taking it one day at a time. The breathwork works!"}
                      </Text>
                    </Card>
                  ))}
                </View>
              ) : (
                <Card style={styles.postPeekCard}>
                  <Text style={styles.postPeekText}>
                    Join 12,000+ pioneers breaking free and sharing recovery victories.
                  </Text>
                </Card>
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
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 56,
    marginBottom: 20,
  },
  greetingTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  greetingSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  chatBotIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceRaised,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryDim,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
    fontWeight: "700",
  },
  skeletonWrapper: {
    paddingVertical: 10,
  },
  heroCard: {
    marginBottom: 28,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  heroLeftCol: {
    flex: 1,
  },
  heroDayNumber: {
    fontSize: 48,
    fontWeight: "800",
    color: COLORS.primary,
    lineHeight: 52,
  },
  heroDayLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroRightCol: {
    alignItems: "flex-end",
    gap: 6,
  },
  miniStatItem: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  miniStatValue: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: "700",
  },
  miniStatLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  heroProgressSection: {
    gap: 8,
  },
  heroProgressCaption: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  fitnessHeroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fitnessHeroLeft: {
    flex: 1,
  },
  fitnessWeekKicker: {
    ...TYPOGRAPHY.label,
    color: COLORS.secondaryLight,
  },
  fitnessActiveMins: {
    ...TYPOGRAPHY.display,
    color: COLORS.textPrimary,
    fontSize: 36,
    lineHeight: 44,
  },
  fitnessMinsLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  fitnessHeroRight: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringPercentText: {
    ...TYPOGRAPHY.label,
    color: COLORS.textPrimary,
    fontWeight: "700",
  },
  section: {
    marginBottom: 28,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  badgePill: {
    backgroundColor: COLORS.surfaceRaised,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgePillText: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
  },
  taskList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOW.sm,
  },
  taskCardDone: {
    opacity: 0.6,
  },
  taskIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  taskTitleDone: {
    textDecorationLine: "line-through",
    color: COLORS.textMuted,
  },
  taskDuration: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  checkboxCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  checkboxCircleDone: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickActionsScroll: {
    gap: 12,
    paddingVertical: 4,
  },
  quickActionCard: {
    width: 76,
    height: 76,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    ...SHADOW.sm,
  },
  quickActionLabel: {
    ...TYPOGRAPHY.label,
    fontSize: 11,
    marginTop: 6,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  timelineScroll: {
    gap: 12,
    paddingVertical: 4,
  },
  timelineCard: {
    width: 120,
    height: 96,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    justifyContent: "space-between",
  },
  timelineCardReached: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  timelineTime: {
    ...TYPOGRAPHY.label,
    fontWeight: "700",
  },
  timelineTitle: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  timelineDesc: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 14,
  },
  seeAllText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryLight,
    fontWeight: "600",
  },
  postsPeekList: {
    gap: 12,
  },
  postPeekCard: {
    padding: 14,
  },
  postPeekHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  postAuthorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  postAuthorInitial: {
    ...TYPOGRAPHY.label,
    color: COLORS.textPrimary,
  },
  postAuthorDetails: {
    flex: 1,
  },
  postAuthorName: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  postUserBadge: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
    textTransform: "capitalize",
  },
  postPeekText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
