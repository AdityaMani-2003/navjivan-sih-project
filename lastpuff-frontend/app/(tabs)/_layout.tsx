import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { COLORS, RADIUS, SHADOWS } from '../../constants/theme';
import { useUser } from '../../context/UserContext';

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  outlineName: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
}

const TabIconWithGlow: React.FC<TabIconProps> = ({
  name,
  outlineName,
  focused,
  color,
}) => {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
      <Ionicons
        name={focused ? name : outlineName}
        size={22}
        color={color}
      />
    </View>
  );
};

export default function TabLayout() {
  const { userType } = useUser();
  const isSmoker = userType !== 'non-smoker';
  const activeColor = isSmoker ? COLORS.primary : COLORS.secondary;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: COLORS.textMuted,
        headerShown: false,
        tabBarButton: HapticTab as any,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.surfaceBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 86 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }: any) => (
            <TabIconWithGlow
              name={isSmoker ? 'flame' : 'flash'}
              outlineName={isSmoker ? 'flame-outline' : 'flash-outline'}
              focused={focused}
              color={String(color)}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, focused }: any) => (
            <TabIconWithGlow
              name="bar-chart"
              outlineName="bar-chart-outline"
              focused={focused}
              color={String(color)}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="geofencing"
        options={{
          title: isSmoker ? 'Hotspots' : 'Heritage',
          tabBarIcon: ({ color, focused }: any) => (
            <TabIconWithGlow
              name="location"
              outlineName="location-outline"
              focused={focused}
              color={String(color)}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Tribe',
          tabBarIcon: ({ color, focused }: any) => (
            <TabIconWithGlow
              name="people"
              outlineName="people-outline"
              focused={focused}
              color={String(color)}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }: any) => (
            <TabIconWithGlow
              name="person"
              outlineName="person-outline"
              focused={focused}
              color={String(color)}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
  },
  iconContainerFocused: {
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
  },
});
