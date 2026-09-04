import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../context/AuthContext';
import { updateProfile } from '../services/api';

export default function OnboardingScreen() {
  const router = useRouter();
  const { updateUser } = useContext(AuthContext);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Habits
  const [cigarettesPerDay, setCigarettesPerDay] = useState('10');
  const [pricePerPack, setPricePerPack] = useState('200');
  const [smokingYears, setSmokingYears] = useState(3);

  // Step 2: Quit Date
  const [quitChoice, setQuitChoice] = useState<'today' | 'already' | 'custom'>('today');
  const [quitDateStr, setQuitDateStr] = useState(new Date().toISOString().split('T')[0]);

  // Step 3: Plan
  const [plan, setPlan] = useState<'gradual' | 'aggressive'>('gradual');

  const handleNext = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    if (step < 3) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const finishOnboarding = async () => {
    try {
      setSubmitting(true);
      const cigPerDayNum = parseInt(cigarettesPerDay, 10) || 10;
      const packPriceNum = parseInt(pricePerPack, 10) || 200;
      const pricePerCig = Math.round(packPriceNum / 20) || 10;

      const profilePayload = {
        cigarettesPerDay: cigPerDayNum,
        pricePerPack: packPriceNum,
        pricePerCigarette: pricePerCig,
        smokingYears: smokingYears,
        quitDate: quitDateStr,
        plan: plan,
      };

      const res = await updateProfile(profilePayload);
      if (res?.data?.user) {
        await updateUser(res.data.user);
      }

      await AsyncStorage.setItem('onboarding_complete', 'true');

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}

      Toast.show({
        type: 'success',
        text1: 'Welcome to LastPuff! 🎉',
        text2: 'Your personalized recovery journey has begun.',
      });

      router.replace('/(tabs)');
    } catch (err) {
      console.error('Onboarding update error:', err);
      // Fallback: still mark onboarding as complete so user is not stuck
      await AsyncStorage.setItem('onboarding_complete', 'true');
      router.replace('/(tabs)');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Progress Bar */}
      <View style={styles.progressBarContainer}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.progressSegment,
              i <= step ? styles.progressActive : styles.progressInactive,
            ]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && (
          <View>
            <Text style={styles.stepBadge}>STEP 1 OF 3</Text>
            <Text style={styles.title}>Tell us about your habits</Text>
            <Text style={styles.subtitle}>
              This calculates your real money saved, health milestones, and daily smoke-free targets.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cigarettes smoked per day</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={cigarettesPerDay}
                onChangeText={setCigarettesPerDay}
                placeholder="e.g. 10"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Average pack price (₹)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={pricePerPack}
                onChangeText={setPricePerPack}
                placeholder="e.g. 200"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                How long have you smoked? ({smokingYears} {smokingYears === 1 ? 'year' : 'years'})
              </Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setSmokingYears(Math.max(1, smokingYears - 1))}
                >
                  <Ionicons name="remove" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{smokingYears} yrs</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setSmokingYears(Math.min(30, smokingYears + 1))}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.stepBadge}>STEP 2 OF 3</Text>
            <Text style={styles.title}>When is your Quit Date?</Text>
            <Text style={styles.subtitle}>
              We track your streak and lung recovery timeline from this moment forward.
            </Text>

            <TouchableOpacity
              style={[
                styles.optionCard,
                quitChoice === 'today' && styles.optionCardActive,
              ]}
              onPress={() => {
                setQuitChoice('today');
                setQuitDateStr(new Date().toISOString().split('T')[0]);
              }}
            >
              <Ionicons
                name="rocket-outline"
                size={28}
                color={quitChoice === 'today' ? '#39FF14' : '#888'}
              />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>I'm Quitting Today</Text>
                <Text style={styles.optionDesc}>
                  Start clean right now. Today will be Day 1 of your new life!
                </Text>
              </View>
              {quitChoice === 'today' && (
                <Ionicons name="checkmark-circle" size={24} color="#39FF14" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                quitChoice === 'already' && styles.optionCardActive,
              ]}
              onPress={() => {
                setQuitChoice('already');
                // Default to 3 days ago for demo
                const past = new Date();
                past.setDate(past.getDate() - 3);
                setQuitDateStr(past.toISOString().split('T')[0]);
              }}
            >
              <Ionicons
                name="medal-outline"
                size={28}
                color={quitChoice === 'already' ? '#39FF14' : '#888'}
              />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>I Already Started</Text>
                <Text style={styles.optionDesc}>
                  I already quit a few days ago and want to log my existing streak.
                </Text>
              </View>
              {quitChoice === 'already' && (
                <Ionicons name="checkmark-circle" size={24} color="#39FF14" />
              )}
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quit Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={quitDateStr}
                onChangeText={setQuitDateStr}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#666"
              />
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.stepBadge}>STEP 3 OF 3</Text>
            <Text style={styles.title}>Choose your recovery plan</Text>
            <Text style={styles.subtitle}>
              Pick the pacing that matches your psychological readiness.
            </Text>

            <TouchableOpacity
              style={[
                styles.optionCard,
                plan === 'gradual' && styles.optionCardActive,
              ]}
              onPress={() => setPlan('gradual')}
            >
              <Ionicons
                name="trending-down-outline"
                size={28}
                color={plan === 'gradual' ? '#39FF14' : '#888'}
              />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Gradual Reduction</Text>
                <Text style={styles.optionDesc}>
                  Cut down slowly over 30 days. Smooth habit replacement with lower withdrawal shock.
                </Text>
              </View>
              {plan === 'gradual' && (
                <Ionicons name="checkmark-circle" size={24} color="#39FF14" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                plan === 'aggressive' && styles.optionCardActive,
              ]}
              onPress={() => setPlan('aggressive')}
            >
              <Ionicons
                name="flame"
                size={28}
                color={plan === 'aggressive' ? '#39FF14' : '#888'}
              />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Cold Turkey (Aggressive)</Text>
                <Text style={styles.optionDesc}>
                  Zero puffs starting now. Maximum speed detox backed by 24/7 SOS craving survival tools.
                </Text>
              </View>
              {plan === 'aggressive' && (
                <Ionicons name="checkmark-circle" size={24} color="#39FF14" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.footer}>
        {step > 1 ? (
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleNext}
          disabled={submitting}
        >
          <Text style={styles.primaryBtnText}>
            {step === 3 ? (submitting ? 'Saving...' : 'Enter App 🚀') : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  progressBarContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressActive: {
    backgroundColor: '#39FF14',
  },
  progressInactive: {
    backgroundColor: '#222222',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  stepBadge: {
    color: '#39FF14',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#888888',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#141414',
    borderColor: '#262626',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 16,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderColor: '#262626',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 8,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    flex: 1,
    textAlign: 'center',
    color: '#39FF14',
    fontSize: 18,
    fontWeight: '700',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderColor: '#222222',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    gap: 14,
  },
  optionCardActive: {
    borderColor: '#39FF14',
    backgroundColor: '#161E15',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  optionDesc: {
    color: '#888888',
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
    backgroundColor: '#0A0A0A',
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backBtnText: {
    color: '#888888',
    fontSize: 15,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: '#39FF14',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    shadowColor: '#39FF14',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
});
