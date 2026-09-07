import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft,
  Send,
  Trash2,
  Sparkles,
  Bot,
  User as UserIcon,
  Wind,
  ShieldAlert,
  Apple,
  Activity,
} from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { sendChatMessage, fetchChatHistory, clearChatHistory } from '../services/api';
import { useUser } from '../context/UserContext';

interface ChatItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  action?: {
    label: string;
    route: string;
    icon?: 'wind' | 'sos' | 'nutrition' | 'activity';
  };
}

const SMOKER_PROMPTS = [
  'I have a strong craving right now',
  'Tips for morning chai trigger',
  'Explain my quit timeline',
  'Suggest high-protein Indian snacks',
];

const FITNESS_PROMPTS = [
  'Suggest a 20-min workout',
  'High-protein Indian vegetarian meals',
  'How to build consistent morning habits?',
  'Tips to boost my stamina & steps',
];

const STORAGE_KEY = '@navjivan_chat_cache';

export default function ChatbotScreen() {
  const router = useRouter();
  const { userType, profile } = useUser();

  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  const promptSuggestions = userType === 'non-smoker' ? FITNESS_PROMPTS : SMOKER_PROMPTS;

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      // First try local cache for instant UI
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (cached) {
        setMessages(JSON.parse(cached));
      }

      // Then fetch from server
      const res = await fetchChatHistory(30);
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const serverMessages: ChatItem[] = res.data.data.map((m: any) => ({
          id: m._id || String(Math.random()),
          role: m.role,
          content: m.content,
          timestamp: m.timestamp || new Date().toISOString(),
          action: detectAction(m.content),
        }));
        setMessages(serverMessages);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(serverMessages));
      } else if (!cached) {
        // Welcome message if no history
        const welcomeMsg: ChatItem = {
          id: 'welcome-1',
          role: 'assistant',
          content: `Hello ${profile?.name || 'there'}! I am Navjivan, your AI cessation and wellness partner. How are you feeling right now? Tap any quick prompt below or type your message.`,
          timestamp: new Date().toISOString(),
        };
        setMessages([welcomeMsg]);
      }
    } catch (err) {
      console.warn('Failed to load chat history:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  // Helper to detect if message warrants a shortcut action button
  const detectAction = (text: string): ChatItem['action'] | undefined => {
    const lower = text.toLowerCase();
    if (lower.includes('breathing') || lower.includes('4-7-8') || lower.includes('inhale')) {
      return { label: 'Start 4-7-8 Breathing', route: '/games/breathing', icon: 'wind' };
    }
    if (lower.includes('sos') || lower.includes('intense craving') || lower.includes('relapse')) {
      return { label: 'Open SOS Mode', route: '/sos', icon: 'sos' };
    }
    if (lower.includes('meal') || lower.includes('protein') || lower.includes('snack')) {
      return { label: 'View Nutrition & Meals', route: '/nutrition', icon: 'nutrition' };
    }
    if (lower.includes('risk') || lower.includes('lungs') || lower.includes('health radar')) {
      return { label: 'Check Disease Risk', route: '/disease-risk', icon: 'activity' };
    }
    return undefined;
  };

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || loading) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_e) {}

    const userMessage: ChatItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    try {
      const res = await sendChatMessage(textToSend);
      const replyText =
        res.data?.data?.response ||
        res.data?.data?.message ||
        "I'm here with you. Take a slow, deep breath in for 4 seconds, hold for 7, and exhale for 8.";

      const assistantMessage: ChatItem = {
        id: res.data?.data?.chatMessageId || `ai-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toISOString(),
        action: detectAction(replyText),
      };

      const updated = [...newMessages, assistantMessage];
      setMessages(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Chat send error:', err);
      const fallbackMsg: ChatItem = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content:
          "Remember: cravings typically peak within 3 to 5 minutes. Take 10 deep breaths right now. You're fully in control!",
        timestamp: new Date().toISOString(),
        action: { label: 'Launch 4-7-8 Breathing', route: '/games/breathing', icon: 'wind' },
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Conversation',
      'Are you sure you want to clear your chat history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              await clearChatHistory();
              await AsyncStorage.removeItem(STORAGE_KEY);
              setMessages([
                {
                  id: 'welcome-reset',
                  role: 'assistant',
                  content: 'Chat history cleared. How can I support your journey today?',
                  timestamp: new Date().toISOString(),
                },
              ]);
            } catch (err) {
              console.warn('Failed to clear chat:', err);
            }
          },
        },
      ]
    );
  };

  const renderActionIcon = (icon?: string) => {
    switch (icon) {
      case 'wind':
        return <Wind size={16} color={COLORS.primary} />;
      case 'sos':
        return <ShieldAlert size={16} color={COLORS.error} />;
      case 'nutrition':
        return <Apple size={16} color={COLORS.accent} />;
      case 'activity':
        return <Activity size={16} color={COLORS.info} />;
      default:
        return <Sparkles size={16} color={COLORS.primary} />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color={COLORS.textPrimary} />
        </Pressable>

        <View style={styles.headerTitleBox}>
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>Navjivan AI</Text>
            <View style={styles.onlineDot} />
          </View>
          <Text style={styles.headerSubtitle}>Clinical Cessation & Health Coach</Text>
        </View>

        <Pressable
          onPress={handleClearHistory}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Clear chat history"
        >
          <Trash2 size={20} color={COLORS.textMuted} />
        </Pressable>
      </View>

      {/* Main Chat Screen with Keyboard Avoidance */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {initialLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Connecting to clinical coach...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => {
              const isUser = item.role === 'user';
              return (
                <View
                  style={[
                    styles.messageRow,
                    isUser ? styles.messageRowUser : styles.messageRowAssistant,
                  ]}
                >
                  {!isUser && (
                    <View style={styles.botAvatar}>
                      <Bot size={18} color={COLORS.primary} />
                    </View>
                  )}

                  <View
                    style={[
                      styles.messageBubble,
                      isUser ? styles.bubbleUser : styles.bubbleAssistant,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isUser ? styles.textUser : styles.textAssistant,
                      ]}
                    >
                      {item.content}
                    </Text>

                    {item.action && (
                      <Pressable
                        onPress={() => router.push(item.action!.route as any)}
                        style={styles.actionChip}
                        accessibilityRole="button"
                      >
                        {renderActionIcon(item.action.icon)}
                        <Text style={styles.actionChipText}>{item.action.label}</Text>
                      </Pressable>
                    )}

                    <Text
                      style={[
                        styles.timestampText,
                        isUser ? styles.timeUser : styles.timeAssistant,
                      ]}
                    >
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>

                  {isUser && (
                    <View style={styles.userAvatar}>
                      <UserIcon size={16} color={COLORS.textPrimary} />
                    </View>
                  )}
                </View>
              );
            }}
            ListFooterComponent={
              loading ? (
                <View style={[styles.messageRow, styles.messageRowAssistant]}>
                  <View style={styles.botAvatar}>
                    <Bot size={18} color={COLORS.primary} />
                  </View>
                  <View style={[styles.messageBubble, styles.bubbleAssistant, styles.typingBubble]}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.typingText}>Navjivan is thinking...</Text>
                  </View>
                </View>
              ) : null
            }
          />
        )}

        {/* Quick Prompts Chips */}
        <View style={styles.promptsContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={promptSuggestions}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.promptsList}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSend(item)}
                style={styles.promptChip}
                accessibilityRole="button"
              >
                <Sparkles size={14} color={COLORS.primary} />
                <Text style={styles.promptChipText}>{item}</Text>
              </Pressable>
            )}
          />
        </View>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask Navjivan anything..."
            placeholderTextColor={COLORS.textMuted}
            multiline
          />
          <Pressable
            onPress={() => handleSend()}
            disabled={!inputText.trim() || loading}
            style={[
              styles.sendButton,
              (!inputText.trim() || loading) && styles.sendButtonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Send size={18} color={COLORS.textInverse} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: COLORS.surface,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  headerTitleBox: {
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  chatArea: {
    flex: 1,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  messageList: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    maxWidth: '86%',
  },
  messageRowUser: {
    alignSelf: 'flex-end',
  },
  messageRowAssistant: {
    alignSelf: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  messageBubble: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOW.sm,
  },
  bubbleUser: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...TYPOGRAPHY.body,
    lineHeight: 22,
  },
  textUser: {
    color: COLORS.textInverse,
    fontWeight: '500',
  },
  textAssistant: {
    color: COLORS.textPrimary,
  },
  timestampText: {
    fontSize: 10,
    marginTop: SPACING.xs,
    alignSelf: 'flex-end',
  },
  timeUser: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  timeAssistant: {
    color: COLORS.textMuted,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    alignSelf: 'flex-start',
  },
  actionChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  typingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  promptsContainer: {
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  promptsList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  promptChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    color: COLORS.textPrimary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
