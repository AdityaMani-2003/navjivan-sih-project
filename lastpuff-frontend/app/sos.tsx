import React, { useContext, useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import * as Haptics from "expo-haptics";
import ConfettiCannon from "react-native-confetti-cannon";
import Toast from "react-native-toast-message";
import {
  AlertTriangle,
  ArrowLeft,
  Gamepad2,
  Phone,
  ShieldCheck,
  UserPlus,
  Wind,
} from "lucide-react-native";

import API from "../services/api";
import { useUser } from "../context/UserContext";
import { COLORS, RADIUS, SHADOW, SPACING, TYPOGRAPHY } from "../constants/theme";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const { width } = Dimensions.get("window");

export default function SOSScreen() {
  const router = useRouter();
  const { addXP } = useUser();

  const [secondsLeft, setSecondsLeft] = useState(180);
  const [timerRunning, setTimerRunning] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loggedOutcome, setLoggedOutcome] = useState<boolean | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, secondsLeft]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleOutcome = async (resisted: boolean) => {
    try {
      if (resisted) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowConfetti(true);
        addXP(100);
        Toast.show({
          type: "success",
          text1: "🎉 Craving Conquered!",
          text2: "+100 XP added to your recovery bank.",
        });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }

      setLoggedOutcome(resisted);

      await API.post("/api/v1/progress/log-craving", {
        triggerType: "sos_emergency",
        intensity: 4,
        resisted,
        interventionUsed: "sos_room",
      });
    } catch (err) {
      console.error("Log craving error:", err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.topBarTitle}>Emergency Craving Shield</Text>
          <View style={styles.backBtnPlaceholder} />
        </View>

        {/* Hero Countdown Section */}
        <View style={styles.timerSection}>
          <Text style={styles.sosKicker}>🆘 SOS</Text>
          <Text style={styles.timerDisplay}>{formatTimer(secondsLeft)}</Text>
          <Text style={styles.timerSubtitle}>
            Take a deep breath. An average craving peaks and passes in 3–5 minutes.
          </Text>
        </View>

        {/* 3 Intervention Cards */}
        <View style={styles.interventionsSection}>
          <Text style={styles.sectionTitle}>Choose Your Intervention</Text>

          {/* Card 1: Breathe */}
          <Pressable
            onPress={() => router.push("/games/breathing" as any)}
            style={styles.interventionCard}
            accessibilityRole="button"
          >
            <View style={[styles.cardIconBox, { backgroundColor: COLORS.infoDim }]}>
              <Wind size={24} color={COLORS.info} />
            </View>
            <View style={styles.cardTextBox}>
              <Text style={styles.cardTitle}>Breathe 4-7-8</Text>
              <Text style={styles.cardDesc}>
                Calm the autonomic nervous system and release muscle tension
              </Text>
            </View>
          </Pressable>

          {/* Card 2: Play */}
          <Pressable
            onPress={() => router.push("/games/bubble-burst" as any)}
            style={styles.interventionCard}
            accessibilityRole="button"
          >
            <View style={[styles.cardIconBox, { backgroundColor: COLORS.secondaryDim }]}>
              <Gamepad2 size={24} color={COLORS.secondary} />
            </View>
            <View style={styles.cardTextBox}>
              <Text style={styles.cardTitle}>Distract Yourself</Text>
              <Text style={styles.cardDesc}>
                Play a 60-second kinetic game to hijack the craving loop
              </Text>
            </View>
          </Pressable>

          {/* Card 3: Talk */}
          <Pressable
            onPress={() => Linking.openURL("tel:1800112356")}
            style={styles.interventionCard}
            accessibilityRole="button"
          >
            <View style={[styles.cardIconBox, { backgroundColor: COLORS.successDim }]}>
              <Phone size={24} color={COLORS.success} />
            </View>
            <View style={styles.cardTextBox}>
              <Text style={styles.cardTitle}>Call National Quitline</Text>
              <Text style={styles.cardDesc}>
                1800-11-2356 (Toll Free, Confidential Support)
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Outcome Feedback Section */}
        <Card style={styles.outcomeCard}>
          <Text style={styles.outcomeTitle}>Did you resist this craving?</Text>

          {loggedOutcome === null ? (
            <View style={styles.outcomeButtonsRow}>
              <Button
                title="Yes, I Resisted! 🏆"
                onPress={() => handleOutcome(true)}
                variant="primary"
                size="md"
                style={styles.outcomeBtn}
              />
              <Button
                title="I Slipped"
                onPress={() => handleOutcome(false)}
                variant="ghost"
                size="md"
                style={styles.outcomeBtn}
              />
            </View>
          ) : loggedOutcome ? (
            <View style={styles.outcomeSuccessBox}>
              <ShieldCheck size={28} color={COLORS.success} style={{ marginBottom: 6 }} />
              <Text style={styles.outcomeSuccessTitle}>+100 XP Earned!</Text>
              <Text style={styles.outcomeSuccessDesc}>
                Every resistance rewires your brain's dopamine reward pathways.
              </Text>
            </View>
          ) : (
            <View style={styles.outcomeSlipBox}>
              <Text style={styles.outcomeSlipTitle}>That's completely okay.</Text>
              <Text style={styles.outcomeSlipDesc}>
                Recovery is not all-or-nothing. Note your trigger, take a glass of cold water, and begin your next streak immediately.
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>

      {showConfetti && (
        <ConfettiCannon
          count={70}
          origin={{ x: width / 2, y: 0 }}
          fallSpeed={3000}
          fadeOut
        />
      )}
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
    paddingTop: 12,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  backBtnPlaceholder: {
    width: 44,
  },
  timerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  sosKicker: {
    ...TYPOGRAPHY.h1,
    color: COLORS.danger,
    marginBottom: 6,
  },
  timerDisplay: {
    fontSize: 56,
    fontWeight: "800",
    color: COLORS.textPrimary,
    lineHeight: 64,
  },
  timerSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 280,
    lineHeight: 22,
  },
  interventionsSection: {
    gap: 14,
    marginBottom: 28,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  interventionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 84,
    ...SHADOW.sm,
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardTextBox: {
    flex: 1,
  },
  cardTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  outcomeCard: {
    padding: 20,
    alignItems: "center",
  },
  outcomeTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: "center",
  },
  outcomeButtonsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  outcomeBtn: {
    flex: 1,
  },
  outcomeSuccessBox: {
    alignItems: "center",
    paddingVertical: 8,
  },
  outcomeSuccessTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.success,
    marginBottom: 4,
  },
  outcomeSuccessDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  outcomeSlipBox: {
    alignItems: "center",
    paddingVertical: 8,
  },
  outcomeSlipTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.warning,
    marginBottom: 4,
  },
  outcomeSlipDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
