import React, { useEffect, useState } from "react";
import {
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import API from "../../services/api";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "../../constants/theme";
import Button from "../../components/ui/Button";
import Chip from "../../components/ui/Chip";
import StepIndicator from "../../components/ui/StepIndicator";
import {
  CRAVING_FREQUENCY_OPTIONS,
  DURATION_OPTIONS,
  LONGEST_SMOKE_FREE_OPTIONS,
  QUIT_METHODS_OPTIONS,
  QUIT_TIMELINE_OPTIONS,
  RELAPSE_REASON_OPTIONS,
  SmokerQuestionnaireState,
  TIME_TO_FIRST_USE_OPTIONS,
  TOBACCO_PRODUCTS,
  TRIGGER_OPTIONS,
} from "../../constants/questionnaire/smokerQuestions";

const DRAFT_STORAGE_KEY = "navjivan_smoker_questionnaire_draft";

export default function SmokerQuestionnaireScreen() {
  const router = useRouter();

  const [section, setSection] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [state, setState] = useState<SmokerQuestionnaireState>({
    tobaccoProduct: ["cigarettes"],
    durationOfUse: "1_to_3_yrs",
    frequencyPerDay: 12,
    timeToFirstUse: "6_to_30_min",
    nightUse: false,
    dailySpend: 180,

    cravingFrequency: "several_times_day",
    cravingIntensity: 3,
    cravingResistance: 3,

    triggers: ["stress", "after_meals"],

    triedQuitBefore: true,
    previousQuitAttempts: 1,
    previousQuitMethods: ["stopped_suddenly"],
    longestSmokeFreePeriod: "1_to_7_days",
    relapseReasons: ["stress"],

    motivationScore: 8,
    confidenceScore: 7,
    importanceScore: 9,
    quitTimeline: "immediately",
    socialSupport: "yes",
    emergencyContactAvailable: true,
  });

  // Load draft from AsyncStorage on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const saved = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setState((prev) => ({ ...prev, ...parsed }));
        }
      } catch {}
    };
    loadDraft();
  }, []);

  const saveDraft = async (updated: SmokerQuestionnaireState) => {
    try {
      await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleNextSection = async () => {
    setErrorMessage("");

    // Validate per section
    if (section === 1) {
      if (!state.tobaccoProduct.length) {
        setErrorMessage("Please select at least one tobacco product.");
        return;
      }
    } else if (section === 3) {
      if (!state.triggers.length) {
        setErrorMessage("Please select at least one trigger.");
        return;
      }
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    await saveDraft(state);

    if (section < 5) {
      setSection((prev) => prev + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleBackSection = () => {
    setErrorMessage("");
    if (section > 1) {
      setSection((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const res = await API.post("/api/v1/questionnaire/submit", {
        userType: "smoker",
        rawAnswers: state,
      });

      if (res.data?.success) {
        await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
        router.replace("/onboarding/recommendation-loading" as any);
      } else {
        setErrorMessage("Could not submit questionnaire. Please try again.");
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      // Even if offline, navigate to recommendation loading
      router.replace("/onboarding/recommendation-loading" as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleProduct = (id: string) => {
    setState((prev) => {
      const exists = prev.tobaccoProduct.includes(id);
      const next = exists
        ? prev.tobaccoProduct.filter((p) => p !== id)
        : [...prev.tobaccoProduct, id];
      return { ...prev, tobaccoProduct: next };
    });
  };

  const toggleTrigger = (id: string) => {
    setState((prev) => {
      const exists = prev.triggers.includes(id);
      const next = exists
        ? prev.triggers.filter((t) => t !== id)
        : [...prev.triggers, id];
      return { ...prev, triggers: next };
    });
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
          {/* Header row */}
          <View style={styles.topRow}>
            <Pressable onPress={handleBackSection} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </Pressable>
            <StepIndicator
              currentStep={section}
              totalSteps={5}
              label={`Section ${section} of 5`}
            />
            <View style={styles.backButtonPlaceholder} />
          </View>

          {/* SECTION 1: TOBACCO PROFILE */}
          {section === 1 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Tobacco Profile</Text>
              <Text style={styles.sectionSubtitle}>
                Tell us about your current habits and dependency patterns
              </Text>

              {/* Q1 */}
              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>What tobacco do you currently use?</Text>
                <View style={styles.chipsWrap}>
                  {TOBACCO_PRODUCTS.map((prod) => (
                    <Chip
                      key={prod.id}
                      label={prod.label}
                      selected={state.tobaccoProduct.includes(prod.id)}
                      onPress={() => toggleProduct(prod.id)}
                    />
                  ))}
                </View>
              </View>

              {/* Q2 */}
              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>How long have you used tobacco?</Text>
                <View style={styles.chipsWrap}>
                  {DURATION_OPTIONS.map((dur) => (
                    <Chip
                      key={dur.id}
                      label={dur.label}
                      selected={state.durationOfUse === dur.id}
                      onPress={() => setState({ ...state, durationOfUse: dur.id })}
                    />
                  ))}
                </View>
              </View>

              {/* Q3 */}
              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>
                  How many times per day? ({state.frequencyPerDay} uses/day)
                </Text>
                <View style={styles.stepperRow}>
                  <Pressable
                    style={styles.stepperBtn}
                    onPress={() =>
                      setState((prev) => ({
                        ...prev,
                        frequencyPerDay: Math.max(1, prev.frequencyPerDay - 1),
                      }))
                    }
                  >
                    <Text style={styles.stepperBtnText}>-</Text>
                  </Pressable>
                  <Text style={styles.stepperVal}>{state.frequencyPerDay}</Text>
                  <Pressable
                    style={styles.stepperBtn}
                    onPress={() =>
                      setState((prev) => ({
                        ...prev,
                        frequencyPerDay: Math.min(60, prev.frequencyPerDay + 1),
                      }))
                    }
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>

              {/* Q4 */}
              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>
                  How soon after waking do you use tobacco?
                </Text>
                <Text style={styles.questionHint}>
                  One of the strongest indicators of neurological physical dependence.
                </Text>
                <View style={styles.chipsWrap}>
                  {TIME_TO_FIRST_USE_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.id}
                      label={opt.label}
                      selected={state.timeToFirstUse === opt.id}
                      onPress={() => setState({ ...state, timeToFirstUse: opt.id })}
                    />
                  ))}
                </View>
              </View>

              {/* Q5 */}
              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>Do you ever wake up at night to use tobacco?</Text>
                <View style={styles.toggleRow}>
                  <Chip
                    label="Yes"
                    selected={state.nightUse}
                    onPress={() => setState({ ...state, nightUse: true })}
                  />
                  <Chip
                    label="No"
                    selected={!state.nightUse}
                    onPress={() => setState({ ...state, nightUse: false })}
                  />
                </View>
              </View>

              {/* Q6 */}
              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>Estimated daily spend (₹)</Text>
                <TextInput
                  style={styles.numberInput}
                  value={String(state.dailySpend)}
                  onChangeText={(val) =>
                    setState({ ...state, dailySpend: Number(val) || 0 })
                  }
                  keyboardType="numeric"
                  placeholder="180"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>
          )}

          {/* SECTION 2: CRAVINGS */}
          {section === 2 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Cravings Assessment</Text>
              <Text style={styles.sectionSubtitle}>
                Understanding the frequency and intensity of your urges
              </Text>

              {/* Q7 */}
              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>
                  How often do you feel a strong urge to smoke?
                </Text>
                <View style={styles.chipsWrap}>
                  {CRAVING_FREQUENCY_OPTIONS.map((freq) => (
                    <Chip
                      key={freq.id}
                      label={freq.label}
                      selected={state.cravingFrequency === freq.id}
                      onPress={() => setState({ ...state, cravingFrequency: freq.id })}
                    />
                  ))}
                </View>
              </View>

              {/* Q8 */}
              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>
                  Average Craving Intensity: {state.cravingIntensity} / 5
                </Text>
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <Pressable
                      key={lvl}
                      style={[
                        styles.ratingCircle,
                        state.cravingIntensity === lvl && styles.ratingCircleActive,
                      ]}
                      onPress={() => setState({ ...state, cravingIntensity: lvl })}
                    >
                      <Text
                        style={[
                          styles.ratingText,
                          state.cravingIntensity === lvl && styles.ratingTextActive,
                        ]}
                      >
                        {lvl}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Q9 */}
              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>
                  Difficulty Resisting a Craving: {state.cravingResistance} / 5
                </Text>
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <Pressable
                      key={lvl}
                      style={[
                        styles.ratingCircle,
                        state.cravingResistance === lvl && styles.ratingCircleActive,
                      ]}
                      onPress={() => setState({ ...state, cravingResistance: lvl })}
                    >
                      <Text
                        style={[
                          styles.ratingText,
                          state.cravingResistance === lvl && styles.ratingTextActive,
                        ]}
                      >
                        {lvl}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* SECTION 3: TRIGGERS */}
          {section === 3 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Relapse Triggers</Text>
              <Text style={styles.sectionSubtitle}>
                Select the external and emotional moments that trigger tobacco use
              </Text>

              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>
                  What triggers your tobacco use? ({state.triggers.length} selected)
                </Text>
                <View style={styles.chipsWrap}>
                  {TRIGGER_OPTIONS.map((trig) => (
                    <Chip
                      key={trig.id}
                      label={trig.label}
                      selected={state.triggers.includes(trig.id)}
                      onPress={() => toggleTrigger(trig.id)}
                    />
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* SECTION 4: QUIT HISTORY (BRANCHING) */}
          {section === 4 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Quit History</Text>
              <Text style={styles.sectionSubtitle}>
                Learning from previous experiences to build resilience
              </Text>

              {/* Q11: Branching point */}
              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>Have you tried to quit before?</Text>
                <View style={styles.toggleRow}>
                  <Chip
                    label="Yes, I have tried before"
                    selected={state.triedQuitBefore}
                    onPress={() => setState({ ...state, triedQuitBefore: true })}
                  />
                  <Chip
                    label="No, this is my first time"
                    selected={!state.triedQuitBefore}
                    onPress={() => setState({ ...state, triedQuitBefore: false })}
                  />
                </View>
              </View>

              {state.triedQuitBefore && (
                <>
                  {/* Q13 */}
                  <View style={styles.questionBlock}>
                    <Text style={styles.questionLabel}>What method did you use previously?</Text>
                    <View style={styles.chipsWrap}>
                      {QUIT_METHODS_OPTIONS.map((meth) => (
                        <Chip
                          key={meth.id}
                          label={meth.label}
                          selected={(state.previousQuitMethods || []).includes(meth.id)}
                          onPress={() => {
                            const cur = state.previousQuitMethods || [];
                            const next = cur.includes(meth.id)
                              ? cur.filter((m) => m !== meth.id)
                              : [...cur, meth.id];
                            setState({ ...state, previousQuitMethods: next });
                          }}
                        />
                      ))}
                    </View>
                  </View>

                  {/* Q14 */}
                  <View style={styles.questionBlock}>
                    <Text style={styles.questionLabel}>Longest smoke-free period achieved?</Text>
                    <View style={styles.chipsWrap}>
                      {LONGEST_SMOKE_FREE_OPTIONS.map((opt) => (
                        <Chip
                          key={opt.id}
                          label={opt.label}
                          selected={state.longestSmokeFreePeriod === opt.id}
                          onPress={() => setState({ ...state, longestSmokeFreePeriod: opt.id })}
                        />
                      ))}
                    </View>
                  </View>

                  {/* Q15 */}
                  <View style={styles.questionBlock}>
                    <Text style={styles.questionLabel}>What caused you to restart?</Text>
                    <View style={styles.chipsWrap}>
                      {RELAPSE_REASON_OPTIONS.map((rel) => (
                        <Chip
                          key={rel.id}
                          label={rel.label}
                          selected={(state.relapseReasons || []).includes(rel.id)}
                          onPress={() => {
                            const cur = state.relapseReasons || [];
                            const next = cur.includes(rel.id)
                              ? cur.filter((r) => r !== rel.id)
                              : [...cur, rel.id];
                            setState({ ...state, relapseReasons: next });
                          }}
                        />
                      ))}
                    </View>
                  </View>
                </>
              )}
            </View>
          )}

          {/* SECTION 5: MOTIVATION & READINESS */}
          {section === 5 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Motivation & Readiness</Text>
              <Text style={styles.sectionSubtitle}>
                Calibrating your mental mindset and support network
              </Text>

              {/* Q16 */}
              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>
                  How motivated are you to quit? ({state.motivationScore}/10)
                </Text>
                <View style={styles.scaleRow}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <Pressable
                      key={num}
                      style={[
                        styles.scaleSquare,
                        state.motivationScore === num && styles.scaleSquareActive,
                      ]}
                      onPress={() => setState({ ...state, motivationScore: num })}
                    >
                      <Text
                        style={[
                          styles.scaleText,
                          state.motivationScore === num && styles.scaleTextActive,
                        ]}
                      >
                        {num}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Q17 */}
              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>
                  How confident are you that you can quit? ({state.confidenceScore}/10)
                </Text>
                <View style={styles.scaleRow}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <Pressable
                      key={num}
                      style={[
                        styles.scaleSquare,
                        state.confidenceScore === num && styles.scaleSquareActive,
                      ]}
                      onPress={() => setState({ ...state, confidenceScore: num })}
                    >
                      <Text
                        style={[
                          styles.scaleText,
                          state.confidenceScore === num && styles.scaleTextActive,
                        ]}
                      >
                        {num}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Q19 */}
              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>When do you want to quit?</Text>
                <View style={styles.chipsWrap}>
                  {QUIT_TIMELINE_OPTIONS.map((time) => (
                    <Chip
                      key={time.id}
                      label={time.label}
                      selected={state.quitTimeline === time.id}
                      onPress={() => setState({ ...state, quitTimeline: time.id })}
                    />
                  ))}
                </View>
              </View>

              {/* Q20 */}
              <View style={styles.questionBlock}>
                <Text style={styles.questionLabel}>
                  Does anyone close to you support your quitting?
                </Text>
                <View style={styles.toggleRow}>
                  <Chip
                    label="Yes"
                    selected={state.socialSupport === "yes"}
                    onPress={() => setState({ ...state, socialSupport: "yes" })}
                  />
                  <Chip
                    label="Not Sure"
                    selected={state.socialSupport === "not_sure"}
                    onPress={() => setState({ ...state, socialSupport: "not_sure" })}
                  />
                  <Chip
                    label="No"
                    selected={state.socialSupport === "no"}
                    onPress={() => setState({ ...state, socialSupport: "no" })}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Error display */}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {/* Navigation CTA */}
          <View style={styles.footer}>
            <Button
              title={
                section === 5
                  ? isSubmitting
                    ? "Generating Plan..."
                    : "Generate My Plan 🚀"
                  : "Continue"
              }
              onPress={handleNextSection}
              variant="primary"
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
  questionBlock: {
    marginBottom: 24,
  },
  questionLabel: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  questionHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  toggleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 8,
    maxWidth: 180,
    justifyContent: "space-between",
  },
  stepperBtn: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  stepperVal: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  numberInput: {
    height: 52,
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    color: COLORS.textPrimary,
    fontSize: 16,
    maxWidth: 200,
  },
  ratingRow: {
    flexDirection: "row",
    gap: 12,
  },
  ratingCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceRaised,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  ratingText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textSecondary,
  },
  ratingTextActive: {
    color: COLORS.textInverse,
    fontWeight: "700",
  },
  scaleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  scaleSquare: {
    width: 32,
    height: 38,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceRaised,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  scaleSquareActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  scaleText: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
  },
  scaleTextActive: {
    color: COLORS.textInverse,
    fontWeight: "700",
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    marginBottom: 16,
  },
  footer: {
    marginTop: 16,
  },
});
