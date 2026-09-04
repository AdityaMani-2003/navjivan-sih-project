// app/(tabs)/explore.tsx

import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LPColors } from "../../constants/theme";
import PostCard from "../../components/PostCard";
import SkeletonLoader from "../../components/SkeletonLoader";
import {
  fetchFeed,
  fetchMyPosts,
  toggleLike,
  deletePost,
} from "../../services/posts";
import { Post } from "../../types/post";
import { AuthContext } from "../../context/AuthContext";

export default function ExploreScreen() {
  const auth: any = useContext(AuthContext);
  const user = auth?.user;
  const router = useRouter();
  const params = useLocalSearchParams();

  const [tab, setTab] = useState<"all" | "mine">("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load posts
  const loadPosts = async () => {
    try {
      if (!user?._id) return;
      setLoading(true);

      if (tab === "all") {
        const res = await fetchFeed();
        setPosts(res.data.posts || []);
      } else {
        const res = await fetchMyPosts(user._id);
        setPosts(res.data.posts || []);
      }
    } catch (err) {
      console.log("Feed error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load when tab changes
  useEffect(() => {
    loadPosts();
  }, [tab, user]);

  // Only refresh ONCE when coming back from comments
  useEffect(() => {
    if (params.refresh === "1") {
      loadPosts();
      router.replace("/(tabs)/explore");
    }
  }, [params.refresh]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const handleLike = async (postId: string) => {
    await toggleLike(postId);
    loadPosts();
  };

  const handleComment = (postId: string) => {
    router.push({
      pathname: "/community/Comments",
      params: { postId },
    });
  };

  const handleDelete = async (postId: string) => {
    await deletePost(postId);
    loadPosts();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Community Tribe</Text>
          <Text style={styles.subTitle}>Real people quitting together</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/community/AddPost")}
        >
          <Ionicons name="add" size={18} color="#000000" />
          <Text style={styles.addButtonText}>Share Win</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => setTab("all")}
          style={[styles.tab, tab === "all" && styles.tabActive]}
        >
          <Text style={tab === "all" ? styles.tabTextActive : styles.tabText}>
            All Posts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab("mine")}
          style={[styles.tab, tab === "mine" && styles.tabActive]}
        >
          <Text style={tab === "mine" ? styles.tabTextActive : styles.tabText}>
            My Posts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Feed List */}
      <ScrollView
        style={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#39FF14"
            colors={["#39FF14"]}
          />
        }
      >
        {loading && posts.length === 0 ? (
          <View style={{ gap: 16 }}>
            <SkeletonLoader height={180} borderRadius={16} />
            <SkeletonLoader height={240} borderRadius={16} />
            <SkeletonLoader height={140} borderRadius={16} />
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔥</Text>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to share your journey, log a craving win, or inspire a fellow quitter!
            </Text>
            <TouchableOpacity
              style={styles.createPostBtn}
              onPress={() => router.push("/community/AddPost")}
            >
              <Text style={styles.createPostBtnText}>Create First Post</Text>
            </TouchableOpacity>
          </View>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onDelete={handleDelete}
              isOwn={post.author?._id === user?._id}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LPColors.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#141414",
  },
  title: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  subTitle: { color: "#888888", fontSize: 12, marginTop: 2 },
  addButton: {
    backgroundColor: LPColors.neon,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    color: "#000000",
    fontWeight: "700",
    fontSize: 13,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#161616",
  },
  tab: { paddingHorizontal: 14, paddingVertical: 10, marginRight: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: LPColors.neon },
  tabText: { color: LPColors.gray, fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: LPColors.neon, fontWeight: "700", fontSize: 14 },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  emptySubtitle: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  createPostBtn: {
    backgroundColor: LPColors.neon,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  createPostBtnText: {
    color: "#000000",
    fontWeight: "700",
    fontSize: 15,
  },
});
