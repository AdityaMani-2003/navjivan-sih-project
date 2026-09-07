import React, { useContext, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Check, ChevronRight, Snowflake, TrendingDown, Award, Zap } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import API from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { UserContext } from "../../context/UserContext";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "../../constants/theme";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import BottomSheet from "../../components/ui/BottomSheet";

export default function PlanRecommendationScreen() {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const userCtx = useContext(UserContext);

  const [loading, setLoading] = useState(true);
  const [planData, setPlanData] = useState<any>(null);
  const [showSwitchSheet, setShowSwitchSheet] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const res = await API.get("/api/v1/plans/current");
        if (res.data?.success && res.data?.data) {
          setPlanData(res.data.data);
        } else {
          // Default smoker fallback
          setPlanData({
            planType: "cold_turkey",
            planName: "Navjivan Cold Turkey Freedom Protocol",
            recommendationExplanation:
              "Based on your high motivation and confidence scores, making a clean break immediately offers your highest statistical probability of permanent recovery.",
            goals: [
              { title: "Achieve 24 Hours Smoke-Free", deadline: 1 },
              { title: "Complete First Week Clean", deadline: 7 },
              { title: "30-Day Milestone", deadline: 30 },
            ],
            weeklyStructure: [
              {
                week: 1,
                theme: "Breaking the Physical Loop",
                focus: "Overcoming immediate 3-5 minute withdrawal cravings",
                tasks: [
                  { title: "Morning 4-7-8 Breathing" },
                  { title: "Hydration Craving Defense" },
                  { title: "Log first craving in SOS room" },
                ],
              },
            ],
          });
        }
      } catch (err) {
        console.error("Fetch plan error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  const isSmoker = auth.userType !== "non-smoker";
  const planType = planData?.planType || (isSmoker ? "cold_turkey" : "basic");

  const handleStartJourney = async () => {
    try {
      setStarting(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    await userCtx.refreshProfile();
    router.replace("/(tabs)" as any);
  };

  const handleSwitchPlan = async (newType: string, newName: string) => {
    try {
      if (planData?._id) {
        await API.put(`/api/v1/plans/${planData._id}`, {
          planType: newType,
          planName: newName,
        });
      }
      setPlanData((prev: any) => ({
        ...prev,
        planType: newType,
        planName: newName,
      }));
      setShowSwitchSheet(false);
    } catch (err) {
      console.warn("Could not update plan:", err);
      setShowSwitchSheet(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={styles.kicker}>YOUR CLINICAL ROADMAP</Text>
          <Text style={styles.title}>
            {planData?.planName || "Personalized Health Plan"}
          </Text>
        </View>

        {/* Hero Card */}
        <Card accent={isSmoker ? "primary" : "secondary"} style={styles.heroCard}>
          <View style={styles.planBadgeRow}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: isSmoker ? COLORS.primaryDim : COLORS.secondaryDim },
              ]}
            >
              {planType === "cold_turkey" ? (
                <Snowflake size={24} color={COLORS.primary} />
              ) : planType === "gradual_reduction" ? (
                <TrendingDown size={24} color={COLORS.primary} />
              ) : (
                <Award size={24} color={COLORS.secondary} />
              )}
            </View>
            <View style={styles.badgeTextContainer}>
              <Text style={styles.badgeLabel}>RECOMMENDED STRATEGY</Text>
              <Text style={styles.badgePlanName}>
                {planType === "cold_turkey"
                  ? "Cold Turkey Protocol"
                  : planType === "gradual_reduction"
                  ? "Gradual Reduction Pathway"
                  : planType.toUpperCase() + " WELLNESS"}
              </Text>
            </View>
          </View>

          {/* Explanation */}
          <Text style={styles.explanationText}>
            {planData?.recommendationExplanation ||
              "Structured according to your physiological addiction markers and motivation levels."}
          </Text>
        </Card>

        {/* Week 1 Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Week 1 Focus & Daily Tasks</Text>
          <Card style={styles.weekCard}>
            <Text style={styles.weekThemeTitle}>
              Theme: {planData?.weeklyStructure?.[0]?.theme || "Foundation"}
            </Text>
            <Text style={styles.weekFocusSubtitle}>
              {planData?.weeklyStructure?.[0]?.focus || "Building immediate daily consistency"}
            </Text>

            <View style={styles.taskList}>
              {(planData?.weeklyStructure?.[0]?.tasks || []).map((t: any, idx: number) => (
                <View key={idx} style={styles.taskItem}>
                  <View style={styles.checkCircle}>
                    <Check size={14} color={COLORS.primary} />
                  </View>
                  <Text style={styles.taskTitle}>{t.title}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Key Milestones */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>First Milestones</Text>
          <View style={styles.milestonesRow}>
            {(planData?.goals || []).slice(0, 2).map((g: any, idx: number) => (
              <View key={idx} style={styles.milestoneBox}>
                <Zap size={20} color={COLORS.gold} style={styles.milestoneIcon} />
                <Text style={styles.milestoneTitle}>{g.title}</Text>
                <Text style={styles.milestoneDeadline}>Target: Day {g.deadline}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Primary CTA */}
        <View style={styles.ctaContainer}>
          <Button
            title={starting ? "Launching..." : "Start My Journey 🚀"}
            onPress={handleStartJourney}
            variant={isSmoker ? "primary" : "secondary"}
            size="lg"
            loading={starting}
          />

          <Pressable
            onPress={() => setShowSwitchSheet(true)}
            style={styles.switchLink}
          >
            <Text style={styles.switchLinkText}>Not right for me? Explore other plans</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Switch Plan BottomSheet */}
      <BottomSheet
        visible={showSwitchSheet}
        onClose={() => setShowSwitchSheet(false)}
        title="Select Alternative Plan"
      >
        <View style={styles.sheetOptions}>
          {isSmoker ? (
            <>
              <Pressable
                style={styles.sheetOptionCard}
                onPress={() =>
                  handleSwitchPlan(
                    "cold_turkey",
                    "Navjivan Cold Turkey Freedom Protocol"
                  )
                }
              >
                <Text style={styles.sheetOptionTitle}>Cold Turkey Protocol ❄️</Text>
                <Text style={styles.sheetOptionDesc}>
                  Stop tobacco completely on Day 1. High momentum and clean neurological break.
                </Text>
              </Pressable>
              <Pressable
                style={styles.sheetOptionCard}
                onPress={() =>
                  handleSwitchPlan(
                    "gradual_reduction",
                    "Navjivan Gradual Reduction Journey"
                  )
                }
              >
                <Text style={styles.sheetOptionTitle}>Gradual Reduction 📉</Text>
                <Text style={styles.sheetOptionDesc}>
                  Systematically step down cigarettes per day over 30 days with craving support.
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                style={styles.sheetOptionCard}
                onPress={() =>
                  handleSwitchPlan("basic", "Navjivan Foundational Wellness Path")
                }
              >
                <Text style={styles.sheetOptionTitle}>Basic / Mobility 🌱</Text>
                <Text style={styles.sheetOptionDesc}>Gentle low-impact cardio, joint mobility, and walking.</Text>
              </Pressable>
              <Pressable
                style={styles.sheetOptionCard}
                onPress={() =>
                  handleSwitchPlan("intermediate", "Navjivan Core Fitness Progression")
                }
              >
                <Text style={styles.sheetOptionTitle}>Intermediate 💪</Text>
                <Text style={styles.sheetOptionDesc}>Progressive functional strength, interval cardio, and core.</Text>
              </Pressable>
              <Pressable
                style={styles.sheetOptionCard}
                onPress={() =>
                  handleSwitchPlan("advanced", "Navjivan Athletic Conditioning")
                }
              >
                <Text style={styles.sheetOptionTitle}>Advanced Athlete 🏆</Text>
                <Text style={styles.sheetOptionDesc}>High VO2 max conditioning, power output, and heavy resistance.</Text>
              </Pressable>
            </>
          )}
        </View>
      </BottomSheet>
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  kicker: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
  },
  heroCard: {
    marginBottom: 24,
  },
  planBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  badgeTextContainer: {
    flex: 1,
  },
  badgeLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
  },
  badgePlanName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  explanationText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  weekCard: {
    padding: 16,
  },
  weekThemeTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    fontSize: 16,
    marginBottom: 4,
  },
  weekFocusSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  taskList: {
    gap: 10,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  taskTitle: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  milestonesRow: {
    flexDirection: "row",
    gap: 12,
  },
  milestoneBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  milestoneIcon: {
    marginBottom: 8,
  },
  milestoneTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.textPrimary,
    fontWeight: "700",
    marginBottom: 4,
  },
  milestoneDeadline: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gold,
  },
  ctaContainer: {
    marginTop: 8,
    alignItems: "center",
  },
  switchLink: {
    paddingVertical: 16,
    alignItems: "center",
  },
  switchLinkText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textDecorationLine: "underline",
  },
  sheetOptions: {
    gap: 12,
    paddingBottom: 20,
  },
  sheetOptionCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sheetOptionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  sheetOptionDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
});
