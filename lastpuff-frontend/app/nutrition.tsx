import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import Svg, { Circle } from 'react-native-svg';

import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import Badge from '../components/ui/Badge';
import { earnXPAction } from '../services/api';

interface IndianMealPreset {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  emoji: string;
}

const POPULAR_INDIAN_MEALS: IndianMealPreset[] = [
  { id: 'paneer_tikka', name: 'Paneer Tikka (200g)', calories: 340, protein: 22, carbs: 12, fat: 24, emoji: '🧀' },
  { id: 'dal_rice', name: 'Yellow Dal Tadka + Jeera Rice', calories: 420, protein: 14, carbs: 76, fat: 8, emoji: '🍛' },
  { id: 'dosa_sambar', name: 'Masala Dosa + Sambar', calories: 380, protein: 10, carbs: 64, fat: 12, emoji: '🥞' },
  { id: 'chicken_biryani', name: 'Chicken Biryani (1 Bowl)', calories: 540, protein: 32, carbs: 68, fat: 16, emoji: '🍗' },
  { id: 'oats_whey', name: 'Rolled Oats + Whey Protein', calories: 310, protein: 28, carbs: 38, fat: 5, emoji: '🥣' },
  { id: 'egg_bhurji', name: '3-Egg Bhurji + 2 Roti', calories: 390, protein: 24, carbs: 32, fat: 18, emoji: '🍳' },
];

