import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinear, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import ConfettiCannon from 'react-native-confetti-cannon';

import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import Badge from '../components/ui/Badge';
import { earnXPAction } from '../services/api';

const { width } = Dimensions.get('window');

interface Milestone {
  id: string;
  name: string;
  distanceKm: number;
  stepsRequired: number;
  description: string;
  isUnlocked: boolean;
}

const DANDI_MARCH_MILESTONES: Milestone[] = [
  { id: 'm1', name: 'Sabarmati Ashram', distanceKm: 0, stepsRequired: 0, description: 'The historic starting point where Mahatma Gandhi began the Salt March on March 12, 1930.', isUnlocked: true },
  { id: 'm2', name: 'Aslali', distanceKm: 19, stepsRequired: 25000, description: 'The first halt where thousands of villagers joined the peaceful march.', isUnlocked: true },
  { id: 'm3', name: 'Nadiad', distanceKm: 56, stepsRequired: 75000, description: 'A massive gathering of patriots providing food, clean water, and shelter.', isUnlocked: false },
  { id: 'm4', name: 'Anand', distanceKm: 85, stepsRequired: 115000, description: 'The heart of Gujarat where local leaders declared unity in civil resistance.', isUnlocked: false },
  { id: 'm5', name: 'Navsari', distanceKm: 340, stepsRequired: 450000, description: 'The penultimate stop before reaching the coastal shores.', isUnlocked: false },
  { id: 'm6', name: 'Dandi Seashore', distanceKm: 385, stepsRequired: 500000, description: 'The historic beach where Gandhi lifted a pinch of salt, sparking a national movement.', isUnlocked: false },
];

