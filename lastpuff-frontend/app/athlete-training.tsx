import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import Badge from '../components/ui/Badge';
import SectionHeader from '../components/ui/SectionHeader';

interface SportInfo {
  id: string;
  name: string;
  emoji: string;
  category: string;
  drills: { name: string; focus: string; duration: string }[];
}

const SPORTS_DATABASE: SportInfo[] = [
  {
    id: 'cricket',
    name: 'Cricket Performance',
    emoji: '🏏',
    category: 'Batting / Fast Bowling Power',
    drills: [
      { name: 'Rotational Med-Ball Slams', focus: 'Torque & Core Power for boundary hitting', duration: '4 sets × 10' },
      { name: 'Shoulder Deceleration Band Pulls', focus: 'Rotator cuff defense for pace bowling', duration: '3 sets × 15' },
      { name: 'Single-Leg Lateral Bounds', focus: 'Crease jumping & quick single acceleration', duration: '4 sets × 8/leg' },
    ],
  },
  {
    id: 'running',
    name: 'Endurance Running',
    emoji: '🏃',
    category: '5K / 10K / Half Marathon Pacing',
    drills: [
      { name: 'Tempo Strides & Hill Repeats', focus: 'VO2 Max & Lactate Threshold', duration: '6 × 200m' },
      { name: 'A-Skips & B-Skips Technique', focus: 'Midfoot strike mechanics & cadence', duration: '3 × 40m' },
      { name: 'Single-Leg Calf Raises', focus: 'Achilles tendon resilience', duration: '3 sets × 20' },
    ],
  },
  {
    id: 'badminton',
    name: 'Badminton & Racket Sports',
    emoji: '🏸',
    category: 'Smash Power & Court Footwork',
    drills: [
      { name: 'Split-Step Reaction Drills', focus: 'Sub-second first step reaction time', duration: '5 mins' },
      { name: 'Forearm Pronation & Wrist Snaps', focus: 'Steep smash velocity', duration: '4 sets × 20' },
      { name: 'Shadow Corner Lunges', focus: 'Court coverage endurance', duration: '4 sets × 12' },
    ],
  },
  {
    id: 'kabaddi',
    name: 'Kabaddi Conditioning',
    emoji: '🤼',
    category: 'Explosive Tackling & Raid Agility',
    drills: [
      { name: 'Explosive Bear Crawls', focus: 'Shoulder stability & ground power', duration: '4 × 20m' },
      { name: 'Broad Jump to Sprint', focus: 'Raid evasion sudden burst speed', duration: '5 reps' },
      { name: 'Heavy Farmer Walks', focus: 'Ankle hold grip & body trapping strength', duration: '4 × 40m' },
    ],
  },
  {
    id: 'football',
    name: 'Football / Soccer',
    emoji: '⚽',
    category: '90-Min Stamina & Match Agility',
    drills: [
      { name: 'T-Drill Cone Sprints', focus: 'Multidirectional change of direction', duration: '5 cycles' },
      { name: 'Nordic Hamstring Curls', focus: 'Sprint injury prevention', duration: '3 sets × 8' },
      { name: 'Box-to-Box Interval Sprints', focus: 'Match stamina conditioning', duration: '8 × 60m' },
    ],
  },
];

