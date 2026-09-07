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
import {
  ShieldAlert,
  HeartPulse,
  Activity,
  AlertTriangle,
  Info,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
} from "lucide-react-native";
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOW } from "../constants/theme";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ProgressBar from "../components/ui/ProgressBar";
import ProgressRing from "../components/ui/ProgressRing";
import { useUser } from "../context/UserContext";
import api from "../services/api";

const { width } = Dimensions.get("window");

interface RiskItem {
  disease: string;
  risk_percentage: number;
  severity: "low" | "medium" | "high" | "critical";
  explanation: string;
}

const REVERSAL_TIMELINE = [
  {
    period: "24 Hours",
    milestone: "Carbon Monoxide Purge",
    detail: "Blood oxygen saturation normalizes. Myocardial infarction risk starts trending down.",
    status: "Achieved",
  },
  {
    period: "1 Year",
    milestone: "50% Heart Attack Risk Drop",
    detail: "Excess coronary heart disease risk drops by 50% compared to an active smoker.",
    status: "Projected",
  },
  {
    period: "5 Years",
    milestone: "Stroke Risk Normalization",
    detail: "Cerebrovascular circulation rebounds. Stroke risk matches that of a lifetime non-smoker.",
    status: "Projected",
  },
  {
    period: "10 Years",
    milestone: "50% Lung Cancer Reduction",
    detail: "Risk of dying from lung cancer falls by half. Precancerous tissue progressively self-repairs.",
    status: "Projected",
  },
];

