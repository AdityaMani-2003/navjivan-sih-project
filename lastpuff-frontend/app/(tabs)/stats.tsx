import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AuthContext } from '../../context/AuthContext';
import { fetchDashboardAnalytics } from '../../services/api';
import SkeletonLoader from '../../components/SkeletonLoader';
import ErrorBanner from '../../components/ErrorBanner';

const { width } = Dimensions.get('window');

interface WeeklyDay {
  day: string;
  date: string;
  cigarettesAvoided: number;
  moneySaved: number;
  cravingsHandled: number;
  goalsCompleted: number;
  isToday?: boolean;
}

interface AnalyticsData {
  weeklyData: WeeklyDay[];
  monthly: {
    cigarettesAvoided: number;
    moneySaved: number;
    cravingsHandled: number;
    goalsCompleted: number;
  };
  allTime: {
    streak: number;
    totalCigarettesAvoided: number;
    totalMoneySaved: number;
    totalCravingsHandled?: number;
    healthScorePercent: number;
  };
}

export default function StatsScreen() {
  const { user } = useContext(AuthContext);
  const userName = user?.name || 'Champion';

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setError(null);
      const res = await fetchDashboardAnalytics();
      if (res?.data) {
        setAnalytics(res.data);
      }
    } catch (err: any) {
      console.log('Analytics load error:', err);
      setError(err?.response?.data?.message || 'Unable to fetch analytics. Please retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };

  // Compute chart max height & tallest day
  const weekly = analytics?.weeklyData || [];
  const maxCigsAvoided = Math.max(1, ...weekly.map((w) => w.cigarettesAvoided));
  const tallestIndex = weekly.findIndex((w) => w.cigarettesAvoided === maxCigsAvoided);

  // Today's stats from weekly data
  const todayEntry = weekly.find((w) => w.isToday) || weekly[weekly.length - 1];
  const cigsToday = todayEntry?.cigarettesAvoided || 0;
  const moneyToday = todayEntry?.moneySaved || 0;
  const cravingsToday = todayEntry?.cravingsHandled || 0;

  const monthly = analytics?.monthly || {
    cigarettesAvoided: 0,
    moneySaved: 0,
    cravingsHandled: 0,
    goalsCompleted: 0,
  };

  const allTime = analytics?.allTime || {
    streak: user?.streak || 0,
    totalCigarettesAvoided: 0,
    totalMoneySaved: 0,
    healthScorePercent: 0,
  };

  // Calculate dynamic health scores
  const healthScore = allTime.healthScorePercent || Math.min(100, (allTime.streak * 2 + allTime.totalCigarettesAvoided * 3));
  const lungCapacityBoost = Math.min(35, Math.round(allTime.streak * 1.2 + 5));
  const cancerRiskReduction = (Math.min(15, allTime.streak * 0.4 + 0.5)).toFixed(1);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics & Health</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={onRefresh} style={styles.headerIconBtn}>
            <Ionicons name="refresh" size={22} color="#39FF14" />
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
        {error && <ErrorBanner message={error} onRetry={loadAnalytics} />}

        {loading && !analytics ? (
          <View style={styles.skeletonContainer}>
            <SkeletonLoader height={140} borderRadius={16} style={{ marginBottom: 16 }} />
            <SkeletonLoader height={200} borderRadius={16} style={{ marginBottom: 16 }} />
            <SkeletonLoader height={120} borderRadius={16} style={{ marginBottom: 16 }} />
          </View>
        ) : (
          <>
            {/* Performance Highlights */}
            <View style={styles.performanceContainer}>
              <Text style={styles.performanceTitle}>
                {userName}, here's your performance today
              </Text>

              <View style={styles.highlightCard}>
                <Text style={styles.highlightIcon}>🚭</Text>
                <Text style={styles.highlightText}>
                  You avoided <Text style={styles.highlightBold}>{cigsToday}</Text> cigarettes today
                </Text>
              </View>

              <View style={styles.highlightCard}>
                <Text style={styles.highlightIcon}>💰</Text>
                <Text style={styles.highlightText}>
                  You saved <Text style={styles.highlightBold}>₹{moneyToday}</Text> today
                </Text>
              </View>

              <View style={styles.highlightCard}>
                <Text style={styles.highlightIcon}>🔥</Text>
                <Text style={styles.highlightText}>
                  You handled <Text style={styles.highlightBold}>{cravingsToday}</Text> cravings successfully
                </Text>
              </View>

              <View style={styles.highlightCard}>
                <Text style={styles.highlightIcon}>🏆</Text>
                <Text style={styles.highlightText}>
                  Current streak: <Text style={styles.highlightBold}>{allTime.streak} days</Text>
                </Text>
              </View>
            </View>

            {/* Weekly Progress Chart */}
            <View style={styles.weeklySection}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Weekly Avoided Cigarettes</Text>
                  <Text style={styles.sectionSub}>Past 7 days progress</Text>
                </View>
                <Ionicons name="bar-chart" size={22} color="#39FF14" />
              </View>

              {weekly.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyEmoji}>🌱</Text>
                  <Text style={styles.emptyTitle}>Start your journey today!</Text>
                  <Text style={styles.emptySubtitle}>Log your first smoke-free moment on the home screen.</Text>
                </View>
              ) : (
                <View style={styles.chartContainer}>
                  {weekly.map((item, index) => {
                    // Normalize bar height between 15% and 100% of max container height
                    const ratio = maxCigsAvoided > 0 ? item.cigarettesAvoided / maxCigsAvoided : 0;
                    const barHeight = Math.max(12, Math.round(ratio * 90));
                    const isToday = item.isToday || index === weekly.length - 1;
                    const isTallest = index === tallestIndex && item.cigarettesAvoided > 0;

                    return (
                      <View key={index} style={styles.chartItem}>
                        <Text style={styles.barValueText}>
                          {item.cigarettesAvoided > 0 ? item.cigarettesAvoided : ''}
                        </Text>
                        <View style={styles.chartBarContainer}>
                          <View
                            style={[
                              styles.chartBar,
                              { height: barHeight },
                              isToday
                                ? styles.chartBarToday
                                : styles.chartBarNormal,
                              isTallest && styles.chartBarTallest,
                            ]}
                          />
                        </View>
                        <Text
                          style={[
                            styles.chartLabel,
                            isToday && styles.chartLabelToday,
                          ]}
                        >
                          {item.day}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Monthly Insights */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Monthly Insights (30 Days)</Text>
                <Ionicons name="calendar-outline" size={20} color="#39FF14" />
              </View>
              <View style={styles.insightsGrid}>
                <View style={styles.insightCard}>
                  <Text style={styles.insightLabel}>Cigarettes Avoided</Text>
                  <Text style={styles.insightValue}>{monthly.cigarettesAvoided}</Text>
                </View>
                <View style={styles.insightCard}>
                  <Text style={styles.insightLabel}>Cravings Handled</Text>
                  <Text style={styles.insightValue}>{monthly.cravingsHandled}</Text>
                </View>
                <View style={styles.insightCard}>
                  <Text style={styles.insightLabel}>Goals Completed</Text>
                  <Text style={styles.insightValue}>{monthly.goalsCompleted}</Text>
                </View>
              </View>
            </View>

            {/* Finance Card */}
            <View style={styles.financeSection}>
              <View style={styles.financeHeader}>
                <View style={styles.walletIcon}>
                  <Ionicons name="wallet" size={24} color="#000000" />
                </View>
                <View style={styles.financeText}>
                  <Text style={styles.financeLabel}>Total Money Saved</Text>
                  <Text style={styles.financeValue}>₹{allTime.totalMoneySaved.toLocaleString()} Saved</Text>
                  <Text style={styles.financeSub}>Monthly pace: ₹{monthly.moneySaved.toLocaleString()}</Text>
                </View>
              </View>
            </View>

            {/* Health Score & Biological Improvements */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Biological Recovery</Text>
                <View style={styles.healthScoreBadge}>
                  <Text style={styles.healthScoreText}>Health Score: {healthScore}%</Text>
                </View>
              </View>
              <View style={styles.healthGrid}>
                <View style={styles.healthCard}>
                  <Ionicons name="fitness-outline" size={24} color="#39FF14" />
                  <Text style={styles.healthLabel}>Lung Capacity</Text>
                  <Text style={styles.healthValue}>+{lungCapacityBoost}%</Text>
                </View>
                <View style={styles.healthCard}>
                  <Ionicons name="heart-outline" size={24} color="#39FF14" />
                  <Text style={styles.healthLabel}>Cancer Risk</Text>
                  <Text style={styles.healthValue}>-{cancerRiskReduction}%</Text>
                </View>
                <View style={styles.healthCard}>
                  <Ionicons name="pulse-outline" size={24} color="#39FF14" />
                  <Text style={styles.healthLabel}>Pulse Rate</Text>
                  <Text style={styles.healthValue}>Optimized</Text>
                </View>
              </View>
            </View>

            {/* Milestones & Badges */}
            <View style={[styles.section, { marginBottom: 40 }]}>
              <Text style={styles.sectionTitle}>Streak Badges Earned</Text>
              <View style={styles.rewardsGrid}>
                <View style={[styles.rewardCard, allTime.streak >= 3 && styles.rewardCardActive]}>
                  <Ionicons name="medal" size={28} color={allTime.streak >= 3 ? '#39FF14' : '#555'} />
                  <Text style={styles.rewardLabel}>3-Day Spark</Text>
                  <Text style={styles.rewardSubLabel}>{allTime.streak >= 3 ? 'Unlocked' : 'Locked'}</Text>
                </View>
                <View style={[styles.rewardCard, allTime.streak >= 7 && styles.rewardCardActive]}>
                  <Ionicons name="shield-checkmark" size={28} color={allTime.streak >= 7 ? '#39FF14' : '#555'} />
                  <Text style={styles.rewardLabel}>7-Day Clean</Text>
                  <Text style={styles.rewardSubLabel}>{allTime.streak >= 7 ? 'Unlocked' : 'Locked'}</Text>
                </View>
                <View style={[styles.rewardCard, allTime.streak >= 14 && styles.rewardCardActive]}>
                  <Ionicons name="trophy" size={28} color={allTime.streak >= 14 ? '#39FF14' : '#555'} />
                  <Text style={styles.rewardLabel}>14-Day Pro</Text>
                  <Text style={styles.rewardSubLabel}>{allTime.streak >= 14 ? 'Unlocked' : 'Locked'}</Text>
                </View>
              </View>
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
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#161616',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    padding: 6,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  skeletonContainer: {
    paddingTop: 16,
  },
  section: {
    marginBottom: 20,
  },
  performanceContainer: {
    backgroundColor: '#121212',
    borderColor: '#1E1E1E',
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
    marginBottom: 20,
  },
  performanceTitle: {
    fontSize: 16,
    color: '#39FF14',
    marginBottom: 16,
    fontWeight: '700',
  },
  highlightCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#222222',
  },
  highlightIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  highlightText: {
    fontSize: 14,
    color: '#CCCCCC',
    flex: 1,
  },
  highlightBold: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  weeklySection: {
    backgroundColor: '#121212',
    borderColor: '#1E1E1E',
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionSub: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 130,
    paddingTop: 10,
  },
  chartItem: {
    flex: 1,
    alignItems: 'center',
  },
  barValueText: {
    color: '#39FF14',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    height: 14,
  },
  chartBarContainer: {
    height: 90,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartBar: {
    width: 14,
    borderRadius: 7,
  },
  chartBarNormal: {
    backgroundColor: '#2A2A2A',
  },
  chartBarToday: {
    backgroundColor: '#39FF14',
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  chartBarTallest: {
    borderColor: '#FFFFFF',
    borderWidth: 1,
  },
  chartLabel: {
    fontSize: 12,
    color: '#888888',
    marginTop: 8,
  },
  chartLabelToday: {
    color: '#39FF14',
    fontWeight: '700',
  },
  insightsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  insightCard: {
    flex: 1,
    backgroundColor: '#121212',
    borderColor: '#1E1E1E',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  insightLabel: {
    fontSize: 11,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 6,
  },
  insightValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  financeSection: {
    backgroundColor: '#121212',
    borderColor: '#1E1E1E',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  financeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  walletIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#39FF14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  financeText: {
    flex: 1,
  },
  financeLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 2,
  },
  financeValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  financeSub: {
    fontSize: 12,
    color: '#39FF14',
    marginTop: 2,
    fontWeight: '600',
  },
  healthScoreBadge: {
    backgroundColor: 'rgba(57, 255, 20, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#39FF14',
  },
  healthScoreText: {
    color: '#39FF14',
    fontSize: 12,
    fontWeight: '700',
  },
  healthGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  healthCard: {
    flex: 1,
    backgroundColor: '#121212',
    borderColor: '#1E1E1E',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  healthLabel: {
    fontSize: 11,
    color: '#888888',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  healthValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#39FF14',
  },
  rewardsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  rewardCard: {
    flex: 1,
    backgroundColor: '#121212',
    borderColor: '#1E1E1E',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    opacity: 0.6,
  },
  rewardCardActive: {
    opacity: 1,
    borderColor: '#39FF14',
    backgroundColor: '#151C14',
  },
  rewardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 6,
    textAlign: 'center',
  },
  rewardSubLabel: {
    fontSize: 11,
    color: '#888888',
    marginTop: 2,
  },
  emptyStateContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: '#888888',
    fontSize: 13,
    textAlign: 'center',
  },
});