import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  const { token, loading } = useAuth();

  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const badgeOpacity = useSharedValue(0);

  useEffect(() => {
    // 1. Logo pop and pulse
    logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    logoScale.value = withSequence(
      withTiming(1.1, { duration: 500, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0, { duration: 400, easing: Easing.inOut(Easing.ease) })
    );

    // 2. Text slide in
    textOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    textTranslateY.value = withDelay(400, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));

    // 3. Footer badge fade in
    badgeOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));

    const timer = setTimeout(async () => {
      if (loading) return;

      const onboardingComplete = await AsyncStorage.getItem('onboarding_complete');

      if (!token) {
        router.replace('/auth/login');
      } else if (!onboardingComplete) {
        router.replace('/onboarding' as any);
      } else {
        router.replace('/(tabs)');
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [loading, token]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0F', '#12121A', '#0A0A0F']}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.brandContainer, logoAnimatedStyle]}>
        <LinearGradient
          colors={COLORS.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoBadge}
        >
          <Text style={styles.logoText}>NJ</Text>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <Text style={styles.appName}>
          Navjivan <Text style={styles.appSubName}>× LastPuff</Text>
        </Text>
        <Text style={styles.tagline}>Break Free • Reclaim Vitality • Live Empowered</Text>
      </Animated.View>

      <Animated.View style={[styles.footer, badgeAnimatedStyle]}>
        <View style={styles.badgeWrapper}>
          <Text style={styles.sihBadge}>SMART INDIA HACKATHON 2025</Text>
          <Text style={styles.versionText}>Production SaaS Edition</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.primary,
  },
  logoText: {
    color: COLORS.bg,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    color: COLORS.textPrimary,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: SPACING.xs,
  },
  appSubName: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 24,
  },
  tagline: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    alignItems: 'center',
  },
  badgeWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    alignItems: 'center',
  },
  sihBadge: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  versionText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
});
