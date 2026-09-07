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
      const res = await sendAiChat(text, undefined, userType === 'non-smoker' ? 'fitness_coach' : 'quit_smoking_coach');
      const replyText =
        res?.data?.reply ||
        res?.data?.message ||
        "Remember, your physiological urge peaks in 3 to 5 minutes. Take 3 deep diaphragmatic breaths right now. You're fully in control!";

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (_err) {
      const fallbackMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text:
          userType === 'non-smoker'
            ? 'For optimal recovery, ensure 2.5L hydration today and incorporate 10 minutes of mobility stretching.'
            : 'Take a slow glass of cold water and exhale deeply. Every urge you outlast permanently weakens nicotine receptor sensitivity in your brain.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
});
