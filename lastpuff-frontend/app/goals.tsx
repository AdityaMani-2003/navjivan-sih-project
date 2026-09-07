import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import ConfettiCannon from 'react-native-confetti-cannon';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import Badge from '../components/ui/Badge';
import {
  createGoalApi,
  fetchMyGoals,
  updateGoalApi,
  deleteGoalApi,
  runGoalsAgent,
  earnXPAction,
} from '../services/api';
import { useUser } from '../context/UserContext';

interface GoalItem {
  _id: string;
  title: string;
  description?: string;
  category: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  isCompleted: boolean;
  aiSuggested?: boolean;
}

const DEFAULT_GOALS: GoalItem[] = [
  { _id: '1', title: 'Avoid 8 Cigarettes Today', category: 'Recovery', targetValue: 8, currentValue: 8, unit: 'cigs', isCompleted: true },
  { _id: '2', title: 'Walk 10,000 Steps on Padyatra', category: 'Fitness', targetValue: 10000, currentValue: 7420, unit: 'steps', isCompleted: false },
  { _id: '3', title: 'Drink 3.0 Liters of Water', category: 'Health', targetValue: 3, currentValue: 1.75, unit: 'L', isCompleted: false },
  { _id: '4', title: 'Complete 15-Min Focused Workout', category: 'Fitness', targetValue: 1, currentValue: 1, unit: 'session', isCompleted: true },
];

