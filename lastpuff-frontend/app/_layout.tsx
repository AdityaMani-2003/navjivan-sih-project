import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import 'react-native-reanimated';
import Toast, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { UserProvider, useUser } from '../context/UserContext';
import { COLORS, RADIUS } from '../constants/theme';
import '../tasks/geofencingTask';

// Custom dark theme for LastPuff × Navjivan
const NavjivanTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.primary,
    background: COLORS.bg,
    card: COLORS.surface,
    text: COLORS.textPrimary,
    border: COLORS.surfaceBorder,
    notification: COLORS.primary,
  },
};

// Premium dark SaaS toast configuration
const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: COLORS.primary,
        backgroundColor: COLORS.surfaceElevated,
        borderWidth: 1,
        borderColor: COLORS.surfaceBorder,
        borderRadius: RADIUS.md,
        height: 64,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.primary,
      }}
      text2Style={{
        fontSize: 13,
        color: COLORS.textSecondary,
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: COLORS.danger,
        backgroundColor: COLORS.surfaceElevated,
        borderWidth: 1,
        borderColor: COLORS.surfaceBorder,
        borderRadius: RADIUS.md,
        height: 64,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.danger,
      }}
      text2Style={{
        fontSize: 13,
        color: COLORS.textSecondary,
      }}
    />
  ),
};

function ProtectedNavigation() {
  const { token, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [_checkedOnboarding, setCheckedOnboarding] = useState(false);

  // 🔐 Redirect logic based on auth and onboarding state
  useEffect(() => {
    if (loading) return;

    const checkRoute = async () => {
      const segList = (segments || []) as string[];
      const inAuthGroup = segList[0] === 'auth';
      const onSplash = segList[0] === 'splash';
      const onOnboarding = segList[0] === 'onboarding';

      if (!token && !inAuthGroup && !onSplash) {
        // Not logged in → force to login
        router.replace('/auth/login');
      } else if (token && (inAuthGroup || segList.length === 0)) {
        // Logged in: check if user finished onboarding
        const onboardingDone = await AsyncStorage.getItem('onboarding_complete');
        if (!onboardingDone) {
          router.replace('/onboarding' as any);
        } else {
          router.replace('/(tabs)');
        }
      }
      setCheckedOnboarding(true);
    };

    checkRoute();
  }, [loading, token, segments]);

  // 🌓 While loading from storage, show clean dark loader
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.bg,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.textSecondary, marginTop: 12, fontSize: 14 }}>
          Loading Navjivan...
        </Text>
      </View>
    );
  }

  // Normal navigation stack
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bg },
        animation: 'slide_from_right',
      }}
    >
      {/* Splash & Onboarding */}
      <Stack.Screen name="splash" />
      <Stack.Screen name="onboarding/index" />
      <Stack.Screen name="onboarding/smoker-setup" />
      <Stack.Screen name="onboarding/fitness-setup" />

      {/* Auth screens */}
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/signup" />

      {/* Main app tabs */}
      <Stack.Screen name="(tabs)" />

      {/* Smoker Feature Screens */}
      <Stack.Screen name="quit-plan" />
      <Stack.Screen name="disease-risk" />
      <Stack.Screen name="sos" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
      <Stack.Screen name="games/bubble-burst" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="games/focus-flow" options={{ presentation: 'fullScreenModal' }} />

      {/* Fitness & Wellness Feature Screens */}
      <Stack.Screen name="fitness-plans" />
      <Stack.Screen name="athlete-training" />
      <Stack.Screen name="padyatra" />
      <Stack.Screen name="nutrition" />
      <Stack.Screen name="mental-health" />
      <Stack.Screen name="goals" />

      {/* Shared SaaS Screens */}
      <Stack.Screen name="chatbot" />
      <Stack.Screen name="rewards/index" />
      <Stack.Screen name="rewards/partners" />
      <Stack.Screen name="subscription" options={{ presentation: 'modal' }} />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <ThemeProvider value={NavjivanTheme}>
          <ProtectedNavigation />
          <StatusBar style="light" />
          <Toast config={toastConfig} />
        </ThemeProvider>
      </UserProvider>
    </AuthProvider>
  );
}
