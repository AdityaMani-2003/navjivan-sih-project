import React, { useState, useEffect } from 'react';
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
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import Badge from '../../components/ui/Badge';
import { fetchXPStats } from '../../services/api';

interface AchievementItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

interface StoreItem {
  id: string;
  title: string;
  partner: string;
  costXP: number;
  discount: string;
  category: string;
  icon: string;
}

const STORE_ITEMS: StoreItem[] = [
  {
    id: 'mb_10',
    title: '15% Off Whey & Supplements',
    partner: 'MuscleBlaze',
    costXP: 250,
    discount: '15% OFF',
    category: 'Fitness',
    icon: 'dumbbell',
  },
  {
    id: 'twt_clean',
    title: '₹200 Off Clean Energy Bars',
    partner: 'The Whole Truth',
    costXP: 300,
    discount: '₹200 OFF',
    category: 'Nutrition',
    icon: 'cookie-bite',
  },
  {
    id: 'cult_pass',
    title: '7-Day Cult.fit Pass Free',
    partner: 'Cult.fit',
    costXP: 600,
    discount: 'FREE PASS',
    category: 'Gym',
    icon: 'running',
  },
  {
    id: 'khadi_organic',
    title: '20% Off Herbal Wellness',
    partner: 'Khadi India',
    costXP: 450,
    discount: '20% OFF',
    category: 'Ayurveda',
    icon: 'leaf',
  },
  {
    id: 'boat_fitness',
    title: '₹500 Off Smart Activity Band',
    partner: 'boAt Lifestyle',
    costXP: 1000,
    discount: '₹500 OFF',
    category: 'Wearables',
    icon: 'watch',
  },
];

const ACHIEVEMENTS: AchievementItem[] = [
  { id: 'first_step', name: 'First Smoke-Free Day', description: 'Survive 24 full hours clean', icon: 'medal', unlocked: true },
  { id: 'craving_warrior', name: 'Craving Slayer', description: 'Conquer 10 SOS emergencies', icon: 'shield-alt', unlocked: true },
  { id: 'money_saver', name: 'Piggy Bank Hero', description: 'Save ₹1,000 in cigarette funds', icon: 'coins', unlocked: true },
  { id: 'week_clean', name: '7-Day Iron Will', description: 'One full week of unbroken recovery', icon: 'fire', unlocked: true },
  { id: 'padyatra_walker', name: 'Dandi March Pioneer', description: 'Walk 50,000 steps on heritage routes', icon: 'hiking', unlocked: false },
  { id: 'breathe_master', name: 'Prana Master', description: 'Complete 15 guided breathing sessions', icon: 'lungs', unlocked: false },
  { id: 'clean_month', name: '30-Day Legend', description: 'Reclaim 100% of vital lung capacity', icon: 'crown', unlocked: false },
  { id: 'swadeshi_advocate', name: 'Swadeshi Champion', description: 'Redeem 3 Indian brand rewards', icon: 'store', unlocked: false },
];

