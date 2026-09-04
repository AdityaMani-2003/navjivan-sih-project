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
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const DOT_SIZE = 60;
const GAME_DURATION = 20; // 20 seconds
const DOT_WINDOW_MS = 1500; // 1.5s window

interface DistractionGameProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

export const DistractionGame: React.FC<DistractionGameProps> = ({
  onComplete,
  onExit,
}) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [dotPosition, setDotPosition] = useState({ x: width * 0.4, y: height * 0.4 });

  const dotScale = useSharedValue(0);
  const dotTimerRef = useRef<any>(null);
  const gameTimerRef = useRef<any>(null);

  const spawnDot = () => {
    // Keep dot comfortably within play boundaries
    const minX = 40;
    const maxX = width - 40 - DOT_SIZE;
    const minY = 120;
    const maxY = height - 160 - DOT_SIZE;

    const randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
    const randomY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

    setDotPosition({ x: randomX, y: randomY });

    dotScale.value = 0;
    dotScale.value = withSpring(1, { damping: 12, stiffness: 150 });

    if (dotTimerRef.current) clearTimeout(dotTimerRef.current);
    dotTimerRef.current = setTimeout(() => {
      // Dot expires
      dotScale.value = withTiming(0, { duration: 150 });
      spawnDot();
    }, DOT_WINDOW_MS);
  };

  useEffect(() => {
    spawnDot();

    gameTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (gameTimerRef.current) clearInterval(gameTimerRef.current);
          if (dotTimerRef.current) clearTimeout(dotTimerRef.current);
          setIsGameOver(true);
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (e) {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (dotTimerRef.current) clearTimeout(dotTimerRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, []);

  const handleDotTap = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    setScore((s) => s + 1);
    dotScale.value = withTiming(0, { duration: 100 });
    spawnDot();
  };

  const animatedDotStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: dotScale.value }],
    };
  });

  if (isGameOver) {
    return (
      <View style={styles.completedContainer}>
        <View style={styles.trophyBadge}>
          <Text style={{ fontSize: 44 }}>🎯</Text>
        </View>
        <Text style={styles.completedTitle}>Craving Survived!</Text>
        <Text style={styles.scoreHighlight}>Final Score: {score} dots</Text>
        <Text style={styles.completedSubtitle}>
          You successfully redirected your focus. Your dopamine centers just rewarded willpower instead of nicotine!
        </Text>
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => {
            onComplete(score);
            onExit();
          }}
        >
          <Text style={styles.doneBtnText}>Back to SOS</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.topBar}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>SCORE</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>TIME</Text>
          <Text style={styles.statValue}>{timeLeft}s</Text>
        </View>
        <TouchableOpacity onPress={onExit} style={styles.stopButton}>
          <Ionicons name="close" size={20} color="#FFFFFF" />
          <Text style={styles.stopButtonText}>Exit</Text>
        </TouchableOpacity>
      </View>

      {/* Tap Hint */}
      <Text style={styles.hintText}>Tap the glowing dots before they vanish!</Text>

      {/* Floating Dot */}
      <Animated.View
        style={[
          styles.dot,
          animatedDotStyle,
          {
            left: dotPosition.x,
            top: dotPosition.y,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleDotTap}
          style={styles.dotTouchable}
        >
          <View style={styles.dotInner} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statValue: {
    color: '#39FF14',
    fontSize: 24,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  hintText: {
    color: '#666666',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotTouchable: {
    width: DOT_SIZE + 20,
    height: DOT_SIZE + 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotInner: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#39FF14',
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  completedContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  trophyBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(57, 255, 20, 0.15)',
    borderWidth: 2,
    borderColor: '#39FF14',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  completedTitle: {
    color: '#39FF14',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  scoreHighlight: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  completedSubtitle: {
    color: '#AAAAAA',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  doneBtn: {
    backgroundColor: '#39FF14',
    paddingVertical: 16,
    paddingHorizontal: 36,
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

export default DistractionGame;
