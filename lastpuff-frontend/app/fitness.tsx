import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import dayjs from 'dayjs';
import { AuthContext } from '../context/AuthContext';
import { awardCoins } from '../services/api';

interface Plan {
  id: string;
  title: string;
  level: string;
  duration: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  tagline: string;
  steps: { title: string; duration: string; description: string }[];
  targetStage: string;
}

const FITNESS_PLANS: Plan[] = [
  {
    id: 'beginner',
    title: 'Beginner Lung Restoration',
    level: 'Week 1–2',
    duration: '10 mins',
    icon: 'walk-outline',
    color: '#39FF14',
    tagline: 'Light exercise reduces immediate nicotine cravings by 30%.',
    targetStage: 'Week 1',
    steps: [
      {
        title: '5-Minute Gentle Walk',
        duration: '5 min',
        description: 'Brisk natural cadence to stimulate oxygen exchange and reduce restlessness.',
      },
      {
        title: '10 Deep Diaphragmatic Breaths',
        duration: '3 min',
        description: 'Expand lower ribs fully to re-open collapsed bronchial pathways.',
      },
      {
        title: 'Light Upper Body Stretching',
        duration: '2 min',
        description: 'Shoulder rolls and chest openers to alleviate posture tension from withdrawal.',
      },
    ],
  },
  {
    id: 'intermediate',
    title: 'Circulation & Stamina Boost',
    level: 'Week 2–4',
    duration: '25 mins',
    icon: 'fitness-outline',
    color: '#00F0FF',
    tagline: 'Cardiovascular rehabilitation increases dopamine and speeds detox.',
    targetStage: 'Week 2',
    steps: [
      {
        title: '15-Minute Brisk Walk / Jog',
        duration: '15 min',
        description: 'Elevate your heart rate into Zone 2 to burn off stress hormones.',
      },
      {
        title: '5-Minute Core & Yoga Flow',
        duration: '5 min',
        description: 'Sun salutations and downward dog to stabilize your core and spine.',
      },
      {
        title: 'Hydration Recovery & Reset',
        duration: '5 min',
        description: 'Drink 2 full glasses of cold water with lemon to flush cellular waste.',
      },
    ],
  },
  {
    id: 'advanced',
    title: 'Peak Lung & Strength Power',
    level: 'Month 1+',
    duration: '35 mins',
    icon: 'barbell-outline',
    color: '#FF9500',
    tagline: 'Rebuild athletic capacity and permanent metabolic independence.',
    targetStage: 'Month 1+',
    steps: [
      {
        title: '20-Minute High Intensity Cardio',
        duration: '20 min',
        description: 'Outdoor cycling or interval running to maximize VO2 max lung volume.',
      },
      {
        title: '10-Minute Bodyweight Strength Circuit',
        duration: '10 min',
        description: 'Pushups, bodyweight squats, lunges, and forearm planks.',
      },
      {
        title: '5-Minute Mindful Meditation',
        duration: '5 min',
        description: 'Grounding breath cycle to transition your nervous system into total calm.',
      },
    ],
  },
];

