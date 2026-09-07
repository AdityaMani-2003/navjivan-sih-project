import React, { useContext, useState } from "react";
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
import { ArrowLeft, Check, Eye, EyeOff, ShieldAlert } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import API from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "../../constants/theme";
import Button from "../../components/ui/Button";
import StepIndicator from "../../components/ui/StepIndicator";
import Chip from "../../components/ui/Chip";

export default function RegisterScreen() {
  const router = useRouter();
  const auth = useContext(AuthContext);

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 fields
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNextStep = () => {
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setStep(2);
  };

  const handleRegister = async () => {
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/api/v1/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        age: age ? Number(age) : undefined,
        gender,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
      });

      if (res?.data?.token) {
        await auth.loginUser(res.data.user, res.data.token, res.data.refreshToken);
        router.replace("/onboarding/smoking-status" as any);
      } else {
        setError("Account created, but authentication response was invalid.");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Could not create account. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
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
          {/* Top Bar with Step Indicator */}
          <View style={styles.topBar}>
            {step === 2 ? (
              <Pressable
                onPress={() => setStep(1)}
                style={styles.backBtn}
                accessibilityRole="button"
              >
                <ArrowLeft size={24} color={COLORS.textPrimary} />
              </Pressable>
            ) : (
              <View style={styles.backBtnPlaceholder} />
            )}
            <StepIndicator currentStep={step} totalSteps={2} style={styles.stepInd} />
            <View style={styles.backBtnPlaceholder} />
          </View>

          {/* Screen Title */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {step === 1 ? "Create Account" : "About You"}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? "Start your personalized wellness transformation"
                : "Help us calibrate recommendations for your physiology"}
            </Text>
          </View>

          {/* Step 1 Form */}
          {step === 1 && (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Aditya Sharma"
                  placeholderTextColor={COLORS.textMuted}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (error) setError("");
                  }}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="aditya@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password (min 6 characters)</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Create a strong password"
                    placeholderTextColor={COLORS.textMuted}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (error) setError("");
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={COLORS.textSecondary} />
                    ) : (
                      <Eye size={20} color={COLORS.textSecondary} />
                    )}
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter your password"
                  placeholderTextColor={COLORS.textMuted}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (error) setError("");
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
              </View>

              {error ? (
                <View style={styles.errorBanner}>
                  <ShieldAlert size={20} color={COLORS.danger} style={styles.errorIcon} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Button
                title="Continue to Step 2"
                onPress={handleNextStep}
                variant="primary"
                size="lg"
                style={styles.submitBtn}
              />
            </View>
          )}

          {/* Step 2 Form */}
          {step === 2 && (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 26"
                  placeholderTextColor={COLORS.textMuted}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Gender</Text>
                <View style={styles.chipsRow}>
                  <Chip
                    label="Male"
                    selected={gender === "male"}
                    onPress={() => setGender("male")}
                  />
                  <Chip
                    label="Female"
                    selected={gender === "female"}
                    onPress={() => setGender("female")}
                  />
                  <Chip
                    label="Other"
                    selected={gender === "other"}
                    onPress={() => setGender("other")}
                  />
                </View>
              </View>

              <View style={styles.rowTwo}>
                <View style={[styles.inputGroup, styles.halfCol]}>
                  <Text style={styles.inputLabel}>Height (cm)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="175"
                    placeholderTextColor={COLORS.textMuted}
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfCol]}>
                  <Text style={styles.inputLabel}>Weight (kg)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="70"
                    placeholderTextColor={COLORS.textMuted}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              {/* Terms Checkbox */}
              <Pressable
                style={styles.termsRow}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  setAgreedToTerms(!agreedToTerms);
                  if (error) setError("");
                }}
                accessibilityRole="checkbox"
              >
                <View
                  style={[
                    styles.checkbox,
                    agreedToTerms && styles.checkboxActive,
                  ]}
                >
                  {agreedToTerms && <Check size={16} color={COLORS.textInverse} />}
                </View>
                <Text style={styles.termsText}>
                  I agree to the Terms of Service and Privacy Policy (required)
                </Text>
              </Pressable>

              {error ? (
                <View style={styles.errorBanner}>
                  <ShieldAlert size={20} color={COLORS.danger} style={styles.errorIcon} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Button
                title={loading ? "Creating Account..." : "Create Account"}
                onPress={handleRegister}
                variant="primary"
                size="lg"
                loading={loading}
                disabled={!agreedToTerms}
                style={styles.submitBtn}
              />
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => router.push("/auth/login" as any)}>
              <Text style={styles.loginLink}>Sign In</Text>
            </Pressable>
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
    minHeight: "100%",
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.md,
  },
  backBtnPlaceholder: {
    width: 44,
  },
  stepInd: {
    marginVertical: 0,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  passwordContainer: {
    height: 52,
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    height: "100%",
  },
  eyeBtn: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  rowTwo: {
    flexDirection: "row",
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
    paddingVertical: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  termsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    flex: 1,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.dangerDim,
    borderColor: COLORS.danger,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 10,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    flex: 1,
  },
  submitBtn: {
    marginTop: 8,
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  footerText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  loginLink: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.primary,
    fontWeight: "700",
  },
});
