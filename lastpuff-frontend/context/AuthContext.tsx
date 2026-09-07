import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
// NOTE: expo-notifications is NOT imported statically because it throws
// immediately in Expo Go SDK 53+. We use dynamic import() below instead.
import Constants, { ExecutionEnvironment } from "expo-constants";
import { setAuthToken, updateProfile } from "../services/api";

// ─── Types ──────────────────────────────────────────────────
export type UserType = "smoker" | "non-smoker";

/**
 * Minimal user object shape from the backend.
 * Using explicit fields rather than `any` for type safety.
 * Additional fields beyond these will pass through.
 */
interface UserData {
  _id: string;
  name: string;
  email: string;
  userType: UserType;
  streak?: number;
  xp?: number;
  level?: number;
  subscriptionTier?: "free" | "premium" | "elite";
  onboardingComplete?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any — backend may add fields we haven't typed yet
  [key: string]: any;
}

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  /** Convenience accessor: user's profile type */
  userType: UserType | null;
  loginUser: (user: UserData, token: string, refreshToken?: string) => Promise<void>;
  updateUser: (updatedUserData: Partial<UserData>) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  userType: null,
  loginUser: async () => {},
  updateUser: async () => {},
  logout: async () => {},
});

interface Props {
  children: ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setTokenValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Derived convenience value
  const userType: UserType | null = user?.userType ?? null;

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
        const [savedUser, savedToken] = await Promise.all([
          AsyncStorage.getItem("user"),
          AsyncStorage.getItem("token"),
        ]);

        if (savedUser && savedToken) {
          const parsedUser: UserData = JSON.parse(savedUser);
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

  // Handle login — Save user & token (+ optional refreshToken for future use)
  const loginUser = async (
    userData: UserData,
    userToken: string,
    refreshToken?: string
  ) => {
    setUser(userData);
    setTokenValue(userToken);
    setAuthToken(userToken);

    await AsyncStorage.setItem("user", JSON.stringify(userData));
    await AsyncStorage.setItem("token", userToken);
    if (refreshToken) {
      await AsyncStorage.setItem("refreshToken", refreshToken);
    }

    registerPushNotification();
  };

  // Handle profile update — Update state and local storage
  const updateUser = async (updatedUserData: Partial<UserData>) => {
    const merged: UserData = { ...user!, ...updatedUserData };
    setUser(merged);
    await AsyncStorage.setItem("user", JSON.stringify(merged));
  };

  // Handle logout — Clear data & remove token from axios
  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "user", "refreshToken"]);
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
        userType,
        loginUser,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/** Convenience hook */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
