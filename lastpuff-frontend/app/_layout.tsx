import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import 'react-native-reanimated';
import Toast, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext, AuthProvider } from '../context/AuthContext';
import '../tasks/geofencingTask';

// Custom dark theme for LastPuff
const LastPuffTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#39FF14',
    background: '#000000',
    card: '#121212',
    text: '#ffffff',
    border: '#1E1E1E',
    notification: '#39FF14',
  },
};

// Premium dark SaaS toast configuration
const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#39FF14',
        backgroundColor: '#141414',
        borderWidth: 1,
        borderColor: '#262626',
        borderRadius: 12,
        height: 64,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
        color: '#39FF14',
      }}
      text2Style={{
        fontSize: 13,
        color: '#CCCCCC',
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#FF3B30',
        backgroundColor: '#141414',
        borderWidth: 1,
        borderColor: '#262626',
        borderRadius: 12,
        height: 64,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
        color: '#FF3B30',
      }}
      text2Style={{
        fontSize: 13,
        color: '#CCCCCC',
      }}
    />
  ),
};

function ProtectedNavigation() {
  const { token, loading } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();
  const [checkedOnboarding, setCheckedOnboarding] = useState(false);

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
          router.replace('/onboarding');
        } else {
          router.replace('/(tabs)');
        }
      }
      setCheckedOnboarding(true);
    };

    checkRoute();
  }, [loading, token, segments]);

  // 🌓 While loading from storage, don't show tabs or login yet
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#000',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#39FF14" />
        <Text style={{ color: '#fff', marginTop: 12 }}>Loading LastPuff...</Text>
      </View>
    );
  }

  // Normal navigation stack
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Splash */}
      <Stack.Screen name="splash" />

      {/* Onboarding */}
      <Stack.Screen name="onboarding" />

      {/* Auth screens */}
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/signup" />

      {/* Main app tabs */}
      <Stack.Screen name="(tabs)" />

      {/* Dedicated feature screens */}
      <Stack.Screen name="fitness" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="sos" />
      <Stack.Screen name="edit-profile" />

      {/* Optional modal */}
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={LastPuffTheme}>
        <ProtectedNavigation />
        <StatusBar style="light" />
        <Toast config={toastConfig} />
      </ThemeProvider>
    </AuthProvider>
  );
}
