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
import * as Location from 'expo-location';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useUser, UserType } from '../../context/UserContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const { setUserType } = useUser();

  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<UserType>('smoker');

  // Permissions state
  const [notificationsGranted, setNotificationsGranted] = useState<boolean | null>(null);
  const [locationGranted, setLocationGranted] = useState<boolean | null>(null);

  const handleNext = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_e) {}

    if (step === 2) {
      await setUserType(selectedType);
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      // Navigate to specialized setup based on profile type
      if (selectedType === 'smoker') {
        router.push('/onboarding/smoker-setup' as any);
      } else {
        router.push('/onboarding/fitness-setup' as any);
      }
    }
  };

  const handleBack = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_e) {}
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const isExpoGo =
        Constants.appOwnership === 'expo' ||
        Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
      
      if (isExpoGo) {
        setNotificationsGranted(true);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (_e) {}
        return;
      }

      const Notifications = await import('expo-notifications');
      const { status } = await Notifications.requestPermissionsAsync();
      setNotificationsGranted(status === 'granted');
      try {
        Haptics.notificationAsync(
          status === 'granted'
            ? Haptics.NotificationFeedbackType.Success
            : Haptics.NotificationFeedbackType.Warning
        );
      } catch (_e) {}
    } catch (_e) {
      setNotificationsGranted(true);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationGranted(status === 'granted');
      try {
        Haptics.notificationAsync(
          status === 'granted'
            ? Haptics.NotificationFeedbackType.Success
            : Haptics.NotificationFeedbackType.Warning
        );
      } catch (_e) {}
    } catch (_e) {
      setLocationGranted(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Stepper Bar */}
      <View style={styles.header}>
        <View style={styles.progressBarContainer}>
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.progressSegment,
                i <= step && {
                  backgroundColor:
                    selectedType === 'non-smoker' ? COLORS.secondary : COLORS.primary,
                },
              ]}
            />
          ))}
        </View>
        <Text style={styles.stepIndicator}>STEP {step} OF 4</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* STEP 1: WELCOME & VALUE PROP */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <View style={styles.heroBadge}>
              <Ionicons name="sparkles" size={16} color={COLORS.primary} />
              <Text style={styles.heroBadgeText}>Next-Gen Wellness Platform</Text>
            </View>

            <Text style={styles.title}>
              Welcome to <Text style={{ color: COLORS.primary }}>Navjivan</Text>
            </Text>
            <Text style={styles.subtitle}>
              India's premier AI-powered health companion. Whether you're breaking free from smoking or leveling up your fitness, your personalized journey starts here.
            </Text>

            <View style={styles.featureGrid}>
              <GlassCard style={styles.featureCard}>
                <View style={[styles.iconWrapper, { backgroundColor: COLORS.primaryGlow }]}>
                  <MaterialCommunityIcons name="robot" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.featureTitle}>Agentic AI Health Coach</Text>
                <Text style={styles.featureDesc}>
                  Real-time intelligent recommendations, risk assessments, and 24/7 craving guidance.
                </Text>
              </GlassCard>

              <GlassCard style={styles.featureCard}>
                <View style={[styles.iconWrapper, { backgroundColor: COLORS.secondaryGlow }]}>
                  <FontAwesome5 name="hiking" size={20} color={COLORS.secondary} />
                </View>
                <Text style={styles.featureTitle}>Padyatra & Swadeshi Rewards</Text>
                <Text style={styles.featureDesc}>
                  Walk historical Indian routes, earn XP, unlock achievements and brand discounts.
                </Text>
              </GlassCard>
            </View>
          </View>
        )}

        {/* STEP 2: PROFILE SELECTION */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Choose Your Path</Text>
            <Text style={styles.subtitle}>
              Select your primary goal so we can customize your entire dashboard, tools, and AI agents.
            </Text>

            {/* Smoker Option */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setSelectedType('smoker');
                try {
                  Haptics.selectionAsync();
                } catch (_e) {}
              }}
              style={[
                styles.profileSelectCard,
                selectedType === 'smoker' && styles.profileSelectCardActiveSmoker,
              ]}
            >
              <View style={styles.profileCardHeader}>
                <View
                  style={[
                    styles.profileIconBox,
                    { backgroundColor: 'rgba(0, 212, 170, 0.15)' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="smoking-off"
                    size={28}
                    color={COLORS.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileCardTitle}>Quit Smoking (LastPuff)</Text>
                  <Text style={styles.profileCardTag}>Detox • Recovery • SOS Tools</Text>
                </View>
                {selectedType === 'smoker' && (
                  <Ionicons name="checkmark-circle" size={26} color={COLORS.primary} />
                )}
              </View>
              <Text style={styles.profileCardDesc}>
                Personalized quit plans, real-time ₹ saved calculator, health recovery timeline, 4-7-8 breathing SOS, and craving danger zones.
              </Text>
            </TouchableOpacity>

            {/* Non-Smoker Option */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setSelectedType('non-smoker');
                try {
                  Haptics.selectionAsync();
                } catch (_e) {}
              }}
              style={[
                styles.profileSelectCard,
                selectedType === 'non-smoker' && styles.profileSelectCardActiveFitness,
              ]}
            >
              <View style={styles.profileCardHeader}>
                <View
                  style={[
                    styles.profileIconBox,
                    { backgroundColor: 'rgba(124, 58, 237, 0.15)' },
                  ]}
                >
                  <Ionicons name="fitness" size={28} color={COLORS.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileCardTitle}>Fitness & Wellness (Navjivan)</Text>
                  <Text style={styles.profileCardTag}>Athletic Training • Padyatra • Nutrition</Text>
                </View>
                {selectedType === 'non-smoker' && (
                  <Ionicons name="checkmark-circle" size={26} color={COLORS.secondary} />
                )}
              </View>
              <Text style={styles.profileCardDesc}>
                AI workout regimens, Padyatra heritage route step tracker, camera-based meal macro analyzer, and mental focus scripts.
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 3: PERMISSIONS */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Essential Permissions</Text>
            <Text style={styles.subtitle}>
              Granting permissions allows Navjivan to guard you in real time and track your daily wellness metrics automatically.
            </Text>

            {/* Notifications */}
            <GlassCard style={styles.permissionCard}>
              <View style={styles.permissionRow}>
                <View style={[styles.iconWrapper, { backgroundColor: COLORS.primaryGlow }]}>
                  <Ionicons name="notifications" size={22} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.permissionTitle}>Push Notifications</Text>
                  <Text style={styles.permissionDesc}>
                    Critical for daily check-ins, craving emergency alerts, and workout reminders.
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.grantBtn,
                    notificationsGranted === true && styles.grantedBtn,
                  ]}
                  onPress={requestNotificationPermission}
                >
                  <Text
                    style={[
                      styles.grantBtnText,
                      notificationsGranted === true && styles.grantedBtnText,
                    ]}
                  >
                    {notificationsGranted === true ? 'Enabled ✓' : 'Enable'}
                  </Text>
                </TouchableOpacity>
              </View>
            </GlassCard>

            {/* Location */}
            <GlassCard style={styles.permissionCard}>
              <View style={styles.permissionRow}>
                <View style={[styles.iconWrapper, { backgroundColor: COLORS.secondaryGlow }]}>
                  <Ionicons name="location" size={22} color={COLORS.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.permissionTitle}>Location & Geofencing</Text>
                  <Text style={styles.permissionDesc}>
                    Warns you near smoking hotspots and tracks accurate Padyatra pilgrimage progress.
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.grantBtn,
                    locationGranted === true && styles.grantedBtn,
                  ]}
                  onPress={requestLocationPermission}
                >
                  <Text
                    style={[
                      styles.grantBtnText,
                      locationGranted === true && styles.grantedBtnText,
                    ]}
                  >
                    {locationGranted === true ? 'Enabled ✓' : 'Enable'}
                  </Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </View>
        )}

        {/* STEP 4: READY TO PERSONALIZE */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <View style={styles.heroBadge}>
              <Ionicons name="checkmark-done-circle" size={16} color={COLORS.primary} />
              <Text style={styles.heroBadgeText}>Ready to Customize</Text>
            </View>

            <Text style={styles.title}>Let's Build Your Plan</Text>
            <Text style={styles.subtitle}>
              We'll now ask a few quick questions to calibrate your AI models, baseline stats, and milestones.
            </Text>

            <GlassCard
              gradientBorder
              borderColors={
                selectedType === 'non-smoker'
                  ? COLORS.gradientSecondary
                  : COLORS.gradientPrimary
              }
              style={{ marginTop: SPACING.md }}
            >
              <View style={{ alignItems: 'center', paddingVertical: SPACING.md }}>
                <View
                  style={[
                    styles.readyIconBox,
                    {
                      backgroundColor:
                        selectedType === 'non-smoker'
                          ? COLORS.secondaryGlow
                          : COLORS.primaryGlow,
                    },
                  ]}
                >
                  <Ionicons
                    name={selectedType === 'non-smoker' ? 'barbell' : 'flame'}
                    size={36}
                    color={selectedType === 'non-smoker' ? COLORS.secondary : COLORS.primary}
                  />
                </View>
                <Text style={styles.readyTitle}>
                  {selectedType === 'non-smoker'
                    ? 'Fitness & Nutrition Profile'
                    : 'Smoker Detox Calibration'}
                </Text>
                <Text style={styles.readySubtitle}>
                  Takes ~60 seconds to configure your personalized dashboard.
                </Text>
              </View>
            </GlassCard>
          </View>
        )}
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        {step > 1 ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={20} color={COLORS.textSecondary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}

        <View style={{ flex: 1, maxWidth: 200 }}>
          <GradientButton
            title={step === 4 ? 'Personalize →' : 'Continue'}
            colors={
              selectedType === 'non-smoker'
                ? COLORS.gradientSecondary
                : COLORS.gradientPrimary
            }
            onPress={handleNext}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  progressBarContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceBorder,
  },
  stepIndicator: {
    ...TYPOGRAPHY.label,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 40,
  },
  stepContainer: {
    flex: 1,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
  },
  heroBadgeText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    ...TYPOGRAPHY.heading1,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  featureGrid: {
    gap: SPACING.md,
  },
  featureCard: {
    padding: SPACING.md,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  featureTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  featureDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  profileSelectCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  profileSelectCardActiveSmoker: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 212, 170, 0.05)',
  },
  profileSelectCardActiveFitness: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
  },
  profileCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  profileIconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCardTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.textPrimary,
  },
  profileCardTag: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  profileCardDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    lineHeight: 18,
  },
  permissionCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  permissionTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  permissionDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  grantBtn: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
  },
  grantedBtn: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: COLORS.success,
  },
  grantBtnText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  grantedBtnText: {
    color: COLORS.success,
  },
  readyIconBox: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  readyTitle: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  readySubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  backButtonText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
});
