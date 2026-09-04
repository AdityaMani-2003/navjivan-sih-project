import React, { useEffect, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const { token, loading } = useContext(AuthContext);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    // Fade in
    opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    scale.value = withSequence(
      withTiming(1.05, { duration: 700 }),
      withTiming(1.0, { duration: 500 })
    );

    const timer = setTimeout(async () => {
      if (loading) return;

      const onboardingComplete = await AsyncStorage.getItem('onboarding_complete');

      if (!token) {
        router.replace('/auth/login');
      } else if (!onboardingComplete) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    }, 1600);

    return () => clearTimeout(timer);
  }, [loading, token]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.brandContainer, animatedStyle]}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>LP</Text>
        </View>
        <Text style={styles.appName}>LastPuff</Text>
        <Text style={styles.tagline}>Break Free. Live Better.</Text>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.sihBadge}>Smart India Hackathon 2025 Winner</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
  },
  logoBadge: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: '#121212',
    borderWidth: 2.5,
    borderColor: '#39FF14',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    color: '#39FF14',
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tagline: {
    color: '#888888',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  sihBadge: {
    color: '#39FF14',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    opacity: 0.8,
  },
});
