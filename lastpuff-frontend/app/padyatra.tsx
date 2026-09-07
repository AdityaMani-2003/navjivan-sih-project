import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import ConfettiCannon from "react-native-confetti-cannon";
import {
  Footprints,
  MapPin,
  Compass,
  Trophy,
  Award,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowLeft,
  Flame,
  ChevronRight,
  Info,
} from "lucide-react-native";
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOW } from "../constants/theme";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ProgressBar from "../components/ui/ProgressBar";
import { useUser } from "../context/UserContext";
import api from "../services/api";

const { width } = Dimensions.get("window");

interface Landmark {
  id: string;
  name: string;
  distanceKm: number;
  description: string;
  culturalNote: string;
}

interface RouteConfig {
  id: string;
  title: string;
  totalKm: number;
  subtitle: string;
  landmarks: Landmark[];
}

const ROUTES: RouteConfig[] = [
  {
    id: "dandi_march",
    title: "Dandi March",
    totalKm: 390,
    subtitle: "Ahmedabad to Dandi Seashore • 1930 Freedom Trail",
    landmarks: [
      {
        id: "d1",
        name: "Sabarmati Ashram",
        distanceKm: 0,
        description: "The spiritual nerve-center of Mahatma Gandhi's non-violent resistance.",
        culturalNote: "Thousands gathered before dawn on March 12, 1930 to commence the 241-mile march.",
      },
      {
        id: "d2",
        name: "Aslali Village",
        distanceKm: 19,
        description: "The first evening halt of the Satyagrahis.",
        culturalNote: "Villagers swept dusty roads with neem branches and served fresh buttermilk.",
      },
      {
        id: "d3",
        name: "Nadiad",
        distanceKm: 56,
        description: "Historic trade crossroad of central Gujarat.",
        culturalNote: "Over 40,000 citizens flooded the town square to pledge support for self-reliance.",
      },
      {
        id: "d4",
        name: "Anand",
        distanceKm: 85,
        description: "Agricultural heartland and symbol of cooperative endurance.",
        culturalNote: "Gandhi addressed youth leaders under banyan trees, urging mental fortitude over cravings.",
      },
      {
        id: "d5",
        name: "Navsari",
        distanceKm: 340,
        description: "The gateway to the Arabian Sea coastline.",
        culturalNote: "The final staging ground where volunteers prepared for the decisive salt levy protest.",
      },
      {
        id: "d6",
        name: "Dandi Seashore",
        distanceKm: 385,
        description: "The ocean beach where Gandhi broke the salt tax.",
        culturalNote: "A single pinch of natural sea salt symbolized the unstoppable will of millions.",
      },
    ],
  },
  {
    id: "golden_triangle",
    title: "Golden Triangle",
    totalKm: 735,
    subtitle: "Delhi • Agra • Jaipur Heritage Circuit",
    landmarks: [
      {
        id: "g1",
        name: "Red Fort, Delhi",
        distanceKm: 0,
        description: "Mughal citadel and historic declaration ground.",
        culturalNote: "Architectural masterpiece of red sandstone standing along the Yamuna bank.",
      },
      {
        id: "g2",
        name: "Mathura Krishna Janmabhoomi",
        distanceKm: 160,
        description: "Ancient temple city on the banks of Yamuna.",
        culturalNote: "One of India's oldest continuously inhabited sacred pilgrimage centers.",
      },
      {
        id: "g3",
        name: "Taj Mahal, Agra",
        distanceKm: 210,
        description: "UNESCO World Heritage wonder of ivory-white marble.",
        culturalNote: "Constructed between 1631 and 1648, showcasing symmetrical Islamic geometry.",
      },
      {
        id: "g4",
        name: "Fatehpur Sikri",
        distanceKm: 245,
        description: "Imperial ghost city founded by Emperor Akbar.",
        culturalNote: "Buland Darwaza rises 54 meters high as a beacon of unity across faiths.",
      },
      {
        id: "g5",
        name: "Hawa Mahal, Jaipur",
        distanceKm: 480,
        description: "The Palace of Winds with 953 honeycomb windows.",
        culturalNote: "Designed to channel natural air cooling through intricate pink lattice work.",
      },
      {
        id: "g6",
        name: "Amber Fort",
        distanceKm: 735,
        description: "Majestic hilltop fort of the Kachwaha clan.",
        culturalNote: "Home to the Sheesh Mahal (Mirror Palace) overlooking the Maota Lake.",
      },
    ],
  },
  {
    id: "kashi_corridor",
    title: "Kashi Corridor",
    totalKm: 84,
    subtitle: "Varanasi • Sarnath • Chunar Sacred Walk",
    landmarks: [
      {
        id: "k1",
        name: "Kashi Vishwanath Ghat",
        distanceKm: 0,
        description: "The spiritual epicenter along the eternal Ganges.",
        culturalNote: "Marked by morning aarti ceremonies that have echoed across ghats for millennia.",
      },
      {
        id: "k2",
        name: "Dashashwamedh Ghat",
        distanceKm: 4,
        description: "The grandest riverfront gathering terrace in Varanasi.",
        culturalNote: "Known for the evening Ganga Aarti illuminated by towering brass lamps.",
      },
      {
        id: "k3",
        name: "Sarnath Dhamek Stupa",
        distanceKm: 14,
        description: "Where Lord Buddha gave his first sermon on the Eightfold Path.",
        culturalNote: "The birthplace of mindfulness, breath regulation, and sensory mastery.",
      },
      {
        id: "k4",
        name: "Ramnagar Fort",
        distanceKm: 28,
        description: "18th-century sandstone fortress on the eastern Ganges bank.",
        culturalNote: "Preserves ancient astronomical clocks and medieval handwritten manuscripts.",
      },
      {
        id: "k5",
        name: "Vindhyachal Shrine",
        distanceKm: 70,
        description: "Sacred foothill crossing where the Vindhya ranges meet the plains.",
        culturalNote: "Traditional rest stop for pilgrims crossing the northern heartland.",
      },
      {
        id: "k6",
        name: "Chunar Fort",
        distanceKm: 84,
        description: "Historic cliff bastion overlooking the Ganges bend.",
        culturalNote: "Legendary stronghold associated with King Vikramaditya and Sher Shah Suri.",
      },
    ],
  },
];