export default function PadyatraScreen() {
  const router = useRouter();

  const [activeRoute, setActiveRoute] = useState<'dandi' | 'chardham' | 'everest'>('dandi');
  const [totalSteps, setTotalSteps] = useState(38450);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone>(DANDI_MARCH_MILESTONES[1]);
  const [showConfetti, setShowConfetti] = useState(false);

  const totalTargetSteps = 500000;
  const progressPercent = Math.min(100, Math.round((totalSteps / totalTargetSteps) * 100));
  const kmCovered = (totalSteps * 0.000762).toFixed(1); // avg step = 0.76m

  const handleSimulateSteps = async (amount: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setTotalSteps((prev) => prev + amount);
      await earnXPAction(Math.floor(amount / 50), 'padyatra_step_sync');

      // Check if unlocked a milestone
      if (totalSteps + amount >= 75000 && !DANDI_MARCH_MILESTONES[2].isUnlocked) {
        DANDI_MARCH_MILESTONES[2].isUnlocked = true;
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        Toast.show({
          type: 'success',
          text1: 'Milestone Unlocked! 🏛️',
          text2: 'You have reached Nadiad on the Dandi March route! +100 XP',
        });
      } else {
        Toast.show({
          type: 'success',
          text1: `+${amount} Steps Logged 👣`,
          text2: `You advanced ${(amount * 0.000762).toFixed(2)} km on your pilgrimage.`,
        });
      }
    } catch (_e) {}
  };

  return (
    <SafeAreaView style={styles.container}>
      {showConfetti && (
        <ConfettiCannon
          count={80}
          origin={{ x: width / 2, y: 0 }}
          autoStart={true}
          fadeOut={true}
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Padyatra Heritage Walk</Text>
        <View style={styles.xpPill}>
          <FontAwesome5 name="hiking" size={12} color={COLORS.secondary} />
          <Text style={styles.xpText}>{kmCovered} km</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Route Selector Tabs */}
        <View style={styles.routeTabs}>
          <TouchableOpacity
            style={[styles.routeTab, activeRoute === 'dandi' && styles.routeTabActive]}
            onPress={() => {
              setActiveRoute('dandi');
              try {
                Haptics.selectionAsync();
              } catch (_e) {}
            }}
          >
            <Text style={[styles.routeTabText, activeRoute === 'dandi' && styles.routeTabTextActive]}>
              Dandi March 🇮🇳
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.routeTab, activeRoute === 'chardham' && styles.routeTabActive]}
            onPress={() => {
              setActiveRoute('chardham');
              try {
                Haptics.selectionAsync();
              } catch (_e) {}
            }}
          >
            <Text style={[styles.routeTabText, activeRoute === 'chardham' && styles.routeTabTextActive]}>
              Char Dham 🕉️
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.routeTab, activeRoute === 'everest' && styles.routeTabActive]}
            onPress={() => {
              setActiveRoute('everest');
              try {
                Haptics.selectionAsync();
              } catch (_e) {}
            }}
          >
            <Text style={[styles.routeTabText, activeRoute === 'everest' && styles.routeTabTextActive]}>
              Everest Trail 🏔️
            </Text>
          </TouchableOpacity>
        </View>

        {/* Trail Progress Hero Card */}
        <GlassCard style={styles.heroCard} gradientBorder>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroRouteTag}>HISTORICAL ROUTE</Text>
              <Text style={styles.heroRouteTitle}>Dandi Salt March (1930)</Text>
            </View>
            <Badge text={`${progressPercent}% DONE`} variant="success" size="sm" />
          </View>

          {/* Interactive SVG Trail Canvas */}
          <View style={styles.svgTrailBox}>
            <Svg width="100%" height={90} viewBox="0 0 320 90">
              <Defs>
                <SvgLinear id="trailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor={COLORS.primary} />
                  <Stop offset="100%" stopColor={COLORS.secondary} />
                </SvgLinear>
              </Defs>
              {/* Background Path */}
              <Path
                d="M 20,45 Q 90,15 160,45 T 300,45"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth={5}
                fill="none"
              />
              {/* Active Progress Path */}
              <Path
                d="M 20,45 Q 90,15 160,45 T 300,45"
                stroke="url(#trailGrad)"
                strokeWidth={5}
                strokeDasharray="300"
                strokeDashoffset={`${300 * (1 - progressPercent / 100)}`}
                fill="none"
              />
              {/* Milestone Dots */}
              <Circle cx="20" cy="45" r="7" fill={COLORS.primary} />
              <Circle cx="90" cy="30" r="7" fill={totalSteps >= 25000 ? COLORS.primary : 'rgba(255,255,255,0.2)'} />
              <Circle cx="160" cy="45" r="7" fill={totalSteps >= 75000 ? COLORS.primary : 'rgba(255,255,255,0.2)'} />
              <Circle cx="230" cy="60" r="7" fill={totalSteps >= 115000 ? COLORS.primary : 'rgba(255,255,255,0.2)'} />
              <Circle cx="300" cy="45" r="8" fill={totalSteps >= 500000 ? COLORS.secondary : 'rgba(255,255,255,0.2)'} />
            </Svg>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{totalSteps.toLocaleString()}</Text>
              <Text style={styles.metricSub}>Total Steps</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: COLORS.secondary }]}>{kmCovered} km</Text>
              <Text style={styles.metricSub}>Distance Walked</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: COLORS.accent }]}>1,420 kcal</Text>
              <Text style={styles.metricSub}>Calories Expended</Text>
            </View>
          </View>
        </GlassCard>

        {/* Live Step Simulator / Pedometer Sync */}
        <View style={styles.syncRow}>
          <TouchableOpacity
            style={styles.syncBtn}
            onPress={() => handleSimulateSteps(500)}
            activeOpacity={0.75}
          >
            <Ionicons name="add" size={16} color={COLORS.primary} />
            <Text style={styles.syncBtnText}>+500 Steps</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.syncBtn}
            onPress={() => handleSimulateSteps(1000)}
            activeOpacity={0.75}
          >
            <Ionicons name="add" size={16} color={COLORS.secondary} />
            <Text style={[styles.syncBtnText, { color: COLORS.secondary }]}>+1,000 Steps</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.syncBtn, { borderColor: COLORS.accent }]}
            onPress={() => handleSimulateSteps(2500)}
            activeOpacity={0.75}
          >
            <Ionicons name="flame" size={16} color={COLORS.accent} />
            <Text style={[styles.syncBtnText, { color: COLORS.accent }]}>+2,500 Steps</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Milestone Information Card */}
        <Text style={styles.sectionHeading}>ROUTE MILESTONES & HERITAGE TRIVIA</Text>
        <GlassCard style={styles.milestoneCard}>
          <View style={styles.milestoneCardHeader}>
            <View style={[styles.milestoneIconBox, { backgroundColor: COLORS.secondaryGlow }]}>
              <Ionicons name="flag" size={22} color={COLORS.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.milestoneName}>{selectedMilestone.name}</Text>
              <Text style={styles.milestoneKm}>
                {selectedMilestone.distanceKm} km from start • {selectedMilestone.stepsRequired.toLocaleString()} steps
              </Text>
            </View>
            <Badge
              text={selectedMilestone.isUnlocked ? 'UNLOCKED ✓' : 'LOCKED 🔒'}
              variant={selectedMilestone.isUnlocked ? 'success' : 'muted'}
              size="sm"
            />
          </View>
          <Text style={styles.milestoneDesc}>{selectedMilestone.description}</Text>
        </GlassCard>

        {/* Milestone Pin List */}
        <View style={styles.milestonesList}>
          {DANDI_MARCH_MILESTONES.map((m, idx) => (
            <TouchableOpacity
              key={m.id}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedMilestone(m);
                try {
                  Haptics.selectionAsync();
                } catch (_e) {}
              }}
            >
              <GlassCard
                style={{
                  ...styles.milestoneRowCard,
                  ...(selectedMilestone.id === m.id ? styles.milestoneRowCardActive : {}),
                }}
              >
                <View style={styles.milestoneRowInner}>
                  <View style={styles.milestoneIdxBox}>
                    <Text style={styles.milestoneIdx}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.milestoneRowName}>{m.name}</Text>
                    <Text style={styles.milestoneRowSub}>{m.stepsRequired.toLocaleString()} steps</Text>
                  </View>
                  <Ionicons
                    name={m.isUnlocked ? 'checkmark-circle' : 'lock-closed'}
                    size={20}
                    color={m.isUnlocked ? COLORS.success : COLORS.textMuted}
                  />
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
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  xpText: {
    color: COLORS.secondary,
    fontWeight: '800',
    fontSize: 12,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 60,
  },
  routeTabs: {
    flexDirection: 'row',
    backgroundColor: '#0E0E17',
    borderRadius: RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.md,
  },
  routeTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  routeTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  routeTabText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  routeTabTextActive: {
    color: COLORS.textPrimary,
  },
  heroCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  heroRouteTag: {
    ...TYPOGRAPHY.label,
    color: COLORS.secondary,
  },
  heroRouteTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  svgTrailBox: {
    marginVertical: SPACING.xs,
    alignItems: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: SPACING.sm,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  metricSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  syncRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  syncBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#0E0E17',
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 160, 0.3)',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
  },
  syncBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    marginBottom: SPACING.sm,
  },
  milestoneCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  milestoneCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs + 2,
  },
  milestoneIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneName: {
    ...TYPOGRAPHY.heading3,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  milestoneKm: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  milestoneDesc: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  milestonesList: {
    gap: SPACING.xs + 4,
  },
  milestoneRowCard: {
    padding: SPACING.sm + 4,
    backgroundColor: '#0E0E17',
  },
  milestoneRowCardActive: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
  },
  milestoneRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm + 2,
  },
  milestoneIdxBox: {
    width: 26,
    height: 26,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneIdx: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 12,
  },
  milestoneRowName: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  milestoneRowSub: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
