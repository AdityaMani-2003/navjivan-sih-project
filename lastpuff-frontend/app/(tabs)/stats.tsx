import React, { useEffect, useState, useCallback } from 'react';
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
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { fetchDashboardAnalytics } from '../../services/api';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import Badge from '../../components/ui/Badge';
import ProgressRing from '../../components/ui/ProgressRing';
import SectionHeader from '../../components/ui/SectionHeader';

const { width } = Dimensions.get('window');

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function StatsScreen() {
  const { user } = useAuth();
  const { userType } = useUser();
  const isSmoker = userType !== 'non-smoker';

  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetchDashboardAnalytics();
      if (res?.data) {
        setAnalytics(res.data);
      }
    } catch (_err) {
      // Fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Smoker Stats
  const streak = analytics?.allTime?.streak || user?.streak || 4;
  const moneySaved = analytics?.allTime?.totalMoneySaved || 600;
  const cigsAvoided = analytics?.allTime?.totalCigarettesAvoided || 48;
  const cravingsHandled = analytics?.allTime?.totalCravingsHandled || 9;

  // Non-Smoker / Fitness Stats
  const stepsWeekly = [6200, 7800, 9400, 8100, 10200, 11500, 7420];
  const maxSteps = Math.max(...stepsWeekly);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics & Biometrics</Text>
        <Badge
          text={isSmoker ? 'Smoke-Free Trajectory' : 'Fitness Performance'}
          variant={isSmoker ? 'primary' : 'secondary'}
          size="sm"
        />
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
        {/* Hero Performance Card */}
        <GlassCard
          style={styles.heroCard}
          gradientBorder
          borderColors={isSmoker ? COLORS.gradientPrimary : COLORS.gradientSecondary}
        >
          <Text style={styles.heroTag}>7-DAY CONSOLIDATED REPORT</Text>
          <Text style={styles.heroTitle}>
            {isSmoker ? '₹600 Saved • 48 Cigs Avoided' : '58,620 Total Steps • 2,450 kcal'}
          </Text>
          <Text style={styles.heroDesc}>
            {isSmoker
              ? 'Your respiratory vascular resistance has dropped by 18% since commencing the quit protocol.'
              : 'Consistent training volume across 5 active days. VO2 Max capacity trending upward.'}
          </Text>
        </GlassCard>

        {/* ========================================================= */}
        {/* SMOKER ANALYTICS                                          */}
        {/* ========================================================= */}
        {isSmoker ? (
          <>
            {/* Weekly Avoided Cigarettes Bar Chart */}
            <SectionHeader title="Weekly Smoke-Free Adherence" />
            <GlassCard style={styles.chartCard}>
              <View style={styles.barsRow}>
                {[12, 12, 10, 12, 11, 12, 10].map((val, idx) => {
                  const heightRatio = val / 14;
                  return (
                    <View key={idx} style={styles.barCol}>
                      <Text style={styles.barTopVal}>{val}</Text>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              height: `${Math.round(heightRatio * 100)}%`,
                              backgroundColor: idx === 6 ? COLORS.primary : COLORS.surfaceBorder,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.barDayText}>{WEEK_DAYS[idx]}</Text>
                    </View>
                  );
                })}
              </View>
            </GlassCard>

            {/* Craving Heatmap / Hourly peak breakdown */}
            <SectionHeader title="Craving Intensity Heatmap" />
            <GlassCard style={styles.heatmapCard}>
              <View style={styles.heatmapRow}>
                <View style={[styles.heatBox, { backgroundColor: 'rgba(239, 68, 68, 0.4)' }]}>
                  <Text style={styles.heatTime}>Morning</Text>
                  <Text style={styles.heatVal}>High</Text>
                </View>
                <View style={[styles.heatBox, { backgroundColor: 'rgba(245, 158, 11, 0.3)' }]}>
                  <Text style={styles.heatTime}>Afternoon</Text>
                  <Text style={styles.heatVal}>Moderate</Text>
                </View>
                <View style={[styles.heatBox, { backgroundColor: 'rgba(239, 68, 68, 0.35)' }]}>
                  <Text style={styles.heatTime}>Evening</Text>
                  <Text style={styles.heatVal}>High</Text>
                </View>
                <View style={[styles.heatBox, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                  <Text style={styles.heatTime}>Night</Text>
                  <Text style={styles.heatVal}>Low</Text>
                </View>
              </View>
              <Text style={styles.heatSub}>
                Cravings most frequently peak during morning chai and post-dinner transitions.
              </Text>
            </GlassCard>
          </>
        ) : (
          /* ========================================================= */
          /* FITNESS ANALYTICS                                         */
          /* ========================================================= */
          <>
            {/* Step Count Trend Chart */}
            <SectionHeader title="Daily Steps Progression" />
            <GlassCard style={styles.chartCard}>
              <View style={styles.barsRow}>
                {stepsWeekly.map((steps, idx) => {
                  const heightRatio = steps / maxSteps;
                  return (
                    <View key={idx} style={styles.barCol}>
                      <Text style={styles.barTopVal}>{Math.round(steps / 1000)}k</Text>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              height: `${Math.round(heightRatio * 100)}%`,
                              backgroundColor: idx === 6 ? COLORS.secondary : COLORS.surfaceBorder,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.barDayText}>{WEEK_DAYS[idx]}</Text>
                    </View>
                  );
                })}
              </View>
            </GlassCard>

            {/* Calorie & Active Minutes Grid */}
            <SectionHeader title="Metabolic Metrics" />
            <View style={styles.metricsGrid}>
              <GlassCard style={styles.metricCard}>
                <Ionicons name="flame" size={24} color={COLORS.accent} />
                <Text style={styles.metricVal}>2,450 kcal</Text>
                <Text style={styles.metricLabel}>Weekly Calorie Burn</Text>
              </GlassCard>

              <GlassCard style={styles.metricCard}>
                <Ionicons name="time" size={24} color={COLORS.secondary} />
                <Text style={styles.metricVal}>210 mins</Text>
                <Text style={styles.metricLabel}>Total Active Time</Text>
              </GlassCard>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
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
  heroCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  heroTag: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
  },
  heroTitle: {
    ...TYPOGRAPHY.heading2,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginVertical: 4,
  },
  heroDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  chartCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: SPACING.md,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTopVal: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  barTrack: {
    width: 14,
    height: 100,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.full,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: RADIUS.full,
  },
  barDayText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  heatmapCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  heatmapRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  heatBox: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  heatTime: {
    fontSize: 10,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  heatVal: {
    fontSize: 9,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  heatSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  metricCard: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
  },
  metricVal: {
    ...TYPOGRAPHY.heading3,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginTop: 6,
  },
  metricLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});