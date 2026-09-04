import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useEffect, useState } from "react";
import { Platform } from "react-native";
// NOTE: expo-notifications is NOT imported statically because it throws
// immediately in Expo Go SDK 53+. We use dynamic import() below instead.
import Constants, { ExecutionEnvironment } from "expo-constants";
import { setAuthToken, updateProfile } from "../services/api";

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginUser: (user: any, token: string) => Promise<void>;
  updateUser: (updatedUserData: any) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  loginUser: async () => {},
  updateUser: async () => {},
  logout: async () => {},
});

interface Props {
  children: ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setTokenValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Safely register push token with backend (skip in Expo Go SDK 53+)
  const registerPushNotification = async () => {
    if (Platform.OS === "web") return;
    const isExpoGo =
      Constants.appOwnership === "expo" ||
      Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
    if (isExpoGo) {
      console.log("Push notifications skipped: running in Expo Go");
      return; // Remote push notification tokens are unsupported in Expo Go
    }
    try {
      // Dynamic import to avoid crash in Expo Go
      const Notifications = await import("expo-notifications");
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") return;

      const pushToken = await Notifications.getExpoPushTokenAsync();
      if (pushToken?.data) {
        await updateProfile({ expoPushToken: pushToken.data });
      }
    } catch (err) {
      console.log("Push token registration skipped/failed:", err);
    }
  };

  // Load stored user and token on app start
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("user");
        const savedToken = await AsyncStorage.getItem("token");

        if (savedUser && savedToken) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setTokenValue(savedToken);
          setAuthToken(savedToken);
          registerPushNotification();
        } else {
          setUser(null);
          setTokenValue(null);
          setAuthToken(null);
        }
      } catch (err) {
        console.log("Error loading auth data", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle login — Save user & token
  const loginUser = async (userData: any, userToken: string) => {
    setUser(userData);
    setTokenValue(userToken);
    setAuthToken(userToken);

    await AsyncStorage.setItem("user", JSON.stringify(userData));
    await AsyncStorage.setItem("token", userToken);

    registerPushNotification();
  };

  // Handle profile update — Update state and local storage
  const updateUser = async (updatedUserData: any) => {
    const merged = { ...user, ...updatedUserData };
    setUser(merged);
    await AsyncStorage.setItem("user", JSON.stringify(merged));
  };

  // Handle logout — Clear data & remove token from axios
  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setTokenValue(null);
    setUser(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        loginUser,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
