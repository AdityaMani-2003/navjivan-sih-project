import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import API from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from "../../constants/theme";
import GlassCard from "../../components/ui/GlassCard";
import GradientButton from "../../components/ui/GradientButton";

interface AuthResponse {
  token: string;
  user: any;
}

export default function LoginScreen() {
  const router = useRouter();
  const auth: any = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_e) {}

      const res = await API.post<AuthResponse>("/auth/login", {
        email: email.trim(),
        password,
      });

      if (res?.data?.token) {
        await auth.loginUser(res.data.user, res.data.token);
        router.replace("/(tabs)");
      } else {
        setError("Invalid response from server.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Could not connect to server. Try Quick Demo Login below."
      );
    } finally {
      setLoading(false);
    }
  };

  const onDemoLogin = async (type: "smoker" | "non-smoker") => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const demoUser = {
        _id: "demo_user_123",
        name: type === "smoker" ? "Aditya (Smoke-Free)" : "Aditya (Athlete)",
        email: "demo@navjivan.app",
        userType: type,
        streak: 4,
        xp: 520,
        smokerProfile: {
          cigarettesPerDay: 12,
          yearsSmoking: 4,
          triggers: ["Morning Chai ☕", "Work Stress 💻", "After Meals 🍽️"],
          quitStrategy: "gradual",
          costPerPack: 360,
          quitDate: new Date(Date.now() - 4 * 86400000).toISOString(),
        },
        fitnessProfile: {
          goal: "Endurance & Vitality",
          level: "intermediate",
          sport: "Cricket",
          workoutDays: ["Mon", "Wed", "Fri", "Sat"],
        },
      };

      await auth.loginUser(demoUser, "demo_jwt_token_sample");
      router.replace("/(tabs)");
    } catch (_e) {
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <Ionicons name="sparkles" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>
              Navjivan <Text style={{ color: COLORS.primary }}>×</Text> LastPuff
            </Text>
            <Text style={styles.subtitle}>
              Next-Gen Health, Cessation & Athletic Performance
            </Text>
          </View>

          {/* Login Card */}
          <GlassCard style={styles.card} gradientBorder>
            <Text style={styles.cardTitle}>Sign In to Your Account</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Email Field */}
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password Field */}
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <GradientButton
              title="Sign In 🚀"
              onPress={onLogin}
              loading={loading}
              colors={COLORS.gradientPrimary}
              style={{ marginTop: SPACING.sm }}
            />

            {/* Switch to Signup */}
            <View style={styles.switchRow}>
              <Text style={styles.switchPrompt}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/auth/signup")}>
                <Text style={styles.switchLink}>Create One</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* Instant Demo Access (No friction testing) */}
          <View style={styles.demoSection}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR EXPLORE INSTANTLY</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => onDemoLogin("smoker")}
              activeOpacity={0.8}
            >
              <View style={[styles.demoIconBox, { backgroundColor: "rgba(0, 245, 160, 0.15)" }]}>
                <Ionicons name="flame" size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.demoBtnTitle}>Launch as Smoker (LastPuff)</Text>
                <Text style={styles.demoBtnSub}>Live seconds ticker, 4-7-8 SOS & quit plan</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoButton, { marginTop: SPACING.sm }]}
              onPress={() => onDemoLogin("non-smoker")}
              activeOpacity={0.8}
            >
              <View style={[styles.demoIconBox, { backgroundColor: "rgba(139, 92, 246, 0.15)" }]}>
                <Ionicons name="barbell" size={18} color={COLORS.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.demoBtnTitle}>Launch as Athlete (Navjivan)</Text>
                <Text style={styles.demoBtnSub}>Activity rings, Padyatra steps & nutrition</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    justifyContent: "center",
  },
  brandHeader: {
    alignItems: "center",
    marginBottom: SPACING.xl,
    marginTop: SPACING.sm,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 4,
    maxWidth: 280,
  },
  card: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  cardTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 56, 92, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 56, 92, 0.3)",
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm + 4,
    height: 50,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  eyeBtn: {
    padding: SPACING.xs,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.md,
  },
  switchPrompt: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  switchLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  demoSection: {
    marginTop: SPACING.xl,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  demoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  demoIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  demoBtnTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  demoBtnSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
