import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import {
  ArrowLeft,
  Timer,
  Flame,
  Sparkles,
  RotateCcw,
  Gamepad2,
  Trophy,
} from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOW } from '../../constants/theme';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import api from '../../services/api';
import { useUser } from '../../context/UserContext';

const { width, height } = Dimensions.get('window');

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  points: number;
  speed: number;
}

const BUBBLE_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.accent,
  COLORS.info,
  '#EC4899',
];

const GAME_DURATION = 60; // 60 seconds

export default function BubbleBurstGame() {
  const router = useRouter();
  const { addXP } = useUser();

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);

  const bubbleIdRef = useRef(1);
  const animFrameRef = useRef<number | null>(null);

  // Timer loop
  useEffect(() => {
    let timer: any = null;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleEndGame();
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
      }, 650);
    }
    return () => clearInterval(spawner);
  }, [gameState]);

  // Floating upward animation loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const updateBubblePositions = () => {
      setBubbles((current) =>
        current
          .map((b) => ({
            ...b,
            y: b.y - b.speed,
          }))
          // Remove bubbles that floated past top of screen
          .filter((b) => b.y > -b.size)
      );
      animFrameRef.current = requestAnimationFrame(updateBubblePositions);
    };

    animFrameRef.current = requestAnimationFrame(updateBubblePositions);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState]);

  const startGame = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_e) {}
    setScore(0);
    setCombo(1);
    setTimeLeft(GAME_DURATION);
    setBubbles([]);
    setShowConfetti(false);
    setXpAwarded(false);
    setGameState('playing');
  };

  const handleEndGame = async () => {
    setGameState('gameover');
    setShowConfetti(true);

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_e) {}

    if (!xpAwarded) {
      setXpAwarded(true);
      try {
        await api.post('/api/v1/gamification/xp', {
          amount: 15,
          reason: 'Bubble burst craving distraction completed',
        });
        addXP(15);
      } catch (err) {
        console.warn('XP award error:', err);
        addXP(15);
      }
    }
  };

  const spawnBubble = () => {
    setBubbles((current) => {
      if (current.length >= 10) return current;
      const size = Math.floor(Math.random() * 26) + 54; // 54 - 80px
      const maxX = width - size - 32;
      const x = Math.max(16, Math.floor(Math.random() * maxX));
      const startY = height - 260; // start from bottom area
      const color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
      const speed = Math.random() * 1.5 + 1.2; // 1.2 - 2.7 px/frame float up

      const newBubble: Bubble = {
        id: bubbleIdRef.current++,
        x,
        y: startY,
        size,
        color,
        points: Math.floor(size > 65 ? 10 : 20),
        speed,
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
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back to SOS"
        >
          <ArrowLeft size={22} color={COLORS.textPrimary} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Bubble Burst</Text>
          <Text style={styles.headerSubtitle}>Kinetic Craving Interruption</Text>
        </View>

        <View style={styles.timerBadge}>
          <Timer size={16} color={COLORS.primary} />
          <Text style={styles.timerText}>{timeLeft}s</Text>
        </View>
      </View>

      {/* Stats HUD (playing mode) */}
      {gameState === 'playing' && (
        <View style={styles.hudBar}>
          <View style={styles.hudItem}>
            <Text style={styles.hudLabel}>SCORE</Text>
            <Text style={styles.hudValue}>{score}</Text>
          </View>
          <View style={styles.comboBadge}>
            <Flame size={14} color={COLORS.accent} />
            <Text style={styles.comboText}>{combo}x COMBO</Text>
          </View>
        </View>
      )}

      {/* Active Game Playfield */}
      {gameState === 'playing' && (
        <View style={styles.playfield}>
          {bubbles.map((b) => (
            <Pressable
              key={b.id}
              onPress={() => popBubble(b.id, b.points)}
              style={[
                styles.bubble,
                {
                  left: b.x,
                  top: b.y,
                  width: b.size,
                  height: b.size,
                  borderRadius: b.size / 2,
                  borderColor: b.color,
                  backgroundColor: b.color + '22',
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Pop bubble for ${b.points} points`}
            >
              <View style={[styles.bubbleGlint, { backgroundColor: b.color + '88' }]} />
              <Text style={[styles.bubbleText, { color: b.color }]}>+{b.points}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Ready State */}
      {gameState === 'ready' && (
        <View style={styles.centerContainer}>
          <Card style={styles.cardBox} elevation="high">
            <View style={[styles.iconBox, { backgroundColor: COLORS.secondaryDim }]}>
              <Gamepad2 size={40} color={COLORS.secondary} />
            </View>
            <Text style={styles.cardHeading}>Dopamine Hijack</Text>
            <Text style={styles.cardDesc}>
              Pop floating bubbles as fast as you can. Rapid visual tracking activates motor
              control circuits, disarming nicotine craving urges in 60 seconds.
            </Text>

            <View style={styles.statsSummaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemValue}>60s</Text>
                <Text style={styles.summaryItemLabel}>Duration</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemValue}>+15 XP</Text>
                <Text style={styles.summaryItemLabel}>Reward</Text>
              </View>
            </View>

            <Button
              title="Start Popping"
              variant="primary"
              size="lg"
              fullWidth
              onPress={startGame}
              icon={<Gamepad2 size={20} color={COLORS.textInverse} />}
            />
          </Card>
        </View>
      )}

      {/* Game Over State */}
      {gameState === 'gameover' && (
        <View style={styles.centerContainer}>
          {showConfetti && (
            <ConfettiCannon
              count={60}
              origin={{ x: width / 2, y: -20 }}
              fadeOut={true}
              fallSpeed={3000}
            />
          )}

          <Card style={styles.cardBox} elevation="high">
            <View style={[styles.iconBox, { backgroundColor: COLORS.primaryDim }]}>
              <Trophy size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.cardHeading}>Craving Conquered!</Text>
            <Text style={styles.finalScore}>Final Score: {score}</Text>

            <View style={styles.xpBox}>
              <Sparkles size={20} color={COLORS.primary} />
              <Text style={styles.xpText}>+15 XP Earned • Craving Resisted</Text>
            </View>

            <View style={{ width: '100%', gap: SPACING.sm, marginTop: SPACING.md }}>
              <Button
                title="Play Again"
                variant="primary"
                size="lg"
                fullWidth
                onPress={startGame}
                icon={<RotateCcw size={18} color={COLORS.textInverse} />}
              />
              <Button
                title="Back to SOS"
                variant="outline"
                size="lg"
                fullWidth
                onPress={() => router.back()}
              />
            </View>
          </Card>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  timerText: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
    fontWeight: '700',
  },
  hudBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    zIndex: 10,
  },
  hudItem: {
    flexDirection: 'column',
  },
  hudLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
    letterSpacing: 1,
  },
  hudValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  comboBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  comboText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent,
    fontWeight: '700',
  },
  playfield: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.md,
  },
  bubbleGlint: {
    position: 'absolute',
    top: '15%',
    left: '20%',
    width: 10,
    height: 6,
    borderRadius: 3,
    transform: [{ rotate: '-30deg' }],
  },
  bubbleText: {
    ...TYPOGRAPHY.label,
    fontWeight: '800',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  cardBox: {
    width: '100%',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  cardHeading: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  cardDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  statsSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    width: '100%',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryItemValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  summaryItemLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.surfaceBorder,
  },
  finalScore: {
    ...TYPOGRAPHY.display,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  xpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryDim,
    marginBottom: SPACING.lg,
  },
  xpText: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
    fontWeight: '700',
  },
});
