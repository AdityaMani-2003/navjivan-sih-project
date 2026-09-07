import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import { earnXPAction } from '../../services/api';

const { width } = Dimensions.get('window');

const ICONS = ['leaf', 'heart', 'water', 'flame', 'moon', 'sparkles', 'sunny', 'planet'];

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function FocusFlowGame() {
  const router = useRouter();

  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const deck: Card[] = [];
    const pairedIcons = [...ICONS, ...ICONS];
    // Shuffle
    const shuffled = pairedIcons.sort(() => Math.random() - 0.5);

    shuffled.forEach((icon, index) => {
      deck.push({
        id: index,
        icon,
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(deck);
    setSelectedCards([]);
    setMoves(0);
    setMatches(0);
    setIsGameOver(false);
    setShowConfetti(false);
  };

  const handleCardPress = (index: number) => {
    if (
      cards[index].isFlipped ||
      cards[index].isMatched ||
      selectedCards.length === 2
    ) {
      return;
    }

    try {
      Haptics.selectionAsync();
    } catch (_e) {}

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newSelected;

      if (cards[firstIdx].icon === cards[secondIdx].icon) {
        // Match!
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (_e) {}
        newCards[firstIdx].isMatched = true;
        newCards[secondIdx].isMatched = true;
        setCards(newCards);
        setSelectedCards([]);
        const nextMatches = matches + 1;
        setMatches(nextMatches);

        if (nextMatches === ICONS.length) {
          handleWin();
        }
      } else {
        // Mismatch — flip back after short delay
        setTimeout(() => {
          newCards[firstIdx].isFlipped = false;
          newCards[secondIdx].isFlipped = false;
          setCards([...newCards]);
          setSelectedCards([]);
        }, 800);
      }
    }
  };

  const handleWin = async () => {
    setIsGameOver(true);
    setShowConfetti(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await earnXPAction(30, 'focus_flow_complete', { moves });
    } catch (_e) {}
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.gameTitle}>Focus Flow 🧘</Text>
        <TouchableOpacity style={styles.restartBtn} onPress={initGame}>
          <Ionicons name="refresh" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>MOVES</Text>
          <Text style={styles.statValue}>{moves}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>PAIRS FOUND</Text>
          <Text style={styles.statValue}>{matches} / {ICONS.length}</Text>
        </View>
      </View>

      {/* Card Grid */}
      <View style={styles.gridContainer}>
        <View style={styles.grid}>
          {cards.map((card, index) => (
            <TouchableOpacity
              key={card.id}
              activeOpacity={0.8}
              onPress={() => handleCardPress(index)}
              style={[
                styles.tile,
                (card.isFlipped || card.isMatched) && styles.tileFlipped,
                card.isMatched && styles.tileMatched,
              ]}
            >
              {card.isFlipped || card.isMatched ? (
                <Ionicons
                  name={card.icon as any}
                  size={28}
                  color={card.isMatched ? COLORS.primary : COLORS.secondary}
                />
              ) : (
                <MaterialCommunityIcons
                  name="rhombus-outline"
                  size={24}
                  color={COLORS.textMuted}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Win Modal Card */}
      {isGameOver && (
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.winCard} gradientBorder>
            <Text style={styles.winEmoji}>✨</Text>
            <Text style={styles.winHeading}>Mind Cleared & Focused!</Text>
            <Text style={styles.winDesc}>
              You resolved the pattern in {moves} moves. Your cognitive focus has successfully broken the craving loop.
            </Text>
            <Text style={styles.winXP}>+30 XP Awarded</Text>
            <View style={{ gap: SPACING.sm, width: '100%', marginTop: SPACING.md }}>
              <GradientButton
                title="Play Again 🔄"
                onPress={initGame}
                colors={COLORS.gradientPrimary}
              />
              <TouchableOpacity
                style={styles.returnBtn}
                onPress={() => router.back()}
              >
                <Text style={styles.returnBtnText}>Return to SOS</Text>
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
  restartBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.textPrimary,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textMuted,
  },
  statValue: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.primary,
    marginTop: 2,
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'center',
    maxWidth: 340,
  },
  tile: {
    width: 70,
    height: 70,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileFlipped: {
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.secondary,
  },
  tileMatched: {
    backgroundColor: COLORS.primaryGlow,
    borderColor: COLORS.primary,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  winCard: {
    width: '100%',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  winEmoji: {
    fontSize: 56,
    marginBottom: SPACING.sm,
  },
  winHeading: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  winDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginVertical: SPACING.sm,
  },
  winXP: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontWeight: '700',
  },
  returnBtn: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  returnBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
