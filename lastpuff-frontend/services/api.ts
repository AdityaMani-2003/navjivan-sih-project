import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";

// ---------------- DYNAMIC IP & BASE URL RESOLUTION ----------------
function getDynamicBaseUrl(): string {
  if (Platform.OS === "web") {
    return "http://localhost:5000";
  }
  // Try to derive host IP directly from Expo Metro bundler
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(":")[0];
    if (ip && ip !== "localhost" && ip !== "127.0.0.1") {
      return `http://${ip}:5000`;
    }
  }
  if (process.env.EXPO_PUBLIC_API_URL && !process.env.EXPO_PUBLIC_API_URL.includes("10.221.63.132")) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return "http://10.228.172.132:5000";
}

const BASE_URL = getDynamicBaseUrl();
console.log("🔗 Active API Base URL:", BASE_URL);

// ---------------- AXIOS INSTANCE ----------------
const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const activeBase = getDynamicBaseUrl();
  config.baseURL = activeBase;
  console.log(`📡 [API Request] ${config.method?.toUpperCase()} -> ${config.baseURL}${config.url}`);
  return config;
});

// ----- TOKEN HANDLING -----
export const setAuthToken = (token: string | null) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

// ---------- AUTH ----------
export const login = (email: string, password: string) =>
  API.post<any>("/api/auth/login", { email, password });

export const signup = (
  name: string,
  email: string,
  password: string,
  userType?: "smoker" | "non-smoker",
  age?: number,
  height?: number,
  weight?: number,
  plan?: string
) =>
  API.post<any>("/api/auth/signup", {
    name,
    email,
    password,
    userType,
    age,
    height,
    weight,
    plan,
  });

export const updateProfile = (profileData: {
  name?: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  plan?: string;
  userType?: "smoker" | "non-smoker";
  cigarettesPerDay?: number;
  pricePerPack?: number;
  pricePerCigarette?: number;
  smokingYears?: number;
  quitDate?: string;
  smokerProfile?: any;
  fitnessProfile?: any;
  emergencyContact?: { name?: string; phone?: string; relationship?: string };
  expoPushToken?: string;
}) => API.patch<any>("/api/auth/profile", profileData);

export const refreshTokenApi = (refreshToken: string) =>
  API.post<any>("/api/auth/refresh-token", { refreshToken });

export const getProfile = () =>
  API.get<any>("/api/v1/profile");

export const getGamificationStats = () =>
  API.get<any>("/api/v1/gamification");

export const deleteAccountApi = () =>
  API.delete<any>("/api/auth/account");

// ---------- DASHBOARD ----------
export const fetchDashboardSummary = () =>
  API.get<any>("/api/dashboard/summary");

export const fetchDashboardAnalytics = () =>
  API.get<any>("/api/dashboard/analytics");

export const updateDailyGoals = (goalsCompleted: number) =>
  API.post<any>("/api/dashboard/update-goals", { goalsCompleted, goalsCompletedToday: goalsCompleted });

export const updateDailyStats = (stats: {
  cigarettesAvoided?: number;
  moneySaved?: number;
  cravingsHandled?: number;
  deltaCigarettesAvoided?: number;
  deltaMoneySaved?: number;
  deltaCravingsHandled?: number;
}) => API.post<any>("/api/dashboard/update-stats", stats);

export const awardCoins = (coins: number, reason: string) =>
  API.post<any>("/api/dashboard/award-coins", { coins, reason });

export const fetchAiInsight = (force = false) =>
  API.get<any>(`/api/dashboard/ai-insight${force ? "?force=true" : ""}`);

// ---------- SOS & CRAVINGS ----------
export const logCraving = (intensity?: number, trigger?: string, notes?: string) =>
  API.post<any>("/api/sos/log-craving", { intensity, trigger, notes });

export const fetchCravingsCount = () =>
  API.get<any>("/api/sos/cravings-count");

// ---------- AI SERVICES ----------
export const fetchQuitPlan = (data?: { cigarettesPerDay?: number; smokingYears?: number; triggers?: string[] }) =>
  API.post<any>("/api/ai/suggest-quit-plan", data || {});

export const fetchRiskAnalysis = (data?: { cigarettesPerDay?: number; smokingYears?: number; age?: number }) =>
  API.post<any>("/api/ai/analyze-risk", data || {});

