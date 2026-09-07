import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, AlertTriangle } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import API from "../../services/api";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "../../constants/theme";
import Button from "../../components/ui/Button";
import Chip from "../../components/ui/Chip";
import StepIndicator from "../../components/ui/StepIndicator";
import {
  ACTIVITY_OPTIONS,
  DIET_OPTIONS,
  FitnessQuestionnaireState,
  PRIMARY_GOALS,
} from "../../constants/questionnaire/fitnessQuestions";

export default function FitnessQuestionnaireScreen() {
  const router = useRouter();

  const [section, setSection] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [state, setState] = useState<FitnessQuestionnaireState>({
    primaryGoal: "improve_fitness",
    activityFrequency: "3-4",
    activityDurationMinutes: 30,
    currentActivities: ["walking", "yoga"],
    fitnessLevel: "beginner",
    dailySteps: "5000-8000",
    availableExerciseMinutes: 30,

    preferredActivities: ["walking", "yoga"],
    exerciseLocation: "home",
    socialPreference: "alone",
    motivation: ["better_health"],

    dietType: "vegetarian",
    mealsPerDay: 3,
    fastFoodFrequency: "rarely",
    sugaryDrinksFrequency: "rarely",
    waterIntakeLitres: 2.5,
    nutritionGoal: "healthy_eating",
    foodAvoidances: "",

    sleepHours: 7,
    sleepQuality: "good",
    stressLevel: "moderate",
    sedentaryHours: "4-6h",
    daytimeTiredness: "sometimes",

    heartCondition: false,
    chestPain: false,
    dizziness: false,
    boneJointCondition: false,
    doctorAdvisedAgainstExercise: false,
    hasSafetyRisk: false,
  });

  const handleNext = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (section < 6) {
      setSection((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    // Check safety screening flags
    const hasRisk =
      state.heartCondition ||
      state.chestPain ||
      state.dizziness ||
      state.boneJointCondition ||
      state.doctorAdvisedAgainstExercise;

    const payload = {
      ...state,
      hasSafetyRisk: hasRisk,
    };

    if (hasRisk) {
      Alert.alert(
        "Health Safety Recommendation",
        "Based on your safety check answers, we recommend consulting your physician before starting any intense workouts. Your plan will be gentle, progressive, and health-focused.",
        [
          {
            text: "I understand, continue",
            onPress: () => submitApi(payload),
          },
        ]
      );
    } else {
      await submitApi(payload);
    }
  };

  const submitApi = async (payload: any) => {
    try {
      setIsSubmitting(true);
      await API.post("/api/v1/questionnaire/submit", {
        userType: "non-smoker",
        rawAnswers: payload,
      });

      router.replace("/onboarding/recommendation-loading" as any);
    } catch (err) {
      console.error("Fitness questionnaire submit error:", err);
      router.replace("/onboarding/recommendation-loading" as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.topRow}>
            <Pressable
              onPress={() => (section > 1 ? setSection(section - 1) : router.back())}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </Pressable>
            <StepIndicator
              currentStep={section}
              totalSteps={6}
              label={`Section ${section} of 6`}
              accent="secondary"
            />
            <View style={styles.backButtonPlaceholder} />
          </View>

          {/* SECTION 1: PRIMARY GOAL */}
          {section === 1 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Primary Health Goal</Text>
              <Text style={styles.sectionSubtitle}>
                What is your central focus for this fitness phase?
              </Text>

              <View style={styles.goalsContainer}>
                {PRIMARY_GOALS.map((g) => (
                  <Pressable
                    key={g.id}
                    style={[
                      styles.goalCard,
                      state.primaryGoal === g.id && styles.goalCardActive,
                    ]}
                    onPress={() => setState({ ...state, primaryGoal: g.id })}
                  >
                    <Text style={styles.goalTitle}>{g.title}</Text>
                    <Text style={styles.goalDesc}>{g.desc}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* SECTION 2: PHYSICAL ACTIVITY */}
          {section === 2 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Current Activity Levels</Text>
              <Text style={styles.sectionSubtitle}>
                Calibrating your baseline cardiovascular volume
              </Text>

              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>Current Fitness Level</Text>
                <View style={styles.chipsWrap}>
                  {["beginner", "intermediate", "advanced"].map((lvl) => (
                    <Chip
                      key={lvl}
                      label={lvl.toUpperCase()}
                      selected={state.fitnessLevel === lvl}
                      onPress={() => setState({ ...state, fitnessLevel: lvl as any })}
                      accent="secondary"
                    />
                  ))}
                </View>
              </View>

              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>Days Active Per Week</Text>
                <View style={styles.chipsWrap}>
                  {["0", "1-2", "3-4", "5-6", "every_day"].map((d) => (
                    <Chip
                      key={d}
                      label={d === "every_day" ? "Every Day" : `${d} Days`}
                      selected={state.activityFrequency === d}
                      onPress={() => setState({ ...state, activityFrequency: d })}
                      accent="secondary"
                    />
                  ))}
                </View>
              </View>

              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>Time Available for Exercise Daily</Text>
                <View style={styles.chipsWrap}>
                  {[15, 30, 45, 60].map((mins) => (
                    <Chip
                      key={mins}
                      label={`${mins} Minutes`}
                      selected={state.availableExerciseMinutes === mins}
                      onPress={() => setState({ ...state, availableExerciseMinutes: mins })}
                      accent="secondary"
                    />
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* SECTION 3: PREFERENCES */}
          {section === 3 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Exercise Preferences</Text>
              <Text style={styles.sectionSubtitle}>
                Which activities make you feel strongest and most engaged?
              </Text>

              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>Favorite Activities</Text>
                <View style={styles.chipsWrap}>
                  {ACTIVITY_OPTIONS.map((act) => (
                    <Chip
                      key={act.id}
                      label={act.label}
                      selected={state.preferredActivities.includes(act.id)}
                      onPress={() => {
                        const cur = state.preferredActivities;
                        const next = cur.includes(act.id)
                          ? cur.filter((a) => a !== act.id)
                          : [...cur, act.id];
                        setState({ ...state, preferredActivities: next });
                      }}
                      accent="secondary"
                    />
                  ))}
                </View>
              </View>

              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>Preferred Location</Text>
                <View style={styles.chipsWrap}>
                  {["home", "gym", "outdoor", "park"].map((loc) => (
                    <Chip
                      key={loc}
                      label={loc.toUpperCase()}
                      selected={state.exerciseLocation === loc}
                      onPress={() => setState({ ...state, exerciseLocation: loc })}
                      accent="secondary"
                    />
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* SECTION 4: NUTRITION */}
          {section === 4 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Nutrition & Hydration</Text>
              <Text style={styles.sectionSubtitle}>Fueling muscle recovery and vitality</Text>

              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>Dietary Preference</Text>
                <View style={styles.chipsWrap}>
                  {DIET_OPTIONS.map((diet) => (
                    <Chip
                      key={diet.id}
                      label={diet.label}
                      selected={state.dietType === diet.id}
                      onPress={() => setState({ ...state, dietType: diet.id })}
                      accent="secondary"
                    />
                  ))}
                </View>
              </View>

              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>
                  Daily Water Intake ({state.waterIntakeLitres} L)
                </Text>
                <View style={styles.chipsWrap}>
                  {[1.5, 2.0, 2.5, 3.0, 4.0].map((litres) => (
                    <Chip
                      key={litres}
                      label={`${litres} Litres`}
                      selected={state.waterIntakeLitres === litres}
                      onPress={() => setState({ ...state, waterIntakeLitres: litres })}
                      accent="secondary"
                    />
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* SECTION 5: SLEEP & STRESS */}
          {section === 5 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Sleep & Recovery</Text>
              <Text style={styles.sectionSubtitle}>Essential components of nervous system health</Text>

              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>Average Sleep Duration</Text>
                <View style={styles.chipsWrap}>
                  {[5, 6, 7, 8, 9].map((hrs) => (
                    <Chip
                      key={hrs}
                      label={`${hrs} Hours`}
                      selected={state.sleepHours === hrs}
                      onPress={() => setState({ ...state, sleepHours: hrs })}
                      accent="secondary"
                    />
                  ))}
                </View>
              </View>

              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>Daily Stress Level</Text>
                <View style={styles.chipsWrap}>
                  {["low", "moderate", "high", "very_high"].map((st) => (
                    <Chip
                      key={st}
                      label={st.replace("_", " ").toUpperCase()}
                      selected={state.stressLevel === st}
                      onPress={() => setState({ ...state, stressLevel: st })}
                      accent="secondary"
                    />
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* SECTION 6: SAFETY SCREENING */}
          {section === 6 && (
            <View style={styles.sectionContainer}>
              <View style={styles.safetyHeader}>
                <AlertTriangle size={24} color={COLORS.warning} style={styles.safetyIcon} />
                <Text style={styles.sectionTitle}>Quick Health Check</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                This ensures our physical recommendations are safe for your body.
              </Text>

              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>
                  Has a doctor ever said you have a heart condition?
                </Text>
                <View style={styles.toggleRow}>
                  <Chip
                    label="Yes"
                    selected={state.heartCondition}
                    onPress={() => setState({ ...state, heartCondition: true })}
                  />
                  <Chip
                    label="No"
                    selected={!state.heartCondition}
                    onPress={() => setState({ ...state, heartCondition: false })}
                  />
                </View>
              </View>

              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>
                  Do you experience chest pain during physical activity?
                </Text>
                <View style={styles.toggleRow}>
                  <Chip
                    label="Yes"
                    selected={state.chestPain}
                    onPress={() => setState({ ...state, chestPain: true })}
                  />
                  <Chip
                    label="No"
                    selected={!state.chestPain}
                    onPress={() => setState({ ...state, chestPain: false })}
                  />
                </View>
              </View>

              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>
                  Have you experienced unexplained dizziness or fainting?
                </Text>
                <View style={styles.toggleRow}>
                  <Chip
                    label="Yes"
                    selected={state.dizziness}
                    onPress={() => setState({ ...state, dizziness: true })}
                  />
                  <Chip
                    label="No"
                    selected={!state.dizziness}
                    onPress={() => setState({ ...state, dizziness: false })}
                  />
                </View>
              </View>
            </View>
          )}

          <View style={styles.footer}>
            <Button
              title={
                section === 6
                  ? isSubmitting
                    ? "Generating Plan..."
                    : "Generate My Wellness Plan 🚀"
                  : "Continue"
              }
              onPress={handleNext}
              variant="secondary"
              size="lg"
              loading={isSubmitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonPlaceholder: {
    width: 44,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  safetyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  safetyIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  goalsContainer: {
    gap: 12,
  },
  goalCard: {
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  goalCardActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondaryDim,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  goalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  goalDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  questionBlock: {
    marginBottom: 24,
  },
  questionLabel: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
  },
  footer: {
    marginTop: 16,
  },
});
