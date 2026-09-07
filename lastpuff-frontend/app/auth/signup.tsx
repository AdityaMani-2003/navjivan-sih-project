import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';

import { useAuth } from '../../context/AuthContext';
import { signup as apiSignup } from '../../services/api';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';

export default function SignupScreen() {
  const router = useRouter();
  const auth = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'smoker' | 'non-smoker'>('smoker');
  const [age, setAge] = useState('24');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in your name, email, and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const res = await apiSignup(
        name.trim(),
        email.trim().toLowerCase(),
        password,
        userType,
        parseInt(age, 10) || 24
      );

      if (res?.data?.token && res?.data?.user) {
        await auth.loginUser(res.data.user, res.data.token);
        Toast.show({
          type: 'success',
          text1: 'Welcome to Navjivan! 🎉',
          text2: 'Your personalized health protocol has begun.',
        });
        router.replace('/(tabs)');
      } else {
        setError('Unexpected server response. Try Quick Demo Mode below.');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Server unreachable. You can still test all features using Quick Demo Mode below!'
      );
    } finally {
      setLoading(false);
    }
  };

  const onDemoLaunch = async (type: 'smoker' | 'non-smoker') => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const demoUser = {
        _id: 'demo_user_123',
        name: type === 'smoker' ? 'Aditya (Smoke-Free)' : 'Aditya (Athlete)',
        email: 'demo@navjivan.app',
        userType: type,
        streak: 4,
        xp: 520,
        smokerProfile: {
          cigarettesPerDay: 12,
          yearsSmoking: 4,
          triggers: ['Morning Chai ☕', 'Work Stress 💻', 'After Meals 🍽️'],
          quitStrategy: 'gradual',
          costPerPack: 360,
          quitDate: new Date(Date.now() - 4 * 86400000).toISOString(),
        },
        fitnessProfile: {
          goal: 'Endurance & Vitality',
          level: 'intermediate',
          sport: 'Cricket',
          workoutDays: ['Mon', 'Wed', 'Fri', 'Sat'],
        },
      };

      await auth.loginUser(demoUser, 'demo_jwt_token_sample');
      router.replace('/(tabs)');
    } catch (_e) {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <Ionicons name="sparkles" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>
              Navjivan <Text style={{ color: COLORS.primary }}>×</Text> LastPuff
            </Text>
            <Text style={styles.subtitle}>
              Create your account to unlock AI cessation & athletic telemetry
            </Text>
          </View>

          {/* Profile Switcher Tabs */}
          <View style={styles.profileToggleRow}>
            <TouchableOpacity
              style={[
                styles.profileToggleBtn,
                userType === 'smoker' && styles.profileToggleBtnActive,
              ]}
              onPress={() => {
                setUserType('smoker');
                Haptics.selectionAsync();
              }}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="smoke-detector"
                size={18}
                color={userType === 'smoker' ? COLORS.primary : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.profileToggleText,
                  userType === 'smoker' && styles.profileToggleTextActive,
                ]}
              >
                Quit Smoking
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.profileToggleBtn,
                userType === 'non-smoker' && styles.profileToggleBtnActiveSecondary,
              ]}
              onPress={() => {
                setUserType('non-smoker');
                Haptics.selectionAsync();
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="fitness"
                size={18}
                color={userType === 'non-smoker' ? COLORS.secondary : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.profileToggleText,
                  userType === 'non-smoker' && { color: COLORS.secondary, fontWeight: '700' },
                ]}
              >
                Fitness & Athlete
              </Text>
            </TouchableOpacity>
          </View>

          {/* Signup Form Card */}
          <GlassCard style={styles.card} gradientBorder>
            <Text style={styles.cardTitle}>Create Your Account</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Aditya Sharma"
                  placeholderTextColor={COLORS.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Age Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>AGE</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="24"
                  placeholderTextColor={COLORS.textMuted}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Submit Button */}
            <View style={{ marginTop: SPACING.md }}>
              <GradientButton
                title={loading ? 'Creating Account...' : 'Get Started Free →'}
                colors={COLORS.gradientPrimary}
                onPress={onSignup}
                disabled={loading}
              />
            </View>

            {/* Switch to Login */}
            <TouchableOpacity
              style={styles.switchRow}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.switchText}>
                Already have an account?{' '}
                <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </GlassCard>

          {/* Quick Demo Mode Card */}
          <View style={styles.demoSection}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR EXPLORE IMMEDIATELY</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.demoGrid}>
              <TouchableOpacity
                style={[styles.demoCard, { borderColor: 'rgba(0, 245, 160, 0.4)' }]}
                onPress={() => onDemoLaunch('smoker')}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="smoke-detector" size={24} color={COLORS.primary} />
                <Text style={styles.demoTitle}>Launch Smoker Demo</Text>
                <Text style={styles.demoSub}>Live ticker, 4-7-8 SOS & quit plan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoCard, { borderColor: 'rgba(139, 92, 246, 0.4)' }]}
                onPress={() => onDemoLaunch('non-smoker')}
                activeOpacity={0.8}
              >
                <Ionicons name="barbell" size={24} color={COLORS.secondary} />
                <Text style={styles.demoTitle}>Launch Athlete Demo</Text>
                <Text style={styles.demoSub}>Concentric rings, Padyatra & macros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingBottom: 40,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.heading1,
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  profileToggleRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.md,
    gap: 6,
  },
  profileToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  profileToggleBtnActive: {
    backgroundColor: 'rgba(0, 245, 160, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  profileToggleBtnActiveSecondary: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  profileToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  profileToggleTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  card: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    flex: 1,
  },
  inputGroup: {
    marginBottom: SPACING.sm + 2,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm + 2,
    height: 48,
  },
  inputIcon: {
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    height: '100%',
  },
  eyeBtn: {
    padding: SPACING.xs,
  },
  switchRow: {
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  switchText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  demoSection: {
    marginTop: SPACING.xs,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginVertical: SPACING.sm + 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.surfaceBorder,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  demoGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  demoCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 4,
    textAlign: 'center',
  },
  demoSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 14,
  },
});