export default function DiseaseRiskScreen() {
  const router = useRouter();
  const { profile } = useUser();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [risks, setRisks] = useState<RiskItem[]>([]);

  const cigs = profile?.smokerProfile?.cigarettesPerDay || 10;
  const years = profile?.smokerProfile?.yearsSmoking || 4;
  const packYears = Math.round(((cigs / 20) * years) * 10) / 10;

  const fetchRiskReport = useCallback(async () => {
    try {
      const res = await api.post("/api/v1/ai/disease-risk", {
        cigarettesPerDay: cigs,
        smokingYears: years,
      });

      if (res.data?.success && Array.isArray(res.data.risks)) {
        setRisks(res.data.risks);
      }
    } catch (err) {
      console.warn("Failed to fetch risk report:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [cigs, years]);

  useEffect(() => {
    fetchRiskReport();
  }, [fetchRiskReport]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRiskReport();
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
      case "high":
        return { bg: "rgba(239, 68, 68, 0.15)", text: COLORS.danger };
      case "medium":
        return { bg: "rgba(245, 158, 11, 0.15)", text: COLORS.warning };
      case "low":
      default:
        return { bg: COLORS.primaryDim, text: COLORS.primary };
    }
  };

  const getExposureLevel = (py: number) => {
    if (py >= 20) return { label: "Severe Exposure", color: COLORS.danger };
    if (py >= 10) return { label: "Elevated Exposure", color: COLORS.warning };
    if (py >= 5) return { label: "Moderate Exposure", color: COLORS.secondary };
    return { label: "Mild Exposure", color: COLORS.primary };
  };

  const exposure = getExposureLevel(packYears);

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
          <Text style={styles.headerTitle}>Disease Risk Radar</Text>
          <Text style={styles.headerSubtitle}>Actuarial Clinical Projections</Text>
        </View>

        <Pressable
          onPress={onRefresh}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Refresh analysis"
        >
          <RotateCcw size={18} color={COLORS.textSecondary} />
        </Pressable>
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
        {/* Medical Disclaimer Banner */}
        <View style={styles.disclaimerBanner}>
          <AlertTriangle size={20} color={COLORS.warning} />
          <Text style={styles.disclaimerText}>
            Clinical Disclaimer: Actuarial probability model based on CDC and WHO risk tables. Not a
            clinical diagnosis. Always consult a licensed physician.
          </Text>
        </View>

        {/* Pack-Year Exposure Hero Card */}
        <Card style={styles.heroCard} elevation="medium">
          <View style={styles.heroTopRow}>
            <View style={styles.heroTag}>
              <ShieldAlert size={14} color={exposure.color} />
              <Text style={[styles.heroTagText, { color: exposure.color }]}>
                {exposure.label}
              </Text>
            </View>
            <Text style={styles.packYearNum}>{packYears} Pack-Years</Text>
          </View>

          <Text style={styles.heroTitle}>Cumulative Tobacco Exposure</Text>
          <Text style={styles.heroDesc}>
            Calculated as ({cigs} cigarettes/day ÷ 20) × {years} active smoking years. Higher
            pack-year numbers directly correlate with cellular mutagenic stress.
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statBoxValue}>{cigs}</Text>
              <Text style={styles.statBoxLabel}>Cigs Per Day</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statBoxValue}>{years} yrs</Text>
              <Text style={styles.statBoxLabel}>Smoking Years</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statBoxValue, { color: exposure.color }]}>
                {packYears}
              </Text>
              <Text style={styles.statBoxLabel}>Exposure Score</Text>
            </View>
          </View>
        </Card>

        {/* Gemini AI Risk Analysis Cards */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Activity size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Gemini AI Risk Probabilities</Text>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Synthesizing actuarial risk matrix...</Text>
            </View>
          ) : (
            <View style={styles.riskList}>
              {risks.map((item, idx) => {
                const badge = getSeverityBadgeColor(item.severity);
                return (
                  <Card key={idx} style={styles.riskCard} elevation="low">
                    <View style={styles.riskTopRow}>
                      <View style={styles.riskTitleBox}>
                        <Text style={styles.riskDisease}>{item.disease}</Text>
                        <View style={[styles.severityPill, { backgroundColor: badge.bg }]}>
                          <Text style={[styles.severityPillText, { color: badge.text }]}>
                            {item.severity?.toUpperCase()} SEVERITY
                          </Text>
                        </View>
                      </View>

                      <Text style={[styles.riskPercent, { color: badge.text }]}>
                        {item.risk_percentage}%
                      </Text>
                    </View>

                    <ProgressBar
                      progress={Math.min(1, item.risk_percentage / 100)}
                      color={badge.text}
                      height={6}
                      style={{ marginVertical: SPACING.sm }}
                    />

                    <Text style={styles.riskExplanation}>{item.explanation}</Text>
                  </Card>
                );
              })}
            </View>
          )}
        </View>

        {/* Organ Recovery Reversal Radar */}
        <Card style={styles.reversalCard} elevation="medium">
          <View style={styles.reversalHeader}>
            <HeartPulse size={20} color={COLORS.primary} />
            <Text style={styles.reversalTitle}>Organ Risk Reversal Timeline</Text>
          </View>
          <Text style={styles.reversalDesc}>
            What happens to your biometrics once you sustain complete cessation:
          </Text>

          <View style={styles.timelineList}>
            {REVERSAL_TIMELINE.map((item, idx) => (
              <View key={idx} style={styles.timelineItem}>
                <View style={styles.timelinePeriodBox}>
                  <Text style={styles.timelinePeriod}>{item.period}</Text>
                </View>

                <View style={styles.timelineInfo}>
                  <Text style={styles.timelineMilestone}>{item.milestone}</Text>
                  <Text style={styles.timelineDetail}>{item.detail}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
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
  scrollContent: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  disclaimerBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  disclaimerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.warning,
    flex: 1,
    lineHeight: 18,
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
    backgroundColor: COLORS.surfaceElevated,
  },
  heroTagText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: "700",
  },
  packYearNum: {
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
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statBoxValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  statBoxLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.surfaceBorder,
  },
  sectionContainer: {
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
  loadingBox: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.md,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  riskList: {
    gap: SPACING.sm,
  },
  riskCard: {
    padding: SPACING.md,
  },
  riskTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  riskTitleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  riskDisease: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  severityPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  severityPillText: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    fontWeight: "700",
  },
  riskPercent: {
    ...TYPOGRAPHY.h3,
    fontWeight: "800",
  },
  riskExplanation: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  reversalCard: {
    padding: SPACING.lg,
  },
  reversalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: 4,
  },
  reversalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  reversalDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  timelineList: {
    gap: SPACING.md,
  },
  timelineItem: {
    flexDirection: "row",
    gap: SPACING.md,
    alignItems: "flex-start",
  },
  timelinePeriodBox: {
    width: 75,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  timelinePeriod: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 11,
  },
  timelineInfo: {
    flex: 1,
  },
  timelineMilestone: {
    ...TYPOGRAPHY.body,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  timelineDetail: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
});