export default function AthleteTrainingScreen() {
  const router = useRouter();

  const [selectedSport, setSelectedSport] = useState<SportInfo>(SPORTS_DATABASE[0]);
  const [selectedPhase, setSelectedPhase] = useState<'base' | 'hypertrophy' | 'agility' | 'peak'>('agility');

  const selectSport = (sport: SportInfo) => {
    try {
      Haptics.selectionAsync();
    } catch (_e) {}
    setSelectedSport(sport);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Athlete Performance Lab</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sport Selector Chips */}
        <Text style={styles.sectionTitle}>Select Your Athletic Discipline</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sportsScroll}
        >
          {SPORTS_DATABASE.map((s) => {
            const isSelected = selectedSport.id === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.sportChip,
                  isSelected && styles.sportChipActive,
                ]}
                onPress={() => selectSport(s)}
              >
                <Text style={styles.sportEmoji}>{s.emoji}</Text>
                <Text
                  style={[
                    styles.sportChipText,
                    isSelected && styles.sportChipTextActive,
                  ]}
                >
                  {s.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Sport Header Card */}
        <GlassCard
          style={styles.sportCard}
          gradientBorder
          borderColors={COLORS.gradientSecondary}
        >
          <View style={styles.sportHeaderRow}>
            <Text style={{ fontSize: 36 }}>{selectedSport.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.sportTitle}>{selectedSport.name}</Text>
              <Text style={styles.sportCategory}>{selectedSport.category}</Text>
            </View>
            <Badge text="PRO LAB" variant="secondary" size="sm" />
          </View>
        </GlassCard>

        {/* Phase Periodization Tabs */}
        <Text style={styles.sectionTitle}>Training Phase</Text>
        <View style={styles.phaseTabs}>
          {[
            { id: 'base', name: 'Base' },
            { id: 'hypertrophy', name: 'Power' },
            { id: 'agility', name: 'Agility' },
            { id: 'peak', name: 'Match Day' },
          ].map((ph) => {
            const isSelected = selectedPhase === ph.id;
            return (
              <TouchableOpacity
                key={ph.id}
                style={[
                  styles.phaseBtn,
                  isSelected && styles.phaseBtnActive,
                ]}
                onPress={() => {
                  setSelectedPhase(ph.id as any);
                  Haptics.selectionAsync();
                }}
              >
                <Text
                  style={[
                    styles.phaseText,
                    isSelected && styles.phaseTextActive,
                  ]}
                >
                  {ph.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Drills Library */}
        <SectionHeader title="High-Performance Drills" />
        <View style={styles.drillsList}>
          {selectedSport.drills.map((drill, idx) => (
            <GlassCard key={drill.name} style={styles.drillCard}>
              <View style={styles.drillHeader}>
                <View style={styles.drillNumBox}>
                  <Text style={styles.drillNum}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.drillName}>{drill.name}</Text>
                  <Text style={styles.drillFocus}>{drill.focus}</Text>
                </View>
                <Badge text={drill.duration} variant="primary" size="sm" />
              </View>
            </GlassCard>
          ))}
        </View>

        {/* Activation CTA */}
        <GradientButton
          title="Adopt This Sport Regimen ⚡"
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show({
              type: 'success',
              text1: `${selectedSport.name} Regimen Set! 🏅`,
              text2: 'Weekly workouts customized for sports performance.',
            });
            router.push('/fitness-plans' as any);
          }}
          colors={COLORS.gradientSecondary}
          style={{ marginTop: SPACING.md }}
        />
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 60,
  },
  sectionTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  sportsScroll: {
    gap: SPACING.xs + 2,
    marginBottom: SPACING.lg,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  sportChipActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondaryGlow,
  },
  sportEmoji: {
    fontSize: 16,
  },
  sportChipText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  sportChipTextActive: {
    color: COLORS.secondary,
  },
  sportCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sportHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  sportTitle: {
    ...TYPOGRAPHY.heading2,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  sportCategory: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  phaseTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  phaseBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  phaseBtnActive: {
    backgroundColor: COLORS.surfaceElevated,
  },
  phaseText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  phaseTextActive: {
    color: COLORS.secondary,
    fontWeight: '700',
  },
  drillsList: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  drillCard: {
    padding: SPACING.md,
  },
  drillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  drillNumBox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.secondaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drillNum: {
    color: COLORS.secondary,
    fontWeight: '800',
    fontSize: 14,
  },
  drillName: {
    ...TYPOGRAPHY.heading3,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  drillFocus: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
});
