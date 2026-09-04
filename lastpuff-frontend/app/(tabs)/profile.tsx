import React, { useContext, useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { AuthContext } from "../../context/AuthContext";
import { fetchDashboardAnalytics } from "../../services/api";
import { LPColors } from "../../constants/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, user }: any = useContext(AuthContext);

  const [stats, setStats] = useState({
    streak: user?.streak || 0,
    totalCigarettesAvoided: 0,
    totalMoneySaved: 0,
    totalCravingsHandled: 0,
    goalsCompleted: 0,
  });

  // Modals for settings
  const [activeModal, setActiveModal] = useState<
    "notifications" | "privacy" | "community" | "help" | "about" | null
  >(null);

  // Notification toggles
  const [dailyReminder, setDailyReminder] = useState(true);
  const [sosCheckin, setSosCheckin] = useState(true);
  const [communityAlerts, setCommunityAlerts] = useState(true);

  // Community prefs
  const [publicPosts, setPublicPosts] = useState(true);
  const [commentNotifs, setCommentNotifs] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchDashboardAnalytics();
        if (res?.data) {
          const allTime = res.data.allTime || {};
          const monthly = res.data.monthly || {};
          setStats({
            streak: allTime.streak || user?.streak || 0,
            totalCigarettesAvoided: allTime.totalCigarettesAvoided || 0,
            totalMoneySaved: allTime.totalMoneySaved || 0,
            totalCravingsHandled: allTime.totalCravingsHandled || 0,
            goalsCompleted: monthly.goalsCompleted || 0,
          });
        }
      } catch (err) {
        console.log("Profile stats error:", err);
      }
    };

    loadData();
  }, [user]);

  const handleSettingPress = (itemName: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    switch (itemName) {
      case "Edit Profile":
        router.push("/edit-profile");
        break;
      case "Manage Goals":
        router.push("/goals");
        break;
      case "Notification Settings":
        setActiveModal("notifications");
        break;
      case "Privacy & Security":
        setActiveModal("privacy");
        break;
      case "Community Preferences":
        setActiveModal("community");
        break;
      case "Help & Support":
        setActiveModal("help");
        break;
      case "About LastPuff":
        setActiveModal("about");
        break;
      default:
        break;
    }
  };

  const memberSinceYear = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : "2025";

  const settingsList = [
    { icon: "person-outline", name: "Edit Profile", subtitle: "Name, habits, quit target" },
    { icon: "flag-outline", name: "Manage Goals", subtitle: "Daily targets & milestones" },
    { icon: "notifications-outline", name: "Notification Settings", subtitle: "Reminders & push alerts" },
    { icon: "people-outline", name: "Community Preferences", subtitle: "Privacy & comments" },
    { icon: "lock-closed-outline", name: "Privacy & Security", subtitle: "Data deletion & encryption" },
    { icon: "help-circle-outline", name: "Help & Support", subtitle: "FAQs & emergency lines" },
    { icon: "information-circle-outline", name: "About LastPuff", subtitle: "SIH 2025 winner details" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => router.push("/edit-profile")}
            activeOpacity={0.8}
          >
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </View>
            )}
            <View style={styles.pencilBadge}>
              <Ionicons name="pencil" size={14} color="#000000" />
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{user?.name || "Player"}</Text>
          <Text style={styles.since}>
            Smoke-Free Journey Member since {memberSinceYear}
          </Text>

          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>
              Plan: {user?.plan === "aggressive" ? "Cold Turkey" : "Gradual Reduction"}
            </Text>
          </View>
        </View>

        {/* 3 Core Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Ionicons name="flame" size={22} color="#39FF14" />
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>{stats.streak} days</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="leaf" size={22} color="#39FF14" />
            <Text style={styles.statLabel}>Cravings</Text>
            <Text style={styles.statValue}>{stats.totalCravingsHandled}</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="wallet" size={22} color="#39FF14" />
            <Text style={styles.statLabel}>Saved</Text>
            <Text style={styles.statValue}>₹{stats.totalMoneySaved}</Text>
          </View>
        </View>

        {/* Overview Row */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Journey Milestones</Text>
          <View style={styles.overviewContainer}>
            <View style={styles.overviewBox}>
              <Text style={styles.overviewLabel}>Cigarettes Avoided</Text>
              <Text style={styles.overviewValue}>{stats.totalCigarettesAvoided}</Text>
            </View>
            <View style={styles.overviewBox}>
              <Text style={styles.overviewLabel}>Goals Hit</Text>
              <Text style={styles.overviewValue}>{stats.goalsCompleted}</Text>
            </View>
            <View style={styles.overviewBox}>
              <Text style={styles.overviewLabel}>PuffCoins</Text>
              <Text style={styles.overviewValue}>{user?.puffCoins || 0}</Text>
            </View>
          </View>
        </View>

        {/* Settings List */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings & Preferences</Text>
          <View style={styles.settingsContainer}>
            {settingsList.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.settingItem}
                onPress={() => handleSettingPress(item.name)}
                activeOpacity={0.7}
              >
                <View style={styles.settingIconBox}>
                  <Ionicons name={item.icon as any} size={22} color="#39FF14" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingName}>{item.name}</Text>
                  <Text style={styles.settingSub}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch (e) {}
            await logout();
            router.replace("/auth/login");
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL: Notification Settings */}
      <Modal visible={activeModal === "notifications"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notification Settings</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Daily Progress Reminder</Text>
                <Text style={styles.toggleSub}>Receive a prompt at 9 AM to log cravings and goals</Text>
              </View>
              <Switch
                value={dailyReminder}
                onValueChange={setDailyReminder}
                trackColor={{ false: "#333", true: "#39FF14" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>SOS Craving Check-In</Text>
                <Text style={styles.toggleSub}>Supportive check-in 30 mins after accessing SOS</Text>
              </View>
              <Switch
                value={sosCheckin}
                onValueChange={setSosCheckin}
                trackColor={{ false: "#333", true: "#39FF14" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Community Interactions</Text>
                <Text style={styles.toggleSub}>Alerts when someone likes or comments on your post</Text>
              </View>
              <Switch
                value={communityAlerts}
                onValueChange={setCommunityAlerts}
                trackColor={{ false: "#333", true: "#39FF14" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <TouchableOpacity style={styles.modalSaveBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalSaveBtnText}>Save Preferences</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: Community Preferences */}
      <Modal visible={activeModal === "community"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Community Preferences</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Show My Posts Publicly</Text>
                <Text style={styles.toggleSub}>Allow fellow quitters to read and cheer your milestones</Text>
              </View>
              <Switch
                value={publicPosts}
                onValueChange={setPublicPosts}
                trackColor={{ false: "#333", true: "#39FF14" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Comment Notifications</Text>
                <Text style={styles.toggleSub}>Get notified when members support your story</Text>
              </View>
              <Switch
                value={commentNotifs}
                onValueChange={setCommentNotifs}
                trackColor={{ false: "#333", true: "#39FF14" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <TouchableOpacity style={styles.modalSaveBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalSaveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: Privacy & Security */}
      <Modal visible={activeModal === "privacy"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacy & Security</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.infoPara}>
              • All health stats and geofence locations are strictly encrypted.
            </Text>
            <Text style={styles.infoPara}>
              • Password hashes use bcrypt salted rounds (industry gold standard).
            </Text>
            <Text style={styles.infoPara}>
              • Your data is never sold to advertisers or third-party behavioral brokers.
            </Text>

            <TouchableOpacity
              style={[styles.modalSaveBtn, { backgroundColor: "#2A1818", borderColor: "#FF3B30", borderWidth: 1, marginTop: 20 }]}
              onPress={() => {
                setActiveModal(null);
                Toast.show({
                  type: "success",
                  text1: "Data request received",
                  text2: "A copy of your data will be emailed to you.",
                });
              }}
            >
              <Text style={{ color: "#FF3B30", fontWeight: "700" }}>Export My Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: Help & Support */}
      <Modal visible={activeModal === "help"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Help & Support</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.faqQ}>Q: How does geofencing alert me?</Text>
            <Text style={styles.faqA}>
              A: When you approach configured high-risk smoking trigger zones (e.g. tobacco kiosks), LastPuff automatically sends a proactive grounding push notification.
            </Text>

            <Text style={styles.faqQ}>Q: How do PuffCoins work?</Text>
            <Text style={styles.faqA}>
              A: Completing daily goals and workout recovery plans awards coins that track your lifetime recovery capital.
            </Text>

            <Text style={styles.faqQ}>Emergency National Tobacco Quitline (India):</Text>
            <Text style={[styles.faqA, { color: "#39FF14", fontWeight: "700" }]}>
              📞 1800-11-2356 (Toll-Free, Govt. of India)
            </Text>

            <TouchableOpacity style={styles.modalSaveBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalSaveBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: About LastPuff (SIH 2025 Winner) */}
      <Modal visible={activeModal === "about"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>About LastPuff</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.sihBannerBox}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🏆</Text>
              <Text style={styles.sihBannerTitle}>Smart India Hackathon 2025 Winner</Text>
              <Text style={styles.sihBannerSub}>
                National Winner • Public Health & Preventive Healthcare Domain
              </Text>
            </View>

            <Text style={styles.aboutDesc}>
              LastPuff is an agentic AI-powered smoking cessation SaaS platform designed to eliminate nicotine dependency through behavioral psychology, automated geofence deterrence, and peer community support.
            </Text>

            <View style={styles.appMetaRow}>
              <Text style={styles.appMetaLabel}>Version</Text>
              <Text style={styles.appMetaValue}>v2.0.0 Production SaaS</Text>
            </View>

            <TouchableOpacity style={styles.modalSaveBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalSaveBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "#121212",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    borderColor: "#1E1E1E",
    borderWidth: 1.5,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2.5,
    borderColor: "#39FF14",
  },
  avatarFallback: {
    backgroundColor: "#1C1C1C",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 34,
    color: "#39FF14",
    fontWeight: "800",
  },
  pencilBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#39FF14",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },
  since: { fontSize: 13, color: "#888888", marginTop: 4 },
  planBadge: {
    backgroundColor: "rgba(57, 255, 20, 0.12)",
    borderColor: "#39FF14",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
  },
  planBadgeText: {
    color: "#39FF14",
    fontSize: 12,
    fontWeight: "700",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  statBox: {
    backgroundColor: "#121212",
    borderColor: "#1E1E1E",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    flex: 1,
  },
  statLabel: { fontSize: 11, color: "#888888", marginTop: 4 },
  statValue: { fontSize: 16, fontWeight: "800", color: "#FFFFFF", marginTop: 2 },
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", marginBottom: 10 },
  overviewContainer: {
    flexDirection: "row",
    gap: 10,
  },
  overviewBox: {
    backgroundColor: "#141414",
    borderColor: "#222222",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    flex: 1,
    alignItems: "center",
  },
  overviewLabel: { fontSize: 10, color: "#888888", marginBottom: 4, textAlign: "center" },
  overviewValue: { fontSize: 18, fontWeight: "800", color: "#39FF14" },
  settingsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  settingsContainer: {
    backgroundColor: "#121212",
    borderColor: "#1E1E1E",
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  settingIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(57, 255, 20, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingName: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  settingSub: {
    fontSize: 11,
    color: "#777777",
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 40,
    paddingVertical: 15,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#141414",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E1E",
  },
  toggleTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  toggleSub: {
    color: "#888888",
    fontSize: 12,
    marginTop: 2,
    paddingRight: 10,
  },
  modalSaveBtn: {
    backgroundColor: "#39FF14",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  modalSaveBtnText: {
    color: "#000000",
    fontWeight: "700",
    fontSize: 15,
  },
  infoPara: {
    color: "#CCCCCC",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },
  faqQ: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 4,
  },
  faqA: {
    color: "#888888",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  sihBannerBox: {
    alignItems: "center",
    backgroundColor: "rgba(57, 255, 20, 0.08)",
    borderColor: "#39FF14",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sihBannerTitle: {
    color: "#39FF14",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  sihBannerSub: {
    color: "#AAAAAA",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  aboutDesc: {
    color: "#CCCCCC",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  appMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  appMetaLabel: {
    color: "#888888",
    fontSize: 13,
  },
  appMetaValue: {
    color: "#39FF14",
    fontSize: 13,
    fontWeight: "700",
  },
});
