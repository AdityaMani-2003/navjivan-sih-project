import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import {
  User as UserIcon,
  Flame,
  Award,
  Settings,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  Sparkles,
  Lock,
  CheckCircle2,
  Calendar,
  Zap,
  HelpCircle,
  RefreshCw,
} from "lucide-react-native";
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOW } from "../../constants/theme";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import ProgressBar from "../../components/ui/ProgressBar";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import api from "../../services/api";

const { width } = Dimensions.get("window");

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  xpReward: number;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: "a1", title: "First Step", description: "Resist your first craving or log first meal", unlocked: true, xpReward: 50 },
  { id: "a2", title: "3-Day Warrior", description: "Maintain a 3-day continuous check-in streak", unlocked: true, xpReward: 100 },
  { id: "a3", title: "Zen Master", description: "Complete 3 cycles of 4-7-8 deep breathing", unlocked: true, xpReward: 75 },
  { id: "a4", title: "Padyatra Trekker", description: "Log 10,000 steps on any heritage route", unlocked: false, xpReward: 150 },
  { id: "a5", title: "Clean Smoke-Free Week", description: "7 full days with 0 cigarettes smoked", unlocked: false, xpReward: 300 },
  { id: "a6", title: "Tribe Champion", description: "Join a FitSquad and complete a challenge", unlocked: false, xpReward: 200 },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { userType, setUserType, profile, xp, level, streak, addXP } = useUser();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [checkedInToday, setCheckedInToday] = useState(false);

  const fetchProfileData = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/gamification/achievements");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setAchievements(res.data.data);
      }
    } catch (err) {
      console.warn("Failed to fetch achievements:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  const handleDailyCheckIn = async () => {
    if (checkedInToday) {
      Toast.show({ type: "info", text1: "Already Checked In", text2: "Come back tomorrow for your next streak bonus!" });
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_e) {}

    setCheckedInToday(true);
    addXP(25);

    try {
      const res = await api.post("/api/v1/progress/checkin");
      if (res.data?.success) {
        Toast.show({
          type: "success",
          text1: "Daily Streak Verified! 🔥",
          text2: `+25 XP awarded! Current streak: ${res.data.data?.streak || streak + 1} days.`,
        });
      }
    } catch (err) {
      console.warn("Check-in error:", err);
      Toast.show({ type: "success", text1: "Checked In!", text2: "+25 XP logged to recovery bank." });
    }
  };

  const handleToggleUserType = () => {
    const newType = userType === "smoker" ? "non-smoker" : "smoker";
    Alert.alert(
      "Switch Journey Mode",
      `Switch your dashboard to ${newType === "smoker" ? "Smoke-Free Cessation" : "Physical Conditioning & Fitness"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Switch Mode",
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await setUserType(newType);
              Toast.show({
                type: "success",
                text1: `Mode Switched! 🔄`,
                text2: `You are now on the ${newType === "smoker" ? "Smoke-Free" : "Fitness"} track.`,
              });
            } catch (_e) {}
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out of Navjivan?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await logout();
            router.replace("/auth/login" as any);
          } catch (_e) {}
        },
      },
    ]);
  };

  const userName = profile?.name || user?.name || "Navjivan Warrior";
  const userEmail = profile?.email || user?.email || "warrior@navjivan.app";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const xpCurrent = xp || 0;
  const xpForNext = 500;
  const xpProgress = Math.min(1, (xpCurrent % xpForNext) / xpForNext);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Account & Profile</Text>
          <Text style={styles.headerSubtitle}>Identity, Trophies & Settings</Text>
        </View>

        <View style={styles.badgePro}>
          <Sparkles size={14} color={COLORS.accent} />
          <Text style={styles.badgeProText}>FREE TIER</Text>
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
        {/* Profile Identity Card */}
        <Card style={styles.profileHeroCard} elevation="medium">
          <View style={styles.profileRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            <View style={styles.profileMeta}>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileEmail}>{userEmail}</Text>

              <View style={styles.roleRow}>
                <View
                  style={[
                    styles.rolePill,
                    {
                      backgroundColor:
                        userType === "smoker"
                          ? COLORS.primaryDim
                          : COLORS.secondaryDim,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.rolePillText,
                      {
                        color:
                          userType === "smoker"
                            ? COLORS.primary
                            : COLORS.secondary,
                      },
                    ]}
                  >
                    {userType === "smoker" ? "Cessation Track" : "Fitness Track"}
                  </Text>
                </View>

                <Pressable
                  onPress={handleToggleUserType}
                  style={styles.switchModeBtn}
                  accessibilityRole="button"
                >
                  <RefreshCw size={12} color={COLORS.textSecondary} />
                  <Text style={styles.switchModeText}>Switch</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Card>

        {/* Level & XP Progression Card */}
        <Card style={styles.xpCard} elevation="medium">
          <View style={styles.xpHeader}>
            <View style={styles.levelBadge}>
              <Award size={18} color={COLORS.secondary} />
              <Text style={styles.levelText}>Level {level || 1}</Text>
            </View>

            <View style={styles.streakBadge}>
              <Flame size={16} color={COLORS.accent} />
              <Text style={styles.streakText}>{streak || 0} Day Streak</Text>
            </View>
          </View>

          <View style={styles.xpBarContainer}>
            <View style={styles.xpLabelsRow}>
              <Text style={styles.xpCurrentLabel}>{xpCurrent} Total XP</Text>
              <Text style={styles.xpTargetLabel}>{xpForNext} XP to Level {(level || 1) + 1}</Text>
            </View>
            <ProgressBar
              progress={xpProgress}
              color={COLORS.primary}
              height={8}
            />
          </View>

          <Button
            title={checkedInToday ? "Checked In Today ✓" : "Verify Daily Streak (+25 XP)"}
            variant={checkedInToday ? "outline" : "primary"}
            size="md"
            fullWidth
            onPress={handleDailyCheckIn}
            disabled={checkedInToday}
            icon={<Zap size={16} color={checkedInToday ? COLORS.textSecondary : COLORS.textInverse} />}
          />
        </Card>

        {/* Achievements Showcase Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Award size={18} color={COLORS.primary} />
            <Text style={styles.sectionHeading}>Trophy Vault</Text>
          </View>

          <View style={styles.achievementsGrid}>
            {achievements.map((ach) => (
              <Card
                key={ach.id}
                style={[
                  styles.achievementCard,
                  ach.unlocked && styles.achievementUnlocked,
                ]}
                elevation="low"
              >
                <View style={styles.achIconBox}>
                  {ach.unlocked ? (
                    <CheckCircle2 size={24} color={COLORS.primary} />
                  ) : (
                    <Lock size={22} color={COLORS.textMuted} />
                  )}
                </View>
                <Text style={styles.achTitle} numberOfLines={1}>
                  {ach.title}
                </Text>
                <Text style={styles.achDesc} numberOfLines={2}>
                  {ach.description}
                </Text>
                <Text
                  style={[
                    styles.achReward,
                    ach.unlocked && { color: COLORS.primary },
                  ]}
                >
                  +{ach.xpReward} XP
                </Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Settings & Options Menu */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Settings size={18} color={COLORS.textSecondary} />
            <Text style={styles.sectionHeading}>Preferences & Support</Text>
          </View>

          <Card style={styles.settingsCard} elevation="low">
            {/* Notification Switch Row */}
            <View style={styles.settingRow}>
              <View style={styles.settingIconBox}>
                <Bell size={20} color={COLORS.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Daily Streak Reminders</Text>
                <Text style={styles.settingSubtitle}>
                  Notifications for evening check-in and craving resistance
                </Text>
              </View>
              <Switch
                value={notifEnabled}
                onValueChange={setNotifEnabled}
                trackColor={{ false: COLORS.surfaceBorder, true: COLORS.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingDivider} />

            {/* Medical Disclaimer Row */}
            <Pressable
              onPress={() => router.push("/disease-risk" as any)}
              style={styles.settingRow}
              accessibilityRole="button"
            >
              <View style={styles.settingIconBox}>
                <Shield size={20} color={COLORS.secondary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Clinical & Actuarial Disclaimer</Text>
                <Text style={styles.settingSubtitle}>
                  View predictive health models and medical references
                </Text>
              </View>
              <ChevronRight size={18} color={COLORS.textMuted} />
            </Pressable>

            <View style={styles.settingDivider} />

            {/* Edit Profile Row */}
            <Pressable
              onPress={() => router.push("/edit-profile" as any)}
              style={styles.settingRow}
              accessibilityRole="button"
            >
              <View style={styles.settingIconBox}>
                <UserIcon size={20} color={COLORS.accent} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Edit Health Biometrics</Text>
                <Text style={styles.settingSubtitle}>
                  Height, weight, and emergency guardian contact
                </Text>
              </View>
              <ChevronRight size={18} color={COLORS.textMuted} />
            </Pressable>
          </Card>
        </View>

        {/* Logout Button */}
        <Button
          title="Sign Out of Navjivan"
          variant="danger"
          size="lg"
          fullWidth
          onPress={handleLogout}
          icon={<LogOut size={18} color="#FFFFFF" />}
          style={{ marginTop: SPACING.md, marginBottom: SPACING.xl }}
        />
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
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badgePro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  badgeProText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent,
    fontWeight: "700",
    fontSize: 10,
  },
  scrollContent: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  profileHeroCard: {
    padding: SPACING.lg,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    fontWeight: "800",
  },
  profileMeta: {
    flex: 1,
  },
  profileName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  profileEmail: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  rolePillText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: "700",
  },
  switchModeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  switchModeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: "600",
  },
  xpCard: {
    padding: SPACING.lg,
  },
  xpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.secondaryDim,
  },
  levelText: {
    ...TYPOGRAPHY.label,
    color: COLORS.secondary,
    fontWeight: "700",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  streakText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent,
    fontWeight: "700",
  },
  xpBarContainer: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  xpLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  xpCurrentLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: "700",
  },
  xpTargetLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  sectionContainer: {
    gap: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  sectionHeading: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  achievementCard: {
    width: (width - SPACING.lg * 2 - SPACING.sm * 2) / 3,
    padding: SPACING.sm,
    alignItems: "center",
    opacity: 0.6,
  },
  achievementUnlocked: {
    opacity: 1,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.4)",
  },
  achIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xs,
  },
  achTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    fontSize: 11,
  },
  achDesc: {
    fontSize: 9,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 2,
    lineHeight: 12,
  },
  achReward: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textMuted,
    marginTop: 4,
  },
  settingsCard: {
    padding: SPACING.md,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  settingIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  settingSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  settingDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceBorder,
    marginVertical: SPACING.sm,
  },
});
