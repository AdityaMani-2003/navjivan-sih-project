import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import Badge from '../../components/ui/Badge';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import { fetchFeed, toggleLike, deletePost } from '../../services/posts';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';

const { width } = Dimensions.get('window');

interface FitSquad {
  id: string;
  name: string;
  location: string;
  membersCount: number;
  category: string;
  icon: string;
  joined?: boolean;
}

const FIT_SQUADS: FitSquad[] = [
  { id: 'sq_1', name: 'Delhi Smoke-Free Warriors', location: 'NCR Region', membersCount: 1420, category: 'Smoke-Free', icon: 'shield-alt' },
  { id: 'sq_2', name: 'Bengaluru Tech Runners & Coders', location: 'Bengaluru', membersCount: 2850, category: 'Running & Fitness', icon: 'running' },
  { id: 'sq_3', name: 'Mumbai Sea-Face Calisthenics', location: 'Mumbai', membersCount: 980, category: 'Athletics', icon: 'dumbbell' },
  { id: 'sq_4', name: 'Padyatra Heritage Walkers', location: 'Pan-India', membersCount: 3200, category: 'Pilgrimage', icon: 'hiking' },
];

const FEED_CHIPS = [
  { id: 'all', name: 'All Feeds 🌐' },
  { id: 'smoker', name: 'Smoke-Free 🚭' },
  { id: 'fitness', name: 'Fitness & Health ⚡' },
  { id: 'squads', name: 'FitSquad Groups 👥' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { userType } = useUser();
  const params = useLocalSearchParams();

  const [activeChip, setActiveChip] = useState('all');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [squads, setSquads] = useState<FitSquad[]>(FIT_SQUADS);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const res = await fetchFeed();
      if (res?.data?.posts) {
        setPosts(res.data.posts);
      }
    } catch (_err) {
      // Demo posts if offline/mock
      setPosts([
        {
          _id: 'p1',
          authorName: 'Aditya Sharma',
          content: 'Just hit 30 DAYS 100% Smoke-Free! My lung capacity during morning runs is night and day compared to last month. Keep resisting those 5-minute cravings, tribe! 🔥',
          likes: ['u1', 'u2', 'u3', 'u4'],
          commentsCount: 6,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          category: 'Smoke-Free',
        },
        {
          _id: 'p2',
          authorName: 'Sneha Patel',
          content: 'Completed 45 km on the Dandi March Padyatra route this week! The virtual pilgrimage makes 10,000 steps effortless. 🇮🇳',
          likes: ['u1', 'u2'],
          commentsCount: 3,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          category: 'Fitness',
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [activeChip]);

  useEffect(() => {
    if (params.refresh === '1') {
      loadPosts();
    }
  }, [params.refresh]);

  const handleLike = async (postId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await toggleLike(postId);
      loadPosts();
    } catch (_e) {}
  };

  const handleJoinSquad = (squadId: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSquads((current) =>
        current.map((sq) => (sq.id === squadId ? { ...sq, joined: !sq.joined } : sq))
      );
      Toast.show({
        type: 'success',
        text1: 'Squad Updated! 👥',
        text2: 'You are now connected with local peers.',
      });
    } catch (_e) {}
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Navjivan Tribe & Community</Text>
          <Text style={styles.subTitle}>Inspire, conquer cravings & train together</Text>
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => router.push('/community/CreatePost' as any)}
        >
          <Ionicons name="add" size={22} color={COLORS.bg} />
        </TouchableOpacity>
      </View>

      {/* Filter Category Chips */}
      <View style={styles.chipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {FEED_CHIPS.map((chip) => {
            const isSelected = activeChip === chip.id;
            return (
              <TouchableOpacity
                key={chip.id}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => {
                  setActiveChip(chip.id);
                  Haptics.selectionAsync();
                }}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {chip.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadPosts();
            }}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* FIT SQUAD GROUPS TAB */}
        {activeChip === 'squads' ? (
          <View style={styles.squadsList}>
            {squads.map((sq) => (
              <GlassCard key={sq.id} style={styles.squadCard} gradientBorder>
                <View style={styles.squadHeader}>
                  <View style={[styles.squadIconBox, { backgroundColor: COLORS.primaryGlow }]}>
                    <FontAwesome5 name={sq.icon as any} size={20} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.squadName}>{sq.name}</Text>
                    <Text style={styles.squadMeta}>
                      📍 {sq.location} • {sq.membersCount.toLocaleString()} members
                    </Text>
                  </View>
                  <Badge text={sq.category} variant="primary" size="sm" />
                </View>

                <TouchableOpacity
                  style={[
                    styles.joinBtn,
                    sq.joined && styles.joinedBtn,
                  ]}
                  onPress={() => handleJoinSquad(sq.id)}
                >
                  <Text style={[styles.joinBtnText, sq.joined && styles.joinedBtnText]}>
                    {sq.joined ? 'Member ✓' : 'Join FitSquad +'}
                  </Text>
                </TouchableOpacity>
              </GlassCard>
            ))}
          </View>
        ) : (
          /* STANDARD COMMUNITY FEED POSTS */
          <View style={styles.postsList}>
            {loading && posts.length === 0 ? (
              <SkeletonLoader width={width - 40} height={120} borderRadius={RADIUS.lg} />
            ) : (
              posts.map((post) => {
                const isLiked = post.likes?.includes(user?._id || 'u1');
                return (
                  <GlassCard key={post._id} style={styles.postCard}>
                    <View style={styles.postHeader}>
                      <View style={styles.postAvatar}>
                        <Text style={styles.postAvatarText}>
                          {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'U'}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.authorName}>{post.authorName || 'Navjivan Hero'}</Text>
                        <Text style={styles.postTime}>
                          {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                        </Text>
                      </View>
                      {post.category && (
                        <Badge
                          text={post.category}
                          variant={post.category === 'Smoke-Free' ? 'primary' : 'secondary'}
                          size="sm"
                        />
                      )}
                    </View>

                    <Text style={styles.postContent}>{post.content}</Text>

                    {/* Post Actions Row */}
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => handleLike(post._id)}
                      >
                        <Ionicons
                          name={isLiked ? 'heart' : 'heart-outline'}
                          size={20}
                          color={isLiked ? COLORS.danger : COLORS.textSecondary}
                        />
                        <Text style={[styles.actionText, isLiked && { color: COLORS.danger }]}>
                          {post.likes?.length || 0}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() =>
                          router.push({
                            pathname: '/community/Comments' as any,
                            params: { postId: post._id },
                          })
                        }
                      >
                        <Ionicons name="chatbubble-outline" size={18} color={COLORS.textSecondary} />
                        <Text style={styles.actionText}>{post.commentsCount || 0}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.actionItem}>
                        <Ionicons name="share-social-outline" size={18} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </GlassCard>
                );
              })
            )}
          </View>
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  title: {
    ...TYPOGRAPHY.heading2,
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  subTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  createBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsContainer: {
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  chipsScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xs + 2,
  },
  chip: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: COLORS.primaryGlow,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 60,
  },
  postsList: {
    gap: SPACING.md,
  },
  postCard: {
    padding: SPACING.md,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  postAvatar: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  postAvatarText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 15,
  },
  authorName: {
    ...TYPOGRAPHY.heading3,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  postTime: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  postContent: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
    paddingTop: SPACING.sm,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  squadsList: {
    gap: SPACING.md,
  },
  squadCard: {
    padding: SPACING.md,
  },
  squadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  squadIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squadName: {
    ...TYPOGRAPHY.heading3,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  squadMeta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  joinBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  joinedBtn: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  joinBtnText: {
    color: COLORS.bg,
    fontWeight: '800',
    fontSize: 13,
  },
  joinedBtnText: {
    color: COLORS.primary,
  },
});
