import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  RefreshControl,
  TextInput,
  Modal,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Users,
  Trophy,
  Sparkles,
  Flame,
  X,
  ChevronRight,
  ShieldCheck,
  Award,
} from "lucide-react-native";
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOW } from "../../constants/theme";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { useUser } from "../../context/UserContext";
import api from "../../services/api";

const { width } = Dimensions.get("window");

interface PostItem {
  _id: string;
  author: {
    _id: string;
    name?: string;
    email?: string;
  };
  content: string;
  likes: string[];
  commentsCount?: number;
  createdAt: string;
  userType?: "smoker" | "non-smoker";
  postType?: "text" | "achievement" | "milestone" | "challenge";
  isLiked?: boolean;
}

const TABS = [
  { id: "all", label: "All Feeds" },
  { id: "smoker", label: "Smokers" },
  { id: "non-smoker", label: "Fitness" },
  { id: "achievement", label: "Achievements" },
];

export default function ExploreScreen() {
  const router = useRouter();
  const { userType, profile } = useUser();

  const [activeTab, setActiveTab] = useState("all");
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Create post modal
  const [modalVisible, setModalVisible] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [selectedPostType, setSelectedPostType] = useState<"text" | "achievement" | "milestone">("text");
  const [publishing, setPublishing] = useState(false);

  const fetchPosts = useCallback(async (tab = activeTab) => {
    try {
      let query = "";
      if (tab === "smoker" || tab === "non-smoker") {
        query = `?userType=${tab}`;
      } else if (tab === "achievement") {
        query = `?postType=achievement`;
      }

      const res = await api.get(`/api/v1/community/posts${query}`);
      if (res.data?.success && Array.isArray(res.data.posts)) {
        setPosts(res.data.posts);
      }
    } catch (err) {
      console.warn("Failed to fetch community posts:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchPosts(activeTab);
  }, [activeTab, fetchPosts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handleTabChange = (tabId: string) => {
    try {
      Haptics.selectionAsync();
    } catch (_e) {}
    setActiveTab(tabId);
    setLoading(true);
  };

  const handleToggleLike = async (postId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_e) {}

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id === postId) {
          const currentlyLiked = p.isLiked;
          const currentCount = p.likes?.length || 0;
          return {
            ...p,
            isLiked: !currentlyLiked,
            likes: currentlyLiked
              ? p.likes.slice(0, Math.max(0, currentCount - 1))
              : [...(p.likes || []), "me"],
          };
        }
        return p;
      })
    );

    try {
      await api.post(`/api/v1/community/posts/${postId}/like`);
    } catch (err) {
      console.warn("Failed to toggle like on server:", err);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      Toast.show({ type: "error", text1: "Content Required", text2: "Please write something to share." });
      return;
    }

    setPublishing(true);
    try {
      const res = await api.post("/api/v1/community/posts", {
        content: postContent.trim(),
        postType: selectedPostType,
        userType: userType || "smoker",
      });

      if (res.data?.success && res.data.post) {
        const createdPost: PostItem = {
          ...res.data.post,
          author: {
            _id: profile?._id || "me",
            name: profile?.name || "Me",
          },
          likes: [],
          isLiked: false,
          commentsCount: 0,
        };

        setPosts((prev) => [createdPost, ...prev]);
        setPostContent("");
        setModalVisible(false);

        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (_e) {}

        Toast.show({
          type: "success",
          text1: "Published!",
          text2: "Your victory was shared with the community.",
        });
      }
    } catch (err) {
      console.warn("Create post error:", err);
      Toast.show({ type: "error", text1: "Submission Failed", text2: "Could not publish post." });
    } finally {
      setPublishing(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diffMs / (1000 * 60));
      if (mins < 60) return `${Math.max(1, mins)}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    } catch (_e) {
      return "recently";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Community Tribe</Text>
          <Text style={styles.headerSubtitle}>Shared Accountability & Triumphs</Text>
        </View>

        <Pressable
          onPress={() => router.push("/fitsquad" as any)}
          style={styles.squadsButton}
          accessibilityRole="button"
          accessibilityLabel="Open FitSquads"
        >
          <Users size={16} color={COLORS.primary} />
          <Text style={styles.squadsBtnText}>FitSquads</Text>
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsBar}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => handleTabChange(tab.id)}
            style={[styles.tabChip, activeTab === tab.id && styles.tabChipActive]}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.tabChipText,
                activeTab === tab.id && styles.tabChipTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingLabel}>Loading community discussions...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          ListHeaderComponent={
            <Card
              style={styles.bannerCard}
              elevation="low"
              onPress={() => router.push("/fitsquad" as any)}
            >
              <View style={styles.bannerRow}>
                <View style={styles.bannerIconBox}>
                  <Trophy size={24} color={COLORS.primary} />
                </View>
                <View style={styles.bannerText}>
                  <Text style={styles.bannerTitle}>Join a FitSquad Tribe</Text>
                  <Text style={styles.bannerDesc}>
                    Compete in daily step challenges and smoke-free streaks with local warriors.
                  </Text>
                </View>
                <ChevronRight size={20} color={COLORS.textMuted} />
              </View>
            </Card>
          }
          ListEmptyComponent={
            <EmptyState
              title="No Posts in this Tab"
              description="Be the first to share an update, milestone, or craving victory with fellow warriors!"
              icon={<Sparkles size={48} color={COLORS.primary} />}
              actionTitle="Share a Victory"
              onAction={() => setModalVisible(true)}
              style={{ marginTop: SPACING.xl }}
            />
          }
          renderItem={({ item }) => {
            const authorName = item.author?.name || "Community Warrior";
            const initials = authorName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const isSmokerPost = item.userType !== "non-smoker";

            return (
              <Card style={styles.postCard} elevation="medium">
                {/* Author Info */}
                <View style={styles.authorRow}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitials}>{initials}</Text>
                  </View>

                  <View style={styles.authorMeta}>
                    <View style={styles.authorTitleRow}>
                      <Text style={styles.authorName}>{authorName}</Text>
                      <View
                        style={[
                          styles.badgePill,
                          {
                            backgroundColor: isSmokerPost
                              ? COLORS.primaryDim
                              : COLORS.secondaryDim,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgePillText,
                            {
                              color: isSmokerPost
                                ? COLORS.primary
                                : COLORS.secondary,
                            },
                          ]}
                        >
                          {isSmokerPost ? "Smoke-Free" : "Fitness"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.postTime}>{formatTimeAgo(item.createdAt)}</Text>
                  </View>
                </View>

                {/* Content */}
                <Text style={styles.postBody}>{item.content}</Text>

                {/* Interaction Footer */}
                <View style={styles.postFooter}>
                  <Pressable
                    onPress={() => handleToggleLike(item._id)}
                    style={styles.actionBtn}
                    accessibilityRole="button"
                    accessibilityLabel={`Like post. Currently ${item.likes?.length || 0} likes`}
                  >
                    <Heart
                      size={18}
                      color={item.isLiked ? COLORS.error : COLORS.textMuted}
                      fill={item.isLiked ? COLORS.error : "transparent"}
                    />
                    <Text
                      style={[
                        styles.actionCount,
                        item.isLiked && { color: COLORS.error, fontWeight: "700" },
                      ]}
                    >
                      {item.likes?.length || 0}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.actionBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Comments"
                  >
                    <MessageCircle size={18} color={COLORS.textMuted} />
                    <Text style={styles.actionCount}>{item.commentsCount || 0}</Text>
                  </Pressable>

                  <Pressable
                    style={styles.actionBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Share post"
                  >
                    <Share2 size={18} color={COLORS.textMuted} />
                  </Pressable>
                </View>
              </Card>
            );
          }}
        />
      )}

      {/* Floating Action Button */}
      <Pressable
        onPress={() => setModalVisible(true)}
        style={styles.fab}
        accessibilityRole="button"
        accessibilityLabel="Create a new post"
      >
        <Plus size={26} color={COLORS.textInverse} />
      </Pressable>

      {/* Create Post Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <Card style={styles.createPostModal} elevation="high">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share with Tribe</Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={styles.modalClose}
                accessibilityRole="button"
              >
                <X size={20} color={COLORS.textSecondary} />
              </Pressable>
            </View>

            {/* Type selector */}
            <View style={styles.typeSelectorRow}>
              {(["text", "achievement", "milestone"] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setSelectedPostType(t)}
                  style={[
                    styles.typeChip,
                    selectedPostType === t && styles.typeChipActive,
                  ]}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      selectedPostType === t && styles.typeChipTextActive,
                    ]}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={styles.postTextInput}
              placeholder="What craving did you beat or milestone did you hit today? Inspire the tribe..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={5}
              value={postContent}
              onChangeText={setPostContent}
            />

            <View style={styles.createModalActions}>
              <Button
                title="Cancel"
                variant="outline"
                size="md"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={publishing ? "Publishing..." : "Publish Post"}
                variant="primary"
                size="md"
                onPress={handleCreatePost}
                disabled={publishing || !postContent.trim()}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    backgroundColor: COLORS.surface,
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
  squadsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  squadsBtnText: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
    fontSize: 12,
  },
  tabsBar: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  tabChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  tabChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  tabChipTextActive: {
    color: COLORS.textInverse,
  },
  centerLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.md,
  },
  loadingLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  listContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
    paddingBottom: 90,
  },
  bannerCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  bannerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  bannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryDim,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  bannerDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  postCard: {
    padding: SPACING.md,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
    fontWeight: "700",
  },
  authorMeta: {
    flex: 1,
  },
  authorTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  authorName: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  badgePillText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: "700",
  },
  postTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  postBody: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  postFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xl,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  actionCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: SPACING.lg,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW.lg,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  createPostModal: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  modalClose: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  typeSelectorRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  typeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  typeChipTextActive: {
    color: COLORS.textInverse,
  },
  postTextInput: {
    backgroundColor: COLORS.surfaceElevated,
    color: COLORS.textPrimary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: SPACING.lg,
  },
  createModalActions: {
    flexDirection: "row",
    gap: SPACING.md,
  },
});
