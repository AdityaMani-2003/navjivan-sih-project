import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import BreathingExercise from '../components/BreathingExercise';
import DistractionGame from '../components/DistractionGame';
import { logCraving, fetchCravingsCount } from '../services/api';

const MOTIVATIONAL_QUOTES = [
  "The craving will pass whether you smoke or not. Choose freedom.",
  "Every craving peaks and fades in 3 to 5 minutes. You can easily outlast 5 minutes.",
  "You are not giving up something good; you are releasing yourself from something toxic.",
  "Your future self is already thanking you for choosing clean air right now.",
  "One puff is too many, and a thousand will never be enough. Protect your streak.",
  "You are stronger than a momentary chemical signal. Breathe through it.",
  "Discomfort is temporary, but the pride of surviving this craving is permanent.",
  "Look how far you have already come. Don't trade your healing lungs for an illusion.",
  "Your bronchial tubes are expanding and cilia are healing right now. Honor your body.",
  "Take a slow sip of ice-cold water, exhale deeply, and remember your deepest why.",
];

export default function SOSScreen() {
  const router = useRouter();

  // Mode: 'menu' | 'breathing' | 'game'
  const [activeMode, setActiveMode] = useState<'menu' | 'breathing' | 'game'>('menu');
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [cravingsSurvived, setCravingsSurvived] = useState<number>(0);

  // Fetch or log craving count
  useEffect(() => {
    const initCraving = async () => {
      try {
        const res = await logCraving();
        if (res?.data) {
          setCravingsSurvived(res.data.totalCravingsSurvived || res.data.cravingsHandledToday || 1);
        }
      } catch (err) {
        // Fallback: fetch count
        try {
          const countRes = await fetchCravingsCount();
          setCravingsSurvived(countRes?.data?.totalCravingsSurvived || 1);
        } catch (e) {
          setCravingsSurvived((prev) => prev + 1);
        }
      }
    };

    initCraving();
  }, []);

  const openEmergencyModal = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    // Pick random quote
    const rand = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    setCurrentQuoteIndex(rand);
    setEmergencyModalVisible(true);
  };

  const handleExerciseComplete = () => {
    setCravingsSurvived((prev) => prev + 1);
    Toast.show({
      type: 'success',
      text1: 'Craving conquered! 🎉',
      text2: 'You took control and won.',
    });
  };

  // Render sub-screens when active
  if (activeMode === 'breathing') {
    return (
      <SafeAreaView style={styles.container}>
        <BreathingExercise
          onComplete={handleExerciseComplete}
          onExit={() => setActiveMode('menu')}
        />
      </SafeAreaView>
    );
  }

  if (activeMode === 'game') {
    return (
      <SafeAreaView style={styles.container}>
        <DistractionGame
          onComplete={(score) => {
            handleExerciseComplete();
          }}
          onExit={() => setActiveMode('menu')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#39FF14" />
        </TouchableOpacity>
        <View style={styles.cravingBadge}>
          <Text style={styles.cravingBadgeText}>
            💪 Survived {cravingsSurvived} {cravingsSurvived === 1 ? 'craving' : 'cravings'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.emergencyTag}>EMERGENCY CRAVING RESCUE</Text>
        <Text style={styles.title}>Need Support Right Now?</Text>
        <Text style={styles.subtitle}>
          Urges peak like ocean waves. Pick a distraction tool below — in 60 seconds the intensity will drop by 80%.
        </Text>

        {/* Action Card 1: Breathing */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch (e) {}
            setActiveMode('breathing');
          }}
        >
          <View style={[styles.iconBox, { backgroundColor: 'rgba(57, 255, 20, 0.15)' }]}>
            <Ionicons name="leaf" size={28} color="#39FF14" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>1-Minute Guided Breathing</Text>
            <Text style={styles.cardSub}>
              Classic 4-4-4 box breathing to slow your heart rate and dissolve anxiety.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#666" />
        </TouchableOpacity>

        {/* Action Card 2: Focus Game */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch (e) {}
            setActiveMode('game');
          }}
        >
          <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 240, 255, 0.15)' }]}>
            <Ionicons name="game-controller" size={28} color="#00F0FF" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Play Tap-the-Dot Game</Text>
            <Text style={styles.cardSub}>
              Occupies visual attention and floods your dopamine centers with game rewards.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#666" />
        </TouchableOpacity>

        {/* Action Card 3: Emergency Support */}
        <TouchableOpacity
          style={[styles.card, { borderColor: '#FF9500' }]}
          activeOpacity={0.8}
          onPress={openEmergencyModal}
        >
          <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 149, 0, 0.15)' }]}>
            <Ionicons name="chatbubbles" size={28} color="#FF9500" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Motivational Coaching & Tribe</Text>
            <Text style={styles.cardSub}>
              Read an instant mindset shift or jump straight into the community feed.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#666" />
        </TouchableOpacity>

        {/* Quick Grounding Tip */}
        <View style={styles.groundingBox}>
          <Ionicons name="bulb-outline" size={20} color="#39FF14" />
          <Text style={styles.groundingText}>
            Tip: Drink a tall glass of ice water and splash cold water on your wrists. It stimulates the vagus nerve and shuts down craving panic.
          </Text>
        </View>
      </ScrollView>

      {/* Emergency Support Modal */}
      <Modal visible={emergencyModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.quoteIconBox}>
              <Ionicons name="heart-circle" size={48} color="#39FF14" />
            </View>

            <Text style={styles.modalHeader}>You Are Stronger Than This</Text>

            <View style={styles.quoteContainer}>
              <Text style={styles.quoteText}>
                "{MOTIVATIONAL_QUOTES[currentQuoteIndex]}"
              </Text>
            </View>

            {/* Actions */}
            <TouchableOpacity
              style={styles.communityBtn}
              onPress={() => {
                setEmergencyModalVisible(false);
                router.push('/(tabs)/explore');
              }}
            >
              <Ionicons name="people" size={20} color="#000000" />
              <Text style={styles.communityBtnText}>Talk to Community</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.anotherQuoteBtn}
              onPress={() => {
                const next = (currentQuoteIndex + 1) % MOTIVATIONAL_QUOTES.length;
                setCurrentQuoteIndex(next);
              }}
            >
              <Text style={styles.anotherQuoteText}>Give Me Another Quote 🔄</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dismissBtn}
              onPress={() => setEmergencyModalVisible(false)}
            >
              <Text style={styles.dismissBtnText}>I'm Okay Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
  },
  cravingBadge: {
    backgroundColor: 'rgba(57, 255, 20, 0.12)',
    borderColor: '#39FF14',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  cravingBadgeText: {
    color: '#39FF14',
    fontWeight: '700',
    fontSize: 12,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emergencyTag: {
    color: '#39FF14',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6,
    marginTop: 8,
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
  card: {
    backgroundColor: '#121212',
    borderColor: '#1E1E1E',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 14,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSub: {
    color: '#888888',
    fontSize: 12,
    lineHeight: 16,
  },
  groundingBox: {
    flexDirection: 'row',
    backgroundColor: '#111811',
    borderColor: 'rgba(57, 255, 20, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginTop: 12,
    alignItems: 'center',
  },
  groundingText: {
    color: '#CCCCCC',
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#141414',
    borderColor: '#262626',
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  quoteIconBox: {
    marginBottom: 12,
  },
  modalHeader: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
  quoteContainer: {
    backgroundColor: '#1B1B1B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    borderLeftWidth: 3,
    borderLeftColor: '#39FF14',
  },
  quoteText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  communityBtn: {
    backgroundColor: '#39FF14',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    gap: 8,
    marginBottom: 12,
  },
  communityBtnText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 15,
  },
  anotherQuoteBtn: {
    paddingVertical: 10,
    marginBottom: 8,
  },
  anotherQuoteText: {
    color: '#39FF14',
    fontSize: 14,
    fontWeight: '600',
  },
  dismissBtn: {
    paddingVertical: 10,
  },
  dismissBtnText: {
    color: '#888888',
    fontSize: 14,
  },
});
