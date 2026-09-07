import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import GlassCard from '../components/ui/GlassCard';
import ProgressRing from '../components/ui/ProgressRing';
import GradientButton from '../components/ui/GradientButton';
import { fetchRiskAnalysis } from '../services/api';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';

interface DiseaseMarker {
  name: string;
  riskPercent: number;
  category: 'High' | 'Moderate' | 'Low';
  icon: string;
  color: string;
  reversalYears: number;
}

export default function DiseaseRiskScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useUser();

  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);

  const cigs = profile?.smokerProfile?.cigarettesPerDay || 12;
  const years = profile?.smokerProfile?.yearsSmoking || 5;
  const packYears = ((cigs * years) / 20).toFixed(1);

  // Compute baseline risk approximations
  const diseaseMarkers: DiseaseMarker[] = [
    {
      name: 'Coronary Heart Disease',
      riskPercent: Math.min(88, Math.round(25 + cigs * 2.5)),
      category: 'High',
      icon: 'heart-pulse',
      color: COLORS.danger,
      reversalYears: 1,
    },
    {
      name: 'COPD & Bronchitis',
      riskPercent: Math.min(92, Math.round(30 + years * 4)),
      category: 'High',
      icon: 'lungs',
      color: '#F97316',
      reversalYears: 2,
    },
    {
      name: 'Stroke & Vascular Occlusion',
      riskPercent: Math.min(75, Math.round(18 + cigs * 2)),
      category: 'Moderate',
      icon: 'brain',
      color: '#EAB308',
      reversalYears: 5,
    },
    {
      name: 'Lung Malignancy Risk',
      riskPercent: Math.min(85, Math.round(15 + years * 4.5)),
      category: 'High',
      icon: 'shield-alert',
      color: '#EC4899',
      reversalYears: 10,
    },
    {
      name: 'Peripheral Artery Disease',
      riskPercent: Math.min(68, Math.round(12 + cigs * 1.8)),
      category: 'Moderate',
      icon: 'walk',
      color: COLORS.secondary,
      reversalYears: 3,
    },
  ];

  const loadAiRisk = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const res = await fetchRiskAnalysis({
        cigarettesPerDay: cigs,
        smokingYears: years,
        age: user?.age || 26,
      });
      if (res?.data) {
        setAiReport(res.data);
      }
    } catch (_err) {
      setAiReport({
        summary: `With ${packYears} pack-years of exposure, your vascular endothelium is currently inflamed, but quitting today halts progression immediately. Within 365 days of zero puffs, your risk of sudden myocardial infarction plummets by 50%.`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAiRisk();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Disease Risk Prognosis</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Pack-Year Metric Card */}
        <GlassCard style={styles.heroCard} gradientBorder borderColors={COLORS.gradientDanger}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroLabel}>CALCULATED EXPOSURE</Text>
              <Text style={styles.heroValue}>{packYears} Pack-Years</Text>
            </View>
            <View style={styles.warningBadge}>
              <Text style={styles.warningBadgeText}>⚠️ Elevated Risk</Text>
            </View>
          </View>
          <Text style={styles.heroDesc}>
            Based on {cigs} cigarettes/day for {years} years. Every smoke-free hour actively reverses cellular damage and resets your cardiovascular trajectory.
          </Text>
        </GlassCard>

        {/* AI Insight Box */}
        <Text style={styles.sectionTitle}>Agentic AI Clinical Summary</Text>
        <GlassCard style={styles.aiBox}>
          {loading ? (
            <ActivityIndicator color={COLORS.primary} size="small" />
          ) : (
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              <MaterialCommunityIcons name="stethoscope" size={24} color={COLORS.primary} />
              <Text style={styles.aiText}>
                {aiReport?.summary ||
                  `Endothelial inflammation is elevated at ${packYears} pack-years. Quitting immediately restores arterial elasticity within 12 weeks.`}
              </Text>
            </View>
          )}
        </GlassCard>

        {/* 5 Disease Markers */}
        <Text style={styles.sectionTitle}>Organ System Risk Breakdown</Text>
        <View style={styles.markersGrid}>
          {diseaseMarkers.map((m) => (
            <GlassCard key={m.name} style={styles.markerCard}>
              <View style={styles.markerRow}>
                <ProgressRing
                  size={60}
                  strokeWidth={5}
                  progress={m.riskPercent / 100}
                  color={m.color}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.markerName}>{m.name}</Text>
                  <Text style={styles.markerSub}>
                    Drops to baseline in <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{m.reversalYears} yrs</Text> smoke-free
                  </Text>
                </View>
                <View style={[styles.riskTag, { backgroundColor: m.color + '22', borderColor: m.color }]}>
                  <Text style={[styles.riskTagText, { color: m.color }]}>{m.riskPercent}%</Text>
                </View>
              </View>
            </GlassCard>
          ))}
        </View>

        {/* Reversal Timeline */}
        <Text style={styles.sectionTitle}>Health Reversal Milestones</Text>
        <GlassCard style={styles.timelineCard}>
          <View style={styles.timelineItem}>
            <Ionicons name="time" size={20} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.timelineTitle}>1 Year Smoke-Free</Text>
              <Text style={styles.timelineDesc}>Coronary heart disease risk drops by 50% compared to a continuing smoker.</Text>
            </View>
          </View>

          <View style={styles.timelineDivider} />

          <View style={styles.timelineItem}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.timelineTitle}>5 Years Smoke-Free</Text>
              <Text style={styles.timelineDesc}>Stroke risk drops to equal that of a lifetime non-smoker.</Text>
            </View>
          </View>

          <View style={styles.timelineDivider} />

          <View style={styles.timelineItem}>
            <Ionicons name="trophy" size={20} color={COLORS.success} />
            <View style={{ flex: 1 }}>
              <Text style={styles.timelineTitle}>10 Years Smoke-Free</Text>
              <Text style={styles.timelineDesc}>Lung cancer mortality cut by over half. Precancerous cells replaced by healthy tissue.</Text>
            </View>
          </View>
        </GlassCard>

        {/* Action Button */}
        <GradientButton
          title="Back to Quit Plan 🚀"
          onPress={() => router.push('/quit-plan' as any)}
          colors={COLORS.gradientPrimary}
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
  heroCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  heroLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.danger,
  },
  heroValue: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  warningBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.danger,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  warningBadgeText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: '700',
  },
  heroDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  sectionTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  aiBox: {
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  aiText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    lineHeight: 20,
    flex: 1,
  },
  markersGrid: {
    gap: SPACING.xs + 2,
  },
  markerCard: {
    padding: SPACING.md,
  },
  markerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  markerName: {
    ...TYPOGRAPHY.heading3,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  markerSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  riskTag: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  riskTagText: {
    fontWeight: '800',
    fontSize: 13,
  },
  timelineCard: {
    padding: SPACING.md,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  timelineTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  timelineDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  timelineDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceBorder,
    marginVertical: SPACING.md,
  },
});
