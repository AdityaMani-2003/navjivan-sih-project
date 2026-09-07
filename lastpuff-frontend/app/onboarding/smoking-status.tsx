import React, { useContext, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Cigarette, Dumbbell } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import API from "../../services/api";
import { AuthContext, UserType } from "../../context/AuthContext";
import { UserContext } from "../../context/UserContext";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "../../constants/theme";
import Button from "../../components/ui/Button";

export default function SmokingStatusScreen() {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const userCtx = useContext(UserContext);

  const [selected, setSelected] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = (type: UserType) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setSelected(type);
  };

  const handleContinue = async () => {
    if (!selected) return;

    try {
      setLoading(true);

      // Persist to backend and context
      await API.put("/api/v1/profile/usertype", { userType: selected });
      await userCtx.setUserType(selected);
      if (auth.user) {
        await auth.updateUser({ userType: selected });
      }

      if (selected === "smoker") {
        router.push("/onboarding/smoker-questionnaire" as any);
      } else {
        router.push("/onboarding/fitness-questionnaire" as any);
      }
    } catch (err) {
      console.warn("Could not sync userType, proceeding with local state:", err);
      if (selected === "smoker") {
        router.push("/onboarding/smoker-questionnaire" as any);
      } else {
        router.push("/onboarding/fitness-questionnaire" as any);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>One quick question</Text>
          <Text style={styles.subtitle}>This helps us build the right plan for you</Text>
        </View>

        {/* Choice Cards */}
        <View style={styles.cardsContainer}>
          {/* Card A: Smoker */}
          <Pressable
            onPress={() => handleSelect("smoker")}
            style={[
              styles.card,
              selected === "smoker" && styles.cardSmokerSelected,
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: selected === "smoker" }}
          >
            <View style={styles.iconCircleWarning}>
              <Cigarette size={24} color={COLORS.warning} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Yes, I use tobacco</Text>
              <Text style={styles.cardSubtitle}>
                I want guidance quitting or gradually reducing
              </Text>
            </View>
          </Pressable>

          {/* Card B: Non-Smoker / Fitness */}
          <Pressable
            onPress={() => handleSelect("non-smoker")}
            style={[
              styles.card,
              selected === "non-smoker" && styles.cardFitnessSelected,
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: selected === "non-smoker" }}
          >
            <View style={styles.iconCirclePrimary}>
              <Dumbbell size={24} color={COLORS.primary} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>No, I don't use tobacco</Text>
              <Text style={styles.cardSubtitle}>
                I want to improve my general health, stamina, and fitness
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Continue Button */}
        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            variant={selected === "non-smoker" ? "secondary" : "primary"}
            size="lg"
            disabled={!selected || loading}
            loading={loading}
          />
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  header: {
    marginBottom: 28,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    height: 140,
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    justifyContent: "center",
  },
  cardSmokerSelected: {
    backgroundColor: COLORS.warningDim,
    borderColor: COLORS.warning,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  cardFitnessSelected: {
    backgroundColor: COLORS.primaryDim,
    borderColor: COLORS.primary,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  iconCircleWarning: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(245, 158, 11, 0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  iconCirclePrimary: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(16, 185, 129, 0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardTextContainer: {
    justifyContent: "center",
  },
  cardTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  footer: {
    paddingTop: 20,
  },
});
