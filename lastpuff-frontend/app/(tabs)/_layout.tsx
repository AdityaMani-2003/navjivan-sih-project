import React from "react";
import { Tabs } from "expo-router";
import { View, StyleSheet, Platform } from "react-native";
import {
  Home,
  BarChart2,
  MapPin,
  Users,
  User,
  Flame,
  Zap,
} from "lucide-react-native";
import { HapticTab } from "@/components/haptic-tab";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { useUser } from "../../context/UserContext";

export default function TabLayout() {
  const { userType } = useUser();
  const isSmoker = userType !== "non-smoker";
  const activeColor = isSmoker ? COLORS.primary : COLORS.secondary;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: COLORS.textMuted,
        headerShown: false,
        tabBarButton: HapticTab as any,
        tabBarStyle: {
          backgroundColor: COLORS.tabBar,
          borderTopColor: COLORS.tabBarBorder,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 70,
          paddingBottom: Platform.OS === "ios" ? 28 : 12,
          paddingTop: 10,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconBox, focused && { backgroundColor: `${activeColor}18` }]}>
              {isSmoker ? (
                <Flame size={24} color={color} />
              ) : (
                <Home size={24} color={color} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconBox, focused && { backgroundColor: `${activeColor}18` }]}>
              <BarChart2 size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="geofencing"
        options={{
          title: isSmoker ? "Radar" : "Hotspots",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconBox, focused && { backgroundColor: `${activeColor}18` }]}>
              <MapPin size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Community",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconBox, focused && { backgroundColor: `${activeColor}18` }]}>
              <Users size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconBox, focused && { backgroundColor: `${activeColor}18` }]}>
              <User size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 38,
    borderRadius: RADIUS.md,
  },
});
