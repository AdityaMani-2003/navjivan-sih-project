import axios from "axios";
import { Platform } from "react-native";

// ---------------- BASE URL HANDLING ----------------
// Can be overridden via EXPO_PUBLIC_API_URL in lastpuff-frontend/.env
const DEFAULT_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.221.63.132:5000";

let BASE_URL = DEFAULT_URL;

if (Platform.OS === "web" && !process.env.EXPO_PUBLIC_API_URL) {
  BASE_URL = "http://localhost:5000";
}

// ---------------- AXIOS INSTANCE ----------------
const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
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
  age?: number,
  height?: number,
  weight?: number,
  plan?: string
) =>
  API.post<any>("/api/auth/signup", {
    name,
    email,
    password,
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
  cigarettesPerDay?: number;
  pricePerPack?: number;
  pricePerCigarette?: number;
  smokingYears?: number;
  quitDate?: string;
  expoPushToken?: string;
}) => API.patch<any>("/api/auth/profile", profileData);

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

// ---------- SOS ----------
export const logCraving = () =>
  API.post<any>("/api/sos/log-craving");

export const fetchCravingsCount = () =>
  API.get<any>("/api/sos/cravings-count");

export default API;