export default function FitnessScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [workoutActive, setWorkoutActive] = useState(false);
  const [workoutSeconds, setWorkoutSeconds] = useState(60);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [completedPlans, setCompletedPlans] = useState<string[]>([]);

  // Calculate user's recovery stage from createdAt
  const calculateStage = () => {
    if (!user?.createdAt) return 'Week 1';
    const created = dayjs(user.createdAt);
    const daysSince = Math.max(0, dayjs().diff(created, 'day'));
    if (daysSince < 7) return 'Week 1';
    if (daysSince < 14) return 'Week 2';
    if (daysSince < 30) return 'Week 3–4';
    if (daysSince < 60) return 'Month 1';
    return 'Month 2+';
  };

  const currentStage = calculateStage();

  const handleOpenPlan = (plan: Plan) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    setSelectedPlan(plan);
    setWorkoutActive(false);
    setWorkoutComplete(false);
    setWorkoutSeconds(60); // 60s demo timer for workout completion
    setModalVisible(true);
  };

  // Workout countdown timer
  useEffect(() => {
    let timer: any = null;
    if (workoutActive && workoutSeconds > 0) {
      timer = setInterval(() => {
        setWorkoutSeconds((prev) => {
          if (prev <= 1) {
            handleCompleteWorkout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [workoutActive, workoutSeconds]);

  const handleCompleteWorkout = async () => {
    setWorkoutActive(false);
    setWorkoutComplete(true);

    if (selectedPlan && !completedPlans.includes(selectedPlan.id)) {
      setCompletedPlans((prev) => [...prev, selectedPlan.id]);
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}

    try {
      await awardCoins(5, `Completed ${selectedPlan?.title || 'Fitness Plan'}`);
      Toast.show({
        type: 'success',
        text1: 'Workout Complete! 🏅',
        text2: '+5 PuffCoins added to your vault',
      });
    } catch (err) {
      console.error('Award coins error:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#39FF14" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fitness & Recovery</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Recovery Stage Badge */}
        <View style={styles.stageCard}>
          <View style={styles.stageBadgeRow}>
            <View style={styles.pulseDot} />
            <Text style={styles.stageLabel}>CURRENT DETOX STAGE</Text>
          </View>
          <Text style={styles.stageTitle}>{currentStage} Recovery</Text>
          <Text style={styles.stageSubtitle}>
            Your cilia are regrowing and lung airways are dilating. Physical movement accelerates carbon monoxide expulsion.
          </Text>
        </View>

        {/* Plan Cards */}
        <Text style={styles.sectionHeading}>Recovery Exercise Plans</Text>

        {FITNESS_PLANS.map((plan) => {
          const isDone = completedPlans.includes(plan.id);
          return (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                { borderLeftColor: plan.color, borderLeftWidth: 4 },
              ]}
              onPress={() => handleOpenPlan(plan)}
              activeOpacity={0.8}
            >
              <View style={styles.planHeader}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: `${plan.color}22` },
                  ]}
                >
                  <Ionicons name={plan.icon} size={26} color={plan.color} />
                </View>
                <View style={styles.planHeaderText}>
                  <View style={styles.levelRow}>
                    <Text style={[styles.planLevel, { color: plan.color }]}>
                      {plan.level}
                    </Text>
                    <Text style={styles.planDuration}>⏱ {plan.duration}</Text>
                  </View>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                </View>
                {isDone ? (
                  <Ionicons name="checkmark-circle" size={26} color="#39FF14" />
                ) : (
                  <Ionicons name="chevron-forward" size={22} color="#666" />
                )}
              </View>

              <Text style={styles.planTagline}>{plan.tagline}</Text>

              <View style={styles.rewardRow}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#39FF14" />
                <Text style={styles.rewardText}>Awards +5 PuffCoins on completion</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Workout Detail Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {selectedPlan && (
              <>
                <View style={styles.modalTopBar}>
                  <Text style={[styles.modalLevel, { color: selectedPlan.color }]}>
                    {selectedPlan.level}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeBtn}
                  >
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalTitle}>{selectedPlan.title}</Text>
                <Text style={styles.modalTagline}>{selectedPlan.tagline}</Text>

                {workoutActive ? (
                  <View style={styles.activeWorkoutBox}>
                    <Text style={styles.timerLabel}>WORKOUT IN PROGRESS</Text>
                    <Text style={styles.timerCount}>{workoutSeconds}s</Text>
                    <Text style={styles.timerHint}>
                      Focus on slow nasal breathing and posture alignment.
                    </Text>
                    <TouchableOpacity
                      style={styles.completeEarlyBtn}
                      onPress={handleCompleteWorkout}
                    >
                      <Text style={styles.completeEarlyText}>Mark as Done Early</Text>
                    </TouchableOpacity>
                  </View>
                ) : workoutComplete ? (
                  <View style={styles.completeBox}>
                    <Ionicons name="checkmark-circle" size={60} color="#39FF14" />
                    <Text style={styles.completeTitle}>Workout Finished!</Text>
                    <Text style={styles.completeSubtitle}>
                      +5 PuffCoins earned! Your cardiovascular resilience is climbing.
                    </Text>
                    <TouchableOpacity
                      style={styles.startBtn}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.startBtnText}>Awesome</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <ScrollView style={styles.stepsList} showsVerticalScrollIndicator={false}>
                      {selectedPlan.steps.map((step, idx) => (
                        <View key={idx} style={styles.stepItem}>
                          <View style={styles.stepNumberBadge}>
                            <Text style={styles.stepNumberText}>{idx + 1}</Text>
                          </View>
                          <View style={styles.stepDetails}>
                            <View style={styles.stepHeader}>
                              <Text style={styles.stepTitle}>{step.title}</Text>
                              <Text style={styles.stepTime}>{step.duration}</Text>
                            </View>
                            <Text style={styles.stepDesc}>{step.description}</Text>
                          </View>
                        </View>
                      ))}
                    </ScrollView>

                    <TouchableOpacity
                      style={styles.startBtn}
                      onPress={() => {
                        try {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        } catch (e) {}
                        setWorkoutActive(true);
                      }}
                    >
                      <Ionicons name="play" size={20} color="#000000" />
                      <Text style={styles.startBtnText}>Start Workout (60s Timer)</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  stageCard: {
    backgroundColor: '#121212',
    borderColor: '#1E1E1E',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  stageBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#39FF14',
  },
  stageLabel: {
    color: '#39FF14',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  stageTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  stageSubtitle: {
    color: '#888888',
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeading: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  planCard: {
    backgroundColor: '#121212',
    borderColor: '#1E1E1E',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planHeaderText: {
    flex: 1,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  planLevel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  planDuration: {
    color: '#888888',
    fontSize: 12,
  },
  planTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  planTagline: {
    color: '#AAAAAA',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(57, 255, 20, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  rewardText: {
    color: '#39FF14',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  modalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalLevel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  closeBtn: {
    padding: 4,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  modalTagline: {
    color: '#888888',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  stepsList: {
    maxHeight: 280,
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    backgroundColor: '#181818',
    padding: 12,
    borderRadius: 12,
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#39FF14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 13,
  },
  stepDetails: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stepTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  stepTime: {
    color: '#39FF14',
    fontSize: 12,
    fontWeight: '600',
  },
  stepDesc: {
    color: '#888888',
    fontSize: 12,
    lineHeight: 16,
  },
  startBtn: {
    backgroundColor: '#39FF14',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  startBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  activeWorkoutBox: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  timerLabel: {
    color: '#39FF14',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  timerCount: {
    color: '#FFFFFF',
    fontSize: 54,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginBottom: 12,
  },
  timerHint: {
    color: '#888888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 28,
  },
  completeEarlyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#39FF14',
  },
  completeEarlyText: {
    color: '#39FF14',
    fontWeight: '600',
    fontSize: 14,
  },
  completeBox: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  completeTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 8,
  },
  completeSubtitle: {
    color: '#888888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
});
