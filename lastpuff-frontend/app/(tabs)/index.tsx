import React, { useState, useEffect, useCallback } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import ConfettiCannon from 'react-native-confetti-cannon';

import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import LiveTimerTicker from '../../components/ui/LiveTimerTicker';
import ConcentricRings from '../../components/ui/ConcentricRings';
import QuickActionDock from '../../components/ui/QuickActionDock';
import Badge from '../../components/ui/Badge';
import {
  fetchDashboardSummary,
  fetchAiInsight,
  earnXPAction,
} from '../../services/api';

const { width } = Dimensions.get('window');

interface DailyQuest {
  id: string;
  title: string;
  category: string;
  xp: number;
  isCompleted: boolean;
  icon: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { userType, profile } = useUser();

  const userName = user?.name || 'Friend';
  const isSmoker = userType !== 'non-smoker';

  // Live state
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [streak, setStreak] = useState((profile as any)?.streak || 3);
  const [userXP, setUserXP] = useState(520);
  const [showConfetti, setShowConfetti] = useState(false);
  const [aiInsight, setAiInsight] = useState(
    isSmoker
      ? 'Your blood oxygenation is 98% restored! Cravings today are purely mental habit loops. Outlast them with 3 deep breaths.'
      : 'Optimal athletic recovery window active. Ensure 25g post-workout protein and 3L hydration for muscle repair.'
  );

  // Quick Action state
  const [waterGlasses, setWaterGlasses] = useState(5);
  const [stepsToday, setStepsToday] = useState(6450);
  const [cravingsResistedToday, setCravingsResistedToday] = useState(4);

  // Daily AI Missions
  const [quests, setQuests] = useState<DailyQuest[]>([
    {
      id: 'q1',
      title: isSmoker ? 'Resist 3 PM Chai Craving' : 'Complete 30-Min Cardio Split',
      category: isSmoker ? 'Recovery' : 'Workout',
      xp: 50,
      isCompleted: false,
      icon: isSmoker ? 'shield-checkmark' : 'barbell',
    },
    {
      id: 'q2',
      title: 'Walk 7,500 Steps on Padyatra Trail',
      category: 'Endurance',
      xp: 40,
      isCompleted: false,
      icon: 'footsteps',
    },
    {
      id: 'q3',
      title: 'Drink 2.5 Liters of Pure Water',
      category: 'Hydration',
      xp: 30,
      isCompleted: true,
      icon: 'water',
    },
  ]);

