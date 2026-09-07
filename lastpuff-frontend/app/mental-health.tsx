import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import Badge from '../components/ui/Badge';
import { fetchConfidenceScript, earnXPAction } from '../services/api';

const MOODS = [
  { id: 1, emoji: '😫', label: 'Stressed' },
  { id: 2, emoji: '😐', label: 'Neutral' },
  { id: 3, emoji: '🙂', label: 'Calm' },
  { id: 4, emoji: '⚡', label: 'Energized' },
  { id: 5, emoji: '🧘', label: 'Zen / Flow' },
];

export default function MentalHealthScreen() {
  const router = useRouter();

  const [selectedMood, setSelectedMood] = useState<number>(4);
  const [moodNote, setMoodNote] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [confidenceScript, setConfidenceScript] = useState<string | null>(
    "I am grounded in this present moment. Chemical impulses and distractions are merely passing clouds across the vast sky of my awareness. I choose clarity, discipline, and vitality."
  );

  const generateScript = async (trigger: string) => {
    try {
      setLoadingAi(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const res = await fetchConfidenceScript(trigger, 8);
      if (res?.data?.script) {
        setConfidenceScript(res.data.script);
      } else {
        setConfidenceScript(
          "My breath is my anchor. With every exhalation, tension dissolves. With every inhalation, strength enters. I am resilient, focused, and unshakeable."
        );
      }
    } catch (_e) {
      setConfidenceScript(
        "I honor my body and mind. Obstacles in my path are not barriers, but stepping stones that sharpen my determination."
      );
    } finally {
      setLoadingAi(false);
    }
  };

  const handleLogMood = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await earnXPAction(20, 'mood_logged', { mood: selectedMood, note: moodNote });
      Toast.show({
        type: 'success',
        text1: 'Mindset Logged! 🧘',
        text2: '+20 XP. Emotional self-awareness recorded.',
      });
      setMoodNote('');
    } catch (_e) {}
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mental Fitness & Focus</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Focus Mode & AI Affirmation */}
        <GlassCard style={styles.focusCard} gradientBorder borderColors={COLORS.gradientSecondary}>
          <View style={styles.focusHeader}>
            <View style={[styles.focusIconBox, { backgroundColor: COLORS.secondaryGlow }]}>
              <MaterialCommunityIcons name="brain" size={24} color={COLORS.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.focusLabel}>AI CONFIDENCE SCRIPT</Text>
              <Text style={styles.focusTitle}>Daily Focus Affirmation</Text>
            </View>
            <Badge text="MIND LAB" variant="secondary" size="sm" />
          </View>

          {loadingAi ? (
            <ActivityIndicator color={COLORS.secondary} size="small" style={{ marginVertical: SPACING.md }} />
          ) : (
            <View style={styles.scriptBox}>
              <Text style={styles.scriptText}>"{confidenceScript}"</Text>
            </View>
          )}

          {/* Quick Script Triggers */}
          <Text style={styles.subPromptLabel}>Synthesize Script For:</Text>
          <View style={styles.triggerChipsRow}>
            {['Performance Anxiety ⚡', 'Work Pressure 💻', 'Craving Urge 🛑', 'Deep Sleep 🌙'].map((t) => (
              <TouchableOpacity
                key={t}
                style={styles.triggerChip}
                onPress={() => generateScript(t)}
              >
                <Text style={styles.triggerChipText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        {/* Daily Mood Tracker */}
        <Text style={styles.sectionTitle}>Check In With Your Mind</Text>
        <GlassCard style={styles.moodCard}>
          <Text style={styles.moodPrompt}>How is your emotional energy right now?</Text>
          <View style={styles.moodRow}>
            {MOODS.map((m) => {
              const isSelected = selectedMood === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.moodBtn,
                    isSelected && styles.moodBtnActive,
                  ]}
                  onPress={() => {
                    setSelectedMood(m.id);
                    Haptics.selectionAsync();
                  }}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      isSelected && styles.moodLabelActive,
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            style={styles.noteInput}
            value={moodNote}
            onChangeText={setMoodNote}
            placeholder="Add an optional reflection note..."
            placeholderTextColor={COLORS.textMuted}
          />

          <GradientButton
            title="Log Mood State (+20 XP) 📝"
            onPress={handleLogMood}
            colors={COLORS.gradientSecondary}
            style={{ marginTop: SPACING.sm }}
          />
        </GlassCard>

        {/* Quick Pranayama Breathwork Shortcut */}
        <Text style={styles.sectionTitle}>Mind-Body Grounding</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.breathingShortcutCard}
          onPress={() => router.push('/sos' as any)}
        >
          <View style={[styles.breathIconBox, { backgroundColor: COLORS.primaryGlow }]}>
            <Ionicons name="leaf" size={24} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.breathTitle}>Guided 4-7-8 Pranayama Breathwork</Text>
            <Text style={styles.breathSub}>Activate the parasympathetic nervous system in 60 seconds.</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={COLORS.textMuted} />
        </TouchableOpacity>
      </ScrollView>
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 60,
  },
  focusCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  focusIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.secondary,
  },
  focusTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  scriptBox: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  scriptText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  subPromptLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  triggerChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  triggerChip: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
  },
  triggerChipText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  moodCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  moodPrompt: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  moodBtn: {
    alignItems: 'center',
    padding: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
    width: 60,
  },
  moodBtnActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondaryGlow,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  moodLabelActive: {
    color: COLORS.secondary,
  },
  noteInput: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    color: COLORS.textPrimary,
    fontSize: 13,
    marginBottom: SPACING.xs,
  },
  breathingShortcutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  breathIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  breathSub: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