export default function NutritionScreen() {
  const router = useRouter();

  // Daily budget
  const targetCalories = 2200;
  const [consumedCalories, setConsumedCalories] = useState(1450);
  const [proteinGrams, setProteinGrams] = useState(84);
  const [carbsGrams, setCarbsGrams] = useState(165);
  const [fatGrams, setFatGrams] = useState(48);

  // Water Hydration State (target: 12 glasses = 3.0 Liters)
  const [waterGlasses, setWaterGlasses] = useState(7);
  const maxGlasses = 12;

  // Camera scan state
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [aiMealName, setAiMealName] = useState<string | null>(null);

  const calProgress = Math.min(1, consumedCalories / targetCalories);
  const waterLiters = (waterGlasses * 0.25).toFixed(2);

  const handleAddMealPreset = async (meal: IndianMealPreset) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setConsumedCalories((c) => c + meal.calories);
      setProteinGrams((p) => p + meal.protein);
      setCarbsGrams((cb) => cb + meal.carbs);
      setFatGrams((f) => f + meal.fat);
      await earnXPAction(25, 'meal_logged', { meal: meal.name });

      Toast.show({
        type: 'success',
        text1: `${meal.name} Logged! 🍽️`,
        text2: `+${meal.calories} kcal | +${meal.protein}g Protein (+25 XP)`,
      });
    } catch (_e) {}
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Camera Permission Required',
          text2: 'Enable camera access in settings to scan meals.',
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setScannedImage(result.assets[0].uri);
        setAnalyzingImage(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Simulate AI Vision breakdown
        setTimeout(async () => {
          setAnalyzingImage(false);
          setAiMealName('High-Protein Paneer Salad Bowl');
          setConsumedCalories((c) => c + 380);
          setProteinGrams((p) => p + 26);
          setCarbsGrams((cb) => cb + 18);
          setFatGrams((f) => f + 16);
          await earnXPAction(40, 'ai_vision_meal_scanned');
          Toast.show({
            type: 'success',
            text1: 'Gemini Vision Analyzed! 🥗',
            text2: 'Paneer Salad Bowl (+380 kcal, 26g Protein)',
          });
        }, 1800);
      }
    } catch (_err) {}
  };

  const handleAddWater = () => {
    if (waterGlasses < maxGlasses) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setWaterGlasses((w) => w + 1);
      earnXPAction(10, 'water_glass_logged');
    }
  };

  const handleRemoveWater = () => {
    if (waterGlasses > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setWaterGlasses((w) => w - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nutrition & Macros</Text>
        <View style={styles.calPill}>
          <Ionicons name="flame" size={14} color={COLORS.primary} />
          <Text style={styles.calPillText}>{consumedCalories} / {targetCalories} kcal</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Calorie & Macro Donut Card */}
        <GlassCard style={styles.macroCard} gradientBorder>
          <View style={styles.macroRow}>
            {/* Donut Gauge */}
            <View style={styles.donutBox}>
              <Svg width={110} height={110}>
                <Circle
                  cx={55}
                  cy={55}
                  r={45}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth={9}
                  fill="transparent"
                />
                <Circle
                  cx={55}
                  cy={55}
                  r={45}
                  stroke={COLORS.primary}
                  strokeWidth={9}
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - calProgress)}`}
                  strokeLinecap="round"
                  fill="transparent"
                  rotation="-90"
                  origin="55, 55"
                />
              </Svg>
              <View style={styles.donutCenter}>
                <Text style={styles.donutVal}>{targetCalories - consumedCalories}</Text>
                <Text style={styles.donutSub}>LEFT</Text>
              </View>
            </View>

            {/* Macro Breakdown Bars */}
            <View style={styles.macroBars}>
              {/* Protein */}
              <View style={styles.macroBarItem}>
                <View style={styles.macroBarHeader}>
                  <Text style={styles.macroName}>Protein (130g target)</Text>
                  <Text style={[styles.macroGrams, { color: COLORS.primary }]}>{proteinGrams}g</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${Math.min(100, (proteinGrams / 130) * 100)}%`, backgroundColor: COLORS.primary }]} />
                </View>
              </View>

              {/* Carbs */}
              <View style={styles.macroBarItem}>
                <View style={styles.macroBarHeader}>
                  <Text style={styles.macroName}>Carbs (220g target)</Text>
                  <Text style={[styles.macroGrams, { color: '#38BDF8' }]}>{carbsGrams}g</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${Math.min(100, (carbsGrams / 220) * 100)}%`, backgroundColor: '#38BDF8' }]} />
                </View>
              </View>

              {/* Fats */}
              <View style={styles.macroBarItem}>
                <View style={styles.macroBarHeader}>
                  <Text style={styles.macroName}>Fats (65g target)</Text>
                  <Text style={[styles.macroGrams, { color: COLORS.accent }]}>{fatGrams}g</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${Math.min(100, (fatGrams / 65) * 100)}%`, backgroundColor: COLORS.accent }]} />
                </View>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Gemini Vision Camera Meal Scanner */}
        <TouchableOpacity
          style={styles.scannerBanner}
          onPress={handlePickImage}
          activeOpacity={0.85}
        >
          <GlassCard style={styles.scannerInner} gradientBorder>
            <View style={[styles.scannerIconBox, { backgroundColor: 'rgba(0, 245, 160, 0.18)' }]}>
              {analyzingImage ? (
                <ActivityIndicator color={COLORS.primary} size="small" />
              ) : (
                <Ionicons name="camera" size={24} color={COLORS.primary} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.scannerTitle}>Snap & Scan Meal with AI</Text>
              <Text style={styles.scannerSub}>
                {analyzingImage
                  ? '🧠 Gemini Vision analyzing macros...'
                  : 'Point camera at your plate for instant nutrient recognition'}
              </Text>
            </View>
            <Ionicons name="scan-outline" size={20} color={COLORS.primary} />
          </GlassCard>
        </TouchableOpacity>

        {/* Interactive Water Hydration Tracker */}
        <GlassCard style={styles.waterCard}>
          <View style={styles.waterHeader}>
            <View style={styles.waterTitleRow}>
              <Ionicons name="water" size={22} color="#38BDF8" />
              <View>
                <Text style={styles.waterTitle}>Daily Hydration Tracker</Text>
                <Text style={styles.waterSub}>{waterLiters}L / 3.0L Target ({waterGlasses} Glasses)</Text>
              </View>
            </View>
            <View style={styles.waterControls}>
              <TouchableOpacity style={styles.waterBtn} onPress={handleRemoveWater}>
                <Ionicons name="remove" size={16} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.waterBtn, { backgroundColor: 'rgba(56, 189, 248, 0.25)' }]} onPress={handleAddWater}>
                <Ionicons name="add" size={16} color="#38BDF8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Glasses Grid */}
          <View style={styles.glassesGrid}>
            {Array.from({ length: maxGlasses }).map((_, idx) => {
              const isFilled = idx < waterGlasses;
              return (
                <View
                  key={idx}
                  style={[
                    styles.glassCup,
                    isFilled && styles.glassCupFilled,
                  ]}
                >
                  <Ionicons
                    name="water"
                    size={14}
                    color={isFilled ? '#38BDF8' : 'rgba(255,255,255,0.2)'}
                  />
                </View>
              );
            })}
          </View>
        </GlassCard>

        {/* 1-Tap Popular Indian Meals */}
        <Text style={styles.sectionHeading}>1-TAP INDIAN MEAL LOGGER</Text>
        <View style={styles.mealGrid}>
          {POPULAR_INDIAN_MEALS.map((meal) => (
            <TouchableOpacity
              key={meal.id}
              style={styles.mealCardBtn}
              activeOpacity={0.8}
              onPress={() => handleAddMealPreset(meal)}
            >
              <GlassCard style={styles.mealCardInner}>
                <Text style={styles.mealEmoji}>{meal.emoji}</Text>
                <Text style={styles.mealName}>{meal.name}</Text>
                <View style={styles.mealMetrics}>
                  <Text style={styles.mealCal}>{meal.calories} kcal</Text>
                  <Text style={styles.mealProtein}>{meal.protein}g Protein</Text>
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: '#0E0E17',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.textPrimary,
  },
  calPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 245, 160, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 160, 0.3)',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  calPillText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 11,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 60,
  },
  macroCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  donutBox: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  donutVal: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  donutSub: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  macroBars: {
    flex: 1,
    gap: SPACING.xs + 2,
  },
  macroBarItem: {},
  macroBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  macroName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  macroGrams: {
    fontSize: 11,
    fontWeight: '800',
  },
  track: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  scannerBanner: {
    marginBottom: SPACING.md,
  },
  scannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  scannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  scannerSub: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  waterCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  waterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm + 4,
  },
  waterTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginRight: SPACING.xs,
  },
  waterTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  waterSub: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  waterControls: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  waterBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  glassCup: {
    width: 24,
    height: 28,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassCupFilled: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    marginBottom: SPACING.sm,
  },
  mealGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  mealCardBtn: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  mealCardInner: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  mealEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  mealName: {
    ...TYPOGRAPHY.heading3,
    fontSize: 12,
    color: COLORS.textPrimary,
    textAlign: 'center',
    minHeight: 32,
  },
  mealMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: SPACING.xs + 2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 4,
  },
  mealCal: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  mealProtein: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
