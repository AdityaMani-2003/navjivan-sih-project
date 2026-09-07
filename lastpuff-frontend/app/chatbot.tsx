import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import GlassCard from '../components/ui/GlassCard';
import { sendAiChat } from '../services/api';
import { useUser } from '../context/UserContext';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  action?: { label: string; route: string };
}

function getSmartAiResponse(
  text: string,
  userType: 'smoker' | 'non-smoker'
): { reply: string; action?: { label: string; route: string } } {
  const lower = text.toLowerCase();

  if (
    lower.includes('craving') ||
    lower.includes('smoke') ||
    lower.includes('urge') ||
    lower.includes('resist') ||
    lower.includes('puff')
  ) {
    return {
      reply:
        "Cravings peak within 3 to 5 minutes and then subside as dopamine stabilizes. Drink a glass of cold water and begin the 4-7-8 breathing loop right now. You're stronger than a 5-minute chemical trick! 💪",
      action: { label: 'Launch 4-7-8 Breathing SOS 🫁', route: '/sos' },
    };
  }

  if (lower.includes('chai') || lower.includes('tea') || lower.includes('coffee')) {
    return {
      reply:
        'Chai is one of the strongest conditioned smoking triggers in India! Break the neural loop: switch to green or ginger tea for 1 week, change your seating spot, or keep roasted makhana nearby. ☕✨',
      action: { label: 'Log Healthy Indian Snack 🥗', route: '/nutrition' },
    };
  }

  if (
    lower.includes('plan') ||
    lower.includes('quit') ||
    lower.includes('strategy') ||
    lower.includes('protocol') ||
    lower.includes('how to')
  ) {
    return {
      reply:
        'Your optimal protocol is a Gradual 30-Day Stepdown or Cold Turkey sprint. We cap daily cigarettes by 25% each week while redirecting morning routines to hydration and heritage walks.',
      action: { label: 'Open 30-Day Quit Strategy 📅', route: '/quit-plan' },
    };
  }

  if (
    lower.includes('lung') ||
    lower.includes('health') ||
    lower.includes('heart') ||
    lower.includes('risk') ||
    lower.includes('cancer') ||
    lower.includes('copd')
  ) {
    return {
      reply:
        'Within 24 hours of zero puffs, carbon monoxide drops to normal and oxygen saturation spikes. In 48 hours, nerve endings begin regrowing. Check your calculated pack-year exposure and organ reversal radar.',
      action: { label: 'View Disease Risk Radar ⚠️', route: '/disease-risk' },
    };
  }

  if (
    lower.includes('protein') ||
    lower.includes('diet') ||
    lower.includes('food') ||
    lower.includes('meal') ||
    lower.includes('eat') ||
    lower.includes('calorie')
  ) {
    return {
      reply:
        'Aim for 1.2g to 1.6g of protein per kg of bodyweight. Indian staple powerhouses: paneer tikka, yellow dal with jeera rice, boiled eggs, roasted sattu, and greek yogurt. Track your macros in 1 tap!',
      action: { label: 'Open AI Meal Logger 🍽️', route: '/nutrition' },
    };
  }

  if (
    lower.includes('step') ||
    lower.includes('walk') ||
    lower.includes('padyatra') ||
    lower.includes('cardio') ||
    lower.includes('run')
  ) {
    return {
      reply:
        'Every 1,000 steps flushes lymphatic waste and stimulates endorphins that outcompete nicotine urges. Progress along the historic Dandi March or Char Dham pilgrimage trail today!',
      action: { label: 'Walk Padyatra Trail 👣', route: '/padyatra' },
    };
  }

  if (
    lower.includes('goal') ||
    lower.includes('daily') ||
    lower.includes('agent') ||
    lower.includes('agentic') ||
    lower.includes('target')
  ) {
    return {
      reply:
        'Your Agentic AI continually evaluates your daily habits to synthesize 3 high-impact micro-goals. Check your active missions or generate a fresh batch for extra XP!',
      action: { label: 'Open AI Goal Synthesizer 🎯', route: '/goals' },
    };
  }

  if (
    lower.includes('sleep') ||
    lower.includes('insomnia') ||
    lower.includes('rest') ||
    lower.includes('tired') ||
    lower.includes('night')
  ) {
    return {
      reply:
        'Nicotine withdrawal disrupts REM sleep cycles. During detox, take 200mg magnesium glycinate or warm turmeric milk (Haldi Doodh) 45 minutes before bed. Avoid screens after 10 PM. 🌙',
      action: { label: 'Practice Mindset Affirmation 🧘', route: '/mental-health' },
    };
  }

  if (userType === 'non-smoker') {
    return {
      reply:
        'Consistency beats intensity every time. Hit your 10,000 step milestone, log 3L hydration, and ensure 25g post-workout protein to maximize recovery. What workout are you tackling today? ⚡',
      action: { label: 'Explore Fitness Splits 🏋️', route: '/fitness-plans' },
    };
  }

  return {
    reply:
      'Every urge you withstand permanently weakens the nicotine receptors in your prefrontal cortex. You are actively reshaping your brain right now. Take a deep diaphragmatic breath and stay strong!',
    action: { label: 'Explore Recovery Missions 🏆', route: '/goals' },
  };
}

