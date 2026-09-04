import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.55;

interface BreathingExerciseProps {
  onComplete: () => void;
  onExit: () => void;
}

type Phase = 'Inhale...' | 'Hold...' | 'Exhale...';

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({
  onComplete,
  onExit,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [phase, setPhase] = useState<Phase>('Inhale...');
  const [isCompleted, setIsCompleted] = useState(false);

  const scale = useSharedValue(0.65);
  const opacity = useSharedValue(0.5);

  const phaseTimerRef = useRef<any>(null);
  const countdownTimerRef = useRef<any>(null);

  // Run box breathing cycle: 4s inhale, 4s hold, 4s exhale
  useEffect(() => {
    let currentPhaseIndex = 0;
    const phases: Phase[] = ['Inhale...', 'Hold...', 'Exhale...'];

    const runPhase = () => {
      const current = phases[currentPhaseIndex];
      setPhase(current);

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Safe on web
      }

      if (current === 'Inhale...') {
        // Expand circle
        scale.value = withTiming(1.2, {
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
        });
        opacity.value = withTiming(1.0, {
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
        });
      } else if (current === 'Hold...') {
        // Stay expanded with subtle pulse
        scale.value = withTiming(1.25, {
          duration: 4000,
          easing: Easing.linear,
        });
      } else if (current === 'Exhale...') {
        // Shrink circle
        scale.value = withTiming(0.65, {
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
        });
        opacity.value = withTiming(0.45, {
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
        });
      }

      currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
    };

    runPhase();
    phaseTimerRef.current = setInterval(runPhase, 4000);

    // 60-second countdown
    countdownTimerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          setIsCompleted(true);
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (e) {}
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  const animatedCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  if (isCompleted) {
    return (
      <View style={styles.completedContainer}>
        <View style={styles.celebrationBadge}>
          <Text style={{ fontSize: 50 }}>🎉</Text>
        </View>
        <Text style={styles.completedTitle}>Great job!</Text>
        <Text style={styles.completedSubtitle}>
          Craving survived. Your lungs and mind are thanking you right now.
        </Text>
        <TouchableOpacity style={styles.doneBtn} onPress={onExit}>
          <Text style={styles.doneBtnText}>I'm Ready to Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.timerText}>{secondsRemaining}s left</Text>
        <TouchableOpacity onPress={onExit} style={styles.stopButton}>
          <Ionicons name="close" size={20} color="#FFFFFF" />
          <Text style={styles.stopButtonText}>Stop</Text>
        </TouchableOpacity>
      </View>

      {/* Center Breathing Visual */}
      <View style={styles.circleContainer}>
        <Animated.View style={[styles.outerGlowCircle, animatedCircleStyle]} />
        <Animated.View style={[styles.breathingCircle, animatedCircleStyle]}>
          <Text style={styles.phaseText}>{phase}</Text>
        </Animated.View>
      </View>

      {/* Instructions */}
      <View style={styles.bottomInfo}>
        <Text style={styles.guideTitle}>4-4-4 Box Breathing</Text>
        <Text style={styles.guideSubtitle}>
          Slow deep breathing activates the parasympathetic nervous system and dissolves craving intensity within 60 seconds.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerText: {
    color: '#39FF14',
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: CIRCLE_SIZE * 1.5,
    height: CIRCLE_SIZE * 1.5,
  },
  outerGlowCircle: {
    position: 'absolute',
    width: CIRCLE_SIZE * 1.3,
    height: CIRCLE_SIZE * 1.3,
    borderRadius: (CIRCLE_SIZE * 1.3) / 2,
    backgroundColor: 'rgba(57, 255, 20, 0.12)',
    shadowColor: '#39FF14',
    shadowRadius: 30,
    shadowOpacity: 0.8,
  },
  breathingCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: 'rgba(57, 255, 20, 0.25)',
    borderColor: '#39FF14',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 25,
  },
  phaseText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 6,
  },
  bottomInfo: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  guideTitle: {
    color: '#39FF14',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  guideSubtitle: {
    color: '#888888',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  completedContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  celebrationBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(57, 255, 20, 0.15)',
    borderWidth: 2,
    borderColor: '#39FF14',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  completedTitle: {
    color: '#39FF14',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 10,
  },
  completedSubtitle: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  doneBtn: {
    backgroundColor: '#39FF14',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#39FF14',
    shadowRadius: 10,
    shadowOpacity: 0.4,
  },
  doneBtnText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default BreathingExercise;
