import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useContext } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import dayjs from "dayjs";
import { AuthContext } from "../context/AuthContext";
import { fetchDashboardSummary, updateDailyGoals } from "../services/api";

interface Goal {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  isCustom?: boolean;
}

const DEFAULT_GOALS: Goal[] = [
  { id: "comp-1", icon: "ban-outline", text: "Avoid 5 cigarettes today" },
  { id: "comp-2", icon: "water-outline", text: "Drink 3 glasses of water" },
  { id: "comp-3", icon: "leaf-outline", text: "10 min breathing exercise" },
  { id: "comp-4", icon: "wallet-outline", text: "Save ₹100 today" },
  { id: "comp-5", icon: "walk-outline", text: "Walk 10 minutes" },
];

const SUGGESTED_GOALS = [
  { icon: "game-controller-outline", text: "Play 1 focus game" },
  { icon: "bed-outline", text: "Sleep 7 hours" },
  { icon: "heart-outline", text: "Resist an evening craving" },
  { icon: "barbell-outline", text: "Exercise 15 minutes" },
];

function AnimatedCheckmark({ checked }: { checked: boolean }) {
  const scale = useSharedValue(checked ? 1 : 0);
  const opacity = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    if (checked) {
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 150 });
    } else {
      scale.value = withTiming(0, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [checked]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.checkbox, checked && styles.checkboxActive]}>
      <Animated.View style={animatedStyle}>
        <Ionicons name="checkmark" size={16} color="#000000" />
      </Animated.View>
    </View>
  );
}

