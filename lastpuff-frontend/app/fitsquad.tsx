import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  Modal,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import {
  Users,
  Search,
  Plus,
  Trophy,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Target,
  X,
  Flame,
  ChevronRight,
} from "lucide-react-native";
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOW } from "../constants/theme";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { useUser } from "../context/UserContext";
import api from "../services/api";

const { width } = Dimensions.get("window");

interface SquadItem {
  _id: string;
  name: string;
  description: string;
  members: Array<{ userId: string | any; role: string }>;
  maxMembers: number;
  goals: Array<{ title: string; targetDate: string; completionRate?: number }>;
  createdBy: { _id: string; name?: string; level?: number };
}

export default function FitSquadScreen() {
  const router = useRouter();
  const { profile } = useUser();
  const currentUserId = profile?._id;

  const [activeTab, setActiveTab] = useState<"discover" | "my">("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [squads, setSquads] = useState<SquadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Detail modal
  const [selectedSquad, setSelectedSquad] = useState<SquadItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Create squad modal
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [squadName, setSquadName] = useState("");
  const [squadDesc, setSquadDesc] = useState("");
  const [squadGoal, setSquadGoal] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchSquads = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/fitsquad");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setSquads(res.data.data);
      }
    } catch (err) {
      console.warn("Failed to fetch squads:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSquads();
  }, [fetchSquads]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSquads();
  };

  const handleJoinSquad = async (squadId: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_e) {}

    try {
      const res = await api.post(`/api/v1/fitsquad/${squadId}/join`);
      if (res.data?.success) {
        Toast.show({
          type: "success",
          text1: "Joined FitSquad!",
          text2: "You are now part of this accountability tribe.",
        });
        fetchSquads();
        if (selectedSquad && selectedSquad._id === squadId) {
          openSquadDetail(squadId);
        }
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Could not join",
        text2: err.response?.data?.error || "Already a member or squad is full.",
      });
    }
  };

  const openSquadDetail = async (squadId: string) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/api/v1/fitsquad/${squadId}`);
      if (res.data?.success && res.data.data) {
        setSelectedSquad(res.data.data);
      }
    } catch (err) {
      console.warn("Failed to load squad detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateSquad = async () => {
    if (!squadName.trim()) {
      Toast.show({ type: "error", text1: "Required", text2: "Squad name cannot be blank." });
      return;
    }

    setCreating(true);
    try {
      const res = await api.post("/api/v1/fitsquad/create", {
        name: squadName.trim(),
        description: squadDesc.trim() || "Mutual encouragement for health milestones.",
        goalTitle: squadGoal.trim() || "14-Day Smoke-Free Collective Streak",
        maxMembers: 20,
      });

      if (res.data?.success && res.data.data) {
        Toast.show({
          type: "success",
          text1: "FitSquad Created!",
          text2: "Invite friends or wait for community members to join.",
        });
        setSquadName("");
        setSquadDesc("");
        setSquadGoal("");
        setCreateModalVisible(false);
        fetchSquads();
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Creation Failed",
        text2: err.response?.data?.error || "Could not create squad.",
      });
    } finally {
      setCreating(false);
    }
  };

  const filteredSquads = squads.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());

    const isMember = s.members.some(
      (m) =>
        (typeof m.userId === "string" ? m.userId : m.userId?._id) === currentUserId
    );

    if (activeTab === "my") return matchesSearch && isMember;
    return matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color={COLORS.textPrimary} />
        </Pressable>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>FitSquads</Text>
          <Text style={styles.headerSubtitle}>Community Accountability Groups</Text>
        </View>

        <Pressable
          onPress={() => setCreateModalVisible(true)}
          style={styles.createBtn}
          accessibilityRole="button"
          accessibilityLabel="Create squad"
        >
          <Plus size={20} color={COLORS.primary} />
        </Pressable>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Search size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search squads by name or goal..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")} accessibilityRole="button">
            <X size={16} color={COLORS.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabsRow}>
        <Pressable
          onPress={() => setActiveTab("discover")}
          style={[styles.tabBtn, activeTab === "discover" && styles.tabBtnActive]}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === "discover" && styles.tabBtnTextActive,
            ]}
          >
            Discover Tribes
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("my")}
          style={[styles.tabBtn, activeTab === "my" && styles.tabBtnActive]}
          accessibilityRole="button"
        >
          <Text
            style={[styles.tabBtnText, activeTab === "my" && styles.tabBtnTextActive]}
          >
            My Squads
          </Text>
        </Pressable>
      </View>

      {/* Main Squads Feed */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Gathering tribe networks...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSquads}
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
          ListEmptyComponent={
            <EmptyState
              title={activeTab === "my" ? "No Joined Squads" : "No Squads Found"}
              description={
                activeTab === "my"
                  ? "You haven't joined any squads yet. Discover open squads or launch your own!"
                  : "Try searching with a different keyword or create the first community squad."
              }
              icon={<Users size={48} color={COLORS.primary} />}
              actionTitle="Create a Squad"
              onAction={() => setCreateModalVisible(true)}
              style={{ marginTop: SPACING.xl }}
            />
          }
          renderItem={({ item }) => {
            const isMember = item.members.some(
              (m) =>
                (typeof m.userId === "string" ? m.userId : m.userId?._id) === currentUserId
            );
            const memberCount = item.members?.length || 1;
            const primaryGoal = item.goals?.[0]?.title || "Daily Resilience Target";

            return (
              <Card
                style={styles.squadCard}
                elevation="medium"
                onPress={() => openSquadDetail(item._id)}
              >
                <View style={styles.squadTop}>
                  <View style={styles.squadIconBox}>
                    <Users size={22} color={COLORS.primary} />
                  </View>

                  <View style={styles.squadMeta}>
                    <Text style={styles.squadName}>{item.name}</Text>
                    <Text style={styles.squadMembers}>
                      {memberCount} / {item.maxMembers || 20} Warriors
                    </Text>
                  </View>

                  {isMember ? (
                    <View style={styles.joinedPill}>
                      <CheckCircle2 size={14} color={COLORS.primary} />
                      <Text style={styles.joinedPillText}>Joined</Text>
                    </View>
                  ) : (
                    <Button
                      title="Join"
                      variant="primary"
                      size="sm"
                      onPress={() => handleJoinSquad(item._id)}
                    />
                  )}
                </View>

                <Text style={styles.squadDesc} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.goalPillRow}>
                  <Target size={14} color={COLORS.secondary} />
                  <Text style={styles.goalPillText} numberOfLines={1}>
                    {primaryGoal}
                  </Text>
                </View>
              </Card>
            );
          }}
        />
      )}

      {/* Squad Detail Modal */}
      <Modal visible={!!selectedSquad} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <Card style={styles.detailModal} elevation="high">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedSquad?.name}</Text>
              <Pressable
                onPress={() => setSelectedSquad(null)}
                style={styles.modalClose}
                accessibilityRole="button"
              >
                <X size={20} color={COLORS.textSecondary} />
              </Pressable>
            </View>

            <Text style={styles.detailDesc}>{selectedSquad?.description}</Text>

            {/* Goal Card */}
            <View style={styles.detailGoalCard}>
              <View style={styles.goalHeader}>
                <Target size={18} color={COLORS.primary} />
                <Text style={styles.goalHeading}>Shared Mission</Text>
              </View>
              <Text style={styles.goalTitleText}>
                {selectedSquad?.goals?.[0]?.title || "Consistent Smoke-Free Sprint"}
              </Text>
            </View>

            {/* Members Section */}
            <Text style={styles.membersHeading}>
              Warriors ({selectedSquad?.members?.length || 0})
            </Text>
            <FlatList
              data={selectedSquad?.members || []}
              keyExtractor={(m, idx) => idx.toString()}
              style={{ maxHeight: 200, marginBottom: SPACING.lg }}
              renderItem={({ item }) => {
                const memberObj = typeof item.userId === "object" ? item.userId : null;
                const mName = memberObj?.name || "Warrior";
                const mLevel = memberObj?.level || 1;
                const mStreak = memberObj?.streak || 0;

                return (
                  <View style={styles.memberRow}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>{mName.charAt(0)}</Text>
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{mName}</Text>
                      <Text style={styles.memberSub}>
                        Level {mLevel} • {mStreak} Day Streak
                      </Text>
                    </View>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleBadgeText}>{item.role}</Text>
                    </View>
                  </View>
                );
              }}
            />

            {/* Join / Close Actions */}
            {selectedSquad &&
              !selectedSquad.members.some(
                (m) =>
                  (typeof m.userId === "string" ? m.userId : m.userId?._id) ===
                  currentUserId
              ) && (
                <Button
                  title="Join This FitSquad"
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={() => handleJoinSquad(selectedSquad._id)}
                  style={{ marginBottom: SPACING.sm }}
                />
              )}

            <Button
              title="Close"
              variant="outline"
              size="md"
              fullWidth
              onPress={() => setSelectedSquad(null)}
            />
          </Card>
        </View>
      </Modal>

      {/* Create Squad Modal */}
      <Modal visible={createModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <Card style={styles.detailModal} elevation="high">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New FitSquad</Text>
              <Pressable
                onPress={() => setCreateModalVisible(false)}
                style={styles.modalClose}
                accessibilityRole="button"
              >
                <X size={20} color={COLORS.textSecondary} />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>SQUAD NAME</Text>
            <TextInput
              style={styles.inputField}
              placeholder="e.g. Bengaluru Smoke-Free Striders"
              placeholderTextColor={COLORS.textMuted}
              value={squadName}
              onChangeText={setSquadName}
            />

            <Text style={styles.inputLabel}>MISSION / DESCRIPTION</Text>
            <TextInput
              style={[styles.inputField, { height: 75, textAlignVertical: "top" }]}
              placeholder="What motivates your group? e.g. Daily accountability for quitting tobacco."
              placeholderTextColor={COLORS.textMuted}
              multiline
              value={squadDesc}
              onChangeText={setSquadDesc}
            />

            <Text style={styles.inputLabel}>SHARED CHALLENGE GOAL</Text>
            <TextInput
              style={styles.inputField}
              placeholder="e.g. 14 Days Smoke-Free Collective Streak"
              placeholderTextColor={COLORS.textMuted}
              value={squadGoal}
              onChangeText={setSquadGoal}
            />

            <View style={styles.createActionsRow}>
              <Button
                title="Cancel"
                variant="outline"
                size="md"
                onPress={() => setCreateModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={creating ? "Creating..." : "Create Squad"}
                variant="primary"
                size="md"
                onPress={handleCreateSquad}
                disabled={creating || !squadName.trim()}
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
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  headerTitleBox: {
    alignItems: "center",
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
  createBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  tabsRow: {
    flexDirection: "row",
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  tabBtnTextActive: {
    color: COLORS.textInverse,
  },
  centerLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.md,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  listContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  squadCard: {
    padding: SPACING.md,
  },
  squadTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.xs,
  },
  squadIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryDim,
    alignItems: "center",
    justifyContent: "center",
  },
  squadMeta: {
    flex: 1,
  },
  squadName: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  squadMembers: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  joinedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryDim,
  },
  joinedPillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 10,
  },
  squadDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  goalPillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceElevated,
    alignSelf: "flex-start",
  },
  goalPillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondary,
    fontWeight: "600",
    fontSize: 11,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  detailModal: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    maxHeight: "85%",
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
  detailDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  detailGoalCard: {
    backgroundColor: COLORS.surfaceElevated,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  goalHeading: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  goalTitleText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  membersHeading: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryDim,
    alignItems: "center",
    justifyContent: "center",
  },
  memberAvatarText: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
    fontWeight: "700",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    ...TYPOGRAPHY.body,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  memberSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceElevated,
  },
  roleBadgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
  },
  inputLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  inputField: {
    backgroundColor: COLORS.surfaceElevated,
    color: COLORS.textPrimary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: SPACING.md,
  },
  createActionsRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
});
