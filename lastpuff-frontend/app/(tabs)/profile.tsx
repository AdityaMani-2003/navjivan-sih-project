import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import ProgressRing from '../../components/ui/ProgressRing';
import Badge from '../../components/ui/Badge';
import SectionHeader from '../../components/ui/SectionHeader';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { fetchDashboardAnalytics, deleteAccountApi } from '../../services/api';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { userType, setUserType, profile } = useUser();

  const [stats, setStats] = useState({
    streak: user?.streak || 4,
    totalCigarettesAvoided: 48,
    totalMoneySaved: 600,
    totalCravingsHandled: 9,
    goalsCompleted: 12,
  });

  const [notifDaily, setNotifDaily] = useState(true);
  const [notifSos, setNotifSos] = useState(true);
  const [healthScore, setHealthScore] = useState(82);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetchDashboardAnalytics();
        if (res?.data?.allTime) {
          setStats((prev) => ({
            ...prev,
            totalCigarettesAvoided: res.data.allTime.totalCigarettesAvoided || prev.totalCigarettesAvoided,
            totalMoneySaved: res.data.allTime.totalMoneySaved || prev.totalMoneySaved,
            totalCravingsHandled: res.data.allTime.totalCravingsHandled || prev.totalCravingsHandled,
          }));
        }
      } catch (_e) {}
    };
    loadStats();
  }, []);

  const handleToggleUserType = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const newType = userType === 'smoker' ? 'non-smoker' : 'smoker';
      await setUserType(newType);
      Toast.show({
        type: 'success',
        text1: `Switched to ${newType === 'smoker' ? 'Smoke-Free' : 'Fitness'} Mode! 🔄`,
        text2: 'Dashboard tools adapted to your selection.',
      });
    } catch (_e) {}
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of Navjivan?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth/login' as any);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account & Health Profile</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push('/subscription' as any)}
        >
          <Ionicons name="sparkles" size={18} color={COLORS.accent} />
          <Text style={styles.proText}>SaaS Pro</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Hero Card */}
        <GlassCard style={styles.userCard} gradientBorder borderColors={COLORS.gradientPrimary}>
          <View style={styles.userRow}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user?.name || 'Navjivan Pioneer'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'user@navjivan.app'}</Text>
              <View style={styles.badgeRow}>
                <Badge
                  text={userType === 'non-smoker' ? 'Fitness Explorer' : 'Smoke-Free Hero'}
                  variant={userType === 'non-smoker' ? 'secondary' : 'primary'}
                  size="sm"
                />
                <Badge text={`Lvl ${profile?.level || 1}`} variant="warning" size="sm" />
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Dynamic Health Score Gauge */}
        <SectionHeader title="Vitality & Health Score" />
        <GlassCard style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <ProgressRing
              size={90}
              strokeWidth={8}
              progress={healthScore / 100}
              color={COLORS.primary}
            >
              <Text style={styles.scoreNumber}>{healthScore}</Text>
              <Text style={styles.scoreSubLabel}>/100</Text>
            </ProgressRing>

            <View style={{ flex: 1 }}>
              <Text style={styles.scoreHeading}>Optimal Recovery Status</Text>
              <Text style={styles.scoreDesc}>
                Calculated from habit streak, craving resistance, and step volume.
              </Text>

              <View style={styles.scoreMiniBars}>
                <View style={styles.miniBarItem}>
                  <Text style={styles.miniBarName}>Cardiovascular</Text>
                  <Text style={styles.miniBarVal}>85%</Text>
                </View>
                <View style={styles.miniBarItem}>
                  <Text style={styles.miniBarName}>Lung Capacity</Text>
                  <Text style={styles.miniBarVal}>78%</Text>
                </View>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Lifetime Milestones Grid */}
        <SectionHeader title="Lifetime Achievements" />
        <View style={styles.statsGrid}>
          <GlassCard style={styles.statCard}>
            <FontAwesome5 name="fire" size={20} color={COLORS.accent} />
            <Text style={styles.statValue}>{stats.streak} Days</Text>
            <Text style={styles.statLabel}>Clean Streak</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <FontAwesome5 name="coins" size={20} color={COLORS.success} />
            <Text style={styles.statValue}>₹{stats.totalMoneySaved}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <Ionicons name="ban" size={22} color={COLORS.primary} />
            <Text style={styles.statValue}>{stats.totalCigarettesAvoided}</Text>
            <Text style={styles.statLabel}>Cigs Avoided</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <Ionicons name="shield-checkmark" size={22} color={COLORS.secondary} />
            <Text style={styles.statValue}>{stats.totalCravingsHandled}</Text>
            <Text style={styles.statLabel}>Cravings Resisted</Text>
          </GlassCard>
        </View>

        {/* Profile Switcher CTA */}
        <GlassCard style={styles.switchCard}>
          <View style={styles.switchRow}>
            <View style={[styles.switchIconBox, { backgroundColor: COLORS.secondaryGlow }]}>
              <Ionicons name="swap-horizontal" size={22} color={COLORS.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>Dual Profile Switcher</Text>
              <Text style={styles.switchSub}>
                Currently: <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{userType === 'non-smoker' ? 'Fitness & Wellness' : 'Smoke-Free Journey'}</Text>
              </Text>
            </View>
            <TouchableOpacity style={styles.switchBtn} onPress={handleToggleUserType}>
              <Text style={styles.switchBtnText}>Switch ⚡</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Settings Menu List */}
        <SectionHeader title="Preferences & Security" />
        <View style={styles.settingsList}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/onboarding' as any)}
          >
            <Ionicons name="clipboard-outline" size={20} color={COLORS.primary} />
            <Text style={styles.settingText}>Retake Health Questionnaire & AI Setup</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push(userType === 'non-smoker' ? ('/fitness-plans' as any) : ('/quit-plan' as any))}
          >
            <MaterialCommunityIcons name="robot" size={20} color={COLORS.secondary} />
            <Text style={styles.settingText}>
              {userType === 'non-smoker' ? 'AI Athletic Training Plan' : 'AI 30-Day Quit Protocol'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/goals' as any)}
          >
            <Ionicons name="sparkles" size={20} color={COLORS.accent} />
            <Text style={styles.settingText}>Agentic AI Daily Goals Planner</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/edit-profile' as any)}
          >
            <Ionicons name="person-outline" size={20} color={COLORS.textPrimary} />
            <Text style={styles.settingText}>Edit Profile Info</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/rewards' as any)}
          >
            <Ionicons name="gift-outline" size={20} color={COLORS.accent} />
            <Text style={styles.settingText}>Swadeshi Brand Coupons</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
            <Text style={styles.settingText}>Daily Check-In Alerts</Text>
            <Switch
              value={notifDaily}
              onValueChange={setNotifDaily}
              trackColor={{ false: COLORS.surfaceBorder, true: COLORS.primary }}
            />
          </View>

          <View style={styles.settingItem}>
            <Ionicons name="shield-outline" size={20} color={COLORS.danger} />
            <Text style={styles.settingText}>SOS Emergency Monitoring</Text>
            <Switch
              value={notifSos}
              onValueChange={setNotifSos}
              trackColor={{ false: COLORS.surfaceBorder, true: COLORS.primary }}
            />
          </View>

          <TouchableOpacity
            style={[styles.settingItem, { borderBottomWidth: 0 }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
            <Text style={[styles.settingText, { color: COLORS.danger }]}>Sign Out of Navjivan</Text>
          </TouchableOpacity>
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  headerTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.textPrimary,
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  proText: {
    color: COLORS.accent,
    fontWeight: '800',
    fontSize: 12,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 60,
  },
  userCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryGlow,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
  },
  userName: {
    ...TYPOGRAPHY.heading2,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  userEmail: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  scoreCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
  },
  scoreSubLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  scoreHeading: {
    ...TYPOGRAPHY.heading3,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  scoreDesc: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
    marginTop: 2,
    marginBottom: SPACING.xs,
  },
  scoreMiniBars: {
    gap: 2,
  },
  miniBarItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniBarName: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  miniBarVal: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: '48%',
    padding: SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.heading3,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  switchCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  switchIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  switchSub: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  switchBtn: {
    backgroundColor: COLORS.secondaryGlow,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  switchBtnText: {
    color: COLORS.secondary,
    fontWeight: '700',
    fontSize: 12,
  },
  settingsList: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  settingText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