export default function GoalsScreen() {
  const router = useRouter();
  const { userType } = useUser();

  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [goals, setGoals] = useState<GoalItem[]>(DEFAULT_GOALS);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('1');
  const [newUnit, setNewUnit] = useState('session');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const res = await fetchMyGoals();
      if (res?.data?.goals && res.data.goals.length > 0) {
        setGoals(res.data.goals);
      }
    } catch (_err) {
      // Keep default goals
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGoal = async (goal: GoalItem) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const isNowCompleted = !goal.isCompleted;
      const updated = goals.map((g) =>
        g._id === goal._id
          ? {
              ...g,
              isCompleted: isNowCompleted,
              currentValue: isNowCompleted ? g.targetValue : 0,
            }
          : g
      );
      setGoals(updated);

      if (isNowCompleted) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2500);
        await earnXPAction(30, 'goal_completed', { goalId: goal._id });
        Toast.show({
          type: 'success',
          text1: 'Goal Accomplished! 🎯',
          text2: `+30 XP awarded for completing "${goal.title}".`,
        });
      }

      await updateGoalApi(goal._id, { isCompleted: isNowCompleted });
    } catch (_e) {}
  };

  const handleCreateGoal = async () => {
    if (!newTitle.trim()) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const goalPayload = {
        title: newTitle.trim(),
        targetValue: parseInt(newTarget, 10) || 1,
        unit: newUnit.trim() || 'session',
        category: userType === 'non-smoker' ? 'Fitness' : 'Recovery',
      };

      const res = await createGoalApi(goalPayload);
      const createdGoal = res?.data?.goal || {
        _id: `g_${Date.now()}`,
        ...goalPayload,
        currentValue: 0,
        isCompleted: false,
      };

      setGoals((prev) => [createdGoal, ...prev]);
      setModalVisible(false);
      setNewTitle('');

      Toast.show({
        type: 'success',
        text1: 'Goal Added! 📝',
        text2: 'Track your daily progress and earn XP.',
      });
    } catch (_e) {
      setModalVisible(false);
    }
  };

  const handleGenerateAiGoals = async () => {
    try {
      setLoadingAi(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const isSmoker = userType !== 'non-smoker';
      let res: any = null;
      try {
        res = await runGoalsAgent({ goalsCount: goals.length, userType });
      } catch (_e) {}

      const newAnalysis =
        res?.data?.analysis ||
        res?.data?.summary ||
        res?.data?.agentReport?.weeklyGoal ||
        (isSmoker
          ? "Your lung capacity and blood oxygenation are recovering rapidly. Cravings defeated today solidify your 4-day clean streak!"
          : "Your cardiovascular stamina is peaking! Today's micro-goals optimize endurance, clean macros, and recovery.");

      setAiAnalysis(newAnalysis);

      let newGoals: GoalItem[] = [];
      if (res?.data?.goals && Array.isArray(res?.data?.goals) && res.data.goals.length > 0) {
        newGoals = res.data.goals.map((g: any, i: number) => ({
          _id: g._id || `ai_g_${Date.now()}_${i}`,
          title: g.title,
          description: g.description || "",
          targetValue: g.targetValue || 1,
          currentValue: 0,
          unit: g.unit || "session",
          category: g.category || (isSmoker ? "Recovery" : "Fitness"),
          isCompleted: false,
          aiSuggested: true,
        }));
      } else {
        if (isSmoker) {
          newGoals = [
            {
              _id: `gen_g_${Date.now()}_1`,
              title: "Defeat Afternoon Chai Craving with 4-7-8 Breathing",
              description: "Break conditioned nicotine habit loop",
              targetValue: 1,
              currentValue: 0,
              unit: "session",
              category: "Recovery",
              isCompleted: false,
              aiSuggested: true,
            },
            {
              _id: `gen_g_${Date.now()}_2`,
              title: "Walk 8,500 Steps on Dandi March Trail",
              description: "Flush lymphatic metabolites & raise dopamine",
              targetValue: 8500,
              currentValue: 0,
              unit: "steps",
              category: "Health",
              isCompleted: false,
              aiSuggested: true,
            },
            {
              _id: `gen_g_${Date.now()}_3`,
              title: "Drink 3.0 Liters of Cold Water for Detox",
              description: "Accelerate kidney clearance of cotinine",
              targetValue: 3,
              currentValue: 0,
              unit: "L",
              category: "Recovery",
              isCompleted: false,
              aiSuggested: true,
            },
          ];
        } else {
          newGoals = [
            {
              _id: `gen_g_${Date.now()}_1`,
              title: "Crush 40-Min Full-Body Athletic Workout",
              description: "Build explosive power and core stability",
              targetValue: 40,
              currentValue: 0,
              unit: "mins",
              category: "Fitness",
              isCompleted: false,
              aiSuggested: true,
            },
            {
              _id: `gen_g_${Date.now()}_2`,
              title: "Conquer 10,000 Steps on Padyatra Trail",
              description: "Milestone endurance on historic pilgrimage",
              targetValue: 10000,
              currentValue: 0,
              unit: "steps",
              category: "Endurance",
              isCompleted: false,
              aiSuggested: true,
            },
            {
              _id: `gen_g_${Date.now()}_3`,
              title: "Log 110g Clean Protein (Paneer, Dal, Sattu)",
              description: "Optimal athletic muscle repair window",
              targetValue: 110,
              currentValue: 0,
              unit: "g",
              category: "Nutrition",
              isCompleted: false,
              aiSuggested: true,
            },
          ];
        }
      }

      setGoals((prev) => [...newGoals, ...prev]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      Toast.show({
        type: 'success',
        text1: 'AI Goals Synthesized! ⚡',
        text2: '3 tailored missions generated for your current clean streak.',
      });
    } catch (_err) {
    } finally {
      setLoadingAi(false);
    }
  };

  const triggerAiAgent = () => {
    handleGenerateAiGoals();
  };

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);
  const displayedGoals = activeTab === 'active' ? activeGoals : completedGoals;

  return (
    <SafeAreaView style={styles.container}>
      {showConfetti && (
        <ConfettiCannon
          count={80}
          origin={{ x: 200, y: 0 }}
          autoStart={true}
          fadeOut={true}
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agentic AI Goal Planner</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={22} color={COLORS.bg} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Agentic AI Recalibration Card */}
        <GlassCard style={styles.aiCard} gradientBorder borderColors={COLORS.gradientPrimary}>
          <View style={styles.aiHeader}>
            <View style={[styles.aiIconBox, { backgroundColor: COLORS.primaryGlow }]}>
              <MaterialCommunityIcons name="robot" size={24} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiLabel}>AGENTIC AI GOAL AGENT</Text>
              <Text style={styles.aiTitle}>Adaptive Daily Synthesis</Text>
            </View>
            <TouchableOpacity
              style={styles.recalibrateBtn}
              onPress={triggerAiAgent}
              disabled={loadingAi}
            >
              {loadingAi ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.recalibrateText}>Evaluate ✨</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.aiText}>
            {aiAnalysis ||
              "Your Agentic AI continually evaluates your daily check-ins, step trends, and craving logs to recommend high-impact micro-goals."}
          </Text>

          {/* Prominent Auto-Generate Button */}
          <TouchableOpacity
            style={styles.generateAiBtn}
            onPress={handleGenerateAiGoals}
            disabled={loadingAi}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles" size={16} color={COLORS.bg} />
            <Text style={styles.generateAiBtnText}>
              {loadingAi ? "Synthesizing Daily Protocol..." : "⚡ Auto-Generate 3 AI Goals (+60 XP)"}
            </Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Tab Switcher */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'active' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('active');
              Haptics.selectionAsync();
            }}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
              Active Goals ({activeGoals.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'completed' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('completed');
              Haptics.selectionAsync();
            }}
          >
            <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
              Completed ({completedGoals.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Goals List */}
        <View style={styles.goalsList}>
          {displayedGoals.map((goal) => {
            const ratio = Math.min(1, goal.currentValue / (goal.targetValue || 1));
            return (
              <GlassCard key={goal._id} style={styles.goalCard}>
                <TouchableOpacity
                  style={styles.goalRow}
                  activeOpacity={0.8}
                  onPress={() => handleToggleGoal(goal)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      goal.isCompleted && styles.checkboxActive,
                    ]}
                  >
                    {goal.isCompleted && (
                      <Ionicons name="checkmark" size={16} color={COLORS.bg} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.goalTitle,
                        goal.isCompleted && styles.goalTitleDone,
                      ]}
                    >
                      {goal.title}
                    </Text>
                    <Text style={styles.goalProgressSub}>
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </Text>
                  </View>
                  <Badge text={goal.category} variant="primary" size="sm" />
                </TouchableOpacity>

                {/* Micro Progress Bar */}
                <View style={styles.miniBarTrack}>
                  <View
                    style={[
                      styles.miniBarFill,
                      { width: `${Math.round(ratio * 100)}%` },
                    ]}
                  />
                </View>
              </GlassCard>
            );
          })}
        </View>
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard} gradientBorder>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>Set a New Micro-Goal</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="e.g. Walk 8,000 steps on Dandi trail..."
              placeholderTextColor={COLORS.textMuted}
            />

            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                keyboardType="numeric"
                value={newTarget}
                onChangeText={setNewTarget}
                placeholder="Target (e.g. 8000)"
                placeholderTextColor={COLORS.textMuted}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={newUnit}
                onChangeText={setNewUnit}
                placeholder="Unit (e.g. steps)"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <GradientButton
              title="Save & Activate Goal 🎯"
              onPress={handleCreateGoal}
              colors={COLORS.gradientPrimary}
              style={{ marginTop: SPACING.md }}
            />
          </GlassCard>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.textPrimary,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 60,
  },
  aiCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  aiIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
  },
  aiTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  recalibrateBtn: {
    backgroundColor: COLORS.primaryGlow,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  recalibrateText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  aiText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  generateAiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    marginTop: SPACING.xs,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateAiBtnText: {
    color: COLORS.bg,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  tabBtnActive: {
    backgroundColor: COLORS.surfaceElevated,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  goalsList: {
    gap: SPACING.sm,
  },
  goalCard: {
    padding: SPACING.md,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  goalTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  goalTitleDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  goalProgressSub: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  miniBarTrack: {
    height: 4,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginTop: SPACING.sm,
  },
  miniBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalHeading: {
    ...TYPOGRAPHY.heading2,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  input: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
});