export default function PadyatraScreen() {
  const router = useRouter();
  const { addXP } = useUser();

  const [activeRouteId, setActiveRouteId] = useState("dandi_march");
  const [totalKm, setTotalKm] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);

  const activeRoute = ROUTES.find((r) => r.id === activeRouteId) || ROUTES[0];

  const fetchRouteProgress = useCallback(async (routeId = activeRouteId) => {
    try {
      const res = await api.get(`/api/v1/steps/padyatra?route=${routeId}`);
      if (res.data?.success && res.data.data) {
        const km = res.data.data.totalKm || 0;
        setTotalKm(km);
        setProgress(res.data.data.progress || 0);
      }
    } catch (err) {
      console.warn("Failed to fetch padyatra progress:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeRouteId]);

  useEffect(() => {
    fetchRouteProgress(activeRouteId);
  }, [activeRouteId, fetchRouteProgress]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRouteProgress();
  };

  const handleSyncSteps = async (stepsToAdd: number) => {
    setSyncing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_e) {}

    try {
      const res = await api.post("/api/v1/steps/sync", {
        steps: stepsToAdd,
        route: activeRouteId,
      });

      if (res.data?.success) {
        const newKm = res.data.data.totalKmWalked || totalKm + stepsToAdd * 0.0008;
        const prevKm = totalKm;
        setTotalKm(newKm);
        setProgress(Math.min(1, newKm / activeRoute.totalKm));

        // Award XP
        const xpEarned = Math.floor(stepsToAdd / 50);
        addXP(xpEarned);

        // Check if unlocked a new landmark
        const unlockedNew = activeRoute.landmarks.some(
          (l) => l.distanceKm > prevKm && l.distanceKm <= newKm
        );

        if (unlockedNew) {
          setShowConfetti(true);
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (_e) {}
          Toast.show({
            type: "success",
            text1: "🏛️ Landmark Unlocked!",
            text2: `You reached a new heritage milestone! +${xpEarned} XP earned.`,
          });
        } else {
          Toast.show({
            type: "success",
            text1: `+${stepsToAdd.toLocaleString()} Steps Synced!`,
            text2: `Advanced ${(stepsToAdd * 0.0008).toFixed(2)} km on ${activeRoute.title}.`,
          });
        }
      }
    } catch (err) {
      console.warn("Sync steps error:", err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {showConfetti && (
        <ConfettiCannon
          count={70}
          origin={{ x: width / 2, y: -20 }}
          fadeOut={true}
          fallSpeed={3000}
        />
      )}

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
          <Text style={styles.headerTitle}>Padyatra Virtual Pilgrimage</Text>
          <Text style={styles.headerSubtitle}>Steps Converted into Heritage Journeys</Text>
        </View>

        <View style={styles.placeholderBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Route Selector Tabs */}
        <View style={styles.routeSelector}>
          {ROUTES.map((route) => {
            const isActive = route.id === activeRouteId;
            return (
              <Pressable
                key={route.id}
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch (_e) {}
                  setActiveRouteId(route.id);
                  setLoading(true);
                }}
                style={[styles.routeTab, isActive && styles.routeTabActive]}
                accessibilityRole="button"
              >
                <Text
                  style={[styles.routeTabText, isActive && styles.routeTabTextActive]}
                >
                  {route.title}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Syncing pilgrimage telemetry...</Text>
          </View>
        ) : (
          <>
            {/* Route Hero Card */}
            <Card style={styles.heroCard} elevation="medium">
              <View style={styles.heroTopRow}>
                <View style={styles.routePill}>
                  <Compass size={14} color={COLORS.primary} />
                  <Text style={styles.routePillText}>VIRTUAL EXPEDITION</Text>
                </View>
                <Text style={styles.kmBadge}>
                  {totalKm.toFixed(1)} / {activeRoute.totalKm} km
                </Text>
              </View>

              <Text style={styles.heroTitle}>{activeRoute.title}</Text>
              <Text style={styles.heroSubtitle}>{activeRoute.subtitle}</Text>

              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Expedition Progress</Text>
                  <Text style={styles.progressValue}>
                    {Math.round(progress * 100)}%
                  </Text>
                </View>
                <ProgressBar
                  progress={progress}
                  color={COLORS.primary}
                  height={8}
                />
              </View>

              <View style={styles.statPillsRow}>
                <View style={styles.statPillItem}>
                  <Footprints size={16} color={COLORS.primary} />
                  <Text style={styles.statPillText}>
                    {Math.round(totalKm * 1250).toLocaleString()} Steps Walked
                  </Text>
                </View>
                <View style={styles.statPillDivider} />
                <View style={styles.statPillItem}>
                  <Award size={16} color={COLORS.secondary} />
                  <Text style={styles.statPillText}>
                    {
                      activeRoute.landmarks.filter((l) => totalKm >= l.distanceKm)
                        .length
                    }{" "}
                    / {activeRoute.landmarks.length} Milestones
                  </Text>
                </View>
              </View>
            </Card>

            {/* Sync Steps Dock */}
            <Card style={styles.syncCard} elevation="low">
              <Text style={styles.syncHeading}>Log Daily Walking Activity</Text>
              <Text style={styles.syncDesc}>
                Sync steps from your daily walk to advance along the historic route.
              </Text>
              <View style={styles.syncButtonsRow}>
                <Button
                  title="+1,000 Steps"
                  variant="outline"
                  size="sm"
                  onPress={() => handleSyncSteps(1000)}
                  disabled={syncing}
                  style={{ flex: 1 }}
                />
                <Button
                  title="+3,000 Steps"
                  variant="outline"
                  size="sm"
                  onPress={() => handleSyncSteps(3000)}
                  disabled={syncing}
                  style={{ flex: 1 }}
                />
                <Button
                  title="+5,000 Steps"
                  variant="primary"
                  size="sm"
                  onPress={() => handleSyncSteps(5000)}
                  disabled={syncing}
                  style={{ flex: 1 }}
                />
              </View>
            </Card>

            {/* Landmark Timeline */}
            <View style={styles.timelineSection}>
              <Text style={styles.timelineTitle}>Route Milestones</Text>

              <View style={styles.timelineList}>
                {activeRoute.landmarks.map((landmark, idx) => {
                  const isUnlocked = totalKm >= landmark.distanceKm;
                  const isNext =
                    !isUnlocked &&
                    (idx === 0 || totalKm >= activeRoute.landmarks[idx - 1].distanceKm);

                  return (
                    <Card
                      key={landmark.id}
                      style={[
                        styles.landmarkCard,
                        isUnlocked && styles.landmarkCardUnlocked,
                        isNext && styles.landmarkCardNext,
                      ]}
                      elevation="low"
                      onPress={() => setSelectedLandmark(landmark)}
                    >
                      <View style={styles.landmarkRow}>
                        <View
                          style={[
                            styles.landmarkIconBox,
                            isUnlocked
                              ? { backgroundColor: COLORS.primaryDim }
                              : { backgroundColor: COLORS.surfaceElevated },
                          ]}
                        >
                          {isUnlocked ? (
                            <CheckCircle2 size={22} color={COLORS.primary} />
                          ) : (
                            <Lock size={20} color={COLORS.textMuted} />
                          )}
                        </View>

                        <View style={styles.landmarkMeta}>
                          <View style={styles.landmarkTitleRow}>
                            <Text
                              style={[
                                styles.landmarkName,
                                !isUnlocked && { color: COLORS.textSecondary },
                              ]}
                            >
                              {landmark.name}
                            </Text>
                            <Text style={styles.distanceText}>
                              {landmark.distanceKm} km
                            </Text>
                          </View>
                          <Text style={styles.landmarkDesc} numberOfLines={2}>
                            {landmark.description}
                          </Text>
                        </View>

                        <ChevronRight size={18} color={COLORS.textMuted} />
                      </View>
                    </Card>
                  );
                })}
              </View>
            </View>

            {/* Milestone Detail Card (when clicked) */}
            {selectedLandmark && (
              <Card style={styles.detailCard} elevation="medium">
                <View style={styles.detailHeader}>
                  <View style={styles.detailTitleBox}>
                    <Text style={styles.detailKicker}>HISTORIC DISPATCH</Text>
                    <Text style={styles.detailTitle}>{selectedLandmark.name}</Text>
                    <Text style={styles.detailKm}>
                      Milestone marker: {selectedLandmark.distanceKm} km
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setSelectedLandmark(null)}
                    style={styles.detailClose}
                    accessibilityRole="button"
                  >
                    <Text style={{ color: COLORS.textMuted, fontSize: 16 }}>✕</Text>
                  </Pressable>
                </View>

                <Text style={styles.detailDescText}>
                  {selectedLandmark.description}
                </Text>

                <View style={styles.culturalBox}>
                  <Sparkles size={16} color={COLORS.secondary} />
                  <Text style={styles.culturalText}>
                    {selectedLandmark.culturalNote}
                  </Text>
                </View>
              </Card>
            )}
          </>
        )}
      </ScrollView>
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
  placeholderBtn: {
    width: 44,
  },
  scrollContent: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  routeSelector: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  routeTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  routeTabActive: {
    backgroundColor: COLORS.primary,
  },
  routeTabText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  routeTabTextActive: {
    color: COLORS.textInverse,
  },
  loadingBox: {
    paddingVertical: 80,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.md,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  heroCard: {
    padding: SPACING.lg,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  routePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryDim,
  },
  routePillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "700",
  },
  kmBadge: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  heroTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  heroSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  progressContainer: {
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  progressValue: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: "700",
  },
  statPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  statPillItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  statPillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  statPillDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.surfaceBorder,
  },
  syncCard: {
    padding: SPACING.md,
  },
  syncHeading: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  syncDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  syncButtonsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  timelineSection: {
    gap: SPACING.md,
  },
  timelineTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  timelineList: {
    gap: SPACING.sm,
  },
  landmarkCard: {
    padding: SPACING.md,
  },
  landmarkCardUnlocked: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  landmarkCardNext: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  landmarkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  landmarkIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  landmarkMeta: {
    flex: 1,
  },
  landmarkTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  landmarkName: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  distanceText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  landmarkDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  detailCard: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  detailTitleBox: {
    flex: 1,
  },
  detailKicker: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondary,
    fontWeight: "700",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  detailTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  detailKm: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  detailClose: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  detailDescText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  culturalBox: {
    flexDirection: "row",
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
  },
  culturalText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
});