const SMOKER_PROMPTS = [
  '🚨 I have a severe craving right now!',
  '☕ How do I drink chai without smoking?',
  '😴 Nicotine withdrawal is affecting my sleep',
  '🫁 When do my lungs start clearing?',
];

const FITNESS_PROMPTS = [
  '🥗 Quick high-protein vegetarian meal idea',
  '🏃 How do I pace my 5K running warmup?',
  '💪 Best exercises to build core strength',
  '🧘 Breathing routine for stress relief',
];

export default function ChatbotScreen() {
  const router = useRouter();
  const { userType } = useUser();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text:
        userType === 'non-smoker'
          ? "Namaste! 🙏 I'm your Navjivan Fitness & Nutrition Copilot. How can I assist your athletic training, Padyatra steps, or diet today?"
          : "Namaste! 🙏 I'm your LastPuff Quit-Smoking Copilot. Facing a craving or need a motivational strategy? I'm here 24/7.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action:
        userType === 'non-smoker'
          ? { label: 'Explore Fitness Splits 🏋️', route: '/fitness-plans' }
          : { label: 'Launch 4-7-8 Breathing SOS 🫁', route: '/sos' },
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = userType === 'non-smoker' ? FITNESS_PROMPTS : SMOKER_PROMPTS;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_e) {}

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await sendAiChat(
        text,
        undefined,
        userType === 'non-smoker' ? 'fitness_coach' : 'quit_smoking_coach'
      );
      const replyText = res?.data?.reply || res?.data?.message;

      if (replyText) {
        const smart = getSmartAiResponse(text, userType || 'smoker');
        const aiMsg: Message = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: smart.action,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const smart = getSmartAiResponse(text, userType || 'smoker');
        const aiMsg: Message = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: smart.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: smart.action,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (_err) {
      const smart = getSmartAiResponse(text, userType || 'smoker');
      const fallbackMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: smart.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: smart.action,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.aiStatusDot} />
          <Text style={styles.headerTitle}>Navjivan AI Copilot</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.chatScroll}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((m) => (
            <View
              key={m.id}
              style={[
                styles.messageRow,
                m.sender === 'user' ? styles.userRow : styles.aiRow,
              ]}
            >
              {m.sender === 'ai' && (
                <View style={[styles.avatarBox, { backgroundColor: COLORS.primaryGlow }]}>
                  <MaterialCommunityIcons name="robot" size={18} color={COLORS.primary} />
                </View>
              )}
              <View
                style={[
                  styles.bubble,
                  m.sender === 'user' ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    m.sender === 'user' ? styles.userBubbleText : styles.aiBubbleText,
                  ]}
                >
                  {m.text}
                </Text>
                <Text style={styles.bubbleTime}>{m.timestamp}</Text>

                {m.action && (
                  <TouchableOpacity
                    style={styles.actionPill}
                    onPress={() => router.push(m.action!.route as any)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="flash" size={12} color={COLORS.primary} />
                    <Text style={styles.actionPillText}>{m.action.label}</Text>
                    <Ionicons name="arrow-forward" size={12} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {loading && (
            <View style={[styles.messageRow, styles.aiRow]}>
              <View style={[styles.avatarBox, { backgroundColor: COLORS.primaryGlow }]}>
                <MaterialCommunityIcons name="robot" size={18} color={COLORS.primary} />
              </View>
              <View style={[styles.bubble, styles.aiBubble, { paddingVertical: 12 }]}>
                <ActivityIndicator color={COLORS.primary} size="small" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Suggestion Chips */}
        <View style={styles.suggestionsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsScroll}
          >
            {quickPrompts.map((prompt) => (
              <TouchableOpacity
                key={prompt}
                style={styles.suggestionChip}
                onPress={() => handleSend(prompt)}
              >
                <Text style={styles.suggestionText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask anything about health, cravings, diet..."
            placeholderTextColor={COLORS.textMuted}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              !inputText.trim() && styles.sendBtnDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || loading}
          >
            <Ionicons
              name="send"
              size={18}
              color={inputText.trim() ? COLORS.bg : COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  headerTitle: {
    ...TYPOGRAPHY.heading3,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  chatScroll: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  avatarBox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userBubbleText: {
    color: COLORS.bg,
    fontWeight: '600',
  },
  aiBubbleText: {
    color: COLORS.textPrimary,
  },
  bubbleTime: {
    fontSize: 10,
    color: COLORS.textMuted,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  suggestionsContainer: {
    paddingVertical: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
    backgroundColor: COLORS.surface,
  },
  suggestionsScroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  suggestionChip: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: 6,
  },
  suggestionText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.textPrimary,
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.surfaceElevated,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 245, 160, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 160, 0.3)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 6,
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