export default function GoalsScreen() {
  const { user } = useContext(AuthContext);
  const today = dayjs().format("YYYY-MM-DD");

  const [streak, setStreak] = useState(user?.streak || 0);
  const [puffCoins, setPuffCoins] = useState(user?.puffCoins || 0);
  const [customGoals, setCustomGoals] = useState<Goal[]>([]);
  const [completedGoalIds, setCompletedGoalIds] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [customGoalText, setCustomGoalText] = useState("");

  // Load dashboard summary and local persistence on mount
  useEffect(() => {
    const loadGoalsState = async () => {
      try {
        // 1. Fetch dashboard summary
        const res = await fetchDashboardSummary();
        if (res?.data) {
          setStreak(res.data.streak || 0);
          setPuffCoins(res.data.puffCoins || 0);
        }

        // 2. Load checked goals from AsyncStorage for today
        const savedCompleted = await AsyncStorage.getItem(`goals_completed_${today}`);
        if (savedCompleted) {
          setCompletedGoalIds(JSON.parse(savedCompleted));
        }

        // 3. Load custom goals
        const savedCustom = await AsyncStorage.getItem("custom_goals");
        if (savedCustom) {
          setCustomGoals(JSON.parse(savedCustom));
        }
      } catch (err) {
        console.log("Goals state load error:", err);
      }
    };

    loadGoalsState();
  }, [today]);

  const allGoals: Goal[] = [...DEFAULT_GOALS, ...customGoals];
  const completedCount = completedGoalIds.length;
  const coinsEarnedToday = completedCount >= 5 ? 2 : 0;

  const toggleGoal = async (goalId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    let updated: string[];
    const isNowChecked = !completedGoalIds.includes(goalId);

    if (isNowChecked) {
      updated = [...completedGoalIds, goalId];
    } else {
      updated = completedGoalIds.filter((id) => id !== goalId);
    }

    setCompletedGoalIds(updated);

    // Persist locally
    await AsyncStorage.setItem(`goals_completed_${today}`, JSON.stringify(updated));

    // Call backend endpoint immediately
    try {
      const res = await updateDailyGoals(updated.length);
      if (res?.data) {
        if (res.data.streak !== undefined) setStreak(res.data.streak);
        if (res.data.puffCoins !== undefined) setPuffCoins(res.data.puffCoins);
      }

      if (isNowChecked && updated.length === 5) {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {}
        Toast.show({
          type: "success",
          text1: "Daily Goal Milestone! 🔥",
          text2: "5/5 goals completed! Streak extended + 2 PuffCoins earned.",
        });
      }
    } catch (apiErr) {
      console.log("API update daily goals error:", apiErr);
    }
  };

  const addCustomGoal = async (text: string, icon = "create-outline") => {
    if (!text.trim()) return;
    const newGoal: Goal = {
      id: `custom-${Date.now()}`,
      icon: icon as any,
      text: text.trim(),
      isCustom: true,
    };
    const updated = [...customGoals, newGoal];
    setCustomGoals(updated);
    await AsyncStorage.setItem("custom_goals", JSON.stringify(updated));
    setModalVisible(false);
    setCustomGoalText("");
  };

  const deleteCustomGoal = async (goalId: string) => {
    const updated = customGoals.filter((g) => g.id !== goalId);
    setCustomGoals(updated);
    await AsyncStorage.setItem("custom_goals", JSON.stringify(updated));

    const updatedCompleted = completedGoalIds.filter((id) => id !== goalId);
    setCompletedGoalIds(updatedCompleted);
    await AsyncStorage.setItem(`goals_completed_${today}`, JSON.stringify(updatedCompleted));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#39FF14" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addBtnHeader}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={22} color="#000000" />
          <Text style={styles.addBtnHeaderText}>Add Goal</Text>
        </TouchableOpacity>
      </View>

      {/* Prominent Streak & Coin Banners */}
      <View style={styles.streakBanner}>
        <View style={styles.bannerRow}>
          <View style={styles.streakBadge}>
            <Text style={styles.streakBadgeText}>🔥 {streak}-day streak — keep going!</Text>
          </View>
          <View style={styles.coinBadge}>
            <Text style={styles.coinBadgeText}>🪙 +{coinsEarnedToday} PuffCoins today</Text>
          </View>
        </View>
      </View>

      <Text style={styles.title}>Daily Goals</Text>
      <Text style={styles.subtitle}>
        Complete at least 5 goals today to maintain your streak and earn PuffCoins.
      </Text>

      {/* Progress Counter */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Today's Target</Text>
          <Text style={styles.progressCount}>{completedCount} / {Math.max(5, allGoals.length)}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              { width: `${Math.min(100, (completedCount / 5) * 100)}%` },
            ]}
          />
        </View>
      </View>

      {/* Goals List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Target Checklist</Text>

          {allGoals.map((goal) => {
            const isChecked = completedGoalIds.includes(goal.id);
            return (
              <TouchableOpacity
                key={goal.id}
                style={[styles.goalItem, isChecked && styles.goalItemActive]}
                onPress={() => toggleGoal(goal.id)}
                activeOpacity={0.7}
              >
                <AnimatedCheckmark checked={isChecked} />
                <Ionicons
                  name={goal.icon as any}
                  size={20}
                  color={isChecked ? "#39FF14" : "#888"}
                  style={{ marginLeft: 12, marginRight: 8 }}
                />
                <Text style={[styles.goalText, isChecked && styles.goalTextCompleted]}>
                  {goal.text}
                </Text>

                {goal.isCustom && (
                  <TouchableOpacity
                    onPress={() => deleteCustomGoal(goal.id)}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={styles.addGoalCardBtn}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color="#39FF14" />
            <Text style={styles.addGoalCardBtnText}>Create Custom Goal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add a Daily Goal</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>Pick from suggested goals:</Text>
            {SUGGESTED_GOALS.map((s, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.suggestedGoalItem}
                onPress={() => addCustomGoal(s.text, s.icon)}
              >
                <Ionicons name={s.icon as any} size={20} color="#39FF14" />
                <Text style={styles.suggestedGoalText}>{s.text}</Text>
                <Ionicons name="add" size={18} color="#39FF14" />
              </TouchableOpacity>
            ))}

            <Text style={[styles.modalSub, { marginTop: 16 }]}>Or write your own:</Text>
            <TextInput
              placeholder="e.g. Read 10 pages before bed..."
              placeholderTextColor="#666"
              style={styles.input}
              value={customGoalText}
              onChangeText={setCustomGoalText}
            />

            <TouchableOpacity
              style={styles.confirmAddBtn}
              onPress={() => addCustomGoal(customGoalText)}
            >
              <Text style={styles.confirmAddBtnText}>Save Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  backBtn: {
    padding: 4,
  },
  addBtnHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#39FF14",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addBtnHeaderText: {
    color: "#000000",
    fontWeight: "700",
    fontSize: 13,
  },
  streakBanner: {
    marginBottom: 16,
  },
  bannerRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  streakBadge: {
    backgroundColor: "rgba(255, 149, 0, 0.15)",
    borderColor: "#FF9500",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakBadgeText: {
    color: "#FF9500",
    fontSize: 13,
    fontWeight: "700",
  },
  coinBadge: {
    backgroundColor: "rgba(57, 255, 20, 0.12)",
    borderColor: "#39FF14",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  coinBadgeText: {
    color: "#39FF14",
    fontSize: 13,
    fontWeight: "700",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    color: "#888888",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: "#121212",
    borderColor: "#1E1E1E",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  progressCount: {
    color: "#39FF14",
    fontSize: 14,
    fontWeight: "800",
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#222222",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#39FF14",
    borderRadius: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#121212",
    borderColor: "#1E1E1E",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  cardSectionTitle: {
    color: "#888888",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#181818",
    borderColor: "#222222",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  goalItemActive: {
    borderColor: "rgba(57, 255, 20, 0.4)",
    backgroundColor: "#141A14",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderColor: "#444444",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: "#39FF14",
    borderColor: "#39FF14",
  },
  goalText: {
    flex: 1,
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  goalTextCompleted: {
    color: "#888888",
    textDecorationLine: "line-through",
  },
  deleteBtn: {
    padding: 6,
  },
  addGoalCardBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#39FF14",
    borderRadius: 12,
  },
  addGoalCardBtnText: {
    color: "#39FF14",
    fontWeight: "700",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#141414",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  modalSub: {
    color: "#888888",
    fontSize: 13,
    marginBottom: 10,
  },
  suggestedGoalItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1C",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    gap: 10,
  },
  suggestedGoalText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
  },
  input: {
    backgroundColor: "#1C1C1C",
    color: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    marginBottom: 16,
  },
  confirmAddBtn: {
    backgroundColor: "#39FF14",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmAddBtnText: {
    color: "#000000",
    fontWeight: "700",
    fontSize: 15,
  },
});
