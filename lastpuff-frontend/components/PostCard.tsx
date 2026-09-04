// components/PostCard.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LPColors } from "../constants/theme";
import { Post } from "../types/post";

dayjs.extend(relativeTime);

const screenW = Dimensions.get("window").width;

type Props = {
  post: Post;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onDelete?: (id: string) => void;
  isOwn?: boolean;
};

export default function PostCard({ post, onLike, onComment, onDelete, isOwn }: Props) {
  const relativeDate = post.createdAt ? dayjs(post.createdAt).fromNow() : "Just now";

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>
            {post.author?.name?.charAt(0)?.toUpperCase() || "U"}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{post.author?.name || "Community Member"}</Text>
          <Text style={styles.time}>{relativeDate}</Text>
        </View>
        {isOwn && onDelete ? (
          <TouchableOpacity onPress={() => onDelete(post._id)} style={{ padding: 4 }}>
            <Ionicons name="trash-outline" size={20} color={LPColors.gray} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Content */}
      {post.content ? <Text style={styles.content}>{post.content}</Text> : null}

      {/* Image (if exists) */}
      {post.images?.length > 0 ? (
        <Image
          source={{ uri: post.images[0].url }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : null}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.action} onPress={() => onLike(post._id)}>
          <Ionicons
            name={post.isLiked ? "heart" : "heart-outline"}
            size={20}
            color={post.isLiked ? LPColors.neon : LPColors.gray}
          />
          <Text style={[styles.actionText, post.isLiked && { color: LPColors.neon }]}>
            {post.likesCount || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action} onPress={() => onComment(post._id)}>
          <Ionicons name="chatbubble-outline" size={20} color={LPColors.gray} />
          <Text style={styles.actionText}>{post.commentsCount || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: LPColors.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: LPColors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(57, 255, 20, 0.15)",
    borderColor: "#39FF14",
    borderWidth: 1.5,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#39FF14",
    fontWeight: "800",
    fontSize: 16,
  },
  name: {
    color: LPColors.text,
    fontWeight: "700",
    fontSize: 15,
  },
  time: {
    color: LPColors.gray,
    fontSize: 12,
    marginTop: 2,
  },
  image: {
    width: screenW - 32,
    height: (screenW - 32) * 0.66,
    alignSelf: "center",
    backgroundColor: "#161616",
    marginBottom: 4,
  },
  content: {
    color: LPColors.text,
    paddingHorizontal: 14,
    paddingBottom: 10,
    lineHeight: 21,
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#1A1A1A",
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  actionText: {
    color: LPColors.gray,
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
  },
});
