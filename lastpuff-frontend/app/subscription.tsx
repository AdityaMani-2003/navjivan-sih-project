import React, { useState } from 'react';
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
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import ConfettiCannon from 'react-native-confetti-cannon';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import Badge from '../components/ui/Badge';
import { useUser, SubscriptionTier } from '../context/UserContext';

const { width } = Dimensions.get('window');

interface PlanTier {
  id: SubscriptionTier;
  name: string;
  price: string;
  period: string;
  badge?: string;
  features: string[];
  gradient: readonly [string, string, ...string[]];
}

const PLANS: PlanTier[] = [
  {
    id: 'free',
    name: 'Free Starter',
    price: '₹0',
    period: 'forever',
    features: [
      'Basic Smoke-Free & Step Tracker',
      'Community Tribe Feed Access',
      'Daily Grounding Breathing Exercise',
      'Standard Achievements',
    ],
    gradient: COLORS.gradientDark,
  },
  {
    id: 'premium',
    name: 'Navjivan Pro ✨',
    price: '₹299',
    period: 'per month',
    badge: 'MOST POPULAR',
    features: [
      '24/7 Agentic AI Copilot & Risk Analyzer',
      'Gemini Vision Meal Scanner (Unlimited)',
      'Custom Periodized Workout Plans & Athlete Lab',
      'All 4 Indian Heritage Padyatra Routes',
      'Exclusive Swadeshi Brand Partner Coupons',
      'Priority 24/7 SOS Emergency Alerts',
    ],
    gradient: COLORS.gradientPrimary,
  },
  {
    id: 'elite',
    name: 'Elite Clinical Concierge 🏆',
    price: '₹699',
    period: 'per month',
    badge: 'MAX RESULTS',
    features: [
      'Everything in Pro Included',
      '1-on-1 Certified Wellness & Medical Coach',
      'Personalized Biochemical Recovery PDF Reports',
      'Dedicated Family Guardian SOS Dispatch',
      'Double XP Multiplier on all Swadeshi rewards',
    ],
    gradient: COLORS.gradientSecondary,
  },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const { profile, setProfile } = useUser();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>('premium');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showConfetti, setShowConfetti] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async () => {
    try {
      setSubscribing(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      await setProfile({ subscriptionTier: selectedPlan });
      setShowConfetti(true);

      Toast.show({
        type: 'success',
        text1: 'Subscription Activated! 🎉',
        text2: `Welcome to ${selectedPlan.toUpperCase()} tier. All features unlocked!`,
      });

      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (_err) {
      router.back();
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SaaS Subscriptions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Value Prop Banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroTag}>PREMIUM WELLNESS PLATFORM</Text>
          <Text style={styles.heroTitle}>Unlock Your Full Potential</Text>
          <Text style={styles.heroSub}>
            Invest in your lungs, athletic conditioning, and peace of mind with intelligent Agentic AI guidance.
          </Text>
        </View>

        {/* Billing Cycle Switcher */}
        <View style={styles.cycleRow}>
          <TouchableOpacity
            style={[styles.cycleBtn, billingCycle === 'monthly' && styles.cycleBtnActive]}
            onPress={() => {
              setBillingCycle('monthly');
              Haptics.selectionAsync();
            }}
          >
            <Text style={[styles.cycleText, billingCycle === 'monthly' && styles.cycleTextActive]}>
              Monthly Billing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cycleBtn, billingCycle === 'yearly' && styles.cycleBtnActive]}
            onPress={() => {
              setBillingCycle('yearly');
              Haptics.selectionAsync();
            }}
          >
            <Text style={[styles.cycleText, billingCycle === 'yearly' && styles.cycleTextActive]}>
              Yearly (Save 30% 🔥)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Plans List */}
        <View style={styles.plansList}>
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                activeOpacity={0.9}
                onPress={() => {
                  setSelectedPlan(plan.id);
                  Haptics.selectionAsync();
                }}
              >
                <GlassCard
                  style={{
                    ...styles.planCard,
                    ...(isSelected ? { borderColor: COLORS.primary } : {}),
                  }}
                  gradientBorder={isSelected}
                  borderColors={plan.gradient}
                >
                  <View style={styles.planHeader}>
                    <View>
                      {plan.badge && (
                        <Badge
                          text={plan.badge}
                          variant={plan.id === 'elite' ? 'secondary' : 'primary'}
                          size="sm"
                          style={{ marginBottom: 4 }}
                        />
                      )}
                      <Text style={styles.planName}>{plan.name}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.planPrice}>
                        {billingCycle === 'yearly' && plan.id !== 'free'
                          ? `₹${Math.round(parseInt(plan.price.replace('₹', ''), 10) * 0.7 * 12)}`
                          : plan.price}
                      </Text>
                      <Text style={styles.planPeriod}>
                        {billingCycle === 'yearly' && plan.id !== 'free'
                          ? '/ year'
                          : plan.period}
                      </Text>
                    </View>
                  </View>

                  {/* Feature Checklist */}
                  <View style={styles.featuresList}>
                    {plan.features.map((feat) => (
                      <View key={feat} style={styles.featureItem}>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={plan.id === 'elite' ? COLORS.secondary : COLORS.primary}
                        />
                        <Text style={styles.featureText}>{feat}</Text>
                      </View>
                    ))}
                  </View>
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <GradientButton
          title={subscribing ? 'Processing Upgrade...' : `Activate ${selectedPlan.toUpperCase()} Plan 🚀`}
          loading={subscribing}
          onPress={handleSubscribe}
          colors={
            selectedPlan === 'elite'
              ? COLORS.gradientSecondary
              : COLORS.gradientPrimary
          }
        />
      </View>

      {showConfetti && (
        <ConfettiCannon count={70} origin={{ x: width / 2, y: 0 }} />
      )}
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
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceElevated,
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
    paddingBottom: 80,
  },
  heroBanner: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  heroTag: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
    letterSpacing: 1.5,
  },
  heroTitle: {
    ...TYPOGRAPHY.heading1,
    fontSize: 26,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginVertical: 4,
  },
  heroSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  cycleRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  cycleBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  cycleBtnActive: {
    backgroundColor: COLORS.surfaceElevated,
  },
  cycleText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  cycleTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  plansList: {
    gap: SPACING.md,
  },
  planCard: {
    padding: SPACING.md,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  planName: {
    ...TYPOGRAPHY.heading2,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  planPrice: {
    ...TYPOGRAPHY.heading1,
    fontSize: 24,
    color: COLORS.primary,
  },
  planPeriod: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  featuresList: {
    gap: SPACING.xs + 2,
    marginVertical: SPACING.xs,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
    backgroundColor: COLORS.surface,
  },
});
