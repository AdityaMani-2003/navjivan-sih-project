import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import Badge from '../../components/ui/Badge';
import { earnXPAction } from '../../services/api';

interface PartnerDeal {
  id: string;
  name: string;
  category: string;
  discount: string;
  minXP: number;
  description: string;
  icon: string;
}

const PARTNER_DEALS: PartnerDeal[] = [
  {
    id: 'mb',
    name: 'MuscleBlaze India 🇮🇳',
    category: 'Protein & Athletic Fuel',
    discount: '20% OFF',
    minXP: 300,
    description: 'Valid on Biozyme Whey, Creatine Monohydrate & Peanut Butter.',
    icon: 'dumbbell',
  },
  {
    id: 'twt',
    name: 'The Whole Truth 🍫',
    category: '100% Clean Nutrition',
    discount: '₹250 FLAT OFF',
    minXP: 250,
    description: 'Zero added sugar bars, nut butters, and clean chocolates.',
    icon: 'cookie-bite',
  },
  {
    id: 'cult',
    name: 'Cult.fit Pass 🏋️',
    category: 'Fitness & Group Workouts',
    discount: '14-Day Free Access',
    minXP: 600,
    description: 'Unlimited access to all Cult centers across India.',
    icon: 'running',
  },
  {
    id: 'khadi',
    name: 'Khadi India Ayurveda 🌿',
    category: 'Herbal Wellness & Skincare',
    discount: '25% OFF',
    minXP: 400,
    description: 'Authentic Indian herbal teas, lung detox herbs, and essential oils.',
    icon: 'leaf',
  },
  {
    id: 'boat',
    name: 'boAt Lifestyle ⌚',
    category: 'Smart Activity Bands',
    discount: '₹500 OFF',
    minXP: 800,
    description: 'Valid on all Storm & Wave series SpO2 smart fitness bands.',
    icon: 'watch',
  },
];

export default function PartnersScreen() {
  const router = useRouter();

  const [selectedDeal, setSelectedDeal] = useState<PartnerDeal | null>(null);
  const [couponCode, setCouponCode] = useState<string | null>(null);

  const handleRevealCoupon = (deal: PartnerDeal) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const code = `SWADESHI-${deal.name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSelectedDeal(deal);
      setCouponCode(code);
    } catch (_e) {}
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Swadeshi Brand Partners</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroBanner}>
          <Text style={styles.heroTag}>MAKE IN INDIA WELLNESS</Text>
          <Text style={styles.heroTitle}>Exclusive Brand Perks</Text>
          <Text style={styles.heroSub}>
            Redeem your recovery and step XP for real-world discounts from India's most trusted fitness and nutrition brands.
          </Text>
        </View>

        {/* Partners Grid */}
        <View style={styles.dealsList}>
          {PARTNER_DEALS.map((deal) => (
            <GlassCard key={deal.id} style={styles.dealCard}>
              <View style={styles.dealHeader}>
                <View style={[styles.dealIconBox, { backgroundColor: COLORS.primaryGlow }]}>
                  <FontAwesome5 name={deal.icon as any} size={22} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dealName}>{deal.name}</Text>
                  <Text style={styles.dealCategory}>{deal.category}</Text>
                </View>
                <Badge text={deal.discount} variant="success" size="sm" />
              </View>

              <Text style={styles.dealDesc}>{deal.description}</Text>

              <View style={styles.dealFooter}>
                <View style={styles.xpBox}>
                  <FontAwesome5 name="coins" size={12} color={COLORS.accent} />
                  <Text style={styles.xpText}>{deal.minXP} XP Required</Text>
                </View>

                <TouchableOpacity
                  style={styles.claimBtn}
                  onPress={() => handleRevealCoupon(deal)}
                >
                  <Text style={styles.claimBtnText}>Reveal Coupon 🎁</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          ))}
        </View>
      </ScrollView>

      {/* Coupon Revealed Modal */}
      <Modal visible={!!couponCode} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard} gradientBorder>
            <Text style={{ fontSize: 50, marginBottom: 8 }}>🛍️</Text>
            <Text style={styles.modalHeading}>Voucher Code Generated</Text>
            <Text style={styles.modalSub}>
              Apply this promo code on {selectedDeal?.name}'s checkout screen.
            </Text>

            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{couponCode}</Text>
            </View>

            <GradientButton
              title="Copy & Done 🎉"
              onPress={() => setCouponCode(null)}
              colors={COLORS.gradientPrimary}
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
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 60,
  },
  heroBanner: {
    marginBottom: SPACING.lg,
  },
  heroTag: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
    letterSpacing: 1.2,
  },
  heroTitle: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.textPrimary,
    marginVertical: 2,
  },
  heroSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  dealsList: {
    gap: SPACING.md,
  },
  dealCard: {
    padding: SPACING.md,
  },
  dealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  dealIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealName: {
    ...TYPOGRAPHY.heading3,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  dealCategory: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  dealDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginVertical: SPACING.xs,
  },
  dealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
    paddingTop: SPACING.sm,
    marginTop: 4,
  },
  xpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpText: {
    color: COLORS.accent,
    fontWeight: '700',
    fontSize: 12,
  },
  claimBtn: {
    backgroundColor: COLORS.primaryGlow,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  claimBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
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
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalHeading: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  modalSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  codeBox: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  codeText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