  const loadData = useCallback(async () => {
    try {
      const [dashRes, aiRes] = await Promise.allSettled([
        fetchDashboardSummary(),
        fetchAiInsight(),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data) {
        const d = dashRes.value.data;
        if (d.streak) setStreak(d.streak);
        if (d.xp) setUserXP(d.xp);
      }
      if (aiRes.status === 'fulfilled' && aiRes.value?.data?.insight) {
        setAiInsight(aiRes.value.data.insight);
      }
    } catch (_err) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isSmoker]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleToggleQuest = async (questId: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_e) {}

    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          const nextCompleted = !q.isCompleted;
          if (nextCompleted) {
            setUserXP((x) => x + q.xp);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2500);
            Toast.show({
              type: 'success',
              text1: `Mission Completed! 🎉`,
              text2: `+${q.xp} XP added to your rank progress.`,
            });
            earnXPAction(q.xp, 'quest_completed', { questId });
          }
          return { ...q, isCompleted: nextCompleted };
        }
        return q;
      })
    );
  };

  const handleAddWater = () => {
    setWaterGlasses((w) => w + 1);
    setUserXP((x) => x + 10);
    earnXPAction(10, 'water_logged');
  };

  const handleAddSteps = () => {
    setStepsToday((s) => s + 500);
    setUserXP((x) => x + 15);
    earnXPAction(15, 'steps_added');
  };

  const handleResistCraving = () => {
    setCravingsResistedToday((c) => c + 1);
    setUserXP((x) => x + 50);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
    earnXPAction(50, 'craving_resisted_dashboard');
  };

  const handleRegenerateInsight = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setAiInsight('🧠 Consulting Gemini AI Coach...');
      const res = await fetchAiInsight();
      if (res?.data?.insight) {
        setAiInsight(res.data.insight);
      } else {
        setAiInsight(
          isSmoker
            ? 'Cravings peak at minute 3 and completely dissolve by minute 6. Breathe slowly through pursed lips!'
            : 'Focus on explosive hip drive today. High-quality reps trump volume every time!'
        );
      }
    } catch (_e) {
      setAiInsight(
        isSmoker
          ? 'Cravings peak at minute 3 and completely dissolve by minute 6. Breathe slowly through pursed lips!'
          : 'Focus on explosive hip drive today. High-quality reps trump volume every time!'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {showConfetti && (
        <ConfettiCannon
          count={60}
          origin={{ x: width / 2, y: 0 }}
          autoStart={true}
          fadeOut={true}
        />
      )}

      {/* Top App Header */}
      <View style={styles.topHeader}>
        <View style={styles.userProfileRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText} numberOfLines={1}>
              Namaste, {userName.split(' ')[0]} 👋
            </Text>
            <Text style={styles.userRoleTag} numberOfLines={1}>
              {isSmoker ? 'Smoke-Free Vanguard' : 'Athlete & Fitness Pioneer'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRightBadges}>
          {/* Live Streak Pill */}
          <View style={styles.streakPill}>
            <Text style={{ fontSize: 13 }}>🔥</Text>
            <Text style={styles.streakNumber}>{streak}d</Text>
          </View>
          {/* XP Pill */}
          <TouchableOpacity
            style={styles.xpPill}
            onPress={() => router.push('/rewards/index' as any)}
            activeOpacity={0.75}
          >
            <FontAwesome5 name="coins" size={12} color={COLORS.accent} />
            <Text style={styles.xpText}>{userXP}</Text>
          </TouchableOpacity>
        </View>
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
        {/* HERO WIDGET: SMOKER (Live Time & Rupee Ticker) vs NON-SMOKER (Concentric Rings) */}
        {isSmoker ? (
          <LiveTimerTicker
            cigsPerDay={profile?.smokerProfile?.cigarettesPerDay || 12}
            costPerPack={360}
          />
        ) : (
          <GlassCard style={styles.concentricCard} gradientBorder>
            <View style={styles.concentricHeader}>
              <View style={styles.concentricBadge}>
                <Ionicons name="sparkles" size={14} color={COLORS.secondary} />
                <Text style={styles.concentricBadgeText}>TODAY'S ATHLETIC RINGS</Text>
              </View>
              <Text style={styles.concentricCalories}>520 kcal</Text>
            </View>
            <ConcentricRings
              size={180}
              ring1Progress={stepsToday / 10000}
              ring2Progress={0.75}
              ring3Progress={waterGlasses / 8}
              ring1Label={`${stepsToday} Steps`}
              ring2Label="45m Cardio"
              ring3Label={`${(waterGlasses * 0.25).toFixed(1)}L Hydration`}
              scoreText="88"
              scoreSub="PERFORMANCE"
            />
          </GlassCard>
        )}

        {/* FLOATING QUICK-ACTION DOCK */}
        <QuickActionDock
          isSmoker={isSmoker}
          onAddWater={handleAddWater}
          onAddSteps={handleAddSteps}
          onResistCraving={handleResistCraving}
        />

        {/* AI COACH INTELLIGENCE CARD */}
        <GlassCard style={styles.aiInsightCard} gradientBorder>
          <View style={styles.aiInsightHeader}>
            <View style={styles.aiInsightTitleBox}>
              <View style={[styles.aiIconCircle, { backgroundColor: COLORS.primaryGlow }]}>
                <MaterialCommunityIcons name="robot" size={18} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.aiInsightHeading}>Gemini AI Health Copilot</Text>
                <Text style={styles.aiInsightSub}>Real-time personalized coaching</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.regenerateBtn}
              onPress={handleRegenerateInsight}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={14} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.aiInsightBody}>"{aiInsight}"</Text>
          <TouchableOpacity
            style={styles.chatPromptBar}
            onPress={() => router.push('/chatbot' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.chatPromptText}>Ask AI anything about cravings, workouts, diet...</Text>
            <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </GlassCard>

        {/* TODAY'S AI MISSIONS & QUESTS */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Today's AI Missions</Text>
            <Text style={styles.sectionSub}>Complete daily quests for XP & brand rewards</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/goals' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View All →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.questsList}>
          {quests.map((q) => (
            <TouchableOpacity
              key={q.id}
              activeOpacity={0.85}
              onPress={() => handleToggleQuest(q.id)}
            >
              <GlassCard
                style={{
                  ...styles.questCard,
                  ...(q.isCompleted ? styles.questCardCompleted : {}),
                }}
              >
                <View style={styles.questContentRow}>
                  <View
                    style={[
                      styles.questCheckbox,
                      q.isCompleted && styles.questCheckboxActive,
                    ]}
                  >
                    {q.isCompleted && (
                      <Ionicons name="checkmark" size={16} color={COLORS.bg} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.questTitle,
                        q.isCompleted && styles.questTitleDone,
                      ]}
                    >
                      {q.title}
                    </Text>
                    <Text style={styles.questCategory}>{q.category}</Text>
                  </View>
                  <Badge
                    text={`+${q.xp} XP`}
                    variant={q.isCompleted ? 'success' : 'muted'}
                    size="sm"
                  />
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* SPECIALIZED ROUTE LAUNCHERS */}
        <View style={styles.featureGrid}>
          {isSmoker ? (
            <>
              <TouchableOpacity
                style={styles.featureGridCard}
                onPress={() => router.push('/quit-plan' as any)}
                activeOpacity={0.8}
              >
                <GlassCard style={{ padding: SPACING.md }}>
                  <View style={[styles.gridIconCircle, { backgroundColor: COLORS.primaryGlow }]}>
                    <Ionicons name="calendar" size={22} color={COLORS.primary} />
                  </View>
                  <Text style={styles.gridCardTitle}>30-Day Stepdown Plan</Text>
                  <Text style={styles.gridCardSub}>Daily cigarette caps & AI milestones</Text>
                </GlassCard>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.featureGridCard}
                onPress={() => router.push('/disease-risk' as any)}
                activeOpacity={0.8}
              >
                <GlassCard style={{ padding: SPACING.md }}>
                  <View style={[styles.gridIconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.18)' }]}>
                    <Ionicons name="heart-half" size={22} color={COLORS.danger} />
                  </View>
                  <Text style={styles.gridCardTitle}>Disease Risk Radar</Text>
                  <Text style={styles.gridCardSub}>Organ recovery & pack-years analysis</Text>
                </GlassCard>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.featureGridCard}
                onPress={() => router.push('/padyatra' as any)}
                activeOpacity={0.8}
              >
                <GlassCard style={{ padding: SPACING.md }}>
                  <View style={[styles.gridIconCircle, { backgroundColor: COLORS.secondaryGlow }]}>
                    <FontAwesome5 name="hiking" size={20} color={COLORS.secondary} />
                  </View>
                  <Text style={styles.gridCardTitle}>Padyatra Pilgrimage</Text>
                  <Text style={styles.gridCardSub}>Walk Dandi March & Char Dham</Text>
                </GlassCard>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.featureGridCard}
                onPress={() => router.push('/nutrition' as any)}
                activeOpacity={0.8}
              >
                <GlassCard style={{ padding: SPACING.md }}>
                  <View style={[styles.gridIconCircle, { backgroundColor: 'rgba(14, 165, 233, 0.18)' }]}>
                    <Ionicons name="nutrition" size={22} color="#38BDF8" />
                  </View>
                  <Text style={styles.gridCardTitle}>AI Meal & Macro Scanner</Text>
                  <Text style={styles.gridCardSub}>Camera photo & calorie analysis</Text>
                </GlassCard>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* RED 24/7 SOS CRAVING SHIELD BANNER */}
        {isSmoker && (
          <TouchableOpacity
            style={styles.sosBanner}
            onPress={() => router.push('/sos' as any)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={COLORS.gradientDanger}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sosBannerGradient}
            >
              <View style={styles.sosBannerLeft}>
                <View style={styles.sosPulsingDot} />
                <View>
                  <Text style={styles.sosBannerTitle}>24/7 Emergency Craving Shield</Text>
                  <Text style={styles.sosBannerSub}>4-7-8 Breathing, Panic Games, Guardian SMS</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  userProfileRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginRight: SPACING.xs,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryGlow,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: COLORS.primary,
    fontWeight: '900',
    fontSize: 16,
  },
  greetingText: {
    ...TYPOGRAPHY.heading3,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  userRoleTag: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  headerRightBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  streakNumber: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 12,
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  xpText: {
    color: COLORS.accent,
    fontWeight: '900',
    fontSize: 12,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 60,
  },
  concentricCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  concentricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  concentricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  concentricBadgeText: {
    color: COLORS.secondary,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  concentricCalories: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 13,
  },
  aiInsightCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  aiInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  aiInsightTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  aiIconCircle: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiInsightHeading: {
    ...TYPOGRAPHY.heading3,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  aiInsightSub: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  regenerateBtn: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiInsightBody: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: SPACING.sm + 4,
  },
  chatPromptBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.xs + 4,
    paddingHorizontal: SPACING.md,
  },
  chatPromptText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.textPrimary,
  },
  sectionSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  viewAllText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  questsList: {
    gap: SPACING.xs + 4,
    marginBottom: SPACING.lg,
  },
  questCard: {
    padding: SPACING.sm + 4,
    backgroundColor: '#0E0E17',
  },
  questCardCompleted: {
    opacity: 0.6,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  questContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm + 2,
  },
  questCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questCheckboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  questTitle: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  questTitleDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  questCategory: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  featureGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  featureGridCard: {
    flex: 1,
  },
  gridIconCircle: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs + 2,
  },
  gridCardTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 13,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  gridCardSub: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textMuted,
    lineHeight: 14,
  },
  sosBanner: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.xs,
  },
  sosBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  sosBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sosPulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFF',
  },
  sosBannerTitle: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
  sosBannerSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    marginTop: 2,
  },
});
