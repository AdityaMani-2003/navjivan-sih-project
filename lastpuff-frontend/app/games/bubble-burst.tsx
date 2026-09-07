import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import { earnXPAction } from '../../services/api';

const { width, height } = Dimensions.get('window');

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  points: number;
}

const BUBBLE_COLORS = ['#00D4AA', '#0EA5E9', '#7C3AED', '#EC4899', '#F59E0B'];

export default function BubbleBurstGame() {
  const router = useRouter();

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const bubbleIdRef = useRef(1);

  // Countdown timer
  useEffect(() => {
    let timer: any = null;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // Bubble spawner
  useEffect(() => {
    let spawner: any = null;
    if (gameState === 'playing') {
      spawner = setInterval(() => {
        spawnBubble();
      }, 700);
    }
    return () => clearInterval(spawner);
  }, [gameState]);

  const startGame = () => {
    setScore(0);
    setCombo(1);
    setTimeLeft(60);
    setBubbles([]);
    setShowConfetti(false);
    setGameState('playing');
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_e) {}
  };

  const endGame = async () => {
    setGameState('gameover');
    setShowConfetti(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await earnXPAction(30, 'craving_game_complete', { score });
    } catch (_e) {}
  };

  const spawnBubble = () => {
    setBubbles((current) => {
      if (current.length >= 8) return current;
      const size = Math.floor(Math.random() * 25) + 55; // 55-80
      const maxX = width - size - 32;
      const maxY = height - 320;
      const x = Math.max(16, Math.floor(Math.random() * maxX));
      const y = Math.max(120, Math.floor(Math.random() * maxY));
      const color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];

      const newBubble: Bubble = {
        id: bubbleIdRef.current++,
        x,
        y,
        size,
        color,
        points: Math.floor(size > 65 ? 10 : 20),
      };
      return [...current, newBubble];
    });
  };

  const popBubble = (id: number, pts: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_e) {}
    setScore((prev) => prev + pts * combo);
    setCombo((prev) => Math.min(5, prev + 1));
    setBubbles((current) => current.filter((b) => b.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.gameTitle}>Bubble Burst 🫧</Text>
        <View style={styles.statPill}>
          <Ionicons name="time" size={16} color={COLORS.primary} />
          <Text style={styles.statPillText}>{timeLeft}s</Text>
        </View>
      </View>

      {/* Stats Bar */}
      <View style={styles.scoreBar}>
        <View>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.comboBadge}>
          <Text style={styles.comboText}>{combo}x COMBO 🔥</Text>
        </View>
      </View>

      {/* Game Playing Area */}
      {gameState === 'playing' && (
        <View style={styles.playArea}>
          {bubbles.map((b) => (
            <TouchableOpacity
              key={b.id}
              activeOpacity={0.7}
              onPress={() => popBubble(b.id, b.points)}
              style={[
                styles.bubble,
                {
                  left: b.x,
                  top: b.y,
                  width: b.size,
                  height: b.size,
                  borderRadius: b.size / 2,
                  backgroundColor: b.color + '33',
                  borderColor: b.color,
                },
              ]}
            >
              <Text style={[styles.bubbleText, { color: b.color }]}>+{b.points}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Ready Screen */}
      {gameState === 'ready' && (
        <View style={styles.centerContainer}>
          <GlassCard style={styles.modalCard} gradientBorder>
            <Text style={styles.readyEmoji}>🫧</Text>
            <Text style={styles.readyHeading}>Craving Distraction</Text>
            <Text style={styles.readyDesc}>
              Pop as many floating bubbles as you can in 60 seconds. Rapid eye-hand coordination redirects neural dopamine channels away from cravings!
            </Text>
            <GradientButton
              title="Start Popping! 🎮"
              onPress={startGame}
              colors={COLORS.gradientPrimary}
            />
          </GlassCard>
        </View>
      )}

      {/* GameOver Screen */}
      {gameState === 'gameover' && (
        <View style={styles.centerContainer}>
          <GlassCard style={styles.modalCard} gradientBorder>
            <Text style={styles.readyEmoji}>🏆</Text>
            <Text style={styles.readyHeading}>Craving Conquered!</Text>
            <Text style={styles.finalScore}>Final Score: {score}</Text>
            <Text style={styles.xpReward}>+30 XP Earned • Craving Resisted</Text>
            <View style={{ gap: SPACING.sm, width: '100%', marginTop: SPACING.md }}>
              <GradientButton
                title="Play Again 🔄"
                onPress={startGame}
                colors={COLORS.gradientPrimary}
              />
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>Return to SOS Menu</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      )}

      {showConfetti && (
        <ConfettiCannon
          count={60}
          origin={{ x: width / 2, y: 0 }}
          fadeOut
          fallSpeed={3000}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.textPrimary,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryGlow,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  statPillText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  scoreBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  scoreLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textMuted,
  },
  scoreValue: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.textPrimary,
  },
  comboBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  comboText: {
    color: COLORS.accent,
    fontWeight: '700',
    fontSize: 12,
  },
  playArea: {
    flex: 1,
    position: 'relative',
  },
  bubble: {
    position: 'absolute',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.primary,
  },
  bubbleText: {
    fontWeight: '800',
    fontSize: 13,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  readyEmoji: {
    fontSize: 56,
    marginBottom: SPACING.sm,
  },
  readyHeading: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  readyDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  finalScore: {
    ...TYPOGRAPHY.heading1,
    color: COLORS.primary,
    marginBottom: 4,
  },
  xpReward: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  backButton: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