export const sendAiChat = (message: string, conversationId?: string, persona?: string) =>
  API.post<any>("/api/ai/chat", { message, conversationId, persona });

export const fetchFitnessPlan = (data?: { goal?: string; level?: string; daysPerWeek?: number; sport?: string }) =>
  API.post<any>("/api/ai/fitness-plan", data || {});

export const fetchConfidenceScript = (trigger: string, intensity?: number) =>
  API.post<any>("/api/ai/confidence-script", { trigger, intensity });

export const analyzeMealImage = (imageBase64?: string, mealDescription?: string) =>
  API.post<any>("/api/ai/analyze-meal", { imageBase64, mealDescription });

export const runGoalsAgent = (progressData?: any) =>
  API.post<any>("/api/ai/goals-agent", { progressData });

export const fetchDailyTip = () =>
  API.get<any>("/api/ai/daily-tip");

// ---------- GEOFENCING ----------
export const fetchNearbyHotspots = (lat: number, lng: number, radius?: number) =>
  API.get<any>(`/api/geofencing/hotspots?lat=${lat}&lng=${lng}${radius ? `&radius=${radius}` : ""}`);

export const reportHotspot = (hotspotData: { name: string; latitude: number; longitude: number; category?: string; description?: string }) =>
  API.post<any>("/api/geofencing/hotspot", hotspotData);

// ---------- NUTRITION ----------
export const logNutritionMeal = (mealData: { name: string; calories?: number; protein?: number; carbs?: number; fats?: number; mealType?: string; imageUrl?: string; aiAnalysis?: any }) =>
  API.post<any>("/api/nutrition/log", mealData);

export const fetchNutritionHistory = (page = 1, limit = 20) =>
  API.get<any>(`/api/nutrition/history?page=${page}&limit=${limit}`);

export const fetchNutritionSummary = () =>
  API.get<any>("/api/nutrition/summary");

// ---------- STEPS & PADYATRA ----------
export const syncStepCount = (steps: number, distanceKm?: number, caloriesBurned?: number, date?: string) =>
  API.post<any>("/api/steps/sync", { steps, distanceKm, caloriesBurned, date });

export const fetchPadyatraProgress = (route = "dandi_march") =>
  API.get<any>(`/api/steps/padyatra?route=${route}`);

// ---------- GOALS ----------
export const createGoalApi = (goalData: { title: string; description?: string; targetValue?: number; unit?: string; dueDate?: string; category?: string; aiSuggested?: boolean }) =>
  API.post<any>("/api/goals/create", goalData);

export const fetchMyGoals = (status?: string) =>
  API.get<any>(`/api/goals/my-goals${status ? `?status=${status}` : ""}`);

export const updateGoalApi = (id: string, updateData: { currentValue?: number; isCompleted?: boolean; title?: string }) =>
  API.patch<any>(`/api/goals/${id}`, updateData);

export const deleteGoalApi = (id: string) =>
  API.delete<any>(`/api/goals/${id}`);

// ---------- REWARDS & XP ----------
export const fetchXPStats = () =>
  API.get<any>("/api/rewards/xp");

export const earnXPAction = (amount: number, action: string, metadata?: any) =>
  API.post<any>("/api/rewards/earn-xp", { amount, action, metadata });

export const fetchAchievements = () =>
  API.get<any>("/api/rewards/achievements");

export const fetchRewardsStore = () =>
  API.get<any>("/api/rewards/store");

export const redeemStoreReward = (id: string) =>
  API.post<any>(`/api/rewards/redeem/${id}`);

// ---------- NOTIFICATIONS ----------
export const registerPushToken = (expoPushToken?: string, fcmToken?: string) =>
  API.post<any>("/api/notifications/register-token", { expoPushToken, fcmToken });

// ---------- CHAT (RAG / GEMINI) ----------
export const sendChatMessage = (content: string, sessionId = "default") =>
  API.post<any>("/api/v1/chat/message", { content, sessionId });

export const fetchChatHistory = (limit = 30) =>
  API.get<any>(`/api/v1/chat/history?limit=${limit}`);

export const clearChatHistory = () =>
  API.delete<any>("/api/v1/chat/history");

export default API;