export default function RewardsScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'achievements' | 'store'>('store');
  const [xp, setXp] = useState(480);
  const [level, setLevel] = useState(1);
  const [levelTitle, setLevelTitle] = useState('Smoke-Free Warrior');
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);
  const [redeemingItem, setRedeemingItem] = useState<StoreItem | null>(null);

  useEffect(() => {
    const loadXP = async () => {
      try {
        const res = await fetchXPStats();
        if (res?.data) {
          setXp(res.data.xp || 480);
          setLevel(res.data.level || 1);
          setLevelTitle(res.data.levelName || 'Smoke-Free Warrior');
        }
      } catch (_e) {}
    };
    loadXP();
  }, []);

  const handleRedeem = async (item: StoreItem) => {
    if (xp < item.costXP) {
      Toast.show({
        type: 'error',
        text1: 'Insufficient XP',
        text2: `You need ${item.costXP - xp} more XP to redeem this coupon.`,
      });
      return;
    }

    try {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_e) {}
      const code = `NAVJIVAN-${item.partner.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setXp((prev) => prev - item.costXP);
      setRedeemingItem(item);
      setRedeemedCode(code);
    } catch (_e) {}
  };

  const nextLevelXP = level === 1 ? 500 : level === 2 ? 1500 : 3500;
  const progressPercent = Math.min(100, Math.round((xp / nextLevelXP) * 100));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Swadeshi Rewards & XP</Text>
        <View style={styles.xpPill}>
          <FontAwesome5 name="coins" size={14} color={COLORS.accent} />
          <Text style={styles.xpPillText}>{xp} XP</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Level Card */}
        <GlassCard style={styles.levelCard} gradientBorder>
          <View style={styles.levelHeader}>
            <View style={[styles.levelIconBox, { backgroundColor: COLORS.primaryGlow }]}>
              <Ionicons name="trophy" size={28} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.levelTag}>LEVEL {level}</Text>
              <Text style={styles.levelTitle}>{levelTitle}</Text>
            </View>
            <Text style={styles.levelPercent}>{progressPercent}%</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.levelSub}>
            {xp} / {nextLevelXP} XP to Level {level + 1}
          </Text>
        </GlassCard>

        {/* Tab Switcher */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'store' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('store');
              try {
                Haptics.selectionAsync();
              } catch (_e) {}
            }}
          >
            <Text style={[styles.tabText, activeTab === 'store' && styles.tabTextActive]}>
              Rewards Store 🛍️
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'achievements' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('achievements');
              try {
                Haptics.selectionAsync();
              } catch (_e) {}
            }}
          >
            <Text style={[styles.tabText, activeTab === 'achievements' && styles.tabTextActive]}>
              Achievements 🎖️
            </Text>
          </TouchableOpacity>
        </View>

        {/* Store Tab */}
        {activeTab === 'store' && (
          <View style={styles.storeGrid}>
            {STORE_ITEMS.map((item) => {
              const canAfford = xp >= item.costXP;
              return (
                <GlassCard key={item.id} style={styles.storeItemCard}>
                  <View style={styles.storeHeader}>
                    <View style={[styles.storeIconBox, { backgroundColor: COLORS.surfaceElevated }]}>
                      <FontAwesome5 name={item.icon as any} size={20} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.partnerName}>{item.partner}</Text>
                      <Text style={styles.storeTitle}>{item.title}</Text>
                    </View>
                    <Badge text={item.discount} variant="success" size="sm" />
                  </View>

                  <View style={styles.storeFooter}>
                    <View style={styles.costBox}>
                      <FontAwesome5 name="coins" size={12} color={COLORS.accent} />
                      <Text style={styles.costText}>{item.costXP} XP</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.redeemBtn,
                        !canAfford && styles.redeemBtnDisabled,
                      ]}
                      onPress={() => handleRedeem(item)}
                      disabled={!canAfford}
                    >
                      <Text style={[styles.redeemBtnText, !canAfford && { color: COLORS.textMuted }]}>
                        {canAfford ? 'Redeem Coupon' : 'Locked 🔒'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              );
            })}
          </View>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <View style={styles.achievementsGrid}>
            {ACHIEVEMENTS.map((ach) => (
              <GlassCard
                key={ach.id}
                style={{
                  ...styles.achCard,
                  ...(ach.unlocked ? {} : { opacity: 0.5 }),
                }}
              >
                <View style={[styles.achIconBox, { backgroundColor: ach.unlocked ? COLORS.primaryGlow : COLORS.surfaceElevated }]}>
                  <FontAwesome5
                    name={ach.icon as any}
                    size={22}
                    color={ach.unlocked ? COLORS.primary : COLORS.textMuted}
                  />
                </View>
                <Text style={styles.achName}>{ach.name}</Text>
                <Text style={styles.achDesc}>{ach.description}</Text>
                {ach.unlocked ? (
                  <View style={styles.unlockedPill}>
                    <Text style={styles.unlockedText}>UNLOCKED ✓</Text>
                  </View>
                ) : (
                  <View style={styles.lockedPill}>
                    <Text style={styles.lockedText}>LOCKED 🔒</Text>
                  </View>
                )}
              </GlassCard>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Redeemed Coupon Modal */}
      <Modal visible={!!redeemedCode} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard} gradientBorder>
            <Text style={{ fontSize: 50, marginBottom: 8 }}>🎁</Text>
            <Text style={styles.modalHeading}>Coupon Unlocked!</Text>
            <Text style={styles.modalSub}>
              Use this voucher on {redeemingItem?.partner}'s official store/app at checkout.
            </Text>

            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{redeemedCode}</Text>
            </View>

            <GradientButton
              title="Done 🎉"
              onPress={() => setRedeemedCode(null)}
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
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  xpPillText: {
    color: COLORS.accent,
    fontWeight: '800',
    fontSize: 13,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 60,
  },
  levelCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  levelIconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelTag: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
  },
  levelTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.textPrimary,
  },
  levelPercent: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.primary,
  },
  barTrack: {
    height: 8,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginVertical: SPACING.xs,
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  levelSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
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
  storeGrid: {
    gap: SPACING.sm,
  },
  storeItemCard: {
    padding: SPACING.md,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  storeIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerName: {
    ...TYPOGRAPHY.label,
    color: COLORS.textMuted,
  },
  storeTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  storeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
    paddingTop: SPACING.xs + 4,
  },
  costBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  costText: {
    color: COLORS.accent,
    fontWeight: '800',
    fontSize: 14,
  },
  redeemBtn: {
    backgroundColor: COLORS.primaryGlow,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  redeemBtnDisabled: {
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.surfaceBorder,
  },
  redeemBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  achCard: {
    width: '48%',
    padding: SPACING.md,
    alignItems: 'center',
  },
  achIconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  achName: {
    ...TYPOGRAPHY.heading3,
    fontSize: 13,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  achDesc: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: SPACING.xs,
  },
  unlockedPill: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  unlockedText: {
    color: COLORS.success,
    fontSize: 9,
    fontWeight: '800',
  },
  lockedPill: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  lockedText: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '800',
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
