import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import {
  Utensils,
  Apple,
  Droplets,
  Plus,
  Minus,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  Flame,
  Zap,
  Info,
  ChevronRight,
} from "lucide-react-native";
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOW } from "../constants/theme";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ProgressBar from "../components/ui/ProgressBar";
import { useUser } from "../context/UserContext";
import api from "../services/api";

const { width } = Dimensions.get("window");

interface IndianMealPreset {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
}

const POPULAR_INDIAN_PRESETS: IndianMealPreset[] = [
  { id: "p1", name: "Paneer Bhurji (200g)", calories: 340, protein: 22, carbs: 12, fat: 24, category: "Lunch" },
  { id: "p2", name: "Dal Tadka + 2 Multigrain Roti", calories: 380, protein: 14, carbs: 62, fat: 8, category: "Dinner" },
  { id: "p3", name: "3 Boiled Eggs + Black Pepper", calories: 210, protein: 18, carbs: 2, fat: 15, category: "Breakfast" },
  { id: "p4", name: "Roasted Chana Chaat (100g)", calories: 190, protein: 12, carbs: 28, fat: 4, category: "Snack" },
  { id: "p5", name: "Bihar Sattu Protein Shake (40g)", calories: 260, protein: 20, carbs: 36, fat: 3, category: "Breakfast" },
  { id: "p6", name: "Moong Dal Cheela with Mint Chutney", calories: 240, protein: 15, carbs: 32, fat: 6, category: "Breakfast" },
];

