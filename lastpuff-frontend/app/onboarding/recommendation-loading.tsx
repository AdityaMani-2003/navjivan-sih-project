import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Sparkles, AlertCircle } from "lucide-react-native";
import API from "../../services/api";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "../../constants/theme";
import ProgressBar from "../../components/ui/ProgressBar";
import Button from "../../components/ui/Button";

const PHASES = [
  { text: "Analysing your responses...", targetProgress: 0.3 },
  { text: "Calculating your clinical profile...", targetProgress: 0.6 },
  { text: "Generating your personalised plan...", targetProgress: 0.85 },
  { text: "Finalising your roadmap...", targetProgress: 1.0 },
];

export default function RecommendationLoadingScreen() {
  const router = useRouter();

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0.15);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const startGeneration = async () => {
    setError(null);
    setLoading(true);
    setProgress(0.2);
    setPhaseIndex(0);

    const phase1Timer = setTimeout(() => {
      setPhaseIndex(1);
      setProgress(0.5);
    }, 1200);

    const phase2Timer = setTimeout(() => {
      setPhaseIndex(2);
      setProgress(0.8);
    }, 2400);

    try {
      // Execute the real API call to generate the recommendation
      const res = await API.post("/api/v1/recommendation/generate");

      clearTimeout(phase1Timer);
      clearTimeout(phase2Timer);

      setPhaseIndex(3);
      setProgress(1.0);

      setTimeout(() => {
        router.replace("/onboarding/plan-recommendation" as any);
      }, 800);
    } catch (err: any) {
      clearTimeout(phase1Timer);
      clearTimeout(phase2Timer);
      console.error("Recommendation generate error:", err);
      // If error occurs, still allow user to retry or proceed
      setError("Network timeout connecting to recommendation service. Please tap retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startGeneration();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {error ? (
          <View style={styles.errorContainer}>
            <AlertCircle size={48} color={COLORS.danger} style={styles.errorIcon} />
            <Text style={styles.errorTitle}>Plan Generation Paused</Text>
            <Text style={styles.errorDesc}>{error}</Text>
            <Button
              title="Try Again"
              onPress={startGeneration}
              variant="primary"
              size="lg"
              style={styles.retryBtn}
            />
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <View style={styles.iconCircle}>
              <Sparkles size={36} color={COLORS.primary} />
            </View>

            <Text style={styles.phaseTitle}>
              {PHASES[phaseIndex]?.text || "Personalizing your plan..."}
            </Text>
            <Text style={styles.phaseSubtitle}>
              Our clinical recommendation engine is tailoring daily goals specifically to your physiological profile.
            </Text>

            <View style={styles.progressContainer}>
              <ProgressBar progress={progress} height={8} />
              <Text style={styles.percentText}>{Math.round(progress * 100)}%</Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    width: "100%",
    alignItems: "center",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  phaseTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 12,
  },
  phaseSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 36,
    lineHeight: 22,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
  },
  percentText: {
    ...TYPOGRAPHY.label,
    color: COLORS.primaryLight,
    marginTop: 12,
    fontWeight: "700",
  },
  errorContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  errorIcon: {
    marginBottom: 20,
  },
  errorTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: 10,
    textAlign: "center",
  },
  errorDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  retryBtn: {
    minWidth: 200,
  },
});
