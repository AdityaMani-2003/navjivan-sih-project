import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';

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
        size={24}
        color={color}
      />
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#39FF14',
        tabBarInactiveTintColor: '#666666',
        headerShown: false,
        tabBarButton: HapticTab as any,
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopColor: '#1A1A1A',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
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
              name="home"
              outlineName="home-outline"
              focused={focused}
              color={String(color)}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
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
          title: 'Geofence',
          tabBarIcon: ({ color, focused }: any) => (
            <TabIconWithGlow
              name="map"
              outlineName="map-outline"
              focused={focused}
              color={String(color)}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Community',
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
    borderRadius: 19,
  },
  iconContainerFocused: {
    backgroundColor: 'rgba(57, 255, 20, 0.12)',
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
});