export default function NutritionScreen() {
  const router = useRouter();
  const { addXP } = useUser();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Nutrition totals
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFat, setTotalFat] = useState(0);
  const [waterLitres, setWaterLitres] = useState(1.5);
  const [meals, setMeals] = useState<any[]>([]);

  // AI Meal Analysis input
  const [mealDescription, setMealDescription] = useState("");
  const [analyzingMeal, setAnalyzingMeal] = useState(false);

  const targetCalories = 2200;
  const targetProtein = 130;
  const targetCarbs = 220;
  const targetFat = 65;
  const targetWater = 3.0;

  const fetchTodayNutrition = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/nutrition/today");
      if (res.data?.success && res.data.data) {
        const d = res.data.data;
        setTotalCalories(d.totalCalories || 0);
        setTotalProtein(d.totalProtein || 0);
        setTotalCarbs(d.totalCarbs || 0);
        setTotalFat(d.totalFat || 0);
        setWaterLitres(d.waterLitres ?? 1.5);
        setMeals(d.meals || []);
      }
    } catch (err) {
      console.warn("Failed to fetch nutrition:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayNutrition();
  }, [fetchTodayNutrition]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTodayNutrition();
  };

  const handleAddPreset = async (preset: IndianMealPreset) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_e) {}

    const newMeal = {
      name: preset.name,
      calories: preset.calories,
      protein: preset.protein,
      carbs: preset.carbs,
      fat: preset.fat,
      time: preset.category.toLowerCase(),
    };

    setTotalCalories((c) => c + preset.calories);
    setTotalProtein((p) => p + preset.protein);
    setTotalCarbs((cb) => cb + preset.carbs);
    setTotalFat((f) => f + preset.fat);
    setMeals((m) => [newMeal, ...m]);
    addXP(20);

    Toast.show({
      type: "success",
      text1: "Meal Logged!",
      text2: `+${preset.calories} kcal | +${preset.protein}g protein (+20 XP)`,
    });

    try {
      await api.post("/api/v1/nutrition/log", newMeal);
    } catch (err) {
      console.warn("Failed to save meal:", err);
    }
  };

  const handleWaterStep = async (delta: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_e) {}

    const newWater = Math.max(0, Math.round((waterLitres + delta) * 100) / 100);
    setWaterLitres(newWater);

    if (delta > 0) {
      addXP(5);
    }

    try {
      await api.post("/api/v1/nutrition/log", { waterLitres: newWater });
    } catch (err) {
      console.warn("Failed to update water:", err);
    }
  };

  const handleAiAnalyze = async () => {
    if (!mealDescription.trim()) return;

    setAnalyzingMeal(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_e) {}

    try {
      const res = await api.post("/api/v1/ai/analyze-meal", {
        mealDescription: mealDescription.trim(),
      });

      if (res.data?.success && res.data.analysis) {
        const an = res.data.analysis;
        const newMeal = {
          name: an.dish_name || mealDescription.trim(),
          calories: an.estimated_calories || 350,
          protein: an.protein_g || 18,
          carbs: an.carbs_g || 45,
          fat: an.fats_g || 10,
          time: "lunch",
        };

        setTotalCalories((c) => c + newMeal.calories);
        setTotalProtein((p) => p + newMeal.protein);
        setTotalCarbs((cb) => cb + newMeal.carbs);
        setTotalFat((f) => f + newMeal.fat);
        setMeals((m) => [newMeal, ...m]);
        setMealDescription("");
        addXP(30);

        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (_e) {}

        Toast.show({
          type: "success",
          text1: `${newMeal.name} Analyzed!`,
          text2: `Gemini calculated ${newMeal.calories} kcal & ${newMeal.protein}g protein (+30 XP)`,
        });

        await api.post("/api/v1/nutrition/log", newMeal);
      }
    } catch (err) {
      console.warn("AI meal analysis failed:", err);
      Toast.show({ type: "error", text1: "Analysis Error", text2: "Could not compute meal macros." });
    } finally {
      setAnalyzingMeal(false);
    }
  };

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
          <Text style={styles.headerTitle}>Nutrition Fuel</Text>
          <Text style={styles.headerSubtitle}>Desi Macro Tracking & Hydration</Text>
        </View>

        <View style={styles.headerPlaceholder} />
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
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Balancing nutritional profile...</Text>
          </View>
        ) : (
          <>
            {/* Macro Totals Hero Card */}
            <Card style={styles.macroCard} elevation="medium">
              <View style={styles.macroHeader}>
                <View style={styles.calorieInfo}>
                  <Text style={styles.calorieKicker}>TODAY'S ENERGY INTAKE</Text>
                  <Text style={styles.calorieNum}>
                    {totalCalories}{" "}
                    <Text style={styles.calorieTarget}>/ {targetCalories} kcal</Text>
                  </Text>
                </View>
                <Flame size={28} color={COLORS.accent} />
              </View>

              <ProgressBar
                progress={Math.min(1, totalCalories / targetCalories)}
                color={COLORS.primary}
                height={8}
                style={{ marginVertical: SPACING.md }}
              />

              {/* 3 Macro Breakdown Columns */}
              <View style={styles.macrosRow}>
                {/* Protein */}
                <View style={styles.macroCol}>
                  <View style={styles.macroLabelRow}>
                    <View style={[styles.macroDot, { backgroundColor: COLORS.primary }]} />
                    <Text style={styles.macroName}>Protein</Text>
                  </View>
                  <Text style={styles.macroValue}>
                    {totalProtein}g{" "}
                    <Text style={styles.macroSub}>/ {targetProtein}g</Text>
                  </Text>
                  <ProgressBar
                    progress={Math.min(1, totalProtein / targetProtein)}
                    color={COLORS.primary}
                    height={4}
                    style={{ marginTop: 4 }}
                  />
                </View>

                {/* Carbs */}
                <View style={styles.macroCol}>
                  <View style={styles.macroLabelRow}>
                    <View style={[styles.macroDot, { backgroundColor: COLORS.secondary }]} />
                    <Text style={styles.macroName}>Carbs</Text>
                  </View>
                  <Text style={styles.macroValue}>
                    {totalCarbs}g{" "}
                    <Text style={styles.macroSub}>/ {targetCarbs}g</Text>
                  </Text>
                  <ProgressBar
                    progress={Math.min(1, totalCarbs / targetCarbs)}
                    color={COLORS.secondary}
                    height={4}
                    style={{ marginTop: 4 }}
                  />
                </View>

                {/* Fats */}
                <View style={styles.macroCol}>
                  <View style={styles.macroLabelRow}>
                    <View style={[styles.macroDot, { backgroundColor: COLORS.accent }]} />
                    <Text style={styles.macroName}>Fats</Text>
                  </View>
                  <Text style={styles.macroValue}>
                    {totalFat}g <Text style={styles.macroSub}>/ {targetFat}g</Text>
                  </Text>
                  <ProgressBar
                    progress={Math.min(1, totalFat / targetFat)}
                    color={COLORS.accent}
                    height={4}
                    style={{ marginTop: 4 }}
                  />
                </View>
              </View>
            </Card>

            {/* Hydration Tracker Card */}
            <Card style={styles.waterCard} elevation="low">
              <View style={styles.waterTopRow}>
                <View style={styles.waterIconBox}>
                  <Droplets size={22} color={COLORS.info} />
                </View>
                <View style={styles.waterInfo}>
                  <Text style={styles.waterTitle}>Daily Hydration</Text>
                  <Text style={styles.waterSubtitle}>
                    {waterLitres.toFixed(1)}L of {targetWater}L target ({Math.round(waterLitres * 4)} glasses)
                  </Text>
                </View>

                <View style={styles.waterStepper}>
                  <Pressable
                    onPress={() => handleWaterStep(-0.25)}
                    style={styles.stepBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Decrease water"
                  >
                    <Minus size={16} color={COLORS.textPrimary} />
                  </Pressable>

                  <Pressable
                    onPress={() => handleWaterStep(0.25)}
                    style={[styles.stepBtn, { backgroundColor: COLORS.info }]}
                    accessibilityRole="button"
                    accessibilityLabel="Add water glass"
                  >
                    <Plus size={16} color={COLORS.textInverse} />
                  </Pressable>
                </View>
              </View>

              <ProgressBar
                progress={Math.min(1, waterLitres / targetWater)}
                color={COLORS.info}
                height={6}
                style={{ marginTop: SPACING.md }}
              />
            </Card>

            {/* AI Meal Analyzer Input Card */}
            <Card style={styles.aiCard} elevation="medium">
              <View style={styles.aiHeader}>
                <Sparkles size={20} color={COLORS.primary} />
                <Text style={styles.aiHeading}>AI Indian Meal Scanner</Text>
              </View>
              <Text style={styles.aiDesc}>
                Type any Indian dish (e.g. "2 Aloo Parathas with 1 cup curd") and Gemini will
                calculate macros and add it to your log.
              </Text>

              <TextInput
                style={styles.aiInput}
                placeholder="Describe your meal in plain English or Hindi..."
                placeholderTextColor={COLORS.textMuted}
                value={mealDescription}
                onChangeText={setMealDescription}
              />

              <Button
                title={analyzingMeal ? "Analyzing Dish..." : "Analyze & Log Meal"}
                variant="primary"
                size="md"
                onPress={handleAiAnalyze}
                disabled={analyzingMeal || !mealDescription.trim()}
                icon={<Sparkles size={16} color={COLORS.textInverse} />}
              />
            </Card>

            {/* Quick Add Popular Indian Staples */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionHeading}>Quick Add Indian High-Protein Staples</Text>
              <View style={styles.presetsGrid}>
                {POPULAR_INDIAN_PRESETS.map((preset) => (
                  <Pressable
                    key={preset.id}
                    onPress={() => handleAddPreset(preset)}
                    style={styles.presetItem}
                    accessibilityRole="button"
                  >
                    <View style={styles.presetTop}>
                      <Text style={styles.presetName} numberOfLines={1}>
                        {preset.name}
                      </Text>
                      <Plus size={16} color={COLORS.primary} />
                    </View>
                    <Text style={styles.presetMacros}>
                      {preset.calories} kcal • {preset.protein}g protein
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Today's Logged Meals */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionHeading}>Logged Today ({meals.length})</Text>
              {meals.length === 0 ? (
                <Card style={styles.emptyMealsCard}>
                  <Utensils size={32} color={COLORS.textMuted} />
                  <Text style={styles.emptyMealsTitle}>No Meals Logged Yet</Text>
                  <Text style={styles.emptyMealsDesc}>
                    Tap any preset above or use the AI scanner to log your calories and macros.
                  </Text>
                </Card>
              ) : (
                <View style={styles.mealsList}>
                  {meals.map((meal, idx) => (
                    <Card key={idx} style={styles.mealItemCard} elevation="low">
                      <View style={styles.mealItemRow}>
                        <View style={styles.mealIconBox}>
                          <Utensils size={18} color={COLORS.primary} />
                        </View>
                        <View style={styles.mealInfo}>
                          <Text style={styles.mealName}>{meal.name}</Text>
                          <Text style={styles.mealMacros}>
                            {meal.calories} kcal • {meal.protein}g P • {meal.carbs}g C • {meal.fat}g F
                          </Text>
                        </View>
                        <View style={styles.timeTag}>
                          <Text style={styles.timeTagText}>{meal.time || "meal"}</Text>
                        </View>
                      </View>
                    </Card>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
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
  headerPlaceholder: {
    width: 44,
  },
  scrollContent: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  loadingBox: {
    paddingVertical: 80,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.md,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  macroCard: {
    padding: SPACING.lg,
  },
  macroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  calorieInfo: {
    flexDirection: "column",
  },
  calorieKicker: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  calorieNum: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  calorieTarget: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
  },
  macrosRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  macroCol: {
    flex: 1,
  },
  macroLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  macroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  macroName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: "600",
    fontSize: 11,
  },
  macroValue: {
    ...TYPOGRAPHY.body,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  macroSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  waterCard: {
    padding: SPACING.md,
  },
  waterTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  waterIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  waterInfo: {
    flex: 1,
  },
  waterTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  waterSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  waterStepper: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  aiCard: {
    padding: SPACING.lg,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: 4,
  },
  aiHeading: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  aiDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  aiInput: {
    backgroundColor: COLORS.surfaceElevated,
    color: COLORS.textPrimary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: SPACING.md,
  },
  sectionBox: {
    gap: SPACING.sm,
  },
  sectionHeading: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  presetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  presetItem: {
    width: (width - SPACING.lg * 2 - SPACING.sm) / 2,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  presetTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  presetName: {
    ...TYPOGRAPHY.caption,
    fontWeight: "700",
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 4,
  },
  presetMacros: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  emptyMealsCard: {
    padding: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
  },
  emptyMealsTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  emptyMealsDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  mealsList: {
    gap: SPACING.xs,
  },
  mealItemCard: {
    padding: SPACING.md,
  },
  mealItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  mealIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryDim,
    alignItems: "center",
    justifyContent: "center",
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    ...TYPOGRAPHY.body,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  mealMacros: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontSize: 11,
  },
  timeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceElevated,
  },
  timeTagText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: "capitalize",
  },
});
