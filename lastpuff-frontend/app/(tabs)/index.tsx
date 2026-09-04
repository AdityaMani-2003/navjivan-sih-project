import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import ConfettiCannon from 'react-native-confetti-cannon';

import Shine from '../../components/Shine';
import SkeletonLoader from '../../components/SkeletonLoader';
import { AuthContext } from '../../context/AuthContext';
import {
  fetchDashboardSummary,
  updateDailyStats,
  fetchAiInsight,
} from '../../services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const userName = user?.name || 'Friend';

  const [dashboard, setDashboard] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // AI Insight state
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(true);
  const [refreshingAi, setRefreshingAi] = useState(false);

  // Confetti ref
  const confettiRef = useRef<any>(null);

  // Pulsing flame animation for streak
  const flameScale = useSharedValue(1);

  useEffect(() => {
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.22, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedFlameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  // Load Dashboard
  const loadDashboard = useCallback(async () => {
    try {
      const res = await fetchDashboardSummary();
      if (res?.data) {
        setDashboard(res.data);
      }
    } catch (err) {
      console.log('Failed to load dashboard summary', err);
    } finally {
      setLoadingDashboard(false);
      setRefreshing(false);
    }
  }, []);

  // Load AI Insight
  const loadAi = useCallback(async (force = false) => {
    try {
      if (force) setRefreshingAi(true);
      else setLoadingAi(true);

      const res = await fetchAiInsight(force);
      if (res?.data?.insight) {
        setAiInsight(res.data.insight);
      }
    } catch (err) {
      console.log('Failed to load AI insight', err);
      // Fallback
      setAiInsight(
        'Every breath of fresh air heals your respiratory tract. Keep cold water nearby and celebrate every urge you overcome today!'
      );
    } finally {
      setLoadingAi(false);
      setRefreshingAi(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    loadAi();
  }, [loadDashboard, loadAi]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
    loadAi();
  };

  // Extract real numbers
  const todayStats = dashboard?.todayStats || dashboard?.today || {};
  const cigsToday = todayStats?.cigarettesAvoided ?? 0;
  const moneyToday = todayStats?.moneySaved ?? 0;
  const cravingsToday = todayStats?.cravingsHandled ?? 0;
  const goalsToday = todayStats?.goalsCompleted ?? 0;
  const streak = dashboard?.streak ?? user?.streak ?? 0;
  const puffCoins = dashboard?.puffCoins ?? user?.puffCoins ?? 0;
  const pricePerCig = dashboard?.pricePerCigarette || user?.pricePerCigarette || 10;

  // Optimistic handler: I Skipped a Cigarette
  const handleSkipCigarette = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    // 1. Fire celebratory confetti
    confettiRef.current?.start();

    // 2. Optimistic local update
    const newCigs = cigsToday + 1;
    const newMoney = moneyToday + pricePerCig;

    setDashboard((prev: any) => ({
      ...prev,
      todayStats: {
        ...(prev?.todayStats || {}),
        cigarettesAvoided: newCigs,
        moneySaved: newMoney,
      },
    }));

    Toast.show({
      type: 'success',
      text1: 'Cigarette avoided! 🚭',
      text2: `+₹${pricePerCig} saved. You chose health over smoke!`,
    });

    // 3. API sync
    try {
      await updateDailyStats({
        deltaCigarettesAvoided: 1,
        deltaMoneySaved: pricePerCig,
      });
    } catch (err) {
      console.error('Update stats error:', err);
    }
  };

  // Optimistic handler: I Handled a Craving
  const handleCravingHandled = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    // Optimistic local update
    const newCravings = cravingsToday + 1;
    setDashboard((prev: any) => ({
      ...prev,
      todayStats: {
        ...(prev?.todayStats || {}),
        cravingsHandled: newCravings,
      },
    }));

    Toast.show({
      type: 'success',
      text1: "You're stronger than the craving! 💪",
      text2: 'Nicotine had zero power over you today.',
    });

    // API sync
    try {
      await updateDailyStats({
        deltaCravingsHandled: 1,
      });
    } catch (err) {
      console.error('Update craving stats error:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Confetti Cannon */}
      <ConfettiCannon
        count={100}
        origin={{ x: width / 2, y: -20 }}
        fadeOut
        autoStart={false}
        ref={confettiRef}
        colors={['#39FF14', '#00F0FF', '#FFD700', '#FFFFFF']}
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Welcome back,</Text>
          <Text style={styles.headerTitle}>{userName}</Text>
        </View>

        <View style={styles.headerIcons}>
          {/* Golden PuffCoins Token Badge */}
          <TouchableOpacity
            style={styles.coinsBadge}
            onPress={() => router.push('/fitness')}
            activeOpacity={0.8}
          >
            <View style={styles.coinIconCircle}>
              <Ionicons name="sparkles" size={13} color="#000000" />
            </View>
            <Text style={styles.coinsText}>{puffCoins}</Text>
          </TouchableOpacity>

          {/* Notification Bell with activity badge */}
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => router.push('/(tabs)/explore')}
          >
            <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>

          {/* Profile Quick Link */}
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Ionicons name="person-circle-outline" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#39FF14"
            colors={['#39FF14']}
          />
        }
      >
        {/* Top Avoided Cigarettes Card */}
        <View style={styles.topStatsContainer}>
          <View style={styles.statsCard}>
            <View style={styles.statHeaderRow}>
              <Text style={styles.statsLabel}>CIGARETTES AVOIDED TODAY</Text>
              <View style={styles.cleanStatusBadge}>
                <Text style={styles.cleanStatusText}>SMOKE FREE</Text>
              </View>
            </View>

            <Text style={styles.statsValue}>
              {loadingDashboard ? '--' : cigsToday.toString().padStart(2, '0')}
            </Text>
            <Text style={styles.statsSubLabel}>Target: 0 cigarettes smoked</Text>

            {/* Money Saved Tag */}
            <View style={styles.moneySavedTab}>
              <Ionicons name="wallet" size={14} color="#000000" />
              <Text style={styles.moneySavedTabValue}>
                {loadingDashboard ? '₹--' : `₹${moneyToday} Saved`}
              </Text>
            </View>
          </View>
        </View>

        {/* LOG TODAY'S PROGRESS — Dual Action Buttons */}
        <View style={styles.actionSection}>
          <Text style={styles.actionSectionTitle}>Log Today's Progress</Text>
          <View style={styles.actionButtonsRow}>
            {/* Button 1: Skipped a Cigarette */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnGreen]}
              activeOpacity={0.8}
              onPress={handleSkipCigarette}
            >
              <View style={styles.actionBtnIconBox}>
                <Text style={{ fontSize: 22 }}>🚭</Text>
              </View>
              <View style={styles.actionBtnTextCol}>
                <Text style={styles.actionBtnTitle}>Skipped Cigarette</Text>
                <Text style={styles.actionBtnSub}>+1 Avoided • +₹{pricePerCig}</Text>
              </View>
              <Ionicons name="add-circle" size={24} color="#000000" />
            </TouchableOpacity>

            {/* Button 2: Handled a Craving */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnDark]}
              activeOpacity={0.8}
              onPress={handleCravingHandled}
            >
              <View style={styles.actionBtnIconBoxDark}>
                <Text style={{ fontSize: 22 }}>😤</Text>
              </View>
              <View style={styles.actionBtnTextCol}>
                <Text style={styles.actionBtnTitleDark}>Handled Craving</Text>
                <Text style={styles.actionBtnSubDark}>{cravingsToday} Survived Today</Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color="#39FF14" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Streak & Health Card with Pulsing Flame */}
        <View style={styles.streakHealthCard}>
          <View style={styles.streakSection}>
            <View style={styles.streakLeft}>
              <View style={styles.streakCircle}>
                <Svg width="74" height="74" style={styles.streakSvg}>
                  <Circle
                    cx="37"
                    cy="37"
                    r="32"
                    stroke="rgba(255, 255, 255, 0.12)"
                    strokeWidth="5"
                    fill="none"
                  />
                  <Circle
                    cx="37"
                    cy="37"
                    r="32"
                    stroke="#39FF14"
                    strokeWidth="5"
                    fill="none"
                    strokeDasharray={`${Math.min(201, ((streak % 30) / 30) * 201)} 201`}
                    strokeLinecap="round"
                  />
                </Svg>
                <Animated.View style={animatedFlameStyle}>
                  <Text style={styles.streakFlameIcon}>🔥</Text>
                </Animated.View>
              </View>
            </View>

            <View style={styles.streakRight}>
              <View>
                <Text style={styles.streakDaysCount}>
                  {loadingDashboard ? '--' : streak} Day Streak
                </Text>
                <Text style={styles.streakTitle}>Unstoppable Momentum</Text>
              </View>
              <Link href="/(tabs)/stats" asChild>
                <TouchableOpacity style={styles.viewAnalyticsBtn}>
                  <Text style={styles.viewAnalyticsText}>Analytics →</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Biological Impact Mini Metrics */}
          <View style={styles.healthImpactSection}>
            <View style={styles.healthMainCard}>
              <Ionicons name="heart" size={20} color="#39FF14" />
              <Text style={styles.healthMainLabel}>Cardiovascular Healing</Text>
            </View>

            <View style={styles.healthStatCard}>
              <Text style={styles.healthStatLabel}>Lung Airway</Text>
              <Text style={styles.healthStatValue}>+{Math.min(30, streak * 2 + 6)}%</Text>
            </View>

            <View style={styles.healthStatCard}>
              <Text style={styles.healthStatLabel}>CO Cleared</Text>
              <Text style={styles.healthStatValue}>99%</Text>
            </View>
          </View>
        </View>

        {/* 🤖 YOUR AI INSIGHT TODAY (Agentic Wellness Engine) */}
        <View style={styles.aiCardContainer}>
          <View style={styles.aiCardHeader}>
            <View style={styles.aiTitleRow}>
              <Text style={styles.aiBadgeIcon}>🤖</Text>
              <Text style={styles.aiHeading}>Your AI Insight Today</Text>
            </View>
            <TouchableOpacity
              onPress={() => loadAi(true)}
              disabled={refreshingAi}
              style={styles.refreshAiBtn}
            >
              <Ionicons
                name="refresh"
                size={16}
                color="#39FF14"
                style={refreshingAi ? { opacity: 0.5 } : {}}
              />
              <Text style={styles.refreshAiText}>
                {refreshingAi ? 'Thinking...' : 'Refresh'}
              </Text>
            </TouchableOpacity>
          </View>

          {loadingAi && !aiInsight ? (
            <SkeletonLoader height={60} borderRadius={10} />
          ) : (
            <Text style={styles.aiInsightText}>{aiInsight}</Text>
          )}

          <View style={styles.aiPoweredBadge}>
            <Text style={styles.aiPoweredText}>Agentic Coaching • Gemini 1.5 Flash</Text>
          </View>
        </View>

        {/* Goals Progress Card */}
        <View style={styles.goalsCard}>
          <View style={styles.goalsHeader}>
            <View>
              <Text style={styles.goalsTitle}>Daily Health Goals</Text>
              <Text style={styles.goalsSubtitle}>
                {loadingDashboard
                  ? 'Loading goals...'
                  : `${goalsToday} / 5 completed today`}
              </Text>
            </View>
            <Link href="/goals" asChild>
              <TouchableOpacity style={styles.manageGoalsBtn}>
                <Text style={styles.manageGoalsText}>Manage →</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Mini progress bar */}
          <View style={styles.goalTrack}>
            <View
              style={[
                styles.goalBar,
                { width: `${Math.min(100, (goalsToday / 5) * 100)}%` },
              ]}
            />
          </View>
        </View>

        {/* Quick Action Navigation Grid */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionHeading}>Recovery Hub</Text>
          <View style={styles.quickGrid}>
            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => router.push('/fitness')}
            >
              <View style={[styles.quickIconCircle, { backgroundColor: 'rgba(57, 255, 20, 0.15)' }]}>
                <Ionicons name="barbell-outline" size={24} color="#39FF14" />
              </View>
              <Text style={styles.quickCardTitle}>Fitness Plans</Text>
              <Text style={styles.quickCardSub}>Restore Lungs (+5 Coins)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => router.push('/sos')}
            >
              <View style={[styles.quickIconCircle, { backgroundColor: 'rgba(255, 59, 48, 0.15)' }]}>
                <Ionicons name="warning-outline" size={24} color="#FF3B30" />
              </View>
              <Text style={styles.quickCardTitle}>SOS Rescue</Text>
              <Text style={styles.quickCardSub}>Breathing & Dot Game</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SOS Panic Floating Banner */}
        <View style={styles.sosContainer}>
          <TouchableOpacity
            style={styles.sosBanner}
            onPress={() => router.push('/sos')}
            activeOpacity={0.85}
          >
            <View style={styles.sosPulseIcon}>
              <Ionicons name="shield" size={26} color="#000000" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sosTitle}>Feeling an intense craving?</Text>
              <Text style={styles.sosSub}>Tap for 1-minute box breathing or tap game</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* National Impact */}
        <View style={styles.nationalSection}>
          <Text style={styles.sectionHeading}>National Health Collective</Text>
          <View style={styles.nationalCardsContainer}>
            <Shine style={styles.nationalCard}>
              <Text style={styles.nationalLabel}>India avoided</Text>
              <Text style={styles.nationalValue}>1.2M</Text>
              <Text style={styles.nationalUnit}>cigarettes</Text>
            </Shine>
            <Shine style={styles.nationalCard}>
              <Text style={styles.nationalLabel}>CO₂ reduced</Text>
              <Text style={styles.nationalValue}>3.6K</Text>
              <Text style={styles.nationalUnit}>kg</Text>
            </Shine>
            <Shine style={styles.nationalCard}>
              <Text style={styles.nationalLabel}>Collective savings</Text>
              <Text style={styles.nationalValue}>₹42.5M</Text>
            </Shine>
          </View>
        </View>
      </ScrollView>

      {/* Floating Community Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/explore')}
      >
        <Ionicons name="chatbubbles" size={26} color="#000000" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#141414',
  },
  headerGreeting: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#FFD700',
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  coinIconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFA500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinsText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 13,
  },
  headerIconBtn: {
    padding: 4,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  topStatsContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  statsCard: {
    backgroundColor: '#121212',
    borderColor: '#1E1E1E',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 18,
    position: 'relative',
  },
  statHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statsLabel: {
    fontSize: 11,
    color: '#39FF14',
    fontWeight: '700',
    letterSpacing: 1,
  },
  cleanStatusBadge: {
    backgroundColor: 'rgba(57, 255, 20, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#39FF14',
  },
  cleanStatusText: {
    color: '#39FF14',
    fontSize: 10,
    fontWeight: '700',
  },
  statsValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
    marginBottom: 4,
  },
  statsSubLabel: {
    fontSize: 13,
    color: '#888888',
  },
  moneySavedTab: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    backgroundColor: '#39FF14',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  moneySavedTabValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },
  actionSection: {
    marginBottom: 20,
  },
  actionSectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  actionButtonsRow: {
    gap: 10,
  },
  actionBtn: {
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtnGreen: {
    backgroundColor: '#39FF14',
    shadowColor: '#39FF14',
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  actionBtnDark: {
    backgroundColor: '#141414',
    borderColor: '#262626',
    borderWidth: 1.5,
  },
  actionBtnIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnIconBoxDark: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnTextCol: {
    flex: 1,
  },
  actionBtnTitle: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
  },
  actionBtnSub: {
    color: 'rgba(0,0,0,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  actionBtnTitleDark: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  actionBtnSubDark: {
    color: '#888888',
    fontSize: 12,
  },
  streakHealthCard: {
    backgroundColor: '#121212',
    borderColor: '#1E1E1E',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  streakSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },
  streakLeft: {
    marginRight: 16,
  },
  streakCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakSvg: {
    position: 'absolute',
  },
  streakFlameIcon: {
    fontSize: 32,
  },
  streakRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakDaysCount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#39FF14',
    marginBottom: 2,
  },
  streakTitle: {
    fontSize: 13,
    color: '#CCCCCC',
  },
  viewAnalyticsBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#1C1C1C',
    borderRadius: 8,
  },
  viewAnalyticsText: {
    color: '#39FF14',
    fontSize: 12,
    fontWeight: '700',
  },
  healthImpactSection: {
    flexDirection: 'row',
    gap: 10,
  },
  healthMainCard: {
    flex: 1.2,
    backgroundColor: '#181818',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    gap: 6,
  },
  healthMainLabel: {
    color: '#CCCCCC',
    fontSize: 11,
    fontWeight: '600',
  },
  healthStatCard: {
    flex: 1,
    backgroundColor: '#181818',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthStatLabel: {
    color: '#888888',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 2,
  },
  healthStatValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  aiCardContainer: {
    backgroundColor: '#0F1A15',
    borderColor: '#39FF14',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#39FF14',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  aiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiBadgeIcon: {
    fontSize: 18,
  },
  aiHeading: {
    color: '#39FF14',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  refreshAiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(57, 255, 20, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  refreshAiText: {
    color: '#39FF14',
    fontSize: 11,
    fontWeight: '600',
  },
  aiInsightText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 10,
    fontWeight: '400',
  },
  aiPoweredBadge: {
    alignSelf: 'flex-start',
  },
  aiPoweredText: {
    color: '#666666',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  goalsCard: {
    backgroundColor: '#121212',
    borderColor: '#1E1E1E',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  goalsSubtitle: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
  },
  manageGoalsBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  manageGoalsText: {
    color: '#39FF14',
    fontSize: 13,
    fontWeight: '600',
  },
  goalTrack: {
    height: 6,
    backgroundColor: '#222222',
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalBar: {
    height: '100%',
    backgroundColor: '#39FF14',
    borderRadius: 3,
  },
  quickActionsSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#121212',
    borderColor: '#1E1E1E',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
  },
  quickIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickCardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  quickCardSub: {
    color: '#888888',
    fontSize: 11,
  },
  sosContainer: {
    marginBottom: 24,
  },
  sosBanner: {
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#FF3B30',
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  sosPulseIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosTitle: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
  },
  sosSub: {
    color: 'rgba(0,0,0,0.8)',
    fontSize: 11,
    fontWeight: '600',
  },
  nationalSection: {
    marginBottom: 80,
  },
  nationalCardsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  nationalCard: {
    flex: 1,
    backgroundColor: '#121212',
    borderColor: '#1E1E1E',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  nationalLabel: {
    color: '#888888',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 4,
  },
  nationalValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  nationalUnit: {
    color: '#888888',
    fontSize: 11,
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#39FF14',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
});
